-- ============================================================================
-- 016 — Server-side grading support (N6; design 05 section 1.4). Additive.
--
-- Grading itself moved server-side under N2 (submitQuizAnswersAction); this
-- migration adds the audit trail that design 05 section 3 specifies:
--   - graded_by: which side computed the stored quiz outcome. Every existing
--     row keeps the default 'client' (decision 6, 2026-08-28: grandfather
--     client-graded rows silently — the current population is the David-only
--     allowlist, and the original answers were never stored so re-grading is
--     impossible by construction). New submissions through
--     recordQuizSubmission stamp 'server'.
--   - quiz_answers: the answer set {question_id: option_index} behind the
--     STANDING best_quiz_score (a worse retry does not replace it), so the
--     stored outcome of record can be audited against the key later.
--
-- A row that has only video progress (no quiz submission yet) keeps the
-- 'client' default; the first server-graded submission flips it. graded_by is
-- only meaningful alongside the quiz fields.
--
-- Canonical-DDL rule (D1): this file is the source of truth; the matching
-- Drizzle columns are hand-patched into drizzle/schema.ts (re-apply after any
-- drizzle-kit pull).
-- ============================================================================

ALTER TABLE lesson_progress
    ADD COLUMN IF NOT EXISTS graded_by TEXT NOT NULL DEFAULT 'client';
ALTER TABLE lesson_progress
    ADD COLUMN IF NOT EXISTS quiz_answers JSONB;

-- ADD COLUMN cannot carry a named CHECK idempotently; add it guarded.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'lesson_progress_graded_by_check'
          AND conrelid = 'lesson_progress'::regclass
    ) THEN
        ALTER TABLE lesson_progress
            ADD CONSTRAINT lesson_progress_graded_by_check
            CHECK (graded_by IN ('client', 'server'));
    END IF;
END $$;

-- Stop advertising answers. RLS is decorative under D2 (the app connects as
-- service role), but the policy is the documented contract and the fossil
-- layer should not promise public reads of the answer key.
DROP POLICY IF EXISTS "Public can read quiz questions" ON quiz_questions;
