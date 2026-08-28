-- ============================================================================
-- 013 — Org tenancy (institution pivot, C3/C4). Additive. No RLS by design
-- (D2: the app connects as service role; per-user isolation is application
-- code — adding decorative auth.uid() policies would extend debt item 1 of
-- inventory 03, so none of the new tables get any).
--
-- Better Auth organization plugin (v1.6.19, ships in better-auth core) maps
-- onto these tables via its schema option: organization -> organisation,
-- member -> org_membership, invitation -> org_invitation (UK names per
-- decision 3, 2026-08-28). The plugin's required columns come first; GWTH
-- domain columns (type, seat_limit, notes, edition_id) have defaults or are
-- nullable so the plugin's inserts succeed without knowing about them.
--
-- Canonical-DDL rule (D1): this file is the source of truth; the matching
-- Drizzle declarations are hand-authored in src/db/auth-schema.ts (same W11
-- pattern — the lazy getAuth() blocks @better-auth/cli generate).
-- ============================================================================

CREATE TABLE IF NOT EXISTS organisation (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL UNIQUE,
    logo          TEXT,
    metadata      TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- GWTH domain columns (not managed by Better Auth):
    -- type drives the billing shape (decision 7, HYBRID): institutions by
    -- invoice (access_source = 'org_seat', Stripe columns NULL); companies by
    -- Stripe per-seat (designed for, built later with the company Teams admin).
    type          TEXT NOT NULL DEFAULT 'company'
        CHECK (type IN ('company', 'institution')),
    seat_limit    INTEGER,                    -- NULL = unlimited (beta)
    notes         TEXT
);

CREATE TABLE IF NOT EXISTS org_membership (
    id               TEXT PRIMARY KEY,
    organisation_id  TEXT NOT NULL REFERENCES organisation(id) ON DELETE CASCADE,
    user_id          TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    -- owner = the plugin's creator role (GWTH holds it for institution orgs we
    -- provision), admin = the institution/Teams admin, tutor = read-only
    -- roster visibility, learner = everyone else.
    role             TEXT NOT NULL DEFAULT 'learner'
        CHECK (role IN ('owner', 'admin', 'tutor', 'learner')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- GWTH domain column: per-member edition override (NULL = org default).
    -- FK added in 014 after syllabus_edition exists.
    edition_id       TEXT,
    UNIQUE (organisation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_membership_org  ON org_membership(organisation_id);
CREATE INDEX IF NOT EXISTS idx_org_membership_user ON org_membership(user_id);

-- Decision 1 (2026-08-28): ONE org per learner in v1, enforced in the DB.
-- Partial so GWTH staff (owner) and cross-org admins/tutors can span orgs;
-- the friendly "second invite refused with message" is app-level (N7) — this
-- index is the backstop that makes the invariant true regardless.
CREATE UNIQUE INDEX IF NOT EXISTS ux_org_membership_one_org_per_learner
    ON org_membership(user_id) WHERE role = 'learner';

CREATE TABLE IF NOT EXISTS org_invitation (
    id               TEXT PRIMARY KEY,
    organisation_id  TEXT NOT NULL REFERENCES organisation(id) ON DELETE CASCADE,
    email            TEXT NOT NULL,
    -- Invitations cannot grant owner.
    role             TEXT NOT NULL DEFAULT 'learner'
        CHECK (role IN ('admin', 'tutor', 'learner')),
    status           TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected', 'canceled')),
    expires_at       TIMESTAMPTZ NOT NULL,
    inviter_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_invitation_org   ON org_invitation(organisation_id);
CREATE INDEX IF NOT EXISTS idx_org_invitation_email ON org_invitation(email);

-- The organization plugin stores the session's active org on the session row.
ALTER TABLE session
    ADD COLUMN IF NOT EXISTS active_organisation_id TEXT;
