-- ============================================================================
-- Beta invite email grants
-- Lets POST /api/admin/beta-access pre-grant an email before the Supabase
-- auth user exists. Signup and OAuth callback fail closed unless this grant
-- exists and is still valid.
-- ============================================================================

CREATE TABLE IF NOT EXISTS beta_access_grants (
    email              TEXT PRIMARY KEY,
    user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subscription_month INTEGER NOT NULL DEFAULT 3
        CHECK (subscription_month >= 1 AND subscription_month <= 3),
    valid_until        TIMESTAMPTZ,
    notes              TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (email = lower(trim(email)))
);

CREATE INDEX IF NOT EXISTS idx_beta_access_grants_user_id
    ON beta_access_grants(user_id)
    WHERE user_id IS NOT NULL;

ALTER TABLE beta_access_grants ENABLE ROW LEVEL SECURITY;

GRANT ALL ON beta_access_grants TO service_role;

-- No browser policies for beta_access_grants. Server-side admin/service role
-- writes grants and checks invite status before creating or admitting users.

CREATE OR REPLACE FUNCTION set_beta_access_grants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.email = lower(trim(NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_beta_access_grants_updated_at ON beta_access_grants;
CREATE TRIGGER trg_beta_access_grants_updated_at
    BEFORE INSERT OR UPDATE ON beta_access_grants
    FOR EACH ROW
    EXECUTE FUNCTION set_beta_access_grants_updated_at();
