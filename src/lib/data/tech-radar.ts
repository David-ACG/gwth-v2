/**
 * Tech Radar data module.
 * Loads AI tool data for the public Tech Radar page.
 * Currently uses static JSON data; will be replaced with API calls
 * when the automated scanner is connected.
 */

import type { TechRadarTool } from "@/lib/types"
import techRadarData from "@/../docs/tech_radar.json"

/** All tools tracked on the Tech Radar */
const tools: TechRadarTool[] = techRadarData.tools as TechRadarTool[]

/** All tool categories */
const categories: string[] = techRadarData.categories as string[]

/**
 * Returns all tools on the Tech Radar.
 */
export function getTechRadarTools(): TechRadarTool[] {
  return tools
}

/**
 * Returns all tool categories.
 */
export function getTechRadarCategories(): string[] {
  return categories
}

/**
 * Searches and filters Tech Radar tools.
 * @param query - Optional text search (matches name, description, tags)
 * @param category - Optional category filter
 * @param showHotOnly - If true, only return trending/hot tools
 */
export function searchTechRadar(options?: {
  query?: string
  category?: string
  showHotOnly?: boolean
}): TechRadarTool[] {
  let results = [...tools]

  if (options?.category) {
    results = results.filter((t) => t.category === options.category)
  }

  if (options?.showHotOnly) {
    results = results.filter((t) => t.is_hot)
  }

  if (options?.query) {
    const q = options.query.toLowerCase()
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  }

  return results
}

/**
 * Returns a single tool by slug.
 */
export function getTechRadarTool(slug: string): TechRadarTool | null {
  return tools.find((t) => t.slug === slug) ?? null
}

/**
 * Returns the date the Tech Radar was last updated.
 */
export function getTechRadarLastUpdated(): string {
  return techRadarData.exported_at
}

/**
 * Returns the total number of tools tracked.
 */
export function getTechRadarToolCount(): number {
  return tools.length
}
