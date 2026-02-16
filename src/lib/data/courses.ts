/**
 * Data access functions for courses.
 * Currently backed by mock data. Will be replaced with real API/DB calls later.
 */

import type { Course } from "@/lib/types"
import { mockCourses } from "./mock-data"

/**
 * Fetches all published courses.
 * Returns them sorted by creation date (newest first).
 */
export async function getCourses(): Promise<Course[]> {
  return [...mockCourses].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

/**
 * Fetches a single course by slug, including its sections and lesson metadata.
 * Returns null if the course doesn't exist or isn't published.
 */
export async function getCourse(slug: string): Promise<Course | null> {
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
  let results = [...mockCourses]

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
  const categories = new Set(mockCourses.map((c) => c.category))
  return [...categories].sort()
}
