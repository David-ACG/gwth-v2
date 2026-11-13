// @vitest-environment node
/**
 * Content protection against a real database (bead gwth-launch-735c): lesson
 * views recorded, the copier flagged, the next month held with the reason,
 * David clearing or suspending, and the 75% completion gate.
 * SKIPPED unless DATABASE_URL is set. Run:
 *   DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
 *     npx vitest run src/lib/protection/store.db.test.ts
 * Needs migration 033 and the Month 1 lessons.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip
const COPIER = "cp735c_copier"
const PAYER = "cp735c_payer"
const META = { ip: "203.0.113.9", country: "GB", userAgent: "Mozilla/5.0 Chrome/131", prefetch: false }

describeDb("content protection (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let store: typeof import("./store")
  let access: typeof import("@/lib/billing/access")
  let month1: string[] = []

  async function clean() {
    await sql`delete from "user" where id in (${COPIER}, ${PAYER})`
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    store = await import("./store")
    access = await import("@/lib/billing/access")
    await clean()
    month1 = (await sql`select id from lessons where month = 1 and not is_optional order by "order"`).map((r) => r.id as string)
    await sql`insert into "user" (id, name, email) values
      (${COPIER}, 'Copy Cat', 'cp735c-copier@example.com'),
      (${PAYER}, 'Pay Er', 'cp735c-payer@example.com')`
    await sql`insert into user_access (user_id, access_source, subscription_state, subscription_month)
      values (${COPIER}, 'manual_beta', 'month1', 1)`
    await sql`insert into user_access (user_id, access_source, subscription_state, subscription_month, course_months_paid, stripe_subscription_status)
      values (${PAYER}, 'stripe_course', 'month2', 2, 2, 'active')`
  })

  afterAll(async () => {
    await clean()
    await sql.end()
  })

  it("records each lesson page served, first views only once", async () => {
    const base = new Date("2026-11-12T21:00:00Z")
    const lesson = month1[0] as string
    for (const offset of [0, 60_000]) {
      await store.recordLessonAccess({
        userId: PAYER, email: "cp735c-payer@example.com", lessonId: lesson, month: 1,
        kind: "lesson_view", expectedSec: 1200, mediaLinks: 3, currentMonth: 2, meta: META,
        now: new Date(base.getTime() + offset),
      })
    }
    const rows = await sql`select first_view, media_links, ip, country from content_access_events where user_id = ${PAYER} order by created_at`
    expect(rows.map((r) => r.first_view)).toEqual([true, false])
    expect(rows[0]).toMatchObject({ media_links: 3, ip: "203.0.113.9", country: "GB" })
  })

  it("ignores Next.js prefetches", async () => {
    await store.recordLessonAccess({
      userId: PAYER, email: "x", lessonId: month1[1] as string, month: 1, kind: "lesson_view",
      currentMonth: 2, meta: { ...META, prefetch: true },
    })
    const rows = await sql`select count(*)::int as n from content_access_events where user_id = ${PAYER} and lesson_id = ${month1[1] as string}`
    expect(rows[0]?.n).toBe(0)
  })

  it("flags the copier and holds their next month until David looks", async () => {
    const start = new Date(Date.now() - 12 * 60_000)
    for (let i = 0; i < 23; i++) {
      await store.recordLessonAccess({
        userId: COPIER, email: "cp735c-copier@example.com", lessonId: month1[i] as string, month: 1,
        kind: "lesson_view", expectedSec: 1200, mediaLinks: 2, currentMonth: 1, meta: META,
        now: new Date(start.getTime() + i * 30_000),
      })
    }
    const flags = await sql`select status, held_month, reasons from content_access_flags where user_id = ${COPIER}`
    expect(flags).toHaveLength(1)
    expect(flags[0]).toMatchObject({ status: "open", held_month: 2 })
    expect((flags[0]?.reasons as string[]).join(" ")).toMatch(/new lessons in 10 minutes/)

    // Month 2 arrives for them: it stays closed, with the review reason.
    await sql`update user_access set subscription_month = 2, subscription_state = 'month2' where user_id = ${COPIER}`
    let a = await access.getAccessForUser(COPIER)
    expect(a.subscriptionMonth).toBe(1)
    expect(a.onHoldFor).toBe(2)
    expect(a.holdReason).toBe("review")

    const listed = await store.listFlags()
    const card = listed.find((f) => f.userId === COPIER)
    expect(card?.timeline.length).toBe(23)

    // Looks fine: Month 2 opens.
    expect(await store.resolveFlag(card!.id, "clear", "admin@example.com")).toBe(true)
    a = await access.getAccessForUser(COPIER)
    expect(a.subscriptionMonth).toBe(2)
    expect(a.onHoldFor).toBeNull()
  })

  it("a suspended account has no course access until reinstated", async () => {
    await sql`insert into content_access_flags (user_id, status, held_month) values (${COPIER}, 'suspended', null)`
    expect((await access.getAccessForUser(COPIER)).subscriptionMonth).toBe(0)
    const rows = await sql`select id from content_access_flags where user_id = ${COPIER} and status = 'suspended'`
    expect(await store.resolveFlag(Number(rows[0]?.id), "reinstate", "admin@example.com")).toBe(true)
    expect((await access.getAccessForUser(COPIER)).subscriptionMonth).toBe(2)
  })

  it("holds a payer on Month 1 until 75% of Month 1 is complete", async () => {
    let a = await access.getAccessForUser(PAYER)
    expect(a.subscriptionMonth).toBe(1)
    expect(a.onHoldFor).toBe(2)
    expect(a.holdReason).toBe("progress")
    const need = Math.ceil(0.75 * month1.length)
    expect(a.nextGate).toMatchObject({ month: 2, done: 0, need, total: month1.length, percent: 75 })

    for (const id of month1.slice(0, need)) {
      await sql`insert into lesson_progress (user_id, lesson_id, is_completed, completed_at)
        values (${PAYER}, ${id}, true, now()) on conflict (user_id, lesson_id) do update set is_completed = true, completed_at = now()`
    }
    a = await access.getAccessForUser(PAYER)
    expect(a.subscriptionMonth).toBe(2)
    expect(a.onHoldFor).toBeNull()
  })
})
