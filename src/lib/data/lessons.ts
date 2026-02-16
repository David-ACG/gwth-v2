/**
 * Data access functions for lessons.
 * Currently backed by mock data. Will be replaced with real API/DB calls later.
 */

import type { Lesson, LessonSummary } from "@/lib/types"
import { mockLessons, mockCourses } from "./mock-data"

/**
 * Fetches a full lesson by slug, including all content tabs.
 * Returns null if the lesson doesn't exist.
 */
export async function getLesson(slug: string): Promise<Lesson | null> {
  return mockLessons.find((l) => l.slug === slug) ?? null
}

/**
 * Fetches all lessons for a course (summaries only, not full content).
 * Returns them in section/order sequence.
 */
export async function getLessons(courseSlug: string): Promise<LessonSummary[]> {
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
    prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
    next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
  }
}
