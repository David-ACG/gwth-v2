/**
 * Tests for the browser memory of a learner's place in a lesson (bead
 * gwth-launch-8ta).
 */
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  readLessonPage,
  readQuizDraft,
  writeLessonPage,
  writeQuizDraft,
} from "./lesson-resume"

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe("lesson page memory", () => {
  it("round-trips the page per lesson", () => {
    writeLessonPage("a", 4)
    writeLessonPage("b", 2)
    expect(readLessonPage("a", 10)).toBe(4)
    expect(readLessonPage("b", 10)).toBe(2)
    expect(readLessonPage("c", 10)).toBeNull()
  })

  it("ignores a page the lesson no longer has, or garbage", () => {
    writeLessonPage("a", 9)
    expect(readLessonPage("a", 5)).toBeNull()
    window.localStorage.setItem("gwth-lesson-page:a", "two")
    expect(readLessonPage("a", 5)).toBeNull()
  })

  it("never throws when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    expect(() => writeLessonPage("a", 2)).not.toThrow()
    expect(readLessonPage("a", 5)).toBeNull()
    expect(() => writeQuizDraft("a", { q1: 1 })).not.toThrow()
    expect(readQuizDraft("a")).toEqual({})
  })
})

describe("quiz draft memory", () => {
  it("round-trips answers and clears on an empty set", () => {
    writeQuizDraft("a", { q1: 1, q2: 0 })
    expect(readQuizDraft("a")).toEqual({ q1: 1, q2: 0 })
    writeQuizDraft("a", {})
    expect(window.localStorage.getItem("gwth-lesson-quiz-draft:a")).toBeNull()
  })

  it("drops malformed values", () => {
    window.localStorage.setItem(
      "gwth-lesson-quiz-draft:a",
      JSON.stringify({ q1: 1, q2: "x", q3: -1, q4: 1.5 })
    )
    expect(readQuizDraft("a")).toEqual({ q1: 1 })
    window.localStorage.setItem("gwth-lesson-quiz-draft:a", "{not json")
    expect(readQuizDraft("a")).toEqual({})
  })
})
