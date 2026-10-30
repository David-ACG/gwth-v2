// @vitest-environment node
// Server modules: Node's own Uint8Array, not jsdom's (fflate checks instanceof).
import { describe, expect, it } from "vitest"
import { strToU8, zipSync } from "fflate"
import { builtInGuide, type CapstoneId } from "./guides"
import { fleschReadingEase, runScriptChecks, section, slideCount, type CheckFile } from "./checks"
import type { LabelUse } from "./redact"

const file = (originalPath: string, text: string | null, extra: Partial<CheckFile> = {}): CheckFile => ({
  path: originalPath,
  originalPath,
  text,
  ...extra,
})
const run = (capstone: CapstoneId, files: CheckFile[], labels: LabelUse[] = []) =>
  runScriptChecks({ capstone, files, labels, expectedFiles: builtInGuide(capstone).expectedFiles })
const result = (r: ReturnType<typeof run>, id: string) => r.results.find((c) => c.id === id)

const BRIEF = "# Weekly brief\n## Tasks\n- book dentist\n## Events\n- swim Tue\n## Shopping\n- milk\n## Meals\n- pasta\n## Uncertain\n- dentist time"

describe("FamilyBot checks", () => {
  const good = [
    file("familybot_blueprint_v1.md", "Blueprint"),
    file("m1l22_week_ahead_transcript.txt", "Right, this week"),
    file("weekly_brief_2026-12-14.md", BRIEF),
    file("whatsapp_summary.txt", "This week"),
    file("weekly_digest.txt", "Digest"),
    file("task_and_event_screenshot.png", null),
  ]

  it("passes a good hand-in", () => {
    const r = run("familybot", good)
    expect(r.results.filter((c) => !c.passed)).toEqual([])
    expect(r.passed).toBe(r.total)
  })

  it("names the missing file and section, without crashing", () => {
    const r = run("familybot", good.filter((f) => !f.originalPath.startsWith("weekly_brief")))
    expect(result(r, "present:weekly-brief")?.passed).toBe(false)
    expect(result(r, "brief_section:tasks")).toMatchObject({ passed: false, detail: "no weekly brief found" })
  })

  it("flags a brief missing its Uncertain section, and private numbers left in", () => {
    const broken = good.map((f) => (f.originalPath.startsWith("weekly_brief") ? file(f.originalPath, BRIEF.replace("## Uncertain", "## Other")) : f))
    const r = run("familybot", broken, [{ label: "[NHS number 1]", kind: "NHS number", source: "pattern", count: 1 }])
    expect(result(r, "brief_section:uncertain")?.passed).toBe(false)
    expect(result(r, "no_sensitive_numbers")).toMatchObject({ passed: false, basic: "private" })
  })
})

describe("Month 2 checks", () => {
  const plan = Array.from({ length: 10 }, (_, i) => `Day ${i + 1}: build part ${i + 1}`).join("\n")
  const good = [
    file("package.json", "{}"),
    file("cited_answer_screenshot.png", null),
    file("two_company_test.md", "passes"),
    file("governance/lawful_basis.md", "x"),
    file("fractionalbuddy_spec.md", "spec"),
    file("sprint_plan.md", plan),
    file("quality_statement.md", "This does not yet handle images.\nSigned: A. Learner\nDate: 12/01/2027"),
  ]

  it("passes a good hand-in", () => {
    const r = run("askmyco", good)
    expect(r.results.filter((c) => !c.passed && !c.id.startsWith("present:"))).toEqual([])
  })

  it("catches a missing day, an unsigned statement and a key left in the code", () => {
    const broken = good.map((f) =>
      f.originalPath === "sprint_plan.md"
        ? file(f.originalPath, plan.replace("Day 7", "Later"))
        : f.originalPath === "quality_statement.md"
          ? file(f.originalPath, "Our statement.")
          : f,
    )
    const r = run("askmyco", broken, [{ label: "[Secret 1]", kind: "Secret", source: "pattern", count: 2 }])
    expect(result(r, "sprint_plan_ten_days")?.passed).toBe(false)
    expect(result(r, "quality_statement_signed")?.passed).toBe(false)
    expect(result(r, "no_secrets")).toMatchObject({ passed: false, basic: "no_secrets" })
  })

  it("does not crash when the files are missing", () => {
    const r = run("askmyco", [])
    expect(result(r, "quality_statement_one_page")?.detail).toBe("no Quality Statement found")
  })
})

describe("Month 3 checks", () => {
  const summary =
    "Executive summary\nSouthbridge should start with one small pilot in the finance team. Staff told us they want help with letters. We found three themes. Each action has an owner and a stop rule. Real deployment needs legal review before any use.\n\nThemes\n..."
  const output = { actions: [{ owner: "Finance lead", stop_rule: "Stop if errors rise", evidence_refs: ["T1-P3", "T2-P1"] }] }
  const deckPdf = Array.from({ length: 10 }, (_, i) => `Slide ${i + 1}`).join("\n\f\n")
  const good = [
    file("README.md", "readme"),
    file("southbridge_report.pdf.txt", summary, { originalPath: "southbridge_report.pdf" }),
    file("deck.pdf.txt", deckPdf, { originalPath: "deck.pdf" }),
    file("southbridge_input.golden.json", '{"passages": {"T1-P3": "...", "T2-P1": "..."}}'),
    file("output.json", JSON.stringify(output)),
    file("eval_results.json", '{"passed": 5}'),
  ]

  it("passes a good hand-in", () => {
    const r = run("askeveryone", good)
    expect(r.results.filter((c) => !c.passed)).toEqual([])
  })

  it("catches a broken evidence reference, an empty stop rule and invalid JSON", () => {
    const broken = good.map((f) =>
      f.originalPath === "output.json"
        ? file("output.json", JSON.stringify({ actions: [{ stop_rule: "", evidence_refs: ["T9-P9"] }] }))
        : f.originalPath === "eval_results.json"
          ? file("eval_results.json", "{not json")
          : f,
    )
    const r = run("askeveryone", broken)
    expect(result(r, "evidence_refs_resolve")).toMatchObject({ passed: false, detail: "1 of 1 not found: T9-P9" })
    expect(result(r, "no_empty_stop_rule")?.passed).toBe(false)
    expect(result(r, "eval_results_valid")?.passed).toBe(false)
  })

  it("counts slides in a PowerPoint and a PDF", () => {
    const slides = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`ppt/slides/slide${i + 1}.xml`, strToU8("<p/>")]))
    const pptx = zipSync({ ...slides, "ppt/presentation.xml": strToU8("<p/>") })
    expect(slideCount(file("deck.pptx", null, { bytes: pptx }))).toBe(9)
    expect(slideCount(file("deck.pdf", deckPdf))).toBe(10)
    const r = run("askeveryone", good.map((f) => (f.originalPath === "deck.pdf" ? file("deck.pptx", null, { bytes: pptx }) : f)))
    expect(result(r, "deck_ten_slides")).toMatchObject({ passed: false, detail: "9 slides" })
  })

  it("does not crash on an empty hand-in", () => {
    const r = run("askeveryone", [])
    expect(r.total).toBeGreaterThan(0)
    expect(r.passed).toBe(0)
  })
})

describe("helpers", () => {
  it("scores plain English as easy and dense jargon as hard", () => {
    const easy = "We tested the bot with our family. It found the dates. It made a list. We fixed two errors. The list was right after that. We will add the school calendar next."
    const hard = "Organisational interoperability necessitates comprehensive institutional transformation, operationalising multidimensional governance considerations simultaneously across heterogeneous departmental infrastructures and accountability configurations."
    expect(fleschReadingEase(easy)).toBeGreaterThan(70)
    expect(fleschReadingEase(hard + " " + hard)).toBeLessThan(10)
  })

  it("finds the text under a heading", () => {
    expect(section("# Report\n## Executive summary\nShort text.\n## Themes\nMore", /^executive summary\b/i)).toBe("Short text.")
  })
})
