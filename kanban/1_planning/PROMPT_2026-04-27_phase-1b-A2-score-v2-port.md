# PROMPT-A2 — Score Widget v2 Port (Collapsible Employer Panel + 80/100/130 Ladder)

> **Beads:** `beads_GWTH-85b` (blocks `beads_GWTH-l3i` PROMPT-B and `beads_GWTH-w5y` Phase 1b epic). Claim with `bd update beads_GWTH-85b --status=in_progress`.
> **Plan:** `kanban/1_planning/PLAN_2026-04-27_phase-1b-homepage-port.md`
> **Handoff context:** `kanban/1_planning/HANDOFF_2026-04-27_phase-1b-score-design-iteration.md` — read end-to-end before starting. Locked decisions are listed there.
> **Canonical visual reference:** `kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/option-2-collapsible.html` — every detail in there is locked. The production component must visually match this mock.

You are an autonomous build agent for the GWTH.ai Next.js 16 platform. This prompt ports a design-reviewed score widget iteration from HTML mock into production TypeScript / React / Tailwind. Do NOT proceed to PROMPT-B steps.

## Verify-before-act

```bash
git -C /c/Projects/GWTH_V2 rev-parse --abbrev-ref HEAD                  # expect: experiment/redesign-poc-2026-04
git -C /c/Projects/GWTH_V2 status --short                               # expect: clean working tree
bd show beads_GWTH-85b | head -5                                         # expect: open or in_progress
test -f kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/option-2-collapsible.html || echo "MOCK MISSING — STOP"
test -f src/components/marketing/score-vis/score-vis.tsx || echo "ScoreVis MISSING — STOP"
test -f src/components/marketing/hero/hero-device.tsx || echo "HeroDevice MISSING — STOP"
ls public/icon*.png                                                      # expect: icon.png + icon-light.png
npm test -- --run                                                        # expect: green
npx tsc --noEmit                                                         # expect: clean
```

If any check fails, STOP and report.

## Read these first (in order)

1. `kanban/1_planning/HANDOFF_2026-04-27_phase-1b-score-design-iteration.md` — full state-of-the-world, locked decisions, dead-ends.
2. `kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/option-2-collapsible.html` — canonical visual + behavioural reference. Open in a browser at `http://localhost:8766/variant-B-ring/option-2-collapsible.html` if a mock server is running, or open the file directly.
3. `src/components/marketing/score-vis/score-vis.tsx` — current v1 implementation (will be patched).
4. `src/components/marketing/hero/hero-device.tsx` — current hero device (will be patched).
5. `src/components/marketing/score-vis/example-data.ts` — example values used.
6. `src/lib/config.ts` — read `TOTAL_MANDATORY_LESSONS`, `TOTAL_OPTIONAL_LESSONS`, `TOTAL_COURSE_MONTHS`. The score-explainer panel uses these for honest numbers.

## What you are building

Five things, in order. Commit each step.

### Step 1 — Patch ScoreVis to v2 ladder + visual updates

File: `src/components/marketing/score-vis/score-vis.tsx`

Replace `subtitleFor()` to use the **80/100/130** ladder:

```ts
// 130+ → "Top 0.5%"
// 100..129 → "Top 1%"
// 80..99 → "Top 5%"
// <80 → "Working towards"
const subtitleFor = (value: number, _passLine: number, _history: readonly number[]): string => {
  if (value >= 130) return "Top 0.5%"
  if (value >= 100) return "Top 1%"
  if (value >= 80) return "Top 5%"
  return "Working towards"
}
```

Drop the "Slipping" sub-states from the label entirely — the sparkline already conveys slipping via the descending shape and the amber decay segment. The historical `wasAbove` checks stay only as input to the decay-segment rendering, NOT the label text.

**Visual changes (match the mock):**

- **Ring stroke uses a primary→accent linear gradient.** Add `<defs><linearGradient id="score-ring-grad-{size}" ...>` inside the SVG (id must be size-suffixed so multiple instances don't collide). Gradient stops: `0%` at `var(--primary)`, `100%` at `var(--accent)`, with `gradientTransform="rotate(45)"`. The progress arc references it: `stroke="url(#score-ring-grad-{size})"`. Halo arc keeps solid `var(--accent)` stroke + `drop-shadow` filter.
- **Score number uses primary→accent text gradient.** `bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent`. Bigger weight: `font-extrabold` (was `font-semibold`). Tighter tracking: `tracking-[-0.04em]`.
- **Tier label sits INSIDE the ring, below the number.** Color by tier:
  - Top 0.5%: text-gradient (`bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent`)
  - Top 1% / Top 5%: `text-success`
  - Working towards: `text-muted-foreground`
- **Sparkline gets a gradient fill underneath the line.** Add a second `<linearGradient id="score-spark-fill-{size}">` going `0%` (primary @ 0.28 alpha) to `100%` (transparent), vertical. Render a `<polygon>` traced along the line + closed to the bottom corners, fill `url(#score-spark-fill-{size})`, BEHIND the line.
- **Sparkline y-mapping uses two-segment piecewise.** Replace the single-formula `sparklineYForValue` with:
  ```ts
  // Two-segment y-mapping anchored at the pass-line. Lets elite scores
  // (up to 145) reach the top of the viewBox without clipping.
  const PASS_Y = 20
  const TOP_Y = 6
  const BOTTOM_Y = SPARKLINE_HEIGHT  // currently 24 — bump to 56 to match mock proportions
  const PASS_SCORE = 100
  const TOP_SCORE = 145
  const sparklineYForValue = (v: number): number =>
    v >= PASS_SCORE
      ? PASS_Y - clamp((v - PASS_SCORE) / (TOP_SCORE - PASS_SCORE), 0, 1) * (PASS_Y - TOP_Y)
      : BOTTOM_Y - clamp(v / PASS_SCORE, 0, 1) * (BOTTOM_Y - PASS_Y)
  ```
  Bump `SPARKLINE_HEIGHT` from 24 to 56. Bump `SPARKLINE_WIDTH` from 120 to a size proportional to the ring (e.g. for `lg`, 280; for `md`, 220; for `sm`, 160). Drop the `SPARKLINE_RANGE_MIN`/`SPARKLINE_RANGE_MAX` constants — replaced by the two-segment formula.
- **Drop the in-SVG "TOP 1%" text label** that used to live in the sparkline. The dashed line + the tier label inside the ring already convey the threshold. Removing it eliminates the gradient-fill-overlap visual bug.
- **Drop the visually-hidden `<dl>` of sub-scores** — that mechanism remains valid but is unrelated to v2 polish; leave the sub-score data in `example-data.ts` for now (next prompt or a follow-up may surface it elsewhere).
- Update `computedAriaLabel` to drop the percentile-of-population phrasing in favour of the new label: `\`GWTH Score example: ${value}, ${subtitle}. Illustrative only.\``.

**Test hooks (preserve):** `data-role="score-ring-progress"`, `data-role="score-halo"`, `data-role="sparkline"`, `data-role="sparkline-decay"`, `data-role="score-pulse"`. ADD `data-role="ring-tier-label"` on the new tier label inside the ring.

After this step: `npm test -- --run score-vis` will fail because the v1 ladder tests are now wrong. That's expected; Step 4 fixes the tests.

**Commit message:** `feat(score-vis): v2 ladder + gradient ring stroke + two-segment sparkline mapping`

### Step 2 — Build the ScoreExplainer collapsible component

File: `src/components/marketing/score-explainer/score-explainer.tsx` (new directory, new file).
Test file: `src/components/marketing/score-explainer/score-explainer.test.tsx` (new).
Folder README: `src/components/marketing/score-explainer/README.md` (one-line module description).

Use the shadcn `Collapsible` primitive. If `src/components/ui/collapsible.tsx` does not exist, install it: `npx shadcn@latest add collapsible`. (Radix primitive — already in the shadcn registry.)

Structure (match `option-2-collapsible.html`):

```tsx
"use client"

import * as React from "react"
import { ChevronDown, RefreshCw, Hammer, CheckCircle2, Calendar, AlertTriangle } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  TOTAL_MANDATORY_LESSONS,
  TOTAL_OPTIONAL_LESSONS,
  TOTAL_COURSE_MONTHS,
} from "@/lib/config"
import { cn } from "@/lib/utils"

const TOTAL_HANDS_ON = TOTAL_MANDATORY_LESSONS + TOTAL_OPTIONAL_LESSONS

/**
 * Five locked bullets — the credibility argument for the score. Numbers
 * derive from src/lib/config.ts so any change to course shape is reflected
 * here automatically. Copy is locked from the v2 mock at
 * kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/option-2-collapsible.html.
 */
const BULLETS = [
  { Icon: RefreshCw,    tone: "primary", key: "Always current.", body: "Lessons update constantly so students stay on the cutting edge — and the score decays if they don't keep up." },
  { Icon: Hammer,       tone: "accent",  key: "Hands-on, not lectured.", body: <>Reaching <Num>{100}</Num> means completing <Num>{TOTAL_HANDS_ON}</Num>+ hands-on projects across {TOTAL_COURSE_MONTHS} modules — no passive watching.</> },
  { Icon: CheckCircle2, tone: "primary", key: "Tested, not assumed.", body: <>Every lesson has check questions; the course requires <Num>3</Num> capstone projects to graduate.</> },
  { Icon: Calendar,     tone: "accent",  key: "Paced, not crammed.", body: <>The course is <Num>{TOTAL_COURSE_MONTHS} months</Num>; lessons release in stages — no shortcuts, no rushing through.</> },
  { Icon: AlertTriangle, tone: "warning", key: "A high score is a recent score.", body: <>Above <Num>100</Num> means top 1% of applied-AI practitioners <em>today</em>, not when they enrolled.</> },
] as const

function Num({ children }: { children: React.ReactNode }) {
  return <span className="font-bold text-primary tabular-nums">{children}</span>
}

export function ScoreExplainer({ className }: { className?: string }) {
  return (
    <Collapsible className={cn("w-full", className)} data-role="score-explainer">
      <CollapsibleTrigger
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 text-left transition-all hover:border-primary hover:bg-primary/5 data-[state=open]:border-primary data-[state=open]:bg-primary/5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-role="score-explainer-trigger"
      >
        <span className="flex items-center gap-2.5">
          <span className="grid size-5 place-items-center rounded-md bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="size-3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold leading-tight">What this score tells an employer</span>
            <span className="text-[10px] font-medium leading-tight text-muted-foreground tracking-wide">5 reasons it's credible</span>
          </span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <ul className="mt-3 flex flex-col gap-3" data-role="score-explainer-bullets">
          {BULLETS.map(({ Icon, tone, key, body }) => (
            <li key={key} className="flex items-start gap-3 text-xs leading-relaxed">
              <span className={cn(
                "grid size-7 shrink-0 place-items-center rounded-md",
                tone === "primary" && "bg-primary/10 text-primary",
                tone === "accent" && "bg-accent/10 text-accent",
                tone === "warning" && "bg-warning/15 text-warning",
              )}>
                <Icon className="size-3.5" strokeWidth={2} />
              </span>
              <span><span className="font-semibold">{key}</span> {body}</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

**Tailwind animation utilities:** the `animate-collapsible-up` / `animate-collapsible-down` keyframes need to exist in `src/app/globals.css` if they don't already. Check first; add only if missing:

```css
@theme inline {
  --animate-collapsible-down: collapsible-down 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --animate-collapsible-up: collapsible-up 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes collapsible-down {
  from { height: 0; opacity: 0; }
  to { height: var(--radix-collapsible-content-height); opacity: 1; }
}
@keyframes collapsible-up {
  from { height: var(--radix-collapsible-content-height); opacity: 1; }
  to { height: 0; opacity: 0; }
}
```

**Tests** (`score-explainer.test.tsx`):

- All 5 bullets render with the right `key` text.
- The number `100` appears in bullets 1 and 5 (locked).
- The dynamic numbers from `config.ts` render correctly: `94` (or whatever `TOTAL_MANDATORY_LESSONS + TOTAL_OPTIONAL_LESSONS` equals), `3 months`, `3` (capstones).
- Defaults to collapsed: `[data-state="closed"]` and `aria-expanded="false"` on the trigger.
- Clicking the trigger flips state to open and reveals all 5 bullets in the document.
- Keyboard activation works: `await user.keyboard("{Tab}{Enter}")` opens it.
- The `Num` helper renders within `<span class="font-bold text-primary tabular-nums">`.

Use `@testing-library/react` + `@testing-library/user-event`.

**Commit message:** `feat(score-explainer): collapsible employer-credibility panel for score widget`

### Step 3 — Update HeroDevice

File: `src/components/marketing/hero/hero-device.tsx`

Add the GWTH icon header inside the score card and mount `<ScoreExplainer>` after the sparkline before the figcaption.

Final card structure (top to bottom):
1. browser-frame chrome (existing)
2. profile row (existing — Alex Example)
3. score card outer container, with rounded border, padding
   1. **NEW:** GWTH icon header — small `<Image>` (32×32) above a "GWTH SCORE" mono uppercase label, both centred in a `flex flex-col items-center gap-1.5 mb-3` container
   2. ScoreVis ring + tier label (existing — receives v2 patch from Step 1)
   3. ScoreVis sparkline + axis (existing)
   4. **NEW:** `<ScoreExplainer />` mounted here
4. figcaption ("Illustrative — your actual GWTH Score reflects verified work.") (existing)

**Logo theme switching.** The site uses `next-themes`. Use the existing pattern (or, if no pattern exists, `useTheme()` from `next-themes` + a `mounted` boolean to avoid hydration mismatch). Light theme renders `/icon-light.png`; dark theme renders `/icon.png`.

If a theme-aware logo helper already exists somewhere in `src/components/`, reuse it; otherwise inline this in HeroDevice:

```tsx
"use client"
import { useTheme } from "next-themes"
import Image from "next/image"

function GwthMark() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  // Avoid hydration mismatch: render light variant during SSR + first paint
  const src = mounted && resolvedTheme === "dark" ? "/icon.png" : "/icon-light.png"
  return <Image src={src} alt="GWTH" width={32} height={32} className="size-8" />
}
```

**Tests** (`hero-device.test.tsx`):

- Update assertions to reflect the new card structure: GWTH mark renders, "GWTH SCORE" label present, ScoreExplainer present (search by `data-role="score-explainer"`).
- The figcaption text still renders.

**Commit message:** `feat(hero-device): GWTH mark header + collapsible score explainer`

### Step 4 — Update ScoreVis tests

File: `src/components/marketing/score-vis/score-vis.test.tsx`

Replace v1 percentile assertions with v2 ladder. New cases (use the value-history pairs from the mock's scenario chips as fixtures):

- `value=135, history=[40,55,70,85,98,108,118,125,130,132,134,135]` → tier label text is `"Top 0.5%"`, has the `text-transparent` text-gradient class (assert via `data-role="ring-tier-label"`).
- `value=104, history=[40,55,70,90,108,118,128,135,130,122,114,104]` → tier label is `"Top 1%"`, has `text-success`.
- `value=88,  history=[35,50,65,78,90,100,108,112,105,98,92,88]` → tier label is `"Top 5%"`, has `text-success`.
- `value=65,  history=[20,30,40,48,55,60,62,64,66,65,66,65]` → tier label is `"Working towards"`, has `text-muted-foreground`.
- For the slipping case `value=104, history=[..., 135, 122, 114, 104]`, ALSO assert that the sparkline-decay path renders (since the last segment crosses the pass-line going down). For the `value=135` case, decay path does NOT render.
- Sparkline endpoint y-coordinate sanity: extract from `data-role="sparkline"` SVG, parse last point of the polyline, confirm it's within `[0, SPARKLINE_HEIGHT]`. (Eyeballing: `135` should sit near `y≈9`, `65` near `y≈33`.)

Drop any tests that asserted "Slipping from top 1%" or "Working towards top 1%" text — that copy is gone.

**Commit message:** `test(score-vis): cover v2 ladder + two-segment sparkline mapping`

### Step 5 — Snapshot baselines + visual verification

Existing per-section Playwright snapshots will diff because the score widget's geometry, copy, and structure changed.

```bash
PW_VERSION=$(node -p "require('@playwright/test/package.json').version")
docker run --rm -v "$PWD:/work" -w /work "mcr.microsoft.com/playwright:v${PW_VERSION}-jammy" \
  npx playwright test marketing-snapshots --update-snapshots --project=desktop-chromium --project=desktop-dark
```

Re-run the same command a second time to confirm zero diffs (the regen must be stable).

If the homepage `(public)/page.tsx` mounts ScoreVis directly with the v1 props, audit it. ScoreVis still receives `value` + `history` props the same way — no API breakage at the call site.

Visual check: run `npm run dev`, open `http://localhost:3000`. Hero device shows the v2 widget: gradient ring + gradient score number + tier label inside ring + sparkline with gradient fill + ScoreExplainer collapsed by default + GWTH icon (light variant) above "GWTH SCORE" label. Click the explainer, all 5 bullets reveal. Toggle theme — icon swaps to the dark variant. Resize browser — card stays compact at all breakpoints.

**Commit message:** `chore(snapshots): regen marketing baselines for score-vis v2`

## Run the pipeline header steps

After all 5 steps land, follow the standard pipeline header that the runner prepends (tests, push, P520 deploy, health check, Gate 3 + Gate 4 docs).

## Acceptance criteria

- `npm test` — green (all suites)
- `npx tsc --noEmit` — clean
- 4 axe runs (desktop-light, desktop-dark, mobile-light, mobile-dark) — zero critical + serious on the homepage
- Snapshot regen produces zero diffs on second run
- Visual on `http://localhost:3000` matches the canonical mock at `kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/option-2-collapsible.html` — verify side-by-side
- ScoreExplainer collapsed by default; reveals 5 bullets on click; respects keyboard
- Logo correct in both themes (light → icon-light.png, dark → icon.png)
- P520 deploy returns 200 from `/api/health`
- `bd close beads_GWTH-85b` after all green
- PROMPT file moved to `2_testing/` (the runner does this automatically on success)
