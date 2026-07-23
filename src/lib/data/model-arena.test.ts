import { describe, it, expect } from "vitest"
import {
  getArenaLabs,
  getLiveArenaLabs,
  getArchivedArenaLabs,
  getArenaLab,
  formatTestedOn,
} from "./model-arena"

describe("model-arena data", () => {
  it("exposes the job-advert pilot as a live lab", () => {
    const live = getLiveArenaLabs()
    expect(live.length).toBeGreaterThanOrEqual(1)
    const pilot = getArenaLab("job-advert-claude-vs-chatgpt")
    expect(pilot).not.toBeNull()
    expect(pilot?.status).toBe("live")
    expect(pilot?.format).toBe("model-arena")
  })

  it("gives every lab exactly two contestants and two outputs, same order", () => {
    for (const lab of getArenaLabs()) {
      expect(lab.matchup).toHaveLength(2)
      expect(lab.outputs).toHaveLength(2)
      // Outputs must reference the two named contestants.
      const names = lab.matchup.map((m) => m.name)
      for (const output of lab.outputs) {
        expect(names).toContain(output.by)
      }
    }
  })

  it("carries a rubric of 4-6 criteria and a dated verdict per lab", () => {
    for (const lab of getArenaLabs()) {
      expect(lab.rubric.length).toBeGreaterThanOrEqual(4)
      expect(lab.rubric.length).toBeLessThanOrEqual(6)
      expect(lab.verdict.callText.length).toBeGreaterThan(0)
      expect(lab.verdict.freshnessNote.length).toBeGreaterThan(0)
      expect(lab.testedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it("splits live and archived without overlap", () => {
    const live = getLiveArenaLabs()
    const archived = getArchivedArenaLabs()
    const liveSlugs = new Set(live.map((l) => l.slug))
    for (const lab of archived) {
      expect(liveSlugs.has(lab.slug)).toBe(false)
    }
  })

  it("returns null for an unknown slug", () => {
    expect(getArenaLab("does-not-exist")).toBeNull()
  })

  it("formats the tested-on date as a British long date", () => {
    expect(formatTestedOn("2026-07-23")).toBe("23 July 2026")
    // Invalid input falls back to the raw string.
    expect(formatTestedOn("not-a-date")).toBe("not-a-date")
  })
})
