# Prompt: Codex Student Dashboard Port

You are working in `C:\Projects\GWTH_V2`.

Primary issue: `beads_GWTH-bza.11`
Parent orchestration issue: `beads_GWTH-bza.14`

Port the accepted Claude Design student dashboard direction into production code.

## Required Context

Read before editing:

- `PRODUCT.md`
- `DESIGN.md`
- `docs/product-source-of-truth-2026-05-04.md`
- `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md`
- `kanban/1_planning/CONTROL_2026-05-08_beta-launch-redesign.md`
- Accepted Claude Design output or screenshots provided by David.

Use the Impeccable product register for this task. State the Impeccable preflight before file edits.

## Current Files

Likely starting points:

- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/header.tsx`
- `src/lib/data/progress.ts`
- `src/lib/data/mock-data.ts`
- `src/lib/types.ts`
- `src/lib/config.ts`

Create focused dashboard components if useful, for example under `src/components/dashboard/`. Keep the page server component responsible for data loading and let presentational components handle layout.

## Preserve Behaviour

- Keep current free, paid, and lapsed state branches.
- Keep `getDashboardUser()`, `getCourses()`, `getAllCourseProgress()`, `getStreak()`, `getBookmarks()`, and `getNotifications()`.
- Add `getDynamicScore()` if the accepted design includes GWTH Score, trajectory, or percentile.
- Keep subscription/access logic through `canUserAccessCourse()`.
- Do not remove existing route paths.
- Do not introduce fake live metrics, fake learner counts, fake testimonials, or fake employer logos.

## Required Dashboard Outcomes

Dashboard must show:

- Clear next action.
- Current Month 1 progress.
- Current course/month access state.
- GWTH Score and applied-AI percentile.
- Credential status or credential readiness cue.
- Capstone evidence state.
- Labs marked as unscored.
- Notifications.
- Bookmarks or saved items.
- Streak/activity.
- Free learner CTA and lapsed payment CTA.

## Design Constraints

- Product register: task-first, familiar, restrained, trustworthy.
- Use existing UI primitives and lucide-react icons.
- Use OKLCH token-backed Tailwind classes from the project.
- Light and dark mode must both render cleanly.
- No decorative eyebrow pills.
- No gradient text.
- No side-stripe accents.
- No nested cards.
- No modal-first interactions.
- Do not put large hero marketing on the logged-in dashboard.
- Do not use visible explanatory text about how to use the dashboard.
- Use status icon plus status text.
- Keep mobile 412px as a first-class target.

## Verification

Run the highest-signal checks that fit the change:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- Start the dev server and inspect `/dashboard` at 1440px, 768px, and 412px in light and dark mode.

If the workspace still has no `.git` directory, note that commit/push is unavailable from this path and keep beads updated locally.

## Beads

- Update `beads_GWTH-bza.11` with the implemented file paths, visual QA status, and any remaining blockers.
- Keep `beads_GWTH-bza.14` updated with orchestration progress.
- Create discovered follow-up issues with `bd create` only when a real launch blocker is found.
