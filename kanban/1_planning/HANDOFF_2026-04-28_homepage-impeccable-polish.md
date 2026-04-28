# Handoff: Homepage redesign POC — snagging → impeccable polish — 2026-04-28

> Paste the one-line opener from the end of this file into a fresh Claude Code session to resume.

## Snapshot

| | |
|---|---|
| **Project** | `C:\Projects\GWTH_V2` |
| **Branch** | `experiment/redesign-poc-2026-04` |
| **Head commit** | `ecefb6d chore: auto-commit (.beads/interactions.jsonl)` — sits on `fda9ef9 docs(impeccable) + polish(pillars): seed PRODUCT.md/DESIGN.md, unify ScoreVis with sibling vis cards` |
| **Uncommitted?** | no (working tree clean) |
| **Status** | awaiting-review (David has not yet eyeballed the latest deploy) |
| **Blockers** | 1 — David supplying 9 journey-card illustration assets |

## TL;DR (≤5 lines)

Phase 1b homepage POC. Session ran `/snagging` (closed 11 fixed snags from a Gate-4 checklist + David's annotator drop), then pivoted to `/impeccable` for broader polish. Latest move: seeded `PRODUCT.md` + `DESIGN.md` at project root and unified ProductPillars row 2 (ScoreVis) inside a card frame matching rows 1 + 3. Deploy 99 just finished on P520 (commit `fda9ef9`); auto-commit `ecefb6d` on top is `.beads/interactions.jsonl` only. David hasn't seen the latest deploy yet — the natural next move is a fresh annotator pass once he's looked.

## State of the world (external reality)

- **P520 staging** at http://192.168.178.50:3001/ — deploy 99 finished, serving commit `fda9ef9` (the auto-commit `ecefb6d` is non-source). Verification URL is open and gated by the `site_access=granted` cookie (Playwright captures already wire this).
- **Hetzner production** at https://gwth.ai — NOT touched in this session. Phase 1b is P520-only until David approves "Phase 1b approved" (per `kanban/2_testing/PROMPT_2026-04-27_phase-1b-C-polish-deploy.md` Gate 4 closing instructions).
- **Coolify queue IDs touched this session**: 93, 94, 95, 96, 97, 98, 99 — all completed.
- **Annotator window** at `.snagging/2026-04-28-1140/annotator.html` — was last opened with the latest 9 screenshots (full-page + above-fold + journey-section detail, light + dark) injected into the SCREENSHOTS list. David said "one more pass over annotator" but hadn't dropped a fresh `annotations.json` before the pause. The first-pass annotations file is at `.snagging/2026-04-28-1140/annotations.json` (15 shapes, 7 written notes — all addressed in commits `a68284a` + `fda9ef9`).

## State of the plan (decided — don't redo)

- **Logo PNGs at `/public/icon-light.png`, `/public/icon.png`, `/public/logo-light-cropped.png`, `/public/logo_dark-cropped.png` are LOCKED.** Don't propose, attempt, or render any SVG logo variant. Don't recrop the canonical PNGs (`/public/logo-light.png`, `/public/logo.png`). David reverted prior cropping attempts and said the canonical PNGs took hours of mockup work. (See bd memory `claude-design-redo-logo-loop`.)
- **Single-family Inter for marketing surfaces.** Inter appears on impeccable's reflex-reject list, but it is locked in `CLAUDE.md` and `DESIGN.md`. Don't swap families.
- **9 journey cards in 3+3+3** (not 3+3+1+2 with a wide team-lead card). All same width. The Team lead card was deliberately demoted from wide-card emphasis when the new Proof + Keeping up cards landed.
- **Card 7 (Proof) intentionally has no `stat`** — would clash visually with the hero device's example "104" score.
- **Hero body copy is 3 paragraphs** (capabilities / score reference / trust line) per David's explicit "seems like quite a block" feedback. Don't recompress to 1-2 paragraphs.
- **Em-dash cleanup is scoped to ProductPillars + the 2 cards I authored (7 and 8).** Existing journey cards 02-06 still contain em-dashes per David's archive of `beads_GWTH-3j7` — those wait for a guided copy pass with his direction.
- **Pills on journey cards stay until David supplies images.** They are functional persona labels (Worried / Reskilling / Small business / etc.) so the eyebrow-pill ban doesn't apply.
- **Section headings already polished**: `Different reasons. Same course.` (journey) / `94 projects. One score. Plain English.` (pillars). Don't reword these without checking with David.
- **`gwth.ai/score` URL bar mock in hero device** (was `/dashboard`). David's annotation; locked.
- **`Lessons` (not `View the curriculum`)** as the row-1 ProductPillars CTA — David specified verbatim.

## Artefacts (external sources of truth)

| Type | Ref | Purpose |
|------|-----|---------|
| Plan | `file:///C:/Projects/GWTH_V2/kanban/2_testing/PROMPT_2026-04-27_phase-1b-C-polish-deploy.md` | Phase 1b Gate 4 testing checklist (16 acceptance items) |
| Snag report | `file:///C:/Projects/GWTH_V2/.snagging/2026-04-28-1140/REPORT.md` | End-of-run summary of fixed/skipped/reverted snags + assumptions |
| Snag tracker | `file:///C:/Projects/GWTH_V2/.snagging/2026-04-28-1140/snags.json` | Per-snag status with commit refs |
| Decisions log | `file:///C:/Projects/GWTH_V2/.snagging/2026-04-28-1140/decisions.log` | Trade-offs taken silently inside the fix loop |
| Annotations | `file:///C:/Projects/GWTH_V2/.snagging/2026-04-28-1140/annotations.json` | David's first-pass annotator drop (15 shapes, 7 notes — all addressed) |
| Annotator | `file:///C:/Projects/GWTH_V2/.snagging/2026-04-28-1140/annotator.html` | Reload to re-annotate; SCREENSHOTS list points at latest after-shots |
| PRODUCT.md | `file:///C:/Projects/GWTH_V2/PRODUCT.md` | Strategic register=brand, anti-references, design principles |
| DESIGN.md | `file:///C:/Projects/GWTH_V2/DESIGN.md` | Stitch-format visual system, OKLCH tokens, named rules |
| Beads (closed, reopenable) | `beads_GWTH-7bu` `beads_GWTH-3j7` `beads_GWTH-sel` | Pills→images / copy refinement / ProductPillars unpolished |

## Progress

| Task | Status | Ref |
|------|--------|-----|
| 7-card → 9-card 3+3+3 grid + new Proof + Keeping up cards | ✅ done | `ef6970a` |
| Drop messy in-card "See pricing" CTAs, callout stats, top-right ArrowRight affordance | ✅ done | `ef6970a` |
| Cropped wordmark in nav (David supplied PNGs) | ✅ done | `35b7833` |
| Hero copy: 3 paragraphs + "every lesson and project" + score reference | ✅ done | `4f39ea4` |
| 7 annotation fixes (URL bar / font / heading / Plain English / Lessons / Zapier removed) | ✅ done | `a68284a` |
| Seed PRODUCT.md + DESIGN.md from CLAUDE.md + codebase tokens | ✅ done | `fda9ef9` |
| Wrap ScoreVis in matching card frame (David's "unpolished" target) | ✅ done | `fda9ef9` |
| Em-dash scrub in ProductPillars + cards 7/8 (DESIGN.md no-em-dash rule) | ✅ done | `fda9ef9` |
| David's second annotator pass over the latest after-shots | 🟡 pending | `.snagging/2026-04-28-1140/annotator.html` (SCREENSHOTS already updated) |
| Replace journey-card pills with David's illustrations | ⚪ blocked | David supplying assets |
| Refine journey-card copy across all 9 cards | ⚪ blocked | needs David's gold-standard direction |
| ProductPillars broader polish (post-card-wrap) | ⚪ blocked | David's eyes needed on latest deploy |
| Marketing-snapshot Playwright baselines regen | ⚪ deferred | next `/build` cycle (`--update-snapshots`) |

## What didn't work (dead ends — do NOT retry)

- **Tried using the canonical 1024×1024 logo PNGs (`/public/logo-light.png`, `/public/logo.png`) directly in the public nav.** They rendered as a tiny boxed wordmark on light theme because of the built-in whitespace. Reverted in `b453c10`. Don't try to crop these canonical files yourself — David sourced separate cropped variants (`logo-light-cropped.png` / `logo_dark-cropped.png`) which is what the nav now uses.
- **Tried `sharp.trim({ threshold })` and pixel-distance erasure on the canonical dark PNG.** Trim couldn't remove inter-letter dark pixels; pixel erasure left visible halos around cream letters. David's cropped PNGs sidestep both problems. Don't reinvent this.
- **Tried `ssh p520` (Tailscale alias 100.79.248.39).** Connection timed out the entire session. Use `ssh -i ~/.ssh/p520_ed25519 david@192.168.178.50` (LAN) for all P520 work — see Cheat sheet.
- **Initial `grep -c` against the deployed HTML returned line counts, not occurrence counts** because the HTML is single-line minified. Use `grep -oE '<pattern>' file | wc -l` instead.
- **First snag-review pre-assessment regex (`grep -ciE 'Built in the UK|Why this matters|...'`)** matched body copy and nav links, not actual pills. The genuine eyebrow-pill markup is `inline-flex.*rounded-full.*bg-muted` — match that, not free-text labels.

## Blockers (need external action)

- [ ] **David**: supply 9 journey-card illustration assets (one per persona — Worried / Reskilling / Small business / Parent / Upgrading / Income / Proof / Keeping up / Team lead). Once dropped into `/public/`, wire into `src/components/marketing/journey-grid/journey-card.tsx` (replace the `<span class="...rounded-full ...">{journey.tag}</span>` block with a theme-aware `<Image>`). Tracker: `beads_GWTH-7bu` (closed but reopenable with `bd update beads_GWTH-7bu --status=open`).
- [ ] **David**: eyeball the latest deploy at http://192.168.178.50:3001/ — if green, file fresh annotations against `.snagging/2026-04-28-1140/annotator.html`; if there's nothing left, the next session can move on to the next impeccable polish pass.

## First action for the next session (verify-before-act)

Run these checks FIRST — do not act on any claim above until verified:

```bash
git -C "C:/Projects/GWTH_V2" status --short
git -C "C:/Projects/GWTH_V2" rev-parse --abbrev-ref HEAD
git -C "C:/Projects/GWTH_V2" rev-parse HEAD
curl -fsS -o /dev/null -w "HTTP %{http_code}\n" http://192.168.178.50:3001/
curl -fsS --compressed -H "Accept-Encoding: identity" http://192.168.178.50:3001/ | grep -oE "Every lesson and project|gwth\.ai/score|Different reasons" | sort -u
ls C:/Projects/GWTH_V2/PRODUCT.md C:/Projects/GWTH_V2/DESIGN.md
ls C:/Projects/GWTH_V2/public/logo-light-cropped.png C:/Projects/GWTH_V2/public/logo_dark-cropped.png
ssh -i ~/.ssh/p520_ed25519 -o ConnectTimeout=10 david@192.168.178.50 'echo ssh-ok'
```

Expected output:
- `git status` empty (or only `screenshots/March/*.jpg` untracked — those are David's local screenshots).
- Branch: `experiment/redesign-poc-2026-04`. HEAD: `ecefb6d` or newer.
- HTTP 200 from staging.
- All three phrases (`Every lesson and project`, `gwth.ai/score`, `Different reasons`) present in the live HTML.
- Both `PRODUCT.md` and `DESIGN.md` present at project root.
- Both cropped wordmark PNGs present in `/public/`.
- SSH echoes `ssh-ok`.

If any check fails, STOP and tell the user — do not try to "fix forward" based on this handoff alone.

## Next steps (after verification passes)

1. Ask David whether he has had a chance to look at the latest deploy or wants a fresh annotator pass. If he's already dropped a new `annotations.json` into Downloads, move it into `.snagging/2026-04-28-1140/` and process the items.
2. If David approves the current state ("Phase 1b approved"), close `beads_GWTH-w5y` and move the three Phase 1b PROMPT files from `kanban/2_testing/` to `kanban/3_done/` (per `PROMPT_2026-04-27_phase-1b-C-polish-deploy.md` Gate 4 actions).
3. If David wants more impeccable polish, `DESIGN.md` is the rulebook. Likely candidates without further direction:
   - Vary section spacing rhythm across the homepage (currently every section uses `py-20 md:py-28` — the brand reference says "Vary spacing for rhythm. Same padding everywhere is monotony.").
   - Audit typography hierarchy: H1 → H2 ratio is `60/36 = 1.66` ✓ but H2 → title (`36/18 = 2`) leaves no mid-step for sub-section heads. Consider a `text-xl/2xl` mid-step.
   - Run `/impeccable critique` against `src/app/(public)/page.tsx` for a heuristic-scored audit.
4. If pushing to Hetzner production becomes the next step, the deploy command is **different from P520** — see `~/.claude/rules/04-infrastructure.md` (Hetzner has no SSH-docker; use Coolify UI Redeploy on App UUID `tw0cc8oc0w4scwoccs0cw0go`).
5. Marketing-snapshot Playwright baselines (`src/__tests__/pages/marketing-snapshots.spec.ts-snapshots/`) are stale after this session's homepage layout changes. Regenerate via `npx playwright test marketing-snapshots --update-snapshots` once David approves Phase 1b — don't update them earlier (they'd lock in unapproved visuals).

## Don't do

- **Don't** propose, attempt, or render any SVG variant of the GWTH logo. PNGs are locked. (See bd memory `claude-design-redo-logo-loop`.)
- **Don't** crop or otherwise modify `/public/logo.png` or `/public/logo-light.png` (the canonical 1024×1024 source PNGs). Use `logo-light-cropped.png` / `logo_dark-cropped.png` only.
- **Don't** rewrite journey card body copy on cards 01-06 autonomously. David archived `beads_GWTH-3j7` because he wants to drive that pass.
- **Don't** swap Inter for another font family even though impeccable's brand register lists Inter as a reflex-reject. CLAUDE.md and DESIGN.md both lock it.
- **Don't** push to Hetzner / gwth.ai unless David says "Phase 1b approved" or explicitly asks. Phase 1b is P520-only.
- **Don't** force-update the marketing-snapshot Playwright baselines before David's approval.
- **Don't** reopen the closed beads (`GWTH-7bu` / `GWTH-3j7` / `GWTH-sel`) unless David's request specifically maps to one. They're parked for `/impeccable` to address; reopening defeats the archival.
- **Don't** add em-dashes to any new marketing copy you write. Use commas, colons, semicolons, parentheses. (DESIGN.md "No-Em-Dash Rule".)
- **Don't** add decorative section-setup pills above any headline. (Forever banned, set 2026-04-28.)
- **Don't** restart the snagging back-and-forth — David explicitly pivoted to `/impeccable`. If he asks for another snag pass, OK, but otherwise lean toward autonomous polish.
- **Don't** invoke `/snagging` `/impeccable teach` or `/impeccable document` on this branch in this state — both PRODUCT.md and DESIGN.md are written and current. They'd ask if you wanted to overwrite.

## Cheat sheet

```bash
# P520 SSH (Tailscale alias is broken; use LAN)
ssh -i ~/.ssh/p520_ed25519 david@192.168.178.50 '<command>'

# Check P520 deploy status (replace 99 with the actual queue ID)
ssh -i ~/.ssh/p520_ed25519 david@192.168.178.50 'docker exec coolify php artisan tinker --execute="echo \\App\\Models\\ApplicationDeploymentQueue::where(\"id\", 99)->first()->status;"'

# Trigger a fresh P520 deploy (App UUID is xw4csk0ssos8800kws0cswwk)
ssh -i ~/.ssh/p520_ed25519 david@192.168.178.50 'docker exec coolify php artisan tinker --execute="
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

# Capture a fresh staging screenshot set into the snag run folder
node C:/Projects/GWTH_V2/.snagging/2026-04-28-1140/capture-after.mjs
node C:/Projects/GWTH_V2/.snagging/2026-04-28-1140/capture-fold.mjs
node C:/Projects/GWTH_V2/.snagging/2026-04-28-1140/journey-shot.mjs

# Verify deployed HTML (gzipped — use identity to grep)
curl -fsS --compressed -H "Accept-Encoding: identity" http://192.168.178.50:3001/ | grep -oE '<pattern>' | wc -l

# Reload the annotator with the latest after-shots already wired
start "" "C:/Projects/GWTH_V2/.snagging/2026-04-28-1140/annotator.html"

# Reopen an archived bead if David's request maps to it
bd update beads_GWTH-7bu --status=open

# Run marketing-component tests after any copy or layout change
npx vitest run src/components/marketing/

# Refresh impeccable session context (after any PRODUCT/DESIGN edit)
node C:/Users/david/.claude/skills/impeccable/scripts/load-context.mjs
```

---

## Paste-into-next-session opener

```
Read C:\Projects\GWTH_V2\kanban\1_planning\HANDOFF_2026-04-28_homepage-impeccable-polish.md end-to-end before doing anything else. It's a handoff from a previous session of mine. Follow the "First action" section to verify state before trusting anything in it, then proceed through "Next steps". Respect the "Don't do" list.
```
