import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  calculateCourseMonthFromStart,
  clampCourseMonth,
  normaliseAccessRow,
  stateForCourseMonth,
  type PassForAccess,
  type UserAccessRow,
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

describe("prepaid passes and held payers (026)", () => {
  const ROW: UserAccessRow = {
    user_id: "user_1",
    access_source: "prepaid",
    subscription_state: "month1",
    subscription_month: 1,
    valid_until: null,
    grace_period_ends: null,
    last_payment_at: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    stripe_price_id: null,
    stripe_subscription_status: null,
    notes: null,
    prepaid_pass_id: "pass_1",
  }
  const PASS: PassForAccess = {
    id: "pass_1",
    product: "course",
    redeemed_at: "2026-12-25T09:00:00.000Z",
    extra_months: 0,
    refunded_at: null,
  }
  const OPEN = {
    month2: new Date("2026-11-01T00:00:00Z"),
    month3: new Date("2026-11-01T00:00:00Z"),
  }

  it("computes the month from the opened pass, not the stored snapshot", () => {
    const access = normaliseAccessRow(ROW, new Date("2027-02-26T00:00:00Z"), { pass: PASS, release: OPEN })
    expect(access.subscriptionState).toBe("month3")
    expect(access.subscriptionMonth).toBe(3)
    expect(access.validUntil).toEqual(new Date("2027-03-25T09:00:00Z"))
    expect(access.onHoldFor).toBeNull()
  })

  it("holds the learner in Month 1 while Month 2 is unfinished", () => {
    const access = normaliseAccessRow(ROW, new Date("2027-02-26T00:00:00Z"), { pass: PASS })
    expect(access.subscriptionState).toBe("month1")
    expect(access.onHoldFor).toBe(2)
    expect(access.validUntil).toBeNull()
  })

  it("falls back to registered once the pass has ended or been refunded", () => {
    expect(normaliseAccessRow(ROW, new Date("2027-03-25T09:00:00Z"), { pass: PASS, release: OPEN }).source).toBe("registered")
    expect(
      normaliseAccessRow(ROW, new Date("2027-01-02T00:00:00Z"), {
        pass: { ...PASS, refunded_at: "2027-01-01T00:00:00.000Z" },
        release: OPEN,
      }).subscriptionState
    ).toBe("registered")
  })

  it("admits nothing for a prepaid row whose pass is missing or not opened", () => {
    expect(normaliseAccessRow(ROW, new Date("2027-01-02T00:00:00Z")).source).toBe("registered")
    expect(
      normaliseAccessRow(ROW, new Date("2027-01-02T00:00:00Z"), { pass: { ...PASS, redeemed_at: null } }).source
    ).toBe("registered")
    expect(
      normaliseAccessRow(ROW, new Date("2027-01-02T00:00:00Z"), { pass: { ...PASS, id: "someone_else" } }).source
    ).toBe("registered")
  })

  it("puts a payer in the month they have paid for, and on hold while the next charge is held", () => {
    const payer: UserAccessRow = {
      ...ROW,
      access_source: "stripe_course",
      prepaid_pass_id: null,
      subscription_state: "month2",
      subscription_month: 2,
      course_months_paid: 1,
      stripe_subscription_status: "trialing",
    }
    const held = normaliseAccessRow(payer)
    expect(held.subscriptionState).toBe("month1")
    expect(held.onHoldFor).toBe(2)

    const active = normaliseAccessRow({ ...payer, course_months_paid: 2, stripe_subscription_status: "active" })
    expect(active.subscriptionState).toBe("month2")
    expect(active.onHoldFor).toBeNull()

    const lapsed = normaliseAccessRow({ ...payer, subscription_state: "lapsed", stripe_subscription_status: "past_due" })
    expect(lapsed.subscriptionState).toBe("lapsed")
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
