-- ============================================================================
-- 027: The buyer's "your gift has been sent" email (bead gwth-launch-v1uj.5).
--
-- David, 2026-10-20, choosing the recommended option: send the buyer a short
-- email when a SCHEDULED gift has gone to its recipient. buyer_notified_at is
-- that email's sent mark, claimed before sending, so it goes once only, even
-- when an admin resends the gift itself.
-- Idempotent. Apply on production after 026 and before the release:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/027_gift_sent_notice.sql
-- ============================================================================

ALTER TABLE prepaid_passes
    ADD COLUMN IF NOT EXISTS buyer_notified_at TIMESTAMPTZ;
