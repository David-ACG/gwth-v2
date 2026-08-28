/**
 * Data access functions for courses.
 *
 * Reads self-hosted PostgreSQL via Drizzle ORM (D1 — ratified 2026-06-15) when
 * `DATABASE_URL` is configured, joining course → sections → lessons into the
 * nested Course structure, and falls back to the in-memory mock courses when it
 * is absent. Supabase has been CANCELLED as a data backend; never re-introduce
 * a Supabase client here.
 */

import type { Course, CourseSection, LessonSummary } from "@/lib/types"
import { mockCourses } from "./mock-data"
import { getDb } from "@/db"
import { courses, sections, lessons } from "@/db/schema"
import { asc, eq, inArray } from "drizzle-orm"
import {
  getEffectiveEdition,
  isLessonInEdition,
  type EffectiveEdition,
} from "./editions"

/**
 * True when a real database is configured. When false the layer falls back to
 * the in-memory mock arrays so the app still runs without a DB.
 */
function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

type CourseRow = typeof courses.$inferSelect
type SectionRow = typeof sections.$inferSelect
type LessonSummaryRow = {
  id: string
  slug: string
  title: string
  order: number
  duration: number
  status: string
  isOptional: boolean
  optionalTrack: string | null
  sectionId: string
  courseId: string
}

/** The columns selected for lesson summaries (avoids pulling full content). */
const lessonSummaryColumns = {
  id: lessons.id,
  slug: lessons.slug,
  title: lessons.title,
  order: lessons.order,
  duration: lessons.duration,
  status: lessons.status,
  isOptional: lessons.isOptional,
  optionalTrack: lessons.optionalTrack,
  sectionId: lessons.sectionId,
  courseId: lessons.courseId,
}

/**
 * Assembles a Course object from Drizzle rows.
 * Joins course → sections → lessons into the nested Course structure.
 *
 * N6: `edition` filters the lesson rows to the caller's effective syllabus
 * (absent lessons disappear, draft rows are excluded), and sections left
 * empty by that curation are dropped rather than rendered as bare headers.
 * On the raw fallback (edition.lessons === null) nothing changes.
 */
function assembleCourse(
  courseRow: CourseRow,
  sectionRows: SectionRow[],
  allLessonRows: LessonSummaryRow[],
  edition: EffectiveEdition
): Course {
  const lessonRows = edition.lessons
    ? allLessonRows.filter((row) => isLessonInEdition(edition, row.id))
    : allLessonRows
  const lessonsBySection = new Map<string, LessonSummary[]>()
  for (const row of lessonRows) {
    if (!lessonsBySection.has(row.sectionId)) {
      lessonsBySection.set(row.sectionId, [])
    }
    lessonsBySection.get(row.sectionId)!.push({
      id: row.id,
      slug: row.slug,
      title: row.title,
      order: row.order,
      duration: row.duration,
      status: (row.status as LessonSummary["status"]) || "available",
      isOptional: row.isOptional || false,
      optionalTrack: row.optionalTrack || undefined,
    })
  }

  const courseSections: CourseSection[] = sectionRows
    .map((s) => ({
      id: s.id,
      title: s.title,
      order: s.order,
      month: s.month as 1 | 2 | 3,
      isOptional: s.isOptional || false,
      optionalTrack: s.optionalTrack || undefined,
      lessons: (lessonsBySection.get(s.id) || []).sort(
        (a, b) => a.order - b.order
      ),
    }))
    // Drop sections the edition curated down to nothing (edition mode only).
    .filter((s) => !edition.lessons || s.lessons.length > 0)

  return {
    id: courseRow.id,
    slug: courseRow.slug,
    title: courseRow.title,
    description: courseRow.description || "",
    thumbnail: courseRow.thumbnail || "/images/courses/applied-ai-skills.jpg",
    blurDataUrl: courseRow.blurDataUrl || null,
    price: courseRow.price || 0,
    category: courseRow.category || "Applied AI",
    difficulty: (courseRow.difficulty as Course["difficulty"]) || "beginner",
    estimatedDuration: courseRow.estimatedDuration || 0,
    sections: courseSections.sort((a, b) => a.order - b.order),
    createdAt: courseRow.createdAt ? new Date(courseRow.createdAt) : new Date(),
    updatedAt: courseRow.updatedAt ? new Date(courseRow.updatedAt) : new Date(),
  }
}

/**
 * Fetches all published courses.
 * Returns them sorted by creation date (newest first).
 */
export async function getCourses(): Promise<Course[]> {
  if (isDbConfigured()) {
    const db = getDb()
    const courseRows = await db.select().from(courses)

    if (courseRows.length > 0) {
      const courseIds = courseRows.map((c) => c.id)
      const [sectionRows, lessonRows] = await Promise.all([
        db
          .select()
          .from(sections)
          .where(inArray(sections.courseId, courseIds))
          .orderBy(asc(sections.order)),
        db
          .select(lessonSummaryColumns)
          .from(lessons)
          .where(inArray(lessons.courseId, courseIds))
          .orderBy(asc(lessons.order)),
      ])

      // N6: resolve the caller's effective edition per course (cache()d per
      // request, so repeated slugs cost one lookup).
      const editions = await Promise.all(
        courseRows.map((courseRow) => getEffectiveEdition(courseRow.slug))
      )
      return courseRows
        .map((courseRow, index) =>
          assembleCourse(
            courseRow,
            sectionRows.filter((s) => s.courseId === courseRow.id),
            lessonRows.filter((l) => l.courseId === courseRow.id),
            editions[index]!
          )
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }
  }

  return [...mockCourses].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

/**
 * Fetches a single course by slug, including its sections and lesson metadata.
 * Returns null if the course doesn't exist.
 */
export async function getCourse(slug: string): Promise<Course | null> {
  if (isDbConfigured()) {
    const db = getDb()
    const courseRows = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1)

    const courseRow = courseRows[0]
    if (courseRow) {
      const [sectionRows, lessonRows, edition] = await Promise.all([
        db
          .select()
          .from(sections)
          .where(eq(sections.courseId, courseRow.id))
          .orderBy(asc(sections.order)),
        db
          .select(lessonSummaryColumns)
          .from(lessons)
          .where(eq(lessons.courseId, courseRow.id))
          .orderBy(asc(lessons.month), asc(lessons.order)),
        getEffectiveEdition(courseRow.slug),
      ])

      return assembleCourse(courseRow, sectionRows, lessonRows, edition)
    }
    // Not found in the DB — fall through to the mock set.
  }

  return mockCourses.find((c) => c.slug === slug) ?? null
}

/**
 * Searches courses by query string (matches title and description).
 * Optionally filters by category and difficulty.
 */
export async function searchCourses(params: {
  query?: string
  category?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
}): Promise<Course[]> {
  let results = await getCourses()

  if (params.query) {
    const q = params.query.toLowerCase()
    results = results.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    )
  }

  if (params.category) {
    results = results.filter((c) => c.category === params.category)
  }

  if (params.difficulty) {
    results = results.filter((c) => c.difficulty === params.difficulty)
  }

  return results
}

/**
 * Returns the unique categories across all courses.
 */
export async function getCourseCategories(): Promise<string[]> {
  const allCourses = await getCourses()
  const categories = new Set(allCourses.map((c) => c.category))
  return [...categories].sort()
}
