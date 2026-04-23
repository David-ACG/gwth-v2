# Research — VIP Asset Pipeline for Curriculum Curation

**Date:** 2026-04-23
**Author:** Claude (for David)
**Related:** PLAN_2026-04-23_vip-asset-pipeline.md

---

## 1. What David asked for

> A Claude Code–driven workflow where David points at an article / webpage / PDF / YouTube video, and Claude (a) decides which lessons/labs/projects/journeys that asset belongs in, (b) updates the relevant research, lesson ideas, and (eventually) lesson/lab/project files, and (c) does this with human-in-the-loop approval.
>
> Proposed UI home: a new **"VIP assets"** section inside the pipeline's existing **Assets tab**, with a timeline showing each asset's stage.
>
> Two explicit concerns raised:
> - **Hallucination risk:** Claude might auto-edit lessons incorrectly and David must review before writes land.
> - **Subagent internet access:** during the recent FT/BBC work, research subagents said they had no web tools; David wants fact-checking enabled by default.

This is the sibling of the existing **automated pipeline** (RSS / YouTube / social scanners). It is a *manual intake* lane for curated finds that don't come through the auto-feed.

---

## 2. What's already in place (so we don't rebuild it)

- **Kanban gates** (`~/.claude/rules/03-kanban-gates.md`) — 4 gates: plan review → prompt review → implementation notes → testing handoff. `/plan` creates the plan + prompt; `/build` runs it. This is *already* a human-in-the-loop approval system for lesson-content edits. Reusing it is the single biggest simplification available.
- **`kanban/0_idea/`** — where new ideas land. `IDEA_2026-03-13_autonomous-build-optimization.md` exists as a reference.
- **Pipeline Assets tab** (`app/tabs/tab_assets.py`, 719 lines) — already has freshness matrix, accordion panels, stat pills, filter bar. Room to add a "VIP Intake" card at the top.
- **`folder_scanner_service.py`** — already ingests `PDFs_manual_download/**` into Docling → Qdrant. A VIP subfolder rides this rail for free.
- **`research_service.py`** — already does RAG + web-doc collection (420 lines, chunk budgeting built in). Can be extended for fact-check.
- **`gwth_lesson_ideas/MONTH_{1,2,3}_LESSON_IDEAS_*.md`** + **`month-{1,2,3}-research/`** — the target files Claude should edit, same pattern used for FT/Focaldata and BBC/Sunak.
- **Beads** for task tracking; `/plan` and `/build` for kanban orchestration.

**Claim:** 70% of what David is describing is already built. The new work is (a) a thin intake UI on the Assets tab, (b) a prompt-generator that produces kanban-ready idea files, (c) explicit web-enabled research for every intake, and (d) the state-tracking visualisation.

---

## 3. Critique of the initial proposal

### 3.1 What's right

- **Intake in the Assets tab.** Correct — it's where freshness already lives and where David looks when he's thinking about source material.
- **Human-in-the-loop.** Correct and essential. Kanban already enforces this; we should lean on it rather than invent a parallel review.
- **Web-enabled fact-check before placement.** Correct. The recent FT/BBC work exposed the gap: without web, Claude can only compare against the corpus it already knows, which misses counter-evidence and citation hardening.

### 3.2 Where the proposal is over-built

- **"A UI showing all the different stages that a new VIP asset goes through"** — if the stages map 1:1 onto kanban folders (`0_idea → 1_planning → 2_testing → 3_done`), we don't need new stage tracking. A VIP asset *is* a kanban item; its stage is its folder. One JSON file (`kanban/vip-assets-index.json`) is enough to render a dashboard view — no custom state machine.
- **Two UIs for the same thing.** Kanban folders already *are* the source of truth for state. The Assets-tab view should *read* kanban, not duplicate it.
- **"Claude then updates the syllabus and lessons and labs"** — in one step — is the highest-risk framing. Breaking it into "produce a proposed diff in a kanban prompt file → human approves → `/build` applies" is only marginally slower and eliminates the failure mode entirely.

### 3.3 Where the proposal is *under*-built

- **No fact-check stage is named in David's draft.** It needs to be a named, mandatory step — not a "maybe the subagent will do it". Recommendation: a dedicated `fact_check` field in the generated idea file with structured outputs (claims list, verified/contested/uncertain, supporting URLs).
- **No asset provenance record.** We need to know *when* David curated an asset, *why* he flagged it as VIP, and *which* lessons' content came from it — so that when a future article contradicts it, we know what to re-examine. This is the deeper version of the freshness matrix for curriculum content.
- **No "cross-check against existing research"**. When a new Sunak interview lands, we should check the existing Sunak citations in the corpus to catch the case where he said something different six months ago.

---

## 4. Recommended architecture (simpler + safer)

### 4.1 One-line summary

**Pipeline intake produces a kanban idea file; David's existing `/plan` + `/build` workflow does the lesson edits. Nothing new for David to learn; one new panel on the Assets tab.**

### 4.2 Flow

```
┌─────────────────────────┐     ┌──────────────────────────┐
│ Pipeline Assets tab     │     │ GWTH_V2/kanban           │
│  └─ VIP Intake panel    │     │                          │
│                         │     │   0_idea/                │
│   1. Paste URL / upload │     │    └─ IDEA_<date>_       │
│      PDF / YouTube link │ ──> │        vip-<slug>.md     │
│   2. Pick target month  │     │                          │
│   3. Submit             │     │   (David then runs       │
│                         │     │    /plan then /build as  │
│   (pipeline ingests,    │     │    normal)               │
│    runs research agent, │     │                          │
│    writes idea file)    │     │   1_planning/            │
│                         │     │   2_testing/             │
│                         │     │   3_done/                │
└─────────────────────────┘     └──────────────────────────┘
```

### 4.3 What the pipeline does (the "intake" job)

Given an asset (URL, PDF, YouTube video):

1. **Fetch & normalise** — download PDF / render HTML / pull YouTube transcript. Save to `GWTH_Month_X/<category>/<slug>.{pdf,html,md}`. Generate sibling `.meta.md` (publisher, URL, date, headline findings placeholder).
2. **Ingest to Qdrant** — via existing folder_scanner rail. No new code path.
3. **Spawn web-enabled research subagent** — with `WebSearch + WebFetch` explicitly enabled. Its job (produces structured JSON that becomes the idea file body):
   - **Summarise** the asset (3–5 bullets).
   - **Fact-check** — pick the 3–5 most load-bearing claims, search the web, mark each `verified | contested | uncertain` with supporting URLs. Uncertainty is allowed; false confidence is not.
   - **Cross-check the corpus** — query Qdrant for any existing material from the same speaker/publisher/topic to flag contradictions or duplications.
   - **Propose placements** — read `MONTH_{1,2,3}_LESSON_IDEAS_*.md` (and later the lesson / lab / project files), and for each of the asset's main findings recommend (a) which lesson / journey / lab, (b) a suggested quotable line, (c) a 1–2 sentence micro-edit to integrate. **Every proposal cites the target file + line range** so David can jump straight to it.
   - **Surface open questions** — anything the subagent couldn't decide.
4. **Write idea file** — `kanban/0_idea/IDEA_<date>_vip-<slug>.md` with a standard template (summary / fact-check / placements / open questions / source URL).
5. **Append to `kanban/vip-assets-index.json`** — one-line entry so the Assets-tab panel can render the list with state derived from folder location.

### 4.4 What David does

- In the Assets tab VIP panel: paste URL / drag PDF / paste YouTube URL → Submit.
- Wait for the idea file to appear (~1–3 min). Get notified.
- Open the idea file. Review placements. Edit if needed.
- Run `/plan` (in Claude Code) → review the generated plan → approve.
- Run `/build` → plan executes → files edited → testing checklist → promote.

**This is the exact workflow David already uses. We're just auto-generating the idea file.**

### 4.5 The UI is trivial

A single card at the top of the Assets tab:

```
┌── VIP Intake ──────────────────────────────────────────┐
│ [ URL / paste text / drag PDF here                   ] │
│ Target month: (•) M1  ( ) M2  ( ) M3                   │
│ Category:     (•) FT/Focaldata  ( ) UK_Creators ...    │
│ [ Submit ]                                              │
└─────────────────────────────────────────────────────────┘

┌── Recent VIP Assets (last 30 days) ────────────────────┐
│ • FT/Focaldata — AI divide  · M1+M3 · ✅ done  · 4/23  │
│ • BBC/Sunak — fewer jobs    · M1+M3 · ✅ done  · 4/23  │
│ • <in progress> CIPD Spring · M1    · 🟡 planning · 4/24│
│ • <new> Karpathy blog post  · M1    · 🔵 idea  · 4/24  │
└─────────────────────────────────────────────────────────┘
```

That's it. State is derived from which kanban folder the idea file currently lives in. No custom state machine.

---

## 5. Project-structure question — where does this live?

David asked whether to put this in GWTH_V2, the pipeline, or a new project. Analysis:

| Aspect | GWTH_V2 | Pipeline (`1_gwthpipeline520`) | New project |
|---|---|---|---|
| Target files (lesson ideas MDs) | ✅ native | via file-system | via file-system |
| Kanban folders | ✅ native | separate repo | would duplicate |
| `/plan` + `/build` commands | ✅ configured | no | would reconfigure |
| NiceGUI dashboard | no | ✅ native | no |
| Docling / Qdrant ingestion | no | ✅ native | no |
| Research service / LLM orchestration | no | ✅ native | no |
| Assets tab / freshness matrix | no | ✅ native | no |
| Cost to add a feature | low for docs, high for UI | low for UI, moderate for docs | very high (bootstrapping) |

**Recommendation: split cleanly along existing lines.**

- **Pipeline** owns: intake UI, research subagent orchestration, web fact-check, Qdrant ingest, writing the idea file. This is orchestration + ingestion, which is *exactly* what the pipeline does today.
- **GWTH_V2** owns: the idea file (once written), kanban flow, `/plan` + `/build`, lesson-ideas doc edits, lesson / lab / project file edits. This is curriculum content, which is *exactly* what GWTH_V2 holds today.
- **Interface between them:** the pipeline writes one markdown file to `C:/Projects/GWTH_V2/kanban/0_idea/` via a simple filesystem write. No API. No shared database. One-way handoff. Easy to test, easy to inspect, easy to bypass if something breaks.

**Do NOT create a third project.** Adds two more repos to maintain, another kanban to run, another CLAUDE.md, another set of env vars. The interface is already clean.

**Keeping research / ideas folders separate from lesson / lab / project files** (which David explicitly wants) falls out naturally: the pipeline's subagent proposes edits to *both*, and the kanban prompt targets whichever set of files the current plan includes. Research docs get richer over time; lesson files get regenerated from them. Both coexist.

---

## 6. Risks and mitigations

| Risk | Likelihood | Severity | Mitigation |
|---|---|---|---|
| **Claude proposes a wrong placement** (e.g. puts a M3 strategic insight into a M1 beginner lesson) | medium | medium | Every proposal includes target file + line range; David reviews the idea file before `/plan`. `/plan` stage is a second filter. |
| **Claude hallucinates a fact from the asset** | medium | high | Mandatory fact-check step with `verified/contested/uncertain` marking + web citations. Idea file template forces the subagent to quote the source, not paraphrase. |
| **Fact-check false confidence** (says "verified" because it didn't find contradiction) | medium | medium | Require minimum 2 independent corroborating sources for `verified`; otherwise `uncertain`. Log search queries used. |
| **Subagent has no web tools** (the prior-session failure mode) | high if unfixed | high | Explicit `tools: [WebSearch, WebFetch, Read, Grep, Glob]` in the agent spawn config. Unit test that fails if the tools list is missing. First thing the subagent must do is echo back its tool list. |
| **Drift across many iterations** — subtle tone/position shifts as many small edits accumulate | low now, rises over time | medium | Every VIP asset leaves a trail in kanban `3_done/`. Quarterly "tone audit" job can diff lesson files against earlier revisions. Out of scope for v1 but note it. |
| **Over-ingestion** — same asset submitted twice | low | low | Dedupe by URL hash + filename in `vip-assets-index.json`. Warn, don't block (might be intentional re-submit after source update). |
| **Paywalls / rate-limited fetches** | medium for FT/Economist | medium | Fall back to David's manual PDF upload path (which is the current FT workflow). Surface the failure clearly; don't silently degrade. |
| **Cross-project coupling** | low | low | One filesystem write, nothing else. Document the contract. |
| **LLM cost** per asset (fact-check can be expensive with web search) | low | low | Hard cap: 20 web fetches per asset. Log cost per asset in the index. |
| **Subagent takes too long** | medium | low | 10-minute timeout; on failure, write a partial idea file with a "research incomplete" flag so David can still review manually. |

---

## 7. Open questions for David

1. **Which LLM for the research subagent?** Claude Opus 4.7 via Claude Code subagent (expensive, best quality) vs Claude API directly (same cost, scriptable) vs OpenAI/Groq (cheaper but less integrated). Recommendation: Claude Code subagent via `general-purpose` with explicit web tools — reuses existing auth, runs in same session.
2. **Notification on idea-file ready?** Telegram (already wired) vs pipeline toast vs nothing (David just refreshes the Assets tab). Recommendation: Telegram short message with the idea-file path, since intake is async.
3. **Should the subagent ever edit files directly, even lesson-ideas docs?** Current proposal: **no** — it only writes the idea file; David runs `/plan` + `/build` for actual edits. This matches current kanban discipline. If David wants a "fast-lane" for tiny edits (e.g. "just add this one quote to L22"), we can add a `--fast` flag later that skips `/plan` and goes straight to `/build`.
4. **YouTube videos — which transcript source?** youtube-transcript-api is already in the pipeline (from `tab_youtube_sources.py` docs). Should be the default. Fall back to Whisper if no captions.
5. **How much of the corpus should the subagent read before proposing placements?** Options: (a) only the 3 lesson-ideas MDs (fast, ~3K tokens each), (b) the lesson-ideas MDs plus matching research folder files (thorough, ~30K tokens), (c) RAG query against Qdrant (scalable, best long-term). Recommendation: start with (a), upgrade to (c) once lessons/labs/projects are written and the corpus is larger.

---

## 8. What gets built first

The plan (sibling doc) breaks this into 5 phases. Phase 1 is the MVP — enough to replace the manual workflow David just did for FT and BBC. Phases 2–5 add fact-check quality, corpus cross-check, UI polish, and the expansion to lessons/labs/projects once those are written.

See `PLAN_2026-04-23_vip-asset-pipeline.md`.
