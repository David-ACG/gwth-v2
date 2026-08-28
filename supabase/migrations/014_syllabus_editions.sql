-- ============================================================================
-- 014 — Syllabus editions (C3): one core content body, many wrappers.
-- GWTH default edition has organisation_id NULL. Additive. No RLS (D2).
--
-- Design: GWTH-launch-plan/"Institution - Fable Plan"/05-syllabus-editions-
-- design.md section 1.2. Decisions taken 2026-08-28: one pass mark per
-- edition (4); is_mandatory is a column, not derived from tier — the
-- institution admin decides per lesson and may raise their students'
-- mandatory count above the GWTH default's (2).
--
-- Canonical-DDL rule (D1): this file is the source of truth; the matching
-- Drizzle declarations are hand-patched into drizzle/schema.ts (labs/
-- feedback.read_at convention — re-apply after any drizzle-kit pull).
-- ============================================================================

CREATE TABLE IF NOT EXISTS syllabus_edition (
    id               TEXT PRIMARY KEY,          -- 'gwth-default', 'cipd-2026'
    organisation_id  TEXT REFERENCES organisation(id) ON DELETE CASCADE,
                                                -- NULL = the GWTH B2C default
    course_id        TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,             -- 'Curated by CIPD'
    slug             TEXT NOT NULL UNIQUE,
    is_default       BOOLEAN NOT NULL DEFAULT FALSE,  -- the global default
    is_org_default   BOOLEAN NOT NULL DEFAULT FALSE,  -- default within its org
    pass_mark        INTEGER NOT NULL DEFAULT 67
        CHECK (pass_mark >= 0 AND pass_mark <= 100),
    co_brand_label   TEXT,                      -- shown on lesson viewer + credential
    settings         JSONB NOT NULL DEFAULT '{}'::jsonb,
                     -- open bucket: maintenance level, decay tuning, framing copy
    status           TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'live', 'archived')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exactly one global default edition per course, one default per org.
-- No circular FK: org default is a partial unique index, not a
-- default_edition_id column on organisation.
CREATE UNIQUE INDEX IF NOT EXISTS ux_edition_global_default
    ON syllabus_edition(course_id) WHERE is_default;
CREATE UNIQUE INDEX IF NOT EXISTS ux_edition_org_default
    ON syllabus_edition(organisation_id) WHERE is_org_default;

CREATE TABLE IF NOT EXISTS edition_lessons (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edition_id    TEXT NOT NULL REFERENCES syllabus_edition(id) ON DELETE CASCADE,
    lesson_id     TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    -- tier answers "who sees it"; is_mandatory answers "does it count toward
    -- the baseline and the score denominator". Deliberately NOT conflated.
    tier          TEXT NOT NULL DEFAULT 'core'
        CHECK (tier IN ('core', 'optional', 'exclusive')),
    -- tier='exclusive' + state='draft' is the ratification workflow (C4):
    -- GWTH drafts an institution-only lesson, invisible to learners until the
    -- institution marks it ratified.
    state         TEXT NOT NULL DEFAULT 'ratified'
        CHECK (state IN ('draft', 'ratified')),
    is_mandatory  BOOLEAN NOT NULL DEFAULT TRUE,  -- feeds the score denominator
    -- role_hints is a hint, not access control: renders as labels in the
    -- admin picker and learner catalogue (no per-role syllabi in v1).
    role_hints    TEXT[] NOT NULL DEFAULT '{}',   -- e.g. {'l&d','recruiter'}
    sort_order    INTEGER NOT NULL DEFAULT 0,
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (edition_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_edition_lessons_edition ON edition_lessons(edition_id);
CREATE INDEX IF NOT EXISTS idx_edition_lessons_lesson  ON edition_lessons(lesson_id);

-- Now the deferred FK from 013 (guarded so the migration stays re-runnable).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'org_membership_edition_id_fkey'
    ) THEN
        ALTER TABLE org_membership
            ADD CONSTRAINT org_membership_edition_id_fkey
            FOREIGN KEY (edition_id) REFERENCES syllabus_edition(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Backfill: the GWTH default edition mirrors today's syllabus exactly.
-- lessons.is_optional stays and keeps meaning "optional in the GWTH default
-- edition"; this freezes that meaning into edition_lessons. The import route
-- keeps gwth-default rows in sync on every lesson import.
INSERT INTO syllabus_edition (id, organisation_id, course_id, name, slug, is_default, status)
SELECT 'gwth-default', NULL, c.id, 'GWTH standard syllabus', 'gwth-default', TRUE, 'live'
FROM courses c WHERE c.slug = 'applied-ai-skills'
ON CONFLICT (id) DO NOTHING;

INSERT INTO edition_lessons (edition_id, lesson_id, tier, state, is_mandatory, sort_order)
SELECT 'gwth-default', l.id,
       CASE WHEN l.is_optional THEN 'optional' ELSE 'core' END,
       'ratified',
       NOT l.is_optional,
       (l.month * 1000) + l."order"
FROM lessons l
-- Guard: on a fresh DB with no applied-ai-skills course the edition row above
-- does not exist yet; skip rather than violate the FK (the import route
-- creates the rows once real lessons arrive).
WHERE EXISTS (SELECT 1 FROM syllabus_edition WHERE id = 'gwth-default')
ON CONFLICT (edition_id, lesson_id) DO NOTHING;
