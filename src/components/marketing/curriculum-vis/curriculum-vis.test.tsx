import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { CurriculumVis } from "./curriculum-vis"
import { CURRICULUM } from "@/components/marketing/data"

describe("CurriculumVis", () => {
  it("sets data-section=curriculum-vis on the root", () => {
    const { container } = render(<CurriculumVis />)
    expect(container.querySelector('[data-section="curriculum-vis"]')).not.toBeNull()
  })

  it("renders one module card per CURRICULUM entry", () => {
    const { container } = render(<CurriculumVis />)
    const modules = container.querySelectorAll('[data-testid="curriculum-module"]')
    expect(modules.length).toBe(CURRICULUM.length)
  })

  it("renders module titles, lesson counts, and capstone names from data", () => {
    const { container } = render(<CurriculumVis />)
    const text = container.textContent ?? ""
    for (const mod of CURRICULUM) {
      expect(text).toContain(mod.m)
      expect(text).toContain(mod.t)
      expect(text).toContain(mod.d)
      expect(text).toContain(mod.capstone)
    }
  })

  it("renders a locked pill on every module card", () => {
    const { container } = render(<CurriculumVis />)
    const modules = Array.from(
      container.querySelectorAll('[data-testid="curriculum-module"]')
    )
    for (const m of modules) {
      expect(m.textContent ?? "").toMatch(/locked/i)
    }
  })

  it("renders the locked footer copy", () => {
    const { container } = render(<CurriculumVis />)
    expect(container.textContent ?? "").toContain(
      "Full syllabus revealed one month at a time after enrolment."
    )
  })
})
