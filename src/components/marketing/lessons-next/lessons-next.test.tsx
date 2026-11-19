import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { LessonsNext } from "./lessons-next"
import { SYLLABUS, coreLessons, syllabusMonth } from "./syllabus"
import { MONTH_CONFIGS, TOTAL_MANDATORY_LESSONS } from "@/lib/config"
import { MONTH_STEPS } from "@/components/marketing/home-next/home-next"
import { HAND_IN_QUESTIONS, MAX_HAND_INS } from "@/lib/capstones/guides"
import { BAND_LABELS } from "@/lib/capstones/rules"

afterEach(cleanup)

const HERE = __dirname
const CSS = readFileSync(join(HERE, "lessons-next.module.css"), "utf8")
const SOURCE = readFileSync(join(HERE, "lessons-next.tsx"), "utf8")
const ROUTE = readFileSync(
  join(HERE, "../../../app/(public)/lessons/page.tsx"),
  "utf8"
)
const PUBLIC = join(HERE, "../../../../public")

/** All visible text of the rendered page, whitespace collapsed. */
function text(container: HTMLElement = document.body): string {
  return (container.textContent ?? "").replace(/\s+/g, " ")
}

function hrefs(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("a")).map(
    (a) => a.getAttribute("href") ?? ""
  )
}

/** The page as the route renders it: the course as it is at launch. */
function renderLaunch(props: Parameters<typeof LessonsNext>[0] = {}) {
  return render(<LessonsNext showScore markingLive labsOpen {...props} />)
}

describe("the route", () => {
  it("renders the new page, with the course as it is at launch", () => {
    expect(ROUTE).toContain("lessons-next/lessons-next")
    expect(ROUTE).toMatch(/<LessonsNext selling=\{isSelling\(\)\} showScore markingLive \/>/)
    // The count in the description is still read from config.
    expect(ROUTE).toContain("TOTAL_MANDATORY_LESSONS")
  })
})

describe("the page, in order", () => {
  it("has one h1 and seven sections in the planned order", () => {
    const { container } = renderLaunch()
    expect(container.querySelectorAll("h1")).toHaveLength(1)
    expect(container.querySelector("h1")).toHaveTextContent(
      "The whole course, lesson by lesson."
    )
    const order = Array.from(
      container.querySelectorAll("section[data-section]")
    ).map((el) => el.getAttribute("data-section"))
    expect(order).toEqual([
      "hero",
      "months",
      "lesson",
      "marking",
      "optional",
      "current",
      "closing",
    ])
  })

  it("puts no eyebrow above a headline", () => {
    const { container } = renderLaunch()
    for (const heading of container.querySelectorAll("h1, h2")) {
      expect(heading.previousElementSibling).toBeNull()
    }
  })
})

describe("the buttons follow the launch", () => {
  it("sends both main buttons to the waitlist before sales open", () => {
    renderLaunch({ selling: false })
    for (const id of ["lessons-primary-cta", "lessons-closing-cta"]) {
      const cta = screen.getByTestId(id)
      expect(cta).toHaveAttribute("href", "/waitlist")
      expect(cta).toHaveTextContent("Join the waitlist")
    }
  })

  it("sends both main buttons to the prices once sales are open", () => {
    renderLaunch({ selling: true })
    for (const id of ["lessons-primary-cta", "lessons-closing-cta"]) {
      const cta = screen.getByTestId(id)
      expect(cta).toHaveAttribute("href", "/pricing")
      expect(cta).toHaveTextContent("Join the course")
    }
    expect(text()).not.toMatch(/waitlist/i)
  })

  it("says the same words in both selling states, apart from the buttons", () => {
    const strip = (body: string) =>
      body.replace(/Join the waitlist|Join the course|See pricing/g, "")
    const before = strip(text(renderLaunch({ selling: false }).container))
    cleanup()
    const after = strip(text(renderLaunch({ selling: true }).container))
    expect(after).toBe(before)
  })
})

describe("no link opens a lesson (David, 1 Nov 2026)", () => {
  it("links only to public pages, and to the free lesson", () => {
    for (const selling of [false, true]) {
      cleanup()
      const { container } = renderLaunch({ selling })
      const allowed = new Set([
        "/waitlist",
        "/pricing",
        "/start-here",
        "/terms#course-months",
        "/for-organisations",
        "/labs",
      ])
      for (const href of hrefs(container)) {
        expect(allowed.has(href), `unexpected link ${href}`).toBe(true)
      }
      expect(hrefs(container)).toContain("/start-here")
    }
  })

  it("makes exactly one lesson row a link, and it is the free lesson", () => {
    const { container } = renderLaunch()
    const linked = Array.from(
      container.querySelectorAll('[data-testid="lesson-row"] a')
    )
    expect(linked).toHaveLength(1)
    expect(linked[0]).toHaveAttribute("href", "/start-here")
    expect(linked[0]!.closest("li")).toHaveTextContent("Start here")
  })

  it("does not link to pages closed at launch", () => {
    const { container } = renderLaunch()
    for (const hidden of ["/for-teams", "/news", "/tech-radar", "/score"]) {
      expect(hrefs(container)).not.toContain(hidden)
    }
  })
})

describe("the syllabus", () => {
  it("prints only counts read from config", () => {
    const { container } = renderLaunch()
    const body = text(container)
    expect(body).toContain(`${TOTAL_MANDATORY_LESSONS} core lessons`)
    const headings = screen.getAllByTestId("core-heading")
    MONTH_CONFIGS.forEach((month, index) => {
      expect(headings[index]).toHaveTextContent(
        `The ${month.mandatoryLessons} core lessons`
      )
    })
  })

  it("lists exactly as many core lessons as it says, in every month", () => {
    renderLaunch()
    const panels = screen.getAllByTestId("month-panel")
    expect(panels).toHaveLength(3)
    MONTH_CONFIGS.forEach((month, index) => {
      const list = within(panels[index]!).getByTestId("core-lessons")
      expect(within(list).getAllByTestId("lesson-row")).toHaveLength(
        month.mandatoryLessons
      )
    })
  })

  it("follows config when the count is raised to the whole syllabus", () => {
    for (const month of SYLLABUS) {
      const added = month.core.filter((lesson) => lesson.sinceCount).length
      const counted = MONTH_CONFIGS.find((m) => m.month === month.month)!
        .mandatoryLessons
      // Config is either the 20 October count or the whole list. Anything
      // else means the syllabus database moved: re-read it into syllabus.ts.
      expect([month.core.length, month.core.length - added]).toContain(counted)
      expect(coreLessons(month.month, month.core.length)).toHaveLength(
        month.core.length
      )
      expect(coreLessons(month.month, month.core.length - added)).toHaveLength(
        month.core.length - added
      )
    }
  })

  it("never lists a lesson twice", () => {
    const ids = SYLLABUS.flatMap((month) => [
      ...month.core,
      ...month.optional.flatMap((group) => group.lessons),
    ]).map((lesson) => lesson.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("prints no optional total (David, a-20260914-201426-ae7f0e)", () => {
    const { container } = renderLaunch()
    expect(text(container)).not.toMatch(/\b\d+\s+optional\b/i)
  })

  it("lists every optional lesson behind one click, grouped", () => {
    renderLaunch()
    const panels = screen.getAllByTestId("month-panel")
    SYLLABUS.forEach((month, index) => {
      const details = panels[index]!.querySelector("details")!
      expect(details.querySelector("summary")).toHaveTextContent(
        `Show the optional lessons in Month ${month.month}`
      )
      const rows = within(details).getAllByTestId("lesson-row")
      expect(rows).toHaveLength(
        syllabusMonth(month.month).optional.reduce(
          (sum, group) => sum + group.lessons.length,
          0
        )
      )
    })
    // The fields the home page already names.
    expect(panels[1]).toHaveTextContent("AI for UK HR and people teams")
    expect(panels[1]).toHaveTextContent("AI for UK legal")
  })

  it("names each month as the home page does", () => {
    renderLaunch()
    const panels = screen.getAllByTestId("month-panel")
    MONTH_STEPS.forEach((step, index) => {
      expect(panels[index]).toHaveTextContent(
        `Month ${index + 1}: ${step.title}`
      )
      for (const item of step.makes) {
        expect(panels[index]).toHaveTextContent(item)
      }
    })
  })

  it("shows each month's project and what is handed in", () => {
    renderLaunch()
    const projects = screen.getAllByTestId("month-project")
    MONTH_CONFIGS.forEach((month, index) => {
      expect(projects[index]).toHaveTextContent(month.capstoneName)
      expect(projects[index]).toHaveTextContent(month.capstoneDescription)
      expect(projects[index]).toHaveTextContent(
        month.capstoneOptional
          ? "An optional project"
          : "The month's main project"
      )
      expect(projects[index]).toHaveTextContent("What you hand in for marking")
    })
    expect(projects[1]).toHaveTextContent("The two-company test")
  })

  it("keeps the month-opening rule, word for word", () => {
    renderLaunch()
    const note = (
      screen.getByTestId("months-availability").textContent ?? ""
    ).replace(/\s+/g, " ")
    expect(note).toMatch(/Month 1 is available from 14 December 2026/)
    expect(note).toMatch(/Month 2 around 1 January 2027/)
    expect(note).toMatch(/Month 3 around 1 February 2027/)
    expect(note).toMatch(/finished 75% of that month's core lessons/)
    expect(note).toMatch(/you keep using your current month/)
    expect(note).toMatch(/With a pass, your time is paused/)
    expect(note).toMatch(/On a monthly plan, your next payment waits/)
    expect(
      within(screen.getByTestId("months-availability")).getByRole("link")
    ).toHaveAttribute("href", "/terms#course-months")
  })

  it("draws the months as real radio buttons with a panel each", () => {
    const { container } = renderLaunch()
    const radios = container.querySelectorAll<HTMLInputElement>(
      'input[type="radio"][name="course-month"]'
    )
    expect(radios).toHaveLength(3)
    expect(radios[0]!.checked).toBe(true)
    for (const radio of radios) {
      const panel = container.querySelector(
        `#${radio.getAttribute("aria-controls")}`
      )
      expect(panel).not.toBeNull()
      expect(panel!.getAttribute("data-panel")).toBe(radio.value)
      // The stylesheet shows the panel for this value.
      expect(CSS).toContain(`input[value="${radio.value}"]:checked`)
    }
    // Without :has() every month is shown, never hidden.
    expect(CSS).toMatch(/@supports not selector\(:has\(\*\)\)/)
  })
})

describe("how a lesson works", () => {
  it("has the four steps in the real order", () => {
    renderLaunch()
    const steps = screen
      .getAllByTestId("lesson-step")
      .map((li) => li.querySelector("h3")!.textContent)
    expect(steps).toEqual([
      "Watch a short film",
      "Read the lesson",
      "Do the project",
      "Answer the questions",
    ])
    expect(text()).toMatch(/Every lesson has the same four steps/)
    expect(text()).not.toMatch(/video showing you exactly what to do/i)
  })
})

describe("marking, the score and the portfolio", () => {
  it("describes marking in the present tense at launch", () => {
    renderLaunch()
    expect(screen.getByTestId("marking-lead")).toHaveTextContent(
      "All three projects are marked by AI against GWTH's published marking guides."
    )
    const steps = text(screen.getByTestId("marking-steps"))
    expect(steps).toMatch(/Two AI markers mark each project independently/)
    expect(steps).toMatch(/A person at GWTH checks any mark in doubt/)
    expect(steps).toMatch(/provisional mark at once/)
    expect(steps).toMatch(/final once checked, within 7 days/)
    expect(steps).toMatch(/one clear next step/)
    expect(screen.getByTestId("levels-note")).toHaveTextContent(
      "up to three times; your best mark counts"
    )
    expect(MAX_HAND_INS).toBe(3)
  })

  it("moves every marking sentence to the future while hand-ins are off", () => {
    renderLaunch({ markingLive: false })
    expect(screen.getByTestId("marking-lead")).toHaveTextContent(
      "All three projects will be marked by AI"
    )
    const steps = text(screen.getByTestId("marking-steps"))
    expect(steps).toMatch(/will mark each project independently/)
    expect(steps).toMatch(/will check any mark in doubt/)
    expect(steps).not.toMatch(/You hand in|You see a provisional/)
    expect(screen.getByTestId("levels-note")).toHaveTextContent(
      "your best mark will count"
    )
    expect(text()).toMatch(/How your projects will be marked/)
    expect(text()).toMatch(/What you will hand in for marking/)
  })

  it("names the four levels and the four questions from the product", () => {
    renderLaunch()
    const levels = within(screen.getByTestId("levels"))
      .getAllByRole("listitem")
      .map((li) => li.textContent)
    expect(levels).toEqual([
      BAND_LABELS.not_yet,
      BAND_LABELS.pass,
      BAND_LABELS.good,
      BAND_LABELS.excellent,
    ])
    const questions = within(screen.getByTestId("hand-in-questions"))
      .getAllByRole("listitem")
      .map((li) => li.textContent)
    expect(questions).toEqual(HAND_IN_QUESTIONS.map((item) => item.question))
  })

  it("keeps the example-data and permission statements", () => {
    renderLaunch()
    expect(screen.getByTestId("example-data-note")).toHaveTextContent(
      "These projects use example data we provide. Afterwards, an unmarked step lets you make them your own."
    )
    expect(screen.getByTestId("portfolio-block")).toHaveTextContent(
      "Get permission before sharing anyone else's information."
    )
  })

  it("explains the score as the home page does", () => {
    renderLaunch()
    expect(screen.getByTestId("score-what")).toHaveTextContent(
      "A number out of 100."
    )
    expect(screen.getByTestId("score-lead")).toHaveTextContent(
      "Core lessons and quiz results count for half of your score. The marks for your monthly projects count for the other half."
    )
    expect(screen.getByTestId("score-honesty")).toHaveTextContent(
      "After 28 days without passing a core lesson, you start losing 5% of your earned points for each full week."
    )
    expect(screen.getByTestId("score-denominator")).toHaveTextContent(
      "Compare scores only for people taking the same set of lessons."
    )
    expect(screen.queryByTestId("score-beta-note")).toBeNull()
  })

  it("says the score is not shown yet when the score is off", () => {
    renderLaunch({ showScore: false })
    expect(screen.getByTestId("score-beta-note")).toHaveTextContent(
      "The course does not show a GWTH score yet."
    )
    expect(screen.getByTestId("score-what")).toHaveTextContent(
      "A number out of 100 is planned."
    )
    expect(screen.queryByTestId("score-lead")).toBeNull()
    expect(screen.queryByTestId("score-honesty")).toBeNull()
  })

  it("claims nothing the score does not do", () => {
    renderLaunch()
    expect(text()).not.toMatch(
      /currentness|curiosity index|consistency score|improvement rate|percentile|top 1%|certificate|add to linkedin|its own web address|recomputes? weekly/i
    )
  })
})

describe("the optional lessons, the UK rules and organisations", () => {
  it("keeps the three directions", () => {
    renderLaunch()
    const cards = screen.getAllByTestId("path-card")
    expect(cards).toHaveLength(3)
    expect(cards[0]).toHaveTextContent("UK legal practice")
    expect(cards[0]).toHaveTextContent("accountancy firms")
    expect(cards[1]).toHaveTextContent("Go further into building")
    expect(screen.getByTestId("optional-lead")).toHaveTextContent(
      "building more advanced AI tools"
    )
    expect(screen.getByTestId("optional-note")).toHaveTextContent(
      "Each month includes its core and optional lessons when that month opens."
    )
  })

  it("keeps the UK rules the specialist lessons work to", () => {
    renderLaunch()
    const note = screen.getByTestId("lessons-uk-note")
    for (const name of [
      "Solicitors Regulation Authority",
      "Ayinde judgment",
      "ICAEW, ACCA and CIMA",
      "ISA (UK) 700",
      "UK data protection law",
    ]) {
      expect(note).toHaveTextContent(name)
    }
  })

  it("sends an organisation to its own page", () => {
    renderLaunch()
    const block = screen.getByTestId("optional-buyers")
    expect(block).toHaveTextContent(
      `Everyone on the standard course completes the same ${TOTAL_MANDATORY_LESSONS} core lessons.`
    )
    expect(block).toHaveTextContent("company or team of 100 or more learners")
    expect(within(block).getByRole("link")).toHaveAttribute(
      "href",
      "/for-organisations"
    )
  })
})

describe("how the course stays up to date", () => {
  it("keeps what happens after three months, with the price from config", () => {
    renderLaunch()
    expect(screen.getByTestId("current-after")).toHaveTextContent(
      "After three months, your monthly plan continues at £7.50 a month for access to the updated lessons unless you cancel. If you paid once for a pass, your access to the course lessons stops. You only pay again if you choose to subscribe."
    )
    expect(SOURCE).not.toMatch(/£7\.50/)
    expect(screen.getByTestId("current-rewrite")).toHaveTextContent(
      "we rewrite the lessons"
    )
  })

  it("points at the free labs only when they can be promoted", () => {
    const open = renderLaunch({ labsOpen: true })
    expect(hrefs(open.container)).toContain("/labs")
    cleanup()
    const closed = renderLaunch({ labsOpen: false })
    expect(hrefs(closed.container)).not.toContain("/labs")
    expect(text(closed.container)).not.toMatch(/free labs/i)
  })
})

describe("the words rules", () => {
  it("has no em dash, en dash or section sign, in any state", () => {
    const states = [
      {},
      { selling: true },
      { showScore: false, markingLive: false, labsOpen: false },
    ]
    for (const state of states) {
      cleanup()
      const { container } = renderLaunch(state)
      expect(text(container)).not.toMatch(/[—–§]/)
      for (const img of container.querySelectorAll("img")) {
        expect(img.getAttribute("alt") ?? "").not.toMatch(/[—–§]/)
      }
    }
  })

  it("describes the audience by purpose, never by age", () => {
    const { container } = renderLaunch()
    expect(text(container)).not.toMatch(
      /for adults|working adults|UK adults|adult learners|young adults|\(16\+\)/i
    )
  })

  it("has no beta wording, old jargon or dated checks", () => {
    const { container } = renderLaunch()
    expect(text(container)).not.toMatch(
      /\bbeta\b|invite-only|testers|intake|six primitives|main spine|strategic layer|as of (November|December)|last checked|at the time of writing/i
    )
  })

  it("types no launch date or count in the source", () => {
    expect(SOURCE).not.toMatch(/14 December|1 January 2027|1 February 2027/)
    expect(SOURCE).not.toMatch(/\b(63|68) core\b/)
  })
})

describe("pictures and themes", () => {
  it("gives every picture a paper and a night file, and alt text", () => {
    const { container } = renderLaunch()
    const images = Array.from(container.querySelectorAll("img"))
    expect(images.length).toBeGreaterThanOrEqual(12)
    for (const img of images) {
      expect((img.getAttribute("alt") ?? "").length).toBeGreaterThan(20)
    }
    for (const name of [
      "syllabus",
      "month-1",
      "month-2",
      "month-3",
      "lesson-desk",
      "updated",
    ]) {
      expect(existsSync(join(PUBLIC, "lessons", `${name}.jpg`))).toBe(true)
      expect(existsSync(join(PUBLIC, "lessons", `${name}-dark.jpg`))).toBe(true)
    }
  })

  it("uses tokens only, and stills all motion on request", () => {
    expect(CSS).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(CSS).not.toMatch(/rgba?\(/i)
    // Every animation sits inside a no-preference block.
    const outside = CSS.replace(
      /@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}\n/g,
      ""
    )
    expect(outside).not.toMatch(/animation:/)
    expect(CSS).toMatch(/prefers-reduced-motion: no-preference/)
  })
})
