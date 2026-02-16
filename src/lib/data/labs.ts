/**
 * Data access functions for labs.
 * Currently backed by mock data. Will be replaced with real API/DB calls later.
 */

import type { Lab } from "@/lib/types"
import { mockLabs } from "./mock-data"

/**
 * Fetches all published labs.
 * Returns them sorted by creation date (newest first).
 */
export async function getLabs(): Promise<Lab[]> {
  return [...mockLabs].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

/**
 * Fetches a single lab by slug.
 * Returns null if the lab doesn't exist.
 */
export async function getLab(slug: string): Promise<Lab | null> {
  return mockLabs.find((l) => l.slug === slug) ?? null
}

/**
 * Searches labs by query string and filters.
 */
export async function searchLabs(params: {
  query?: string
  category?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  technology?: string
}): Promise<Lab[]> {
  let results = [...mockLabs]

  if (params.query) {
    const q = params.query.toLowerCase()
    results = results.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
    )
  }

  if (params.category) {
    results = results.filter((l) => l.category === params.category)
  }

  if (params.difficulty) {
    results = results.filter((l) => l.difficulty === params.difficulty)
  }

  if (params.technology) {
    results = results.filter((l) =>
      l.technologies.some((t) => t.toLowerCase() === params.technology!.toLowerCase())
    )
  }

  return results
}

/**
 * Returns unique categories and technologies across all labs for filter UIs.
 */
export async function getLabFilters(): Promise<{
  categories: string[]
  technologies: string[]
}> {
  const categories = new Set(mockLabs.map((l) => l.category))
  const technologies = new Set(mockLabs.flatMap((l) => l.technologies))
  return {
    categories: [...categories].sort(),
    technologies: [...technologies].sort(),
  }
}
