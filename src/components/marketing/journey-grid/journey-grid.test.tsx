import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { JourneyGrid } from "./journey-grid"
import { JOURNEYS } from "@/components/marketing/data"

describe("JourneyGrid", () => {
  it("renders exactly 7 journey cards", () => {
    const { container } = render(<JourneyGrid />)
    const cards = container.querySelectorAll('[data-testid="journey-card"]')
    expect(cards.length).toBe(7)
  })

  it("each card href matches the corresponding JOURNEYS entry", () => {
    const { container } = render(<JourneyGrid />)
    const cards = Array.from(container.querySelectorAll('[data-testid="journey-card"]'))
    const cardHrefs = cards.map((c) => c.getAttribute("href"))
    const expected = JOURNEYS.map((j) => j.href)
    expect(cardHrefs).toEqual(expected)
  })

  it("does not produce className containing 'undefined' (accent mapping sentinel)", () => {
    const { container } = render(<JourneyGrid />)
    const cards = container.querySelectorAll('[data-testid="journey-card"]')
    for (const card of cards) {
      expect(card.className).not.toContain("undefined")
      const inner = card.querySelectorAll("*")
      for (const el of inner) {
        expect(el.className.toString()).not.toContain("undefined")
      }
    }
  })

  it("each accent token resolves to a real Tailwind class on the tag pill", () => {
    const { container } = render(<JourneyGrid />)
    const cards = Array.from(container.querySelectorAll('[data-testid="journey-card"]'))
    const seenAccents = new Set<string>()
    for (const card of cards) {
      const accent = card.getAttribute("data-accent")
      expect(accent).toBeTruthy()
      seenAccents.add(accent!)
      const tag = card.querySelector("span:nth-of-type(2)")
      const classes = tag?.className ?? ""
      if (accent === "mint") {
        expect(classes).toContain("bg-accent/10")
        expect(classes).toContain("text-accent")
      } else if (accent === "aqua") {
        expect(classes).toContain("bg-primary/10")
        expect(classes).toContain("text-primary")
      }
    }
    // Sanity: both accents represented across the 7 cards
    expect(seenAccents.has("mint") && seenAccents.has("aqua")).toBe(true)
  })

  it("sets data-section=journey on the root", () => {
    const { container } = render(<JourneyGrid />)
    expect(container.querySelector('[data-section="journey"]')).not.toBeNull()
  })

  it("renders three rows with the expected counts (3+3+1)", () => {
    const { container } = render(<JourneyGrid />)
    const r1 = container.querySelectorAll('[data-row="1"] [data-testid="journey-card"]')
    const r2 = container.querySelectorAll('[data-row="2"] [data-testid="journey-card"]')
    const r3 = container.querySelectorAll('[data-row="3"] [data-testid="journey-card"]')
    expect(r1.length).toBe(3)
    expect(r2.length).toBe(3)
    expect(r3.length).toBe(1)
  })
})
