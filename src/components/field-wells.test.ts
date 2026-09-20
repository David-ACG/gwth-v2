/**
 * Every form field on the site is filled with the QUIET token.
 *
 * David, on /contact in dark mode (bead gwth-launch-88z.32.15): "The dark
 * version of this doesn't look quite right, it needs some light colour as
 * well, like maybe a lighter background to the boxes." The fix was one rule,
 * applied everywhere a field exists: a field well steps UP onto --v-quiet, so
 * it is the lightest surface on the page, rather than being filled with the
 * page ground (--v-bg) or the card (--v-surface) and reading as a hole in the
 * panel around it.
 *
 * The first pass missed three files, because each one had to be found by hand.
 * This test does the finding: it walks every CSS module, picks out the rules
 * whose selector names a field, and fails if one of them is filled with
 * anything but the quiet fill. It also holds the matching ink rule, because
 * --v-muted on the quiet fill measures 4.31:1 light and 4.05:1 dark, under the
 * 4.5:1 text bar (measured in src/app/paper-first-tokens.test.ts).
 */
import { describe, expect, it } from "vitest"
import { readdirSync, readFileSync, statSync } from "fs"
import { join, relative } from "path"

const ROOT = join(__dirname, "..")

function cssModules(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...cssModules(path))
    else if (entry.endsWith(".module.css")) out.push(path)
  }
  return out
}

/** A selector that names a text field, a textarea or a select. */
const FIELD = /(^|[.\s,])(input|textarea|select|searchInput|filterSelect|field)\b/i

/** Selectors that name a state or a wrapper, not the field's resting fill. */
const NOT_A_RESTING_FILL = /:(hover|focus|focus-visible|focus-within|disabled|checked|active)|\[aria-invalid|Wrap|Row|Group|Label|Error|::placeholder/

type Rule = { file: string; selector: string; body: string }

function rules(): Rule[] {
  const found: Rule[] = []
  for (const file of cssModules(ROOT)) {
    const css = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      found.push({
        file: relative(ROOT, file),
        selector: m[1]!.trim().replace(/\s+/g, " "),
        body: m[2]!,
      })
    }
  }
  return found
}

const ALL = rules()

describe("gwth-launch-88z.32.15: a form field is filled with --v-quiet", () => {
  const wells = ALL.filter(
    (r) =>
      FIELD.test(r.selector) &&
      !NOT_A_RESTING_FILL.test(r.selector) &&
      /background(-color)?:\s*var\(--v-/.test(r.body)
  )

  it("finds the field rules at all, so a passing sweep means something", () => {
    expect(wells.length).toBeGreaterThanOrEqual(6)
  })

  for (const well of wells) {
    it(`${well.file} · ${well.selector} is the quiet fill`, () => {
      const fill = well.body.match(/background(?:-color)?:\s*(var\(--v-[a-z-]+\))/)
      expect(fill?.[1], `${well.file} ${well.selector}`).toBe("var(--v-quiet)")
    })
  }
})

describe("gwth-launch-88z.32.15: placeholder ink clears the reading bar", () => {
  const placeholders = ALL.filter(
    (r) => r.selector.includes("::placeholder") && /color:\s*var\(--v-/.test(r.body)
  )

  it("finds the placeholder rules", () => {
    expect(placeholders.length).toBeGreaterThanOrEqual(5)
  })

  for (const rule of placeholders) {
    it(`${rule.file} · ${rule.selector} is not the metadata ink`, () => {
      const ink = rule.body.match(/color:\s*(var\(--v-[a-z-]+\))/)
      // --v-muted is the metadata ink. On the quiet fill it measures under
      // 4.5:1, so a placeholder sitting in a field well uses --v-soft.
      expect(ink?.[1], `${rule.file} ${rule.selector}`).not.toBe("var(--v-muted)")
    })
  }
})
