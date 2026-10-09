-- ============================================================================
-- 025: Learner notes (bead gwth-launch-fag3).
--
-- One store for every note a learner writes inside a lesson. A note belongs
-- to a lesson and, normally, to a part of it:
--
--   kind = 'part'       the free "Your notes" box at the end of a part. One
--                       per learner per lesson part (partial unique index).
--   kind = 'paragraph'  pinned to one paragraph from the desktop margin pencil.
--   kind = 'words'      pinned to the exact words the learner selected.
--
-- part_key is the part id for a lesson in parts (p1, p2...) or a section key
-- for a page-flip lesson. It survives a rewrite of the part's text. anchor
-- (paragraph and words notes only) holds the quoted text and its offsets.
-- When a rewrite moves the text, the app falls back from the exact words to
-- the part, and from a part that no longer exists to the lesson as a whole.
-- The row itself is never rewritten or deleted by that fallback, so a note
-- is never lost.
--
-- lesson_id deliberately has NO foreign key: lessons are re-imported by the
-- pipeline, and a learner's notes must outlive any re-import.
-- lesson_title and part_title are snapshots for the My notes page and the
-- Markdown download when the lesson or part has since gone.
--
-- No RLS by design (D2, as lesson_parts): every read and write is scoped to
-- the Better Auth user id on the server. Idempotent so it can be re-run.
-- Apply on production BEFORE the release that carries learner notes:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/025_learner_notes.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS learner_notes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    lesson_id    TEXT NOT NULL,
    lesson_title TEXT,
    part_key     TEXT,
    part_title   TEXT,
    kind         TEXT NOT NULL CHECK (kind IN ('part', 'paragraph', 'words')),
    body         TEXT NOT NULL CHECK (char_length(body) <= 10000),
    anchor       JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT learner_notes_anchor_matches_kind_check
        CHECK ((kind = 'part') = (anchor IS NULL)),
    CONSTRAINT learner_notes_part_box_has_part_check
        CHECK (kind <> 'part' OR part_key IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_learner_notes_user_lesson
    ON learner_notes (user_id, lesson_id, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_learner_notes_one_box_per_part
    ON learner_notes (user_id, lesson_id, part_key) WHERE kind = 'part';
