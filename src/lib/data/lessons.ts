/**
 * Data access functions for lessons.
 *
 * Reads self-hosted PostgreSQL via Drizzle ORM (D1 — ratified 2026-06-15) when
 * `DATABASE_URL` is configured, and falls back to the in-memory mock data when
 * it is absent (so the app still runs in mock mode — same pattern as
 * `progress.ts`). Supabase has been CANCELLED as a data backend; never
 * re-introduce a Supabase client here.
 *
 * The data layer abstraction ensures the UI code doesn't need to know which
 * backend is in use.
 */

import type {
  Lesson,
  LessonSummary,
  QuizQuestion,
  QuizQuestionPublic,
  Resource,
} from "@/lib/types"
import { mockLessons, mockCourses } from "./mock-data"
import { getDb } from "@/db"
import { lessons, quizQuestions, lessonResources } from "@/db/schema"
import { asc, eq } from "drizzle-orm"
import { mediaUrl } from "@/lib/media/url"

/**
 * True when a real database is configured. When false the layer falls back to
 * the in-memory mock arrays so the app still runs without a DB.
 */
function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

/** The shape of a `lessons` row as returned by Drizzle. */
type LessonRow = typeof lessons.$inferSelect

/**
 * Converts a persisted `lessons` row (camelCase via Drizzle) to a Lesson
 * object. Attaches quiz questions and resources from their respective tables.
 */
function rowToLesson(
  row: LessonRow,
  questions: QuizQuestion[] = [],
  resources: Resource[] = []
): Lesson {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || "",
    order: row.order,
    duration: row.duration,
    difficulty: row.difficulty as "beginner" | "intermediate" | "advanced",
    category: row.category || "",
    sectionId: row.sectionId,
    courseId: row.courseId,
    courseSlug: row.courseSlug,
    month: row.month as 1 | 2 | 3,
    isOptional: row.isOptional || false,
    optionalTrack: row.optionalTrack || undefined,
    // Media is rewritten to the CDN HERE, at the data boundary, not at render.
    // The pipeline stores absolute P520 LAN URLs
    // (http://192.168.178.50:8088/api/lessons/...), and rewriting only in the
    // component left the raw value in the serialised props: a lesson page on
    // production shipped the internal host and port to anyone viewing source,
    // and any future client code reading the field directly would have tried to
    // fetch an unreachable address from a visitor's browser. `mediaUrl` is
    // idempotent, so the existing render-time calls remain harmless no-ops.
    introVideoUrl: mediaUrl(row.introVideoUrl ?? null),
    learnContent: row.learnContent || "",
    audioFileUrl: mediaUrl(row.audioFileUrl ?? null),
    audioDuration: row.audioDuration ?? null,
    buildVideoUrl: mediaUrl(row.buildVideoUrl ?? null),
    buildInstructions: row.buildInstructions ?? null,
    questions,
    resources,
    status: (row.status as Lesson["status"]) || "available",
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
  }
}

/**
 * Fetches a full lesson by slug, including all content tabs.
 * Returns null if the lesson doesn't exist.
 *
 * Reads Postgres when configured; falls back to mock data otherwise.
 */
export async function getLesson(slug: string): Promise<Lesson | null> {
  if (isDbConfigured()) {
    const db = getDb()
    const lessonRows = await db
      .select()
      .from(lessons)
      .where(eq(lessons.slug, slug))
      .limit(1)

    const lessonRow = lessonRows[0]
    if (lessonRow) {
      const [questionRows, resourceRows] = await Promise.all([
        db
          .select()
          .from(quizQuestions)
          .where(eq(quizQuestions.lessonId, lessonRow.id))
          .orderBy(asc(quizQuestions.order)),
        db
          .select()
          .from(lessonResources)
          .where(eq(lessonResources.lessonId, lessonRow.id))
          .orderBy(asc(lessonResources.order)),
      ])

      const questions: QuizQuestion[] = questionRows.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
      }))

      const resources: Resource[] = resourceRows.map((r) => ({
        title: r.title,
        url: r.url,
        type: r.type as Resource["type"],
      }))

      return rowToLesson(lessonRow, questions, resources)
    }
    // Not found in the DB — fall through to the mock set so dev still resolves
    // lessons that haven't been imported yet.
  }

  return mockLessons.find((l) => l.slug === slug) ?? null
}

/**
 * Strips a lesson's quiz questions down to the shape that may enter client
 * component props (gwth-launch-va6): id, question, options — no answer key,
 * no explanation. `submitQuizAnswersAction` reveals both after submission.
 */
export function toPublicQuizQuestions(
  questions: QuizQuestion[]
): QuizQuestionPublic[] {
  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }))
}

/**
 * Fetches the FULL quiz rows (including the answer key) for a lesson by
 * lesson id, for server-side grading only (gwth-launch-va6). Never pass the
 * result to a client component — use `toPublicQuizQuestions` for props.
 *
 * When a database is configured it is the ONLY answer-key source: zero rows
 * mean an empty result and grading fails loudly upstream, whether the quiz
 * rows are unseeded or the lessons row itself is missing/re-keyed (N2 QA
 * defect 7, and its round-2 residual: the earlier "lesson not imported"
 * probe still fell back to the bundled mock key when a production lessons
 * row was deleted mid re-import, silently grading real submissions against
 * the wrong questions). The mock set serves pure mock mode (no
 * `DATABASE_URL`) only - grading against fixtures is never an option once
 * real persistence exists.
 */
export async function getQuizQuestionsByLessonId(
  lessonId: string
): Promise<QuizQuestion[]> {
  if (isDbConfigured()) {
    const db = getDb()
    const rows = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.lessonId, lessonId))
      .orderBy(asc(quizQuestions.order))

    return rows.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
    }))
  }

  return mockLessons.find((l) => l.id === lessonId)?.questions ?? []
}

/**
 * Resolves the month (1-3) a lesson belongs to, by lesson id, for the
 * server-side quiz-grading access check (N2 QA defect 4): the grading action
 * must verify the caller's subscription actually covers this lesson's month
 * before it grades anything. Returns null when the lesson is unknown.
 *
 * When a database is configured it is the ONLY source (N2 QA round-2 defect
 * 9): a lesson id the DB does not hold resolves to null and the access gate
 * REFUSES, rather than resolving a month from the mock fixture and letting
 * grading proceed against it. The mock set serves pure mock mode only.
 */
export async function getLessonMonthById(
  lessonId: string
): Promise<1 | 2 | 3 | null> {
  if (isDbConfigured()) {
    const db = getDb()
    const rows = await db
      .select({ month: lessons.month })
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1)
    const month = rows[0]?.month
    return month === 1 || month === 2 || month === 3 ? month : null
  }

  const mockMonth = mockLessons.find((l) => l.id === lessonId)?.month
  return mockMonth === 1 || mockMonth === 2 || mockMonth === 3
    ? mockMonth
    : null
}

/**
 * Fetches all lessons for a course (summaries only, not full content).
 * Returns them in month/order sequence.
 *
 * Reads Postgres when configured; falls back to mock data otherwise.
 */
export async function getLessons(courseSlug: string): Promise<LessonSummary[]> {
  if (isDbConfigured()) {
    const db = getDb()
    const rows = await db
      .select({
        id: lessons.id,
        slug: lessons.slug,
        title: lessons.title,
        order: lessons.order,
        duration: lessons.duration,
        status: lessons.status,
        isOptional: lessons.isOptional,
        optionalTrack: lessons.optionalTrack,
      })
      .from(lessons)
      .where(eq(lessons.courseSlug, courseSlug))
      .orderBy(asc(lessons.month), asc(lessons.order))

    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        order: row.order,
        duration: row.duration,
        status: (row.status as LessonSummary["status"]) || "available",
        isOptional: row.isOptional || false,
        optionalTrack: row.optionalTrack || undefined,
      }))
    }
  }

  // Fallback to mock data
  const course = mockCourses.find((c) => c.slug === courseSlug)
  if (!course) return []

  return course.sections.flatMap((section) =>
    section.lessons.map((lesson) => ({
      ...lesson,
    }))
  )
}

/**
 * Returns the previous and next lessons for navigation.
 * Returns null for prev/next if at the beginning/end of the course.
 */
export async function getAdjacentLessons(
  courseSlug: string,
  lessonSlug: string
): Promise<{ prev: LessonSummary | null; next: LessonSummary | null }> {
  const allLessons = await getLessons(courseSlug)
  const currentIndex = allLessons.findIndex((l) => l.slug === lessonSlug)

  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: currentIndex > 0 ? (allLessons[currentIndex - 1] ?? null) : null,
    next:
      currentIndex < allLessons.length - 1
        ? (allLessons[currentIndex + 1] ?? null)
        : null,
  }
}

/**
 * Fetches the total count of lessons in the database.
 * Returns the mock count when Postgres is unavailable or empty.
 */
export async function getLessonCount(): Promise<number> {
  if (isDbConfigured()) {
    const db = getDb()
    const rows = await db.select({ id: lessons.id }).from(lessons)
    if (rows.length > 0) {
      return rows.length
    }
  }

  return mockLessons.length
}
