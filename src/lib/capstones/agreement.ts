/**
 * The agreement test (bead gwth-launch-9289.8, decision 4): does a judge, or
 * the agreed pair, mark like David? His checked marks are the answer key.
 *
 * Per capstone, on at least 20 hand-ins David checked:
 *   - the same band on at least 17 of 20 (85%);
 *   - never two bands off;
 *   - never passes a piece David made Not yet (no exceptions);
 *   - totals within 8 points of his on average.
 * When the pair passes on a capstone, its agreed marks stand without David
 * (he still sees every flag and a random 1 in 20). Until then he checks every
 * hand-in of that capstone.
 *
 * Pure: the data layer gathers the marks, this measures them.
 */
import type { CapstoneId } from "./guides"
import type { Band } from "./rules"

/** Fewest checked hand-ins before a result counts. */
export const MIN_CHECKED = 20
/** Share of hand-ins that must get David's band (17 of 20). */
export const SAME_BAND_SHARE = 17 / 20
/** Largest average gap from David's total, in points. */
export const MAX_MEAN_GAP = 8

const ORDER: Band[] = ["not_yet", "pass", "good", "excellent"]

/** One mark compared with David's. */
export interface MarkPair {
  david: { band: Band; total: number }
  judge: { band: Band; total: number }
}

/** The four measures for one marker on one capstone. */
export interface AgreementResult {
  checked: number
  sameBand: number
  twoBandsOff: number
  passedNotYet: number
  meanGap: number | null
  passed: boolean
  /** What stops it passing, in plain words (empty when it passes). */
  failing: string[]
}

/** Measures one marker against David. */
export function measureAgreement(pairs: MarkPair[]): AgreementResult {
  const checked = pairs.length
  let sameBand = 0
  let twoBandsOff = 0
  let passedNotYet = 0
  let gap = 0
  for (const { david, judge } of pairs) {
    const distance = Math.abs(ORDER.indexOf(david.band) - ORDER.indexOf(judge.band))
    if (distance === 0) sameBand += 1
    if (distance >= 2) twoBandsOff += 1
    if (david.band === "not_yet" && judge.band !== "not_yet") passedNotYet += 1
    gap += Math.abs(david.total - judge.total)
  }
  const meanGap = checked ? Math.round((gap / checked) * 10) / 10 : null
  const failing: string[] = []
  if (checked < MIN_CHECKED) failing.push(`${checked} of ${MIN_CHECKED} hand-ins checked so far`)
  if (checked && sameBand / checked < SAME_BAND_SHARE) failing.push(`same band on ${sameBand} of ${checked}, needs ${Math.ceil(SAME_BAND_SHARE * checked)}`)
  if (twoBandsOff) failing.push(`${twoBandsOff} marked two bands away from yours`)
  if (passedNotYet) failing.push(`${passedNotYet} passed when you gave Not yet`)
  if (meanGap !== null && meanGap > MAX_MEAN_GAP) failing.push(`totals ${meanGap} points from yours on average, needs ${MAX_MEAN_GAP} or fewer`)
  return { checked, sameBand, twoBandsOff, passedNotYet, meanGap, passed: failing.length === 0, failing }
}

/** One checked hand-in: David's mark and each marker's. */
export interface CheckedMark {
  capstoneId: CapstoneId
  david: { band: Band; total: number }
  luna: { band: Band; total: number } | null
  haiku: { band: Band; total: number } | null
  pair: { band: Band; total: number } | null
}

/** The report for one capstone: each judge and the pair. */
export interface CapstoneAgreement {
  capstoneId: CapstoneId
  luna: AgreementResult
  haiku: AgreementResult
  pair: AgreementResult
}

/** Measures every capstone in the checked marks. */
export function agreementReport(marks: CheckedMark[], capstones: CapstoneId[]): CapstoneAgreement[] {
  return capstones.map((capstoneId) => {
    const mine = marks.filter((m) => m.capstoneId === capstoneId)
    const pairsFor = (key: "luna" | "haiku" | "pair") =>
      mine.flatMap((m) => (m[key] ? [{ david: m.david, judge: m[key]! }] : []))
    return { capstoneId, luna: measureAgreement(pairsFor("luna")), haiku: measureAgreement(pairsFor("haiku")), pair: measureAgreement(pairsFor("pair")) }
  })
}
