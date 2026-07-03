# Prompt: Claude Dashboard Implementation Review

You are reviewing the GWTH.ai student dashboard implementation for the May 23 beta launch.

Primary issue: `beads_GWTH-bza.11`
Parent issue: `beads_GWTH-bza.14`

Review stance: find launch-risk issues, not taste nits.

## Context To Use

- `PRODUCT.md`
- `DESIGN.md`
- `docs/product-source-of-truth-2026-05-04.md`
- `kanban/1_planning/CONTROL_2026-05-08_beta-launch-redesign.md`
- Current implementation diff for `src/app/(dashboard)/dashboard/page.tsx` and any `src/components/dashboard/*` files.
- Screenshots at 1440px, 768px, and 412px in light and dark mode.

## Product Truth Checks

Verify:

- The dashboard uses `GWTH Score`, not Dynamic Score.
- Labs are clearly unscored.
- Month access is one month at a time.
- The dashboard does not imply public portfolio sharing in beta.
- Capstone evidence is the only manually reviewed learner work.
- No Tech Radar beta claim appears.
- No fake metrics, testimonials, company logos, or learner counts appear.
- Free, paid, and lapsed access states are all coherent.

## UX Checks

Verify:

- The learner can identify the next action in under five seconds.
- The dashboard explains progress toward credential value through layout and labels, not instruction-heavy copy.
- Score, credential, course progress, capstone evidence, labs, notifications, bookmarks, and access state do not compete equally.
- Mobile at 412px has intentional ordering and no overflow.
- Dark mode is not an afterthought.
- Keyboard focus and status labels are clear.

## Design System Checks

Reject:

- Decorative eyebrow pills.
- Gradient text.
- Side-stripe accents.
- Nested cards.
- Generic identical feature-card grids.
- Glassmorphism as decoration.
- Large marketing hero treatment inside the logged-in product.
- Text that overlaps or truncates awkwardly.
- Status communicated by colour alone.

## Output Format

Return findings first, ordered by severity. Include exact file and line references where possible.

Then include:

- Residual risks.
- Suggested fixes.
- Whether the dashboard is ready to become the grammar for `beads_GWTH-bza.12`.
