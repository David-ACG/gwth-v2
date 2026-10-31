# Deletion test (30 October 2026)

1. Ran a test interview as respondent T99.
2. `select count(*) from transcripts where respondent_id = 'T99';` -> 6
3. `select withdraw_consent('T99');`
4. Same count -> 0. consent_events row for T99 now has withdrawn_at set.
5. Re-ran the interview to put my test rows back.
