import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import TermsPage from "./page"

afterEach(cleanup)

describe("TermsPage", () => {
  it("renders the page heading", () => {
    render(<TermsPage />)
    expect(screen.getByText("Terms and conditions")).toBeInTheDocument()
  })

  it("renders the last updated date", () => {
    render(<TermsPage />)
    expect(
      screen.getByText(/1 December 2026/)
    ).toBeInTheDocument()
  })

  it("has a table of contents", () => {
    render(<TermsPage />)
    expect(screen.getByText("Table of contents")).toBeInTheDocument()
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
    expect(screen.getByText("1. Our services")).toBeInTheDocument()
    expect(screen.getByText("2. Intellectual property")).toBeInTheDocument()
    expect(screen.getByText("6. Subscriptions")).toBeInTheDocument()
    expect(screen.getByText("7. Gifts and prepaid passes")).toBeInTheDocument()
    expect(screen.getByText("8. Prohibited activities")).toBeInTheDocument()
    expect(screen.getByText("16. Contact us")).toBeInTheDocument()
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

  it("has no beta or invite-only wording from 1 December (launch readiness, 2026-10-20)", () => {
    const { container } = render(<TermsPage />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/beta/i)
    expect(text).not.toMatch(/invite-only/i)
  })

  it("keeps a space after every bold label", () => {
    const { container } = render(<TermsPage />)
    for (const strong of container.querySelectorAll("li > strong")) {
      const next = strong.nextSibling?.textContent ?? ""
      expect(next.startsWith(" "), `${strong.textContent} is followed by "${next.slice(0, 12)}"`).toBe(true)
    }
  })
})
