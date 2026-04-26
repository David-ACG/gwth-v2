# Claude Design prompt — GWTH.ai logo SVG vectorisation

> Paste this whole block into a fresh Claude Design conversation, then **attach the two reference images** (dark canonical + light variant) before sending. Don't shorten it — every section is load-bearing.

---

## Brief

I need you to produce a clean, production-ready SVG vector wordmark + icon set for **GWTH.ai**, a UK-first AI training platform. The visual concept is already locked from earlier image-tool exploration — your job is **faithful vectorisation**, not redesign. Hold the visual target tight; reject the temptation to "improve" it.

Two reference images attached:
- **Reference A (dark canonical)** — the visual target. Match this. Mint green accents on warm-charcoal ground.
- **Reference B (light)** — same composition recoloured for light backgrounds.

## What's in the mark

The wordmark reads **`GWTH.ai`** in a heavy bold geometric sans (Geist Bold / Inter Display Bold / Cabinet Grotesk Bold family). Critical detail in the **G**:

- The G is a real capital G — circular bowl with a small opening on the right and a short horizontal G-leg/crossbar going inward at the lower-right of the opening (the bit that makes a G readable as a G, not a C).
- The G's leg/crossbar is **replaced by a mint up-right arrow**: the arrow's shaft IS the leg (horizontal-ish, inside the bowl), and the arrowhead points up-and-right, exiting through the bowl's right-side opening.
- The dot/tittle on the lowercase **`i`** in `.ai` is **mint** — visual rhyme with the arrow.
- All other letterforms (`WTH`, `.`, `a`, `i` stem) are the foreground colour: warm off-white in dark mode, warm charcoal in light mode.

**The G must read as a G first, an arrow second.** If at any size it reads as "C with a stick" or "circle with a notch", it's wrong.

## Colour spec (exact, no substitutions)

| Token | Dark mode | Light mode |
|---|---|---|
| Ground | `#191817` (warm charcoal) | `#FAF8F4` (warm off-white) |
| Letterforms | `#FAF8F4` | `#191817` |
| Mint accent (arrow + i tittle) | `#1CBA93` | `#0E9F76` (slightly darker for contrast on off-white) |

One accent colour only (mint). **No** blue, **no** teal, **no** second colour, **no** gradients, **no** glows, **no** drop shadows, **no** outer strokes around letterforms.

## Visual references (productivity-tool quality, NOT e-learning)

Reference visual quality of: **Linear, Vercel, Stripe, Notion, Supabase**. Calm, confident, geometric, tight. Not bootcamp-bro, not aspirational-floaty, not gamified. The mark sits next to a student's name on LinkedIn as a verifiable credential — it must look trustworthy at any size, recognisable at 32–48px.

## Required deliverables

Produce all six SVGs as **separate, self-contained files**. Each must be hand-readable, properly indented, with `<title>` and `<desc>` for accessibility. **All glyphs as paths, no `<text>` elements, no font dependencies.** Backgrounds transparent (the SVGs will be placed on the design grounds via CSS).

| File | viewBox | Notes |
|---|---|---|
| `logo.svg` | `0 0 600 160` (3.75:1) | Horizontal wordmark, dark-mode colours |
| `logo-light.svg` | `0 0 600 160` | Same composition, light-mode colours |
| `icon.svg` | `0 0 100 100` (square) | Icon-only G+arrow, dark-mode colours |
| `icon-light.svg` | `0 0 100 100` | Icon-only, light-mode colours |
| `logo-stacked.svg` | `0 0 400 400` (1:1) | Icon top + wordmark bottom (LinkedIn share + OG image) |
| `logo-stacked-light.svg` | `0 0 400 400` | Stacked, light mode |

Plus one PNG export for favicon-generator upload:

- `icon-512-master.png` — 512×512 PNG of `icon-light.svg` (charcoal G+arrow on transparent), ready to drop into https://realfavicongenerator.net/

## Technical requirements

- Cap height for the wordmark: ~80 in viewBox units (so `WTH` letters span y=40 to y=120). Lowercase x-height: ~52. Stem width: ~14.
- The lowercase `a` should be **two-story** (Inter-style, with the closed upper bowl), not single-story. This was a flaw in my draft — make sure to fix it.
- The `i` stem should be the same width as cap stems (no thinning).
- The mint tittle on the `i` is a circle of radius ~8, centred on the `i` stem, sitting between cap-line (y=40) and x-height-top (y=68).
- Letter spacing: tight but not crushed. Optical balance > metric balance.
- The flat tops/bottoms of `W`'s peaks and valleys should sit exactly on the cap-line and baseline (no perpendicular-stroke overshoot).
- `H`'s crossbar at ~optical centre (slightly above geometric centre).

## Don't do

- Don't add a tagline, slogan, or sub-text under the wordmark.
- Don't centre the wordmark vertically with extra padding — bake the padding into the viewBox so consumers can place it directly.
- Don't use `<text>` elements or web-font references — every glyph as a `<path>` or `<rect>`/`<circle>` primitive.
- Don't add `<style>` blocks with classes — inline `fill=""` on each path. Keeps the SVG tree-shakeable.
- Don't include XML declaration, DOCTYPE, or any editor-tool comments (`<!-- Generated by ... -->`). Clean output.
- Don't change the concept — no playing with arrow direction, no swapping the tittle colour, no rounded corners on stems. The two reference images are the brief.

## Drafts to start from (optional, you can also start fresh)

I have a v2 hand-coded draft where most letters are correct but **the G is broken** — it reads as a ring with a notch instead of a real G. Feel free to ignore it entirely if starting clean is faster. The drafts and the visual analysis are at:

- `C:\Projects\GWTH_V2\public\logo.svg` (and the 5 sibling files)
- The G specifically: my draft has a 40° angular gap centred at -45°, which is wrong — the gap should be on the right side (~0° to +30°) with a proper inner G-leg horizontal-ish element, with the arrow shaft replacing that leg.

Don't bother fixing W/T/H/./a/i if my drafts have them right — you can lift those paths verbatim. Spend the budget on the G + the overall optical balance.

## Output format

Reply with **the six SVG files as separate code blocks** plus the PNG (or instructions for generating it). At the end, render all six at three scales each (full / medium / 32px) on their proper grounds so I can verify before I save them to disk.

Take your time on the G. Iterate as many times as you need internally before showing me output.
