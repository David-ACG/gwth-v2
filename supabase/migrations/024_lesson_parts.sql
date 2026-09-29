-- ============================================================================
-- 024: Lessons in parts, two learner-chosen formats, first-party tracking
-- (bead gwth-launch-hqyp; Style Bible item lesson-viewer-two-formats).
--
-- A lesson with a lesson_parts row is shown as 5 to 7 parts, in one of two
-- formats the learner picks ("Read or listen" or "Watch short videos"). Every
-- part ends with ONE check question that must be answered correctly to
-- continue; after two wrong tries the explanation shows and Continue unlocks.
-- These checks replace the end-of-lesson quiz for that lesson.
--
-- lesson_parts:        the content (text, check questions WITH answers, media
--                      keys, word timings, captions). Server-side only; the
--                      client gets a copy with answers stripped.
-- lesson_part_checks:  one row per learner per part: tries, first answer
--                      right or not, when it was resolved.
-- learner_preferences: the chosen format and the read-along setting.
-- lesson_events:       the first-party event log behind the admin report.
--                      No third party, no cookies (privacy notice says so).
--
-- NOTHING here alters an existing table. If the site ever runs without this
-- migration, getLessonParts() finds no table, returns null, and every lesson
-- falls back to the page-flip viewer instead of failing.
--
-- Completion: when every part of a parts lesson is resolved, the app credits
-- lesson_progress.intro_video_progress = 1 and quiz_passed = true (see
-- src/lib/data/lesson-parts.ts), so the existing completion formula, the
-- dashboard, org reports and anything built on quiz_passed keep working.
--
-- No RLS by design (D2). Idempotent so it can be re-run.
-- Apply on production BEFORE the release that carries the new viewer:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < supabase/migrations/024_lesson_parts.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS lesson_parts (
    lesson_id   TEXT PRIMARY KEY REFERENCES lessons(id) ON DELETE CASCADE,
    version     TEXT NOT NULL DEFAULT '1',
    content     JSONB NOT NULL,
    source      TEXT,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_part_checks (
    user_id      TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    lesson_id    TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    part_id      TEXT NOT NULL,
    tries        INTEGER NOT NULL DEFAULT 0 CHECK (tries >= 0),
    wrong_tries  INTEGER NOT NULL DEFAULT 0 CHECK (wrong_tries >= 0),
    correct      BOOLEAN NOT NULL DEFAULT FALSE,
    first_right  BOOLEAN,
    answers      JSONB NOT NULL DEFAULT '[]'::jsonb,
    resolved_at  TIMESTAMPTZ,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id, part_id)
);
CREATE INDEX IF NOT EXISTS idx_lesson_part_checks_lesson ON lesson_part_checks (lesson_id);

CREATE TABLE IF NOT EXISTS learner_preferences (
    user_id       TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
    lesson_format TEXT CHECK (lesson_format IN ('read', 'watch')),
    read_along    BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_events (
    id          BIGSERIAL PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    lesson_id   TEXT NOT NULL,
    session_id  TEXT NOT NULL,
    event       TEXT NOT NULL,
    part_index  INTEGER,
    format      TEXT CHECK (format IN ('read', 'watch')),
    detail      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lesson_events_lesson ON lesson_events (lesson_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lesson_events_user ON lesson_events (user_id, lesson_id);
