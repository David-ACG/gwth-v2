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

  it("renders the canonical 21% / 1 in 6 / 45% values", () => {
    const { container } = render(<ResearchStats />)
    const text = container.textContent ?? ""
    expect(text).toMatch(/21%/)
    expect(text).toMatch(/1 in 6/)
    expect(text).toMatch(/45%/)
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
