# GWTH.ai — Design Handoff

Date: 2026-05-17
Bundle: `gwth-handoff-2026-05-17.tar.gz`
Status: Design-complete, ready for engineering implementation

---

## What this is

A complete, working static HTML/CSS design system for **GWTH.ai** — an AI literacy platform for non-technical adults. Every page in this bundle is a real, rendering HTML file that opens in any browser. Use them as the visual source of truth when building the production app in your chosen framework.

The design system is **calm, editorial, and earth-toned**. It deliberately avoids common AI/SaaS visual tropes: no purple gradients, no decorative emoji icons, no left-border-accent cards, no teal/blue saturation, no rounded card with stripe accents. The aesthetic is closer to a thoughtful print magazine than a typical web app.

---

## Design system

### Colour palette (earth tones only)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#FBF9F4` | Main cream surface |
| `--bg-2` | `#F5F0E6` | Warm cream — alternating sections |
| `--bg-3` | `#F3E8D2` | Amber-tinted cream — deeper section bg |
| `--surface` | `#FFFFFF` | White card surface (sparingly) |
| `--sand` | `#EFE3CB` | Warm card surface |
| `--sand-warm` | `#E8D6B0` | Warmer card variant |
| `--ink` | `#22301F` | Primary text (deep forest), primary buttons |
| `--ink-2` | `#3F4A3B` | Secondary text |
| `--ink-3` | `#6F7569` | Tertiary text |
| `--stone` | `#948A76` | Muted text, hairline borders |
| `--border` | `#E5DFD2` | Default hairline border |
| `--border-strong` | `#D4CCBA` | Stronger hairline |
| `--amber` | `#B8893F` | **Main accent** — links, bullets, eyebrows, score colour |
| `--ochre` | `#A87033` | Deeper accent — stage directions, borders |
| `--clay` | `#B45B3E` | Rare accent — tone notes, emphasis |
| `--forest` | `#5C7F4A` | Score number colour |
| `--rust` | `#A94C2E` | **BRAND-ONLY** — locked logo accent, never wallpaper |

**Forbidden across the entire site:**
- Teal / blue (was removed deliberately — the system uses ink + amber instead)
- Purple / violet (any shade)
- Gradients of any kind
- Decorative emoji icons (no 🚀 ✨ 🎯 etc.)
- Left-border-accent cards (e.g. card with coloured stripe on left edge)
- Rust as wallpaper (only ever appears in the locked GWTH logo)

### Typography

External dependency: Google Fonts (Source Serif 4, Source Sans 3, JetBrains Mono)

```html
<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,500;1,8..60,600&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Family | Usage |
|---|---|
| **Source Serif 4** | Display — headlines, big numbers, italic emphasis moments |
| **Source Sans 3** | Body — paragraphs, navigation, controls |
| **JetBrains Mono** | Metadata — eyebrows (mono caps), IDs, timestamps, code, axis labels |

### Section heading rule (consistent across all pages)

```css
.section-h {
  font-family: 'Source Serif 4', serif;
  font-style: normal;     /* UPRIGHT, not italic */
  font-weight: 500;
  color: var(--ink);
}
```

### Italic is reserved for

- Big score numbers (123 / 104) — large italic Source Serif as visual hero
- Pull quotes / editorial highlights
- Closing CTA headline ("Ready when you are.")
- Tier names inside score cards (small italic emphasis)
- Stage directions on the lesson script page

### Key visual patterns

- **Hairline borders** — 1px stone, never heavy
- **No shadows** — depth comes from cream surface variation and hairlines
- **Corner crosshairs** (`.corner-cross`) — small 8x8 `+` marks at all 4 corners of major cards (hidden by default — can be enabled)
- **Section eyebrows** — mono caps 11px, letter-spacing 0.12em, stone color
- **Cards** — cream/sand surface, hairline border, no rounded card edges beyond 4px radius
- **CTAs** — `.btn-primary` (ink bg, cream text), `.btn-secondary` (cream bg, ink text, stone border)

---

## Score system (7 levels)

GWTH uses an open-ended accumulating-points score:

- 1 point per lesson completed
- 10 points per build project completed
- Engagement and reflections also earn small amounts

Score growth maps to **7 tier bands** with degree equivalents:

| Score | Tier | Maps to |
|---|---|---|
| 0–99 | **Just Starting** | New learner |
| 100–499 | **Curious** | Foundations begun |
| 500–999 | **AI-Aware** | Active learner |
| 1,000–2,499 | **Capable** | ≈ Diploma |
| 2,500–4,999 | **Skilled** | Substantial competence |
| 5,000–7,499 | **Future-Sharp** | Advanced practitioner |
| 7,500+ | **Expert** | Master-level |

Degree-equivalent reference points:
- ~12,000 ≈ BSc
- ~15,000 ≈ MSc
- ~20,000 ≈ PhD

**Placeholder data used across the site:**
- Sarah Mensah · 104 points · Curious tier · started 12 Feb 2026 · GWTH-2026-A4F8B1
- Homepage example score: 123 · Curious · +42 vs 3 months ago

When implementing, build score components to accept real data via props. Default to these placeholder values when no data is passed.

**Refresh model:** Scores don't expire. When a lesson is revised, learners need to re-engage with the updated content to maintain currency. The system uses the word **"refresh"**, never **"expired"** or **"decay"**.

---

## Pages in this bundle

11 working HTML files + the mood board reference. Each opens standalone in any browser.

### Marketing trio (public, SEO-friendly)

| File | Purpose |
|---|---|
| `gwth-home.html` | Marketing homepage — hero with score badge + photo, daily lessons section, how-it-works, lesson preview, score card, voice from curriculum, credential preview, curriculum scope, FAQ, closing CTA |
| `gwth-pricing.html` | Pricing page — 3 tiers (Free / Member / Team), comparison table, FAQ |
| `gwth-about.html` | About page — editorial essay, principles, four-step "how a lesson is made", founder note, numbers, closing CTA |

### Authenticated learner experience

| File | Purpose |
|---|---|
| `gwth-dashboard.html` | Learner dashboard — score card (matches homepage), continue lesson, activity heatmap, notes, up-next lessons |
| `gwth-lesson-viewer.html` | Interactive lesson view — student lesson reader with audio playback, text highlighting, page navigation, feedback affordances. Uses lesson M1·L01 data. |
| `gwth-lesson-reader.html` | Editorial lesson reader — alternate calm reading layout, less chrome, more focus on text |
| `gwth-credential-verification.html` | Public credential page — score card with QR code, verification ID, refresh state, print stylesheet |

### Internal / production tools

| File | Purpose |
|---|---|
| `gwth-lesson-viewer-review.html` | Instructor review tool — comment on lesson content, approval workflow, checks panel |
| `gwth-pipeline.html` | Lesson production pipeline — Studio page showing draft → review → ready → approved → needs refresh states for 18 lessons |
| `gwth-lesson-script.html` | Narrator recording script — 2-column layout (narration / direction), toggleable lesson preview pane, font-size toggle, print stylesheet. **Internal tool only, not for learners.** |

### Reference

| File | Purpose |
|---|---|
| `index.html` | Mood board — design reference showing colour palette, typography samples, UI texture examples, sample dashboard panel, credential preview, public site section. Used during design exploration. |
| `gwth-design-system-tokens.html` | Design token spec — written reference for colour, type, spacing, radius, component rules, and an anti-slop appendix |

---

## Brand assets

| File | Usage |
|---|---|
| `mp1fi9bs-gwth-logo-locked-light.svg` | Logo for light mode (forest green wordmark + rust accent dots) |
| `mp1fi9bu-gwth-logo-locked-dark.svg` | Logo for dark mode (cream wordmark + rust accent dots) |

**Both SVGs are locked brand assets.** Do not redraw, recolour, or simplify. The locked geometry uses:
- Wordmark: `#22301F` (light mode) or `#EDEAE6` (dark mode)
- Accent dots and G hook fill: `#A94C2E` (rust)

The locked SVG appears inline in the topbar of every page in this bundle. Extract it into a shared component when implementing.

## Photos

Two real photos are used in the homepage:
- Image 1 (hero right column): woman in teal jumper by curtains
- Image 2 (closing CTA left column): woman with dog on sofa

The user mentioned more photos will be added throughout the site later. Each photo card uses the same treatment: cream surface, hairline border, optional ochre top-border, italic caption underneath.

## Lesson data

- `mp8g6bol-lesson-m1_l01.json` — full structured lesson data for Module 1 Lesson 1 ("What is AI? Why does it matter now?"). 12 pages with mixed block types (paragraph, heading, figure, callout, pull-quote, etc.). Used by `gwth-lesson-viewer.html`, `gwth-lesson-reader.html`, `gwth-lesson-script.html`.
- `mp8g6kyc-media-manifest.json` / `mp8anrsb-media-manifest.json` — media inventory for the lesson (audio duration, video specs, image dimensions)

## Lesson media

- `images/fig-01.png` through `fig-17.png` — 17 lesson figures (referenced by lesson JSON)
- `audio/kokoro_main.wav` — Kokoro TTS narration, ~83.8s, mono 24kHz
- `video/intro-placeholder.mp4` — 6s placeholder intro video
- `video/build-placeholder.mp4` — 6s placeholder build video

---

## Implementation notes

### Cross-page links

All internal links use relative paths (e.g. `href="gwth-credential-verification.html"`). When porting to a framework, convert these to your router's link components.

### Responsive breakpoints

Most pages use these breakpoints:
- 1100px+ — full desktop layout (multi-column, side panes visible)
- 760–1100px — tablet (single column or 2-col collapse)
- ≤760px — mobile (full stack, sidebar overlay if any)

### Accessibility

- Semantic HTML throughout (`<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<figure>`)
- ARIA attributes on interactive components (audio player, page navigation, dialogs)
- Alt text on all images
- Logical heading hierarchy (h1 → h2 → h3)
- Focus styles preserve cream + ink palette

### Browser support

Designed for modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses:
- CSS Grid + Flexbox
- CSS custom properties
- `clamp()` for fluid type
- `oklch()` is **not** used in the working files (cream + earth palette uses hex)
- `text-wrap: pretty` and `text-wrap: balance` (graceful fallback)
- View Transitions API not used
- ES2020+ JavaScript (lesson viewer has interactive features)

### Score card component

The score card pattern appears on three pages with **identical visual structure** but different data:

- **Homepage** (`gwth-home.html`) — example data, marketing context (wrapped in "A score that's earned, lesson by lesson" section + 3 trust paragraphs below)
- **Dashboard** (`gwth-dashboard.html`) — Sarah's real data, product context (just heading + score card)
- **Credential page** (`gwth-credential-verification.html`) — public verification context, includes QR code and refresh state machine

Implement it as one reusable component that accepts `{ score, tier, trend, lastRefreshed, verificationId, issuedDate, cohortPercentile, sparklineData }` as props.

### Print stylesheets

Two pages have `@media print` rules:
- **`gwth-credential-verification.html`** — print-friendly credential for offline reference
- **`gwth-lesson-script.html`** — A4 narrator script for studio recording

Preserve these print views when implementing.

---

## What's done

- [x] Design system: tokens, type, colour, patterns
- [x] Marketing trio: home + pricing + about
- [x] Authenticated learner experience: dashboard + lesson viewer + lesson reader + credential page
- [x] Internal tools: pipeline + lesson script + lesson viewer review
- [x] Mood board + token spec reference
- [x] Real photos integrated into homepage
- [x] Lesson M1·L01 data wired into lesson views
- [x] 7-level score system consistent across pages
- [x] Cross-page navigation links in place
- [x] Print stylesheets for credential + lesson script
- [x] Mobile responsive across all pages

## What's not done (engineering work)

- [ ] Real backend / data layer (everything is placeholder)
- [ ] Auth (sign in, sign up, sessions)
- [ ] Stripe integration (pricing page is design-only)
- [ ] Real score calculation engine
- [ ] Lesson audio sync with text highlighting (UI exists, alignment data is mock)
- [ ] Onboarding flow (gap between sign-up and first lesson)
- [ ] Settings page (account, notifications, theme)
- [ ] Empty / loading / error states
- [ ] Email templates
- [ ] Other lesson content (only M1·L01 is provided as example data)
- [ ] Dashboard, lesson viewer, credential page, pipeline, lesson reader still have some teal accents — they were not stripped during the homepage earth-tone alignment. Plan to strip during framework implementation.

---

## Codex prompt template

Paste this into your Codex chat along with `gwth-handoff-2026-05-17.tar.gz` and this README:

```
I have a complete HTML/CSS design system for GWTH.ai — an AI literacy platform. I've attached:

1. gwth-handoff-2026-05-17.tar.gz — bundle with 11 working HTML files, brand assets, lesson media, lesson data JSON
2. HANDOFF-README.md — design system docs, page descriptions, implementation notes

Step 1 — Extract the bundle and read the README.
  tar -xzf gwth-handoff-2026-05-17.tar.gz

Step 2 — Recommend a stack (Next.js, Astro, Remix, etc.) and explain why. DO NOT build yet — wait for my approval.

Step 3 — Once I approve, propose a phased implementation plan:
  Phase 1: Marketing trio (home, pricing, about) — public, SEO
  Phase 2: Public credential page — single dynamic URL
  Phase 3: Authenticated learner experience (dashboard, lesson viewer, lesson reader)
  Phase 4: Internal tools (lesson script, pipeline)

Step 4 — Match the design exactly:
- Preserve colour values, fonts, spacing, hierarchy
- Convert <style> blocks to your framework's styling solution
- Keep locked SVG logos and brand photos as-is
- Earth-tone palette: NO teal, NO purple, NO gradients, NO decorative emoji
- 7-tier score system (see README)
- Build score card as reusable component accepting data via props

Step 5 — Replace placeholder data (123 / 104 scores, GWTH-2026-A4F8B1 ID, etc.) with real data via props.

Step 6 — Preserve @media print stylesheets on credential and lesson script pages.

Step 7 — Lesson script (gwth-lesson-script.html) is INTERNAL — admin-gated, not for learners.

Constraints:
- No CSS frameworks unless you recommend one in Step 2
- Google Fonts is the only external resource (Source Serif 4, Source Sans 3, JetBrains Mono)
- Mobile-responsive (preserve existing breakpoints)
- DO NOT redesign anything — implement the existing design exactly

Report at the end of each phase what you built, what to test, what's TODO, and any design decisions you had to make.

Now extract the bundle, read the README, list the HTML files with a one-line description of each, and recommend a stack with reasoning.
```
