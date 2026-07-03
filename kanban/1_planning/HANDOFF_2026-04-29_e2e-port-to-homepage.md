# Handoff: Port locked E2-E redesign to production homepage — 2026-04-29

> Paste the one-line opener from the end of this file into a fresh Claude Code session to resume.

## Snapshot

| | |
|---|---|
| **Project** | `C:\Projects\GWTH_V2` |
| **Branch** | `redesign/impeccable-homepage` |
| **Head commit** | `6c33b91 chore: auto-commit 11 files changed, 1719 insertions(+), 6 deletions(-)` |
| **Uncommitted?** | yes — 2 modified, 4 untracked artefacts (screenshots, playwright logs) |
| **Status** | awaiting-review (test audience reviewing `/redesign_v2`) → ready to port |
| **Blockers** | 1 — wider audience review on `/redesign_v2` (non-blocking, parallel) |

## TL;DR (≤5 lines)

E2-E (Stone & Sage) is the locked redesign winner with three colours fixed via a swatch picker on `/redesign_v2`: light postscript panel `#8a8170`, dark postscript panel `#22301f`, primary CTA `#a94c2e`. The variant page (`/redesign/v-e-2-e`) reflects these. Next stage is porting the locked design from `src/app/redesign/v-e-2-e/page.tsx` to the production homepage at `src/app/(public)/page.tsx` plus the marketing component primitives. The swatch-explorer page `/redesign_v2` stays live for ongoing test-audience review and must NOT be removed yet.

## State of the world (external reality)

- **Dev server** is running locally on `http://localhost:3000` (started by David in a separate Warp tab; not managed by these sessions).
- **`/redesign_v2`** is publicly readable at `http://localhost:3000/redesign_v2` — David is sharing this URL with a test audience to gather more feedback. Do not delete or alter the swatch options without approval.
- **Locked colour values** are in three places that must stay in sync:
  - `src/app/globals.css` lines ~924–954 (the `[data-variant="e2-e"]` and `.dark [data-variant="e2-e"]` blocks)
  - `src/components/marketing/redesign/palette-explorer.tsx` (default `useState` values around line 113–116)
  - The "(locked)" labels on the swatch options in the same file
- **No deploys** have run for E2-E yet. P520 and Hetzner still serve the old homepage from `master`.
- **Site password gate** exempts `/redesign` and `/redesign_v2` (added 2026-04-28 / 2026-04-29). Do not remove these exemptions until the redesign branch merges to `master`.

## State of the plan (decided — don't redo)

- **Winner is E2-E (Stone & Sage).** Vollkorn serif body + Public Sans display, warm stone surface, charcoal-stone Section 03 drench, mustard gold accents, terracotta CTA. _Reason: chosen by David and a wider audience review (ages 16–55) over A1 (mint/aqua felt "neon"); E2-E was reaffirmed after iterating through E2-A through E2-F._
- **Three colours locked via swatch picker (2026-04-29):** light panel `#8a8170` (warm stone, replaces the cool `#6f876c` sage that "didn't go with the rest"), dark panel `#22301f` (near-black forest, deeper than E2-F's `#2f442c`), primary CTA `#a94c2e` (terracotta — replaces the brick / pink-brick variants). Applied in both light and dark for the CTA. _Reason: the cool sage clashed with warm stone bg + brick CTA; deeper forest reads better at night; terracotta unifies CTA across modes without the salmon-pink artefact at higher lightness._
- **Swatch-picker pattern is the preferred colour-iteration tool** from now on. Memory file: `C:\Users\david\.claude\projects\C--Projects-GWTH-V2\memory\feedback_swatch_picker_for_color_iteration.md`. Build one for any future colour-tuning phase.
- **Logos PNG-only** (locked from Phase 0). No SVG variants anywhere.
- **Old `/redesign` exploration is archived** (banner added at top of `src/app/redesign/page.tsx`). Keep it accessible for reference; do not delete the variant pages (`v-a` through `v-h` plus sub-families).
- **Beads issue `GWTH-3ak`** (was for porting A1) is stale. Do not work against it; supersede with a new E2-E port issue when starting work.

## Artefacts (external sources of truth)

| Type | Ref | Purpose |
|------|-----|---------|
| Variant source | `file:///C:/Projects/GWTH_V2/src/app/redesign/v-e-2-e/page.tsx` | Reference markup for the port |
| Variant tokens | `file:///C:/Projects/GWTH_V2/src/app/globals.css` (`[data-variant="e2-e"]` block) | Reference colours / fonts / variables |
| Explorer | `http://localhost:3000/redesign_v2` | Test-audience review page (live, do not break) |
| Explorer source | `file:///C:/Projects/GWTH_V2/src/components/marketing/redesign/palette-explorer.tsx` | Where locked defaults live in code |
| Memory (winner) | `C:\Users\david\.claude\projects\C--Projects-GWTH-V2\memory\project_a1_chosen.md` | Decision history A1→E2→E2-E (filename is historical; content is now E2-E) |
| Memory (pattern) | `C:\Users\david\.claude\projects\C--Projects-GWTH-V2\memory\feedback_swatch_picker_for_color_iteration.md` | Reusable swatch-picker guidance |
| Project conventions | `C:\Projects\GWTH_V2\CLAUDE.md` | Tech stack, design system, file naming, kanban gates |
| Past port plan | `C:\Projects\GWTH_V2\kanban\1_planning\HANDOFF_2026-04-27_phase-1b-homepage-port.md` | Architecture context for the marketing components |

## Progress

| Task | Status | Ref |
|------|--------|-----|
| Impeccable variant exploration (14 variants A–H + sub-families) | ✅ done | `src/app/redesign/v-*/` directories |
| E2-E sub-family (E2-A through E2-F) | ✅ done | `src/app/redesign/v-e-2-{a,b,c,d,e,f}/page.tsx` |
| Swatch-picker explorer at `/redesign_v2` | ✅ done | `src/components/marketing/redesign/palette-explorer.tsx`, `src/app/redesign_v2/page.tsx` |
| Lock final E2-E colours into globals.css | ✅ done | `src/app/globals.css` `[data-variant="e2-e"]` block |
| Archive `/redesign` index with banner | ✅ done | `src/app/redesign/page.tsx` (banner near line ~165) |
| Test-audience review of `/redesign_v2` | 🟡 in progress | David is sharing the URL; awaiting feedback |
| File new beads issue for E2-E port (supersede `GWTH-3ak`) | ⚪ not started | — |
| Port E2-E to `src/app/(public)/page.tsx` | ⚪ not started | Start here when audience review concludes |
| Update marketing components to E2-E styling | ⚪ not started | `src/components/marketing/{hero,journey-grid,product-pillars,research-stats,pricing-cards,final-cta,marketing-footer}/*` |
| Update `(public)/layout.tsx` PublicNav + Footer | ⚪ not started | `src/app/(public)/layout.tsx`, `src/components/layout/{public-nav,footer}.tsx` |
| Verify port at `/` (Playwright + light/dark + 412/768/1280) | ⚪ not started | — |
| Deploy to P520 (test) | ⚪ not started | — |
| Deploy to Hetzner / gwth.ai | ⚪ not started | — |

## What didn't work (dead ends — do NOT retry)

- **A1 (Field Notebook Refined) as the winner.** Initially chosen 2026-04-28, reversed within hours after wider audience feedback rejected the mint/aqua palette as too "neon" for an educational brand. _Don't reconsider A1 unless the wider-audience preference flips back._
- **Original E2 burgundy postscript panel** (`oklch(0.42 0.13 22)`). Audience hated the large red area. Replaced with sage in E2-E, then warm stone `#8a8170`. _Don't put a large red panel back at the bottom of the page._
- **Dark-mode CTA at `oklch(0.7 0.13 22)`** — read as salmon pink. Stepped through `oklch(0.6 0.16 22)` and `oklch(0.5 0.17 28)` (still felt off in mixed company) before landing on `#a94c2e` (terracotta) for both modes. _Don't return to high-lightness reds at hue 22 in dark mode._
- **Cool sage `#6f876c` as light postscript panel.** "Lovely but doesn't go with the rest" — clashed with warm stone bg + brick CTA. _Replaced with warm stone `#8a8170`._
- **Spinning new full variants for small colour tweaks.** Slow, hard to compare in context. The swatch-picker pattern (now memorised) is the right tool. _Don't make E2-G, E2-H, etc. for colour-only changes — extend `/redesign_v2` swatches instead._
- **`Big_Shoulders_Display` import from `next/font/google`.** Not exported. Use `Bebas_Neue` for condensed display roles (variant G uses this).
- **Tailwind v4 CSS HMR sometimes misses bare-CSS additions** to `globals.css` until you touch the file again with a real edit (whitespace-only edits weren't enough; comment additions did trigger). Watch for stale `data-variant` selectors not appearing in the served CSS bundle (`/_next/static/chunks/*.css`). Fix: make a meaningful edit to `globals.css`.

## Blockers (need external action)

- [ ] **Test audience** — feedback on `/redesign_v2` swatch options — _David is sharing the URL externally; resume porting once audience either confirms current locked colours or requests further changes via the explorer._

## First action for the next session (verify-before-act)

Run these checks FIRST — do not act on any claim above until verified:

```bash
git -C /c/Projects/GWTH_V2 status --short
git -C /c/Projects/GWTH_V2 rev-parse --abbrev-ref HEAD
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/redesign_v2
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/redesign/v-e-2-e
grep -c '#8a8170' /c/Projects/GWTH_V2/src/app/globals.css
grep -c '#22301f' /c/Projects/GWTH_V2/src/app/globals.css
grep -c '#a94c2e' /c/Projects/GWTH_V2/src/app/globals.css
```

Expected output:
- `git status` shows the same `globals.css` and `palette-explorer.tsx` modifications (or fewer if user committed since)
- branch = `redesign/impeccable-homepage`
- both URLs return `200`
- each hex grep returns ≥ 1

If any check fails, STOP and tell the user — do not try to "fix forward" based on the handoff alone. In particular, if the dev server is down, ask David to restart it in his Warp tab — do not start a new one in this session (he runs it externally).

## Next steps (after verification passes)

1. **Confirm with David that test-audience review is complete and the locked colours are final.** Don't start the port if reviews are still in flight — the locked values may change.
2. **File a new beads issue** to track the port (e.g. "Port E2-E (locked palette) homepage to production"). Reference the locked colours and the source file (`src/app/redesign/v-e-2-e/page.tsx`). Mark `GWTH-3ak` superseded.
3. **Inventory the marketing components** that need E2-E styling: `src/components/marketing/hero/hero.tsx`, `journey-grid/journey-grid.tsx`, `product-pillars/product-pillars.tsx`, `research-stats/research-stats.tsx`, `pricing-cards/pricing-cards.tsx`, `final-cta/final-cta.tsx`, `marketing-footer/marketing-footer.tsx`. Compare each to the equivalent JSX block in `src/app/redesign/v-e-2-e/page.tsx`.
4. **Decide port strategy** with David (don't decide unilaterally): (a) refactor each marketing component to E2-E styling, preserving the architecture, OR (b) replace `(public)/page.tsx` content with the flat composition from v-e-2-e. Strategy (a) is the better engineering choice but more work; strategy (b) is faster but loses the component primitives that other public pages might need.
5. **Update `(public)/layout.tsx`** so PublicNav + Footer match the E2-E masthead style (Vollkorn italic tagline, two-tone bordered nav, terracotta CTA button).
6. **Move `--font-public-sans` and `--font-vollkorn` registration** out of the `[data-variant="e2-e"]` scope and into the global `:root` / `@theme` block — once E2-E becomes the production design, the variant-scoped fonts no longer make sense.
7. **Run `npm test`** after the port and verify Playwright at light/dark, 412/768/1280.
8. **Deploy to P520 first** (`http://192.168.178.50:3001`) via the Coolify SSH tinker command in `~/.claude/rules/04-infrastructure.md`. Verify there before touching Hetzner.
9. **Hand the testing checklist to David** (Gate 4 from the kanban gate rules) — explicit list of what to tick.
10. **Do NOT remove `/redesign` or `/redesign_v2` middleware exemptions** until the merge to `master` is approved. Test audience may still be reviewing.

## Don't do

- **Don't change the locked colours** (`#8a8170`, `#22301f`, `#a94c2e`) without an explicit user request. They went through audience review and a swatch-picker round.
- **Don't delete or alter `/redesign_v2`** — David is sharing it with the test audience.
- **Don't delete the legacy variant pages** (`v-a` through `v-h`, all sub-families). They're archived but kept for reference.
- **Don't modify `master`** — all work happens on `redesign/impeccable-homepage`. Merge is a later step.
- **Don't propose SVG variants for the logo.** PNGs are locked. Hard rule from Phase 0; ignore any internal Claude-Design instinct to vectorise.
- **Don't plan and build in the same session.** Plan in interactive sessions; build via `/build` (run-kanban.sh) in a fresh headless session.
- **Don't deploy to Hetzner before P520.** P520 is the test gate. Hetzner only after P520 passes.
- **Don't add a decorative eyebrow / pill above any headline.** Hard rule from `~/.claude/rules/06-code-quality.md`.
- **Don't put a large red panel at the bottom** of the page anywhere. Audience hated this in original E2.
- **Don't reintroduce mint / aqua / teal as the dominant brand colour.** That was A1's palette and it lost the audience review.

## Cheat sheet

```bash
# Quick state check
git -C /c/Projects/GWTH_V2 status --short
git -C /c/Projects/GWTH_V2 log -3 --oneline

# Compare the locked variant tokens
grep -A 25 'data-variant="e2-e"' /c/Projects/GWTH_V2/src/app/globals.css | head -55

# Check served CSS still has the variant selector after edits (Tailwind v4 HMR can be flaky)
CSS_PATH=$(curl -sS http://localhost:3000/redesign_v2 | grep -oE '/_next/static/[^"]+\.css' | head -1)
curl -sS "http://localhost:3000$CSS_PATH" | grep -c 'data-variant="e2-e"'

# Type-check (only the pre-existing robots.test.ts errors should appear)
npx tsc --noEmit 2>&1 | grep -v 'robots.test'

# Run vitest
npm test

# Deploy to P520 (Coolify, via SSH tinker — full command in ~/.claude/rules/04-infrastructure.md)
ssh p520 'docker exec coolify php artisan tinker --execute="…ApplicationDeploymentJob…"'

# Beads
bd ready
bd show GWTH-3ak    # confirm "stale", supersede when filing new port issue
bd dolt pull
```

---

## Paste-into-next-session opener

```
Read C:\Projects\GWTH_V2\kanban\1_planning\HANDOFF_2026-04-29_e2e-port-to-homepage.md end-to-end before doing anything else. It's a handoff from a previous session of mine. Follow the "First action" section to verify state before trusting anything in it, then proceed through "Next steps". Respect the "Don't do" list.
```
