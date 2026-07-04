/**
 * DB-backed user-isolation tests for the W7 lesson-progress data layer.
 *
 * These are the headline correctness guarantee: with app-level scoping (D2: NO
 * row-level security), user A must never read or write user B's rows. They run
 * against the live dev Postgres and are SKIPPED unless DATABASE_URL is set.
 *
 * Run them with the dev DB:
 *   DATABASE_URL=postgresql://gwth:devpass@localhost:5443/gwth_v2 \
 *     npx vitest run src/lib/data/progress.db.test.ts
 *
 * `getCurrentUser` is mocked so we can switch the "logged-in" user per call;
 * everything else (the queries, the upsert, the completion rule) is the real
 * data layer hitting the real database.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import postgres from "postgres"

const DATABASE_URL = process.env.DATABASE_URL
const describeDb = DATABASE_URL ? describe : describe.skip

// Mock the auth accessor; each test sets which user is "current".
const currentUser = vi.hoisted(() => ({ id: null as string | null }))
vi.mock("@/lib/auth", () => ({
  getCurrentUser: async () =>
    currentUser.id ? { id: currentUser.id } : null,
}))

// Stable test ids (uuids for users, text ids for the course/section/lesson).
const USER_A = "00000000-0000-0000-0000-00000000000a"
const USER_B = "00000000-0000-0000-0000-00000000000b"
// W14: a brand-new account with no lesson_progress rows at all.
const USER_C = "00000000-0000-0000-0000-00000000000c"
const COURSE_ID = "w7_test_course"
const SECTION_ID = "w7_test_section"
const LESSON_ID = "w7_test_lesson_1"
const LESSON_ID_2 = "w7_test_lesson_2"

describeDb("lesson-progress user isolation (live DB)", () => {
  let sql: ReturnType<typeof postgres>
  // Imported lazily AFTER the auth mock + DATABASE_URL are in place.
  let data: typeof import("./progress")

  function setUser(id: string | null) {
    currentUser.id = id
  }

  /** Asserts a query returned at least one row and returns the first. */
  function one<T>(rows: readonly T[]): T {
    expect(rows.length).toBeGreaterThan(0)
    return rows[0] as T
  }

  beforeAll(async () => {
    sql = postgres(DATABASE_URL!)
    data = await import("./progress")

    // Clean any leftovers from a previous run, then seed the FK chain.
    // W11: lesson_progress.user_id now FKs to public."user"(id) (text), not the
    // retired auth.users table — seed real user rows so the FK is satisfied
    // (deleting the user rows in afterAll cascades the progress rows away).
    await sql`delete from lesson_progress where lesson_id in (${LESSON_ID}, ${LESSON_ID_2})`
    await sql`delete from lessons where id in (${LESSON_ID}, ${LESSON_ID_2})`
    await sql`delete from sections where id = ${SECTION_ID}`
    await sql`delete from courses where id = ${COURSE_ID}`
    await sql`delete from "user" where id in (${USER_A}, ${USER_B}, ${USER_C})`

    await sql`insert into "user" (id, name, email) values
      (${USER_A}, 'W7 Test A', 'w7-test-a@example.com'),
      (${USER_B}, 'W7 Test B', 'w7-test-b@example.com'),
      (${USER_C}, 'W14 Fresh C', 'w14-fresh-c@example.com')`
    await sql`insert into courses (id, slug, title) values (${COURSE_ID}, ${COURSE_ID}, 'W7 Test Course')`
    await sql`insert into sections (id, course_id, title, month) values (${SECTION_ID}, ${COURSE_ID}, 'W7 Test Section', 1)`
    await sql`insert into lessons (id, slug, title, section_id, course_id, month)
              values (${LESSON_ID}, ${LESSON_ID}, 'W7 Test Lesson', ${SECTION_ID}, ${COURSE_ID}, 1),
                     (${LESSON_ID_2}, ${LESSON_ID_2}, 'W7 Test Lesson 2', ${SECTION_ID}, ${COURSE_ID}, 1)`
  })

  afterAll(async () => {
    await sql`delete from lesson_progress where lesson_id in (${LESSON_ID}, ${LESSON_ID_2})`
    await sql`delete from lessons where id in (${LESSON_ID}, ${LESSON_ID_2})`
    await sql`delete from sections where id = ${SECTION_ID}`
    await sql`delete from courses where id = ${COURSE_ID}`
    await sql`delete from "user" where id in (${USER_A}, ${USER_B}, ${USER_C})`
    await sql.end({ timeout: 5 })
  })

  it("writes are scoped to the authenticated user", async () => {
    setUser(USER_A)
    await data.updateLessonProgress(LESSON_ID, {
      introVideoProgress: 0.9,
      bestQuizScore: 80,
    })

    setUser(USER_B)
    await data.updateLessonProgress(LESSON_ID, {
      introVideoProgress: 0.1,
      bestQuizScore: 10,
    })

    // Each user's row carries only their own values.
    const rowA = one(
      await sql`select intro_video_progress, best_quiz_score from lesson_progress where user_id = ${USER_A} and lesson_id = ${LESSON_ID}`
    )
    const rowB = one(
      await sql`select intro_video_progress, best_quiz_score from lesson_progress where user_id = ${USER_B} and lesson_id = ${LESSON_ID}`
    )

    expect(Number(rowA.intro_video_progress)).toBeCloseTo(0.9)
    expect(Number(rowA.best_quiz_score)).toBe(80)
    expect(Number(rowB.intro_video_progress)).toBeCloseTo(0.1)
    expect(Number(rowB.best_quiz_score)).toBe(10)
  })

  it("user A cannot read user B's row via getLessonProgress", async () => {
    setUser(USER_A)
    const a = await data.getLessonProgress(LESSON_ID)
    expect(a?.bestQuizScore).toBe(80) // A's own value, never B's 10

    setUser(USER_B)
    const b = await data.getLessonProgress(LESSON_ID)
    expect(b?.bestQuizScore).toBe(10) // B's own value, never A's 80
  })

  it("getAllLessonProgress returns only the current user's rows", async () => {
    // Give B a second lesson so the two users have different row counts.
    setUser(USER_B)
    await data.updateLessonProgress(LESSON_ID_2, { introVideoProgress: 0.5 })

    setUser(USER_A)
    const allA = await data.getAllLessonProgress()
    expect(allA).toHaveLength(1)
    expect(allA.every((r) => r.lessonId === LESSON_ID)).toBe(true)

    setUser(USER_B)
    const allB = await data.getAllLessonProgress()
    const idsB = allB.map((r) => r.lessonId).sort()
    expect(idsB).toEqual([LESSON_ID, LESSON_ID_2].sort())
  })

  it("an update by A does not modify B's row (no cross-user upsert)", async () => {
    setUser(USER_A)
    await data.updateLessonProgress(LESSON_ID, { timeSpent: 999 })

    // B's row is untouched.
    const rowB = one(
      await sql`select time_spent from lesson_progress where user_id = ${USER_B} and lesson_id = ${LESSON_ID}`
    )
    expect(Number(rowB.time_spent)).not.toBe(999)
  })

  it("applies the completion rule on write (80% + pass = complete)", async () => {
    setUser(USER_A)
    // 80% video + passing quiz → complete, completedAt stamped.
    const complete = await data.updateLessonProgress(LESSON_ID, {
      introVideoProgress: 0.8,
      bestQuizScore: 67,
    })
    expect(complete.isCompleted).toBe(true)
    expect(complete.completedAt).toBeInstanceOf(Date)

    // Drop the quiz below pass → reverts to incomplete, completedAt cleared.
    const reverted = await data.updateLessonProgress(LESSON_ID, {
      bestQuizScore: 50,
    })
    expect(reverted.isCompleted).toBe(false)
    expect(reverted.completedAt).toBeNull()
  })

  it("unauthenticated calls are a safe no-op (no write, no throw)", async () => {
    setUser(null)
    const before = one(
      await sql`select count(*)::int as n from lesson_progress where lesson_id in (${LESSON_ID}, ${LESSON_ID_2})`
    )
    const result = await data.updateLessonProgress(LESSON_ID, {
      introVideoProgress: 1,
    })
    const after = one(
      await sql`select count(*)::int as n from lesson_progress where lesson_id in (${LESSON_ID}, ${LESSON_ID_2})`
    )

    expect(result).toBeTruthy() // returns the optimistic shape
    expect(after.n).toBe(before.n) // but persisted nothing
    expect(await data.getLessonProgress(LESSON_ID)).toBeNull()
    expect(await data.getAllLessonProgress()).toEqual([])
  })

  // ── W14: fixture data must never reach a real session ─────────────────────

  it("W14: a brand-new account derives honest zeros, never fixtures", async () => {
    setUser(USER_C)

    const streak = await data.getStreak()
    expect(streak.currentStreak).toBe(0) // never the fixture 5
    expect(streak.longestStreak).toBe(0) // never the fixture 14
    expect(streak.weeklyActivity.every((day) => day === false)).toBe(true)

    expect(await data.getAllCourseProgress()).toEqual([]) // never 12/24
    expect(await data.getAllLabProgress()).toEqual([]) // never lab_001/002
    expect(await data.getLabProgress("lab_001")).toBeNull()
    expect((await data.getDynamicScore()).overallScore).toBe(0)
  })

  it("W14: a completed lesson surfaces as real derived course progress", async () => {
    setUser(USER_A)
    // Complete the seeded lesson (80%+ video was set earlier; pass the quiz).
    await data.updateLessonProgress(LESSON_ID, {
      introVideoProgress: 1,
      bestQuizScore: 100,
    })

    const all = await data.getAllCourseProgress()
    const courseProgress = all.find((p) => p.courseId === COURSE_ID)
    expect(courseProgress).toBeTruthy()
    expect(courseProgress!.totalLessons).toBe(2)
    expect(courseProgress!.completedLessons).toBe(1)
    expect(courseProgress!.progress).toBeCloseTo(0.5)

    // Same via the single-course accessor, addressed by id (slug also works).
    const single = await data.getCourseProgress(COURSE_ID)
    expect(single?.completedLessons).toBe(1)

    // Real activity today: the derived streak reflects it.
    const streak = await data.getStreak()
    expect(streak.currentStreak).toBeGreaterThanOrEqual(1)
    expect(streak.longestStreak).toBeGreaterThanOrEqual(streak.currentStreak)
  })
})
