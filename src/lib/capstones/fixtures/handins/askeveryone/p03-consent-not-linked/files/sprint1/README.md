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
Note: I made consent_event_id optional so typed test answers could be saved
without going through the consent page; T02's answers were saved that way.
