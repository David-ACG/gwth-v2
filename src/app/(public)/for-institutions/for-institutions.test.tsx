import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import ForInstitutionsPage from "./page"
import { MONTH_CONFIGS } from "@/lib/config"
import {
  BASELINE,
  EVIDENCE,
} from "@/components/marketing/for-institutions-fde/for-institutions-fde"

afterEach(cleanup)

describe("ForInstitutionsPage", () => {
  it("leads with the prerequisite proposition in the heading", () => {
    render(<ForInstitutionsPage />)
    const h1 = screen.getByRole("heading", { level: 1 })
    expect(h1.textContent).toMatch(/specialist courses/i)
    // David, 2026-10-23, option A (was "at the level they were written for").
    expect(h1.textContent).toMatch(/with the whole class on the same footing/i)
    expect(document.body.textContent).not.toMatch(/level they were written for/i)
  })

  /**
   * a-20260914-202954-1ef966. The reason an institution buys GWTH is that its
   * own tutors should not have to level the room first. The masthead has to
   * carry all four halves of that: the problem, the shared foundation, the
   * threshold the institution sets, and the evidence its tutors can see.
   * Reworded 2026-10-21 (launch readiness, both reviewers and the copy gate):
   * "levelling the room" and "verified evidence" went, the first for words
   * close to David's own ("get the whole class up to a certain level"), the
   * second because the public verification page is closed from the launch.
   */
  it("states the tutor-time problem and the answer in the masthead itself", () => {
    const { container } = render(<ForInstitutionsPage />)
    const masthead = container.querySelector('[data-section="masthead"]')
    expect(masthead).not.toBeNull()
    const text = masthead!.textContent ?? ""
    expect(text).toMatch(/tutors/i)
    expect(text).toMatch(/whole class up to the same level/i)
    expect(text).toMatch(/before your course begins/i)
    expect(text).toMatch(/set the pass mark/i)
    expect(text).toMatch(/tutors can see who has met it/i)
  })

  /**
   * Bead gwth-launch-88z.32.13. David, 2026-09-13, on the old masthead plate:
   * "the image does not convey any message. I'm not sure what an arrow
   * pointing at a tear in the page means." The replacement has to be the
   * curated-by-you scene, it has to keep both renders (the mode is a class,
   * not a media query, so a dark visitor needs its own file), and its
   * description has to name the two claims the picture makes rather than
   * describing shapes.
   */
  it("shows the curated-by-you masthead plate in both modes, not the arrow", () => {
    const { container } = render(<ForInstitutionsPage />)
    const masthead = container.querySelector('[data-section="masthead"]')
    const imgs = Array.from(
      masthead!.querySelectorAll<HTMLImageElement>("img")
    )
    const srcs = imgs.map((img) => img.getAttribute("src") ?? "")
    expect(srcs.some((s) => s.includes("curated-by-you.png"))).toBe(true)
    expect(srcs.some((s) => s.includes("curated-by-you-dark.png"))).toBe(true)
    expect(srcs.some((s) => s.includes("the-gap-arrow"))).toBe(false)
    for (const img of imgs) {
      const alt = img.getAttribute("alt") ?? ""
      expect(alt).toMatch(/choose the lessons/i)
      expect(alt).toMatch(/set the pass mark/i)
    }
  })

  it("puts the prerequisite section above every supporting section", () => {
    const { container } = render(<ForInstitutionsPage />)
    const order = Array.from(
      container.querySelectorAll<HTMLElement>("[data-section]")
    ).map((el) => el.dataset.section)
    expect(order.slice(0, 3)).toEqual(["masthead", "baseline", "evidence"])
  })

  it("contrasts the catch-up problem with the baseline an institution sets", () => {
    render(<ForInstitutionsPage />)
    const cards = screen.getAllByTestId("baseline-card")
    expect(cards).toHaveLength(BASELINE.length)
    const [problem, answer] = cards.map((el) => el.textContent ?? "")
    // The problem panel: tutor time lost to levelling a mixed class.
    expect(problem).toMatch(/specialist course/i)
    expect(problem).toMatch(/bring(ing)? the whole class up to the same level/i)
    // The answer panel: one shared foundation, a threshold the institution
    // sets, and tutors who can see who has met it.
    // Reworded 2026-10-21 (marketing copy gate): "Everyone arrives at the
    // level you set" guaranteed readiness; the panel now says what the
    // learners dashboard really shows. Present tense, because /org/learners
    // exists from the launch; the "after the beta" wording went with the beta.
    expect(answer).toMatch(/core lessons and any optional ones you require/i)
    expect(answer).toMatch(/pass mark you set/i)
    expect(answer).toMatch(/tutors can see who has met it/i)
  })

  it("promises evidence a tutor can check, not an assurance", () => {
    const { container } = render(<ForInstitutionsPage />)
    const baseline = container.querySelector('[data-section="baseline"]')
    const text = baseline?.textContent ?? ""
    // "It is a precursor, not a replacement" was a slogan both launch
    // reviewers flagged (2026-10-20); the plain sentence keeps the point.
    expect(text).toMatch(/does not teach your profession/i)
    // "Evidence rather than an assurance", then "not an assurance": the
    // latest Sol (2026-10-21) asked for the limitation to be said plainly.
    expect(text).toMatch(/record of what each member\s+has done/i)
    expect(text).toMatch(/pass mark you chose/i)
    // /verify is a 404 from the launch, so nothing may say a record can be
    // verified by anyone it is sent to.
    expect(text).not.toMatch(/can verify/i)
  })

  it("shows every evidence figure with a linked source", () => {
    render(<ForInstitutionsPage />)
    const cards = screen.getAllByTestId("evidence-card")
    expect(cards).toHaveLength(EVIDENCE.length)
    for (const item of EVIDENCE) {
      expect(screen.getByText(item.value)).toBeInTheDocument()
      const links = screen.getAllByRole("link", { name: item.source })
      expect(links.length).toBeGreaterThanOrEqual(1)
      expect(links.some((l) => l.getAttribute("href") === item.href)).toBe(true)
    }
  })

  // Titles changed 2026-10-21 to what /org implements on the launch day: the
  // public verified record went (/verify is closed), and the tiers line now
  // says core lessons cannot be removed (D-N7-3). "Ratify" became "approve"
  // on the latest Sol's check (2026-10-21): the familiar word for the action.
  it("names the six edition features, threshold and tutor view first, and the walkthrough call to action", () => {
    render(<ForInstitutionsPage />)
    const features = screen.getAllByTestId("edition-feature")
    expect(features.map((el) => el.querySelector("h3")?.textContent)).toEqual([
      "A pass mark you set",
      "A learners dashboard for your tutors",
      "Separate admin and tutor access",
      "Core, optional and exclusive lessons",
      "Exclusive lessons you approve",
      "Progress your members can log",
    ])
    const ctas = screen.getAllByRole("link", { name: "Book a walkthrough" })
    expect(ctas.length).toBeGreaterThanOrEqual(2)
    for (const cta of ctas) expect(cta).toHaveAttribute("href", "/contact")
  })

  it("answers whether it can be required before an institution's own courses", () => {
    render(<ForInstitutionsPage />)
    const question = screen.getByText(/Can we require it before our own courses\?/i)
    expect(question).toBeInTheDocument()
    const answer = question.parentElement?.textContent ?? ""
    expect(answer).toMatch(/pass mark/i)
    // "Before the room starts" is named as wording to remove in the public
    // writing skill (both launch reviewers, 2026-10-20).
    expect(answer).toMatch(/before your course begins/i)
    // Nothing in the product has ever written a credential row and /verify is
    // closed from the launch, so the evidence is the tutors' learners dashboard,
    // not a page anyone can open (bead gwth-launch-88z.32.36, then 2026-10-21).
    expect(answer).toMatch(/learners dashboard/i)
    expect(answer).not.toMatch(/anyone can open/i)
  })

  /**
   * a-20260914-202509-f3143d: "I don't know what CPD means, so I don't think
   * others will either." The abbreviation may appear, but never before it has
   * been written out.
   */
  it("writes continuing professional development out before it says CPD", () => {
    const { container } = render(<ForInstitutionsPage />)
    const text = container.textContent ?? ""
    const abbreviation = text.indexOf("CPD")
    expect(abbreviation).toBeGreaterThan(-1)
    expect(text.slice(0, abbreviation)).toMatch(
      /continuing professional development/i
    )
    expect(text).not.toMatch(/CPD ready/i)
  })

  /**
   * The CIPD meetings are the evidence BEHIND this page, not a customer story
   * on it. CIPD may be cited as a published third-party fact and never as an
   * endorsement, and the page promises a threshold and a record rather than a
   * guarantee, because a threshold and a record are what is implemented.
   */
  it("claims no CIPD endorsement and promises no guarantee", () => {
    const { container } = render(<ForInstitutionsPage />)
    const text = container.textContent ?? ""
    const forbidden = [
      /(endorsed|approved|accredited|selected|chosen|backed|trusted|adopted)\s+by\s+CIPD/i,
      /CIPD\s+(has\s+)?(chose|chosen|selected|endorsed|approves?d?|adopted|partners?e?d?|uses?|runs GWTH)/i,
      /in partnership with CIPD/i,
      /official[^.]{0,24}CIPD/i,
      /CIPD[^.]{0,30}(partner|customer|client)/i,
      /guarantee/i,
    ]
    for (const pattern of forbidden) {
      expect(text).not.toMatch(pattern)
    }
  })

  it("carries no em dashes, en dashes or section signs (bible emdash-policy)", () => {
    const { container } = render(<ForInstitutionsPage />)
    expect(container.textContent).not.toMatch(/[–—§]/)
  })

  it("never shows a price in dollars", () => {
    const { container } = render(<ForInstitutionsPage />)
    expect(container.textContent).not.toMatch(/\$/)
  })

  /**
   * a-20260915-085041-eaa513, carried from Home (gwth-launch-88z.32.31) onto
   * the page where an institution actually decides. David struck the claim
   * because a body with 150,000 members may well buy a fixed annual figure, so
   * the page must not name a pricing basis at all until a deal shape exists.
   * The matching Home guard is in home-fde.test.tsx.
   */
  it("makes no claim about how an institution edition is priced (a-20260915-085041-eaa513)", () => {
    const { container } = render(<ForInstitutionsPage />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/active learners/i)
    expect(text).not.toMatch(/rather than seats|not seats|per seat|on seats/i)
    expect(text).not.toMatch(/we price on/i)
  })

  /**
   * The section still has to do its job: say what one agreement covers and how
   * a conversation starts. Removing the claim must not leave a stub.
   */
  it("still says what an agreement covers and how to get a proposal", () => {
    const { container } = render(<ForInstitutionsPage />)
    const lead = container.querySelector(
      '[data-testid="institutions-commercials-lead"]',
    )
    expect(lead).not.toBeNull()
    const text = lead!.textContent ?? ""
    expect(text).toMatch(/one agreement/i)
    expect(text).toMatch(/admin screen/i)
    expect(text).toMatch(/proposal/i)
  })

  /**
   * Launch readiness, 2026-10-21 (bead gwth-launch-ajqs.2). The page must be
   * true from the GO LIVE release: counts and month names come from config,
   * no optional count is printed (a-20260914-201426-ae7f0e), and no beta or
   * "being built" promise survives.
   */
  it("reads every month's name and core count from config", () => {
    render(<ForInstitutionsPage />)
    const cards = screen.getAllByTestId("month-card")
    expect(cards).toHaveLength(MONTH_CONFIGS.length)
    MONTH_CONFIGS.forEach((month, i) => {
      const text = cards[i]!.textContent ?? ""
      expect(text).toContain(month.title)
      expect(text).toContain(`${month.mandatoryLessons} core lessons`)
    })
  })

  it("makes no beta, intake or being-built promise", () => {
    const { container } = render(<ForInstitutionsPage />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/\bbeta\b|invite-only|testers|\bintake\b/i)
    expect(text).not.toMatch(/being built|coming soon|next piece of work/i)
    expect(text).not.toMatch(/before the room starts|level(s|ling)? the room/i)
    expect(text).not.toMatch(/FractionalBuddy/)
  })
})
