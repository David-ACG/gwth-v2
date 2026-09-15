import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach, beforeEach, vi } from "vitest"
import { HomeFde, MONTHS, SIX_BLOCKS } from "./home-fde"
import { CURRICULUM } from "@/components/marketing/data"

afterEach(cleanup)

/**
 * The gate is a RUNTIME env read (`lib/labs-cta.ts`), and the preview runs it
 * open while production runs it closed, so both states are pinned here.
 * Default to closed, which is the fail-closed production shape.
 */
const ORIGINAL_MODE = process.env.PRIVATE_CONTENT_MODE
beforeEach(() => {
  process.env.PRIVATE_CONTENT_MODE = "on"
})
afterEach(() => {
  if (ORIGINAL_MODE === undefined) delete process.env.PRIVATE_CONTENT_MODE
  else process.env.PRIVATE_CONTENT_MODE = ORIGINAL_MODE
  vi.restoreAllMocks()
})

/** Every href the rendered page points at. */
function hrefs(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("a")).map(
    (a) => a.getAttribute("href") ?? ""
  )
}

/** The page's sections, in document order. */
function sectionOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("[data-section]")).map(
    (el) => el.getAttribute("data-section") ?? ""
  )
}

function sectionText(name: string): string {
  const el = document.querySelector(`[data-section="${name}"]`)
  expect(el, `data-section="${name}"`).toBeTruthy()
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim()
}

describe("HomeFde (paper-first, N12)", () => {
  /**
   * The N9 artboard headline was "The gap is not access. It is depth." David,
   * 2026-09-15 (a-20260915-101927-9ec6a5), asked for the whole page to stop
   * making a beginner decode anything, and that sentence was the page's
   * hardest. The LAYOUT is the approved artboard's and is unchanged; only the
   * words moved.
   */
  it("opens on a headline a beginner reads once", () => {
    render(<HomeFde />)
    const h1 = screen.getByRole("heading", { level: 1 })
    expect(h1).toHaveTextContent("Learn to use AI at work by making things.")
    expect(h1.textContent).not.toMatch(/gap is not access|It is depth/i)
  })

  it("carries a light and a dark render for the six-blocks plate", () => {
    render(<HomeFde />)
    const srcs = (screen.getAllByRole("img") as HTMLImageElement[]).map(
      (img) => img.getAttribute("src") ?? ""
    )
    expect(srcs.some((s) => s.includes("six-blocks.png"))).toBe(true)
    expect(srcs.some((s) => s.includes("six-blocks-dark.png"))).toBe(true)
  })

  it("gives one card per month, named and in order", () => {
    render(<HomeFde />)
    const cards = screen.getAllByTestId("month-card")
    expect(cards).toHaveLength(MONTHS.length)
    expect(cards.map((c) => c.textContent)).toEqual([
      expect.stringContaining("Month 1"),
      expect.stringContaining("Month 2"),
      expect.stringContaining("Month 3"),
    ])
  })

  it("attributes the six blocks to OpenAI's six use case primitives", () => {
    render(<HomeFde />)
    expect(
      screen.getByRole("link", { name: /six common ways of using AI at work/ })
    ).toHaveAttribute("href", expect.stringContaining("openai.com/business/"))
  })

  it("carries no em dashes, en dashes or section signs (bible emdash-policy)", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(/[–—§]/)
  })
})

/**
 * David, 2026-09-15, annotation a-20260915-085703-483d98: *"We are kind of
 * replicating the four institutions page here ... What we need to have on the
 * home page is for individuals, and then ask for institutions and teams to
 * click on a link to go to their own page. The home page needs to be aimed at
 * individuals who are probably going to be the most important type of customer
 * in the end"*.
 *
 * Hierarchy is the deliverable of that annotation, not a wording change, so it
 * is asserted as an order and as a budget rather than as a set of strings.
 */
describe("HomeFde is individual-first", () => {
  it("puts what a learner does before anything addressed to a buyer", () => {
    const { container } = render(<HomeFde />)
    const order = sectionOrder(container)
    expect(order).toEqual([
      "hero",
      "course",
      "months",
      "blocks",
      "organisations",
      "individuals",
    ])
    expect(order.indexOf("course")).toBeLessThan(
      order.indexOf("organisations")
    )
  })

  it("opens on what the course gives one person, not on an audience split", () => {
    render(<HomeFde />)
    const hero = sectionText("hero")
    expect(hero).toMatch(/by making things/i)
    expect(hero).not.toMatch(/professional body|large employer|institution/i)
    expect(hero).not.toMatch(/buying for an organisation/i)
  })

  it("keeps the organisation route to a signpost, not a second sales page", () => {
    render(<HomeFde />)
    const signpost = screen.getByTestId("organisations-signpost")
    // A signpost is short by definition: if it grows past a few sentences it
    // has become the /for-institutions page again.
    const sentences = (signpost.querySelector("p")?.textContent ?? "")
      .split(/(?<=\.)\s+/)
      .filter(Boolean)
    expect(sentences.length).toBeLessThanOrEqual(5)
    expect(signpost.querySelectorAll("p")).toHaveLength(1)
    // And it routes off the page rather than pitching on it.
    const links = within(signpost)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"))
    expect(links).toEqual(["/for-institutions", "/for-teams"])
  })

  it("does not rebuild the institution feature list on the home page", () => {
    const { container } = render(<HomeFde />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/What an institution gets/i)
    expect(text).not.toMatch(/A curated edition/i)
    expect(text).not.toMatch(/Tutor visibility/i)
    expect(text).not.toMatch(/A verified record/i)
  })

  it("closes on the learner", () => {
    const { container } = render(<HomeFde />)
    expect(sectionOrder(container).at(-1)).toBe("individuals")
  })
})

/**
 * David, 2026-09-15, a-20260915-085510-7939bd: *"We should also say large
 * company as well as institution"*.
 */
describe("HomeFde names a large company beside an institution", () => {
  it("says large company wherever it says institution", () => {
    render(<HomeFde />)
    const signpost = sectionText("organisations")
    expect(signpost).toMatch(/large compan(y|ies)/i)
    expect(signpost).toMatch(/professional body/i)
  })

  it("never says institution on this page without a large company beside it", () => {
    const { container } = render(<HomeFde />)
    const sections = Array.from(container.querySelectorAll("[data-section]"))
    for (const section of sections) {
      const text = (section.textContent ?? "").replace(/\s+/g, " ")
      if (!/institution/i.test(text)) continue
      expect(
        /large compan(y|ies)/i.test(text),
        `"institution" with no large company in [data-section="${section.getAttribute(
          "data-section"
        )}"]`
      ).toBe(true)
    }
  })
})

/**
 * David, 2026-09-15, a-20260915-084728-90d41b: *"I don't really like these two
 * lines. It looks too much like the old site. Can we just have one line or no
 * lines"*. Written against "Two ways in / Pick the one that is yours", but the
 * whole page used that pattern, so the pattern is what went.
 */
describe("HomeFde section heads are one line", () => {
  it("gives no section a standfirst line above or beside its title", () => {
    const { container } = render(<HomeFde />)
    for (const head of Array.from(container.querySelectorAll("[class*=sectionHead]"))) {
      expect(head.querySelectorAll("p")).toHaveLength(0)
      expect(head.querySelectorAll("h2")).toHaveLength(1)
    }
  })

  it("has dropped the two-way split heading entirely", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(/Two ways in/i)
    expect(container.textContent).not.toMatch(/Pick the one that is yours/i)
  })
})

/**
 * Plain language. Every string here is one David named as jargon, machine
 * written, or untrue, so each assertion cites the annotation it comes from.
 */
describe("HomeFde plain language and truthfulness", () => {
  it("does not say 'before the room starts' (a-20260915-084911-63447a)", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(/before the room starts/i)
  })

  it("makes no claim about how an institution edition is priced (a-20260915-085041-eaa513)", () => {
    const { container } = render(<HomeFde />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/active learners/i)
    expect(text).not.toMatch(/rather than seats|not seats|per seat/i)
  })

  it("does not say 'worth an hour' (a-20260915-085127-ee0db0)", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(/worth an hour/i)
  })

  it("does not say 'the missing floor' (a-20260915-085153-468599)", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(/missing floor/i)
  })

  /**
   * David, 2026-09-15, a-20260915-101631-6649fd, on the three-figure evidence
   * section: *"This section should move to the institutions part because
   * everything is talking about benefits institutions and companies - not
   * individuals"*. It is gone from here. Its substance was already on
   * /for-institutions before this change (EVIDENCE Figure 01 and Figure 02
   * word for word, and the BASELINE panels for the specialist-day argument),
   * so nothing was copied across and that page was not edited.
   *
   * This supersedes a-20260915-085220-526a43 on THIS page only: the CIPD
   * theme is kept, on the page a professional body actually reads.
   */
  it("carries no employer or institution evidence figures (a-20260915-101631-6649fd)", () => {
    const { container } = render(<HomeFde />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/frontier firms?/i)
    expect(text).not.toMatch(/HR professionals/i)
    expect(text).not.toMatch(/intelligence per worker/i)
    expect(text).not.toMatch(/a one-day course on a specialist subject/i)
    expect(document.querySelector('[data-section="argument"]')).toBeNull()
  })

  it("drops the 'nothing here needs a meeting' section (a-20260915-085746-3e7631)", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(/Nothing here needs a meeting/i)
    expect(container.textContent).not.toMatch(/Learning on your own\?/i)
  })

  it("does not repeat the price in the closing section", () => {
    render(<HomeFde />)
    expect(sectionText("course")).toMatch(/£29 a month/)
    expect(sectionText("individuals")).not.toMatch(/£/)
  })
})

/**
 * David, 2026-09-15, a-20260915-085439-6c8134: *"We need to say something here
 * about building being the really important foundation for almost everything
 * else ... we're concentrating maybe 50% of the course on building."*
 *
 * The emphasis is his and it is on the page. The figure is not: the syllabus
 * was checked first and does not support it. See
 * `GWTH-launch-plan/completion/home-annotations-round2/curriculum-check.md`.
 */
describe("HomeFde building emphasis", () => {
  it("names building first and the other five as part of making something", () => {
    const { container } = render(<HomeFde />)
    const lead = screen.getByTestId("blocks-lead")
    expect(lead.textContent).toMatch(/^Every month here is built around making something/)
    expect(lead.textContent).toMatch(/each project brings several of the six blocks together/i)
    const cards = container.querySelectorAll('[data-testid="block-card"]')
    expect(
      lead.compareDocumentPosition(cards[0]!) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  /**
   * The old lead is the sentence the public-writing skill names as an example
   * of the habit to delete (a-20260915-101927-9ec6a5).
   */
  it("no longer asks the reader to decode a metaphor", () => {
    render(<HomeFde />)
    const lead = screen.getByTestId("blocks-lead").textContent ?? ""
    expect(lead).not.toMatch(/carries the other five/i)
    expect(lead).not.toMatch(/the one that/i)
  })

  it("makes the claim the curriculum supports: a project in every lesson", () => {
    render(<HomeFde />)
    expect(sectionText("course")).toMatch(
      /Every lesson is built around a project/i
    )
  })

  /**
   * An earlier lead said most Month 2 projects are working software, on the
   * strength of `lessons.metadata.project_title`, which the curriculum check
   * showed is stale. Read from the authored `project.md` files, most Month 2
   * deliverables are a spec, a brief, an audit or a decision note.
   */
  it("does not claim most Month 2 projects are working software", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(
      /most of (them|those) are working software/i
    )
  })

  it("publishes no unverified proportion of the course", () => {
    const { container } = render(<HomeFde />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/50%|half (of )?the course/i)
  })
})

describe("HomeFde six-blocks plate: the key says something", () => {
  it("labels the plate three across, in tile order, one cell per block", () => {
    render(<HomeFde />)
    const cells = screen.getAllByTestId("six-blocks-key-cell")
    expect(cells).toHaveLength(SIX_BLOCKS.length)
    SIX_BLOCKS.forEach((block, i) => {
      expect(cells[i]!.textContent).toContain(block.name)
    })
  })

  it("gives every name a clause, so no cell is a bare category word", () => {
    render(<HomeFde />)
    const cells = screen.getAllByTestId("six-blocks-key-cell")
    SIX_BLOCKS.forEach((block, i) => {
      expect(block.clause.length).toBeGreaterThan(0)
      expect(block.clause).not.toBe(block.name)
      expect(cells[i]!.textContent).toContain(block.clause)
    })
  })

  it("makes the flagship point under the plate, not a list of categories", () => {
    render(<HomeFde />)
    const caption = screen.getByText(/Six ways of working, not six subjects/)
    expect(caption.textContent).toMatch(/every one of them/)
    expect(caption.textContent).toMatch(/on your own work/)
  })
})

/**
 * David, 2026-09-14, annotation a-20260914-193923-87ad97: a walkthrough costs
 * him an hour and is worth it only for a large organisation. Since 2026-09-15
 * the institution pitch is not on the home page at all, so neither is the
 * walkthrough: it is offered where a large buyer arrives, on
 * `/for-institutions`, and the shared nav already serves the waitlist here.
 */
describe("HomeFde offers no walkthrough", () => {
  it("carries no walkthrough call to action anywhere on the page", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(/walkthrough/i)
    expect(hrefs(container)).not.toContain("/contact")
  })
})

describe("HomeFde self-service promises match the product", () => {
  /**
   * There is no live checkout: `/api/stripe/checkout` answers 503 unless
   * BILLING_ENABLED is set, and /signup is invite-only under the fail-closed
   * content gate. The page may therefore point at the waitlist and say what it
   * does; it may not tell anybody to buy.
   */
  it("never claims an instant purchase, and links the waitlist instead", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(
      /buy now|start today|enrol now|checkout|pay now|sign up now/i
    )
    expect(hrefs(container)).toContain("/waitlist")
    expect(sectionText("course")).toMatch(
      /Leave a name and an email and we will write to you when the next intake opens/i
    )
  })

  it("quotes the canonical prices and the stop-any-time terms, once", () => {
    render(<HomeFde />)
    const course = sectionText("course")
    expect(course).toMatch(/£29 a month while the teaching runs/)
    expect(course).toMatch(/£7\.50 a month keeps your access/)
    expect(course).toMatch(/cancel at any time/)
  })

  it("gives the learner no call, no demo and no sales conversation", () => {
    render(<HomeFde />)
    expect(sectionText("course")).toMatch(
      /No call, no demo, no sales conversation/
    )
  })

  it("points only at routes that exist", () => {
    const { container } = render(<HomeFde />)
    const internal = hrefs(container).filter((h) => h.startsWith("/"))
    const known = new Set([
      "/waitlist",
      "/pricing",
      "/lessons",
      "/labs",
      "/for-institutions",
      "/for-teams",
      "/why-gwth",
    ])
    for (const href of internal) {
      expect(known.has(href), `unexpected internal href ${href}`).toBe(true)
    }
  })

  it("offers a free lab only while /labs is public", () => {
    process.env.PRIVATE_CONTENT_MODE = "on"
    const closed = render(<HomeFde />)
    expect(hrefs(closed.container)).not.toContain("/labs")
    expect(
      within(
        document.querySelector('[data-section="course"]') as HTMLElement
      ).getByRole("link", { name: "See pricing" })
    ).toBeTruthy()
    cleanup()

    process.env.PRIVATE_CONTENT_MODE = "off"
    const open = render(<HomeFde />)
    expect(hrefs(open.container)).toContain("/labs")
    expect(
      within(
        document.querySelector('[data-section="course"]') as HTMLElement
      ).getByRole("link", { name: "Try a free lab" })
    ).toBeTruthy()
  })
})

/**
 * David, 2026-09-14, a-20260914-211946-e561e2: the paragraph "seems to get
 * weaker and weaker as it gets towards the end". And 2026-09-15,
 * a-20260915-084515-b9ff47, on its replacement: *"I don't like worked through
 * on your own tasks from the first week. That's kind of difficult to
 * understand ... I think this should probably be lower down on the page, and
 * we should concentrate more on what the course is providing at the very top"*.
 *
 * These are not style preferences. Each one pins a specific thing a previous
 * version of this paragraph did.
 */
describe("HomeFde standfirst", () => {
  const standfirst = () => {
    render(<HomeFde />)
    const hero = document.querySelector('[data-section="hero"]') as HTMLElement
    const para = hero.querySelector("p") as HTMLElement
    expect(para).toBeTruthy()
    return (para.textContent ?? "").replace(/\s+/g, " ").trim()
  }

  it("does not end on a phrase that names nothing", () => {
    expect(standfirst()).not.toMatch(/before your own training lands/i)
  })

  it("does not claim GWTH closes a widening skills gap by itself", () => {
    const text = standfirst()
    expect(text).not.toMatch(/widening/i)
    expect(text).not.toMatch(/foundation that closes it/i)
  })

  it("drops the noun stack David could not parse", () => {
    expect(standfirst()).not.toMatch(
      /worked through on your own tasks from the first week/i
    )
  })

  it("moves the audience routing off the top of the page", () => {
    const text = standfirst()
    expect(text).not.toMatch(/small team/i)
    expect(text).not.toMatch(/professional body/i)
    expect(text).not.toMatch(/large employer/i)
  })

  it("ends on the most concrete sentence in the paragraph", () => {
    const last = standfirst().split(/(?<=\.)\s+/).filter(Boolean).pop() ?? ""
    expect(last).toMatch(/CV/)
    expect(last).toMatch(/spreadsheet/)
    expect(last).toMatch(/assistant/)
    // m1_l17 produces a decision note holding a chart, not a dashboard, so the
    // page no longer promises one. GPT-5.6 Sol caught this independently.
    expect(last).not.toMatch(/dashboard/)
  })

  it("keeps every sentence short enough to read once", () => {
    for (const sentence of standfirst().split(/(?<=\.)\s+/).filter(Boolean)) {
      expect(sentence.split(/\s+/).length).toBeLessThanOrEqual(26)
    }
  })

  it("carries no em dash, en dash or section sign", () => {
    expect(standfirst()).not.toMatch(/[–—§]/)
  })
})

/**
 * David, 2026-09-15, a-20260915-101324-6aa90f: *"Can we add that this gets
 * gradually more complex as the course progresses? So you move from simpler
 * projects like the ones you gave examples for to more advanced projects in
 * month two and give examples and then even more Complex in month three,
 * where you're talking about whole company transformation And give examples
 * for this as well"*.
 *
 * The progression is the deliverable, so it is asserted as a shape: the hero
 * says it in one line, the examples are a section of their own, and Month 3 is
 * about an organisation rather than a person. Every example in MONTHS is
 * traced to an authored `content/project.md` in the component's file header;
 * none of it comes from the stale `lessons.metadata.project_title`.
 */
describe("HomeFde three-month progression", () => {
  it("says in the hero that the work grows, without listing three months there", () => {
    render(<HomeFde />)
    const hero = sectionText("hero")
    expect(hero).toMatch(/projects get bigger every month/i)
    expect(hero).not.toMatch(/Month 2/i)
    expect(hero).not.toMatch(/Month 3/i)
  })

  it("moves from one person in Month 1 to an organisation in Month 3", () => {
    render(<HomeFde />)
    const [one, two, three] = screen.getAllByTestId("month-card")
    expect(one!.textContent).toMatch(/your CV and your LinkedIn profile/i)
    expect(two!.textContent).toMatch(/AskMyCo/)
    expect(two!.textContent).toMatch(/FractionalBuddy/)
    expect(three!.textContent).toMatch(/how an organisation works as a whole/i)
    expect(three!.textContent).toMatch(/twelve areas of its work/i)
  })

  it("reads the Month 1 capstone name from the canonical curriculum", () => {
    render(<HomeFde />)
    const [one] = screen.getAllByTestId("month-card")
    expect(one!.textContent).toContain(CURRICULUM[0]!.capstone)
    expect(one!.textContent).not.toContain("{CAPSTONE}")
  })

  /**
   * `m3_l30` produces a one-page infrastructure plan, not a deployment, so the
   * page no longer says a learner runs an assistant on a company's machines.
   */
  it("makes no Month 3 claim the authored lessons do not carry", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(/on a company's own computers/i)
  })
})
