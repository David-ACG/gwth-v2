-- A score with no evidence cannot be saved.
ALTER TABLE scores ADD CONSTRAINT scores_need_evidence
  CHECK (cardinality(evidence_refs) > 0);

-- Test, 29 October 2026:
-- insert into scores (organisation_id, theme, score, evidence_refs)
--   values ('southbridge', 'data_foundations', 2.0, '{}');
-- ERROR:  new row for relation "scores" violates check constraint "scores_need_evidence"
