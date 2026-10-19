/**
 * DB-backed tests for prepaid passes (026, bead gwth-launch-v1uj.4).
 *
 * The REAL pass store and access layer against the dev Postgres; SKIPPED
 * unless DATABASE_URL is set:
 *   DATABASE_URL=postgresql://gwth:devpass@localhost:5443/gwth_v2 \
 *     npx vitest run src/lib/billing/pass-store.db.test.ts
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import postgres from "postgres"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

const RECIPIENT = "v1uj_pass_recipient"
const OTHER = "v1uj_pass_other"
const BETA = "v1uj_pass_beta"
const SESSION_PREFIX = "cs_test_v1uj_"

describeDb("prepaid passes (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let store: typeof import("./pass-store")
  let access: typeof import("./access")
  let savedRelease: { month: number; opens_at: Date | null }[] = []

  async function clean() {
    await sql`delete from stripe_payments where id like 'pi_test_v1uj_%'`
    await sql`delete from user_access where user_id in (${RECIPIENT}, ${OTHER}, ${BETA})`
    await sql`delete from prepaid_passes where stripe_checkout_session like ${SESSION_PREFIX + "%"}`
    await sql`delete from "user" where id in (${RECIPIENT}, ${OTHER}, ${BETA})`
  }

  async function setRelease(m2: string | null, m3: string | null) {
    await sql`update course_month_release set opens_at = ${m2} where month = 2`
    await sql`update course_month_release set opens_at = ${m3} where month = 3`
  }

  function newPass(n: number, over: Partial<import("./pass-store").NewPassInput> = {}) {
    return store.createPassFromCheckout({
      product: "course",
      pricePaid: 6900,
      currency: "gbp",
      buyerEmail: " Giver@Example.com ",
      buyerName: "Giver",
      buyerUserId: null,
      isGift: true,
      recipientName: "Sam",
      recipientEmail: "Sam@Example.com",
      message: "Happy Christmas",
      deliverAt: new Date("2026-12-25T07:00:00Z"),
      stripeCheckoutSession: `${SESSION_PREFIX}${n}`,
      stripePaymentIntent: `pi_test_v1uj_${n}`,
      purchasedAt: new Date("2026-12-03T10:00:00Z"),
      ...over,
    })
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    // Other DB suites re-run older migrations (015 re-creates the
    // access_source CHECK without 'prepaid'); 026 is idempotent, so re-apply it.
    await sql.unsafe(readFileSync(join(process.cwd(), "supabase/migrations/026_prepaid_passes.sql"), "utf8"))
    store = await import("./pass-store")
    access = await import("./access")
    savedRelease = await sql`select month, opens_at from course_month_release`
    await clean()
    await sql`insert into "user" (id, name, email) values
      (${RECIPIENT}, 'Recipient', 'v1uj-recipient@example.com'),
      (${OTHER}, 'Other', 'v1uj-other@example.com'),
      (${BETA}, 'Beta', 'v1uj-beta@example.com')`
    await sql`insert into user_access (user_id, access_source, subscription_state, subscription_month)
      values (${BETA}, 'manual_beta', 'month1', 1)`
  })

  beforeEach(async () => {
    await sql`delete from user_access where user_id in (${RECIPIENT}, ${OTHER})`
    await sql`delete from prepaid_passes where stripe_checkout_session like ${SESSION_PREFIX + "%"}`
    await setRelease(null, null)
  })

  afterAll(async () => {
    await clean()
    for (const r of savedRelease) {
      await sql`update course_month_release set opens_at = ${r.opens_at} where month = ${r.month}`
    }
    await sql.end()
  })

  it("creates one pass per checkout session, with tidy emails and a one-year open-by date", async () => {
    const first = await newPass(1)
    const replay = await newPass(1)
    expect(first.created).toBe(true)
    expect(replay.created).toBe(false)
    expect(replay.pass.id).toBe(first.pass.id)
    expect(first.pass.buyerEmail).toBe("giver@example.com")
    expect(first.pass.recipientEmail).toBe("sam@example.com")
    expect(first.pass.months).toBe(3)
    expect(first.pass.redeemBy).toEqual(new Date("2027-12-03T10:00:00Z"))
    expect(first.pass.code).toMatch(/^GWTH-/)
  })

  it("opens a pass: the learner is admitted in Month 1 and the clock starts at opening", async () => {
    const { pass } = await newPass(2)
    const openedAt = new Date()
    const result = await store.openPass(pass.code, RECIPIENT, openedAt)
    expect(result.ok).toBe(true)

    const a = await access.getAccessForUser(RECIPIENT)
    expect(a.source).toBe("prepaid")
    expect(a.subscriptionState).toBe("month1")
    expect(a.prepaidPassId).toBe(pass.id)
    expect(a.validUntil).toBeNull() // Month 2 has no open date yet: held, no end
  })

  it("lets only one account open a pass, and opening it twice is harmless", async () => {
    const { pass } = await newPass(3)
    const [a, b] = await Promise.all([
      store.openPass(pass.code, RECIPIENT),
      store.openPass(pass.code, OTHER),
    ])
    const winners = [a, b].filter((r) => r.ok)
    expect(winners).toHaveLength(1)
    const loser = [a, b].find((r) => !r.ok)
    expect(loser).toMatchObject({ ok: false, reason: "opened_by_someone_else" })

    const winnerId = a.ok ? RECIPIENT : OTHER
    expect(await store.openPass(pass.code, winnerId)).toMatchObject({ ok: true, alreadyYours: true })
  })

  it("refuses a refunded pass, an expired pass, an unknown code and an account that already has access", async () => {
    const { pass: refunded } = await newPass(4)
    await store.markPassRefunded(refunded.id)
    expect(await store.openPass(refunded.code, RECIPIENT)).toMatchObject({ ok: false, reason: "refunded" })

    const { pass: old } = await newPass(5)
    expect(await store.openPass(old.code, RECIPIENT, new Date("2027-12-04T00:00:00Z"))).toMatchObject({
      ok: false,
      reason: "expired",
    })

    expect(await store.openPass("GWTH-2222-3333-4444", RECIPIENT)).toMatchObject({ ok: false, reason: "not_found" })

    const { pass: spare } = await newPass(6)
    expect(await store.openPass(spare.code, BETA)).toMatchObject({ ok: false, reason: "already_has_access" })
  })

  it("takes access away when an opened pass is refunded", async () => {
    const { pass } = await newPass(7)
    await store.openPass(pass.code, RECIPIENT)
    await store.markPassRefunded(pass.id)
    const a = await access.getAccessForUser(RECIPIENT)
    expect(a.source).toBe("registered")
    expect(a.subscriptionMonth).toBe(0)
  })

  it("refreshes the stored end date when an admin sets the Month 2 and Month 3 open dates", async () => {
    const { pass } = await newPass(8)
    const openedAt = new Date("2026-12-25T09:00:00Z")
    await store.openPass(pass.code, RECIPIENT, openedAt)
    await store.setMonthOpensAt(2, new Date("2027-02-10T00:00:00Z"), "test")
    await store.setMonthOpensAt(3, new Date("2027-02-10T00:00:00Z"), "test")
    const rows = await sql`select valid_until from user_access where user_id = ${RECIPIENT}`
    expect(new Date(rows[0]!.valid_until)).toEqual(new Date("2027-04-10T00:00:00Z"))
  })

  it("extends an opened pass by a month and an unopened pass's open-by date by three", async () => {
    const { pass: unopened } = await newPass(9)
    const extended = await store.extendPass(unopened.id)
    expect(extended?.redeemBy).toEqual(new Date("2028-03-03T10:00:00Z"))

    const { pass: opened } = await newPass(10, { product: "month1", pricePaid: 2900 })
    await store.openPass(opened.code, RECIPIENT, new Date("2026-12-25T09:00:00Z"))
    const more = await store.extendPass(opened.id)
    expect(more?.extraMonths).toBe(1)
    const rows = await sql`select valid_until from user_access where user_id = ${RECIPIENT}`
    expect(new Date(rows[0]!.valid_until)).toEqual(new Date("2027-02-25T09:00:00Z"))
  })

  it("lists gifts that are due and records takings once per payment", async () => {
    const { pass } = await newPass(11)
    expect((await store.listDueGifts(new Date("2026-12-24T00:00:00Z"))).some((p) => p.id === pass.id)).toBe(false)
    expect((await store.listDueGifts(new Date("2026-12-25T07:00:00Z"))).some((p) => p.id === pass.id)).toBe(true)
    expect(await store.claimPassEmail(pass.id, "delivered")).toBe(true)
    expect(await store.claimPassEmail(pass.id, "delivered")).toBe(false)
    expect((await store.listDueGifts(new Date("2026-12-26T00:00:00Z"))).some((p) => p.id === pass.id)).toBe(false)

    const before = await store.rollingTwelveMonthTakings()
    const payment = {
      id: "pi_test_v1uj_ledger",
      kind: "pass" as const,
      amount: 6900,
      currency: "gbp",
      email: "giver@example.com",
      userId: null,
      passId: pass.id,
      paidAt: new Date(),
    }
    await store.recordPayment(payment)
    await store.recordPayment(payment)
    expect(await store.rollingTwelveMonthTakings()).toBe(before + 6900)
    await store.recordRefund(payment.id, 6900)
    expect(await store.rollingTwelveMonthTakings()).toBe(before)
  })
})
