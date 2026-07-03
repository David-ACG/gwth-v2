# GWTH Redesign — "Stone & Sage" (E2-E)

**Locked 2026-04-29 via the `/redesign_v2` swatch picker.** Variant E2-E from the redesign exploration. Lives in production at `/` (and the variant file at `src/app/redesign/v-e-2-e/page.tsx`). Authoritative tokens: `src/app/globals.css` (`:root` and `.dark`, lines ~103–256) and `src/app/redesign/v-e-2-e/page.tsx` for the layout.

## Colour palette

### Light mode

| Token | Value | Hex approx | Role |
|---|---|---|---|
| `--background` | `oklch(0.965 0.004 75)` | `#F4F1EC` | Warm stone page bg |
| `--foreground` | `oklch(0.22 0.008 75)` | `#39342C` | Charcoal-stone text |
| `--card` | `oklch(0.99 0.003 75)` | `#FBF9F5` | Near-white warm card |
| `--primary` | `#a94c2e` | `#A94C2E` | **Terracotta CTA** |
| `--primary-foreground` | `oklch(0.98 0.005 75)` | `#FAF7F1` | Text on primary |
| `--accent` | `#a94c2e` | `#A94C2E` | Same as primary |
| `--secondary` / `--muted` | `oklch(0.92 0.005 75)` | `#E8E4DD` | Warm muted stone |
| `--muted-foreground` | `oklch(0.42 0.012 75)` | `#6A6358` | Subdued warm grey |
| `--border` / `--input` | `oklch(0.86 0.008 75)` | `#D6CFC2` | Warm beige |
| `--ring` | `#a94c2e` | `#A94C2E` | Focus ring |
| `--sidebar` | `oklch(0.93 0.006 75)` | `#EBE6DD` | Slightly darker than bg |
| `--variant-warm` (mustard accent) | `oklch(0.72 0.13 80)` | ~`#C99A3A` | Section numbers, byline tints |
| `--variant-panel-bg` (postscript) | `#8a8170` | `#8A8170` | **Locked warm stone panel** |
| `--variant-drench-bg` (stats section) | `oklch(0.32 0.005 75)` | `#3F3C36` | Charcoal-stone drench |

### Dark mode

| Token | Value | Hex approx | Role |
|---|---|---|---|
| `--background` | `oklch(0.2 0.005 75)` | `#2C2924` | Deep warm forest |
| `--foreground` | `oklch(0.94 0.005 75)` | `#EFEBE3` | Warm off-white |
| `--card` | `oklch(0.24 0.005 75)` | `#39362E` | Slightly lighter than bg |
| `--primary` / `--accent` / `--ring` | `#a94c2e` | `#A94C2E` | Terracotta (unchanged across modes) |
| `--secondary` / `--muted` | `oklch(0.25 0.005 75)` | `#3A372F` | Warm dark grey |
| `--muted-foreground` | `oklch(0.72 0.012 75)` | `#B6AE9F` | Warm grey text |
| `--border` | `oklch(1 0 0 / 14%)` | `rgba(255,255,255,0.14)` | Subtle white |
| `--sidebar` | `oklch(0.17 0.005 75)` | `#26231E` | Slightly darker than bg |
| `--variant-warm` | `oklch(0.8 0.14 80)` | ~`#D8A648` | Mustard gold accent |
| `--variant-panel-bg` (postscript) | `#22301f` | `#22301F` | **Locked near-black forest** |
| `--variant-drench-bg` | `oklch(0.32 0.005 75)` | `#3F3C36` | Same charcoal drench |

### Functional status / grade colours

- Status: completed `oklch(0.6 0.18 145)` (green), in-progress `oklch(0.7 0.18 220)` (aqua), not-started `oklch(0.6 0.02 220)`, locked `oklch(0.45 0.02 220)`
- Grade: A green / B mint / C amber / D orange / F red (full OKLCH in `globals.css:159–168` + dark mode `:244–248`)

## Typography

Loaded via `next/font/google` in `src/app/layout.tsx`. Stack:

| Variable | Font | Role |
|---|---|---|
| `--font-public-sans` | **Public Sans** | Display + UI (primary sans) |
| `--font-vollkorn` | **Vollkorn** | Editorial body / italic pull-quotes (serif) |
| `--font-inter` | Inter | Sans fallback |
| `--font-jetbrains` | JetBrains Mono | Code + small caps source labels |

Final stacks (from `@theme inline`):

```css
--font-sans: var(--font-public-sans), var(--font-inter), "Public Sans", "Inter", ui-sans-serif, system-ui, sans-serif;
--font-serif: var(--font-vollkorn), "Vollkorn", ui-serif, Georgia, serif;
--font-mono: var(--font-jetbrains), "JetBrains Mono", ui-monospace, monospace;
```

The `.variant-serif` utility class swaps an element into Vollkorn — used for the italic deck (`"Start building with it."`), body paragraphs, blockquotes, and Stay Current price labels.

## Geometry & tokens

- `--radius: 0.625rem` (10px). Tailwind `radius-sm/md/lg/xl/2xl` derived from this.
- Letter-spacing on display H1: `tracking-[-0.025em]`; on H2: `tracking-[-0.022em]`.
- Uppercase eyebrows / labels: `text-[11px] uppercase tracking-[0.2em] font-bold` (these are functional, not the banned decorative pills).
- Hairlines: `border-b border-foreground/30` for in-flow rules; `border-b-2 border-foreground` for section terminators.
- Section padding: `py-20 sm:py-24 md:py-28`. Max content width: `max-w-6xl` (1152 px), gutters `px-5 sm:px-8`.

## Section recipe (E2-E variant page)

1. **Top nav** — 64 px high, `border-b-2 border-foreground`, terracotta filled "Get started" button (square corners, `border-2`).
2. **Hero** — left: H1 in `font-sans`, italic Vollkorn deck in `text-primary`, then two serif body paragraphs at 18 px / `leading-[1.7]`. Right: `<HeroDevice />`. Mustard pull-quote (`variant-warm-panel`) sits below the CTAs.
3. **Research strip** — full-width foreground band, white-on-black, uppercase tracking-wide source list.
4. **Pillars** — left column section label + display H2 with italic Vollkorn closer; right column numbered `§ 01…` list separated by `border-t-2 border-foreground`.
5. **Journeys** — 3-column grid with double-border cells (`border-r-2 border-b-2 border-foreground/15`), each card has `variant-warm-panel` tag chip + mustard `No. NN`.
6. **Stats drench** — `.variant-drench` (charcoal). Huge mustard stat numbers (`text-7xl`, `font-feature-settings: 'tnum'`), serif label, mono citation line.
7. **Pricing** — 3 tiers inside a single `border-2 border-foreground` frame; middle tier (`flag` set) uses `bg-primary text-primary-foreground`, "Stay Current" tier uses `variant-warm-panel` (mustard).
8. **Postscript** — `.variant-panel` (locked warm stone `#8a8170` light / `#22301f` dark), big display headline with italic Vollkorn middle line.
9. **Footer** — two-column with logo, three nav lists, footer rule `border-t-2 border-foreground`, mono small-print row.

## To reuse in another project

Copy these blocks from `src/app/globals.css`:

1. The `@theme inline` mappings (lines 31–97) — they map the CSS variables to Tailwind utility names (`bg-primary`, `text-foreground`, etc.).
2. The `:root` block (lines 103–179) and `.dark` block (lines 185–256) — the Stone & Sage tokens.
3. The variant utility classes (`.variant-drench`, `.variant-panel`, `.variant-warm-panel`, `.variant-warm-text`, `.variant-serif`) from lines 1063–1112.

And from `src/app/layout.tsx`, the four `next/font/google` loaders (Public Sans, Vollkorn, Inter, JetBrains Mono) with the `--font-public-sans`, `--font-vollkorn`, `--font-inter`, `--font-jetbrains` CSS variables on `<html>`.

That gives you the full palette + type system in another Next.js project. If the other project is not Next.js, swap the `next/font` loaders for `<link>` tags to Google Fonts with the same families.
