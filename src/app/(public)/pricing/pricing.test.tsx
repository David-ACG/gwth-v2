import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import PricingPage from "./page"
import {
  COURSE_MONTHLY_PRICE,
  TOTAL_COURSE_COST,
  TOTAL_COURSE_MONTHS,
} from "@/lib/config"

/** Rows in the comparison table body, kept beside the component it mirrors. */
const COMPARISON_ROWS = 6

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
      screen.getByRole("heading", { level: 3, name: "Teams or institutions" })
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

  it("keeps Stay Current as an optional refresh offer once the three months are done", () => {
    render(<PricingPage />)
    expect(screen.getByText(/Stay Current remains available/)).toBeInTheDocument()
    expect(screen.getByText("Stay Current refreshes")).toBeInTheDocument()
    // Deliberately updated: the Member cell used to read "Available after
    // course", which hid the one number that proves there is no lock-in.
    // getAllByText because the drop is now stated in several places on the
    // page, which is the point (David could not find it when it was said once).
    // Deliberately updated (a-20260914-204053-7fd060): "after the course"
    // implied the course ends, which contradicts the rest of the site.
    expect(
      screen.getAllByText("£7.50/mo after the first three months").length
    ).toBeGreaterThan(0)
    // ...including beside the headline price on the Member card.
    const afters = screen.getAllByTestId("tier-after")
    expect(afters.length).toBeGreaterThanOrEqual(2)
    // "a month", not "/mo": the card line is a sentence now, not a price tag.
    expect(afters[0]!.textContent).toContain("£7.50 a month")
    expect(screen.getByTestId("masthead-price-line").textContent).toContain(
      "then £7.50 a month"
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
    expect(
      screen.getByRole("columnheader", { name: "Teams or institutions" })
    ).toBeInTheDocument()
    expect(screen.getByText("Admin dashboard")).toBeInTheDocument()
    expect(screen.getByText("Included for 5 or more")).toBeInTheDocument()
  })
})

/**
 * David's six /pricing annotations of 14 September 2026, one guard each. These
 * are semantic, not sentence-for-sentence: they hold the DECISION he made
 * rather than the wording somebody happened to write that day, so the copy can
 * still be edited without a test failing for no reason.
 */
describe("PricingPage: David's 2026-09-14 annotations", () => {
  const pageText = () => {
    const { container } = render(<PricingPage />)
    return (container.textContent ?? "").replace(/\s+/g, " ")
  }

  /** a-20260914-203458-8004f0: "This should be for teams or institutions". */
  it("names teams AND institutions, and has no column called only Team", () => {
    render(<PricingPage />)
    const headers = screen
      .getAllByRole("columnheader")
      .map((el) => (el.textContent ?? "").trim())
    expect(headers).toContain("Teams or institutions")
    expect(headers).not.toContain("Team")
    expect(headers).not.toContain("Teams")
    // The card above the table and the split section below it agree with it.
    expect(
      screen.getByRole("heading", { level: 3, name: "Teams or institutions" })
    ).toBeInTheDocument()
    const split = screen
      .getByRole("heading", { level: 2, name: /More visibility for managers/i })
      .closest("section")
    expect(split?.textContent ?? "").toMatch(/institutions/i)
  })

  /**
   * a-20260914-203605-149911: "jarring going from a large bold £29 to normal
   * text to larger text again to normal text again". The continuing price must
   * not open a second display size, and it must still be marked out by
   * something other than colour (bible tint-is-never-the-only-signal).
   */
  it("keeps the continuing price in the body stack, not at a second display size", () => {
    render(<PricingPage />)
    const prices = screen.getAllByTestId("tier-after-price")
    expect(prices.length).toBeGreaterThanOrEqual(2)
    for (const price of prices) {
      expect(price.textContent).toBe("£7.50")
      // A stable hook the stylesheet sizes and colours; the old markup leaned
      // on a bare <strong>, which is what grew to 1.3rem.
      expect(price.className).toMatch(/tierAfterPrice/)
      expect(price.tagName).toBe("STRONG")
      // It lives inside the after-line sentence, not inside the £29 block.
      const after = price.closest('[data-testid="tier-after"]')
      expect(after).not.toBeNull()
      expect(price.closest('[class*="tierPrice"]')).toBeNull()
    }
  })

  /** a-20260914-203941-b69458: the WHOLE three months, against one hour. */
  it("compares all three months, not one month, with an hour of consulting", () => {
    const text = pageText()
    expect(text).toMatch(
      /All three months together come to £87, less than the cost of one hour with an AI consultant/
    )
    // £87 is 3 x £29, so the claim cannot drift from the canonical price.
    expect(TOTAL_COURSE_COST).toBe(COURSE_MONTHLY_PRICE * TOTAL_COURSE_MONTHS)
    // The consultant comparison must not sweep the continuing price into it.
    const sentence = text.slice(text.indexOf("All three months together"))
    expect(sentence.slice(0, sentence.indexOf(".") + 1)).not.toMatch(/7\.50/)
  })

  /**
   * a-20260914-204053-7fd060: "I'm not sure we should say the course has
   * finished because it never really finishes because it's always up to date".
   */
  it("never says the course is finished, done or over", () => {
    const text = pageText().toLowerCase()
    for (const banned of [
      "after the course",
      "when the course is finished",
      "when the course is done",
      "course you have finished",
      "once the course is over",
      "when the teaching is done",
    ]) {
      expect(text).not.toContain(banned)
    }
    // What it says instead, and it says it more than once.
    expect(text.split("after the first three months").length - 1).toBeGreaterThanOrEqual(2)
  })

  /**
   * a-20260914-203753-b9d050: "Labs are quite different to lessons ... I'm not
   * sure whether we can still say this: try before you join. I think what we
   * can say is that you can stop at any time and that we have extremely fair
   * pricing".
   */
  it("drops try-before-you-join for cancellation and the fairer continuing price", () => {
    const text = pageText()
    expect(text.toLowerCase()).not.toContain("try before you join")
    expect(
      screen.queryByRole("heading", { name: /try before/i })
    ).not.toBeInTheDocument()
    const { container } = render(<PricingPage />)
    const closing = container.querySelector('[data-section="closing"]')
    const closingText = (closing?.textContent ?? "").replace(/\s+/g, " ")
    // Stop at any time.
    expect(closingText).toMatch(/cancel whenever you like|stop whenever you like/i)
    expect(closingText).toMatch(/unlock one month at a time/i)
    // The lower price, and what it keeps buying.
    expect(closingText).toMatch(/£7\.50 a month/)
    expect(closingText).toMatch(/first three months/i)
    expect(closingText).toMatch(/current as it changes|keeps every lesson current/i)
    // Cancellation is also visible without scrolling to the closing band.
    expect(screen.getAllByText(/Cancel anytime/i).length).toBeGreaterThan(0)
  })

  /**
   * a-20260914-203852-55e4f6: "I don't really like the heading text being
   * smaller than the text in the table." Rendering is asserted on the live
   * preview; what a unit test can hold is the structure that makes a header a
   * header, plus the scrollable region staying reachable on a phone.
   */
  it("gives the comparison table real, scoped headers and a reachable scroll region", () => {
    const { container } = render(<PricingPage />)
    const table = container.querySelector("table")
    expect(table).not.toBeNull()
    const columnHeaders = screen.getAllByRole("columnheader")
    expect(columnHeaders).toHaveLength(4)
    for (const th of columnHeaders) {
      expect(th.tagName).toBe("TH")
      expect(th).toHaveAttribute("scope", "col")
      expect(th.closest("thead")).not.toBeNull()
    }
    // Every row is labelled by its feature, so the header row is not the only
    // thing orienting a reader who has scrolled the table sideways.
    const rowHeaders = screen.getAllByRole("rowheader")
    expect(rowHeaders.length).toBe(COMPARISON_ROWS)
    for (const th of rowHeaders) expect(th).toHaveAttribute("scope", "row")
    const wrap = table!.parentElement!
    expect(wrap).toHaveAttribute("tabindex", "0")
    expect(wrap).toHaveAttribute("role", "region")
    expect(wrap).toHaveAttribute("aria-label")
  })
})
