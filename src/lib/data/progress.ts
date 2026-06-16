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
 * Lab / course / study-streak / GWTH-score progress remain mock-backed: there
 * are no tables for them in the schema yet, so they are served from mock-data
 * unchanged. Wiring those to the DB is out of scope for W7 (see follow-ups).
 *
 * This is a server-side module (it reaches the DB and reads auth cookies via
 * `getCurrentUser()`). Client components must call the mutation through the
 * Server Action in `@/lib/actions/progress`, never import this file directly.
 */
import type {
  LessonProgress,
  LabProgress,
  CourseProgress,
  StudyStreak,
} from "@/lib/types"
import type { DynamicScore } from "@/lib/types"
import {
  mockLessonProgress,
  mockLabProgress,
  mockCourseProgress,
  mockStudyStreak,
  mockDynamicScore,
} from "./mock-data"
import {
  createEmptyLessonProgress,
  hasPassedQuiz,
  isLessonComplete,
} from "@/lib/progress/completion"
import { getDb } from "@/db"
import { lessonProgress } from "@/db/schema"
import { and, eq } from "drizzle-orm"
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
  if (!isDbConfigured()) {
    return mockLessonProgress.find((p) => p.lessonId === lessonId) ?? null
  }

  const userId = await currentUserId()
  if (!userId) return null

  const db = getDb()
  const rows = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
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
  if (!isDbConfigured()) {
    return [...mockLessonProgress]
  }

  const userId = await currentUserId()
  if (!userId) return []

  const db = getDb()
  const rows = await db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId))

  return rows.map(mapLessonRow)
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

// ─── Lab / course / streak / score (mock-backed — no DB tables yet) ──────────

/**
 * Fetches the user's progress on a specific lab.
 * Mock-backed: there is no lab_progress table yet (W7 follow-up).
 */
export async function getLabProgress(
  labId: string
): Promise<LabProgress | null> {
  return mockLabProgress.find((p) => p.labId === labId) ?? null
}

/**
 * Fetches progress for all labs the user has interacted with.
 * Mock-backed: there is no lab_progress table yet (W7 follow-up).
 */
export async function getAllLabProgress(): Promise<LabProgress[]> {
  return [...mockLabProgress]
}

/**
 * Fetches the user's progress on a specific course.
 * Mock-backed: there is no course_progress table yet (W7 follow-up).
 */
export async function getCourseProgress(
  courseId: string
): Promise<CourseProgress | null> {
  return mockCourseProgress.find((p) => p.courseId === courseId) ?? null
}

/**
 * Fetches progress for all courses the user has interacted with.
 * Mock-backed: there is no course_progress table yet (W7 follow-up).
 */
export async function getAllCourseProgress(): Promise<CourseProgress[]> {
  return [...mockCourseProgress]
}

/**
 * Fetches the user's study streak data.
 * Mock-backed: there is no study_streak table yet (W7 follow-up).
 */
export async function getStreak(): Promise<StudyStreak> {
  return { ...mockStudyStreak }
}

/**
 * Fetches the user's GWTH Score data.
 * Mock-backed: derived/aggregate, no dedicated table (W7 follow-up).
 */
export async function getDynamicScore(): Promise<DynamicScore> {
  return { ...mockDynamicScore }
}
