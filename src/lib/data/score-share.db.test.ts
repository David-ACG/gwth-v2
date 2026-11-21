/**
 * Live-DB tests for the learner's public score page (bead gwth-launch-phjb):
 * the share code is minted on first share and kept, the learner's opt-in
 * decides whether the code opens anything, and the card shows the live
 * score, Falling after the hold, and when the score last changed.
 * SKIPPED unless DATABASE_URL is set:
 *
 *   DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
 *     npx vitest run src/lib/data/score-share.db.test.ts
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

vi.mock("@/lib/auth", () => ({ getCurrentUser: async () => null }))

const USER_A = "score-share-test-a"
const USER_B = "score-share-test-b"
const DAY = 24 * 60 * 60 * 1000
const PASSED = new Date(Date.now() - 3 * DAY)

describeDb("score share code and public score card (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  let shares: typeof import("./score-share")
  let lessonId: string

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    shares = await import("./score-share")
    const editions = await import("./editions")
    const ids = await editions.getMandatoryLessonIdsForMode({ kind: "user", userId: USER_A })
    lessonId = [...ids][0]!
    await sql`delete from "user" where id in (${USER_A}, ${USER_B})`
    await sql`insert into "user" (id, name, email) values
      (${USER_A}, 'Share Test A', 'score-share-a@example.com'),
      (${USER_B}, 'Share Test B', 'score-share-b@example.com')`
  })

  afterAll(async () => {
    await sql`delete from "user" where id in (${USER_A}, ${USER_B})`
    await sql.end({ timeout: 5 })
  })

  it("has no code before the learner shares", async () => {
    expect(await shares.getScoreShare(USER_A)).toBeNull()
  })

  it("mints a code on first share and keeps it when switched off and on", async () => {
    const first = await shares.setScoreSharePublic(USER_A, true)
    expect(first.code).toMatch(/^[a-z2-9]{10}$/)
    expect(first.isPublic).toBe(true)
    const off = await shares.setScoreSharePublic(USER_A, false)
    expect(off).toMatchObject({ code: first.code, isPublic: false })
    const on = await shares.setScoreSharePublic(USER_A, true)
    expect(on.code).toBe(first.code)
    expect(on.createdAt.getTime()).toBe(first.createdAt.getTime())
  })

  it("opens nothing for a private or unknown code", async () => {
    const share = await shares.setScoreSharePublic(USER_A, false)
    expect(await shares.getPublicScoreCard(share.code)).toBeNull()
    expect(await shares.getPublicScoreCard("zzzzzzzzzz")).toBeNull()
    expect(await shares.getPublicScoreCard("not a code")).toBeNull()
  })

  it("shows the learner's live score, Up to date, and when it last changed", async () => {
    const passed = PASSED
    await sql`insert into lesson_progress (user_id, lesson_id, is_completed, progress, best_quiz_score, quiz_passed, completed_at)
      values (${USER_A}, ${lessonId}, true, 1, 100, true, ${passed.toISOString()})`
    await sql`insert into capstone_submissions (user_id, capstone_id, best_total, best_band)
      values (${USER_A}, 'familybot', 75, 'good')`
    const share = await shares.setScoreSharePublic(USER_A, true)
    const card = await shares.getPublicScoreCard(share.code)
    expect(card).not.toBeNull()
    expect(card!.name).toBe("Share Test A")
    expect(card!.status).toBe("ok")
    expect(card!.shown).toBeGreaterThanOrEqual(13) // 75% of 16.7 for FamilyBot, plus a lesson
    expect(card!.earned).toBe(card!.shown)
    expect(card!.grades).toEqual(["Good", "Not yet", "Not yet"])
    expect(card!.lastPassedAt?.getTime()).toBe(passed.getTime())
    // The capstone mark was applied just now, after the lesson.
    expect(card!.lastChangedAt!.getTime()).toBeGreaterThan(passed.getTime())
  })

  it("says Falling once the 4-week hold is over, dated at the latest fall step", async () => {
    const share = await shares.getScoreShare(USER_A)
    const passed = PASSED
    const later = new Date(passed.getTime() + 50 * DAY)
    const card = await shares.getPublicScoreCard(share!.code, later)
    expect(card!.status).toBe("fall")
    expect(card!.shown).toBeLessThan(card!.earned)
    expect(card!.lastChangedAt!.getTime()).toBe(passed.getTime() + 49 * DAY)
  })

  it("keeps each learner's code to themselves", async () => {
    const a = await shares.getScoreShare(USER_A)
    const b = await shares.setScoreSharePublic(USER_B, true)
    expect(b.code).not.toBe(a!.code)
    const card = await shares.getPublicScoreCard(b.code)
    expect(card!.name).toBe("Share Test B")
    expect(card!.shown).toBe(0)
    expect(card!.lastChangedAt).toBeNull()
  })
})
