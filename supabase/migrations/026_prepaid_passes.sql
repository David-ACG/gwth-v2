-- ============================================================================
-- 026: Prepaid passes, the course release dates, and a payments ledger
-- (Christmas gift sale, beads epic gwth-launch-v1uj, child v1uj.4).
--
-- A prepaid pass is a one-off payment that buys course access with an end
-- date, either for the buyer ("self") or as a gift for someone else. It is the
-- beta-invite path with a new access source: opening a pass writes a
-- user_access row with access_source = 'prepaid' and prepaid_pass_id set.
--
--   product = 'course'  the whole course, Months 1 to 3 (months = 3)
--   product = 'month1'  the first month only (months = 1)
--
-- The access clock starts when the pass is OPENED (redeemed_at), not when it
-- is bought. "Hold the clock" (decision 5, 2026-10-19): Month 2 and Month 3
-- only start once course_month_release says they are open, so nobody loses any
-- of their three months while a month is still being finished. The timeline is
-- computed on read (src/lib/billing/passes.ts), never by a job.
--
-- stripe_payments is the takings ledger: one row per successful charge
-- (a pass checkout or a paid subscription invoice), so the admin can show the
-- rolling 12-month total against the VAT registration threshold (decision 8,
-- not VAT registered) without asking Stripe.
--
-- No RLS by design (D2): every read and write is server-side and scoped in the
-- data layer. Idempotent so it can be re-run.
-- Apply on production BEFORE the release that carries the gift sale:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/026_prepaid_passes.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS prepaid_passes (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- What the holder types to open it, e.g. GIFT-7KQ2-M9XD-4TPA. Unique.
    code                    TEXT NOT NULL UNIQUE,
    product                 TEXT NOT NULL CHECK (product IN ('course', 'month1')),
    months                  INTEGER NOT NULL CHECK (months IN (1, 3)),
    -- Pence actually paid (6900, 8700, 2900), after any promotion code.
    price_paid              INTEGER NOT NULL CHECK (price_paid >= 0),
    currency                TEXT NOT NULL DEFAULT 'gbp',
    buyer_email             TEXT NOT NULL CHECK (buyer_email = lower(trim(buyer_email))),
    buyer_name              TEXT,
    buyer_user_id           TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    is_gift                 BOOLEAN NOT NULL,
    recipient_name          TEXT CHECK (char_length(recipient_name) <= 120),
    recipient_email         TEXT CHECK (recipient_email = lower(trim(recipient_email))),
    message                 TEXT CHECK (char_length(message) <= 600),
    -- When the "a gift for you" email goes to the recipient. NULL for self.
    deliver_at              TIMESTAMPTZ,
    delivered_at            TIMESTAMPTZ,
    receipt_sent_at         TIMESTAMPTZ,
    opened_email_sent_at    TIMESTAMPTZ,
    -- Purchase + 1 year (decision 4). Printed on the email and the card.
    redeem_by               TIMESTAMPTZ NOT NULL,
    redeemed_by             TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    redeemed_at             TIMESTAMPTZ,
    -- Admin "extend": whole months added to the end of an opened pass.
    extra_months            INTEGER NOT NULL DEFAULT 0 CHECK (extra_months BETWEEN 0 AND 12),
    stripe_checkout_session TEXT UNIQUE,
    stripe_payment_intent   TEXT,
    refunded_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT prepaid_passes_months_match_product_check
        CHECK ((product = 'course' AND months = 3) OR (product = 'month1' AND months = 1)),
    CONSTRAINT prepaid_passes_gift_has_recipient_check
        CHECK (NOT is_gift OR (recipient_email IS NOT NULL AND deliver_at IS NOT NULL)),
    -- redeemed_by can go NULL later (account deleted); redeemed_at stays.
    CONSTRAINT prepaid_passes_redeemed_pair_check
        CHECK (redeemed_by IS NULL OR redeemed_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_prepaid_passes_due_delivery
    ON prepaid_passes (deliver_at)
    WHERE is_gift AND delivered_at IS NULL AND refunded_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_prepaid_passes_redeemed_by
    ON prepaid_passes (redeemed_by)
    WHERE redeemed_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_prepaid_passes_buyer_email
    ON prepaid_passes (buyer_email);

CREATE OR REPLACE FUNCTION set_prepaid_passes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prepaid_passes_updated_at ON prepaid_passes;
CREATE TRIGGER trg_prepaid_passes_updated_at
    BEFORE UPDATE ON prepaid_passes
    FOR EACH ROW
    EXECUTE FUNCTION set_prepaid_passes_updated_at();

-- Month 2 and Month 3 open dates. NULL = not open yet. Set by an admin.
-- Month 1 is always open, so it has no row.
CREATE TABLE IF NOT EXISTS course_month_release (
    month       INTEGER PRIMARY KEY CHECK (month IN (2, 3)),
    opens_at    TIMESTAMPTZ,
    updated_by  TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO course_month_release (month, opens_at)
VALUES (2, NULL), (3, NULL)
ON CONFLICT (month) DO NOTHING;

CREATE TABLE IF NOT EXISTS stripe_payments (
    -- The Stripe object that carried the money: a payment intent for a pass,
    -- an invoice for a subscription. Unique, so a replayed webhook is a no-op.
    id              TEXT PRIMARY KEY,
    kind            TEXT NOT NULL CHECK (kind IN ('pass', 'subscription')),
    amount          INTEGER NOT NULL CHECK (amount >= 0),
    currency        TEXT NOT NULL DEFAULT 'gbp',
    email           TEXT,
    user_id         TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    pass_id         UUID REFERENCES prepaid_passes(id) ON DELETE SET NULL,
    refunded_amount INTEGER NOT NULL DEFAULT 0 CHECK (refunded_amount >= 0),
    paid_at         TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_payments_paid_at
    ON stripe_payments (paid_at);

-- user_access: a pass is a new way in. Widen, do not replace (as 015 did).
ALTER TABLE user_access DROP CONSTRAINT IF EXISTS user_access_access_source_check;
ALTER TABLE user_access ADD CONSTRAINT user_access_access_source_check
    CHECK (access_source IN ('registered', 'manual_beta', 'stripe_course',
                             'stripe_ongoing', 'org_seat', 'prepaid'));

ALTER TABLE user_access
    ADD COLUMN IF NOT EXISTS prepaid_pass_id UUID REFERENCES prepaid_passes(id) ON DELETE SET NULL;

-- Paid course months on a monthly subscription (1..3). The month a payer is
-- in is the number of course payments made, not calendar months since the
-- start, so a held month (hold the clock) never costs them a month.
ALTER TABLE user_access
    ADD COLUMN IF NOT EXISTS course_months_paid INTEGER NOT NULL DEFAULT 0;

ALTER TABLE user_access DROP CONSTRAINT IF EXISTS user_access_course_months_paid_check;
ALTER TABLE user_access ADD CONSTRAINT user_access_course_months_paid_check
    CHECK (course_months_paid BETWEEN 0 AND 3);

-- Renewal reminder (DMCC readiness): the period end we last reminded about,
-- so a replayed invoice.upcoming never sends a second reminder.
ALTER TABLE user_access
    ADD COLUMN IF NOT EXISTS renewal_reminder_for TIMESTAMPTZ;
