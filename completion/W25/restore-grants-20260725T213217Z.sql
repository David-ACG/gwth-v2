-- W25 grant audit ROLLBACK, captured 20260725T213217Z (UTC).
--
-- The forward change expired the three throwaway test grants that were not one
-- of the two accounts the CIPD demo runs from. Nothing was deleted: valid_until
-- was set to a past timestamp, so every row stays auditable and this file puts
-- them back exactly as they were.
--
-- familyuccelli@gmail.com is DELIBERATELY untouched by both the forward change
-- and this restore: it is the demo student account and its manual_beta month-1
-- grant must survive.
--
-- Apply with:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' < restore-grants-20260725T213217Z.sql

BEGIN;

UPDATE beta_access_grants SET valid_until = NULL, updated_at = now()
 WHERE email IN ('w6-prodcheck-1783281150@example.com', 'w16-smoke@gwth.ai');

UPDATE user_access SET valid_until = NULL, updated_at = now()
 WHERE user_id IN (
   'ZlPmssQWUxX4ceCxvzySCBT02Pk3EquC',  -- w6-prodcheck-1783281150@example.com
   'O25jf7afB8Mb7UK5ieVp8z4p5zWHm7dE',  -- w16-smoke@gwth.ai
   '8UnjHGq6LOR297BuzXoXNxYxwbNeG114'   -- w20-verify@gwth.ai (user_access only, no grant row)
 );

COMMIT;

-- Verify:
--   select email, valid_until from beta_access_grants order by email;
--   select user_id, access_source, valid_until from user_access;
