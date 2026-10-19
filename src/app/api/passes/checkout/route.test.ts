/**
 * POST /api/passes/checkout (bead gwth-launch-v1uj.4, row 1.2). Stripe and the
 * session are mocked; what is under test is what the route refuses and the
 * exact Checkout it asks Stripe for.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { create, identity, access } = vi.hoisted(() => ({
  create: vi.fn(),
  identity: vi.fn(),
  access: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({ getSessionIdentity: identity }))
vi.mock("@/lib/billing/access", () => ({ getAccessForUser: access }))
vi.mock("@/lib/billing/stripe", async (orig) => ({
  ...(await orig<typeof import("@/lib/billing/stripe")>()),
  getStripeClient: () => ({ checkout: { sessions: { create } } }),
}))

const GIFT = {
  gift: true,
  product: "course",
  buyerName: "Alex",
  recipientName: "Sam",
  recipientEmail: "Sam@Example.com",
  message: "Happy Christmas",
  delivery: { kind: "now" },
}

async function post(body: unknown) {
  vi.resetModules()
  const { POST } = await import("./route")
  return POST(new Request("http://localhost/api/passes/checkout", { method: "POST", body: JSON.stringify(body) }))
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] })
  vi.setSystemTime(new Date("2026-12-10T12:00:00Z"))
  vi.stubEnv("BILLING_ENABLED", "true")
  vi.stubEnv("SALES_OPEN_AT", "")
  vi.stubEnv("CHRISTMAS_SALE_ENDS_AT", "")
  vi.stubEnv("STRIPE_PASS_COURSE_SALE_PRICE_ID", "price_sale")
  vi.stubEnv("STRIPE_PASS_COURSE_PRICE_ID", "price_full")
  vi.stubEnv("STRIPE_PASS_MONTH1_PRICE_ID", "price_month1")
  vi.stubEnv("BETTER_AUTH_URL", "https://hlab.example.net:9458")
  create.mockReset().mockResolvedValue({ url: "https://checkout.stripe.com/c/pay/cs_test_1" })
  identity.mockReset().mockResolvedValue(null)
  access.mockReset().mockResolvedValue({ source: "registered", subscriptionMonth: 0 })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe("POST /api/passes/checkout", () => {
  it("is switched off with billing", async () => {
    vi.stubEnv("BILLING_ENABLED", "")
    expect((await post(GIFT)).status).toBe(503)
  })

  it("sells nothing before 1 December", async () => {
    vi.setSystemTime(new Date("2026-11-30T23:59:00Z"))
    const res = await post(GIFT)
    expect(res.status).toBe(409)
    await expect(res.json()).resolves.toMatchObject({ code: "not_on_sale_yet" })
    expect(create).not.toHaveBeenCalled()
  })

  it("asks Stripe for a one-off £69 payment with no tax, the gift details in metadata", async () => {
    const res = await post(GIFT)
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ url: "https://checkout.stripe.com/c/pay/cs_test_1" })
    const args = create.mock.calls[0]![0]
    expect(args.mode).toBe("payment")
    expect(args.line_items).toEqual([{ price: "price_sale", quantity: 1 }])
    expect(args).not.toHaveProperty("automatic_tax")
    expect(args.metadata).toMatchObject({
      kind: "pass",
      product: "course",
      gift: "1",
      recipientEmail: "sam@example.com",
      message: "Happy Christmas",
    })
    expect(new Date(args.metadata.deliverAt).toISOString()).toBe("2026-12-10T12:00:00.000Z")
    expect(args.success_url).toBe("https://hlab.example.net:9458/gift/thanks?session_id={CHECKOUT_SESSION_ID}")
    // A sale-price session cannot outlive the sale by more than Stripe's minimum.
    expect(args.expires_at * 1000).toBeLessThanOrEqual(new Date("2027-01-07T00:00:00Z").getTime())
  })

  it("uses the £87 price from 7 January, even from an old page", async () => {
    vi.setSystemTime(new Date("2027-01-07T00:00:01Z"))
    await post(GIFT)
    expect(create.mock.calls[0]![0].line_items).toEqual([{ price: "price_full", quantity: 1 }])
  })

  it("sells the first month at its own £29 price", async () => {
    await post({ ...GIFT, product: "month1" })
    expect(create.mock.calls[0]![0].line_items).toEqual([{ price: "price_month1", quantity: 1 }])
  })

  it("refuses a gift with a bad email or a send date after the open-by date", async () => {
    expect((await post({ ...GIFT, recipientEmail: "nope" })).status).toBe(400)
    expect((await post({ ...GIFT, delivery: { kind: "date", date: "2028-06-01" } })).status).toBe(400)
  })

  it("needs a signed-in account to buy for yourself, and refuses one that already has the course", async () => {
    const self = { gift: false, product: "course" }
    expect((await post(self)).status).toBe(401)

    identity.mockResolvedValue({ id: "u1", name: "Jo", email: "jo@example.com" })
    access.mockResolvedValue({ source: "prepaid", subscriptionMonth: 1 })
    expect((await post(self)).status).toBe(409)

    access.mockResolvedValue({ source: "registered", subscriptionMonth: 0 })
    expect((await post(self)).status).toBe(200)
    const args = create.mock.calls[0]![0]
    expect(args.customer_email).toBe("jo@example.com")
    expect(args.metadata).toMatchObject({ gift: "0", buyerUserId: "u1" })
    expect(args.cancel_url).toContain("/pricing")
  })
})
