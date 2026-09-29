/**
 * The per-lesson admin report for lessons in parts (bead gwth-launch-hqyp).
 * Pure: turns the lesson's first-party events into the numbers David asked
 * for (2026-09-28): reached %, right first time %, time against expected,
 * played the audio or video %, confused taps, the rating split and notes, and
 * a stall flag, optionally for one format only.
 *
 * A learner counts in a format for the events they produced while in it, so
 * someone who switched halfway shows up in both columns for the parts they
 * took in each.
 */
import type { LessonFormat } from "./parts"

export interface ReportEvent {
  userId: string
  sessionId: string
  event: string
  partIndex: number | null
  format: string | null
  detail: Record<string, unknown>
  /** Epoch milliseconds. */
  at: number
}

export interface ReportPart {
  id: string
  title: string
  minutes: number
}

export type ReportFilter = "all" | LessonFormat

export interface PartRow {
  index: number
  title: string
  expectedMinutes: number
  reached: number
  /** Of the learners who opened part 1, the share who opened this part. */
  reachedPct: number | null
  answeredFirst: number
  rightFirstTimePct: number | null
  /** Median minutes from opening the part to pressing Continue. */
  medianMinutes: number | null
  timeSamples: number
  playedPct: number | null
  confused: number
  confusedPct: number | null
  /** Learners whose last activity in this lesson was on this part, not finished. */
  stoppedHere: number
  stall: boolean
  stallReasons: string[]
}

export interface LessonReport {
  filter: ReportFilter
  learners: number
  started: number
  completed: number
  completedPct: number | null
  parts: PartRow[]
  ratings: { bad: number; fine: number; good: number; total: number }
  ratingNotes: { value: string; note: string; at: number }[]
  confusedNotes: { partIndex: number; note: string; at: number }[]
  formatSwitches: number
  formatChoices: { read: number; watch: number }
  smallSample: boolean
}

/** Below this many learners the flags are shown as early signals only. */
export const SMALL_SAMPLE = 5
export const STALL_DROP_POINTS = 20
export const STALL_RIGHT_FIRST_PCT = 50
export const STALL_CONFUSED_PCT = 25

function pct(n: number, d: number): number | null {
  return d > 0 ? Math.round((100 * n) / d) : null
}

function median(xs: number[]): number | null {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b)
  const mid = s.length >> 1
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2
}

export function buildLessonReport(events: ReportEvent[], parts: ReportPart[], filter: ReportFilter = "all"): LessonReport {
  const inFilter = (e: ReportEvent) => filter === "all" || e.format === filter
  const ordered = [...events].sort((a, b) => a.at - b.at)
  const n = parts.length

  const usersAll = new Set(ordered.map((e) => e.userId))
  const opened = parts.map(() => new Set<string>())
  const played = parts.map(() => new Set<string>())
  const confused = parts.map(() => new Set<string>())
  const firstTry = parts.map(() => new Map<string, boolean>())
  const times = parts.map(() => [] as number[])
  const completedUsers = new Set<string>()
  const confusedNotes: LessonReport["confusedNotes"] = []
  const ratingByUser = new Map<string, { value: string; at: number }>()
  const ratingNotes: LessonReport["ratingNotes"] = []
  let formatSwitches = 0
  const formatChoices = { read: 0, watch: 0 }
  // session:part -> when it was opened (first time), for time on part
  const openedAt = new Map<string, number>()
  const lastPart = new Map<string, number>()

  for (const e of ordered) {
    const i = e.partIndex
    const hasPart = typeof i === "number" && i >= 0 && i < n
    if (e.event === "lesson_completed" && inFilter(e)) completedUsers.add(e.userId)
    if (hasPart && e.event !== "left") lastPart.set(e.userId, Math.max(lastPart.get(e.userId) ?? -1, i))
    if (e.event === "format_switched") formatSwitches += 1
    if (e.event === "format_chosen" && (e.detail.to === "read" || e.detail.to === "watch")) formatChoices[e.detail.to] += 1
    if (e.event === "rating" && typeof e.detail.value === "string") ratingByUser.set(e.userId, { value: e.detail.value, at: e.at })
    if (e.event === "rating_note" && typeof e.detail.note === "string") {
      ratingNotes.push({ value: ratingByUser.get(e.userId)?.value ?? "", note: e.detail.note, at: e.at })
    }
    if (!inFilter(e) || !hasPart) continue
    switch (e.event) {
      case "part_opened": {
        opened[i]!.add(e.userId)
        const key = `${e.sessionId}:${i}`
        if (!openedAt.has(key)) openedAt.set(key, e.at)
        break
      }
      case "continue": {
        const key = `${e.sessionId}:${i}`
        const t0 = openedAt.get(key)
        if (t0 !== undefined) {
          times[i]!.push((e.at - t0) / 60000)
          openedAt.delete(key)
        }
        break
      }
      case "media_play":
        played[i]!.add(e.userId)
        break
      case "confused":
        confused[i]!.add(e.userId)
        break
      case "confused_note":
        if (typeof e.detail.note === "string") confusedNotes.push({ partIndex: i, note: e.detail.note, at: e.at })
        break
      case "check_answer":
        if (e.detail.try === 1 && !firstTry[i]!.has(e.userId)) firstTry[i]!.set(e.userId, e.detail.correct === true)
        break
    }
  }

  const started = opened[0]?.size ?? 0
  const stopped = parts.map(() => 0)
  for (const [user, i] of lastPart) {
    if (!completedUsers.has(user)) stopped[i] = (stopped[i] ?? 0) + 1
  }
  const small = started < SMALL_SAMPLE

  const rows: PartRow[] = parts.map((p, i) => {
    const reached = opened[i]!.size
    const answers = [...firstTry[i]!.values()]
    const right = answers.filter(Boolean).length
    const reachedPct = pct(reached, started)
    const rightPct = pct(right, answers.length)
    const confusedPct = pct(confused[i]!.size, reached)
    const reasons: string[] = []
    if (i > 0) {
      const prev = pct(opened[i - 1]!.size, started)
      if (prev !== null && reachedPct !== null && prev - reachedPct >= STALL_DROP_POINTS) {
        reasons.push(`${prev - reachedPct} points fewer reached this part than the one before`)
      }
    }
    if (rightPct !== null && rightPct < STALL_RIGHT_FIRST_PCT) reasons.push(`only ${rightPct}% right first time`)
    if (confusedPct !== null && confusedPct >= STALL_CONFUSED_PCT) reasons.push(`${confusedPct}% said it confused them`)
    return {
      index: i,
      title: p.title,
      expectedMinutes: p.minutes,
      reached,
      reachedPct,
      answeredFirst: answers.length,
      rightFirstTimePct: rightPct,
      medianMinutes: (() => {
        const m = median(times[i]!)
        return m === null ? null : Math.round(m * 10) / 10
      })(),
      timeSamples: times[i]!.length,
      playedPct: pct(played[i]!.size, reached),
      confused: confused[i]!.size,
      confusedPct,
      stoppedHere: filter === "all" ? (stopped[i] ?? 0) : 0,
      stall: reasons.length > 0,
      stallReasons: reasons,
    }
  })

  const ratings = { bad: 0, fine: 0, good: 0, total: 0 }
  for (const { value } of ratingByUser.values()) {
    if (value === "bad" || value === "fine" || value === "good") {
      ratings[value] += 1
      ratings.total += 1
    }
  }

  return {
    filter,
    learners: usersAll.size,
    started,
    completed: completedUsers.size,
    completedPct: pct(completedUsers.size, started),
    parts: rows,
    ratings,
    ratingNotes: ratingNotes.sort((a, b) => b.at - a.at),
    confusedNotes: confusedNotes.sort((a, b) => b.at - a.at),
    formatSwitches,
    formatChoices,
    smallSample: small,
  }
}
