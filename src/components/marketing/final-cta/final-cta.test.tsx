import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { FinalCTA } from "./final-cta"

describe("FinalCTA", () => {
  it("sets data-section=final-cta on the root", () => {
    const { container } = render(<FinalCTA />)
    expect(container.querySelector('[data-section="final-cta"]')).not.toBeNull()
  })

  it("applies the dark-band background class", () => {
    const { container } = render(<FinalCTA />)
    const section = container.querySelector('[data-section="final-cta"]') as HTMLElement
    expect(section.className).toContain("bg-foreground")
    expect(section.className).toContain("text-background")
  })

  it("renders the locked headline", () => {
    const { container } = render(<FinalCTA />)
    const text = container.textContent ?? ""
    expect(text).toContain("The best time to learn AI was six months ago")
    expect(text).toContain("The second best time is right now")
  })

  it("mounts the WaitlistForm (renders an email input)", () => {
    const { container } = render(<FinalCTA />)
    const input = container.querySelector('input[type="email"]') as HTMLInputElement | null
    expect(input).not.toBeNull()
    expect(input?.placeholder).toBe("you@example.com")
  })

  it("renders a free-lab secondary CTA pointing to /labs", () => {
    const { container } = render(<FinalCTA />)
    const link = container.querySelector('a[href="/labs"]')
    expect(link).not.toBeNull()
  })
})
