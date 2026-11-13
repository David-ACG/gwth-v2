/**
 * Which months a learner may open, beyond what they paid for (bead
 * gwth-launch-735c). Pure: shared by access.ts, the payer clock job and tests.
 *
 * Two rules, both decided by David on 12 Nov 2026:
 *
 * 1. The completion gate: "we don't allow students to go from month 1 to
 *    month 2 or month 2 to month 3 unless they've completed a certain number
 *    of the lessons already ... set it to 75% lessons complete for now".
 *    Month 2 opens once MONTH_GATE_PERCENT of Month 1's core lessons are
 *    complete; Month 3 once that share of Month 2's are.
 * 2. The review hold: a flagged account stays on the month it is on until
 *    David has looked ("only when I've looked at the alert enable the student
 *    to move on"), "with clock held".
 *
 * Both work through hold the clock (decision 5): a month a learner cannot
 * open yet counts as "not open" for THEM, so a prepaid pass loses no time and
 * a monthly payer's next charge waits. When the month opens for them, it
 * opens from that moment (the later of the global open date, the moment they
 * reached the gate, and the moment David cleared the hold).
 */
import type { MonthRelease } from "@/lib/billing/passes"

export type HoldReason = "release" | "progress" | "review"

export type MonthCap = { month: 2 | 3; reason: Exclude<HoldReason, "release"> }

/** A learner's completions in one month: core lesson count and when each finished. */
export type MonthCompletion = { total: number; completedAt: Date[] }

export type FlagForHold = {
  status: "open" | "cleared" | "suspended"
  heldMonth: number | null
  clearedAt: Date | null
}

/** The next gate a learner has not passed: Month `month` opens at `need` of `total`. */
export type NextGate = { month: 2 | 3; done: number; need: number; total: number; percent: number }

export const DEFAULT_GATE_PERCENT = 75

/** The gate percentage from MONTH_GATE_PERCENT (0 switches the gate off). */
export function gatePercent(raw: string | undefined = process.env.MONTH_GATE_PERCENT): number {
  if (raw === undefined || raw.trim() === "") return DEFAULT_GATE_PERCENT
  const n = Number(raw)
  if (!Number.isFinite(n)) return DEFAULT_GATE_PERCENT
  return Math.min(100, Math.max(0, n))
}

/** How many of `total` lessons must be complete to pass the gate. */
export function lessonsNeeded(total: number, percent: number): number {
  if (total <= 0 || percent <= 0) return 0
  return Math.ceil((percent / 100) * total - 1e-9)
}

const EPOCH = new Date(0)

/**
 * When the learner reached the gate for this month: the finish time of the
 * lesson that took them over the line, epoch when there is no gate to pass,
 * or null while they have not reached it.
 */
export function gateReachedAt(c: MonthCompletion | undefined, percent: number): Date | null {
  if (!c) return EPOCH
  const need = lessonsNeeded(c.total, percent)
  if (need === 0) return EPOCH
  if (c.completedAt.length < need) return null
  const sorted = [...c.completedAt].sort((a, b) => a.getTime() - b.getTime())
  return sorted[need - 1] ?? null
}

function latest(dates: Array<Date | null>): Date | null {
  let out: Date | null = EPOCH
  for (const d of dates) {
    if (d === null) return null
    if (out === null || d > out) out = d
  }
  return out
}

/**
 * The learner's own month caps and open dates.
 *
 * `gate` is null when the completion gate does not apply to this learner
 * (beta testers, admins, the gate switched off); otherwise it holds their
 * Month 1 and Month 2 completions.
 */
export function learnerMonths(input: {
  global: MonthRelease
  percent: number
  gate: { 1?: MonthCompletion; 2?: MonthCompletion } | null
  flags: FlagForHold[]
}): { cap: MonthCap | null; release: MonthRelease } {
  const { global, percent, gate, flags } = input
  const reached1 = gate ? gateReachedAt(gate[1], percent) : EPOCH
  const reached2 = gate ? gateReachedAt(gate[2], percent) : EPOCH

  const open = flags.find((f) => f.status === "open" && (f.heldMonth === 2 || f.heldMonth === 3))
  const openHeld = open ? (open.heldMonth as 2 | 3) : null
  const clearedFor = (m: 2 | 3): Date[] =>
    flags
      .filter((f) => f.status === "cleared" && f.heldMonth === m && f.clearedAt)
      .map((f) => f.clearedAt as Date)

  let cap: MonthCap | null = null
  if (reached1 === null) cap = { month: 2, reason: "progress" }
  else if (reached2 === null) cap = { month: 3, reason: "progress" }
  if (openHeld !== null && (cap === null || openHeld <= cap.month)) {
    cap = { month: openHeld, reason: "review" }
  }

  const blocked = (m: 2 | 3) => openHeld !== null && openHeld <= m
  const month2 = blocked(2)
    ? null
    : latest([global.month2, reached1, ...clearedFor(2)])
  const month3 = blocked(3)
    ? null
    : latest([global.month3, reached1, reached2, ...clearedFor(2), ...clearedFor(3)])

  return { cap, release: { month2, month3 } }
}
