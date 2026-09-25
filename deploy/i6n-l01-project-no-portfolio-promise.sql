-- gwth-launch-i6n: the L1 project stops promising a portfolio save area.
--
-- The L1 student project ("Your project: My AI Superpowers Wishlist") told the
-- learner: "In the demo page, there is also a simple portfolio save area. You
-- can paste the wishlist text, attach a screenshot or file, or save a link.
-- That is not the full product yet, ..." No such control exists anywhere in
-- the product, and "in the demo page" / "not the full product yet" is authoring
-- scaffolding that should never have reached a student. "What happens next"
-- carried the same promise: "In the full GWTH course, this should mean saving
-- it into your GWTH portfolio as well as keeping your own copy."
--
-- The fix only DELETES those words; no new copy is written. The paragraph goes
-- entirely, and the "What happens next" section keeps "Save the wishlist
-- somewhere you will find it again." followed by "Bring it to L02. ...".
-- The same deletions were made in the publish tree
-- (~/gwth-dashboard/generated_lessons/m1_l01_.../content/project.md and
-- project.candidate.md), so a republish does not bring the words back.
-- lessons.build_instructions is the only column carrying them (checked on the
-- local preview DB, every text and jsonb column).
--
-- Applied to the LOCAL preview DB (gwth-v2-dev-postgres) on 2026-09-25.
-- Production waits for David's release:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' \
--     < deploy/i6n-l01-project-no-portfolio-promise.sql
-- Idempotent: a second run changes nothing. Roll back by restoring the row
-- from the pre-release backup tag's database dump.

BEGIN;

UPDATE lessons
   SET build_instructions = regexp_replace(
         regexp_replace(
           build_instructions,
           E'\\n\\nIn the demo page, there is also a simple portfolio save area\\.[^\\n]*',
           '',
           'g'
         ),
         E' In the full GWTH course, [^\\n]*?portfolio as well as keeping your own copy\\.',
         '',
         'g'
       ),
       updated_at = NOW()
 WHERE id = 'm1_l01'
   AND (build_instructions LIKE '%portfolio save area%'
        OR build_instructions LIKE '%In the full GWTH course,%portfolio%');

-- Nothing of either promise may remain.
SELECT id,
       build_instructions LIKE '%portfolio save area%'  AS save_area_left,
       build_instructions LIKE '%In the full GWTH course%' AS full_course_left
  FROM lessons
 WHERE id = 'm1_l01';

COMMIT;
