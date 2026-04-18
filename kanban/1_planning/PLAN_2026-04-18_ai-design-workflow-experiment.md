# PLAN — AI Design Workflow A/B Experiment (FractionalBuddy)

**Date:** 2026-04-18 (amended evening same day — see §0 changelog)
**Author:** David + Claude
**Budget:** ~14-20 hours total (revised — see §0)
**Related:** [RESEARCH_2026-04-15_ai-design-workflow.md](./RESEARCH_2026-04-15_ai-design-workflow.md), [RESEARCH_2026-04-16_claude-code-design-skills.md](./RESEARCH_2026-04-16_claude-code-design-skills.md)

---

## 0. Amendment Log

### 2026-04-18 (late evening) — Repo + page-swap decisions locked

- **Repo (Q6 resolved):** The commercial fractionalbuddy.com is a **new repo forked from the conscia-fractional MVP** — not a route group added to the MVP. The local MVP stays private; the commercial site lives separately. Working name: `fractionalbuddy-site`. New §5.0 added below with the fork procedure.
- **Pricing swapped in for Timesheet (Q7 resolved):** Pages under test are now **Homepage (greenfield) + Dashboard (redesign) + Pricing (greenfield)**. This shifts the balance to 2 greenfield + 1 redesign — more brand-expressive work, more conversion-pattern learning, which is a better fit for evaluating AI design tools on a new commercial launch. §4.3 rewritten.
- Supabase note: the experiment is pure design — no live Supabase needed during the A/B tracks. When the commercial site ships for real (post-experiment), it'll need its own Supabase project separate from `fractionalbuddy` (MVP).

### 2026-04-18 (evening) — Scope widened from "redesign" to "greenfield + redesign"

David's decision: turn FractionalBuddy into the **commercial product at fractionalbuddy.com** (Namecheap domain). The experiment now exercises a broader workflow than pure redesign — it also validates the greenfield marketing case.

**Changes vs morning version:**
- **Pages under test changed** (§4):
  - ~~Landing hero, a list page, a form page~~ (redesigns of existing app pages)
  - New set: **(1) Marketing homepage (NEW, greenfield) + (2) Dashboard (redesign of current app UI) + (3) Timesheet (redesign of current app UI)**
- **Light + dark theme captured for all 3 pages, both tracks** → 3 pages × 2 tracks × 2 themes = 12 final screenshots per phase
- **Logo + favicon added as shared Phase 0** (§14) — produced once, used by both tracks so it's not an experiment variable
- **Time budget raised** from 3h → 4-5h per track (homepage is greenfield and harder)
- **New open question:** where does the fractionalbuddy.com marketing homepage code live? (§13 Q6)
- **All 5 questions from §13 answered:** Claude **Max** ✓, Gemini Advanced will be turned on ✓, 3 pages feasible ✓, blind rater available ✓, **Camtasia** for recording ✓

The original thinking on session architecture (§2), variables/controls (§3), synthesis framework (§8), and pipeline hand-off (§9) is unchanged — the scope change stretches the work but not the methodology.

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

## 4. Pages Under Test (revised 2026-04-18 evening)

Three pages, each captured in **light + dark** theme, each implemented by both tracks.

### 4.1 Marketing homepage — GREENFIELD (fractionalbuddy.com)

- **Status:** Does not exist. Both tracks design and build from scratch.
- **Purpose:** Sell FractionalBuddy as a SaaS to fractional consultants (solution architects, fractional CTOs, fractional CMOs). Competitors to bench against: Harvest, Toggl, Clockify, Reclaim.
- **Must contain:** hero (logo + H1 + sub + primary CTA), 3-feature section, product screenshot, pricing teaser, email capture / sign-up CTA, footer.
- **Tests:** brand voice creation from nothing, typography system, conversion hierarchy, cross-theme consistency.
- **Why this page is the hardest of the three:** No baseline, no existing design tokens yet (FractionalBuddy's current UI is app-only, dark-only). Both tracks start truly cold except for the shared brand kit from §14.

### 4.2 Dashboard — REDESIGN

- **Status:** Exists, dark theme only. Baseline screenshot: `C:\Projects\GWTH_V2\screenshots\March\2026-04-18_192239.jpg`.
- **Current pattern:** Left sidebar nav, 3-col widget grid (Hours This Week, Engagement card, Quick Actions, Active Tasks, Recent Meetings, Recent Activity, Upcoming Events), bottom-right timer.
- **What it does well today:** Information density, teal-on-dark palette, timer affordance.
- **What to improve:** Add a light theme, modernise the widget hierarchy (primary metric deserves more weight), simpler visual grammar at small breakpoints.
- **Tests:** dashboard design language, data visualisation, multi-theme discipline, responsive density.

### 4.3 Pricing — GREENFIELD

- **Status:** Does not exist. Both tracks design and build from scratch.
- **Purpose:** Convert marketing-site visitors into paid signups. Needs to communicate value, tiers, and a clear default choice.
- **Must contain:** headline + sub, 3-tier comparison table (Solo, Team, Consultancy — exact names TBD), feature matrix with row grouping, FAQ accordion, final CTA. Yearly/monthly toggle on prices.
- **Competitive benchmarks to study briefly:** Harvest pricing, Toggl pricing, Notion pricing, Linear pricing. Do **not** copy — study conversion patterns.
- **Tests:** conversion hierarchy, comparison-table UX (notoriously hard to do well), pricing psychology, cross-theme discipline for tabular content.
- **Why this is a better A/B probe than Timesheet was:** pricing pages stress the same visual-hierarchy muscles that the homepage does, but with very different patterns (grids + tables + conditional pricing). They also produce *directly commercial* learnings — the winning pricing design can ship.

### 4.4 Theme capture requirement (both tracks, all three pages)

For every final implementation, capture:
- Desktop 1440px × 900px — light + dark
- Mobile 375px × 800px — light + dark

**4 screenshots per page × 3 pages = 12 final screenshots per track × 2 tracks = 24 final screenshots for side-by-side comparison**, plus baseline captures for Dashboard only. These are the raw material for §8 synthesis and the §9 lab gallery.

### 4.5 What the pages don't test

Deliberately excluded to keep scope honest:
- Login / signup / auth (skipped — different concerns; build post-experiment)
- Timesheet (dropped in favour of Pricing — see §0 amendment log)
- Settings (skipped — low brand impact)

### 4.6 Scope balance

2 greenfield (Homepage, Pricing) + 1 redesign (Dashboard). This is intentionally greenfield-heavy — the hardest test of AI design tools is cold-starting a brand-consistent page from nothing.

---

## 5. Setup — Before Any Track Runs

All setup steps run from this session (GWTH v2), then we move. **Run §14 (Brand kit) BEFORE §5.1** so both tracks start with an agreed logo, favicon, and colour direction. **Run §5.0 first** to fork the MVP into the new commercial repo.

### 5.0 Fork the MVP into the commercial repo

The commercial `fractionalbuddy.com` is a new repo forked from `conscia-fractional` — not a route group added to the MVP. The local MVP stays private for Conscia's data; the commercial product is public.

Working name: **`fractionalbuddy-site`** at `C:\Projects\fractionalbuddy-site`. Rename freely before running.

**Fork procedure:**

```bash
# 1. Clone the MVP into a new local folder, then strip its git history
cd /c/Projects
cp -r conscia-fractional fractionalbuddy-site
cd fractionalbuddy-site
rm -rf .git
rm -f .env.local                         # keep .env.local.example, strip secrets
rm -rf node_modules .next playwright-report
rm -rf experiments/ 2>/dev/null          # no MVP-side experiments
rm -rf CRM contacts meetings deliverables calendar   # strip Conscia's private data folders if present

# 2. Scrub the README / package.json name / any hard-coded "Conscia" strings
sed -i 's/conscia-fractional/fractionalbuddy-site/g' package.json
# Manually review CLAUDE.md / AGENTS.md / README.md for private references

# 3. Re-init as a fresh repo
git init
git add .
git commit -m "chore: initial commit, forked from conscia-fractional MVP (2026-04-18)"

# 4. Create the GitHub repo and push
gh repo create David-ACG/fractionalbuddy-site --private --source=. --push
```

**Review checklist after fork (10 min):**
- [ ] No Conscia client names (LoveSac, Holt Renfrew, Jaguar Land Rover, Staples) in code, seeded data, or copy
- [ ] No MVP-specific private Supabase URL / keys in any committed file
- [ ] README.md rewritten for the commercial product (tagline only, full copy comes from Phase 0 brand brief)
- [ ] `package.json` name + `next.config.ts` metadata updated to FractionalBuddy
- [ ] `.gitignore` includes `experiments/sandbox/` and `experiments/recordings/` per §10

**Repeat all §5 setup from inside the new repo** — not from the MVP.

### 5.1 Capture the baseline (from the MVP, before fork work starts)

Run baseline capture from the **original `conscia-fractional` MVP** — it's the only place the current Dashboard/Timesheet designs live. Save outputs into the new `fractionalbuddy-site/experiments/baseline/` folder so they travel with the experiment.

1. Start conscia-fractional dev server (`npm run dev` from `C:\Projects\conscia-fractional`).
2. For **Dashboard** only (Pricing and Homepage don't exist in MVP):
   - Screenshot at 1440px + 375px = **2 baseline screenshots** (dark theme only, MVP has no light theme). Save to `C:\Projects\fractionalbuddy-site\experiments\baseline\`.
   - Run Lighthouse, save JSON to `baseline/lighthouse/dashboard.json`.
   - Record LOC for the dashboard route.
3. **Homepage** and **Pricing**: no baseline (both greenfield). Note explicitly in the log.
4. Write `experiments/baseline/README.md`:
   - **Dashboard** — what works today (information density, teal-on-dark, timer affordance), what's weak (dark-only, widget hierarchy can be clearer, mobile density).
   - **Homepage** — 1 paragraph positioning: "FractionalBuddy is time-tracking + client-relationship for fractional consultants — the segment Harvest/Toggl don't specialise in. Target user: solution architects, fractional CTOs/CMOs billing by the day or half-day."
   - **Pricing** — 1 paragraph on tiering philosophy: "Pricing page must make the middle tier the obvious default. Competitive anchors: Harvest ($12-14/user), Toggl ($10-20/user), Reclaim ($10/user). Probably 3 tiers with annual toggle. Exact numbers TBD during design."

### 5.2 Prepare Claude Design seed bundle

Both tracks feed Claude Design the **same inputs** — this is the control. Save to `experiments/claude-design-seed/`:

- `conscia-fractional/CLAUDE.md` (or AGENTS.md if that's what exists)
- Tailwind config + globals.css (all design tokens)
- 3-5 existing components that represent the brand voice today
- Current screenshots of the 3 pages (baseline)
- Written brief: `brief.md` — 2 paragraphs per page on *what should improve*

### 5.3 Create experiment branches in the new repo

Branches live in `fractionalbuddy-site` (created in §5.0), not the MVP.

```bash
cd /c/Projects/fractionalbuddy-site
git status                              # should be clean after §5.0
git checkout -b experiment/with-v0
git push -u origin experiment/with-v0
git checkout main
git checkout -b experiment/without-v0
git push -u origin experiment/without-v0
git checkout main                       # back to clean main
```

Route-group layout (applies to both branches):

```
src/app/
├── (marketing)/
│   ├── page.tsx              # Homepage — §4.1 target
│   ├── pricing/page.tsx      # Pricing — §4.3 target
│   ├── layout.tsx            # Public nav + footer
│   └── (future: login/, signup/, about/)
├── (app)/
│   ├── dashboard/page.tsx    # Dashboard — §4.2 target (redesigned from MVP)
│   └── layout.tsx            # Authed sidebar + header
└── layout.tsx                # Root (fonts, ThemeProvider, Toaster)
```

Both branches start from main which already has the forked MVP code. Each track commits all three redesigns to its own branch.

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

## 10. Timeline (revised for widened scope)

| When | What | Duration | Session |
|---|---|---|---|
| Day 1 AM | **Phase 0 — Brand kit** (§14): positioning → logo → favicon → palette → type | 2-3h | Here (GWTH v2) or conscia-fractional — one session, flexible |
| Day 1 PM | Setup (§5) — baselines, seed bundle, branches, log templates | 1-1.5h | Here (GWTH v2) |
| Day 2 | **Track A** — 3 pages × light+dark | 4-5h hard cap | conscia-fractional (NEW session) |
| Day 3 | **Track B** — 3 pages × light+dark | 4-5h hard cap | conscia-fractional (NEW session) |
| Day 4 AM | Synthesis (§8) — compare, blind rating, verdict | 2-3h | GWTH v2 (NEW session) |
| Day 4 PM | Lab production (§9) — lab.md + voiceover.txt + image_prompts.json | 2-3h | Pipeline project (NEW session) |

**Total: ~15-20h of work spread across 4 days.** Phase 0 and Setup must complete before Track A starts. Tracks A and B each start from a fresh session.

**Camtasia recording note:** start recording at the top of each session, end at the bottom. Don't try to record across sessions — Claude sessions end cleanly, Camtasia files should match. Raw recordings go into `experiments/recordings/` (add to `.gitignore` — they're huge).

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

## 12. Pre-Flight Checklist (run before Phase 0)

### Accounts & tooling
- [ ] Verify Claude Design accessible on your **Max** plan
- [ ] Verify v0.app free tier account exists and email confirmed
- [ ] Verify 21st.dev Magic MCP is installed in Claude Code settings
- [ ] Verify **Recraft** access (already in `C:\Projects\GWTH_V2\recraft`)
- [ ] **Gemini Advanced**: not active yet — enable on morning of Track A (Day 2)
- [ ] **Camtasia**: confirm installed + working mic/display capture

### Project prep
- [ ] Confirm `conscia-fractional` main branch is clean (`git status` empty) — baseline capture in §5.1 reads from this
- [ ] Confirm target repo name **`fractionalbuddy-site`** (change in §5.0 if different)
- [ ] Confirm GitHub CLI (`gh`) is authed to `David-ACG`
- [ ] Check `fractionalbuddy.com` is registered and available (Namecheap)
- [ ] Set up a 4-5 hour timer per track day

### Content prep
- [ ] Pages locked: **Homepage + Dashboard + Pricing** (confirmed)
- [ ] Identify the blind rater and book their 30-minute slot post-Track B
- [ ] Decide: start Phase 0 (brand kit) Day 1 AM or afternoon?

### Safety
- [ ] Review the fork checklist in §5.0 — no Conscia client names, no private Supabase keys, no MVP-specific private folders carry into the commercial repo

---

## 13. Open Questions — Status (answered 2026-04-18 evening)

| # | Question | Answer |
|---|---|---|
| 1 | Claude Pro or Max? | ✅ **Max** — quota comfort confirmed for Claude Design. |
| 2 | Gemini Advanced active? | ✅ Not currently — David will **enable on demand** during §6 QA / §7 QA / §8 synthesis. |
| 3 | 3 pages × 2 tracks feasible? | ✅ **Yes** — David confirms pages are simple; plan revised to reflect light+dark capture. |
| 4 | External blind rater available? | ✅ **Yes** — send the 6 unlabelled final screenshots at §8. |
| 5 | Screen-recording tool? | ✅ **Camtasia** (instead of OBS). |
| 6 | Where does fractionalbuddy.com homepage code live? | ✅ **New forked repo** `fractionalbuddy-site` (not a route group in the MVP). Procedure in §5.0. |
| 7 | Confirm final page list | ✅ **Homepage + Dashboard + Pricing** (Timesheet dropped, Pricing added). §4 rewritten. |

---

## 14. Phase 0 — Brand Kit (logo, favicon, palette, type)

> **Runs ONCE before both tracks.** Shared output — not an experiment variable. This isolates v0's role to component generation, not brand design.

### 14.1 Why isolate this from the A/B test

Logos and core colour palette are judged differently from UI components (more subjective, fewer tool-specific techniques, small number of iterations). Including them in the A/B test would add noise without generating useful A/B findings — both tracks would likely produce similar results because both would use the same underlying tools (Claude Design for concepts, Recraft for vectors, neither uses v0 for logos).

Doing brand once upfront means:
- Both tracks start with the same logo, favicon, and palette
- The homepage, dashboard, and timesheet all express the **same brand** in both tracks
- The experiment variable (v0 vs no-v0) stays clean

### 14.2 Deliverables

- **Logo** — primary mark (horizontal + stacked) + dark-mode variant. SVG + PNG at 512/256/128.
- **Favicon** — 32×32 ICO + 180×180 apple-touch-icon + 512×512 PNG (manifest). Derived from the logo.
- **Colour palette** — 6-8 OKLCH tokens covering: primary, accent, neutral scale (bg/fg/card/border/muted), destructive/success/warning, plus full light + dark mappings. Committed as `globals.css` variables.
- **Typography pairing** — one sans (headings + body), optionally one mono (for time/code blocks). Loaded via `next/font/google`.
- **Brand brief** — 1-pager written in plain English: who FractionalBuddy is for, the voice (confident / calm / practitioner-first), what we're not (not a productivity-porn tool, not a consulting-industry cliché).

### 14.3 Workflow for Phase 0 (cheapest path first)

1. **Positioning** (30 min, you + Claude Code in a new session) — nail the brand brief first. Without positioning, logo work is a random-walk.
2. **Claude Design — logo concepts** (30-45 min) — prompt it to produce 6-8 logo directions with the brand brief. Export the top 2-3 as reference images.
3. **Recraft — vector finalisation** (30-45 min) — recreate the chosen direction as clean vectors at primary/stacked/dark-mode variants. Recraft is already in your toolkit (`C:\Projects\GWTH_V2\recraft`).
4. **Favicon generation** (15 min) — use [realfavicongenerator.net](https://realfavicongenerator.net/) from the 512×512 PNG. Produces the full icon set + `site.webmanifest`.
5. **Palette build** (30 min) — pull the logo's two dominant hues into OKLCH tokens, build the full semantic palette in `globals.css`. Generate light + dark mappings. Use the existing GWTH OKLCH tokens file as a template.
6. **Commit the brand kit** to `main` of `conscia-fractional` (or the new site repo, if Option B in §5.3). Both experiment branches inherit it.

### 14.4 Time budget for Phase 0

**2-3 hours total.** This is before the A/B tracks run. Do it in a single sitting to keep the brand voice coherent.

### 14.5 What the brand kit is NOT

- Not a full style guide (that can wait)
- Not illustrations / marketing imagery (those are per-page, per-track)
- Not motion specs (handled in-component by Motion/Framer)

If Phase 0 takes more than 3 hours, stop and ship what you have — the experiment is more important than perfecting the logo.

---

## Appendix A — Exact commands for branch setup (after §5.0 fork + §14 brand kit)

```bash
cd /c/Projects/fractionalbuddy-site
git status                              # must be clean
git checkout -b experiment/with-v0
git push -u origin experiment/with-v0
git checkout main
git checkout -b experiment/without-v0
git push -u origin experiment/without-v0
git checkout main                       # back to clean main
mkdir -p experiments/{baseline,bundles,sandbox,logs,recordings}
cat >> .gitignore <<'EOF'
experiments/sandbox/
experiments/recordings/
EOF
git add .gitignore && git commit -m "chore: add experiments/ scaffolding"
git push
```

## Appendix B — Exact session-open prompts

**Track A session open:**
> I'm running design experiment Track A (WITH v0) against branch `experiment/with-v0` in the `fractionalbuddy-site` repo. The full plan is at `C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md`. Load §6 as my instructions. Confirm the branch, create today's log directory, and wait for my go signal before touching any code.

**Track B session open:**
> I'm running design experiment Track B (WITHOUT v0) against branch `experiment/without-v0` in the `fractionalbuddy-site` repo. The full plan is at `C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md`. Load §7 as my instructions. Do NOT reference the with-v0 branch or any Track A artefacts. Confirm the branch, create today's log directory, wait for go.

**Synthesis session open:**
> Experiment complete. Both branches exist on `fractionalbuddy-site`. All logs in `C:\Projects\fractionalbuddy-site\experiments\logs\`. All screenshots in `experiments/trackA|B/screenshots/`. Load §8 of `PLAN_2026-04-18_ai-design-workflow-experiment.md` and execute the synthesis.

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
