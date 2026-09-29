/**
 * First-party lesson events (bead gwth-launch-hqyp). Pure: shared by the
 * browser tracker, the /api/lesson-events route and the admin report.
 *
 * `check_answer` and `lesson_completed` are written by the server when it
 * grades an answer, so the browser can never forge them; they are refused here.
 */
import type { LessonFormat } from "./parts"

export const CLIENT_LESSON_EVENTS = [
  "lesson_opened", // detail: {returning}
  "part_opened", // the learner is looking at part N
  "continue", // pressed Continue / Next on part N
  "back", // pressed Back on part N
  "media_play", // detail: {kind: "audio" | "video", t}
  "media_pause", // detail: {kind, t}
  "media_ended", // detail: {kind}
  "read_along", // detail: {on}
  "read_instead", // opened "Read this part instead" (watch format)
  "format_chosen", // first choice screen; detail: {to}
  "format_switched", // Watch / Read switch; detail: {from, to, where}
  "again", // "Watch that bit again" / "Read that bit again" / "Listen to this part again"; detail: {from}
  "confused", // "This part confused me"
  "confused_note", // detail: {note}
  "rating", // detail: {value: "bad" | "fine" | "good"}
  "rating_note", // detail: {note}
  "rating_dismissed",
  "left", // page hidden or closed; detail: {screen}
] as const

export type ClientLessonEvent = (typeof CLIENT_LESSON_EVENTS)[number]
export type ServerLessonEvent = "check_answer" | "lesson_completed"
export type LessonEventName = ClientLessonEvent | ServerLessonEvent

export interface LessonEventInput {
  event: string
  partIndex?: number | null
  format?: string | null
  detail?: Record<string, unknown> | null
}

export interface SanitizedLessonEvent {
  event: ClientLessonEvent
  partIndex: number | null
  format: LessonFormat | null
  detail: Record<string, unknown>
}

export const MAX_EVENTS_PER_BATCH = 50
export const MAX_NOTE_CHARS = 2000
const MAX_DETAIL_CHARS = 2500

const EVENT_SET: ReadonlySet<string> = new Set(CLIENT_LESSON_EVENTS)

function cleanDetail(detail: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(detail).slice(0, 12)) {
    if (!/^[a-zA-Z_]{1,24}$/.test(key)) continue
    if (typeof value === "string") out[key] = value.slice(0, key === "note" ? MAX_NOTE_CHARS : 80)
    else if (typeof value === "number" && Number.isFinite(value)) out[key] = Math.round(value * 100) / 100
    else if (typeof value === "boolean" || value === null) out[key] = value
  }
  return out
}

/** A valid client event, or null. */
export function sanitizeLessonEvent(input: LessonEventInput): SanitizedLessonEvent | null {
  if (!input || typeof input.event !== "string" || !EVENT_SET.has(input.event)) return null
  const partIndex =
    typeof input.partIndex === "number" && Number.isInteger(input.partIndex) && input.partIndex >= 0 && input.partIndex < 50
      ? input.partIndex
      : null
  const format = input.format === "read" || input.format === "watch" ? input.format : null
  const detail = input.detail && typeof input.detail === "object" ? cleanDetail(input.detail) : {}
  if (JSON.stringify(detail).length > MAX_DETAIL_CHARS) return null
  if ((input.event === "confused_note" || input.event === "rating_note") && !(typeof detail.note === "string" && detail.note.trim())) {
    return null
  }
  if (input.event === "rating" && !["bad", "fine", "good"].includes(String(detail.value))) return null
  return { event: input.event as ClientLessonEvent, partIndex, format, detail }
}

/** A session id the browser generates per page load. */
export function isValidSessionId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(value)
}
