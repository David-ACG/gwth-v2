// @vitest-environment node
// Every test hand-in parses, its criteria match the capstone's marking guide,
// and its intended total and band agree with its levels (bead gwth-launch-9289.9).
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { bandFor, CAPSTONES, loadFixtures, totalFor, type FixtureCase } from "./load-fixtures"

/** The approved marking guides, from where guide-loader.ts reads them; absent in CI. */
function loadGuides(): Map<string, { criteria: { id: string; points: number }[]; basics: { id: string }[] }> {
  const guides = new Map()
  const root = process.env.MARKING_GUIDES_DIR ?? process.env.LESSON_DRAFTS_DIR ?? join(homedir(), "gwth-dashboard", "generated_lessons")
  if (!existsSync(root)) return guides
  for (const dir of readdirSync(root)) {
    const file = join(root, dir, "content", "marking_guide.json")
    if (!existsSync(file)) continue
    try {
      const g = JSON.parse(readFileSync(file, "utf8"))
      if (typeof g?.capstone === "string") guides.set(g.capstone, g)
    } catch {
      // Not a usable guide; the per-capstone test below is skipped for it.
    }
  }
  return guides
}

const guides = loadGuides()
const all: FixtureCase[] = await loadFixtures()

describe("capstone hand-in fixtures", () => {
  it("has up to five planted and several made-up cases for every capstone", () => {
    for (const capstone of CAPSTONES) {
      const mine = all.filter((c) => c.capstone === capstone)
      const planted = mine.filter((c) => c.meta.kind === "planted")
      const madeUp = mine.filter((c) => c.meta.kind === "made-up")
      expect(planted.length, capstone).toBe(5)
      expect(madeUp.length, capstone).toBeGreaterThanOrEqual(6)
      expect(new Set(madeUp.map((c) => c.meta.intended_band)), `${capstone} made-up bands`).toEqual(
        new Set(["not_yet", "pass", "good", "excellent"]),
      )
    }
  })

  it.each(all.map((c) => [`${c.capstone}/${c.caseId}`, c] as const))("%s parses and its band follows from its total and basics", (_, c) => {
    expect(c.files.length).toBeGreaterThan(0)
    for (const f of c.files) {
      expect(f.bytes.length, f.path).toBeGreaterThan(0)
      expect(f.path).not.toMatch(/\.fixture$/)
    }
    const basicsMet = c.meta.basics.every((b) => b.met)
    expect(c.meta.intended_band).toBe(bandFor(c.meta.intended_total, basicsMet))
    if (c.meta.kind === "made-up") expect(c.meta.planted_problem).toBeNull()
    else expect(c.meta.planted_problem).toEqual(expect.any(String))
  })

  describe.each(CAPSTONES)("%s against its marking guide", (capstone) => {
    const guide = guides.get(capstone)
    const cases = all.filter((c) => c.capstone === capstone)

    it.skipIf(!guide)("uses exactly the guide's criteria and basics, and totals agree with the levels", () => {
      const points = Object.fromEntries(guide!.criteria.map((c) => [c.id, c.points]))
      const criterionIds = guide!.criteria.map((c) => c.id).sort()
      const basicIds = guide!.basics.map((b) => b.id).sort()
      for (const c of cases) {
        const where = `${capstone}/${c.caseId}`
        expect(c.meta.criteria.map((x) => x.id).sort(), where).toEqual(criterionIds)
        expect(c.meta.basics.map((x) => x.id).sort(), where).toEqual(basicIds)
        expect(c.meta.intended_total, where).toBe(totalFor(c.meta.criteria, points))
      }
    })

    it.skipIf(!guide)("breaks every basics line in at least one case", () => {
      for (const b of guide!.basics) {
        expect(
          cases.some((c) => c.meta.basics.some((x) => x.id === b.id && !x.met)),
          `${capstone}: no case breaks ${b.id}`,
        ).toBe(true)
      }
    })
  })

  it("keeps the stored-name conventions: .fixture dropped, PDF text keeps the learner's .pdf name", () => {
    const m3 = all.find((c) => c.capstone === "askeveryone" && c.caseId === "m04-good-all-round")!
    const report = m3.files.find((f) => f.path === "southbridge_report.pdf.txt")!
    expect(report.originalPath).toBe("southbridge_report.pdf")
    expect(m3.files.some((f) => f.path === "sprint2/lib/score.ts")).toBe(true)
  })
})
