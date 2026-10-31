// @vitest-environment node
// The script checks over every planted and made-up hand-in (bead 9289.9),
// against the published marking guides. Skipped where the guides are not on
// disk (CI); on hlab they are in ~/gwth-dashboard/generated_lessons.
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
import { runScriptChecks, type ScriptChecks } from "./checks"
import { markingGuideFromJson, type MarkingGuide } from "./guide-loader"
import { asText } from "./preview"
import { Redactor } from "./redact"
import { loadFixtures, type FixtureCase } from "./fixtures/load-fixtures"

const ROOT = process.env.MARKING_GUIDES_DIR ?? join(homedir(), "gwth-dashboard", "generated_lessons")
const guides = new Map<string, MarkingGuide>()
if (existsSync(ROOT)) {
  for (const dir of readdirSync(ROOT)) {
    const file = join(ROOT, dir, "content", "marking_guide.json")
    if (!existsSync(file)) continue
    const guide = markingGuideFromJson(JSON.parse(readFileSync(file, "utf8")))
    if (guide) guides.set(guide.capstone, guide)
  }
}
const describeGuides = guides.size === 3 ? describe : describe.skip

describeGuides("script checks on the test hand-ins", () => {
  let cases: FixtureCase[]
  const results = new Map<string, ScriptChecks>()
  const check = (id: string, c: string) => results.get(id)!.results.find((r) => r.id === c)

  beforeAll(async () => {
    cases = await loadFixtures()
    for (const c of cases) {
      // The same redaction the hand-in page runs, so key and number checks see what is stored.
      const redactor = new Redactor()
      const files = c.files.map((f) => {
        const text = asText(f.path, f.bytes)
        return { path: f.path, originalPath: f.originalPath, text: text === null ? null : redactor.redact(text).text, bytes: f.bytes }
      })
      results.set(`${c.capstone}/${c.caseId}`, runScriptChecks({ capstone: c.capstone, files, labels: redactor.summary(), expectedFiles: guides.get(c.capstone)!.expectedFiles }))
    }
  })

  it("finds every guide file in the strongest made-up hand-in of each capstone", () => {
    for (const id of ["familybot/m06", "askmyco/m06", "askeveryone/m06"]) {
      const key = [...results.keys()].find((k) => k.startsWith(id))!
      const missing = results.get(key)!.results.filter((r) => r.id.startsWith("present:") && !r.passed)
      expect(missing.map((m) => m.label), key).toEqual([])
    }
  })

  it("reads the Month 3 report, not the deck, and finds the golden input", () => {
    const key = [...results.keys()].find((k) => k.startsWith("askeveryone/m06"))!
    expect(check(key, "summary_reading_ease")?.detail).not.toMatch(/no report|no Executive summary/)
    expect(check(key, "evidence_refs_resolve")?.passed, check(key, "evidence_refs_resolve")?.detail).toBe(true)
  })

  it("catches the planted problems the checks can see", () => {
    const planted = (capstone: string, n: string) => [...results.keys()].find((k) => k.startsWith(`${capstone}/p${n}`))!
    expect(check(planted("askeveryone", "01"), "evidence_refs_resolve")?.passed).toBe(false)
    expect(check(planted("askeveryone", "02"), "legal_review_line")?.passed).toBe(false)
    expect(check(planted("askmyco", "01"), "no_secrets")?.passed).toBe(false)
  })

  it("never crashes", () => {
    for (const [key, r] of results) expect(r.results.some((x) => x.id === "checks_failed"), key).toBe(false)
  })
})
