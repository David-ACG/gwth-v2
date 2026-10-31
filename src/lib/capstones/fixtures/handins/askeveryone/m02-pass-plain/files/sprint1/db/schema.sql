CREATE TABLE consent_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respondent_id  TEXT NOT NULL,
  consent_text   TEXT NOT NULL,
  consented_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at   TIMESTAMPTZ
);

CREATE TABLE transcripts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respondent_id    TEXT NOT NULL,
  consent_event_id UUID NOT NULL REFERENCES consent_events(id),
  question_id      TEXT NOT NULL,
  answer_text      TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
