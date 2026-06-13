import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  calculateCourseMonthFromStart,
  clampCourseMonth,
  normaliseAccessRow,
  stateForCourseMonth,
} from "./access"

describe("billing access helpers", () => {
  it("clamps course months to the three-month programme", () => {
    expect(clampCourseMonth(-1)).toBe(0)
    expect(clampCourseMonth(1.8)).toBe(1)
    expect(clampCourseMonth(4)).toBe(3)
  })

  it("maps course months to subscription states", () => {
    expect(stateForCourseMonth(0)).toBe("registered")
    expect(stateForCourseMonth(1)).toBe("month1")
    expect(stateForCourseMonth(2)).toBe("month2")
    expect(stateForCourseMonth(3)).toBe("month3")
  })

  it("calculates progressive monthly unlocking from subscription start", () => {
    const start = Date.UTC(2026, 0, 10) / 1000

    expect(calculateCourseMonthFromStart(start, new Date("2026-01-20"))).toBe(1)
    expect(calculateCourseMonthFromStart(start, new Date("2026-02-20"))).toBe(2)
    expect(calculateCourseMonthFromStart(start, new Date("2026-04-20"))).toBe(3)
  })

  it("expires manual beta grants back to registered access", () => {
    const access = normaliseAccessRow(
      {
        user_id: "user_1",
        access_source: "manual_beta",
        subscription_state: "month3",
        subscription_month: 3,
        valid_until: "2026-01-01T00:00:00.000Z",
        grace_period_ends: null,
        last_payment_at: null,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        stripe_price_id: null,
        stripe_subscription_status: null,
        notes: null,
      },
      new Date("2026-02-01T00:00:00.000Z")
    )

    expect(access.subscriptionState).toBe("registered")
    expect(access.subscriptionMonth).toBe(0)
  })
})
describe("Stripe routes during beta", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv("BILLING_ENABLED", "")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns 503 from checkout when BILLING_ENABLED is not set", async () => {
    const { POST } = await import("@/app/api/stripe/checkout/route")

    const response = await POST(
      new Request("http://localhost:3000/api/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "course" }),
      })
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      code: "billing_disabled_for_beta",
      error: "Billing disabled for beta",
    })
  })

  it("returns 503 from portal when BILLING_ENABLED is not set", async () => {
    const { POST } = await import("@/app/api/stripe/portal/route")

    const response = await POST()

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      code: "billing_disabled_for_beta",
      error: "Billing disabled for beta",
    })
  })

  it("returns 503 from webhook when BILLING_ENABLED is not set", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route")

    const response = await POST(
      new Request("http://localhost:3000/api/stripe/webhook", {
        method: "POST",
        body: "{}",
      })
    )

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      code: "billing_disabled_for_beta",
      error: "Billing disabled for beta",
    })
  })
})
