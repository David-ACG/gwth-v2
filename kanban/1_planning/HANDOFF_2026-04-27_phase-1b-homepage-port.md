# Handoff: GWTH Redesign POC — Phase 1b Homepage Port — 2026-04-27

> Paste the one-line opener from the end of this file into a fresh Claude Code session to resume.

## Snapshot

| | |
|---|---|
| **Project** | `C:\Projects\GWTH_V2` |
| **Branch** | `experiment/redesign-poc-2026-04` |
| **Head commit** | `7e8d87e chore: auto-commit` (auto-commit hook is on; meaningful: `5f83968 Phase 1a decided: V1 (G-arrow + dirB layout) wins`) |
| **Uncommitted?** | no |
| **Status** | awaiting-review · Phase 1b kickoff. David will run `/plan` next session to scope the implementation. |
| **Blockers** | 0 — `beads_GWTH-w5y` is ready and unblocked. |

## TL;DR (≤5 lines)

Phase 0 (logo + favicons) and Phase 1a (homepage design) closed 2026-04-27. **Variant 1 — G-arrow logo + dirB Stripe/Supabase-flavoured layout — won.** Phase 1b ports `kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/` (React+Babel-CDN prototype) into Next.js 16 + Tailwind v4 + shadcn under `src/components/marketing/`, replacing `src/app/(public)/page.tsx`, deploying to P520 Coolify, hitting Lighthouse ≥85 perf desktop / ≥90 a11y. **Single substantial task — likely needs splitting into 2–3 prompt files in `/plan`.**

## State of the world (external reality)

- **Claude Design quota: 74% used** (was 18% before Phase 1a, peaked 80% during Phase 1a). Phase 1a output was high-quality but the burn was 30pp larger than expected because Claude Design kept volunteering to redo the logo SVG despite the brief locking PNGs. **Phase 1b uses Claude Code only — does not touch the Design quota.** Reset Sat 02:00 AM (~5 days). Phase 2a (dashboard exploration) probably waits for the reset.
- **P520 Coolify** at `http://192.168.178.50:8000`, app UUID `xw4csk0ssos8800kws0cswwk`, deploys via SSH tinker (see `~/.claude/rules/04-infrastructure.md`). Nothing in flight.
- **Live site** at `https://gwth.ai` (Hetzner) is the source of real curriculum / pricing copy that Phase 1a ingested into `variant-1-garrow/components/data.js`. Don't refetch — it's already inlined.
- **Beads memory persisted** (visible to next session via `bd prime`):
  - `claude-design-the-design-tool-not-claude-code` (Phase 0)
  - `claude-design-redo-logo-loop` (Phase 1a — open every Claude Design turn with hard "PNGs are locked" prefix)
- **No background tasks. No deploys. No external state to verify beyond the quota and beads memory entries above.**

## State of the plan (decided — don't redo)

**Phase 1a outcome (locked 2026-04-27):**
- Variant 1 (G-arrow PNG logo) chosen over Variant 2 (windmill SVG icon + GWTH.ai text). Reason: David's call after side-by-side compare. Phase 0 favicon set stays as-is; no realfavicongenerator redo.
- dirB layout (Stripe/Supabase-flavoured: score-forward hero, 7-card 3+3+1 journey grid, 3 product story rows with vis sidebar, research stats, 3-tier pricing, dark CTA band) adopted as homepage source-of-truth.
- Variant 2 preserved at `concepts/homepage/variant-2-windmill/` as rejected alternative — **do not delete**.

**Content / copy decisions (don't reinvent):**
- **Real curriculum** baked into `variant-1-garrow/components/data.js` — `MONTH_CONFIGS` from `src/lib/config.ts`. M1 Personal AI Mastery (24 lessons, capstone Family AI Bot) / M2 Professional & Industry (20+15, capstone AI Customer-Support Chatbot) / M3 Enterprise Transformation (20+15, capstone AI Readiness Assessment Tool). 24+35+35 = 94.
- **Real pricing** baked in: 3 tiers — Free Labs £0 / The Course £29/mo (£87 total) / Stay Current £7.50/mo. Numbers come from `COURSE_MONTHLY_PRICE` + `ONGOING_MONTHLY_PRICE` in `src/lib/config.ts`. No "Teams from £24/seat" — that was fabricated by Claude Design and stripped.
- **Real nav**: Free Labs / Lessons / Pricing / For Teams / About. No News (dropped per David). Real routes already exist under `src/app/(public)/`.
- **Real research stats** (from `src/app/(public)/for-teams/page.tsx:218`): 21% confident · 1 in 6 businesses · 45% SME gap. Source: UK Government / DSIT (Jan 2026).
- **"Built around UK research"** strip (DSIT · ONS · CIPD · BCS · Tech UK · Innovate UK) — these are research-source citations, NOT partnerships. Do not rewrite as "partnered with" / "featured in".
- **Hero copy locked** (BRAND_BRIEF.md §3b): "Stop watching AI change the world. Start building with it." — second sentence in gradient/accent.
- **7-journey copy locked** (BRAND_BRIEF.md §2b verbatim + §2c drafts 5/6/7). Drafts 5/6/7 are NEW for Phase 1b. **Confirm with David before shipping** — they were drafts when written, may want a final pass.
- **Score widget categories** (B+ live grade · Personal AI 92 / Professional 78 / Enterprise 64 / Tech Radar 71) are **PLACEHOLDER**. Actual scoring scheme is TBD. Render as illustrative product mock with appropriate framing.

**Branding (from earlier handoffs):**
- GWTH = "Growth With Tech and Humans" → About page only, never hero.
- Single accent: mint `#1CBA93` (and aqua `#33BBFF` for direction-B). No second colour, no gradients on letterforms.
- Theme via `next-themes` ThemeProvider already wired (`src/providers/theme-provider.tsx`). Default: light. Toggle in dashboard header.

## Artefacts (external sources of truth)

| Type | Ref | Purpose |
|------|-----|---------|
| Plan | `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-04-24_gwth-redesign-poc.md` | Full POC plan — see §6 (Phase 1b scope), §9, §11 |
| Phase 1a decision | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/concepts/homepage/DECISION.md` | V1 win + porting notes, file paths to use as source-of-truth |
| Brand brief | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/brand-brief/BRAND_BRIEF.md` | Voice, journeys, locked hero copy, journey drafts §2c |
| Source bundle | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/` | The implementation source (React+Babel-CDN prototype) |
| Quota log | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/quota-snapshots/README.md` | 74% spent; reset Sat 02:00 |
| Previous handoff | `file:///C:/Projects/GWTH_V2/kanban/1_planning/HANDOFF_2026-04-26_phase-0-logo-png-pivot.md` | Phase 0 close-out (favicons) |
| Beads issue | `bd show beads_GWTH-w5y` | Phase 1b acceptance — also describes scope |
| Beads quota gate | `bd show beads_GWTH-9t0` | Runs after Phase 1b ships |

## Progress

| Task | Status | Ref |
|------|--------|-----|
| Phase 0 — Logo + favicons | ✅ done | `bm5` closed; `public/{logo,icon}*.png` + favicon set |
| Phase 1a — Homepage Claude Design exploration | ✅ done | `6om` closed; `concepts/homepage/variant-1-garrow/` is the source |
| Phase 1a iteration — V1 vs V2 comparison | ✅ done (V1 chosen) | `a7v` closed; `DECISION.md` |
| Phase 1b — Homepage port to Next.js + P520 deploy | ⚪ ready | `bd show beads_GWTH-w5y` |
| Phase 1b sub-tasks (decompose in `/plan`) | ⚪ not started | likely 2–3 prompt files needed |
| Phase 2a — Dashboard Claude Design | ⚪ blocked on quota reset (Sat 02:00) | `bd show beads_GWTH-eay` |

## What didn't work (dead ends — do NOT retry)

- **Vector logo via Claude Design / hand-coded SVG / OpenAI image / Stitch crop** — all failed across Phase 0. PNG is the POC deliverable. Vector revisit is Phase 3 brand-kit. **Don't restart vector logo work.**
- **Stitch icon-only crop** — Stitch can't crop reliably; programmatic sharp crop (`concepts/_crop-icon-from-canonical.mjs`) does the job.
- **OpenAI image tool with `n>1`** — 1-image only.
- **`Bun.Bun` via winget** — use `npm install -g bun`.
- **`npm run dev`** — segfaults on Win+Bash+Node 22. Use `node ./node_modules/next/dist/bin/next dev --turbopack -p 3001`.
- **2-tier pricing card** ("The Course £29" + "Teams £24") — Claude Design fabricated the Teams tier. Real pricing is **3 tiers** (Free / Course / Stay Current).
- **Fabricated proof in dirB**: "1,240 UK learners · 4.9/5 (FT Future Skills)", "94% finish all three modules", "£28k self-reported pay rise (n=126)", "3.4× LinkedIn views", testimonial from "Hannah Pierce, quantity surveyor, Manchester, cohort 3". All stripped — **do not reintroduce in any form**. Replace with the real research-stat block.
- **"Talk about cohorts" CTA on journey 7** — GWTH has no cohorts. Routes to `/for-teams` instead.
- **Single-pane WebFetch for client-rendered live pages** (gwth.ai/pricing, /for-teams, /labs, /lessons, /about) returned "Loading…". Source files in repo (`src/app/(public)/<route>/page.tsx`) are authoritative — don't refetch.

## Blockers (need external action)

- _None._ Phase 1b is ready for `/plan`.

## First action for the next session (verify-before-act)

```bash
cd /c/Projects/GWTH_V2 && git rev-parse --abbrev-ref HEAD
# Expect: experiment/redesign-poc-2026-04

git status --short
# Expect: clean

bd ready
# Expect: beads_GWTH-w5y in 'ready'

ls kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/components/
# Expect: data.js · dirA.jsx · dirB.jsx · logo.jsx (dirB.jsx is the one to port)

ls public/logo.png public/logo-light.png public/icon.png public/icon-light.png public/favicon.ico
# Expect: all 5 present
```

If anything fails, STOP and tell David — do not "fix forward" based on the handoff alone.

## Next steps (after verification passes)

1. **Run `/plan`** to scope Phase 1b. The work is substantial (8+ sections, dual mode, mobile responsive, hero device with score widget, 3 product visualisations, 3-tier pricing, P520 deploy, Lighthouse gates). Likely splits into 2–3 prompt files:
   - **PROMPT-A:** Tokens + base layout + nav + hero + research strip + journey grid (no visualisations)
   - **PROMPT-B:** Product story rows + 3 visualisations (curriculum / score / prompt) + 3-tier pricing + research stats + CTA + footer
   - **PROMPT-C:** Polish (Impeccable `/audit /critique /polish`) + P520 deploy + Lighthouse gate (perf ≥85 desktop, a11y ≥90) + Gate 3/4 verification + screenshots
2. Each prompt file goes in `kanban/1_planning/PROMPT_2026-04-27_phase-1b-<step>.md` with the standard Gate 1 + Gate 2 review blocks per `~/.claude/rules/03-kanban-gates.md`.
3. Plan file goes in `kanban/1_planning/PLAN_2026-04-27_phase-1b-homepage-port.md`.
4. After `/plan` is approved, switch session and run `/build` (run-kanban.sh, headless).

## Don't do

- **Don't restart vector logo work.** Phase 3 only.
- **Don't reintroduce fabricated proof.** No fake learner counts, no fake testimonials, no fake employer ratings, no fake partnerships, no "94% finish" stat. Use only the DSIT 21% / 1-in-6 / 45% block.
- **Don't redesign the curriculum or pricing.** Real numbers are in `src/lib/config.ts`.
- **Don't replace `<WaitlistForm />`** at `src/components/landing/waitlist-form.tsx:1` — preserve it (CTA buttons that link to `/signup` are fine, but the form component itself stays).
- **Don't lose the JSON-LD `<script>`** currently at `src/app/(public)/page.tsx:113-129` — keep the Course schema.
- **Don't render the score widget as if scoring is final.** B+ / 92/78/64/71 are PLACEHOLDER values. Add a "preview" / "illustrative" framing if any nuance is needed.
- **Don't use `<style>` blocks or class-based CSS systems** in the port. Tailwind v4 + shadcn variants only. Map `--ink-*` / `--mint-*` / `--aqua-*` tokens onto the existing token system in `src/app/globals.css`.
- **Don't `npm run dev`** — use the Node-direct workaround.
- **Don't add a visible "Ctrl K" hint button** — keyboard-only per David.
- **Don't render `dynamicScore.percentile`** — David dropped it.
- **Don't burn more Claude Design quota on logo or anything** during Phase 1b. Phase 1b is Claude Code only. Quota is at 74%; reserve the remaining 26% for Phase 2a after the Sat 02:00 reset.
- **Don't ship journey copy drafts 5/6/7 unreviewed.** Confirm with David before they go live — they were drafts when written.
- **Don't add tagline / sub-text under the wordmark.**
- **Don't centre the wordmark vertically with extra padding.**
- **Don't switch sessions to `GWTH_curriculum`** — sibling repo for content; this is platform-only.
- **Don't bypass git hooks (`--no-verify`)** unless explicitly asked.
- **Don't deploy to Hetzner / production (`gwth.ai`)** — Phase 1b ships to P520 only. Production deploy is a later gate.

## Cheat sheet

```bash
# Project state
git -C /c/Projects/GWTH_V2 rev-parse --abbrev-ref HEAD
bd ready
bd show beads_GWTH-w5y

# Inspect Phase 1a deliverables
ls kanban/design-artefacts/2026-04-24/concepts/homepage/variant-1-garrow/
cat kanban/design-artefacts/2026-04-24/concepts/homepage/DECISION.md

# Local preview of the chosen variant
cd kanban/design-artefacts/2026-04-24/concepts/homepage && python -m http.server 8765
# then visit http://localhost:8765/variant-1-garrow/Homepage%20Redesign.html

# Dev server workaround (Phase 1b implementation)
node ./node_modules/next/dist/bin/next dev --turbopack -p 3001

# Tests + build
npm test
npm run build

# P520 Coolify deploy (Phase 1b ship)
ssh p520 'docker exec coolify php artisan tinker --execute="
use App\\Models\\Application;
use App\\Models\\ApplicationDeploymentQueue;
\$app = Application::where(\"uuid\", \"xw4csk0ssos8800kws0cswwk\")->first();
\$server = \$app->destination->server;
\$queue = ApplicationDeploymentQueue::create([
    \"application_id\" => \$app->id,
    \"deployment_uuid\" => Illuminate\\Support\\Str::uuid()->toString(),
    \"force_rebuild\" => false,
    \"commit\" => \"HEAD\",
    \"status\" => \"queued\",
    \"is_webhook\" => false,
    \"server_id\" => \$server->id,
]);
dispatch(new App\\Jobs\\ApplicationDeploymentJob(\$queue->id));
echo \"Deploy queued! Queue ID: \" . \$queue->id;
"'

# Lighthouse on the deployed P520 build
npx lighthouse http://192.168.178.50:3001 --quiet --chrome-flags="--headless"

# Beads memory recall
bd memories claude-design

# Verify-Phase-1a-deliverables (favicons + logos)
ls public/ | grep -iE "favicon|apple-touch|web-app-manifest|site\.webmanifest|logo|icon"
```

---

## Paste-into-next-session opener

```
Read C:\Projects\GWTH_V2\kanban\1_planning\HANDOFF_2026-04-27_phase-1b-homepage-port.md end-to-end before doing anything else. It's a handoff from a previous session of mine. Follow the "First action" section to verify state before trusting anything in it, then proceed through "Next steps". Respect the "Don't do" list.
```
