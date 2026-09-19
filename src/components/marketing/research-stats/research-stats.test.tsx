import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { ResearchStats } from "./research-stats"
import { UK_STATS } from "@/components/marketing/data"

describe("ResearchStats", () => {
  it("sets data-section=research-stats on the root", () => {
    const { container } = render(<ResearchStats />)
    expect(container.querySelector('[data-section="research-stats"]')).not.toBeNull()
  })

  it("renders one tile per UK_STATS entry with the correct value", () => {
    const { container } = render(<ResearchStats />)
    const tiles = container.querySelectorAll('[data-testid="research-stat"]')
    expect(tiles.length).toBe(UK_STATS.length)
    const text = container.textContent ?? ""
    for (const stat of UK_STATS) {
      expect(text).toContain(stat.value)
      expect(text).toContain(stat.label)
    }
  })

  // Refreshed 2026-07-26: the ONS figures moved to the June 2026 BICS wave
  // ("1 in 6" -> 29%), and the micro-business stat now publishes the raw ONS
  // pair instead of a derived ratio ("45% less likely" -> "28% vs 49%").
  //
  // Refreshed again 2026-09-19 (bead gwth-launch-88z.32.25): the values are
  // no longer written here at all. Every UK figure on the site now comes from
  // `src/lib/data/uk-ai-context.ts`, so this asserts that the tiles render
  // what that module says rather than pinning three strings that then have to
  // be edited in two places whenever a source publishes again. The 29% BICS
  // figure went with that change: the ONS headline it was standing in for is
  // 35% of businesses with ten or more staff, from the 20 July 2026 release.
  it("renders whatever the shared UK module currently says", () => {
    const { container } = render(<ResearchStats />)
    const text = container.textContent ?? ""
    expect(UK_STATS.length).toBe(3)
    for (const stat of UK_STATS) {
      expect(text).toContain(stat.value)
      expect(text).toContain(stat.label)
    }
  })

  // Deliberately updated: the blanket "Source: UK Government / DSIT (Jan
  // 2026)" footer trailed by all six RESEARCH_SOURCES made it impossible to
  // tell which body stood behind which number, and named four that are not
  // cited here at all. Each tile now carries its own citation.
  it("cites each stat against its own source", () => {
    const { container } = render(<ResearchStats />)
    const sources = Array.from(
      container.querySelectorAll('[data-testid="research-stat-source"]')
    )
    expect(sources).toHaveLength(UK_STATS.length)
    sources.forEach((node, i) => {
      expect(node.textContent).toBe(`Source: ${UK_STATS[i]!.source}`)
    })
  })

  it("no longer implies six organisations stand behind three figures", () => {
    const { container } = render(<ResearchStats />)
    const text = container.textContent ?? ""
    expect(text).not.toContain("Jan 2026")
    expect(text).not.toContain("Tech UK")
    expect(text).not.toContain("Innovate UK")
  })
})
