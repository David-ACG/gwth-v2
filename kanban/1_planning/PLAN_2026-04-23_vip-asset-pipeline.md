# Plan — VIP Asset Pipeline for Curriculum Curation

**Date:** 2026-04-23
**Research:** [RESEARCH_2026-04-23_vip-asset-pipeline.md](./RESEARCH_2026-04-23_vip-asset-pipeline.md)
**Spans projects:** `1_gwthpipeline520` (pipeline) + `GWTH_V2` (curriculum)
**Status:** awaiting David's Gate-1 review, then break into beads

---

## 1. Goal

Give David a one-click way to flag a curated article / URL / PDF / YouTube video as a **VIP asset**, and have Claude produce a **kanban-ready idea file** with fact-checked placement proposals for the curriculum — with the existing `/plan` + `/build` gates doing the actual lesson/lab/project edits.

**Success signal:** the FT/Focaldata and BBC/Sunak workflows David just did manually become a 5-minute intake + review loop, and he can do 3–5 of them a week without context-switching exhaustion.

---

## 2. Scope

### In scope

- Pipeline Assets-tab "VIP Intake" card (NiceGUI) for URL / PDF / YouTube intake.
- Pipeline background job that fetches, ingests to Qdrant, runs a web-enabled research subagent, and writes a kanban idea file to `GWTH_V2/kanban/0_idea/`.
- Standard idea-file template with: summary, fact-check, corpus cross-check, placement proposals, open questions, source URL.
- Recent-VIP-assets list in the Assets tab, reading from `kanban/vip-assets-index.json`.
- Explicit web-tools config for the research subagent (fixes the prior-session gap where the subagent reported no web access).
- Telegram notification when the idea file is ready.
- Docs in both projects describing the contract between pipeline and GWTH_V2.

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

```
┌─────────────────────── Pipeline (1_gwthpipeline520) ──────────────────────┐
│                                                                            │
│  app/tabs/tab_assets.py       ← adds "VIP Intake" card + recent list      │
│  app/services/                                                             │
│    vip_intake_service.py      ← NEW: orchestrates the flow                │
│    vip_research_agent.py      ← NEW: spawns web-enabled Claude subagent   │
│    vip_idea_writer.py         ← NEW: renders the idea-file template       │
│  app/routers/vip_api.py       ← NEW: /api/vip/submit, /api/vip/list       │
│                                                                            │
│  (reuses: folder_scanner_service, docling_service, qdrant_service,        │
│           research_service for RAG helpers, external_content_service)     │
│                                                                            │
└─────────────────────────┬──────────────────────────────────────────────────┘
                          │ filesystem write (one markdown file)
                          ▼
┌─────────────────────── GWTH_V2 ────────────────────────────────────────────┐
│                                                                            │
│  kanban/0_idea/IDEA_<date>_vip-<slug>.md   ← pipeline writes this          │
│  kanban/vip-assets-index.json              ← pipeline appends entry        │
│  kanban/templates/                                                         │
│    VIP_IDEA_TEMPLATE.md                    ← NEW: idea-file template       │
│                                                                            │
│  gwth_lesson_ideas/MONTH_{1,2,3}_LESSON_IDEAS_*.md  ← edited via /plan+build│
│  gwth_lesson_ideas/month-{1,2,3}-research/*.md       ← edited via /plan+build│
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Contract between projects:** one function, one output. Pipeline writes exactly two things — a markdown idea file + one JSON line in the index. Nothing else is shared.

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

### Phase 1 — MVP intake (the critical path)

**Target:** 3–5 days. This is what replaces the manual FT/BBC workflow.

Deliverables:
1. `vip_intake_service.py` — given `{asset_type, source_url or file_path, target_months[], category}`:
   - fetch/normalise → save into `data/PDFs_manual_download/GWTH_Month_X/<category>/`
   - write `.meta.md` stub
   - trigger folder-scan for that subfolder (reuses existing Qdrant ingest)
   - spawn `vip_research_agent`
   - when agent returns, call `vip_idea_writer` → writes markdown to GWTH_V2 kanban path
   - append row to `vip-assets-index.json`
   - fire Telegram notification with idea-file path
2. `vip_research_agent.py` — wraps the Claude Code `Agent` tool with `general-purpose` subagent. **Explicit tools whitelist: `[Read, Grep, Glob, Bash, WebSearch, WebFetch]`**. Prompt template includes the 5 sub-tasks (summarise, fact-check, corpus-check, placements, open questions). Returns structured JSON.
3. `vip_idea_writer.py` — renders the JSON → markdown via the template.
4. Assets-tab **VIP Intake card** with a form (URL input, file drop, month radio, category dropdown, submit).
5. Assets-tab **Recent VIP Assets** list reading `vip-assets-index.json`. Each row shows title, category, state (derived from kanban folder), last-modified date. Click → opens idea file in file:// link.
6. API router (`/api/vip/submit`, `/api/vip/list`).
7. Idea-file template at `GWTH_V2/kanban/templates/VIP_IDEA_TEMPLATE.md`.
8. Integration test: submit a fake URL → verify idea file lands in `kanban/0_idea/` and index is updated.

Acceptance criteria (Phase 1):
- [ ] David can submit a URL from the Assets tab, and within 5 minutes a populated idea file appears in `GWTH_V2/kanban/0_idea/`.
- [ ] The idea file uses the template structure above with a non-empty fact-check table.
- [ ] The research subagent's tool list (logged on first message) **explicitly includes `WebSearch` and `WebFetch`**. This is the prior-session gap and must be verified, not assumed.
- [ ] Running `/plan` against the idea file produces a plan the user can execute with `/build`.
- [ ] Recent-VIP-assets list shows the new entry within 30s of submission.
- [ ] Telegram notification fires on completion.

### Phase 2 — Fact-check hardening

**Target:** +2 days after Phase 1.

- Require minimum 2 independent corroborating URLs for a `verified` verdict; else downgrade to `uncertain`.
- Record search queries used (in the agent log file) so they're auditable.
- Add a `confidence` score per placement proposal (low/medium/high) based on how many corpus hits matched.
- Handle paywalled sources: detect, surface in idea file with "fallback: David upload" note, don't fail the job.

### Phase 3 — Corpus cross-check (Qdrant)

**Target:** +2 days after Phase 2.

- Replace the "read lesson-ideas MDs directly" approach with a Qdrant query against the existing `GWTH_Month_1/2/3` collections.
- Subagent proposes placements by similarity-searching the asset's key findings against existing lesson content.
- Surfaces duplications ("You already have the Acemoglu quote at L1 M3") and contradictions ("Earlier citation said X, this asset says Y").

### Phase 4 — UI polish + audit trail

**Target:** +1 day after Phase 3.

- Per-asset detail view (click a row in Recent VIP Assets) showing the idea file rendered, the research agent log, the fact-check table, and all placement proposals.
- Dedupe check on submit: warn if URL hash already in index.
- "Re-research this asset" button on done entries (e.g. 6 months later, re-run placement check against updated corpus).

### Phase 5 — Extend targeting (once lessons/labs/projects exist)

**Target:** triggered when the lesson files are written — per David, next few days.

- Extend `vip_research_agent` placement-proposal logic to also target `app/(dashboard)/course/[slug]/lesson/[lessonSlug]/*.mdx` (or wherever lesson content lives).
- Extend to lab files and project files as their structure firms up.
- Research folder stays as the richest source of truth; lesson/lab/project files get *summaries* regenerated from research when asked.

---

## 6. Files affected

### In `1_gwthpipeline520` (new)
- `app/services/vip_intake_service.py`
- `app/services/vip_research_agent.py`
- `app/services/vip_idea_writer.py`
- `app/routers/vip_api.py`
- `tests/test_vip_intake.py`
- `tests/test_vip_research_agent.py`
- `tests/test_vip_idea_writer.py`
- `config/vip_categories.yaml` — enumerates allowed categories per month (seeded from existing `PDFs_manual_download/GWTH_Month_*` subfolders)

### In `1_gwthpipeline520` (modified)
- `app/tabs/tab_assets.py` — add VIP Intake card + Recent list at top
- `app/service_registry.py` — register new services
- `app/gwth_dashboard.py` — wire the router

### In `GWTH_V2` (new)
- `kanban/templates/VIP_IDEA_TEMPLATE.md`
- `kanban/vip-assets-index.json` (empty array at creation)
- `kanban/docs/VIP_ASSET_CONTRACT.md` — documents what the pipeline writes, what David does with it, and how to diagnose failures without touching the pipeline

### In `GWTH_V2` (modified)
- `kanban/KANBAN_RUNNER.md` — one paragraph referencing the VIP flow as an alternative source of idea files (beyond David manually creating them)
- `CLAUDE.md` — note the VIP index file as a read source for AI sessions

### No changes needed
- `/plan`, `/build`, `run-kanban.sh`, gate checklists — VIP idea files are just normal idea files. The workflow downstream is unchanged.

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

Proposed beads issues, Phase 1:

| Prio | Type | Title |
|---|---|---|
| P1 | feature | VIP Intake — idea-file template + kanban docs (GWTH_V2) |
| P1 | feature | VIP Intake — `vip_idea_writer` service + tests |
| P1 | feature | VIP Intake — `vip_research_agent` service with explicit web-tools whitelist + tests |
| P1 | feature | VIP Intake — `vip_intake_service` orchestrator + tests |
| P1 | feature | VIP Intake — API router + Assets-tab UI card |
| P1 | task | VIP Intake — end-to-end integration test with fixture URL |
| P2 | task | VIP Intake — Telegram notification on completion |
| P2 | task | VIP Intake — dedupe-by-URL-hash on submit |
| P2 | task | VIP Intake — CLAUDE.md + KANBAN_RUNNER.md updates |

Dependencies: template + writer → research agent → orchestrator → UI → integration test.

Phase 2–5 beads to be filed after Phase 1 ships.

---

## 11. Timeline estimate

- Phase 1: ~3–5 days if focused (most work is services + tests; UI is ~half a day).
- Phase 2: ~2 days.
- Phase 3: ~2 days.
- Phase 4: ~1 day.
- Phase 5: triggered by lesson-writing milestone; ~2–3 days incremental.

---

## 12. Why this is the right shape

- **It does not invent a parallel workflow.** It feeds David's existing kanban + `/plan` + `/build` loop with better raw material. Everything downstream is already battle-tested.
- **It puts the risk at the right gate.** Claude proposes; David approves at the idea-file stage, approves again at the plan stage, approves a third time at the testing stage. Three layers of human-in-the-loop before anything lands in master.
- **It fills a specific, measured gap.** The recent FT/BBC work took ~45 minutes per article, mostly on mechanical ingestion + quote extraction + placement hunting. Phase 1 compresses that to ~5 min intake + ~10 min review.
- **It scales with the curriculum.** When lessons/labs/projects are written, the same pipeline extends in Phase 5 without redesign.

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
