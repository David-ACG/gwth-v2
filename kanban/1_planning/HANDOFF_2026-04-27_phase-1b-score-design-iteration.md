# Handoff: Phase 1b — Score widget design polish + pipeline restart — 2026-04-27

> Paste the one-line opener from the end of this file into a fresh Claude Code session to resume.

## Snapshot

| | |
|---|---|
| **Project** | `C:\Projects\GWTH_V2` |
| **Branch** | `experiment/redesign-poc-2026-04` |
| **Head commit** | `83296ec chore: auto-commit` (meaningful: `d568968 feat(score-vis): switch to top-1% population-percentile framing`) |
| **Uncommitted?** | no (1 untracked screenshot in `screenshots/March/` — pre-existing, ignore) |
| **Status** | in-progress · awaiting design polish + production patch v2 |
| **Blockers** | 0 — David has all info to proceed |

## TL;DR (≤5 lines)

PROMPT-A landed cleanly (171/171 vitest, 28/28 Playwright, 24/24 snapshots stable, axe clean) but the runner exited non-zero so PROMPT-A is **stuck in `kanban/1_planning/`** with `beads_GWTH-2yl` in_progress. Score widget is **Variant B (Freshness Ring + Sparkline)** confirmed by David, but the production component (commit `d568968`) uses the OLD ladder (100/110/120 → Top 1%/0.5%/0.25%); David has since changed the ladder to **80/100/130 → Top 5%/1%/0.5%** AND added a logo header AND a 5-bullet employer messaging panel. The mockup at `kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/index.html` reflects the latest design; production needs a second patch + a new `ScoreExplainer` sub-component before PROMPT-B mounts ScoreVis at scale. David's next-session ask: *"make it look much better and fit with the style of the rest of the site"* — design polish + integration.

## State of the world (external reality)

- **Mock server at :8766 is DOWN** (`curl localhost:8766 → 000`). Was running when this session paused; killed during teardown. Restart with: `cd kanban/design-artefacts/2026-04-27/score-variants && python -m http.server 8766 &`.
- **All 3 PROMPT files still in `kanban/1_planning/`** — runner ran A but exited non-zero so didn't move it; runner attempted B and C in sequence, both also marked FAILED (collateral from teardown kill). Nothing in `kanban/2_testing/` for Phase 1b yet.
- **`beads_GWTH-2yl` (PROMPT-A) is `in_progress`** (claimed by runner, never closed). Functionally done — Gate 3 + Gate 4 sections appended (commit `c09a675`).
- **`beads_GWTH-l3i` and `beads_GWTH-l2i` are open**; parent `beads_GWTH-w5y` blocked.
- **No P520 deploy in PROMPT-A** by design (deploy lands in PROMPT-C). `192.168.178.50:3001` still serves whatever was last deployed (pre-Phase-1b).
- **Local `next dev` server may or may not still be running** — verify before reopening port 3001.
- **Tag `pre-phase1b-port` exists** (rollback anchor — commit before the Next.js bump).
- **No background Claude Code processes** — confirmed killed via TaskStop + manual kill in the prior session.

## State of the plan (decided — don't redo)

- **Variant B (Freshness Ring + Sparkline) chosen** — David confirmed twice. Variants A (Pass-Line Gauge) and C (Fitness/Form Curve) preserved at `kanban/design-artefacts/2026-04-27/score-variants/{variant-A-gauge,variant-C-curve}/` as rejected alternatives. Don't delete.
- **Threshold ladder is 80 / 100 / 130** — NOT 100/110/120 (the production v1 patch used the wrong numbers; needs swap):
  - ≥130 → "Top 0.5%"
  - ≥100 → "Top 1%" (with " · slipping" suffix if was previously ≥130)
  - ≥80 → "Top 5%" (with " · slipping" suffix if was previously ≥100)
  - <80 with prior history ≥80 → "Slipping from top 5%"
  - <80 with no prior breach → "Working towards top 5%"
- **The pass-line stays at 100** in the visual (dashed line in sparkline labelled "TOP 1%"). 80 is a sub-tier reached during the journey; 130 is a super-tier requiring optional lessons. *Why:* David's product positioning — "the course is designed to land you in the top 1%; optional lessons push you higher; decay drops you back."
- **Score widget needs the GWTH icon header** (`public/icon.png` or its mockup copy at `variant-B-ring/icon.png`) above the "GWTH SCORE" label, centred, ~36px.
- **Score widget needs a 5-bullet "What this score tells an employer" panel** — copy is locked (see mockup `variant-B-ring/index.html` lines 155-185). Numbers come from `src/lib/config.ts` (`TOTAL_MANDATORY_LESSONS=64 + TOTAL_OPTIONAL_LESSONS=30 = 94`, `TOTAL_COURSE_MONTHS=3`, 3 capstones).
- **Employer-panel placement: COLLAPSIBLE TOGGLE (option 2 — DECIDED 2026-04-27).** Reference mock at `kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/option-2-collapsible.html`. Pattern: `<button>` with `aria-expanded` + `aria-controls`, max-height transition (0 ↔ 720px), animated chevron rotation, staggered reveal of the 5 bullets. Default state is collapsed so the score itself owns the card frame. *Why:* keeps the card compact (~560px), score owns the spotlight, expand-on-demand respects curious visitors without forcing the credibility argument on everyone.
- **Sparkline window: 3 months** (~12 weekly points), NOT 30 days. *Why:* matches course length; more dramatic decay narrative.
- **Score is illustrative** — every render gates on `EXAMPLE_SCORE_VALUE` / `EXAMPLE_SCORE_HISTORY` from `src/components/marketing/score-vis/example-data.ts`. "EXAMPLE" pill rendered top-right of card; figcaption beneath device reads *"Illustrative — your actual GWTH Score reflects verified work."*
- **Pipeline restart approach: option (a)** (per David's prior approval intent — restart not full reset). Manual `git mv` PROMPT-A to `2_testing/`, then `bash kanban/run-kanban.sh` picks up B + C only.
- **All decisions from `PLAN_2026-04-27_phase-1b-homepage-port.md` still hold** (V1 G-arrow + dirB layout, real curriculum/pricing/nav, no fabricated proof, etc.).

## Artefacts (external sources of truth)

| Type | Ref | Purpose |
|------|-----|---------|
| Plan | `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-04-27_phase-1b-homepage-port.md` | Full Phase 1b plan (don't unpick) |
| Prior handoff | `file:///C:/Projects/GWTH_V2/kanban/1_planning/HANDOFF_2026-04-27_phase-1b-homepage-port.md` | Phase 1b kickoff state (carry-forward "Don't do" still applies) |
| PROMPT-A | `file:///C:/Projects/GWTH_V2/kanban/1_planning/PROMPT_2026-04-27_phase-1b-A-foundation.md` | Functionally done — needs manual move |
| PROMPT-B | `file:///C:/Projects/GWTH_V2/kanban/1_planning/PROMPT_2026-04-27_phase-1b-B-products.md` | Pristine, awaits restart |
| PROMPT-C | `file:///C:/Projects/GWTH_V2/kanban/1_planning/PROMPT_2026-04-27_phase-1b-C-polish-deploy.md` | Pristine, awaits restart |
| Score variants compare | `http://localhost:8766/compare.html` (server DEAD — restart first) | 3-up A/B/C side-by-side |
| Variant-B mockup | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/index.html` | **Latest design source-of-truth for production patch** |
| Brand brief | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/brand-brief/BRAND_BRIEF.md` | Voice, journeys, locked hero copy |
| Phase 1a decision | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/concepts/homepage/DECISION.md` | V1 + dirB lock-in |
| Beads parent | `bd show beads_GWTH-w5y` | Phase 1b acceptance |
| Beads PROMPT-A (in_progress) | `bd show beads_GWTH-2yl` | **Close after manual move to 2_testing/** |
| Beads PROMPT-B | `bd show beads_GWTH-l3i` | Awaits restart |
| Beads PROMPT-C | `bd show beads_GWTH-l2i` | Awaits restart |
| Production ScoreVis | `src/components/marketing/score-vis/score-vis.tsx` | Has v1 ladder (100/110/120) — needs v2 patch |
| Hero device | `src/components/marketing/hero/hero-device.tsx:1-77` | Currently mounts ScoreVis only — needs logo header + employer panel slot |
| Example data | `src/components/marketing/score-vis/example-data.ts` | Already updated (3-month, value=104) |
| Runner | `C:\Projects\GWTH_V2\kanban\run-kanban.sh` | Marks PROMPT failed if `claude` exits non-zero (line 167) |

## Progress

| Task | Status | Ref |
|------|--------|-----|
| Pre-flight Next.js bump (CVE GHSA-q4gf-8mx6-v5v3) | ✅ done | `fa833b1` (16.1.6 → 16.2.4) |
| Playwright `mobile-dark` project + env-driven baseURL | ✅ done | `02ea3fd` |
| Archive old `landing/` + delete `landing.spec.ts` | ✅ done | `e49541d` |
| Marketing scaffold + MotionSection | ✅ done | `dd92350` |
| `data.ts` with config.ts drift-sentinel tests | ✅ done | `033ba60` |
| `CourseJsonLd` extracted with byte-equal payload | ✅ done | `4ab573c` |
| `ScoreVis` Freshness Ring + Sparkline (v1 ladder) | ✅ done | `e2aba57` |
| Hero + HeroDevice synchronous render | ✅ done | `6d7585f` |
| ResearchStrip + JourneyGrid (3+3+1) | ✅ done | `d25775e` |
| Replace `(public)/page.tsx` with marketing composer | ✅ done | `ee52f9a` |
| Playwright marketing-snapshots harness (24 baselines) | ✅ done | `7cbc477` |
| ScoreVis subtitle ladder upgrade v1 (100/110/120) | ✅ done | `d568968` |
| Score variants compare (A/B/C mockups) | ✅ done | `83296ec` (auto-commit) |
| **ScoreVis subtitle ladder v2 (80/100/130 + slipping sub-states)** | ⚪ not started | next session step §1 |
| **`<ScoreExplainer>` employer-panel component** | ⚪ not started | next session step §2 |
| **HeroDevice — add logo header + ScoreExplainer slot** | ⚪ not started | next session step §3 |
| **Update ScoreVis tests for v2 ladder + slipping** | ⚪ not started | next session step §4 |
| **Snapshot regen for hero/journey (subtitle text changed)** | ⚪ not started | next session step §5 |
| **Manual `git mv` PROMPT-A → `2_testing/` + close beads_GWTH-2yl** | ⚪ not started | next session step §6 |
| **Visual polish — fit with rest of site** | ⚪ not started | next session step §7 |
| **Restart pipeline (PROMPT-B then PROMPT-C)** | ⚪ not started | next session step §8 |

## What didn't work (dead ends — do NOT retry)

- **Pipeline auto-progression after PROMPT-A "FAILED"** — runner script (`kanban/run-kanban.sh:160-169`) gates on `claude` exit code. PROMPT-A's claude session exited non-zero despite Gate 3/4 ceremony succeeding (cause unknown — possibly the agent's own "stop and ask David" path). Don't try to debug the runner's exit-code logic; just `git mv` PROMPT-A manually then re-run for B + C.
- **Killing claude processes individually via PID** — first attempt missed the parent bash that respawns. Need `TaskStop` on the original `bash kanban/run-kanban.sh` task ID, plus `kill -9` on any remaining `claude` PIDs.
- **Full reset to `pre-phase1b-port`** considered as "option (b)" for a clean restart — rejected. Cost: 30+ minutes re-running identical agent work. The 14 PROMPT-A commits are solid; preserving them is cheaper.
- **Production v1 ladder (100/110/120 → Top 1%/0.5%/0.25%)** committed at `d568968`. Superseded by David's 80/100/130 + employer panel framing. Don't ship v1.
- **Snapshot regeneration on Win32 host** (per plan §6.3) — must use Linux baselines via Docker `mcr.microsoft.com/playwright:v${VERSION}-jammy`. CI is Linux; Win32 baselines drift on subpixel rendering.
- **Editing the in-flight PROMPT-A while runner was alive** — don't. The runner spawns claude with the *file path* and reads it at execution time; mid-flight edits race the agent.

## Blockers (need external action)

- _None._ Design polish + production patch are work the next session can do directly. David has flagged the visual polish brief (*"make it look much better and fit with the style of the rest of the site"*) as the framing for the next session.

## First action for the next session (verify-before-act)

Run these checks FIRST — do not act on any claim above until verified:

```bash
git -C /c/Projects/GWTH_V2 rev-parse --abbrev-ref HEAD                     # expect: experiment/redesign-poc-2026-04
git -C /c/Projects/GWTH_V2 status --short                                  # expect: only untracked screenshots/* (pre-existing)
git -C /c/Projects/GWTH_V2 log --oneline -3                                # expect: 83296ec auto-commit · d568968 score-vis top-1% · c09a675 Gate 3/4

bd show beads_GWTH-2yl | head -3                                            # expect: ◐ in_progress (NOT closed)
bd ready                                                                    # expect: empty for Phase 1b (l3i + l2i blocked by 2yl until manual close)

ls "kanban/1_planning/PROMPT_2026-04-27"*                                   # expect: A, B, C all 3 files present
ls "kanban/2_testing/PROMPT_2026-04-27"* 2>&1                               # expect: "No such file" — none moved yet

curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8766/compare.html # expect: 000 (mock server DEAD — restart needed)

grep -n "passLine" src/components/marketing/score-vis/score-vis.tsx | head  # expect: still uses 100/110/120 ladder (v1 — needs v2 patch)

ls public/icon.png public/icon-light.png                                    # expect: both present (G-arrow PNG for header)
```

Expected output: branch matches, working tree clean (modulo the screenshot), HEAD matches, beads_GWTH-2yl is in_progress, all 3 PROMPT files in 1_planning/, mock server is dead, ScoreVis still has v1 ladder. If any check fails, STOP and tell David — do not "fix forward" based on the handoff alone.

## Next steps (after verification passes)

1. **Restart mock server**: `cd kanban/design-artefacts/2026-04-27/score-variants && python -m http.server 8766 &`. Open `http://localhost:8766/variant-B-ring/index.html` and confirm the canonical reference renders (logo header, 80/100/130 ladder, employer panel, 4 scenario chips).
2. **Patch ScoreVis production v2** at `src/components/marketing/score-vis/score-vis.tsx`. Replace the `subtitleFor()` logic with the 5-state matrix from "State of the plan" §3. Keep the canonical dashoffset formula. Update `computedAriaLabel` accordingly. The mockup's JS in `kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/index.html` lines 215-260 has the exact logic to port.
3. **Employer-panel placement: COLLAPSIBLE (DECIDED).** Reference mock: `kanban/design-artefacts/2026-04-27/score-variants/variant-B-ring/option-2-collapsible.html`. Build the collapsible toggle inside `<ScoreExplainer>` (next step). Pattern reference: `<button aria-expanded aria-controls>` + max-height transition (0 ↔ 720px) + chevron rotation 0deg ↔ 180deg + staggered reveal of 5 bullets. Side-by-side comparator that drove the decision: `compare-placement.html` in the same folder.
4. **Build `<ScoreExplainer>` component** at `src/components/marketing/score-explainer/score-explainer.tsx`. Implement as a collapsible toggle (default closed). Use a shadcn `<Collapsible>` from `@/components/ui/collapsible` (Radix primitive — already in shadcn registry; install if absent: `npx shadcn@latest add collapsible`). Trigger button shows "What this score tells an employer" + sub "5 reasons it's credible" + chevron. Body lists 5 bullets, copy locked from mockup `option-2-collapsible.html` lines containing `panel-item`. Numbers via `import { TOTAL_MANDATORY_LESSONS, TOTAL_OPTIONAL_LESSONS, TOTAL_COURSE_MONTHS } from "@/lib/config"`. Add Vitest covering: (a) all 5 bullets render with correct numbers, (b) defaults to collapsed (`aria-expanded="false"`), (c) clicking the trigger flips `aria-expanded` and reveals the bullets, (d) keyboard activation works (Enter + Space).
5. **Update `HeroDevice`** at `src/components/marketing/hero/hero-device.tsx` to (a) render the GWTH icon header inside the score card (use `<Image src="/icon.png" alt="GWTH" width={32} height={32} />` above the "GWTH SCORE" label per mockup), (b) mount `<ScoreExplainer>` *inside* the score card, after the sparkline + axis but before the figcaption. Final card structure: brand → ring → sparkline → axis → ScoreExplainer (collapsed) → figcaption.
6. **Update ScoreVis tests** at `src/components/marketing/score-vis/score-vis.test.tsx` for v2 ladder + slipping sub-states. Replace existing percentile tests; add slipping tests (e.g. value=104, history=[…,135,118,104] should yield "Top 1% · slipping").
7. **Visual polish pass — Impeccable `/audit /critique /polish`** on the homepage at `http://localhost:3001` (or local dev). David's brief: "fit with the style of the rest of the site." Existing visual language is shadcn/ui new-york + OKLCH semantic tokens (`globals.css` light + Graphite Warm dark). Existing components in `src/components/{course,lab,progress,shared,ui}/`. Specifically inspect: card surfaces, border treatments, shadow scale, padding rhythm, typography hierarchy, dark-mode contrast.
8. **Regenerate snapshot baselines** affected by the subtitle change. Use Linux Docker per plan §6.3:
   ```bash
   PW_VERSION=$(node -p "require('@playwright/test/package.json').version")
   docker run --rm -v "$PWD:/work" -w /work "mcr.microsoft.com/playwright:v${PW_VERSION}-jammy" \
     npx playwright test marketing-snapshots --update-snapshots --project=desktop-chromium --project=desktop-dark
   ```
   Re-run twice — must produce zero diffs second time.
9. **Manual nudge for PROMPT-A**:
   ```bash
   git mv kanban/1_planning/PROMPT_2026-04-27_phase-1b-A-foundation.md kanban/2_testing/
   bd close beads_GWTH-2yl --reason="PROMPT-A complete; runner exited non-zero but work landed cleanly (171 tests + Gate 3/4 done). Manually moved to 2_testing/ during design-iteration handoff."
   ```
10. **Restart pipeline** for B + C: `bash kanban/run-kanban.sh`. Confirms only PROMPT-B and PROMPT-C in `1_planning/` first.
11. After PROMPT-C, append Gate 4 actions to PROMPT-A as well so David has unified review surface.

## Don't do

- Don't ship the v1 threshold ladder (100/110/120). It's **superseded** — 80/100/130 is the current decision.
- Don't redesign the score widget beyond polish — Variant B is locked. Don't reopen A vs B vs C.
- Don't rename / move `score-vis.tsx` — file path is referenced by tests, snapshot specs, HeroDevice, and (forward-looking) ProductPillars row 2.
- Don't `npm run dev` — segfaults on Win+Bash+Node 22. Use `node ./node_modules/next/dist/bin/next dev --turbopack -p 3001`.
- Don't delete the variant-A and variant-C mockups — they're rejected alternatives, kept for design provenance per Phase 1a precedent.
- Don't reintroduce fabricated proof (no fake learner counts, no fake testimonials, no fake partnerships). Carry-forward from prior handoff.
- Don't deploy to Hetzner / `gwth.ai` — Phase 1b is P520 only (lands in PROMPT-C).
- Don't burn Claude Design quota — Phase 1b is Claude Code only. Quota at 74%; reserve 26% for Phase 2a after the Sat 02:00 reset.
- Don't bypass git hooks (`--no-verify`).
- Don't `--amend` published commits — create new commits for the v2 patch.
- Don't full-reset to `pre-phase1b-port` — option rejected; preserve the 14 PROMPT-A commits.
- Don't change `EXAMPLE_SCORE_HISTORY` length away from 12 — sparkline is sized for ~12 points and tests assume it.
- Don't change the pass-line constant from 100 — it's the visual fulcrum (Top 1% threshold) even with the 80=Top 5% sub-tier added.
- Don't introduce raw hex / `rgb()` in `src/components/marketing/**` outside `<svg>` literals. Use OKLCH semantic tokens or `color-mix`.
- Don't add new dependencies (PROMPT-C will add `@lhci/cli`; nothing else).
- Don't restart the kanban pipeline before PROMPT-A is moved to `2_testing/` and the v2 patch is committed — PROMPT-B mounts ScoreVis at scale and would re-cement v1.

## Cheat sheet

```bash
# Project state
git -C /c/Projects/GWTH_V2 rev-parse --abbrev-ref HEAD
bd ready
bd show beads_GWTH-2yl beads_GWTH-l3i beads_GWTH-l2i beads_GWTH-w5y

# Restart mock server (compare + variant pages)
cd kanban/design-artefacts/2026-04-27/score-variants && python -m http.server 8766 &
# Then: open http://localhost:8766/compare.html OR http://localhost:8766/variant-B-ring/index.html

# Local dev server (for visual polish)
cd /c/Projects/GWTH_V2
node ./node_modules/next/dist/bin/next dev --turbopack -p 3001
# Then: open http://localhost:3001/

# Run vitest only on score-vis or marketing
npm test -- --run src/components/marketing/score-vis/
npm test -- --run src/components/marketing/

# Linux snapshot regen via Docker
PW_VERSION=$(node -p "require('@playwright/test/package.json').version")
docker run --rm -v "$PWD:/work" -w /work "mcr.microsoft.com/playwright:v${PW_VERSION}-jammy" \
  npx playwright test marketing-snapshots --update-snapshots --project=desktop-chromium --project=desktop-dark

# Manual PROMPT-A nudge + close
git mv kanban/1_planning/PROMPT_2026-04-27_phase-1b-A-foundation.md kanban/2_testing/
bd close beads_GWTH-2yl --reason="..."

# Restart pipeline (B + C only)
bash kanban/run-kanban.sh

# P520 Coolify deploy (PROMPT-C step — DON'T run before PROMPT-C)
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

# Beads memory recall
bd memories claude-design

# Tag rollback anchor (already exists)
git tag --list | grep -i phase
```

---

## Paste-into-next-session opener

```
Read C:\Projects\GWTH_V2\kanban\1_planning\HANDOFF_2026-04-27_phase-1b-score-design-iteration.md end-to-end before doing anything else. It's a handoff from a previous session of mine. Follow the "First action" section to verify state before trusting anything in it, then proceed through "Next steps". Respect the "Don't do" list.
```
