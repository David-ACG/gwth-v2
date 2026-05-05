# Task: Beta 02 - Billing And Beta Access

**Date:** 2026-05-05  
**Plan Reference:** `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md`

## What to change

Implement the beta access model for `£29/month` course access, `£7.50/month` Stay Current later, and manual admin-granted beta access for known testers.

## Specific Instructions

1. Audit existing auth, Supabase, Stripe, and access helpers before editing.
2. Add or update schema/migrations for subscription/access state if missing.
3. Implement Stripe checkout/webhook/portal routes only where missing or incomplete.
4. Add admin/manual beta access support for known testers.
5. Enforce month-by-month unlocking rather than a one-shot full course purchase.
6. Keep cohorts out of the model.

## Files likely affected

- `src/lib/config.ts`
- `src/lib/auth.ts`
- `src/lib/supabase/**`
- `src/lib/data/**`
- `src/app/api/stripe/**`
- `src/app/api/admin/**`
- `src/app/(auth)/**`
- `src/app/(dashboard)/**`
- `supabase/migrations/**`
- `.env.local.example`

## Acceptance criteria

- [ ] Stripe checkout can create a `£29/month` beta subscription.
- [ ] Webhooks persist access state idempotently.
- [ ] Admin-granted beta access works without Stripe.
- [ ] Access helpers unlock Month 1 first and support month-by-month progression.
- [ ] `£7.50/month` Stay Current is represented but not required for beta launch access.
- [ ] Tests cover subscription state, manual access, and access gating.

## Verification

```bash
npm run typecheck
npm run lint
npm test
```

Run Stripe webhook tests or mocks if the repo already has them. Do not use live Stripe keys in code.

## Notes

Use `docs/product-source-of-truth-2026-05-04.md` as the access/pricing source.
