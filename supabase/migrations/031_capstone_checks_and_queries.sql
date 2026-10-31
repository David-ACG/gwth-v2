-- ============================================================================
-- 031: David's checks and learners' queries on capstone marks
-- (beads gwth-launch-9289.6 and 9289.7).
--
-- capstone_attempts gains:
--   checked_at, david_levels  David's decision on a hand-in: the level he gives
--                             each criterion and each basics line. It makes the
--                             mark final and is the answer key the agreement
--                             test (9289.8) compares each judge against.
--   change_note, previous_total, previous_band
--                             when a check or a query changes a mark, the
--                             learner sees the new mark and a line saying why.
--
-- capstone_queries: one query per learner per capstone (decision 6c). The
-- learner picks a criterion and says why (up to 500 characters); both judges
-- re-mark that criterion with the reason attached:
--   remarking   the judges are re-marking
--   answered    the judges agreed on a level (changed or not); the learner may
--               still disagree, which sends it to David
--   with_david  the judges disagreed, or the learner still disagrees
--   resolved    David decided; final
--
-- No RLS by design (D2). Idempotent so it can be re-run.
-- Apply on production BEFORE the release that switches marking on:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/031_capstone_checks_and_queries.sql
-- ============================================================================

ALTER TABLE capstone_attempts ADD COLUMN IF NOT EXISTS checked_at TIMESTAMPTZ;
ALTER TABLE capstone_attempts ADD COLUMN IF NOT EXISTS david_levels JSONB;
ALTER TABLE capstone_attempts ADD COLUMN IF NOT EXISTS change_note TEXT;
ALTER TABLE capstone_attempts ADD COLUMN IF NOT EXISTS previous_total INTEGER;
ALTER TABLE capstone_attempts ADD COLUMN IF NOT EXISTS previous_band TEXT;

CREATE TABLE IF NOT EXISTS capstone_queries (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id  UUID NOT NULL REFERENCES capstone_submissions(id) ON DELETE CASCADE,
    attempt_id     UUID NOT NULL REFERENCES capstone_attempts(id) ON DELETE CASCADE,
    criterion_id   TEXT NOT NULL,
    reason         TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 500),
    status         TEXT NOT NULL DEFAULT 'remarking'
                   CHECK (status IN ('remarking', 'answered', 'with_david', 'resolved')),
    level_before   TEXT NOT NULL,
    level_after    TEXT,
    remark         JSONB,
    still_disagrees BOOLEAN NOT NULL DEFAULT FALSE,
    david_note     TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at    TIMESTAMPTZ,
    CONSTRAINT capstone_queries_one_per_capstone UNIQUE (submission_id)
);

CREATE INDEX IF NOT EXISTS idx_capstone_queries_status ON capstone_queries (status, created_at);
