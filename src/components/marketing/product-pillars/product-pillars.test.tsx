import { afterEach, beforeEach, describe, it, expect, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"

async function renderProductPillars() {
  const { ProductPillars } = await import("./product-pillars")
  return render(<ProductPillars />)
}

describe("ProductPillars", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv("GWTH_SCORE_ENABLED", "")
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
  })

  it("sets data-section=pillars on the root", async () => {
    const { container } = await renderProductPillars()
    expect(container.querySelector('[data-section="pillars"]')).not.toBeNull()
  })

  it("renders exactly 3 rows", async () => {
    const { container } = await renderProductPillars()
    const rows = container.querySelectorAll('[data-testid="product-row"]')
    expect(rows.length).toBe(3)
  })

  it("row 1 is forward direction; row 2 has flex-row-reverse on desktop; row 3 is forward", async () => {
    const { container } = await renderProductPillars()
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

  it("row 1 mounts CurriculumVis", async () => {
    const { container } = await renderProductPillars()
    const r1 = container.querySelector('[data-row="1"]') as HTMLElement
    expect(r1.querySelector('[data-section="curriculum-vis"]')).not.toBeNull()
  })

  it("row 2 hides ScoreVis and mounts plain progress by default", async () => {
    const { container } = await renderProductPillars()
    const r2 = container.querySelector('[data-row="2"]') as HTMLElement
    expect(r2.querySelector('[data-role="score-pulse"]')).toBeNull()
    expect(r2.querySelector('[data-section="progress-vis"]')).not.toBeNull()
    expect(r2.textContent ?? "").toContain("Plain progress")
  })

  it("row 3 mounts PromptVis", async () => {
    const { container } = await renderProductPillars()
    const r3 = container.querySelector('[data-row="3"]') as HTMLElement
    expect(r3.querySelector('[data-section="prompt-vis"]')).not.toBeNull()
  })
})
