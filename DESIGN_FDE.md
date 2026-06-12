# Design System: GWTH.ai — FDE Journal Register

> **This guide supersedes [DESIGN.md](DESIGN.md) (Stone & Sage) for every
> student-facing surface.** Chosen by David on 2026-06-12. Stone & Sage remains
> documented for surfaces that have not flipped yet (see §8 Migration Notes),
> but no NEW surface ships in Stone & Sage.

**Source of truth:** the implemented exemplar at
[src/components/marketing/home-fde/](src/components/marketing/home-fde/)
(`home-fde.tsx` + `home-fde.module.css` + `README.md`). It is live in
production as the homepage at `http://192.168.178.50:3000/` (the original
`/home-fde` review route was deleted when the design was promoted to `/`).
The inner public pages (`/labs`, `/lessons`, `/pricing`, `/for-teams`,
`/about`, `/news`) already follow the register via their own `*-fde` modules
under `src/components/marketing/`.

When this guide and the exemplar disagree, the exemplar wins; fix the guide.

---

## 1. Overview — the register

**Creative North Star: "A careful journal, not a SaaS landing page."**

The site reads like a serious print journal: serif body and display (Source
Serif 4), monospaced metadata in small caps (JetBrains Mono), paper-cream
surfaces on a sage page ground, hairline rules instead of shadows, square
corners everywhere, and saturated colour used in *blocks* (a drenched
dark-teal hero band, colour-block card tops, a deep-teal dispatch band)
rather than in gradients or glows.

Key characteristics:

- **Serif-first.** Source Serif 4 carries display AND body. The italic `em`
  is the accent voice, coloured ochre.
- **Mono metadata.** JetBrains Mono, ~0.7rem, 0.16em tracking, uppercase,
  for kickers, bylines, issue numbers, sources, button labels. It marks
  "this is data", never decoration.
- **Paper and ink.** Tinted paper surfaces (`--v-surface`) on a sage ground
  (`--v-bg`), near-black ink text. Dark mode is the same paper idea at
  night: warm ink-green ground, cream ink.
- **Colour in blocks.** Teal/moss/rust appear as solid bands and card tops,
  never as text gradients, never as tints behind body copy.
- **Hairlines, not shadows.** 1px rules (`--v-line`, `--v-ink`) structure
  the page. The system is flat; the single sanctioned shadow is a hard
  offset block on the credential panel hover (no blur).
- **Square corners.** `border-radius: 0` on buttons, cards, panels, inputs.
  Rounded corners are a Stone & Sage tell; in FDE nothing is rounded.
- **Light + dark parity from day one** via scoped custom properties with a
  `.dark` override block (§8).

Everything DESIGN.md rejected still stands: no eyebrow pills, no gradient
text, no fabricated stats or logos, no glassmorphism, no hero-metric
template, no identical-feature grids (§7).

---

## 2. Design tokens

The complete palette, extracted verbatim from
[home-fde.module.css](src/components/marketing/home-fde/home-fde.module.css).
Tokens are CSS custom properties declared on the module's `.shell` root with
a `:global(.dark) .shell` override block. The `--v-` prefix is the register's
namespace ("variant", kept for continuity); use these names site-wide.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--v-bg` | `#e8e9de` | `#14160f` | Page ground (sage paper / ink night) |
| `--v-surface` | `#f1ecdc` | `#1f211a` | Card / panel paper, one step off the ground |
| `--v-ink` | `#1a1c18` | `#ece8d2` | Primary text, strong hairlines, outline buttons |
| `--v-soft` | `#3a3c34` | `#b8b5a3` | Body / secondary copy |
| `--v-muted` | `#5a5c52` | `#8a8b7d` | Mono labels, captions, tertiary copy |
| `--v-line` | `#c8c8b8` | `#2e3128` | Primary hairline (card borders, list rules) |
| `--v-line-soft` | `#d8d4c4` | `#2a2c24` | Internal dividers inside cards |
| `--v-teal` | `#2c4a47` | `#1f3a37` | Hero/masthead band, card flavour 1, brand colour |
| `--v-teal-deep` | `#1f3a37` | `#162927` | Dispatch band, solid-button hover |
| `--v-cream` | `#ece8d2` | `#ece8d2` | Text on teal/moss/rust bands |
| `--v-cream-muted` | `rgba(236,232,210,.85)` | (inherits) | Standfirst / secondary text on teal |
| `--v-hero-line` | `rgba(236,232,210,.25)` | `rgba(236,232,210,.18)` | Hairlines on teal bands |
| `--v-ochre` | `#c08a36` | `#d4a062` | Accent: stats, hover titles, italic `em` on paper |
| `--v-ochre-bright` | `#d4a062` | `#d4a062` | Italic `em` accent on teal bands |
| `--v-moss` | `#2a4530` | `#3a5a3f` | Card flavour 2 |
| `--v-rust` | `#a87528` | `#c08a36` | Card flavour 3 |
| `--v-action` | `#2c4a47` | `#4d7a55` | Solid button background |
| `--v-action-text` | `#ffffff` | `#ece8d2` | Solid button text |
| `--v-dash` | `rgba(26,28,24,.18)` | `rgba(236,232,210,.18)` | Inactive progress dash |
| `--v-dash-active` | `#2c4a47` | `#6ea877` | Active progress dash |

Declaration pattern (copy this verbatim into any new module — see §8 for
why it is per-module for now):

```css
.shell {
  --v-bg: #e8e9de;
  /* ... full light block ... */
  background: var(--v-bg);
  color: var(--v-ink);
  font-family: var(--font-source-serif), Georgia, serif;
  color-scheme: light;
}

:global(.dark) .shell {
  --v-bg: #14160f;
  /* ... full dark block ... */
  color-scheme: dark;
}
```

(`color-scheme` is in the newer `*-fde` modules such as labs-fde; include it
so native form controls and scrollbars follow the mode.)

### Contrast-checked pairings (WCAG 2.1 ratios, computed from the hex above)

**Text-safe at any size (≥ 4.5:1 in both modes):**

| Pairing | Light | Dark |
|---|---|---|
| `ink` on `bg` | 14.0 | 14.8 |
| `ink` on `surface` | 14.5 | 13.2 |
| `soft` on `bg` / `surface` | 9.1 / 9.5 | 8.8 / 7.9 |
| `muted` on `bg` / `surface` | 5.6 / 5.8 | 5.3 / 4.7 |
| `cream` on `teal` | 7.8 | 9.9 |
| `cream-muted` on `teal` | 6.2 | 8.4 |
| `cream` on `teal-deep` | 9.9 | 11.2 |
| `cream` on `moss` | 8.6 | 6.3 |
| `action-text` on `action` | 9.6 | 4.0* |

\* Dark-mode solid buttons sit at 4.03:1 — passes AA only because button
labels are bold mono; do not shrink button text below the recipe in §5.3.

**Accent-only pairings (FAIL body-text AA — large display or decorative
use only, never the sole carrier of information):**

- `ochre` on `bg`/`surface` in **light** mode: 2.5:1. Sanctioned uses: large
  semibold stat values (`.cardStatLine strong`, `.statListValue`), hover
  title colour, italic `em` accents. Never body copy, never small labels.
  (In dark mode ochre is 7.8:1 and is text-safe.)
- `ochre-bright` on `teal`: 4.1:1 — fine for the huge italic hero `em`,
  not for small text on teal.
- `cream` on `rust` card tops: 3.3:1 light / 2.5:1 dark. The card-top label
  is a decorative flavour strip whose content (tag + number) is duplicated
  in accessible card content. Do not put load-bearing text on rust; if a
  new component needs readable text on rust in dark mode, use `--v-bg` ink
  instead of cream (6.0:1).

**Rule: never raw hex in components.** The hex values live exactly once, in
the module's `.shell` / `.dark` blocks. Everything else says `var(--v-*)`.

---

## 3. Type system

Fonts are loaded once in [src/app/layout.tsx](src/app/layout.tsx) via
`next/font` and exposed as CSS variables. FDE uses exactly two families:

- **Source Serif 4** — `var(--font-source-serif), Georgia, serif` — display
  AND body. Set as the `font-family` on `.shell` so it is the default.
- **JetBrains Mono** — `var(--font-jetbrains), ui-monospace, monospace` —
  metadata only.

No third font. No Inter on FDE surfaces (Inter is Stone & Sage).

### Serif scale (all weight 600 display, negative tracking)

| Role | Recipe | Exemplar class |
|---|---|---|
| Hero H1 (homepage) | `clamp(3rem, 8vw, 5.5rem)` / 600 / 1.04 / -0.02em, stacked `<span>` lines | `.heroTitle` |
| Masthead H1 (inner pages) | `clamp(2.6rem, 6.5vw, 4.5rem)` / 600 / 1.05 / -0.02em / `max-width: 18ch` | labs-fde `.mastheadTitle` |
| Closing H2 | `clamp(2rem, 4.5vw, 3.2rem)` / 600 / 1.08 / -0.02em / `text-wrap: balance` | `.closing h2` |
| Dispatch H2 | `clamp(1.9rem, 3.8vw, 2.8rem)` / 600 / 1.1 / -0.015em | `.dispatchTitle` |
| Section H2 | `clamp(1.8rem, 3.4vw, 2.5rem)` / 600 / 1.1 / -0.015em | `.sectionTitle` |
| Pull quote | `clamp(1.6rem, 3.4vw, 2.4rem)` / 500 *italic* / 1.3 / -0.01em | `.pullQuote blockquote` |
| Panel H3 | `1.6rem` / 600 / -0.01em | `.credentialPanel h3` |
| Card H3 | `1.18rem`–`1.3rem` / 600 / 1.25 / -0.01em | `.cardBody h3`, `.issue h3` |
| Standfirst / lead | `1.05rem`–`1.15rem` / 400 / 1.65–1.7, colour `--v-soft` (or `--v-cream-muted` on teal), `max-width` 34–44rem | `.heroStandfirst`, `.sectionLead` |
| Body | `0.93rem`–`0.98rem` / 400 / 1.6–1.7, colour `--v-soft`, `max-width: 62ch` | `.cardBody > p`, `.faqItem p` |
| Caption / stat line | `0.85rem`–`0.92rem` / 1.5, colour `--v-muted` or `--v-soft` | `.cardStatLine` |

```css
.heroTitle {
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 600;
  line-height: 1.04;
  letter-spacing: -0.02em;
}
```

### The italic-`em` accent

Emphasis inside any display heading or pull quote is an italic `<em>` at
weight 500, coloured ochre. This is the register's signature flourish —
one per heading at most.

```tsx
<h1 className={styles.heroTitle}>
  <span>Stop watching</span>
  <span>AI change</span>
  <span>the world. <em>Build.</em></span>
</h1>
```

```css
.heroTitle em   { font-style: italic; font-weight: 500; color: var(--v-ochre-bright); }
.closing h2 em  { font-style: italic; color: var(--v-ochre); }  /* on paper, plain ochre */
```

On teal bands use `--v-ochre-bright`; on paper use `--v-ochre`.

### Mono metadata convention

One reusable class, composed everywhere:

```css
.mono {
  font-family: var(--font-jetbrains), ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v-muted);
}
```

Size flexes slightly by context: `0.68rem` in card tops, `0.74rem` and
weight 600 in buttons. Tracking stays in the 0.14–0.16em band. On teal
bands the colour switches to `--v-cream-muted`.

**When to use mono:** kickers above section titles ("Why people join",
"Curriculum", "Pricing"), bylines ("UK applied AI · 5 hours a week · 3
months"), issue/lesson numbers ("Issue 01", "No. 04"), sources ("DSIT,
2025"), credential IDs, pull-quote attributions, button labels, the
hero-foot facts row. **When not to:** anything longer than one line, body
copy, headings. Mono is a label voice, not a reading voice. Separate facts
within one mono line with `·` (middle dot), not commas or dashes.

---

## 4. Idioms

The register's recurring moves. Every new surface should be assembled from
these, in this spirit.

### 4.1 Drenched teal hero / masthead band

The page opens with a full-bleed solid `--v-teal` band, cream text, ochre
italic accent. Homepage uses the two-column `.hero` (stacked H1 left,
standfirst + byline + actions right, aligned to the baseline); inner pages
use the simpler `.masthead` (mono kicker, H1 capped at 18ch, standfirst,
actions). Both close with a `--v-hero-line` hairline and a mono facts row.

```css
.hero {
  background: var(--v-teal);
  color: var(--v-cream);
  padding: clamp(4rem, 9vw, 7rem) 0 clamp(3.5rem, 8vw, 6rem);
}
.heroFoot {
  margin-top: clamp(2.5rem, 6vw, 4.5rem);
  border-top: 1px solid var(--v-hero-line);
  padding-top: 1.25rem;
  display: flex; flex-wrap: wrap; justify-content: space-between;
}
```

### 4.2 Paper-cream surfaces

Cards and panels are `--v-surface` paper with a 1px `--v-line` border on
the `--v-bg` ground. No shadow at rest, no radius. Depth comes from the
tonal step bg → surface and from hairlines, never from elevation.

### 4.3 Colour-block card tops (the flavour rotation)

Card grids carry a thin solid colour strip across the top of each card,
holding two mono labels (category left, number right) in cream. The strip
colour rotates teal → moss → rust by index:

```tsx
const CARD_FLAVOURS = [styles.flvTeal, styles.flvMoss, styles.flvRust]
// ...
<div className={`${styles.cardTop} ${CARD_FLAVOURS[index % CARD_FLAVOURS.length]}`}>
  <span>{journey.tag}</span>
  <span>No. {journey.n}</span>
</div>
```

```css
.cardTop {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 1rem; padding: 0.6rem 1.25rem; color: var(--v-cream);
  font-family: var(--font-jetbrains), ui-monospace, monospace;
  font-size: 0.68rem; font-weight: 500;
  letter-spacing: 0.16em; text-transform: uppercase;
}
.flvTeal { background: var(--v-teal); }
.flvMoss { background: var(--v-moss); }
.flvRust { background: var(--v-rust); }
```

The rotation is the register's substitute for icon grids: it gives a row of
nine cards rhythm without illustration. Contrast caveat on rust: §2.

### 4.4 Journal / issue framing for curriculum

Curriculum and course content present as *issues of a journal*: a mono
kicker ("Issue 01"), a serif title, body, and a capstone block separated by
a `--v-line-soft` hairline with a bold ink lead-in. Lessons can use the same
frame ("M1 L04 · ..."). This framing is the register's way of saying
"monthly, careful, editorial" instead of "modules and units".

### 4.5 Dash-progress affordance

Progress is a row of 3px-tall flex segments, `--v-dash` inactive,
`--v-dash-active` filled. This is the canonical progress visual for FDE
surfaces (curriculum issues today; lesson progress, course completion and
the dashboard suite tomorrow) — use it before reaching for ring charts or
rounded progress bars.

```tsx
<div className={styles.issueDashes} aria-hidden="true">
  {Array.from({ length: 12 }, (_, dash) => (
    <span key={dash} data-active={dash <= done ? "true" : undefined} />
  ))}
</div>
```

```css
.issueDashes { display: flex; gap: 0.3rem; }
.issueDashes span { height: 3px; flex: 1; background: var(--v-dash); }
.issueDashes span[data-active="true"] { background: var(--v-dash-active); }
```

It is `aria-hidden`; always pair it with text that states the same fact
(e.g. "4 of 12 lessons").

### 4.6 Pull quotes

A centred full-width quote band between sections, bounded by 1px ink rules
top and bottom (`border-block`), italic serif at display size, ochre `em`
on the payoff phrase, mono attribution underneath.

```css
.pullQuote {
  border-block: 1px solid var(--v-ink);
  padding: clamp(2.5rem, 6vw, 4rem) 0;
  text-align: center;
}
```

### 4.7 Dispatch band (pricing / CTA)

Money and commitment live on a `--v-teal-deep` band: mono kicker, serif
title with italic `em`, then a `--v-hero-line` hairline and a grid row of
price entries (bold serif value, small cream-muted description) ending in a
solid button. Reuse for any "here is the deal" moment (pricing, upgrade
prompts, cohort dates).

### 4.8 Hairline rules

Three weights of rule structure everything:

- `1px solid var(--v-ink)` — section heads (`.sectionHead`), pull-quote
  bounds, FAQ list top, closing band top. The strong editorial rule.
- `1px solid var(--v-line)` — card borders, stat-list rows, FAQ items.
- `1px solid var(--v-line-soft)` — dividers *inside* a card (stat line,
  capstone block).

On teal bands, all rules are `var(--v-hero-line)`.

### 4.9 Motion

One easing for everything: `cubic-bezier(0.16, 1, 0.3, 1)` at `200ms`, on
colour/border/box-shadow only. No transforms, no lifts, no scroll-triggered
entrances in the exemplar. Hover states are colour events: card border
darkens to ink, card title warms to ochre, solid button deepens to
teal-deep, outline button inverts.

---

## 5. Component recipes

Class-level recipes lifted from the exemplar, generalised for reuse. Names
match `home-fde.module.css`; copy the CSS into the new surface's module (or
the shared module once one exists, §8).

### 5.1 Page container

Everything sits in a single measure:

```css
.page {
  margin: 0 auto;
  width: min(1100px, calc(100% - 2.5rem));
}
```

Bands (`.hero`, `.dispatch`) are full-bleed; their *content* still uses
`.page` inside. Sections: `.section { padding: clamp(3.5rem, 7vw, 5.5rem) 0; }`.

### 5.2 Section head

Title and mono kicker on one baseline-aligned row, closed by an ink rule:

```css
.sectionHead {
  display: flex; flex-wrap: wrap; align-items: baseline;
  justify-content: space-between; gap: 0.75rem 2rem;
  border-bottom: 1px solid var(--v-ink);
  padding-bottom: 1rem; margin-bottom: 2.5rem;
}
```

```tsx
<div className={styles.sectionHead}>
  <h2 className={styles.sectionTitle}>Three monthly issues.</h2>
  <p className={styles.mono}>Curriculum</p>
</div>
<p className={styles.sectionLead}>The course reads like a careful journal...</p>
```

Section titles are short declarative sentences WITH the full stop ("Nine
journeys. One proof.", "Worth asking first."). The kicker is the category;
the title is the claim. This replaces the banned eyebrow-pill pattern.

### 5.3 Buttons

Both variants: square, mono uppercase label, 1px border, colour-only hover.

```css
.buttonSolid, .buttonOutline {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-jetbrains), ui-monospace, monospace;
  font-size: 0.74rem; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  padding: 0.8rem 1.5rem;
  border-radius: 0;
  transition: background-color 200ms cubic-bezier(0.16, 1, 0.3, 1),
    color 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Primary action */
.buttonSolid {
  background: var(--v-action); color: var(--v-action-text);
  border: 1px solid var(--v-action);
}
.buttonSolid:hover { background: var(--v-teal-deep); border-color: var(--v-teal-deep); }

/* Quiet action */
.buttonOutline {
  background: transparent; color: var(--v-ink);
  border: 1px solid var(--v-ink);
}
.buttonOutline:hover { background: var(--v-ink); color: var(--v-bg); }

.buttonSolid:focus-visible, .buttonOutline:focus-visible {
  outline: 2px solid var(--v-ochre); outline-offset: 2px;
}

/* On teal bands the pair re-skins: solid = cream chip, outline = cream hairline */
.hero .buttonSolid { background: var(--v-cream); color: var(--v-teal); border-color: var(--v-cream); }
.hero .buttonSolid:hover { background: var(--v-ochre-bright); border-color: var(--v-ochre-bright); color: var(--v-teal-deep); }
.hero .buttonOutline { color: var(--v-cream); border-color: var(--v-hero-line); }
.hero .buttonOutline:hover { border-color: var(--v-cream); }
```

One solid + one outline per action row, solid first. Author the label in
sentence case ("Get started", "Try a free lab"); the uppercase comes from
CSS (§7 on how this squares with the sentence-case rule).

### 5.4 Card (journey / content card)

```css
.card {
  display: flex; flex-direction: column;
  background: var(--v-surface);
  border: 1px solid var(--v-line);
  transition: border-color 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.card:hover { border-color: var(--v-ink); }
.cardBody { display: flex; flex-direction: column; flex: 1; gap: 0.65rem; padding: 1.25rem 1.25rem 1.4rem; }
.card:hover .cardBody h3 { color: var(--v-ochre); }
.cardStatLine {            /* optional fact footer */
  border-top: 1px solid var(--v-line-soft);
  padding-top: 0.85rem; font-size: 0.85rem; color: var(--v-muted);
}
.cardStatLine strong { font-size: 1.15rem; font-weight: 600; color: var(--v-ochre); margin-right: 0.25rem; }
```

Anatomy top to bottom: colour-block `.cardTop` (§4.3) → serif H3 → body at
`flex: 1` (equalises heights across the row) → hairline + stat/meta footer.
When the whole card is a link, wrap it in one `<Link className={styles.card}>`;
the hover border + title colour IS the affordance — no arrow icons, no
"See more →" text. Grid: `.cardsRow { display: grid; gap: 1.75rem; }` going
3-up at `min-width: 48rem`.

### 5.5 Badge / meta row

There are no pill badges in FDE. Metadata is a flat mono row, optionally on
a colour block (card top) or as a standalone kicker line:

```tsx
<p className={styles.mono}>GWTH-2026-A4F8B1 · Verified</p>
<p className={styles.heroByline}>UK applied AI · 5 hours a week · 3 months</p>
```

Status still follows colour + icon + text (§7); render it as a mono label
with a leading glyph, coloured by state (`--v-dash-active` /
`--v-ochre` / `--v-muted`), never colour alone and never a rounded chip.

### 5.6 Stat list (research / evidence rows)

```css
.statList { margin-top: 2rem; border-top: 1px solid var(--v-line); }
.statListRow {
  display: grid; grid-template-columns: 6rem minmax(0, 1fr) auto;
  align-items: baseline; gap: 1.25rem;
  border-bottom: 1px solid var(--v-line); padding: 0.9rem 0;
}
.statListValue { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.02em; color: var(--v-ochre); }
```

Value (ochre serif) — label (body) — source (mono, e.g. "ONS, 2025"). The
citation column is mandatory for any UK stat (Citation Rule, §7).

### 5.7 Highlight panel (credential card pattern)

For the one artefact a page is selling (credential, score card, certificate):
paper panel with an **ink** border (stronger than card `--v-line`), and the
register's only shadow — a hard teal offset on hover:

```css
.credentialPanel {
  background: var(--v-surface);
  border: 1px solid var(--v-ink);
  padding: 2rem 1.75rem;
  transition: box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.credentialPanel:hover { box-shadow: 0.4rem 0.4rem 0 0 var(--v-teal); }
```

Inside: mono ID line, serif name, body, then a hairline row pairing a huge
serif number (`3.4rem`, `--v-teal` light / `--v-ochre` dark) with a
right-aligned facts grid (`span` label in muted + `strong` value). One per
page maximum.

### 5.8 FAQ row

Native `<details>`, no JS, hairline-separated, mono +/− marker:

```css
.faqList { border-top: 1px solid var(--v-ink); max-width: 52rem; }
.faqItem { border-bottom: 1px solid var(--v-line); }
.faqItem summary {
  cursor: pointer; list-style: none;
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 1.5rem; padding: 1.25rem 0;
  font-size: 1.15rem; font-weight: 600;
}
.faqItem summary::-webkit-details-marker { display: none; }
.faqItem summary::after { content: "+"; font-family: var(--font-jetbrains), monospace; color: var(--v-muted); }
.faqItem[open] summary::after { content: "\2212"; }
.faqItem p { padding-bottom: 1.4rem; max-width: 62ch; font-size: 0.98rem; line-height: 1.7; color: var(--v-soft); }
```

First item ships `open` so the pattern is self-evident.

### 5.9 Header / nav (target recipe — W10)

The live `PublicNav` ([src/components/layout/public-nav.tsx](src/components/layout/public-nav.tsx))
is still Stone & Sage (frosted sticky bar); it is re-skinned as part of W10.
The FDE recipe, derived from the register's idioms:

- Sticky `top-0`, `h-16`, background `var(--v-bg)` **solid** (no
  backdrop-blur — glassmorphism is not in this register), 1px bottom border
  `var(--v-line)`.
- Wordmark: the locked GWTH.ai PNGs (theme-aware swap), as today.
- Links: the `.mono` recipe (0.7rem, 0.16em tracking, uppercase),
  `--v-muted` default, `--v-ink` active/hover. No underlines.
- Right side: outline "Log in" + solid "Sign up" using the §5.3 recipes at
  reduced padding (`0.55rem 1.1rem`).
- Mobile: hamburger sheet on `--v-surface` with hairline dividers; same
  links, CTAs at the bottom.
- Keep all behaviour (auth state, active-route logic, sheet) — this is a
  re-skin, not a rebuild.

The footer follows the same conversion: `--v-surface` ground, ink top rule,
mono column headers, serif links.

---

## 6. Application map

Every student-facing surface adopts the register. "Re-skin" means: swap the
visual layer to FDE tokens/type/recipes; do NOT change data logic, routing,
or behaviour (W7 plain progress, W8 no score / no checkout stay as they
are). Copy is done (W2) — do not rewrite text while re-skinning.

| Surface | Routes | State | What it adopts |
|---|---|---|---|
| Homepage | `/` | **Done** — IS the exemplar | — |
| Marketing inner pages | `/labs`, `/lessons`, `/pricing`, `/for-teams`, `/about`, `/news` | **Done** via `*-fde` modules | Masthead band, card rows, dispatch band |
| Remaining public pages | `/newsletter`, `/contact`, `/why-gwth`, `/tech-radar`, `/verify/[id]`, `/privacy`, `/terms` | To re-skin (W10 step 2) | Masthead, section heads, body measure; `/verify` uses the §5.7 highlight panel |
| Public nav + footer | all public pages | To re-skin (W10) | §5.9 recipe |
| Auth | `/login`, `/signup`, `/forgot-password` | **New build to FDE** (W1, Codex; gated on this guide) | Centred paper panel on `--v-bg`, ink border, serif H1 + mono kicker, §5.3 buttons, square inputs |
| Dashboard home | `/dashboard` | Re-skin (W10 step 3) | Paper cards, section heads, dash-progress, mono metadata |
| Courses index | `/courses` | Re-skin (W10) | Card grid with flavour rotation, issue framing per module |
| Course detail | `/course/[slug]` | Re-skin (W10) | Journal-issue framing, dash-progress, capstone blocks |
| Lesson viewer | `/course/[slug]/lesson/[lessonSlug]` | Re-skin (W10) | Serif reading measure (62ch), mono lesson IDs ("M1 L04"), pull quotes for key claims, hairline section rules |
| Labs (dashboard) | `/labs`, `/labs/[slug]` (dashboard group) | Re-skin (W10) | Card grid + flavour tops; lab steps as dash-progress |
| Progress | `/progress` | Re-skin (W10) | Stat list (§5.6) + dash-progress; no rings |
| Profile / Settings | `/profile`, `/settings` | Re-skin (W10) | Functional-as-is: forms keep structure; tokens, type, square inputs, hairline group dividers |
| Bookmarks / Notifications | `/bookmarks`, `/notifications` | Re-skin (W10) | Hairline list rows (FAQ-row anatomy without the toggle) |
| /guide (tester guide) | planned | **New build to FDE** (W5) | Journal-issue layout, FAQ rows, dispatch band for "how to give feedback" CTA |
| Feedback form | planned (W5) | **New build to FDE** | Paper panel, square inputs, §5.3 buttons |
| Admin (David-facing) | planned (W4) | **New build, same register** | Same tokens and type; denser tables allowed; functional priority — recipes apply where cheap |

**Functional-as-is vs re-skinned:** shadcn primitives (inputs, sheets,
dropdowns, toasts) keep their behaviour and accessibility wiring; the
re-skin overrides surface, border (square, hairline), and typography via
the scoped tokens. Charts/score widgets that W8 hides stay hidden; don't
restyle dead surfaces.

---

## 7. Rules carried over from DESIGN.md

The discipline survives the palette change. These are verbatim
obligations on every FDE surface:

1. **QA gates.** Every surface ships light AND dark, verified at
   **1440px, 768px and 412px** (six screenshots minimum) before it counts
   as done. Playwright CLI, full-page, both modes (toggle = `.dark` class
   on `<html>`). No console errors. This is the Gate 3 standard for W10
   and every W-task that touches UI.
2. **No eyebrow pills.** Banned forever (2026-04-28). The FDE equivalent
   of a section label is the mono kicker inside `.sectionHead` — plain
   text, no background, no border, no dot.
3. **Sentence-case CTAs.** Author all button/link copy in sentence case
   ("Get started", "See pricing"). The FDE button renders uppercase via
   `text-transform` as part of the mono-label idiom; that is a CSS
   rendering concern and the only sanctioned source of uppercase. Never
   author shouted copy, and never uppercase serif headings or body.
4. **No em dashes in UI copy.** Use commas, colons, semicolons, full
   stops, parentheses, or the mono middle dot (`·`) for fact separation.
5. **Status = colour + icon + text.** Never colour alone. The dash-progress
   strip is `aria-hidden` and always paired with a text statement of the
   same fact.
6. **Tokens only, never raw hex in components.** Hex lives once in the
   `.shell`/`.dark` blocks; components reference `var(--v-*)`.
7. **The Citation Rule.** Every numerical stat sits next to a named UK
   source (DSIT, ONS, CIPD, BCS) — in FDE, as the mono third column of the
   stat list or a mono suffix line.
8. **No fabricated proof.** No invented learner counts, finish rates,
   testimonials, or logo walls.
9. **Locked logo.** The GWTH.ai PNGs are the only wordmark. No SVG
   recreations (2026-04-28).
10. **Reduced motion.** The register is nearly static already; anything
    animated beyond the 200ms colour transitions must respect
    `prefers-reduced-motion`.

Stone & Sage rules that do **not** carry over (superseded by the register):
OKLCH-only values (FDE tokens are hex, declared once), rounded corners,
the 2px hover lift (FDE hovers are colour-only), `shadow-sm`/`shadow-md`
vocabulary (FDE is flat + one hard offset), the One-Family Inter rule
(FDE is serif + mono), and the aqua/mint accent system.

---

## 8. Migration notes — coexisting with Stone & Sage

### The scoping mechanism

FDE never touches `globals.css` or the Tailwind/shadcn token layer. Each
FDE page mounts a CSS-module **`.shell`** root that declares the whole
`--v-*` palette locally, with dark mode handled by a
`:global(.dark) .shell` override block (see §2). Consequences:

- Stone & Sage pages are pixel-identical until their own flip; the two
  systems cannot leak into each other.
- The site-wide theme toggle just works: it sets `.dark` on `<html>`, and
  the scoped override block re-maps every token underneath the shell.
- A page is "flipped" by wrapping its content in a module that carries the
  shell block — exactly how `labs-fde`, `pricing-fde`, `about-fde`,
  `for-teams-fde`, `lessons-fde` and `news-fde` did it.

### Duplication is deliberate (for now)

Each `*-fde` module repeats the palette block. That is accepted during the
transition: it keeps every surface independently shippable. Once W10
completes and Stone & Sage is gone from student-facing surfaces, promote
the palette to one shared stylesheet (e.g. `src/styles/fde.css` applied at
the layout level) and strip the per-module copies in a single sweep. Do not
do this mid-migration; a half-shared palette is the worst of both.

When copying the block into a new module, copy it **whole** (all ~20
tokens, light and dark, plus `color-scheme`) even if the page uses six of
them — partial palettes drift.

### Flip order (W10)

1. ~~Homepage promoted to `/`~~ — **done** (2026-06-12; review routes
   `/home-fde` and `/home-claude` deleted).
2. Remaining public/marketing: nav + footer, then `/newsletter`,
   `/contact`, `/why-gwth`, `/tech-radar`, `/verify`, `/privacy`, `/terms`.
   Copy is locked (W2); pricing copy and no-checkout rule locked (W8).
3. Dashboard suite: `/dashboard`, `/courses`, `/course/[slug]`, lesson
   viewer, `/labs/[slug]`, `/progress`, `/profile`, `/settings`,
   `/bookmarks`, `/notifications`. Commit per surface; site stays
   shippable throughout; `npm test` green after each group.
4. Auth and `/guide`: built FDE-native by W1/W5 — confirm conformance
   rather than re-skin.

Admin (W4) builds in the register from the start; it is David-facing, so
functional density beats recipe purity where they conflict.

### Verification per flipped surface

`npm test` (Vitest) green, then Playwright at the P520 deploy
(http://192.168.178.50:3001) or local dev: light + dark at 1440/768/412,
no console errors, and a spot-check that the theme toggle flips the shell
(both palette blocks present). The exemplar's `data-section` attributes
(`data-section="hero"` etc.) are the stable hooks for Playwright
assertions — carry that convention onto new surfaces.
