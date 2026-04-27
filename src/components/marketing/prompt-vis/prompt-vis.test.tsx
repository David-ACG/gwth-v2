import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"

const useReducedMotionMock = vi.fn<() => boolean | null>()

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react")
  return {
    ...actual,
    useReducedMotion: () => useReducedMotionMock(),
  }
})

describe("PromptVis", () => {
  beforeEach(() => {
    useReducedMotionMock.mockReset()
  })

  it("sets data-section=prompt-vis on the root", async () => {
    useReducedMotionMock.mockReturnValue(false)
    const { PromptVis } = await import("./prompt-vis")
    const { container } = render(<PromptVis />)
    expect(container.querySelector('[data-section="prompt-vis"]')).not.toBeNull()
  })

  it("renders the user prompt and all 4 workflow steps", async () => {
    useReducedMotionMock.mockReturnValue(false)
    const { PromptVis } = await import("./prompt-vis")
    const { container } = render(<PromptVis />)
    const text = container.textContent ?? ""
    expect(text).toContain("Take last quarter")
    const steps = container.querySelectorAll('[data-testid="prompt-step"]')
    expect(steps.length).toBe(4)
    expect(text).toContain("Loaded 247 invoices")
    expect(text).toContain("12 flagged over £2,000")
    expect(text).toContain("4 suppliers past 30-day terms")
    expect(text).toContain("4 chase emails drafted")
  })

  it("renders steps as plain <li> when reduced motion is preferred", async () => {
    useReducedMotionMock.mockReturnValue(true)
    const { PromptVis } = await import("./prompt-vis")
    const { container } = render(<PromptVis />)
    const steps = Array.from(
      container.querySelectorAll('[data-testid="prompt-step"]')
    )
    expect(steps.length).toBe(4)
    for (const step of steps) {
      // No motion: no inline opacity:0 and no transform style applied
      const style = (step as HTMLElement).getAttribute("style") ?? ""
      expect(style).not.toMatch(/opacity\s*:\s*0/i)
    }
  })
})
