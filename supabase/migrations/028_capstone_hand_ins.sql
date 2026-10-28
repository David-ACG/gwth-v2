-- ============================================================================
-- 028: Capstone hand-ins (beads gwth-launch-9289.2 and 9289.3).
--
-- Each month a learner hands in that month's capstone once, at the end of its
-- lessons: the project folder (files, a zip or a GitHub repo link) plus four
-- short answers. Decisions are on bead gwth-launch-9289 and the plan page
-- https://hlab.taila51191.ts.net:9480/project-marking/.
--
--   capstone_submissions  one row per learner per capstone. Carries the best
--                         mark so the GWTH score reads one row (the best of up
--                         to 3 hand-ins counts; a Not yet counts 0).
--   capstone_attempts     one row per hand-in. A 'draft' is a prepared hand-in
--                         the learner has not confirmed yet: its files are the
--                         REDACTED copies they are previewing. Confirming turns
--                         it into hand-in 1, 2 or 3 ('marking'); a draft never
--                         uses up a hand-in and is never sent to a model.
--
-- Status: draft -> marking -> provisional | with_david -> final.
--   marking      handed in, the judges have not finished
--   provisional  the judges agreed; the learner sees the mark at once
--   with_david   the judges disagreed, the mark is near a band line, or a
--                basics line is in doubt; David decides
--   final        David has checked it (or, later, agreed marks stand alone)
--
-- hand_in_id is a random id and the ONLY name the files and the judges ever
-- see: R2 keys are hand-ins/<hand_in_id>/..., never the learner's id or email.
-- files is the manifest of exactly what was previewed and what will be sent
-- (path, bytes, sha256, storage key, redacted or left as it is); preview_sha256
-- is the hash of that manifest plus the answers, and the confirm step refuses
-- if what the learner ticked is not what is stored. recording_key is kept
-- apart from files on purpose: the optional recording is never sent to an AI.
--
-- No RLS by design (D2): every read and write is scoped to the Better Auth
-- user id in the data layer. Idempotent so it can be re-run.
-- Apply on production BEFORE the release that switches hand-ins on:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/028_capstone_hand_ins.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS capstone_submissions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    capstone_id      TEXT NOT NULL,
    best_attempt_id  UUID,
    best_total       INTEGER CHECK (best_total BETWEEN 0 AND 100),
    best_band        TEXT CHECK (best_band IN ('not_yet', 'pass', 'good', 'excellent')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT capstone_submissions_one_per_capstone UNIQUE (user_id, capstone_id)
);

CREATE TABLE IF NOT EXISTS capstone_attempts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id    UUID NOT NULL REFERENCES capstone_submissions(id) ON DELETE CASCADE,
    hand_in_id       TEXT NOT NULL UNIQUE CHECK (hand_in_id ~ '^h_[A-Za-z0-9_-]{22}$'),
    attempt_no       INTEGER CHECK (attempt_no BETWEEN 1 AND 3),
    status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'marking', 'provisional', 'with_david', 'final')),
    source_kind      TEXT NOT NULL CHECK (source_kind IN ('files', 'zip', 'repo')),
    repo_url         TEXT,
    data_choice      TEXT NOT NULL CHECK (data_choice IN ('own', 'example')),
    answers          JSONB NOT NULL,
    files            JSONB NOT NULL DEFAULT '[]'::jsonb,
    checklist        JSONB NOT NULL DEFAULT '[]'::jsonb,
    redaction        JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_sha256   TEXT NOT NULL,
    recording_key    TEXT,
    total            INTEGER CHECK (total BETWEEN 0 AND 100),
    band             TEXT CHECK (band IN ('not_yet', 'pass', 'good', 'excellent')),
    criteria         JSONB NOT NULL DEFAULT '[]'::jsonb,
    basics           JSONB NOT NULL DEFAULT '[]'::jsonb,
    feedback         JSONB,
    flags            JSONB NOT NULL DEFAULT '[]'::jsonb,
    confirmed_at     TIMESTAMPTZ,
    marked_at        TIMESTAMPTZ,
    finalised_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- A draft has no number and no confirmation; a hand-in has both.
    CONSTRAINT capstone_attempts_draft_shape_check
        CHECK ((status = 'draft') = (attempt_no IS NULL AND confirmed_at IS NULL)),
    CONSTRAINT capstone_attempts_repo_url_check
        CHECK ((source_kind = 'repo') = (repo_url IS NOT NULL))
);

-- At most hand-ins 1, 2 and 3 per capstone, each once.
CREATE UNIQUE INDEX IF NOT EXISTS idx_capstone_attempts_number
    ON capstone_attempts (submission_id, attempt_no) WHERE attempt_no IS NOT NULL;

-- One prepared draft at a time; preparing again replaces it.
CREATE UNIQUE INDEX IF NOT EXISTS idx_capstone_attempts_one_draft
    ON capstone_attempts (submission_id) WHERE status = 'draft';

CREATE INDEX IF NOT EXISTS idx_capstone_attempts_status
    ON capstone_attempts (status, confirmed_at);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'capstone_submissions_best_attempt_fkey'
    ) THEN
        ALTER TABLE capstone_submissions
            ADD CONSTRAINT capstone_submissions_best_attempt_fkey
            FOREIGN KEY (best_attempt_id) REFERENCES capstone_attempts(id) ON DELETE SET NULL;
    END IF;
END $$;
