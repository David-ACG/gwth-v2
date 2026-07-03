-- ============================================================================
-- 012 — Feedback read/unread marker (W4: admin dashboard feedback inbox)
-- ============================================================================
-- W5 shipped the feedback table without an inbox state; the W4 admin inbox
-- needs a read/unread marker so David can triage tester reports. A nullable
-- timestamp (not a boolean) so the inbox can show WHEN an item was read and
-- "mark unread" is just setting it back to NULL.
--
-- Canonical-DDL rule (D1): this file is the source of truth; the matching
-- Drizzle column is hand-patched into drizzle/schema.ts (same convention as
-- the other post-pull patches documented at the top of that file).
-- ============================================================================

ALTER TABLE feedback ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- The unread count on the admin overview filters on NULL read_at.
CREATE INDEX IF NOT EXISTS idx_feedback_unread
    ON feedback (created_at DESC)
    WHERE read_at IS NULL;
