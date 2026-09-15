import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

/**
 * The shared paper-first design rules, enforced on the source rather than on a
 * screenshot. These come out of David's whole-product review of 2026-09-13 and
 * the Bible items they cite; a rule that only lives in a walkthrough gets
 * re-broken by the next surface somebody builds.
 *
 * Scope note: `src/app/redesign*`, `src/app/old-design`, `src/app/logo_picker`
 * and `src/app/score-card-variants` are kept-on-purpose historical experiments
 * (stage E of the whole-product review). They are exempt: they exist to record
 * what the site used to look like, so holding them to the current register
 * would destroy the record.
 */

const ROOT = join(__dirname, "..")

/**
 * Routes and components that are NOT converted yet. Batch 1 of the redesign
 * (bead gwth-launch-88z.32.10) covered 20 representative surfaces and the
 * shared primitives under them; the files below sit on surfaces outside that
 * batch and still carry the FDE idioms. They are allowed to fail, and the list
 * may only ever SHRINK: a new offender outside it fails the suite, and a later
 * batch deletes its own entries. Do not add to it to make a build green.
 */
const NOT_YET_CONVERTED = [
  // GWTH score card and its share row (stage C of the whole-product review).
  "app/score/[id]/page.tsx",
  "app/score/[id]/calc-disclosure.tsx",
  "app/score/[id]/share-row.tsx",
  "components/marketing/score-card-variants/",
  // Pre-FDE marketing components, still imported by /demo and the old home.
  "components/marketing/curriculum-vis/",
  "components/marketing/hero/",
  "components/marketing/journey-grid/",
  "components/marketing/marketing-footer/",
  "components/marketing/pricing-cards/",
  "components/marketing/product-pillars/",
  "components/marketing/prompt-vis/",
  "components/marketing/research-stats/",
  "components/marketing/score-vis/",
]

/**
 * Monospace is correct here because monospace is the CONTENT: source code in
 * the code block, and a tabular running time in the audio player
 * (bible paper-first-banned-patterns, the monospace-content carve-out).
 */
const MONO_IS_CONTENT = [
  "components/lesson/code-block.tsx",
  "components/shared/audio-player.tsx",
]

const HISTORICAL = [
  "app/redesign",
  "app/redesign_v2",
  "app/old-design",
  "app/logo_picker",
  "app/score-card-variants",
  "components/marketing/redesign/",
  "components/marketing/gwth-redesign/",
  "components/marketing/editorial-homepage/",
  // Underscore-prefixed: Next does not route it, so it is dead code kept for
  // reference rather than a surface anyone can reach.
  "app/(public)/_news/",
]

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules") continue
      walk(full, out)
    } else {
      out.push(full)
    }
  }
  return out
}

const ALL = walk(ROOT)
const rel = (f: string) => relative(ROOT, f).replaceAll("\\", "/")
const current = (f: string) => !HISTORICAL.some((h) => rel(f).startsWith(h) || rel(f).includes(h))

const pending = (f: string) => NOT_YET_CONVERTED.some((p) => rel(f).startsWith(p))
const monoContent = (f: string) => MONO_IS_CONTENT.some((p) => rel(f) === p)

const CSS_MODULES = ALL.filter((f) => f.endsWith(".module.css") && current(f))
const CURRENT_TSX = ALL.filter(
  (f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx") && current(f)
)
/** Converted surfaces: what batch 1 locked in. */
const CONVERTED_TSX = CURRENT_TSX.filter((f) => !pending(f))
const CONVERTED_CSS = CSS_MODULES.filter((f) => !pending(f))

/** Split a stylesheet into `selector { body }` pairs, comments stripped. */
function rules(css: string): { selector: string; body: string }[] {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const out: { selector: string; body: string }[] = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(stripped))) {
    const selector = (m[1] ?? "").trim().replace(/\s+/g, " ")
    if (!selector || selector.startsWith("@")) continue
    out.push({ selector, body: m[2] ?? "" })
  }
  return out
}

describe("paper-first: soft corners (R2)", () => {
  /**
   * A panel is a rule that paints a surface AND draws a boundary on all four
   * sides. Under R2 every one of those carries a radius; a square corner on a
   * current surface is the defect (bible paper-first-banned-patterns, the one
   * reversed ban). David: "all the sharp corners make me feel uneasy".
   */
  it("every bordered panel in a current stylesheet declares a radius", () => {
    const offenders: string[] = []
    for (const file of CONVERTED_CSS) {
      for (const { selector, body } of rules(readFileSync(file, "utf8"))) {
        const boundary = /(^|;|\s)border:\s*1px\s+solid\s+var\(--v-(line|accent|btn|ink)\)/.test(body)
        const surface = /background:\s*var\(--v-(surface|quiet|bg)\)/.test(body)
        if (!boundary || !surface) continue
        if (/border-radius/.test(body)) continue
        offenders.push(`${rel(file)} :: ${selector}`)
      }
    }
    expect(offenders).toEqual([])
  })
})

describe("paper-first: hairlines are not ink", () => {
  /**
   * A boundary draws in the measured --v-line token, and a decorative divider
   * in --v-line-soft. --v-ink as a border is a near-black rule in light mode
   * and a near-WHITE outline in dark, which is what "a grid of aggressive
   * outlines" describes (bible boundary-contrast-check, paper-first-tokens).
   */
  it("no current stylesheet draws a border in --v-ink", () => {
    const offenders: string[] = []
    for (const file of CONVERTED_CSS) {
      const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
      for (const line of css.split("\n")) {
        if (/border[a-z-]*:\s*[\d.]+px\s+(solid|dashed)\s+var\(--v-ink\)/.test(line)) {
          offenders.push(`${rel(file)} :: ${line.trim()}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it("no current component draws a border in the Tailwind ink token", () => {
    const offenders: string[] = []
    for (const file of CONVERTED_TSX) {
      const src = readFileSync(file, "utf8")
      if (/\bborder-foreground\b/.test(src)) offenders.push(rel(file))
    }
    expect(offenders).toEqual([])
  })
})

describe("paper-first: two type families, and mono is never a label", () => {
  /**
   * JetBrains Mono survives only where monospace is the CONTENT (code,
   * terminal output). As a label, metadata or kicker face it is retired with
   * FDE (bible paper-first-register, paper-first-banned-patterns).
   */
  const CODE_CONTEXT = /bg-muted|CodeBlock|<code|<pre|tabular|font-mono">\{code/

  it("no current component uses font-mono outside a code context", () => {
    const offenders: string[] = []
    for (const file of CONVERTED_TSX) {
      if (monoContent(file)) continue
      for (const line of readFileSync(file, "utf8").split("\n")) {
        if (!/\bfont-mono\b/.test(line)) continue
        if (CODE_CONTEXT.test(line)) continue
        offenders.push(`${rel(file)} :: ${line.trim().slice(0, 90)}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it("no current stylesheet sets the mono family on a label class", () => {
    const offenders: string[] = []
    for (const file of CONVERTED_CSS) {
      for (const { selector, body } of rules(readFileSync(file, "utf8"))) {
        if (!/font-family:\s*var\(--font-(mono|jetbrains)\)/.test(body)) continue
        // Monospace as CONTENT: a code block, terminal output, or the shared
        // prompt a lab quotes verbatim.
        if (/pre|code|kbd|samp|prompt|terminal|output/i.test(selector)) continue
        offenders.push(`${rel(file)} :: ${selector}`)
      }
    }
    expect(offenders).toEqual([])
  })
})

describe("paper-first: no small-caps metadata", () => {
  /**
   * An uppercase, letter-spaced label is the FDE small-caps metadata line.
   * Labels are Public Sans in sentence case (bible paper-first-components,
   * metadata rows). David: "Please don't have these eyebrows".
   */
  it("no current component pairs uppercase with tracked letter-spacing", () => {
    const offenders: string[] = []
    for (const file of CONVERTED_TSX) {
      for (const line of readFileSync(file, "utf8").split("\n")) {
        if (/\buppercase\b/.test(line) && /tracking-\[0\.\d+em\]/.test(line)) {
          offenders.push(`${rel(file)} :: ${line.trim().slice(0, 90)}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })

  it("no current stylesheet letter-spaces a label past 0.04em", () => {
    const offenders: string[] = []
    for (const file of CONVERTED_CSS) {
      for (const { selector, body } of rules(readFileSync(file, "utf8"))) {
        const m = body.match(/letter-spacing:\s*(0\.\d+)em/)
        if (!m) continue
        if (Number(m[1]) <= 0.04) continue
        offenders.push(`${rel(file)} :: ${selector} (${m[1]}em)`)
      }
    }
    expect(offenders).toEqual([])
  })
})

describe("paper-first: no eyebrow above a headline", () => {
  /**
   * The masthead kicker sat above every marketing headline and usually
   * repeated it. David, on /waitlist: "I don't like having the small wait list
   * text above the join the waitlist, it looks too much like it's being
   * designed by AI. Please don't have these eyebrows, especially when they
   * repeat what's in the main message or title."
   */
  it("no marketing page renders a masthead kicker", () => {
    const offenders = CONVERTED_TSX.filter((f) =>
      /mastheadKicker/.test(readFileSync(f, "utf8"))
    ).map(rel)
    expect(offenders).toEqual([])
  })

  it("no stylesheet still defines the retired kicker class", () => {
    const offenders = CONVERTED_CSS.filter((f) =>
      /^\.mastheadKicker\s*\{/m.test(readFileSync(f, "utf8"))
    ).map(rel)
    expect(offenders).toEqual([])
  })
})

describe("paper-first: no invented issue numbers", () => {
  /**
   * "Decorative metadata (Vol. 1, invented issue numbers)" is banned outright
   * (bible paper-first-banned-patterns). The course page was printing
   * "Issue 01 · Month 1" over every month.
   */
  it("no current component prints an issue number", () => {
    const offenders: string[] = []
    for (const file of CONVERTED_TSX) {
      for (const line of readFileSync(file, "utf8").split("\n")) {
        if (/>\s*(Issue|Vol\.?|Volume)\s*(No\.?\s*)?[0{]/.test(line)) {
          offenders.push(`${rel(file)} :: ${line.trim().slice(0, 90)}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
