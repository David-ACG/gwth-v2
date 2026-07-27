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
  it("renders the canonical 21% / 29% / 28% vs 49% values", () => {
    const { container } = render(<ResearchStats />)
    const text = container.textContent ?? ""
    expect(text).toMatch(/21%/)
    expect(text).toMatch(/29%/)
    expect(text).toMatch(/28% vs 49%/)
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
