/**
 * The new pricing page in each of its states: before sales open, in the £69
 * offer, after it, and with billing switched off. ENABLE_BILLING is read at
 * import time, so each case stubs the env and imports afresh (the pattern of
 * `gift/gift-sale-pages.test.tsx`).
 */
import { cleanup, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const BEFORE = new Date("2026-11-20T12:00:00Z")
const IN_SALE = new Date("2026-12-16T12:00:00Z")
const AFTER = new Date("2027-01-07T00:00:00Z")

async function load(billing: boolean, labs: "off" | "" = "off") {
  vi.resetModules()
  vi.stubEnv("BILLING_ENABLED", billing ? "true" : "")
  vi.stubEnv("SALES_OPEN_AT", "")
  vi.stubEnv("CHRISTMAS_SALE_ENDS_AT", "")
  // Selling needs the site public (docs/gift-sale-switch-on.md step 7).
  vi.stubEnv("PRIVATE_CONTENT_MODE", labs)
  const mod = await import("./pricing-next")
  return mod.PricingNext
}

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

const pageText = (container: HTMLElement) =>
  (container.textContent ?? "").replace(/\s+/g, " ")

const card = (plan: "pass" | "monthly") =>
  document.querySelector(`[data-plan="${plan}"]`) as HTMLElement

describe("PricingNext before sales open", () => {
  it("gives the three figures at the top and says when the course opens", async () => {
    const PricingNext = await load(true)
    render(<PricingNext now={BEFORE} />)
    expect(
      screen.getByRole("heading", { level: 1, name: "What the course costs" })
    ).toBeInTheDocument()
    const figures = screen.getByTestId("masthead-price-line")
    expect(figures).toHaveTextContent(
      "£69once, for all three months, if you buy from 14 December 2026 to 6 January 2027. After that, £87."
    )
    expect(figures).toHaveTextContent(
      "£29a month for the first three months, then £7.50 a month if you stay. Cancel at any time."
    )
    expect(figures).toHaveTextContent("£0for the free lesson and the six free labs.")
    expect(screen.getByTestId("pricing-opens")).toHaveTextContent(
      "The course opens on 14 December 2026. These are the prices from that day."
    )
  })

  it("shows both ways to pay with no checkout: the waitlist is the only button", async () => {
    const PricingNext = await load(true)
    const { container } = render(<PricingNext now={BEFORE} />)
    expect(card("pass")).toHaveTextContent("£69 once")
    expect(card("pass")).toHaveTextContent(
      "This is the price from 14 December 2026 to 6 January 2027. After that a pass costs £87."
    )
    expect(card("pass")).toHaveTextContent("Christmas price")
    expect(card("pass")).toHaveTextContent("On sale from 14 December 2026")
    expect(card("monthly")).toHaveTextContent("£29 a month")
    expect(card("monthly")).toHaveTextContent("On sale from 14 December 2026")
    expect(screen.queryByRole("button", { name: /Buy the whole course/ })).toBeNull()
    expect(screen.queryByRole("button", { name: /Join for/ })).toBeNull()
    expect(screen.queryByRole("link", { name: "Give it as a gift" })).toBeNull()
    expect(container.querySelector('a[href^="/api/"]')).toBeNull()
    const offer = screen.getByTestId("pricing-offer")
    expect(
      within(offer).getByRole("link", { name: "Join the waitlist" })
    ).toHaveAttribute("href", "/waitlist")
    expect(pageText(container)).toContain("Gifts go on sale on 14 December 2026.")
  })

  it("offers the free lesson, and never a link into the course lessons", async () => {
    const PricingNext = await load(true)
    const { container } = render(<PricingNext now={BEFORE} />)
    const lessonLinks = screen.getAllByRole("link", { name: "Try the free lesson" })
    expect(lessonLinks.length).toBeGreaterThanOrEqual(2)
    for (const link of lessonLinks) expect(link).toHaveAttribute("href", "/start-here")
    const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href") ?? "")
    expect(hrefs.filter((h) => /^\/(course|lessons?|dashboard)\b/.test(h))).toEqual([])
  })
})

describe("PricingNext while the £69 offer runs", () => {
  it("sells both ways to pay from their own cards, and the gift", async () => {
    const PricingNext = await load(true)
    render(<PricingNext now={IN_SALE} />)
    expect(
      within(card("pass")).getByRole("button", { name: "Buy the whole course (£69)" })
    ).toBeInTheDocument()
    expect(
      within(card("monthly")).getByRole("button", { name: "Join for £29 a month" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Give it as a gift" })).toHaveAttribute("href", "/gift")
    expect(screen.queryByRole("link", { name: /join the waitlist/i })).toBeNull()
    expect(screen.queryByTestId("pricing-opens")).toBeNull()
    expect(card("pass")).not.toHaveTextContent("On sale from")
    // The top and closing buttons lead to the cards, not straight to a checkout.
    for (const link of screen.getAllByRole("link", { name: "Choose how to pay" })) {
      expect(link).toHaveAttribute("href", "#how-to-pay")
    }
    expect(document.getElementById("how-to-pay")).not.toBeNull()
  })

  it("keeps the offer dates and the full price in view", async () => {
    const PricingNext = await load(true)
    render(<PricingNext now={IN_SALE} />)
    const offer = screen.getByTestId("pricing-offer")
    expect(offer).toHaveTextContent("14 December 2026")
    expect(offer).toHaveTextContent("6 January 2027")
    expect(offer).toHaveTextContent("£87")
    expect(document.querySelector('[data-tier="gift"]')).toHaveTextContent(
      "Gifts stay on sale after the £69 price ends."
    )
  })
})

describe("PricingNext after the offer ends", () => {
  it("switches the pass to £87 by itself and drops the offer words", async () => {
    const PricingNext = await load(true)
    const { container } = render(<PricingNext now={AFTER} />)
    expect(pageText(container)).not.toContain("£69")
    expect(pageText(container)).not.toContain("Christmas price")
    expect(screen.getByTestId("masthead-price-line")).toHaveTextContent(
      "£87once, for all three months."
    )
    expect(card("pass")).toHaveTextContent("£87 once")
    expect(
      screen.getByRole("button", { name: "Buy the whole course (£87)" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Give it as a gift" })).toHaveAttribute("href", "/gift")
  })
})

describe("PricingNext with billing switched off", () => {
  it("never sells, whatever the date", async () => {
    const PricingNext = await load(false)
    render(<PricingNext now={IN_SALE} />)
    expect(screen.queryByRole("button", { name: /Buy the whole course|Join for/ })).toBeNull()
    expect(screen.queryByRole("link", { name: "Give it as a gift" })).toBeNull()
    expect(screen.getAllByRole("link", { name: "Join the waitlist" }).length).toBeGreaterThan(0)
    // The opening date has passed, so the page does not announce it as ahead.
    expect(screen.queryByTestId("pricing-opens")).toBeNull()
    expect(card("pass")).not.toHaveTextContent("On sale from")
  })
})

describe("PricingNext: labs buttons follow the content mode", () => {
  it("offers a free lab only when the labs can be reached", async () => {
    const Open = await load(true, "off")
    render(<Open now={BEFORE} />)
    expect(screen.getByRole("link", { name: "Try a free lab" })).toHaveAttribute("href", "/labs")
    cleanup()
    const Private = await load(true, "")
    render(<Private now={BEFORE} />)
    expect(screen.queryByRole("link", { name: "Try a free lab" })).toBeNull()
    expect(document.querySelector('[data-tier="free"]')).toHaveTextContent(
      "All six labs are free forever, with no card required"
    )
  })
})

describe("PricingNext: the page as a whole, in every state", () => {
  const STATES: [string, boolean, Date][] = [
    ["before sales open", true, BEFORE],
    ["in the offer", true, IN_SALE],
    ["after the offer", true, AFTER],
    ["billing off", false, BEFORE],
  ]

  for (const [name, billing, now] of STATES) {
    it(`${name}: no dashes or section signs, one h1, headings in order, pictures described`, async () => {
      const PricingNext = await load(billing)
      const { container } = render(<PricingNext now={now} />)
      const text = pageText(container)
      expect(text).not.toMatch(/[‒–—―§]/)
      for (const img of container.querySelectorAll("img")) {
        expect(img.getAttribute("alt") ?? "").not.toMatch(/[‒–—―§]/)
        expect((img.getAttribute("alt") ?? "").length).toBeGreaterThan(40)
      }
      expect(container.querySelectorAll("h1")).toHaveLength(1)
      // No heading skips a level on the way down.
      const levels = [...container.querySelectorAll("h1, h2, h3, h4, h5")].map((h) =>
        Number(h.tagName.slice(1))
      )
      levels.forEach((level, i) => {
        if (i > 0) expect(level - levels[i - 1]!).toBeLessThanOrEqual(1)
      })
      // Four pictures, each with a paper and a dusk render from /pricing/.
      const sources = [...container.querySelectorAll("img")].map((i) => i.getAttribute("src") ?? "")
      for (const picture of ["choose", "updated", "gift", "team"]) {
        expect(sources.some((s) => s.includes(`${picture}.jpg`))).toBe(true)
        expect(sources.some((s) => s.includes(`${picture}-dark.jpg`))).toBe(true)
      }
      // The month-opening rule comes before the ways to pay in every state
      // (David, 12 Nov 2026, option A), and the reminder beside them says so.
      const rule = container.querySelector('[data-testid="month-opening-rules"]') as HTMLElement
      const offer = container.querySelector('[data-testid="pricing-offer"]') as HTMLElement
      expect(rule.compareDocumentPosition(offer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(offer).toHaveTextContent("opening rules above")
      expect(text).not.toContain("opening rules below")
      // The protective statements are on the page in every state.
      expect(text).toContain(
        "Your access to the course lessons stops. You only pay again if you choose to subscribe at £7.50 a month."
      )
      expect(text).toContain("Before Month 2 opens, you must finish 75% of Month 1's core lessons")
      expect(text).toContain("We refund a pass in full until it's opened, but not after, unless the law requires")
      expect(text).toContain("It is marked against GWTH's published marking guides")
      expect(text).toContain("Anyone aged 16 or over")
    })
  }

  it("names no AI model version and dates no check", async () => {
    const PricingNext = await load(true)
    const { container } = render(<PricingNext now={BEFORE} />)
    const text = pageText(container)
    expect(text).not.toMatch(/\b(GPT|Opus|Sonnet|Gemini|Fable|Sol|Astra)\b/)
    expect(text).not.toMatch(/as of|last checked|at the time of writing/i)
  })

  it("sends organisations to the one page written for them, or to contact", async () => {
    const PricingNext = await load(true)
    const { container } = render(<PricingNext now={BEFORE} />)
    expect(
      screen.getByRole("link", { name: "GWTH for organisations" })
    ).toHaveAttribute("href", "/for-organisations")
    expect(container.querySelector('a[href="/for-teams"]')).toBeNull()
    expect(container.querySelector('a[href="/for-institutions"]')).toBeNull()
    const teams = container.querySelector('[data-section="teams"]') as HTMLElement
    expect(within(teams).getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact")
  })
})
