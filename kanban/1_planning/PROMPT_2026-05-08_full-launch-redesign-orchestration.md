# Prompt: Full GWTH.ai Launch Redesign Orchestration

You are working in `C:\Projects\GWTH_V2`.

Act as the Codex orchestration session for the full GWTH.ai May 23 beta launch redesign. David will use Claude Design today, starting with the student dashboard, and will rely on Codex to keep the full redesign moving through implementation, QA, and launch readiness. Work autonomously. Do not ask permission to proceed. Make the best decision, update beads, implement, verify, commit, and push where the repo supports it.

## Start Here

1. Run `bd prime`.
2. Read:
   - `PRODUCT.md`
   - `DESIGN.md`
   - `docs/product-source-of-truth-2026-05-04.md`
   - `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md`
3. Inspect these beads:
   - `bd show beads_GWTH-bza`
   - `bd show beads_GWTH-bza.14` full launch redesign orchestration
   - `bd show beads_GWTH-bza.11` student dashboard, today first
   - `bd show beads_GWTH-bza.12` logged-in student surfaces
   - `bd show beads_GWTH-bza.13` public marketing and auth surfaces
   - `bd show beads_GWTH-bza.15` admin mini-CRM and analytics
   - `bd show beads_GWTH-3ak` homepage redesign port
4. Claim `beads_GWTH-bza.14` and `beads_GWTH-bza.11` if they are not already claimed.

## Mission

Complete the launch redesign across the surfaces needed for the May 23 beta:

- Public marketing and conversion: `/`, `/pricing`, `/lessons`, `/labs`, `/why-gwth`, `/about`, `/for-teams`, `/newsletter`, `/contact`, `/verify/[code]`, privacy/terms treatment, waitlist states.
- Auth and access: `/login`, `/signup`, `/forgot-password`, `/access`, checkout/portal states.
- Logged-in student product: `/dashboard`, `/courses`, `/course/[slug]`, `/course/[slug]/lesson/[lessonSlug]`, `/labs`, `/labs/[slug]`, `/progress`, `/bookmarks`, `/notifications`, `/profile`, `/settings`, credential/score touchpoints, access prompts.
- Admin and analytics: create the missing admin surface for student search/list, learner profile, manual beta/access grants, capstone evidence review, waitlist/contact/inquiry review, lesson import/admin status, and lightweight launch analytics for public funnel, payment/access, learning progress, capstone submissions, and credential events.

Use Codex as the integrator and tracker. Use Claude Design for high-leverage visual exploration, starting with the student dashboard. Treat accepted Claude Design output as shape source material; port it into production Next.js code. Keep beads and the launch plan current.

## Working Order

### Phase 1: Control Centre

- Create or update `kanban/1_planning/REDESIGN_TRACKER_2026-05-08.md`.
- Include page inventory, status, source files, owner issue, design artifact path, implementation status, mobile QA, desktop QA, and blockers.
- Group pages into public/marketing, auth/access, student, admin/analytics.
- Mark the dashboard as first active focus.

### Phase 2: Student Dashboard First

- Use Claude Design credits for the dashboard shape exploration.
- Give David a concise Claude Design input if the artifact is not already available.
- Once a direction is accepted, save any design notes, screenshots, or artifacts under `kanban/design-artefacts/2026-05-08/dashboard/`.
- Implement the dashboard in `src/app/(dashboard)/dashboard/page.tsx` and shared dashboard components.
- The dashboard must show: current Month 1 progress, next lesson/action, GWTH Score, credential status, labs, capstone evidence status, subscription/access state, recent activity, and notifications.
- Verify desktop and mobile.

### Phase 3: Student Product Surfaces

- Extend the dashboard system into courses, course detail, lesson viewer, labs, progress, bookmarks, notifications, profile, settings, credential/score touchpoints, and access prompts.
- Make the learner's next action obvious on every major page.
- Keep logged-in surfaces dense, calm, useful, and product-like. Avoid marketing layout habits inside the app.

### Phase 4: Public Marketing And Auth

- Finish the homepage direction from `beads_GWTH-3ak`.
- Bring all launch-critical public pages and auth/access pages into the same redesigned system.
- Preserve May 4 product truth: UK-focused, GBP, `£29/month`, no prominent `£87 total`, GWTH Score language, Tech Radar deferred from beta claims.
- Verify no stale USD, no public Tech Radar launch claims, no fake learner/testimonial stats.

### Phase 5: Admin Mini-CRM And Analytics

- Design and implement the minimum admin surface David needs for beta.
- Include student list/search, learner detail, manual beta/access grants, capstone evidence review, waitlist/contact/inquiry review, import/admin status, and lightweight analytics.
- Prefer a utilitarian product UI: compact, scannable, fast, no marketing decoration.
- If data is missing, build clean empty/loading/error states and wire the real endpoints where available.

### Phase 6: QA And Landing The Plane

- Run focused tests and type/lint/build checks appropriate to changed files.
- Use Playwright/browser screenshots for mobile and desktop on each surface group.
- Fix overlap, clipping, contrast, focus order, and empty/error states.
- Update beads after each milestone. Close finished issues only after implementation and verification.
- Commit and push. If `bd dolt push` has no remote, record that failure clearly and continue with Git push.

## Design Rules

- Follow `PRODUCT.md` and `DESIGN.md`.
- Public pages are brand surfaces. Student/admin/analytics pages are product surfaces.
- Use OKLCH tokens and the existing GWTH design system.
- No decorative eyebrow pills, fake metrics, trusted-by rows, gradient body text, side-stripe cards, glassmorphism-by-default, identical feature-card grids, or modal-first flows.
- Do not use visible in-app explanatory text about how the UI works unless it is genuine user-facing copy.
- Use icons for actions where appropriate, and keep controls stable on mobile and desktop.
- Treat admin/analytics as operational tools: quiet, dense, useful, clear.

## Current Priority

Today, 2026-05-08, concentrate first on the student dashboard redesign (`beads_GWTH-bza.11`) while keeping the full redesign tracker alive (`beads_GWTH-bza.14`). The rest of the launch surface follows from that system.

