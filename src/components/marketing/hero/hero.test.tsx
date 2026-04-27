import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { Hero } from "./hero"

describe("Hero", () => {
  it("renders the locked H1 copy", () => {
    const { container } = render(<Hero />)
    const h1 = container.querySelector("h1")
    expect(h1).not.toBeNull()
    expect(h1?.textContent ?? "").toContain("Stop watching AI change the world.")
    expect(h1?.textContent ?? "").toContain("Start building with it.")
  })

  it("renders the primary CTA pointing at /signup", () => {
    const { container } = render(<Hero />)
    const primaryCta = container.querySelector('a[href="/signup"]')
    expect(primaryCta).not.toBeNull()
    expect(primaryCta?.textContent?.trim()).toBe("Get started")
  })

  it("renders the secondary CTA pointing at /tech-radar", () => {
    const { container } = render(<Hero />)
    const secondaryCta = container.querySelector('a[href="/tech-radar"]')
    expect(secondaryCta).not.toBeNull()
    expect(secondaryCta?.textContent?.trim()).toBe("Explore the Tech Radar")
  })

  it("renders exactly one HeroDevice instance", () => {
    const { container } = render(<Hero />)
    const devices = container.querySelectorAll('[data-role="hero-device"]')
    expect(devices.length).toBe(1)
  })

  it("sets data-section=hero on the root", () => {
    const { container } = render(<Hero />)
    const root = container.querySelector('[data-section="hero"]')
    expect(root).not.toBeNull()
  })
})
