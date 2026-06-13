/**
 * Score-trend helper for the share-price-style score card variants.
 *
 * Takes a chronological history of score values (oldest first, newest
 * last) and produces the absolute + percentage delta between the
 * earliest and latest points, plus a direction classification.
 *
 * The "stable" threshold is 3 absolute score points: any |Δ| < 3
 * renders as "stable" (a typical share ticker would call this 'flat'
 * or '—'). Above that the direction is "up" or "down". Decision
 * 2026-05-08 with David — see beads memory `score-card-share-ticker`.
 */

/** Stable threshold in absolute score points. Any |Δ| below this is "stable". */
export const SCORE_TREND_STABLE_THRESHOLD = 3

/**
 * Trend direction. "stable" wins over both "up" and "down" when the
 * absolute delta is below `SCORE_TREND_STABLE_THRESHOLD`.
 */
export type ScoreTrendDirection = "up" | "down" | "stable"

/**
 * Result of comparing the latest score history point to the earliest.
 *
 * @property current   The most recent score value (last in `history`).
 * @property previous  The earliest score value (first in `history`).
 * @property deltaAbs  Signed absolute delta: `current - previous`.
 * @property deltaPct  Signed percentage delta against `previous`.
 *                     Returns 0 when `previous` is 0 to avoid /0.
 * @property direction "up" / "down" / "stable" — see threshold above.
 */
export type ScoreTrend = {
  current: number
  previous: number
  deltaAbs: number
  deltaPct: number
  direction: ScoreTrendDirection
}

/**
 * Compute trend metrics over a score history.
 *
 * @param history Chronological array (oldest first, newest last). At
 *                least one entry required; with a single entry the
 *                delta is 0 and direction is "stable".
 */
export function computeScoreTrend(history: readonly number[]): ScoreTrend {
  if (history.length === 0) {
    throw new Error("computeScoreTrend: history cannot be empty")
  }
  const previous = history[0]!
  const current = history[history.length - 1]!
  const deltaAbs = current - previous
  const deltaPct = previous === 0 ? 0 : (deltaAbs / previous) * 100
  const direction: ScoreTrendDirection =
    Math.abs(deltaAbs) < SCORE_TREND_STABLE_THRESHOLD
      ? "stable"
      : deltaAbs > 0
        ? "up"
        : "down"
  return { current, previous, deltaAbs, deltaPct, direction }
}

/**
 * Format a signed score-points delta with explicit `+` for positive
 * values: `+8`, `-12`, `0`. Used in the share-ticker-style cards.
 */
export function formatDeltaAbs(deltaAbs: number): string {
  if (deltaAbs > 0) return `+${deltaAbs}`
  return `${deltaAbs}`
}

/**
 * Format a signed percentage delta with explicit `+` and one decimal:
 * `+8.3%`, `-2.4%`, `0.0%`. Used alongside the absolute delta.
 */
export function formatDeltaPct(deltaPct: number): string {
  const fixed = deltaPct.toFixed(1)
  if (deltaPct > 0) return `+${fixed}%`
  return `${fixed}%`
}
