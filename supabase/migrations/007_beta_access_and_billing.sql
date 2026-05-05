-- ============================================================================
-- Beta access + Stripe billing foundation
-- Supports manual beta grants, monthly course subscriptions, and future
-- Stay Current access without changing lesson/content tables.
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_access (
    user_id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    access_source              TEXT NOT NULL DEFAULT 'registered'
        CHECK (access_source IN ('registered', 'manual_beta', 'stripe_course', 'stripe_ongoing')),
    subscription_state         TEXT NOT NULL DEFAULT 'registered'
        CHECK (subscription_state IN ('registered', 'month1', 'month2', 'month3', 'ongoing', 'lapsed')),
    subscription_month         INTEGER NOT NULL DEFAULT 0
        CHECK (subscription_month >= 0 AND subscription_month <= 3),
    valid_until                TIMESTAMPTZ,
    grace_period_ends          TIMESTAMPTZ,
    last_payment_at            TIMESTAMPTZ,
    stripe_customer_id         TEXT UNIQUE,
    stripe_subscription_id     TEXT UNIQUE,
    stripe_price_id            TEXT,
    stripe_subscription_status TEXT,
    notes                      TEXT,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_access_stripe_customer_id
    ON user_access(stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_access_stripe_subscription_id
    ON user_access(stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS stripe_events (
    id          TEXT PRIMARY KEY,
    type        TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can read own access"
        ON user_access FOR SELECT
        TO authenticated
        USING ((SELECT auth.uid()) = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- No browser policies for writes. Server-side admin client/service role performs
-- manual beta grants, Stripe webhook updates, and checkout customer linking.

CREATE OR REPLACE FUNCTION set_user_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_access_updated_at ON user_access;
CREATE TRIGGER trg_user_access_updated_at
    BEFORE UPDATE ON user_access
    FOR EACH ROW
    EXECUTE FUNCTION set_user_access_updated_at();
