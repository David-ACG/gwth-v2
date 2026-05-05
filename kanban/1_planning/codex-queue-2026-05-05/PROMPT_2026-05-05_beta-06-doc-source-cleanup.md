# Task: Beta 06 - Website Source Of Truth Cleanup

**Date:** 2026-05-05  
**Plan Reference:** `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md`

## What to change

Make website docs point to the current 2026-05-04 product source of truth and mark older conflicting docs as stale where needed.

## Specific Instructions

1. Treat `docs/product-source-of-truth-2026-05-04.md` as the primary product record.
2. Update `PRODUCT.md` so it mirrors the May 4 direction:
   - `£29/month`
   - GWTH Score
   - Tech Radar deferred for beta
   - coding/building as a spine
   - beginner-to-advanced applied AI
3. Add stale banners or notes to older docs where they conflict on `$37.50`, "no coding required", public Tech Radar, or 94 projects.
4. Update architecture docs only enough to stop misleading future agents.
5. Do not rewrite large historical docs wholesale.

## Files likely affected

- `PRODUCT.md`
- `CLAUDE.md`
- `docs/design-requirements.md`
- `docs/architecture/README.md`
- `docs/architecture/technology-decisions.md`
- `docs/architecture/implementation-roadmap.md`

## Acceptance criteria

- [ ] Future agents can identify the May 4 source as authoritative.
- [ ] `PRODUCT.md` no longer conflicts with the May 4 product source.
- [ ] Stale docs are clearly marked instead of silently contradicting current direction.
- [ ] No code behavior changes are included.

## Verification

```bash
git diff -- PRODUCT.md CLAUDE.md docs/design-requirements.md docs/architecture
```

## Notes

This is documentation cleanup only.
