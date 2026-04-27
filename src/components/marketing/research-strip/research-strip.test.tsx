import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { ResearchStrip } from "./research-strip"
import { RESEARCH_SOURCES } from "@/components/marketing/data"

describe("ResearchStrip", () => {
  it("renders the locked headline 'Built around UK research'", () => {
    const { container } = render(<ResearchStrip />)
    expect(container.textContent ?? "").toContain("Built around UK research")
  })

  it("renders all 6 RESEARCH_SOURCES as list items", () => {
    const { container } = render(<ResearchStrip />)
    const items = container.querySelectorAll("li")
    expect(items.length).toBe(RESEARCH_SOURCES.length)
    for (const source of RESEARCH_SOURCES) {
      expect(container.textContent ?? "").toContain(source)
    }
  })

  it("sets data-section=research-strip on the root", () => {
    const { container } = render(<ResearchStrip />)
    expect(container.querySelector('[data-section="research-strip"]')).not.toBeNull()
  })
})
