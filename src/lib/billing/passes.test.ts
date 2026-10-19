import { describe, expect, it } from "vitest"
import {
  addMonths,
  christmasMorning,
  formatPence,
  formatUkDate,
  generatePassCode,
  getSaleWindow,
  isChristmasSale,
  isSalesOpen,
  londonTimeToUtc,
  normalisePassCode,
  offersChristmasMorning,
  passPrice,
  passStatus,
  passTimeline,
  redeemByFrom,
  resolveDeliverAt,
  type MonthRelease,
} from "./passes"

const d = (iso: string) => new Date(iso)
const NOT_OPEN: MonthRelease = { month2: null, month3: null }
const BOTH_OPEN_EARLY: MonthRelease = {
  month2: d("2026-11-01T00:00:00Z"),
  month3: d("2026-11-01T00:00:00Z"),
}

describe("addMonths", () => {
  it("adds calendar months in UTC", () => {
    expect(addMonths(d("2026-12-25T07:00:00Z"), 1)).toEqual(d("2027-01-25T07:00:00Z"))
    expect(addMonths(d("2026-12-25T07:00:00Z"), 12)).toEqual(d("2027-12-25T07:00:00Z"))
  })

  it("clamps to the end of a short month instead of spilling over", () => {
    expect(addMonths(d("2027-01-31T10:00:00Z"), 1)).toEqual(d("2027-02-28T10:00:00Z"))
    expect(addMonths(d("2028-01-31T10:00:00Z"), 1)).toEqual(d("2028-02-29T10:00:00Z"))
    expect(addMonths(d("2026-10-31T10:00:00Z"), 1)).toEqual(d("2026-11-30T10:00:00Z"))
  })
})

describe("hold the clock: whole-course pass timeline", () => {
  it("runs three straight months when Months 2 and 3 are already open", () => {
    const t = passTimeline({
      product: "course",
      openedAt: d("2026-12-25T09:00:00Z"),
      release: BOTH_OPEN_EARLY,
    })
    expect(t.month2Start).toEqual(d("2027-01-25T09:00:00Z"))
    expect(t.month3Start).toEqual(d("2027-02-25T09:00:00Z"))
    expect(t.endsAt).toEqual(d("2027-03-25T09:00:00Z"))
  })

  it("has no Month 2 start and no end while Month 2 is unfinished", () => {
    const t = passTimeline({
      product: "course",
      openedAt: d("2026-12-25T09:00:00Z"),
      release: NOT_OPEN,
    })
    expect(t.month2Start).toBeNull()
    expect(t.month3Start).toBeNull()
    expect(t.endsAt).toBeNull()
  })

  it("starts Month 2 on its open date when that is later than a month in (time waiting is not counted)", () => {
    const t = passTimeline({
      product: "course",
      openedAt: d("2026-12-25T09:00:00Z"),
      release: { month2: d("2027-02-10T00:00:00Z"), month3: d("2027-02-10T00:00:00Z") },
    })
    expect(t.month2Start).toEqual(d("2027-02-10T00:00:00Z"))
    expect(t.month3Start).toEqual(d("2027-03-10T00:00:00Z"))
    expect(t.endsAt).toEqual(d("2027-04-10T00:00:00Z"))
  })

  it("starts Month 2 a month after opening when Month 2 opened before then", () => {
    const t = passTimeline({
      product: "course",
      openedAt: d("2027-03-01T12:00:00Z"),
      release: { month2: d("2027-01-15T00:00:00Z"), month3: null },
    })
    expect(t.month2Start).toEqual(d("2027-04-01T12:00:00Z"))
    expect(t.month3Start).toBeNull()
    expect(t.endsAt).toBeNull()
  })

  it("holds Month 3 separately from Month 2", () => {
    const t = passTimeline({
      product: "course",
      openedAt: d("2026-12-25T09:00:00Z"),
      release: { month2: d("2027-01-01T00:00:00Z"), month3: d("2027-04-01T00:00:00Z") },
    })
    expect(t.month2Start).toEqual(d("2027-01-25T09:00:00Z"))
    expect(t.month3Start).toEqual(d("2027-04-01T00:00:00Z"))
    expect(t.endsAt).toEqual(d("2027-05-01T00:00:00Z"))
  })

  it("adds an admin extension to the end", () => {
    const t = passTimeline({
      product: "course",
      openedAt: d("2026-12-25T09:00:00Z"),
      release: BOTH_OPEN_EARLY,
      extraMonths: 1,
    })
    expect(t.endsAt).toEqual(d("2027-04-25T09:00:00Z"))
  })
})

describe("hold the clock: where a whole-course pass stands", () => {
  const opened = d("2026-12-25T09:00:00Z")

  it("is Month 1 during the first month, not on hold", () => {
    const s = passStatus({ product: "course", openedAt: opened, release: NOT_OPEN }, d("2027-01-10T00:00:00Z"))
    expect(s).toMatchObject({ month: 1, onHoldFor: null, expired: false, endsAt: null })
  })

  it("stays in Month 1 and is on hold for Month 2 once the month is used up and Month 2 is unfinished", () => {
    const s = passStatus({ product: "course", openedAt: opened, release: NOT_OPEN }, d("2027-02-20T00:00:00Z"))
    expect(s).toMatchObject({ month: 1, onHoldFor: 2, expired: false })
  })

  it("is on hold while Month 2 has an open date that is still ahead", () => {
    const release = { month2: d("2027-03-01T00:00:00Z"), month3: null }
    const s = passStatus({ product: "course", openedAt: opened, release }, d("2027-02-01T00:00:00Z"))
    expect(s).toMatchObject({ month: 1, onHoldFor: 2 })
  })

  it("moves into Month 2 on the day Month 2 opens, and the held weeks are not lost", () => {
    const release = { month2: d("2027-03-01T00:00:00Z"), month3: d("2027-03-01T00:00:00Z") }
    const input = { product: "course" as const, openedAt: opened, release }
    expect(passStatus(input, d("2027-03-01T00:00:00Z"))).toMatchObject({ month: 2, onHoldFor: null })
    expect(passStatus(input, d("2027-04-01T00:00:00Z"))).toMatchObject({ month: 3 })
    // Ends a full month after Month 3 began, not three months after opening.
    expect(passStatus(input, d("2027-04-30T00:00:00Z"))).toMatchObject({ month: 3, expired: false })
    expect(passStatus(input, d("2027-05-01T00:00:00Z"))).toMatchObject({ month: 0, expired: true })
  })

  it("is on hold for Month 3 in Month 2 when Month 3 is unfinished", () => {
    const release = { month2: d("2027-01-01T00:00:00Z"), month3: null }
    const s = passStatus({ product: "course", openedAt: opened, release }, d("2027-03-01T00:00:00Z"))
    expect(s).toMatchObject({ month: 2, onHoldFor: 3, endsAt: null })
  })

  it("ends exactly a month after Month 3 starts when nothing is held", () => {
    const input = { product: "course" as const, openedAt: opened, release: BOTH_OPEN_EARLY }
    expect(passStatus(input, d("2027-03-25T08:59:59Z"))).toMatchObject({ month: 3, expired: false })
    expect(passStatus(input, d("2027-03-25T09:00:00Z"))).toMatchObject({ month: 0, expired: true })
  })

  it("a pass opened after both months opened runs three straight months", () => {
    const input = { product: "course" as const, openedAt: d("2027-06-10T10:00:00Z"), release: BOTH_OPEN_EARLY }
    expect(passStatus(input, d("2027-06-11T00:00:00Z")).month).toBe(1)
    expect(passStatus(input, d("2027-07-11T00:00:00Z")).month).toBe(2)
    expect(passStatus(input, d("2027-08-11T00:00:00Z")).month).toBe(3)
    expect(passStatus(input, d("2027-09-11T00:00:00Z")).expired).toBe(true)
  })

  it("gives nothing once refunded", () => {
    const s = passStatus(
      { product: "course", openedAt: opened, release: BOTH_OPEN_EARLY, refundedAt: d("2027-01-01T00:00:00Z") },
      d("2027-01-02T00:00:00Z")
    )
    expect(s).toMatchObject({ month: 0, expired: true })
  })
})

describe("first-month pass", () => {
  const opened = d("2026-12-25T09:00:00Z")

  it("gives Month 1 for exactly one month and is never on hold", () => {
    const input = { product: "month1" as const, openedAt: opened, release: NOT_OPEN }
    expect(passStatus(input, d("2027-01-24T00:00:00Z"))).toMatchObject({ month: 1, onHoldFor: null, expired: false })
    expect(passStatus(input, d("2027-01-25T09:00:00Z"))).toMatchObject({ month: 0, expired: true })
    expect(passTimeline(input).endsAt).toEqual(d("2027-01-25T09:00:00Z"))
  })

  it("ignores the release dates", () => {
    const a = passTimeline({ product: "month1", openedAt: opened, release: NOT_OPEN })
    const b = passTimeline({ product: "month1", openedAt: opened, release: BOTH_OPEN_EARLY })
    expect(a).toEqual(b)
  })
})

describe("sale window and prices", () => {
  const window = getSaleWindow({})

  it("defaults to 1 December 2026 to the end of 6 January 2027", () => {
    expect(window.salesOpenAt).toEqual(d("2026-12-01T00:00:00Z"))
    expect(window.saleEndsAt).toEqual(d("2027-01-07T00:00:00Z"))
  })

  it("reads overrides from env and ignores a malformed value", () => {
    const w = getSaleWindow({ SALES_OPEN_AT: "2026-10-01T00:00:00Z", CHRISTMAS_SALE_ENDS_AT: "not a date" })
    expect(w.salesOpenAt).toEqual(d("2026-10-01T00:00:00Z"))
    expect(w.saleEndsAt).toEqual(d("2027-01-07T00:00:00Z"))
  })

  it("sells nothing before 1 December", () => {
    expect(isSalesOpen(d("2026-11-30T23:59:59Z"), window)).toBe(false)
    expect(isSalesOpen(d("2026-12-01T00:00:00Z"), window)).toBe(true)
  })

  it("prices the whole course at £69 in the sale and £87 from 7 January", () => {
    expect(passPrice("course", d("2026-12-01T00:00:00Z"), window)).toMatchObject({ pence: 6900, onSale: true, priceEnv: "STRIPE_PASS_COURSE_SALE_PRICE_ID" })
    expect(passPrice("course", d("2027-01-06T23:59:59Z"), window).pence).toBe(6900)
    expect(passPrice("course", d("2027-01-07T00:00:00Z"), window)).toMatchObject({ pence: 8700, onSale: false, priceEnv: "STRIPE_PASS_COURSE_PRICE_ID" })
    expect(isChristmasSale(d("2027-01-07T00:00:00Z"), window)).toBe(false)
  })

  it("keeps the first month at £29 all year", () => {
    for (const at of ["2026-12-10T00:00:00Z", "2027-06-01T00:00:00Z"]) {
      expect(passPrice("month1", d(at), window)).toMatchObject({ pence: 2900, onSale: false })
    }
  })

  it("formats pence as pounds", () => {
    expect(formatPence(6900)).toBe("£69")
    expect(formatPence(750)).toBe("£7.50")
  })
})

describe("codes", () => {
  it("generates GWTH-XXXX-XXXX-XXXX from the unambiguous alphabet", () => {
    for (let i = 0; i < 50; i++) {
      expect(generatePassCode()).toMatch(/^GWTH-[2-9A-HJKMNP-TV-Z]{4}-[2-9A-HJKMNP-TV-Z]{4}-[2-9A-HJKMNP-TV-Z]{4}$/)
    }
  })

  it("accepts a code typed in any case, with spaces or without dashes", () => {
    expect(normalisePassCode("gwth-7kq2-m9xd-4tpa")).toBe("GWTH-7KQ2-M9XD-4TPA")
    expect(normalisePassCode(" 7KQ2 M9XD 4TPA ")).toBe("GWTH-7KQ2-M9XD-4TPA")
    expect(normalisePassCode("GWTH7KQ2M9XD4TPA")).toBe("GWTH-7KQ2-M9XD-4TPA")
  })

  it("rejects anything that cannot be a code", () => {
    expect(normalisePassCode("")).toBeNull()
    expect(normalisePassCode("GWTH-7KQ2-M9XD")).toBeNull()
    expect(normalisePassCode("GWTH-0000-1111-IIII")).toBeNull()
  })
})

describe("delivery and open-by dates", () => {
  it("converts UK wall-clock time in winter (GMT) and summer (BST)", () => {
    expect(londonTimeToUtc(2026, 12, 25, 7)).toEqual(d("2026-12-25T07:00:00Z"))
    expect(londonTimeToUtc(2027, 6, 14, 7)).toEqual(d("2027-06-14T06:00:00Z"))
  })

  it("defaults Christmas morning to 7am UK on 25 December", () => {
    expect(christmasMorning(d("2026-12-03T10:00:00Z"))).toEqual(d("2026-12-25T07:00:00Z"))
  })

  const redeemBy = redeemByFrom(d("2026-12-03T10:00:00Z"))

  it("can be opened up to one year after purchase", () => {
    expect(redeemBy).toEqual(d("2027-12-03T10:00:00Z"))
  })

  it("sends on Christmas morning, now, or 7am UK on a chosen date", () => {
    const now = d("2026-12-03T10:00:00Z")
    expect(resolveDeliverAt({ kind: "christmas" }, now, redeemBy)).toEqual(d("2026-12-25T07:00:00Z"))
    expect(resolveDeliverAt({ kind: "now" }, now, redeemBy)).toEqual(now)
    expect(resolveDeliverAt({ kind: "date", date: "2026-12-20" }, now, redeemBy)).toEqual(d("2026-12-20T07:00:00Z"))
  })

  it("does not offer Christmas morning once it has passed, nor outside November and December", () => {
    expect(resolveDeliverAt({ kind: "christmas" }, d("2026-12-25T08:00:00Z"), redeemBy)).toBeNull()
    expect(offersChristmasMorning(d("2027-01-07T00:00:00Z"))).toBe(false)
    expect(offersChristmasMorning(d("2027-10-31T12:00:00Z"))).toBe(false)
    expect(offersChristmasMorning(d("2027-11-01T12:00:00Z"))).toBe(true)
    expect(resolveDeliverAt({ kind: "christmas" }, d("2027-06-01T00:00:00Z"), redeemByFrom(d("2027-06-01T00:00:00Z")))).toBeNull()
  })

  it("sends at once when the chosen date has passed, and refuses a date after the open-by date", () => {
    const now = d("2026-12-03T10:00:00Z")
    expect(resolveDeliverAt({ kind: "date", date: "2026-12-01" }, now, redeemBy)).toEqual(now)
    expect(resolveDeliverAt({ kind: "date", date: "2028-01-01" }, now, redeemBy)).toBeNull()
    expect(resolveDeliverAt({ kind: "date", date: "25/12/2026" }, now, redeemBy)).toBeNull()
  })

  it("prints dates the UK way", () => {
    expect(formatUkDate(d("2027-12-03T10:00:00Z"))).toBe("3 December 2027")
  })
})
