# Handoff: GWTH Redesign POC — Phase 0 Logo PNG Pivot — 2026-04-26

> Paste the one-line opener from the end of this file into a fresh Claude Code session to resume.

## Snapshot

| | |
|---|---|
| **Project** | `C:\Projects\GWTH_V2` |
| **Branch** | `experiment/redesign-poc-2026-04` |
| **Head commit** | `a70d7e3 chore: auto-commit 22 files changed` (auto-commit hook is on) |
| **Uncommitted?** | no — only an unrelated screenshot is untracked |
| **Status** | awaiting-review · Phase 0 step 4 (favicon upload) is David's manual browser flow |
| **Blockers** | 1 — favicon set generation needs realfavicongenerator.net (David, browser) |

## TL;DR (≤5 lines)

GWTH POC, 2 pages (homepage + dashboard), running interactively. Phase 0 logo is **DONE as PNG-only** — vector approaches (Stitch, OpenAI image, hand-coded SVG, Claude Design) all failed to converge on a clean G shape after 7+ iterations and 18% Claude Design quota. POC pragmatic: ship canonical PNGs from Stitch as `public/logo*.png` and `public/icon*.png` (icon auto-cropped from the wordmark so the G geometry matches exactly). **The single remaining Phase 0 step is David uploading `kanban/design-artefacts/2026-04-24/concepts/icon/icon-512-master.png` to https://realfavicongenerator.net/, dropping the output into `public/`.** After that, `bm5` closes and `6om` (Phase 1a homepage Claude Design exploration) unblocks.

## State of the world (external reality)

- **Claude Design quota**: 18% used (snapshot: `kanban/design-artefacts/2026-04-24/quota-snapshots/2026-04-26_phase-0-logo-pivot.jpg`). All burned on the abandoned SVG vectorisation attempts. **Sunk cost — no asset shipped from this spend.** 82% remains for Phase 1a/2a, well under the 50% gate. Weekly reset Sat 02:00 AM.
- **Beads memory** persisted: `claude-design-the-design-tool-not-claude-code` — Claude Design is for page-level design, NOT logo vector finalisation or geometric primitives. Future projects should not repeat this mistake.
- **No background tasks. No deploys. No external state to verify beyond the quota and memory entries above.**

## State of the plan (decided — don't redo)

**Phase 0 logo decisions:**
- **PNG-only delivery for the POC** — vector conversion deferred to Phase 3 brand-kit work (or Figma trace by a human designer). Reason: 4 separate vector attempts (Stitch crop, OpenAI multi-image, hand-coded SVG v1+v2, Claude Design) all failed to render the G with proper "G-leg replaced by arrow" geometry. The PNG faithfully captures the locked concept; cost of further iteration > value.
- **Canonical PNGs locked** at `kanban/design-artefacts/2026-04-24/concepts/wordmark/canonical-2026-04-26-{dark,light}.png` — these are Stitch outputs David specifically endorsed.
- **Icon cropped programmatically from wordmark** via `_crop-icon-from-canonical.mjs` (sharp + auto-bbox detection: scans wordmark for ink-bearing columns, finds the gap between G and W, cuts at gap midpoint). Re-runnable any time the canonical wordmark changes.
- **Hand-coded `icon.svg` discarded** — its G shape (ring with notch at -45°) didn't match the canonical wordmark's G (real G with horizontal leg replaced by arrow). David flagged this directly.
- **Spiral SVGs (`public/logo-spiral*.svg`) preserved** as atmospheric assets only; not part of the new logo system.

**Dashboard direction (Phase 2a, blocked on Phase 1):** unchanged from previous handoff — see `HANDOFF_2026-04-26_phase-0-logo-vector.md` "State of the plan" section.

**Branding:** unchanged. GWTH = "Growth With Tech and Humans" → About page only. Hero copy stays "Stop watching AI change the world. Start building with it." Three new journey-section drafts (5/6/7) at `BRAND_BRIEF.md` §2c queued for Phase 1b.

## Artefacts (external sources of truth)

| Type | Ref | Purpose |
|------|-----|---------|
| Plan | `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-04-24_gwth-redesign-poc.md` | Full POC plan |
| Brand brief | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/brand-brief/BRAND_BRIEF.md` | §6 logo deliverables list |
| Dashboard synthesis | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/baselines/dashboard-current-and-inspiration.md` | Phase 2a direction |
| Quota log | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/quota-snapshots/README.md` | 18% spent on logo, lesson recorded |
| Preview | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/concepts/_scale-test.html` | Visual sanity-check of all 4 PNG assets at multiple sizes |
| Crop script | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/concepts/_crop-icon-from-canonical.mjs` | Re-run if wordmark canonical changes |
| Previous handoff | `file:///C:/Projects/GWTH_V2/kanban/1_planning/HANDOFF_2026-04-26_phase-0-logo-vector.md` | Earlier session's decisions still apply |
| Beads | `bm5` in_progress; `6om`/`w5y`/`9t0`/`eay`/`m0s`/`6if`/`32e` blocked behind it | `bd show beads_GWTH-bm5` |

## Progress

| Task | Status | Ref |
|------|--------|-----|
| Pre-flight (`suy`) — branch + folders + baselines | ✅ done | bd closed |
| Impeccable install (`72z`) | ✅ done | bd closed |
| Phase 0 step 1 — Brand brief | ✅ done | `BRAND_BRIEF.md` |
| Phase 0 step 2 — Concept generation | ✅ done | `concepts/wordmark/canonical-2026-04-26-*.png` |
| Phase 0 step 3 — Vector finalisation | ✅ done as PNG-only | `public/{logo,icon}*.png` |
| Phase 0 step 4 — Favicon set | 🟡 awaits David's browser upload to realfavicongenerator.net | `concepts/icon/icon-512-master.png` |
| Phase 0 step 5 — Commit/close `bm5` | ⚪ blocks on step 4 | next session closes after favicons land |
| Phase 1a — Homepage Claude Design | ⚪ blocked on `bm5` close | `bd show beads_GWTH-6om` |
| Phase 1b, 2a, 2b, 3, 5 | ⚪ blocked downstream | _ |

## What didn't work (dead ends — do NOT retry)

- **Vector logo via Claude Design** — hit NaN geometry bugs (opening offsets exceeded inner radius), iteration loop too slow, burned 18% quota for zero shipped output. Beads memory `claude-design-the-design-tool-not-claude-code` records this. **Do not route logo-vector work through Claude Design again.**
- **Hand-coded SVG icon** (v1 with stroke-based W, v2 with filled-polygon W + ±20° gap G) — W issues fixed in v2 but the G stayed wrong (ring-with-notch instead of real G with leg). David's direct feedback: "Not sure the G still looks like a G in v2." **Don't try to hand-code geometric letterforms from prose descriptions — vector tooling needed.**
- **Stitch icon-only crop** — already in earlier handoff's dead-ends list. Stitch can't crop reliably; use sharp-based programmatic crop (`_crop-icon-from-canonical.mjs`) instead.
- **OpenAI image tool with `n>1`** — same as before. 1-image only.
- **`Bun.Bun` via winget** — unchanged, use `npm install -g bun`.
- **Impeccable dist build** — unchanged, source-install only.
- **`npm run dev` on Win/Bash/Node 22** — segfaults. Use `node ./node_modules/next/dist/bin/next dev --turbopack -p 3001`. Will matter for Phase 1b.

## Blockers (need external action)

- [ ] **David**: upload `icon-512-master.png` to https://realfavicongenerator.net/ and drop the output (`favicon.ico`, `apple-touch-icon.png`, `web-app-manifest-{192,512}.png`, `site.webmanifest`) into `public/`. Browser flow only — Claude can't drive it. After that, the next session closes `bm5` and Phase 1a unblocks.

## First action for the next session (verify-before-act)

```bash
cd /c/Projects/GWTH_V2 && git rev-parse --abbrev-ref HEAD
# Expect: experiment/redesign-poc-2026-04

git status --short
# Expect: clean OR new favicon files in public/ if David already ran the upload

bd list --status=in_progress
# Expect: beads_GWTH-bm5 (still open until favicons land)

ls public/ | grep -iE "favicon|apple-touch|web-app-manifest|site\.webmanifest"
# Expect: empty if David hasn't uploaded yet, populated if he has

ls public/logo.png public/logo-light.png public/icon.png public/icon-light.png
# Expect: all 4 present
```

If `public/` already contains the favicon set (David completed the upload), skip to step 2 of "Next steps". If not, ask David before doing anything else.

## Next steps (after verification passes)

1. **If favicon files NOT in `public/` yet**: nothing to do here — ping David. The handoff is paused on his manual browser flow at https://realfavicongenerator.net/.
2. **If favicon files ARE in `public/`**: verify the set is complete (`favicon.ico`, `apple-touch-icon.png`, `web-app-manifest-192.png`, `web-app-manifest-512.png`, `site.webmanifest`), then close `bm5`:
   ```bash
   bd close beads_GWTH-bm5 --reason="Phase 0 logo + favicon delivered as PNG. SVG vectorisation deferred to Phase 3 brand-kit."
   bd ready
   # Expect: beads_GWTH-6om now in 'ready' (Phase 1a homepage Claude Design)
   ```
3. **Confirm with David that Phase 1a is ready to start.** Phase 1a is his Claude Design session (homepage exploration). Pause Claude Code until he completes that and returns with the design output.
4. **When David returns from Phase 1a:** start Phase 1b (Claude Code implementation of the homepage from Claude Design output, deploy to P520 at http://192.168.178.50:3001).

## Don't do

- **Don't restart vector logo work.** Stitch, OpenAI, Claude Design, and hand-coded SVG all failed; PNG is the POC deliverable. Vector revisit is a Phase 3 task with different tooling (Figma trace, human designer).
- **Don't regenerate `public/icon.png` or `public/icon-light.png` manually.** Use `_crop-icon-from-canonical.mjs` if the canonical wordmark changes.
- **Don't add a second accent colour** beyond mint. Single-accent is locked.
- **Don't burn more Claude Design quota on logo work.** 82% remains; reserve for Phase 1a/2a page exploration. The quota gate (`9t0`) checks burn after Phase 1b — keep it under 50%.
- **Don't change the hero copy** ("Stop watching AI change the world. Start building with it.") — locked.
- **Don't edit `src/app/(public)/page.tsx`** in this Phase 0 close-out. Three missing journey sections (drafts in `BRAND_BRIEF.md` §2c) are Phase 1b work.
- **Don't `npm run dev`** if previewing — segfaults. Use the Node-direct workaround (cheat sheet below). For Phase 0 close-out you don't need a dev server at all; the HTML scale-test page is enough.
- **Don't `bd close beads_GWTH-bm5`** until the favicon set files are confirmed in `public/`.
- **Don't add a visible "Ctrl K" hint button** to layouts — David explicitly chose keyboard-only.
- **Don't render `dynamicScore.percentile`** in any widget — David dropped it.
- **Don't switch sessions to GWTH_curriculum** — sibling repo for content; this work is platform-only.

## Cheat sheet

```bash
# Re-verify project state quickly
git -C /c/Projects/GWTH_V2 rev-parse --abbrev-ref HEAD && bd list --status=in_progress

# Inspect Phase 0 deliverables
ls public/logo*.png public/icon*.png
ls kanban/design-artefacts/2026-04-24/concepts/icon/

# Re-crop icons if the canonical wordmark changes
node kanban/design-artefacts/2026-04-24/concepts/_crop-icon-from-canonical.mjs

# Open the preview in browser (manual)
# file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/concepts/_scale-test.html

# Dev server workaround (Phase 1b — not Phase 0)
node ./node_modules/next/dist/bin/next dev --turbopack -p 3001

# Beads
bd show beads_GWTH-bm5            # current task detail
bd ready                          # what unblocks after bm5 closes
bd memories claude-design         # the lesson learned

# Coolify P520 deploy (Phase 1b — see ~/.claude/rules/04-infrastructure.md for full block)
ssh p520 'docker exec coolify php artisan tinker --execute="..."'
```

---

## Paste-into-next-session opener

```
Read C:\Projects\GWTH_V2\kanban\1_planning\HANDOFF_2026-04-26_phase-0-logo-png-pivot.md end-to-end before doing anything else. It's a handoff from a previous session of mine. Follow the "First action" section to verify state before trusting anything in it, then proceed through "Next steps". Respect the "Don't do" list.
```
