import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { MarketingFooter } from "./marketing-footer"
import { FOOTER_COLS } from "@/components/marketing/data"

describe("MarketingFooter", () => {
  it("sets data-section=footer on the root", () => {
    const { container } = render(<MarketingFooter />)
    expect(container.querySelector('[data-section="footer"]')).not.toBeNull()
  })

  it("renders one column per FOOTER_COLS entry", () => {
    const { container } = render(<MarketingFooter />)
    const cols = container.querySelectorAll('[data-testid="footer-col"]')
    expect(cols.length).toBe(FOOTER_COLS.length)
  })

  it("renders every footer link with a non-empty href", () => {
    const { container } = render(<MarketingFooter />)
    const links = Array.from(
      container.querySelectorAll('[data-testid="footer-link"]')
    )
    const expectedCount = FOOTER_COLS.flatMap((c) => c.links).length
    expect(links.length).toBe(expectedCount)
    for (const link of links) {
      const href = link.getAttribute("href") ?? ""
      expect(href.length).toBeGreaterThan(0)
    }
  })

  it("renders the locked brand tagline", () => {
    const { container } = render(<MarketingFooter />)
    const text = container.textContent ?? ""
    expect(text).toContain("Growth With Tech and Humans")
    expect(text).toContain("Independent")
  })

  it("renders the copyright year inside a [data-mask=date] for snapshot stability", () => {
    const { container } = render(<MarketingFooter />)
    const mask = container.querySelector('[data-mask="date"]')
    expect(mask).not.toBeNull()
    const year = String(new Date().getFullYear())
    expect(mask?.textContent ?? "").toContain(year)
  })
})
