# Task: Beta 05 - Capstone Evidence And Admin Review

**Date:** 2026-05-05  
**Plan Reference:** `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md`

## What to change

Add beta capstone evidence submission and a simple private admin review page for David.

## Specific Instructions

1. Add capstone evidence submission from within relevant capstone lessons.
2. Accept screenshot, working URL, and screencast/video evidence.
3. Store submission status: pending, approved, needs changes.
4. Create a private dashboard/admin page listing pending submissions.
5. Add approve and needs-changes actions.
6. Needs-changes feedback must include checklist items and optional free-text note.
7. Keep portfolio private by default. Do not build public portfolio sharing.

## Files likely affected

- `src/app/(dashboard)/course/**`
- `src/app/(dashboard)/portfolio/**`
- `src/app/(dashboard)/admin/**`
- `src/app/api/admin/**`
- `src/lib/data/**`
- `src/lib/validations.ts`
- `supabase/migrations/**`
- `src/components/ui/**` only if existing components are insufficient

## Acceptance criteria

- [ ] Learner can submit capstone evidence.
- [ ] Evidence supports screenshot, URL, and screencast/video.
- [ ] Admin can view pending submissions.
- [ ] Admin can approve or request changes.
- [ ] Needs-changes response supports checklist and optional note.
- [ ] Portfolio/submissions remain private in beta.

## Verification

```bash
npm run typecheck
npm test
```

Browser smoke-test learner submission and admin review.

## Notes

Do not add public portfolio sharing in this prompt.
