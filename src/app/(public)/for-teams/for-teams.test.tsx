import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import ForTeamsPage from "./page"

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
    expect(
      screen.getByText(/£87\.00 per person/)
    ).toBeInTheDocument()
  })

  it("renders the syllabus flexibility section", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("Complete control over what your team learns")
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(/64 mandatory lessons/).length
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
      "94 hands-on projects with video walkthroughs",
      "No coding required",
      "You choose the syllabus",
      "Vendor-neutral (Tech Radar tracks 60+ tools)",
      "Dynamic certification",
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
    expect(screen.getByText("£29.00")).toBeInTheDocument()
    expect(screen.getByText(/£5\.00\/month/)).toBeInTheDocument()
  })

  it("has contact CTA", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByRole("link", { name: /Get in Touch/ })
    ).toBeInTheDocument()
  })
})
