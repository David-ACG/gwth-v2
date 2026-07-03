# Task: Split 23 May Beta Launch Into Buildable Workstreams

**Date:** 2026-05-04  
**Plan Reference:** PLAN_2026-05-04_beta-launch-23-may.md  
**Beads:** TBD | **Linear:** N/A

## What to change

Turn the 23 May beta launch plan into implementation workstreams that can be executed independently without losing the product decisions David made on 2026-05-04.

## Specific Instructions

1. Use `docs/product-source-of-truth-2026-05-04.md` as the product source of truth.
2. Use `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md` as the launch plan.
3. Create implementation tasks or beads for these workstreams:
   - Product copy/homepage alignment.
   - Stripe monthly access.
   - Admin/manual beta access.
   - Month 1 pipeline import.
   - Lesson completion/progress.
   - Public labs.
   - Capstone evidence submission.
   - Admin review.
   - GWTH Score and percentile mapping.
   - Credential verification URL and QR code.
4. Keep Tech Radar, full employer sales, and public portfolio sharing out of beta scope.

## Files likely affected

- `PRODUCT.md`
- `docs/product-source-of-truth-2026-05-04.md`
- `src/lib/config.ts`
- `src/components/marketing/data.ts`
- `src/app/api/admin/import-lessons/route.ts`
- `src/app/(dashboard)`
- `src/app/(public)`
- `src/lib/data`
- `supabase/migrations`

## Patterns to Follow

- Use Supabase-first data where production state matters.
- Keep mock fallback only where it is explicitly non-production.
- Keep public copy UK-focused, GBP-priced, and honest about starter pricing.
- Avoid public Tech Radar claims in beta.
- Make normal lesson completion automated; reserve manual review for capstones.

## Acceptance criteria

- [ ] Beta workstreams are granular enough to implement independently.
- [ ] Every workstream has testable acceptance criteria.
- [ ] Every workstream names likely files/routes/schema touched.
- [ ] The plan preserves David's decisions about pricing, score, labs, capstones, and launch date.

## Notes

Decision record:

- `C:\Users\david\Documents\Codex\2026-05-04\you-are-onboarding-to-gwth-ai\GWTH_DECISION_INTERVIEW_RAW_AND_INTERPRETED_2026-05-04.md`

Current release date target:

- 2026-05-23

---

<!-- GATES BELOW — Filled in by Claude at each stage. Do not edit manually. -->

## Review Checklist

<!-- Appended by Claude with timestamp (Gate 2) -->

## Implementation Notes

<!-- Appended by Claude with timestamp (Gate 3) -->

## Testing Checklist

<!-- Appended by Claude with timestamp (Gate 4) -->

### Actions for David

No actions required.
