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

  it("runs four labs in the live rotation, newest first", () => {
    const live = getLiveArenaLabs()
    expect(live).toHaveLength(4)
    expect(live.map((l) => l.slug)).toEqual([
      "messy-spreadsheet-claude-vs-chatgpt",
      "cite-your-sources-claude-vs-chatgpt",
      "automate-a-weekly-chore-claude-vs-chatgpt",
      "job-advert-claude-vs-chatgpt",
    ])
  })

  it("keeps ids and slugs unique, so routing cannot collide", () => {
    const labs = getArenaLabs()
    expect(new Set(labs.map((l) => l.id)).size).toBe(labs.length)
    expect(new Set(labs.map((l) => l.slug)).size).toBe(labs.length)
  })

  it("covers different kinds of work, so labs do not repeat one task type", () => {
    const categories = getLiveArenaLabs().map((l) => l.category)
    expect(new Set(categories).size).toBe(categories.length)
  })

  it("carries a real prompt and two non-empty verbatim outputs per lab", () => {
    for (const lab of getArenaLabs()) {
      expect(lab.prompt.trim().length).toBeGreaterThan(0)
      for (const output of lab.outputs) {
        expect(output.verbatim.trim().length).toBeGreaterThan(0)
      }
      // Every contestant is pinned to an exact model id, never rounded off.
      for (const contestant of lab.matchup) {
        expect(contestant.modelId.trim().length).toBeGreaterThan(0)
        expect(contestant.howRun.trim().length).toBeGreaterThan(0)
      }
    }
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

  /**
   * The index preview (bead gwth-launch-88z.32.22). David asked for a video
   * thumbnail per lab; no lab video has been recorded, so each card previews
   * the lab's OWN material instead. That is only honest while the quoted
   * material really is the lab's, which is what this checks: a specimen value
   * that does not appear in the lab's prompt or brief is a fabrication, and a
   * fabricated preview is worse than no preview.
   */
  it("previews every live lab with material quoted from that lab", () => {
    for (const lab of getLiveArenaLabs()) {
      expect(lab.summary, `${lab.slug} needs a summary`).toBeTruthy()
      const preview = lab.preview
      expect(preview, `${lab.slug} needs a preview`).toBeDefined()
      expect(preview!.taskCue.length).toBeGreaterThan(3)
      expect(preview!.outcome.length).toBeGreaterThan(20)

      const specimen = preview!.specimen
      if (specimen.kind === "grid") {
        const source = `${lab.prompt}\n${lab.brief}`
        for (const row of specimen.rows) {
          for (const cell of row.cells) {
            expect(source, `${lab.slug}: "${cell}" is not in the lab`).toContain(
              cell
            )
          }
        }
        expect(specimen.rows.length).toBeGreaterThanOrEqual(2)
      } else {
        expect(specimen.items.length).toBeGreaterThanOrEqual(2)
        expect(specimen.items.length).toBeLessThanOrEqual(3)
      }
    }
  })

  /**
   * `video` is the ONLY evidence any surface accepts that a lab has playable
   * media. A src that is present must be a real path, never a placeholder, so
   * "coming soon" can never reach a page as a play button.
   */
  it("never carries a placeholder video source", () => {
    for (const lab of getArenaLabs()) {
      if (!lab.video) continue
      expect(lab.video.src).toMatch(/^(https?:)?\/\S+/)
      expect(lab.video.src).not.toMatch(/example\.(com|mp4)$|placeholder|tbc/i)
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
