# PROMPT-A — Phase 1b Foundation + Hero stack

> **Beads:** `beads_GWTH-2yl` (depends on: nothing — first in chain). Claim with `bd update beads_GWTH-2yl --status=in_progress`.
> **Plan:** `kanban/1_planning/PLAN_2026-04-27_phase-1b-homepage-port.md` (read §3, §6, §10 first).
> **Source bundle:** `kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/`
> **Local preview of source:** `cd kanban/design-artefacts/2026-04-24/concepts/homepage && python -m http.server 8765` then `http://localhost:8765/variant-1-garrow/Homepage%20Redesign.html`.

You are an autonomous build agent for the GWTH.ai Next.js 16 platform on branch `experiment/redesign-poc-2026-04`. This prompt covers the foundation + first 4 sections of the homepage rebuild. Do NOT proceed to PROMPT-B steps.

## Verify-before-act

```bash
git -C /c/Projects/GWTH_V2 rev-parse --abbrev-ref HEAD                                # expect: experiment/redesign-poc-2026-04
git -C /c/Projects/GWTH_V2 status --short                                             # expect: clean
bd show beads_GWTH-2yl | head -20                                                      # expect: open or in_progress, depends on nothing
ls "kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/components/" # expect: data.js, dirA.jsx, dirB.jsx, logo.jsx
ls public/logo.png public/icon.png public/favicon.ico                                  # expect: all present
node -v                                                                                # expect: 22.x
docker --version                                                                       # expect: any 20+ — Linux baselines need Docker. STOP if absent.
```

If any check fails, STOP and report. Do not "fix forward."

## What you are building

1. **Pre-flight Next.js security bump** (16.1.6 → 16.2.3+) — its own commit, must be green before any other work.
2. **Playwright `mobile-dark` project** — added to `playwright.config.ts`.
3. **Archive old landing components** to `src/components/landing/_archived/` (keep `waitlist-form.tsx` in place).
4. **Scaffold `src/components/marketing/`** — README + barrel index + shared `motion-section.tsx`.
5. **`data.ts`** — typed port of `variant-1-garrow/components/data.js`, prices reference `src/lib/config.ts`.
6. **`CourseJsonLd`** — extract from existing `(public)/page.tsx:112-129` into a tested component.
7. **`Hero` + `HeroDevice` + `ScoreVis`** — Freshness Ring + Sparkline (Option B per plan §3.5).
8. **`ResearchStrip`** — UK research source citations.
9. **`JourneyGrid` + `JourneyCard`** — 3+3+1 grid, all 7 cards, real CTAs.
10. **Reuse existing `PublicNav`** — don't build a parallel `MarketingNav`.
11. **Partial `(public)/page.tsx`** — composes Hero + ResearchStrip + JourneyGrid + JsonLd; remaining sections are placeholder `<section data-section="…" />` stubs so PROMPT-B can fill them in.
12. **Tests:** Vitest for each component, Playwright smoke + per-section snapshots for hero/research-strip/journey on all 4 viewport-theme combos. axe runs.

## Execution order (commit each step)

### Step 0 — Pre-flight Next.js security bump

CVE GHSA-q4gf-8mx6-v5v3 (High DoS) — Next.js 16.0.0–<16.2.3 affected. Project is on 16.1.6.

```bash
git tag pre-phase1b-port            # rollback anchor
npm install next@^16.2.3 eslint-config-next@^16.2.3 @next/bundle-analyzer@^16.2.3
git diff package-lock.json | head -100   # sanity check: only Next + peers should change
npm test                            # must pass
npm run lint                        # must pass
npx tsc --noEmit                    # must pass
npm run build                       # must succeed
npx playwright test --project=desktop-chromium src/__tests__/pages/landing.spec.ts   # smoke against existing page
git add package.json package-lock.json
git commit -m "chore(deps): bump next to 16.2.3 for GHSA-q4gf-8mx6-v5v3"
```

**Stop and ask David** if `npm install` introduces unexpected lockfile churn (>20 packages changed) or any test fails.

### Step 1 — Update `playwright.config.ts` (3 changes)

Edit `playwright.config.ts`:

**Change 1 — Add `mobile-dark` project.** Existing projects are `desktop-chromium`, `desktop-dark`, `mobile-chromium` (Pixel 5). Clone `mobile-chromium` and add `colorScheme: "dark"`.

**Change 2 — Make `baseURL` env-driven** so PROMPT-C can run smoke tests against staging:
```ts
baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
```

**Change 3 — Make `webServer` conditional** so PROMPT-C's staging smoke does NOT spin up a local dev server:
```ts
webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
  command: "npm run dev",
  url: "http://localhost:3000",
  reuseExistingServer: !process.env.CI,
},
```

Verify all 4 projects listed via `npx playwright test --list | grep -E "(desktop|mobile)-(chromium|dark)" | sort -u`. Commit.

### Step 2 — Archive old landing components AND delete obsolete landing tests

```bash
mkdir -p src/components/landing/_archived
git mv src/components/landing/hero-section.tsx src/components/landing/_archived/
# repeat for any other files in src/components/landing/ EXCEPT waitlist-form.tsx
ls src/components/landing/    # expect: _archived/, waitlist-form.tsx

# Delete the obsolete landing test + snapshots NOW (not in PROMPT-B). The test asserts old
# page DOM and will fail as soon as Step 10 lands. Removing it here keeps Step 12 reachable.
git rm src/__tests__/pages/landing.spec.ts
git rm -r "src/__tests__/pages/landing.spec.ts-snapshots/" 2>/dev/null || true
```

Add stub `src/components/landing/_archived/README.md`:
```markdown
# Archived 2026-04-27 — Phase 1b homepage port

Components here were the original landing-page implementation. Replaced by `src/components/marketing/`. Kept for historical reference and code archaeology. Do not import from `_archived/` — anything that needs them should be ported into `marketing/`.
```

Update any imports that referenced the moved files (likely `src/app/(public)/page.tsx` — but that's getting replaced anyway; don't fix imports there yet, fix in Step 9 when you write the partial page). Other importers: grep `from "@/components/landing/hero-section"` etc. and update.

`npm run lint` + `npx tsc --noEmit` must remain green. Commit.

### Step 3 — Scaffold marketing directory

```bash
mkdir -p src/components/marketing
touch src/components/marketing/{README.md,index.ts,motion-section.tsx}
```

`src/components/marketing/README.md`: ~30 lines explaining the module's purpose, mounting point (`src/app/(public)/page.tsx`), token-mapping rules (no raw hex; use OKLCH semantic tokens or `color-mix`), reduced-motion convention (all Motion via `MotionSection`), test conventions (per-section `data-section`, `data-role` for masks), Linux baseline regeneration command from plan §6.3.

`src/components/marketing/index.ts`: barrel export — empty for now, populate as components land.

`src/components/marketing/motion-section.tsx`:
- Client component (`'use client'`).
- Wraps `motion.section` (from `motion/react`).
- Consumes `useReducedMotion()`.
- When reduced, renders plain `<section>` with no animation props applied.
- When motion is on, applies the passed `initial` / `whileInView` / `transition` props.
- Default props: `initial={{ opacity: 0, y: 20 }}, whileInView={{ opacity: 1, y: 0 }}, viewport={{ once: true, amount: 0.2 }}, transition={{ duration: 0.5 }}`.
- Accepts `data-section` prop and forwards to the rendered `<section>`.

Commit.

### Step 4 — `data.ts`

Read `kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/components/data.js`. Port to `src/components/marketing/data.ts` with explicit TypeScript types. Critical:

- `import { COURSE_MONTHLY_PRICE, ONGOING_MONTHLY_PRICE, MONTH_CONFIGS } from "@/lib/config"`.
- `PRICING` array references those constants — no inline literal numbers for prices.
- `CURRICULUM` references `MONTH_CONFIGS` — module titles, lesson counts, capstone names.
- `JOURNEYS` typed with `{ n: number; tag: string; title: string; body: string; accent: string; stat?: string; cta: string; href: string }`. All 7 entries.
- `RESEARCH_SOURCES`, `UK_STATS`, `SCORE_CATEGORIES`, `NAV_LINKS`, `FOOTER_COLS` — typed and exported.

Write `src/components/marketing/data.test.ts`:
- `JOURNEYS.length === 7`
- Every `JOURNEYS[i]` has `{ n, tag, title, body, href }` non-empty.
- Every `JOURNEYS[i].href` starts with `/` or `https://`.
- `PRICING[1].pricePence === COURSE_MONTHLY_PRICE * 100` — drift sentinel.
- `PRICING[2].pricePence === Math.round(ONGOING_MONTHLY_PRICE * 100)` — drift sentinel.
- `RESEARCH_SOURCES.length === 6` (DSIT, ONS, CIPD, BCS, Tech UK, Innovate UK).
- `FOOTER_COLS.length === 3`; every link has `{ label, href }` non-empty.

Run `npm test`. Commit.

### Step 5 — `CourseJsonLd`

Create `src/components/marketing/json-ld/course-jsonld.tsx`:
- Server component (no `'use client'`).
- Renders `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />`.
- `data` is the **exact same object literal** currently at `src/app/(public)/page.tsx:113-128`. Copy it verbatim. Don't modify.

Test `course-jsonld.test.tsx`:
- Renders one `<script>` with type `application/ld+json`.
- Parsing the script's text content yields an object with `"@type": "Course"`, `"name": "GWTH.ai"` (or whatever the existing payload says — match exactly).
- Snapshot test: `expect(scriptContent).toMatchInlineSnapshot(...)` with the JSON-LD JSON pinned. This is the regression sentinel.

Update barrel: `export { CourseJsonLd } from "./json-ld/course-jsonld"`.

Commit.

### Step 6 — `ScoreVis` (the hardest single component)

Per plan §3.5. File: `src/components/marketing/score-vis/score-vis.tsx`. Client component.

**Props:**
```ts
type ScoreVisProps = {
  value: number          // 0..130
  passLine?: number      // default 100
  history?: number[]     // sparkline data
  size?: 'sm' | 'md' | 'lg'   // 120 / 180 / 240px
  ariaLabel?: string
}
```

**Visual behaviour:**

**Dashoffset formulas (canonical — use exactly these):**
```ts
const r = size === 'lg' ? 96 : size === 'md' ? 72 : 48
const C = 2 * Math.PI * r                                         // circumference
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

// Primary arc — fills 0 → passLine
const primaryFraction = clamp(value / passLine, 0, 1)
const primaryOffset = C * (1 - primaryFraction)
// At value=0: offset=C (empty). At value=100 (=passLine): offset=0 (closed).

// Halo arc — only rendered when value > passLine; fills 0 → 30 over the bonus zone
const haloFraction = clamp((value - passLine) / 30, 0, 1)
const haloOffset = C * (1 - haloFraction)
// At value=100: haloFraction=0, halo invisible. At value=130: haloFraction=1, halo fully drawn.
```

- SVG ring (single `<circle data-role="score-ring-progress">`), stroke width ~12px, `stroke-dasharray={C}`, `stroke-dashoffset={primaryOffset}`.
- For `value > passLine`: a second `<circle data-role="score-halo">` overlay layer with brighter `--primary` opacity, `stroke-dashoffset={haloOffset}`.
- Inside the ring: large numeric `<text>` showing `value` (Inter tabular-nums via `font-feature-settings: 'tnum'`), one-line subtitle below:
  - `Passing` when `value >= passLine`
  - `Decaying` when the sparkline last segment crosses the pass-line downward (rule: `history[N-2] >= passLine && history[N-1] < passLine`)
  - `Building` otherwise.
- Below the ring: 30-day sparkline (~120px × 24px, separate `<svg>`). Path drawn from `history` array. A dashed horizontal `<line>` at `y = passLine`. **Decay segment colouring** — split the path into N-1 segments. If `history[N-2] >= passLine && history[N-1] < passLine` (last segment crosses pass-line downward), the last segment uses `stroke="var(--warning)"` (amber) and tag the segment element with `data-role="sparkline-decay"`. Otherwise `stroke="var(--primary)"`. **"Trending down without crossing" is NOT decay** — only the cross matters.
- **Pulse-on-crossing:** when `value` *crosses* `passLine` (transition from `<100` to `>=100`), play a single 600ms `scale 1 → 1.05 → 1` keyframe on the ring container. Implementation: `<motion.g key={value >= passLine ? 'pass' : 'fail'} initial={...} animate={...}>` — the `key` change re-mounts and replays the entrance keyframes. Pulse does NOT loop while value remains ≥100. **Gate via `useReducedMotion` from `motion/react`.** Tag the animated element with `data-role="score-pulse"`.
- Sparkline progressive draw: on viewport entry, `pathLength: 0 → 1` over 1.2s. Gate via reduced-motion.
- "Example score" pill rendered absolutely-positioned top-right of the widget (small, semi-transparent `--muted`).

**Test hooks (add as `data-role`):**
- `data-role="score-ring-progress"` on the primary `<circle>`.
- `data-role="score-halo"` on the bonus-zone `<circle>` (only rendered when `value > passLine`).
- `data-role="sparkline"` on the sparkline `<svg>`.
- `data-role="sparkline-decay"` on the last sparkline segment when it's amber.
- `data-role="score-pulse"` on the Motion-animated pulse element.

**ARIA:**
- Root container `role="img"` and `aria-label={ariaLabel ?? \`GWTH Score example: ${value} out of ${passLine}, ${value >= passLine ? "currently passing" : "currently below pass line"}. Illustrative only.\`}`.
- Sub-scores in a visually-hidden `<dl>` listing `SCORE_CATEGORIES` for screen readers.
- Sparkline gets `aria-hidden="true"` (numeric reading covers it).

**`example-data.ts`** sibling file:
```ts
// EXAMPLE DATA — REPLACE WHEN SCORING IS LIVE.
// Beads: bd show beads_GWTH-w5y (track replacement under follow-up).
export const EXAMPLE_SCORE_VALUE = 92
export const EXAMPLE_SCORE_HISTORY = [/* 30 values trending around 92 */] as const
export const EXAMPLE_SUB_SCORES = [
  { label: "Personal AI", value: 92 },
  { label: "Professional", value: 78 },
  { label: "Enterprise", value: 64 },
  { label: "Tech Radar", value: 71 },
] as const
```

**Tests** (`score-vis.test.tsx`, ~7 tests):
1. Renders an SVG with one ring `<circle data-role="score-ring-progress">` + dashed `<line>` (pass-line at 100).
2. At `value=100`: ring's `stroke-dashoffset` resolves to ~0 (closed). Compute `C = 2*π*r`, assert offset ≈ 0 (tolerance 0.5).
3. At `value=120`: `[data-role="score-halo"]` present. At `value=80`: not present. Halo's `stroke-dashoffset` at `value=130` ≈ 0 (full draw); at `value=100` ≈ C (invisible).
4. **Decay rule (cross-the-line, not just trending down):**
   - With `history=[…, 105, 95]` (last segment crosses pass-line downward): `[data-role="sparkline-decay"]` present, `stroke="var(--warning)"`.
   - With `history=[…, 95, 92]` (last segment trends down but never crosses — both below pass-line): `[data-role="sparkline-decay"]` ABSENT.
   - With `history=[…, 105, 102]` (last segment trends down but stays above pass-line): `[data-role="sparkline-decay"]` ABSENT.
5. Pulse gated on reduced-motion: `vi.mock('motion/react', () => ({ useReducedMotion: () => true, motion: { div: 'div', circle: 'circle', g: 'g' } }))` — assert `[data-role="score-pulse"]` renders without animate props.
6. ARIA label matches expected pattern: `role="img"` and `aria-label` contains "Illustrative only" + the numeric value + the passing/decaying state.
7. Sparkline path generation: `history=[88,90,92,95,92]` → resulting path's `d` has 5 commands (`M` + 4 `L`).

Run `npm test`. Commit.

### Step 7 — `Hero` + `HeroDevice`

`src/components/marketing/hero/hero.tsx` (server) and `hero-device.tsx` (client island).

**Hero (server):**
- Reads layout from `dirB.jsx:DirB_Hero` (lines 49-86). Two-column at desktop (copy left, device right); stacked at mobile.
- H1: locked copy from `BRAND_BRIEF.md §3b`: "Stop watching AI change the world. Start building with it." Second sentence in gradient/accent (use `.text-gradient` utility from `globals.css:272`).
- Sub-copy: as in dirB prototype (locked).
- Primary CTA: `<Button asChild><Link href="/signup">Get started</Link></Button>` — or, if dirB's hero has the WaitlistForm inline, mount `<WaitlistForm />` (preserving `src/components/landing/waitlist-form.tsx`).
- Secondary CTA: `<Button variant="outline" asChild><Link href="/tech-radar">Explore the Tech Radar</Link></Button>`.
- **No fabricated trust line** — no "1,240 learners", no avatars (locked).
- Renders `<HeroDevice />` (client island).
- `data-section="hero"`.
- Hero content (H1 + sub + CTAs + device static frame) renders **synchronously** — no `whileInView` gates above the fold. This is critical for LCP on mobile (R2.1).

**HeroDevice (client):**
- Per plan §9 recommendation: browser-frame mock (option (c)) — rounded card with three traffic-light dots top-left, URL bar reading `gwth.ai/dashboard` or similar.
- Inside the frame: a faux-LinkedIn profile card (generic name "Alex Example", generic role) with the `<ScoreVis />` widget mounted at the centre.
- Beneath the device: small `<figcaption>`-style line: *"Illustrative — your actual GWTH Score reflects verified work."*
- The static frame renders with NO entrance animation. Only the *fill* of the ScoreVis ring and the sparkline animate after first paint.
- `data-role="hero-device"`.

**Test hooks:**
- `Hero`: `data-section="hero"`, H1 with the locked copy, two CTAs visible.
- `HeroDevice`: ScoreVis present with `value={EXAMPLE_SCORE_VALUE}`, caveat text present.

**Tests:**
- `hero.test.tsx`: H1 contains "Stop watching AI"; primary CTA href is `/signup` (or WaitlistForm rendered); secondary CTA href is `/tech-radar`; renders `<HeroDevice />` once.
- `hero-device.test.tsx`: `<ScoreVis>` renders; "Alex Example" or generic name visible; caveat text present; "Example score" pill present.

Commit.

**axe API note:** use `@axe-core/playwright`'s `AxeBuilder` (matches existing `landing.spec.ts:2` convention pre-deletion). Do NOT use `axe-playwright` (the duplicate legacy package).

### Step 8 — `ResearchStrip`

`src/components/marketing/research-strip/research-strip.tsx`. Server component. Reads `RESEARCH_SOURCES` from `data.ts`.

- Headline: "Built around UK research" (locked — NOT "partnered with" or "featured in").
- Six citation chips/items (DSIT · ONS · CIPD · BCS · Tech UK · Innovate UK). Visual: muted-foreground text on `bg-muted/50` strip with subtle vertical separators.
- `data-section="research-strip"`.
- Wrap in `<MotionSection>` for scroll-reveal entrance.

**Tests:** all 6 sources render; headline present.

Commit.

### Step 9 — `JourneyGrid` + `JourneyCard`

`src/components/marketing/journey-grid/journey-grid.tsx` + `journey-card.tsx`. Server components.

- 7 cards in a 3+3+1 grid. Desktop: `grid-cols-3` for first 6, full-width row for the 7th. Mobile: `grid-cols-1`.
- Each card:
  - Tag pill (uses accent colour from `JOURNEYS[i].accent` — map `accent` value to a Tailwind class via a switch: `mint` → `bg-accent/10 text-accent`, `aqua` → `bg-primary/10 text-primary`, etc. Verify contrast in both modes — see R4.4).
  - Title (h3).
  - Body (paragraph, text-muted-foreground).
  - Optional stat (if present).
  - CTA button → `JOURNEYS[i].href`.
- Card-level link OR inner-CTA link, NOT both (R4.3 — keyboard tab order).
- Hover lift: apply `.hover-lift` from `globals.css:289` to each card.
- Entrance: cascading-stagger via `staggerChildren` on the parent — 0.05s × 7 = 350ms total.
- `data-section="journey"` on the grid; `data-testid="journey-card"` on each card; `data-row="1"` / `data-row="2"` / `data-row="3"` on row containers.

**Tests:**
- 7 cards render (`getAllByTestId('journey-card')`).
- Each card's CTA href matches `JOURNEYS[i].href`.
- No `className` contains `undefined` (regression sentinel for missing accent mapping).
- Each accent token appears as a real Tailwind class.

Commit.

### Step 10 — Partial `(public)/page.tsx`

Replace the entire file with the partial composition:

```tsx
import type { Metadata } from "next"
import { CourseJsonLd } from "@/components/marketing/json-ld/course-jsonld"
import { Hero } from "@/components/marketing/hero/hero"
import { ResearchStrip } from "@/components/marketing/research-strip/research-strip"
import { JourneyGrid } from "@/components/marketing/journey-grid/journey-grid"

// Preserve existing metadata export verbatim from the old page.tsx (lines 23-27 of the original).
export const metadata: Metadata = { /* PRESERVED VERBATIM */ }

export default function HomePage() {
  return (
    <>
      <CourseJsonLd />
      <Hero />
      <ResearchStrip />
      <JourneyGrid />
      {/* PROMPT-B placeholders */}
      <section data-section="pillars" />
      <section data-section="curriculum-vis" />
      <section data-section="score-vis" />
      <section data-section="prompt-vis" />
      <section data-section="research-stats" />
      <section data-section="pricing" />
      <section data-section="final-cta" />
      <section data-section="footer" />
    </>
  )
}
```

Commit.

### Step 11 — Tests

Write `src/__tests__/pages/marketing-homepage.spec.ts`. Smoke for the partial page on all 4 projects. Assert: H1 present, JSON-LD `<script>` exists with `@type:Course`, `[data-section="hero"]`, `[data-section="research-strip"]`, `[data-section="journey"]` all visible. Reduced-motion test: emulate `reducedMotion: "reduce"`, navigate, assert no animation-driven transforms applied to MotionSection elements after 1s.

Write `src/__tests__/pages/marketing-snapshots.spec.ts` per test plan §3 — parametrised loop over `["hero", "research-strip", "journey"]` × 2 themes (light / dark). On 4 Playwright projects = 24 snapshots in PROMPT-A. Mask `[data-role="score-ring-progress"]`, `[data-role="score-halo"]`, `[data-role="sparkline"]`, `[data-role="score-pulse"]`, `[data-role="hero-spirals"]`, `[data-mask="date"]`. Use `animations: 'disabled'`, `maxDiffPixels: 200`, `threshold: 0.2`. Wait for `document.fonts.ready` before screenshots.

axe runs: 4 (one per project). `withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])`. Filter: zero `critical`+`serious`.

**Generate Linux baselines via Docker (tag computed dynamically from installed Playwright version):**
```bash
PW_VERSION=$(node -p "require('@playwright/test/package.json').version")
PW_TAG="v${PW_VERSION}-jammy"
echo "Using Playwright Docker image: mcr.microsoft.com/playwright:${PW_TAG}"
docker run --rm -v "$PWD:/work" -w /work "mcr.microsoft.com/playwright:${PW_TAG}" \
  npx playwright test marketing-snapshots --update-snapshots --project=desktop-chromium --project=desktop-dark
# If "manifest unknown" error: try -noble fallback:
#   docker run … "mcr.microsoft.com/playwright:v${PW_VERSION}-noble" …
```
(Mobile baselines local-only and CI-skipped — see `marketing-snapshots.spec.ts` `test.skip` rule below.)

**CI gating in `marketing-snapshots.spec.ts`:** add at the top of each `test`:
```ts
test.skip(
  !!process.env.CI && ['mobile-chromium', 'mobile-dark'].includes(test.info().project.name),
  "Mobile snapshots are local-only — Linux/Win32 subpixel drift causes flake on CI."
)
```

Re-run `marketing-snapshots` twice in a row — must produce zero diffs second time. If flake on a section, identify the unmasked dynamic region and add to `mask: [...]`.

Commit baselines + spec.

### Step 12 — Final checks

```bash
npx tsc --noEmit
npm run lint
npm test
npx playwright test marketing-homepage --project=desktop-chromium
npx playwright test marketing-homepage --project=desktop-dark
npx playwright test marketing-homepage --project=mobile-chromium
npx playwright test marketing-homepage --project=mobile-dark
```

All green. Commit any final fixes.

## Acceptance criteria (Gate-readiness)

- [ ] `git tag pre-phase1b-port` exists; Next bump committed in its own commit
- [ ] `mobile-dark` Playwright project exists in `playwright.config.ts`
- [ ] `src/components/landing/_archived/` contains all old hero/feature components + stub README
- [ ] `src/components/landing/waitlist-form.tsx` unchanged
- [ ] `src/components/marketing/{README.md, index.ts, motion-section.tsx, data.ts, data.test.ts}` exist
- [ ] `src/components/marketing/json-ld/course-jsonld.tsx` + test exist; rendered JSON matches old payload byte-for-byte
- [ ] `score-vis.tsx` implements the spec in §3.5 of the plan; 7 tests passing
- [ ] `hero.tsx` + `hero-device.tsx` render synchronously (no `whileInView` above the fold)
- [ ] `research-strip.tsx` + `journey-grid.tsx` + `journey-card.tsx` render
- [ ] No raw hex / `rgb()` in `src/components/marketing/**` outside `<svg>` literals — verify with grep
- [ ] No `.css` imports in `src/components/marketing/**`
- [ ] No `dangerouslySetInnerHTML` outside `course-jsonld.tsx`
- [ ] Partial `(public)/page.tsx` mounts all PROMPT-A sections + placeholders for PROMPT-B
- [ ] `npm test` passes
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] `marketing-homepage.spec.ts` smoke green on all 4 projects
- [ ] `marketing-snapshots.spec.ts` produces 24 stable baselines (re-run yields zero diffs)
- [ ] axe critical+serious zero on all 4 viewport-theme combos
- [ ] All commits have meaningful messages; no `--no-verify`
- [ ] beads `beads_GWTH-2yl` updated `--status=in_progress` at start, ready to be closed at end of PROMPT-C

## Don't do

- Don't proceed to PROMPT-B steps (no ProductPillars / Pricing / Footer yet — those are placeholders).
- Don't reintroduce fabricated proof (no "1,240 learners", no testimonials, no fake partnerships).
- Don't modify `src/components/landing/waitlist-form.tsx`.
- Don't add new top-level CSS variables — use `color-mix` if needed.
- Don't introduce new dependencies in PROMPT-A. (The Next bump is allowed; `@lhci/cli` is allowed in PROMPT-C only.)
- Don't bypass git hooks (`--no-verify`).
- Don't `npm run dev` — use `node ./node_modules/next/dist/bin/next dev --turbopack -p 3001` if you need a local server.
- Don't burn Claude Design quota — Phase 1b is Claude Code only.
- Don't add a visible "Ctrl K" hint.
- Don't render `dynamicScore.percentile`.
- Don't centre the wordmark vertically with extra padding.
- Don't switch sessions to `GWTH_curriculum`.
- Don't deploy to Hetzner / `gwth.ai`.

---

## Review Checklist — 2026-04-27

- [ ] Instructions are clear and self-contained — no assumed context beyond plan + handoff
- [ ] File paths are correct for this project
- [ ] Acceptance criteria match the plan's §7 PROMPT-A scope
- [ ] No scope creep beyond what the plan describes for PROMPT-A
- [ ] Pre-flight Next bump is sequenced first
- [ ] Tests + snapshots + axe + Linux baseline generation are explicit
- [ ] Score widget framing (Example pill + caveat + isolation in `example-data.ts`) is enforced

**Review this prompt:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PROMPT_2026-04-27_phase-1b-A-foundation.md`
