import { cleanup, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { CONSENT_LINE } from "@/lib/start-here/consent-wording"
import { NEEDS, STEPS, StartHereNext, outcomes } from "./start-here-next"

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined }),
}))

afterEach(cleanup)

const CSS = readFileSync(join(__dirname, "start-here-next.module.css"), "utf8")
const REVEAL_CSS = readFileSync(join(__dirname, "reveal.module.css"), "utf8")

function pageText(container: HTMLElement) {
  return (container.textContent ?? "").replace(/\s+/g, " ")
}

describe("StartHereNext, the free lesson's front door", () => {
  it("keeps the lesson's title as the one h1 and marks the page as locked", () => {
    render(<StartHereNext />)
    const h1 = screen.getAllByRole("heading", { level: 1 })
    expect(h1).toHaveLength(1)
    expect(h1[0]).toHaveTextContent("Start Here")
    expect(h1[0]).toHaveTextContent("The tips we wish we'd had when we started")
    expect(screen.getByTestId("start-here")).toHaveAttribute("data-state", "locked")
  })

  it("says it is free, how long it takes and who it is for", () => {
    const { container } = render(<StartHereNext />)
    const text = pageText(container)
    expect(text).toContain("free first lesson of the GWTH course")
    expect(text).toContain("new to AI, or have tried it a few times")
    expect(text).toContain("Under an hour")
    expect(text).toContain("about 50 minutes in all")
    expect(text).toContain("we don't ask for card details")
  })

  it("sets out the three steps in the order the open lesson shows them", () => {
    render(<StartHereNext />)
    const steps = screen.getAllByTestId("start-here-step")
    expect(steps.map((s) => within(s).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Watch a short film",
      "Read the lesson",
      "Do the project",
    ])
    expect(STEPS.map((s) => s.time)).toEqual(["About 2 minutes", "20 to 25 minutes", "About 25 minutes"])
  })

  it("does not promise end-of-lesson questions in the free lesson itself", () => {
    // The open lesson is a film, the lesson and a project. Questions belong to
    // the course's lessons, and the page says so in those words.
    for (const step of STEPS) expect(`${step.title} ${step.body}`).not.toMatch(/question|quiz/i)
    const { container } = render(<StartHereNext />)
    expect(pageText(container)).toContain("Every lesson in the course follows the same order")
  })

  it("lists the lesson's own seven outcomes, read from the lesson", () => {
    render(<StartHereNext />)
    const list = screen.getByTestId("start-here-outcomes")
    const items = within(list).getAllByRole("listitem")
    expect(outcomes()).toHaveLength(7)
    expect(items).toHaveLength(7)
    outcomes().forEach((line, index) => expect(items[index]).toHaveTextContent(line))
  })

  it("says what you need, from the project's own list", () => {
    const { container } = render(<StartHereNext />)
    const text = pageText(container)
    expect(NEEDS).toHaveLength(3)
    expect(text).toContain("Windows computer or a Mac")
    expect(text).toContain("A phone or tablet works too")
    expect(text).toContain("A free account with one AI tool")
    expect(text).toContain("You don't need coding experience")
  })

  it("offers the email step twice, through the untouched gate, with the consent wording beside it", () => {
    render(<StartHereNext />)
    const buttons = screen.getAllByTestId("start-here-open")
    expect(buttons).toHaveLength(2)
    for (const button of buttons) expect(button).toHaveTextContent("Get the free lesson by email")
    // The gate's pop-ups are on the page, each with its own form.
    expect(screen.getAllByTestId("start-here-dialog")).toHaveLength(2)
    expect(screen.getByTestId("start-here-consent-summary")).toHaveTextContent(CONSENT_LINE)
    expect(
      within(screen.getByTestId("start-here-consent-summary")).getByRole("link", { name: "Privacy notice" })
    ).toHaveAttribute("href", "/privacy")
  })

  it("shows a message about a link that no longer works, as a status", () => {
    render(<StartHereNext notice="That link doesn't work any more." />)
    expect(screen.getByRole("status")).toHaveTextContent("That link doesn't work any more.")
  })

  it("shows no status message when there is nothing to say", () => {
    render(<StartHereNext />)
    expect(screen.queryByRole("status")).toBeNull()
  })

  it("adds no link into the course lessons", () => {
    const { container } = render(<StartHereNext />)
    const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"))
    expect(hrefs.sort()).toEqual(["#inside", "/privacy", "/privacy", "/privacy"].sort())
  })

  it("uses no em dash, en dash or section sign, and names no model version", () => {
    const { container } = render(<StartHereNext />)
    const text = pageText(container)
    expect(text).not.toMatch(/[–—§]/)
    expect(text).not.toMatch(/GPT-?\d|Opus|Sonnet|Gemini \d/)
  })

  it("has no eyebrow above a headline: every section opens on its heading", () => {
    const { container } = render(<StartHereNext />)
    for (const section of container.querySelectorAll("section")) {
      const heading = section.querySelector("h1, h2")
      expect(heading, section.getAttribute("data-section") ?? "").not.toBeNull()
      expect(heading!.previousElementSibling).toBeNull()
    }
  })

  it("gives the picture alt text that names its three labels", () => {
    render(<StartHereNext />)
    const pictures = screen.getAllByAltText(/Watch the film, Read the lesson, Do the project/)
    expect(pictures).toHaveLength(2) // the paper render and its dusk twin
    expect(pictures[0]!.getAttribute("src")).toContain("small-pages")
  })
})

describe("the stylesheets", () => {
  it("use only tokens for colour: no raw hex and no rgb()", () => {
    for (const css of [CSS, REVEAL_CSS]) {
      const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "")
      expect(stripped).not.toMatch(/#[0-9a-f]{3,8}\b/i)
      expect(stripped).not.toMatch(/rgba?\(/)
    }
  })

  it("only ever hides a block inside the motion-welcome media query", () => {
    const stripped = REVEAL_CSS.replace(/\/\*[\s\S]*?\*\//g, "")
    const outside = stripped.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*\}\s*$/, "")
    expect(outside).not.toMatch(/opacity:\s*0/)
    expect(stripped).toMatch(/@media \(prefers-reduced-motion: no-preference\)/)
  })
})

describe("the /start-here route, before the email step", () => {
  it("renders the new front door and keeps its metadata", async () => {
    const { default: StartHerePage, metadata } = await import("@/app/(public)/start-here/page")
    render(await StartHerePage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByTestId("start-here")).toHaveAttribute("data-state", "locked")
    expect(screen.getAllByTestId("start-here-step")).toHaveLength(3)
    expect(screen.queryByTestId("start-here-lesson")).toBeNull()
    expect(metadata.title).toBe("Start Here: a free GWTH lesson")
  })

  it("passes on the message for a link that no longer works", async () => {
    const { default: StartHerePage } = await import("@/app/(public)/start-here/page")
    render(await StartHerePage({ searchParams: Promise.resolve({ link: "invalid" }) }))
    expect(screen.getByRole("status")).toHaveTextContent(
      "That link doesn't work any more. Enter your email address again and we'll send you a new one."
    )
  })
})
