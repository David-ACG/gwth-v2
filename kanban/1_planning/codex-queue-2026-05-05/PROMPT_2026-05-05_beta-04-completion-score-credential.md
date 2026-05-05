# Task: Beta 04 - Completion, GWTH Score, And Credential

**Date:** 2026-05-05  
**Plan Reference:** `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md`

## What to change

Implement beta-level automated lesson completion, GWTH Score display, percentile framing, and a public verification URL with QR code.

## Specific Instructions

1. Implement normal lesson completion:
   - intro video watched to at least 80 percent
   - 3-question Q&A passed
   - immediate Q&A retry allowed
2. Store completion/progress state in Supabase-backed data paths where production state matters.
3. Add GWTH Score display and percentile mapping using the product source-of-truth language.
4. Create a public credential verification route controlled by learner sharing state.
5. Include learner name, current GWTH Score, approximate trajectory, and applied-AI percentile.
6. Add QR code generation for verification URL.

## Files likely affected

- `src/lib/data/progress.ts`
- `src/lib/data/scores.ts`
- `src/components/course/quiz-engine.tsx`
- `src/components/shared/video-player.tsx`
- `src/components/progress/**`
- `src/app/(dashboard)/progress/**`
- `src/app/(dashboard)/profile/**`
- `src/app/(public)/verify/**`
- `supabase/migrations/**`

## Acceptance criteria

- [ ] A lesson completes only after intro video progress reaches 80 percent and Q&A is passed.
- [ ] Q&A can be retried immediately.
- [ ] GWTH Score is visible in dashboard.
- [ ] Credential verification URL renders publicly only when sharing is enabled.
- [ ] Credential includes QR code.
- [ ] Tests cover completion rules and score/percentile mapping.

## Verification

```bash
npm run typecheck
npm test
```

Browser smoke-test lesson completion and a credential verification route.

## Notes

Use `GWTH Score` everywhere user-facing.
