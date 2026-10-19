/**
 * Prepaid passes: the pure half (Christmas gift sale, bead gwth-launch-v1uj.4).
 *
 * A pass is a one-off payment for the whole course (three months) or for the
 * first month, bought for yourself or as a gift. Everything here is a pure
 * function of its inputs (no DB, no Stripe, no clock unless passed in), so
 * every date case is unit tested in passes.test.ts.
 *
 * ## Hold the clock (decision 5, 2026-10-19)
 *
 * David: "Month 2 opens when it is finished and nobody loses any of their
 * three months while they wait." Month 2 and Month 3 each have a global open
 * date (course_month_release, NULL while unfinished). For a pass opened at t0:
 *
 *   m1   = t0
 *   m2   = max(m1 + 1 month, opens_at(2))
 *   m3   = max(m2 + 1 month, opens_at(3))
 *   ends = m3 + 1 month            (first-month pass: ends = m1 + 1 month)
 *
 * While a month's open date is unknown, that month (and everything after it)
 * has no start date yet and the pass does not end: the learner keeps the
 * month they are in and sees an "on hold" notice. Computed on read, the same
 * lazy pattern that expires manual_beta grants; there is no job.
 */
import { randomInt } from "node:crypto"

export type PassProduct = "course" | "month1"

export type MonthRelease = {
  /** When Month 2 opens for everyone; null while it is still being finished. */
  month2: Date | null
  /** When Month 3 opens for everyone; null while it is still being finished. */
  month3: Date | null
}

export const PASS_MONTHS: Record<PassProduct, 1 | 3> = { course: 3, month1: 1 }

/** List prices in pence. The sale price only applies inside the sale window. */
export const PASS_PRICES_PENCE = {
  courseFull: 8700,
  courseSale: 6900,
  month1: 2900,
} as const

/** Default sale window (decision 3): sales open 1 Dec, the £69 price ends after 6 Jan (UK). */
export const DEFAULT_SALES_OPEN_AT = "2026-12-01T00:00:00Z"
export const DEFAULT_CHRISTMAS_SALE_ENDS_AT = "2027-01-07T00:00:00Z"

/** Decision 4: a gift can be opened up to one year after purchase. */
export const REDEEM_WINDOW_MONTHS = 12

// ---------------------------------------------------------------------------
// Calendar months
// ---------------------------------------------------------------------------

/**
 * Adds whole calendar months in UTC, clamping to the last day of a short
 * month (31 Jan + 1 month = 28 or 29 Feb), so "a month" never spills into the
 * month after.
 */
export function addMonths(date: Date, months: number): Date {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + months
  const targetYear = y + Math.floor(m / 12)
  const targetMonth = ((m % 12) + 12) % 12
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate()
  const day = Math.min(date.getUTCDate(), lastDay)
  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      day,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  )
}

function laterOf(a: Date, b: Date | null): Date {
  return b && b > a ? b : a
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export type PassTimeline = {
  month1Start: Date
  /** null while Month 2 has no open date (course passes only). */
  month2Start: Date | null
  month3Start: Date | null
  /** null while the end cannot be known yet (a month is on hold). */
  endsAt: Date | null
}

export function passTimeline(input: {
  product: PassProduct
  openedAt: Date
  release: MonthRelease
  extraMonths?: number
}): PassTimeline {
  const extra = Math.max(0, Math.floor(input.extraMonths ?? 0))
  const m1 = input.openedAt

  if (input.product === "month1") {
    return {
      month1Start: m1,
      month2Start: null,
      month3Start: null,
      endsAt: addMonths(m1, 1 + extra),
    }
  }

  const m2 = input.release.month2
    ? laterOf(addMonths(m1, 1), input.release.month2)
    : null
  const m3 =
    m2 && input.release.month3
      ? laterOf(addMonths(m2, 1), input.release.month3)
      : null

  return {
    month1Start: m1,
    month2Start: m2,
    month3Start: m3,
    endsAt: m3 ? addMonths(m3, 1 + extra) : null,
  }
}

export type PassStatus = {
  /** Course month the holder is in now: 1..3, or 0 once the pass has ended. */
  month: 0 | 1 | 2 | 3
  /** The month the holder is waiting for, when their time is on hold. */
  onHoldFor: 2 | 3 | null
  endsAt: Date | null
  expired: boolean
}

/**
 * Where a pass stands at `now`. A refunded pass gives nothing. The holder is
 * "on hold" once their current month's time is used up and the next month is
 * not open yet: they keep the month they are in, and lose no time.
 */
export function passStatus(
  input: {
    product: PassProduct
    openedAt: Date
    release: MonthRelease
    extraMonths?: number
    refundedAt?: Date | null
  },
  now: Date
): PassStatus {
  const t = passTimeline(input)

  if (input.refundedAt && input.refundedAt <= now) {
    return { month: 0, onHoldFor: null, endsAt: t.endsAt, expired: true }
  }
  if (t.endsAt && now >= t.endsAt) {
    return { month: 0, onHoldFor: null, endsAt: t.endsAt, expired: true }
  }

  if (input.product === "month1") {
    return { month: 1, onHoldFor: null, endsAt: t.endsAt, expired: false }
  }

  if (t.month3Start && now >= t.month3Start) {
    return { month: 3, onHoldFor: null, endsAt: t.endsAt, expired: false }
  }
  if (t.month2Start && now >= t.month2Start) {
    // Month 3 has no start yet, or starts later than a month after Month 2.
    const waitingForThree = now >= addMonths(t.month2Start, 1)
    return {
      month: 2,
      onHoldFor: waitingForThree ? 3 : null,
      endsAt: t.endsAt,
      expired: false,
    }
  }
  // Month 2 has no start yet, or opens later than a month after Month 1.
  const waitingForTwo = now >= addMonths(t.month1Start, 1)
  return {
    month: 1,
    onHoldFor: waitingForTwo ? 2 : null,
    endsAt: t.endsAt,
    expired: false,
  }
}

// ---------------------------------------------------------------------------
// Sale window and prices
// ---------------------------------------------------------------------------

export type SaleWindow = { salesOpenAt: Date; saleEndsAt: Date }

function envDate(raw: string | undefined, fallback: string): Date {
  const parsed = raw ? new Date(raw) : null
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date(fallback)
}

/**
 * SALES_OPEN_AT: before it nothing is sold (gifts, self-purchase and the
 * monthly sign-up all open together, decisions 3 and 6).
 * CHRISTMAS_SALE_ENDS_AT: from it the whole course is £87 again (decision 9).
 * A malformed value falls back to the decided date rather than opening early.
 */
export function getSaleWindow(
  env: Record<string, string | undefined> = process.env
): SaleWindow {
  return {
    salesOpenAt: envDate(env.SALES_OPEN_AT, DEFAULT_SALES_OPEN_AT),
    saleEndsAt: envDate(env.CHRISTMAS_SALE_ENDS_AT, DEFAULT_CHRISTMAS_SALE_ENDS_AT),
  }
}

export function isSalesOpen(now: Date, window: SaleWindow = getSaleWindow()): boolean {
  return now >= window.salesOpenAt
}

export function isChristmasSale(now: Date, window: SaleWindow = getSaleWindow()): boolean {
  return now >= window.salesOpenAt && now < window.saleEndsAt
}

export type PassPrice = {
  product: PassProduct
  pence: number
  /** The env var holding the Stripe Price id for this exact price. */
  priceEnv:
    | "STRIPE_PASS_COURSE_SALE_PRICE_ID"
    | "STRIPE_PASS_COURSE_PRICE_ID"
    | "STRIPE_PASS_MONTH1_PRICE_ID"
  onSale: boolean
}

/** The price a pass sells at, at `now`. The £69 price only exists in the sale. */
export function passPrice(
  product: PassProduct,
  now: Date,
  window: SaleWindow = getSaleWindow()
): PassPrice {
  if (product === "month1") {
    return {
      product,
      pence: PASS_PRICES_PENCE.month1,
      priceEnv: "STRIPE_PASS_MONTH1_PRICE_ID",
      onSale: false,
    }
  }
  return isChristmasSale(now, window)
    ? {
        product,
        pence: PASS_PRICES_PENCE.courseSale,
        priceEnv: "STRIPE_PASS_COURSE_SALE_PRICE_ID",
        onSale: true,
      }
    : {
        product,
        pence: PASS_PRICES_PENCE.courseFull,
        priceEnv: "STRIPE_PASS_COURSE_PRICE_ID",
        onSale: false,
      }
}

/** "£69", "£29", "£7.50": whole pounds lose the pence. */
export function formatPence(pence: number): string {
  const pounds = pence / 100
  return Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`
}

// ---------------------------------------------------------------------------
// Codes
// ---------------------------------------------------------------------------

/** No 0/O, 1/I/L or U: a code read off a printed card must not be ambiguous. */
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ"

/** e.g. GWTH-7KQ2-M9XD-4TPA: 12 random characters, about 59 bits. */
export function generatePassCode(random: (max: number) => number = randomInt): string {
  const group = () =>
    Array.from({ length: 4 }, () => CODE_ALPHABET[random(CODE_ALPHABET.length)]).join("")
  return `GWTH-${group()}-${group()}-${group()}`
}

/**
 * Tidies what somebody typed: case, spaces and missing dashes do not matter.
 * Returns null when it cannot be a pass code at all.
 */
export function normalisePassCode(input: string): string | null {
  const bare = input.toUpperCase().replace(/[^A-Z0-9]/g, "")
  const body = bare.startsWith("GWTH") ? bare.slice(4) : bare
  if (body.length !== 12) return null
  if (![...body].every((c) => CODE_ALPHABET.includes(c))) return null
  return `GWTH-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`
}

// ---------------------------------------------------------------------------
// UK wall-clock helpers (delivery times are chosen in UK time)
// ---------------------------------------------------------------------------

/** Converts a UK wall-clock time (Europe/London, GMT or BST) to the instant. */
export function londonTimeToUtc(
  year: number,
  month1to12: number,
  day: number,
  hour = 0,
  minute = 0
): Date {
  const guess = Date.UTC(year, month1to12 - 1, day, hour, minute)
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(guess))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const asLondon = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"))
  const offset = asLondon - guess
  return new Date(guess - offset)
}

export const GIFT_SEND_HOUR_UK = 7

/** Christmas morning, 7am UK, of the year `now` falls in. */
export function christmasMorning(now: Date): Date {
  return londonTimeToUtc(now.getUTCFullYear(), 12, 25, GIFT_SEND_HOUR_UK)
}

/**
 * Whether to offer "Christmas morning" as the send time: only in November and
 * December, while 25 December 7am UK is still ahead. In January it would mean
 * a Christmas almost a year away.
 */
export function offersChristmasMorning(now: Date): boolean {
  const month = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", month: "numeric" }).format(now)
  )
  return month >= 11 && christmasMorning(now) > now
}

export type DeliveryChoice =
  | { kind: "christmas" }
  | { kind: "now" }
  | { kind: "date"; date: string } // YYYY-MM-DD, sent at 7am UK that day

/**
 * When the gift email goes. Christmas morning is only offered while it is
 * still ahead; a chosen date in the past (or today after 7am) sends now.
 * Never later than the open-by date, so a gift can always be opened.
 */
export function resolveDeliverAt(
  choice: DeliveryChoice,
  now: Date,
  redeemBy: Date
): Date | null {
  let at: Date
  if (choice.kind === "now") {
    at = now
  } else if (choice.kind === "christmas") {
    if (!offersChristmasMorning(now)) return null
    at = christmasMorning(now)
  } else {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(choice.date)
    if (!m) return null
    at = londonTimeToUtc(Number(m[1]), Number(m[2]), Number(m[3]), GIFT_SEND_HOUR_UK)
    if (Number.isNaN(at.getTime())) return null
    if (at < now) at = now
  }
  if (at >= redeemBy) return null
  return at
}

export function redeemByFrom(purchasedAt: Date): Date {
  return addMonths(purchasedAt, REDEEM_WINDOW_MONTHS)
}

/** "25 December 2026", in UK time. */
export function formatUkDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}
