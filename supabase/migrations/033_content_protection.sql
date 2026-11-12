-- ============================================================================
-- 033: Content protection, first slice (bead gwth-launch-735c).
--
-- David, 12 Nov 2026: "beginning with the parts that stop a rival copying the
-- whole course from one account". Decisions: lesson media links are signed by
-- the website (A), the too-fast monitor alerts only (A), and a flagged account
-- is held on the month it is on, with its clock held, until David has looked.
--
-- content_access_events: one row per lesson page the SERVER served to a
--   signed-in learner (and per locked-lesson request), with the network and
--   browser it came from and how many signed media links it was given. Written
--   on the server, so a scraper that never runs the page's JavaScript still
--   leaves a row. Next.js prefetches are not recorded.
-- content_access_flags: an account the monitor flagged. While a flag is
--   'open' the account cannot open held_month or later, and its clock is held
--   (prepaid passes and monthly payers wait without losing time or paying).
--   David clears it ('cleared', with cleared_at) or suspends it ('suspended':
--   no course access until reinstated).
--
-- Retention (privacy notice): raw events 90 days, flags 12 months after they
-- are resolved. Enforced by the daily content-protection cron.
-- No RLS by design (D2). Idempotent so it can be re-run.
-- Apply on production BEFORE the release that carries this code:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/033_content_protection.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_access_events (
    id            BIGSERIAL PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    lesson_id     TEXT NOT NULL,
    month         INTEGER,
    kind          TEXT NOT NULL CHECK (kind IN ('lesson_view', 'locked_lesson')),
    first_view    BOOLEAN NOT NULL DEFAULT FALSE,
    expected_sec  INTEGER,
    media_links   INTEGER NOT NULL DEFAULT 0,
    ip            TEXT,
    country       TEXT,
    user_agent    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_access_events_user ON content_access_events (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_content_access_events_created ON content_access_events (created_at);

CREATE TABLE IF NOT EXISTS content_access_flags (
    id            BIGSERIAL PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'cleared', 'suspended')),
    held_month    INTEGER CHECK (held_month IN (2, 3)),
    reasons       JSONB NOT NULL DEFAULT '[]'::jsonb,
    signals       JSONB NOT NULL DEFAULT '{}'::jsonb,
    opened_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    alert_sent_at TIMESTAMPTZ,
    reviewed_by   TEXT,
    cleared_at    TIMESTAMPTZ,
    note          TEXT
);
CREATE INDEX IF NOT EXISTS idx_content_access_flags_user ON content_access_flags (user_id, status);
-- One open-or-suspended flag per account at a time.
CREATE UNIQUE INDEX IF NOT EXISTS uq_content_access_flags_active
    ON content_access_flags (user_id) WHERE status IN ('open', 'suspended');
