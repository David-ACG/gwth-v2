/**
 * Data access functions for labs.
 *
 * Reads self-hosted PostgreSQL via Drizzle ORM (D1 — ratified 2026-06-15) when
 * `DATABASE_URL` is configured, and falls back to the in-memory mock labs (the
 * real Month-1 lab set in `m1-labs.ts`) when it is absent. Supabase has been
 * CANCELLED as a data backend; never re-introduce a Supabase client here.
 */

import type { Lab, LabStep } from "@/lib/types"
import { mockLabs } from "./mock-data"
import { getDb } from "@/db"
import { labs } from "@/db/schema"
import { asc, eq } from "drizzle-orm"

/**
 * True when a real database is configured. When false the layer falls back to
 * the in-memory mock labs so the app still runs without a DB.
 */
function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

/** The shape of a `labs` row as returned by Drizzle. */
type LabRow = typeof labs.$inferSelect

/** Maps a persisted `labs` row to the app's `Lab` type. */
function rowToLab(row: LabRow): Lab {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || "",
    difficulty: row.difficulty as "beginner" | "intermediate" | "advanced",
    duration: row.duration,
    technologies: row.technologies ?? [],
    learningOutcomes: row.learningOutcomes ?? [],
    prerequisites: row.prerequisites ?? null,
    content: row.content || "",
    instructions: (row.instructions as LabStep[]) ?? [],
    category: row.category || "",
    projectType: row.projectType || "",
    color: row.color || "",
    icon: row.icon || "",
    image: row.image ?? undefined,
    isPremium: row.isPremium,
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
  }
}

/**
 * Fetches all published labs.
 * Returns them sorted by creation date (newest first).
 *
 * Reads Postgres when configured; falls back to mock data otherwise.
 */
export async function getLabs(): Promise<Lab[]> {
  if (isDbConfigured()) {
    const db = getDb()
    const rows = await db.select().from(labs)
    if (rows.length > 0) {
      return rows
        .map(rowToLab)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }
  }

  return [...mockLabs].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
}

/**
 * Fetches a single lab by slug.
 * Returns null if the lab doesn't exist.
 *
 * Reads Postgres when configured; falls back to mock data otherwise.
 */
export async function getLab(slug: string): Promise<Lab | null> {
  if (isDbConfigured()) {
    const db = getDb()
    const rows = await db.select().from(labs).where(eq(labs.slug, slug)).limit(1)
    if (rows[0]) {
      return rowToLab(rows[0])
    }
    // Not found in the DB — fall through to the mock set.
  }

  return mockLabs.find((l) => l.slug === slug) ?? null
}

/**
 * Searches labs by query string and filters. Runs the DB-backed (or mock)
 * full set through the same in-memory filter pipeline so behaviour is
 * identical in either mode.
 */
export async function searchLabs(params: {
  query?: string
  category?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  technology?: string
}): Promise<Lab[]> {
  let results = await getLabs()

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
      l.technologies.some(
        (t) => t.toLowerCase() === params.technology!.toLowerCase()
      )
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
  const allLabs = await getLabs()
  const categories = new Set(allLabs.map((l) => l.category))
  const technologies = new Set(allLabs.flatMap((l) => l.technologies))
  return {
    categories: [...categories].sort(),
    technologies: [...technologies].sort(),
  }
}
