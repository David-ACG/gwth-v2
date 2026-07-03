# Family AI Bot — Capstone Design & Implementation Guide

Research spine for L17 (ideation), L18 (transcription + extraction), L19 (processing + distribution), L20 (polish).

## Capstone spec in one paragraph

Record your weekly family meeting. AI transcribes it. An extraction prompt pulls out tasks (who, what, when), events (title, date, time), a meal plan (day, meal, optional recipe), and a shopping list (deduplicated). Outputs are sent to the right place — tasks to people, events to the calendar, shopping to the list app, everything archived in a hub page. It runs on a schedule. A non-technical family member can use it without you.

## Architecture — input → processing → outputs → distribution

```
┌────────┐   ┌───────────────┐   ┌─────────────────┐   ┌──────────────┐
│ Audio  │ → │ Transcription │ → │ Extraction      │ → │ Distribution │
│ (WAV/  │   │ (Whisper /    │   │ (Claude /       │   │ · Calendar   │
│ MP3)   │   │  Fathom)      │   │  Custom GPT /   │   │ · Tasks      │
│        │   │               │   │  Claude Project)│   │ · Shopping   │
│        │   │               │   │                 │   │ · Hub page   │
└────────┘   └───────────────┘   └─────────────────┘   └──────────────┘
```

## Implementation paths (students choose one)

| Path | Difficulty | Best for | Tools |
|------|-----------|----------|-------|
| **Cowork pipeline** | Easiest | Students with Claude Pro on Windows or Mac | Folder + instructions + Cowork plugins; drop the audio file in the folder, Cowork runs. Outputs as `tasks.md / events.md / meals.md / shopping.md`. Calendar and Gmail via the Microsoft 365 / Google connectors. |
| **Artifacts app** | Easy | Quick prototype, free/Pro | Build an Artifact that takes pasted transcript → structured outputs with copy/export buttons. Now persistent (20 MB) — the app remembers past meetings. |
| **Lovable / Bolt web app** | Medium | Students who want a shareable web app | Full UI with upload, processing, output pages, one-click calendar/email integration via Zapier webhooks. |
| **OpenClaw bot** | Medium-Hard | **Month 2 only** — stated here for completeness | WhatsApp/Telegram bot that accepts audio, processes, distributes. **Security-hardened setup is Month 2 material.** |

## Transcription — April 2026 options

| Tool | Free? | Notes |
|------|-------|-------|
| **Whisper via ChatGPT / Claude** | With Plus/Pro | Easiest entry; cloud-based; good accuracy; UK English fine |
| **Whisper open-source (local)** | Yes | Runs on your machine; slower; fully private — best for family audio with children |
| **Voxtral (Mistral)** | API | Beats Whisper v3 on English; half the cost |
| **Fathom** | Free unlimited personal | Best free meeting capture if you use it live |
| **Otter.ai** | Free tier limited | Pro $16.99, 6,000 min |
| **Zoom AI Companion** | Bundled | Host-only retention |
| **Google Meet AI** | AI Pro / Workspace | Good for Google households |

**UK privacy caveat (repeat in L18):** ICO guidance — on-device Whisper preferable for personal recordings with children; under-13 Age Appropriate Design Code considerations.

## The extraction prompt (starter template)

```
You are a careful, pragmatic assistant for a busy UK household.
You will receive the transcript of a weekly family meeting.

Extract four structured outputs:

1. TASKS — list of {assignee, task, due_date, notes}. 
   Dates as YYYY-MM-DD. If no clear owner, put "family".
2. EVENTS — list of {title, date, start_time, end_time, location, attendees}.
   Time in 24-hour. Location optional.
3. MEAL_PLAN — list of {day, meal, recipe_link_optional}.
   Cover up to 7 days.
4. SHOPPING — deduplicated list of {item, quantity, unit}.
   Prefer UK units (g, kg, ml, l, pint).

Output VALID JSON only. No prose. If a category has no items, return [].
If the transcript is unclear, use your best judgement and add a "notes" field explaining the ambiguity.
Assume British English, British date conventions, and £.
```

This prompt is the core reusable artefact of the capstone. Students save it in their Claude Project as the system prompt, or in their Prompt Library.

## Distribution options

| Output | UK-friendly tools |
|--------|------------------|
| **Calendar** | Google Calendar (Zapier/Make), iCloud, Outlook 365 (Zapier + Microsoft Graph), Cowork calendar plugin |
| **Tasks** | Gmail / email, WhatsApp (via Zapier), Trello, ClickUp, Microsoft To Do, Apple Reminders (via Family Sharing), Google Tasks |
| **Shopping** | Shared Google Sheet, **AnyList** (popular UK), **Bring!** (UK/EU), Apple Reminders (Family Sharing), Google Keep, dedicated page in your Lovable web app |
| **Hub page** | Claude Artifact (persistent), Lovable single page, Notion page, a local folder index in Cowork |

## Acceptance criteria (from main doc, reproduced)

- End-to-end pipeline from a real/realistic 10-minute recording runs in under 5 minutes.
- Extraction accuracy ≥ 80% on all four output types (student judges against ground truth).
- At least one automated distribution channel (not manual copy/paste).
- Demo video intelligible to a non-technical viewer.
- No exposed API keys; free-tier tools can run the whole thing (paid tiers optional for polish).
- Works on Windows and Mac.
- Portfolio-ready (shareable URL or exportable PDF hub).

## Default UK-friendly stack (recommend this)

- **Transcription:** Whisper inside Claude (Pro) or Fathom free.
- **Processing:** Claude Project with the extraction prompt as system prompt; Claude Sonnet 4.6.
- **Orchestration:** Claude Cowork (simplest) *or* a Lovable web app (shareable).
- **Distribution:** Zapier free tier → Google Calendar + Gmail + Google Sheets.
- **Hub page:** Claude Artifact (persistent 20 MB) or a single Lovable page.

## Fallback stack (no Claude Pro)

- **Transcription:** Whisper open-source local, or Fathom free.
- **Processing:** ChatGPT Plus Custom GPT with the extraction prompt.
- **Distribution:** Zapier free tier.
- **Hub:** a Google Sheet with named ranges.

## Stretch goals

- WhatsApp distribution via OpenClaw (Month 2 with hardened setup).
- Voice-activated trigger (Siri Shortcut, Google Assistant routine).
- Multi-family support with separate sheets per household.
- Weekly "last week's completions" summary email.
- Tone-check: "did anyone sound stressed?" scored against the transcript.

## UK family realities to design for

- Multiple calendars: Google + iCloud + Outlook 365 often in one family.
- Shared shopping app: AnyList + Bring! are UK favourites alongside Google Keep/Apple Reminders.
- Windows-first households (most UK homes) — Cowork Windows launch Feb 10, 2026 is recent and relevant.
- School and after-school clubs, sports, tutors, grandparents — events have more children and more participants than in typical US examples.
- UK dates as DD/MM/YYYY; bus/train as "bus" or "train" not "transit."
- UK shopping units (g/kg/ml/l, pint of milk, dozen eggs).

## Key URLs

- https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
- https://apidog.com/blog/voxtral-open-source-whisper-alternative/
- https://otter.ai/pricing
- https://www.fathom.ai/pricing
- https://fellow.ai/blog/ai-meeting-assistants-ultimate-guide/
- https://northflank.com/blog/best-open-source-speech-to-text-stt-model-in-2026-benchmarks
- https://support.claude.com/en/articles/9517075-what-are-projects
- https://claude.com/plugins
