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
import { isCapstoneId } from "@/lib/capstones/guides"
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
  let rows: { capstoneId: string; bestTotal: number | null }[]
  try {
    rows = await getDb()
      .select({ capstoneId: capstoneSubmissions.capstoneId, bestTotal: capstoneSubmissions.bestTotal })
      .from(capstoneSubmissions)
      .where(eq(capstoneSubmissions.userId, userId))
  } catch (error) {
    if (isUndefinedTable(error)) return {}
    throw error
  }
  const totals: CapstoneBestTotals = {}
  for (const row of rows) {
    if (isCapstoneId(row.capstoneId) && row.bestTotal !== null) totals[row.capstoneId] = row.bestTotal
  }
  return totals
}
