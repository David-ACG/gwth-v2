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

import type { Lesson, LessonSummary, QuizQuestion, Resource } from "@/lib/types"
import { mockLessons, mockCourses } from "./mock-data"
import { getDb } from "@/db"
import { lessons, quizQuestions, lessonResources } from "@/db/schema"
import { and, asc, eq } from "drizzle-orm"

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
    introVideoUrl: row.introVideoUrl ?? null,
    learnContent: row.learnContent || "",
    audioFileUrl: row.audioFileUrl ?? null,
    audioDuration: row.audioDuration ?? null,
    buildVideoUrl: row.buildVideoUrl ?? null,
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
