import { describe, expect, it } from "vitest"
import {
  computeScoreTrend,
  formatDeltaAbs,
  formatDeltaPct,
  SCORE_TREND_STABLE_THRESHOLD,
} from "./score-trend"

describe("computeScoreTrend", () => {
  it("classifies a clear up-trend", () => {
    const r = computeScoreTrend([55, 80, 104])
    expect(r.previous).toBe(55)
    expect(r.current).toBe(104)
    expect(r.deltaAbs).toBe(49)
    expect(r.deltaPct).toBeCloseTo(89.09, 1)
    expect(r.direction).toBe("up")
  })

  it("classifies a clear down-trend", () => {
    const r = computeScoreTrend([120, 110, 95])
    expect(r.deltaAbs).toBe(-25)
    expect(r.deltaPct).toBeCloseTo(-20.83, 1)
    expect(r.direction).toBe("down")
  })

  it("classifies a tiny positive change as stable (under 3 points)", () => {
    const r = computeScoreTrend([102, 103, 104])
    expect(r.deltaAbs).toBe(2)
    expect(r.direction).toBe("stable")
  })

  it("classifies a tiny negative change as stable", () => {
    const r = computeScoreTrend([105, 104, 103])
    expect(r.deltaAbs).toBe(-2)
    expect(r.direction).toBe("stable")
  })

  it("treats exactly the threshold as a real direction (not stable)", () => {
    const up = computeScoreTrend([100, 103])
    expect(up.deltaAbs).toBe(SCORE_TREND_STABLE_THRESHOLD)
    expect(up.direction).toBe("up")
    const down = computeScoreTrend([100, 97])
    expect(down.deltaAbs).toBe(-SCORE_TREND_STABLE_THRESHOLD)
    expect(down.direction).toBe("down")
  })

  it("treats no change as stable", () => {
    const r = computeScoreTrend([100, 100, 100])
    expect(r.direction).toBe("stable")
    expect(r.deltaPct).toBe(0)
  })

  it("guards division by zero when previous is 0", () => {
    const r = computeScoreTrend([0, 5])
    expect(r.deltaPct).toBe(0)
    expect(r.direction).toBe("up")
  })

  it("treats a single-entry history as stable", () => {
    const r = computeScoreTrend([42])
    expect(r.deltaAbs).toBe(0)
    expect(r.direction).toBe("stable")
  })

  it("throws on empty history", () => {
    expect(() => computeScoreTrend([])).toThrow()
  })
})

describe("formatDeltaAbs", () => {
  it("prefixes positive with +", () => {
    expect(formatDeltaAbs(8)).toBe("+8")
  })
  it("keeps negative sign", () => {
    expect(formatDeltaAbs(-12)).toBe("-12")
  })
  it("renders zero without sign", () => {
    expect(formatDeltaAbs(0)).toBe("0")
  })
})

describe("formatDeltaPct", () => {
  it("prefixes positive with + and one decimal", () => {
    expect(formatDeltaPct(8.34)).toBe("+8.3%")
  })
  it("keeps negative sign with one decimal", () => {
    expect(formatDeltaPct(-2.44)).toBe("-2.4%")
  })
  it("renders zero as 0.0%", () => {
    expect(formatDeltaPct(0)).toBe("0.0%")
  })
})
