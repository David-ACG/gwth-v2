-- ============================================================================
-- 015 — Lift the access constraints the edition model outgrows. Additive
-- value widening only; nothing existing becomes invalid.
--
-- TRIMMED per decision 8 (2026-08-28): the month CHECKs STAY —
-- sections/lessons month 1..3 (003:44, 003:69), user_access
-- subscription_month 0..3 (007:13-14) and beta_access_grants
-- subscription_month 1..3 (009:11-12) are all untouched. Lift them only the
-- day an edition actually needs a shape outside 3 months, and move every
-- twin together in one change: BOTH month CHECKs, the `as 1 | 2 | 3` cast at
-- src/lib/data/lessons.ts:53, and clampCourseMonth at
-- src/lib/billing/access.ts:62.
--
-- What DOES change: an org seat is a new way in. Widen, do not replace.
-- The TS code twins (AccessSource/SubscriptionState unions + the org_seat
-- provisioning hook in src/lib/billing/access.ts) are N6's resolution work;
-- this migration lands the SQL those depend on. org_seat rows use
-- subscription_month 0 (already legal under the 0..3 CHECK) because months
-- do not gate org seats.
-- ============================================================================

-- Re-runnable: drop-if-exists then add leaves the same end state.
ALTER TABLE user_access DROP CONSTRAINT IF EXISTS user_access_access_source_check;
ALTER TABLE user_access ADD CONSTRAINT user_access_access_source_check
    CHECK (access_source IN ('registered', 'manual_beta', 'stripe_course',
                             'stripe_ongoing', 'org_seat'));

ALTER TABLE user_access DROP CONSTRAINT IF EXISTS user_access_subscription_state_check;
ALTER TABLE user_access ADD CONSTRAINT user_access_subscription_state_check
    CHECK (subscription_state IN ('registered', 'month1', 'month2', 'month3',
                                  'ongoing', 'lapsed', 'org'));
-- 'org' = access governed by org_membership + edition, not the Stripe clock.
-- Decision 7 (HYBRID billing): institutions ride org_seat/'org' with Stripe
-- columns NULL; the company Stripe-per-seat flow is designed-for, built later.
