-- ============================================================================
-- 011 — Tester feedback channel (W5: hand-picked gwth.ai beta onboarding)
-- ============================================================================
-- A single table for the beta "report a problem" channel. Testers submit from
-- the authenticated /guide panel, the dashboard, or the lesson viewer; each row
-- captures which page it was opened from (source_path) and the Better Auth user
-- id who sent it.
--
-- Persistence rules (D1/D2):
--   * Drizzle-backed: this DDL is the canonical source; `drizzle-kit pull`
--     regenerates the typed table into drizzle/schema.ts, re-exported via
--     @/db/schema. App writes/reads go through getDb() + the data layer.
--   * NO row-level security (D2). Per-user scoping is enforced in application
--     code: testers insert + read only their own rows (keyed on user_id), the
--     admin inbox (W4) reads all rows. So this is a plain table — no RLS, no
--     Supabase service_role GRANTs (the Supabase subscription is cancelled).
--
-- email_sent records whether the david@gwth.ai notification was accepted by
-- Plunk. The row is ALWAYS written first; the email is best-effort and its
-- failure must never lose the feedback (see src/app/api/feedback/route.ts).
-- ============================================================================

CREATE TABLE IF NOT EXISTS feedback (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    source_path TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'general'
        CHECK (category IN ('bug', 'content', 'idea', 'general')),
    message     TEXT NOT NULL,
    user_agent  TEXT,
    email_sent  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tester "read my own rows" path and the admin inbox both order by recency.
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
