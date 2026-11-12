import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import TermsPage from "./page"
import { DEFAULT_GATE_PERCENT } from "@/lib/protection/month-hold"

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
    expect(screen.getByText("8. How course months open")).toBeInTheDocument()
    expect(screen.getByText("9. Protecting the course")).toBeInTheDocument()
    expect(screen.getByText("10. Prohibited activities")).toBeInTheDocument()
    expect(screen.getByText("18. Contact us")).toBeInTheDocument()
  })

  /**
   * The content-protection rules (bead gwth-launch-735c). The 75% rule must be
   * in the Terms before anyone pays; the review hold, the monitoring, "only a
   * person suspends" and the right to contest must be here too.
   */
  it("sets out the 75% rule with the share the gate uses", () => {
    const { container } = render(<TermsPage />)
    const section = container.querySelector("#course-months")
    expect(section?.textContent).toBe("8. How course months open")
    const text = (container.textContent ?? "").replace(/\s+/g, " ")
    expect(text).toContain(`finished ${DEFAULT_GATE_PERCENT}% of Month 1's core lessons for Month 2`)
    expect(text).toMatch(/Each later month opens at the latest of these three points/)
    expect(text).toMatch(/Optional lessons never count/)
    expect(text).toMatch(/There is no time limit on reaching 75%/)
    expect(text).toMatch(/your course time is paused/)
    expect(text).toMatch(/We never charge you for a month you cannot open/)
    expect(text).toMatch(/We may change the required share of core lessons only after giving notice/)
  })

  it("explains the monitoring, the review hold and that only a person suspends", () => {
    const { container } = render(<TermsPage />)
    expect(container.querySelector("#course-protection")?.textContent).toBe("9. Protecting the course")
    const text = (container.textContent ?? "").replace(/\s+/g, " ")
    expect(text).toMatch(/your next month is held until a person at GWTH reviews it, usually within a day/)
    expect(text).toMatch(/Suspension is always decided by a person/)
    expect(text).toMatch(/You can contest a hold or suspension through our contact form/)
    expect(text).toMatch(/We never judge an account on its IP address alone/)
    expect(text).not.toMatch(/watermark|captcha|device limit/i)
    // The licence points.
    expect(text).toMatch(/personal, non-transferable, non-exclusive licence/)
    expect(text).toMatch(/except through features we provide/)
    expect(text).toMatch(/Use scrapers, bots or other automated tools/)
    expect(text).toMatch(/Share your account or its lesson links with anyone else/)
    // Monitoring relies on legitimate interests, so no blanket consent line.
    expect(text).not.toMatch(/you consent to the data practices/)
    // One notice rule: section 4 points at section 13.
    expect(text).not.toMatch(/immediately, without prior notice/)
    const toc = screen.getByRole("navigation", { name: /table of contents/i })
    expect(within(toc).getByRole("link", { name: "How course months open" })).toHaveAttribute("href", "#course-months")
    expect(within(toc).getByRole("link", { name: "Protecting the course" })).toHaveAttribute("href", "#course-protection")
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
