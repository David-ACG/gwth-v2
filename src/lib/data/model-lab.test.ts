import { describe, it, expect } from "vitest"
import { existsSync } from "node:fs"
import { join } from "node:path"
import {
  MODEL_LAB_SLUGS,
  getModelLab,
  getModelLabIndex,
  getModelLabs,
  getRowAnswerMarkdown,
  isModelLabSlug,
  rowForClient,
} from "./model-lab"
import {
  countWord,
  formatTestedMonth,
  formatTestedRange,
  levelLabel,
  ordinalWord,
} from "@/lib/model-lab-format"

const PUBLIC = join(process.cwd(), "public")

/**
 * The generated Model Lab JSON (model-bakeoff lab/site/export_gwth.py) checked
 * against what the pages read, so a changed export fails here, not on a page.
 */
describe("Model Lab loader", () => {
  it("serves the six labs, in menu order, and nothing else", () => {
    expect(MODEL_LAB_SLUGS).toEqual(["research", "content", "thinking", "building", "data", "automation"])
    expect(getModelLabs().map((l) => l.sp)).toEqual([...MODEL_LAB_SLUGS])
    for (const slug of MODEL_LAB_SLUGS) {
      expect(isModelLabSlug(slug)).toBe(true)
      expect(getModelLab(slug)?.sp).toBe(slug)
    }
    for (const slug of ["job-advert-claude-vs-chatgpt", "build-mcp-server", "", "constructor"]) {
      expect(isModelLabSlug(slug)).toBe(false)
      expect(getModelLab(slug)).toBeNull()
    }
  })

  it("gives every lab the fields the page reads", () => {
    for (const slug of MODEL_LAB_SLUGS) {
      const lab = getModelLab(slug)!
      expect(lab.headline).toMatch(/\?$/)
      expect(lab.ask).toMatch(/\?$/)
      expect(lab.tasks.filter((t) => t.signature)).toHaveLength(1)
      expect(lab.answers).toHaveLength(4)
      expect(lab.answers.map((a) => a.letter)).toEqual(["A", "B", "C", "D"])
      expect(lab.table.length).toBe(lab.count)
      for (const row of lab.table) expect(row.tasks).toHaveLength(lab.tasks.length)
      expect(lab.best.score).toBeGreaterThanOrEqual(lab.value.score)
      expect(lab.tested_from <= lab.tested_to).toBe(true)
      // Premium set-ups are for cost only: never in the ranked table.
      expect(lab.table.some((r) => /^(fable-|gpt-6-astra)/.test(r.setup))).toBe(false)
    }
  })

  it("points every referenced file at /labs-files, and every one is there", () => {
    for (const slug of MODEL_LAB_SLUGS) {
      const lab = getModelLab(slug)!
      const paths = [
        ...lab.answers.flatMap((a) =>
          a.files.flatMap((f) => (f.kind === "md" ? [] : f.kind === "shot" ? [f.src, f.try] : [f.src])),
        ),
        ...lab.table.flatMap((r) => r.sig_files.map((f) => f.src)),
      ]
      expect(paths.length).toBeGreaterThan(0)
      for (const p of paths) {
        expect(p).toMatch(/^\/labs-files\/[^/]+\/[^/]+\/[^/]+$/)
        expect(p).not.toMatch(/\/app2\/|\/shot2\//)
        expect(existsSync(join(PUBLIC, p)), p).toBe(true)
      }
    }
  })

  it("hands a table row's markdown only for set-ups on that lab's table", () => {
    const lab = getModelLab("thinking")!
    const files = getRowAnswerMarkdown("thinking", lab.table[0]!.setup)
    expect(files?.length).toBeGreaterThan(0)
    expect(files![0]!.text.length).toBeGreaterThan(100)
    expect(getRowAnswerMarkdown("thinking", "not-a-setup")).toBeNull()
    expect(getRowAnswerMarkdown("thinking", "../../etc/passwd")).toBeNull()
    expect(getRowAnswerMarkdown("nope", lab.table[0]!.setup)).toBeNull()
    // Building answers are apps, not markdown.
    const building = getModelLab("building")!
    expect(getRowAnswerMarkdown("building", building.table[0]!.setup)).toEqual([])
  })

  it("strips the markdown from a row before it goes to the browser", () => {
    const row = getModelLab("research")!.table[0]!
    expect(row.sig_files.some((f) => f.text)).toBe(true)
    expect(rowForClient(row).sig_files.every((f) => f.text === undefined)).toBe(true)
  })

  it("carries the index the /labs page states", () => {
    const index = getModelLabIndex()
    expect(index.labs).toHaveLength(6)
    expect(index.model_count).toBeGreaterThan(10)
    expect(index.setup_count).toBeGreaterThanOrEqual(index.model_count)
    expect(index.p_per_usd).toBe(75)
    expect(index.cost_chart.rows.length).toBeGreaterThanOrEqual(index.setup_count)
  })
})

describe("Model Lab wording helpers", () => {
  it("formats test dates the British way, with no dashes", () => {
    expect(formatTestedRange("2026-10-02", "2026-10-21")).toBe("2 to 21 October 2026")
    expect(formatTestedRange("2026-09-30", "2026-10-04")).toBe("30 September to 4 October 2026")
    expect(formatTestedRange("2026-10-02", "2026-10-02")).toBe("2 October 2026")
    expect(formatTestedRange("2026-12-30", "2027-01-02")).toBe("30 December 2026 to 2 January 2027")
    expect(formatTestedMonth("2026-10-02", "2026-10-21")).toBe("October 2026")
    expect(formatTestedMonth("2026-09-30", "2026-10-04")).toBe("September and October 2026")
  })

  it("names thinking levels, counts and places as the pages say them", () => {
    expect(levelLabel("standard")).toBe("standard")
    expect(levelLabel("xhigh")).toBe("extra-high thinking")
    expect(countWord(4)).toBe("four")
    expect(countWord(12)).toBe("12")
    expect(ordinalWord(1)).toBe("first")
    expect(ordinalWord(4)).toBe("fourth")
  })
})
