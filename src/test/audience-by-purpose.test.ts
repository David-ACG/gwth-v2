/**
 * Style Bible item `audience-by-purpose` (David, 2026-10-20).
 *
 * 1. Public pages describe who GWTH is for by purpose (work and everyday
 *    life), never by age: no "for adults", "working adults", "adult learners",
 *    "young adults" or "(16+)" labels. "Adults" stays fine as a fact about a
 *    population ("of UK adults feel confident"), so the plain "for adults" form
 *    is only flagged in a sentence that is about the course.
 * 2. The age is stated in exactly four places (Terms, Privacy, the Pricing
 *    note, the sign-up form) and they must agree, so a change to one fails
 *    here until all four match.
 *
 * Reads source files rather than rendering, so it covers every public route
 * and component without mocking each page.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

const SRC = join(__dirname, "..")
const PUBLIC_DIRS = [
  "app/(public)",
  "app/(auth)",
  "components/marketing",
  "components/auth",
]

const AUDIENCE_AGE =
  /\b(?:for|at)\s+(?:(?:busy|working|uk|british|non-technical|intelligent|curious)\s+)*(?:adults|grown-?ups)\b/i
const AUDIENCE_AGE_ALWAYS = /\byoung adults\b|\badult learners?\b|\(\s*1[0-9]\s*\+\s*\)/i
const ABOUT_COURSE = /\b(?:GWTH|course|programme|lessons?)\b/i

function files(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...files(p))
    else if (/\.(tsx?|mdx?)$/.test(name) && !/\.(test|spec|stories)\./.test(name))
      out.push(p)
  }
  return out
}

/** Visible-ish text: comments dropped, JSX line breaks joined. */
function prose(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
}

export function audienceByAge(text: string): string[] {
  return text
    .split(/(?<=[.!?"])\s+/)
    .filter(
      (s) =>
        AUDIENCE_AGE_ALWAYS.test(s) ||
        (AUDIENCE_AGE.test(s) && ABOUT_COURSE.test(s)),
    )
}

describe("audience-by-purpose: public pages never describe the course by age", () => {
  it("finds no audience-by-age phrasing in public routes and components", () => {
    const hits: string[] = []
    for (const d of PUBLIC_DIRS) {
      for (const f of files(join(SRC, d))) {
        for (const s of audienceByAge(prose(readFileSync(f, "utf8"))))
          hits.push(`${relative(SRC, f)}: ${s.slice(0, 160)}`)
      }
    }
    expect(hits).toEqual([])
  })

  it("flags the old wordings and allows population facts", () => {
    expect(audienceByAge("GWTH is a practical AI course for adults in the UK.")).toHaveLength(1)
    expect(audienceByAge("A UK-first applied AI programme for working adults.")).toHaveLength(1)
    expect(audienceByAge("A course for adults and young adults (15+).")).toHaveLength(1)
    expect(audienceByAge("Only 21% of UK adults feel confident using AI at work.")).toEqual([])
    expect(audienceByAge("GWTH is a practical AI course for work and everyday life in the UK.")).toEqual([])
  })
})

describe("audience-by-purpose: the four places that state the age agree", () => {
  const FOUR = {
    terms: "app/(public)/terms/page.tsx",
    privacy: "app/(public)/privacy/page.tsx",
    pricing: "components/marketing/pricing-fde/pricing-fde.tsx",
    signup: "components/auth/signup-form.tsx",
  }

  for (const [name, path] of Object.entries(FOUR)) {
    it(`${name} states the age as 16`, () => {
      const text = prose(readFileSync(join(SRC, path), "utf8"))
      expect(text).toMatch(/16 or (?:over|17)/)
      expect(text).not.toMatch(/\b13 years of age\b|under the age of 13/)
    })
  }

  it("the three that admit 16 and 17 year olds name who holds the account", () => {
    for (const path of [FOUR.terms, FOUR.pricing, FOUR.signup]) {
      const text = prose(readFileSync(join(SRC, path), "utf8"))
      expect(text, path).toMatch(/16 or 17/)
      expect(text, path).toMatch(/parent or guardian/)
      expect(text, path).toMatch(/employer/)
    }
  })
})
