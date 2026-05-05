# Plan: 23 May 2026 UK-Focused Beta Launch

**Date:** 2026-05-04  
**Status:** Planning  
**Source Idea:** Product decision interview, onboarding report, beta launch checklist  
**Beads:** TBD | **Linear:** N/A

## Overview

GWTH needs a functional public beta by 2026-05-23. The beta should be polished enough for paid traffic, but the first real users are beta testers who understand the site is new. The release must complete the loop from public marketing through signup/payment, Month 1 learning, progress, GWTH Score, credential verification, public labs, and capstone evidence review.

## Goals

- Launch a UK-focused public beta with full Month 1 and about five public labs.
- Make the monthly access model real: `£29/mo` starter pricing, one month unlocked at a time, with `£7.50/mo` Stay Current later.
- Show GWTH Score and credential verification in beta, including current score, trajectory, and applied-AI percentile.
- Keep the learner workflow automated except capstone evidence review, which David handles manually in an admin page.

## Scope

### In Scope

- Homepage/product copy alignment with `docs/product-source-of-truth-2026-05-04.md`.
- Signup/auth hardening.
- Stripe subscription for paid access.
- Admin/manual access for known beta testers.
- Full Month 1 lesson import and rendering.
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

## Workstreams

### 1. Product Truth And Homepage

- Align public copy with beginner-to-advanced applied AI.
- Remove stale USD and prominent `£87 total` language.
- Use `GWTH Score`, not `Dynamic Score`, in user-facing copy.
- Keep Tech Radar out of beta navigation/claims.
- Finish homepage issue `beads_GWTH-3ak`.

### 2. Billing And Access

- Add Stripe products/prices for `£29/mo` starter course access and `£7.50/mo` Stay Current.
- Persist subscription/access state.
- Unlock one month at a time.
- Support admin-granted beta access for known testers.

### 3. Month 1 Content Import

- Lock Month 1 beta syllabus.
- Assemble/import Month 1 lessons through `/api/admin/import-lessons`.
- Ensure lesson audio/video URLs render.
- Smoke-test all Month 1 lesson pages.

### 4. Lesson Completion And Progress

- Track intro video watch progress.
- Mark intro video complete at 80%.
- Mark Q&A complete when passed.
- Let learners retry Q&A immediately.
- Mark normal lesson complete from video + Q&A only.

### 5. Capstone Evidence And Portfolio

- Add evidence submission inside capstone lessons.
- Accept screenshot, URL, and screencast/video.
- Feed submissions into a private portfolio dashboard.
- Keep portfolio private and unshared in beta.

### 6. Admin Review

- Create simple admin review page.
- Show pending submissions.
- Support approved and needs-changes outcomes.
- Add checklist plus optional note feedback.

### 7. GWTH Score And Credential

- Display GWTH Score.
- Map score to applied-AI percentile.
- Show score trajectory over roughly three months.
- Build public verification page with learner-controlled sharing.
- Add QR code for credential verification.

### 8. Public Labs

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
| `src/app/(dashboard)`                        | Modify later        | Portfolio, credential, admin review, lesson completion |
| `src/app/(public)`                           | Modify later        | Labs, pricing, credential verification, teams inquiry  |

## Acceptance Criteria

- [ ] Public copy uses GBP starter pricing and does not prominently show `£87 total`.
- [ ] Public copy uses GWTH Score language.
- [ ] Public copy frames the course as beginner-to-advanced applied AI, from ChatGPT basics to top 1% applied AI capability.
- [ ] Tech Radar is not part of beta nav/claims.
- [ ] Stripe monthly subscription works for paid users.
- [ ] Known beta testers can receive manual access.
- [ ] Full Month 1 lessons load from Supabase.
- [ ] Normal lesson completion requires intro video 80% watched and Q&A passed.
- [ ] Labs are public and unscored.
- [ ] Capstone evidence submission supports screenshot, URL, and screencast/video.
- [ ] David can approve or request changes from an admin page.
- [ ] GWTH Score and credential verification page are visible in beta.

## Dependencies

- Month 1 content package readiness in `C:\Projects\1_gwthpipeline520`.
- Pipeline-to-site JSON/import compatibility.
- Stripe account/product configuration.
- Supabase storage decision for screenshots/videos.
- Credential/score design assets David has already created.

## Testing Plan

- Unit tests: pricing constants, access helpers, score/percentile mapping, lesson completion rules.
- Integration tests: Stripe webhook/access updates, lesson import API, evidence submission, admin review.
- E2E tests: signup/login, payment, dashboard, lesson completion, lab access, capstone submission, credential verification.
- Visual tests: homepage, pricing, dashboard, lesson, labs, credential verification on mobile and desktop.

## Estimated Complexity

Large — this is a launch slice across product copy, billing, content import, progress, credentials, media, and admin review. The safest path is to split it into independent prompts/workstreams and keep the 23 May release bar focused on Month 1 plus public labs.

---

<!-- GATE BELOW — Filled in by Claude after plan writing. Do not edit manually. -->

## Review Checklist

<!-- Appended by Claude with timestamp (Gate 1) -->
