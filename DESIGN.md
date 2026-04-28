---
name: GWTH.ai
description: 3-month AI course + dynamic verifiable credential, built around UK research.
colors:
  aqua-primary: "oklch(0.7 0.18 220)"
  mint-accent: "oklch(0.65 0.16 165)"
  near-white: "oklch(0.98 0 0)"
  graphite-warm: "oklch(0.17 0.005 60)"
  graphite-card: "oklch(0.21 0.005 60)"
  ink-deep-teal: "oklch(0.18 0.04 175)"
  warm-cream: "oklch(0.93 0.008 60)"
  cool-grey: "oklch(0.5 0.02 220)"
  warm-grey: "oklch(0.65 0.015 60)"
  border-light: "oklch(0.9 0.02 220)"
  border-dark: "oklch(1 0 0 / 12%)"
  destructive: "oklch(0.577 0.245 27.325)"
  success: "oklch(0.6 0.18 145)"
  warning: "oklch(0.75 0.15 75)"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.5vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  body-lead:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
rounded:
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.625rem"
  xl: "0.875rem"
  2xl: "1rem"
  full: "9999px"
spacing:
  micro: "0.25rem"
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  2xl: "5rem"
  section: "7rem"
components:
  button-primary:
    backgroundColor: "{colors.aqua-primary}"
    textColor: "{colors.near-white}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.aqua-primary}"
    textColor: "{colors.near-white}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-deep-teal}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.25rem"
  card:
    backgroundColor: "{colors.near-white}"
    textColor: "{colors.ink-deep-teal}"
    rounded: "{rounded.2xl}"
    padding: "1.5rem"
  pill-functional:
    backgroundColor: "{colors.aqua-primary}"
    textColor: "{colors.near-white}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
  stat-callout-mint:
    backgroundColor: "{colors.mint-accent}"
    textColor: "{colors.mint-accent}"
    rounded: "{rounded.xl}"
    padding: "0.75rem 1rem"
  stat-callout-aqua:
    backgroundColor: "{colors.aqua-primary}"
    textColor: "{colors.aqua-primary}"
    rounded: "{rounded.xl}"
    padding: "0.75rem 1rem"
---

# Design System: GWTH.ai

## 1. Overview

**Creative North Star: "The Royal Society Field Notebook"**

GWTH.ai reads like a serious UK practitioner's field notebook turned into a website — calm, declarative, dense with proof, allergic to performance. Every claim has an artefact next to it: a citation, a verify URL, a stat from DSIT, a price spelled out. The page convinces by being specific, not by being loud.

The aesthetic is **tinted-neutral with two carrying accents**: a Bright Aqua (the dominant trust signal — primary CTAs, the score widget's ring fill, status "in progress") and a Mint Green (success, completed, supporting accents). Neutrals shift hue between modes: light mode lives on a Near-White with a deep-teal foreground (cool, alert), while dark mode is a Graphite Warm — warm-charcoal hue 60, very low chroma, deliberately not the green-tinted dark of teal-based competitors.

This system explicitly rejects: AI-slop landing pages, eyebrow pills above headlines, gradient text on body copy, identical-card-grids of "features", hero-metric templates with fabricated numbers, glassmorphism-by-default, and the SaaS "trusted by" row of fake logos. It also rejects bootcamp / certificate-mill aesthetics — no gold-foil graduation imagery, no "Class of 2026" cohort theatre, no badges that imply the credential is one-shot or ornamental.

**Key Characteristics:**
- Tinted-neutral surface; OKLCH everywhere; never `#000` / `#fff`
- Two accents (Aqua primary, Mint accent) — Restrained color strategy
- Inter (sans) for body + display; JetBrains Mono for the small console / URL / status labels that mark "this is real software"
- Subtle Motion: scroll reveals, hover lifts (≤2px translate), no bounce/elastic
- Functional pills only (status badges, tier labels, content disclosure) — never decorative section setup
- Light mode default; dark mode "Graphite Warm" — both ship from day one with token parity

## 2. Colors

A Restrained palette: tinted neutrals carry the surface, two accents carry the trust signals, every numerical claim cites a UK source.

### Primary
- **Bright Aqua** (oklch(0.7 0.18 220)): the dominant trust signal. Primary CTAs, score-widget ring fill, "in progress" status, focus rings, the gradient-pair anchor for `text-gradient` (used on the H1 emphasis span only — never on body copy). Lightens to oklch(0.75 0.16 220) in dark mode for AA contrast.

### Secondary
- **Mint Green** (oklch(0.65 0.16 165)): success, completed status, "Try a free lab" sub-CTA, the second half of the H1 gradient. Lightens to oklch(0.75 0.14 165) in dark mode. Used as the journey-card stat-callout tint when the card's accent is `mint`.

### Neutral — Light Mode
- **Near-White** (oklch(0.98 0 0)): page background. The 0 chroma is deliberate — neutral surface, not warm-cream, not cool-grey.
- **Ink Deep Teal** (oklch(0.18 0.04 175)): foreground text. Cool, alert. Reads as "serious technical content" rather than "warm friendly app".
- **Cool Grey** (oklch(0.5 0.02 220)): muted-foreground for labels, captions, secondary copy.
- **Border Light** (oklch(0.9 0.02 220)): card and section borders. Always 1px.

### Neutral — Dark Mode (Graphite Warm)
- **Graphite Warm Surface** (oklch(0.17 0.005 60)): page background. Hue 60 (warm/amber axis) with very low chroma; reads as warm-charcoal, never as the green-tinted dark of teal-themed competitors.
- **Graphite Card** (oklch(0.21 0.005 60)): card surface, slightly lifted from the page bg.
- **Warm Cream** (oklch(0.93 0.008 60)): foreground text. Off-white, not bright-white.
- **Warm Grey** (oklch(0.65 0.015 60)): muted-foreground in dark mode.
- **Border Dark** (rgba white 12%): subtle white-on-warm border. Carries through to inputs and ring states.

### Status Colors (both modes, paired with text labels and icons)
- **Completed** (oklch(0.6 0.18 145)) — green
- **In Progress** (= primary aqua)
- **Not Started** (cool grey)
- **Locked** (deeper grey)

### Named Rules

**The One Voice Rule.** Aqua is the primary trust signal. On any given screen, Aqua occupies ≤10% of pixel area. Its rarity is the point — when it appears, the visitor's eye knows that's the action. If you find Aqua on a card border, a stat callout, *and* a CTA on the same fold, one of them must be demoted.

**The Tinted-Neutral Rule.** Every neutral has chroma ≥ 0.005. There is no `#000` and no `#fff` anywhere in the system. Neutrals tilt cool (hue 175-220) in light mode and warm (hue 60) in dark mode by deliberate design — not interchangeable.

**The Citation Rule.** Every numerical statistic in body copy has a named UK source visible on the same screen (DSIT, ONS, CIPD, BCS, Tech UK, Innovate UK). Stats without citations are forbidden.

**The Gradient Confinement Rule.** `text-gradient` (Aqua → Mint via `bg-clip-text`) is used exclusively on the H1 emphasis span (e.g. *"Start building with it."*). Never on body copy, never on subheadings, never on buttons. One gradient per page, full stop.

## 3. Typography

**Display Font:** Inter (with `next/font/google` self-hosting, fallback `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Inter
**Mono Font:** JetBrains Mono (with self-hosting, fallback `ui-monospace, monospace`)

**Character:** A single typeface family carries headlines and body — Inter's tight tracking and generous weight contrast does the heavy lifting. JetBrains Mono earns its place only on functional details that mark "this is real software": URL bars, status labels, version chips, the "Capstone" tag in the curriculum mock. The mono font is never decorative.

### Hierarchy
- **Display** (700, clamp(2.25rem, 5vw, 3.75rem), 1.05): Hero H1 only. Tracks tight (-0.02em) for that magazine-cover punch.
- **Headline** (700, clamp(1.875rem, 3.5vw, 2.25rem), 1.15): Section H2 ("Different reasons. Same course.", "94 projects. One score. Plain English."). Slightly looser tracking than Display.
- **Title** (600, 1.125rem, 1.35): Card titles (journey, pricing, lesson). Always sentence case.
- **Body Lead** (400, 1.125rem, 1.6): Hero sub-copy + section sub-copy. Cap line length at 65–75ch via `max-w-xl` / `max-w-2xl`.
- **Body** (400, 1rem, 1.65): Card bodies, lesson copy. Same line-length rule.
- **Label** (600, 0.75rem, 0.04em letter-spacing, sentence case): Tag pills, button labels.
- **Mono** (500, 0.75rem, JetBrains Mono): URL bars, page numbers in cards (`01`, `02`), status captions, the version tag in the footer (`v1.0`).

### Named Rules

**The One-Family Rule.** Marketing surfaces use Inter and JetBrains Mono only. No third font. Adding a serif or display face is a category-reflex tell ("trust = serif"); we earn trust through proof, not through a Cormorant Garamond H1.

**The Sentence-Case Rule.** Buttons, links, and tag pills are sentence case (e.g. *"Get started"*, *"See pricing"*, *"Worried"*) — never UPPERCASE except on the small functional labels that justify it (the "Capstone" / "EXAMPLE" disclosure pills, version chips, status mono captions). UPPERCASE on a CTA is a SaaS-landing-page tell.

**The 65ch Rule.** No body paragraph is wider than 75 characters. The hero sub-copy uses `max-w-xl`; long-form lesson body uses `max-w-2xl`. Wider than that and the eye loses the line.

**No Gradient Body Copy.** Body type is always a single solid colour (`text-foreground` or `text-muted-foreground`). The H1 emphasis span is the one exception.

## 4. Elevation

GWTH is a **flat-by-default** system with one shadow vocabulary, used sparingly. Depth is conveyed through tonal layering (background → card → muted → border) rather than shadow-stacks. Cards rest on the page; on hover they lift 2px and gain a soft secondary shadow — that's the entire elevation language.

### Shadow Vocabulary
- **Card rest** (`shadow-sm`, equivalent to `0 1px 2px rgba(0,0,0,0.05)`): the default state of every Card and journey-card. Reads as a paper card on a slightly-lighter desk.
- **Card hover** (`shadow-md`, equivalent to `0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)`): on `:hover` of any card-as-link, paired with `translate-y-[-2px]` (the global `.hover-lift` utility). Transition `200ms` ease-out.
- **Hero device** (`shadow-xl`, equivalent to `0 20px 25px -5px rgba(0,0,0,0.10)`): the browser-frame mock containing the score widget. The single elevated element above the fold — its shadow says "this is the artefact".
- **Sticky nav backdrop** (no shadow, `backdrop-blur-lg` + `bg-background/80`): the public nav at scroll uses a frosted-glass treatment, NOT a shadow. The blur is the elevation cue.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, focus) or as the single hero-device emphasis. A shadow on a section background, on a button at rest, or on body text is forbidden — that's the SaaS-landing-page reflex.

**The 2-Pixel Hover Rule.** Hover lift is exactly 2 pixels (`translate-y-[-2px]`). Larger lifts read as bouncy / elastic; smaller lifts feel arbitrary. 2px is the system-wide commitment.

## 5. Spacing & Rhythm

Spacing carries the page's pace. Tight bands compress, generous sections breathe; alternation creates rhythm, uniformity creates monotony. The base scale lives in the `spacing` tokens (`micro` 0.25rem → `section` 7rem). Use the named tokens, not raw rem values.

### Section Padding Scale

Four vertical-padding presets define the homepage cadence:

- **Marquee** (`py-24 md:py-32`, ~6rem / 8rem): Sections that are the artefact. ProductPillars (the score widget + named pillars) and FinalCTA (closing emphasis on the dark band). The page breathes around them.
- **Standard** (`py-20 md:py-28`, 5rem / 7rem = `spacing.section`): Default for content destinations. Hero, JourneyGrid, PricingCards. The canonical 7rem pulse.
- **Supporting** (`py-16 md:py-24` or `py-16 md:py-20`): Sections that ride between marquees. ResearchStats (a stats list, not a destination), MarketingFooter. Compressed so the marquee lift is felt by contrast.
- **Band** (`py-10`): Single-line strip elements. ResearchStrip. Reads as a band, not a section.

### Named Rules

**The Rhythm Rule.** Homepage sections must vary their vertical padding across at least three of the four presets above. Shipping every section at the same `py-*` value flattens the page into a uniform scroll: the eye loses cadence and every section reads as equal weight, which means none of them read as primary. Lift the marquees, compress the supporting tiles, and let bands stay narrow. As of 2026-04-28 the homepage runs `py-28 → py-10 → py-28 → py-32 → py-24 → py-28 → py-32 → py-20` at md+, a tightened-then-lifted cadence anchored on ProductPillars and FinalCTA.

**The Token-Only Rule.** Internal spacing inside components uses the named tokens (`spacing.xs` through `spacing.2xl`), not raw rem or px values. The token scale is the system's vocabulary; circumventing it produces drift across surfaces.

## 6. Components

For each component, lead with its character; specify shape, color, states, and any distinctive behaviour.

### Buttons
- **Shape:** Gently curved (`rounded-md`, 8px radius — derived from the global `--radius: 0.625rem` minus 2px).
- **Primary:** Aqua background, near-white text, `0.625rem 1.25rem` padding (lg variant uses `0.75rem 1.75rem`). Focus ring: `ring-2 ring-ring ring-offset-2`.
- **Outline:** Transparent background, ink-deep-teal text, 1px border. The "secondary" CTA — used alongside Primary in the hero ("Get started" + "Explore the Tech Radar").
- **Ghost / Tertiary:** No background, no border, foreground text only. Used inside dropdown menus and the mobile nav sheet.
- **Hover:** Inherits the system 200ms ease-out colour shift. No transform on buttons (the `.hover-lift` is reserved for cards).

### Pills (functional only)
- **Tag pills** (journey-card categories, score "Top 1%" tier label): `rounded-full`, `0.25rem 0.75rem` padding, label-weight typography. Background: `bg-{accent}/10`, text: `text-{accent}` — Aqua for `aqua` cards, Mint for `mint` cards.
- **Status pills** (in-progress, completed, locked): same shape, paired with a leading icon (Check, Clock, Lock) so meaning is never colour-only.
- **Content disclosure pills** (the "EXAMPLE" / "Locked" captions): smaller — `text-[10px]`, `tracking-[0.08em]`, often plain text (no pill background) when the surface itself is busy enough.
- **Forbidden:** decorative section-setup pills above headlines (the "● Some Section Label" pattern). The eyebrow-pill ban is absolute.

### Cards
- **Corner Style:** `rounded-2xl` (1rem) — gentle but not floppy. Tighter than a Material Card, looser than a Linear Issue.
- **Background:** Light: `bg-card` (oklch(1 0 0)). Dark: `bg-card` (oklch(0.21 0.005 60), one step lifted from the page bg).
- **Shadow Strategy:** `shadow-sm` at rest, `shadow-md` on hover — see Elevation.
- **Border:** Always 1px `border-border`. Darker borders are forbidden (the "side-stripe" anti-pattern).
- **Internal Padding:** `p-6` (1.5rem) on journey/pricing cards; `p-5` (1.25rem) on tighter contexts (curriculum modules, hero-device profile card).
- **Click affordance** (when the whole card is a Link): a small `ArrowRight` icon absolutely positioned in the top-right, 4px in from the corner, `text-muted-foreground` — gains `translate-x-0.5` on group-hover. No bottom-right "See more →" text-CTAs.

### Stat Callouts (signature)
On journey cards with a `stat`, the value renders inside a tinted callout matching the card's accent — Aqua (`bg-primary/10 text-primary`) or Mint (`bg-accent/10 text-accent`). Padding `0.75rem 1rem`, radius `rounded-xl` (0.875rem), value at `text-2xl font-bold`, label at `text-xs text-current/80`. The callout is the visual anchor of the card — bigger than the title, denser than the body.

### Inputs
- **Style:** 1px `border-border`, `bg-background`, `rounded-md`, padding `0.5rem 0.75rem`.
- **Focus:** Ring grows to `ring-2 ring-ring` with `ring-offset-2`. No glow, no border-colour shift alone.
- **Error:** Border switches to `border-destructive`, error message rendered below in `text-sm text-destructive`.
- **Mono inputs** (URL bars, code blocks): the only place font-mono enters input territory.

### Navigation (Public)
- **Style:** Sticky `top-0`, `h-16`, `backdrop-blur-lg`, `bg-background/80`, 1px bottom border.
- **Logo:** Cropped GWTH.ai wordmark (`/logo-light-cropped.png` light, `/logo_dark-cropped.png` dark), theme-aware swap with mount-state guard, `h-7 sm:h-8`.
- **Nav links:** label-weight, `text-muted-foreground` default, `text-foreground` active. No underline. Sentence case.
- **CTA:** Outline "Log in" + Primary "Sign up" on the right.
- **Mobile:** hamburger Sheet from the right; same link list, same CTAs at the bottom.

### Hero Device (signature)
A browser-frame mock — three `size-2.5` traffic-light dots (destructive/warning/success at 70% opacity), a mono URL chip showing `gwth.ai/score`, then a profile card with a score widget at its centre. The score widget itself is the bordered tinted callout on a `bg-muted/40` surface; it's the only place on the homepage where a single visual element earns a `shadow-xl`. Every other component in the system is flatter than this. The hero device is the artefact the entire page is selling.

## 7. Do's and Don'ts

### Do:
- **Do** use OKLCH for every colour value. Never `#000`, never `#fff`, never raw HSL.
- **Do** put one Aqua CTA above the fold. Pair with one Outline secondary CTA on the same row.
- **Do** carry status with both colour AND text/icon. Never colour alone.
- **Do** put the H1 emphasis on a `text-gradient` span. Exactly once per page.
- **Do** wrap whole cards in a single `<Link>` and let an absolute `ArrowRight` in the corner be the click affordance.
- **Do** use functional pills (status, tier, filter, content-disclosure) freely.
- **Do** cite UK sources by name (DSIT, ONS, CIPD, BCS) next to every stat.
- **Do** ship light + dark from day one — every new component must work in both.
- **Do** lift cards exactly 2 pixels on hover, with a 200ms ease-out transition.
- **Do** vary section padding across at least three of the four presets per page (Marquee / Standard / Supporting / Band). See §5 Rhythm Rule.
- **Do** respect `prefers-reduced-motion` — every Motion entrance is gated by `useReducedMotion`.

### Don't:
- **Don't** add a decorative eyebrow pill above any headline. Set 2026-04-28: forever banned.
- **Don't** use gradient text on body copy, sub-headings, or CTAs. The H1 emphasis span is the only exception.
- **Don't** use `border-left: 4px solid <accent>` (or any side-stripe ≥ 1px coloured border) on cards, list items, callouts, or alerts. Use full borders or background tints.
- **Don't** ship the hero-metric template (big number + small label + supporting stat + gradient accent). It's a SaaS cliché.
- **Don't** ship identical-card-grids of features (icon + heading + text, repeated 6 times). If we have 6 features, half of them aren't features.
- **Don't** ship a "trusted by" row of fabricated company logos. We say "Built around UK research" with named DSIT / ONS sources, full stop.
- **Don't** invent a learner count, a finish rate, or a testimonial. No "1,240 learners", no "94% finish".
- **Don't** use em dashes in body copy (the AI tell). Use commas, colons, semicolons, periods, or parentheses.
- **Don't** UPPERCASE buttons or CTAs. Sentence case only.
- **Don't** put a shadow on a section background, a button at rest, or body text. Shadows are state-driven only (hover, hero-device emphasis).
- **Don't** ship every section at the same `py-*` value. Uniform spacing flattens cadence and the eye reads every section as equal weight. See §5 Rhythm Rule.
- **Don't** wrap everything in a card. Most things don't need one. Nested cards are always wrong.
- **Don't** use modal as the first thought. Exhaust inline / progressive alternatives first.
- **Don't** propose, attempt, or render any SVG variant of the GWTH logo. The PNGs are locked. Set 2026-04-28.
- **Don't** ship glassmorphism / heavy backdrop-blur as decoration. The sticky nav's backdrop-blur is the only sanctioned use; everything else is flat surfaces with tinted neutrals.
