/**
 * The gift pages in the family look. The conditions are the ones
 * `gift/gift-sale-pages.test.tsx` pins on the page this replaces, run here
 * against the new components. ENABLE_BILLING is read at import time, so each
 * case stubs the env and imports afresh.
 */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { PassRecord } from "@/lib/billing/pass-store"

vi.mock("@/lib/billing/pass-store", () => ({
  getPassByCode: vi.fn(async () => null),
  passOpenability: vi.fn(),
}))
vi.mock("@/lib/billing/access", () => ({ getAccessForUser: vi.fn() }))

const BEFORE = new Date("2026-11-20T12:00:00Z")
const IN_SALE = new Date("2026-12-16T12:00:00Z")
const AFTER = new Date("2027-01-07T00:00:00Z")

async function load(billing: boolean) {
  vi.resetModules()
  vi.stubEnv("BILLING_ENABLED", billing ? "true" : "")
  vi.stubEnv("SALES_OPEN_AT", "")
  vi.stubEnv("CHRISTMAS_SALE_ENDS_AT", "")
  vi.stubEnv("PRIVATE_CONTENT_MODE", "off")
  const gift = await import("./gift-next")
  const copy = await import("@/components/marketing/gift/gift-copy")
  return { GiftNext: gift.GiftNext, GIFT_STEPS: gift.GIFT_STEPS, C: copy.GIFT_COPY }
}

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe("/gift (GiftNext)", () => {
  it("says when gifts go on sale, with no form, before 14 December", async () => {
    const { GiftNext, C } = await load(true)
    render(<GiftNext now={BEFORE} />)
    const notice = screen.getByTestId("gift-not-on-sale")
    expect(notice).toHaveTextContent("Gifts go on sale on 14 December 2026")
    expect(notice).toHaveTextContent(C.notOnSale.body)
    expect(screen.queryByTestId("gift-form")).toBeNull()
    expect(screen.getByRole("link", { name: /open your gift/i })).toHaveAttribute("href", "/gift/open")
    // No buying link before sales open.
    expect(screen.queryByRole("link", { name: "Choose a gift" })).toBeNull()
    expect(screen.queryByRole("link", { name: "See the prices" })).toBeNull()
  })

  it("stays closed while billing is off, whatever the date", async () => {
    const { GiftNext } = await load(false)
    render(<GiftNext now={IN_SALE} />)
    expect(screen.queryByTestId("gift-form")).toBeNull()
    expect(screen.getByTestId("gift-not-on-sale")).toBeInTheDocument()
  })

  it("sells the whole course at £69 (was £87) and the first month at £29 in the sale, Christmas morning offered", async () => {
    const { GiftNext } = await load(true)
    render(<GiftNext now={IN_SALE} />)
    expect(screen.queryByTestId("gift-not-on-sale")).toBeNull()
    expect(screen.getByTestId("gift-product-course")).toHaveTextContent("£69")
    expect(screen.getByTestId("gift-product-course")).toHaveTextContent("£87")
    expect(screen.getByTestId("gift-product-course")).toHaveTextContent("6 January 2027")
    expect(screen.getByTestId("gift-product-month1")).toHaveTextContent("£29")
    expect(screen.getByLabelText(/Christmas morning/)).toBeChecked()
    expect(screen.getByTestId("gift-pay")).toHaveTextContent("£69")
    // The button in the hero jumps to the form on this page.
    expect(screen.getByRole("link", { name: "Choose a gift" })).toHaveAttribute("href", "#choose")
    expect(document.getElementById("choose")).toContainElement(screen.getByTestId("gift-form"))
    expect(screen.getByRole("link", { name: "See the prices" })).toHaveAttribute("href", "/pricing")
  })

  it("sells the whole course at £87 all year from 7 January, with no Christmas option", async () => {
    const { GiftNext } = await load(true)
    render(<GiftNext now={AFTER} />)
    expect(screen.getByTestId("gift-product-course")).toHaveTextContent("£87")
    expect(screen.getByTestId("gift-product-course")).not.toHaveTextContent("£69")
    expect(screen.queryByLabelText(/Christmas morning/)).toBeNull()
    expect(screen.getByLabelText(/Straight away/)).toBeChecked()
  })

  it("keeps the headline, the standfirst and the three answers word for word", async () => {
    const { GiftNext, C } = await load(true)
    const { container } = render(<GiftNext now={BEFORE} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Give someone the GWTH course")
    const text = (container.textContent ?? "").replace(/\s+/g, " ")
    expect(text).toContain(C.masthead.standfirst)
    for (const answer of C.answers) {
      expect(screen.getByRole("heading", { level: 3, name: answer.title })).toBeInTheDocument()
      expect(text).toContain(answer.body)
    }
  })

  it("explains a gift in three steps that state only what the gift copy already says", async () => {
    const { GiftNext, GIFT_STEPS } = await load(true)
    render(<GiftNext now={BEFORE} />)
    expect(screen.getAllByTestId("gift-step")).toHaveLength(3)
    const words = GIFT_STEPS.map((s) => `${s.title} ${s.body}`).join(" ")
    expect(words).toContain("Months 1, 2 and 3")
    expect(words).toContain("within one year of purchase")
    expect(words).toContain("a free GWTH account")
    // No price and no date is typed into the steps.
    expect(words).not.toMatch(/£|\d{4}|December|January/)
  })

  it("uses no dash or section sign and shows the present with alt text", async () => {
    const { GiftNext } = await load(true)
    const { container } = render(<GiftNext now={IN_SALE} />)
    expect(container.textContent ?? "").not.toMatch(/[–—§]/)
    expect(screen.getAllByAltText(/envelope tied with a green ribbon/)).toHaveLength(2)
  })
})

function pass(over: Partial<PassRecord> = {}): PassRecord {
  return {
    id: "p1",
    code: "GWTH-7KQ2-M9XD-4TPA",
    product: "course",
    amountPence: 6900,
    isGift: true,
    buyerName: "Sam",
    buyerEmail: "sam@example.com",
    recipientName: "Alex",
    recipientEmail: "alex@example.com",
    message: "Happy Christmas",
    deliverAt: new Date("2026-12-25T07:00:00Z"),
    deliveredAt: null,
    purchasedAt: new Date("2026-12-16T12:00:00Z"),
    redeemBy: new Date("2027-12-16T12:00:00Z"),
    redeemedBy: null,
    redeemedAt: null,
    startsAt: null,
    endsAt: null,
    status: "paid",
    monthReleases: null,
    ...over,
  } as unknown as PassRecord
}

describe("/gift/thanks (GiftThanksNext)", () => {
  it("shows a bought gift: the code, the open-by date, the print link and the refund rule", async () => {
    const { GiftThanksNext } = await import("./gift-thanks-next")
    render(<GiftThanksNext pass={pass()} now={new Date("2026-12-16T12:05:00Z")} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Thank you. Your gift is ready.")
    expect(screen.getByTestId("gift-thanks")).toHaveTextContent(
      "We'll email Alex on 25 December 2026 at about 7am UK time, with your message and a link to open the gift."
    )
    expect(screen.getByTestId("gift-code")).toHaveTextContent("GWTH-7KQ2-M9XD-4TPA")
    expect(screen.getByRole("link", { name: "Print the gift card" })).toHaveAttribute(
      "href",
      "/gift/card?code=GWTH-7KQ2-M9XD-4TPA"
    )
    expect(screen.getByTestId("gift-thanks-refund")).toHaveTextContent(
      "For a full refund before the gift is opened, contact us. Once it's opened, it isn't refundable unless the law requires. See our Terms."
    )
    expect(screen.getAllByAltText(/envelope tied with a green ribbon/)).toHaveLength(2)
  })

  it("says a sent gift was sent, and a due one is going", async () => {
    const { GiftThanksNext } = await import("./gift-thanks-next")
    render(<GiftThanksNext pass={pass({ deliveredAt: new Date("2026-12-16T12:01:00Z") })} />)
    expect(screen.getByTestId("gift-thanks")).toHaveTextContent("We've emailed Alex with your message")
    cleanup()
    render(<GiftThanksNext pass={pass()} now={new Date("2026-12-26T00:00:00Z")} />)
    expect(screen.getByTestId("gift-thanks")).toHaveTextContent("If it doesn't arrive, please contact us.")
  })

  it("waits for a payment that is still being confirmed, with a way to get help", async () => {
    const { GiftThanksNext } = await import("./gift-thanks-next")
    render(<GiftThanksNext pass={null} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("confirming your payment")
    expect(screen.getByTestId("thanks-pending")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/contact")
    expect(screen.queryByAltText(/envelope/)).toBeNull()
  })

  it("never waits forever when the link carries no payment", async () => {
    const { GiftThanksNext } = await import("./gift-thanks-next")
    render(<GiftThanksNext pass={null} hasPayment={false} />)
    expect(screen.getByTestId("thanks-no-payment")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Give a gift" })).toHaveAttribute("href", "/gift")
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact")
  })

  it("thanks someone who bought the course for themselves", async () => {
    const { GiftThanksNext } = await import("./gift-thanks-next")
    render(<GiftThanksNext pass={pass({ isGift: false, redeemedAt: new Date("2026-12-16T12:00:00Z") })} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Thank you. Your course has started.")
    expect(screen.getByRole("link", { name: "Start Month 1" })).toHaveAttribute("href", "/dashboard")
    cleanup()
    render(<GiftThanksNext pass={pass({ isGift: false })} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your course is ready.")
    expect(screen.queryByRole("link", { name: "Start Month 1" })).toBeNull()
  })
})

describe("/gift/open (OpenGiftNext)", () => {
  it("asks for the code, with help for a lost one", async () => {
    const { OpenGiftNext } = await import("./open-gift-next")
    render(await OpenGiftNext({ rawCode: null, identity: null }))
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Open your gift")
    expect(screen.getByLabelText("Gift code")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Find my gift" })).toBeInTheDocument()
    expect(screen.getByTestId("gift-lost-code")).toHaveTextContent("Can't find your code?")
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("says what to enter when the box was sent empty", async () => {
    const { OpenGiftNext } = await import("./open-gift-next")
    render(await OpenGiftNext({ rawCode: "", identity: null }))
    expect(screen.getByRole("alert")).toHaveTextContent("Enter the code from your gift email or card.")
  })

  it("says when a code is not found, keeping what was typed", async () => {
    const { OpenGiftNext } = await import("./open-gift-next")
    render(await OpenGiftNext({ rawCode: "GWTH-AAAA-BBBB-CCCC", identity: null }))
    expect(screen.getByRole("alert")).toHaveTextContent("We can't find that code. Please check it and try again.")
    expect(screen.getByLabelText("Gift code")).toHaveValue("GWTH-AAAA-BBBB-CCCC")
  })

  it("shows a found gift to a signed-out visitor with both ways in", async () => {
    const store = await import("@/lib/billing/pass-store")
    vi.mocked(store.getPassByCode).mockResolvedValueOnce(pass())
    vi.mocked(store.passOpenability).mockReturnValueOnce("ok" as never)
    const { OpenGiftNext } = await import("./open-gift-next")
    render(await OpenGiftNext({ rawCode: "GWTH-7KQ2-M9XD-4TPA", identity: null }))
    expect(screen.getByTestId("gift-what")).toHaveTextContent("The whole GWTH course: Months 1, 2 and 3")
    expect(screen.getByText("From Sam")).toBeInTheDocument()
    expect(screen.getByText("Happy Christmas")).toBeInTheDocument()
    const back = encodeURIComponent("/gift/open?code=GWTH-7KQ2-M9XD-4TPA")
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", `/signup?next=${back}`)
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", `/login?next=${back}`)
  })

  it("offers the open button to a signed-in learner without the course", async () => {
    const store = await import("@/lib/billing/pass-store")
    const access = await import("@/lib/billing/access")
    vi.mocked(store.getPassByCode).mockResolvedValueOnce(pass())
    vi.mocked(store.passOpenability).mockReturnValueOnce("ok" as never)
    vi.mocked(access.getAccessForUser).mockResolvedValueOnce({ subscriptionMonth: 0, source: "registered" } as never)
    const { OpenGiftNext } = await import("./open-gift-next")
    render(
      await OpenGiftNext({
        rawCode: "GWTH-7KQ2-M9XD-4TPA",
        identity: { id: "u1", name: "Alex", email: "alex@example.com" },
      })
    )
    expect(screen.getByTestId("open-gift")).toHaveTextContent("Open it now")
    expect(screen.getByText(/You're opening the gift on your account, alex@example.com/)).toBeInTheDocument()
  })

  it("explains a refunded, an expired and an already opened gift", async () => {
    const store = await import("@/lib/billing/pass-store")
    const { OpenGiftNext } = await import("./open-gift-next")
    for (const [state, title] of [
      ["refunded", "This gift was refunded"],
      ["expired", "The time to open this gift has passed"],
      ["opened", "This gift has already been opened"],
    ] as const) {
      cleanup()
      vi.mocked(store.getPassByCode).mockResolvedValueOnce(pass({ redeemedBy: "someone-else" }))
      vi.mocked(store.passOpenability).mockReturnValueOnce(state as never)
      render(await OpenGiftNext({ rawCode: "GWTH-7KQ2-M9XD-4TPA", identity: null }))
      expect(screen.getByTestId("open-gift-notice")).toHaveTextContent(title)
      expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact")
    }
  })
})
