-- ============================================================================
-- 034: The GWTH.ai score share code (bead gwth-launch-phjb).
--
-- One row per learner who has chosen to share their score. The code is the
-- learner's public score page, gwth.ai/verify/<code>, the link LinkedIn's
-- Show credential opens. It is minted the first time the learner makes their
-- score page public, and it never changes, so a link already on a profile
-- keeps working. The page reads the learner's score LIVE each time it is
-- opened; nothing about the score is stored here.
--
-- is_public is the learner's opt-in: while it is false the code opens
-- nothing (404), and the learner can switch it off and on again at any time.
--
-- Replaces credential_verifications (008), which was written for Supabase,
-- stored a score that would go stale, and was never written by anything. That
-- table is left in place, unused, for a later clean-up migration.
-- No RLS by design (D2). Idempotent so it can be re-run.
-- Apply on production BEFORE the release that carries this code:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/034_score_shares.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS score_shares (
    user_id     TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    code        TEXT NOT NULL UNIQUE CHECK (code ~ '^[a-z2-9]{10}$'),
    is_public   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
