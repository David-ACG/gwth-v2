/**
 * Data access functions for user progress tracking (W7 — persistence layer).
 *
 * Lesson progress is persisted to Postgres (the `lesson_progress` table) via
 * Drizzle ORM + postgres.js. Per-user isolation is enforced in application code
 * (D2: NO row-level security): every query filters by the authenticated user id
 * resolved from `getCurrentUser()`, and writes go through the
 * (user_id, lesson_id) unique key. Unauthenticated callers get a safe no-op /
 * empty result and never throw, never write.
 *
 * Mock fallback: when `DATABASE_URL` is not set the layer keeps the original
 * in-memory mock behaviour so the app still runs in mock mode (W7 requirement).
 *
 * Course progress and the study streak are DERIVED from `lesson_progress`
 * (W14): real values for authenticated users, honest zeros for fresh or
 * unauthenticated accounts. Lab progress has no table yet, so real accounts
 * honestly report no lab activity (post-beta follow-up). Fixtures are served
 * ONLY via `resolveDataMode()` (no DB, or the ENABLE_DEV_MOCK_USER review
 * path with no real session) and can never reach a real logged-in session.
 *
 * This is a server-side module (it reaches the DB and reads auth cookies via
 * `getCurrentUser()`). Client components must call the mutation through the
 * Server Action in `@/lib/actions/progress`, never import this file directly.
 */
import { cache } from "react"
import type {
  LessonProgress,
  LabProgress,
  CourseProgress,
  StudyStreak,
} from "@/lib/types"
import type { DynamicScore } from "@/lib/types"
import {
  mockCourses,
  mockLessonProgress,
  mockLabProgress,
  mockCourseProgress,
  mockStudyStreak,
  mockDynamicScore,
} from "./mock-data"
import {
  INTRO_VIDEO_COMPLETION_THRESHOLD,
  createEmptyLessonProgress,
  deriveLessonFraction,
  hasPassedQuiz,
  isLessonComplete,
} from "@/lib/progress/completion"
import {
  deriveCourseProgress,
  deriveStreak,
  emptyDynamicScore,
  emptyStreak,
} from "@/lib/progress/derive"
import { resolveDataMode } from "./mode"
import { getCourses } from "./courses"
import { getDb } from "@/db"
import { lessonProgress } from "@/db/schema"
import { and, eq, sql, type SQL } from "drizzle-orm"
import { getCurrentUser } from "@/lib/auth"

// ─── Mode detection ───────────────────────────────────────────────────────────

/**
 * True when a real database is configured. When false the layer falls back to
 * the in-memory mock arrays so the app still runs without a DB (W7 requirement).
 */
function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

/** Resolves the authenticated user id, or null when unauthenticated. */
async function currentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id ?? null
}

// ─── Row → Type mapper ──────────────────────────────────────────────────────

/** The shape of a `lesson_progress` row as returned by Drizzle. */
type LessonProgressRow = typeof lessonProgress.$inferSelect

/** Maps a persisted `lesson_progress` row to the app's `LessonProgress` type. */
function mapLessonRow(row: LessonProgressRow): LessonProgress {
  return {
    lessonId: row.lessonId,
    isCompleted: row.isCompleted,
    completedAt: row.completedAt ? new Date(row.completedAt) : null,
    progress: row.progress,
    introVideoProgress: row.introVideoProgress,
    quizScore: row.quizScore,
    bestQuizScore: row.bestQuizScore,
    quizPassed: row.quizPassed,
    quizAttempts: row.quizAttempts,
    timeSpent: row.timeSpent,
    lastAccessedAt: row.lastAccessedAt
      ? new Date(row.lastAccessedAt)
      : new Date(),
  }
}

// ─── Lesson progress (DB-backed) ─────────────────────────────────────────────

/**
 * Fetches the user's progress on a specific lesson.
 * Returns null if no progress exists (lesson never started) or unauthenticated.
 */
export async function getLessonProgress(
  lessonId: string
): Promise<LessonProgress | null> {
  const mode = await resolveDataMode()
  if (mode.kind === "mock") {
    return mockLessonProgress.find((p) => p.lessonId === lessonId) ?? null
  }
  if (mode.kind === "anonymous") return null

  const db = getDb()
  const rows = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, mode.userId),
        eq(lessonProgress.lessonId, lessonId)
      )
    )
    .limit(1)

  return rows[0] ? mapLessonRow(rows[0]) : null
}

/**
 * Fetches progress for all lessons the user has interacted with.
 * Returns an empty array when unauthenticated.
 */
export async function getAllLessonProgress(): Promise<LessonProgress[]> {
  const { rows } = await lessonRowsForMode()
  return rows
}

// ── Shared SQL derivations (QA round-3 style note 1) ─────────────────────────
// One builder per security-relevant formula, so the quiz upsert, the video
// upsert and the recompute ping cannot drift apart (they mirror
// isLessonComplete() / deriveLessonFraction() in TypeScript). Each takes the
// sub-expressions that differ per path (what the new video fraction is, what
// "quiz passed" means mid-statement) and returns the composed expression.

/** `is_completed` from a video-fraction expr and a quiz-passed expr. */
function completionSql(introExpr: SQL, passedExpr: SQL): SQL {
  return sql`(${introExpr} >= ${INTRO_VIDEO_COMPLETION_THRESHOLD} and ${passedExpr})`
}

/** `completed_at`: stamped on first completion, cleared when incomplete. */
function completedAtSql(completeExpr: SQL): SQL {
  return sql`case when ${completeExpr} then coalesce(${lessonProgress.completedAt}, now()) else null end`
}

/** `progress`, the DERIVED overall fraction - mirrors deriveLessonFraction(). */
function fractionSql(
  completeExpr: SQL,
  introExpr: SQL,
  passedExpr: SQL
): SQL {
  return sql`greatest(coalesce(${lessonProgress.progress}, 0), case when ${completeExpr} then 1 else least(0.99, least(${introExpr} / ${INTRO_VIDEO_COMPLETION_THRESHOLD}, 1) * 0.5 + case when ${passedExpr} then 0.5 else 0 end) end)`
}

/**
 * Recomputes a lesson's derived state (isCompleted / completedAt / the
 * overall `progress` fraction) from the STORED verified gates, touching
 * lastAccessedAt. This is the FINISH button's whole server contract.
 *
 * It accepts NO update payload at all (QA round-3 defect 4): the earlier
 * Partial<LessonProgress> parameter meant any exposed caller that whitelisted
 * a field - introVideoProgress included - bypassed the credited write paths
 * entirely. The credited/derived fields now have exactly one writer each:
 * `recordIntroVideoProgress`, `recordQuizSubmission`, and this recompute.
 * The DB path is a single SQL upsert over the stored row, so it cannot
 * clobber a concurrent credited write with stale values either.
 *
 * Unauthenticated calls are a safe no-op: they return the optimistic empty
 * shape without persisting (and never throw).
 */
export async function updateLessonProgress(
  lessonId: string
): Promise<LessonProgress> {
  if (!isDbConfigured()) {
    return updateLessonProgressMock(lessonId, {})
  }

  const userId = await currentUserId()
  if (!userId) {
    return mergeLessonProgress(createEmptyLessonProgress(lessonId), {})
  }

  const db = getDb()
  const nowIso = new Date().toISOString()
  const introExpr = sql`coalesce(${lessonProgress.introVideoProgress}, 0)`
  const passedExpr = sql`coalesce(${lessonProgress.quizPassed}, false)`
  const completeExpr = completionSql(introExpr, passedExpr)

  const [row] = await db
    .insert(lessonProgress)
    .values({
      userId,
      lessonId,
      isCompleted: false,
      progress: 0,
      quizScore: null,
      bestQuizScore: null,
      quizPassed: false,
      quizAttempts: 0,
      timeSpent: 0,
      introVideoProgress: 0,
      lastAccessedAt: nowIso,
      completedAt: null,
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        isCompleted: completeExpr,
        completedAt: completedAtSql(completeExpr),
        progress: fractionSql(completeExpr, introExpr, passedExpr),
        lastAccessedAt: nowIso,
      },
    })
    .returning()

  return row ? mapLessonRow(row) : createEmptyLessonProgress(lessonId)
}

/** What `recordQuizSubmission` did with the graded score. */
export type QuizSubmissionOutcome =
  /** The attempt was counted and the row updated (or a no-op for callers
   *  without a persistable identity - mirrored from `updateLessonProgress`). */
  | { outcome: "recorded"; progress: LessonProgress }
  /** The quiz is CLOSED for this row - the attempt cap is spent, or the quiz
   *  is already passed - so NOTHING was written. `progress` is the standing
   *  row, for the refusal payload. */
  | { outcome: "attempt-limit"; progress: LessonProgress }

/** True when no further grading may change this row's quiz record. */
function quizClosed(
  row: { quizAttempts?: number | null; quizPassed?: boolean | null } | null,
  maxAttempts: number
): boolean {
  if (!row) return false
  return (row.quizAttempts ?? 0) >= maxAttempts || row.quizPassed === true
}

/**
 * Records a server-graded quiz submission ATOMICALLY (N2 QA defects 5 + 6;
 * round-2 defect 1; round-3 defect 8).
 *
 * The previous read-modify-write sequence let two concurrent submissions
 * read the same prior row, lose an attempt increment, and let a slower
 * low-scoring write overwrite a concurrent passing one. This is ONE upsert
 * in which the database itself computes every derived field from the row it
 * is updating:
 *   - `quiz_attempts` increments in SQL (`+ 1`), so no increment is lost;
 *   - `best_quiz_score` is `GREATEST(existing, score)`, so a passing score
 *     can never be replaced by a lower concurrent one;
 *   - `quiz_passed` / `is_completed` / `completed_at` / `progress` re-derive
 *     via the shared SQL builders;
 *   - the quiz CLOSES atomically once the cap is spent OR the quiz is passed
 *     (`setWhere`): a passed quiz cannot be re-graded, so the post-pass
 *     answer reveal can never be resubmitted to inflate the record (QA
 *     round-3 defect 8), and attempt N+1 past the cap writes NOTHING even
 *     under a double-click race. The empty RETURNING set is the refusal.
 */
export async function recordQuizSubmission(
  lessonId: string,
  score: number,
  opts: { passMark: number; maxAttempts: number }
): Promise<QuizSubmissionOutcome> {
  // Mode via resolveDataMode, like every other user-scoped path (N2 QA
  // round-2 defect 1): the staging mock learner (DB configured,
  // ENABLE_DEV_MOCK_USER, no session) lands in the MOCK store, where the
  // same closure rules apply and attempts accumulate.
  const mode = await resolveDataMode()

  if (mode.kind === "mock") {
    // Mock mode is single-threaded in-memory; enforce the same closure,
    // then reuse the shared merge so completion semantics stay identical.
    const existing = mockLessonProgress.find((p) => p.lessonId === lessonId)
    if (existing && quizClosed(existing, opts.maxAttempts)) {
      return { outcome: "attempt-limit", progress: existing }
    }
    const attemptsUsed = existing?.quizAttempts ?? 0
    const best = Math.max(score, existing?.bestQuizScore ?? 0)
    const progress = updateLessonProgressMock(lessonId, {
      quizScore: score,
      bestQuizScore: best,
      quizPassed: best >= opts.passMark,
      quizAttempts: attemptsUsed + 1,
    })
    return { outcome: "recorded", progress }
  }

  if (mode.kind === "anonymous") {
    // Safe no-op contract, mirrored from updateLessonProgress: nothing
    // persists. Unreachable through submitQuizAnswersAction (it refuses
    // sessionless callers outside mock envs first); kept as defence in
    // depth for any other caller.
    const best = Math.max(score, 0)
    return {
      outcome: "recorded",
      progress: mergeLessonProgress(createEmptyLessonProgress(lessonId), {
        quizScore: score,
        bestQuizScore: best,
        quizPassed: best >= opts.passMark,
        quizAttempts: 1,
      }),
    }
  }

  const userId = mode.userId
  const db = getDb()
  const nowIso = new Date().toISOString()
  const bestExpr = sql`greatest(coalesce(${lessonProgress.bestQuizScore}, 0), ${score})`
  const passedExpr = sql`${bestExpr} >= ${opts.passMark}`
  const introExpr = sql`coalesce(${lessonProgress.introVideoProgress}, 0)`
  const completeExpr = completionSql(introExpr, passedExpr)

  const rows = await db
    .insert(lessonProgress)
    .values({
      userId,
      lessonId,
      isCompleted: false,
      progress: deriveLessonFraction({
        introVideoProgress: 0,
        quizPassed: score >= opts.passMark,
        bestQuizScore: score,
      }),
      quizScore: score,
      bestQuizScore: score,
      quizPassed: score >= opts.passMark,
      quizAttempts: 1,
      timeSpent: 0,
      introVideoProgress: 0,
      lastAccessedAt: nowIso,
      completedAt: null,
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        quizScore: score,
        bestQuizScore: bestExpr,
        quizPassed: passedExpr,
        quizAttempts: sql`${lessonProgress.quizAttempts} + 1`,
        isCompleted: completeExpr,
        completedAt: completedAtSql(completeExpr),
        progress: fractionSql(completeExpr, introExpr, passedExpr),
        lastAccessedAt: nowIso,
      },
      // The quiz-closure rule, enforced ATOMICALLY (QA defect 5; round-3
      // defect 8): no write past the cap, and no write once passed. When it
      // excludes the row, RETURNING yields nothing and nothing was written.
      setWhere: sql`${lessonProgress.quizAttempts} < ${opts.maxAttempts} and not coalesce(${lessonProgress.quizPassed}, false)`,
    })
    .returning()

  const row = rows[0]
  if (!row) {
    const standing = await getLessonProgress(lessonId)
    return {
      outcome: "attempt-limit",
      progress: standing ?? createEmptyLessonProgress(lessonId),
    }
  }
  return { outcome: "recorded", progress: mapLessonRow(row) }
}

// ── Intro-video watch crediting (N2 QA defect 3; rounds 2-3) ────────────────
//
// The watch fraction is the video half of the completion gate and the server
// cannot see the player, so the only server-verifiable quantity is
// WALL-CLOCK TIME. Each video report banks, into `time_spent`, the elapsed
// time since the USER's most recent progress write on ANY lesson - not the
// row's own - so the same real-world seconds can never bank in parallel
// across lessons (round-3 defect 3: per-lesson clocks let one 90-second
// window credit every lesson at once). Reports for one user are serialised
// with a per-user transaction advisory lock so concurrent reports cannot
// double-spend the same window either. The stored fraction may then rise
// only as far as the banked time allows at a generous playback speed.
//
// Hardening details from the QA rounds:
//  - elapsed is clamped at zero (round-3 defect 6: clock skew / write
//    ordering must never SHRINK the bank) and capped per report (a stale
//    row's idle time is not a windfall);
//  - the bank is trusted only on rows this path has written before
//    (intro_video_progress > 0): a legacy row's time_spent - which older
//    clients could write directly - grants nothing (round-3 defect 5);
//  - `quiz_passed` is coalesced like every neighbouring expression
//    (round-3 defect 13);
//  - everything happens in ONE upsert over the old row, so concurrent
//    reports cannot regress the fraction (GREATEST) or lose deposits.
//
// Honest limits, documented (round-2/3): the server holds no per-video
// duration (no such column exists this side of the N6 migration lane), so
// fraction-per-second is calibrated to the catalogue's real ~4-minute
// intros at the fastest supported playback. A scripted caller can still
// earn ONE lesson's gate by waiting the wall-clock a 2x watcher would
// spend - with no trusted duration that is the enforceable floor - but no
// faster, and never for several lessons in the same window. The per-report
// cap is calibrated to the shipping client, which reports at least every
// decile of playback plus a keep-alive while playing.

/** Calibration: the shortest real intro the fraction model assumes (s). */
const INTRO_VIDEO_ASSUMED_MIN_SECONDS = 180
/** The fastest playback the credit model honours. */
const INTRO_VIDEO_MAX_PLAYBACK_SPEED = 2
/** Longest gap a single report may bank (anti stale-row windfall). */
const INTRO_VIDEO_PER_REPORT_ELAPSED_CAP_SECONDS = 60
/** Fraction allowed before any time is banked (covers the first report). */
const INTRO_VIDEO_BOOTSTRAP_FRACTION = 0.15

/** Fraction the banked seconds justify, floored by the bootstrap. */
function allowedFractionForBank(bankedSeconds: number): number {
  return Math.max(
    INTRO_VIDEO_BOOTSTRAP_FRACTION,
    (bankedSeconds * INTRO_VIDEO_MAX_PLAYBACK_SPEED) /
      INTRO_VIDEO_ASSUMED_MIN_SECONDS
  )
}

/**
 * Records an intro-video watch report: monotonic, time-banked, atomic.
 * Returns the persisted row (or the optimistic shape on the no-op paths).
 */
export async function recordIntroVideoProgress(
  lessonId: string,
  requested: number
): Promise<LessonProgress> {
  const mode = await resolveDataMode()

  if (mode.kind === "mock") {
    const existing = mockLessonProgress.find((p) => p.lessonId === lessonId)
    if (!existing) {
      return updateLessonProgressMock(lessonId, {
        introVideoProgress: Math.min(
          requested,
          INTRO_VIDEO_BOOTSTRAP_FRACTION
        ),
      })
    }
    // Same user-wide clock as the SQL path: the reference is the newest
    // write across the WHOLE store, so parallel lessons cannot each bank
    // the same window (single-threaded here, but the semantics match).
    const reference = Math.max(
      ...mockLessonProgress.map((p) =>
        new Date(p.lastAccessedAt).getTime()
      )
    )
    const elapsed = Math.min(
      Math.max(0, (Date.now() - reference) / 1000),
      INTRO_VIDEO_PER_REPORT_ELAPSED_CAP_SECONDS
    )
    // Bank guard: trust time_spent only on rows this path has credited.
    const priorBank =
      (existing.introVideoProgress ?? 0) > 0 ? (existing.timeSpent ?? 0) : 0
    const banked = priorBank + Math.floor(elapsed)
    const fraction = Math.max(
      existing.introVideoProgress ?? 0,
      Math.min(requested, allowedFractionForBank(banked))
    )
    return updateLessonProgressMock(lessonId, {
      introVideoProgress: fraction,
      timeSpent: banked,
    })
  }

  if (mode.kind === "anonymous") {
    // Safe no-op: optimistic shape only, nothing persists.
    return mergeLessonProgress(createEmptyLessonProgress(lessonId), {
      introVideoProgress: Math.min(requested, INTRO_VIDEO_BOOTSTRAP_FRACTION),
    })
  }

  const db = getDb()
  const userId = mode.userId
  const nowIso = new Date().toISOString()

  // The user-wide credit clock: newest write on ANY of this user's rows.
  // Evaluated inside the statement so it sees the latest committed state
  // once the advisory lock serialises this user's reports.
  const referenceExpr = sql`(select max(lp2.last_accessed_at) from ${lessonProgress} lp2 where lp2.user_id = ${userId})`
  // Clamped at zero (defect 6) and capped per report.
  const elapsedExpr = sql`least(greatest(0, extract(epoch from (now() - coalesce(${referenceExpr}, now())))), ${INTRO_VIDEO_PER_REPORT_ELAPSED_CAP_SECONDS})`
  // Bank guard (defect 5): a row this path never credited contributes no
  // stored time_spent, whatever a legacy client once wrote there.
  const priorBankExpr = sql`(case when coalesce(${lessonProgress.introVideoProgress}, 0) > 0 then coalesce(${lessonProgress.timeSpent}, 0) else 0 end)`
  const bankExpr = sql`(${priorBankExpr} + ${elapsedExpr})`
  const allowedExpr = sql`greatest(${INTRO_VIDEO_BOOTSTRAP_FRACTION}, ${bankExpr} * ${INTRO_VIDEO_MAX_PLAYBACK_SPEED} / ${INTRO_VIDEO_ASSUMED_MIN_SECONDS})`
  const newFracExpr = sql`greatest(coalesce(${lessonProgress.introVideoProgress}, 0), least(${requested}, ${allowedExpr}))`
  const passedExpr = sql`coalesce(${lessonProgress.quizPassed}, false)`
  const completeExpr = completionSql(newFracExpr, passedExpr)

  const initialFraction = Math.min(requested, INTRO_VIDEO_BOOTSTRAP_FRACTION)
  const rows = await db.transaction(async (tx) => {
    // Serialise this user's reports so the same wall-clock window cannot be
    // banked twice by concurrent requests (round-3 defect 3). Transaction
    // scoped: released automatically on commit/rollback.
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${userId}))`
    )
    return tx
      .insert(lessonProgress)
      .values({
        userId,
        lessonId,
        isCompleted: false,
        progress: deriveLessonFraction({
          introVideoProgress: initialFraction,
          quizPassed: false,
          bestQuizScore: null,
        }),
        quizScore: null,
        bestQuizScore: null,
        quizPassed: false,
        quizAttempts: 0,
        timeSpent: 0,
        introVideoProgress: initialFraction,
        lastAccessedAt: nowIso,
        completedAt: null,
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          introVideoProgress: newFracExpr,
          timeSpent: sql`floor(${bankExpr})::int`,
          isCompleted: completeExpr,
          completedAt: completedAtSql(completeExpr),
          progress: fractionSql(completeExpr, newFracExpr, passedExpr),
          lastAccessedAt: nowIso,
        },
      })
      .returning()
  })

  const row = rows[0]
  return row
    ? mapLessonRow(row)
    : mergeLessonProgress(createEmptyLessonProgress(lessonId), {
        introVideoProgress: initialFraction,
      })
}

/**
 * Merges a partial update onto a base progress row and applies the completion
 * rule. `quizPassed` is derived from the best quiz score (unless explicitly
 * provided); `isCompleted` / `completedAt` follow `isLessonComplete()`.
 *
 * Shared by both the DB and mock paths so the completion semantics are
 * identical in either mode.
 */
function mergeLessonProgress(
  base: LessonProgress,
  update: Partial<LessonProgress>
): LessonProgress {
  const merged: LessonProgress = { ...base, ...update }

  // Derive quizPassed from the best score unless the caller set it explicitly.
  merged.quizPassed =
    update.quizPassed ??
    hasPassedQuiz(merged.bestQuizScore ?? merged.quizScore ?? null)

  const complete = isLessonComplete(merged)
  merged.isCompleted = complete
  if (complete) {
    // Preserve an existing completion timestamp; stamp one on first completion.
    merged.completedAt = base.completedAt ?? update.completedAt ?? new Date()
  } else {
    merged.completedAt = null
  }

  // The overall fraction is DERIVED from the verified gates, never accepted
  // from an update (N2 QA round-2 defect 5): before this, a client-supplied
  // `progress: 1` persisted unchanged onto every reporting surface.
  merged.progress = Math.max(
    base.progress ?? 0,
    deriveLessonFraction(merged)
  )

  merged.lastAccessedAt = update.lastAccessedAt ?? new Date()
  return merged
}

/** Mock-mode upsert: mutates the in-memory array (original behaviour + rule). */
function updateLessonProgressMock(
  lessonId: string,
  update: Partial<LessonProgress>
): LessonProgress {
  const existing = mockLessonProgress.find((p) => p.lessonId === lessonId)
  const base = existing ?? createEmptyLessonProgress(lessonId)
  const merged = mergeLessonProgress(base, update)

  if (existing) {
    Object.assign(existing, merged)
    return existing
  }
  mockLessonProgress.push(merged)
  return merged
}

// ─── Lab / course / streak / score (derived or honest-empty — W14) ───────────

/**
 * Fetches the user's rows for the current request's data mode: the real
 * `lesson_progress` rows in `user` mode, fixtures in `mock` mode, nothing
 * when anonymous. Shared by the course-progress and streak derivations.
 *
 * Wrapped in React `cache()` so the dashboard's three consumers
 * (`getAllLessonProgress`, `getAllCourseProgress`, `getStreak`) share a single
 * `SELECT ... FROM lesson_progress` (and one `resolveDataMode` cookie read)
 * per request instead of fanning out one query each.
 */
const lessonRowsForMode = cache(async function lessonRowsForMode(): Promise<{
  mode: Awaited<ReturnType<typeof resolveDataMode>>
  rows: LessonProgress[]
}> {
  const mode = await resolveDataMode()
  if (mode.kind === "mock") return { mode, rows: [...mockLessonProgress] }
  if (mode.kind === "anonymous") return { mode, rows: [] }

  const db = getDb()
  const dbRows = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, mode.userId))
  return { mode, rows: dbRows.map(mapLessonRow) }
})

/**
 * Fetches the user's progress on a specific lab.
 * There is no lab_progress table yet (post-beta follow-up), so real accounts
 * honestly have no lab activity; the pre-completed lab_001/lab_002 fixtures
 * are only served on the mock/dev path, never to a real session (W14).
 */
export async function getLabProgress(
  labId: string
): Promise<LabProgress | null> {
  const mode = await resolveDataMode()
  if (mode.kind === "mock") {
    return mockLabProgress.find((p) => p.labId === labId) ?? null
  }
  return null
}

/**
 * Fetches progress for all labs the user has interacted with.
 * No lab_progress table yet (post-beta follow-up): real accounts honestly
 * report no lab activity; fixtures are mock/dev-path only (W14).
 */
export async function getAllLabProgress(): Promise<LabProgress[]> {
  const mode = await resolveDataMode()
  if (mode.kind === "mock") return [...mockLabProgress]
  return []
}

/**
 * Fetches the user's progress on a specific course, derived from their real
 * `lesson_progress` rows (W14). Accepts the course id or slug (route callers
 * pass the slug). Returns null when the user has not started the course.
 */
export async function getCourseProgress(
  courseIdOrSlug: string
): Promise<CourseProgress | null> {
  const { mode, rows } = await lessonRowsForMode()
  const courses = mode.kind === "mock" ? mockCourses : await getCourses()
  const course = courses.find(
    (c) => c.id === courseIdOrSlug || c.slug === courseIdOrSlug
  )
  if (!course) return null

  if (mode.kind === "mock") {
    // Preserve the fixture shape on the dev path (12/24 etc.).
    return mockCourseProgress.find((p) => p.courseId === course.id) ?? null
  }
  return deriveCourseProgress(course, rows)
}

/**
 * Fetches progress for all courses the user has interacted with, derived
 * from their real `lesson_progress` rows (W14). A fresh account gets an
 * empty array — the honest-zero state — never the 12/24 fixture.
 */
export async function getAllCourseProgress(): Promise<CourseProgress[]> {
  const { mode, rows } = await lessonRowsForMode()
  if (mode.kind === "mock") return [...mockCourseProgress]
  if (rows.length === 0) return []

  const courses = await getCourses()
  return courses
    .map((course) => deriveCourseProgress(course, rows))
    .filter((p): p is CourseProgress => p !== null)
}

/**
 * Fetches the user's study streak, derived from real `lesson_progress`
 * activity dates (W14). A fresh account gets 0 current / 0 longest — never
 * the fixture 5/14. See `deriveStreak` for the undercounting caveat.
 */
export async function getStreak(): Promise<StudyStreak> {
  const { mode, rows } = await lessonRowsForMode()
  if (mode.kind === "mock") return { ...mockStudyStreak }
  if (rows.length === 0) return emptyStreak()
  return deriveStreak(rows)
}

/**
 * Fetches the user's GWTH Score data. Real score computation is post-beta
 * (the panel is behind ENABLE_GWTH_SCORE), so real sessions get an honest
 * zero score; the fixture score is mock/dev-path only (W14).
 */
export async function getDynamicScore(): Promise<DynamicScore> {
  const mode = await resolveDataMode()
  if (mode.kind === "mock") return { ...mockDynamicScore }
  return emptyDynamicScore()
}
