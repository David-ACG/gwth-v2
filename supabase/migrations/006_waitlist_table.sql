-- ============================================================================
-- Waitlist signups — mirrors the table created manually via SQL Editor in prod
-- on 2026-03-22 (commit b4ad229). Idempotent so it can safely run against
-- both existing and fresh branches.
-- ============================================================================

CREATE TABLE IF NOT EXISTS waitlist (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT NOT NULL UNIQUE,
    name       TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Service role can manage waitlist"
        ON waitlist FOR ALL
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
