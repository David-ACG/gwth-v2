/**
 * A learner's capstone points for the GWTH score (bead gwth-launch-9289.10).
 *
 * Reads `capstone_submissions.best_total`, which `applyMark()` in
 * ./capstone-hand-ins.ts already keeps as the points that count (best of up to
 * 3 hand-ins, a Not yet stored as 0, a provisional mark counting at once). No
 * row, or a null, counts 0, so it is simply left out of the result.
 *
 * Takes the user id the caller already authenticated; nothing here reads a
 * session, and the query is scoped to that user (D2, no RLS).
 */
import "server-only"

import { eq } from "drizzle-orm"
import { getDb } from "@/db"
import { capstoneSubmissions } from "@/db/schema"
import { isCapstoneId, type CapstoneId } from "@/lib/capstones/guides"
import type { Band } from "@/lib/capstones/rules"
import type { CapstoneBestTotals } from "@/lib/progress/gwth-score"

/** Postgres "undefined_table": a database that has not run migration 028. */
const UNDEFINED_TABLE = "42P01"

function isUndefinedTable(error: unknown): boolean {
  let e: unknown = error
  for (let depth = 0; e && typeof e === "object" && depth < 3; depth++) {
    if ((e as { code?: unknown }).code === UNDEFINED_TABLE) return true
    e = (e as { cause?: unknown }).cause
  }
  return false
}

/**
 * Each capstone's counted points out of 100 for one learner. A database
 * without the hand-in tables (migration 028 not yet run) reads as no
 * capstones, so the score and the Progress page keep working; any other
 * error is thrown.
 */
export async function getCapstoneBestTotals(userId: string): Promise<CapstoneBestTotals> {
  return (await getCapstoneMarks(userId)).totals
}

/** One learner's counted capstone marks, with the band and when it was set. */
export interface CapstoneMarks {
  totals: CapstoneBestTotals
  bands: Partial<Record<CapstoneId, Band>>
  /** When each counted mark was last applied (the score's "Last changed" clock). */
  markedAt: Partial<Record<CapstoneId, Date>>
}

/**
 * Each capstone's counted points, band and mark time for one learner (the
 * score badge's three month project grades, bead gwth-launch-phjb). Same
 * missing-table rule as {@link getCapstoneBestTotals}.
 */
export async function getCapstoneMarks(userId: string): Promise<CapstoneMarks> {
  const marks: CapstoneMarks = { totals: {}, bands: {}, markedAt: {} }
  let rows: { capstoneId: string; bestTotal: number | null; bestBand: string | null; updatedAt: string }[]
  try {
    rows = await getDb()
      .select({
        capstoneId: capstoneSubmissions.capstoneId,
        bestTotal: capstoneSubmissions.bestTotal,
        bestBand: capstoneSubmissions.bestBand,
        updatedAt: capstoneSubmissions.updatedAt,
      })
      .from(capstoneSubmissions)
      .where(eq(capstoneSubmissions.userId, userId))
  } catch (error) {
    if (isUndefinedTable(error)) return marks
    throw error
  }
  for (const row of rows) {
    if (!isCapstoneId(row.capstoneId) || row.bestTotal === null) continue
    marks.totals[row.capstoneId] = row.bestTotal
    if (row.bestBand && BANDS.has(row.bestBand)) marks.bands[row.capstoneId] = row.bestBand as Band
    marks.markedAt[row.capstoneId] = new Date(row.updatedAt)
  }
  return marks
}

const BANDS: ReadonlySet<string> = new Set(["not_yet", "pass", "good", "excellent"])
