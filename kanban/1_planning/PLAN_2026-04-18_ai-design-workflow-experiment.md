# PLAN — AI Design Workflow A/B Experiment (FractionalBuddy)

**Date:** 2026-04-18
**Author:** David + Claude
**Budget:** ~10-14 hours total work across planning/execution/synthesis/Lab production
**Related:** [RESEARCH_2026-04-15_ai-design-workflow.md](./RESEARCH_2026-04-15_ai-design-workflow.md), [RESEARCH_2026-04-16_claude-code-design-skills.md](./RESEARCH_2026-04-16_claude-code-design-skills.md)

---

## 1. Purpose & Hypothesis

**Purpose.** Before committing to a design workflow for the GWTH v2 redesign, run a controlled A/B test on a lower-stakes project — **FractionalBuddy** (`C:\Projects\conscia-fractional`) — to empirically test whether the **lean path** ($20/mo, no v0 paid tier) produces design output of comparable quality to the **full path** ($50/mo with v0 Team).

**Hypothesis.** With Claude Design ingesting the codebase upstream and 21st.dev Magic MCP covering routine components, the lean path produces output at ≥80% of the full path's quality while costing 60% less. If confirmed, the GWTH v2 redesign runs on the lean path.

**Secondary purpose.** Capture every artefact (prompts, screenshots, time, credits, diffs, decisions) so the experiment becomes a GWTH Lab — students see a real comparative tool evaluation, not a sales pitch.

---

## 2. Session Architecture — Where Each Step Happens

> **This is the question you asked me to think hard about.** Here's the answer with reasoning.

### Recommendation: four separate sessions across three projects

| # | Session | Working dir | Why separate session |
|---|---|---|---|
| 1 | **Planning** (this one, already in progress) | `C:\Projects\GWTH_V2` | Research lives here; plan file belongs alongside research. |
| 2 | **Track A — With v0** | `C:\Projects\conscia-fractional` (branch: `experiment/with-v0`) | Fresh session prevents Track B context leaking in. Claude Code auto-loads conscia-fractional's CLAUDE.md cleanly. |
| 3 | **Track B — Without v0** | `C:\Projects\conscia-fractional` (branch: `experiment/without-v0`) | Must be a *different session* from Track A. See "Why not one session" below. |
| 4 | **Synthesis + Lab production** | `C:\Projects\GWTH_V2` then `C:\Projects\1_gwthpipeline520` | Compare results → write lab.md → hand off to pipeline. |

### Why not one session running both tracks?

Three reasons, in order of importance:

1. **Context contamination is the killer.** If I see v0's output during Track A and then write Track B, Track B unconsciously mimics Track A's component shapes, naming, and layout choices. The whole experiment becomes worthless — you'd be measuring my short-term memory, not the tools.
2. **Fresh CLAUDE.md loading.** Conscia-fractional has its own AGENTS.md and CLAUDE.md. A fresh session loads those as first-class context; a reused session has them deep in compacted history where they lose attention weight.
3. **Time budget honesty.** Each track needs its own clock. Shared session = shared context = polluted timing.

### Why not run it entirely inside the pipeline project?

The pipeline is a **content ingestion system**, not a design workspace. It consumes finished experiment artefacts and produces lab.md + voiceover.txt + image_prompts.json. Running design work inside it would tangle the pipeline's own codebase with experimental design commits. Keep them separate.

### Why not run it from GWTH v2 (this project)?

Because Claude Code auto-loads the working directory's CLAUDE.md. Running conscia-fractional work from GWTH v2 means either (a) losing conscia-fractional's project context, or (b) constantly reminding Claude which project is which. Use the right working dir for the right job.

### Why branches, not git worktrees?

Worktrees make sense when you need *parallel* work (I'm editing A while a CI build runs against B). For sequential A/B testing, branches are simpler. One repo, two branches, two separate sessions executed in sequence. If the experiment ever grows to simultaneous runs, revisit worktrees.

---

## 3. The Experiment

### Variables

| Variable | Track A (With v0) | Track B (Without v0) |
|---|---|---|
| **Explore phase** | Claude Design | Claude Design *(same)* |
| **Component generation** | v0 Free first, Team burst if needed | shadcn CLI + 21st.dev Magic MCP + Claude Code direct |
| **Implementation** | Claude Code + handoff bundle | Claude Code + handoff bundle *(same)* |
| **QA** | Gemini Advanced | Gemini Advanced *(same)* |
| **Everything else** | Same Claude Code settings, same skills layer (Impeccable, awesome-design-md, Taste Skill) | *(same)* |

**Only one variable changes:** does v0 participate in component generation? Everything else is locked.

### Controls

- **Same 3 pages** targeted by both tracks. See §4.
- **Same time budget per track:** 3 hours hard cap (enforced by timer).
- **Same acceptance criteria** (below).
- **Same seed materials** handed to Claude Design in both tracks.
- **Clean branch from main** for each track — no inheriting half-done work.
- **Same iteration count cap:** maximum 2 QA rounds per page.

### Acceptance criteria (per page, both tracks must meet)

- [ ] Page loads without console errors
- [ ] Lighthouse Performance score ≥ 85
- [ ] Lighthouse Accessibility score ≥ 90
- [ ] Responsive at 375 / 768 / 1440 px
- [ ] Light + dark mode both correct
- [ ] No regressions in existing routes (test suite passes)
- [ ] Visible change vs current state (i.e. the "redesign" is noticeable)

### Success definition

Not "which track's page looks better" alone. We record:
1. **Quality** (3 blind ratings: self, one external person, Gemini comparing to shipped-app references)
2. **Speed** (total wall-clock per page)
3. **Cost** (credits + tool minutes)
4. **Cognitive load** (subjective rating of "how much did I have to think per decision")
5. **Iteration count** (prompts + QA rounds)

The lean path "wins" if it meets acceptance on all three pages, within 120% of Track A's time, with ≤15% quality delta. Any other outcome → Track A is the honest choice.

---

## 4. Pages Under Test

Pick three pages from conscia-fractional that represent different UI pattern families. These should *already exist* so there's a before/after.

### Confirm before starting:

1. **Landing hero** — marketing/above-the-fold pattern. Tests: brand expression, typography, conversion CTA.
2. **A list/grid page** — e.g. `contacts/`, `calendar/`, `deliverables/`, or `CRM/` landing. Tests: data density, card design, filter patterns.
3. **A form page** — e.g. a contact edit form or deliverable creator. Tests: input styling, validation UX, multi-step flows.

**To decide in §8 pre-flight:** Open conscia-fractional → spend 15 min picking the three pages based on what's most *broken* today, so the redesign has clear wins to measure.

---

## 5. Setup — Before Any Track Runs

All setup steps run from this session (GWTH v2), then we move.

### 5.1 Capture the baseline

1. Start conscia-fractional dev server (whatever `npm run dev` gives).
2. Screenshot each of the 3 chosen pages at 1440px + 375px, light + dark = **12 baseline screenshots**. Save to `C:\Projects\conscia-fractional\experiments\baseline\`.
3. Run Lighthouse on each page, save JSON to `baseline/lighthouse/`.
4. Record LOC per page (`wc -l` or VS Code line count).
5. Write `baseline/README.md` — one paragraph per page describing what's there today and what's weak about it.

### 5.2 Prepare Claude Design seed bundle

Both tracks feed Claude Design the **same inputs** — this is the control. Save to `experiments/claude-design-seed/`:

- `conscia-fractional/CLAUDE.md` (or AGENTS.md if that's what exists)
- Tailwind config + globals.css (all design tokens)
- 3-5 existing components that represent the brand voice today
- Current screenshots of the 3 pages (baseline)
- Written brief: `brief.md` — 2 paragraphs per page on *what should improve*

### 5.3 Create branches

```bash
cd /c/Projects/conscia-fractional
git checkout main && git pull
git checkout -b experiment/with-v0
git push -u origin experiment/with-v0
git checkout main
git checkout -b experiment/without-v0
git push -u origin experiment/without-v0
git checkout main
```

### 5.4 Create measurement log template

Create `C:\Projects\conscia-fractional\experiments\log-template.md`:

```markdown
# Track: <A-with-v0 | B-without-v0>
# Page: <hero | list | form>
# Started: <ISO timestamp>
# Ended: <ISO timestamp>
# Elapsed: <minutes>

## Phase 1 — Claude Design (explore)
- Prompt: <verbatim>
- Output: <screenshot path + bundle filename>
- Credits used: <approximate>
- Time: <minutes>
- Notes: <any friction>

## Phase 2 — Component generation
- Tool used: <v0 Free | v0 Team | 21st.dev Magic MCP | shadcn CLI | Claude Code direct>
- Prompt: <verbatim>
- Output: <code snippet or commit sha>
- Credits/cost: <$ or messages>
- Time: <minutes>
- Iterations: <count>

## Phase 3 — Claude Code implementation
- Prompt: <verbatim, include reference to bundle>
- Commit sha: <>
- Time: <minutes>
- Bugs encountered: <list>

## Phase 4 — Gemini QA
- Prompt: <verbatim>
- Fixes applied: <list>
- Time: <minutes>

## Final
- Lighthouse: perf=<>, a11y=<>, best=<>, seo=<>
- LOC delta: <+/- lines>
- Screenshot: <path>
- My rating /10: <>
- One-line summary: <>
```

### 5.5 Create lab capture folder in the pipeline

```bash
mkdir -p /c/Projects/1_gwthpipeline520/data/generated_lessons/labs/LAB_ai-design-ab/{prompts,screenshots,notes}
```

This is where all the lab raw material lands as the experiment runs.

---

## 6. Track A Execution (With v0)

**Session setup:** Close this session. Open a new Claude Code session in `C:\Projects\conscia-fractional` on branch `experiment/with-v0`. Claude will auto-load conscia-fractional's CLAUDE.md — that's the point.

**Session prompt to paste on open:**

```
I'm running design experiment Track A (WITH v0). The plan is at
C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md —
read §6 for my instructions. Starting timer now.
```

### Per-page loop (3 pages × same steps)

1. **Explore (Claude Design)** — 20-30 min
   - Open claude.ai/design
   - Drag in seed bundle from `experiments/claude-design-seed/`
   - Prompt with the brief.md excerpt for this page
   - Generate 2-3 variants, pick one
   - Export handoff bundle to `experiments/bundles/trackA-<page>.bundle`
   - Log in `experiments/trackA-<page>.log.md`

2. **Component generation (v0 Free → Team)** — 20-40 min
   - Open v0.app, paste component spec from the bundle
   - Generate shadcn component; iterate up to 3 msgs
   - If locked out and genuinely needed → upgrade to v0 Team ($30), record exact time of upgrade
   - Copy TSX into a sandbox file in `experiments/sandbox/`
   - Log

3. **Implementation (Claude Code)** — 30-60 min
   - Instruct Claude Code: "Using the handoff bundle at <path> and the v0 component at <path>, replace the current <page> implementation. Match existing module conventions in conscia-fractional."
   - Commit on `experiment/with-v0`
   - Log

4. **QA (Gemini)** — 10-20 min
   - Screenshot implemented page
   - Paste into Gemini Advanced with the Claude Design mock
   - Ask for specific diffs
   - Apply up to 2 rounds
   - Log

5. **Measure and close page**
   - Run Lighthouse
   - Fill in `log-template.md` completely
   - Screenshot final state

**Hard stop at 3 hours total for the track.** Whatever's not done is not done — that's honest data.

---

## 7. Track B Execution (Without v0)

**New session.** Same repo, branch `experiment/without-v0`. Identical prompt to Track A but with "WITHOUT v0" in place of "WITH v0" and §7 for instructions.

### Per-page loop (3 pages × same steps)

1. **Explore (Claude Design)** — same as Track A. Use the same seed bundle.

2. **Component generation (no v0)** — 20-40 min
   - **First attempt:** Try `npx shadcn add <component>` if it's a standard pattern
   - **Second attempt:** `/ui <component description>` via 21st.dev Magic MCP inside Claude Code
   - **Third attempt:** Let Claude Code generate from scratch using shadcn docs (`@shadcn/ui` referenced in context) + the handoff bundle
   - Log which path each component took and why

3. **Implementation (Claude Code)** — 30-60 min
   - Same pattern as Track A but without a v0-generated starting point
   - Claude Code assembles component from 21st.dev / shadcn pieces + bundle instructions
   - Commit on `experiment/without-v0`

4. **QA (Gemini)** — same as Track A.

5. **Measure and close** — same as Track A.

### Critical rule

If Track B hits a wall on a complex component (e.g. the form validation UX turns into spaghetti) — **do not upgrade v0 mid-experiment**. Note the failure honestly in the log: "This component was not reproducible without v0 in the time budget." That's a real finding.

---

## 8. Synthesis Session

**New session, back in GWTH v2** (`C:\Projects\GWTH_V2`).

**Inputs:**
- 6 completed log files (3 pages × 2 tracks)
- 24+ screenshots (before + both tracks' after + dark modes)
- 2 git branches with 3 commits each
- Gemini's diff reports

### Deliverables

1. **Comparison table** — per-page, per-phase: time, cost, iterations, Lighthouse, LOC, my rating
2. **Side-by-side gallery** — screenshot pairs at 1440 + 375 × light + dark
3. **Cost rollup** — total $ and minutes for each track
4. **Honest verdict** — either (a) lean path holds, promote to GWTH v2 redesign baseline, or (b) v0 justified its cost, revise the research
5. **Research file update** — append §12 "A/B Experiment Results" to [RESEARCH_2026-04-15_ai-design-workflow.md](./RESEARCH_2026-04-15_ai-design-workflow.md) with concrete numbers
6. **Blind quality rating** — send Gemini the 6 final screenshots unlabelled, ask "rate these 1-10 on visual hierarchy, brand consistency, modernity." This is the least-biased quality measure we have.

### Checking my own bias

I wrote the lean-path recommendation. The synthesis must be executed with the same discipline as the tracks — **don't let me move the acceptance criteria post-hoc**. If Track B fails to meet any of §3's criteria on any page, that's a Track B failure and the report says so.

---

## 9. Lab Content Production

**Output path:** `C:\Projects\1_gwthpipeline520\data\generated_lessons\labs\LAB_ai-design-ab\`

Following the existing `LAB_local-whisper` template structure.

### 9.1 Generate `lab.md`

YAML frontmatter:

```yaml
---
title: "AI Design Showdown — Does the $30 Tool Still Win in 2026?"
duration: "60 minutes read / 2 hours hands-on"
difficulty: "Intermediate"
outcome: "By the end of this lab, you will have run a real A/B test of two AI design workflows on a live project, and learned a framework for evaluating AI tools against each other without vendor bias."
tools: ["Claude Code", "Claude Design", "v0.app (free + paid)", "21st.dev Magic MCP", "Gemini Advanced", "Lighthouse"]
related_lesson: ""
tags: ["ai-design", "tool-evaluation", "ab-testing", "workflow", "shadcn", "nextjs"]
---
```

Body sections (written from the artefacts):

1. **Why this matters** — the $20 vs $50 decision most people get wrong
2. **The setup** — how to structure a fair A/B test of AI tools (transferable skill)
3. **The candidate workflows** — what Track A and Track B looked like, with a visual
4. **What actually happened — Page 1 (hero)** — real prompts, real screenshots, real times
5. **What actually happened — Page 2 (list)**
6. **What actually happened — Page 3 (form)**
7. **The numbers** — cost, time, quality table
8. **The call** — which workflow won, for which situations
9. **Your turn** — a mini-exercise the student can run on their own project

### 9.2 Generate `voiceover.txt`

A narration script suitable for a 6-8 minute explainer video. Uses the hero + payoff + numbers + call-to-action arc common to GWTH labs. Draws verbatim from the most quotable moments in the per-page logs.

### 9.3 Generate `image_prompts.json`

~10-15 image generation prompts for Stable Diffusion / Flux / etc., covering:
- Hero image (two workflows converging)
- Tool comparison (side-by-side stylised UI)
- The "aha moment" (when one track hit a wall)
- Cost breakdown (stylised chart)
- Final verdict card

Match the style used in other GWTH labs (check `gwth-video-style-guide.md` in the pipeline's `docs/` folder).

### 9.4 Hand off to pipeline

The pipeline's existing ingestion picks up `data/generated_lessons/labs/LAB_<slug>/` and produces:
- Video (Remotion)
- Image generations (Recraft / whatever the current pipeline uses)
- Lesson cards for the course site

No custom pipeline work required — we're following the existing template.

---

## 10. Timeline

| When | What | Duration | Session |
|---|---|---|---|
| Day 1 AM | Setup (§5) — capture baseline, prep seed, branch, folders | 1-1.5h | Here (GWTH v2) |
| Day 1 PM | **Track A** — all 3 pages | 3h hard cap | conscia-fractional (new session) |
| Day 2 AM | **Track B** — all 3 pages | 3h hard cap | conscia-fractional (new session) |
| Day 2 PM | Synthesis (§8) | 1.5-2h | GWTH v2 (new session) |
| Day 3 | Lab production (§9) | 2-3h | Pipeline project (new session) |

**Total: ~10-14h of work spread across 3 days.** Day boundaries are soft — each phase can flex, but Tracks A and B must each start from a fresh session.

### Budget estimate

- Claude Design: included in Pro/Max (possible quota lockout during Track A or B — flag in log if it happens)
- v0 Free: $0
- v0 Team (if escalated during Track A): $30 (cancellable after sprint)
- Gemini Advanced: already subscribed
- **Worst case: $30 one-off to v0** if Track A needs a burst. Everything else sunk.

---

## 11. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Claude Design quota lockout mid-track | High (especially on Pro) | Book explore sessions at the start of the quota week. If locked out, fall back to Stitch and log the switch as a finding. |
| Track A time runs short, Track B already done → tempted to give A "just one more round" | Medium | Strict 3-hour cap enforced by timer. Whatever's incomplete is data. |
| My bias toward lean path colours synthesis | Medium-high | Blind Gemini rating step (§8 item 6). Let the numbers talk. |
| One of the 3 pages turns out to be wildly harder than others → skews the comparison | Medium | Pick pages during pre-flight (§5) with similar complexity. If a page blows up, note it and continue. |
| Conscia-fractional has pending work on main | Low | Check `git status` on main before branching. If dirty, stash first. |
| The lab content writeup takes longer than expected | Medium | Set a timer on §9.1-9.3 separately. If the pipeline hand-off is blocked, ship lab.md alone first and iterate. |
| I inadvertently reuse track-A components during track B because they're in my short-term memory | High if same day | Separate sessions is the fix. If possible, overnight gap between the two tracks. |

---

## 12. Pre-Flight Checklist (run before §5.1)

- [ ] Verify Claude Design still accessible (not fully locked out) on current Claude plan
- [ ] Verify v0.app free tier account exists and email is confirmed
- [ ] Verify 21st.dev Magic MCP is installed in Claude Code settings
- [ ] Verify Gemini Advanced subscription active
- [ ] Pick the 3 pages (hero + list + form) — write them into §4 above before starting
- [ ] Confirm `conscia-fractional` main branch is clean (`git status` empty)
- [ ] Confirm Supabase (`fractionalbuddy` project) is running — design work touches live routes
- [ ] Set up a 3-hour timer (phone, physical, whatever)
- [ ] Decide: start Track A morning or evening of Day 1?
- [ ] Create the `experiments/` folder in conscia-fractional and add to `.gitignore` the parts that shouldn't be committed (screenshots yes, raw v0 sandbox code no)

---

## 13. Open Questions to Resolve Before Starting

1. **Are you on Claude Pro or Max?** Affects Claude Design quota comfort. If Pro and you're worried about lockout, consider upgrading to Max just for the experiment month (cancellable).
2. **Do you have a Gemini Advanced subscription active right now?** The plan assumes yes.
3. **Is 3 pages × 2 tracks realistic for a solo builder?** 6 hours of execution + setup + synthesis + lab is a big chunk. If tight, consider 2 pages instead of 3 (hero + form, skip list). Losing the list page means losing the "data density" pattern finding — acceptable trade.
4. **Who is the external blind rater?** Ideally a designer friend who hasn't seen any of this. If not available, skip that measurement and note the gap.
5. **Do you want a time-lapse screen recording of each track?** Cheap to set up (OBS), enormous value for the lab video. Recommend yes.

---

## Appendix A — Exact commands for branch setup

```bash
cd /c/Projects/conscia-fractional
git status                              # must be clean
git checkout main && git pull
git checkout -b experiment/with-v0
git push -u origin experiment/with-v0
git checkout main
git checkout -b experiment/without-v0
git push -u origin experiment/without-v0
git checkout main                       # back to clean main
mkdir -p experiments/{baseline,bundles,sandbox,logs}
echo "experiments/sandbox/" >> .gitignore   # don't commit raw v0 scratch
git add .gitignore && git commit -m "chore: add experiments/ scaffolding"
```

## Appendix B — Exact session-open prompts

**Track A session open:**
> I'm running design experiment Track A (WITH v0) against branch `experiment/with-v0` on this repo. The full plan is at `C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md`. Load §6 as my instructions. Confirm the branch, create today's log directory, and wait for my go signal before touching any code.

**Track B session open:**
> I'm running design experiment Track B (WITHOUT v0) against branch `experiment/without-v0` on this repo. The full plan is at `C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md`. Load §7 as my instructions. Do NOT reference the with-v0 branch or any Track A artefacts. Confirm the branch, create today's log directory, wait for go.

**Synthesis session open:**
> Experiment complete. Both branches exist on conscia-fractional. All logs in `C:\Projects\conscia-fractional\experiments\logs\`. All screenshots in `experiments/trackA|B/screenshots/`. Load §8 of `PLAN_2026-04-18_ai-design-workflow-experiment.md` and execute the synthesis.

**Lab production session open:**
> Synthesis complete (results at `C:\Projects\GWTH_V2\kanban\1_planning\RESEARCH_2026-04-15_ai-design-workflow.md` §12). Load §9 of `PLAN_2026-04-18_ai-design-workflow-experiment.md` and produce the lab under `C:\Projects\1_gwthpipeline520\data\generated_lessons\labs\LAB_ai-design-ab\`.

---

## Review Checklist — 2026-04-18 16:30
- [ ] Scope is correctly bounded (not too broad, not too narrow)
- [ ] Technical approach matches each project's stack and conventions
- [ ] Files affected list is complete and accurate (no hidden cross-project changes)
- [ ] Acceptance criteria are specific and testable
- [ ] Session architecture actually prevents context contamination
- [ ] 3-hour hard cap per track is realistic
- [ ] Lab output format matches existing `LAB_local-whisper` template
- [ ] Pre-flight checklist covers everything needed before execution
- [ ] Bias-checking step exists in synthesis (blind Gemini rating)
- [ ] Risks section actually addresses the most likely failure modes

**Review this plan:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-04-18_ai-design-workflow-experiment.md`
