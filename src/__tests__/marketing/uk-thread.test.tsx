import { render, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import { HomeFde } from "@/components/marketing/home-fde/home-fde"
import { AboutFde } from "@/components/marketing/about-fde/about-fde"
import { WhyGwthFde } from "@/components/marketing/why-gwth-fde/why-gwth-fde"
import { ForInstitutionsFde } from "@/components/marketing/for-institutions-fde/for-institutions-fde"
import { ForTeamsFde } from "@/components/marketing/for-teams-fde/for-teams-fde"
import { LessonsFde } from "@/components/marketing/lessons-fde/lessons-fde"
import { PricingFde } from "@/components/marketing/pricing-fde/pricing-fde"
import { LabsFde } from "@/components/marketing/labs-fde/labs-fde"
import { ContactFde } from "@/components/marketing/contact-fde/contact-fde"
import { WaitlistFde } from "@/components/marketing/waitlist-fde/waitlist-fde"
import { NewsletterFde } from "@/components/marketing/newsletter-fde/newsletter-fde"
import { Footer } from "@/components/layout/footer"
import { getLiveArenaLabs, getArchivedArenaLabs } from "@/lib/data/model-arena"
import {
  UK_AI_FIGURES,
  UK_AI_SOURCES,
  UNSUPPORTED_UK_CLAIMS,
  ukFigure,
  ukFigureSource,
} from "@/lib/data/uk-ai-context"

/**
 * The UK thread, enforced across every public marketing surface at once.
 *
 * David's annotation a-20260914-210609-f7fdc8 on /about, in his words:
 *
 * > This is about the only page that mentions that it's UK focused, we should
 * > be mentioning it on all pages
 *
 * Bead gwth-launch-88z.32.25 carries that as a site-wide change rather than
 * eleven separate copy edits, because spreading the thread is exactly the
 * thing that goes wrong when nothing holds it together. Three failures were
 * already live before this suite existed:
 *
 *  1. Three files held three different private sets of UK figures, so
 *     /why-gwth told a visitor that one in six UK businesses used AI as of
 *     mid-2025 while /about told the same visitor it was around 35% in
 *     June 2026.
 *  2. /why-gwth attributed the government's £400 billion projection to
 *     "DSIT, Jan 2026". It is the AI Opportunities Action Plan of
 *     13 January 2025, and it is a projection rather than a measurement.
 *  3. Nothing stopped a later copy pass reintroducing the three claims the
 *     primary sources contradict.
 *
 * So this file asserts four things, and they are deliberately about MEANING
 * and PROVENANCE rather than about sentences, so the copy can keep being
 * improved without the suite having to be rewritten with it:
 *
 *  - every surface carries the thread in some form;
 *  - every rendered UK statistic matches `src/lib/data/uk-ai-context.ts` and
 *    is cited on the page that renders it;
 *  - no surface makes an unsupported claim about the UK;
 *  - no surface carries a UK sentence verbatim from another surface, because
 *    repetition was the ask and a copy-pasted slogan is not repetition.
 */

afterEach(cleanup)

/** Labs and the home page read a runtime gate; pin it to the closed default. */
const ORIGINAL_MODE = process.env.PRIVATE_CONTENT_MODE
beforeEach(() => {
  process.env.PRIVATE_CONTENT_MODE = "on"
})
afterEach(() => {
  if (ORIGINAL_MODE === undefined) delete process.env.PRIVATE_CONTENT_MODE
  else process.env.PRIVATE_CONTENT_MODE = ORIGINAL_MODE
})

/** One public marketing surface, addressed by the route a visitor sees. */
interface Surface {
  /** The route this component is rendered at. */
  route: string
  /** Render it. */
  render: () => void
}

const SURFACES: readonly Surface[] = [
  { route: "/", render: () => void render(<HomeFde />) },
  { route: "/about", render: () => void render(<AboutFde />) },
  { route: "/why-gwth", render: () => void render(<WhyGwthFde />) },
  {
    route: "/for-institutions",
    render: () => void render(<ForInstitutionsFde />),
  },
  { route: "/for-teams", render: () => void render(<ForTeamsFde />) },
  { route: "/lessons", render: () => void render(<LessonsFde />) },
  { route: "/pricing", render: () => void render(<PricingFde />) },
  {
    route: "/labs",
    render: () =>
      void render(
        <LabsFde
          liveLabs={getLiveArenaLabs()}
          archivedArenaLabs={getArchivedArenaLabs()}
          legacyArchive={[]}
        />
      ),
  },
  { route: "/contact", render: () => void render(<ContactFde />) },
  { route: "/waitlist", render: () => void render(<WaitlistFde />) },
  { route: "/newsletter", render: () => void render(<NewsletterFde />) },
  {
    route: "footer (every page)",
    render: () => void render(<Footer showLabs={false} lessonsHref="/lessons" />),
  },
]

/** Everything a reader can read on the surface just rendered. */
function visibleText(): string {
  return (document.body.textContent ?? "").replace(/\s+/g, " ").trim()
}

/** Every URL the surface just rendered links to. */
function linkedUrls(): string[] {
  return Array.from(document.querySelectorAll("a")).map(
    (a) => a.getAttribute("href") ?? ""
  )
}

/** Render one surface and hand back its text, its links and its figures. */
function inspect(surface: Surface) {
  cleanup()
  surface.render()
  const figures = Array.from(
    document.querySelectorAll<HTMLElement>("[data-uk-figure]")
  ).map((el) => ({
    id: el.getAttribute("data-uk-figure") ?? "",
    text: (el.textContent ?? "").replace(/\s+/g, " ").trim(),
  }))
  return { text: visibleText(), urls: linkedUrls(), figures }
}

describe("the shared UK module", () => {
  it("gives every figure a source with a URL and a release date", () => {
    for (const figure of UK_AI_FIGURES) {
      const source = ukFigureSource(figure.id)
      expect(source.url, figure.id).toMatch(/^https:\/\//)
      expect(source.releasedLabel, figure.id).toMatch(/\d{4}$/)
      expect(source.released, figure.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(
        Date.parse(source.released),
        `${figure.id} release date is not a real date`
      ).not.toBeNaN()
    }
  })

  it("cites only the primary publishers, never a secondary write-up", () => {
    for (const source of UK_AI_SOURCES) {
      expect(source.url, source.id).toMatch(
        /^https:\/\/(www\.gov\.uk|www\.ons\.gov\.uk)\//
      )
    }
  })

  it("has no duplicate figure or source ids", () => {
    const figureIds = UK_AI_FIGURES.map((f) => f.id)
    const sourceIds = UK_AI_SOURCES.map((s) => s.id)
    expect(new Set(figureIds).size).toBe(figureIds.length)
    expect(new Set(sourceIds).size).toBe(sourceIds.length)
  })
})

describe("every marketing surface carries the UK thread", () => {
  for (const surface of SURFACES) {
    it(`${surface.route} says it is for the United Kingdom`, () => {
      const { text } = inspect(surface)
      expect(text).toMatch(/\bUK\b|United Kingdom|Britain|British|GOV\.UK/)
    })
  }
})

describe("no surface makes an unsupported claim about the UK", () => {
  for (const surface of SURFACES) {
    it(`${surface.route} is clean`, () => {
      const { text } = inspect(surface)
      for (const claim of UNSUPPORTED_UK_CLAIMS) {
        const hit = text.match(claim.pattern)
        expect(
          hit,
          hit
            ? `${surface.route} says "${hit[0]}". ${claim.why}`
            : claim.id
        ).toBeNull()
      }
    })
  }
})

describe("every rendered UK statistic comes from the shared module", () => {
  for (const surface of SURFACES) {
    it(`${surface.route} renders module values and cites them`, () => {
      const { urls, figures } = inspect(surface)
      for (const rendered of figures) {
        // Throws with the offending id if a page invents one.
        const figure = ukFigure(rendered.id)
        expect(
          rendered.text,
          `${surface.route} renders "${rendered.text}" for ${rendered.id}, the module says "${figure.value}"`
        ).toBe(figure.value)

        const source = ukFigureSource(rendered.id)
        expect(
          urls,
          `${surface.route} prints ${rendered.id} without linking ${source.title}`
        ).toContain(source.url)
      }
    })
  }

  it("at least three surfaces actually carry a sourced figure", () => {
    const withFigures = SURFACES.filter(
      (surface) => inspect(surface).figures.length > 0
    )
    expect(withFigures.length).toBeGreaterThanOrEqual(3)
  })
})

/**
 * Sentences that mention the UK, normalised enough that two pages saying the
 * same thing with different spacing still collide.
 */
function ukSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40)
    .filter((s) => /\bUK\b|United Kingdom|Britain|British/.test(s))
    .map((s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " "))
}

describe("the thread is repeated, not copy-pasted", () => {
  it("no UK sentence appears on two different surfaces", () => {
    const seen = new Map<string, string>()
    const collisions: string[] = []
    for (const surface of SURFACES) {
      const { text } = inspect(surface)
      for (const sentence of new Set(ukSentences(text))) {
        const owner = seen.get(sentence)
        if (owner && owner !== surface.route) {
          collisions.push(`"${sentence}" on both ${owner} and ${surface.route}`)
        } else {
          seen.set(sentence, surface.route)
        }
      }
    }
    expect(collisions).toEqual([])
    // Guards against the check going vacuous: if a refactor stopped the
    // sentence splitter finding anything, the loop above would pass silently.
    expect(seen.size).toBeGreaterThan(15)
  })
})

// ─── Source-level guard: nobody may hard-code a figure the module owns ──────

const ROOT = join(__dirname, "..", "..")

/**
 * The surfaces a visitor can actually reach. `app/redesign*`, `app/old-design`
 * and the pre-paper-first components under them are kept-on-purpose historical
 * experiments and are exempt for the same reason `paper-first-calm.test.ts`
 * exempts them: they record what the site used to be.
 */
const LIVE_MARKETING_DIRS = [
  "components/marketing/about-fde",
  "components/marketing/contact-fde",
  "components/marketing/for-institutions-fde",
  "components/marketing/for-teams-fde",
  "components/marketing/home-fde",
  "components/marketing/labs-fde",
  "components/marketing/lessons-fde",
  "components/marketing/newsletter-fde",
  "components/marketing/pricing-fde",
  "components/marketing/waitlist-fde",
  "components/marketing/why-gwth-fde",
  "components/layout",
  "app/(public)",
]

/** Source with comments removed, so a JSDoc note about a figure is allowed. */
function codeOf(path: string): string {
  return readFileSync(path, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ")
}

function sourceFiles(): string[] {
  const out: string[] = []
  const walk = (dir: string) => {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(dir, entry)
      if (statSync(full).isDirectory()) {
        walk(full)
        continue
      }
      if (!/\.tsx?$/.test(full)) continue
      if (/\.test\.tsx?$/.test(full)) continue
      out.push(full)
    }
  }
  for (const dir of LIVE_MARKETING_DIRS) walk(join(ROOT, dir))
  return out
}

describe("no live marketing file hard-codes a figure the module owns", () => {
  const files = sourceFiles()

  it("finds the marketing sources to scan", () => {
    expect(files.length).toBeGreaterThan(10)
  })

  for (const figure of UK_AI_FIGURES) {
    it(`${figure.id} (${figure.value}) is written once, in the module`, () => {
      const offenders = files
        .filter((file) => codeOf(file).includes(figure.value))
        .map((file) => relative(ROOT, file))
      expect(
        offenders,
        `these files print "${figure.value}" as a literal instead of reading ukFigure("${figure.id}")`
      ).toEqual([])
    })
  }
})
