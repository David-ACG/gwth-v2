-- ============================================================================
-- 020 — Persist learner bookmarks.
--
-- A bookmark belongs to exactly one Better Auth user and targets exactly one
-- lesson or lab. Partial unique indexes make repeated saves idempotent while
-- still allowing a learner to save both kinds of content.
--
-- Idempotent so the migration can be safely re-run during environment setup.
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookmarks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    lesson_id  TEXT REFERENCES lessons(id) ON DELETE CASCADE,
    lab_id     TEXT REFERENCES labs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT bookmarks_exactly_one_target_check
        CHECK ((lesson_id IS NOT NULL)::INTEGER + (lab_id IS NOT NULL)::INTEGER = 1)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created
    ON bookmarks(user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_unique_lesson
    ON bookmarks(user_id, lesson_id) WHERE lesson_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_unique_lab
    ON bookmarks(user_id, lab_id) WHERE lab_id IS NOT NULL;

