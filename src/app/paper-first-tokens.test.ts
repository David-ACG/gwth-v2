/**
 * The paper-first contrast audit, run against what globals.css actually ships.
 *
 * The bible (`paper-first-tokens`, `boundary-contrast-check`) says the token
 * set was solved against a contrast table, that a nudge silently breaks it,
 * and that "whatever ships these tokens must keep an equivalent check" to
 * `design/n9-register/build8.py`. This file is that check. It reads the hexes
 * out of `globals.css`, so it measures the live palette rather than a copy of
 * it, and it fails the moment a token moves without its ratios still holding.
 *
 * Added with the 2026-09-19 dark step (bead gwth-launch-88z.32.15), where the
 * dark card, quiet fill, boundary and divider moved together and the light
 * boundary darkened to clear 3:1 on the light quiet fill.
 */
import { describe, expect, it } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

const GLOBALS = readFileSync(join(__dirname, "globals.css"), "utf8")

/** Every `--v-*` hex declared in one scope of globals.css. */
function tokens(scope: "light" | "dark"): Record<string, string> {
  const stripped = GLOBALS.replace(/\/\*[\s\S]*?\*\//g, "")
  const opener = scope === "dark" ? ".dark {" : ":root {"
  const from = stripped.indexOf(opener)
  if (from < 0) throw new Error(`no ${opener} block in globals.css`)
  const body = stripped.slice(from, stripped.indexOf("\n}", from))
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/(--v-[a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    out[m[1]!] = m[2]!.toLowerCase()
  }
  return out
}

/** WCAG 2.1 relative-luminance contrast, so every claim here is measured. */
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

const MODES = [
  { name: "light", t: tokens("light") },
  { name: "dark", t: tokens("dark") },
] as const

/** The three surfaces a boundary or a piece of text can sit on. */
const SURFACES = ["--v-bg", "--v-surface", "--v-quiet"] as const

describe("paper-first tokens: every mode declares the whole set", () => {
  for (const { name, t } of MODES) {
    it(`${name} declares every --v-* role`, () => {
      for (const key of [
        "--v-bg",
        "--v-surface",
        "--v-quiet",
        "--v-ink",
        "--v-soft",
        "--v-muted",
        "--v-line",
        "--v-line-soft",
        "--v-btn",
        "--v-btn-text",
        "--v-accent",
      ]) {
        expect(t[key], `${name} is missing ${key}`).toBeTruthy()
      }
    })
  }

  it("keeps the one button, identical in both modes", () => {
    // paper-first-tokens: "the one control a student actually presses never
    // changes". The LABEL is deliberately a different near-black per mode.
    expect(tokens("dark")["--v-btn"]).toBe(tokens("light")["--v-btn"])
  })
})

describe("boundary-contrast-check: the worst of every surface it touches", () => {
  for (const { name, t } of MODES) {
    for (const surface of SURFACES) {
      it(`${name}: --v-line clears 3:1 on ${surface}`, () => {
        // The rule is the worst of the four, not the easy one: a line that
        // clears on the page ground can still vanish on the card or on the
        // quiet fill sitting on it. Form fields are filled with --v-quiet,
        // so the quiet fill is a real boundary surface, not a decoration.
        expect(contrast(t["--v-line"]!, t[surface]!)).toBeGreaterThanOrEqual(3)
      })
    }

    it(`${name}: the decorative divider stays under the boundary bar`, () => {
      // --v-line-soft is never load-bearing. If it ever cleared 3:1 it would
      // be a second boundary token, and somebody would start using it as one.
      for (const surface of SURFACES) {
        expect(contrast(t["--v-line-soft"]!, t[surface]!)).toBeLessThan(3)
      }
    })
  }
})

describe("text clears its bar on every surface it can sit on", () => {
  for (const { name, t } of MODES) {
    for (const surface of SURFACES) {
      it(`${name}: ink and body copy clear 4.5:1 on ${surface}`, () => {
        expect(contrast(t["--v-ink"]!, t[surface]!)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(t["--v-soft"]!, t[surface]!)).toBeGreaterThanOrEqual(4.5)
      })
    }

    it(`${name}: metadata clears 4.5:1 on the ground and on the card`, () => {
      // --v-muted is deliberately NOT cleared on --v-quiet: it measures
      // 4.31:1 light and 4.05:1 dark there, which is why anything on the
      // quiet fill, placeholders included, is --v-soft instead.
      expect(contrast(t["--v-muted"]!, t["--v-bg"]!)).toBeGreaterThanOrEqual(4.5)
      expect(
        contrast(t["--v-muted"]!, t["--v-surface"]!)
      ).toBeGreaterThanOrEqual(4.5)
    })

    it(`${name}: the button label clears 4.5:1 on its button`, () => {
      expect(
        contrast(t["--v-btn-text"]!, t["--v-btn"]!)
      ).toBeGreaterThanOrEqual(4.5)
    })

    it(`${name}: the accent clears 3:1 on the ground`, () => {
      expect(contrast(t["--v-accent"]!, t["--v-bg"]!)).toBeGreaterThanOrEqual(3)
    })
  }
})

describe("gwth-launch-88z.32.15: the dark surfaces step apart", () => {
  // David, on /contact in dark mode: "The dark version of this doesn't look
  // quite right, it needs some light colour as well, like maybe a lighter
  // background to the boxes." The card used to sit 1.16:1 above the ground,
  // so a dark panel was told apart by its boundary alone, and a field filled
  // with the page ground read as a hole punched in the panel.
  const dark = tokens("dark")

  it("puts the card a visible step above the page ground", () => {
    expect(
      contrast(dark["--v-surface"]!, dark["--v-bg"]!)
    ).toBeGreaterThanOrEqual(1.28)
  })

  it("puts the quiet fill above the card, so a field is the lightest surface", () => {
    expect(
      contrast(dark["--v-quiet"]!, dark["--v-bg"]!)
    ).toBeGreaterThan(contrast(dark["--v-surface"]!, dark["--v-bg"]!))
    expect(
      contrast(dark["--v-quiet"]!, dark["--v-surface"]!)
    ).toBeGreaterThanOrEqual(1.1)
  })

  it("keeps light mode's surface order too", () => {
    const light = tokens("light")
    // Light inverts: the card is the lightest thing, the quiet fill is a
    // tint on it. What has to hold in both is that the three are distinct.
    const ratios = [
      contrast(light["--v-surface"]!, light["--v-quiet"]!),
      contrast(light["--v-surface"]!, light["--v-bg"]!),
    ]
    for (const r of ratios) expect(r).toBeGreaterThan(1.02)
  })
})
