# Sprint 1: interview prototype

Preview: https://askeveryone-sprint1.vercel.app (test organisation only)

Flow: an invitation link (one token per person, expires after 7 days) opens
the consent page; nothing is saved until the respondent ticks consent. Then
role and department, then six questions, each answered by voice (transcribed
by /api/transcribe) or typed. Every answer row carries role, department,
input mode and the consent_event_id.

Telemetry: three events (interview_started, question_answered,
interview_completed) in usage_events, with answer length but never answer
text (lib/telemetry.ts).

Reflection: voice worked first time on Android; iPhone needed the permission
prompt handled. Next sprint: the evidence pipeline.
Test interviews: three, from two roles (two Programmes Officers, one Finance
Assistant, all cohort peers who agreed to test it), see transcripts_export.json.

Where a colleague got stuck: T02 tapped the microphone in a noisy office, the
transcript came back as "matching in voices", and there was no way to fix it
before saving. I changed the interview page so the transcript lands in an
editable box with a "Check this before saving" line, and T02 re-did the answer
by typing. T03 then used voice and corrected one word before saving.
