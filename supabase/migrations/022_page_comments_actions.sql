-- ============================================================================
-- 022: Comment on the real student view, hybrid front end (bead gwth-launch-8ksq).
--
-- David chose the hybrid on 2026-09-25: a card at the mark with one-tap canned
-- actions, numbered marks that stay on the page, a drawn box, and in-place
-- text edits. Contract: src/lib/comments/types.ts (CANNED_ACTIONS,
-- CommentAction, CommentShape, CommentTextEdit).
--
--   action    {category, key, label}: the canned reason; label is set by the
--             server from CANNED_ACTIONS, never taken from the browser
--   shape     {kind: point|box, rel: {x, y, w, h}}: where the mark sits inside
--             its anchored element, as fractions of that element's box
--   text_edit {original, replacement}: an in-place edit of the words
--
-- target_type gains 'area' (a drawn box that is not a picture), and comment
-- may now be empty, because an action or a text edit can stand alone. The
-- rule "empty only when an action or a text edit is present" is enforced by
-- the API (src/lib/comments/validation.ts), not here.
--
-- Idempotent so the migration can be safely re-run during environment setup.
-- ============================================================================

ALTER TABLE page_comments ADD COLUMN IF NOT EXISTS action JSONB;
ALTER TABLE page_comments ADD COLUMN IF NOT EXISTS shape JSONB;
ALTER TABLE page_comments ADD COLUMN IF NOT EXISTS text_edit JSONB;

ALTER TABLE page_comments DROP CONSTRAINT IF EXISTS page_comments_target_type_check;
ALTER TABLE page_comments ADD CONSTRAINT page_comments_target_type_check
    CHECK (target_type IN ('text', 'image', 'area', 'page'));

ALTER TABLE page_comments DROP CONSTRAINT IF EXISTS page_comments_comment_length_check;
ALTER TABLE page_comments ADD CONSTRAINT page_comments_comment_length_check
    CHECK (char_length(comment) BETWEEN 0 AND 4000);
