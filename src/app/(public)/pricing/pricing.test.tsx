import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import PricingPage from "./page"

afterEach(cleanup)

describe("PricingPage", () => {
  it("renders the page heading", () => {
    render(<PricingPage />)
    expect(
      screen.getByText(
        "Less than the cost of one hour with an AI consultant."
      )
    ).toBeInTheDocument()
  })

  it("renders three pricing tier cards", () => {
    render(<PricingPage />)
    expect(screen.getByText("Free Labs")).toBeInTheDocument()
    expect(screen.getByText("The Course")).toBeInTheDocument()
    expect(screen.getByText("Stay Current")).toBeInTheDocument()
  })

  it("displays the course monthly price", () => {
    render(<PricingPage />)
    expect(screen.getByText("£29.00")).toBeInTheDocument()
  })

  it("displays the ongoing monthly price", () => {
    render(<PricingPage />)
    expect(screen.getByText("£7.50")).toBeInTheDocument()
  })

  it("displays the total course cost", () => {
    render(<PricingPage />)
    expect(screen.getByText(/£87\.00 total/)).toBeInTheDocument()
  })

  it("displays free tier price", () => {
    render(<PricingPage />)
    expect(screen.getByText("£0")).toBeInTheDocument()
  })

  it("renders Stay Current advantages", () => {
    render(<PricingPage />)
    expect(
      screen.getByText(/scores decay if you stop/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/5 hours of new content every month/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/30 optional lessons/)
    ).toBeInTheDocument()
  })

  it("has Join the Waitlist CTA for free tier", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("link", { name: "Join the Waitlist" })
    ).toBeInTheDocument()
  })

  it("has Join the Earlybird Waitlist CTA for course tier", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("link", { name: /Join the Earlybird Waitlist/ })
    ).toBeInTheDocument()
  })

  it("has Most Popular badge on course tier", () => {
    render(<PricingPage />)
    expect(screen.getByText("Most Popular")).toBeInTheDocument()
  })

  it("has For Teams section with contact link", () => {
    render(<PricingPage />)
    expect(screen.getByText("For Teams")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Get in Touch/ })
    ).toBeInTheDocument()
  })
})
