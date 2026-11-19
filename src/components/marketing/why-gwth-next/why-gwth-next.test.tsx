import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { WhyGwthNext } from "./why-gwth-next"
import { WhyGwthFde } from "@/components/marketing/why-gwth-fde/why-gwth-fde"
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE } from "@/lib/config"
import { ukFigure, ukFigureSource } from "@/lib/data/uk-ai-context"

/**
 * The rebuilt Why GWTH page (19 Nov 2026). David on the page it replaces:
 * "It's okay, but I think we can lay this out in a much more interesting
 * way." The layout is new; the facts are not. These tests hold the new page
 * to every point the old page's suite held (`why-gwth-fde.test.tsx`), plus
 * the founder's note word for word against the old component, so a layout
 * change can never quietly change what is claimed.
 *
 * Assertions are on MEANING, so the wording can still be improved.
 */

afterEach(cleanup)

/** Everything a reader can read, whitespace normalised. */
function pageText(root: ParentNode = document.body): string {
  return (root.textContent ?? "").replace(/\s+/g, " ").trim()
}

/** Occurrences of a literal string in the page text. */
function count(needle: string): number {
  return pageText().split(needle).length - 1
}

function section(container: HTMLElement, name: string): HTMLElement {
  const el = container.querySelector(`[data-section="${name}"]`)
  if (!el) throw new Error(`no section "${name}"`)
  return el as HTMLElement
}

describe("Why GWTH page structure", () => {
  it("builds the argument in order: question, name, how we teach, what you make, UK, evidence, founder, price, join", () => {
    const { container } = render(<WhyGwthNext />)
    const order = Array.from(container.querySelectorAll("[data-section]")).map(
      (el) => el.getAttribute("data-section")
    )
    expect(order).toEqual([
      "masthead",
      "name",
      "reasons",
      "build",
      "uk",
      "government",
      "founder",
      "price",
      "closing",
    ])
  })

  it("has exactly one h1, and it names the page", () => {
    render(<WhyGwthNext />)
    const h1s = screen.getAllByRole("heading", { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent(/why learn ai with gwth/i)
  })

  it("never skips a heading level", () => {
    const { container } = render(<WhyGwthNext />)
    const levels = Array.from(
      container.querySelectorAll("h1, h2, h3, h4, h5, h6")
    ).map((h) => Number(h.tagName.slice(1)))
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]! - levels[i - 1]!, `heading ${i}`).toBeLessThanOrEqual(1)
    }
  })

  it("says what the name stands for, and no other expansion", () => {
    const { container } = render(<WhyGwthNext />)
    const name = pageText(section(container, "name"))
    expect(name).toContain("GWTH stands for Growth With Tech and Humans")
    expect(pageText()).not.toMatch(/grow with the help|growth with the help/i)
  })

  it("reads cleanly: no doubled article left over from an edit", () => {
    render(<WhyGwthNext />)
    expect(pageText()).not.toMatch(/\b(the|a|an) (the|a|an)\b/i)
  })

  it("renders no video placeholder: the video is made later", () => {
    const { container } = render(<WhyGwthNext />)
    expect(container.querySelector("video, iframe, [data-video]")).toBeNull()
    expect(pageText()).not.toMatch(/coming soon|video (will|goes)/i)
  })

  it("keeps the government comparison to ONE section", () => {
    const { container } = render(<WhyGwthNext />)
    const withBoost = Array.from(container.querySelectorAll("section")).filter(
      (s) => /AI Skills Boost/.test(s.textContent ?? "")
    )
    expect(withBoost).toHaveLength(1)
    expect(withBoost[0]!.getAttribute("data-section")).toBe("government")
  })

  it("gives every reason its own heading", () => {
    const { container } = render(<WhyGwthNext />)
    const reasons = Array.from(container.querySelectorAll("[data-reason]"))
    expect(reasons.map((el) => el.getAttribute("data-reason"))).toEqual([
      "plain-english",
      "clear-route",
      "independent",
      "up-to-date",
      "hands-on",
      "what-you-build",
      "proof",
      "optional-lessons",
      "price",
    ])
  })

  it("has no eyebrow, pill or decorative label above a headline", () => {
    const source = readFileSync(
      join(__dirname, "why-gwth-next.module.css"),
      "utf8"
    )
    expect(source).not.toMatch(/border-radius:\s*(999|9999)px/)
    expect(source).not.toMatch(/text-transform:\s*uppercase;\s*\n\s*letter-spacing/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/gradient\(|box-shadow:\s*0 /)
  })
})

describe("David's points from the writing rounds", () => {
  it("states each price once, simply, with no totals", () => {
    render(<WhyGwthNext />)
    expect(COURSE_MONTHLY_PRICE).toBe(29)
    expect(ONGOING_MONTHLY_PRICE).toBe(7.5)
    expect(count("£29")).toBe(1)
    expect(count("£7.50")).toBe(1)
    expect(count("£69")).toBe(1)
    // "We don't need to know how much three times twenty nine is."
    expect(pageText()).not.toMatch(/£87|£\s?1 an hour|under £1|per hour/i)
  })

  it("says the course never really ends because it is always updated", () => {
    render(<WhyGwthNext />)
    expect(pageText()).toMatch(/course doesn.t end, because we keep updating it/i)
  })

  it("never makes the claims David ruled out", () => {
    render(<WhyGwthNext />)
    const text = pageText()
    expect(text).not.toMatch(/100x|100 times cheaper/i)
    expect(text).not.toMatch(/free trial|start free|no card/i)
  })

  it("names every optional-lesson field, since people look for their own", () => {
    const { container } = render(<WhyGwthNext />)
    const text = pageText(
      container.querySelector('[data-reason="optional-lessons"]') as HTMLElement
    ).toLowerCase()
    for (const field of [
      "(hr)",
      "human resources",
      "finance",
      "medicine",
      "law",
      "logistics",
      "marketing",
      "sales",
      "local ai",
      "advanced ai-assisted coding",
      "hardware that uses ai",
      "ai transformation expert",
    ]) {
      expect(text, field).toContain(field)
    }
  })

  it("says you never need to code, and who writes the code", () => {
    render(<WhyGwthNext />)
    expect(pageText()).toMatch(/never need to know how to code/i)
    expect(pageText()).toMatch(
      /AI writes the code, and we show you how to direct it and check it/i
    )
  })

  it("calls the savings tracker a fun tracker, not a reason to sign up", () => {
    render(<WhyGwthNext />)
    expect(pageText()).toMatch(/a fun tracker/i)
  })

  it("says why, not only what: independence, updates, practicals and proof", () => {
    const { container } = render(<WhyGwthNext />)
    const reason = (id: string) =>
      pageText(container.querySelector(`[data-reason="${id}"]`) as HTMLElement)
    expect(reason("independent")).toMatch(/nobody pays us to recommend/i)
    expect(reason("independent")).toMatch(/no sponsors and no deals with AI companies/i)
    expect(reason("up-to-date")).toMatch(/stopped using/i)
    expect(reason("hands-on")).toMatch(/learn to use AI by using it/i)
    expect(reason("proof")).toMatch(
      /show to anyone who wants to see what you can do/i
    )
  })

  it("keeps the recovered ideas: why a record must be current, and why a course beats a chatbot alone", () => {
    render(<WhyGwthNext />)
    const body = pageText()
    // C06
    expect(body).toMatch(/certificate from six months ago/i)
    expect(body).toMatch(/what they can do today/i)
    expect(body).toMatch(/every lesson leaves you with real work/i)
    // C07
    expect(body).toMatch(/teaching yourself with a chatbot/i)
    expect(body).toMatch(/may not yet know what to ask/i)
  })

  it("never uses an em dash, an en dash or a section sign, in text, alt text or labels", () => {
    const { container } = render(<WhyGwthNext selling showScore />)
    expect(pageText()).not.toMatch(/[—–§]/)
    for (const el of Array.from(container.querySelectorAll("[alt], [aria-label]"))) {
      const words = `${el.getAttribute("alt") ?? ""} ${el.getAttribute("aria-label") ?? ""}`
      expect(words).not.toMatch(/[—–§]/)
    }
  })

  it("describes who GWTH is for by purpose, never by age", () => {
    render(<WhyGwthNext />)
    expect(pageText()).not.toMatch(
      /for adults|working adults|adult learners|young adults|\(16\+\)/i
    )
  })

  it("names no AI model version and dates no check", () => {
    render(<WhyGwthNext />)
    const text = pageText()
    expect(text).not.toMatch(/GPT|Claude|Gemini|Opus|Sonnet|Sol \d/i)
    expect(text).not.toMatch(/as of|last checked|at the time of writing|correct as/i)
  })
})

describe("Why GWTH sign-up", () => {
  /**
   * David: "The call to action should be to sign up on the Why GWTH page. We
   * don't want to send them back to the lab to procrastinate further". From
   * 14 December joining starts on /pricing. Before it, the waitlist, with the
   * free lesson (/start-here) beside it as on the home page.
   */
  it("asks the visitor to join once sales open, and never sends them to a lab", () => {
    const { container } = render(<WhyGwthNext selling />)
    const closing = section(container, "closing")
    const join = within(closing).getByRole("link", { name: "Join the course" })
    expect(join).toHaveAttribute("href", "/pricing")
    const others = within(closing)
      .getAllByRole("link")
      .filter((a) => a !== join)
      .map((a) => a.getAttribute("href"))
    expect(others).toEqual(["/gift"])
    const hero = section(container, "masthead")
    expect(
      within(hero).getByRole("link", { name: "Join the course" })
    ).toHaveAttribute("href", "/pricing")
  })

  it("sends the button to the waitlist before sales open, with the free lesson beside it", () => {
    const { container } = render(<WhyGwthNext />)
    for (const name of ["masthead", "closing"]) {
      const links = within(section(container, name)).getAllByRole("link")
      expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
        ["Join the waitlist", "/waitlist"],
        ["Try the free lesson", "/start-here"],
      ])
    }
    expect(screen.queryByRole("link", { name: /gift/i })).toBeNull()
  })

  it("links nowhere a visitor could open course lessons, in either state", () => {
    for (const selling of [false, true]) {
      cleanup()
      const { container } = render(<WhyGwthNext selling={selling} />)
      const internal = Array.from(container.querySelectorAll("a"))
        .map((a) => a.getAttribute("href") ?? "")
        .filter((href) => href.startsWith("/"))
      const allowed = selling
        ? ["/pricing", "/start-here", "/gift"]
        : ["/waitlist", "/start-here", "/pricing"]
      for (const href of internal) expect(allowed, href).toContain(href)
      expect(internal).not.toContain("/labs")
      expect(internal).not.toContain("/for-teams")
    }
  })
})

describe("What the old About page brought", () => {
  it("keeps the founder note word for word", () => {
    const next = render(<WhyGwthNext />)
    const note = pageText(screen.getByTestId("founder-note"))
    next.unmount()
    render(<WhyGwthFde />)
    const original = pageText(screen.getByTestId("founder-note"))
    expect(note).toBe(original)
  })

  it("keeps the founder's own points, and names no employer, client or product", () => {
    render(<WhyGwthNext />)
    const note = pageText(screen.getByTestId("founder-note"))
    expect(note).toMatch(/25 years/)
    expect(note).toMatch(/solution architect/i)
    expect(note).toMatch(/most of the supermarkets/i)
    expect(note).toMatch(/children, friends and grandparents/i)
    expect(note).toMatch(/heads of large companies/i)
    expect(note).toMatch(/people who make the difference, not the technology/i)
    expect(note).not.toMatch(/Quick|Amazon|AWS|Tesco|Sainsbury/)
  })

  it("says the founder's closing lesson once, not again as a pull quote", () => {
    render(<WhyGwthNext />)
    expect(count("people who make the difference")).toBe(1)
  })

  it("keeps the UK worked examples", () => {
    const { container } = render(<WhyGwthNext />)
    const uk = pageText(section(container, "uk"))
    for (const example of [
      /NHS letters and appointments/,
      /council and benefits forms/i,
      /workplace pensions/i,
      /Self Assessment tax return/,
      /school admissions/i,
      /UK employment rules/,
    ]) {
      expect(uk).toMatch(example)
    }
    expect(uk).toMatch(/right in another country can be wrong here/i)
  })

  it("promises no credential, and the proof is the work", () => {
    const { container } = render(<WhyGwthNext showScore={false} />)
    const text = pageText()
    expect(text).not.toMatch(/beta/i)
    expect(text).not.toMatch(/credential/i)
    const proof = pageText(
      container.querySelector('[data-reason="proof"]') as HTMLElement
    )
    expect(proof).toMatch(/the proof GWTH gives you is the work itself/i)
  })

  it("mentions the score only when the score flag is on, in the home page's words", () => {
    render(<WhyGwthNext showScore={false} />)
    expect(screen.queryByTestId("why-score")).toBeNull()
    expect(pageText()).not.toMatch(/GWTH score/i)
    cleanup()
    render(<WhyGwthNext showScore />)
    expect(pageText(screen.getByTestId("why-score"))).toMatch(
      /a number out of 100\. It combines the core lessons you.ve passed, your quiz results and your best marks for the three monthly projects/i
    )
  })

  it("gives the pay-once offer beside the monthly price, and when the later months open", () => {
    render(<WhyGwthNext />)
    const monthly = pageText(screen.getByTestId("price-monthly"))
    expect(monthly).toMatch(/£29 a month for course access, from 14 December 2026/)
    expect(monthly).toMatch(/You can stop at any time/)
    expect(monthly).toMatch(/continues at £7\.50 a month unless you cancel/)
    const once = pageText(screen.getByTestId("price-once"))
    expect(once).toMatch(
      /£69 once for the whole three-month course, for yourself or as a gift, if you buy between 14 December 2026 and 6 January 2027/
    )
    // What happens when a pass ends (the home page's protective sentence).
    expect(once).toMatch(/never renews/i)
    expect(once).toMatch(
      /access to the course lessons stops, and you only pay again if you choose to subscribe/i
    )
    const fields = pageText(
      document.querySelector('[data-reason="optional-lessons"]') as HTMLElement
    )
    expect(fields).toMatch(
      /Month 2 around 1 January 2027 and Month 3 around 1 February 2027/
    )
    expect(fields).not.toMatch(/being written now|today/)
  })

  it("presents no paraphrase as a direct quotation, and links each article", () => {
    const { container } = render(<WhyGwthNext />)
    const gov = section(container, "government")
    expect(container.querySelector("blockquote")).toBeNull()
    expect(pageText()).not.toMatch(/[“”"]/)
    const links = Array.from(gov.querySelectorAll("figure a"))
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link.getAttribute("href")).toMatch(/^https:\/\//)
      expect(link.getAttribute("rel")).toMatch(/noopener/)
    }
  })

  it("prints every UK figure from the shared module, scoped, with its source linked", () => {
    const { container } = render(<WhyGwthNext />)
    const figures = Array.from(
      container.querySelectorAll<HTMLElement>("[data-uk-figure]")
    )
    expect(figures.map((el) => el.getAttribute("data-uk-figure"))).toEqual([
      "worker-confidence",
      "business-adoption",
      "business-adoption-2023",
      "adoption-depth",
    ])
    const urls = within(screen.getByTestId("why-gwth-sources"))
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"))
    for (const el of figures) {
      const id = el.getAttribute("data-uk-figure")!
      expect(pageText(el)).toBe(ukFigure(id).value)
      expect(urls).toContain(ukFigureSource(id).url)
    }
    const text = pageText()
    expect(text).toMatch(/of UK adults in work say they feel confident using AI at work/)
    expect(text).toMatch(/by a UK business with ten or more staff that has started using AI/)
  })

  it("draws each figure from its own value, hidden from screen readers", () => {
    const { container } = render(<WhyGwthNext />)
    const gov = section(container, "government")
    const solid = gov.querySelectorAll("[aria-hidden] span[data-on]")
    expect(solid).toHaveLength(Number.parseFloat(ukFigure("worker-confidence").value))
    const widths = Array.from(
      gov.querySelectorAll<HTMLElement>("[aria-hidden] span[style*='width']")
    ).map((el) => el.style.width)
    expect(widths).toEqual(["12%", "35%", "100%", "60%"])
  })

  it("keeps the side-by-side table accessible, with a phone layout marked as a duplicate", () => {
    const { container } = render(<WhyGwthNext />)
    const table = within(section(container, "government")).getByRole("table")
    expect(within(table).getAllByRole("columnheader")).toHaveLength(4)
    expect(within(table).getAllByRole("rowheader")).toHaveLength(6)
    expect(container.querySelector("[data-copy-duplicate]")).not.toBeNull()
  })

  it("prints no lesson count, since config and the syllabus disagree on the split", () => {
    render(<WhyGwthNext />)
    expect(pageText()).not.toMatch(/\b(64|66|94)\b/)
  })
})

describe("the pictures", () => {
  it("every picture has a paper file and a night file, and says what it shows", () => {
    const { container } = render(<WhyGwthNext />)
    const images = Array.from(container.querySelectorAll("img"))
    expect(images.length).toBe(12)
    const publicDir = join(__dirname, "..", "..", "..", "..", "public")
    for (const img of images) {
      expect((img.getAttribute("alt") ?? "").length).toBeGreaterThan(40)
      const src = decodeURIComponent(img.getAttribute("src") ?? "")
      const file = src.match(/\/why-gwth\/[a-z-]+\.jpg/)?.[0]
      expect(file, src).toBeTruthy()
      expect(existsSync(join(publicDir, file!)), file).toBe(true)
    }
  })

  it("keeps the slot for the Why GWTH video marked in the source", () => {
    const source = readFileSync(join(__dirname, "why-gwth-next.tsx"), "utf8")
    expect(source).toMatch(/WHY GWTH VIDEO GOES HERE/)
  })
})
