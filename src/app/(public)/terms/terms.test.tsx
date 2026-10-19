import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import TermsPage from "./page"

afterEach(cleanup)

describe("TermsPage", () => {
  it("renders the page heading", () => {
    render(<TermsPage />)
    expect(screen.getByText("Terms and Conditions")).toBeInTheDocument()
  })

  it("renders the last updated date", () => {
    render(<TermsPage />)
    expect(
      screen.getByText(/1 December 2026/)
    ).toBeInTheDocument()
  })

  it("has a table of contents", () => {
    render(<TermsPage />)
    expect(screen.getByText("Table of Contents")).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: /table of contents/i })).toBeInTheDocument()
  })

  it("does not contain any email addresses", () => {
    const { container } = render(<TermsPage />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/[\w.-]+@[\w.-]+\.\w+/)
  })

  it("does not contain physical addresses", () => {
    const { container } = render(<TermsPage />)
    const text = container.textContent ?? ""
    expect(text.toLowerCase()).not.toContain("london")
    expect(text.toLowerCase()).not.toContain("street")
    expect(text.toLowerCase()).not.toContain("postcode")
  })

  it("links to the contact form instead of email", () => {
    render(<TermsPage />)
    const contactLinks = screen.getAllByRole("link", {
      name: /contact us/i,
    })
    expect(contactLinks.length).toBeGreaterThanOrEqual(1)
  })

  it("renders key sections", () => {
    render(<TermsPage />)
    expect(screen.getByText("1. Our Services")).toBeInTheDocument()
    expect(screen.getByText("2. Intellectual Property")).toBeInTheDocument()
    expect(screen.getByText("6. Subscriptions")).toBeInTheDocument()
    expect(screen.getByText("7. Gifts and Prepaid Passes")).toBeInTheDocument()
    expect(screen.getByText("8. Prohibited Activities")).toBeInTheDocument()
    expect(screen.getByText("16. Contact Us")).toBeInTheDocument()
  })

  it("sets out the gift and pass terms David decided (2026-10-19)", () => {
    const { container } = render(<TermsPage />)
    const text = container.textContent ?? ""
    expect(text).toMatch(/opened within one\s+year of purchase/)
    expect(text).toMatch(/never renews/)
    expect(text).toMatch(/refund a pass in full at any time\s+before it is opened/)
    expect(text).toMatch(/not registered for VAT/)
    expect(text).not.toMatch(/23 June beta/)
  })
})
