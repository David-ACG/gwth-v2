import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import PricingPage from "./page"

afterEach(cleanup)

describe("PricingPage", () => {
  it("renders the page heading as h1", () => {
    render(<PricingPage />)
    const h1 = screen.getByRole("heading", {
      level: 1,
      name: /Three ways to learn\. Start free\./,
    })
    expect(h1).toBeInTheDocument()
  })

  it("renders the three redesigned pricing tiers", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("heading", { level: 3, name: "Free Labs" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 3, name: "Member" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 3, name: "Teams" })
    ).toBeInTheDocument()
  })

  it("displays free, member, and team pricing", () => {
    render(<PricingPage />)
    expect(screen.getByText("£0")).toBeInTheDocument()
    expect(screen.getByText("£29")).toBeInTheDocument()
    expect(screen.getByText("Same")).toBeInTheDocument()
  })

  it("does not prominently display the total course cost in the per-tier line", () => {
    render(<PricingPage />)
    expect(screen.queryByText(/£87 total/)).not.toBeInTheDocument()
  })

  it("keeps Stay Current as an optional post-course refresh offer", () => {
    render(<PricingPage />)
    expect(screen.getByText(/Stay Current remains available/)).toBeInTheDocument()
    expect(screen.getByText("Stay Current refreshes")).toBeInTheDocument()
    expect(screen.getByText("Available after course")).toBeInTheDocument()
  })

  it("has Try a Free Lab CTA on the free tier", () => {
    render(<PricingPage />)
    expect(screen.getByRole("link", { name: "Try a Free Lab" })).toHaveAttribute(
      "href",
      "/labs"
    )
  })

  it("has Join the Waitlist CTA on the member tier", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("link", { name: "Join the Waitlist" })
    ).toHaveAttribute("href", "/signup")
  })

  it("has Talk to us CTA on the team tier", () => {
    render(<PricingPage />)
    expect(screen.getByRole("link", { name: /Talk to us/i })).toHaveAttribute(
      "href",
      "/contact"
    )
  })

  it("has For Teams section with contact link and learn-more link", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Same learner experience\. More visibility for managers\./i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Contact GWTH/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /Learn about teams/i })
    ).toBeInTheDocument()
  })

  it("renders the redesigned comparison table", () => {
    render(<PricingPage />)
    expect(screen.getByRole("columnheader", { name: "Feature" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Free" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Member" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Team" })).toBeInTheDocument()
    expect(screen.getByText("Admin dashboard")).toBeInTheDocument()
    expect(screen.getByText("Included for 5+")).toBeInTheDocument()
  })
})
