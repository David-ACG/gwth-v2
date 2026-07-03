# Plan: 23 May 2026 UK-Focused Beta Launch

**Date:** 2026-05-04  
**Status:** Planning  
**Source Idea:** Product decision interview, onboarding report, beta launch checklist  
**Beads:** TBD | **Linear:** N/A

## Overview

GWTH needs a functional public beta by 2026-05-23. The beta should be polished enough for paid traffic, but the first real users are beta testers who understand the site is new. The release must complete the loop from public marketing through signup/payment, Month 1 learning, progress, GWTH Score, credential verification, public labs, capstone evidence review, and the internal admin/analytics surfaces David needs to manage the beta.

The first production content milestone is a ten-lesson end-to-end launch slice from the pipeline: research, lesson writing, diagrams/images, intro and main speech, intro video, screencast, P520 test publish, and live gwth.ai/Hetzner publish. This proves the whole lesson factory before scaling the rest of Month 1.

## Goals

- Launch a UK-focused public beta with full Month 1 and about five public labs.
- Complete a coherent launch redesign across public marketing, auth/access, student, admin, and analytics surfaces.
- Make the monthly access model real: `£29/mo` starter pricing, one month unlocked at a time, with `£7.50/mo` Stay Current later.
- Show GWTH Score and credential verification in beta, including current score, trajectory, and applied-AI percentile.
- Keep the learner workflow automated except capstone evidence review and beta support, which David handles through admin/mini-CRM pages.
- Ship 10 complete launch lessons end-to-end from `C:\Projects\1_gwthpipeline520` to P520 and live gwth.ai.

## Scope

### In Scope

- Homepage/product copy alignment with `docs/product-source-of-truth-2026-05-04.md`.
- Full launch surface redesign orchestration using Codex, Claude, and Claude Design.
- Public marketing and conversion pages: homepage, pricing, lessons, labs, why GWTH, about, for teams, newsletter/waitlist, contact, verification, privacy/terms treatment, login, signup, forgot password, and access/payment states.
- Logged-in student pages: dashboard, courses, course detail, lesson viewer, labs, lab detail, progress, bookmarks, notifications, profile, settings, credential/score touchpoints, and access prompts.
- Student dashboard redesign using Claude Design now that David has a full credit allocation again.
- Admin and analytics pages: student list/search, learner profile, manual beta/access grants, capstone evidence review, waitlist/contact/inquiry review, lesson import/admin status, and lightweight launch analytics.
- Signup/auth hardening.
- Stripe subscription for paid access.
- Admin/manual access for known beta testers.
- Full Month 1 lesson import and rendering.
- Ten complete launch lessons through the full pipeline: research, written lesson, diagrams/images, intro speech, main speech, intro video, step-by-step screencast, P520 publish, and live Hetzner/gwth.ai publish.
- Lesson completion rule: intro video 80% watched plus Q&A passed.
- Public labs with written guide, embedded video, and pre-generated audio where useful.
- GWTH Score display and percentile framing.
- Credential page with verification URL and QR code.
- Capstone evidence submission and simple admin review page.
- Waitlist and light teams inquiry path.

### Out of Scope

- Tech Radar public launch.
- Full employer/team sales path.
- Public portfolio sharing.
- Full production sync replacement if `/api/admin/import-lessons` can import beta content.
- Month 2 and Month 3 launch content, except keeping their product framing consistent.

## Technical Approach

Use the current Next.js/Supabase app architecture. Keep product constants in `src/lib/config.ts`, marketing copy in `src/components/marketing/data.ts`, and product truth in `PRODUCT.md` plus `docs/product-source-of-truth-2026-05-04.md`.

Use Supabase for persisted lesson/progress/credential/submission state. Use Stripe for subscription and monthly access. Use the existing pipeline import endpoint, `src/app/api/admin/import-lessons/route.ts`, for Month 1 content import rather than waiting for the older `/api/import/notify` production sync plan.

Use Codex as the orchestration layer for the redesign work in `C:\Projects\GWTH_V2`. Claude Design should be used for high-leverage visual exploration, starting with the student dashboard because David has a full Claude Design credit allocation with 0% used as of 2026-05-08. Treat accepted Claude Design output as shape source material, then port it into the Next.js implementation with Codex plus Claude/Codex coding sessions. Keep the source of truth in beads and this plan, not in screenshots alone.

Launch redesign work should produce a page inventory, design artifact log, implementation target list, and visual QA status for desktop and mobile. Public pages use the brand register; logged-in student/admin/analytics pages use the product register while staying recognisably GWTH.

Use `C:\Projects\1_gwthpipeline520` as the production source for the ten-lesson launch slice. The canonical pipeline plan is `kanban/1_planning/PLAN_2026-05-08_ten-lessons-end-to-end-production.md`, the execution prompt is `kanban/1_planning/PROMPT_2026-05-08_ten-lessons-end-to-end-production.md`, and the tracker is `kanban/1_planning/TEN_LESSON_E2E_TRACKER_2026-05-08.md`. Default lessons are `m1_l01` through `m1_l10`, with same-day source checks for high-stale-risk lessons before writing or publishing.

## Workstreams

### 1. Full Launch Surface Redesign Orchestration

- Coordinate the complete redesign through issue `beads_GWTH-bza.14`.
- Maintain the launch page inventory and surface status across public, auth, student, admin, and analytics pages.
- Use Codex to orchestrate, Claude Design for shape exploration where it matters, and Claude/Codex implementation sessions for production code.
- Define visual QA gates for desktop and mobile before each surface is accepted.

### 2. Product Truth, Homepage, Marketing And Auth

- Align public copy with beginner-to-advanced applied AI.
- Remove stale USD and prominent `£87 total` language.
- Use `GWTH Score`, not `Dynamic Score`, in user-facing copy.
- Keep Tech Radar out of beta navigation/claims.
- Finish homepage issue `beads_GWTH-3ak`.
- Redesign launch-critical public and conversion pages through issue `beads_GWTH-bza.13`.

### 3. Student Product Redesign

- Complete the student dashboard redesign in Claude Design.
- Make the dashboard the beta learner home for current Month 1 progress, next action, GWTH Score, credential status, labs, capstone evidence, and access state through issue `beads_GWTH-bza.11`.
- Extend the dashboard redesign across courses, course detail, lesson viewer, labs, lab detail, progress, bookmarks, notifications, profile, settings, credential/score touchpoints, and access prompts through issue `beads_GWTH-bza.12`.
- Review desktop and mobile dashboard states before production port.
- This is David's main focus on 2026-05-08.

### 4. Admin Mini-CRM And Launch Analytics

- Create the admin page map and implementation plan through issue `beads_GWTH-bza.15`.
- Provide David with student list/search, learner profile, access status, progress status, capstone submission status, and recent activity.
- Include waitlist/contact/inquiry review and lesson import/admin status.
- Add lightweight launch analytics for traffic, signup, paid access, lesson progress, capstone submissions, and credential events.

### 5. Billing And Access

- Add Stripe products/prices for `£29/mo` starter course access and `£7.50/mo` Stay Current.
- Persist subscription/access state.
- Unlock one month at a time.
- Support admin-granted beta access for known testers.

### 6. Ten End-To-End Lesson Production

- Produce the ten-lesson launch slice through pipeline issue `bd_1_gwthpipeline520-ml7p`.
- Default to Month 1 lessons 1-10 unless the live syllabus tracker identifies a better launch set.
- For each lesson, complete research, lesson script, project, quiz, diagrams/images, intro audio, main audio, intro video, screencast, export manifest, P520 QA, and live gwth.ai QA.
- Keep the pipeline tracker updated with asset paths, P520 URLs, live URLs, blockers, and residual fixes.
- Treat P520 acceptance as the gate before publishing to live Hetzner/gwth.ai.

### 7. Month 1 Content Import

- Lock Month 1 beta syllabus.
- Assemble/import Month 1 lessons through `/api/admin/import-lessons`.
- Ensure lesson audio/video URLs render.
- Smoke-test all Month 1 lesson pages.

### 8. Lesson Completion And Progress

- Track intro video watch progress.
- Mark intro video complete at 80%.
- Mark Q&A complete when passed.
- Let learners retry Q&A immediately.
- Mark normal lesson complete from video + Q&A only.

### 9. Capstone Evidence And Portfolio

- Add evidence submission inside capstone lessons.
- Accept screenshot, URL, and screencast/video.
- Feed submissions into a private portfolio dashboard.
- Keep portfolio private and unshared in beta.

### 10. Admin Review

- Create simple admin review page.
- Show pending submissions.
- Support approved and needs-changes outcomes.
- Add checklist plus optional note feedback.

### 11. GWTH Score And Credential

- Display GWTH Score.
- Map score to applied-AI percentile.
- Show score trajectory over roughly three months.
- Build public verification page with learner-controlled sharing.
- Add QR code for credential verification.

### 12. Public Labs

- Publish about five labs as marketing assets.
- Prioritise AI tool bake-offs.
- Include written guide, embedded video, and pre-generated audio.
- Keep labs public and unscored.

## Files Affected / Created

| File                                         | Action              | Notes                                                  |
| -------------------------------------------- | ------------------- | ------------------------------------------------------ |
| `PRODUCT.md`                                 | Modify              | Canonical product/register copy                        |
| `docs/product-source-of-truth-2026-05-04.md` | Create              | Current product decision record                        |
| `src/lib/config.ts`                          | Modify              | Pricing, score, certificate, capstone constants        |
| `src/components/marketing/data.ts`           | Modify              | Homepage/pricing/course copy                           |
| `src/app/api/admin/import-lessons/route.ts`  | Reuse               | Beta import endpoint                                   |
| `src/lib/data/progress.ts`                   | Modify later        | Persist completion rules                               |
| `supabase/migrations/*`                      | Create/modify later | Stripe/access, submissions, credential state           |
| `src/app/(public)`                           | Modify later        | Homepage, marketing, labs, pricing, verification, teams inquiry |
| `src/app/(auth)`                             | Modify later        | Login, signup, forgot-password redesign                |
| `src/app/access`                             | Modify later        | Access/payment state surface                           |
| `src/app/(dashboard)`                        | Modify later        | Student dashboard, course, lesson, lab, progress, profile, settings, credential, admin review, lesson completion |
| `src/app/admin` or dashboard admin routes    | Create later        | Mini-CRM, capstone review, waitlist/contact review, analytics |
| `src/components/marketing`, `src/components/layout`, `src/components/course`, `src/components/progress`, `src/components/settings` | Modify later | Shared redesigned components and page shells |
| `C:\Projects\1_gwthpipeline520\kanban\1_planning\PLAN_2026-05-08_ten-lessons-end-to-end-production.md` | Create | Pipeline plan for ten complete lessons |
| `C:\Projects\1_gwthpipeline520\kanban\1_planning\PROMPT_2026-05-08_ten-lessons-end-to-end-production.md` | Create | Codex execution prompt for the pipeline session |
| `C:\Projects\1_gwthpipeline520\kanban\1_planning\TEN_LESSON_E2E_TRACKER_2026-05-08.md` | Create/update | Per-lesson status, URLs, and QA |
| `C:\Projects\1_gwthpipeline520\data\generated_lessons\<lesson_slug>` | Create/modify | Research, content, diagrams/images, audio, video, QA |
| `C:\Projects\1_gwthpipeline520\data\gwth-exports\month_01` | Create/modify | Export packages for P520 and live publish |

## Acceptance Criteria

- [ ] Public copy uses GBP starter pricing and does not prominently show `£87 total`.
- [ ] Public copy uses GWTH Score language.
- [ ] Public copy frames the course as beginner-to-advanced applied AI, from ChatGPT basics to top 1% applied AI capability.
- [ ] Tech Radar is not part of beta nav/claims.
- [ ] Full launch redesign page inventory exists and has status for public, auth, student, admin, and analytics surfaces.
- [ ] Public marketing and auth/access pages share a coherent launch redesign.
- [ ] Student dashboard redesign is produced in Claude Design and has an identified production implementation target.
- [ ] Student dashboard shows current Month 1 progress, next action, GWTH Score/credential status, labs, capstone evidence status, and subscription/access state.
- [ ] Logged-in student course, lesson, lab, progress, profile/settings, bookmarks, notifications, and access states inherit the same product design system.
- [ ] Admin mini-CRM lets David find students, see access/progress/activity, review capstones, and manage beta support.
- [ ] Launch analytics show public funnel, payment/access, learning progress, capstone submissions, and credential verification events.
- [ ] Stripe monthly subscription works for paid users.
- [ ] Known beta testers can receive manual access.
- [ ] Ten selected launch lessons are complete end-to-end in the pipeline tracker.
- [ ] Each of the ten lessons has current research, lesson content, diagrams/images, intro audio, main audio, intro video, screencast, export manifest, P520 QA, and live QA.
- [ ] P520 test URLs and live gwth.ai URLs are recorded for the ten-lesson launch slice.
- [ ] Full Month 1 lessons load from Supabase.
- [ ] Normal lesson completion requires intro video 80% watched and Q&A passed.
- [ ] Labs are public and unscored.
- [ ] Capstone evidence submission supports screenshot, URL, and screencast/video.
- [ ] David can approve or request changes from an admin page.
- [ ] GWTH Score and credential verification page are visible in beta.

## Dependencies

- Month 1 content package readiness in `C:\Projects\1_gwthpipeline520`.
- Ten-lesson end-to-end production slice `bd_1_gwthpipeline520-ml7p`.
- Pipeline-to-site JSON/import compatibility.
- Stripe account/product configuration.
- Supabase storage decision for screenshots/videos.
- Credential/score design assets David has already created.
- Claude Design credit availability for the dashboard design pass.
- Codex/Claude orchestration time for full launch surface redesign.
- Admin and analytics event/data decisions for beta management.

## Testing Plan

- Unit tests: pricing constants, access helpers, score/percentile mapping, lesson completion rules.
- Integration tests: Stripe webhook/access updates, lesson import API, evidence submission, admin review.
- E2E tests: signup/login, payment, dashboard, lesson completion, lab access, capstone submission, credential verification.
- Pipeline lesson QA: for the ten-lesson slice, verify research freshness, lesson content, quiz/project, diagrams/images, audio, intro video, screencast, export manifest, P520 render, and live render.
- Visual tests: homepage, marketing pages, auth/access, dashboard, course, lesson, labs, progress/profile/settings, admin mini-CRM, analytics, and credential verification on mobile and desktop.
- Accessibility checks: keyboard navigation, focus states, contrast, reduced motion, and status text/icon pairing across the full launch surface.

## Estimated Complexity

Large — this is a launch slice across product copy, billing, content import, progress, credentials, media, and admin review. The safest path is to split it into independent prompts/workstreams and keep the 23 May release bar focused on Month 1 plus public labs.

---

<!-- GATE BELOW — Filled in by Claude after plan writing. Do not edit manually. -->

## Review Checklist

<!-- Appended by Claude with timestamp (Gate 1) -->
