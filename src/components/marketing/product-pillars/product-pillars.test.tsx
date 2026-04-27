import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { ProductPillars } from "./product-pillars"

describe("ProductPillars", () => {
  it("sets data-section=pillars on the root", () => {
    const { container } = render(<ProductPillars />)
    expect(container.querySelector('[data-section="pillars"]')).not.toBeNull()
  })

  it("renders exactly 3 rows", () => {
    const { container } = render(<ProductPillars />)
    const rows = container.querySelectorAll('[data-testid="product-row"]')
    expect(rows.length).toBe(3)
  })

  it("row 1 is forward direction; row 2 has flex-row-reverse on desktop; row 3 is forward", () => {
    const { container } = render(<ProductPillars />)
    const r1 = container.querySelector('[data-row="1"]') as HTMLElement
    const r2 = container.querySelector('[data-row="2"]') as HTMLElement
    const r3 = container.querySelector('[data-row="3"]') as HTMLElement
    expect(r1).not.toBeNull()
    expect(r2).not.toBeNull()
    expect(r3).not.toBeNull()
    expect(r1.className).toContain("lg:flex-row")
    expect(r1.className).not.toContain("lg:flex-row-reverse")
    expect(r2.className).toContain("lg:flex-row-reverse")
    expect(r3.className).toContain("lg:flex-row")
    expect(r3.className).not.toContain("lg:flex-row-reverse")
  })

  it("row 1 mounts CurriculumVis", () => {
    const { container } = render(<ProductPillars />)
    const r1 = container.querySelector('[data-row="1"]') as HTMLElement
    expect(r1.querySelector('[data-section="curriculum-vis"]')).not.toBeNull()
  })

  it("row 2 mounts ScoreVis", () => {
    const { container } = render(<ProductPillars />)
    const r2 = container.querySelector('[data-row="2"]') as HTMLElement
    // ScoreVis exposes data-role hooks rather than a data-section attribute
    expect(r2.querySelector('[data-role="score-pulse"]')).not.toBeNull()
  })

  it("row 3 mounts PromptVis", () => {
    const { container } = render(<ProductPillars />)
    const r3 = container.querySelector('[data-row="3"]') as HTMLElement
    expect(r3.querySelector('[data-section="prompt-vis"]')).not.toBeNull()
  })
})
