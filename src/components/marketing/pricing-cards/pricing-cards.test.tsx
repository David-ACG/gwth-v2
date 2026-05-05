import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { PricingCards } from "./pricing-cards"
import { PRICING } from "@/components/marketing/data"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"

describe("PricingCards", () => {
  it("sets data-section=pricing on the root", () => {
    const { container } = render(<PricingCards />)
    expect(container.querySelector('[data-section="pricing"]')).not.toBeNull()
  })

  it("renders one card per PRICING tier", () => {
    const { container } = render(<PricingCards />)
    const cards = container.querySelectorAll('[data-testid="pricing-tier"]')
    expect(cards.length).toBe(PRICING.length)
  })

  it("Free Labs card shows £0", () => {
    const { container } = render(<PricingCards />)
    const free = container.querySelector('[data-tier="free"]')
    expect(free).not.toBeNull()
    expect(free?.textContent ?? "").toMatch(/£0|Free/)
  })

  it("The Course card shows £29 monthly without a prominent £87 total", () => {
    const { container } = render(<PricingCards />)
    const course = container.querySelector('[data-tier="course"]')
    expect(course).not.toBeNull()
    const text = course?.textContent ?? ""
    expect(text).toContain(`£${COURSE_MONTHLY_PRICE}`)
    expect(text).not.toContain(`£${COURSE_MONTHLY_PRICE * 3}`)
  })

  it("Stay Current card shows £7.50 monthly (drift sentinel)", () => {
    const { container } = render(<PricingCards />)
    const stay = container.querySelector('[data-tier="stay"]')
    expect(stay).not.toBeNull()
    const text = stay?.textContent ?? ""
    expect(text).toContain(`£${ONGOING_MONTHLY_PRICE.toFixed(2)}`)
  })

  it("featured tier has data-featured=true", () => {
    const { container } = render(<PricingCards />)
    const featured = container.querySelectorAll('[data-featured="true"]')
    expect(featured.length).toBe(1)
    expect((featured[0] as HTMLElement).getAttribute("data-tier")).toBe("course")
  })

  it("each tier's CTA href matches the data definition", () => {
    const { container } = render(<PricingCards />)
    for (const tier of PRICING) {
      const card = container.querySelector(`[data-tier="${tier.id}"]`)
      expect(card).not.toBeNull()
      if (tier.cta.style === "disabled") {
        const button = card?.querySelector("button[disabled]")
        expect(button).not.toBeNull()
      } else {
        const link = card?.querySelector(`a[href="${tier.cta.href}"]`)
        expect(link).not.toBeNull()
      }
    }
  })

  it("data layer pricePence matches src/lib/config.ts (component-layer drift sentinel)", () => {
    expect(PRICING[1]?.pricePence).toBe(COURSE_MONTHLY_PRICE * 100)
    expect(PRICING[2]?.pricePence).toBe(Math.round(ONGOING_MONTHLY_PRICE * 100))
  })
})
