import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import PricingPage from "./page"
import { TOTAL_MANDATORY_LESSONS } from "@/lib/config"

/**
 * Rows in the comparison table body, kept beside the component it mirrors.
 * Five while the team dashboard is off; the "Manager dashboard" row is the
 * sixth once ENABLE_TEAM_DASHBOARD is on (David, 2026-10-21, option B).
 */
const COMPARISON_ROWS = 5

afterEach(cleanup)

/** The tier cards, scoped: the phone comparison also names each plan. */
function tiers() {
  return within(
    document.querySelector('[data-section="tiers"]') as HTMLElement
  )
}

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
      // Sentence case since 2026-10-20 (Sol copy check).
      tiers().getByRole("heading", { level: 3, name: "Free labs" })
    ).toBeInTheDocument()
    expect(
      tiers().getByRole("heading", { level: 3, name: "Member" })
    ).toBeInTheDocument()
    // Deliberately updated (copy gate, 2026-09-28, commit f3816ac): David
    // chose to separate teams from institutions, so the per-person tier is
    // "Teams" and institutions get a proposal instead.
    expect(
      tiers().getByRole("heading", { level: 3, name: "Teams" })
    ).toBeInTheDocument()
  })

  it("describes the free tier as the six Model Lab labs (2026-10-21)", () => {
    render(<PricingPage />)
    const text = document.body.textContent ?? ""
    expect(text).toContain("All six free labs, no card required")
    expect(text).toContain("New AI models tested on the same real work tasks")
    expect(text).toContain("Re-tested when new models come out")
    expect(text).toContain("The six free labs")
    expect(text).toMatch(/The free labs test new AI models on the same real work tasks/)
    expect(text).not.toMatch(/one real task|Side-by-side comparisons/)
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

  it("keeps the £7.50 plan as an optional refresh offer once the three months are done", () => {
    render(<PricingPage />)
    // Launch readiness, 2026-10-20: "Stay Current" was a product name the
    // page never explained, so the page now says what it is.
    expect(
      screen.getByText(/Keeping your lessons up to date stays available/)
    ).toBeInTheDocument()
    expect(screen.getAllByText("Lessons kept up to date").length).toBeGreaterThan(0)
    // Optional, and said once how each way of paying carries on (Sol).
    expect(screen.getByTestId("masthead-price-line").textContent).toMatch(
      /then £7\.50 a month if you stay/
    )
    expect(document.body.textContent).toMatch(
      /Monthly plans carry on at that price by themselves/
    )
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
      // Sentence case (launch readiness, 2026-10-20; bible: no title-case CTAs).
      expect(
        tiers().getByRole("link", { name: "Try a free lab" })
      ).toHaveAttribute("href", "/labs")
    } finally {
      if (original === undefined) delete process.env.PRIVATE_CONTENT_MODE
      else process.env.PRIVATE_CONTENT_MODE = original
    }
  })

  it("has a Join the waitlist CTA on the member tier before sales open", () => {
    // Deliberately updated (W26). This used to assert /signup, but W25 shut
    // registration, so /signup renders "Registration closed" behind a button
    // labelled "Join the Waitlist". Every waitlist-labelled CTA on the page
    // now goes to /waitlist, so the label tells the truth. Sentence case since
    // 2026-10-20 (bible: no title-case CTAs).
    render(<PricingPage />)
    const member = document.querySelector('[data-tier="course"]') as HTMLElement
    expect(
      within(member).getByRole("link", { name: "Join the waitlist" })
    ).toHaveAttribute("href", "/waitlist")
  })

  /**
   * Launch readiness checklist, check 5: a page that takes money says what
   * happens next, how to cancel and how to get a refund, and links the terms
   * that apply, beside the paying buttons. Summarised from Terms sections 6
   * and 7, never redrafted.
   */
  it("puts what happens next, cancelling, refunds and the Terms beside the paying buttons", () => {
    render(<PricingPage />)
    const pass = screen.getByTestId("pricing-offer-terms")
    expect(pass.textContent).toMatch(/never renews/)
    expect(pass.textContent).toMatch(/refund a pass in full until it.s opened/)
    expect(within(pass).getByRole("link", { name: /Terms/ })).toHaveAttribute("href", "/terms#passes")
    expect(within(pass).getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/contact")
    const monthly = screen.getByTestId("member-terms")
    expect(monthly.textContent).toMatch(/Cancel at any time in your account settings/)
    // Only the first three payments open a month; after that the plan carries
    // on at £7.50 unless you cancel (Terms section 6, Sol copy check).
    expect(monthly.textContent).toMatch(/first three monthly payments each open one month/)
    expect(monthly.textContent).toMatch(/£7\.50 a month to keep your lessons up to date, unless you cancel/)
    expect(pass.textContent).toMatch(/one year from the date you buy it to enter the gift code/)
    expect(within(monthly).getByRole("link")).toHaveAttribute(
      "href",
      "/terms#subscriptions"
    )
    expect(monthly.textContent).toMatch(/refunds/)
  })

  it("says when Months 2 and 3 open and that time is paused if a month is late", () => {
    render(<PricingPage />)
    const member = document.querySelector('[data-tier="course"]')?.textContent ?? ""
    expect(member).toMatch(/Month 2 opens around 1 January 2027 and Month 3 around 1 February 2027/)
    expect(member).toMatch(/your time is paused/)
    expect(screen.getByTestId("pricing-offer-months").textContent).toMatch(/your time is paused/)
  })

  it("prints the core count from config, no optional count, and the projects the home page names", () => {
    render(<PricingPage />)
    const member = document.querySelector('[data-tier="course"]')?.textContent ?? ""
    expect(member).toContain(`${TOTAL_MANDATORY_LESSONS} core lessons`)
    expect(member).not.toMatch(/\d+ go-deeper|\d+ optional/)
    expect(member).toMatch(/Family AI Bot/)
    expect(member).toMatch(/AskMyCo/)
    expect(member).toMatch(/your own AI consultant/)
    expect(member).not.toMatch(/AskEveryone|Capstones for/)
    expect(document.body.textContent).not.toMatch(/optional lessons you skipped/)
  })

  it("says no VAT is added", () => {
    render(<PricingPage />)
    expect(screen.getByText(/no VAT added/)).toBeInTheDocument()
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

  it("Teams section says what a team gets today and links to For teams", () => {
    // David, 2026-10-21, option B: the manager dashboard is promised only once
    // ENABLE_TEAM_DASHBOARD is on (see pricing-team-dashboard.test.tsx). Off,
    // which is every environment today, nothing promises a dashboard for a
    // team, a minimum size or role recommendations.
    const { container } = render(<PricingPage />)
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Same course for everyone\. A tutor dashboard for larger groups\./i,
      })
    ).toBeInTheDocument()
    const body = screen.getByTestId("teams-split-body").textContent ?? ""
    expect(body).toMatch(/no minimum team size/i)
    expect(body).not.toMatch(/admin dashboard|manager dashboard|by role|5 or more/i)
    expect(container.querySelector('a[href="/for-teams"]')).not.toBeNull()
    expect(container.textContent).not.toMatch(
      /5 or more|Role-specific|Admin dashboard|manager dashboard|view of progress/i
    )
  })

  it("renders the redesigned comparison table", () => {
    render(<PricingPage />)
    expect(screen.getByRole("columnheader", { name: "Feature" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Free" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Member" })).toBeInTheDocument()
    // Deliberately updated (copy gate, 2026-09-28): see the tier test above.
    expect(
      screen.getByRole("columnheader", { name: "Teams" })
    ).toBeInTheDocument()
    // The "Admin dashboard / Included for 5 or more" row went on 2026-10-21;
    // it comes back as "Manager dashboard" with ENABLE_TEAM_DASHBOARD.
    expect(screen.queryAllByText("Admin dashboard")).toHaveLength(0)
    expect(screen.queryAllByText("Manager dashboard")).toHaveLength(0)
  })

  /**
   * Launch readiness, 2026-10-20: at 390px the table cut off the Member column
   * and hid the Teams column. Phones get one block per plan with every row,
   * so nothing in the table is unreadable there (the stylesheet shows one of
   * the two at any width).
   */
  it("gives phones the comparison one plan at a time, with every row", () => {
    render(<PricingPage />)
    const plans = screen.getAllByTestId("compare-stack-plan")
    expect(plans.map((p) => p.querySelector("h3")?.textContent)).toEqual([
      "Free",
      "Member",
      "Teams",
    ])
    for (const plan of plans) {
      expect(plan.querySelectorAll("dt")).toHaveLength(COMPARISON_ROWS)
    }
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

  /**
   * a-20260914-203458-8004f0: "This should be for teams or institutions".
   * Refined by David on 2026-09-28 (copy gate, option 1 of the pricing line):
   * "Teams pay the same per-person price ... Institutions that want their own
   * edition get a proposal based on what they need." Institutions no longer
   * pay the per-person price, so they cannot share its tier; the tier is
   * "Teams" and institutions are still named, with their own route, on the
   * page. What still holds from 09-14: no column called only "Team", and the
   * page speaks to institutions as well as teams.
   */
  it("names teams AND institutions, and has no column called only Team", () => {
    render(<PricingPage />)
    const headers = screen
      .getAllByRole("columnheader")
      .map((el) => (el.textContent ?? "").trim())
    expect(headers).toContain("Teams")
    expect(headers).not.toContain("Team")
    // The card above the table agrees with it.
    expect(
      tiers().getByRole("heading", { level: 3, name: "Teams" })
    ).toBeInTheDocument()
    // Institutions are told they get a proposal, not the per-person price...
    const split = screen
      .getByRole("heading", { level: 2, name: /A tutor dashboard for larger groups/i })
      .closest("section")
    expect(split?.textContent ?? "").toMatch(/institutions/i)
    expect(split?.textContent ?? "").toMatch(/proposal/i)
    // ...and have a way through to the page written for them.
    expect(
      screen.getByRole("link", { name: /Learn about institutions/i })
    ).toHaveAttribute("href", "/for-institutions")
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

  /**
   * a-20260914-203941-b69458 asked for "the whole three months are less than
   * the cost of one hour with a consultant". SUPERSEDED on 2026-10-20 by the
   * launch readiness check, which David accepted for every page ("Use your
   * recommendations for all 30 pages"): both reviewers read the consultant
   * hour as an unsupported comparison. What still holds from his annotation:
   * the masthead talks about the whole course, and the £7.50 is never swept
   * into a three-month total.
   */
  it("states what you pay, with no unsupported consultant comparison", () => {
    const text = pageText()
    expect(text).not.toMatch(/hour with an AI consultant|cost of one hour/i)
    expect(text).not.toMatch(/pricing theatre|unusually fair|keeps us honest/i)
    expect(text).toMatch(/pay once for the whole course/i)
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
    expect(screen.getAllByText(/Cancel at any time/i).length).toBeGreaterThan(0)
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
