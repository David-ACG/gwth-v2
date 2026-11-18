import { readFileSync } from "node:fs"
import { join } from "node:path"
import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import {
  HomeNext,
  MONTH_STEPS,
  PURPOSES,
  groupByMonth,
} from "./home-next"
import { FILM, FILM_COPY } from "@/components/marketing/home-fde/home-film"
import { SIX_BLOCKS, SCORE_STATES } from "@/components/marketing/home-fde/home-fde"
import {
  DRAFT_PUBLIC_PATHS,
  isHiddenPublicPath,
} from "@/lib/public-routes"

afterEach(cleanup)

const ORIGINAL_MODE = process.env.PRIVATE_CONTENT_MODE
const ORIGINAL_DRAFTS = process.env.SHOW_DRAFT_PAGES
beforeEach(() => {
  process.env.PRIVATE_CONTENT_MODE = "on"
})
afterEach(() => {
  if (ORIGINAL_MODE === undefined) delete process.env.PRIVATE_CONTENT_MODE
  else process.env.PRIVATE_CONTENT_MODE = ORIGINAL_MODE
  if (ORIGINAL_DRAFTS === undefined) delete process.env.SHOW_DRAFT_PAGES
  else process.env.SHOW_DRAFT_PAGES = ORIGINAL_DRAFTS
})

const CSS = readFileSync(join(__dirname, "home-next.module.css"), "utf8")

function hrefs(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("a")).map(
    (a) => a.getAttribute("href") ?? ""
  )
}

function sectionOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("section[data-section]")).map(
    (el) => el.getAttribute("data-section") ?? ""
  )
}

function pageText(container: HTMLElement): string {
  return (container.textContent ?? "").replace(/\s+/g, " ")
}

describe("the draft is a draft (David, 18 Nov 2026: do not overwrite the old home page)", () => {
  it("is a real 404 unless the server is started to show drafts", () => {
    expect(DRAFT_PUBLIC_PATHS).toContain("/home-new")
    delete process.env.SHOW_DRAFT_PAGES
    expect(isHiddenPublicPath("/home-new")).toBe(true)
    process.env.SHOW_DRAFT_PAGES = "1"
    expect(isHiddenPublicPath("/home-new")).toBe(false)
    // The pages that are hidden for everyone stay hidden on the replica.
    expect(isHiddenPublicPath("/score")).toBe(true)
  })

  it("never hides the real home page", () => {
    delete process.env.SHOW_DRAFT_PAGES
    expect(isHiddenPublicPath("/")).toBe(false)
  })
})

describe("HomeNext: the new home page draft", () => {
  it("tells its story in this order", () => {
    const { container } = render(<HomeNext showScore />)
    expect(sectionOrder(container)).toEqual([
      "hero",
      "superpowers",
      "months",
      "purpose",
      "proof",
      "lesson",
      "uk",
      "price",
    ])
  })

  it("opens on the six AI superpowers, the film's own title", () => {
    render(<HomeNext />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Learn six AI superpowers by making things."
    )
  })

  it("starts from the approved description line and says no coding is needed", () => {
    const { container } = render(<HomeNext />)
    const hero = container.querySelector('[data-section="hero"]')!
    expect(hero.textContent).toContain(
      "GWTH is a practical AI course for work and everyday life in the UK."
    )
    expect(hero.textContent).toMatch(/don.t need coding experience/)
  })

  it("keeps the film exactly as it is on the real home page", () => {
    const { container } = render(<HomeNext />)
    const poster = container.querySelector(
      '[data-section="film"] img'
    ) as HTMLImageElement
    expect(poster.getAttribute("src")).toBe(FILM.poster)
    expect(
      screen.getByRole("button", { name: "Play the GWTH film" })
    ).toHaveTextContent(FILM_COPY.play)
  })

  it("keeps the free-lesson link beside the film, where the film says it is", () => {
    render(<HomeNext />)
    const film = document.querySelector('[data-section="film"]')!
    const band = screen.getByTestId("home-free-lesson")
    expect(film.contains(band)).toBe(true)
    expect(band).toHaveTextContent(FILM_COPY.body)
    expect(within(band).getByRole("link")).toHaveAttribute("href", "/start-here")
  })
})

describe("six AI superpowers, opened in place (a-20261118-220107)", () => {
  it("offers all six as one choice, with Research chosen first", () => {
    render(<HomeNext />)
    const radios = screen
      .getAllByRole("radio")
      .filter((r) => r.getAttribute("name") === "superpower")
    expect(radios).toHaveLength(6)
    expect(radios[0]).toBeChecked()
    for (const block of SIX_BLOCKS) {
      expect(screen.getByRole("radio", { name: new RegExp(block.name) })).toBeInTheDocument()
    }
  })

  it("shows each superpower growing from Month 1 to Month 3, with a picture", () => {
    render(<HomeNext />)
    const panels = screen.getAllByTestId("superpower-panel")
    expect(panels).toHaveLength(6)
    SIX_BLOCKS.forEach((block, i) => {
      const panel = panels[i]!
      const steps = within(panel).getAllByRole("listitem")
      expect(steps).toHaveLength(3)
      block.months.forEach((line, month) => {
        expect(steps[month]).toHaveTextContent(`Month ${month + 1}`)
        expect(steps[month]).toHaveTextContent(line)
      })
      const srcs = Array.from(panel.querySelectorAll("img")).map(
        (img) => decodeURIComponent(img.getAttribute("src") ?? "")
      )
      expect(srcs.some((s) => /next\/[a-z]+\.jpg/.test(s))).toBe(true)
      expect(srcs.some((s) => /next\/[a-z]+-dark\.jpg/.test(s))).toBe(true)
    })
  })

  it("never sends the reader to another page to see how a superpower grows", () => {
    const { container } = render(<HomeNext />)
    const section = container.querySelector('[data-section="superpowers"]')!
    const links = Array.from(section.querySelectorAll("a")).map(
      (a) => a.getAttribute("href") ?? ""
    )
    // The only link is the source of the six.
    expect(links).toHaveLength(1)
    expect(links[0]).toMatch(/^https:\/\/openai\.com\//)
  })

  it("says automation is designed, not built (the curriculum check)", () => {
    render(<HomeNext />)
    const panel = screen.getAllByTestId("superpower-panel")[5]!
    expect(panel.textContent).toMatch(/You design/)
    expect(panel.textContent).not.toMatch(/You automate|You build an automation/)
  })

  it("shows the chosen panel with CSS alone, and every panel where :has() is missing", () => {
    const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
    for (const value of [
      "research",
      "content",
      "thinking",
      "building",
      "data",
      "automation",
      "home",
      "work",
      "career",
    ]) {
      expect(stripped).toContain(
        `.chooser:has(input[value="${value}"]:checked) .panel[data-panel="${value}"]`
      )
    }
    expect(stripped).toMatch(/@supports not selector\(:has\(\*\)\)\s*\{\s*\.panel\s*\{\s*display:\s*grid/)
  })

  it("marks the chosen option with more than a tint", () => {
    const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
    const m = stripped.match(/\.option input:checked \+ \.optionFace\s*\{([^}]*)\}/)
    expect(m).toBeTruthy()
    expect(m![1]).toMatch(/box-shadow:\s*inset 0 -4px 0 var\(--v-accent\)/)
    expect(stripped).toMatch(/\.option input:focus-visible \+ \.optionFace\s*\{[^}]*outline:/)
  })
})

describe("the three months", () => {
  it("keeps the months picture David chose, in both editions", () => {
    const { container } = render(<HomeNext />)
    const section = container.querySelector('[data-section="months"]')!
    const srcs = Array.from(section.querySelectorAll("img")).map(
      (img) => decodeURIComponent(img.getAttribute("src") ?? "")
    )
    expect(srcs.some((s) => s.includes("what-you-make-cutout.png"))).toBe(true)
    expect(srcs.some((s) => s.includes("what-you-make-cutout-dark.png"))).toBe(true)
  })

  it("names what you make in each month", () => {
    render(<HomeNext />)
    const steps = screen.getAllByTestId("month-step")
    expect(steps).toHaveLength(3)
    MONTH_STEPS.forEach((month, i) => {
      expect(steps[i]).toHaveTextContent(month.kicker)
      expect(steps[i]).toHaveTextContent(month.title)
      expect(within(steps[i]!).getAllByRole("listitem")).toHaveLength(3)
    })
    // Family AI Bot is an optional project in Month 1 (config.ts), so the
    // month's summary names core projects only.
    expect(steps[0]).toHaveTextContent("Spending Detective")
    expect(steps[0]!.textContent).not.toContain("Family AI Bot")
    expect(steps[1]).toHaveTextContent("AskMyCo")
  })

  it("does not say a learner chooses optional lessons (there is no picker yet)", () => {
    render(<HomeNext />)
    const note = screen.getByTestId("months-optional-note")
    expect(note.textContent).not.toMatch(/\bchoose\b/i)
    expect(note.textContent).not.toMatch(/\d+ (optional|lessons)/)
  })
})

describe("What would you like to do with AI? (a-20261118-215935)", () => {
  it("offers three purposes, each with a picture and at least eight reasons", () => {
    render(<HomeNext />)
    const radios = screen
      .getAllByRole("radio")
      .filter((r) => r.getAttribute("name") === "purpose")
    expect(radios).toHaveLength(3)
    const panels = screen.getAllByTestId("purpose-panel")
    expect(panels).toHaveLength(3)
    PURPOSES.forEach((purpose, i) => {
      expect(purpose.cards.length).toBeGreaterThanOrEqual(8)
      const panel = panels[i]!
      for (const card of purpose.cards) {
        expect(panel).toHaveTextContent(card.title)
      }
      expect(panel.querySelectorAll("img").length).toBe(2)
    })
  })

  it("sets the reasons out month by month, as a route", () => {
    const work = PURPOSES.find((purpose) => purpose.id === "work")!
    const groups = groupByMonth(work.cards)
    expect(groups.map((g) => g.heading)).toEqual(["Month 1", "Month 2", "Month 3"])
    const career = PURPOSES.find((purpose) => purpose.id === "career")!
    expect(groupByMonth(career.cards).at(-1)?.heading).toBe("In every month")
    const total = groups.reduce((n, g) => n + g.cards.length, 0)
    expect(total).toBe(work.cards.length)
  })

  it("never prints a lesson reference or links into a lesson (David, 1 Nov 2026)", () => {
    const { container } = render(<HomeNext showScore selling />)
    expect(pageText(container)).not.toMatch(/\bM[123] L\d{2}\b/)
    for (const href of hrefs(container)) {
      expect(href).not.toMatch(/^\/(course|lesson|dashboard|learn)\b/)
    }
  })

  it("keeps buying for someone else to one signpost", () => {
    render(<HomeNext selling />)
    const signpost = screen.getByTestId("organisations-signpost")
    const links = within(signpost).getAllByRole("link").map((a) => a.getAttribute("href"))
    expect(links).toEqual(["/gift", "/for-institutions"])
  })

  it("offers no gift link before sales open", () => {
    render(<HomeNext />)
    const signpost = screen.getByTestId("organisations-signpost")
    const links = within(signpost).getAllByRole("link").map((a) => a.getAttribute("href"))
    expect(links).toEqual(["/for-institutions"])
  })
})

describe("a score and a portfolio, at a glance (a-20261118-220253)", () => {
  it("says both in one picture and two short statements", () => {
    render(<HomeNext showScore />)
    expect(screen.getByTestId("proof-score")).toHaveTextContent("A number out of 100.")
    expect(screen.getByTestId("proof-portfolio")).toHaveTextContent(
      /your employer|an application|an interview/
    )
    const section = document.querySelector('[data-section="proof"]')!
    const srcs = Array.from(section.querySelectorAll("img")).map(
      (img) => decodeURIComponent(img.getAttribute("src") ?? "")
    )
    expect(srcs.some((s) => s.includes("next/show-your-work.jpg"))).toBe(true)
  })

  it("shows the three directions a score can take (a-20260915-211845)", () => {
    render(<HomeNext showScore />)
    const cards = screen.getByTestId("score-cards")
    for (const state of SCORE_STATES) {
      expect(cards).toHaveTextContent(state.state)
    }
    // The Style Bible's required phrase, and the real rule from gwth-score.ts.
    expect(screen.getByTestId("score-lead")).toHaveTextContent(
      "The marks for your monthly projects count"
    )
    expect(screen.getByTestId("score-honesty")).toHaveTextContent(
      "After 28 days without passing a core lesson, you start losing 5% of your earned points for each full week."
    )
  })

  it("claims nothing the score cannot do", () => {
    const { container } = render(<HomeNext showScore />)
    const text = pageText(container)
    expect(text).not.toMatch(/top \d+%|percentile|certificate|LinkedIn score|share your score/i)
    expect(text).toContain("These cards show examples rather than real learners.")
  })

  it("does not describe the score as live while it is switched off", () => {
    const { container } = render(<HomeNext showScore={false} />)
    expect(container.querySelector('[data-section="score"]')).toBeNull()
    expect(screen.getByTestId("proof-score")).toHaveTextContent(
      "The course does not show it yet."
    )
  })
})

describe("the price closes the page, word for word", () => {
  it("carries the offer and the month-opening rule", () => {
    render(<HomeNext />)
    const offer = screen.getByTestId("home-offer")
    expect(offer).toHaveTextContent(/a three-month pass costs £69\./)
    expect(offer).toHaveTextContent("It never renews, and gift recipients give no card details.")
    expect(offer).toHaveTextContent(/Or pay £29 a month for the first three months/)
    expect(offer).toHaveTextContent(/costs £7\.50 a month/)
    const months = screen.getByTestId("home-offer-months")
    expect(months).toHaveTextContent(
      /each later month opens once a month has passed since your previous month began and you.ve finished 75% of that month.s core lessons/
    )
    expect(within(months).getByRole("link")).toHaveAttribute("href", "/terms#course-months")
  })

  it("sells from the buttons only once GWTH is on sale", () => {
    const { container, unmount } = render(<HomeNext />)
    expect(hrefs(container)).toContain("/waitlist")
    expect(hrefs(container)).not.toContain("/gift")
    unmount()
    const selling = render(<HomeNext selling />)
    expect(hrefs(selling.container)).toContain("/pricing")
    expect(hrefs(selling.container)).toContain("/gift")
    expect(hrefs(selling.container)).not.toContain("/waitlist")
  })

  it("does not advertise the labs while they are private", () => {
    const { container, unmount } = render(<HomeNext />)
    expect(hrefs(container)).not.toContain("/labs")
    unmount()
    process.env.PRIVATE_CONTENT_MODE = "off"
    const open = render(<HomeNext />)
    expect(hrefs(open.container)).toContain("/labs")
  })
})

describe("house rules for public text", () => {
  it("uses no em dash, en dash, section sign or check date", () => {
    const { container } = render(<HomeNext showScore selling />)
    const text = pageText(container)
    expect(text).not.toMatch(/[—–§]/)
    expect(text).not.toMatch(/checked (in|on) |correct as of|last checked|at the time of writing/i)
  })

  it("describes who GWTH is for by purpose, never by age", () => {
    const { container } = render(<HomeNext showScore selling />)
    expect(pageText(container)).not.toMatch(
      /for adults|working adults|UK adults|adult learners|young adults|\(16\+\)/i
    )
  })

  it("has one h1 and no heading that skips a level", () => {
    const { container } = render(<HomeNext showScore />)
    const levels = Array.from(container.querySelectorAll("h1,h2,h3,h4,h5,h6")).map(
      (h) => Number(h.tagName.slice(1))
    )
    expect(levels.filter((l) => l === 1)).toHaveLength(1)
    levels.forEach((level, i) => {
      if (i > 0) expect(level - levels[i - 1]!).toBeLessThanOrEqual(1)
    })
  })

  it("gives every picture a description", () => {
    const { container } = render(<HomeNext showScore />)
    const imgs = Array.from(container.querySelectorAll("img")).filter(
      (img) => !img.closest('[data-section="film"]')
    )
    expect(imgs.length).toBeGreaterThan(20)
    for (const img of imgs) {
      expect((img.getAttribute("alt") ?? "").length).toBeGreaterThan(40)
    }
  })

  it("draws no decorative pill above a heading and no ink border", () => {
    const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
    expect(stripped).not.toMatch(/border[a-z-]*:\s*[\d.]+px\s+(solid|dashed)\s+var\(--v-ink\)/)
    expect(stripped).not.toMatch(/text-transform:\s*uppercase/)
    expect(stripped).not.toMatch(/font-mono|--font-mono/)
  })
})
