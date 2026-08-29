-- ============================================================================
-- 018 — Remove the LAST quiz_questions policy (N6 QA round-3 defect 2).
--
-- 016 dropped the named public-SELECT policy, but the remaining
-- "Service role manages quiz questions" FOR ALL policy also targeted the
-- public role with USING (true), so at the RLS layer the answer key was
-- still readable by any non-owner role granted table SELECT. No such client
-- role exists today (D2: the app connects as the owning role, which RLS
-- does not constrain, and there is no PostgREST/anon surface), but the
-- fossil layer must not document a permissive contract the server-grading
-- model contradicts. With RLS enabled and ZERO policies the table is
-- default-deny for every non-owner role - the honest posture: the answer
-- key is server-only.
-- ============================================================================

DROP POLICY IF EXISTS "Service role manages quiz questions" ON quiz_questions;
