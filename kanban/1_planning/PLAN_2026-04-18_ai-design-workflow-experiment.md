# PLAN — AI Design Workflow 3-Way Shootout (FractionalBuddy)

**Date:** 2026-04-18 (amended 2026-04-19 to 3-way — see §0 changelog)
**Author:** David + Claude
**Budget:** ~18-24 hours total across 5 days (revised for 3-way)
**Related:** [RESEARCH_2026-04-15_ai-design-workflow.md](./RESEARCH_2026-04-15_ai-design-workflow.md), [RESEARCH_2026-04-16_claude-code-design-skills.md](./RESEARCH_2026-04-16_claude-code-design-skills.md)

---

## 0. Amendment Log

### 2026-04-19 — Experiment changed from 2-way to 3-way head-to-head

David's call. The earlier 2-way test answered a narrow question (does v0 earn its keep when Claude Design exists?). The new 3-way answers the broader question: **which of these three AI design tools is the best *lead* for a Next.js 16 + Tailwind v4 + shadcn/ui build?**

Three tracks, each uses a different AI design tool as the primary explore + mock + handoff source. All three use identical Claude Code + Gemini + shadcn CLI downstream.

| Track | Lead AI tool | What this tool does for us |
|---|---|---|
| **A** | **Claude Design** | Explore + codebase ingestion + handoff bundle |
| **B** | **v0** | Explore + component generation in shadcn TSX directly |
| **C** | **Google Stitch** | Explore + multi-screen mockups + Tailwind export |

All three converge into the same Claude Code implementation + Gemini QA pipeline. The variable is **which tool drives the design-generation step**, not v0-free-vs-paid.

**Changes vs yesterday's 2-way plan:**
- §3 Variables rewritten for 3 tracks
- §6 Track A (was "with v0") now "Claude Design lead" — adjusted methodology
- §7 Track B (was "without v0") now "v0 lead" — v0 does BOTH explore and component in this track
- §8 NEW — Track C (Google Stitch lead)
- §10 Timeline grows by one day (3 tracks not 2); total effort rises from ~15-20h to ~18-24h
- §11 Risks — added Stitch-specific risks (no codebase ingestion, Figma export adds a step)
- §12 Pre-flight — added Stitch account check
- Appendix B — added Track C session prompt

**Brand kit (§14) still runs ONCE before all three tracks.** Page list (§4) unchanged: Homepage + Dashboard + Pricing.

**What's lost from the 2-way design:** we no longer get a direct answer on "v0 Free sufficient vs v0 Team required" — that's now a sub-question to explore during Track B. If v0 Free hits rate limits, I log it and upgrade for the track.

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

The original thinking on session architecture (§2) is unchanged (just extended to a third track). Synthesis framework is now §9 and pipeline hand-off is §10.

---

## 1. Purpose & Hypothesis

**Purpose.** Before committing to a design workflow for the GWTH v2 redesign, run a controlled 3-way head-to-head on a lower-stakes commercial build — **fractionalbuddy.com** (forked from the `conscia-fractional` MVP into `fractionalbuddy-site`) — to empirically determine which of **Claude Design, v0, or Google Stitch** is the best lead AI design tool for a Next.js 16 + Tailwind v4 + shadcn/ui project.

**Hypothesis.** Claude Design wins on brand consistency (codebase ingestion), v0 wins on component-level output quality, Stitch wins on speed/cost. The *overall* winner depends on whether brand-fit, code-quality, or speed matters most for your build stage. If any tool wins on all three axes, that's a surprise we should know.

**Secondary purpose.** Capture every artefact (prompts, screenshots, time, credits, diffs, decisions) so the experiment becomes a GWTH Lab — students see a real 3-way head-to-head tool evaluation, not a sales pitch.

---

## 2. Session Architecture — Where Each Step Happens

> **This is the question you asked me to think hard about.** Here's the answer with reasoning.

### Recommendation: six separate sessions across three projects

| # | Session | Working dir | Why separate session |
|---|---|---|---|
| 1 | **Planning** (this one) | `C:\Projects\GWTH_V2` | Research + plan + Excalidraw live here. |
| 2 | **Phase 0 — Brand kit** | `C:\Projects\fractionalbuddy-site` (main) | Fresh session on the new repo so Claude Code loads its new CLAUDE.md. |
| 3 | **Track A — Claude Design lead** | `C:\Projects\fractionalbuddy-site` (branch `experiment/track-a-claude-design`) | Fresh session prevents Track B/C context leaking in. |
| 4 | **Track B — v0 lead** | `C:\Projects\fractionalbuddy-site` (branch `experiment/track-b-v0`) | Different session from Track A. |
| 5 | **Track C — Google Stitch lead** | `C:\Projects\fractionalbuddy-site` (branch `experiment/track-c-stitch`) | Different session from Tracks A + B. |
| 6 | **Synthesis + Lab production** | `C:\Projects\GWTH_V2` then `C:\Projects\1_gwthpipeline520` | Compare 3 tracks → write lab.md → hand off to pipeline. |

### Why not one session running all three tracks?

Three reasons, in order of importance:

1. **Context contamination is the killer.** If I see Track A's output while running Track B or C, the later tracks unconsciously mimic component shapes, naming, and layout choices. The whole experiment becomes worthless — you'd be measuring my short-term memory, not the tools.
2. **Fresh CLAUDE.md loading.** fractionalbuddy-site's CLAUDE.md + brand kit context loads cleanly in a new session; a reused session has those deep in compacted history where they lose attention weight.
3. **Time budget honesty.** Each track needs its own clock. Shared session = shared context = polluted timing.

### Why not run it entirely inside the pipeline project?

The pipeline is a **content ingestion system**, not a design workspace. It consumes finished experiment artefacts and produces lab.md + voiceover.txt + image_prompts.json. Running design work inside it would tangle the pipeline's own codebase with experimental design commits. Keep them separate.

### Why not run it from GWTH v2 (this project)?

Because Claude Code auto-loads the working directory's CLAUDE.md. Running fractionalbuddy-site work from GWTH v2 means either (a) losing fractionalbuddy-site's project context, or (b) constantly reminding Claude which project is which. Use the right working dir for the right job.

### Why branches, not git worktrees?

Worktrees make sense when you need *parallel* work. For sequential 3-way testing, branches are simpler. One repo, three branches, three separate sessions executed on separate days. If the experiment ever grows to simultaneous runs, revisit worktrees.

---

## 3. The Experiment (3-way)

### Variables

| Variable | Track A — Claude Design | Track B — v0 | Track C — Google Stitch |
|---|---|---|---|
| **Lead design tool** | Claude Design (claude.ai/design) | v0.app (Free; upgrade Team if rate-limited) | stitch.withgoogle.com (free) |
| **What it does for us** | Explore + ingest `globals.css`/components → interactive HTML → handoff bundle | Explore + generate shadcn TSX in web UI | Explore + multi-screen mockup + Figma/Tailwind export |
| **How Claude Code consumes it** | Bundle file + reference images | v0 TSX pasted into sandbox, then adapted | Screenshots + exported Tailwind code |
| **Allowed shared tools** (all 3 tracks) | shadcn CLI, 21st.dev Magic MCP, Claude Code's built-in generation, Impeccable + Taste Skill + awesome-design-md | *(same)* | *(same)* |
| **Implementation** | Claude Code | Claude Code | Claude Code |
| **QA** | Gemini Advanced (enable on demand) | Gemini Advanced | Gemini Advanced |

**The experimental variable is which tool *leads*.** The downstream implementation + QA is identical across all three so we're measuring the lead tool's contribution, not Claude Code's or Gemini's.

### Controls (same for all three tracks)

- **Same 3 pages** (§4): Homepage (greenfield), Dashboard (redesign), Pricing (greenfield)
- **Same seed materials** — brand kit from Phase 0 + baseline Dashboard screenshot + 1-para positioning brief
- **Same 4-5 hour hard cap** per track
- **Same acceptance criteria** (below)
- **Clean branch** per track — all three start from `main` (which has the Phase 0 brand kit)
- **Same iteration count cap:** max 2 Gemini QA rounds per page
- **No cross-track peeking** — each track runs in its own fresh session

### What each lead tool is *good at*, per its design

To make the test fair, know what each tool is meant to do before we judge it:

- **Claude Design** — best at ingesting a codebase/design system and producing on-brand, interactive HTML prototypes. Weakness: weekly quota, no direct TSX output (handoff bundle is instructions).
- **v0** — best at generating production-ready shadcn TSX from a description or screenshot. Weakness: component-scoped, less good at full-page exploration; costs credits per msg on Pro plans.
- **Google Stitch** — best at multi-screen exploration on an infinite canvas, great for showing full user flows. Weakness: can't ingest your codebase, output is generic, Tailwind export is a starting point not production-ready.

Expect each tool to shine on different pages. Part of the learning is *which pages each tool handles best*, not just "which tool is best overall."

### Acceptance criteria (per page, all three tracks must meet)

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

Three pages, each captured in **light + dark** theme, each implemented by all three tracks.

### 4.1 Marketing homepage — GREENFIELD (fractionalbuddy.com)

- **Status:** Does not exist. Both tracks design and build from scratch.
- **Purpose:** Sell FractionalBuddy as a SaaS to fractional consultants (solution architects, fractional CTOs, fractional CMOs). Competitors to bench against: Harvest, Toggl, Clockify, Reclaim.
- **Must contain:** hero (logo + H1 + sub + primary CTA), 3-feature section, product screenshot, pricing teaser, email capture / sign-up CTA, footer.
- **Tests:** brand voice creation from nothing, typography system, conversion hierarchy, cross-theme consistency.
- **Why this page is the hardest of the three:** No baseline, no existing design tokens yet (FractionalBuddy's current UI is app-only, dark-only). All three tracks start truly cold except for the shared brand kit from §15.

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

### 4.4 Theme capture requirement (all three tracks, all three pages)

For every final implementation, capture:
- Desktop 1440px × 900px — light + dark
- Mobile 375px × 800px — light + dark

**4 screenshots per page × 3 pages = 12 final screenshots per track × 3 tracks = 36 final screenshots for side-by-side comparison**, plus baseline captures for Dashboard only. These are the raw material for §9 synthesis and the §10 lab gallery.

### 4.5 What the pages don't test

Deliberately excluded to keep scope honest:
- Login / signup / auth (skipped — different concerns; build post-experiment)
- Timesheet (dropped in favour of Pricing — see §0 amendment log)
- Settings (skipped — low brand impact)

### 4.6 Scope balance

2 greenfield (Homepage, Pricing) + 1 redesign (Dashboard). This is intentionally greenfield-heavy — the hardest test of AI design tools is cold-starting a brand-consistent page from nothing.

---

## 5. Setup — Before Any Track Runs

Setup runs across two sessions: §5.0 (fork) from the GWTH v2 session that planned this (completed 2026-04-18); §5.1 onwards + §15 Brand Kit runs from a fresh session in `fractionalbuddy-site`. All three tracks then start with the committed brand kit.

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
git status                              # should be clean after §5.0 + Phase 0 brand kit
git checkout -b experiment/track-a-claude-design
git push -u origin experiment/track-a-claude-design
git checkout main
git checkout -b experiment/track-b-v0
git push -u origin experiment/track-b-v0
git checkout main
git checkout -b experiment/track-c-stitch
git push -u origin experiment/track-c-stitch
git checkout main                       # back to clean main
```

Route-group layout (applies to all three branches):

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

All three branches start from main (with the forked MVP code + Phase 0 brand kit). Each track commits all three page builds to its own branch.

### 5.4 Create measurement log template

Create `C:\Projects\fractionalbuddy-site\experiments\log-template.md`:

```markdown
# Track: <A-claude-design | B-v0 | C-stitch>
# Page: <homepage | dashboard | pricing>
# Started: <ISO timestamp>
# Ended: <ISO timestamp>
# Elapsed: <minutes>

## Phase 1 — Lead tool (explore)
- Tool: <Claude Design | v0 | Stitch>
- Prompt: <verbatim>
- Output: <screenshot path + bundle/tsx/export filename>
- Credits / msgs / generations used: <approximate>
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
mkdir -p /c/Projects/1_gwthpipeline520/data/generated_lessons/labs/LAB_ai-design-3way/{prompts,screenshots,notes}
```

This is where all the lab raw material lands as the experiment runs.

---

## 6. Track A — Claude Design lead

**Session setup:** Close this session. Open a fresh Claude Code session in `C:\Projects\fractionalbuddy-site` on branch `experiment/track-a-claude-design`. The repo's brand kit (Phase 0) is already on `main`; this branch inherits it.

**Session prompt on open:**

```
Running design experiment Track A — CLAUDE DESIGN LEAD — against branch
experiment/track-a-claude-design in fractionalbuddy-site. Full plan at
C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md §6.
Do not reference other tracks' outputs. Starting timer now.
```

### Per-page loop (3 pages × same 4 phases)

1. **Explore (Claude Design)** — 25-35 min
   - Open claude.ai/design
   - Drag in the brand-kit seed: `public/logo.svg`, `src/app/globals.css`, CLAUDE.md, 2-3 representative components, baseline Dashboard screenshot
   - Prompt with the page-specific excerpt from `experiments/briefs/<page>.md`
   - Generate 2-3 interactive variants; pick one
   - Export the **handoff bundle** to `experiments/trackA/bundles/<page>.bundle`
   - Screenshot the picked mock → `experiments/trackA/mocks/<page>-light.png` and `<page>-dark.png`
   - Log prompts + credits + time in `experiments/trackA/logs/<page>.md`

2. **Component sourcing** — 15-25 min
   - Walk through the bundle's component list.
   - For each: prefer `npx shadcn add <component>` if standard; otherwise use 21st.dev Magic MCP (`/ui <desc>`) inside Claude Code.
   - Claude Design is NOT used for component TSX (it doesn't emit TSX — that's the point of the bundle).
   - Log which source each component came from.

3. **Implementation (Claude Code)** — 30-60 min
   - Instruct: "Implement `<page>` using the handoff bundle at `experiments/trackA/bundles/<page>.bundle`. Match fractionalbuddy-site conventions. Produce both light and dark theme from the bundle's token spec."
   - Commit on `experiment/track-a-claude-design`

4. **QA (Gemini)** — 10-20 min
   - Screenshot the implemented page (both themes)
   - Paste into Gemini Advanced alongside the Claude Design mock
   - Ask for specific, actionable diffs (spacing, hierarchy, colour, type)
   - Apply up to 2 rounds

5. **Measure & close page** — run Lighthouse, fill log template, capture final screenshots (1440 + 375, light + dark = 4 per page).

**Hard stop at 4-5 hours for the whole track.** Whatever's not done is data.

---

## 7. Track B — v0 lead

**Fresh session.** Same repo, branch `experiment/track-b-v0`.

**Session prompt on open:**

```
Running design experiment Track B — v0 LEAD — against branch
experiment/track-b-v0 in fractionalbuddy-site. Full plan at
C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md §7.
Do not reference Track A outputs. Starting timer now.
```

### Per-page loop (3 pages × same 4 phases)

1. **Explore + component generation (v0)** — 40-60 min
   - Open v0.app (Free tier first; upgrade Team mid-experiment if rate-limited — log the exact upgrade timestamp)
   - Share brand: paste `globals.css` tokens + upload logo + 2-3 reference components in the first message, establishing project context
   - For each page, prompt v0 to generate the full page (not just a component)
   - Iterate up to 5 msgs; pick the best
   - **Critical:** export the generated TSX to `experiments/trackB/sandbox/<page>.tsx`
   - Screenshot the v0 preview (both themes if v0 exposes a toggle, else just the shipped theme)
   - Log msgs used + credits consumed + time

2. **Component sourcing** — 5-15 min
   - v0 output usually includes shadcn components inline; extract what's reusable.
   - Anything v0 referenced as shadcn primitives that aren't in the repo → `npx shadcn add <component>`.
   - Log which components came directly from v0 vs from shadcn CLI.

3. **Implementation (Claude Code)** — 30-60 min
   - Instruct: "Adapt the v0 TSX at `experiments/trackB/sandbox/<page>.tsx` to fractionalbuddy-site's module conventions. Preserve the v0 design. Add both themes if v0 only produced one."
   - Commit on `experiment/track-b-v0`

4. **QA (Gemini)** — same as Track A (compare implementation to v0 mock this time, not to Claude Design mock)

5. **Measure & close** — same as Track A.

### Critical rule for Track B

If v0's page-level output is poor for full-page use (its sweet spot is components, not pages), **note the failure honestly** and then fall back to v0-per-component. Don't silently switch tools to save the track — that defeats the experiment.

---

## 8. Track C — Google Stitch lead

**Fresh session.** Same repo, branch `experiment/track-c-stitch`.

**Session prompt on open:**

```
Running design experiment Track C — GOOGLE STITCH LEAD — against branch
experiment/track-c-stitch in fractionalbuddy-site. Full plan at
C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md §8.
Do not reference Track A or B outputs. Starting timer now.
```

### Per-page loop (3 pages × same 4 phases)

1. **Explore (Stitch)** — 30-45 min
   - Open stitch.withgoogle.com
   - For each page, prompt Stitch with the brief + palette hex values from the Phase 0 brand kit (Stitch can't ingest your repo — you describe the brand in words)
   - Use multi-screen mode to cover all 3 pages in one canvas — one of Stitch's strengths
   - Generate 2-3 variants per page; pick one
   - **Export:** Screenshot + Tailwind code export → `experiments/trackC/exports/<page>.html` + `<page>.png`
   - Log prompts + generations used (Stitch has a generous monthly cap, probably non-binding)

2. **Component sourcing** — 15-25 min
   - Stitch's Tailwind export is generic HTML+utility classes — not shadcn. You need to translate.
   - For each component: prefer `npx shadcn add <component>` or 21st.dev Magic MCP to get shadcn primitives, then layer Stitch's layout on top.
   - Log which components mapped cleanly vs required invention.

3. **Implementation (Claude Code)** — 45-90 min (highest — translation step is the most work)
   - Instruct: "Translate the Stitch HTML at `experiments/trackC/exports/<page>.html` into a Next.js 16 page in fractionalbuddy-site. Use shadcn primitives. Match brand tokens from globals.css. Produce light + dark themes."
   - Commit on `experiment/track-c-stitch`

4. **QA (Gemini)** — compare implementation to Stitch mock.

5. **Measure & close** — same as other tracks.

### Critical rule for Track C

Stitch's weakness is **brand consistency** (no codebase ingestion). If the output feels generic/off-brand, do not compensate by hand-tuning in Claude Code — that would hide Stitch's real weakness. Honesty over aesthetics in the experiment. Fix-ups can come later.

---

## 9. Synthesis Session

**New session, back in GWTH v2** (`C:\Projects\GWTH_V2`).

**Inputs:**
- 9 completed log files (3 pages × 3 tracks)
- 36 final screenshots (3 pages × 3 tracks × 4 = desktop+mobile × light+dark)
- 3 git branches with 3 commits each
- Gemini's diff reports from each track

### Deliverables

1. **Comparison table** — per-page, per-track: time, cost, iterations, Lighthouse, LOC, my rating. 3 columns instead of 2.
2. **Side-by-side gallery** — 3-column screenshot grid (Track A | Track B | Track C) at 1440 + 375 × light + dark per page
3. **Cost rollup** — total $ and minutes for each of the 3 tracks; also per-tool totals (Claude Design credits, v0 msgs, Stitch generations)
4. **Honest verdict** — which track produced the best output, which was fastest, which was cheapest. Likely these are *different* tracks — the recommendation picks the winner on the axis you care about most.
5. **Per-page winner** — which tool won each page (Homepage, Dashboard, Pricing). Different tools may win different pages; that's a real finding.
6. **Research file update** — append a "3-Way Experiment Results" section to [RESEARCH_2026-04-15_ai-design-workflow.md](./RESEARCH_2026-04-15_ai-design-workflow.md) with concrete numbers and a revised stack recommendation.
7. **Blind quality rating** — send the blind rater + Gemini the 9 final homepage-light screenshots (or one representative page) unlabelled, ask "rank these 1-2-3 on visual hierarchy, brand consistency, modernity."

### Checking my own bias

The previous recommendation dropped Stitch and prioritised Claude Design + v0. If Track C (Stitch) wins on any axis, that's a falsification of my earlier advice — write it up faithfully, don't explain it away. The whole point of this experiment is to correct my opinion with data.

---

## 10. Lab Content Production

**Output path:** `C:\Projects\1_gwthpipeline520\data\generated_lessons\labs\LAB_ai-design-3way\`

Following the existing `LAB_local-whisper` template structure.

### 10.1 Generate `lab.md`

YAML frontmatter:

```yaml
---
title: "AI Design Showdown — Claude Design vs v0 vs Google Stitch"
duration: "75 minutes read / 3 hours hands-on"
difficulty: "Intermediate"
outcome: "By the end of this lab, you will have run a real 3-way head-to-head test of the leading AI design tools on a live project, and learned a framework for evaluating AI tools against each other without vendor bias."
tools: ["Claude Code", "Claude Design", "v0.app", "Google Stitch", "21st.dev Magic MCP", "Gemini Advanced", "Lighthouse"]
related_lesson: ""
tags: ["ai-design", "tool-evaluation", "head-to-head", "workflow", "shadcn", "nextjs", "claude-design", "v0", "stitch"]
---
```

Body sections (written from the artefacts):

1. **Why this matters** — three very different tools, all claiming to be the best. Only one way to know.
2. **The setup** — how to structure a fair 3-way test of AI tools (transferable skill: single-variable isolation, blind rating, time-boxed tracks)
3. **The three candidates** — one-paragraph each on Claude Design, v0, Stitch. What each claims. What each costs.
4. **What actually happened — Homepage** — 3 tracks side by side: real prompts, real screenshots, real times
5. **What actually happened — Dashboard**
6. **What actually happened — Pricing**
7. **The numbers** — cost, time, quality table (3 rows for tracks, 3 cols for pages + totals)
8. **The surprises** — what I expected vs what actually won. The moments my bias got corrected.
9. **The call** — which tool won overall, which tool won each page, and how to pick for *your* project
10. **Your turn** — a mini-exercise the student can run with two tools (not three, for time) on their own project

### 10.2 Generate `voiceover.txt`

A narration script for a 7-10 minute explainer video. Uses the "three rivals enter, one leaves" framing common to shootout content. Uses real quotes from the per-page logs (prompts verbatim make great B-roll moments).

### 10.3 Generate `image_prompts.json`

~12-18 image generation prompts for the pipeline's image stage, covering:
- Hero image (three tools as silhouetted competitors)
- Each tool's signature (stylised logo + UI snippet — one per tool)
- The three tracks side by side (triptych layout)
- The per-page winner callouts
- The surprise moment (when my earlier recommendation got contradicted)
- Cost breakdown (bar chart, three bars)
- Final verdict card with three rankings

Match the style used in other GWTH labs (check `gwth-video-style-guide.md` in the pipeline's `docs/` folder).

### 10.4 Hand off to pipeline

The pipeline's existing ingestion picks up `data/generated_lessons/labs/LAB_<slug>/` and produces:
- Video (Remotion)
- Image generations (Recraft / whatever the current pipeline uses)
- Lesson cards for the course site

No custom pipeline work required — we're following the existing template.

---

## 11. Timeline (revised for 3-way)

| When | What | Duration | Session |
|---|---|---|---|
| Day 1 AM | **Phase 0 — Brand kit** (§15): positioning → logo → favicon → palette → type | 2-3h | fractionalbuddy-site (NEW session) |
| Day 1 PM | Setup (§5) — baselines, seed bundle, branches, log templates | 1-1.5h | fractionalbuddy-site (can continue same session) |
| Day 2 | **Track A — Claude Design** — 3 pages × light+dark | 4-5h hard cap | fractionalbuddy-site (NEW session) |
| Day 3 | **Track B — v0** — 3 pages × light+dark | 4-5h hard cap | fractionalbuddy-site (NEW session) |
| Day 4 | **Track C — Stitch** — 3 pages × light+dark | 4-5h hard cap | fractionalbuddy-site (NEW session) |
| Day 5 AM | Synthesis (§9) — compare 3 tracks, blind rating, verdict | 2-3h | GWTH v2 (NEW session) |
| Day 5 PM | Lab production (§10) — lab.md + voiceover.txt + image_prompts.json | 2-3h | Pipeline project (NEW session) |

**Total: ~18-24h of work spread across 5 days.** Phase 0 and Setup must complete before Track A. Tracks A, B, C each start from a fresh session to prevent context contamination.

**Camtasia recording note:** start recording at the top of each session, end at the bottom. Raw recordings go into `experiments/recordings/` (gitignored — they're huge).

### Budget estimate

- Claude Design: included in your Max plan (quota should cover Track A comfortably on Max)
- v0 Free: $0 for Track B starting cost; upgrade to v0 Team ($30) if rate-limited mid-track — cancellable after the experiment
- Google Stitch: free (generous monthly cap on Google Labs beta)
- Gemini Advanced: $20 for the month — enable on demand starting Day 2
- **Worst case: $50 one-off** ($30 v0 Team + $20 Gemini). Everything else sunk cost on your existing Claude Max.

---

## 12. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Claude Design quota lockout mid-Track-A | Medium on Max | Claude Design is Track A's primary tool. If locked out, pause that page, return next quota period. Don't switch tools mid-track. |
| v0 Free rate limit hits mid-Track-B | High | Track B's primary tool is v0 — upgrade to Team ($30) once and keep going. Log the upgrade time and cost. |
| Stitch generates poorly for complex layouts (e.g. pricing comparison tables) | Medium | Let it fail, log honestly. The experiment is measuring this. Don't hand-fix in Claude Code to paper over Stitch's weakness. |
| Time pressure → tempted to give the struggling track "just one more round" | Medium | Strict 4-5h cap per track. Whatever's incomplete is data. |
| My bias toward the "Claude Design wins" recommendation colours synthesis | Medium-high | Blind rater + Gemini blind ratings (§9 item 7). Numbers over opinion. If Track B or C wins, write it that way. |
| One page is wildly harder than the others (e.g. Pricing's comparison table) → skews comparison | Medium | Pages already confirmed simple per David's assessment. If any page blows up in one track, note which and why — could be a tool-page-fit finding. |
| Tracks contaminate each other (I remember Track A choices while doing B or C) | High | Separate sessions enforce context reset. Schedule tracks on separate days where possible. |
| The lab content writeup takes longer than expected | Medium | Time-box §10.1-10.3. If pipeline hand-off blocks, ship lab.md alone first; iterate. |
| v0 or Claude Design changes pricing/quota mid-experiment (young tools) | Low-medium | Record pricing snapshots in the log at Day 1. Note any changes in the synthesis. |

---

## 13. Pre-Flight Checklist (run before Phase 0)

### Accounts & tooling
- [ ] Verify **Claude Design** accessible on your **Max** plan (Track A's primary tool)
- [ ] Verify **v0.app** free tier account exists and email confirmed (Track B's primary tool)
- [ ] Verify **Google Stitch** accessible at stitch.withgoogle.com (Track C's primary tool) — log into Google Labs if needed
- [ ] Verify 21st.dev Magic MCP is installed in Claude Code settings (used by all 3 tracks)
- [ ] Verify **Recraft** access (already in `C:\Projects\GWTH_V2\recraft`) — used in Phase 0
- [ ] **Gemini Advanced**: not active yet — enable on morning of Track A (Day 2), stays on through Day 5
- [ ] **Camtasia**: confirm installed + working mic/display capture

### Project prep
- [ ] Confirm `fractionalbuddy-site` exists on GitHub at `David-ACG/fractionalbuddy-site` (per §5.0)
- [ ] Confirm GitHub CLI (`gh`) is authed to `David-ACG`
- [ ] Check `fractionalbuddy.com` is registered (Namecheap)
- [ ] Set up a 4-5 hour timer per track day — 3 tracks × 3 days

### Content prep
- [ ] Pages locked: **Homepage + Dashboard + Pricing** (confirmed)
- [ ] Identify the blind rater and book their 30-minute slot after Track C finishes
- [ ] Decide: start Phase 0 (brand kit) Day 1 AM or afternoon?
- [ ] Pricing tier names decided? (e.g. Solo / Team / Consultancy) — or discover during Phase 0

### Safety
- [ ] Review the fork checklist in §5.0 — completed 2026-04-18; confirm no private data carried over

---

## 14. Open Questions — Status (all resolved)

| # | Question | Answer |
|---|---|---|
| 1 | Claude Pro or Max? | ✅ **Max** — quota comfort confirmed for Claude Design. |
| 2 | Gemini Advanced active? | ✅ Not currently — David will **enable on demand** during the three tracks' QA phases (§6 / §7 / §8) and the §9 synthesis. |
| 3 | 3 pages × 3 tracks feasible? | ✅ **Yes** — pages are simple; 3-way confirmed 2026-04-19. Time budget raised to ~18-24h total. |
| 4 | External blind rater available? | ✅ **Yes** — send the 9 unlabelled final screenshots at §9. |
| 5 | Screen-recording tool? | ✅ **Camtasia** (instead of OBS). |
| 6 | Where does fractionalbuddy.com homepage code live? | ✅ **New forked repo** `fractionalbuddy-site` (not a route group in the MVP). Procedure in §5.0. |
| 7 | Confirm final page list | ✅ **Homepage + Dashboard + Pricing** (Timesheet dropped, Pricing added). §4 rewritten. |

---

## 15. Phase 0 — Brand Kit (logo, favicon, palette, type)

> **Runs ONCE before all three tracks.** Shared output — not an experiment variable. This isolates the tracks' test to "which design tool leads page-level work best," not logo design.

### 15.1 Why isolate this from the 3-way test

Logos and core colour palette are judged differently from page-level design (more subjective, fewer tool-specific techniques, small number of iterations). Including them in the track comparison would add noise without generating useful findings — all three tracks would likely produce similar logos because logo design barely uses the "lead tool's" strengths.

Doing brand once upfront means:
- All three tracks start with the same logo, favicon, and palette
- Homepage / Dashboard / Pricing all express the **same brand** across all three tracks
- The experiment variable (which lead tool drives page design) stays clean

### 15.2 Deliverables

- **Logo** — primary mark (horizontal + stacked) + dark-mode variant. SVG + PNG at 512/256/128.
- **Favicon** — 32×32 ICO + 180×180 apple-touch-icon + 512×512 PNG (manifest). Derived from the logo.
- **Colour palette** — 6-8 OKLCH tokens covering: primary, accent, neutral scale (bg/fg/card/border/muted), destructive/success/warning, plus full light + dark mappings. Committed as `globals.css` variables.
- **Typography pairing** — one sans (headings + body), optionally one mono (for time/code blocks). Loaded via `next/font/google`.
- **Brand brief** — 1-pager written in plain English: who FractionalBuddy is for, the voice (confident / calm / practitioner-first), what we're not (not a productivity-porn tool, not a consulting-industry cliché).

### 15.3 Workflow for Phase 0 (cheapest path first)

1. **Positioning** (30 min, you + Claude Code in the Phase 0 session) — nail the brand brief first. Without positioning, logo work is a random-walk.
2. **Claude Design — logo concepts** (30-45 min) — prompt it to produce 6-8 logo directions with the brand brief. Export the top 2-3 as reference images.
3. **Recraft — vector finalisation** (30-45 min) — recreate the chosen direction as clean vectors at primary/stacked/dark-mode variants.
4. **Favicon generation** (15 min) — use [realfavicongenerator.net](https://realfavicongenerator.net/) from the 512×512 PNG. Produces the full icon set + `site.webmanifest`.
5. **Palette build** (30 min) — pull the logo's two dominant hues into OKLCH tokens, build the full semantic palette in `globals.css`. Generate light + dark mappings. Use the existing GWTH OKLCH tokens file as a template.
6. **Commit the brand kit** to `main` of `fractionalbuddy-site`. All three experiment branches inherit it.

### 15.4 Time budget for Phase 0

**2-3 hours total.** This is before any of the 3 tracks run. Do it in a single sitting to keep the brand voice coherent.

### 15.5 What the brand kit is NOT

- Not a full style guide (that can wait)
- Not illustrations / marketing imagery (those are per-page, per-track)
- Not motion specs (handled in-component by Motion/Framer)

If Phase 0 takes more than 3 hours, stop and ship what you have — the experiment is more important than perfecting the logo.

---

## Appendix A — Exact commands for branch setup (after §5.0 fork + §15 brand kit)

```bash
cd /c/Projects/fractionalbuddy-site
git status                              # must be clean after Phase 0 commits
git checkout -b experiment/track-a-claude-design
git push -u origin experiment/track-a-claude-design
git checkout main
git checkout -b experiment/track-b-v0
git push -u origin experiment/track-b-v0
git checkout main
git checkout -b experiment/track-c-stitch
git push -u origin experiment/track-c-stitch
git checkout main                       # back to clean main
mkdir -p experiments/{trackA,trackB,trackC}/{bundles,sandbox,exports,logs,screenshots,mocks}
mkdir -p experiments/{baseline,recordings}
cat >> .gitignore <<'EOF'
experiments/trackA/sandbox/
experiments/trackB/sandbox/
experiments/trackC/sandbox/
experiments/recordings/
EOF
git add .gitignore && git commit -m "chore: add 3-track experiments/ scaffolding"
git push
```

## Appendix B — Exact session-open prompts

**Track A (Claude Design lead) session open:**
> I'm running design experiment Track A — CLAUDE DESIGN LEAD — against branch `experiment/track-a-claude-design` in the `fractionalbuddy-site` repo. Full plan at `C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md`. Load §6 as my instructions. Confirm the branch, create today's log directory at `experiments/trackA/logs/`, and wait for my go signal before touching any code.

**Track B (v0 lead) session open:**
> I'm running design experiment Track B — v0 LEAD — against branch `experiment/track-b-v0` in the `fractionalbuddy-site` repo. Full plan at `C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md`. Load §7 as my instructions. Do NOT reference Track A artefacts. Confirm the branch, create today's log directory at `experiments/trackB/logs/`, wait for go.

**Track C (Google Stitch lead) session open:**
> I'm running design experiment Track C — GOOGLE STITCH LEAD — against branch `experiment/track-c-stitch` in the `fractionalbuddy-site` repo. Full plan at `C:\Projects\GWTH_V2\kanban\1_planning\PLAN_2026-04-18_ai-design-workflow-experiment.md`. Load §8 as my instructions. Do NOT reference Track A or B artefacts. Confirm the branch, create today's log directory at `experiments/trackC/logs/`, wait for go.

**Synthesis session open:**
> Experiment complete. All three branches (experiment/track-a-claude-design, experiment/track-b-v0, experiment/track-c-stitch) exist on `fractionalbuddy-site`. All logs in `C:\Projects\fractionalbuddy-site\experiments\track{A,B,C}\logs\`. All screenshots in `experiments/track{A,B,C}/screenshots/`. Load §9 of `PLAN_2026-04-18_ai-design-workflow-experiment.md` and execute the synthesis.

**Lab production session open:**
> Synthesis complete (results appended to `C:\Projects\GWTH_V2\kanban\1_planning\RESEARCH_2026-04-15_ai-design-workflow.md`). Load §10 of `PLAN_2026-04-18_ai-design-workflow-experiment.md` and produce the 3-way shootout lab under `C:\Projects\1_gwthpipeline520\data\generated_lessons\labs\LAB_ai-design-3way\`.

---

## Review Checklist — 2026-04-19 (3-way revision)
- [ ] 3-way scope is correctly bounded — one lead tool per track, rest identical
- [ ] Technical approach matches each project's stack and conventions
- [ ] Files affected list is complete and accurate (no hidden cross-project changes)
- [ ] Acceptance criteria are specific and testable (Lighthouse thresholds, screenshot coverage)
- [ ] Session architecture actually prevents cross-track contamination (fresh session per track)
- [ ] 4-5 hour hard cap per track is realistic for 3 pages × light+dark
- [ ] Tracks A/B/C each have a clearly different lead tool (no methodology leakage)
- [ ] Brand kit (Phase 0) is shared, not a track variable
- [ ] Lab output format matches existing `LAB_local-whisper` template
- [ ] Pre-flight checklist covers all three tools' accounts
- [ ] Bias-checking step exists in synthesis (blind rater + Gemini blind rating on unlabelled screenshots)
- [ ] Risks section addresses each tool's most likely failure mode
- [ ] Timeline accounts for 5 days total (Phase 0 + 3 tracks + synthesis + lab)

**Review this plan:** `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-04-18_ai-design-workflow-experiment.md`
