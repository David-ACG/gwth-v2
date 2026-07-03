# Task: Beta 01 - Product Copy And Homepage Alignment

**Date:** 2026-05-05  
**Plan Reference:** `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md`  
**Beads:** `beads_GWTH-3ak` plus beta launch workstream

## What to change

Align public product copy and the production homepage with the 2026-05-04 product source of truth and the selected A1 Field Notebook redesign direction. Keep the release focused on a UK beta for 2026-05-23.

## Specific Instructions

1. Read `docs/product-source-of-truth-2026-05-04.md`, `PRODUCT.md`, `DESIGN.md`, and `src/app/redesign/v-a-1/page.tsx`.
2. Update production marketing copy in `src/components/marketing/data.ts` and related public page components so it uses:
   - `GWTH Score`, not `Dynamic Score`.
   - `£29/month` starter/beta pricing.
   - No prominent `£87 total` framing.
   - Beginner-to-advanced applied AI language.
   - UK-focused framing with "other countries launching soon" where appropriate.
3. Port the selected A1 homepage direction into the production homepage path without removing redesign exploration routes.
4. Keep Tech Radar out of beta navigation and major claims.
5. Preserve the design rules in `DESIGN.md`: no fake stats, no trusted-by row, no decorative eyebrow pills, PNG logos only.

## Files likely affected

- `PRODUCT.md`
- `docs/product-source-of-truth-2026-05-04.md`
- `src/app/(public)/page.tsx`
- `src/app/(public)/layout.tsx`
- `src/components/layout/public-nav.tsx`
- `src/components/marketing/data.ts`
- `src/components/marketing/**`
- `src/lib/config.ts`
- `src/__tests__/pages/marketing-homepage.spec.ts`

## Acceptance criteria

- [ ] Homepage and public marketing copy follow `docs/product-source-of-truth-2026-05-04.md`.
- [ ] Public copy says `GWTH Score`.
- [ ] Public copy uses `£29/month` without prominent `£87 total`.
- [ ] Tech Radar is not promoted as a beta launch feature.
- [ ] A1 visual direction is applied to production homepage.
- [ ] Existing UK citations are preserved or improved.
- [ ] No fake learner counts, logo rows, decorative eyebrow pills, or SVG logo attempts are introduced.

## Verification

```bash
npm test -- src/components/marketing/data.test.ts
npm test -- src/__tests__/pages/marketing-homepage.spec.ts
npm run typecheck
npm run lint
```

Also verify desktop and mobile in browser at `/`.

## Notes

Work in `C:\Projects\GWTH_V2`. Do not touch pipeline files from this prompt.
