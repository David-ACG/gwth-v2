/** First-party lesson events: the client-side allow-list (bead gwth-launch-hqyp). */
import { describe, expect, it } from "vitest"
import { CLIENT_LESSON_EVENTS, MAX_NOTE_CHARS, isValidSessionId, sanitizeLessonEvent } from "./lesson-events"

/** A detail that satisfies the events with required fields. */
function detailFor(event: string): Record<string, unknown> {
  if (event === "rating") return { value: "good" }
  if (event === "confused_note" || event === "rating_note") return { note: "hard to follow" }
  return {}
}

describe("sanitizeLessonEvent", () => {
  it.each([...CLIENT_LESSON_EVENTS])("accepts the client event %s", (event) => {
    const out = sanitizeLessonEvent({ event, partIndex: 2, format: "read", detail: detailFor(event) })
    expect(out).not.toBeNull()
    expect(out?.event).toBe(event)
    expect(out?.partIndex).toBe(2)
    expect(out?.format).toBe("read")
  })

  it.each(["check_answer", "lesson_completed"])("refuses the server-only event %s", (event) => {
    expect(sanitizeLessonEvent({ event, partIndex: 0, detail: { option: 1, correct: true } })).toBeNull()
  })

  it.each(["", "unknown", "LESSON_OPENED", "part_opened "])("refuses the unknown event %j", (event) => {
    expect(sanitizeLessonEvent({ event })).toBeNull()
  })

  it("refuses non-object input and a non-string event", () => {
    expect(sanitizeLessonEvent(null as unknown as { event: string })).toBeNull()
    expect(sanitizeLessonEvent({ event: 5 as unknown as string })).toBeNull()
  })

  it("rating needs value bad | fine | good", () => {
    for (const value of ["bad", "fine", "good"]) {
      expect(sanitizeLessonEvent({ event: "rating", detail: { value } })?.detail.value).toBe(value)
    }
    expect(sanitizeLessonEvent({ event: "rating", detail: { value: "great" } })).toBeNull()
    expect(sanitizeLessonEvent({ event: "rating", detail: {} })).toBeNull()
    expect(sanitizeLessonEvent({ event: "rating" })).toBeNull()
  })

  it.each(["confused_note", "rating_note"])("%s needs a non-empty note", (event) => {
    expect(sanitizeLessonEvent({ event, detail: { note: "why" } })).not.toBeNull()
    expect(sanitizeLessonEvent({ event, detail: { note: "   " } })).toBeNull()
    expect(sanitizeLessonEvent({ event, detail: { note: "" } })).toBeNull()
    expect(sanitizeLessonEvent({ event, detail: { note: 5 } })).toBeNull()
    expect(sanitizeLessonEvent({ event, detail: {} })).toBeNull()
  })

  it("truncates a note to 2000 chars and other strings to 80", () => {
    expect(MAX_NOTE_CHARS).toBe(2000)
    const out = sanitizeLessonEvent({
      event: "confused_note",
      detail: { note: "n".repeat(2400), where: "w".repeat(200) },
    })
    expect(out).not.toBeNull()
    expect((out!.detail.note as string).length).toBe(2000)
    expect((out!.detail.where as string).length).toBe(80)
  })

  it("drops invalid detail keys and unsupported value types, rounds numbers", () => {
    const out = sanitizeLessonEvent({
      event: "media_play",
      detail: {
        kind: "audio",
        t: 12.3456,
        ok: true,
        gone: null,
        "bad-key": "x",
        key1: "digits not allowed",
        [`k${"a".repeat(30)}`]: "too long",
        nested: { a: 1 },
        list: [1, 2],
        inf: Infinity,
        nan: Number.NaN,
      },
    })
    expect(out?.detail).toEqual({ kind: "audio", t: 12.35, ok: true, gone: null })
  })

  it("partIndex outside 0..49 or not an integer becomes null", () => {
    for (const partIndex of [-1, 50, 1.5, Number.NaN, null, undefined]) {
      expect(sanitizeLessonEvent({ event: "part_opened", partIndex })?.partIndex).toBeNull()
    }
    expect(sanitizeLessonEvent({ event: "part_opened", partIndex: "3" as unknown as number })?.partIndex).toBeNull()
    expect(sanitizeLessonEvent({ event: "part_opened", partIndex: 0 })?.partIndex).toBe(0)
    expect(sanitizeLessonEvent({ event: "part_opened", partIndex: 49 })?.partIndex).toBe(49)
  })

  it("format is only read or watch", () => {
    expect(sanitizeLessonEvent({ event: "part_opened", format: "watch" })?.format).toBe("watch")
    expect(sanitizeLessonEvent({ event: "part_opened", format: "read" })?.format).toBe("read")
    for (const format of ["listen", "READ", "", null, undefined]) {
      expect(sanitizeLessonEvent({ event: "part_opened", format })?.format).toBeNull()
    }
  })

  it("a missing detail becomes {}", () => {
    expect(sanitizeLessonEvent({ event: "back", detail: null })?.detail).toEqual({})
    expect(sanitizeLessonEvent({ event: "back" })?.detail).toEqual({})
  })
})

describe("isValidSessionId", () => {
  it("accepts 8..64 url-safe characters", () => {
    expect(isValidSessionId("abcdEFGH")).toBe(true)
    expect(isValidSessionId("a1_b2-c3d4")).toBe(true)
    expect(isValidSessionId("x".repeat(64))).toBe(true)
  })

  it("refuses short, long, odd characters and non-strings", () => {
    expect(isValidSessionId("abc1234")).toBe(false)
    expect(isValidSessionId("x".repeat(65))).toBe(false)
    expect(isValidSessionId("abcd efgh")).toBe(false)
    expect(isValidSessionId("abcd/efgh")).toBe(false)
    expect(isValidSessionId("")).toBe(false)
    expect(isValidSessionId(12345678)).toBe(false)
    expect(isValidSessionId(null)).toBe(false)
    expect(isValidSessionId(undefined)).toBe(false)
  })
})
