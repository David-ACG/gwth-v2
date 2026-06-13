# marketing/

Public-facing marketing components for the homepage rebuild (Phase 1b, 2026-04-27).

## Purpose

This directory contains the section-level building blocks composed by `src/app/(public)/page.tsx`. Components are scoped to the landing page during Phase 1b; they will be reused on `/for-teams` etc. in a later phase only after the homepage is stable.

## Mounting point

Sections are composed top-to-bottom in `src/app/(public)/page.tsx`. The page is a thin server component (~80 lines) that imports each section and the `<CourseJsonLd />` schema. Each section sets a `data-section="<name>"` attribute on its root element so the snapshot harness in `src/__tests__/pages/marketing-snapshots.spec.ts` can locate it.

## Token-mapping rules

- **No raw hex (`#xxxxxx`) or `rgb()`** in `src/components/marketing/**` outside `<svg>` literals where token references are not supported. Even there, prefer `fill="currentColor"` and let a parent `text-…` set the colour.
- **No new top-level CSS variables.** The OKLCH semantic tokens defined in `src/app/globals.css` (lines 88-152 light, 158-223 dark) are the source of truth. Where a design ramp step has no semantic match, derive via `color-mix(in oklch, var(--accent) 12%, transparent)` inline at the use site.
- **No `.css` imports.** All styling translates to Tailwind utilities or `style={...}` for inline computed values (e.g. `width: ${value}%`).
- **No `dangerouslySetInnerHTML`** outside `json-ld/`.

## Reduced-motion convention

All Motion uses go through `<MotionSection>` (`./motion-section.tsx`). It wraps `motion.section` from `motion/react` and short-circuits to a plain `<section>` when `useReducedMotion()` returns `true`. **Do not import `motion.<element>` directly in section components.** The exception is the score widget's internal SVG animations, which gate manually on `useReducedMotion` because they animate non-section elements.

## Test conventions

- `data-section="<name>"` on each section root for snapshot targeting.
- `data-role="<purpose>"` on dynamic SVG/animated elements that need masking in snapshots (e.g. `data-role="score-ring-progress"`, `data-role="sparkline"`).
- `data-mask="date"` on any timestamp / "today"-style text rendered into the device mock so snapshot diffs do not flap on dates.
- Each component co-locates a Vitest test as `<name>.test.tsx`.

## Linux Playwright snapshot baselines

To regenerate snapshots on a Linux baseline (avoiding Win32 subpixel drift):

```bash
PW_VERSION=$(node -p "require('@playwright/test/package.json').version")
PW_TAG="v${PW_VERSION}-jammy"
docker run --rm -v "$PWD:/work" -w /work "mcr.microsoft.com/playwright:${PW_TAG}" \
  npx playwright test marketing-snapshots --update-snapshots --project=desktop-chromium --project=desktop-dark
```

Mobile baselines stay local-only — `marketing-snapshots.spec.ts` skips them in CI to avoid Linux/Win32 subpixel flake.
