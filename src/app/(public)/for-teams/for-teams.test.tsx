import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import ForTeamsPage from "./page"
import { TOTAL_MANDATORY_LESSONS } from "@/lib/config"

afterEach(cleanup)

/**
 * The component's stylesheet, read as text. The panel repair for
 * a-20260914-200101-e34e36 and the source-note repair for
 * a-20260914-195842-52169b are both CSS, and CSS Modules are stubbed in jsdom,
 * so asserting on the rendered class name proves nothing. These tests read the
 * declarations instead, which is the same technique src/__tests__/paper-first-
 * calm.test.ts uses for the shared register rules.
 */
const CSS = readFileSync(
  join(
    __dirname,
    "../../../components/marketing/for-teams-fde/for-teams-fde.module.css"
  ),
  "utf8"
)
const TSX = readFileSync(
  join(
    __dirname,
    "../../../components/marketing/for-teams-fde/for-teams-fde.tsx"
  ),
  "utf8"
)

/** One `selector { body }` block, comments stripped. */
function rule(selector: string): string {
  const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
  const re = new RegExp(
    `(^|\\})\\s*\\${selector}\\s*\\{([^{}]*)\\}`.replace("\\.", "\\."),
    "m"
  )
  const m = stripped.match(re)
  expect(m, `no rule for ${selector}`).toBeTruthy()
  return m![2] ?? ""
}

/** WCAG 2.1 relative-luminance contrast, so a colour claim is measured. */
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const h = hex.replace("#", "")
    const parts = [0, 2, 4].map((i) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * parts[0]! + 0.7152 * parts[1]! + 0.0722 * parts[2]!
  }
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi! + 0.05) / (lo! + 0.05)
}

/** The measured paper-first values (bible paper-first-tokens). */
const T = {
  bgLight: "#f2f4f3",
  bgDark: "#161d1a",
  surfaceLight: "#ffffff",
  surfaceDark: "#202a26",
  quietLight: "#e6efeb",
  quietDark: "#222d28",
  softLight: "#414b46",
  softDark: "#c8ccc6",
  mutedLight: "#67716b",
  mutedDark: "#949a95",
  lineLight: "#898e8a",
  lineDark: "#6a7570",
  accentLight: "#3f7d6d",
  accentDark: "#b5dbd0",
}

describe("ForTeamsPage", () => {
  it("renders the page heading", () => {
    render(<ForTeamsPage />)
    // Queried by accessible name, not by a single text node: the emphasis in
    // the headline is an <em>, so the words span two nodes (batch 1).
    expect(
      screen.getByRole("heading", { level: 1, name: "AI Training for Your Team" })
    ).toBeInTheDocument()
  }, 10000)

  it("renders the time value section", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText(/The real cost is not the course/)
    ).toBeInTheDocument()
    // Deliberately updated (W26): the page now uses the "£29/mo" form that
    // home and /pricing already use, instead of a third "£29.00/month" form.
    expect(screen.getByText(/£29\/mo per person/)).toBeInTheDocument()
  })

  it("renders the syllabus flexibility section", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("Complete control over what your team learns")
    ).toBeInTheDocument()
    // Read from config rather than hardcoded (W26): the standalone 64 drifted
    // out of step with the per-month numbers once Month 1 became 26.
    expect(
      screen.getAllByText(
        new RegExp(`${TOTAL_MANDATORY_LESSONS} mandatory lessons`)
      ).length
    ).toBeGreaterThanOrEqual(1)
  })

  it("renders the zero wasted time differentiator", () => {
    render(<ForTeamsPage />)
    expect(screen.getByText("Zero wasted time")).toBeInTheDocument()
    expect(
      screen.getAllByText(/No repetition/).length
    ).toBeGreaterThanOrEqual(1)
  })

  it("renders the syllabus choice differentiator", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("You choose the syllabus")
    ).toBeInTheDocument()
  })

  it("renders all whyGwth cards", () => {
    render(<ForTeamsPage />)
    const expectedTitles = [
      "Zero wasted time",
      "Try it yourself first, then we work through it",
      "Beginner-friendly, and it stays that way",
      "You choose the syllabus",
      "Leading models, plus better-value alternatives",
      "Achievement you can assess and reward",
      "Built for the enterprise conversation",
    ]
    for (const title of expectedTitles) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
  })

  it("renders the syllabus customization FAQ", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("Can we choose which lessons our team completes?")
    ).toBeInTheDocument()
  })

  it("renders the working hours FAQ", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("Can employees complete this during working hours?")
    ).toBeInTheDocument()
  })

  it("renders the efficiency comparison cards", () => {
    render(<ForTeamsPage />)
    expect(screen.getByText("Typical AI training")).toBeInTheDocument()
    expect(screen.getByText("This course")).toBeInTheDocument()
  })

  it("displays the pricing", () => {
    render(<ForTeamsPage />)
    // Deliberately updated (W26): "£29" + "/mo", matching home and /pricing.
    expect(screen.getByText("£29")).toBeInTheDocument()
    // The ongoing price is quoted everywhere the course price is quoted now,
    // so this is deliberately getAllByText: more than one is the point.
    expect(screen.getAllByText(/£7\.50\/mo/).length).toBeGreaterThan(0)
  })

  it("has contact CTA", () => {
    render(<ForTeamsPage />)
    const links = screen.getAllByRole("link", { name: /Get in touch/ })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute("href", "/contact")
  })
})

/* ========================================================================== *
 * David's /for-teams annotations, 2026-09-14 (bead gwth-launch-88z.32.19).
 *
 * One describe per written annotation, named with its id, so a future change
 * that undoes one of his notes fails in a test whose name says whose note it
 * was. His verbatim words are quoted in each block.
 * ========================================================================== */

describe("a-20260914-195842-52169b: source notes are not lost in the text", () => {
  // "These source notes should be a different shade background as they are
  // lost in the text above them"
  const body = rule(".statSource")

  it("sets a different shade behind the citation", () => {
    expect(body).toMatch(/background:\s*var\(--v-quiet\)/)
  })

  it("shrink-wraps the shade to the citation instead of the column", () => {
    // A full-width band would be a second section ground, not a note. The
    // chip has to end where its words end.
    expect(body).toMatch(/display:\s*inline-block/)
    expect(body).toMatch(/padding:/)
  })

  it("uses the R2 chip radius, not a square corner or a pill", () => {
    expect(body).toMatch(/border-radius:\s*var\(--radius-sm\)/)
    expect(body).not.toMatch(/9999px|999px|50%/)
  })

  it("stays readable on that shade in BOTH themes", () => {
    // --v-muted on --v-quiet is 4.31:1 in light mode, under the 4.5:1 text
    // bar, which is why this note is --v-soft. Subordinate is carried by size
    // and width, never by dropping contrast under the bar.
    expect(body).toMatch(/color:\s*var\(--v-soft\)/)
    expect(contrast(T.softLight, T.quietLight)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(T.softDark, T.quietDark)).toBeGreaterThanOrEqual(4.5)
  })

  it("stays subordinate to the stat label above it", () => {
    expect(body).toMatch(/font-size:\s*var\(--fde-mono-xs\)/)
    expect(rule(".stat p")).toMatch(/font-size:\s*var\(--fde-body\)/)
  })

  it("renders one citation per stat, still naming its own source", () => {
    render(<ForTeamsPage />)
    const stats = screen.getAllByTestId("for-teams-stat")
    expect(stats.length).toBeGreaterThan(0)
    for (const stat of stats) {
      expect(within(stat).getByText(/^Source: /)).toBeInTheDocument()
    }
  })
})

describe("a-20260914-200101-e34e36: the comparison panel is professional and readable", () => {
  // "These colours don't look correct, the shading at the top, and also it
  // looks like it's a square shading box at the top inside a curved box which
  // looks unprofessional and messy. I don't think the colours look correct as
  // the dark colour where it says elsewhere is too dark with the dark text on
  // top of it, so it's difficult to read, and the light just fades into the
  // background, so both of them are wrong. Also, the font is really small and
  // it's meant to be a kind of title, so it should be much bigger"

  it("has no coloured band at the top of the comparison card", () => {
    // The retired flavour rotation, and the --v-muted repaint of it, are gone.
    expect(CSS).not.toMatch(/\.flv(Teal|Moss|Rust|Muted)\b/)
    expect(TSX).not.toMatch(/flv(Teal|Moss|Rust|Muted)/)
    expect(TSX).not.toMatch(/compareCard[^]{0,400}cardTop/)
  })

  it("never fills a surface with the metadata ink again", () => {
    // background: var(--v-muted) was the unreadable band: --v-ink on it is
    // 1.85:1 light, against a 4.5:1 text bar.
    expect(CSS).not.toMatch(/background:\s*var\(--v-muted\)/)
    expect(contrast("#17211d", T.mutedLight)).toBeLessThan(4.5)
  })

  it("leaves no square-cornered child hanging out of a rounded panel", () => {
    // .cardTop survives on the month and investment cards, so every panel
    // that still wears one has to clip to its own radius.
    for (const panel of [".monthCard", ".investCard"]) {
      expect(rule(panel)).toMatch(/overflow:\s*hidden/)
      expect(rule(panel)).toMatch(/border-radius:\s*var\(--radius-lg\)/)
    }
  })

  it("makes the name the title, at heading size", () => {
    const who = rule(".compareWho")
    // Bitter, and clamped from 1.5rem up: the old band label was
    // --fde-mono-sm, 0.82rem. "It should be much bigger."
    expect(who).toMatch(/font-family:\s*var\(--font-serif\)/)
    const min = who.match(/font-size:\s*clamp\(([\d.]+)rem/)
    expect(min).toBeTruthy()
    expect(Number(min![1])).toBeGreaterThanOrEqual(1.4)
    // And it is a real heading in the document, not a styled span.
    render(<ForTeamsPage />)
    expect(
      screen.getByRole("heading", { name: "Elsewhere" })
    ).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "GWTH" })).toBeInTheDocument()
  })

  it("orders the panel as name, then label, then figure, then argument", () => {
    render(<ForTeamsPage />)
    const heading = screen.getByRole("heading", { name: "Elsewhere" })
    const card = heading.closest("article")
    expect(card).toBeTruthy()
    const texts = Array.from(card!.children).map((n) => n.textContent?.trim())
    expect(texts[0]).toBe("Elsewhere")
    expect(texts[1]).toBe("Typical AI training")
    expect(texts[2]).toBe("40 hours")
    expect(texts[3]).toMatch(/^Padded with filler/)
  })

  it("draws the panel boundary with the measured token, clearing 3:1 on the worst of four", () => {
    const card = rule(".compareCard")
    expect(card).toMatch(/border:\s*1px solid var\(--v-line\)/)
    expect(card).toMatch(/background:\s*var\(--v-bg\)/)
    expect(card).toMatch(/border-radius:\s*var\(--radius-lg\)/)
    // The panel sits on the .sectionAlt band, which is --v-surface, so the
    // boundary touches --v-bg and --v-surface in both modes.
    const worst = Math.min(
      contrast(T.lineLight, T.bgLight),
      contrast(T.lineLight, T.surfaceLight),
      contrast(T.lineDark, T.bgDark),
      contrast(T.lineDark, T.surfaceDark)
    )
    expect(worst).toBeGreaterThanOrEqual(3)
  })

  it("tells the two sides apart by words, never by a fill", () => {
    // tint-is-never-the-only-signal. Both panels wear the same recipe, so
    // neither side may acquire a background of its own.
    expect(CSS).not.toMatch(/\.compareCardOurs\b/)
    render(<ForTeamsPage />)
    expect(screen.getByText("Elsewhere")).toBeInTheDocument()
    expect(screen.getByText("This course")).toBeInTheDocument()
  })

  it("carries its one piece of colour as the register's italic accent", () => {
    const ours = rule(".compareFigureOurs")
    expect(ours).toMatch(/font-style:\s*italic/)
    expect(ours).toMatch(/color:\s*var\(--v-accent\)/)
    expect(contrast(T.accentLight, T.bgLight)).toBeGreaterThanOrEqual(3)
    expect(contrast(T.accentDark, T.bgDark)).toBeGreaterThanOrEqual(3)
  })

  it("keeps every word of the comparison copy", () => {
    render(<ForTeamsPage />)
    expect(screen.getByText("40 hours")).toBeInTheDocument()
    expect(screen.getByText("Zero filler")).toBeInTheDocument()
    expect(screen.getByText(/Padded with filler/)).toBeInTheDocument()
  })
})

describe("a-20260914-200315-d7c25e: beginners are walked through each project", () => {
  // "I think we should make more of the fact that new students won't get lost
  // because we carefully walk through each project after the student has tried
  // themselves. Obviously, if the student knows a lot about applied AI
  // already, then they won't need to go through the walkthrough as carefully
  // as beginners"

  function differentiator(title: string): string {
    render(<ForTeamsPage />)
    const item = screen.getByText(title).closest("li")
    expect(item, `no differentiator "${title}"`).toBeTruthy()
    return item!.textContent ?? ""
  }

  it("says the learner attempts the project BEFORE the worked solution", () => {
    const text = differentiator("Try it yourself first, then we work through it")
    const attempt = text.search(/attempt|try|tries/i)
    const worked = text.search(/works through|worked solution/i)
    expect(attempt).toBeGreaterThanOrEqual(0)
    expect(worked).toBeGreaterThan(attempt)
  })

  it("promises the beginner is not left stuck", () => {
    const text = differentiator("Try it yourself first, then we work through it")
    expect(text).toMatch(/nobody is left|never left|not left/i)
  })

  it("lets an experienced learner move through the support faster", () => {
    const text = differentiator("Try it yourself first, then we work through it")
    expect(text).toMatch(/already works with AI|already know/i)
    expect(text).toMatch(/only where they want|dip into|skip/i)
  })

  it("does NOT call this lesson support a walkthrough", () => {
    // Home reserves "walkthrough" for David's own hour with an institution
    // (home-fde.tsx, the audience split from a-20260914-193923-87ad97).
    // Re-using the noun here for lesson content would undo that correction.
    render(<ForTeamsPage />)
    expect(document.body.textContent).not.toMatch(/walkthrough/i)
  })
})

describe("a-20260914-200357-6dddb2: nobody gets lost towards the end", () => {
  // "This is good, but again, I don't want people to think that they're going
  // to get lost towards the end of the course"

  it("says the support does not thin out as the depth increases", () => {
    render(<ForTeamsPage />)
    const item = screen
      .getByText("Beginner-friendly, and it stays that way")
      .closest("li")
    const text = item?.textContent ?? ""
    expect(text).toMatch(/plain English/i)
    expect(text).toMatch(/taught exactly like the first ones|same way/i)
    expect(text).toMatch(/support does not thin out|does not thin/i)
  })

  it("no longer leaves 'ready to go deeper' as the last word on later lessons", () => {
    // The old sentence ended "for teams ready to go deeper", which reads as a
    // filter: deeper is for other people.
    render(<ForTeamsPage />)
    expect(document.body.textContent).not.toMatch(/ready to go deeper/i)
  })
})

describe("a-20260914-200722-f1a859: vendor neutrality against single-provider courses", () => {
  // "I think we should say that we cover all of the top models plus other
  // better value models, unlike the LLMs. Several of the large AI companies
  // like Anthropic and OpenAI are starting to do their own courses, but these
  // are all very specific to their own LLMs and tools"

  it("claims leading models AND better-value alternatives", () => {
    render(<ForTeamsPage />)
    const item = screen
      .getByText("Leading models, plus better-value alternatives")
      .closest("li")
    const text = item?.textContent ?? ""
    expect(text).toMatch(/leading models/i)
    expect(text).toMatch(/better-value alternatives/i)
    // Grounded in the canonical syllabus register: "Cheaper and open models",
    // "Self-hosting LLMs", "Open-source models at enterprise scale".
    expect(text).toMatch(/open and self-hosted/i)
  })

  it("claims coverage of leading models without claiming EVERY model", () => {
    // The register proves work across leading providers plus cheaper, open and
    // self-hosted alternatives. It does not prove exhaustive coverage, and a
    // page cannot keep that promise as new models ship.
    render(<ForTeamsPage />)
    const text = document.body.textContent ?? ""
    expect(text).not.toMatch(/every leading model/i)
    expect(text).not.toMatch(/\ball (of the )?(the )?(top|leading|major) (models|providers)\b/i)
    expect(text).not.toMatch(/\bevery (major |top )?(model|provider|AI company)\b/i)
  })

  it("contrasts with provider-authored training as a tendency, not an absolute", () => {
    render(<ForTeamsPage />)
    const text = document.body.textContent ?? ""
    expect(text).toMatch(/Provider-authored training naturally centres/i)
    // Nothing here can prove another publisher is INCAPABLE of teaching
    // outside its own products, so no absolute about what it can teach.
    expect(text).not.toMatch(/can only teach/i)
    expect(text).not.toMatch(/\b(only ever|never) teach(es)?\b/i)
    expect(text).not.toMatch(/\b(cannot|can never|is unable to) teach\b/i)
    // A company is not an LLM and a course is not an LLM. His shorthand
    // "unlike the LLMs" must not reach the page as written.
    expect(text).not.toMatch(/unlike the LLMs/i)
  })

  it("makes no unverifiable claim about a named competitor's course", () => {
    // Naming who publishes what would be a factual claim about a third party
    // that nobody re-checks, and the bible bans fabricated proof.
    render(<ForTeamsPage />)
    const text = document.body.textContent ?? ""
    for (const company of ["Anthropic", "OpenAI", "Google", "Microsoft"]) {
      expect(text).not.toMatch(new RegExp(`${company}[^.]{0,80}course`, "i"))
    }
  })

  it("keeps the same point in the FAQ, where a buyer comparing offers looks", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("How is this different from training published by an AI company?")
    ).toBeInTheDocument()
  })
})

describe("a-20260914-200925-203041: dynamic scoring makes achievement assessable", () => {
  // "We haven't mentioned the dynamic scoring that makes it easy to reward and
  // assess achievement"

  function scoringText(): string {
    render(<ForTeamsPage />)
    const item = screen
      .getByText("Achievement you can assess and reward")
      .closest("li")
    expect(item).toBeTruthy()
    return item!.textContent ?? ""
  }

  it("names the dynamic score and says what moves it", () => {
    const text = scoringText()
    expect(text).toMatch(/dynamic GWTH Score/i)
    // calculateGwthScore(): completed lessons x POINTS_PER_LESSON, weighted by
    // quiz average, against the learner's own edition.
    expect(text).toMatch(/lessons they have finished/i)
    expect(text).toMatch(/check questions/i)
    expect(text).toMatch(/syllabus you assigned/i)
  })

  it("says what an admin can actually do with it", () => {
    // src/app/org/learners: who has reached and passed each lesson, at the
    // edition's pass mark.
    const text = scoringText()
    expect(text).toMatch(/reached and passed/i)
    expect(text).toMatch(/pass mark/i)
  })

  it("does not promise score decay or currentness, which are not implemented", () => {
    // SCORE_DECAY_DAYS is a config constant with nothing reading it. The old
    // "Plain progress reporting" item promised reporting on "currentness".
    render(<ForTeamsPage />)
    const text = document.body.textContent ?? ""
    expect(text).not.toMatch(/currentness/i)
    expect(text).not.toMatch(/score decays|decaying score/i)
  })

  it("still contrasts with a one-time certificate", () => {
    expect(scoringText()).toMatch(/one-time certificate/i)
  })
})

describe("a-20260914-201048-8373b2: Month 1 sounds hands-on", () => {
  // "This doesn't sound practical enough. Can we make it more hands-on"

  function monthCard(title: string): string {
    render(<ForTeamsPage />)
    const article = screen.getByText(title).closest("article")
    expect(article, `no month card "${title}"`).toBeTruthy()
    return article!.textContent ?? ""
  }

  it("names things the learner finishes, not topics they cover", () => {
    const text = monthCard("Foundations")
    expect(text).toMatch(/Hands-on from the first lesson/i)
    // Grounded in the register's Month 1: the six superpower lessons, the
    // dashboard lesson, the automation lesson and the four FamilyBot lessons.
    expect(text).toMatch(/research brief/i)
    expect(text).toMatch(/dashboard/i)
    expect(text).toMatch(/automation/i)
    expect(text).toMatch(/voice note/i)
    expect(text).toMatch(/project to complete/i)
  })

  it("keeps the six primitives promise it already made", () => {
    expect(monthCard("Foundations")).toMatch(/Six practical superpowers/i)
  })

  it("still shows the mandatory count from config", () => {
    expect(monthCard("Foundations")).toMatch(/26 mandatory/)
  })
})

describe("a-20260914-201147-7a211a: Month 2 does not exclude enterprises", () => {
  // "I like most of this, but it's slightly too short, and it also talks about
  // small business use cases. I think we should just talk about business use
  // cases because there may be some enterprises looking at this, and I don't
  // want them thinking that this is just for small businesses"

  function month2(): string {
    render(<ForTeamsPage />)
    const article = screen
      .getByText("Apps, Workflows & Consulting")
      .closest("article")
    expect(article).toBeTruthy()
    return article!.textContent ?? ""
  }

  it("says business use cases, never small-business use cases", () => {
    const text = month2()
    expect(text).toMatch(/business use cases/i)
    expect(text).not.toMatch(/small[- ]business use cases/i)
  })

  it("names the large end of the range explicitly", () => {
    expect(month2()).toMatch(/large organisation/i)
  })

  it("is longer than the sentence it replaced", () => {
    // The old copy was 99 characters. "It's slightly too short."
    const description = month2()
    expect(description.length).toBeGreaterThan(200)
  })

  it("stays grounded in what Month 2 actually contains", () => {
    const text = month2()
    // AskMyCo (RAG with citations), the security and testing lessons, the
    // browser and computer-use agent lesson, FractionalBuddy.
    expect(text).toMatch(/cites them|cite/i)
    expect(text).toMatch(/security, testing and data/i)
    expect(text).toMatch(/agents/i)
    expect(text).toMatch(/consulting/i)
  })
})

describe("a-20260914-201312-2b5bdf: Month 3 has a choice-of-path theme", () => {
  // "This sounds slightly chaotic. There's no real theme. I think the month
  // three has two main themes, which is different to the first couple of
  // months, but I think it still has a strong message where you can choose
  // your own path and you can either concentrate on enterprise transformation
  // or building more advanced and robust things with AI"

  function month3(): string {
    render(<ForTeamsPage />)
    const article = screen
      .getByText("Transformation or advanced building")
      .closest("article")
    expect(article).toBeTruthy()
    return article!.textContent ?? ""
  }

  it("names both paths in the card title", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText("Transformation or advanced building")
    ).toBeInTheDocument()
  })

  it("says there is a shared core before the fork", () => {
    // The register's Month 3 really does share lessons 0 to 19 before the
    // two tracks separate, so the copy is not inventing a structure.
    const text = month3()
    expect(text).toMatch(/one shared core/i)
    expect(text).toMatch(/picks a direction|choose/i)
  })

  it("describes the enterprise transformation path", () => {
    expect(month3()).toMatch(/governance, board reporting and adoption/i)
  })

  it("describes the advanced building path", () => {
    expect(month3()).toMatch(
      /multi-agent orchestration, self-hosted models and red teaming/i
    )
  })

  it("no longer reads as an unordered list of topics", () => {
    // The old copy opened "Multi-agent systems, self-hosted AI, governance
    // frameworks, ROI measurement, and change management" with no theme.
    expect(month3()).not.toMatch(
      /^Multi-agent systems, self-hosted AI, governance frameworks/
    )
  })
})

describe("a-20260914-201426-ae7f0e: no invented optional-lesson count", () => {
  // "I think we're definitely going to have more than 30 optional lessons. So
  // I'm not sure if we should put 50 here or should we make it a round total
  // of 120 lessons by putting 54 lessons here"
  //
  // Derived, not answered: the canonical syllabus register says 60 mandatory /
  // 44 optional over its three modules, this site's config says 66 / 30, and
  // production holds 26 published Month-1 lessons. No register owns the split,
  // so the page states no total. 50, 54 and 120 are all inventions.

  it("prints no optional-lesson total anywhere on the page", () => {
    render(<ForTeamsPage />)
    const text = document.body.textContent ?? ""
    expect(text).not.toMatch(/\b\d+\s+optional lessons\b/i)
    expect(text).not.toMatch(/\b(30|33|44|50|54)\s+optional\b/i)
  })

  it("prints no invented course-wide lesson total either", () => {
    render(<ForTeamsPage />)
    expect(document.body.textContent).not.toMatch(/\b120 lessons\b/i)
  })

  it("still describes the optional set, and says it grows", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText(
        /A further set of optional lessons covers industry-specific and advanced topics/
      )
    ).toBeInTheDocument()
    expect(document.body.textContent).toMatch(
      /grows as new lessons are published/i
    )
  })

  it("keeps the mandatory figure, which config owns and the dashboard enforces", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getAllByText(
        new RegExp(`${TOTAL_MANDATORY_LESSONS} mandatory lessons`)
      ).length
    ).toBeGreaterThanOrEqual(1)
  })

  it("does not print a per-month optional count either", () => {
    // The month cards used to say "20 mandatory + 15 optional", which is the
    // same unowned split at a finer grain, and would contradict the bullet.
    render(<ForTeamsPage />)
    expect(document.body.textContent).not.toMatch(/\d+ mandatory \+ \d+ optional/)
    expect(screen.getAllByText(/mandatory, plus optional/).length).toBe(2)
  })

  it("records the derivation in the source, so the next editor sees it", () => {
    // A number removed without its reason comes back.
    expect(TSX).toMatch(/a-20260914-201426-ae7f0e/)
    expect(TSX).toMatch(/Canonical syllabus DB/)
  })
})

describe("the stated duration and the stated total hours agree", () => {
  // Codex review, 2026-09-14: the page shows "3 months / 5 hours a week" and
  // the stats conclusion claimed "120 hours of hands-on training". Twelve
  // weeks at five hours is about sixty, so the two numbers contradicted each
  // other on one screen. The product specifies months, not an exact number of
  // weeks, so the conclusion now repeats the duration it displays rather than
  // deriving a total nobody can hold it to.

  it("claims no 120-hour total", () => {
    render(<ForTeamsPage />)
    expect(document.body.textContent).not.toMatch(/\b120\s*hours?\b/i)
  })

  it("derives no hour total from the weekly commitment at all", () => {
    render(<ForTeamsPage />)
    const text = document.body.textContent ?? ""
    // Any "N hours of ... training" total would be the same invented figure.
    expect(text).not.toMatch(/\b\d{2,}\s*hours of [a-z, -]*training\b/i)
  })

  it("states the commitment the masthead shows, in words", () => {
    render(<ForTeamsPage />)
    expect(screen.getByText("3 months \u00b7 5 hours a week")).toBeInTheDocument()
    expect(document.body.textContent).toMatch(
      /Three months of hands-on, vendor-neutral training, at five\s+hours a week/i
    )
  })
})

describe("the canned keep action a-20260914-200143-635cd6 is honoured", () => {
  // The free-text note is blank, but the selected canned action is meaningful
  // feedback. Preserve the paragraph exactly as David marked it.
  it("keeps the zero-wasted-time paragraph unchanged", () => {
    render(<ForTeamsPage />)
    expect(
      screen.getByText(
        "No repetition. No filler. No outdated material. Every lesson teaches the newest, most relevant applied AI skills. Your team's time is more valuable than the course, and we treat it that way."
      )
    ).toBeInTheDocument()
  })
})
