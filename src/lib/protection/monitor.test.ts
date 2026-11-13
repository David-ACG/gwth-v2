// @vitest-environment node
import { describe, expect, it } from "vitest"
import { scoreAccount, describeSignals, type AccessEvent } from "./monitor"

const NOW = new Date("2026-11-12T21:20:00Z")
const at = (minAgo: number) => new Date(NOW.getTime() - minAgo * 60_000)
const view = (lessonId: string, minAgo: number, first = true, extra: Partial<AccessEvent> = {}): AccessEvent => ({
  lessonId,
  kind: "lesson_view",
  firstView: first,
  expectedSec: 18 * 60,
  mediaLinks: 2,
  createdAt: at(minAgo),
  ...extra,
})

describe("scoreAccount", () => {
  it("leaves a real learner alone: a few lessons at a normal pace", () => {
    const events = [view("m1_l01", 300), view("m1_l02", 270), view("m1_l03", 240), view("m1_l04", 200)]
    const v = scoreAccount(events, NOW)
    expect(v.level).toBe("ok")
    expect(v.reasons).toEqual([])
  })

  it("never counts going back over old lessons", () => {
    const events = Array.from({ length: 40 }, (_, i) => view(`m1_l${String((i % 5) + 1).padStart(2, "0")}`, 9 - i * 0.2, false))
    expect(scoreAccount(events, NOW).level).toBe("ok")
  })

  it("forgives one burst of clicking around (warns, does not alert)", () => {
    const events = Array.from({ length: 10 }, (_, i) => view(`m1_l${String(i + 1).padStart(2, "0")}`, 9 - i * 0.6))
    const v = scoreAccount(events, NOW)
    expect(v.level).toBe("warn")
  })

  it("alerts on the copier: 23 new lessons in 15 minutes at about 30 seconds each", () => {
    const events = Array.from({ length: 23 }, (_, i) => view(`m1_l${String(i + 1).padStart(2, "0")}`, 11.5 - i * 0.5))
    const v = scoreAccount(events, NOW)
    expect(v.level).toBe("alert")
    expect(v.signals.new10m).toBeGreaterThanOrEqual(20)
    expect(v.signals.fastRun).toBeGreaterThanOrEqual(12)
    expect(v.signals.medianDwellSec).toBe(30)
    expect(v.reasons.join(" ")).toMatch(/new lessons in 10 minutes \(the line is 20\)/)
    expect(describeSignals(v.signals)).toMatch(/media links for 23 lessons, 0 played/)
  })

  it("alerts on many tries at locked lessons", () => {
    const events: AccessEvent[] = Array.from({ length: 10 }, (_, i) => ({
      lessonId: `m2_l${String(i + 1).padStart(2, "0")}`,
      kind: "locked_lesson",
      firstView: false,
      expectedSec: null,
      mediaLinks: 0,
      createdAt: at(9 - i * 0.5),
    }))
    expect(scoreAccount(events, NOW).level).toBe("alert")
  })

  it("alerts on machine-regular gaps even at a slower pace", () => {
    const events = Array.from({ length: 22 }, (_, i) => view(`m1_l${String(i + 1).padStart(2, "0")}`, 22 * 4 - i * 4))
    const v = scoreAccount(events, NOW)
    expect(v.signals.regular).toBe(true)
    expect(v.level).toBe("alert")
  })

  it("counts lessons whose media was actually played", () => {
    const events = [view("m1_l01", 20), view("m1_l02", 10)]
    const v = scoreAccount(events, NOW, new Set(["m1_l01"]))
    expect(v.signals.mediaLessons24h).toBe(2)
    expect(v.signals.playedLessons24h).toBe(1)
  })
})
