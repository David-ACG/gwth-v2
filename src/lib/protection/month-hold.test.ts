// @vitest-environment node
import { describe, expect, it } from "vitest"
import { gatePercent, gateReachedAt, learnerMonths, lessonsNeeded, type MonthCompletion } from "./month-hold"

const d = (s: string) => new Date(s)
const done = (n: number, total: number, start = "2026-12-01T10:00:00Z"): MonthCompletion => ({
  total,
  completedAt: Array.from({ length: n }, (_, i) => new Date(d(start).getTime() + i * 86400_000)),
})
const GLOBAL = { month2: d("2026-12-01T00:00:00Z"), month3: d("2027-01-01T00:00:00Z") }

describe("the 75% completion gate", () => {
  it("needs 75% of the core lessons, rounded up", () => {
    expect(lessonsNeeded(26, 75)).toBe(20)
    expect(lessonsNeeded(20, 75)).toBe(15)
    expect(lessonsNeeded(0, 75)).toBe(0)
    expect(lessonsNeeded(26, 0)).toBe(0)
  })

  it("reads the setting, defaulting to 75 and clamping", () => {
    expect(gatePercent(undefined)).toBe(75)
    expect(gatePercent("")).toBe(75)
    expect(gatePercent("60")).toBe(60)
    expect(gatePercent("0")).toBe(0)
    expect(gatePercent("150")).toBe(100)
    expect(gatePercent("x")).toBe(75)
  })

  it("is reached when the lesson that crosses the line is finished", () => {
    expect(gateReachedAt(done(19, 26), 75)).toBeNull()
    expect(gateReachedAt(done(20, 26), 75)?.toISOString()).toBe("2026-12-20T10:00:00.000Z")
  })

  it("holds Month 2 (not open, clock held) until 75% of Month 1 is done", () => {
    const r = learnerMonths({ global: GLOBAL, percent: 75, gate: { 1: done(5, 26), 2: done(0, 20) }, flags: [] })
    expect(r.cap).toEqual({ month: 2, reason: "progress" })
    expect(r.release.month2).toBeNull()
    expect(r.release.month3).toBeNull()
  })

  it("opens Month 2 from the moment they reached the gate, Month 3 waits for Month 2", () => {
    const r = learnerMonths({ global: GLOBAL, percent: 75, gate: { 1: done(20, 26), 2: done(3, 20) }, flags: [] })
    expect(r.cap).toEqual({ month: 3, reason: "progress" })
    expect(r.release.month2?.toISOString()).toBe("2026-12-20T10:00:00.000Z")
    expect(r.release.month3).toBeNull()
  })

  it("never opens a month before it opens for everyone", () => {
    const early = { month2: null, month3: null }
    const r = learnerMonths({ global: early, percent: 75, gate: { 1: done(26, 26), 2: done(20, 20) }, flags: [] })
    expect(r.cap).toBeNull()
    expect(r.release).toEqual({ month2: null, month3: null })
  })

  it("does nothing when the gate does not apply (testers, gate off)", () => {
    const r = learnerMonths({ global: GLOBAL, percent: 75, gate: null, flags: [] })
    expect(r.cap).toBeNull()
    expect(r.release).toEqual(GLOBAL)
  })
})

describe("the review hold", () => {
  it("holds the next month while a flag is open, whatever their progress", () => {
    const r = learnerMonths({
      global: GLOBAL,
      percent: 75,
      gate: { 1: done(26, 26), 2: done(20, 20) },
      flags: [{ status: "open", heldMonth: 2, clearedAt: null }],
    })
    expect(r.cap).toEqual({ month: 2, reason: "review" })
    expect(r.release).toEqual({ month2: null, month3: null })
  })

  it("restarts the clock from the moment David clears it", () => {
    const cleared = d("2026-12-25T09:00:00Z")
    const r = learnerMonths({
      global: GLOBAL,
      percent: 75,
      gate: null,
      flags: [{ status: "cleared", heldMonth: 2, clearedAt: cleared }],
    })
    expect(r.cap).toBeNull()
    expect(r.release.month2?.toISOString()).toBe(cleared.toISOString())
    expect(r.release.month3?.toISOString()).toBe(GLOBAL.month3.toISOString())
  })

  it("prefers the review reason when both hold the same month", () => {
    const r = learnerMonths({
      global: GLOBAL,
      percent: 75,
      gate: { 1: done(2, 26), 2: done(0, 20) },
      flags: [{ status: "open", heldMonth: 2, clearedAt: null }],
    })
    expect(r.cap).toEqual({ month: 2, reason: "review" })
  })
})
