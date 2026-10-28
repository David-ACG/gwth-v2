/**
 * The rules of a capstone hand-in that do not need a database (bead
 * gwth-launch-9289.2): which expected files a hand-in contains, whether a
 * learner may hand in again, and which hand-in's mark counts.
 *
 * Decisions (bead gwth-launch-9289): up to {@link MAX_HAND_INS} hand-ins per
 * capstone; the best mark counts; a Not yet counts 0 until handed in again; a
 * provisional mark counts at once and updates if David changes it.
 *
 * Pure: safe to import from client components and tests.
 */
import { MAX_HAND_INS, type ExpectedFile } from "./guides"

/** Where a hand-in is in its life. See migration 028 for each meaning. */
export type AttemptStatus = "draft" | "marking" | "provisional" | "with_david" | "final"

/** A capstone band (decision 2a). */
export type Band = "not_yet" | "pass" | "good" | "excellent"

/** What the learner reads for each status. */
export const STATUS_LABELS: Record<AttemptStatus, string> = {
  draft: "Not handed in yet",
  marking: "Being marked",
  provisional: "Marked (provisional)",
  with_david: "Being checked by David",
  final: "Marked (final)",
}

/** What the learner reads for each band. */
export const BAND_LABELS: Record<Band, string> = {
  not_yet: "Not yet",
  pass: "Pass",
  good: "Good",
  excellent: "Excellent",
}

/** The parts of a stored hand-in these rules read. */
export interface AttemptLike {
  id: string
  attemptNo: number | null
  status: AttemptStatus
  total: number | null
  band: Band | null
  confirmedAt: string | null
}

/** One line of the "what is in your hand-in" checklist. */
export interface ChecklistItem {
  id: string
  label: string
  required: boolean
  /** The paths that matched, empty when it is missing. */
  found: string[]
}

function basename(path: string): string {
  return (path.split("/").pop() ?? "").toLowerCase()
}

function extension(path: string): string {
  const name = basename(path)
  const dot = name.lastIndexOf(".")
  return dot > 0 ? name.slice(dot + 1) : ""
}

/**
 * Matches the handed-in paths against the expected files. A file matches
 * when its name contains one of the hints (an empty hint matches any name)
 * and its extension is allowed (an empty list allows any).
 */
export function matchChecklist(paths: string[], expected: ExpectedFile[]): ChecklistItem[] {
  return expected.map((item) => ({
    id: item.id,
    label: item.label,
    required: item.required,
    found: paths.filter((path) => {
      const name = basename(path)
      const extOk = item.extensions.length === 0 || item.extensions.includes(extension(path))
      return extOk && item.nameHints.some((hint) => name.includes(hint))
    }),
  }))
}

/** The required items nobody handed in. */
export function missingItems(checklist: ChecklistItem[]): ChecklistItem[] {
  return checklist.filter((item) => item.required && item.found.length === 0)
}

/** Hand-ins that were confirmed (drafts do not use up a hand-in). */
export function handedIn<T extends AttemptLike>(attempts: T[]): T[] {
  return attempts.filter((a) => a.status !== "draft")
}

/**
 * Why the learner cannot hand in again right now, or null when they can.
 * They cannot while a hand-in is still being marked or checked, because the
 * next one should answer that mark's feedback.
 */
export function handInBlockReason(attempts: AttemptLike[]): string | null {
  const done = handedIn(attempts)
  if (done.length >= MAX_HAND_INS) {
    return `You have handed this project in ${MAX_HAND_INS} times, which is the most we can mark. Your best mark counts.`
  }
  if (done.some((a) => a.status === "marking" || a.status === "with_david")) {
    return "Your last hand-in is still being marked. You can hand in again once its mark is back."
  }
  return null
}

/** The number the next confirmed hand-in gets (1, 2 or 3), or null when none is left. */
export function nextAttemptNo(attempts: AttemptLike[]): number | null {
  const used = handedIn(attempts).map((a) => a.attemptNo ?? 0)
  const next = used.length === 0 ? 1 : Math.max(...used) + 1
  return next <= MAX_HAND_INS ? next : null
}

/** True when a hand-in has a mark the learner can see (and the score can use). */
export function hasMark(attempt: AttemptLike): boolean {
  return (attempt.status === "provisional" || attempt.status === "final") && attempt.total !== null && attempt.band !== null
}

/** The points a hand-in contributes: its total, or 0 for a Not yet (decision 6a). */
export function countedPoints(attempt: AttemptLike): number {
  if (!hasMark(attempt)) return 0
  return attempt.band === "not_yet" ? 0 : Math.max(0, Math.min(100, attempt.total ?? 0))
}

/**
 * The hand-in whose mark counts: the most points; on a tie a final mark
 * beats a provisional one, then the later hand-in wins. Null when nothing has
 * a mark yet.
 */
export function bestAttempt<T extends AttemptLike>(attempts: T[]): T | null {
  let best: T | null = null
  for (const attempt of attempts) {
    if (!hasMark(attempt)) continue
    if (!best) {
      best = attempt
      continue
    }
    const diff = countedPoints(attempt) - countedPoints(best)
    const finalBeats = attempt.status === "final" && best.status !== "final"
    const sameFinality = (attempt.status === "final") === (best.status === "final")
    if (diff > 0 || (diff === 0 && (finalBeats || (sameFinality && (attempt.attemptNo ?? 0) > (best.attemptNo ?? 0))))) {
      best = attempt
    }
  }
  return best
}
