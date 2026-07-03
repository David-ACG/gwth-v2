# Handoff: Homepage redesign comparison — FDE direction chosen — 2026-06-12

> Paste the one-line opener from the end of this file into a fresh Claude Code session to resume.

## Snapshot

| | |
|---|---|
| **Project** | `/home/david/projects/GWTH_V2` (this IS P520; serves the LAN at 192.168.178.50) |
| **Branch** | `master` |
| **Head commit** | `6013734 Merge origin/master (PR #20 CLAUDE.md split) into local line` |
| **Uncommitted?** | yes — ~522 files (months of David's work; NOT this session's alone) |
| **Status** | in-progress — awaiting David's comments on `/home-fde` |
| **Blockers** | 1 — middleware/proxy migration |

## TL;DR (≤5 lines)

David asked for homepage redesign variants to compare side by side. Built `/home-claude` (free-improvement pass) and `/home-fde` (based on the FDE.build mockup at http://192.168.178.50:3010/). **David chose `/home-fde`** ("calmer and more fun"); a terracotta recolour (`/home-fde-terra`) was built and rejected ("too harsh"), then deleted. The FDE journeys section was reworked to his feedback: nine boxed cards, punchy copy. Favicon regenerated as the G-with-arrow mark. Next: David reviews `/home-fde` again, then the chosen direction gets ported to the production homepage.

## State of the world (external reality)

- **Dev server running** on this machine: `next dev -H 0.0.0.0 -p 3000` (detached, logs `/tmp/gwth-dev-server.log`). David views from P53 at `http://192.168.178.50:3000/...`.
- **`src/middleware.ts` is renamed to `src/middleware.ts.sidelined-for-dev-server`** — Next 16.2.4 refuses to start while both `middleware.ts` and `src/proxy.ts` exist. The dev server only runs because of this rename. A task chip ("Finish middleware-to-proxy migration") exists to resolve it properly.
- **Coolify deployment on :3001 is untouched** — it shows the old build, not this session's work.
- **Beads/Dolt is down** — `bd` commands return nothing. No beads issues were created today.
- **Plunk + Supabase secrets were found inlined in `.claude/settings.local.json`** (also in git history). David must rotate them at the providers. Plan: `kanban/1_planning/PLAN_2026-06-12_autonomous-build-optimization.md`.
- `src/components/marketing/` lost its write bit mid-session (mode became r-xr-xr-x); fixed with `chmod u+w`. Cause unknown — may recur.
- HEAD moved during the session (was `de4708b`/2026-03-24 in the morning, now `6013734`) — something synced/merged outside this session's actions.

## State of the plan (decided — don't redo)

- **FDE journal register is the chosen homepage direction** — David: "calmer and more fun". Source of truth: `src/components/marketing/home-fde/` + the live mockup at `http://192.168.178.50:3010/`.
- **Terracotta recolour rejected** ("way too harsh on the eyes"). `/home-fde-terra` deleted; screenshots archived in `kanban/design-artefacts/2026-06-12-homepage-compare/home-fde-terra-*.png`. Do not re-pitch a terracotta-drenched page.
- **Nine journey cards, not a 3-featured + 6-row split** — David wants every visitor to find their situation. Boxed cards with slim colour-block headers (teal/moss/rust cycle). Short blurbs live in `JOURNEY_BLURBS` inside `home-fde.tsx` (variant-local); shared `data.ts` long copy untouched.
- **Favicon = G-mark with arrow** per `kanban/1_planning/SPEC_2026-05-08_favicon-regeneration.md`; geometry from `LogoGwthMark` in `src/components/marketing/redesign/logo-gwth.tsx:127`. Arrow is **terracotta `#a94c2e`** (the live locked `--logo-accent`; the spec's gold `#d4a73c` was superseded by the 2026-05-08 revert). Full set regenerated in `public/` + `src/app/icon.svg`.
- **Theme toggle**: public layout has no theme switch, so comparison routes mount `ThemeFab` (`src/components/marketing/compare/theme-fab.tsx`) — a labelled "Dark mode / Light mode" pill, renders pre-hydration.
- **Card 05 "Upgrading" copy** in `src/components/marketing/data.ts:155` now carries the AI-cost-saving message (David's request). Preserved in the FDE blurb for card 05 too.
- Earlier today (separate threads, both complete): marketing-pages editorial port (see `HANDOFF_2026-05-08_marketing-pages-editorial-port.md` progress appendix + `TRIAGE_2026-06-12.md`) and three kanban plans from stale ideas (`PLAN_2026-06-12_*.md`).

## Artefacts (external sources of truth)

| Type | Ref | Purpose |
|------|-----|---------|
| Variant B (chosen) | `src/components/marketing/home-fde/` + `src/app/(public)/home-fde/page.tsx` | The design David likes |
| Variant A (also-ran) | `src/components/marketing/home-claude/` + `src/app/(public)/home-claude/page.tsx` | Free-improvement pass, not chosen |
| Screenshots | `kanban/design-artefacts/2026-06-12-homepage-compare/` | All variants, light/dark/mobile (`home-fde-*-v2.png` = current) |
| Favicon spec | `kanban/1_planning/SPEC_2026-05-08_favicon-regeneration.md` | G-mark favicon requirements |
| FDE mockup | `http://192.168.178.50:3010/` | Visual reference for the register |
| Marketing-port triage | `kanban/design-artefacts/2026-05-08/marketing-pages-survey/TRIAGE_2026-06-12.md` | Earlier thread's output |

## Progress

| Task | Status | Ref |
|------|--------|-----|
| Variant A `/home-claude` | ✅ done | route 200, light+dark verified |
| Variant B `/home-fde` | ✅ done + iterated | journeys rework verified, 9 cards |
| Variant C terra | ✅ rejected + deleted | screenshots archived only |
| Favicon set (G + terracotta arrow) | ✅ done | `public/favicon.*`, `public/icon*.{svg,png}`, `src/app/icon.svg` |
| ThemeFab visible pill | ✅ done | verified via Playwright boundingBox |
| Card 05 cost-saving copy | ✅ done | `data.ts:155` |
| David's next review round on `/home-fde` | ⚪ not started | awaiting his comments |
| Port chosen design to production `/` | ⚪ not started | after sign-off |

## What didn't work (dead ends — do NOT retry)

- **Terracotta-drenched FDE recolour** — rejected by David as too harsh. Keep terracotta to small accents if it returns at all.
- **CSS Modules `composes` inside non-simple selectors** (`.heroTitle em { composes: ... }`) — Turbopack FATAL-panics ("composes cannot be used with a simple class selector"). Inline the properties instead. After this panic the dev server needs a restart even once fixed.
- **ThemeFab returning `null` until mounted** — button invisible long enough that David reported it missing. Render markup on SSR; gate only the icon/label on `mounted`.
- **`file:///P:/...` links and em dashes in UI copy** — standing bans (07-file-links rule; Claude-Design brief).
- **Don't trust the browser favicon tab** as proof of favicon state — it caches hard; David saw stale icons after files were replaced. Check `http://192.168.178.50:3000/icon.png` directly.

## Blockers (need external action)

- [ ] **David** — review `/home-fde` (new journeys grid) and give next round of comments — nothing proceeds to the production port until he signs off.
- [ ] **David / spawned task** — finish middleware→proxy migration (chip exists). Until then `src/middleware.ts` stays sidelined and `npm run dev` breaks if it's restored.
- [ ] **David** — rotate Plunk `sk_...` + Supabase `sbp_...` tokens (in `.claude/settings.local.json` + git history).

## First action for the next session (verify-before-act)

```bash
# 1. Dev server up and variants serving?
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/home-fde     # expect 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/home-claude  # expect 200
# If 000: check src/middleware.ts is still sidelined, then
#   nohup npm run dev -- -H 0.0.0.0 -p 3000 > /tmp/gwth-dev-server.log 2>&1 &

# 2. Middleware still sidelined? (expect the .sidelined file, no plain middleware.ts)
ls src/middleware.ts* src/proxy.ts

# 3. Tests green? (expect 253 passed)
npm test -- --run 2>&1 | tail -3

# 4. marketing/ still writable? (expect drwx...)
ls -ld src/components/marketing/
```

If any check fails, STOP and tell David — do not fix forward from this handoff alone.

## Next steps (after verification passes)

1. Collect David's comments on `http://192.168.178.50:3000/home-fde` (journeys grid was the last change; hero, pull quote, issues, dispatch band not yet critiqued in detail).
2. Iterate `home-fde.tsx` / `home-fde.module.css` per comments. Screenshot light+dark to `kanban/design-artefacts/2026-06-12-homepage-compare/` after each round (suffix `-v3`, `-v4`, ...).
3. On sign-off: port the FDE design into the production homepage (`src/app/(public)/page.tsx` currently renders `GwthRedesignHomePage` from `src/components/marketing/gwth-redesign/home-page.tsx`). Decide then whether to swap the component import or refactor in place; keep `/old-design` style escape hatch if David wants the previous version reachable.
4. Delete `/home-claude` (and `/home-fde` once merged) — comparison routes are scaffolding, not product.
5. File beads issues for the port once Dolt is back up.

## Don't do

- Don't restore `src/middleware.ts` while `src/proxy.ts` exists — the dev server will refuse to start. The migration chip owns this.
- Don't run any git write command (`commit`/`add`/`stash`) — ~522 uncommitted files belong to David's broader working tree; committing this session's files would drag unrelated work in.
- Don't touch `--logo-wordmark` / `--logo-accent` in `globals.css`, or any `[data-variant="*"]` block.
- Don't re-introduce gold `#d4a73c` into the favicon — terracotta `#a94c2e` matches the live locked logo accent.
- Don't edit the shared `JOURNEYS` copy in `data.ts` for variant-only wording — variant blurbs live in `home-fde.tsx`.
- Don't use em dashes in UI copy; don't use eyebrow pills; don't use `composes` outside simple class selectors.
- Don't trust "fonts/colours match" without a fresh Playwright screenshot compared against the FDE mockup.
- Don't kill the dev server when finishing up — David checks the URLs from P53 between sessions.

## Cheat sheet

```bash
# Dev server (LAN-visible)
nohup npm run dev -- -H 0.0.0.0 -p 3000 > /tmp/gwth-dev-server.log 2>&1 &

# Access-gate cookie for Playwright contexts
# context.addCookies([{ name: 'site_access', value: 'granted', url: 'http://localhost:3000' }])

# Screenshot pass (pattern used all session; run from project root so playwright resolves)
# - toggle dark:  document.documentElement.classList.toggle('dark', true)
# - full-page 1440px light+dark into kanban/design-artefacts/2026-06-12-homepage-compare/

# Tests / lint
npm test -- --run
npx eslint "src/components/marketing/home-fde/"

# Favicon regeneration (geometry + colours)
# paths: src/components/marketing/redesign/logo-gwth.tsx:127 (LogoGwthMark)
# arrow #a94c2e, glyph #22301f light / #edeae6 dark, tile #edeae6, sharp for rasters
```

---

## Paste-into-next-session opener

```
Read /home/david/projects/GWTH_V2/kanban/1_planning/HANDOFF_2026-06-12_homepage-fde-redesign-iteration.md end-to-end before doing anything else. It's a handoff from a previous session of mine. Follow the "First action" section to verify state before trusting anything in it, then proceed through "Next steps". Respect the "Don't do" list.
```
