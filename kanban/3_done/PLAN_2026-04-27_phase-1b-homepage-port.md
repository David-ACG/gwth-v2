# PLAN — Phase 1b: Homepage Port (Variant 1 + dirB) — 2026-04-27

> **Beads parent:** `beads_GWTH-w5y`
> **Beads children:** `beads_GWTH-2yl` (PROMPT-A) → `beads_GWTH-l3i` (PROMPT-B) → `beads_GWTH-l2i` (PROMPT-C) → parent
> **Prior context:** `kanban/1_planning/HANDOFF_2026-04-27_phase-1b-homepage-port.md`
> **Source bundle:** `kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/`
> **Phase 1a decision:** `kanban/design-artefacts/2026-04-24/concepts/homepage/DECISION.md`

---

## 1. Goal

Replace the current `src/app/(public)/page.tsx` with a port of the Phase 1a–chosen design (Variant 1 G-arrow + dirB Stripe/Supabase-flavoured layout) into Next.js 16 + Tailwind v4 + shadcn, deployed to P520 Coolify staging at `http://192.168.178.50:3001`. Hit Lighthouse gates: desktop perf ≥85 / a11y ≥90 / best-practices ≥90 / SEO ≥95; mobile perf ≥75 / a11y ≥90 / best-practices ≥90 / SEO ≥95.

Phase 1b is **staging-only**. Production (`gwth.ai` Hetzner) deploy is a later gate. Phase 1b is **Claude Code only** — does not touch Claude Design quota (currently 74% used; reserve 26% for Phase 2a after Sat 02:00 reset).

## 2. Scope (in / out)

**In scope (Phase 1b):**
- Replace `src/app/(public)/page.tsx` with a composition of new server + client components under `src/components/marketing/`.
- Reuse `src/app/(public)/layout.tsx` (Public nav + footer wrapper) — but the layout's `<PublicNav>` is the existing component; this plan reuses it (decision in §6.2).
- Preserve `WaitlistForm` from `src/components/landing/waitlist-form.tsx`.
- Preserve the JSON-LD Course schema currently at `(public)/page.tsx:112-129`.
- Archive the old `src/components/landing/` to `src/components/landing/_archived/`.
- Pre-flight Next.js 16.1.6 → 16.2.3+ security bump (CVE GHSA-q4gf-8mx6-v5v3, High DoS — see §3.6).
- New Vitest + Playwright tests; per-section snapshots × 4 viewports = 48 baselines.
- Lighthouse CI config + npm scripts.
- Add `mobile-dark` Playwright project (currently missing — only `mobile-chromium` light exists).
- P520 Coolify deploy via SSH tinker pattern.

**Out of scope (will not be done in Phase 1b):**
- Other public pages (`/labs`, `/lessons`, `/pricing`, `/for-teams`, `/about`) — they remain as-is.
- Production Hetzner deploy — Phase 1c.
- Score-engine implementation — score widget is illustrative.
- Any new dependency beyond the security bump.
- Refactor of `src/lib/data/`, `src/lib/auth.ts`, middleware password gate.
- Any Claude Design tool usage (preserve quota).
- Real journey copy drafts 5/6/7 finalisation — drafts ship; David reviews at Gate 4 (per §10).

## 3. Architecture approach

### 3.1 Directory layout

```
src/
├── components/
│   ├── marketing/                ← NEW
│   │   ├── data.ts               ← ported from variant-1-garrow/components/data.js
│   │   ├── data.test.ts
│   │   ├── hero/
│   │   │   ├── hero.tsx
│   │   │   ├── hero.test.tsx
│   │   │   ├── hero-device.tsx   (client island — 'use client')
│   │   │   └── hero-device.test.tsx
│   │   ├── score-vis/
│   │   │   ├── score-vis.tsx     (client — Motion + SVG)
│   │   │   ├── score-vis.test.tsx
│   │   │   └── score-vis.example-data.ts  (illustrative values)
│   │   ├── research-strip/
│   │   ├── journey-grid/
│   │   │   ├── journey-grid.tsx
│   │   │   ├── journey-card.tsx
│   │   │   └── *.test.tsx
│   │   ├── product-pillars/
│   │   ├── curriculum-vis/
│   │   ├── prompt-vis/
│   │   ├── research-stats/
│   │   ├── pricing-cards/
│   │   ├── final-cta/
│   │   ├── marketing-footer/
│   │   ├── json-ld/
│   │   │   ├── course-jsonld.tsx
│   │   │   └── course-jsonld.test.tsx
│   │   ├── motion-section.tsx    ← shared `useReducedMotion`-aware wrapper
│   │   └── README.md
│   └── landing/_archived/        ← old hero-section, features-section, etc.
└── app/(public)/page.tsx         ← composes the marketing components, ~80 lines
```

**Why this structure:** mirrors `src/components/{lab,course,progress,...}` — each feature module is its own directory with co-located tests and a README. The plan deliberately keeps marketing components scoped to the homepage in this phase (R10.2) — they will be reused on `/for-teams` etc. in Phase 1c, but only after this page is stable.

### 3.2 Token mapping (Tailwind v4 + shadcn)

The dirB prototype uses `--ink-*`, `--mint-*`, `--aqua-*` ramps. Map these onto the existing OKLCH semantic tokens in `src/app/globals.css` (lines 88-152 light, 158-223 dark). **No new top-level tokens.** Where a ramp step has no semantic match, derive via `color-mix(in oklch, …)` inline at the use site. Specifically:

| dirB token | Target | Notes |
|---|---|---|
| `--ink-100` | `--background` | Lightest surface |
| `--ink-200` | `--muted` | Card backgrounds |
| `--ink-300` | `--secondary` | Subtle dividers |
| `--ink-700` | `--muted-foreground` | Secondary text |
| `--ink-900` | `--foreground` | Primary text |
| `--mint-500` | `--accent` | Brand mint (`oklch(0.65 0.16 165)`) |
| `--aqua-500` | `--primary` | Brand aqua (`oklch(0.7 0.18 220)`) |
| `--mint-100` etc. | `color-mix(in oklch, var(--accent) 12%, transparent)` | Tinted backgrounds |

**Forbidden:** raw hex values (`#xxxxxx`) or `rgb()` in marketing components, except inside `<svg fill="…">` literal where token references aren't supported. Even there, prefer `fill="currentColor"` and let parent `text-…` set the colour. Linter check will grep for hex during PROMPT-A.

### 3.3 shadcn variant strategy

Map the prototype's `.btn--primary` / `.btn--accent2` / `.btn--ghost` system onto the existing shadcn `Button` variants. Existing variants (confirmed): `default | destructive | outline | secondary | ghost | link`. Sizes: `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`.

| Prototype class | shadcn variant | Notes |
|---|---|---|
| `.btn--primary` | `<Button variant="default">` | Aqua primary |
| `.btn--accent2` | `<Button variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">` | Mint variant — done via className override, not new shadcn variant. Keep variants stable. |
| `.btn--ghost` | `<Button variant="ghost">` | Existing |
| `.btn--outline` | `<Button variant="outline">` | Existing |

If the same accent override appears in 3+ places, extract a `<Button variant="accent">` *Tailwind composition* helper, not a new shadcn variant — this avoids editing `src/components/ui/button.tsx` and risking unrelated breakage.

### 3.4 Animation strategy (Motion library)

- All Motion uses go through a single `MotionSection` helper at `src/components/marketing/motion-section.tsx` that consumes `useReducedMotion()` and short-circuits to a static `<section>` when reduced. **No raw `<motion.div>` in section components.** This is the lone enforcement point for WCAG 2.3.3.
- Lazy import via `motion/react` (not the full bundle) for tree-shakability. Use `m.` mini components with `LazyMotion + domAnimation` for sections below the fold.
- The Score widget uses Motion only for the *fill* of the ring (stroke-dashoffset tween) and the sparkline reveal. The static frame is rendered server-side with the final SVG geometry — no entrance animation can shift LCP off the H1.
- Hero entrance: H1 + sub-copy + primary CTA + hero-device static frame render synchronously (no `whileInView`). Decorative orbs / spirals only animate after first paint.

### 3.5 Score widget design — Option B (Freshness Ring with Sparkline)

Per the score-decay research (full doc archived at §13 reference), the chosen pattern is **Freshness Ring + Sparkline** — Apple Activity Rings' over-fill mechanic + Strava's slope-as-decay-signal + Lighthouse's threshold-band logic.

**Visual spec:**
- Centred ring, ~180px desktop / ~120px mobile, stroked SVG `<circle>`.
- Arc fills 0 → 100. **Dashoffset formula (canonical):** `const C = 2 * Math.PI * r; const offset = C * (1 - clamp(value / passLine, 0, 1));` — at `value=0` offset=`C` (empty), at `value=100` offset=`0` (closed). Use this exact convention everywhere.
- **Pulse rule:** ring pulses once whenever the score *crosses* 100 (i.e. transitions from `<100` to `>=100`). Implementation via Motion `key={value >= passLine}` re-mount → fresh entrance keyframes on each transition. The pulse does NOT loop while value remains ≥100.
- For score >100 (bonus zone), a **second ring layer** rendered with `data-role="score-halo"` in `--primary` at higher opacity overlays from 100 → 130. Halo dashoffset: `const haloOffset = C * (1 - clamp((value - passLine) / 30, 0, 1));` — at `value=100` halo invisible, at `value=130` halo fully drawn.
- Inside the ring: large numeric (`92`) + one-line subtitle (`Passing` if `value >= passLine`, `Decaying` if last sparkline segment crosses pass-line downward, `Building` otherwise).
- Beneath the ring: a 30-day sparkline, ~120px × 24px, drawn in `var(--primary)` with a single dashed horizontal at `y=passLine`. **Decay detection rule:** if the *last segment* has `history[N-2] >= passLine` AND `history[N-1] < passLine` (crosses pass-line downward), that last segment is rendered in `--warning` (amber). "Trending down without crossing" is NOT decay — only the cross matters.
- Pulse + halo + sparkline progressive draw all gated on `useReducedMotion`.

**Component contract:**
```ts
type ScoreVisProps = {
  value: number              // 0..130
  passLine?: number          // default 100
  history?: number[]         // sparkline data, default = last 30 from history
  size?: 'sm' | 'md' | 'lg'  // 120 / 180 / 240px
  ariaLabel?: string         // default: derived
}
```

**Illustrative framing (R9.1, R9.2, R9.3):** the placeholder values (B+ / 92 / 78 / 64 / 71) live in `score-vis.example-data.ts` with a top-of-file comment:
```ts
// EXAMPLE DATA — REPLACE WHEN SCORING IS LIVE.
// Beads tracker: bd show beads_GWTH-w5y (sub-issue to be filed).
```
A small "Example score" pill renders inside the widget. A `<figcaption>`-style line below the device reads: *"Illustrative — your actual GWTH Score reflects verified work."* Sub-scores live in a visually-hidden `<dl>` for screen reader announcement (R4.1).

### 3.6 Pre-flight security upgrade (must land before any port code)

**CVE GHSA-q4gf-8mx6-v5v3 (High, DoS in Server Components) affects Next.js 16.0.0–<16.2.3.** Project is on 16.1.6.

Pre-flight commit (its own commit, before any new component code):
1. `npm install next@^16.2.3 eslint-config-next@^16.2.3 @next/bundle-analyzer@^16.2.3`
2. Verify lockfile diff is small: `git diff package-lock.json` should touch `next`, `eslint-config-next`, `@next/bundle-analyzer`, and direct peer deps only.
3. `npm test` — must pass.
4. `npm run lint` — must pass.
5. `npx tsc --noEmit` — must pass.
6. `npm run build` — must succeed; check route bundle sizes for unexpected drift.
7. Playwright smoke: `npx playwright test --project=desktop-chromium` against existing `landing.spec.ts` — must pass.
8. Tag last-good commit before this bump: `git tag pre-phase1b-port` (rollback anchor — R7.4).
9. Commit: `chore(deps): bump next to 16.2.3 for GHSA-q4gf-8mx6-v5v3`.

**Only after this commit is green** do new component changes start landing.

### 3.7 Data layer

Port `kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/components/data.js` to `src/components/marketing/data.ts`. Convert to TypeScript with explicit types. **Cross-reference pricing values against `src/lib/config.ts`** (R6 / test §1.8):

```ts
import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE, MONTH_CONFIGS } from "@/lib/config"

export const PRICING = [
  { tier: "Free Labs",    pricePence: 0,                                ... },
  { tier: "The Course",   pricePence: COURSE_MONTHLY_PRICE * 100,       featured: true, ... },
  { tier: "Stay Current", pricePence: Math.round(ONGOING_MONTHLY_PRICE * 100), ... },
] as const
```

The `PricingCards` component reads `PRICING` at render time — no inline literal numbers. Vitest test asserts `PRICING[1].pricePence === COURSE_MONTHLY_PRICE * 100`, catching drift between `data.ts` and `config.ts`.

`CURRICULUM` similarly references `MONTH_CONFIGS` — capstones, lesson counts, etc. all sourced from config.

### 3.8 JSON-LD preservation

Extract the existing JSON-LD block (`page.tsx:112-129`) into `src/components/marketing/json-ld/course-jsonld.tsx`:

```tsx
export function CourseJsonLd() {
  const data = { /* same payload as page.tsx:113-128 */ }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
```

Snapshot test (`course-jsonld.test.tsx`) asserts the rendered JSON matches a frozen reference object byte-for-byte. Plays into R5.1 mitigation. The new `(public)/page.tsx` mounts `<CourseJsonLd />` once.

`dangerouslySetInnerHTML` is **only** allowed inside this component (and any future `JsonLd` wrappers). Linter grep guard during PROMPT-A.

### 3.9 Theme handling

`next-themes` is already wired in `src/providers/theme-provider.tsx` (default light, attribute "class", enableSystem true, disableTransitionOnChange true). The marketing page reuses this — no provider changes. Existing dark toggle (in `PublicNav` or dashboard) continues to work.

### 3.10 Section composition

`src/app/(public)/page.tsx` becomes a thin composer with **8 top-level sections** mounted:

```tsx
import { Hero, ResearchStrip, JourneyGrid, ProductPillars, ResearchStats,
         PricingCards, FinalCTA, MarketingFooter } from "@/components/marketing"
import { CourseJsonLd } from "@/components/marketing/json-ld/course-jsonld"

export const metadata = { /* preserved + alternates.canonical: "/" added — see §6.9 */ }

export default function HomePage() {
  return (
    <>
      <CourseJsonLd />
      <Hero />
      <ResearchStrip />
      <JourneyGrid />
      <ProductPillars />
      <ResearchStats />
      <PricingCards />
      <FinalCTA />
      <MarketingFooter />
    </>
  )
}
```

**ProductPillars composition (resolved):** `<ProductPillars />` internally renders 3 rows. Each row mounts one of the 3 visualisation components (`<CurriculumVis />`, `<ScoreVis size="lg" />`, `<PromptVis />`) as a child of that row. The visualisations are **NOT** mounted as siblings at the page level. Each section sets its own `data-section` attribute on its root element:

| Top-level section | `data-section` value | Notes |
|---|---|---|
| Hero | `hero` | |
| ResearchStrip | `research-strip` | |
| JourneyGrid | `journey` | |
| ProductPillars | `pillars` | Wrapper with 3 rows |
| → CurriculumVis | `curriculum-vis` | Nested inside ProductPillars row 1 |
| → ScoreVis (large) | `score-vis` | Nested inside ProductPillars row 2 |
| → PromptVis | `prompt-vis` | Nested inside ProductPillars row 3 |
| ResearchStats | `research-stats` | |
| PricingCards | `pricing` | |
| FinalCTA | `final-cta` | |
| MarketingFooter | `footer` | |

The snapshot harness picks all 12 of these via `[data-section]` regardless of nesting. Total snapshot baselines: 12 sections × 4 viewport-theme combos = 48.

### 3.11 Old landing archival

Move (don't delete) `src/components/landing/` contents — except `waitlist-form.tsx` which stays in place — into `src/components/landing/_archived/`. Update any imports that still reference moved files. Archived directory keeps a stub `README.md`: *"Archived 2026-04-27 during Phase 1b homepage port. Replaced by `src/components/marketing/`. Kept for reference; do not import."*

`landing.spec.ts` and its snapshot directory (`src/__tests__/pages/landing.spec.ts-snapshots/`) are **deleted** in PROMPT-B (when the new page lands) — replaced 1:1 by `marketing-homepage.spec.ts` + `marketing-snapshots.spec.ts`.

## 4. Files affected

### New files
| Path | Purpose |
|---|---|
| `src/components/marketing/data.ts` + `.test.ts` | Ported design data, typed |
| `src/components/marketing/motion-section.tsx` | Reduced-motion-aware Motion wrapper |
| `src/components/marketing/hero/{hero,hero-device}.tsx` + tests | Hero section + client island |
| `src/components/marketing/score-vis/score-vis.tsx` + tests + `example-data.ts` | Freshness Ring widget |
| `src/components/marketing/research-strip/research-strip.tsx` + test | UK research citations |
| `src/components/marketing/journey-grid/{journey-grid,journey-card}.tsx` + tests | 7-card 3+3+1 grid |
| `src/components/marketing/product-pillars/product-pillars.tsx` + test | 3 alternating product rows |
| `src/components/marketing/curriculum-vis/curriculum-vis.tsx` + test | 3-module diagram |
| `src/components/marketing/prompt-vis/prompt-vis.tsx` + test | Workflow demo |
| `src/components/marketing/research-stats/research-stats.tsx` + test | DSIT stats grid |
| `src/components/marketing/pricing-cards/pricing-cards.tsx` + test | 3-tier pricing |
| `src/components/marketing/final-cta/final-cta.tsx` + test | Dark CTA band + WaitlistForm |
| `src/components/marketing/marketing-footer/marketing-footer.tsx` + test | 3-column footer |
| `src/components/marketing/json-ld/course-jsonld.tsx` + test | Schema.org Course |
| `src/components/marketing/README.md` | Module overview |
| `src/components/marketing/index.ts` | Barrel export |
| `src/__tests__/pages/marketing-homepage.spec.ts` | Page-level Playwright smoke |
| `src/__tests__/pages/marketing-snapshots.spec.ts` | 48-baseline visual regression |
| `.lighthouserc.json` + `.lighthouserc.mobile.json` | Lighthouse gates |

### Modified files
| Path | Change |
|---|---|
| `src/app/(public)/page.tsx` | Replaced — thin composer (~80 lines) |
| `playwright.config.ts` | Add `mobile-dark` project (clone `mobile-chromium`, set `colorScheme: "dark"`) |
| `package.json` | Bump `next`/`eslint-config-next`/`@next/bundle-analyzer`; add `lhci:desktop`/`lhci:mobile`/`lhci` scripts |
| `package-lock.json` | Lockfile updates from Next bump only |
| `src/app/globals.css` | Possibly add 1-2 derived tokens via `@theme inline` if mapping insufficient (preferred: avoid; use `color-mix` inline) |

### Moved files
| From | To |
|---|---|
| `src/components/landing/hero-section.tsx` | `src/components/landing/_archived/hero-section.tsx` |
| `src/components/landing/features-section.tsx` (and others) | `src/components/landing/_archived/…` |
| (Keep) `src/components/landing/waitlist-form.tsx` | (unmoved — preserved in place) |

### Deleted files
| Path | Reason |
|---|---|
| `src/__tests__/pages/landing.spec.ts` | Replaced by `marketing-homepage.spec.ts` |
| `src/__tests__/pages/landing.spec.ts-snapshots/*.png` | Old baselines obsolete |

### Untouched (do not modify)
- `src/components/landing/waitlist-form.tsx` — preserved verbatim
- `src/app/(public)/layout.tsx` — reuses existing PublicNav + Footer
- `src/middleware.ts` — password gate already exempts `/`
- `src/lib/config.ts`, `src/lib/data/*` — no schema changes

## 5. Risk register (top 5 watchlist)

Full risk register in §13 reference. The five to watch:

1. **R5.1 — JSON-LD dropped during refactor.** Silent SEO regression. Mitigation: extract into tested `CourseJsonLd` component before any other porting starts (lands first in PROMPT-A).
2. **R3.2 — CSS bundle bloat from `styles-dirB.css` (31K).** Will tank Lighthouse. Mitigation: plan forbids `.css` imports in `src/components/marketing/**`; all styling translates to Tailwind utilities. Linter grep enforces.
3. **R9.1 / R9.2 — Score widget illustrative framing fails or placeholder ships as truth.** Mitigation: `example-data.ts` isolation, "Example score" pill in widget, `<figcaption>` caveat below device, founder copy review at Gate 4.
4. **R7.2 — Dockerfile breakage from new dependency.** Mitigation: zero new deps in this phase except the security bump. Score widget hand-rolled SVG. Bump verified locally with `npm ci` before push.
5. **R2.1 — Hero LCP element wrong because of Motion gating.** Mobile perf gate (75) precarious. Mitigation: hero content (H1 + device static frame + CTA) renders synchronously, no `whileInView` above the fold, animations only on the *fill* of already-painted elements.

## 6. Open decisions resolved

### 6.1 Journey copy drafts 5/6/7
Ship as-is from `BRAND_BRIEF.md §2c`. Surface for David's review at Gate 4 before promotion. (David's choice (b).)

### 6.2 Marketing nav vs existing PublicNav
**Reuse existing `PublicNav`.** The existing nav already has the 5 real links (Free Labs / Lessons / Pricing / For Teams / About — confirmed in `src/app/(public)/layout.tsx`), the dark-mode toggle, and the password-gate-aware sign-in flow. Building a parallel `MarketingNav` doubles a11y/test surface for no design gain. This means the dirB nav design is achieved by **styling tweaks to `PublicNav`** if needed, not a fresh component — but only if it's a small delta. If the dirB nav has fundamentally different IA, file a follow-up beads issue rather than rebuilding in Phase 1b (R10.2).

### 6.3 Linux vs Win32 Playwright snapshot baselines
**Linux baselines** (Option A in test plan §7.3). Single source of truth, less drift. Developer regenerates baselines via:
```
docker run -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.58.2-jammy \
  npx playwright test marketing-snapshots --update-snapshots
```
Documented in `src/components/marketing/README.md`.

### 6.4 Score widget pattern
**Option B — Freshness Ring with Sparkline.** Spec in §3.5.

### 6.5 Prompt count
**3 prompts (A/B/C)** per the test plan + risk-register volume.

### 6.6 Visual regression scope
**Per-section snapshots × 4 viewport-theme combos = 48 baselines** (David's choice (c)). Add `mobile-dark` Playwright project. CI runs desktop only; mobile snapshots local-only (R8 / test plan §7.2).

### 6.7 Lighthouse mobile gate
Desktop perf ≥85 / a11y ≥90 / best-practices ≥90 / SEO ≥95.
Mobile perf ≥75 / a11y ≥90 / best-practices ≥90 / SEO ≥95.

### 6.9 SEO ≥95 prerequisites
To reliably hit SEO ≥95 (especially on mobile, where tap-target violations cost points):
- Add `alternates: { canonical: "/" }` to the page's `metadata` export.
- Ensure all CTAs use `Button size="default"` or larger (≥40px tap target) — never `size="xs"`.
- Verify `metadataBase` in root layout (already wired per CLAUDE.md template).
- JSON-LD Course schema preserved (already required).

### 6.8 CTA route audit
Smoke test enumerates every CTA:

| Section | Label | href | Status |
|---|---|---|---|
| Hero | "Get started" / WaitlistForm | (form) | Form, not link |
| Hero | "Explore the Tech Radar" | `/tech-radar` | exists |
| Journey 1 | TBD per data.ts | `/labs` | exists |
| Journey 2 | TBD | `/lessons` | exists |
| Journey 3 | TBD | `/pricing` | exists |
| Journey 4 | TBD | `/for-teams` | exists |
| Journey 5–7 | TBD | per `JOURNEYS[i].href` | verify |
| Pricing Free Labs | "Browse labs" | `/labs` | exists |
| Pricing The Course | "Start the course" | `/signup` | exists (auth-gated — see R6.3) |
| Pricing Stay Current | "Continue access" | `/signup?plan=ongoing` | exists |
| FinalCTA | WaitlistForm | (form) | Form |
| Footer | various | per `FOOTER_COLS` | enumerate in test |

PROMPT-A test catches any 404 (or 401 without `site_access` cookie when `SITE_PASSWORD` is set in CI). For `/signup` auth-gate behaviour see R6.3 — if it auth-gates anonymous users, file a beads issue but don't fix in this phase.

## 7. Acceptance criteria

The plan is "done" when **all** of the following hold:

### Code
- [ ] `src/app/(public)/page.tsx` is the new composer (~80 lines, no inline JSX content beyond imports + section list).
- [ ] All 12 marketing components present at `src/components/marketing/<name>/<name>.tsx` with co-located `<name>.test.tsx`.
- [ ] `src/components/marketing/data.ts` exports typed constants, prices reference `src/lib/config.ts`.
- [ ] `src/components/marketing/json-ld/course-jsonld.tsx` mounted exactly once on the homepage.
- [ ] `src/components/landing/waitlist-form.tsx` unchanged and rendered in `FinalCTA`.
- [ ] `src/components/landing/_archived/` contains all old hero/feature/etc. components with a stub README.
- [ ] No raw hex (`#xxxxxx`) or `rgb()` in `src/components/marketing/**` outside `<svg>` literals.
- [ ] No `.css` imports in `src/components/marketing/**`.
- [ ] No `dangerouslySetInnerHTML` in `src/components/marketing/**` outside the JsonLd component.
- [ ] All Motion uses go through `MotionSection` or otherwise gate on `useReducedMotion`.
- [ ] Pre-flight Next bump landed in its own commit, tagged `pre-phase1b-port` before the bump.

### Tests
- [ ] `npm test` (Vitest) passes; ~58 new tests added; coverage thresholds (40/35) still met.
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run lint` clean.
- [ ] `marketing-homepage.spec.ts` smoke passes on `desktop-chromium`, `desktop-dark`, `mobile-chromium`, `mobile-dark`.
- [ ] `marketing-snapshots.spec.ts` produces 48 stable baselines (re-run yields zero diffs).
- [ ] axe-core: zero `critical` and zero `serious` violations on each of the 4 viewport-theme combos.
- [ ] Reduced-motion smoke test passes (no animation observable when emulating).
- [ ] Old `landing.spec.ts` + snapshots deleted; no references remain.

### Lighthouse
- [ ] `npm run lhci:desktop` passes: perf ≥85, a11y ≥90, best-practices ≥90, SEO ≥95 (median of 3 runs against `npm run start`).
- [ ] `npm run lhci:mobile` passes: perf ≥75, a11y ≥90, best-practices ≥90, SEO ≥95.

### Deploy
- [ ] P520 Coolify deployment queued via SSH tinker against app UUID `xw4csk0ssos8800kws0cswwk`; deploy completes successfully.
- [ ] Playwright smoke against `http://192.168.178.50:3001/` passes.
- [ ] Verification screenshots captured under `kanban/2_testing/screenshots/2026-04-27_phase-1b-homepage/{desktop-light,desktop-dark,mobile-light,mobile-dark}.png`.

### Gates
- [ ] Gate 3 implementation notes appended to all 3 PROMPT files.
- [ ] Gate 4 testing checklist appended.
- [ ] PROMPT files moved to `kanban/2_testing/`.
- [ ] David's URL + actions list in Gate 4 explicit.

## 8. Test plan summary

Full spec in §13. High-level numbers:

- **Vitest:** ~58 unit/component tests across ~15 test files. Densest cluster: `score-vis.test.tsx` (~7 tests covering arc geometry, decay colouring, pulse-on-100, reduced-motion gating, sparkline path generation, ARIA exposure). Pricing test imports `src/lib/config.ts` constants directly (drift sentinel).
- **Playwright pages:** ~12 tests × 4 projects (desktop-chromium, desktop-dark, mobile-chromium, mobile-dark) = ~48 invocations.
- **Visual regression:** 12 sections × 4 viewports = 48 baseline PNGs, single parametrised spec file, masks for `[data-role="score-ring-progress"]`, `[data-role="sparkline"]`, `[data-role="hero-spirals"]`, `[data-mask="date"]`. `animations: 'disabled'` + `prefers-reduced-motion: reduce` applied.
- **axe-core:** 4 runs (one per viewport-theme) using **`@axe-core/playwright`'s `AxeBuilder`** (matches existing `landing.spec.ts:2`). `axe-playwright@2.2.2` is unused legacy — leave it in `package.json` for now (file follow-up beads issue to remove). Tags: `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`, zero `critical`+`serious` allowed, contrast rule **enabled** (tightened vs existing tests).
- **Keyboard a11y:** Tab traversal test asserts `document.activeElement` walks every interactive element in DOM order.
- **Reduced motion:** explicit Playwright test with `emulateMedia({ reducedMotion: "reduce" })`.
- **Lighthouse:** `@lhci/cli` against local `npm run start` build, median of 3, two configs (desktop/mobile). Local-only — not in CI (perf flake on shared GitHub Actions runners).

### CI integration
- Vitest + Playwright smoke + axe → existing `.github/workflows/ci.yml`, no changes needed (already runs `npm test` + Playwright).
- Per-section snapshots: desktop projects only in CI; mobile-dark + mobile-light snapshots local-only (R8.1, R8.2, R8.3 — Linux/Win32 subpixel drift).
- Lighthouse: `workflow_dispatch` trigger only, not on PRs.

## 9. Animation & polish recommendations

David asked to surface animation/component options where they'd have high impact. Recommendations (apply during PROMPT-A/B; treat as targets not requirements):

### High-impact animations
1. **Score widget pulse-on-100.** Single 600ms scale 1→1.05→1 keyframe when the ring closes. The "moment of passing" should feel earned. [Apple Activity Rings ref.]
2. **Sparkline progressive draw.** On viewport entry, the sparkline draws left-to-right via `pathLength` 0→1 over 1.2s. Adds 1 line of Motion code, transforms a static chart into a story.
3. **Journey card hover lift.** Existing `.hover-lift` utility in `globals.css:289-295` — apply to each `JourneyCard`. `transform: translateY(-2px) + box-shadow` on hover.
4. **Staggered card entrance.** First viewport entry of `JourneyGrid` cascades cards in (0.05s stagger × 7 = 350ms). Motion's `staggerChildren` variant — 5 lines of code, big polish win.
5. **Pricing tier "Featured" subtle pulse.** The Course tier (the featured one) gets a 4s ease-in-out pulse on its accent border — `box-shadow` keyframe. Caveat: must NOT pulse if reduced-motion is on; must be subtle enough to not distract reading.

### Component options to consider (founder pick)
1. **HeroDevice frame style:** (a) plain card with rounded-2xl + shadow (clean, fast), (b) phone-frame mock with rounded notch (skeumorphic, more design effort), (c) browser-frame mock with traffic lights (developer-tool-y, fits Stripe vibe). **Recommended: (c)** — matches the Stripe/Supabase positioning, signals "professional product", and the score widget reads as a dashboard inside.
2. **Pricing card "featured" treatment:** (a) larger card + accent border, (b) accent ribbon "Most popular" across the corner, (c) tilt/lift on hover with depth shadow. **Recommended: (a) + (c)** — combine.
3. **Section divider treatment:** (a) hard `border-t` between sections (boring, fast), (b) subtle radial-gradient fade between sections (premium feel), (c) no divider, just `padding`-based rhythm (Stripe-style). **Recommended: (c)** — matches dirB design language; saves CSS weight.
4. **Footer:** existing project Footer or marketing-specific? **Recommended: marketing-specific MarketingFooter** with the 3-col layout from `FOOTER_COLS` data; existing global Footer continues to be used elsewhere.

### Things to NOT add (would over-egg the page)
- Cursor-following gradient. Hot in 2024, dated and distracting.
- Confetti or celebration particle effects on pricing/CTA. Saving for a delivery-state UX, not marketing.
- Hover-to-flip cards. Mobile broken.
- Auto-scrolling testimonials carousel. Don't have testimonials anyway (R9 lockout).

## 10. Implementation strategy (3-prompt plan)

### PROMPT-A — Foundation + Hero stack
**Issue:** `beads_GWTH-2yl`. **File:** `kanban/1_planning/PROMPT_2026-04-27_phase-1b-A-foundation.md`.

Scope:
1. Pre-flight Next bump (16.1.6 → 16.2.3+).
2. Add `mobile-dark` Playwright project.
3. Move `src/components/landing/{hero-section,features-section,…}` (NOT waitlist-form) to `src/components/landing/_archived/`.
4. Scaffold `src/components/marketing/` with README + index barrel.
5. Build `data.ts` (port from variant-1-garrow `data.js`, add types, cross-reference `src/lib/config.ts`).
6. Add token-mapping notes inline (no new top-level CSS tokens; use `color-mix`).
7. Build `motion-section.tsx` (reduced-motion-aware Motion wrapper).
8. Build `JsonLd` (`course-jsonld.tsx`) — extract from current `page.tsx:112-129`. Snapshot test.
9. Build `Hero` (server) + `HeroDevice` (client island) + `ScoreVis` (Freshness Ring + Sparkline + over-fill halo, Motion-controlled, reduced-motion-gated).
10. Build `ResearchStrip`.
11. Build `JourneyGrid` + `JourneyCard` (3+3+1, all 7 cards, real CTAs).
12. Reuse existing `PublicNav` (no new MarketingNav).
13. Compose a partial `(public)/page.tsx` — Hero + ResearchStrip + JourneyGrid + JsonLd only. The remaining sections render as placeholders (`<section data-section="…" />`) so the snapshot harness has scaffolding.
14. Vitest tests for all components built above.
15. Playwright smoke + per-section snapshots for hero / research-strip / journey on all 4 viewport-theme combos. Generate Linux baselines via Docker per §6.3.
16. axe runs on the partial page (4 runs).

Acceptance: §7 sections relevant to PROMPT-A scope. Foundation + first 4 sections shippable.

### PROMPT-B — Products + Visualisations + Pricing + CTA + Footer
**Issue:** `beads_GWTH-l3i`. **File:** `kanban/1_planning/PROMPT_2026-04-27_phase-1b-B-products.md`. **Depends on:** PROMPT-A complete.

Scope:
1. Build `ProductPillars` (3 alternating rows).
2. Build `CurriculumVis` (3 modules + capstones + locked pill + footer copy).
3. Build `PromptVis` (invoice-triage workflow, sequential reveal — reduced-motion gated).
4. Build `ResearchStats` (DSIT 21% / 1-in-6 / 45%, citation footer).
5. Build `PricingCards` (3-tier, Featured highlight, prices from `PRICING` constant which references config.ts). Vitest cross-reference test.
6. Build `FinalCTA` (dark band, mounts existing `WaitlistForm` from `src/components/landing/waitlist-form.tsx`).
7. Build `MarketingFooter` (3-col from `FOOTER_COLS`).
8. Replace `(public)/page.tsx` placeholders with the new sections.
9. Delete `src/__tests__/pages/landing.spec.ts` + snapshots directory.
10. Vitest + per-section snapshots for these 7 sections.
11. Playwright full-page smoke: H1 present, all `data-section` attributes resolve, every CTA hits 200/307, WaitlistForm form submission round-trips through mocked `/api/waitlist`, JSON-LD present, reduced-motion behaviour, theme toggle round-trip.
12. 4 axe runs on the full page.

Acceptance: §7 sections relevant — full marketing homepage renders, all 12 sections present, all CTAs valid, JSON-LD verified, snapshots stable, axe clean.

### PROMPT-C — Polish + Lighthouse + Deploy + Gate 3/4
**Issue:** `beads_GWTH-l2i`. **File:** `kanban/1_planning/PROMPT_2026-04-27_phase-1b-C-polish-deploy.md`. **Depends on:** PROMPT-B complete.

Scope:
1. `npx tsc --noEmit`, `npm run lint`, `npm test`, full Playwright matrix (all projects). Fix any drift from PROMPT-B integration.
2. Add `.lighthouserc.json` + `.lighthouserc.mobile.json`. Add `lhci:desktop`, `lhci:mobile`, `lhci` scripts.
3. Run `npm run build && npm run start`, then `npm run lhci`. Hit gates:
   - Desktop: perf ≥85 / a11y ≥90 / best-practices ≥90 / SEO ≥95
   - Mobile: perf ≥75 / a11y ≥90 / best-practices ≥90 / SEO ≥95
4. If any gate fails: investigate LCP element, font preload, Motion bundle import path (`motion/react`), image optimisation (`next/image`), bundle splitting. Iterate (≤3 cycles per gate; stop and ask if blocked).
5. Manual reduced-motion sweep (visual + Playwright).
6. Tag last-good commit: `git tag phase1b-pre-deploy` before deploy.
7. Deploy to P520 Coolify via SSH tinker (handoff §"Cheat sheet").
8. Wait for deploy completion (Coolify queue → green).
9. Playwright smoke against `http://192.168.178.50:3001/` (NOT in test config; one-off invocation overriding `baseURL`).
10. Capture screenshots: `kanban/2_testing/screenshots/2026-04-27_phase-1b-homepage/{desktop-light,desktop-dark,mobile-light,mobile-dark}.png`.
11. Run Lighthouse against the deployed URL (eyeball check, not gate).
12. Append Gate 3 implementation notes to all 3 PROMPT files.
13. Append Gate 4 testing checklist to all 3 PROMPT files.
14. Move all 3 PROMPT files from `kanban/1_planning/` to `kanban/2_testing/`.
15. `bd close beads_GWTH-2yl beads_GWTH-l3i beads_GWTH-l2i beads_GWTH-w5y --reason="…"` once David approves.

Acceptance: §7 deploy + gates sections — staging URL live, Lighthouse gates met, screenshots captured, all gates appended, files moved.

## 11. Sequencing & checkpoints

```
[Day 0]  /plan (this session) → produce plan + 3 prompts → David reviews
[Day 1]  /build PROMPT-A
   ↓ pre-flight Next bump (commit 1)
   ↓ archive landing/ (commit 2)
   ↓ data.ts + JsonLd (commit 3)
   ↓ Hero + HeroDevice + ScoreVis (commit 4-5)
   ↓ ResearchStrip + JourneyGrid (commit 6)
   ↓ partial page.tsx + tests + snapshots (commit 7)
   ↓ PROMPT-A complete; David reviews 4 sections at staging-not-yet-deployed local URL

[Day 2]  /build PROMPT-B
   ↓ ProductPillars + 3 vis components (commits)
   ↓ Pricing + FinalCTA + Footer
   ↓ Full page composition
   ↓ landing.spec.ts deletion
   ↓ Full snapshot regeneration
   ↓ PROMPT-B complete; David reviews complete page locally

[Day 3]  /build PROMPT-C
   ↓ Lighthouse setup + tuning
   ↓ Deploy to P520
   ↓ Verification screenshots + Lighthouse on staging
   ↓ Gate 3/4 appended
   ↓ Files moved to 2_testing/
   ↓ David reviews staging URL + ticks Gate 4 checklists
   ↓ Bump to 3_done/
```

After PROMPT-C, the parent issue `beads_GWTH-w5y` is closeable. The post-Phase-1b quota gate `beads_GWTH-9t0` runs separately.

## 12. Don't do (carry-forward from handoff)

- Don't restart vector logo work — Phase 3 only.
- Don't reintroduce fabricated proof — no fake learner counts, no fake testimonials, no fake employer ratings, no fake partnerships, no "94% finish" stat.
- Don't redesign the curriculum or pricing — real numbers in `src/lib/config.ts`.
- Don't replace `<WaitlistForm />` — preserve `src/components/landing/waitlist-form.tsx`.
- Don't lose JSON-LD — extract into `CourseJsonLd` component before any other porting.
- Don't render the score widget as if scoring is final — `example-data.ts` + "Example score" pill + caveat.
- Don't use `<style>` blocks or class-based CSS systems — Tailwind v4 + shadcn variants only.
- Don't `npm run dev` — use `node ./node_modules/next/dist/bin/next dev --turbopack -p 3001`.
- Don't add a visible "Ctrl K" hint — keyboard-only.
- Don't render `dynamicScore.percentile`.
- Don't burn any Claude Design quota during Phase 1b — Claude Code only.
- Don't ship journey copy drafts 5/6/7 unreviewed — surface for David at Gate 4.
- Don't add tagline / sub-text under the wordmark.
- Don't centre the wordmark vertically with extra padding.
- Don't switch sessions to `GWTH_curriculum` — sibling repo for content; this is platform-only.
- Don't bypass git hooks (`--no-verify`).
- Don't deploy to Hetzner / `gwth.ai` — Phase 1b ships to P520 only.
- Don't add new dependencies **except (a) the Next.js security bump (`next`, `eslint-config-next`, `@next/bundle-analyzer`) and (b) `@lhci/cli` as devDependency for Lighthouse tooling**. Any other addition needs explicit David approval.
- Don't introduce `dangerouslySetInnerHTML` outside the `JsonLd` component.

## 13. Reference appendices (sources of truth)

- **Codebase map:** Wave 1 explorer output (in /plan session 2026-04-27).
- **Version audit:** Wave 1 version-checker output.
- **Score-decay UI research:** Wave 1 research output (Strava, Apple, FICO, Lighthouse, GitHub heatmap, Memrise — Option B chosen).
- **Risk register (full):** Wave 2 risk-analyzer output, 12 categories × ~50 risks.
- **Test plan (full):** Wave 2 test-planner output.
- **Brand brief:** `kanban/design-artefacts/2026-04-24/brand-brief/BRAND_BRIEF.md`.
- **Phase 1a decision:** `kanban/design-artefacts/2026-04-24/concepts/homepage/DECISION.md`.
- **Source bundle:** `kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/`.
- **Diagrams:** to be generated in Wave 4 of this /plan session — `kanban/1_planning/DIAGRAM_2026-04-27_phase-1b-*.excalidraw`.
- **Critic review:** to be appended below by Wave 4 plan-critic agent.

---

## Review Checklist — 2026-04-27

- [ ] Scope is correctly bounded — only `src/app/(public)/page.tsx` replaced; other pages untouched
- [ ] Technical approach matches stack (Next.js 16, Tailwind v4, shadcn new-york, Motion, next-themes)
- [ ] Files affected list is complete (new / modified / moved / deleted)
- [ ] Acceptance criteria are specific and testable
- [ ] No unexpected dependencies introduced beyond the Next security bump
- [ ] Estimated complexity (3 prompts) feels right for the scope
- [ ] Score widget framing prevents "fabricated proof" regression
- [ ] JSON-LD preservation is explicit and tested
- [ ] WaitlistForm preservation is explicit
- [ ] Token mapping doesn't introduce new global CSS variables
- [ ] Lighthouse gates are realistic (desktop ≥85 / mobile ≥75 perf)
- [ ] Linux Playwright baselines decision documented
- [ ] All "don't do" items from handoff carried forward

**Review this plan:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-04-27_phase-1b-homepage-port.md`

---

## Critic Review — 2026-04-27

Independent critic (Wave 4 of /plan pipeline) returned **REVISE** with 10 critical issues + 10 improvements. Score-card (1–10): scope clarity 8 · decomposition 7 · test coverage 7 · risk mitigation 7 · founder constraints 9 · internal consistency 6 · one-shot success likelihood 5 (8 after fixes).

**Critical issues addressed in this revision:**
- **CR-1** `landing.spec.ts` lifecycle — moved deletion from PROMPT-B Step 9 into **PROMPT-A Step 2** (alongside the `landing/` archive) so PROMPT-A's Final Checks gate is reachable.
- **CR-2** Dependency contradiction (`@lhci/cli` violated "no new deps") — PLAN §12 now explicitly permits the Next bump + `@lhci/cli` as the only allowed dependency changes.
- **CR-3** `axe-playwright` vs `@axe-core/playwright` ambiguity — PLAN §8 now declares `@axe-core/playwright`'s `AxeBuilder` as the chosen API.
- **CR-6** `playwright.config.ts` doesn't accept `PLAYWRIGHT_BASE_URL` — PROMPT-A Step 1 extended to make `baseURL` env-var-driven AND make `webServer` conditional on env var absence.
- **CR-7** Score widget dashoffset formula not pinned — PLAN §3.5 now spells out `offset = C * (1 - clamp(value / passLine, 0, 1))` with edge-case checks.
- **CR-8** Decay detection rule mismatch — PLAN §3.5 now defines decay as "last segment crosses pass-line downward" (`history[N-2] >= passLine && history[N-1] < passLine`), not "trending down". PROMPT-A test 4 updated to match.
- **CR-9** SEO ≥95 risk — PLAN §6.9 added: `alternates.canonical: "/"`, no tap-targets <40px.
- **IM-7** ProductPillars composition — PLAN §3.10 resolved: ProductPillars wraps 3 rows that internally mount the visualisation components (NOT siblings at page level); table of `data-section` values added.

**Critical issues with smaller-impact fixes applied:**
- **CR-4** Docker image tag dynamic computation — PROMPT-A Step 11 now derives the tag from `@playwright/test`'s actual installed version.
- **CR-5** Parenthesised path quoting on Win+Bash — verify-before-act commands quote `"src/app/(public)/page.tsx"`.

**Improvements applied:**
- **IM-1** Mobile snapshot CI gating — PROMPT-A snapshot spec now skips mobile projects in CI (`test.skip(process.env.CI && ['mobile-chromium', 'mobile-dark'].includes(testInfo.project.name))`).
- **IM-3** `useReducedMotion` import path — declared: import from `motion/react` for new marketing components (consistent with the Motion library directly).
- **IM-4** Docker availability check — added to PROMPT-A Step 0 verify-before-act.
- **IM-6** Coolify SSH reachability check — added to PROMPT-C Step 1.
- **IM-10** `[data-mask="date"]` consistency — added to PROMPT-A snapshot spec default mask list.

**Improvements deferred** (logged for follow-up; not blocking /build):
- IM-2 LCP element Playwright assertion (would be additional test infra; can add reactively if mobile perf gate fails).
- IM-5 Pulse-trigger key collision — fixed by clarifying §3.5 rule (pulse on crossing, not while ≥100).
- IM-8 Error / loading state coverage — verified that `(public)/error.tsx` + `loading.tsx` already exist; no work needed.
- IM-9 Hero device image sizes — hero device is inline JSX (no raster); no `next/image sizes` work needed.

After this revision, expected one-shot success likelihood: **8/10**.
