import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { GiftCardPrint } from "./gift-card-print"
import type { PassRecord } from "@/lib/billing/pass-store"

afterEach(cleanup)

const PASS = {
  id: "p1",
  code: "GWTH-H2CB-H66J-8A4R",
  product: "course",
  pricePaid: 6900,
  buyerName: "David Uccelli",
  buyerEmail: "d@example.com",
  isGift: true,
  recipientName: "Keri Ashpole",
  recipientEmail: "k@example.com",
  message: "Testing",
  deliverAt: new Date("2026-12-25T07:00:00Z"),
  deliveredAt: null,
  redeemBy: new Date("2027-12-01T10:00:00Z"),
  redeemedAt: null,
  refundedAt: null,
} as unknown as PassRecord

describe("the printable gift card page (David, 2026-10-20)", () => {
  it("thanks the buyer and says when the gift email will go", () => {
    render(<GiftCardPrint pass={PASS} now={new Date("2026-12-03T10:00:00Z")} />)
    const note = screen.getByTestId("gift-card-thanks")
    expect(note).toHaveTextContent("Thank you, David.")
    expect(note).toHaveTextContent("We'll email your gift to Keri Ashpole on 25 December 2026 at about 7am UK time.")
  })

  it("says the gift has been sent once it has", () => {
    render(
      <GiftCardPrint
        pass={{ ...PASS, deliveredAt: new Date("2026-12-25T07:00:30Z") } as PassRecord}
        now={new Date("2026-12-26T10:00:00Z")}
      />
    )
    expect(screen.getByTestId("gift-card-thanks")).toHaveTextContent(
      "We emailed your gift to Keri Ashpole on 25 December 2026."
    )
  })

  it("has a way back to the site", () => {
    render(<GiftCardPrint pass={PASS} />)
    const back = screen.getAllByRole("link", { name: "Back to GWTH.ai" })
    expect(back.length).toBeGreaterThanOrEqual(1)
    for (const link of back) expect(link).toHaveAttribute("href", "/")
  })
})
