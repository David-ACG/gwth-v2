/**
 * The launch readiness fixes on the gift pages (bead gwth-launch-ajqs.2,
 * 2026-10-20): the weekly time, the Terms and refund line by the pay button,
 * an empty code box that says what to enter, help for a lost code, a thanks
 * page that never waits forever, and a gift card page that offers a way on.
 */
import { readFileSync } from "fs"
import { join } from "path"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { GiftForm } from "./gift-form"
import { GiftCodeForm } from "./gift-code-form"
import { GiftThanksPage } from "./gift-thanks-page"
import { GiftCardPrint } from "./gift-card-print"
import { GIFT_COPY, OPEN_COPY } from "./gift-copy"
import type { PassRecord } from "@/lib/billing/pass-store"

vi.mock("@/lib/billing/pass-store", () => ({
  getPassByCode: vi.fn(async () => null),
  passOpenability: vi.fn(),
}))
vi.mock("@/lib/billing/access", () => ({ getAccessForUser: vi.fn() }))

afterEach(cleanup)

const FORM_PROPS = {
  prices: { course: "£69", month1: "£29" },
  courseWasPrice: "£87",
  saleEndsOn: "6 January 2027",
  christmasLabel: "25 December, 7am",
  today: "2026-12-10",
  lastDay: "2027-12-10",
}

describe("/gift", () => {
  it("gives the weekly time the home page gives, not an hour a day", () => {
    expect(GIFT_COPY.masthead.standfirst).toContain("about five hours a week")
    expect(GIFT_COPY.masthead.standfirst).not.toMatch(/an hour a day/)
  })

  it("says under the pay button that paying agrees to the Terms, and how to refund", () => {
    render(<GiftForm {...FORM_PROPS} />)
    const line = screen.getByTestId("gift-pay-terms")
    expect(line).toHaveTextContent(
      "By paying, you agree to our Terms. To ask for a refund before the gift is opened, contact us."
    )
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms")
    expect(screen.getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/contact")
  })

  it("reads the struck-through price as the old price", () => {
    render(<GiftForm {...FORM_PROPS} />)
    expect(screen.getByTestId("gift-product-course")).toHaveTextContent("£69, was£87")
  })

  it("does not squeeze the word spaces in the three question headings", () => {
    const css = readFileSync(join(__dirname, "gift.module.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
    const rule = css.match(/\.answer h3\s*\{([^}]*)\}/)
    expect(rule?.[1]).toMatch(/letter-spacing:\s*0;/)
  })
})

describe("/gift/open", () => {
  it("says what to enter when the box is sent empty, and stays on the page", () => {
    render(<GiftCodeForm />)
    const box = screen.getByLabelText("Gift code")
    expect(box).toBeRequired()
    const submitted = fireEvent.submit(box.closest("form")!)
    expect(submitted).toBe(false) // default prevented: no reload to ?code=
    expect(screen.getByRole("alert")).toHaveTextContent("Enter the code from your gift email or card.")
    expect(box).toHaveAttribute("aria-invalid", "true")
  })

  it("shows the same message from the server when ?code= arrives empty", async () => {
    const { OpenGiftPage } = await import("./open-gift-page")
    render(await OpenGiftPage({ rawCode: "", identity: null }))
    expect(screen.getByText(OPEN_COPY.enter.empty, { selector: "p" })).toBeInTheDocument()
  })

  it("shows no error on a first visit, and says where a lost code is", async () => {
    const { OpenGiftPage } = await import("./open-gift-page")
    render(await OpenGiftPage({ rawCode: null, identity: null }))
    expect(screen.queryByRole("alert")).toBeNull()
    expect(screen.getByTestId("gift-lost-code")).toHaveTextContent(
      "Can't find your code? It's in the gift email and on the printed gift card. If you still can't find it, contact us."
    )
    expect(screen.getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/contact")
  })
})

describe("/gift/thanks", () => {
  it("says it cannot check a payment when the link has none, with ways on", () => {
    render(<GiftThanksPage pass={null} hasPayment={false} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("We can't check a payment from this link")
    expect(screen.queryByText(/confirming your payment/)).toBeNull()
    expect(screen.getByRole("link", { name: "Give a gift" })).toHaveAttribute("href", "/gift")
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact")
  })

  it("while confirming, says what to do if nothing changes", () => {
    render(<GiftThanksPage pass={null} hasPayment />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("We’re confirming your payment")
    expect(screen.getByTestId("thanks-pending")).toHaveTextContent(
      "If this hasn't changed after a few minutes, contact us."
    )
  })

  it("gives the refund rule with the Terms linked once the gift is ready", () => {
    const pass = {
      code: "GWTH-H2CB-H66J-8A4R",
      product: "course",
      isGift: true,
      recipientName: "Keri",
      deliverAt: new Date("2026-12-25T07:00:00Z"),
      deliveredAt: null,
      redeemBy: new Date("2027-12-01T10:00:00Z"),
    } as unknown as PassRecord
    render(<GiftThanksPage pass={pass} now={new Date("2026-12-03T10:00:00Z")} />)
    expect(screen.getByTestId("gift-thanks-refund")).toHaveTextContent(
      "For a full refund before the gift is opened, contact us. Once it's opened, it isn't refundable unless the law requires. See our Terms."
    )
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms")
  })
})

describe("/gift/thanks says only what is true (Sol copy check, 2026-10-20)", () => {
  const gift = {
    code: "GWTH-H2CB-H66J-8A4R",
    product: "course",
    isGift: true,
    recipientName: "Keri",
    deliverAt: new Date("2026-12-25T07:00:00Z"),
    deliveredAt: null,
    redeemBy: new Date("2027-12-01T10:00:00Z"),
  } as unknown as PassRecord

  it("does not say the gift was emailed until the send is confirmed", () => {
    render(<GiftThanksPage pass={gift} now={new Date("2026-12-25T07:05:00Z")} />)
    expect(screen.getByTestId("gift-thanks")).toHaveTextContent("We'll email Keri your message and a link to open the gift. If it doesn't arrive, please contact us.")
    expect(screen.getByTestId("gift-thanks")).not.toHaveTextContent("We've emailed")
  })

  it("does not say a self-bought course has started before it is opened", () => {
    const self = { ...gift, isGift: false, redeemedAt: null } as unknown as PassRecord
    render(<GiftThanksPage pass={self} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your course is ready.")
  })
})

describe("/gift/card with no or a wrong code", () => {
  it("shows the logo, says where the card link is, and offers the ways on", () => {
    render(<GiftCardPrint pass={null} />)
    const card = screen.getByTestId("gift-card-not-found")
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("We can't find that gift code.")
    expect(card).toHaveTextContent("The link to the gift card is in the receipt email")
    expect(screen.getByRole("link", { name: "Open your gift" })).toHaveAttribute("href", "/gift/open")
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact")
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms")
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy")
    // The logo links home, inside the card, above the message.
    expect(card.querySelector("a[href='/'] svg, a[href='/'] img")).not.toBeNull()
  })
})
