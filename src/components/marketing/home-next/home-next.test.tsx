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
  it("is the real home page since 19 Nov 2026, showing the December course with the score", () => {
    const route = readFileSync(join(process.cwd(), "src/app/(public)/page.tsx"), "utf8")
    expect(route).toContain("<HomeNext selling={isSelling()} showScore markingLive />")
    expect(route).not.toContain("<HomeFde")
    const draft = readFileSync(join(process.cwd(), "src/app/(public)/home-new/page.tsx"), "utf8")
    expect(draft).toContain('redirect("/")')
    expect(draft).toContain("notFound()")
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

  it("keeps project marking in the future tense while the score is shown, until hand-ins open", () => {
    render(<HomeNext showScore markingLive={false} />)
    const marking = screen.getByTestId("proof-marking")
    expect(within(marking).getByRole("heading", { level: 3 })).toHaveTextContent(
      "Your monthly projects will be marked, with feedback on your work"
    )
    expect(marking.textContent).not.toMatch(/projects are marked|markers mark each/)
    expect(screen.getByTestId("proof-score")).toHaveTextContent("A number out of 100.")
  })

  it.each([true, false])("gives project marking its own title and clear feedback (showScore=%s)", (showScore) => {
    const { container } = render(<HomeNext showScore={showScore} markingLive={showScore} />)
    const marking = screen.getByTestId("proof-marking")
    const proof = container.querySelector('[data-section="proof"]')!
    expect(proof.contains(marking)).toBe(true)
    expect(within(marking).getByRole("heading", { level: 3 })).toHaveTextContent(
      showScore
        ? "Your monthly projects are marked, with feedback on your work"
        : "Your monthly projects will be marked, with feedback on your work"
    )
    expect(marking).toHaveTextContent("marked by AI against GWTH's published marking guides")
    expect(marking).toHaveTextContent("Not yet, Pass, Good and Excellent")
    expect(marking).toHaveTextContent("at the end of each month")
    expect(marking).toHaveTextContent("All three projects")
    expect(marking).toHaveTextContent("your own work")
    expect(marking).toHaveTextContent("what you've done well")
    expect(marking).toHaveTextContent("how to reach the next level")
    expect(marking).toHaveTextContent(/Two AI markers .*independently/)
    expect(marking).toHaveTextContent(/A person at GWTH .*any mark in doubt/)
    expect(marking).toHaveTextContent("provisional mark")
    expect(marking).toHaveTextContent("within 7 days")
    expect(marking).toHaveTextContent("exactly what to fix")
    expect(marking).toHaveTextContent("up to three times")
    expect(marking.textContent).not.toMatch(/tutor|teacher|assessor|examiner|grade|Merit|Distinction|[—–§]/i)
    expect(marking.querySelector("a, button")).toBeNull()
    expect(marking.previousElementSibling).toContainElement(screen.getByTestId("proof-portfolio"))
    if (showScore) {
      expect(marking).toHaveTextContent("All three projects are marked")
      expect(marking.nextElementSibling).toHaveAttribute("data-section", "score")
    } else {
      expect(marking).toHaveTextContent("All three projects will be marked")
      expect(marking).toHaveTextContent("Your feedback will quote")
      expect(marking).toHaveTextContent("Two AI markers will mark")
      expect(marking).toHaveTextContent("A person at GWTH will check")
      expect(marking).toHaveTextContent("your best mark will count")
      expect(proof.textContent).not.toMatch(/already marked|(?:are|is|have been|has been) marked|you get|you see|mark counts/i)
    }
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
    expect(offer).toHaveTextContent(/After three months, your monthly plan continues at £7\.50 a month for access to the updated lessons unless you cancel/)
    expect(offer).toHaveTextContent(/If you paid once for a pass, your access to the course lessons stops/)
    expect(offer).toHaveTextContent(/You only pay again if you choose to subscribe/)
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

  it.each(["on", "off"])("offers the free lesson before sales open, with private content %s", (mode) => {
    process.env.PRIVATE_CONTENT_MODE = mode
    const { container } = render(<HomeNext />)
    const price = within(container.querySelector<HTMLElement>('[data-section="price"]')!)
    expect(price.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/terms#course-months", "/waitlist", "/start-here",
    ])
    expect(price.getByRole("link", { name: "Try the free lesson" })).toHaveAttribute("href", "/start-here")
    expect(price.queryByRole("link", { name: "Try a free lab" })).not.toBeInTheDocument()
  })

  it("keeps the purchase and gift buttons when selling", () => {
    const { container } = render(<HomeNext selling />)
    const price = within(container.querySelector<HTMLElement>('[data-section="price"]')!)
    expect(price.getByRole("link", { name: "Buy it for yourself" })).toHaveAttribute("href", "/pricing")
    expect(price.getByRole("link", { name: "Give it as a gift" })).toHaveAttribute("href", "/gift")
    expect(price.queryByRole("link", { name: "Try the free lesson" })).not.toBeInTheDocument()
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

describe("lesson order and checking UK answers", () => {
  it("describes film, reading, project and end-of-lesson questions in order", () => {
    const { container } = render(<HomeNext />)
    const lesson = within(container.querySelector<HTMLElement>('[data-section="lesson"]')!)
    const steps = lesson.getAllByRole("listitem")
    expect(steps.map((step) => within(step).getByRole("heading").textContent)).toEqual([
      "Watch a short film", "Read the lesson", "Do the project, then answer questions",
    ])
    expect(steps[0]).toHaveTextContent("Get an introduction to the subject.")
    expect(steps[1]).toHaveTextContent("Work through the lesson over several pages.")
    expect(steps[2]).toHaveTextContent("Put what you have learnt into practice. Then answer the end-of-lesson questions in a quiz with a pass mark.")
    expect(container.querySelector('[data-section="lesson"]')).not.toHaveTextContent(/as you go/i)
    expect(lesson.getByText(/three monthly parts/)).toHaveTextContent(
      "The course has three monthly parts, with about five hours of work a week."
    )
    expect(container.querySelector('[data-section="lesson"]')).not.toHaveTextContent(/Start with a short film/)
    expect(lesson.getAllByRole("link")).toHaveLength(1)
    expect(lesson.getByRole("link", { name: "Try the free lesson" })).toHaveAttribute("href", "/start-here")
    expect(container.querySelector('[data-section="lesson"]')).not.toHaveTextContent(/demo|instant|Every lesson is built around a project/i)
  })

  it("explains checking sources without assuming a workplace or specialist knowledge", () => {
    const { container } = render(<HomeNext />)
    const uk = container.querySelector<HTMLElement>('[data-section="uk"]')!
    expect(within(uk).getByRole("heading", { name: "Check where the answer comes from" })).toBeInTheDocument()
    expect(uk).toHaveTextContent(
      "AI can give you an answer based on another country's rules. Ask where the information comes from. Before you act, check a trusted UK source, such as GOV.UK for government information."
    )
    expect(uk).not.toHaveTextContent(/regulator|employer's policy/)
  })
})
