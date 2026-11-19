import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import PricingPage from "./page"
import { TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { DEFAULT_GATE_PERCENT, gatePercent } from "@/lib/protection/month-hold"

/**
 * The /pricing route, which since 19 Nov 2026 renders `pricing-next` (David:
 * "Pricing looks extremely complex and messy. We really need to revamp that
 * page."). These tests hold the DECISIONS the old page's tests held (prices
 * from config, the 75% rule in plain view, refunds and Terms beside the
 * buttons, David's 14 Sep annotations, the W25 labs rule), against the new
 * layout. The selling states are in `pricing-next/pricing-next.test.tsx`.
 *
 * Rows each way of paying answers, in the same order in both cards.
 */
const PAY_ROWS = ["At the end of month three", "How to cancel", "Does it renew?"]

afterEach(cleanup)

const section = (name: string) =>
  document.querySelector(`[data-section="${name}"]`) as HTMLElement

const flat = (el: Element | null) => (el?.textContent ?? "").replace(/\s+/g, " ")

describe("PricingPage", () => {
  it("renders the page heading as h1", () => {
    render(<PricingPage />)
    expect(
      screen.getByRole("heading", { level: 1, name: "What the course costs" })
    ).toBeInTheDocument()
  })

  it("puts the two ways to pay side by side, answering the same questions (D16)", () => {
    render(<PricingPage />)
    const cards = screen.getAllByTestId("pay-card")
    expect(cards.map((c) => c.querySelector("h3")?.textContent)).toEqual([
      "Pay once for three months",
      "Pay monthly",
    ])
    for (const card of cards) {
      expect([...card.querySelectorAll("h4")].map((h) => h.textContent)).toEqual(PAY_ROWS)
    }
    const [pass, monthly] = cards.map(flat)
    expect(monthly).toMatch(/All three cost £87/)
    expect(monthly).toMatch(/Each payment opens one month/)
    expect(monthly).toMatch(/Your plan continues automatically unless you cancel/)
    expect(monthly).toMatch(/We email you before each payment/)
    // David, 19 Nov 2026 (4a8afd1): what happens when a pass ends, said plainly.
    expect(pass).toContain(
      "Your access to the course lessons stops. You only pay again if you choose to subscribe at £7.50 a month."
    )
    expect(pass).toMatch(/The pass ends by itself; you don't need to cancel/)
  })

  it("lists what you get, the gift and the two things that cost nothing", () => {
    render(<PricingPage />)
    expect(screen.getByRole("heading", { level: 2, name: "What you get" })).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 2, name: "Give the course as a gift" })
    ).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: "The six free labs" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 3, name: "The free lesson" })).toBeInTheDocument()
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
    expect(flat(screen.getByTestId("masthead-price-line"))).toMatch(
      /then £7\.50 a month if you stay/
    )
    expect(flat(section("after"))).toMatch(
      /£7\.50 a month pays for continued access to the lessons as we update them/
    )
  })

  it("(W25) sends visitors to the waitlist while Labs are private", () => {
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
      expect(
        within(section("closing")).getByRole("link", { name: "Try a free lab" })
      ).toHaveAttribute("href", "/labs")
    } finally {
      if (original === undefined) delete process.env.PRIVATE_CONTENT_MODE
      else process.env.PRIVATE_CONTENT_MODE = original
    }
  })

  it("has a Join the waitlist CTA beside the two ways to pay before sales open", () => {
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
    expect(flat(offer)).toMatch(/Cancel at any time in your account settings/)
    expect(flat(offer)).toMatch(/Each payment opens one month/)
    expect(flat(offer)).toMatch(/Does it renew\?/)
    const terms = screen.getByTestId("pricing-offer-terms")
    expect(terms.textContent).toMatch(/refund a pass in full until it.s opened/)
    expect(within(terms).getByRole("link", { name: "contact us" })).toHaveAttribute("href", "/contact")
    expect(within(terms).getByRole("link", { name: "Terms for passes" })).toHaveAttribute("href", "/terms#passes")
    expect(within(terms).getByRole("link", { name: "Terms for monthly payments" })).toHaveAttribute("href", "/terms#subscriptions")
    expect(terms.textContent).toMatch(/refunds/)
    const gift = flat(document.querySelector('[data-tier="gift"]'))
    expect(gift).toMatch(/one year from purchase to enter their code/)
    expect(gift).toMatch(/we never ask for their card details/)
  })

  /**
   * The 75% rule (bead gwth-launch-735c, David 12 Nov 2026: "set it to 75%
   * lessons complete for now"). Consumer law needs it in front of a buyer
   * before they pay. David chose option A the same day: "one short section
   * before the buying options, a reminder beside each button"
   * (docs/content-protection-go-live.md). So the heading, the path and "The
   * rule" come BEFORE the ways to pay, with the share read from the gate
   * itself, and the remaining pieces sit lower down in plain view.
   */
  it("explains the 75% rule in a short section before either buying option", () => {
    render(<PricingPage />)
    const rules = screen.getByTestId("month-opening-rules")
    expect(rules).toHaveAttribute("id", "month-opening-rules")
    const text = flat(rules)
    expect(screen.getByRole("heading", { level: 2, name: "When each course month opens" })).toBeInTheDocument()
    expect(within(rules).getByRole("heading", { level: 3, name: "The rule" })).toBeInTheDocument()
    expect(text).toContain("Month 1 starts when you pay or open your pass.")
    expect(text).toContain(`Before Month 2 opens, you must finish ${DEFAULT_GATE_PERCENT}% of Month 1's core lessons`)
    expect(text).toContain(`Before Month 3 opens, you must finish ${DEFAULT_GATE_PERCENT}% of Month 2's core lessons`)
    expect(text).toContain("Use Finish lesson at the end of each lesson to record that you've finished it.")
    expect(text).toMatch(/Optional lessons do not count and are never required for a later month to open/)
    expect(text).toContain(`There is no time limit on reaching ${DEFAULT_GATE_PERCENT}%.`)
    // The path is part of the short section.
    expect(rules.contains(screen.getByTestId("month-path"))).toBe(true)
    // Before both buying options, and after the three figures.
    const offer = screen.getByTestId("pricing-offer")
    expect(rules.compareDocumentPosition(offer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    for (const card of screen.getAllByTestId("pay-card")) {
      expect(rules.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
    const figures = screen.getByTestId("masthead-price-line")
    expect(figures.compareDocumentPosition(rules) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // Short: the other pieces are not in this section.
    expect([...rules.querySelectorAll("h3")].map((h) => h.textContent)).toEqual([
      "Month 1",
      "Month 2",
      "Month 3",
      "The rule",
    ])
    // In plain view, and it points at the rest.
    expect(rules.querySelector("details")).toBeNull()
    expect(within(rules).getByRole("link", { name: "More on how months open" })).toHaveAttribute(
      "href",
      "#month-opening-detail"
    )
    expect(text).not.toMatch(/watermark|identifier|captcha|challenge|device limit/i)
  })

  it("keeps the rest of the opening rules, the review hold and the personal links in plain view lower down", () => {
    render(<PricingPage />)
    const detail = screen.getByTestId("month-opening-detail")
    expect(detail).toHaveAttribute("id", "month-opening-detail")
    expect(
      within(detail).getByRole("heading", { level: 2, name: "More on how months open" })
    ).toBeInTheDocument()
    expect([...detail.querySelectorAll("h3")].map((h) => h.textContent)).toEqual([
      "When a later month opens",
      "While you wait",
      "Why there is a rule",
      "How we protect the course",
    ])
    const text = flat(detail)
    expect(text).toMatch(/latest of three points/)
    expect(text).toMatch(/your course time is paused/)
    expect(text).toMatch(/your next payment waits until that month can open; your plan is not cancelled/)
    expect(text).toMatch(/helps stop someone copying the whole course in a few days from one account/)
    expect(text).toMatch(/held for a person at GWTH to review, usually within a day/)
    expect(screen.getByTestId("media-links-note").textContent).toMatch(/links made for your account that stop working after a few hours/)
    expect(within(detail).getByRole("link", { name: "how months open" })).toHaveAttribute("href", "/terms#course-months")
    expect(within(detail).getByRole("link", { name: "how we protect the course" })).toHaveAttribute("href", "/terms#course-protection")
    // In plain view: nothing here sits inside a disclosure.
    expect(detail.querySelector("details")).toBeNull()
    expect(detail.closest("details")).toBeNull()
    // "Shown above" is true: the dated path comes earlier on the page.
    const path = screen.getByTestId("month-path")
    expect(path.compareDocumentPosition(detail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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
    render(<PricingPage />)
    const note = screen.getByTestId("pricing-offer-rule")
    expect(screen.getByTestId("pricing-offer").contains(note)).toBe(true)
    expect(note.closest("details")).toBeNull()
    expect(note.textContent).toContain(`${DEFAULT_GATE_PERCENT}% of the previous month's core lessons`)
    expect(within(note).getByRole("link", { name: "opening rules above" })).toHaveAttribute("href", "#month-opening-rules")
    expect(note.textContent).toMatch(/your pass time is paused while you wait/)
    expect(note.textContent).toMatch(/your next payment waits until that month can open/)
    // "Above" is true: the rule comes before the two ways to pay.
    const rules = screen.getByTestId("month-opening-rules")
    expect(rules.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/opening rules below/)
  })

  it("says when each month opens for everyone, on the path", () => {
    render(<PricingPage />)
    const path = flat(screen.getByTestId("month-path"))
    expect(path).toMatch(/Month 1 ?Available from 14 December 2026/)
    expect(path).toMatch(/Month 2 ?Opens for everyone around 1 January 2027/)
    expect(path).toMatch(/Month 3 ?Opens for everyone around 1 February 2027/)
    expect(path).toContain(`${DEFAULT_GATE_PERCENT}%of Month 1's core lessons finished`)
    expect(path).toContain(`${DEFAULT_GATE_PERCENT}%of Month 2's core lessons finished`)
  })

  it("prints the core count from config, no optional count, and the projects the home page names", () => {
    render(<PricingPage />)
    const course = flat(document.querySelector('[data-tier="course"]'))
    expect(course).toContain(`${TOTAL_MANDATORY_LESSONS} core lessons`)
    expect(course).not.toMatch(/\d+ go-deeper|\d+ optional/)
    // 19 Nov 2026, David: "FamilyBot, made core". Month 1's main project is
    // FamilyBot; no lesson builds a portfolio website.
    expect(course).toMatch(/FamilyBot/)
    expect(course).not.toMatch(/portfolio website/)
    expect(course).toMatch(/AskMyCo/)
    expect(course).toMatch(/your own AI consultant/)
    // The latest Sol, 12 Nov 2026: no "hidden charges" while AI tool costs are unstated.
    expect(document.body.textContent).not.toMatch(/hidden charges/i)
    expect(document.body.textContent).not.toMatch(/optional lessons you skipped/)
  })

  it("says no VAT is added, in pounds for the UK", () => {
    render(<PricingPage />)
    expect(screen.getByText(/Prices in pounds for the UK, with no VAT added/)).toBeInTheDocument()
  })

  it("does not expose a Stripe checkout CTA before sales open", () => {
    const { container } = render(<PricingPage />)
    expect(container.querySelector('a[href="/api/stripe/checkout"]')).toBeNull()
    expect(container.querySelector('a[href^="/api/stripe"]')).toBeNull()
    expect(screen.queryByRole("link", { name: /checkout|buy|subscribe/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /checkout|buy|join for/i })).not.toBeInTheDocument()
  })

  it("the organisations section says what a team gets today and links to For organisations", () => {
    // David, 2026-10-21, option B: the manager dashboard is promised only once
    // ENABLE_TEAM_DASHBOARD is on (see pricing-team-dashboard.test.tsx).
    const { container } = render(<PricingPage />)
    expect(
      screen.getByRole("heading", { level: 2, name: "Buying for a team or organisation" })
    ).toBeInTheDocument()
    const body = screen.getByTestId("teams-split-body").textContent ?? ""
    expect(body).toMatch(/no minimum size/i)
    expect(body).toMatch(/same per-person price/i)
    expect(container.querySelector('a[href="/for-organisations"]')).not.toBeNull()
    expect(container.textContent).not.toMatch(
      /5 or more|Role-specific|Admin dashboard|manager dashboard|view of progress/i
    )
  })

  /**
   * Bible audience-by-purpose: one of the four places the age is stated
   * (Terms, Privacy, here, the sign-up form). The approved wording, whole.
   */
  it("states who can take GWTH in the approved words", () => {
    render(<PricingPage />)
    const who = flat(screen.getByTestId("who-can-take"))
    expect(who).toContain("Anyone aged 16 or over.")
    expect(who).toContain(
      "If you're 16 or 17, a parent or guardian must hold your GWTH account and agree to the Terms."
    )
    expect(who).toContain("Your employer can do this if you're an apprentice or employee.")
    expect(who).toContain("Claude requires users to be 18 or over")
    expect(who).toContain("An alternative tool may not be available for every lesson.")
    expect(document.getElementById("who-can-take-gwth")).not.toBeNull()
  })

  it("answers the plain questions from the Terms", () => {
    render(<PricingPage />)
    const questions = section("questions")
    expect([...questions.querySelectorAll("summary")].map((s) => s.textContent)).toEqual([
      "Can I get a refund?",
      "How do I cancel?",
      "What if I need longer than a month?",
      "Is VAT added to the price?",
      "Will the monthly price change?",
      "What else will I need?",
      "Who can take GWTH?",
    ])
    const text = flat(questions)
    expect(text).toContain("There is no minimum commitment period, cancellation fee or penalty for leaving.")
    expect(text).toContain("GWTH is not registered for VAT, so no VAT is added to any price.")
    expect(text).toContain("at least 30 days' notice of any price change")
    expect(text).toContain("A computer, an internet connection and the ability to type.")
    // No promise about what other companies' tools cost.
    expect(text).not.toMatch(/free (plan|version|tier)|no extra cost|nothing else to pay/i)
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
   * Refined 2026-09-28: teams pay the per-person price, institutions get a
   * proposal. Since 19 Nov 2026 both are served by one page, For
   * organisations. What still holds: no heading called only "Team", and the
   * page speaks to institutions as well as teams.
   */
  it("names teams AND institutions, and has no heading called only Team", () => {
    const text = pageText()
    expect(text).not.toMatch(/\bTeam\b(?! dashboard)/)
    const teams = flat(section("teams"))
    expect(teams).toMatch(/Teams pay the same per-person price/)
    expect(teams).toMatch(/Institutions get a proposal based on their needs/)
    expect(
      screen.getAllByRole("link", { name: "GWTH for organisations" })[0]
    ).toHaveAttribute("href", "/for-organisations")
  })

  /**
   * a-20260914-203605-149911: "jarring going from a large bold £29 to normal
   * text to larger text again to normal text again". Each card has ONE
   * display price, and the £7.50 is always body text.
   */
  it("keeps the continuing price in the body text, never at a second display size", () => {
    render(<PricingPage />)
    for (const card of screen.getAllByTestId("pay-card")) {
      expect(card.querySelectorAll("strong")).toHaveLength(1)
      expect(card.querySelector("strong")?.textContent).not.toContain("7.50")
    }
    const figures = [...screen.getByTestId("masthead-price-line").querySelectorAll("dt")].map(
      (dt) => dt.textContent
    )
    expect(figures).toHaveLength(3)
    expect(figures.join(" ")).not.toContain("7.50")
  })

  /**
   * a-20260914-203941-b69458, superseded 2026-10-20: no consultant-hour
   * comparison; the page states what you pay.
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
   * pricing". Ledger C13 and C14 are his recovered sentences.
   */
  it("drops try-before-you-join for cancellation and the fairer continuing price", () => {
    const text = pageText()
    expect(text).not.toMatch(/try (it )?before you (join|subscribe|buy)/i)
    expect(text).not.toMatch(/no timer/i)
    // Stop at any time: said with the monthly figure at the top, in the
    // monthly card and in the answers. Ledger C14: his recovered sentences
    // stay in the section below (the latest Sol's 19 Nov pass cut them as
    // repeats; the lead restored them).
    expect(flat(screen.getByTestId("masthead-price-line"))).toMatch(/Cancel at any time/)
    const monthly = flat(document.querySelector('[data-plan="monthly"]'))
    expect(monthly).toMatch(/Cancel at any time in your account settings/)
    expect(text).toContain("There is no minimum commitment period, cancellation fee or penalty for leaving.")
    const after = flat(section("after"))
    expect(after).toMatch(/£7\.50 a month/)
    expect(after).toMatch(/first three months/i)
    expect(after).toMatch(/unless you cancel/)
    expect(after).toMatch(/unlock one month at a time/i)
    expect(after).toMatch(/cancel whenever you like/i)
    expect(after).toMatch(/If it stops being worth it to you, cancel/i)
    // C13: why the price drops, in David's words.
    expect(after).toContain("you are never paying course prices out of habit")
    // What an update is (video refresh, bead gwth-launch-ooc6, 2026-10-25).
    expect(after).toMatch(/continued access to the lessons as we update them/i)
    expect(after).toMatch(/We rewrite lessons when the tools, or the best way to use them, change/)
  })

  /**
   * a-20260914-203852-55e4f6: "I don't really like the heading text being
   * smaller than the text in the table." The comparison is now two cards, so
   * what a unit test can hold is that each answer sits under a real heading,
   * in the same order in both cards, and that no table needs scrolling
   * sideways on a phone.
   */
  it("labels every answer with a real heading and uses no table", () => {
    const { container } = render(<PricingPage />)
    expect(container.querySelector("table")).toBeNull()
    for (const card of screen.getAllByTestId("pay-card")) {
      const rows = [...card.querySelectorAll("h4")]
      expect(rows.map((h) => h.textContent)).toEqual(PAY_ROWS)
      for (const heading of rows) {
        expect(heading.nextElementSibling?.tagName).toBe("P")
        expect((heading.nextElementSibling?.textContent ?? "").length).toBeGreaterThan(2)
      }
    }
  })
})
