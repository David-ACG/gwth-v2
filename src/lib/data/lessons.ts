/**
 * Data access functions for lessons.
 * Queries Supabase when available, falls back to mock data.
 * The data layer abstraction ensures the UI code doesn't need to know
 * which backend is in use.
 */

import type { Lesson, LessonSummary, QuizQuestion, Resource } from "@/lib/types"
import { mockLessons, mockCourses } from "./mock-data"

/**
 * Attempts to create a Supabase client. Returns null if Supabase
 * is not configured (missing env vars). This allows graceful
 * fallback to mock data during development.
 */
async function getSupabaseClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    return await createClient()
  } catch {
    return null
  }
}

/**
 * Converts a Supabase lesson row (snake_case) to a Lesson object (camelCase).
 * Attaches quiz questions and resources from their respective tables.
 */
function rowToLesson(
  row: Record<string, unknown>,
  questions: QuizQuestion[] = [],
  resources: Resource[] = []
): Lesson {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: (row.description as string) || "",
    order: row.order as number,
    duration: row.duration as number,
    difficulty: row.difficulty as "beginner" | "intermediate" | "advanced",
    category: (row.category as string) || "",
    sectionId: row.section_id as string,
    courseId: row.course_id as string,
    courseSlug: row.course_slug as string,
    month: row.month as 1 | 2 | 3,
    isOptional: (row.is_optional as boolean) || false,
    optionalTrack: (row.optional_track as string) || undefined,
    introVideoUrl: (row.intro_video_url as string) || null,
    learnContent: (row.learn_content as string) || "",
    audioFileUrl: (row.audio_file_url as string) || null,
    audioDuration: (row.audio_duration as number) || null,
    buildVideoUrl: (row.build_video_url as string) || null,
    buildInstructions: (row.build_instructions as string) || null,
    questions,
    resources,
    status: (row.status as Lesson["status"]) || "available",
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

/**
 * Fetches a full lesson by slug, including all content tabs.
 * Returns null if the lesson doesn't exist.
 *
 * Tries Supabase first; falls back to mock data if unavailable or empty.
 */
export async function getLesson(slug: string): Promise<Lesson | null> {
  const supabase = await getSupabaseClient()

  if (supabase) {
    const { data: lessonRow, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("slug", slug)
      .single()

    if (!error && lessonRow) {
      // Fetch questions and resources in parallel
      const [questionsResult, resourcesResult] = await Promise.all([
        supabase
          .from("quiz_questions")
          .select("*")
          .eq("lesson_id", lessonRow.id)
          .order("order"),
        supabase
          .from("lesson_resources")
          .select("*")
          .eq("lesson_id", lessonRow.id)
          .order("order"),
      ])

      const questions: QuizQuestion[] = (questionsResult.data || []).map(
        (q: Record<string, unknown>) => ({
          id: q.id as string,
          question: q.question as string,
          options: q.options as string[],
          correctOptionIndex: q.correct_option_index as number,
          explanation: q.explanation as string,
        })
      )

      const resources: Resource[] = (resourcesResult.data || []).map(
        (r: Record<string, unknown>) => ({
          title: r.title as string,
          url: r.url as string,
          type: r.type as Resource["type"],
        })
      )

      return rowToLesson(lessonRow, questions, resources)
    }
  }

  // Fallback to mock data
  return mockLessons.find((l) => l.slug === slug) ?? null
}

/**
 * Fetches all lessons for a course (summaries only, not full content).
 * Returns them in section/order sequence.
 *
 * Tries Supabase first; falls back to mock data.
 */
export async function getLessons(courseSlug: string): Promise<LessonSummary[]> {
  const supabase = await getSupabaseClient()

  if (supabase) {
    const { data: rows, error } = await supabase
      .from("lessons")
      .select("id, slug, title, \"order\", duration, status, is_optional, optional_track, section_id, month")
      .eq("course_slug", courseSlug)
      .order("month")
      .order("order")

    if (!error && rows && rows.length > 0) {
      return rows.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        slug: row.slug as string,
        title: row.title as string,
        order: row.order as number,
        duration: row.duration as number,
        status: (row.status as LessonSummary["status"]) || "available",
        isOptional: (row.is_optional as boolean) || false,
        optionalTrack: (row.optional_track as string) || undefined,
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
    next: currentIndex < allLessons.length - 1 ? (allLessons[currentIndex + 1] ?? null) : null,
  }
}

/**
 * Fetches the total count of lessons in the database.
 * Returns 0 if Supabase is unavailable (falls back to mock count).
 */
export async function getLessonCount(): Promise<number> {
  const supabase = await getSupabaseClient()

  if (supabase) {
    const { count, error } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })

    if (!error && count !== null && count > 0) {
      return count
    }
  }

  return mockLessons.length
}
