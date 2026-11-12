import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import PrivacyPage from "./page"

afterEach(cleanup)

describe("PrivacyPage", () => {
  it("renders the page heading", () => {
    render(<PrivacyPage />)
    expect(screen.getByText("Privacy policy")).toBeInTheDocument()
  })

  it("renders the last updated date", () => {
    render(<PrivacyPage />)
    expect(
      screen.getByText(/1 December 2026/)
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
    expect(screen.getByText("1. Information we collect")).toBeInTheDocument()
    expect(screen.getByText("2. How we use your information")).toBeInTheDocument()
    expect(screen.getByText("5. Data security")).toBeInTheDocument()
    expect(screen.getByText("6. Your rights")).toBeInTheDocument()
    expect(screen.getByText("11. Contact us")).toBeInTheDocument()
  })

  it("says what the code does about cookies and analytics (launch readiness, 2026-10-20)", () => {
    // src/app/layout.tsx loads only analytics.gwth.ai/js/script.outbound-links.js,
    // our own Plausible, which sets no cookies; next-themes keeps the theme in
    // localStorage. So the policy must not say "We may use analytics cookies".
    const { container } = render(<PrivacyPage />)
    const text = (container.textContent ?? "").replace(/\s+/g, " ")
    expect(text).not.toMatch(/may use analytics cookies/i)
    expect(text).toContain("We use only essential cookies, which keep you signed in.")
    expect(text).toContain("Plausible Analytics, which we run on our own server. It uses no cookies")
    expect(text).not.toMatch(/post-beta/i)
  })

  it("keeps a space after every bold label and starts each sentence with a capital", () => {
    const { container } = render(<PrivacyPage />)
    for (const strong of container.querySelectorAll("li > strong")) {
      const next = strong.nextSibling?.textContent ?? ""
      expect(next.startsWith(" "), `${strong.textContent} is followed by "${next.slice(0, 12)}"`).toBe(true)
    }
    expect(container.textContent).toContain("Gifts: We collect")
  })

  it("says nothing about capstone marking while hand-ins are off (bead gwth-launch-9289.11)", () => {
    const { container } = render(<PrivacyPage />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/capstone|OpenAI|Anthropic/i)
    expect(screen.getByText("8. Age and privacy")).toBeInTheDocument()
    expect(screen.getByText("9. Third-party links")).toBeInTheDocument()
  })
  /**
   * The course-protection paragraph (bead gwth-launch-735c). Retention is
   * what purgeOldProtectionRecords deletes: raw lesson-view records after 90
   * days, a resolved check after 12 months.
   */
  it("explains course-protection monitoring, its lawful basis, the hold and retention", () => {
    render(<PrivacyPage />)
    const item = screen.getByTestId("privacy-course-protection")
    expect(item).toHaveAttribute("id", "course-protection")
    const text = (item.textContent ?? "").replace(/\s+/g, " ")
    expect(text).toMatch(/your IP address and the country it indicates, and your browser details/)
    expect(text).toMatch(/Our lawful basis is legitimate interests/)
    expect(text).toMatch(/automatically holds your next course month for a person at GWTH to review, usually within a day/)
    expect(text).toMatch(/A person decides whether to clear the hold or suspend/)
    expect(text).toMatch(/You can contest a hold or suspension/)
    expect(text).toMatch(/right to object/)
    expect(text).toMatch(/email, Slack and Telegram/)
    expect(text).toMatch(/for 90 days, then delete them/)
    expect(text).toMatch(/for 12 months after it is resolved, then delete it/)
    expect(text).not.toMatch(/watermark|identifier linked|challenge access|device limit/i)
    const page = document.body.textContent ?? ""
    expect(page).not.toMatch(/continued use of our services after changes constitutes acceptance/)
  })
})
