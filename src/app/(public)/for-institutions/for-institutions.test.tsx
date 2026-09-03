import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import ForInstitutionsPage from "./page"
import { EVIDENCE } from "@/components/marketing/for-institutions-fde/for-institutions-fde"

afterEach(cleanup)

describe("ForInstitutionsPage", () => {
  it("renders the institution-first heading", () => {
    render(<ForInstitutionsPage />)
    expect(
      screen.getByRole("heading", { level: 1 })
    ).toHaveTextContent("AI foundations for your members, curated by you.")
  })

  it("shows every evidence figure with a linked source", () => {
    render(<ForInstitutionsPage />)
    const cards = screen.getAllByTestId("evidence-card")
    expect(cards).toHaveLength(EVIDENCE.length)
    for (const item of EVIDENCE) {
      const link = screen.getByRole("link", { name: item.source })
      expect(link).toHaveAttribute("href", item.href)
    }
  })

  it("names the six edition features and the walkthrough call to action", () => {
    render(<ForInstitutionsPage />)
    expect(screen.getAllByTestId("edition-feature")).toHaveLength(6)
    const ctas = screen.getAllByRole("link", { name: "Book a walkthrough" })
    expect(ctas.length).toBeGreaterThanOrEqual(2)
    for (const cta of ctas) expect(cta).toHaveAttribute("href", "/contact")
  })

  it("carries no em dashes, en dashes or section signs (bible emdash-policy)", () => {
    const { container } = render(<ForInstitutionsPage />)
    expect(container.textContent).not.toMatch(/[–—§]/)
  })

  it("never shows a price in dollars", () => {
    const { container } = render(<ForInstitutionsPage />)
    expect(container.textContent).not.toMatch(/\$/)
  })
})
