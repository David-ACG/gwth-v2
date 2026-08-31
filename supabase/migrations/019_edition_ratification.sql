-- ============================================================================
-- 019 — Ratification audit trail on edition_lessons (N7; design 05 section
-- 1.2 "tier = 'exclusive' + state = 'draft' is the ratification workflow",
-- and section 4 Q4). Additive; no existing value becomes invalid.
--
-- What the institution admin screen needs that 014 did not record:
--   - updated_at    : edition_lessons IS the table admins mutate (the tier
--                     picker and the ratification queue both write it), and
--                     it only had created_at (N5 QA style note 5). Existing
--                     rows are stamped with created_at, not NOW(), so the
--                     backfilled default syllabus does not claim to have
--                     been edited today.
--   - decided_at    : when the institution last ratified or sent back.
--   - decided_by    : which user made that call (ON DELETE SET NULL: losing
--                     the account must never delete the lesson's state).
--   - review_note   : why it was sent back for changes.
--
-- D-N7-2: "send back for changes" is state='draft' PLUS a review_note, NOT a
-- third state. edition_lessons_state_check stays ('draft','ratified') and
-- N6's isLessonInEdition (src/lib/data/editions.ts) — which shows learners
-- ratified rows only — is untouched. A sent-back lesson is therefore
-- invisible to learners for exactly the same reason an untouched draft is,
-- with the note explaining the refusal on the admin screen.
--
-- Canonical-DDL rule (D1): this file is the source of truth; the matching
-- Drizzle columns are hand-patched into drizzle/schema.ts (re-apply after any
-- drizzle-kit pull), alongside the 014/016/017 hand-patches already listed in
-- that file's header.
--
-- Idempotent: every statement is IF NOT EXISTS / guarded, so re-running the
-- file on an already-migrated database is a no-op.
-- ============================================================================

ALTER TABLE edition_lessons
    ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ;
ALTER TABLE edition_lessons
    ADD COLUMN IF NOT EXISTS decided_at  TIMESTAMPTZ;
ALTER TABLE edition_lessons
    ADD COLUMN IF NOT EXISTS decided_by  TEXT;
ALTER TABLE edition_lessons
    ADD COLUMN IF NOT EXISTS review_note TEXT;

-- Backfill updated_at from created_at BEFORE it becomes NOT NULL, so the
-- gwth-default backfill rows keep an honest timestamp.
UPDATE edition_lessons SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE edition_lessons
    ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE edition_lessons
    ALTER COLUMN updated_at SET NOT NULL;

-- ADD COLUMN cannot carry a named FK idempotently; add it guarded (the 014
-- pattern for org_membership.edition_id).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE c.conname = 'edition_lessons_decided_by_fkey'
          AND t.relname = 'edition_lessons'
    ) THEN
        ALTER TABLE edition_lessons
            ADD CONSTRAINT edition_lessons_decided_by_fkey
            FOREIGN KEY (decided_by) REFERENCES "user"(id) ON DELETE SET NULL;
    END IF;
END $$;

-- The ratification queue reads "drafts of one edition, oldest first"; the
-- existing idx_edition_lessons_edition already covers the edition predicate,
-- so a partial index on the draft rows keeps the queue cheap as editions grow.
CREATE INDEX IF NOT EXISTS idx_edition_lessons_pending
    ON edition_lessons(edition_id, created_at) WHERE state = 'draft';

COMMENT ON COLUMN edition_lessons.decided_at IS
    'When the institution last ratified or sent back this lesson (N7).';
COMMENT ON COLUMN edition_lessons.decided_by IS
    'The org admin who made that ratification call (N7).';
COMMENT ON COLUMN edition_lessons.review_note IS
    'Why the lesson was sent back for changes; NULL once ratified (N7).';
