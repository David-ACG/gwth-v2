/** How far forward the parts viewer may go (bead gwth-launch-hqyp). */
import { describe, expect, it, vi } from "vitest"

// The viewer module imports server actions; only the pure helper is under test.
vi.mock("@/lib/actions/lesson-parts", () => ({
  answerPartCheckAction: vi.fn(),
  saveLessonPrefsAction: vi.fn(),
}))

import { EMPTY_CHECK, type ClientCheck } from "./check-card"
import { maxOpenScreen } from "./parts-lesson-viewer"

const resolved: ClientCheck = { ...EMPTY_CHECK, tries: 1, resolved: true, rightPick: 0 }
const ids = ["p1", "p2", "p3"]

describe("maxOpenScreen", () => {
  it("opens only the first part when nothing is resolved", () => {
    expect(maxOpenScreen(ids, {})).toBe(1)
    expect(maxOpenScreen(ids, { p1: EMPTY_CHECK })).toBe(1)
  })

  it("opens the next part after each resolved one", () => {
    expect(maxOpenScreen(ids, { p1: resolved })).toBe(2)
    expect(maxOpenScreen(ids, { p1: resolved, p2: resolved })).toBe(3)
  })

  it("stops at the first unresolved part even if a later one is resolved", () => {
    expect(maxOpenScreen(ids, { p1: resolved, p3: resolved })).toBe(2)
  })

  it("opens the end screen (n + 1) when every part is resolved", () => {
    expect(maxOpenScreen(ids, { p1: resolved, p2: resolved, p3: resolved })).toBe(4)
  })

  it("an empty lesson opens the end screen", () => {
    expect(maxOpenScreen([], {})).toBe(1)
  })
})
