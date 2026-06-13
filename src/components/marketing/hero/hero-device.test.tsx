import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { HeroDevice } from "./hero-device"
import { EXAMPLE_SCORE_VALUE } from "@/components/marketing/score-vis/example-data"

const textOf = (root: HTMLElement, selector: string): string =>
  Array.from(root.querySelectorAll(selector))
    .map((el) => el.textContent ?? "")
    .join(" | ")

describe("HeroDevice", () => {
  it("renders the generic example name and role", () => {
    const { container } = render(<HeroDevice />)
    expect(container.textContent).toContain("Alex Example")
    expect(container.textContent).toContain("Operations Lead")
  })

  it("renders the example score value as the headline number", () => {
    const { container } = render(<HeroDevice />)
    const value = container.querySelector('[data-role="score-card-value"]')
    expect(value).not.toBeNull()
    expect(value?.textContent).toBe(String(EXAMPLE_SCORE_VALUE))
  })

  it("renders the tier badge derived from the score", () => {
    const { container } = render(<HeroDevice />)
    const tier = container.querySelector('[data-role="score-card-tier"]')
    expect(tier).not.toBeNull()
    // EXAMPLE_SCORE_VALUE = 104 maps to "Top 1%" via getPercentileLabel.
    expect(tier?.textContent ?? "").toMatch(/Top 1%/i)
  })

  it("renders a trend pill with the 3-month delta", () => {
    const { container } = render(<HeroDevice />)
    const trend = container.querySelector('[data-role="score-card-trend"]')
    expect(trend).not.toBeNull()
    // EXAMPLE_SCORE_HISTORY runs 55 -> 104, so delta is +49 (up).
    expect(trend?.textContent ?? "").toContain("+49")
    // Should NOT include the percentage delta — tier pill carries magnitude.
    expect(trend?.textContent ?? "").not.toMatch(/%/)
  })

  it("renders the demo QR encoding the personalised score URL", () => {
    const { container } = render(<HeroDevice />)
    const verify = container.querySelector('[data-role="score-card-verify"]')
    expect(verify).not.toBeNull()
    // QR rendered as an accessible SVG with an aria-label naming the URL.
    const qr = verify?.querySelector('svg[role="img"]')
    expect(qr).not.toBeNull()
    expect(qr?.getAttribute("aria-label") ?? "").toMatch(
      /gwth\.ai\/score\/c67sg#dde5/
    )
  })

  it("renders the illustrative caveat figcaption", () => {
    const { container } = render(<HeroDevice />)
    const figcaption = container.querySelector("figcaption")
    expect(figcaption).not.toBeNull()
    expect(figcaption?.textContent ?? "").toMatch(/Illustrative/i)
    expect(figcaption?.textContent ?? "").toMatch(/your actual GWTH Score/i)
  })

  it("includes the GWTH brand mark header above the score ring", () => {
    const { container } = render(<HeroDevice />)
    const brand = container.querySelector('[data-role="score-card-brand"]')
    expect(brand).not.toBeNull()
    const svg = brand?.querySelector('svg[role="img"]')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute("aria-label")).toBe("GWTH")
    expect(brand?.textContent ?? "").toMatch(/GWTH Score/i)
  })

  it("includes the Example pill on the score card", () => {
    const { container } = render(<HeroDevice />)
    const pill = container.querySelector(
      '[data-role="score-card-example-pill"]'
    )
    expect(pill).not.toBeNull()
    expect(pill?.textContent ?? "").toMatch(/Example/i)
  })

  it("mounts the ScoreExplainer collapsible panel", () => {
    const { container } = render(<HeroDevice />)
    expect(
      container.querySelector('[data-role="score-explainer"]')
    ).not.toBeNull()
  })

  it("renders the personalised URL in the browser-frame URL bar", () => {
    const { container } = render(<HeroDevice />)
    const urlBar = container.querySelector('[data-role="score-card-url"]')
    expect(urlBar).not.toBeNull()
    // Includes the unique credential ID + fragment so the URL reads as
    // a personal page, not a generic landing page.
    expect(urlBar?.textContent).toBe("gwth.ai/score/c67sg#dde5")
  })
})
