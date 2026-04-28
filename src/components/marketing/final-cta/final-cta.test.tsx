import { describe, it, expect } from "vitest"
import { render, waitFor } from "@testing-library/react"
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

  it("mounts the WaitlistForm (renders an email input)", async () => {
    // WaitlistForm is lazy-loaded via next/dynamic so the email input
    // is not in the first render — wait for the chunk to resolve.
    // Generous timeout because jsdom + parallel vitest workers can be
    // slow to settle the dynamic module.
    const { container } = render(<FinalCTA />)
    await waitFor(
      () => {
        const input = container.querySelector('input[type="email"]') as HTMLInputElement | null
        expect(input).not.toBeNull()
        expect(input?.placeholder).toBe("you@example.com")
      },
      { timeout: 5000 }
    )
  })

  it("renders a free-lab secondary CTA pointing to /labs", () => {
    const { container } = render(<FinalCTA />)
    const link = container.querySelector('a[href="/labs"]')
    expect(link).not.toBeNull()
  })
})
