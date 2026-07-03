// Additive unit coverage for score-trend delta formatters.
// Added for task A11 (no-mistakes gate REPLACE demonstration) — purely additive,
// no production code touched. Safe to close/merge.
import { describe, expect, it } from "vitest"
import { formatDeltaAbs, formatDeltaPct } from "./score-trend"

describe("formatDeltaAbs (A11 demo)", () => {
  it("prefixes positive deltas with +", () => {
    expect(formatDeltaAbs(8)).toBe("+8")
  })
  it("keeps the native sign for negative and zero", () => {
    expect(formatDeltaAbs(-12)).toBe("-12")
    expect(formatDeltaAbs(0)).toBe("0")
  })
})

describe("formatDeltaPct (A11 demo)", () => {
  it("prefixes positive percentages with + and one decimal", () => {
    expect(formatDeltaPct(8.25)).toBe("+8.3%")
  })
  it("keeps the native sign for negative and zero", () => {
    expect(formatDeltaPct(-2.4)).toBe("-2.4%")
    expect(formatDeltaPct(0)).toBe("0.0%")
  })
})
