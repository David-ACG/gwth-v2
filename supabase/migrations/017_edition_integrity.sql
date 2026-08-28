-- ============================================================================
-- 017 — Edition-tenancy integrity (N6; fixes the N5 QA blocking defects 1+2).
-- Additive/corrective only; no existing valid data becomes invalid (verified:
-- the only edition today is gwth-default, organisation_id NULL, is_default
-- TRUE, is_org_default FALSE, and no org_membership row carries edition_id).
--
-- Defect 2 (014:40): neither default-flag partial unique index coupled the
-- flag to organisation_id nullability, so an org-owned edition could become
-- the COURSE'S global default (serving one institution's private syllabus to
-- every B2C learner) and is_org_default on org-NULL rows escaped its index.
-- Fix: two CHECKs couple each flag to the right ownership, and the org-
-- default index is rebuilt scoped to (organisation_id, course_id) — which
-- also lets one org hold a default edition per course instead of one ever
-- (N5 QA style note 1).
--
-- Defect 1 (014:78): org_membership.edition_id was a plain FK, so a member
-- could be pointed at ANOTHER organisation's edition (cross-tenant leak of
-- exclusive lessons + co-brand label). A composite FK cannot express
-- "member's own org OR global (organisation_id IS NULL)", so the invariant
-- is enforced with constraint triggers on BOTH sides of the relationship.
-- ============================================================================

-- ── Defect 2: default flags coupled to ownership ────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'syllabus_edition_global_default_scope_check'
          AND conrelid = 'syllabus_edition'::regclass
    ) THEN
        -- A global (course) default can only be a GWTH-owned edition.
        ALTER TABLE syllabus_edition
            ADD CONSTRAINT syllabus_edition_global_default_scope_check
            CHECK (NOT is_default OR organisation_id IS NULL);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'syllabus_edition_org_default_scope_check'
          AND conrelid = 'syllabus_edition'::regclass
    ) THEN
        -- An org default must actually belong to an organisation.
        ALTER TABLE syllabus_edition
            ADD CONSTRAINT syllabus_edition_org_default_scope_check
            CHECK (NOT is_org_default OR organisation_id IS NOT NULL);
    END IF;
END $$;

-- Rebuild the org-default uniqueness scoped per course (one default edition
-- per org PER COURSE; org-NULL rows can no longer carry is_org_default at
-- all, so nothing escapes the index).
DROP INDEX IF EXISTS ux_edition_org_default;
CREATE UNIQUE INDEX IF NOT EXISTS ux_edition_org_default
    ON syllabus_edition(organisation_id, course_id) WHERE is_org_default;

-- ── Defect 1: a member's edition must belong to their org, or be global ─────

CREATE OR REPLACE FUNCTION org_membership_edition_guard() RETURNS trigger AS $$
DECLARE
    edition_org TEXT;
    edition_found BOOLEAN;
BEGIN
    IF NEW.edition_id IS NULL THEN
        RETURN NEW;
    END IF;
    SELECT organisation_id, TRUE INTO edition_org, edition_found
    FROM syllabus_edition WHERE id = NEW.edition_id;
    IF edition_found IS NOT TRUE THEN
        -- The plain FK also rejects this; kept so the guard is self-contained.
        RAISE EXCEPTION 'org_membership.edition_id % does not exist', NEW.edition_id
            USING ERRCODE = '23503';
    END IF;
    IF edition_org IS NOT NULL AND edition_org <> NEW.organisation_id THEN
        RAISE EXCEPTION
            'edition % belongs to organisation %, not to the member''s organisation % (cross-tenant edition assignment refused)',
            NEW.edition_id, edition_org, NEW.organisation_id
            USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_org_membership_edition_guard ON org_membership;
CREATE TRIGGER trg_org_membership_edition_guard
    BEFORE INSERT OR UPDATE OF edition_id, organisation_id ON org_membership
    FOR EACH ROW EXECUTE FUNCTION org_membership_edition_guard();

-- The reverse direction: re-homing an edition into an organisation must not
-- strand members of OTHER orgs still pointing at it. (Going global — setting
-- organisation_id NULL — is always safe: global editions are assignable to
-- anyone.)
CREATE OR REPLACE FUNCTION syllabus_edition_org_guard() RETURNS trigger AS $$
BEGIN
    IF NEW.organisation_id IS NOT NULL
       AND NEW.organisation_id IS DISTINCT FROM OLD.organisation_id
       AND EXISTS (
           SELECT 1 FROM org_membership m
           WHERE m.edition_id = NEW.id
             AND m.organisation_id <> NEW.organisation_id
       ) THEN
        RAISE EXCEPTION
            'edition % is assigned to members outside organisation %; clear those overrides first',
            NEW.id, NEW.organisation_id
            USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_syllabus_edition_org_guard ON syllabus_edition;
CREATE TRIGGER trg_syllabus_edition_org_guard
    BEFORE UPDATE OF organisation_id ON syllabus_edition
    FOR EACH ROW EXECUTE FUNCTION syllabus_edition_org_guard();

-- N5 QA defect 4 (013:45, role CHECKs vs Better Auth multi-role) is resolved
-- the OTHER way, deliberately: the plugin is constrained to SINGLE roles at
-- the application layer (organizationHooks in src/lib/better-auth.ts throw a
-- clean error on comma-separated role values), and the single-role CHECKs
-- here stay as the backstop. Rationale: the tenancy layer treats role as a
-- scalar everywhere — the one-org-per-learner partial index (WHERE role =
-- 'learner'), the roster queries, the tutor gate — and a member holding
-- 'tutor,admin' would silently escape all of them. Widening the CHECK would
-- push comma-parsing into every query for a capability nothing needs in v1.
