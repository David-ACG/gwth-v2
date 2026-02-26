import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import PrivacyPage from "./page"

afterEach(cleanup)

describe("PrivacyPage", () => {
  it("renders the page heading", () => {
    render(<PrivacyPage />)
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument()
  })

  it("renders the last updated date", () => {
    render(<PrivacyPage />)
    expect(
      screen.getByText(/25 February 2026/)
    ).toBeInTheDocument()
  })

  it("does not contain any email addresses", () => {
    const { container } = render(<PrivacyPage />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/[\w.-]+@[\w.-]+\.\w+/)
  })

  it("does not contain physical addresses", () => {
    const { container } = render(<PrivacyPage />)
    const text = container.textContent ?? ""
    expect(text.toLowerCase()).not.toContain("london")
    expect(text.toLowerCase()).not.toContain("street")
    expect(text.toLowerCase()).not.toContain("postcode")
  })

  it("links to the contact form instead of email", () => {
    render(<PrivacyPage />)
    const contactLinks = screen.getAllByRole("link", {
      name: /contact us through our website/i,
    })
    expect(contactLinks.length).toBeGreaterThanOrEqual(1)
    expect(contactLinks[0]).toHaveAttribute("href", "/contact")
  })

  it("renders key sections", () => {
    render(<PrivacyPage />)
    expect(screen.getByText("1. Information We Collect")).toBeInTheDocument()
    expect(screen.getByText("2. How We Use Your Information")).toBeInTheDocument()
    expect(screen.getByText("5. Data Security")).toBeInTheDocument()
    expect(screen.getByText("6. Your Rights")).toBeInTheDocument()
    expect(screen.getByText("11. Contact Us")).toBeInTheDocument()
  })
})
