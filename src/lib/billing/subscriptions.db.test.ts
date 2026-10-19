/**
 * DB-backed tests for monthly subscription access (bead gwth-launch-v1uj.9).
 * upsertSubscriptionAccess takes a Stripe subscription object, so no Stripe
 * call is made. SKIPPED unless DATABASE_URL is set:
 *   DATABASE_URL=postgresql://gwth:devpass@localhost:5443/gwth_v2 \
 *     npx vitest run src/lib/billing/subscriptions.db.test.ts
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import postgres from "postgres"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import type Stripe from "stripe"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip
const PAYER = "v1uj_sub_payer"

function sub(over: {
  status: Stripe.Subscription.Status
  price?: string
  metadata?: Record<string, string>
}): Stripe.Subscription {
  return {
    id: "sub_test_v1uj",
    customer: "cus_test_v1uj",
    status: over.status,
    metadata: { userId: PAYER, ...(over.metadata ?? {}) },
    items: {
      data: [{ id: "si_1", price: { id: over.price ?? "price_course_test" }, current_period_end: 1800000000 }],
    },
  } as unknown as Stripe.Subscription
}

describeDb("subscription access (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let subs: typeof import("./subscriptions")
  let access: typeof import("./access")

  beforeAll(async () => {
    process.env.STRIPE_COURSE_PRICE_ID = "price_course_test"
    process.env.STRIPE_STAY_CURRENT_PRICE_ID = "price_stay_test"
    sql = postgres(DATABASE_URL!)
    // Other DB suites re-run older migrations (015 re-creates the
    // access_source CHECK without 'prepaid'); 026 is idempotent, so re-apply it.
    await sql.unsafe(readFileSync(join(process.cwd(), "supabase/migrations/026_prepaid_passes.sql"), "utf8"))
    subs = await import("./subscriptions")
    access = await import("./access")
    await sql`delete from "user" where id = ${PAYER}`
    await sql`insert into "user" (id, name, email) values (${PAYER}, 'Payer', 'v1uj-payer@example.com')`
  })

  beforeEach(async () => {
    await sql`delete from user_access where user_id = ${PAYER}`
  })

  afterAll(async () => {
    await sql`delete from "user" where id = ${PAYER}`
    await sql.end()
  })

  it("gives nothing for a subscription whose first payment has not gone through", async () => {
    await subs.upsertSubscriptionAccess(sub({ status: "incomplete" }))
    const a = await access.getAccessForUser(PAYER)
    expect(a.source).toBe("registered")
    expect(a.gracePeriodEnds).toBeNull()
  })

  it("puts an active payer in the month they have paid for", async () => {
    await subs.upsertSubscriptionAccess(sub({ status: "active" }), { courseMonthsPaid: 2 })
    const a = await access.getAccessForUser(PAYER)
    expect(a.source).toBe("stripe_course")
    expect(a.subscriptionState).toBe("month2")
  })

  it("keeps a failed renewal in a grace period, and ends a cancelled one", async () => {
    await subs.upsertSubscriptionAccess(sub({ status: "active" }), { courseMonthsPaid: 1 })
    await subs.upsertSubscriptionAccess(sub({ status: "past_due" }))
    let a = await access.getAccessForUser(PAYER)
    expect(a.subscriptionState).toBe("lapsed")
    expect(a.gracePeriodEnds).not.toBeNull()

    await subs.upsertSubscriptionAccess(sub({ status: "canceled" }))
    a = await access.getAccessForUser(PAYER)
    expect(a.subscriptionState).toBe("lapsed")
    expect(a.gracePeriodEnds).toBeNull()
  })

  it("stays in Month 3 until the course month ends after moving to the stay-current price", async () => {
    const future = String(Math.floor(Date.now() / 1000) + 10 * 24 * 3600)
    await subs.upsertSubscriptionAccess(
      sub({ status: "active", price: "price_stay_test", metadata: { gwth_course_ends: future } }),
      { courseMonthsPaid: 3 }
    )
    let a = await access.getAccessForUser(PAYER)
    expect(a.subscriptionState).toBe("month3")

    const past = String(Math.floor(Date.now() / 1000) - 60)
    await subs.upsertSubscriptionAccess(
      sub({ status: "active", price: "price_stay_test", metadata: { gwth_course_ends: past } })
    )
    a = await access.getAccessForUser(PAYER)
    expect(a.source).toBe("stripe_ongoing")
    expect(a.subscriptionState).toBe("ongoing")
  })

  it("never lets a lapsed subscription take away an opened pass", async () => {
    await sql`insert into user_access (user_id, access_source, subscription_state, subscription_month)
      values (${PAYER}, 'prepaid', 'month1', 1)`
    await subs.upsertSubscriptionAccess(sub({ status: "canceled" }))
    const rows = await sql`select access_source from user_access where user_id = ${PAYER}`
    expect(rows[0]!.access_source).toBe("prepaid")
  })

  it("shows a payer whose next charge is held as waiting for the next month", async () => {
    await subs.upsertSubscriptionAccess(sub({ status: "trialing" }), { courseMonthsPaid: 1 })
    const a = await access.getAccessForUser(PAYER)
    expect(a.subscriptionState).toBe("month1")
    expect(a.onHoldFor).toBe(2)
  })
})
