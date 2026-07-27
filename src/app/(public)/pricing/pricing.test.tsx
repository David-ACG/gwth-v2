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
    // Deliberately updated: the Member cell used to read "Available after
    // course", which hid the one number that proves there is no lock-in.
    // getAllByText because the drop is now stated in several places on the
    // page, which is the point (David could not find it when it was said once).
    expect(
      screen.getAllByText("£7.50/mo after the course").length
    ).toBeGreaterThan(0)
    // ...including beside the headline price on the Member card.
    const afters = screen.getAllByTestId("tier-after")
    expect(afters.length).toBeGreaterThanOrEqual(2)
    expect(afters[0]!.textContent).toContain("£7.50/mo")
    expect(screen.getByTestId("masthead-price-line").textContent).toContain(
      "Then £7.50 a month"
    )
  })

  it("(W25) sends the free tier to the waitlist while Labs are private", () => {
    // Deliberately updated. This used to assert a "Try a Free Lab" link to
    // /labs unconditionally. The free tier IS the labs, so while
    // PRIVATE_CONTENT_MODE is on that button would land the visitor on a login
    // wall for a product whose signup is closed. Unset means LOCKED, which is
    // the production configuration, so that is the default asserted here.
    render(<PricingPage />)
    // Two of them: the free tier card and the closing block.
    const waitlistLinks = screen.getAllByRole("link", {
      name: "Join the waitlist",
    })
    expect(waitlistLinks.length).toBeGreaterThan(0)
    for (const link of waitlistLinks) {
      expect(link).toHaveAttribute("href", "/waitlist")
    }
    expect(screen.queryByRole("link", { name: "Try a Free Lab" })).toBeNull()
    expect(screen.queryByRole("link", { name: "Try a free lab" })).toBeNull()
  })

  it("(W25) restores the free-lab CTA once the mode is explicitly off", () => {
    const original = process.env.PRIVATE_CONTENT_MODE
    process.env.PRIVATE_CONTENT_MODE = "off"
    try {
      render(<PricingPage />)
      expect(
        screen.getByRole("link", { name: "Try a Free Lab" })
      ).toHaveAttribute("href", "/labs")
    } finally {
      if (original === undefined) delete process.env.PRIVATE_CONTENT_MODE
      else process.env.PRIVATE_CONTENT_MODE = original
    }
  })

  it("has Join the Waitlist CTA on the member tier", () => {
    // Deliberately updated (W26). This used to assert /signup, but W25 shut
    // registration, so /signup renders "Registration closed" behind a button
    // labelled "Join the Waitlist". Every waitlist-labelled CTA on the page
    // now goes to /waitlist, so the label tells the truth.
    render(<PricingPage />)
    expect(
      screen.getByRole("link", { name: "Join the Waitlist" })
    ).toHaveAttribute("href", "/waitlist")
  })

  it("does not expose a Stripe checkout CTA during beta", () => {
    const { container } = render(<PricingPage />)
    expect(container.querySelector('a[href="/api/stripe/checkout"]')).toBeNull()
    expect(container.querySelector('a[href^="/api/stripe"]')).toBeNull()
    expect(
      screen.queryByRole("link", { name: /checkout|buy|subscribe/i })
    ).not.toBeInTheDocument()
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
