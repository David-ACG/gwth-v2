/**
 * The "too fast" monitor (bead gwth-launch-735c, decision 2: "A, alert only").
 * Pure: it scores one account from the lesson pages the server served it.
 *
 * Starting lines from the September plan (research/2026-09-27_content-
 * protection.md, phase 3), to be tuned from real data before anything acts
 * on its own. Why they leave real students alone:
 *   - only FIRST views count, so going back over old lessons never adds up;
 *   - the time floor is a tenth of a lesson's expected time, not half, so a
 *     fast reader is fine;
 *   - every count is a rolling window, so one burst of clicking is forgiven;
 *   - no single "no mouse movement" style signal (keyboard and screen-reader
 *     users), and nothing by IP alone (offices share one).
 */

export type AccessEvent = {
  lessonId: string
  kind: "lesson_view" | "locked_lesson"
  firstView: boolean
  expectedSec: number | null
  mediaLinks: number
  createdAt: Date
  ip?: string | null
  userAgent?: string | null
}

export const LINES = {
  /** New lessons opened in 10 minutes (a month has about 30). */
  new10m: { warn: 12, alert: 20 },
  /** New lessons opened in 24 hours. */
  new24h: { warn: 35, alert: 60 },
  /** First views in a row left in under a tenth of their expected time. */
  fastRun: { warn: 8, alert: 12 },
  /** Requests for lessons the account cannot open, in 10 minutes. */
  locked10m: { warn: 5, alert: 10 },
  /** Gap regularity: coefficient of variation under this over 20+ opens. */
  regularCv: 0.15,
  regularMinOpens: 20,
} as const

/** When a lesson has no expected time, assume 15 minutes. */
export const DEFAULT_EXPECTED_SEC = 15 * 60
const FAST_SHARE = 0.1

export type Signals = {
  new10m: number
  new24h: number
  fastRun: number
  locked10m: number
  regular: boolean
  /** New lessons in the last 24 hours given media links, and how many of them were played. */
  mediaLessons24h: number
  playedLessons24h: number
  /** Median seconds spent on a new lesson in the last 24 hours (null when unknown). */
  medianDwellSec: number | null
  /** Typical expected seconds for those lessons. */
  medianExpectedSec: number | null
  browsers: number
  networks: number
  firstAt: string | null
}

export type Verdict = {
  level: "ok" | "warn" | "alert"
  reasons: string[]
  signals: Signals
}

function median(xs: number[]): number | null {
  if (xs.length === 0) return null
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? (s[mid] ?? null) : Math.round(((s[mid - 1] ?? 0) + (s[mid] ?? 0)) / 2)
}

export function scoreAccount(
  events: AccessEvent[],
  now: Date,
  played: ReadonlySet<string> = new Set()
): Verdict {
  const t = now.getTime()
  const sorted = [...events].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  const day = sorted.filter((e) => t - e.createdAt.getTime() <= 24 * 3600_000)
  const views = day.filter((e) => e.kind === "lesson_view")
  const firsts = views.filter((e) => e.firstView)
  const in10 = (e: AccessEvent) => t - e.createdAt.getTime() <= 10 * 60_000

  // Time on a new lesson = until the next lesson page this account opened.
  const dwell = new Map<AccessEvent, number>()
  for (let i = 0; i < views.length - 1; i++) {
    const here = views[i] as AccessEvent
    const next = views[i + 1] as AccessEvent
    if (here.firstView) dwell.set(here, (next.createdAt.getTime() - here.createdAt.getTime()) / 1000)
  }
  let run = 0
  let fastRun = 0
  for (const e of firsts) {
    const d = dwell.get(e)
    if (d === undefined) continue
    const floor = (e.expectedSec ?? DEFAULT_EXPECTED_SEC) * FAST_SHARE
    run = d < floor ? run + 1 : 0
    fastRun = Math.max(fastRun, run)
  }

  let regular = false
  if (firsts.length >= LINES.regularMinOpens) {
    const recent = firsts.slice(-LINES.regularMinOpens)
    const gaps = recent.slice(1).map((e, i) => e.createdAt.getTime() - (recent[i] as AccessEvent).createdAt.getTime())
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length
    if (mean > 0) {
      const sd = Math.sqrt(gaps.reduce((a, g) => a + (g - mean) ** 2, 0) / gaps.length)
      regular = sd / mean < LINES.regularCv
    }
  }

  const mediaFirsts = firsts.filter((e) => e.mediaLinks > 0)
  const signals: Signals = {
    new10m: firsts.filter(in10).length,
    new24h: firsts.length,
    fastRun,
    locked10m: day.filter((e) => e.kind === "locked_lesson" && in10(e)).length,
    regular,
    mediaLessons24h: mediaFirsts.length,
    playedLessons24h: mediaFirsts.filter((e) => played.has(e.lessonId)).length,
    medianDwellSec: median([...dwell.values()].map(Math.round)),
    medianExpectedSec: median(firsts.map((e) => e.expectedSec ?? DEFAULT_EXPECTED_SEC)),
    browsers: new Set(day.map((e) => e.userAgent ?? "")).size,
    networks: new Set(day.map((e) => e.ip ?? "")).size,
    firstAt: firsts[0]?.createdAt.toISOString() ?? null,
  }

  const reasons: string[] = []
  let level: Verdict["level"] = "ok"
  const check = (value: number, line: { warn: number; alert: number }, text: string) => {
    if (value >= line.alert) {
      level = "alert"
      reasons.push(`${text} (the line is ${line.alert})`)
    } else if (value >= line.warn && level === "ok") {
      level = "warn"
    }
  }
  check(signals.new10m, LINES.new10m, `${signals.new10m} new lessons in 10 minutes`)
  check(signals.new24h, LINES.new24h, `${signals.new24h} new lessons in 24 hours`)
  check(signals.fastRun, LINES.fastRun, `${signals.fastRun} new lessons in a row left in under a tenth of their time`)
  check(signals.locked10m, LINES.locked10m, `${signals.locked10m} tries at locked lessons in 10 minutes`)
  if (signals.regular) {
    level = "alert"
    reasons.push(`machine-regular gaps between the last ${LINES.regularMinOpens} new lessons`)
  }
  return { level, reasons, signals }
}

/** One line for the alert and the admin page. */
export function describeSignals(s: Signals): string {
  const parts = [`${s.new24h} new lessons in 24 hours`, `${s.new10m} in the last 10 minutes`]
  if (s.medianDwellSec !== null) {
    const exp = s.medianExpectedSec ? `, they take about ${Math.round(s.medianExpectedSec / 60)} minutes` : ""
    parts.push(`about ${s.medianDwellSec} s on each${exp}`)
  }
  if (s.mediaLessons24h > 0) {
    parts.push(`media links for ${s.mediaLessons24h} lessons, ${s.playedLessons24h} played`)
  }
  parts.push(`${s.browsers} browser${s.browsers === 1 ? "" : "s"}, ${s.networks} network${s.networks === 1 ? "" : "s"}`)
  return parts.join("; ")
}
