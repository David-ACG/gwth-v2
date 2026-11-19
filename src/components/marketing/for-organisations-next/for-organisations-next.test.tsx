import { readFileSync } from "node:fs"
import { join } from "node:path"
import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { ForOrganisationsNext } from "./for-organisations-next"
import {
  audienceHref,
  BASELINE,
  DASHBOARD_EXAMPLE,
  EDITION_GROUPS,
  EVIDENCE,
  INSTITUTION_FAQS,
  MONTHS,
  PATTERN,
  WHY_TEAMS,
} from "./data"
import { MONTH_CONFIGS, TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { UK_STAT_IDS } from "@/components/marketing/data"
import { ukFigure, ukFigureSource } from "@/lib/data/uk-ai-context"
import { COURSE_OPENS_ON } from "@/lib/launch-date"

afterEach(cleanup)

const CSS = readFileSync(
  join(__dirname, "for-organisations-next.module.css"),
  "utf8"
)

function pageText(container: HTMLElement): string {
  return (container.textContent ?? "").replace(/\s+/g, " ")
}

function section(container: HTMLElement, name: string): HTMLElement {
  const el = container.querySelector<HTMLElement>(`[data-section="${name}"]`)
  expect(el, `no section ${name}`).not.toBeNull()
  return el!
}

function sectionText(container: HTMLElement, name: string): string {
  return (section(container, name).textContent ?? "").replace(/\s+/g, " ")
}

function hrefs(root: ParentNode): string[] {
  return Array.from(root.querySelectorAll("a")).map(
    (a) => a.getAttribute("href") ?? ""
  )
}

/** Every flag state the route can produce. */
const STATES = [
  { selling: false, showScore: true, markingLive: true, publicScore: false },
  { selling: true, showScore: true, markingLive: true, publicScore: false },
  { selling: true, showScore: true, markingLive: true, publicScore: true },
  { selling: false, showScore: false, markingLive: false, publicScore: false },
] as const

describe("the choice at the top (David, 19 Nov 2026: one page for teams and institutions)", () => {
  it("has one h1 that names both readers", () => {
    render(<ForOrganisationsNext />)
    const h1 = screen.getAllByRole("heading", { level: 1 })
    expect(h1).toHaveLength(1)
    expect(h1[0]!.textContent).toMatch(/your members/)
    expect(h1[0]!.textContent).toMatch(/your team/)
  })

  it("offers the two choices as real radio buttons, institutions first and open by default", () => {
    render(<ForOrganisationsNext />)
    const radios = screen.getAllByRole("radio") as HTMLInputElement[]
    expect(radios.map((r) => r.value)).toEqual(["institution", "team"])
    expect(radios.every((r) => r.name === "audience")).toBe(true)
    expect(radios[0]!.checked).toBe(true)
    expect(radios[1]!.checked).toBe(false)
    expect(
      screen.getByRole("radio", {
        name: /I represent an institution or professional body/,
      })
    ).toBe(radios[0])
    expect(screen.getByRole("radio", { name: /I run a team/ })).toBe(radios[1])
  })

  it("opens on the team choice when asked (?for=team)", () => {
    render(<ForOrganisationsNext audience="team" />)
    const radios = screen.getAllByRole("radio") as HTMLInputElement[]
    expect(radios[0]!.checked).toBe(false)
    expect(radios[1]!.checked).toBe(true)
  })

  it("marks every section written for one reader, and shares the rest", () => {
    const { container } = render(<ForOrganisationsNext />)
    const forOf = (name: string) =>
      section(container, name).getAttribute("data-for")
    for (const name of [
      "institution-intro",
      "edition",
      "depth",
      "steps",
      "evidence",
      "commercials",
      "faq-institution",
      "closing-institution",
    ]) {
      expect(forOf(name), name).toBe("institution")
    }
    for (const name of [
      "team-intro",
      "team-why",
      "team-lessons",
      "team-price",
      "faq-team",
      "closing-team",
    ]) {
      expect(forOf(name), name).toBe("team")
    }
    // Said once, for both readers.
    for (const name of ["hero", "choose", "course", "proof", "independence", "compare"]) {
      expect(forOf(name), name).toBeNull()
    }
  })

  it("hides the other reader's sections with :has(), and shows both where :has() is missing", () => {
    const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
    expect(stripped).toMatch(
      /\.scope:has\(input\[value="institution"\]:checked\) \[data-for="team"\],\s*\.scope:has\(input\[value="team"\]:checked\) \[data-for="institution"\]\s*\{\s*display:\s*none;/
    )
    // Nothing else hides a path, so a browser without :has() shows both.
    expect(stripped.match(/\[data-for[^{]*\{\s*display:\s*none/g)).toHaveLength(1)
  })

  it("links to the other choice by address, so a link can be forwarded", () => {
    expect(audienceHref("team")).toBe("/for-organisations?for=team#choose")
    const { container } = render(<ForOrganisationsNext />)
    const links = Array.from(
      container.querySelectorAll<HTMLAnchorElement>("a[data-audience]")
    )
    expect(links.length).toBeGreaterThanOrEqual(5)
    for (const link of links) {
      expect(link.getAttribute("href")).toBe(
        audienceHref(link.dataset.audience as "team" | "institution")
      )
    }
    // Each path points at the other at least once.
    expect(
      section(container, "team-intro").querySelector('a[data-audience="institution"]')
    ).not.toBeNull()
    expect(
      section(container, "closing-institution").querySelector('a[data-audience="team"]')
    ).not.toBeNull()
  })

  it("draws the chosen state with more than a tint", () => {
    const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
    const checked = stripped.match(
      /\.option input:checked \+ \.optionFace \{([^}]*)\}/
    )
    expect(checked).toBeTruthy()
    expect(checked![1]).toMatch(/border-color:\s*var\(--v-accent\)/)
    expect(checked![1]).toMatch(/box-shadow:\s*inset 0 -4px 0 var\(--v-accent\)/)
    expect(stripped).toMatch(/\.option input:focus-visible \+ \.optionFace \{[^}]*outline:/)
  })
})

describe("for institutions: the old page's promises, and nothing more", () => {
  it("keeps David's headline and the four halves of the proposition", () => {
    const { container } = render(<ForOrganisationsNext />)
    const intro = section(container, "institution-intro")
    expect(
      within(intro).getByRole("heading", { level: 2 }).textContent
    ).toMatch(/Start your specialist courses with the whole class on the same footing/)
    const text = sectionText(container, "institution-intro")
    expect(text).toMatch(/tutors/i)
    expect(text).toMatch(/whole class up to the same level/i)
    expect(text).toMatch(/before your course begins/i)
    expect(text).toMatch(/set the pass mark/i)
    expect(text).toMatch(/tutors can see who has met it/i)
  })

  it("contrasts the catch-up problem with the baseline, and promises a record, not readiness", () => {
    const { container } = render(<ForOrganisationsNext />)
    const cards = screen.getAllByTestId("baseline-card")
    expect(cards).toHaveLength(BASELINE.length)
    expect(cards[0]!.textContent).toMatch(/bringing the whole class up to the same level/)
    expect(cards[1]!.textContent).toMatch(/core lessons and any optional ones you require/)
    expect(cards[1]!.textContent).toMatch(/pass mark you set/)
    const note = screen.getByTestId("institution-record-note").textContent ?? ""
    expect(note).toMatch(/does not teach your profession/i)
    expect(note).toMatch(/record of what each member\s+has done/i)
    expect(note).toMatch(/not a promise about\s+how ready they are/i)
    expect(pageText(container)).not.toMatch(/can verify|guarantee/i)
  })

  it("names the six edition features under the picture's three labels", () => {
    render(<ForOrganisationsNext publicScore={false} />)
    const groups = screen.getAllByTestId("edition-group")
    expect(groups.map((g) => g.querySelector("h3")?.textContent)).toEqual([
      "Choose the lessons",
      "Set your pass mark",
      "See who passes",
    ])
    expect(
      screen.getAllByTestId("edition-feature").map((el) => el.querySelector("h4")?.textContent)
    ).toEqual([
      "Core, optional and exclusive lessons",
      "Exclusive lessons you approve",
      "A pass mark you set",
      "Separate admin and tutor access",
      "A learners dashboard for your tutors",
      "Progress your members can log",
    ])
    expect(EDITION_GROUPS.flatMap((g) => g.features)).toHaveLength(7)
  })

  it("shows the edition picture in both themes, with the labels in its description", () => {
    const { container } = render(<ForOrganisationsNext />)
    const imgs = Array.from(
      section(container, "edition").querySelectorAll<HTMLImageElement>("img")
    )
    const srcs = imgs.map((img) => decodeURIComponent(img.getAttribute("src") ?? ""))
    expect(srcs.some((s) => s.includes("/organisations/institution.jpg"))).toBe(true)
    expect(srcs.some((s) => s.includes("/organisations/institution-dark.jpg"))).toBe(true)
    for (const img of imgs) {
      const alt = img.getAttribute("alt") ?? ""
      expect(alt).toMatch(/Choose the lessons/)
      expect(alt).toMatch(/Set your pass mark/)
      expect(alt).toMatch(/See who passes/)
    }
  })

  it("says what a tutor sees, and labels the dashboard as an example with made-up members", () => {
    render(<ForOrganisationsNext />)
    const view = screen.getByTestId("tutor-view")
    const text = (view.textContent ?? "").replace(/\s+/g, " ")
    expect(text).toMatch(/completing every required lesson with a quiz mark at or above your pass mark/)
    expect(text).toMatch(/not their individual wrong answers/)
    expect(text).toMatch(/passed the earlier version still counts/)
    expect(text).toMatch(/Example/)
    expect(text).toMatch(/The members here are made up/)
    // The example's arithmetic is the page's own: the core plus three optional.
    expect(DASHBOARD_EXAMPLE.required).toBe(TOTAL_MANDATORY_LESSONS + 3)
    expect(text).toContain(`${TOTAL_MANDATORY_LESSONS} core lessons and 3 optional ones`)
    const table = within(view).getByRole("table")
    expect(
      within(table).getAllByRole("columnheader").map((th) => th.textContent)
    ).toEqual(["Member", "Baseline", "Required lessons", "Average quiz", "Last active"])
    // A state is a word and a mark, never a colour alone.
    expect(within(table).getAllByText("Baseline met")).toHaveLength(2)
    expect(within(table).getAllByText("In progress")).toHaveLength(2)
  })

  it("writes continuing professional development out before it says CPD", () => {
    const { container } = render(<ForOrganisationsNext />)
    const text = pageText(container)
    const abbreviation = text.indexOf("CPD")
    expect(abbreviation).toBeGreaterThan(-1)
    expect(text.slice(0, abbreviation)).toMatch(/continuing professional development/i)
    expect(text).not.toMatch(/CPD ready/i)
  })

  it("shows every evidence figure and every partner example with its linked source", () => {
    const { container } = render(<ForOrganisationsNext />)
    const evidence = section(container, "evidence")
    expect(screen.getAllByTestId("evidence-card")).toHaveLength(EVIDENCE.length)
    for (const item of EVIDENCE) {
      expect(within(evidence).getByText(item.value)).toBeInTheDocument()
      expect(
        within(evidence).getByRole("link", { name: item.source })
      ).toHaveAttribute("href", item.href)
    }
    expect(screen.getAllByTestId("pattern-item")).toHaveLength(PATTERN.length)
    for (const item of PATTERN) expect(hrefs(evidence)).toContain(item.href)
  })

  it("claims no CIPD endorsement", () => {
    for (const state of STATES) {
      const { container } = render(<ForOrganisationsNext {...state} />)
      const text = pageText(container)
      for (const pattern of [
        /(endorsed|approved|accredited|selected|chosen|backed|trusted|adopted)\s+by\s+CIPD/i,
        /CIPD\s+(has\s+)?(chose|chosen|selected|endorsed|approves?d?|adopted|partners?e?d?|uses?|runs GWTH)/i,
        /in partnership with CIPD/i,
        /official[^.]{0,24}CIPD/i,
        /CIPD[^.]{0,30}(partner|customer|client)/i,
        /guarantee/i,
      ]) {
        expect(text).not.toMatch(pattern)
      }
      cleanup()
    }
  })

  it("names no price or pricing basis for an edition, and still says how to get a proposal", () => {
    const { container } = render(<ForOrganisationsNext selling />)
    const lead = screen.getByTestId("institution-commercials-lead").textContent ?? ""
    expect(lead).toMatch(/one agreement/i)
    expect(lead).toMatch(/admin screen/i)
    expect(lead).toMatch(/no published\s+price/i)
    expect(lead).toMatch(/proposal/i)
    const text = pageText(container)
    expect(text).not.toMatch(/active learners/i)
    expect(text).not.toMatch(/rather than seats|not seats|per seat|on seats/i)
    expect(text).not.toMatch(/we price on/i)
    for (const name of [
      "institution-intro",
      "edition",
      "depth",
      "steps",
      "evidence",
      "commercials",
      "faq-institution",
      "closing-institution",
    ]) {
      expect(sectionText(container, name), name).not.toMatch(/£/)
    }
  })

  it("keeps Book a walkthrough going to /contact, three times on the institution path", () => {
    const { container } = render(<ForOrganisationsNext />)
    const ctas = screen.getAllByRole("link", { name: "Book a walkthrough" })
    expect(ctas.length).toBeGreaterThanOrEqual(3)
    for (const cta of ctas) {
      expect(cta).toHaveAttribute("href", "/contact")
      expect(cta.closest("[data-for]")?.getAttribute("data-for")).toBe("institution")
    }
    expect(sectionText(container, "closing-institution")).toMatch(
      /A walkthrough takes about forty minutes/
    )
  })

  it("answers the seven institution questions", () => {
    const { container } = render(<ForOrganisationsNext publicScore={false} />)
    const faq = section(container, "faq-institution")
    for (const item of INSTITUTION_FAQS) {
      expect(within(faq).getByText(item.q)).toBeInTheDocument()
    }
    const required = within(faq)
      .getByText("Can we require it before our own courses?")
      .closest("details")
    expect(required?.textContent).toMatch(/before your course begins/i)
    expect(required?.textContent).toMatch(/learners dashboard/i)
  })
})

describe("the public score page stays behind its flag (David, 2026-10-25)", () => {
  it("is not described while the flag is off, even though the score itself is", () => {
    const { container } = render(
      <ForOrganisationsNext showScore markingLive publicScore={false} />
    )
    const text = pageText(container)
    expect(text).not.toMatch(/A score anyone can check/)
    expect(text).not.toMatch(/LinkedIn/)
    expect(text).not.toMatch(/can check is genuine/)
    expect(text).not.toMatch(/public page/i)
    expect(text).not.toMatch(/does not issue certificates|public record pages/i)
    // The score is still described as the home page describes it.
    expect(screen.getByTestId("score-lead").textContent).toMatch(/a number out of 100/)
  })

  it("is described on the institution path once the flag is on", () => {
    const { container } = render(<ForOrganisationsNext publicScore />)
    expect(
      screen.getAllByTestId("edition-feature").map((el) => el.querySelector("h4")?.textContent)
    ).toContain("A score anyone can check")
    const text = sectionText(container, "faq-institution")
    expect(text).toMatch(/employers included, can check is genuine/)
    expect(text).toMatch(/falls back if they stop/)
  })
})

describe("for teams: places on the standard course", () => {
  it("says the team takes the same course and sends an edition buyer to the other choice", () => {
    const { container } = render(<ForOrganisationsNext audience="team" />)
    const intro = section(container, "team-intro")
    expect(
      within(intro).getByRole("heading", { level: 2 }).textContent
    ).toBe("AI training for your team")
    expect(sectionText(container, "team-intro")).toMatch(
      /Your team takes the same course as everyone else/
    )
    expect(screen.getByTestId("team-split").textContent).toMatch(
      /wants its own\s+edition of the course/
    )
  })

  it("renders each UK figure from the one source of UK facts, with its source linked", () => {
    const { container } = render(<ForOrganisationsNext />)
    const stats = screen.getAllByTestId("team-stat")
    expect(stats).toHaveLength(UK_STAT_IDS.length)
    UK_STAT_IDS.forEach((id, i) => {
      const figure = stats[i]!.querySelector("[data-uk-figure]")
      expect(figure?.getAttribute("data-uk-figure")).toBe(id)
      expect(figure?.textContent).toBe(ukFigure(id).value)
      expect(within(stats[i]!).getByText(/^Source: /)).toBeInTheDocument()
      expect(hrefs(container)).toContain(ukFigureSource(id).url)
    })
  })

  it("sells places before and after 14 December with the right button", () => {
    const { container, unmount } = render(<ForOrganisationsNext selling={false} />)
    for (const name of ["team-intro", "closing-team"]) {
      const links = hrefs(section(container, name))
      expect(links, name).toContain("/waitlist")
      expect(links, name).not.toContain("/gift")
      expect(links, name).toContain("/contact")
    }
    expect(hrefs(container)).not.toContain("/gift")
    unmount()
    const selling = render(<ForOrganisationsNext selling />)
    for (const name of ["team-intro", "closing-team"]) {
      const scope = section(selling.container, name)
      expect(
        within(scope).getByRole("link", { name: "Buy places for your team" })
      ).toHaveAttribute("href", "/gift")
      expect(hrefs(scope), name).not.toContain("/waitlist")
      expect(
        within(scope).getByRole("link", { name: "Get in touch" })
      ).toHaveAttribute("href", "/contact")
    }
  })

  it("states both prices, the dates and what happens after three months", () => {
    const { container } = render(<ForOrganisationsNext />)
    const text = sectionText(container, "team-price")
    expect(screen.getByTestId("team-price-monthly").textContent).toMatch(/£29/)
    expect(text).toMatch(/can cancel at any time/)
    expect(text).toMatch(/carries on at £7\.50 a month to keep lessons\s+up to date, unless they cancel/)
    expect(screen.getByTestId("team-price-once").textContent).toMatch(/£69/)
    expect(text).toMatch(/If you buy between 14 December 2026 and 6 January 2027/)
    expect(text).toMatch(/After that, the whole course is £87/)
    expect(text).toMatch(/The first month on its own is £29/)
    expect(text).toMatch(/one year from purchase to use it/)
    expect(text).toMatch(/never asked for their card/)
    expect(text).toMatch(/no automatic renewal payments/)
    expect(text).toMatch(/No minimum number of places/)
    expect(text).toMatch(/not VAT registered/)
    expect(text).not.toMatch(/lowest possible price|\/mo\b|£29\.00/i)
    expect(pageText(container)).not.toMatch(/\$/)
  })

  it("promises a team no dashboard, admin screen or lesson assignment", () => {
    const { container } = render(<ForOrganisationsNext selling audience="team" />)
    for (const name of [
      "team-intro",
      "team-why",
      "team-lessons",
      "team-price",
      "closing-team",
    ]) {
      expect(sectionText(container, name), name).not.toMatch(
        /dashboard for (your|the) (team|manager)|admin (screen|dashboard)|team dashboard|assign(ed|s)? (the )?lessons|completion rates|progress report/i
      )
    }
    // "Walkthrough" is the institution's forty minutes; the team side gets in touch.
    for (const name of ["team-intro", "team-why", "team-lessons", "team-price", "faq-team", "closing-team"]) {
      expect(sectionText(container, name), name).not.toMatch(/walkthrough/i)
    }
  })

  it("keeps David's five reasons and the worked-solution promise", () => {
    render(<ForOrganisationsNext />)
    const items = screen.getAllByTestId("team-why-item")
    expect(items.map((li) => li.querySelector("h3")?.textContent)).toEqual(
      WHY_TEAMS.map((item) => item.title)
    )
    expect(items[0]!.textContent).toMatch(/cut repetition/)
    expect(items[1]!.textContent).toMatch(/attempt the project themselves, then the lesson works through it/)
    expect(items[1]!.textContent).toMatch(/dip into the worked solution only where they want it/)
    expect(items[2]!.textContent).toMatch(/the support does not thin out/)
    expect(items[3]!.textContent).toMatch(/Each person chooses/)
  })

  it("keeps the comparison as two equal panels told apart by words", () => {
    render(<ForOrganisationsNext />)
    const cards = screen.getAllByTestId("compare-card")
    expect(cards).toHaveLength(2)
    expect(cards[0]!.textContent).toMatch(/^ElsewhereWhen you compare coursesCount the hours/)
    expect(cards[1]!.textContent).toMatch(/^GWTHThis courseCount what they make/)
    expect(CSS).not.toMatch(/compareCardOurs/)
  })
})

describe("what both readers see, once", () => {
  it("reads every month's name and core count from config and prints no optional count", () => {
    const { container } = render(<ForOrganisationsNext />)
    const cards = screen.getAllByTestId("month-card")
    expect(cards).toHaveLength(MONTH_CONFIGS.length)
    MONTH_CONFIGS.forEach((month, i) => {
      const text = cards[i]!.textContent ?? ""
      expect(text).toContain(month.title)
      expect(text).toContain(`${month.mandatoryLessons} core lessons`)
      expect(MONTHS[i]!.title).toBe(month.title)
    })
    expect(cards[0]!.textContent).toContain(`Opens on ${COURSE_OPENS_ON}`)
    const text = pageText(container)
    expect(text).not.toMatch(/\b\d+\s+optional lessons\b/i)
    expect(text).not.toMatch(/\b(10|15|22|30|33|44|47|50|54)\s+optional\b/i)
    expect(text).not.toMatch(/\b120 (lessons|hours)\b/i)
    expect(text).toContain(`${TOTAL_MANDATORY_LESSONS} core lessons`)
  })

  it("keeps the rule for when a later month opens, whole", () => {
    render(<ForOrganisationsNext />)
    const note = (screen.getByTestId("months-availability").textContent ?? "").replace(/\s+/g, " ")
    expect(note).toMatch(/Month 1 is available from 14 December 2026, Month 2 around 1 January 2027 and Month 3 around 1 February 2027/)
    expect(note).toMatch(/once a month has passed since their previous month began and they've finished 75% of that month's core lessons/)
    expect(note).toMatch(/While they wait, they keep using their current month/)
    expect(note).toMatch(/With a pass, their time is paused/)
    expect(note).toMatch(/On a monthly plan, their next payment waits/)
    expect(
      within(screen.getByTestId("months-availability")).getByRole("link", { name: "how months open" })
    ).toHaveAttribute("href", "/terms#course-months")
  })

  it("describes project marking as the home page does: AI marking, a person checking doubts", () => {
    const { container } = render(<ForOrganisationsNext markingLive />)
    const text = sectionText(container, "proof")
    expect(text).toMatch(/All three projects are marked by AI against GWTH's published marking guides/)
    expect(text).toMatch(/Not yetPassGoodExcellent/)
    expect(text).toMatch(/Two AI markers mark each project independently/)
    expect(text).toMatch(/A person at GWTH checks any mark in doubt/)
    expect(text).toMatch(/provisional mark at once/)
    expect(text).toMatch(/final once checked, within 7 days/)
    expect(text).toMatch(/up to three times, and their best mark counts/)
    expect(text).toMatch(/learners cannot see\s+the answers before they submit/)
    expect(text).not.toMatch(/tutor|teacher|assessor|examiner|Merit|Distinction/i)
  })

  it("speaks of marking in the future until hand-ins open", () => {
    const { container } = render(<ForOrganisationsNext markingLive={false} />)
    const text = sectionText(container, "proof")
    expect(text).toMatch(/Monthly projects will be marked/)
    expect(text).toMatch(/will be marked by AI/)
    expect(text).toMatch(/A person at GWTH will check any mark in doubt/)
    expect(text).not.toMatch(/projects are marked/)
  })

  it("describes the score only when it is switched on, with the example cards labelled", () => {
    const off = render(<ForOrganisationsNext showScore={false} />)
    expect(off.container.querySelector('[data-section="score"]')).toBeNull()
    expect(pageText(off.container)).not.toMatch(/GWTH score/i)
    off.unmount()
    const { container } = render(<ForOrganisationsNext showScore />)
    expect(screen.getByTestId("score-lead").textContent).toMatch(
      /Core lessons and quiz results count for half/
    )
    expect(screen.getByTestId("score-honesty").textContent).toMatch(
      /After 28 days without passing a core lesson/
    )
    expect(screen.getByTestId("score-cards").children).toHaveLength(3)
    const text = sectionText(container, "proof")
    expect(text).toMatch(/examples of what a learner sees, rather\s+than real learners/)
    expect(text).toMatch(/Compare scores only for people taking\s+the same set of lessons/)
    expect(text).not.toMatch(/top 1%|percentile|certificate/i)
  })

  it("says GWTH is independent and written for UK rules", () => {
    const { container } = render(<ForOrganisationsNext />)
    const text = sectionText(container, "independence")
    expect(text).toMatch(/no sponsors, no partnerships with AI companies/)
    expect(text).toMatch(/leading AI companies/)
    expect(text).toMatch(/lower-cost alternatives/)
    expect(text).toMatch(/Provider-authored training naturally centres/)
    expect(text).toMatch(/names the UK regulator for that work/)
    expect(text).toMatch(/follows UK data protection law/)
    const all = pageText(container)
    expect(all).not.toMatch(/every leading model|can only teach|unlike the LLMs/i)
  })

  it("sets the two offers side by side in a real table", () => {
    const { container } = render(<ForOrganisationsNext />)
    const table = within(section(container, "compare")).getByRole("table")
    expect(
      within(table).getAllByRole("columnheader").map((th) => th.textContent)
    ).toEqual(["Places on the standard course", "Your own edition"])
    expect(
      within(table).getAllByRole("rowheader").map((th) => th.textContent)
    ).toEqual([
      "Who it is for",
      "The lessons",
      "The pass mark",
      "Who sees progress",
      "The price",
      "How to start",
    ])
    const text = (table.textContent ?? "").replace(/\s+/g, " ")
    expect(text).toMatch(/No published price/)
    expect(text).toMatch(/You set one pass mark for your edition/)
    expect(text).toMatch(/Each person, on their own progress page/)
  })

  it("links to no course lesson, only to public pages", () => {
    for (const state of STATES) {
      const { container } = render(<ForOrganisationsNext {...state} />)
      const internal = hrefs(container).filter((h) => h.startsWith("/"))
      const allowed = [
        "/contact",
        "/lessons",
        "/start-here",
        "/pricing",
        "/terms#course-months",
        "/waitlist",
        "/gift",
        audienceHref("team"),
        audienceHref("institution"),
      ]
      for (const href of internal) expect(allowed, href).toContain(href)
      cleanup()
    }
  })
})

describe("the words and the look, in every state", () => {
  it("uses no em dash, en dash, section sign, dollar or dated check", () => {
    for (const state of STATES) {
      for (const audience of ["institution", "team"] as const) {
        const { container } = render(
          <ForOrganisationsNext {...state} audience={audience} />
        )
        const text = pageText(container)
        expect(text).not.toMatch(/[—–§$]/)
        expect(text).not.toMatch(/as of [A-Z]|checked in|at the time of writing|last checked/i)
        for (const img of Array.from(container.querySelectorAll("img"))) {
          expect(img.getAttribute("alt") ?? "").not.toMatch(/[—–§]/)
          expect((img.getAttribute("alt") ?? "").length).toBeGreaterThan(40)
        }
        cleanup()
      }
    }
  })

  it("makes no beta, coming-soon or being-built promise, and describes nobody by age", () => {
    for (const state of STATES) {
      const { container } = render(<ForOrganisationsNext {...state} />)
      const text = pageText(container)
      expect(text).not.toMatch(/\bbeta\b|invite-only|testers|\bintake\b/i)
      expect(text).not.toMatch(/being built|coming soon|next piece of work/i)
      expect(text).not.toMatch(/before the room starts|level(s|ling)? the room/i)
      expect(text).not.toMatch(
        /for adults|working adults|adult learners|young adults|\(16\+\)/i
      )
      expect(text).not.toMatch(/FractionalBuddy/)
      cleanup()
    }
  })

  it("keeps headings in order: one h1, and no level skipped", () => {
    const { container } = render(<ForOrganisationsNext publicScore />)
    const levels = Array.from(
      container.querySelectorAll("h1, h2, h3, h4, h5, h6")
    ).map((h) => Number(h.tagName.slice(1)))
    expect(levels.filter((l) => l === 1)).toHaveLength(1)
    levels.forEach((level, i) => {
      if (i > 0) expect(level - levels[i - 1]!, `heading ${i}`).toBeLessThanOrEqual(1)
    })
  })

  it("has no eyebrow pill, raw colour, gradient or shadow in its stylesheet", () => {
    const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
    expect(stripped).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(stripped).not.toMatch(/rgb\(|hsl\(|gradient\(/)
    // Inset bars only: no drop shadow.
    for (const shadow of stripped.match(/box-shadow:[^;]*;/g) ?? []) {
      expect(shadow).toMatch(/^box-shadow:\s*inset/)
    }
    expect(stripped).not.toMatch(/text-transform:\s*uppercase/)
    // Every boundary is the measured token; ink is never used as a border.
    expect(stripped).not.toMatch(/border[a-z-]*:\s*[\d.]+px\s+(solid|dashed)\s+var\(--v-ink\)/)
  })

  it("moves nothing, and fades only when motion is welcome", () => {
    const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
    const animated = stripped.match(/animation:[^;]*;/g) ?? []
    expect(animated).toHaveLength(1)
    expect(stripped).toMatch(
      /@media \(prefers-reduced-motion: no-preference\) \{\s*\.scope \[data-for\] \{\s*animation: pathIn/
    )
    const frames = stripped.match(/@keyframes pathIn \{([\s\S]*?)\n\}/)
    expect(frames![1]).toMatch(/opacity/)
    expect(frames![1]).not.toMatch(/transform|translate|scale/)
    for (const transition of stripped.match(/transition:[^;]*;/g) ?? []) {
      expect(transition).not.toMatch(/transform|width|height|margin|padding|all\b/)
    }
  })
})
