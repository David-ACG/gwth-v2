-- ============================================================================
-- 030: Capstone hand-in retention (bead gwth-launch-9289.11, decision 7b).
--
-- A hand-in's stored files (and the optional recording) are deleted 12 months
-- after its mark is final, or sooner when the learner asks. The row stays, so
-- the mark and the feedback stay; its files manifest and recording_key are
-- cleared and these columns record when and why the files went:
--
--   files_deleted_at      when the files were deleted from the hand-ins store
--   files_deleted_reason  'retention' (12 months after finalised_at) or
--                         'learner_request' (asked for earlier deletion)
--
-- A hand-in whose files are deleted is never sent to a marker again
-- (getHandInForMarking refuses it). The job is POST /api/cron/hand-in-retention.
--
-- Idempotent so it can be re-run. Apply on production BEFORE the release that
-- switches hand-ins on, after 028:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/030_capstone_hand_in_retention.sql
-- ============================================================================

ALTER TABLE capstone_attempts ADD COLUMN IF NOT EXISTS files_deleted_at TIMESTAMPTZ;
ALTER TABLE capstone_attempts ADD COLUMN IF NOT EXISTS files_deleted_reason TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'capstone_attempts_files_deleted_check'
    ) THEN
        ALTER TABLE capstone_attempts
            ADD CONSTRAINT capstone_attempts_files_deleted_check
            CHECK (
                (files_deleted_at IS NULL AND files_deleted_reason IS NULL)
                OR (files_deleted_at IS NOT NULL
                    AND files_deleted_reason IN ('retention', 'learner_request'))
            );
    END IF;
END $$;

-- The retention job looks for final hand-ins whose files are still stored.
CREATE INDEX IF NOT EXISTS idx_capstone_attempts_retention
    ON capstone_attempts (finalised_at)
    WHERE files_deleted_at IS NULL AND finalised_at IS NOT NULL;
