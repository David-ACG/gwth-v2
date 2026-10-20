import { describe, expect, it } from "vitest"
import {
  giftArrivedEmail,
  giftSentEmail,
  giftReceiptEmail,
  passOpenedEmail,
  renewalReminderEmail,
  selfReceiptEmail,
  type PassForEmail,
} from "./pass-emails"

const ENV = { BETTER_AUTH_URL: "https://hlab.example.net:9458" }

const GIFT: PassForEmail = {
  code: "GWTH-7KQ2-M9XD-4TPA",
  product: "course",
  pricePaid: 6900,
  buyerName: "Alex Morgan",
  buyerEmail: "alex@example.com",
  isGift: true,
  recipientName: "Sam Patel",
  recipientEmail: "sam@example.com",
  message: "Happy Christmas, Sam. You'll love this.",
  deliverAt: new Date("2026-12-25T07:00:00Z"),
  redeemBy: new Date("2027-12-03T10:00:00Z"),
  redeemedAt: null,
}

const ALL = [
  giftReceiptEmail(GIFT, ENV, new Date("2026-12-03T10:00:00Z")),
  giftArrivedEmail(GIFT, ENV),
  giftSentEmail(GIFT, new Date("2026-12-25T07:05:00Z"), ENV),
  passOpenedEmail(GIFT, "Sam Patel", ENV),
  selfReceiptEmail({ ...GIFT, isGift: false, redeemedAt: new Date("2026-12-03T10:00:00Z") }, ENV),
  renewalReminderEmail({ name: "Jo", amountPence: 2900, chargeOn: new Date("2027-01-03T10:00:00Z"), forMonth: 2 }, ENV),
]

describe("gift and pass emails", () => {
  it("tells the buyer when the gift goes, what it cost, the code and the open-by date", () => {
    const { subject, parts } = giftReceiptEmail(GIFT, ENV, new Date("2026-12-03T10:00:00Z"))
    expect(subject).toBe("Your GWTH gift for Sam Patel is ready")
    expect(parts.text).toMatch(/We'll email Sam Patel .* on 25 December 2026 at 7am UK time/)
    for (const text of [parts.html, parts.text]) {
      expect(text).toContain("25 December 2026")
      expect(text).toContain("£69")
      expect(text).toContain("GWTH-7KQ2-M9XD-4TPA")
      expect(text).toContain("3 December 2027")
    }
    expect(parts.html).toContain("https://hlab.example.net:9458/gift/card?code=GWTH-7KQ2-M9XD-4TPA")
  })

  it("gives the recipient the message, who it is from, the code and a link that opens it", () => {
    const { subject, parts } = giftArrivedEmail(GIFT, ENV)
    expect(subject).toBe("Alex Morgan has given you the GWTH course")
    expect(parts.html).toContain("Happy Christmas, Sam. You'll love this.")
    expect(parts.text).toContain("From Alex Morgan")
    expect(parts.html).toContain("https://hlab.example.net:9458/gift/open?code=GWTH-7KQ2-M9XD-4TPA")
    expect(parts.text).toContain("Open it by 3 December 2027")
  })

  it("leaves the message panel out when there is no message", () => {
    const { parts } = giftArrivedEmail({ ...GIFT, message: "  " }, ENV)
    expect(parts.text).not.toContain("From Alex Morgan\n")
  })

  it("explains hold the clock once the whole course is open, and the carry-on for a first month", () => {
    expect(passOpenedEmail(GIFT, "Sam", ENV).parts.text).toMatch(/paused until it is/)
    expect(passOpenedEmail({ ...GIFT, product: "month1" }, "Sam", ENV).parts.text).toMatch(/Months 2 and 3/)
  })

  it("reminds a payer of the amount, the date and how to cancel online", () => {
    const { subject, parts } = renewalReminderEmail(
      { name: "Jo Bloggs", amountPence: 2900, chargeOn: new Date("2027-01-03T10:00:00Z"), forMonth: 2 },
      ENV
    )
    expect(subject).toBe("Your next GWTH payment on 3 January 2027")
    expect(parts.text).toContain("£29")
    expect(parts.text).toContain("Month 2")
    expect(parts.text).toMatch(/cancel online/i)
    expect(parts.html).toContain("https://hlab.example.net:9458/settings")
  })

  it("every email ships a plain-text part, the paper-first logo, and no dashes as punctuation", () => {
    for (const { parts } of ALL) {
      expect(parts.text.length).toBeGreaterThan(50)
      expect(parts.html).toContain("/logo-email-paper.png")
      expect(parts.html + parts.text).not.toMatch(/[–—§]/)
    }
  })

  it("uses only paper-first colours, never the retired palette", () => {
    for (const { parts } of ALL) {
      expect(parts.html.toLowerCase()).not.toMatch(/#2c4a47|#a94c2e|#d4a062|#faf6ef|#b07d2c|courier/)
      expect(parts.html).toContain("#b5dbd0")
    }
  })

  it("says the gift has gone when it was sent straight away", () => {
    const now = new Date("2026-12-25T07:00:00Z")
    const { parts } = giftReceiptEmail({ ...GIFT, deliverAt: now }, ENV, new Date(now.getTime() + 1000))
    expect(parts.text).toMatch(/We've emailed Sam Patel/)
    expect(parts.text).not.toMatch(/7am/)
  })

  it("tells the buyer on the day their scheduled gift has been sent (David, 2026-10-20)", () => {
    const { subject, parts } = giftSentEmail(GIFT, new Date("2026-12-25T07:05:00Z"), ENV)
    expect(subject).toBe("Your gift to Sam Patel has been sent")
    expect(parts.text).toContain("Hi Alex, we've sent your gift to Sam Patel.")
    expect(parts.text).toContain("We emailed Sam Patel (sam@example.com) on 25 December 2026")
    expect(parts.text).toContain("GWTH-7KQ2-M9XD-4TPA")
    expect(parts.html).toContain("/gift/card?code=GWTH-7KQ2-M9XD-4TPA")
  })
})
