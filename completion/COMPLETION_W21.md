# Completion: W21 — Pre-CIPD-demo visual polish sweep (mobile overflow + beta chrome)

**Date:** 2026-07-23 · **Repo:** GWTH_V2 · **Commit (master):** `65d0948`
**Staging:** `gwth-v2:staging` (fresh HEAD build) live on hlab `:3001`
**Prod:** gwth.ai, Coolify app `tw0cc8oc0w4scwoccs0cw0go` (git source `David-ACG/gwth-v2` @ `master`), deploy `loscocks48s4cgw848kow88s`
**Status:** verified on staging AND production
**Beads:** closes `gwth-launch-sg6` (P1 mobile overflow) + `gwth-launch-fqp` (P2 beta chrome); files `gwth-launch-0xo` (M1 narration audio gap, pipeline work)

Fixes the two pre-invite tester bugs from the 2026-07-10 review plus a
systematic 1440/390 QA of every student-facing route. FDE register only,
British English, no em dashes, no new dependencies, labs IA untouched (W22
owns it; only sg6's lab-page overflow was fixed).

## What to verify (3 bullets)

- **No mobile horizontal scroll anywhere.** On a 390px-wide phone, the lesson
  viewer, `/labs`, `/progress` and a lab detail page no longer scroll sideways
  or clip content. Programmatic proof: `document.scrollWidth == viewport` on
  all 11 routes × light/dark × {1440, 390} (44 shots) — **8 overflow combos
  before, 0 after** (`completion/W21/{before,after}/overflow-report.json`).
  Wide code/prompt blocks and the streak calendar now scroll inside their own
  box instead of stretching the page.
- **Beta chrome is honest.** Locked Month 2/3 dashboard cards show "35 lessons"
  instead of "£29" (beta has no checkout); `/progress` shows real lesson titles
  instead of "Lesson m1_l01"; day/days is singular-aware; the course reads
  "Applied AI Skills" with a calm, em-dash-free description (mock + staging +
  prod DB); the homepage credential preview no longer invents "Sarah Mensah /
  AI Literacy Foundations"; the `/guide` narration promise is now honest.
- **Nothing else regressed.** 402 Vitest tests pass, ESLint + tsc clean, zero
  console errors across all 44 captures, every route HTTP 200 in both themes.

## Root cause (sg6)

The dashboard layout's content wrapper (`flex flex-1 flex-col`) lacked
`min-w-0`, so its default `min-width:auto` (= min-content of the widest
descendant — a code block or the 53-week streak calendar) ballooned the whole
page and defeated every inner `overflow-x-auto`. Adding `min-w-0` down the
flex/grid chain (layout, lesson content column, `.proseBody`, `.lesson-prose`)
plus an explicit `minmax(0,1fr)` base track on the `/labs` card grid lets the
scroll containers engage. Not a viewport hack.

## Before / after (mobile 390, the sg6 routes)

| Route | Before (390) | After (390) |
|---|---|---|
| Lesson viewer | `before/lesson-light-390.png` (+166px) | `after/lesson-light-390.png` (0) |
| /labs | `before/labs-public-light-390.png` (+815px) | `after/labs-public-light-390.png` (0) |
| /progress | `before/progress-light-390.png` (+407px) | `after/progress-light-390.png` (0) |
| Lab detail | `before/lab-detail-light-390.png` (+138px) | `after/lab-detail-light-390.png` (0) |

Full 44-shot grid (11 routes × light/dark × 1440/390) in
[completion/W21/before/](W21/before/) and [completion/W21/after/](W21/after/).
Chrome fixes are visible in `after/dashboard-*`, `after/progress-*`,
`after/home-*`.

## URLs

Staging (log in first; LAN origin is Better-Auth-trusted):
- Dashboard: http://192.168.178.50:3001/dashboard
- Progress: http://192.168.178.50:3001/progress
- Labs: http://192.168.178.50:3001/labs
- Lab detail: http://192.168.178.50:3001/labs/the-prompt-ladder
- Lesson: http://192.168.178.50:3001/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers

Production:
- Home: https://gwth.ai/
- Dashboard: https://gwth.ai/dashboard
- Progress: https://gwth.ai/progress
- Labs: https://gwth.ai/labs

## Changes

- `src/app/(dashboard)/layout.tsx` — `min-w-0` on content wrapper + main (root sg6 fix)
- `src/components/marketing/labs-fde/labs-fde.module.css` — base `minmax(0,1fr)` grid track
- `src/app/(dashboard)/course/[slug]/lesson/[lessonSlug]/editorial-lesson-viewer.tsx` — responsive padding + `min-w-0`
- `src/app/(dashboard)/course/[slug]/lesson/[lessonSlug]/lesson-fde.module.css` — `.proseBody { min-width: 0 }`
- `src/app/globals.css` — `.lesson-prose` containment (min-width, overflow-wrap, scrollable table/pre)
- `src/app/(dashboard)/dashboard/page.tsx` — drop £29 on locked cards, singular DAY/DAYS, "INVITE ONLY" label
- `src/app/(dashboard)/progress/page.tsx` — lesson titles not raw ids, singular day/days
- `src/lib/data/mock-data.ts` + staging/prod DB — course title/description de-em-dashed
- `src/components/marketing/home-fde/home-fde.tsx` — honest credential preview
- `src/app/(dashboard)/guide/page.tsx` — honest narration copy
- `deploy/w21-provision.sh`, `deploy/shot-w21.mjs` — test-account + screenshot/overflow harness
