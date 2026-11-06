-- ============================================================================
-- 032: marketing consent records, first used by Start Here (/start-here),
-- the free lesson behind an email gate (bead gwth-launch-xw6s).
--
-- One row per sign-up, kept as the record of what the person agreed to:
--   wording, button_label   the exact sentence under the form and the exact
--                           button they pressed (David's wording, 2026-10-09)
--   wording_version         which version of that wording was on screen
--   consented_at            when they sent the form
--   confirmed_at            when they opened the link in the confirmation
--                           email (double opt-in: only confirmed rows may be
--                           sent course news)
--   withdrawn_at            when they opted out; set on every row for that
--                           email address
-- Confirmed addresses are also added to the existing waitlist table.
--
-- Additive and idempotent. No RLS by design (D2). The app checks for this
-- table at boot (src/lib/schema-guard.ts), so apply it BEFORE the release
-- that carries /start-here:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/032_marketing_consents.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketing_consents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL,
    source          TEXT NOT NULL,
    wording         TEXT NOT NULL,
    button_label    TEXT NOT NULL,
    wording_version TEXT NOT NULL,
    consented_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at    TIMESTAMPTZ,
    withdrawn_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_marketing_consents_email
    ON marketing_consents (email);
CREATE INDEX IF NOT EXISTS idx_marketing_consents_source
    ON marketing_consents (source, consented_at);
