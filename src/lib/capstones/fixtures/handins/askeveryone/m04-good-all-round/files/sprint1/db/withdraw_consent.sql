CREATE OR REPLACE FUNCTION withdraw_consent(p_respondent_id TEXT)
RETURNS void AS $$
BEGIN
  DELETE FROM transcripts WHERE respondent_id = p_respondent_id;
  UPDATE consent_events SET withdrawn_at = NOW() WHERE respondent_id = p_respondent_id;
END;
$$ LANGUAGE plpgsql;
