import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { WhyGwthFde } from "./why-gwth-fde"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"

/**
 * The merged Why GWTH page (2026-09-28). David: "merge them into one Why GWTH
 * page". The option he picked: "Merge them into one Why GWTH page at
 * /why-gwth, with the new video at the top and the new text. The government
 * comparison becomes one section, and /about sends people there."
 *
 * Assertions are on MEANING and on the points David made across the writing
 * rounds (recording/produced/writing_levels/why-gwth*, feedback.json), so the
 * wording can still be improved without the suite being rewritten with it.
 */

afterEach(cleanup)

const ORIGINAL_MODE = process.env.PRIVATE_CONTENT_MODE
afterEach(() => {
  if (ORIGINAL_MODE === undefined) delete process.env.PRIVATE_CONTENT_MODE
  else process.env.PRIVATE_CONTENT_MODE = ORIGINAL_MODE
})

/** Everything a reader can read, whitespace normalised. */
function pageText(): string {
  return (document.body.textContent ?? "").replace(/\s+/g, " ").trim()
}

/** Occurrences of a literal string in the page text. */
function count(needle: string): number {
  return pageText().split(needle).length - 1
}

describe("Why GWTH page structure", () => {
  beforeEach(() => {
    process.env.PRIVATE_CONTENT_MODE = "on"
  })

  it("runs heading, reasons, government comparison, UK, founder, sign-up, in that order", () => {
    const { container } = render(<WhyGwthFde />)
    const order = Array.from(container.querySelectorAll("[data-section]")).map(
      (el) => el.getAttribute("data-section")
    )
    expect(order).toEqual([
      "masthead",
      "reasons",
      "government",
      "uk",
      "founder",
      "closing",
    ])
  })

  it("has exactly one h1, and it names the page", () => {
    render(<WhyGwthFde />)
    const h1s = screen.getAllByRole("heading", { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent(/why learn ai with gwth/i)
  })

  it("reads cleanly: no doubled article left over from an edit", () => {
    render(<WhyGwthFde />)
    expect(pageText()).not.toMatch(/\b(the|a|an) (the|a|an)\b/i)
  })

  it("renders no video placeholder: the video is made later", () => {
    const { container } = render(<WhyGwthFde />)
    expect(container.querySelector("video, iframe, [data-video]")).toBeNull()
    expect(pageText()).not.toMatch(/coming soon|video (will|goes)/i)
  })

  it("keeps the government comparison to ONE section", () => {
    const { container } = render(<WhyGwthFde />)
    const withBoost = Array.from(container.querySelectorAll("section")).filter(
      (s) => /AI Skills Boost/.test(s.textContent ?? "")
    )
    expect(withBoost).toHaveLength(1)
    expect(withBoost[0]!.getAttribute("data-section")).toBe("government")
  })

  it("gives every reason its own heading", () => {
    const { container } = render(<WhyGwthFde />)
    const titles = Array.from(container.querySelectorAll("[data-reason] h2")).map(
      (h) => h.textContent ?? ""
    )
    expect(titles.length).toBeGreaterThanOrEqual(8)
    expect(new Set(titles).size).toBe(titles.length)
  })
})

describe("David's points from the writing rounds", () => {
  beforeEach(() => {
    process.env.PRIVATE_CONTENT_MODE = "on"
  })

  it("states each price once, simply, with no totals", () => {
    render(<WhyGwthFde />)
    expect(COURSE_MONTHLY_PRICE).toBe(29)
    expect(ONGOING_MONTHLY_PRICE).toBe(7.5)
    expect(count("£29")).toBe(1)
    expect(count("£7.50")).toBe(1)
    // "We don't need to know how much three times twenty nine is."
    expect(pageText()).not.toMatch(/£87|£\s?1 an hour|under £1|per hour/i)
  })

  it("says the course never really ends because it is always updated", () => {
    render(<WhyGwthFde />)
    expect(pageText()).toMatch(/course doesn.t end, because we keep updating it/i)
  })

  it("never makes the claims David ruled out", () => {
    render(<WhyGwthFde />)
    const text = pageText()
    expect(text).not.toMatch(/100x|100 times cheaper/i)
    expect(text).not.toMatch(/free trial|start free|no card/i)
  })

  it("names every optional-lesson field, since people look for their own", () => {
    render(<WhyGwthFde />)
    const text = pageText()
    for (const field of [
      "HR",
      "finance",
      "medicine",
      "law",
      "logistics",
      "marketing",
      "sales",
      "local AI",
      "advanced AI-assisted coding",
      "hardware that uses AI",
      "AI transformation expert",
    ]) {
      expect(text, field).toContain(field)
    }
  })

  it("says you never need to code", () => {
    render(<WhyGwthFde />)
    expect(pageText()).toMatch(/never need to know how to code/i)
    // David 2026-09-28 (option 1): the claim stays true next to the AI-assisted
    // coding lessons because it says who writes the code.
    expect(pageText()).toMatch(/AI writes the code, and we show you how to direct it and check it/i)
  })

  it("calls the savings tracker a fun tracker, not a reason to sign up", () => {
    render(<WhyGwthFde />)
    expect(pageText()).toMatch(/a fun tracker/i)
  })

  it("says why, not only what: independence, updates, practicals and proof", () => {
    const { container } = render(<WhyGwthFde />)
    const reason = (id: string) =>
      (container.querySelector(`[data-reason="${id}"]`)?.textContent ?? "").replace(/\s+/g, " ")
    expect(reason("independent")).toMatch(/nobody pays us to recommend/i)
    expect(reason("up-to-date")).toMatch(/stopped using/i)
    expect(reason("hands-on")).toMatch(/learn to use AI by using it/i)
    expect(reason("proof")).toMatch(/check that it.s genuine/i)
  })

  it("never uses an em dash, an en dash or a section sign", () => {
    render(<WhyGwthFde />)
    expect(pageText()).not.toMatch(/[—–§]/)
  })
})

describe("Why GWTH sign-up", () => {
  it("asks the visitor to sign up on this page, and never sends them to a lab", () => {
    process.env.PRIVATE_CONTENT_MODE = "off"
    const { container } = render(<WhyGwthFde />)
    const closing = container.querySelector('[data-section="closing"]') as HTMLElement
    const signUp = within(closing).getByRole("link", { name: "Sign up" })
    expect(signUp).toHaveAttribute("href", "/signup")
    // The only other link in the close is for someone buying for a team.
    const others = within(closing)
      .getAllByRole("link")
      .filter((a) => a !== signUp)
      .map((a) => a.getAttribute("href"))
    expect(others).toEqual(["/for-teams"])
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"))
    expect(hrefs).not.toContain("/labs")
  })

  it("sends the button where its label says while registration is closed", () => {
    process.env.PRIVATE_CONTENT_MODE = "on"
    const { container } = render(<WhyGwthFde />)
    const closing = container.querySelector('[data-section="closing"]') as HTMLElement
    const link = within(closing).getByRole("link", { name: "Join the waitlist" })
    expect(link).toHaveAttribute("href", "/waitlist")
  })
})

describe("What the old About page brought", () => {
  beforeEach(() => {
    process.env.PRIVATE_CONTENT_MODE = "on"
  })

  it("keeps the founder note: who writes the course, in his own voice", () => {
    render(<WhyGwthFde />)
    const note = (screen.getByTestId("founder-note").textContent ?? "").replace(/\s+/g, " ")
    expect(note).toMatch(/25 years/)
    expect(note).toMatch(/solution architecture/i)
    expect(note).toMatch(/largest AI providers/i)
    expect(note).toMatch(/children, friends and grandparents/i)
    expect(note).toMatch(/chief executives/i)
  })

  it("keeps the UK worked examples", () => {
    const { container } = render(<WhyGwthFde />)
    const uk = container.querySelector('[data-section="uk"]')?.textContent ?? ""
    expect(uk).toMatch(/NHS/)
    expect(uk).toMatch(/Self Assessment/)
    expect(uk).toMatch(/workplace pensions/i)
  })

  it("is honest that credentials are not switched on during the beta", () => {
    // Must agree with the home page: "No score is switched on while the
    // course is in beta."
    const { container } = render(<WhyGwthFde />)
    const proof = container.querySelector('[data-reason="proof"]')?.textContent ?? ""
    expect(proof).toMatch(/switched on after the beta/i)
  })

  it("prints no lesson count, since config and the syllabus disagree on the split", () => {
    render(<WhyGwthFde />)
    expect(pageText()).not.toMatch(/\b(64|66|94)\b/)
  })
})

describe("the video slot", () => {
  it("is marked in the source for when the video exists", () => {
    const source = readFileSync(join(__dirname, "why-gwth-fde.tsx"), "utf8")
    expect(source).toMatch(/WHY GWTH VIDEO GOES HERE/)
  })
})
