// Additive unit coverage for score-trend delta formatters (gate demonstration).
// Task A11 — proves the no-mistakes gate raises a clean PR on a hand-built branch.
// Purely additive; no production code touched. Safe to close or merge.
import { describe, expect, it } from "vitest"
import { formatDeltaAbs, formatDeltaPct } from "./score-trend"

describe("formatDeltaAbs (A11 gatecheck)", () => {
  it("prefixes positive deltas with an explicit +", () => {
    expect(formatDeltaAbs(15)).toBe("+15")
  })
  it("keeps the native sign for negative and zero", () => {
    expect(formatDeltaAbs(-7)).toBe("-7")
    expect(formatDeltaAbs(0)).toBe("0")
  })
})

describe("formatDeltaPct (A11 gatecheck)", () => {
  it("prefixes positive percentages with + and one decimal", () => {
    expect(formatDeltaPct(12.34)).toBe("+12.3%")
  })
  it("keeps the native sign for negative and zero", () => {
    expect(formatDeltaPct(-3.5)).toBe("-3.5%")
    expect(formatDeltaPct(0)).toBe("0.0%")
  })
})
