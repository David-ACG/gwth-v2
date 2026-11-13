import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import PricingPage from "./page"
import { TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { DEFAULT_GATE_PERCENT, gatePercent } from "@/lib/protection/month-hold"

/**
 * Rows in the "Choose how to pay" comparison. Persona review round 2 (D16,
 * 7 Nov 2026): every persona wanted the two ways to pay side by side, so the
 * old Free / Member / Teams cards and the feature table were replaced on
 * 12 Nov 2026 by one comparison (Pay monthly, Pay once for three months) and
 * a short "What you get" (the course, the free labs, a gift).
 */
const PAY_ROWS = 4

afterEach(cleanup)

/** The "What you get" cards. */
function tiers() {
  return within(
    document.querySelector('[data-section="tiers"]') as HTMLElement
  )
}

describe("PricingPage", () => {
  it("renders the page heading as h1", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("heading", { level: 1, name: "Choose how to join GWTH" })
    ).toBeInTheDocument()
  })

  it("puts the two ways to pay side by side, with four rows (D16)", () => {
    render(<PricingPage />)
    const table = screen.getByTestId("pay-compare")
    const headers = within(table).getAllByRole("columnheader").map((h) => (h.textContent ?? "").trim())
    expect(headers.slice(1)).toEqual(["Pay monthly", "Pay once for three months"])
    expect(within(table).getAllByRole("rowheader")).toHaveLength(PAY_ROWS)
    expect(table.textContent).toMatch(/All three cost £87/)
    expect(table.textContent).toMatch(/Your plan continues automatically unless you cancel/)
    expect(table.textContent).toMatch(/Your lesson access ends unless you choose to continue/)
    expect(table.textContent).toMatch(/We email you before each payment/)
  })

  it("lists what you get: the course, the free labs and a gift", () => {
    render(<PricingPage />)
    for (const name of ["The course", "Free labs", "Give the course as a gift"]) {
      expect(tiers().getByRole("heading", { level: 3, name })).toBeInTheDocument()
    }
    const text = document.body.textContent ?? ""
    expect(text).toContain("All six labs are free forever, with no card required")
    expect(text).toMatch(/test new AI models on the same real work tasks/)
    expect(text).toContain("We re-test when new models come out")
    expect(text).not.toMatch(/one real task|Side-by-side comparisons/)
  })

  it("does not prominently display the total course cost in the per-tier line", () => {
    render(<PricingPage />)
    expect(screen.queryByText(/£87 total/)).not.toBeInTheDocument()
  })

  it("keeps the £7.50 continued access optional once the three months are done", () => {
    render(<PricingPage />)
    expect(screen.getByTestId("masthead-price-line").textContent).toMatch(
      /then £7\.50 a month if you stay/
    )
    // Said once, below the comparison (persona review D25).
    expect(screen.getByTestId("pricing-continuation").textContent).toMatch(
      /After the first three months, continued access to updated lessons costs £7\.50 a month/
    )
  })

  it("(W25) sends the free tier to the waitlist while Labs are private", () => {
    render(<PricingPage />)
    const waitlistLinks = screen.getAllByRole("link", { name: "Join the waitlist" })
    expect(waitlistLinks.length).toBeGreaterThan(0)
    for (const link of waitlistLinks) expect(link).toHaveAttribute("href", "/waitlist")
    expect(screen.queryByRole("link", { name: "Try a free lab" })).toBeNull()
  })

  it("(W25) restores the free-lab CTA once the mode is explicitly off", () => {
    const original = process.env.PRIVATE_CONTENT_MODE
    process.env.PRIVATE_CONTENT_MODE = "off"
    try {
      render(<PricingPage />)
      expect(tiers().getByRole("link", { name: "Try a free lab" })).toHaveAttribute("href", "/labs")
    } finally {
      if (original === undefined) delete process.env.PRIVATE_CONTENT_MODE
      else process.env.PRIVATE_CONTENT_MODE = original
    }
  })

  it("has a Join the waitlist CTA beside the comparison before sales open", () => {
    render(<PricingPage />)
    const offer = screen.getByTestId("pricing-offer")
    expect(within(offer).getByRole("link", { name: "Join the waitlist" })).toHaveAttribute("href", "/waitlist")
  })

  /**
   * Launch readiness checklist, check 5: a page that takes money says what
   * happens next, how to cancel and how to get a refund, and links the terms
   * that apply, beside the paying buttons. Summarised from Terms sections 6
   * and 7, never redrafted.
   */
  it("puts what happens next, cancelling, refunds and the Terms beside the paying buttons", () => {
    render(<PricingPage />)
    const offer = screen.getByTestId("pricing-offer")
    expect(offer.textContent).toMatch(/Cancel at any time in your account settings/)
    expect(offer.textContent).toMatch(/Each payment opens one month/)
    expect(offer.textContent).toMatch(/Does it renew\?/)
    const terms = screen.getByTestId("pricing-offer-terms")
    expect(terms.textContent).toMatch(/refund a pass in full until it.s opened/)
    expect(within(terms).getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/contact")
    expect(within(terms).getByRole("link", { name: "Terms for passes" })).toHaveAttribute("href", "/terms#passes")
    expect(within(terms).getByRole("link", { name: "Terms for monthly payments" })).toHaveAttribute("href", "/terms#subscriptions")
    expect(terms.textContent).toMatch(/refunds/)
    const gift = document.querySelector('[data-tier="gift"]')?.textContent ?? ""
    expect(gift).toMatch(/one year from purchase to enter their code/)
  })

  /**
   * The 75% rule (bead gwth-launch-735c, David 12 Nov 2026: "set it to 75%
   * lessons complete for now"). Consumer law needs it in front of a buyer
   * before they pay: in full above both buying options, and beside each
   * paying button, with the share read from the gate itself.
   */
  it("explains the 75% rule, the review hold and the personal links before either buying option", () => {
    render(<PricingPage />)
    const rules = screen.getByTestId("month-opening-rules")
    expect(rules).toHaveAttribute("id", "month-opening-rules")
    const text = (rules.textContent ?? "").replace(/\s+/g, " ")
    expect(screen.getByRole("heading", { name: "When each course month opens" })).toBeInTheDocument()
    expect(text).toContain(`Before Month 2 opens, you must finish ${DEFAULT_GATE_PERCENT}% of Month 1's core lessons`)
    expect(text).toContain(`Before Month 3 opens, you must finish ${DEFAULT_GATE_PERCENT}% of Month 2's core lessons`)
    expect(text).toMatch(/Optional lessons do not count and are never required/)
    expect(text).toMatch(/no time limit/)
    expect(text).toMatch(/latest of three points/)
    expect(text).toMatch(/your course time is paused/)
    expect(text).toMatch(/your next payment waits until that month can open; your plan is not cancelled/)
    expect(text).toMatch(/held for a person at GWTH to review, usually within a day/)
    expect(screen.getByTestId("media-links-note").textContent).toMatch(/links made for your account that stop working after a few hours/)
    expect(within(rules).getByRole("link", { name: "how months open" })).toHaveAttribute("href", "/terms#course-months")
    expect(within(rules).getByRole("link", { name: "how we protect the course" })).toHaveAttribute("href", "/terms#course-protection")
    // Above both buying options: the rules come before the pay-once band.
    const offer = screen.getByTestId("pricing-offer")
    expect(rules.compareDocumentPosition(offer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // Nothing that is not built: no watermark, challenge or device limit.
    expect(text).not.toMatch(/watermark|identifier|captcha|challenge|device limit/i)
  })

  it("shows the same share the gate uses when MONTH_GATE_PERCENT is unset", () => {
    // Changing the share means changing the Terms first; the gate's default
    // and the public wording are one number.
    expect(gatePercent(undefined)).toBe(DEFAULT_GATE_PERCENT)
    expect(DEFAULT_GATE_PERCENT).toBe(75)
  })

  it("repeats the rule beside the paying buttons and links to it", () => {
    // Persona layout: both buttons share one row, so one note under it carries
    // both button notes (master's wording, bead gwth-launch-735c).
    render(<PricingPage />)
    const note = screen.getByTestId("pricing-offer-rule")
    expect(note.textContent).toContain(`${DEFAULT_GATE_PERCENT}% of the previous month's core lessons`)
    expect(within(note).getByRole("link", { name: "opening rules above" })).toHaveAttribute("href", "#month-opening-rules")
    expect(note.textContent).toMatch(/your pass time is paused while you wait/)
    expect(note.textContent).toMatch(/your next payment waits until that month can open/)
  })

  it("says when Months 2 and 3 open for everyone, beside the pay-once offer", () => {
    render(<PricingPage />)
    const member = document.querySelector('[data-tier="course"]')?.textContent ?? ""
    expect(member).toMatch(/Three monthly parts, with the opening rules explained above/)
    const months = screen.getByTestId("pricing-offer-months").textContent ?? ""
    expect(months.replace(/\s+/g, " ")).toMatch(/Month 2 around 1 January 2027 and Month 3 around 1 February 2027/)
    expect(months).toMatch(/opening rules above/)
    // The full 75% rule sits above the comparison, before either button.
    const rules = screen.getByTestId("month-opening-rules")
    expect(rules.compareDocumentPosition(screen.getByTestId("pay-compare")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("prints the core count from config, no optional count, and the projects the home page names", () => {
    render(<PricingPage />)
    const member = document.querySelector('[data-tier="course"]')?.textContent ?? ""
    expect(member).toContain(`${TOTAL_MANDATORY_LESSONS} core lessons`)
    expect(member).not.toMatch(/\d+ go-deeper|\d+ optional/)
    // 12 Nov 2026: the Family AI Bot lessons are optional in the syllabus, so
    // the course leads with a core Month 1 project (bead gwth-launch-ote8).
    expect(member).toMatch(/portfolio website/)
    expect(member).not.toMatch(/Family AI Bot/)
    expect(member).toMatch(/AskMyCo/)
    expect(member).toMatch(/your own AI consultant/)
    // The latest Sol, 12 Nov 2026: no "hidden charges" while AI tool costs are unstated.
    expect(member).not.toMatch(/hidden charges/i)
    expect(document.body.textContent).not.toMatch(/optional lessons you skipped/)
  })

  it("says no VAT is added, in pounds for the UK", () => {
    render(<PricingPage />)
    expect(screen.getByText(/Prices in pounds for the UK, with no VAT added/)).toBeInTheDocument()
  })

  it("does not expose a Stripe checkout CTA during beta", () => {
    const { container } = render(<PricingPage />)
    expect(container.querySelector('a[href="/api/stripe/checkout"]')).toBeNull()
    expect(container.querySelector('a[href^="/api/stripe"]')).toBeNull()
    expect(screen.queryByRole("link", { name: /checkout|buy|subscribe/i })).not.toBeInTheDocument()
  })

  it("Teams section says what a team gets today and links to For teams", () => {
    // David, 2026-10-21, option B: the manager dashboard is promised only once
    // ENABLE_TEAM_DASHBOARD is on (see pricing-team-dashboard.test.tsx).
    const { container } = render(<PricingPage />)
    expect(
      screen.getByRole("heading", { level: 2, name: "Buying for a team or institution" })
    ).toBeInTheDocument()
    const body = screen.getByTestId("teams-split-body").textContent ?? ""
    expect(body).toMatch(/no minimum size/i)
    expect(body).toMatch(/same per-person price/i)
    expect(container.querySelector('a[href="/for-teams"]')).not.toBeNull()
    expect(container.textContent).not.toMatch(
      /5 or more|Role-specific|Admin dashboard|manager dashboard|view of progress/i
    )
  })

  /**
   * Launch readiness, 2026-10-20: at 390px a wide table cut off its columns.
   * Phones get one block per way of paying, with every row.
   */
  it("gives phones the comparison one way of paying at a time, with every row", () => {
    render(<PricingPage />)
    const plans = screen.getAllByTestId("compare-stack-plan")
    expect(plans.map((p) => p.querySelector("h3")?.textContent)).toEqual([
      "Pay monthly",
      "Pay once for three months",
    ])
    for (const plan of plans) expect(plan.querySelectorAll("dt")).toHaveLength(PAY_ROWS)
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
  it("names teams AND institutions, and has no heading called only Team", () => {
    const text = pageText()
    expect(text).not.toMatch(/\bTeam\b(?! dashboard)/)
    // Institutions are told they get a proposal, not the per-person price...
    const split = screen
      .getAllByRole("heading", { level: 2, name: "Buying for a team or institution" })[0]!
      .closest("section")
    expect(split?.textContent ?? "").toMatch(/Teams pay the same per-person price/)
    expect(split?.textContent ?? "").toMatch(/proposal/i)
    // ...and have a way through to the page written for them.
    expect(
      screen.getAllByRole("link", { name: /Learn about institutions/i })[0]
    ).toHaveAttribute("href", "/for-institutions")
  })

  /**
   * a-20260914-203605-149911: "jarring going from a large bold £29 to normal
   * text to larger text again to normal text again". Since 12 Nov 2026 the
   * page has one display price (the masthead line) and the comparison is all
   * body text, so the £7.50 never opens a second display size.
   */
  it("keeps the continuing price in the body stack, not at a second display size", () => {
    render(<PricingPage />)
    expect(screen.queryAllByTestId("tier-after-price")).toHaveLength(0)
    expect(document.querySelectorAll('[class*="tierPrice"]')).toHaveLength(0)
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
    // What an update is (video refresh, bead gwth-launch-ooc6, 2026-10-25).
    // Continued access, not "updates", since the PR05 copy pass (2026-11-06).
    expect(closingText).toMatch(/continued access to the lessons as we update them/i)
    expect(closingText).toMatch(/We rewrite lessons when the tools, or the best way to use them, change/)
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
    expect(columnHeaders).toHaveLength(3)
    for (const th of columnHeaders) {
      expect(th.tagName).toBe("TH")
      expect(th).toHaveAttribute("scope", "col")
      expect(th.closest("thead")).not.toBeNull()
    }
    // Every row is labelled by its feature, so the header row is not the only
    // thing orienting a reader who has scrolled the table sideways.
    const rowHeaders = screen.getAllByRole("rowheader")
    expect(rowHeaders.length).toBe(PAY_ROWS)
    for (const th of rowHeaders) expect(th).toHaveAttribute("scope", "row")
    const wrap = table!.parentElement!
    expect(wrap).toHaveAttribute("tabindex", "0")
    expect(wrap).toHaveAttribute("role", "region")
    expect(wrap).toHaveAttribute("aria-label")
  })
})
