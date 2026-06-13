import { afterEach, beforeEach, describe, it, expect, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"

async function renderHero() {
  const { Hero } = await import("./hero")
  return render(<Hero />)
}

describe("Hero", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv("GWTH_SCORE_ENABLED", "")
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
  })

  it("renders the locked H1 copy", async () => {
    const { container } = await renderHero()
    const h1 = container.querySelector("h1")
    expect(h1).not.toBeNull()
    expect(h1?.textContent ?? "").toContain("From ChatGPT basics")
    expect(h1?.textContent ?? "").toContain("serious applied AI skill")
  })

  it("renders the primary CTA pointing at /signup", async () => {
    const { container } = await renderHero()
    const primaryCta = container.querySelector('a[href="/signup"]')
    expect(primaryCta).not.toBeNull()
    expect(primaryCta?.textContent?.trim()).toBe("Join the waitlist")
  })

  it("renders the secondary CTA pointing at /labs", async () => {
    const { container } = await renderHero()
    const secondaryCta = container.querySelector('a[href="/labs"]')
    expect(secondaryCta).not.toBeNull()
    expect(secondaryCta?.textContent?.trim()).toBe("Try a free lab")
  })

  it("hides the post-beta score device by default", async () => {
    const { container } = await renderHero()
    expect(container.querySelector('[data-role="hero-device"]')).toBeNull()
    expect(container.textContent ?? "").toContain("Course progress")
    expect(container.textContent ?? "").toContain("64/94")
  })

  it("sets data-section=hero on the root", async () => {
    const { container } = await renderHero()
    const root = container.querySelector('[data-section="hero"]')
    expect(root).not.toBeNull()
  })
})
