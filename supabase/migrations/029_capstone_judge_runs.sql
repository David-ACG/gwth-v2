-- ============================================================================
-- 029: Capstone judge runs (bead gwth-launch-9289.5).
--
-- One row per call to a judge: the latest Luna (OpenAI API) or the latest
-- Haiku (Anthropic API) marking one confirmed hand-in. It records which model
-- id the call resolved to at run time (never pinned in code), the tokens, the
-- cost, the validated verdict, and any error. The agreement test (9289.8) and
-- David's check page (9289.7) read the verdicts per judge from here; the
-- monthly spend cap reads cost_usd.
--
-- purpose: 'mark' (a hand-in), 'query' (a learner's query re-mark, 9289.6),
-- 'test' (planted or made-up hand-ins). No learner data is stored here beyond
-- the verdict, which quotes the redacted files.
--
-- No RLS by design (D2). Idempotent so it can be re-run.
-- Apply on production BEFORE the release that switches marking on:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/029_capstone_judge_runs.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS capstone_judge_runs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id     UUID REFERENCES capstone_attempts(id) ON DELETE CASCADE,
    hand_in_id     TEXT NOT NULL,
    judge          TEXT NOT NULL CHECK (judge IN ('luna', 'haiku')),
    model_id       TEXT,
    purpose        TEXT NOT NULL DEFAULT 'mark' CHECK (purpose IN ('mark', 'query', 'test')),
    status         TEXT NOT NULL CHECK (status IN ('ok', 'invalid', 'error')),
    input_tokens   INTEGER,
    output_tokens  INTEGER,
    cost_usd       NUMERIC(10, 6),
    verdict        JSONB,
    error          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capstone_judge_runs_attempt
    ON capstone_judge_runs (attempt_id, created_at);

CREATE INDEX IF NOT EXISTS idx_capstone_judge_runs_created
    ON capstone_judge_runs (created_at);
