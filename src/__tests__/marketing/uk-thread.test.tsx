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

/**
 * Marketing copy that is written and held, on a route switched off behind a
 * feature flag. It is checked as SOURCE rather than rendered, which is the
 * weaker check and is labelled as such: it proves the words are in the file,
 * not that anyone can read them today.
 *
 * `/news` is the only one. Chasing the thread onto it turned up something
 * worse than a missing sentence: `ENABLE_NEWS` is false, the nav and the
 * footer filter the link out, and the FDE rewrite at `app/(public)/_news/`
 * refuses to render without the flag, but that directory is
 * underscore-prefixed so Next never routed it. The copy a visitor actually
 * reached was THIS one, ungated, and its Supabase call failed into the route
 * group's error boundary. https://gwth.ai/news was serving "An unexpected
 * error occurred" to anyone holding the link. It now 404s (see the gate check
 * below), and the UK copy waits in the file for the day the feed comes back.
 */
const SOURCE_ONLY_SURFACES: readonly { route: string; file: string }[] = [
  { route: "/news", file: "app/(public)/news/page.tsx" },
]

/**
 * Both news implementations, and the gate each one has to carry. A page that
 * cannot render must say so with a 404, not with an error boundary.
 */
const NEWS_IMPLEMENTATIONS = [
  "app/(public)/news/page.tsx",
  "app/(public)/_news/page.tsx",
  "app/(public)/_news/[slug]/page.tsx",
]

describe("a switched-off feed 404s rather than erroring", () => {
  for (const file of NEWS_IMPLEMENTATIONS) {
    it(`${file} refuses to render while ENABLE_NEWS is false`, () => {
      const source = readFileSync(join(__dirname, "..", "..", file), "utf8")
      expect(source, `${file} never imports the flag`).toContain("ENABLE_NEWS")
      expect(source, `${file} never imports notFound`).toContain(
        'from "next/navigation"'
      )
      expect(
        source,
        `${file} has no "if (!ENABLE_NEWS) notFound()" guard, so a failed data call reaches the error boundary instead of 404ing`
      ).toMatch(/if\s*\(\s*!\s*ENABLE_NEWS\s*\)\s*notFound\(\)/)
    })
  }

  it("the flag is still off, which is what makes the guard load-bearing", async () => {
    const { ENABLE_NEWS } = await import("@/lib/config")
    expect(ENABLE_NEWS).toBe(false)
  })
})

/**
 * The words a reader would see in a `.tsx` file: JSX comments removed first
 * (so a note ABOUT the UK thread is never mistaken for the thread), then
 * `{...}` expressions, then the tags, leaving the literal text between them.
 */
function jsxText(file: string): string {
  return readFileSync(join(__dirname, "..", "..", file), "utf8")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{[^{}]*\}/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

describe("the surfaces no unit test can render still carry the thread", () => {
  for (const { route, file } of SOURCE_ONLY_SURFACES) {
    it(`${route} says it is for the United Kingdom`, () => {
      expect(jsxText(file)).toMatch(/\bUK\b|United Kingdom|Britain|British/)
    })

    it(`${route} makes no unsupported claim`, () => {
      const text = jsxText(file)
      for (const claim of UNSUPPORTED_UK_CLAIMS) {
        const hit = text.match(claim.pattern)
        expect(hit, hit ? `${route} says "${hit[0]}". ${claim.why}` : claim.id).toBeNull()
      }
    })

    it(`${route} uses no em dash, en dash or section sign`, () => {
      const hit = jsxText(file).match(/[\u2014\u2013\u00a7]/)
      expect(hit, hit ? `${route} uses "${hit[0]}"` : "clean").toBeNull()
    })
  }
})

describe("the thread is repeated, not copy-pasted", () => {
  it("no UK sentence appears on two different surfaces", () => {
    const seen = new Map<string, string>()
    const collisions: string[] = []
    const everySurface: { route: string; text: () => string }[] = [
      ...SURFACES.map((surface) => ({
        route: surface.route,
        text: () => inspect(surface).text,
      })),
      ...SOURCE_ONLY_SURFACES.map(({ route, file }) => ({
        route,
        text: () => jsxText(file),
      })),
    ]
    for (const surface of everySurface) {
      for (const sentence of new Set(ukSentences(surface.text()))) {
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

// ─── The twelfth surface nobody can see: the page descriptions ─────────────

/**
 * A page's `description` is the sentence a visitor reads in a Google result,
 * in a shared link preview and in a bookmark, so it is a marketing surface
 * with its own copy even though nothing on the page renders it. The bead
 * names it alongside the footer, and it is the surface most likely to be
 * forgotten in a later copy pass, because no screenshot ever shows it.
 *
 * The routes below are the public pages a visitor can reach and read.
 *
 * `/news` is not one of them, and working out why was the point: it is a real
 * routed segment, so "nothing links it" was never a reason to leave it alone,
 * but it now 404s behind `ENABLE_NEWS` (see the gate check above) and a 404
 * never serves its description. Its copy is still written and still checked,
 * as a held surface, so the day the feed returns the thread returns with it.
 *
 * `/privacy`, `/terms`, `/verify` and `/tech-radar` stay out because they are
 * not marketing copy.
 */
const DESCRIBED_ROUTES: readonly { route: string; file: string }[] = [
  { route: "/", file: "app/layout.tsx" },
  { route: "/about", file: "app/(public)/about/page.tsx" },
  { route: "/contact", file: "app/(public)/contact/page.tsx" },
  {
    route: "/for-institutions",
    file: "app/(public)/for-institutions/page.tsx",
  },
  { route: "/for-teams", file: "app/(public)/for-teams/page.tsx" },
  { route: "/labs", file: "app/(public)/labs/page.tsx" },
  { route: "/lessons", file: "app/(public)/lessons/page.tsx" },
  { route: "/newsletter", file: "app/(public)/newsletter/page.tsx" },
  { route: "/pricing", file: "app/(public)/pricing/page.tsx" },
  { route: "/waitlist", file: "app/(public)/waitlist/page.tsx" },
  { route: "/why-gwth", file: "app/(public)/why-gwth/page.tsx" },
]

/**
 * The first `description:` value in a route's `metadata` export, as readable
 * text. The value can be a plain string, several strings joined with `+`, or
 * a template literal with an interpolation in it, so the punctuation of the
 * expression is stripped rather than parsed: this is a copy check, not a
 * compiler. `${...}` holes are replaced by a space so that a count spliced
 * into a sentence cannot accidentally create or hide a word.
 */
function metadataDescription(file: string): string {
  const source = readFileSync(join(ROOT, file), "utf8")
  const start = source.indexOf("export const metadata")
  expect(start, `${file} has no metadata export`).toBeGreaterThan(-1)
  const afterKey = source.indexOf("description:", start)
  expect(afterKey, `${file} metadata has no description`).toBeGreaterThan(-1)
  const rest = source.slice(afterKey + "description:".length)
  // The value ends at the next property at the same indent, or the end of
  // the object literal.
  const end = rest.search(/\n {2}[a-zA-Z]+:|\n\}/)
  return rest
    .slice(0, end === -1 ? undefined : end)
    .replace(/\$\{[^}]*\}/g, " ")
    .replace(/[`"']/g, "")
    .replace(/\s*\+\s*/g, "")
    .replace(/,\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
}

describe("every marketing page description carries the UK thread", () => {
  for (const { route, file } of DESCRIBED_ROUTES) {
    it(`${route} says who it is for`, () => {
      const description = metadataDescription(file)
      expect(description.length, `${file} description looks empty`).toBeGreaterThan(40)
      expect(
        description,
        `${route} (${file}) never says it is for the United Kingdom`
      ).toMatch(/\bUK\b|United Kingdom|Britain|British|GBP|£/)
    })
  }

  it("gives each route its own description", () => {
    const seen = new Map<string, string>()
    const collisions: string[] = []
    for (const { route, file } of DESCRIBED_ROUTES) {
      const description = metadataDescription(file).toLowerCase()
      const owner = seen.get(description)
      if (owner) collisions.push(`${owner} and ${route} share a description`)
      else seen.set(description, route)
    }
    expect(collisions).toEqual([])
  })

  it("keeps em dashes, en dashes and section signs out of them", () => {
    const offenders: string[] = []
    for (const { route, file } of DESCRIBED_ROUTES) {
      const hit = metadataDescription(file).match(/[—–§]/)
      if (hit) offenders.push(`${route} uses "${hit[0]}"`)
    }
    expect(offenders).toEqual([])
  })

  it("states no UK figure the shared module owns", () => {
    const offenders: string[] = []
    for (const { route, file } of DESCRIBED_ROUTES) {
      const description = metadataDescription(file)
      for (const figure of UK_AI_FIGURES) {
        if (description.includes(figure.value)) {
          offenders.push(
            `${route} prints "${figure.value}" where no source can be linked`
          )
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
