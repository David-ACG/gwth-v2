import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import ForTeamsPage from "./page"
import { TOTAL_MANDATORY_LESSONS } from "@/lib/config"

afterEach(cleanup)

describe("ForTeamsPage", () => {
  it("renders the page heading", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("AI Training for Your Team")
    ).toBeInTheDocument()
  }, 10000)

  it("renders the time value section", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText(/The real cost is not the course/)
    ).toBeInTheDocument()
    // Deliberately updated (W26): the page now uses the "£29/mo" form that
    // home and /pricing already use, instead of a third "£29.00/month" form.
    expect(screen.getByText(/£29\/mo per person/)).toBeInTheDocument()
  })

  it("renders the syllabus flexibility section", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("Complete control over what your team learns")
    ).toBeInTheDocument()
    // Read from config rather than hardcoded (W26): the standalone 64 drifted
    // out of step with the per-month numbers once Month 1 became 26.
    expect(
      screen.getAllByText(
        new RegExp(`${TOTAL_MANDATORY_LESSONS} mandatory lessons`)
      ).length
    ).toBeGreaterThanOrEqual(1)
    expect(
      screen.getAllByText(/30 optional lessons/).length
    ).toBeGreaterThanOrEqual(1)
  })

  it("renders the zero wasted time differentiator", () => {
    render(<ForTeamsPage />)
    expect(screen.getByText("Zero wasted time")).toBeInTheDocument()
    expect(
      screen.getAllByText(/No repetition/).length
    ).toBeGreaterThanOrEqual(1)
  })

  it("renders the syllabus choice differentiator", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("You choose the syllabus")
    ).toBeInTheDocument()
  })

  it("renders all whyGwth cards", () => {
    render(<ForTeamsPage />)
    const expectedTitles = [
      "Zero wasted time",
      "Practical projects with walkthroughs",
      "Beginner-friendly, then builder-ready",
      "You choose the syllabus",
      "Vendor-neutral applied AI",
      "Plain progress reporting",
      "Built for the enterprise conversation",
    ]
    for (const title of expectedTitles) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
  })

  it("renders the syllabus customization FAQ", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("Can we choose which lessons our team completes?")
    ).toBeInTheDocument()
  })

  it("renders the working hours FAQ", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("Can employees complete this during working hours?")
    ).toBeInTheDocument()
  })

  it("renders the efficiency comparison cards", () => {
    render(<ForTeamsPage />)
    expect(screen.getByText("Typical AI training")).toBeInTheDocument()
    expect(screen.getByText("GWTH")).toBeInTheDocument()
  })

  it("displays the pricing", () => {
    render(<ForTeamsPage />)
    // Deliberately updated (W26): "£29" + "/mo", matching home and /pricing.
    expect(screen.getByText("£29")).toBeInTheDocument()
    // The ongoing price is quoted everywhere the course price is quoted now,
    // so this is deliberately getAllByText: more than one is the point.
    expect(screen.getAllByText(/£7\.50\/mo/).length).toBeGreaterThan(0)
  })

  it("has contact CTA", () => {
    render(<ForTeamsPage />)
    const links = screen.getAllByRole("link", { name: /Get in touch/ })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute("href", "/contact")
  })
})
