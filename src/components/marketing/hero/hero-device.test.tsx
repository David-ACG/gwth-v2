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

  it("mounts a ScoreVis with the example score value visible", () => {
    const { container } = render(<HeroDevice />)
    const numeric = textOf(container as HTMLElement, "span")
    expect(numeric).toContain(String(EXAMPLE_SCORE_VALUE))
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
    const img = brand?.querySelector("img")
    expect(img).not.toBeNull()
    expect(img?.getAttribute("alt")).toBe("GWTH")
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

  it("includes the gwth.ai/dashboard URL bar text", () => {
    const { container } = render(<HeroDevice />)
    const urlBar = Array.from(container.querySelectorAll("span")).find((el) =>
      (el.textContent ?? "").includes("gwth.ai/dashboard")
    )
    expect(urlBar).toBeDefined()
  })
})
