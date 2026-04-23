# Plan — VIP Asset Pipeline for Curriculum Curation

**Date:** 2026-04-23
**Research:** [RESEARCH_2026-04-23_vip-asset-pipeline.md](./RESEARCH_2026-04-23_vip-asset-pipeline.md)
**Spans projects:** `1_gwthpipeline520` (pipeline) + **NEW** `GWTH_curriculum` (curriculum content + kanban) + `GWTH_V2` (platform only, loses `gwth_lesson_ideas/`)
**Status:** awaiting David's Gate-1 review, then break into beads
**Revised:** 2026-04-23 pm — after David's feedback, curriculum work gets its own project rather than sharing the GWTH_V2 engineering kanban

---

## 1. Goal

Give David a one-click way to flag a curated article / URL / PDF / YouTube video as a **VIP asset**, and have Claude produce a **kanban-ready idea file** with fact-checked placement proposals for the curriculum — with the existing `/plan` + `/build` gates doing the actual lesson/lab/project edits.

**Success signal:** the FT/Focaldata and BBC/Sunak workflows David just did manually become a 5-minute intake + review loop, and he can do 3–5 of them a week without context-switching exhaustion.

---

## 2. Scope

### In scope

- New `GWTH_curriculum` project — scaffolded, with kanban folders, curriculum-tuned CLAUDE.md, /plan + /build wiring.
- Migration of `gwth_lesson_ideas/` from GWTH_V2 to GWTH_curriculum (history preserved via `git mv` + paired commits).
- Pipeline Assets-tab "VIP Intake" card (NiceGUI) for URL / PDF / YouTube intake.
- Pipeline Assets-tab "Curriculum Kanban" card — read-only view of `GWTH_curriculum/kanban/` folder state.
- Pipeline background job that fetches, ingests to Qdrant, runs a web-enabled research subagent, and writes a kanban idea file to `GWTH_curriculum/kanban/0_idea/`.
- Standard idea-file template with: summary, fact-check, corpus cross-check, placement proposals, open questions, source URL.
- Explicit web-tools config for the research subagent (fixes the prior-session gap where the subagent reported no web access).
- Telegram notification when the idea file is ready.
- Docs in all three projects describing the contract: pipeline writes → GWTH_curriculum kanban; GWTH_V2 imports curriculum content at build time.

### Out of scope (explicitly not in v1)

- Auto-applying edits to lesson/lab/project files without `/plan` approval. (Reintroduces the exact risk David called out.)
- Editing lesson / lab / project *code* files — those don't exist yet. V1 targets lesson-ideas MDs + research folder only. When lessons are written (next few days per David), Phase 5 extends targeting.
- A "fast-lane" skip-`/plan` flag. Possible in a later phase; not v1.
- Custom state-machine UI. Kanban folders *are* the state.
- Editing M2 `LESSON_IDEAS` in v1 scope testing (M2 works but test surface is M1+M3 since that's what David just curated against).

### Explicit non-goals

- **Replacing** the existing auto-feed pipeline (RSS / YouTube / social scanners). This is a parallel *manual curation* lane.
- **Replacing** `/plan` and `/build`. This feeds them.

---

## 3. Architecture at a glance

Three projects, three clean responsibilities.

```
┌─────────────────────── Pipeline (1_gwthpipeline520) ──────────────────────┐
│                                                                            │
│  app/tabs/tab_assets.py       ← adds "VIP Intake" + "Curriculum Kanban"   │
│  app/services/                                                             │
│    vip_intake_service.py      ← NEW: orchestrates the flow                │
│    vip_research_agent.py      ← NEW: spawns web-enabled Claude subagent   │
│    vip_idea_writer.py         ← NEW: renders the idea-file template       │
│    curriculum_kanban_reader.py ← NEW: reads GWTH_curriculum/kanban state  │
│  app/routers/vip_api.py       ← NEW: /api/vip/submit, /api/vip/list,      │
│                                       /api/curriculum/kanban              │
│                                                                            │
│  (reuses: folder_scanner_service, docling_service, qdrant_service,        │
│           research_service for RAG helpers, external_content_service)     │
│                                                                            │
└────────┬──────────────────────────────────────────────────────────────────┘
         │ filesystem write (one markdown file + index entry)
         ▼
┌─────────────────────── GWTH_curriculum (NEW) ──────────────────────────────┐
│                                                                            │
│  kanban/                          ← curriculum-only kanban                 │
│    0_idea/IDEA_<date>_vip-<slug>.md  ← pipeline writes here                │
│    1_planning/                                                             │
│    2_testing/                                                              │
│    3_done/                                                                 │
│    vip-assets-index.json                                                   │
│    templates/VIP_IDEA_TEMPLATE.md                                          │
│    KANBAN_RUNNER.md               ← curriculum-tuned (no npm test, no P520)│
│    run-kanban.sh                                                           │
│  gwth_lesson_ideas/               ← MOVED from GWTH_V2                     │
│    MONTH_{1,2,3}_LESSON_IDEAS_*.md                                         │
│    month-{1,2,3}-research/                                                 │
│  content/                         ← future: written lessons / labs / projects│
│  CLAUDE.md                        ← curriculum context, no build/test      │
│  .beads/                          ← beads isolated from GWTH_V2            │
│                                                                            │
└────────┬───────────────────────────────────────────────────────────────────┘
         │ build-time copy (simple file sync, no submodule)
         ▼
┌─────────────────────── GWTH_V2 (trimmed) ──────────────────────────────────┐
│                                                                            │
│  src/                             ← Next.js app (unchanged)                │
│  kanban/                          ← PLATFORM ENGINEERING ONLY              │
│  content/                         ← populated from GWTH_curriculum/content │
│                                     by a build-time copy step              │
│                                                                            │
│  (gwth_lesson_ideas/ is REMOVED — lives in GWTH_curriculum now)            │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Contract pipeline → curriculum:** one filesystem write per VIP intake — the idea markdown file plus one JSON index line. No API, no shared DB, one-way.

**Contract curriculum → platform:** at GWTH_V2 build time, a script (`scripts/sync-content.ts`) copies `../GWTH_curriculum/content/**` into `GWTH_V2/content/`. Simple, auditable, no submodule.

**What gets separated by this split:**

- Engineering kanban (GWTH_V2, pipeline) stays focused on code, tests, deploys.
- Curriculum kanban (GWTH_curriculum) stays focused on teaching content, quotes, placements.
- The Pipeline UI is the *single dashboard* that shows both the VIP intake form and the curriculum kanban state — David doesn't have to context-switch between repos to see curriculum progress.

---

## 4. The idea-file template

Every VIP intake produces an idea file that follows this shape. David reviews this before running `/plan`.

```markdown
---
asset_type: {pdf | url | youtube}
source_url: <URL>
publisher: <e.g. "Financial Times", "BBC News">
date_published: <YYYY-MM-DD>
date_curated: <YYYY-MM-DD>
target_months: [1, 3]                  # where this lands
category: <e.g. "FT_Focaldata", "UK_Creators">
pipeline_files:
  - data/PDFs_manual_download/GWTH_Month_1/FT_Focaldata/FT-...-2026-04-23.pdf
  - data/PDFs_manual_download/GWTH_Month_1/FT_Focaldata/FT-...-2026-04-23.meta.md
qdrant_ingested: true
research_agent_log: <path to JSON log>
---

# VIP Asset — <Title>

## Summary
<3-5 bullets — the subagent's neutral summary of the asset>

## Fact-check
| # | Claim | Verdict | Supporting sources |
|---|-------|---------|--------------------|
| 1 | <load-bearing claim 1> | verified | <2+ URLs> |
| 2 | <load-bearing claim 2> | contested | <URLs showing both sides> |
| 3 | <load-bearing claim 3> | uncertain | <why unresolved> |

## Corpus cross-check
<Existing GWTH material from the same speaker/publisher/topic. Flags contradictions or duplications. Empty if none.>

## Placement proposals

### Month 1
- **Journey 1 (Redundancy)** — add <1-2 sentence insertion> near `MONTH_1_LESSON_IDEAS_2026-04-20.md:L123-L135`
- **L22 (CV & LinkedIn)** — add <quote> as evidential validation, citing <speaker>
- ...

### Month 3
- **L13 (Agentic Talent)** — ...

## Quotable lines
- "<quote 1>" — <speaker, role>
- "<quote 2>" — <speaker>

## Open questions
- <anything the subagent couldn't decide — David resolves before /plan>

## Source URL
<URL>
```

**Why this shape:** it's deliberately close to the `.meta.md` pattern David already accepts (FT/BBC work) but adds *verified/contested/uncertain* markers on the fact-check table — the safety net the recent work lacked.

---

## 5. Phased delivery

### Phase 0 — Project separation (prerequisite)

**Target:** ~1–2 hours. Must ship before Phase 1 because Phase 1 writes into the new project's kanban.

Deliverables:
1. Create `C:\Projects\GWTH_curriculum\` repo with:
   - `kanban/` (0_idea, 1_planning, 2_testing, 3_done), `KANBAN_RUNNER.md` tuned for curriculum work (no npm test, no P520 deploy, verification = "read the diff and the prose"), `run-kanban.sh`, `PLAN_TEMPLATE.md`, `PROMPT_TEMPLATE.md`.
   - `CLAUDE.md` — curriculum context (editorial style, sources to cite, tone, hallmark phrases like "flat is the new up" to reuse consistently), markdown-only, no build system.
   - `README.md` — explains what this repo is and what it is *not* (not the platform, not the pipeline).
   - `.beads/` initialised.
   - `.gitignore`, initial commit, pushed to a new GitHub repo (`David-ACG/gwth-curriculum` suggested).
2. Move `gwth_lesson_ideas/` from `GWTH_V2/` to `GWTH_curriculum/gwth_lesson_ideas/` using `git mv` + paired commits on both repos (history preserved in the new repo; GWTH_V2 records the removal).
3. Update references:
   - `GWTH_V2/CLAUDE.md` — remove `gwth_lesson_ideas/` mentions, add pointer to GWTH_curriculum.
   - `1_gwthpipeline520/data/PDFs_manual_download/GWTH_Month_*/README.md` — change "Related artefacts in GWTH_V2" section to point at GWTH_curriculum paths.
4. Smoke test: run Claude Code from `GWTH_curriculum/` — verify `/plan` and `/build` use the new repo's kanban folder correctly; `bd ready` in the new repo shows an empty-but-healthy state.

Acceptance criteria (Phase 0):
- [ ] New repo exists locally and on GitHub; pushable.
- [ ] `git log gwth_lesson_ideas/MONTH_1_LESSON_IDEAS_2026-04-20.md` in GWTH_curriculum shows the full history including the FT/BBC commits from today.
- [ ] `/plan test` from GWTH_curriculum writes to `GWTH_curriculum/kanban/1_planning/`, not to GWTH_V2.
- [ ] GWTH_V2 still builds (`npm run build`) — since nothing the app imports has been touched yet.

### Phase 1 — MVP intake (the critical path)

**Target:** 5–7 days after Phase 0. This replaces the manual FT/BBC workflow end-to-end and includes Qdrant corpus integration (promoted from Phase 3) + single-step YouTube intake + UI workflow reminders.

Key decisions (from David 2026-04-23 pm):
- **LLM:** Claude Opus 4.7 via David's Claude Code subscription — `general-purpose` subagent with explicit web tools.
- **Notification:** Telegram (async) + Assets-tab inline indicator (dashboard-native). Both.
- **Subagent scope:** writes the idea file only. Never edits lesson / research / content files. `/plan` + `/build` from `GWTH_curriculum` do real edits.
- **YouTube:** single-step — drop YouTube URL in VIP form, pipeline handles transcript fetch (youtube-transcript-api) with Whisper fallback, then proceeds end-to-end.
- **Corpus coverage:** option (b) + (c) combined — subagent reads lesson-ideas MDs + matching research-folder files + runs a Qdrant RAG query. Option (a) is skipped.

Deliverables:
1. `vip_intake_service.py` — given `{asset_type, source_url or file_path, target_months[], category}`:
   - fetch/normalise (URL → rendered HTML; PDF → stored; YouTube URL → transcript via youtube-transcript-api with Whisper fallback) → save into `data/PDFs_manual_download/GWTH_Month_X/<category>/`
   - write `.meta.md` stub
   - trigger folder-scan for that subfolder (reuses existing Qdrant ingest; asset is in Qdrant before research starts)
   - spawn `vip_research_agent`
   - when agent returns, call `vip_idea_writer` → writes markdown to **`GWTH_curriculum/kanban/0_idea/`**
   - append row to `GWTH_curriculum/kanban/vip-assets-index.json`
   - fire Telegram + Assets-tab notification with idea-file path
2. `vip_youtube_fetcher.py` (part of intake service) — takes a YouTube URL, returns transcript text + metadata. Uses youtube-transcript-api first; falls back to Whisper-on-audio if no captions. Surfaces failure clearly (e.g. "private video, cannot fetch") rather than silently degrading.
3. `vip_research_agent.py` — wraps the Claude Code `Agent` tool with `general-purpose` subagent, Claude Opus 4.7. **Explicit tools whitelist: `[Read, Grep, Glob, Bash, WebSearch, WebFetch]`.** The agent's 5 sub-tasks:
   - **Summarise** the asset (3–5 bullets).
   - **Fact-check** key claims via web search.
   - **Read** `GWTH_curriculum/gwth_lesson_ideas/MONTH_{1,2,3}_LESSON_IDEAS_*.md` + relevant `month-{1,2,3}-research/*.md` files for proposed target months.
   - **Query Qdrant** (see `vip_qdrant_query.py` below) for similar existing material — flags duplications + contradictions.
   - **Propose placements** with file:line references.
   Returns structured JSON. Logs token count + cost per run for observability.
4. `vip_qdrant_query.py` — thin helper the subagent calls via Bash: given a natural-language query, returns top-K Qdrant hits with `source`, `file_path`, `chunk_text`, `score`. Uses existing `qdrant_service`. This is the RAG cross-check that David wants from day one.
5. `vip_idea_writer.py` — renders the JSON → markdown via the template (template now includes a `Corpus cross-check` section listing existing-material hits).
6. `curriculum_kanban_reader.py` — reads `GWTH_curriculum/kanban/{0_idea,1_planning,2_testing,3_done}/*.md` and returns counts + last-modified + titles for the UI panel.
7. Assets-tab **VIP Intake card** with:
   - Form: URL input, file drop (PDF), YouTube URL field, month checkboxes (M1/M2/M3), category dropdown, submit.
   - **Inline workflow reminder** (collapsible panel, default expanded): *"After submit → (a) wait ~5 min for the idea file → (b) open `GWTH_curriculum/kanban/0_idea/` → (c) review the idea file → (d) in Claude Code from `C:\Projects\GWTH_curriculum`, run `/plan` then `/build`."* — rendered so David sees it every time without having to look it up.
   - Progress indicator while research is running (spinner + "fetching → ingesting → researching → writing idea file").
8. Assets-tab **Curriculum Kanban card** — read-only 4-column layout (0_idea / 1_planning / 2_testing / 3_done) with item counts + click-through to file:// links. Shows the "where am I" view for David without him switching repos.
9. API router (`/api/vip/submit`, `/api/vip/list`, `/api/curriculum/kanban`, `/api/vip/progress/<id>` for the progress indicator).
10. Idea-file template at `GWTH_curriculum/kanban/templates/VIP_IDEA_TEMPLATE.md` — includes a `Corpus cross-check` section populated by the Qdrant query.
11. Integration test: submit a fake URL → verify (a) asset in Qdrant, (b) subagent called with correct tools + Qdrant query helper present, (c) idea file lands with non-empty corpus-cross-check section, (d) index updated.

Acceptance criteria (Phase 1):
- [ ] David can submit a URL from the Assets tab, and within ~5 minutes a populated idea file appears in `GWTH_curriculum/kanban/0_idea/`.
- [ ] The idea file uses the template structure with non-empty fact-check + corpus-cross-check + placement-proposals sections.
- [ ] A YouTube URL submitted to the VIP form produces an ingested transcript end-to-end (no separate manual step).
- [ ] The research subagent's tool list (logged on first message) **explicitly includes `WebSearch` and `WebFetch`**. Test fails loudly if missing.
- [ ] The idea file's placement proposals cite at least 3 distinct `gwth_lesson_ideas/` locations (file + line range).
- [ ] The corpus-cross-check section lists at least one Qdrant hit OR explicitly says "no prior material on this topic" — never empty.
- [ ] Running `/plan` from the GWTH_curriculum repo against the idea file produces a plan David can execute with `/build`.
- [ ] Curriculum Kanban card on the Assets tab shows the new entry within 30s.
- [ ] Telegram notification fires on completion + Assets-tab shows a visible indicator.
- [ ] Inline workflow reminder is visible and accurate (spot-checked by David on first real intake).
- [ ] Per-asset token/cost log is written to `vip-assets-index.json` for observability.

### Phase 2 — Fact-check hardening

**Target:** +2 days after Phase 1.

- Require minimum 2 independent corroborating URLs for a `verified` verdict; else downgrade to `uncertain`.
- Record search queries used (in the agent log file) so they're auditable.
- Add a `confidence` score per placement proposal (low/medium/high) based on how many corpus hits matched.
- Handle paywalled sources: detect, surface in idea file with "fallback: David upload" note, don't fail the job.

### Phase 3 — Drift detection + quarterly re-analysis (repurposed)

**Target:** +2 days after Phase 2. Originally "Qdrant corpus cross-check" but that's promoted into Phase 1. Phase 3 now covers the *longitudinal* concern instead.

- `vip_reanalyze_service.py` — given a VIP asset already in `3_done/`, re-run the research agent against the *current* corpus and produce a diff report: are the original placements still optimal given newer material? Has later material contradicted this asset? Are its quotes now duplicated elsewhere?
- Quarterly job (or manual trigger from Assets tab) that runs re-analysis across the 10 most-cited VIP assets, produces a single "curriculum drift report" markdown in `GWTH_curriculum/kanban/reports/DRIFT_<date>.md`.
- "Re-research this asset" button on done-list entries (one-off re-run).
- Simple tone-audit: diff `gwth_lesson_ideas/MONTH_*` files against the same files 90 days ago; flag lessons that have changed >20% by word count — signals potential drift from repeated incremental edits.

### Phase 4 — UI polish + audit trail

**Target:** +1 day after Phase 3.

- Per-asset detail view (click a row in Recent VIP Assets) showing the idea file rendered, the research agent log, the fact-check table, and all placement proposals.
- Dedupe check on submit: warn if URL hash already in index.
- "Re-research this asset" button on done entries (e.g. 6 months later, re-run placement check against updated corpus).

### Phase 5 — Extend targeting (once lessons/labs/projects exist)

**Target:** triggered when the lesson files are written — per David, next few days.

- Extend `vip_research_agent` placement-proposal logic to also target `GWTH_curriculum/content/lessons/*.md`, `GWTH_curriculum/content/labs/*.md`, and `GWTH_curriculum/content/projects/*.md` (or whatever structure emerges).
- Add the build-time content-sync step in GWTH_V2 (`scripts/sync-content.ts`) that copies `../GWTH_curriculum/content/` into `GWTH_V2/content/` before `next build`. This keeps platform runtime decoupled from curriculum editing.
- Research folders (in GWTH_curriculum) stay as the richest source of truth; lesson/lab/project files get *summaries* regenerated from research when asked.
- Consider a "syllabus-diff" report: after N VIP asset integrations, produce a changelog showing which lessons received quotes/findings/sources since the last report. Supports editorial review.

---

## 6. Files affected

### In `GWTH_curriculum` (NEW project — Phase 0)
- `kanban/0_idea/`, `kanban/1_planning/`, `kanban/2_testing/`, `kanban/3_done/` (empty dirs with `.gitkeep`)
- `kanban/KANBAN_RUNNER.md` — curriculum-tuned (no npm test, no P520 deploy, no Playwright; verification = prose review + diff)
- `kanban/PLAN_TEMPLATE.md`, `kanban/PROMPT_TEMPLATE.md` — curriculum-shaped
- `kanban/run-kanban.sh`
- `kanban/templates/VIP_IDEA_TEMPLATE.md`
- `kanban/vip-assets-index.json` (empty array at creation)
- `kanban/docs/VIP_ASSET_CONTRACT.md` — documents what the pipeline writes, what David does with it, and how to diagnose failures without touching the pipeline
- `CLAUDE.md` — curriculum context, editorial style, markdown-only
- `README.md`, `.gitignore`, `.beads/`
- `gwth_lesson_ideas/` — **moved** from GWTH_V2 via `git mv`, history preserved
- `content/` — empty placeholder; populated as lessons/labs/projects are written

### In `1_gwthpipeline520` (new)
- `app/services/vip_intake_service.py` — orchestrator
- `app/services/vip_research_agent.py` — Claude Opus 4.7 subagent wrapper
- `app/services/vip_idea_writer.py` — template renderer
- `app/services/vip_qdrant_query.py` — RAG helper for corpus cross-check (called by subagent via Bash)
- `app/services/vip_youtube_fetcher.py` — youtube-transcript-api + Whisper fallback, single-step
- `app/services/curriculum_kanban_reader.py` — reads GWTH_curriculum/kanban state for UI
- `app/routers/vip_api.py`
- `tests/test_vip_intake.py`
- `tests/test_vip_research_agent.py` — includes the assert-tools-include-WebSearch-WebFetch test
- `tests/test_vip_idea_writer.py`
- `tests/test_vip_qdrant_query.py`
- `tests/test_vip_youtube_fetcher.py`
- `tests/test_curriculum_kanban_reader.py`
- `config/vip_categories.yaml` — enumerates allowed categories per month (seeded from existing `PDFs_manual_download/GWTH_Month_*` subfolders)
- `config/paths.yaml` — records the `GWTH_curriculum` path so the pipeline knows where to write idea files (overridable via env var `GWTH_CURRICULUM_PATH`)

### In `1_gwthpipeline520` (modified)
- `app/tabs/tab_assets.py` — add VIP Intake card + Curriculum Kanban card
- `app/service_registry.py` — register new services
- `app/gwth_dashboard.py` — wire the router
- `data/PDFs_manual_download/GWTH_Month_*/README.md` — update "Related artefacts" section to point at `GWTH_curriculum/gwth_lesson_ideas/` instead of `GWTH_V2/gwth_lesson_ideas/`

### In `GWTH_V2` (modified only — no additions)
- `CLAUDE.md` — remove `gwth_lesson_ideas/` references; add pointer to `GWTH_curriculum`
- Delete: `gwth_lesson_ideas/` (moved to GWTH_curriculum)

### Phase 5 (later) — `GWTH_V2` (new, only when lessons are rendered in-app)
- `scripts/sync-content.ts` — build-time copy from `../GWTH_curriculum/content/` into `src/content/`
- `next.config.ts` modification — run sync-content before build
- `.gitignore` — ignore `src/content/` (it's generated from the sister repo)

### No changes needed
- `/plan`, `/build`, `run-kanban.sh` machinery — they operate relative to the current repo's `kanban/` folder, which is correct behaviour for both engineering kanbans and the new curriculum kanban. Just run Claude Code from the right repo.

---

## 7. Testing strategy

- **Unit:** each service tested in isolation with recorded fixtures (sample URL, sample PDF, sample YouTube ID).
- **Integration:** end-to-end test: submit a local fixture URL → verify (a) file written to data folder, (b) Qdrant ingested (mock), (c) subagent called with correct tools (mock), (d) idea file lands with correct structure, (e) index updated.
- **Manual acceptance:** David submits an actual URL (e.g. a current Mollick Substack post or a LinkedIn post) and runs the full flow through to a `/build`. Success criteria: the edits land correctly and David didn't have to fight the tool.
- **Subagent tool-whitelist test:** assert that the agent's first message includes "Available tools: WebSearch, WebFetch..." — fails loudly if the prior-session gap recurs.

---

## 8. Security + cost

- **Secrets.** Pipeline already has Anthropic API key in env. No new secrets.
- **Cost cap.** Hard-coded per-asset: max 20 web fetches, max 50K tokens of Claude input, max 10K output. Log cost per asset in index.
- **Rate-limits.** Built into the research subagent (Claude Code's existing rate-limit handling).
- **Inputs.** URLs are fetched from the pipeline server, not the browser — David is not exposing his session. PDF uploads go through NiceGUI's standard file-drop (already used elsewhere in the app).

---

## 9. Rollback plan

If Phase 1 misbehaves (e.g. writes malformed idea files, runaway API spend, wrong placements):
- Kill switch: `config/vip_enabled: false` in pipeline config hides the UI card and disables the API. Existing idea files in kanban remain, David can ignore them.
- Rollback commit is isolated to the 4 new service files + 1 tab modification — easy to revert.
- The GWTH_V2 side has *no executable code* added (just template + docs + JSON index) — nothing to roll back there.

---

## 10. Beads breakdown (for David's review before creating issues)

Proposed beads issues — Phase 0 + Phase 1. Filed in GWTH_V2 engineering beads (since this is infrastructure work, not curriculum content work).

### Phase 0 — Project separation

| Prio | Type | Title |
|---|---|---|
| P1 | task | Phase 0 — Scaffold GWTH_curriculum repo (kanban, CLAUDE.md, run-kanban.sh, README, .beads) |
| P1 | task | Phase 0 — Create GitHub repo `David-ACG/gwth-curriculum` and push initial commit |
| P1 | task | Phase 0 — `git mv` gwth_lesson_ideas/ from GWTH_V2 to GWTH_curriculum (paired commits) |
| P1 | task | Phase 0 — Update GWTH_V2/CLAUDE.md + pipeline READMEs for new paths |
| P1 | task | Phase 0 — Smoke test /plan + /build in GWTH_curriculum repo |

### Phase 1 — MVP intake

| Prio | Type | Title |
|---|---|---|
| P1 | feature | VIP Intake — idea-file template + kanban docs (in GWTH_curriculum) |
| P1 | feature | VIP Intake — `vip_idea_writer` service + tests (pipeline) |
| P1 | feature | VIP Intake — `vip_qdrant_query` helper for RAG cross-check + tests (pipeline) |
| P1 | feature | VIP Intake — `vip_youtube_fetcher` single-step transcript + Whisper fallback + tests (pipeline) |
| P1 | feature | VIP Intake — `vip_research_agent` service, Claude Opus 4.7, explicit web-tools whitelist, includes Qdrant query + lesson-ideas + research-folder read, token/cost logging + tests (pipeline) |
| P1 | feature | VIP Intake — `vip_intake_service` orchestrator + tests (pipeline) |
| P1 | feature | VIP Intake — `curriculum_kanban_reader` service + tests (pipeline) |
| P1 | feature | VIP Intake — API router + Assets-tab **VIP Intake card** with inline workflow reminder + progress indicator |
| P1 | feature | VIP Intake — Assets-tab **Curriculum Kanban card** (read-only 4-column view) |
| P1 | task | VIP Intake — Telegram notification + Assets-tab indicator on completion |
| P1 | task | VIP Intake — end-to-end integration test with fixture URL (verifies fact-check + corpus cross-check + placements) |
| P2 | task | VIP Intake — dedupe-by-URL-hash on submit |
| P2 | task | VIP Intake — CLAUDE.md updates across all three repos |
| P2 | task | VIP Intake — soft cost cap (150K-token abort) + observable cost log |

Dependencies: Phase 0 issues must finish before any Phase 1 issue can start (Phase 1 writes into the new repo). Within Phase 1: template → (writer + qdrant_query + youtube_fetcher in parallel) → research agent (uses all three) → orchestrator → curriculum_kanban_reader → UI cards → integration test + notification + cost cap.

Phase 2–5 beads to be filed after Phase 1 ships.

---

## 11. Timeline estimate

- **Phase 0 (project split + migration):** ~1–2 hours. Mostly mechanical.
- **Phase 1 (MVP intake + Qdrant + YouTube + UI reminders):** ~5–7 days if focused. Larger than the original Phase 1 because Qdrant integration and single-step YouTube are promoted in from later phases (per David's decisions 2026-04-23 pm).
- **Phase 2 (fact-check hardening):** ~2 days.
- **Phase 3 (drift detection + quarterly re-analysis):** ~2 days.
- **Phase 4 (UI polish + audit trail):** ~1 day.
- **Phase 5 (extend to lessons/labs/projects):** triggered by lesson-writing milestone; ~2–3 days incremental.

Cost considerations (Claude Opus 4.7, David's Claude Code subscription):
- Each VIP research run: estimate ~40K–80K tokens input (asset + lesson-ideas MDs + research files + Qdrant hits) + 10–20 web fetches + ~10K–20K tokens output. Rough cost budget: meaningful but not wild.
- David plans to upgrade Max 5 → Max 20 during lesson-writing. That window absorbs the cost of 50–100 VIP intakes cleanly.
- Per-asset token + cost logged to `vip-assets-index.json` so the cost curve is visible. If a single run exceeds a 150K-token soft cap, the job stops and surfaces a warning (prevents runaway loops).

---

## 12. Why this is the right shape

- **It does not invent a parallel workflow.** It feeds David's existing kanban + `/plan` + `/build` loop with better raw material — but puts curriculum work in its own kanban so it doesn't collide with platform engineering.
- **It puts the risk at the right gate.** Claude proposes; David approves at the idea-file stage, approves again at the plan stage, approves a third time at the testing stage. Three layers of human-in-the-loop before anything lands in master.
- **It fills a specific, measured gap.** The recent FT/BBC work took ~45 minutes per article, mostly on mechanical ingestion + quote extraction + placement hunting. Phase 1 compresses that to ~5 min intake + ~10 min review.
- **It cleanly separates curriculum from platform.** Engineering beads, engineering kanban, engineering context in GWTH_V2 / pipeline. Curriculum beads, curriculum kanban, curriculum context in GWTH_curriculum. Each context is coherent on its own.
- **It scales with the curriculum.** When lessons/labs/projects are written in GWTH_curriculum/content/, the same pipeline extends in Phase 5 without redesign. The build-time content sync keeps the platform decoupled from curriculum editing rhythm.

---

## 13. What David does next

1. Review this plan (see checklist below).
2. Tell me what to change (if anything).
3. Approve → I break Phase 1 into beads and queue the first issue.

---
## Review Checklist — 2026-04-23 15:30
- [ ] Scope is correctly bounded — not too broad (e.g. not trying to auto-edit lessons), not too narrow (includes fact-check)
- [ ] Architecture split (pipeline for orchestration, GWTH_V2 for content) is correct
- [ ] "One filesystem write" contract between projects is clean enough
- [ ] Idea-file template covers everything needed for `/plan` to produce good plans
- [ ] Phase 1 deliverables are the right MVP (nothing missing, nothing premature)
- [ ] Web-tools-whitelist test is sufficient to prevent the prior-session gap from recurring
- [ ] Risks + mitigations in research doc are acceptable
- [ ] Beads breakdown makes sense (right granularity, right dependencies)
- [ ] Rollback plan is realistic
- [ ] Timeline is plausible (agree or push back)

**Review this plan:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-04-23_vip-asset-pipeline.md`
**Review the research:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/RESEARCH_2026-04-23_vip-asset-pipeline.md`
