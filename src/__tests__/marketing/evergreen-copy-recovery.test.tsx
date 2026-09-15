import { render, screen, cleanup } from "@testing-library/react"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, it, expect, afterEach, beforeEach } from "vitest"

import { HomeFde } from "@/components/marketing/home-fde/home-fde"
import { AboutFde } from "@/components/marketing/about-fde/about-fde"
import { LessonsFde } from "@/components/marketing/lessons-fde/lessons-fde"
import { PricingFde } from "@/components/marketing/pricing-fde/pricing-fde"
import { WhyGwthFde } from "@/components/marketing/why-gwth-fde/why-gwth-fde"
import { ForTeamsFde } from "@/components/marketing/for-teams-fde/for-teams-fde"
import { NewsletterFde } from "@/components/marketing/newsletter-fde/newsletter-fde"

/**
 * Evergreen copy recovery (bead gwth-launch-88z.32.26, 2026-09-14).
 *
 * David: *"take any wording that is still relevant to the new GWTH offering
 * and ethos - I think we had quite a lot of useful text that it seems a waste
 * not to reuse as we spent hours refining it"*.
 *
 * Fifteen lines came back from the pre-paper-first archive, two of them word
 * for word and thirteen adapted to the current offer; the rest of the archive
 * was classified and rejected. This suite does two jobs, and the
 * second is the more important one.
 *
 * 1. **Keep the recovered IDEAS.** Assertions are on meaning, matched by
 *    regex on the rendered text, so the wording can still be improved without
 *    the suite having to be rewritten with it. Two exceptions are checked as
 *    written, because they are David's own dictated sentences and the point of
 *    recovering them was the exact wording: the "good fun" line on the home
 *    page and "never paying course prices out of habit" on /pricing.
 *
 * 2. **Keep the rejected claims out.** The archive is full of well-written
 *    copy that is now false, unprovable or contradicted by a decision David
 *    has since made. It is attractive copy, it is still on disk, and a future
 *    pass asked to "reuse the old wording" will find it again. Each banned
 *    pattern below names its ledger id and the thing that disproves it. The
 *    scan runs over the marketing SOURCE, not a render, so a claim is caught
 *    wherever on these pages it comes back.
 *
 * Ledger, with every candidate and its reason:
 * `GWTH-launch-plan/completion/evergreen-copy-recovery/copy-ledger.json`.
 */

afterEach(cleanup)

// canPromoteLabs() is a runtime env read; pin the fail-closed production shape.
const ORIGINAL_MODE = process.env.PRIVATE_CONTENT_MODE
beforeEach(() => {
  process.env.PRIVATE_CONTENT_MODE = "on"
})
afterEach(() => {
  if (ORIGINAL_MODE === undefined) delete process.env.PRIVATE_CONTENT_MODE
  else process.env.PRIVATE_CONTENT_MODE = ORIGINAL_MODE
})

/** All visible text of the rendered page, whitespace collapsed. */
function text(): string {
  return (document.body.textContent ?? "").replace(/\s+/g, " ")
}

describe("recovered ideas are on the page", () => {
  it("C01 /lessons says what the course teaches instead of what AI is", () => {
    render(<LessonsFde />)
    expect(text()).toMatch(/not teach you what AI is.*teach you what AI does/i)
  })

  it("C02 /lessons names what the projects are, not only what they are not", () => {
    render(<LessonsFde />)
    const body = text()
    expect(body).toMatch(/transformer architecture/i)
    expect(body).toMatch(/build, use and show to people/i)
  })

  it("C03 /lessons answers the objection that there is no time for it", () => {
    render(<LessonsFde />)
    expect(text()).toMatch(/around the day job/i)
  })

  it("C04 /lessons closes on what a learner will have built", () => {
    render(<LessonsFde />)
    expect(text()).toMatch(/most people assume need a developer/i)
  })

  /**
   * C05 is the one recovered line that says a learner might ENJOY this, and
   * that is what it exists to protect. Its exact second clause changed on
   * 2026-09-15: the marketing copy gate (GPT-5.6 Sol, high) blocked "They
   * matter to everybody and they are good fun, which is what carries people
   * through the first few weeks" as an unsupported universal ("everybody")
   * plus a promised learner response the page cannot guarantee. Evidence:
   * GWTH-launch-plan/completion/marketing-copy-gate/20260915T091905Z-home-annotations-round2-r3.json.
   * So the assertion pins what C05 is FOR, not the sentence it arrived in.
   *
   * Its PLACE changed on 2026-09-15 too. The page gained a Month 1 card
   * (a-20260915-101324-6aa90f), and the same gate then blocked the separate
   * "Month 1 starts with your own life and work on purpose" paragraph as a
   * repeat of what that card already says. Evidence:
   * GWTH-launch-plan/completion/marketing-copy-gate/20260915T164806Z-home-annotations-round3-r8.json.
   * David's line now sits inside the Month 1 card, beside the Month 1 work it
   * describes, so this checks the idea in the place it lives.
   */
  it("C05 home keeps David's line about Month 1 being personal, and good fun", () => {
    render(<HomeFde />)
    const monthOne = screen.getAllByTestId("month-card")[0]!
    expect(monthOne.textContent).toMatch(/Month 1/)
    expect(monthOne.textContent).toMatch(/your own work and home life/i)
    expect(monthOne.textContent).toMatch(/projects are useful to you and good fun to make/i)
    expect(monthOne.textContent).toMatch(/good fun to make/i)
  })

  it("C06 /about gives the REASON a record has to decay, not just the mechanic", () => {
    render(<AboutFde />)
    const body = text()
    expect(body).toMatch(/certificate from six months ago/i)
    expect(body).toMatch(/what they can do today/i)
    // The list it replaced the opener of must survive: this was a substitution.
    expect(body).toMatch(/practical project attached to every lesson/i)
  })

  it("C07 /why-gwth answers why a course beats teaching yourself with AI", () => {
    render(<WhyGwthFde />)
    const body = text()
    expect(body).toMatch(/do not know what you do not know/i)
    expect(body).toMatch(/yesterday.s AI from yesterday.s curriculum/i)
  })

  it("C08 /why-gwth frames AI literacy as a baseline, not an advantage", () => {
    render(<WhyGwthFde />)
    expect(text()).toMatch(
      /computer literacy,? from competitive advantage to baseline expectation/i
    )
  })

  it("C09 /for-teams leads on capability over tool spend", () => {
    render(<ForTeamsFde />)
    expect(text()).toMatch(
      /not the ones buying the most AI tools today.*whose people know how to use them/i
    )
  })

  it("C10 /for-teams names the two places an organisation gets stuck", () => {
    render(<ForTeamsFde />)
    const body = text()
    expect(body).toMatch(/a few enthusiasts experimenting/i)
    expect(body).toMatch(/click the buttons in one product/i)
  })

  it("C11 /for-teams says WHY single-platform training goes stale", () => {
    render(<ForTeamsFde />)
    expect(text()).toMatch(
      /built around one platform.*changes its pricing, its capabilities or its terms/i
    )
  })

  it("C12 /for-teams states the technical requirements concretely", () => {
    render(<ForTeamsFde />)
    expect(text()).toMatch(
      /computer, an internet connection and the ability to type/i
    )
  })

  it("C13 /pricing says why the price drops, in David's words", () => {
    render(<PricingFde />)
    expect(text()).toContain(
      "you are never paying course prices out of habit"
    )
  })

  it("C14 /pricing ties cancellation to the reason it is offered", () => {
    render(<PricingFde />)
    expect(text()).toMatch(/keeps us honest/i)
  })

  it("C15 /newsletter promises something usable, not a category of thing", () => {
    render(<NewsletterFde />)
    expect(text()).toMatch(/try in the next ten minutes/i)
  })
})

describe("recovered ideas did not displace what was already decided", () => {
  it("C12 leaves the a-20260914-200357-6dddb2 answer intact", () => {
    render(<ForTeamsFde />)
    expect(text()).toMatch(
      /subject gets deeper, the hand-holding does not stop/i
    )
  })

  /**
   * The arc is what must survive, not the phrase that used to carry it. The
   * same gate blocked "Month 3 takes them to organisation scale" twice, as
   * abstraction a beginner cannot picture, so Month 3 now names what a learner
   * makes. All three months must still be on the page, in order.
   */
  it("C05 leaves the Month 1 outputs and the three-month arc intact", () => {
    render(<HomeFde />)
    const body = text()
    expect(body).toMatch(/rewrite your CV and your LinkedIn profile/i)
    const months = ["Month 1", "Month 2", "Month 3"].map((m) => body.indexOf(m))
    expect(months.every((i) => i >= 0), "every month is named").toBe(true)
    expect(months).toEqual([...months].sort((a, b) => a - b))
  })

  it("C13 and C14 leave the a-20260914-203753-b9d050 closing intact", () => {
    render(<PricingFde />)
    const body = text()
    expect(body).toMatch(/no timer and no pretend scarcity/i)
    expect(body).toMatch(/cancel whenever you like/i)
    // "Try before you join" was removed by that annotation and must stay out.
    expect(body).not.toMatch(/try (it )?before you (join|subscribe)/i)
  })

  it("C09 leaves the sourced UK figures and their per-stat citations intact", () => {
    render(<ForTeamsFde />)
    const sources = screen.getAllByText(/^Source: /)
    expect(sources.length).toBeGreaterThanOrEqual(3)
  })
})

/**
 * The rejected archive. Each entry is a claim that reads well, is still on
 * disk under `docs/marketing/`, `src/app/redesign/` or in git history, and must
 * not come back onto a live marketing page.
 */
const MARKETING_SOURCES = [
  "home-fde/home-fde.tsx",
  "about-fde/about-fde.tsx",
  "lessons-fde/lessons-fde.tsx",
  "pricing-fde/pricing-fde.tsx",
  "why-gwth-fde/why-gwth-fde.tsx",
  "for-teams-fde/for-teams-fde.tsx",
  "for-institutions-fde/for-institutions-fde.tsx",
  "labs-fde/labs-fde.tsx",
  "newsletter-fde/newsletter-fde.tsx",
  "waitlist-fde/waitlist-fde.tsx",
  "contact-fde/contact-fde.tsx",
] as const

const BANNED: ReadonlyArray<{
  ledger: string
  claim: string
  pattern: RegExp
  disprovedBy: string
}> = [
  {
    ledger: "C25",
    claim: "a money-back guarantee",
    pattern: /money[- ]back guarantee/i,
    disprovedBy:
      "/terms section 5 offers a refund only where GWTH cancels an order; the five-hour condition is implemented nowhere",
  },
  {
    ledger: "C26",
    claim: "no discount codes",
    pattern: /no discount codes|there are no discount codes/i,
    disprovedBy:
      "src/app/api/stripe/checkout/route.ts sets allow_promotion_codes: true",
  },
  {
    ledger: "C27",
    claim: "stay current for less than a flat white",
    pattern: /flat white/i,
    disprovedBy: "ONGOING_MONTHLY_PRICE is 7.50, more than a flat white",
  },
  {
    ledger: "C28",
    claim: "dollar pricing",
    pattern: /\$\s?\d/,
    disprovedBy: "GBP only; prices are read from lib/config.ts",
  },
  {
    ledger: "C29",
    claim: "you will never write a line of code",
    pattern: /never write (a single line of |one line of |any )?code|no coding required/i,
    disprovedBy:
      "Months 2 and 3 teach AI-assisted coding, self-hosting and multi-agent building (MONTH_CONFIGS)",
  },
  {
    ledger: "C30",
    claim: "a hardcoded project or lesson count",
    pattern: /\b(ninety-four|94) (hands-on )?(projects|lessons)\b/i,
    disprovedBy:
      "config computes 66 mandatory and 30 optional; /about prints 64 and 30; no register owns the split",
  },
  {
    ledger: "C31",
    claim: "a daily tool scanner tracking 47+ tools",
    pattern: /47\+?\s*(ai )?tools|scans? .{0,20}tools every (single )?day/i,
    disprovedBy: "nothing in the repo implements a daily scanner",
  },
  {
    ledger: "C33",
    claim: "unsourced business-case figures",
    pattern: /1\.5 times faster|only 5% of companies|70% of digital transformations/i,
    disprovedBy:
      "house-name attributions with no link, publication or date; every other figure on these pages carries a named source",
  },
  {
    ledger: "C35",
    claim: "score metrics that do not exist",
    pattern: /curiosity index|consistency score|improvement rate|ai skill percentile/i,
    disprovedBy:
      "only calculateGwthScore() in lib/progress/gwth-score.ts is implemented; SCORE_DECAY_DAYS has no implementation",
  },
  {
    ledger: "C36",
    claim: "the credential decays, so does the gap",
    pattern: /so does the gap/i,
    disprovedBy:
      "the gap widens when a learner stops; the line says the opposite of the argument beneath it",
  },
  {
    ledger: "C37",
    claim: "try before you join or subscribe",
    pattern: /try (it )?before you (join|subscribe)/i,
    disprovedBy:
      "David's annotation a-20260914-203753-b9d050; the labs compare tools, the lessons teach",
  },
  {
    ledger: "C38",
    claim: "decorative volume, issue or reading-time metadata",
    pattern: /\bvol(ume)? [IV1-9]+\b|\bissue no\.|reading time so far/i,
    disprovedBy: "banned outright by the paper-first register",
  },
  {
    ledger: "C40",
    claim: "tested against every alternative",
    pattern: /tested it against every alternative/i,
    disprovedBy: "an absolute nobody can test and nobody can prove",
  },
  {
    ledger: "C49",
    claim: "the syllabus is locked until you enrol",
    pattern: /syllabus revealed one month at a time|sign up to view/i,
    disprovedBy:
      "/lessons shows all three months publicly and /for-institutions asks a buyer to curate the syllabus",
  },
]

describe("rejected archive claims stay out of the marketing pages", () => {
  const dir = join(process.cwd(), "src", "components", "marketing")

  for (const banned of BANNED) {
    it(`${banned.ledger}: ${banned.claim}`, () => {
      const offenders: string[] = []
      for (const file of MARKETING_SOURCES) {
        const raw = readFileSync(join(dir, file), "utf-8")
        // Strip block and line comments: this file's own comments, and the
        // provenance notes in the components, quote the banned wording on
        // purpose so the next agent can see what was rejected and why.
        const code = raw
          .replace(/\/\*[\s\S]*?\*\//g, " ")
          .replace(/^[ \t]*\/\/.*$/gm, " ")
          .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
        if (banned.pattern.test(code)) offenders.push(file)
      }
      expect(
        offenders,
        `${banned.claim} is back in ${offenders.join(", ")}. It is disproved by: ${banned.disprovedBy}. See ledger ${banned.ledger}.`
      ).toEqual([])
    })
  }
})
