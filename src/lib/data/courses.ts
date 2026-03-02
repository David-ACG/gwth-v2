/**
 * Data access functions for courses.
 * Queries Supabase when available, falls back to mock data.
 */

import type { Course, CourseSection, LessonSummary } from "@/lib/types"
import { mockCourses } from "./mock-data"

/**
 * Attempts to create a Supabase client. Returns null if Supabase
 * is not configured (missing env vars).
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
 * Assembles a Course object from Supabase rows.
 * Joins course → sections → lessons into the nested Course structure.
 */
function assembleCourse(
  courseRow: Record<string, unknown>,
  sectionRows: Record<string, unknown>[],
  lessonRows: Record<string, unknown>[]
): Course {
  // Group lessons by section_id
  const lessonsBySection = new Map<string, LessonSummary[]>()
  for (const row of lessonRows) {
    const sectionId = row.section_id as string
    if (!lessonsBySection.has(sectionId)) {
      lessonsBySection.set(sectionId, [])
    }
    lessonsBySection.get(sectionId)!.push({
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      order: row.order as number,
      duration: row.duration as number,
      status: (row.status as LessonSummary["status"]) || "available",
      isOptional: (row.is_optional as boolean) || false,
      optionalTrack: (row.optional_track as string) || undefined,
    })
  }

  // Build sections with their lessons
  const sections: CourseSection[] = sectionRows.map((s) => ({
    id: s.id as string,
    title: s.title as string,
    order: s.order as number,
    month: s.month as 1 | 2 | 3,
    isOptional: (s.is_optional as boolean) || false,
    optionalTrack: (s.optional_track as string) || undefined,
    lessons: (lessonsBySection.get(s.id as string) || []).sort(
      (a, b) => a.order - b.order
    ),
  }))

  return {
    id: courseRow.id as string,
    slug: courseRow.slug as string,
    title: courseRow.title as string,
    description: (courseRow.description as string) || "",
    thumbnail: (courseRow.thumbnail as string) || "/images/courses/applied-ai-skills.jpg",
    blurDataUrl: (courseRow.blur_data_url as string) || null,
    price: (courseRow.price as number) || 0,
    category: (courseRow.category as string) || "Applied AI",
    difficulty: (courseRow.difficulty as Course["difficulty"]) || "beginner",
    estimatedDuration: (courseRow.estimated_duration as number) || 0,
    sections: sections.sort((a, b) => a.order - b.order),
    createdAt: new Date(courseRow.created_at as string),
    updatedAt: new Date(courseRow.updated_at as string),
  }
}

/**
 * Fetches all published courses.
 * Returns them sorted by creation date (newest first).
 */
export async function getCourses(): Promise<Course[]> {
  const supabase = await getSupabaseClient()

  if (supabase) {
    const { data: courseRows, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && courseRows && courseRows.length > 0) {
      // Fetch all sections and lessons for all courses
      const courseIds = courseRows.map((c: Record<string, unknown>) => c.id as string)
      const [sectionsResult, lessonsResult] = await Promise.all([
        supabase.from("sections").select("*").in("course_id", courseIds).order("order"),
        supabase.from("lessons").select("id, slug, title, \"order\", duration, status, is_optional, optional_track, section_id, course_id, month").in("course_id", courseIds).order("order"),
      ])

      return courseRows.map((courseRow: Record<string, unknown>) => {
        const sections = (sectionsResult.data || []).filter(
          (s: Record<string, unknown>) => s.course_id === courseRow.id
        )
        const lessons = (lessonsResult.data || []).filter(
          (l: Record<string, unknown>) => l.course_id === courseRow.id
        )
        return assembleCourse(courseRow, sections, lessons)
      })
    }
  }

  // Fallback to mock data
  return [...mockCourses].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

/**
 * Fetches a single course by slug, including its sections and lesson metadata.
 * Returns null if the course doesn't exist or isn't published.
 */
export async function getCourse(slug: string): Promise<Course | null> {
  const supabase = await getSupabaseClient()

  if (supabase) {
    const { data: courseRow, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .single()

    if (!error && courseRow) {
      const [sectionsResult, lessonsResult] = await Promise.all([
        supabase.from("sections").select("*").eq("course_id", courseRow.id).order("order"),
        supabase.from("lessons").select("id, slug, title, \"order\", duration, status, is_optional, optional_track, section_id, course_id, month").eq("course_id", courseRow.id).order("month").order("order"),
      ])

      return assembleCourse(
        courseRow,
        sectionsResult.data || [],
        lessonsResult.data || []
      )
    }
  }

  // Fallback to mock data
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
  // For search, use the getCourses function and filter client-side.
  // Supabase full-text search can be added later for performance.
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
  const courses = await getCourses()
  const categories = new Set(courses.map((c) => c.category))
  return [...categories].sort()
}
