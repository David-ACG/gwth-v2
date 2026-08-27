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
import { and, eq, sql } from "drizzle-orm"
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

/**
 * Updates the user's progress on a lesson, upserting on (user_id, lesson_id).
 *
 * The completion gate is recomputed from the merged state via
 * `isLessonComplete()` so partial updates round-trip correctly (e.g. video
 * 80% but quiz failed stays incomplete). Unauthenticated calls are a no-op:
 * they return the optimistic shape without persisting (and never throw).
 */
export async function updateLessonProgress(
  lessonId: string,
  update: Partial<LessonProgress>
): Promise<LessonProgress> {
  if (!isDbConfigured()) {
    return updateLessonProgressMock(lessonId, update)
  }

  const userId = await currentUserId()
  // Unauthenticated → safe no-op: return the merged optimistic shape, persist
  // nothing. Callers (optimistic UI) keep working; the DB is untouched.
  if (!userId) {
    return mergeLessonProgress(createEmptyLessonProgress(lessonId), update)
  }

  const db = getDb()

  const existingRows = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      )
    )
    .limit(1)

  const base: LessonProgress = existingRows[0]
    ? mapLessonRow(existingRows[0])
    : createEmptyLessonProgress(lessonId)

  const merged = mergeLessonProgress(base, update)

  const values = {
    userId,
    lessonId,
    isCompleted: merged.isCompleted,
    progress: merged.progress,
    quizScore: merged.quizScore,
    bestQuizScore: merged.bestQuizScore,
    quizAttempts: merged.quizAttempts,
    timeSpent: merged.timeSpent,
    introVideoProgress: merged.introVideoProgress ?? 0,
    quizPassed: merged.quizPassed ?? false,
    lastAccessedAt: (merged.lastAccessedAt ?? new Date()).toISOString(),
    completedAt: merged.completedAt
      ? new Date(merged.completedAt).toISOString()
      : null,
  }

  const [row] = await db
    .insert(lessonProgress)
    .values(values)
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        isCompleted: values.isCompleted,
        progress: values.progress,
        quizScore: values.quizScore,
        bestQuizScore: values.bestQuizScore,
        quizAttempts: values.quizAttempts,
        timeSpent: values.timeSpent,
        introVideoProgress: values.introVideoProgress,
        quizPassed: values.quizPassed,
        lastAccessedAt: values.lastAccessedAt,
        completedAt: values.completedAt,
      },
    })
    .returning()

  // `returning()` always yields the upserted row here; fall back to the merged
  // shape if the driver ever returns an empty set (keeps the type non-optional).
  return row ? mapLessonRow(row) : merged
}

/** What `recordQuizSubmission` did with the graded score. */
export type QuizSubmissionOutcome =
  /** The attempt was counted and the row updated (or a no-op for callers
   *  without a persistable identity - mirrored from `updateLessonProgress`). */
  | { outcome: "recorded"; progress: LessonProgress }
  /** The persisted attempt count had already reached the cap: NOTHING was
   *  written. `progress` is the standing row, for the refusal payload. */
  | { outcome: "attempt-limit"; progress: LessonProgress }

/**
 * Records a server-graded quiz submission ATOMICALLY (N2 QA defects 5 + 6).
 *
 * The previous read-modify-write sequence (`getLessonProgress` then
 * `updateLessonProgress` in separate awaits) let two concurrent submissions
 * read the same prior row, lose an attempt increment, and let a slower
 * low-scoring write overwrite a concurrent passing one. This is now ONE
 * upsert in which the database itself computes every derived field from the
 * row it is updating:
 *   - `quiz_attempts` increments in SQL (`+ 1`), so no increment is lost;
 *   - `best_quiz_score` is `GREATEST(existing, score)`, so a passing score
 *     can never be replaced by a lower concurrent one;
 *   - `quiz_passed` / `is_completed` / `completed_at` re-derive from that
 *     same GREATEST expression plus the stored video fraction, mirroring
 *     `mergeLessonProgress` + `isLessonComplete()`;
 *   - the MAX_QUIZ_ATTEMPTS cap is a `WHERE quiz_attempts < cap` on the
 *     conflict update, so attempt N+1 past the cap writes NOTHING even under
 *     a double-click race - the empty RETURNING set is the refusal signal.
 */
export async function recordQuizSubmission(
  lessonId: string,
  score: number,
  opts: { passMark: number; maxAttempts: number }
): Promise<QuizSubmissionOutcome> {
  // Mode via resolveDataMode, like every other user-scoped path (N2 QA
  // round-2 defect 1): the staging mock learner (DB configured,
  // ENABLE_DEV_MOCK_USER, no session) lands in the MOCK store, where the
  // attempt cap is enforced and attempts accumulate - the old
  // userId-less no-op branch never counted attempts, so a sessionless
  // staging caller could grade without limit.
  const mode = await resolveDataMode()

  if (mode.kind === "mock") {
    // Mock mode is single-threaded in-memory; enforce the same cap, then
    // reuse the shared merge so completion semantics stay identical.
    const existing = mockLessonProgress.find((p) => p.lessonId === lessonId)
    const attemptsUsed = existing?.quizAttempts ?? 0
    if (existing && attemptsUsed >= opts.maxAttempts) {
      return { outcome: "attempt-limit", progress: existing }
    }
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
  const completeExpr = sql`(coalesce(${lessonProgress.introVideoProgress}, 0) >= ${INTRO_VIDEO_COMPLETION_THRESHOLD} and ${passedExpr})`
  // Overall fraction, derived like deriveLessonFraction(): never client data.
  const fractionExpr = sql`greatest(coalesce(${lessonProgress.progress}, 0), case when ${completeExpr} then 1 else least(0.99, least(coalesce(${lessonProgress.introVideoProgress}, 0) / ${INTRO_VIDEO_COMPLETION_THRESHOLD}, 1) * 0.5 + case when ${passedExpr} then 0.5 else 0 end) end)`

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
        completedAt: sql`case when ${completeExpr} then coalesce(${lessonProgress.completedAt}, now()) else null end`,
        progress: fractionExpr,
        lastAccessedAt: nowIso,
      },
      // The server-side attempt cap (N2 QA defect 5). When it excludes the
      // row, RETURNING yields nothing and nothing was written.
      setWhere: sql`${lessonProgress.quizAttempts} < ${opts.maxAttempts}`,
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

// ── Intro-video watch crediting (N2 QA defect 3; round-2 defects 6/7/8) ─────
//
// The watch fraction is the video half of the completion gate and the server
// cannot see the player, so the only server-verifiable quantity is
// WALL-CLOCK TIME between reports. Each video report banks the elapsed time
// since the row's last write into `time_spent` (capped per report, so a
// stale row does not hand over a huge window), and the stored fraction may
// rise only as far as that banked time allows at a generous playback speed.
// Banking (rather than crediting each report independently) means an honest
// viewer's unused credit carries over instead of being truncated per report.
//
// All of it happens in ONE upsert: elapsed time, the bank, the fraction, and
// the completion recompute are SQL expressions over the row being updated,
// so concurrent reports cannot regress the fraction (GREATEST) or lose bank
// deposits - the same atomicity treatment the quiz write got.
//
// Honest limits, documented (round-2 defects 6 + 7): the server holds no
// per-video duration (no such column exists this side of the N6 migration
// lane), so fraction-per-second is calibrated to the catalogue's shortest
// real intro at the fastest supported playback. A scripted caller can still
// earn the gate by WAITING the same wall-clock a 2x watcher would spend -
// with no trusted duration that is the enforceable floor - and a 2x watcher
// of an intro much shorter than the calibration clears the gate only near
// the video's end.

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
    const elapsed = Math.min(
      Math.max(
        0,
        (Date.now() - new Date(existing.lastAccessedAt).getTime()) / 1000
      ),
      INTRO_VIDEO_PER_REPORT_ELAPSED_CAP_SECONDS
    )
    const banked = (existing.timeSpent ?? 0) + Math.floor(elapsed)
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
  const nowIso = new Date().toISOString()
  // Every expression reads the OLD row (SQL update semantics), so the whole
  // credit computation is one atomic step.
  const elapsedExpr = sql`least(extract(epoch from (now() - coalesce(${lessonProgress.lastAccessedAt}, now()))), ${INTRO_VIDEO_PER_REPORT_ELAPSED_CAP_SECONDS})`
  const bankExpr = sql`(coalesce(${lessonProgress.timeSpent}, 0) + ${elapsedExpr})`
  const allowedExpr = sql`greatest(${INTRO_VIDEO_BOOTSTRAP_FRACTION}, ${bankExpr} * ${INTRO_VIDEO_MAX_PLAYBACK_SPEED} / ${INTRO_VIDEO_ASSUMED_MIN_SECONDS})`
  const newFracExpr = sql`greatest(coalesce(${lessonProgress.introVideoProgress}, 0), least(${requested}, ${allowedExpr}))`
  const completeExpr = sql`(${newFracExpr} >= ${INTRO_VIDEO_COMPLETION_THRESHOLD} and ${lessonProgress.quizPassed})`
  const fractionExpr = sql`greatest(coalesce(${lessonProgress.progress}, 0), case when ${completeExpr} then 1 else least(0.99, least(${newFracExpr} / ${INTRO_VIDEO_COMPLETION_THRESHOLD}, 1) * 0.5 + case when ${lessonProgress.quizPassed} then 0.5 else 0 end) end)`

  const initialFraction = Math.min(requested, INTRO_VIDEO_BOOTSTRAP_FRACTION)
  const rows = await db
    .insert(lessonProgress)
    .values({
      userId: mode.userId,
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
        timeSpent: sql`(coalesce(${lessonProgress.timeSpent}, 0) + floor(${elapsedExpr}))::int`,
        isCompleted: completeExpr,
        completedAt: sql`case when ${completeExpr} then coalesce(${lessonProgress.completedAt}, now()) else null end`,
        progress: fractionExpr,
        lastAccessedAt: nowIso,
      },
    })
    .returning()

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
