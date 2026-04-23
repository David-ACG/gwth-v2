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

- **"Claude then updates the syllabus and lessons and labs"** — in one step — is the highest-risk framing. Breaking it into "produce a proposed diff in a kanban prompt file → human approves → `/build` applies" is only marginally slower and eliminates the failure mode entirely.
- **A custom state machine in the UI.** We can reuse the kanban folder pattern (0_idea → 1_planning → 2_testing → 3_done) as the state model. Each VIP asset *is* a kanban item; its stage is its folder. One JSON index file is enough to drive a dashboard view — no custom state machine needed.

### 3.2a Revision after David's feedback (2026-04-23 pm)

My first draft said "reuse the existing GWTH_V2/kanban folder". **This was wrong.** The existing GWTH_V2 kanban is for engineering the GWTH platform — building components, fixing bugs, shipping features. Curriculum curation is a fundamentally different kind of work:

| Engineering kanban work | Curriculum kanban work |
|---|---|
| Build a React component | Add a Sunak quote to L22 |
| Fix a Playwright flake | Integrate FT/Focaldata findings into Journey 1 |
| Run `npm test`, deploy to P520 | Diff the MD, read the insertion in context |
| Verify via browser at :3001 | Verify by reading the prose |
| Uses TypeScript / tests / build pipeline | Uses markdown / semantic review only |

Mixing them in one folder means:
- `bd ready` surfaces React tickets next to "add this quote" tickets
- `/plan` templates try to fit code-shaped work into content-shaped work (and vice-versa)
- The audit trail in `3_done/` is noisy — you can't answer "what curriculum changed this month" without filtering
- Two mental contexts collide every time you open the folder

**Correct principle:** *reuse the workflow pattern*, don't reuse the same folder. Each kind of work gets its own kanban. This matches how the pipeline repo already has its own kanban and GWTH_V2 already has its own kanban — they share the pattern but have separate folders. Curriculum should get the same treatment.

Section 5 below is rewritten accordingly.

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

David's position (after feedback): curriculum work must be *organisationally separated* from engineering work on GWTH and the pipeline. He floated two options — a new project folder, or a pipeline-UI surface that shows curriculum work separately. **The right answer is both, combined.** Here's the revised analysis.

### 5.1 Three concerns, three homes

| Concern | Home | Why |
|---|---|---|
| **Platform engineering** (Next.js app, auth, UI, tests, deploys) | `C:\Projects\GWTH_V2` (existing) | Already configured with /plan, /build, Playwright, Coolify |
| **Pipeline engineering + ingestion + VIP orchestration** (Docling, Qdrant, NiceGUI dashboard, the new VIP intake service) | `C:\Projects\1_gwthpipeline520` (existing) | Already has the infrastructure; adding a tab and a service is marginal |
| **Curriculum content + curriculum kanban** (lesson ideas, research folders, syllabus, lessons, labs, projects, VIP idea files) | `C:\Projects\GWTH_curriculum` (NEW) | Pure markdown workspace. No build. No tests. Verification = David reads the prose. Its own kanban, its own /plan, its own /build |

### 5.2 What moves

From `GWTH_V2` → `GWTH_curriculum`:
- `gwth_lesson_ideas/` (MONTH_{1,2,3}_LESSON_IDEAS_*.md, SYLLABUS_DIFF_*.md, month-{1,2,3}-research/, rewired-book-notes/, etc.)
- Future: lesson content, lab content, project content, syllabus docs
- A new `kanban/` (curriculum-only): 0_idea / 1_planning / 2_testing / 3_done, a curriculum-tuned CLAUDE.md, its own /plan and /build wiring

GWTH_V2 keeps:
- All `src/` (Next.js app, React components, API routes)
- Its existing `kanban/` — which now handles *platform engineering only*
- When lessons need to render in the app, they're imported from `../GWTH_curriculum/content/` at build time (simple copy step; no submodule, no npm package)

Pipeline stays as is, plus gains:
- VIP Intake card on Assets tab
- Pipeline-side "Curriculum Kanban" view that *reads* `GWTH_curriculum/kanban/` and renders the state — single dashboard for curriculum work, without conflating it with engineering kanban

### 5.3 Why this is better than my first draft

- **Mental-context match.** David opens `GWTH_curriculum` when he wants to think about teaching content; opens `GWTH_V2` when he wants to think about platform engineering. Zero cross-contamination.
- **Beads stays coherent.** Engineering beads in GWTH_V2 and pipeline stay focused on code; curriculum beads in GWTH_curriculum stay focused on lessons. `bd ready` gives a relevant answer in each context.
- **Audit trails are clean.** "What curriculum changed this month" = `git log` in one repo. "What platform engineering shipped" = `git log` in another.
- **Curriculum tooling can be tuned.** A curriculum `/plan` template cares about which lesson/journey/lab is being updated and what quote is being added. An engineering `/plan` template cares about test coverage and file paths. Different templates, different gates.
- **Contract to pipeline stays trivial.** Pipeline writes one markdown file to `C:\Projects\GWTH_curriculum\kanban\0_idea\`. Still one filesystem write. Still no API. The destination just moved.

### 5.4 Migration cost (one-time)

- `git mv` `gwth_lesson_ideas/` from GWTH_V2 to GWTH_curriculum (preserves history)
- Update pipeline README path references (2–3 mentions)
- Update GWTH_V2 CLAUDE.md (remove `gwth_lesson_ideas/` references; add pointer to new repo)
- Scaffold GWTH_curriculum: kanban folder tree, CLAUDE.md, run-kanban.sh variant, README
- Update the VIP plan (Phase 0 step; already reflected in the plan doc)

Total: ~1–2 hours of careful moves + commits in both repos. One-time.

### 5.5 Ongoing cost (objection: "a third repo to maintain")

- No CI/CD. No deploys. No build. No tests beyond markdown link checks.
- CLAUDE.md is short (curriculum work is content-writing, not engineering).
- Each curriculum session starts in one repo and stays there until David decides to run a platform build.
- The *mental overhead* of having a third repo is lower than the *mental overhead* of conflating two kinds of work in one folder.

### 5.6 Pipeline-UI surface of curriculum kanban

The pipeline's Assets tab adds two cards:

1. **VIP Intake** — the submit form (URL / PDF / YouTube) that writes into `GWTH_curriculum/kanban/0_idea/`. Identical to the original design; only the destination path changes.
2. **Curriculum Kanban** — a read-only board showing the 4 folders of `GWTH_curriculum/kanban/` with item counts + last-modified dates. Click a row → opens the markdown in a local viewer. This gives David the "single dashboard for curriculum work" he wanted, without duplicating state: the folders are the source of truth.

The existing GWTH_V2 kanban and pipeline kanban are *not* shown in this panel — they're engineering work, lived-in via Claude Code sessions in the respective repos.

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
