# Task: Beta 03 - Month 1 Import And Rendering

**Date:** 2026-05-05  
**Plan Reference:** `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md`

## What to change

Make the website able to import and render the Month 1 beta lesson package produced by the pipeline.

## Specific Instructions

1. Audit `src/app/api/admin/import-lessons/route.ts` and existing lesson data/rendering paths.
2. Compare the importer shape with pipeline exports under `C:\Projects\1_gwthpipeline520\data\gwth-exports`.
3. Add validation for lesson markdown, project markdown, Q&A JSON/markdown, intro video, main audio, and manifest metadata.
4. Ensure imported lessons render in the dashboard lesson viewer.
5. Add graceful handling for missing optional media while beta content is still being filled.
6. Add smoke tests around one representative imported lesson.

## Files likely affected

- `src/app/api/admin/import-lessons/route.ts`
- `src/lib/data/lessons.ts`
- `src/lib/data/courses.ts`
- `src/components/course/lesson-viewer.tsx`
- `src/components/lesson/**`
- `src/lib/types.ts`
- `src/lib/types/pipeline.ts`
- `supabase/migrations/**`
- `tests/**` or `src/__tests__/**`

## Acceptance criteria

- [ ] Website accepts a representative pipeline Month 1 lesson export.
- [ ] Lesson page renders lesson content, project content, Q&A, intro media, and audio where available.
- [ ] Missing optional media does not crash the lesson page.
- [ ] Import validation reports actionable errors.
- [ ] Tests cover at least one import and render path.

## Verification

```bash
npm run typecheck
npm test
```

Browser smoke-test one imported Month 1 lesson route.

## Notes

Coordinate with pipeline prompt `PROMPT_2026-05-05_pipeline-04-export-import-contract.md`.
