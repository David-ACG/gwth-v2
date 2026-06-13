-- ============================================================================
-- Lesson completion and public credential verification foundation
-- Adds the beta completion signals needed for video+quiz gated completion.
-- ============================================================================

ALTER TABLE lesson_progress
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS intro_video_progress REAL NOT NULL DEFAULT 0 CHECK (intro_video_progress >= 0 AND intro_video_progress <= 1),
  ADD COLUMN IF NOT EXISTS quiz_passed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS credential_verifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id           TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    verification_code   TEXT NOT NULL UNIQUE,
    is_public           BOOLEAN NOT NULL DEFAULT FALSE,
    learner_name        TEXT NOT NULL,
    gwth_score          REAL NOT NULL DEFAULT 0,
    percentile_label    TEXT NOT NULL DEFAULT 'Building foundations',
    trajectory_label    TEXT NOT NULL DEFAULT 'In progress',
    issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_credential_verifications_code
    ON credential_verifications(verification_code);

ALTER TABLE credential_verifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON credential_verifications TO anon, authenticated;
GRANT UPDATE ON credential_verifications TO authenticated;
GRANT ALL ON credential_verifications TO service_role;

DO $$ BEGIN
    CREATE POLICY "Public can read shared credentials"
        ON credential_verifications FOR SELECT
        USING (is_public = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can read own credentials"
        ON credential_verifications FOR SELECT
        TO authenticated
        USING ((SELECT auth.uid()) = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own credential sharing"
        ON credential_verifications FOR UPDATE
        TO authenticated
        USING ((SELECT auth.uid()) = user_id)
        WITH CHECK ((SELECT auth.uid()) = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION set_credential_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_credential_verifications_updated_at ON credential_verifications;
CREATE TRIGGER trg_credential_verifications_updated_at
    BEFORE UPDATE ON credential_verifications
    FOR EACH ROW
    EXECUTE FUNCTION set_credential_verifications_updated_at();
