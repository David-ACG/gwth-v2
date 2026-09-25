-- ============================================================================
-- 023: Take the em dashes out of the course title and description
-- (bead gwth-launch-dx6).
--
-- The course row seeded by 003 carried two em dashes, and both render at the
-- top of /course/applied-ai-skills, in the browser tab and in the page's share
-- card. Dashes are banned in every student-facing string (bible, tone gate
-- RULE 3).
--
-- The row is the source of truth: the pipeline import (src/app/api/admin/
-- import-lessons/route.ts) only inserts the course when it is missing and never
-- overwrites it, so fixing the row here cannot be undone by a lesson publish.
--
--   title        'GWTH — Applied AI Skills'  ->  'Applied AI Skills'
--                (the page already carries the GWTH.ai wordmark, and the tab
--                title template appends "| GWTH.ai"; this matches the title
--                the import route and every fixture already use)
--   description  '... transform your career — no coding required. ...'
--                ->  '... transform your career. No coding required. ...'
--                (the wording the bead suggested; no other words changed)
--
-- Guarded on the old strings, so it only ever touches the seeded values and
-- is safe to re-run. src/db/course-copy-dashes.db.test.ts checks the result.
--
-- Apply to production (David's release, not an agent's):
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' \
--     < supabase/migrations/023_course_copy_no_dashes.sql
-- ============================================================================

UPDATE courses
   SET title = 'Applied AI Skills',
       updated_at = NOW()
 WHERE id = 'course_gwth'
   AND title = 'GWTH — Applied AI Skills';

UPDATE courses
   SET description = 'Master AI in plain English. Build real apps, automate workflows, and transform your career. No coding required. A 3-month journey from AI beginner to enterprise-ready practitioner.',
       updated_at = NOW()
 WHERE id = 'course_gwth'
   AND description = 'Master AI in plain English. Build real apps, automate workflows, and transform your career — no coding required. A 3-month journey from AI beginner to enterprise-ready practitioner.';
