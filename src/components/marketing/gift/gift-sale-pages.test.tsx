/**
 * The gift page and the pricing page's sale band, before, during and after
 * the Christmas sale (beads gwth-launch-v1uj.5 and .9). ENABLE_BILLING is read
 * at import time, so each case stubs the env and imports afresh.
 */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const BEFORE = new Date("2026-11-20T12:00:00Z")
const IN_SALE = new Date("2026-12-10T12:00:00Z")
const AFTER = new Date("2027-01-07T00:00:00Z")

async function load(billing: boolean) {
  vi.resetModules()
  vi.stubEnv("BILLING_ENABLED", billing ? "true" : "")
  vi.stubEnv("SALES_OPEN_AT", "")
  vi.stubEnv("CHRISTMAS_SALE_ENDS_AT", "")
  // Selling needs the site public (docs/gift-sale-switch-on.md step 7).
  vi.stubEnv("PRIVATE_CONTENT_MODE", "off")
  const gift = await import("./gift-page")
  const pricing = await import("@/components/marketing/pricing-fde/pricing-fde")
  return { GiftPage: gift.GiftPage, PricingFde: pricing.PricingFde }
}

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe("/gift", () => {
  it("says when gifts go on sale, with no form, before 1 December", async () => {
    const { GiftPage } = await load(true)
    render(<GiftPage now={BEFORE} />)
    expect(screen.getByTestId("gift-not-on-sale")).toHaveTextContent("1 December 2026")
    expect(screen.queryByTestId("gift-form")).toBeNull()
    expect(screen.getByRole("link", { name: /open your gift/i })).toHaveAttribute("href", "/gift/open")
  })

  it("stays closed while billing is off, whatever the date", async () => {
    const { GiftPage } = await load(false)
    render(<GiftPage now={IN_SALE} />)
    expect(screen.queryByTestId("gift-form")).toBeNull()
  })

  it("sells the whole course at £69 (was £87) and the first month at £29 in the sale, Christmas morning offered", async () => {
    const { GiftPage } = await load(true)
    render(<GiftPage now={IN_SALE} />)
    expect(screen.getByTestId("gift-product-course")).toHaveTextContent("£69")
    expect(screen.getByTestId("gift-product-course")).toHaveTextContent("£87")
    expect(screen.getByTestId("gift-product-course")).toHaveTextContent("6 January 2027")
    expect(screen.getByTestId("gift-product-month1")).toHaveTextContent("£29")
    expect(screen.getByLabelText(/Christmas morning/)).toBeChecked()
    expect(screen.getByTestId("gift-pay")).toHaveTextContent("£69")
  })

  it("sells the whole course at £87 all year from 7 January, with no Christmas option", async () => {
    const { GiftPage } = await load(true)
    render(<GiftPage now={AFTER} />)
    expect(screen.getByTestId("gift-product-course")).toHaveTextContent("£87")
    expect(screen.getByTestId("gift-product-course")).not.toHaveTextContent("£69")
    expect(screen.queryByLabelText(/Christmas morning/)).toBeNull()
    expect(screen.getByLabelText(/Straight away/)).toBeChecked()
  })
})

describe("/pricing during the gift sale", () => {
  it("is unchanged before sales open: no sale band, the waitlist still offered", async () => {
    const { PricingFde } = await load(true)
    render(<PricingFde now={BEFORE} />)
    expect(screen.queryByTestId("pricing-offer")).toBeNull()
    expect(screen.getAllByRole("link", { name: /join the waitlist/i }).length).toBeGreaterThan(0)
  })

  it("offers £69 for the whole course until 6 January, the gift page and the monthly join", async () => {
    const { PricingFde } = await load(true)
    render(<PricingFde now={IN_SALE} />)
    const band = screen.getByTestId("pricing-offer")
    expect(band).toHaveTextContent("£69 until 6 January 2027")
    expect(band).toHaveTextContent("£87")
    expect(screen.getByRole("button", { name: "Buy the whole course (£69)" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Give it as a gift" })).toHaveAttribute("href", "/gift")
    expect(screen.getAllByRole("button", { name: "Join for £29 a month" }).length).toBeGreaterThan(0)
    expect(screen.queryByRole("link", { name: /join the waitlist/i })).toBeNull()
  })

  it("switches the band to £87 by itself from 7 January", async () => {
    const { PricingFde } = await load(true)
    render(<PricingFde now={AFTER} />)
    const band = screen.getByTestId("pricing-offer")
    expect(band).not.toHaveTextContent("£69")
    expect(screen.getByRole("button", { name: "Buy the whole course (£87)" })).toBeInTheDocument()
  })
})
