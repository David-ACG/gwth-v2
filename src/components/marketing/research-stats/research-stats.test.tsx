import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { ResearchStats } from "./research-stats"
import { UK_STATS, RESEARCH_SOURCES } from "@/components/marketing/data"

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

  it("renders the DSIT citation footer with all 6 source organisations", () => {
    const { container } = render(<ResearchStats />)
    const text = container.textContent ?? ""
    expect(text).toContain("DSIT")
    expect(text).toContain("Jan 2026")
    for (const source of RESEARCH_SOURCES) {
      expect(text).toContain(source)
    }
  })
})
