import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import ForInstitutionsPage from "./page"
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
    expect(h1.textContent).toMatch(/level they were written for/i)
  })

  /**
   * a-20260914-202954-1ef966. The reason an institution buys GWTH is that its
   * own tutors should not have to level the room first. The masthead has to
   * carry all four halves of that: the problem, the shared foundation, the
   * threshold the institution sets, and the evidence its tutors can see.
   */
  it("states the tutor-time problem and the answer in the masthead itself", () => {
    const { container } = render(<ForInstitutionsPage />)
    const masthead = container.querySelector('[data-section="masthead"]')
    expect(masthead).not.toBeNull()
    const text = masthead!.textContent ?? ""
    expect(text).toMatch(/tutors/i)
    expect(text).toMatch(/levelling the room|level the room/i)
    expect(text).toMatch(/foundation that runs before it/i)
    expect(text).toMatch(/set the pass mark/i)
    expect(text).toMatch(/verified evidence/i)
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
    // The problem panel: tutor time lost to levelling a mixed room.
    expect(problem).toMatch(/specialist course/i)
    expect(problem).toMatch(/levels the room/i)
    // The answer panel: one shared foundation, a threshold the institution
    // sets, and tutors who can see who has met it.
    expect(answer).toMatch(/shared applied AI foundation/i)
    expect(answer).toMatch(/you choose which lessons count and what score passes/i)
    // Future tense since 2026-09-17 (bead gwth-launch-88z.32.36): the tutor
    // view is built but no institution edition is switched on during the beta,
    // and the copy gate blocked the page for claiming otherwise.
    expect(answer).toMatch(/tutors will see who has met the baseline/i)
  })

  it("promises evidence a tutor can check, not an assurance", () => {
    const { container } = render(<ForInstitutionsPage />)
    const baseline = container.querySelector('[data-section="baseline"]')
    const text = baseline?.textContent ?? ""
    expect(text).toMatch(/precursor, not a replacement/i)
    expect(text).toMatch(/evidence rather than an assurance/i)
    expect(text).toMatch(/pass mark you chose/i)
    expect(text).toMatch(/can verify/i)
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

  it("names the six edition features, threshold and tutor view first, and the walkthrough call to action", () => {
    render(<ForInstitutionsPage />)
    const features = screen.getAllByTestId("edition-feature")
    expect(features.map((el) => el.querySelector("h3")?.textContent)).toEqual([
      "A pass mark you set",
      "A tutor baseline view",
      "A verified record",
      "Core, optional and exclusive tiers",
      "Exclusive lessons you ratify",
      "Records your members can log",
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
    expect(answer).toMatch(/before the room starts/i)
    // "its public verification page" became "the page anyone can open to check
    // it": nothing in the product has ever written a credential row, so no
    // member has a verification page yet (bead gwth-launch-88z.32.36).
    expect(answer).toMatch(/anyone can open to check it/i)
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
})
