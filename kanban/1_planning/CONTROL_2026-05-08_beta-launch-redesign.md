# Control: 2026-05-08 Beta Launch Redesign

Date: 2026-05-08
Owner: Codex orchestration session
Launch target: 2026-05-23
Primary beads: `beads_GWTH-bza.14`, `beads_GWTH-bza.11`, `beads_GWTH-bza.12`, `beads_GWTH-bza.13`, `beads_GWTH-bza.15`, `beads_GWTH-3ak`

## Product Locks

- UK-focused beginner-to-advanced applied AI course.
- Starts with people who use ChatGPT mostly like Google and moves them toward serious applied AI capability.
- Starter access is `£29/mo` per course month. Do not prominently show `£87 total`.
- Stay Current is `£7.50/mo` after course access ends.
- User-facing credential language is `GWTH Score`, not Dynamic Score.
- Tech Radar is deferred from beta public navigation and claims.
- Labs are public marketing assets and bonus learning material. They do not affect GWTH Score.
- Capstone evidence is the only manually reviewed learner work in beta.
- Portfolio sharing is deferred. Portfolio is private by default.
- Logo PNGs are locked. Do not propose, attempt, or render SVG logo variants.

## Design Locks

- Public marketing uses the brand register: calm, UK-grounded, proof-led, field-notebook energy.
- Logged-in student, admin, analytics, and access states use the product register: familiar, dense where useful, task-first, restrained.
- Light mode default, dark mode Graphite Warm parity.
- OKLCH tokens in `src/app/globals.css` are the implementation source.
- Functional pills only. No decorative section eyebrow pills.
- No side-stripe accents, no generic identical feature-card grids, no glassmorphism as decoration, no hero-metric template.
- Cards are used for actual grouped objects, repeated items, and contained tools. No nested cards.
- Status meaning needs icon plus label, never colour alone.
- Mobile floor is 412px. Dashboard and lesson sidebar patterns must collapse cleanly.

## Current Workspace State

- `bd prime` completed.
- `beads_GWTH-bza.14` is already `in_progress`.
- `beads_GWTH-bza.11` is already `in_progress`.
- `beads_GWTH-bza.12`, `.13`, `.15`, and `beads_GWTH-3ak` are open.
- The workspace root has no `.git` directory, so commit and push cannot be assumed from this path.
- `rg` is blocked by the Codex Windows packaged binary path on this machine. Use native PowerShell traversal when needed.

## Workstream Status

| Bead | Surface | Status | Current Decision |
| --- | --- | --- | --- |
| `beads_GWTH-bza.14` | Full redesign orchestration | In progress | Codex owns inventory, sequencing, prompts, implementation gates, and QA evidence. |
| `beads_GWTH-bza.11` | Student dashboard | In progress | Today's first priority. Claude Design explores the dashboard first, then Codex ports the accepted direction. |
| `beads_GWTH-bza.12` | Logged-in student surfaces | Open | Inherit dashboard grammar across course, lesson, labs, progress, bookmarks, notifications, profile, settings, credential, and access prompts. |
| `beads_GWTH-bza.13` | Public marketing and auth | Open | Must align stale public pages with May 4 product truth and keep auth/access visually coherent. |
| `beads_GWTH-bza.15` | Admin mini-CRM and analytics | Open | Design later as product register: dense, searchable, status-rich, desktop-first with acceptable mobile. |
| `beads_GWTH-3ak` | Homepage A1 port | Open | Older homepage port remains launch-relevant but should be sequenced after dashboard design unless public launch blockers surface. |

## Route Inventory

### Public and Conversion

| Route | File | Workstream | Launch Status |
| --- | --- | --- | --- |
| `/` | `src/app/(public)/page.tsx` | `beads_GWTH-3ak`, `beads_GWTH-bza.13` | Existing marketing composition. Needs A1 port and May 4 copy audit. |
| `/pricing` | `src/app/(public)/pricing/page.tsx` | `beads_GWTH-bza.13` | Needs GBP and monthly-access audit. |
| `/lessons` | `src/app/(public)/lessons/page.tsx` | `beads_GWTH-bza.13` | Needs launch coherence and Month 1 framing. |
| `/labs` | `src/app/(public)/labs/page.tsx` | `beads_GWTH-bza.13` | Needs public, unscored lab framing. |
| `/why-gwth` | `src/app/(public)/why-gwth/page.tsx` | `beads_GWTH-bza.13` | Needs certificate-mill contrast and product truth audit. |
| `/about` | `src/app/(public)/about/page.tsx` | `beads_GWTH-bza.13` | Needs brand coherence. |
| `/for-teams` | `src/app/(public)/for-teams/page.tsx` | `beads_GWTH-bza.13` | Keep light inquiry path only. No full employer sales path. |
| `/newsletter` | `src/app/(public)/newsletter/page.tsx` | `beads_GWTH-bza.13` | Keep separate from paid Stay Current. |
| `/contact` | `src/app/(public)/contact/page.tsx` | `beads_GWTH-bza.13` | Needs launch styling and inquiry routing. |
| `/verify/[code]` | `src/app/(public)/verify/[code]/page.tsx` | `beads_GWTH-bza.13`, `beads_GWTH-bza.9` | Needs credential verification coherence. |
| `/privacy`, `/terms` | `src/app/(public)/privacy/page.tsx`, `src/app/(public)/terms/page.tsx` | `beads_GWTH-bza.13` | Needs basic launch treatment. |
| `/tech-radar` | `src/app/(public)/tech-radar/page.tsx` | Product deferral | Keep out of beta nav and claims. |

### Auth and Access

| Route | File | Workstream | Launch Status |
| --- | --- | --- | --- |
| `/login` | `src/app/(auth)/login/page.tsx` | `beads_GWTH-bza.13` | Needs visual coherence with public launch. |
| `/signup` | `src/app/(auth)/signup/page.tsx` | `beads_GWTH-bza.13` | Needs public-to-auth continuity. |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | `beads_GWTH-bza.13` | Needs basic launch treatment. |
| `/access` | `src/app/access/page.tsx` | `beads_GWTH-bza.13`, `beads_GWTH-bza.2` | Needs payment/access state clarity. |

### Logged-In Student

| Route | File | Workstream | Launch Status |
| --- | --- | --- | --- |
| `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | `beads_GWTH-bza.11` | Current first priority. Needs Claude Design direction and Codex port. |
| `/courses` | `src/app/(dashboard)/courses/page.tsx` | `beads_GWTH-bza.12` | Inherit dashboard grammar. |
| `/course/[slug]` | `src/app/(dashboard)/course/[slug]/page.tsx` | `beads_GWTH-bza.12` | Needs Month 1 clarity, access prompts, capstone rhythm. |
| `/course/[slug]/lesson/[lessonSlug]` | `src/app/(dashboard)/course/[slug]/lesson/[lessonSlug]/page.tsx` | `beads_GWTH-bza.12` | Needs viewer coherence and mobile review. |
| `/labs/[slug]` | `src/app/(dashboard)/labs/[slug]/page.tsx` | `beads_GWTH-bza.12` | Needs unscored lab state and public/private continuity. |
| `/progress` | `src/app/(dashboard)/progress/page.tsx` | `beads_GWTH-bza.12`, `beads_GWTH-bza.8` | Needs GWTH Score and percentile patterns. |
| `/bookmarks` | `src/app/(dashboard)/bookmarks/page.tsx` | `beads_GWTH-bza.12` | Secondary launch polish. |
| `/notifications` | `src/app/(dashboard)/notifications/page.tsx` | `beads_GWTH-bza.12` | Must support score decay and lesson update notifications later. |
| `/profile` | `src/app/(dashboard)/profile/page.tsx` | `beads_GWTH-bza.12` | Needs credential and learner identity hooks. |
| `/settings` | `src/app/(dashboard)/settings/page.tsx` | `beads_GWTH-bza.12` | Needs subscription/access state clarity. |

### Admin and Analytics

| Route | File | Workstream | Launch Status |
| --- | --- | --- | --- |
| Admin mini-CRM | TBD under `src/app/admin` or dashboard-admin route | `beads_GWTH-bza.15` | Needs page map and implementation decision. |
| Capstone review | TBD | `beads_GWTH-bza.15`, `beads_GWTH-bza.7` | Needs pending queue, approve, needs changes, checklist, note. |
| Launch analytics | TBD | `beads_GWTH-bza.15` | Needs lightweight funnel, payment/access, lesson, submission, credential events. |
| Lesson import/admin status | API exists at `src/app/api/admin/import-lessons/route.ts` | `beads_GWTH-bza.15`, `beads_GWTH-bza.3` | Needs UI status surface if time permits. |

## Sequencing

1. May 8 AM: Claude Design student dashboard, desktop and mobile, product register.
2. May 8 PM: Codex ports accepted dashboard direction into `src/app/(dashboard)/dashboard/page.tsx` and extracted dashboard components.
3. Next: Extend dashboard component grammar to course detail, lesson viewer shell, labs, progress, profile/settings, and access prompts.
4. Next: Resume homepage A1 production port and audit public/auth/access copy against May 4 product truth.
5. Next: Admin mini-CRM page map and build slice for David's beta management workflow.
6. Final launch week: Full visual QA and accessibility pass across public, auth, student, admin, analytics, and credential surfaces.

## Dashboard Design Inputs

Current dashboard implementation:

- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/header.tsx`
- `src/lib/auth.ts`
- `src/lib/data/courses.ts`
- `src/lib/data/progress.ts`
- `src/lib/data/mock-data.ts`
- `src/lib/types.ts`
- `src/lib/config.ts`

Current dashboard state branches:

- `registered` or free learner: course teaser, labs, subscription CTA.
- `month1`, `month2`, `month3`, `ongoing`: course progress, current course card, month progress, streak, notifications, bookmarks.
- `lapsed`: destructive warning and payment update CTA.
- Local development fallback user is `David`, with `subscriptionState: "month3"`.

Missing from the current dashboard, but required for beta:

- GWTH Score and applied-AI percentile.
- Credential status and verification/share path.
- Capstone evidence state.
- Clear next lesson/action.
- Labs as public, unscored bonus material.
- Subscription/access state in plain English.
- Mobile state that feels intentionally designed, not just stacked cards.

## QA Gates

For each accepted surface:

- Desktop screenshot at 1440px or 1280px width.
- Tablet screenshot at 768px width.
- Mobile screenshot at 412px width.
- Light and dark mode checks.
- Keyboard tab order and visible focus.
- Reduced motion respected.
- Text fit in buttons, cards, sidebars, tables, and mobile rows.
- Status labels include icon plus text.
- Copy audit for stale claims: USD, prominent `£87 total`, Tech Radar beta claim, "no coding required" as a blanket promise, fabricated learner counts, fabricated completion rates.
- Slop audit: no decorative eyebrow pills, no side-stripe card accents, no decorative glass cards, no generic identical feature-card grid, no nested cards, no modal as first thought.

## Prompt Files

- Claude Design dashboard prompt: `kanban/1_planning/PROMPT_2026-05-08_claude-design-student-dashboard.md`
- Codex dashboard implementation prompt: `kanban/1_planning/PROMPT_2026-05-08_codex-student-dashboard-port.md`
- Claude implementation review prompt: `kanban/1_planning/PROMPT_2026-05-08_claude-dashboard-implementation-review.md`
