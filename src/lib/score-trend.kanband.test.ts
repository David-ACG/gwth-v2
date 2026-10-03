// A11 kanban-produced-branch demo (D): additive coverage for formatDeltaAbs.
import { describe, expect, it } from "vitest"
import { formatDeltaAbs } from "./score-trend"

describe("formatDeltaAbs (A11 kanban demo D)", () => {
  it("prefixes a positive delta with an explicit +", () => {
    expect(formatDeltaAbs(3)).toBe("+3")
  })
})
