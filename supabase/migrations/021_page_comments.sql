-- ============================================================================
-- 021: Comment on the real student view (bead gwth-launch-8ksq).
--
-- David and named beta testers select words or click a picture on any page
-- and leave a comment. Comments are triaged by an agent through the pipeline
-- API; nobody reviews an inbox. Contract: src/lib/comments/types.ts.
--
-- beta_testers: one row per user who may comment (set from /admin/roster).
-- page_comments: one row per comment, with enough anchoring (quote, prefix,
-- suffix, selector, heading, context) for an agent to find the spot again.
--
-- No RLS by design (D2: the app connects as the service role; scoping is
-- application code in src/lib/data/page-comments.ts).
--
-- Idempotent so the migration can be safely re-run during environment setup.
-- ============================================================================

CREATE TABLE IF NOT EXISTS beta_testers (
    user_id  TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    added_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_comments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    author_email      TEXT NOT NULL,
    author_role       TEXT NOT NULL,
    site              TEXT NOT NULL DEFAULT 'local',
    page_path         TEXT NOT NULL,
    page_title        TEXT,
    lesson_id         TEXT,
    lesson_page       INTEGER,
    lesson_page_title TEXT,
    lesson_variant    TEXT,
    target_type       TEXT NOT NULL,
    quote             TEXT,
    quote_prefix      TEXT,
    quote_suffix      TEXT,
    selector          TEXT,
    selector_kind     TEXT,
    heading           TEXT,
    image_src         TEXT,
    image_alt         TEXT,
    context           TEXT,
    comment           TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'open',
    triage            JSONB,
    viewport          TEXT,
    user_agent        TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT page_comments_author_role_check
        CHECK (author_role IN ('admin', 'beta')),
    CONSTRAINT page_comments_site_check
        CHECK (site IN ('preview', 'production', 'local')),
    CONSTRAINT page_comments_target_type_check
        CHECK (target_type IN ('text', 'image', 'page')),
    CONSTRAINT page_comments_status_check
        CHECK (status IN ('open', 'accepted', 'fixed', 'declined', 'asked', 'withdrawn')),
    CONSTRAINT page_comments_lesson_variant_check
        CHECK (lesson_variant IS NULL OR lesson_variant IN ('live', 'draft')),
    CONSTRAINT page_comments_selector_kind_check
        CHECK (selector_kind IS NULL OR selector_kind IN ('id', 'testid', 'path', 'root')),
    CONSTRAINT page_comments_comment_length_check
        CHECK (char_length(comment) BETWEEN 1 AND 4000)
);

CREATE INDEX IF NOT EXISTS idx_page_comments_page_path
    ON page_comments(page_path);

CREATE INDEX IF NOT EXISTS idx_page_comments_open_lesson
    ON page_comments(lesson_id) WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_page_comments_status
    ON page_comments(status);
