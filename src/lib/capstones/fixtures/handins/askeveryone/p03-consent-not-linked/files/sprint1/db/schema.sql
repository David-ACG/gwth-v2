CREATE TABLE interview_invites (
  token          TEXT PRIMARY KEY,
  organisation_id UUID NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL
);

CREATE TABLE consent_events (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respondent_id           TEXT NOT NULL,
  organisation_id         UUID NOT NULL,
  consent_text_version    TEXT NOT NULL,
  withdrawal_acknowledged BOOLEAN NOT NULL,
  consented_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at            TIMESTAMPTZ
);

CREATE TABLE transcripts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id  UUID NOT NULL,
  respondent_id    TEXT NOT NULL,
  consent_event_id UUID,  -- made optional so typed test answers save without the consent page
  role             TEXT NOT NULL,
  department       TEXT NOT NULL,
  question_id      TEXT NOT NULL,
  input_mode       TEXT NOT NULL CHECK (input_mode IN ('voice', 'typed')),
  answer_text      TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- How the prototype is used, never what people said: no answer text here.
CREATE TABLE usage_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name      TEXT NOT NULL,
  respondent_id   TEXT,
  organisation_id UUID,
  question_id     TEXT,
  input_mode      TEXT,
  answer_length   INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
