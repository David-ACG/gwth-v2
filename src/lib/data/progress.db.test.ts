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
// N2 QA defects 5+6: dedicated user for the atomic quiz-write tests.
const USER_Q = "00000000-0000-0000-0000-00000000000d"
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
    await sql`delete from "user" where id in (${USER_A}, ${USER_B}, ${USER_C}, ${USER_Q})`

    await sql`insert into "user" (id, name, email) values
      (${USER_A}, 'W7 Test A', 'w7-test-a@example.com'),
      (${USER_B}, 'W7 Test B', 'w7-test-b@example.com'),
      (${USER_C}, 'W14 Fresh C', 'w14-fresh-c@example.com'),
      (${USER_Q}, 'N2 Quiz Q', 'n2-quiz-q@example.com')`
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
    await sql`delete from "user" where id in (${USER_A}, ${USER_B}, ${USER_C}, ${USER_Q})`
    await sql.end({ timeout: 5 })
  })

  it("writes are scoped to the authenticated user", async () => {
    // The generic update path accepts NO payload any more (QA round-3
    // defect 4), so scoping is proven through the credited quiz writer -
    // the write path real learners use. Failing scores keep the quiz open.
    const opts = { passMark: 67, maxAttempts: 10 }
    setUser(USER_A)
    await data.recordQuizSubmission(LESSON_ID, 30, opts)

    setUser(USER_B)
    await data.recordQuizSubmission(LESSON_ID, 10, opts)

    // Each user's row carries only their own values.
    const rowA = one(
      await sql`select best_quiz_score from lesson_progress where user_id = ${USER_A} and lesson_id = ${LESSON_ID}`
    )
    const rowB = one(
      await sql`select best_quiz_score from lesson_progress where user_id = ${USER_B} and lesson_id = ${LESSON_ID}`
    )

    expect(Number(rowA.best_quiz_score)).toBe(30)
    expect(Number(rowB.best_quiz_score)).toBe(10)
  })

  it("user A cannot read user B's row via getLessonProgress", async () => {
    setUser(USER_A)
    const a = await data.getLessonProgress(LESSON_ID)
    expect(a?.bestQuizScore).toBe(30) // A's own value, never B's 10

    setUser(USER_B)
    const b = await data.getLessonProgress(LESSON_ID)
    expect(b?.bestQuizScore).toBe(10) // B's own value, never A's 30
  })

  it("getAllLessonProgress returns only the current user's rows", async () => {
    // Give B a second lesson so the two users have different row counts
    // (the payload-free recompute ping still creates the row).
    setUser(USER_B)
    await data.updateLessonProgress(LESSON_ID_2)

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
    await data.recordQuizSubmission(LESSON_ID, 20, {
      passMark: 67,
      maxAttempts: 10,
    })

    // B's row is untouched.
    const rowB = one(
      await sql`select quiz_score, quiz_attempts from lesson_progress where user_id = ${USER_B} and lesson_id = ${LESSON_ID}`
    )
    expect(Number(rowB.quiz_score)).toBe(10)
    expect(Number(rowB.quiz_attempts)).toBe(1)
  })

  it("applies the completion rule on write (80% + pass = complete)", async () => {
    setUser(USER_A)
    // Seed the video gate directly in SQL (the credited path is proven in
    // its own tests below), then pass the quiz: the upsert derives
    // completion in the same statement.
    await sql`update lesson_progress set intro_video_progress = 0.8
              where user_id = ${USER_A} and lesson_id = ${LESSON_ID}`
    const complete = await data.recordQuizSubmission(LESSON_ID, 67, {
      passMark: 67,
      maxAttempts: 10,
    })
    expect(complete.outcome).toBe("recorded")
    expect(complete.progress.isCompleted).toBe(true)
    expect(complete.progress.completedAt).toBeInstanceOf(Date)

    // Drop the video below the gate → the payload-free recompute ping
    // re-derives incomplete and clears completedAt.
    await sql`update lesson_progress set intro_video_progress = 0.5
              where user_id = ${USER_A} and lesson_id = ${LESSON_ID}`
    const reverted = await data.updateLessonProgress(LESSON_ID)
    expect(reverted.isCompleted).toBe(false)
    expect(reverted.completedAt).toBeNull()
  })

  it("unauthenticated calls are a safe no-op (no write, no throw)", async () => {
    setUser(null)
    const before = one(
      await sql`select count(*)::int as n from lesson_progress where lesson_id in (${LESSON_ID}, ${LESSON_ID_2})`
    )
    const result = await data.updateLessonProgress(LESSON_ID)
    const videoResult = await data.recordIntroVideoProgress(LESSON_ID, 1)
    const after = one(
      await sql`select count(*)::int as n from lesson_progress where lesson_id in (${LESSON_ID}, ${LESSON_ID_2})`
    )

    expect(result).toBeTruthy() // returns the optimistic shape
    expect(videoResult.introVideoProgress).toBeLessThanOrEqual(0.15)
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
    // Re-clear the video gate (the completion test above lowered it); the
    // quiz is already passed, so the payload-free recompute ping re-derives
    // the completed state.
    await sql`update lesson_progress set intro_video_progress = 1
              where user_id = ${USER_A} and lesson_id = ${LESSON_ID}`
    await data.updateLessonProgress(LESSON_ID)

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

  // ── N2 QA defects 5 + 6: atomic quiz writes against the real database ──────

  it("QA-6: two CONCURRENT submissions lose no attempt and keep the best score", async () => {
    setUser(USER_Q)
    const opts = { passMark: 67, maxAttempts: 3 }
    // Self-contained (QA round-2 style note 4): start from no row.
    await sql`delete from lesson_progress where user_id = ${USER_Q} and lesson_id = ${LESSON_ID}`

    // Genuinely concurrent: both start with no row / the same prior row.
    // Before the atomic upsert, both read attempts=0, both wrote attempts=1
    // and the slower 30 could overwrite the 50. Failing scores on purpose:
    // a pass now CLOSES the quiz, which would make the outcome depend on
    // arrival order.
    const [a, b] = await Promise.all([
      data.recordQuizSubmission(LESSON_ID, 50, opts),
      data.recordQuizSubmission(LESSON_ID, 30, opts),
    ])
    expect(a.outcome).toBe("recorded")
    expect(b.outcome).toBe("recorded")

    const row = one(
      await sql`select quiz_attempts, best_quiz_score, quiz_passed from lesson_progress
                where user_id = ${USER_Q} and lesson_id = ${LESSON_ID}`
    )
    expect(Number(row.quiz_attempts)).toBe(2) // no lost increment
    expect(Number(row.best_quiz_score)).toBe(50) // low score never overwrites
    expect(Boolean(row.quiz_passed)).toBe(false)
  })

  it("QA-5: the cap refuses the write past MAX attempts and changes nothing", async () => {
    setUser(USER_Q)
    const opts = { passMark: 67, maxAttempts: 3 }
    // Self-contained (QA round-2 style note 4): burn all three attempts
    // inside this test rather than inheriting state from the previous one.
    // Failing scores keep the quiz open until the cap does the closing.
    await sql`delete from lesson_progress where user_id = ${USER_Q} and lesson_id = ${LESSON_ID}`
    await data.recordQuizSubmission(LESSON_ID, 50, opts)
    await data.recordQuizSubmission(LESSON_ID, 30, opts)
    const third = await data.recordQuizSubmission(LESSON_ID, 40, opts)
    expect(third.outcome).toBe("recorded")
    expect(third.progress.quizAttempts).toBe(3)
    expect(third.progress.bestQuizScore).toBe(50) // GREATEST held

    // Attempt 4: refused ATOMICALLY (setWhere) - nothing written.
    const fourth = await data.recordQuizSubmission(LESSON_ID, 100, opts)
    expect(fourth.outcome).toBe("attempt-limit")
    const row = one(
      await sql`select quiz_attempts, best_quiz_score, quiz_score from lesson_progress
                where user_id = ${USER_Q} and lesson_id = ${LESSON_ID}`
    )
    expect(Number(row.quiz_attempts)).toBe(3)
    expect(Number(row.best_quiz_score)).toBe(50)
    expect(Number(row.quiz_score)).toBe(40) // the refused 100 never landed
  })

  it("QA round-3 defect 8: a PASS closes the quiz atomically", async () => {
    setUser(USER_Q)
    const opts = { passMark: 67, maxAttempts: 3 }
    await sql`delete from lesson_progress where user_id = ${USER_Q} and lesson_id = ${LESSON_ID}`

    const passRun = await data.recordQuizSubmission(LESSON_ID, 67, opts)
    expect(passRun.outcome).toBe("recorded")
    expect(passRun.progress.quizPassed).toBe(true)

    // The post-pass reveal can never be fed back in: refused in setWhere.
    const after = await data.recordQuizSubmission(LESSON_ID, 100, opts)
    expect(after.outcome).toBe("attempt-limit")
    const row = one(
      await sql`select best_quiz_score, quiz_attempts from lesson_progress
                where user_id = ${USER_Q} and lesson_id = ${LESSON_ID}`
    )
    expect(Number(row.best_quiz_score)).toBe(67) // never inflated to 100
    expect(Number(row.quiz_attempts)).toBe(1)
  })

  it("QA-6: the atomic write derives completion from the stored video fraction", async () => {
    setUser(USER_Q)
    const opts = { passMark: 67, maxAttempts: 10 }
    // Self-contained (QA round-2 style note 4).
    await sql`delete from lesson_progress where user_id = ${USER_Q} and lesson_id = ${LESSON_ID_2}`

    // Fresh lesson row on LESSON_ID_2: fail the quiz with no video watched.
    const graded = await data.recordQuizSubmission(LESSON_ID_2, 30, opts)
    expect(graded.outcome).toBe("recorded")
    expect(graded.progress.quizPassed).toBe(false)
    expect(graded.progress.isCompleted).toBe(false) // nothing cleared

    // Clear the video gate in SQL, then PASS: the quiz upsert derives
    // completion from the stored video fraction in the same statement.
    await sql`update lesson_progress set intro_video_progress = 0.9
              where user_id = ${USER_Q} and lesson_id = ${LESSON_ID_2}`
    const again = await data.recordQuizSubmission(LESSON_ID_2, 100, opts)
    expect(again.outcome).toBe("recorded")
    expect(again.progress.bestQuizScore).toBe(100)
    expect(again.progress.isCompleted).toBe(true)
    expect(again.progress.completedAt).toBeInstanceOf(Date)
  })

  it("QA-3: video watch credit is banked wall-clock time, atomically in SQL", async () => {
    setUser(USER_Q)
    await sql`delete from lesson_progress where user_id = ${USER_Q} and lesson_id = ${LESSON_ID}`

    // A forged full-watch first report earns only the bootstrap.
    const first = await data.recordIntroVideoProgress(LESSON_ID, 1)
    expect(first.introVideoProgress).toBeCloseTo(0.15, 5)

    // Backdate ALL the user's writes by 45s (the credit clock is USER-wide,
    // round-3 defect 3): the next report may bank ~45s, which at the
    // 2x/180s calibration allows ~0.5 of the video. Bounds are loose so a
    // slow runner cannot flake the test (round-3 style note 5).
    await sql`update lesson_progress set last_accessed_at = now() - interval '45 seconds'
              where user_id = ${USER_Q}`
    const second = await data.recordIntroVideoProgress(LESSON_ID, 1)
    expect(second.timeSpent ?? 0).toBeGreaterThanOrEqual(45)
    expect(second.timeSpent ?? 0).toBeLessThanOrEqual(60) // the per-report cap
    expect(second.introVideoProgress).toBeGreaterThanOrEqual(0.5 - 1e-6)
    expect(second.introVideoProgress).toBeLessThanOrEqual(60 * 2 / 180)

    // An immediate re-report banks ~nothing more: the fraction never
    // regresses (GREATEST) and cannot exceed what the cap could add.
    const third = await data.recordIntroVideoProgress(LESSON_ID, 1)
    expect(third.introVideoProgress).toBeGreaterThanOrEqual(
      second.introVideoProgress ?? 0
    )
    expect(third.introVideoProgress).toBeLessThan(0.72)
  })

  it("QA round-3 defect 3: the same wall-clock window cannot bank on TWO lessons", async () => {
    setUser(USER_Q)
    await sql`delete from lesson_progress where user_id = ${USER_Q} and lesson_id in (${LESSON_ID}, ${LESSON_ID_2})`

    // Bootstrap both lessons, then open one 45-second window for the USER.
    await data.recordIntroVideoProgress(LESSON_ID, 1)
    await data.recordIntroVideoProgress(LESSON_ID_2, 1)
    await sql`update lesson_progress set last_accessed_at = now() - interval '45 seconds'
              where user_id = ${USER_Q}`

    // Both lessons claim a full watch at once. Serialised by the per-user
    // advisory lock, only ONE of them may bank the window; the other sees
    // the freshly stamped user-wide clock and banks ~nothing.
    const [a, b] = await Promise.all([
      data.recordIntroVideoProgress(LESSON_ID, 1),
      data.recordIntroVideoProgress(LESSON_ID_2, 1),
    ])
    const fractions = [a.introVideoProgress ?? 0, b.introVideoProgress ?? 0]
      .sort((x, y) => x - y)
    // The loser stays at (or near) the bootstrap; the winner banks the
    // window. Their SUM cannot exceed bootstrap + one window's credit.
    expect(fractions[0]!).toBeLessThan(0.2)
    expect(fractions[0]! + fractions[1]!).toBeLessThan(
      0.15 + (60 * 2) / 180 + 0.05
    )
  })

  it("QA round-3 defect 5: a legacy row's junk time_spent grants no credit", async () => {
    setUser(USER_Q)
    await sql`delete from lesson_progress where user_id = ${USER_Q} and lesson_id = ${LESSON_ID}`
    // A legacy row: junk time_spent, no credited watch fraction.
    await sql`insert into lesson_progress (user_id, lesson_id, time_spent, intro_video_progress, last_accessed_at)
              values (${USER_Q}, ${LESSON_ID}, 3000, 0, now())`

    const result = await data.recordIntroVideoProgress(LESSON_ID, 1)
    // 3000 junk seconds grant nothing: bootstrap only, and the junk bank is
    // discarded rather than carried forward.
    expect(result.introVideoProgress).toBeLessThanOrEqual(0.16)
    expect(result.timeSpent ?? 0).toBeLessThanOrEqual(60)
  })
})
