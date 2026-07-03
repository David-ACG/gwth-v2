# Handoff: GWTH.ai Homepage Redesign

## Overview
Two complete homepage explorations for **GWTH.ai** — a UK-first applied AI programme for working adults. Three months, five hours a week, async-first, no coding required, ending in a verifiable "Dynamic Score" credential.

This bundle contains two distinct directions, each rendered at four breakpoints (desktop light, desktop dark, mobile light, mobile dark) inside a side-by-side design canvas. Pick one direction (or remix) and ship it.

## About the Design Files
The files in this bundle are **design references** — interactive HTML prototypes built with React + Babel, showing the intended look, layout, copy, and behavior. They are not production code to copy verbatim.

The task is to **recreate these designs in the target codebase's existing environment** (Next.js, Astro, plain React, etc.) using its established patterns, libraries, and conventions. If no codebase exists yet, pick the best-fit framework for a marketing site (Next.js or Astro recommended) and implement there.

You can open `Homepage Redesign.html` directly in a browser to interact with the prototypes — pan/zoom the canvas, drag artboards to reorder, click any artboard's expand control to focus it fullscreen.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and component composition are all locked. Implement pixel-perfectly:
- Exact hex values from the design tokens listed below
- Exact font stacks (Inter Tight + JetBrains Mono)
- Exact section ordering, paddings, and component proportions
- All copy verbatim — it has been editorially reviewed

Animations on the prototype (hover transitions, button states) are deliberately understated; preserve that restraint.

---

## Two Directions

### Direction A — "Editorial / Course catalogue"
Calm, type-driven, almost newspaper-like. Mint accent. Built around a numbered list of seven user journeys ("01 Worried", "02 Reskilling"…), three product pillars, a curriculum timeline, a Dynamic Score card mockup, pricing, and an FAQ-style footer. Suits an audience that wants to read and decide.

### Direction B — "Active / Conversion-led"
Higher contrast, more visual surface area, aqua accent. Same content backbone, but front-loads the score visualisation, uses larger type, more whitespace breaks, and a more aggressive primary CTA gradient. Suits an audience that needs to be sold on the outcome.

Both directions share `styles.css` (tokens + reset + button system + logo) and use `data.js` for copy. Each direction has its own component file (`dirA.jsx` / `dirB.jsx`) and its own stylesheet (`styles-dirA.css` / `styles-dirB.css`).

---

## Screens / Sections

Each direction is a single long-scroll homepage. Sections, in order:

### 1. Nav
- Sticky-ready top bar, transparent background that picks up the page surface
- **Brand**: `<GwthWordmark height={22} />` left-aligned
- **Links** (desktop only): "How it works", "Curriculum", "Dynamic Score", "Pricing"
- **CTAs**: quiet "Sign in" link + primary "Start the course" button (charcoal in light, cream in dark for direction A; aqua gradient in direction B)
- **Mobile**: links collapse to a burger; primary CTA stays visible

### 2. Hero
- Eyebrow line ("Applied AI · 3 months · No code required")
- H1, ~64–80px desktop / 36–44px mobile, `letter-spacing: -0.02em`, `text-wrap: pretty`
- Sub-paragraph at 18–20px, `--fg-muted`
- Two CTAs: primary + ghost ("Watch the 90-second tour")
- Direction A copy: "Become the person on your team who can actually use AI."
- Direction B copy: "Stop watching AI change the world. **Start building with it.**" (accent-coloured second sentence)

### 3. Proof strip
- Tiny mono label "Built around UK employer signal"
- Six logo-style word marks in a flex row: `CIPD · BCS · Tech UK · FT Future Skills · TechNation · Innovate UK`
- Treat as text-only word marks (not actual logos) — see `PROOF_LOGOS` in `data.js`

### 4. Journey list (7 entries) — Direction A
Numbered ordered list; each row has `01–07`, a tag chip, a sentence-case headline, body copy, and (sometimes) a stat callout or CTA. Hover state lifts the row 1px. Alternating mint/aqua accents on tag chips.

### 5. Product pillars (3 cards) — both directions
Three equal columns on desktop, stacked on mobile. Each card: `01 / 02 / 03` mono label, label, title, body. See `PRODUCT_PILLARS` in `data.js`.

### 6. Curriculum timeline
Browser-chrome device frame containing a 12-week vertical timeline, weeks grouped into 3 modules. Mono week numbers on the left rail.

### 7. Dynamic Score showcase
Faux UI card showing a circular score gauge, score history chart, verification badge ("Verified by GWTH.ai"), and shareable link affordance. Direction B leans on this section harder — bigger card, animated dial, "live" updated label.

### 8. Pricing
Single pricing card. Headline `£29` per month, `£87` for the full 3 months. Tick list of inclusions. Side-by-side comparison vs traditional bootcamp (£8,000+) and "do nothing" (free, but you fall behind).

### 9. CTA band — Direction B only
Full-bleed dark band on a near-black ink-950 surface with a centered repeat of the hero CTA. "Three months. One score. Start tomorrow."

### 10. Footer
- Top: descriptor paragraph + 4 link columns (Course, Company, Trust, Contact)
- Bottom: copyright line + mono build label
- **No wordmark in footer** (per stakeholder feedback — keep nav as the only logo lockup)

---

## Components

### `<GwthWordmark height={22} />` (`components/logo.jsx`)
Renders both PNG variants stacked, with CSS controlling which is visible based on the closest `.theme-*` ancestor:
- `assets/logo-on-light.png` — black mark on transparent (for light surfaces)
- `assets/logo-on-dark.png` — cream mark on transparent (for dark surfaces)

Both PNGs are pre-cropped to a tight bbox and alpha-keyed. Do not re-introduce blend modes — the assets are clean.

### `<GwthIcon size={16} />`
A clipped 1:1 crop of the wordmark PNG showing only the `G + arrow` glyph. Used inside score badges. Same theme-aware swap.

### Buttons (`styles.css`)
- `.btn` — base. 40px tall (sm: 32, lg: 48). `border-radius: 8px` (lg: 10).
- `.btn--primary` — themed:
  - light surface → charcoal `#191817` bg, cream `#FBFAF8` text
  - dark surface → cream `#FBFAF8` bg, charcoal `#191817` text
  - **Important**: rules use `!important` to defeat the `.gwth a { color: inherit }` reset.
- `.btn--accent` — mint primary (mint-500 bg, very dark teal text)
- `.btn--accent2` (Direction B only) — aqua gradient (`linear-gradient(180deg, var(--aqua-500), var(--aqua-600))`) with inset highlight + colored shadow
- `.btn--ghost` — transparent with border
- `.btn--link` — text-only

### Cards / surfaces
- Default surface: `var(--bg)`; elevated: `var(--bg-elev)` (`#FFFFFF` light, `#1F1E1C` dark)
- Borders: `var(--border)` 1px, soft for inner divisions
- Shadows are minimal — `--shadow-sm` only on raised cards. No drop-shadow stacks.

---

## Design Tokens

Defined as CSS custom properties in `styles.css` under `:root`, `.theme-light`, `.theme-dark`.

### Warm neutral ramp (hue ≈ 60, warmer than gray)
| Token | Hex |
|---|---|
| `--ink-0` | `#FFFFFF` |
| `--ink-25` | `#FBFAF8` |
| `--ink-50` | `#F5F4F1` |
| `--ink-100` | `#ECEBE6` |
| `--ink-200` | (warm light gray) |
| `--ink-300` | (warm mid-light) |
| `--ink-400` | (warm mid) |
| `--ink-500` | (warm body-text gray) |
| `--ink-700` | `#2D2C2A` |
| `--ink-800` | `#1F1E1C` |
| `--ink-900` | `#191817` |
| `--ink-950` | `#100F0E` |

(Exact mid-ramp values are in `styles.css` — read them from there.)

### Brand accents
- **Mint** primary accent — `--mint-500: #1CBA93` (Direction A primary accent, also the arrow in the logo). `--mint-300`, `--mint-600` for hover/depth.
- **Aqua** secondary accent — Direction B primary accent. `--aqua-500`, `--aqua-600` for the gradient buttons.

### Theme mappings
- **Light**: `--bg: var(--ink-25)` `#FBFAF8`, `--fg: var(--ink-900)` `#191817`, `--bg-muted: var(--ink-50)`
- **Dark**: `--bg: var(--ink-900)` `#191817`, `--fg: var(--ink-25)` `#FBFAF8`, `--bg-elev: #1F1E1C`, `--bg-muted: #1B1A19`

### Typography
- Display + body: **Inter Tight**, weights 400/500/600/700, `letter-spacing: -0.02em` on headings, `-0.01em` on buttons
- Mono (mono labels, week numbers, score values): **JetBrains Mono**, weights 400/500/600
- Both loaded from Google Fonts in `Homepage Redesign.html` `<head>`
- Body size 16px, leading 1.55. Headline scale: 14 → 16 → 18 (sub) → 24 → 32 → 48 → 64 → 80.
- `text-wrap: pretty` on all `h1`/`h2`/big paragraphs.

### Spacing
8px base. Common values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 120. Section vertical rhythm is 96px desktop, 64px mobile.

### Border radius
- Inputs/sm buttons: 6px
- Default buttons / chips / small cards: 8px
- Large buttons: 10px
- Cards: 12–16px
- Pricing card / score card: 20px

### Shadows
Minimal. Light surface elevated card uses `0 1px 0 rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.08)`. Dark surface uses inset white at 0.03 alpha + soft black drop.

---

## Interactions & Behavior

- **Buttons**: 120ms ease background/border/color transition on hover. Primary darkens one step (light) or brightens one step (dark). Accent2 (aqua) brightens via `filter: brightness(1.04)`.
- **Journey rows** (Direction A): 1px upward translate on hover, soft border tint shift.
- **Pillar cards**: subtle `--bg-muted` background shift on hover.
- **Score gauge**: animated dial fill on first viewport entry (200ms ease-out from 0 → score value). Use IntersectionObserver — do not autoplay off-screen.
- **Theme**: not user-toggleable on the page itself; the canvas just shows both for review. Production should respect `prefers-color-scheme` and offer a manual override stored in localStorage.
- **Responsive**: hard breakpoint at 768px. Below that, `is-mobile` class flips nav, hero stack, pillars to single column, and pricing comparison to vertical.
- **Footer**: link columns become a 2-col grid on mobile, single-col below 480px.

---

## State Management

This is a marketing homepage — minimal client state:
- Nav burger open/closed (mobile)
- Score gauge animation state (one-shot per mount)
- Theme preference (localStorage + `prefers-color-scheme` fallback)
- Form state for any newsletter / "talk about cohorts" inputs (not designed in this round — confirm with PM before building)

No data fetching for the static homepage. The Dynamic Score on the showcase card is illustrative and can be hardcoded; real score data would be fetched on the authenticated `/score/:id` page (out of scope here).

---

## Assets

| Path | What | Source |
|---|---|---|
| `assets/logo-on-light.png` | GWTH.ai wordmark — black mark on transparent | Derived from user-supplied `logo-light.png` (cropped + alpha-keyed) |
| `assets/logo-on-dark.png` | GWTH.ai wordmark — cream mark on transparent | Derived from user-supplied `logo.png` (dark-bg variant) |

Both are 765×146 (light) / 764×146 (dark). The originals were 1024×1024 with heavy padding and full-bleed backgrounds; the processed versions are tight crops with transparent surrounds. Use these processed PNGs — do not regress to the originals.

Need higher-res or vector? Ask the user for the original SVG before shipping to production. The PNGs are sharp at the sizes used in the design (max 24px tall in nav) but will pixelate if scaled past ~48px tall.

---

## Files in this bundle

```
design_handoff_gwth_homepage/
├── README.md                       — this file
├── Homepage Redesign.html          — entry point; loads both directions in a design canvas
├── styles.css                      — shared tokens, reset, buttons, logo
├── styles-dirA.css                 — Direction A section styles
├── styles-dirB.css                 — Direction B section styles
├── design-canvas.jsx               — canvas component (review-only; do NOT ship)
├── components/
│   ├── data.js                     — all copy: JOURNEYS, PRODUCT_PILLARS, PROOF_LOGOS
│   ├── dirA.jsx                    — Direction A page composition
│   ├── dirB.jsx                    — Direction B page composition
│   └── logo.jsx                    — GwthWordmark + GwthIcon components
└── assets/
    ├── logo-on-light.png
    └── logo-on-dark.png
```

To preview locally: open `Homepage Redesign.html` in any browser (no build step — it uses Babel-standalone for JSX). Pan/zoom with trackpad; click an artboard's expand affordance to focus.

---

## Implementation notes for Claude Code

1. **Don't ship the design canvas.** `design-canvas.jsx` is review infrastructure. The actual pages to build are `dirA.jsx` and `dirB.jsx` (or whichever direction is chosen).
2. **CSS variables → your tokens.** Map the `--ink-*` ramp and `--mint-*` / `--aqua-*` accents into the codebase's existing token system rather than re-importing `styles.css` wholesale.
3. **Components → your library.** The `.btn` system is opinionated; if the codebase has a Button component, port the variants (`primary`, `accent`, `accent2`, `ghost`, `link`) to it rather than introducing a parallel class system.
4. **Theme via class on `<html>` or `<body>`.** The `theme-light` / `theme-dark` classes drive every surface. Match that pattern in production.
5. **Confirm the direction with the PM before building.** Both are designed to be shippable, but they imply different audiences.
