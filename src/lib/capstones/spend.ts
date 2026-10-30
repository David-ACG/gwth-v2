/**
 * The monthly spend cap on capstone marking (bead gwth-launch-9289.11).
 *
 * Real student work is marked only through the OpenAI and Anthropic APIs, on
 * keys that carry their own spend caps in each provider's console. This is
 * the site's own cap on top: the judge runner (bead 9289.5) adds up this
 * month's spend from its runs table (migration 029) and, before each call,
 * asks {@link wouldExceedCap}. A hand-in that would go over waits for David
 * instead of being sent.
 *
 * Configuration (server env only):
 *   CAPSTONE_JUDGE_MONTHLY_CAP_GBP   pounds per calendar month across both
 *                                    providers, e.g. "25" or "12.50".
 * Fails closed: unset, empty or not a number means NO marking calls at all,
 * so a missing variable can never mean unlimited spend.
 */

/** The environment variable that holds the monthly cap in pounds. */
export const CAP_ENV = "CAPSTONE_JUDGE_MONTHLY_CAP_GBP"

/**
 * The monthly cap in pence, or 0 when it is unset or invalid (fail closed:
 * nothing may be spent). Accepts whole pounds or pounds and pence ("12.50").
 */
export function monthlyCapPence(env: Record<string, string | undefined> = process.env): number {
  const raw = env[CAP_ENV]?.trim()
  if (!raw || !/^\d+(\.\d{1,2})?$/.test(raw)) return 0
  const [pounds, pence = ""] = raw.split(".")
  return Number(pounds) * 100 + Number(pence.padEnd(2, "0"))
}

/**
 * Whether spending `nextPence` more this month would go over the cap.
 * Reaching the cap exactly is allowed; a cap of 0 refuses any spend.
 * Throws on a negative or non-finite amount, so a bad estimate cannot slip by.
 */
export function wouldExceedCap(spentPence: number, nextPence: number, capPence: number): boolean {
  for (const [name, value] of [["spentPence", spentPence], ["nextPence", nextPence], ["capPence", capPence]] as const) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be a non-negative number, got ${value}`)
  }
  if (capPence === 0) return true
  return spentPence + nextPence > capPence
}
