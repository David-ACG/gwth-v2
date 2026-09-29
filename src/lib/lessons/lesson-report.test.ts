import { describe, expect, it } from "vitest"
import { buildLessonReport, type ReportEvent } from "./lesson-report"

const parts = [
  { id: "p1", title: "One", minutes: 5 },
  { id: "p2", title: "Two", minutes: 5 },
  { id: "p3", title: "Three", minutes: 5 },
]

let clock = 0
function ev(userId: string, event: string, partIndex: number | null, format: "read" | "watch", detail: Record<string, unknown> = {}, minutes = 0): ReportEvent {
  clock += minutes * 60000 + 1
  return { userId, sessionId: `s-${userId}`, event, partIndex, format, detail, at: clock }
}

/** A learner who opens parts 0..upTo, answering each first try as given. */
function walk(user: string, format: "read" | "watch", upTo: number, firstRight: boolean[], complete = false): ReportEvent[] {
  const out: ReportEvent[] = []
  for (let i = 0; i <= upTo; i++) {
    out.push(ev(user, "part_opened", i, format))
    const right = firstRight[i] ?? true
    out.push(ev(user, "check_answer", i, format, { option: 0, correct: right, try: 1 }, 4))
    if (!right) out.push(ev(user, "check_answer", i, format, { option: 1, correct: true, try: 2 }))
    out.push(ev(user, "continue", i, format, {}, 2))
  }
  if (complete) out.push(ev(user, "lesson_completed", upTo, format))
  return out
}

describe("buildLessonReport", () => {
  it("counts reach, right first time, time and completion", () => {
    const events = [
      ...walk("a", "read", 2, [true, true, true], true),
      ...walk("b", "read", 2, [true, false, true], true),
      ...walk("c", "watch", 0, [true]),
      ...walk("d", "watch", 1, [false, false]),
    ]
    const r = buildLessonReport(events, parts)
    expect(r.started).toBe(4)
    expect(r.completed).toBe(2)
    expect(r.completedPct).toBe(50)
    expect(r.parts.map((p) => p.reached)).toEqual([4, 3, 2])
    expect(r.parts.map((p) => p.reachedPct)).toEqual([100, 75, 50])
    expect(r.parts[0]!.rightFirstTimePct).toBe(75)
    expect(r.parts[1]!.rightFirstTimePct).toBe(33)
    expect(r.parts[0]!.medianMinutes).toBeCloseTo(6, 0)
    expect(r.parts[0]!.stoppedHere).toBe(1) // c
    expect(r.parts[1]!.stoppedHere).toBe(1) // d
    expect(r.smallSample).toBe(true)
  })

  it("flags a stall on a big drop, low right-first-time or many confused", () => {
    const events: ReportEvent[] = []
    for (const u of ["a", "b", "c", "d", "e"]) events.push(...walk(u, "read", 0, [true]))
    events.push(...walk("a", "read", 1, [true, false]).slice(4))
    events.push(ev("a", "confused", 0, "read"), ev("b", "confused", 0, "read"))
    const r = buildLessonReport(events, parts)
    expect(r.parts[0]!.stall).toBe(true)
    expect(r.parts[0]!.stallReasons.join(" ")).toMatch(/confused/)
    expect(r.parts[1]!.stall).toBe(true)
    expect(r.parts[1]!.stallReasons.join(" ")).toMatch(/fewer reached/)
    expect(r.parts[1]!.stallReasons.join(" ")).toMatch(/right first time/)
  })

  it("splits by format using the format of each event", () => {
    const events = [...walk("a", "read", 1, [true, true]), ...walk("b", "watch", 1, [false, true])]
    const read = buildLessonReport(events, parts, "read")
    const watch = buildLessonReport(events, parts, "watch")
    expect(read.parts[0]!.reached).toBe(1)
    expect(read.parts[0]!.rightFirstTimePct).toBe(100)
    expect(watch.parts[0]!.rightFirstTimePct).toBe(0)
    expect(read.parts[0]!.stoppedHere).toBe(0) // only reported for both formats
  })

  it("keeps each learner's latest rating, with notes and confused notes", () => {
    const events = [
      ev("a", "rating", 2, "read", { value: "bad" }),
      ev("a", "rating", 2, "read", { value: "good" }),
      ev("a", "rating_note", 2, "read", { note: "Clear, thanks" }),
      ev("b", "rating", 2, "watch", { value: "fine" }),
      ev("b", "confused", 1, "watch"),
      ev("b", "confused_note", 1, "watch", { note: "Lost at the table" }),
      ev("c", "format_chosen", null, "watch", { to: "watch" }),
      ev("c", "format_switched", 0, "read", { from: "watch", to: "read" }),
    ]
    const r = buildLessonReport(events, parts)
    expect(r.ratings).toEqual({ bad: 0, fine: 1, good: 1, total: 2 })
    expect(r.ratingNotes[0]).toMatchObject({ value: "good", note: "Clear, thanks" })
    expect(r.confusedNotes[0]).toMatchObject({ partIndex: 1, note: "Lost at the table" })
    expect(r.formatSwitches).toBe(1)
    expect(r.formatChoices).toEqual({ read: 0, watch: 1 })
  })

  it("is empty but well formed with no events", () => {
    const r = buildLessonReport([], parts)
    expect(r.started).toBe(0)
    expect(r.parts).toHaveLength(3)
    expect(r.parts.every((p) => p.reachedPct === null && !p.stall)).toBe(true)
  })
})
