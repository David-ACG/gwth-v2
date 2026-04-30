import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import PricingPage from "./page"

afterEach(cleanup)

describe("PricingPage", () => {
  it("renders the page heading as h1", () => {
    render(<PricingPage />)
    const h1 = screen.getByRole("heading", {
      level: 1,
      name: "Less than the cost of one hour with an AI consultant.",
    })
    expect(h1).toBeInTheDocument()
  })

  it("renders three pricing tier cards (sourced from PRICING data)", () => {
    render(<PricingPage />)
    expect(screen.getByText("Free Labs")).toBeInTheDocument()
    expect(screen.getByText("The Course")).toBeInTheDocument()
    expect(screen.getByText("Stay Current")).toBeInTheDocument()
  })

  it("displays the course monthly price", () => {
    render(<PricingPage />)
    expect(screen.getByText("£29")).toBeInTheDocument()
  })

  it("displays the ongoing monthly price", () => {
    render(<PricingPage />)
    expect(screen.getByText("£7.50")).toBeInTheDocument()
  })

  it("displays the total course cost in the per-tier line", () => {
    render(<PricingPage />)
    expect(screen.getByText(/£87 total/)).toBeInTheDocument()
  })

  it("displays free tier price", () => {
    render(<PricingPage />)
    expect(screen.getByText("£0")).toBeInTheDocument()
  })

  it("renders Stay Current advantages from the shared PRICING data", () => {
    render(<PricingPage />)
    expect(screen.getByText(/scores decay if you stop/)).toBeInTheDocument()
    expect(
      screen.getByText(/5 hours of new content every month/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/optional lessons you skipped/)
    ).toBeInTheDocument()
  })

  it("has Try a Free Lab CTA on the free tier", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("link", { name: /Try a Free Lab/i })
    ).toBeInTheDocument()
  })

  it("has Join the Waitlist CTA on the course tier", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("link", { name: /Join the Waitlist/i })
    ).toBeInTheDocument()
  })

  it("has Most Popular flag on the featured tier", () => {
    render(<PricingPage />)
    expect(screen.getByText("Most Popular")).toBeInTheDocument()
  })

  it("has For Teams section with contact link and learn-more link", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Same per-person price for UK teams/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Get in Touch/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Learn more/i })
    ).toBeInTheDocument()
  })
})
