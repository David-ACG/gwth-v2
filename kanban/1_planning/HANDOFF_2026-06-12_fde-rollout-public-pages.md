# Handoff: FDE register rollout across public pages — 2026-06-12

> Paste the one-line opener from the end of this file into a fresh Claude Code session to resume.
> Supersedes `HANDOFF_2026-06-12_homepage-fde-redesign-iteration.md` (same arc, earlier state).

## Snapshot

| | |
|---|---|
| **Project** | `/home/david/projects/GWTH_V2` (this IS P520; serves the LAN at 192.168.178.50) |
| **Branch** | `master` |
| **Head commit** | `7a859f7 Repoint launch-board docs to new GWTH-launch-plan repo` |
| **Uncommitted?** | yes — ~525 files (months of David's work; NOT this session's alone) |
| **Status** | in-progress — rolling the FDE register out page by page |
| **Blockers** | 1 — middleware/proxy migration (chip exists) |

## TL;DR (≤5 lines)

The FDE journal register (`/home-fde`) is the chosen site design. This session fixed the two launch-blocking bugs (favicon served stale from `src/app/favicon.ico`; **React never hydrated via the LAN IP** until `allowedDevOrigins` was added), moved the theme toggle into the public nav, gave nav + footer dark-mode variants, and ported the first inner page: `/labs` is now fully FDE (approved by David, with difficulty-coloured card headers). Next: continue porting public pages (Lessons, Pricing, For Teams, About, News), then the homepage itself.

## State of the world (external reality)

- **Dev server running**: `next dev -H 0.0.0.0 -p 3000` (detached, logs `/tmp/gwth-dev-server.log`). David views from P53 at `http://192.168.178.50:3000/...`. It was restarted this session to apply `allowedDevOrigins`.
- **`src/middleware.ts` is still renamed** to `src/middleware.ts.sidelined-for-dev-server` — Next 16.2.4 refuses to start while both it and `src/proxy.ts` exist. Task chip "Finish middleware-to-proxy migration" owns this.
- **HEAD moved during the session** (6013734 → 7a859f7) via external sync, not this session's actions. Never assume the log is yours.
- **Beads/Dolt is down** — `bd` commands fail. No beads issues filed.
- **Plunk + Supabase secrets remain inlined** in `.claude/settings.local.json` and git history — David must rotate at the providers.
- Access gate bypass for scripts: cookie `site_access=granted`.

## State of the plan (decided — don't redo)

- **FDE register is THE site direction** (David: "calmer and more fun"). Source of truth: `src/components/marketing/home-fde/` + mockup at `http://192.168.178.50:3010/`.
- **`allowedDevOrigins: ["192.168.178.50"]`** added to `next.config.ts` — without it, pages served via the IP render but never hydrate (every button dead). This was the real cause of all "dark mode doesn't work" reports.
- **Theme toggle lives in the public nav, top right** (`src/components/shared/theme-toggle.tsx`, mounted in `src/components/layout/public-nav.tsx:84`). Icon shows the CURRENT mode (sun = light, moon = dark), CSS-driven. The floating ThemeFab + `marketing/compare/` are deleted — don't recreate.
- **PublicNav + Footer have explicit `dark:` Tailwind variants** in the FDE dark palette; wordmark uses locked `--logo-wordmark`/`--logo-accent` vars (auto-flips). Known cosmetic mismatch: dark nav over still-cream theme-fixed pages (/pricing, /about) until those are ported.
- **`/labs` is ported and approved**: new module `src/components/marketing/labs-fde/` (page = `src/app/(public)/labs/page.tsx`). Pattern to copy for further pages: scoped `--v-*` palette on `.shell` + `:global(.dark) .shell` override, serif body, mono metadata, colour-block card tops, flat filter controls with `color-scheme` per theme.
- **Lab card header colours are keyed to difficulty** (David's request): teal=beginner, moss=intermediate, rust=advanced — `DIFFICULTY_FLAVOURS` in `labs-fde.tsx`. Not position-cycled.
- **Favicon**: `src/app/favicon.ico` (file convention) SHADOWS `public/favicon.ico` — both must carry the new G-mark. Fixed and confirmed working by David.
- Old `LabCard`/`LabsFilter` in `src/components/lab/` left intact for future dashboard use — only the public page stopped using them.

## Artefacts (external sources of truth)

| Type | Ref | Purpose |
|------|-----|---------|
| Chosen design | `src/components/marketing/home-fde/` | Register source of truth |
| First ported page | `src/components/marketing/labs-fde/` | Pattern for further ports |
| Prior handoff | `kanban/1_planning/HANDOFF_2026-06-12_homepage-fde-redesign-iteration.md` | Earlier decisions + dead ends (terra rejection, favicon spec, composes panic) |
| Screenshots | `kanban/design-artefacts/2026-06-12-homepage-compare/` | `labs-fde-*-full.png`, `nav-toggle-*.png` are current |
| FDE mockup | `http://192.168.178.50:3010/` | Visual reference |

## Progress

| Task | Status | Ref |
|------|--------|-----|
| Favicon served correctly (`/favicon.ico`) | ✅ done + David-confirmed | `src/app/favicon.ico` replaced |
| Hydration via LAN IP | ✅ done | `next.config.ts` `allowedDevOrigins` |
| Theme toggle in nav, icon = current mode | ✅ done | `public-nav.tsx:84` |
| Nav + footer dark variants | ✅ done | `public-nav.tsx`, `footer.tsx` |
| `/labs` FDE port | ✅ done + David-approved ("It's great") | `marketing/labs-fde/` |
| Difficulty-coloured lab headers | ✅ done, verified by computed-style probe | `labs-fde.tsx` `DIFFICULTY_FLAVOURS` |
| Port remaining public pages (Lessons, Pricing, For Teams, About, News) | ⚪ not started | next step 1 |
| Port FDE design to production `/` | ⚪ not started | replaces `GwthRedesignHomePage` |
| Delete `/home-claude` scaffolding | ⚪ not started | after homepage port |

## What didn't work (dead ends — do NOT retry)

- **Testing interactivity via localhost only** — hydration failed via the IP origin while localhost worked, so two rounds of "dark mode works" claims were wrong for David. Always verify through `http://192.168.178.50:3000` with a Playwright click, not localhost.
- **Floating ThemeFab (bottom-right pill)** — superseded twice; David explicitly wants the nav-top-right icon toggle. Don't bring the fab back.
- **Position-cycled card flavours on /labs** — replaced by difficulty mapping at David's request.
- All dead ends in the prior handoff still stand (no terracotta drench, no `composes` outside simple selectors, no `file:///` links, no em dashes, browser favicon tab unreliable as proof).

## Blockers (need external action)

- [ ] **David / spawned task** — finish middleware→proxy migration (chip exists); until then `src/middleware.ts` stays sidelined.
- [ ] **David** — rotate Plunk `sk_...` + Supabase `sbp_...` tokens (`.claude/settings.local.json` + git history).
- [ ] **David** — pick the next page to port if not Lessons (step 1 assumes Lessons; any public page works).

## First action for the next session (verify-before-act)

```bash
# 1. Dev server serving the ported pages? (expect 200 200)
curl -s -o /dev/null -w "%{http_code}\n" http://192.168.178.50:3000/labs
curl -s -o /dev/null -w "%{http_code}\n" http://192.168.178.50:3000/home-fde
# If 000/refused: check middleware still sidelined (ls src/middleware.ts*), then
#   nohup npm run dev -- -H 0.0.0.0 -p 3000 > /tmp/gwth-dev-server.log 2>&1 &

# 2. allowedDevOrigins still in config? (expect a match)
grep allowedDevOrigins next.config.ts

# 3. Tests green? (expect 253 passed)
npm test -- --run 2>&1 | tail -3
```

If any check fails, STOP and tell David — do not fix forward from this handoff alone.

## Next steps (after verification passes)

1. Port `/lessons` to the FDE register: new `src/components/marketing/lessons-fde/` module copying the `labs-fde/` pattern (shell palette block verbatim, masthead, journal cards, filter bar if the page has one). Read the current page first: `src/app/(public)/lessons/`.
2. Then `/pricing`, `/for-teams`, `/about`, `/news` in whatever order David asks; screenshot light+dark via the IP origin after each and drop into `kanban/design-artefacts/2026-06-12-homepage-compare/`.
3. After inner pages: port `/home-fde` content into `src/app/(public)/page.tsx` (currently renders `GwthRedesignHomePage` from `marketing/gwth-redesign/home-page.tsx`).
4. Delete `/home-claude` (and `/home-fde` once merged) — comparison scaffolding.
5. File beads issues + update launch board (`track: website` W-tasks) once Dolt is back / if a W-task maps.

## Don't do

- Don't restore `src/middleware.ts` while `src/proxy.ts` exists — dev server won't start.
- Don't run git write commands (`commit`/`add`/`stash`) — ~525 uncommitted files are David's broader tree.
- Don't verify interactivity on localhost only — use the IP origin (see dead ends).
- Don't touch `--logo-wordmark`/`--logo-accent` definitions in `globals.css` or any `[data-variant="*"]` block.
- Don't edit shared `JOURNEYS`/`CURRICULUM` copy in `marketing/data.ts` for page-specific wording — keep page-local maps like `JOURNEY_BLURBS`.
- Don't import across feature modules (e.g. `marketing/*` must not import `components/lab/*`) — copy the pattern, don't reach across.
- Don't use em dashes in UI copy, eyebrow pills, side-stripe borders, `composes` outside simple class selectors, or `file:///` links.
- Don't kill the dev server when finishing — David checks URLs from P53 between sessions.

## Cheat sheet

```bash
# Dev server (LAN-visible)
nohup npm run dev -- -H 0.0.0.0 -p 3000 > /tmp/gwth-dev-server.log 2>&1 &

# Playwright pattern: scripts MUST live in the project root (ESM resolves
# playwright relative to the script file, not cwd). Cookie bypasses the gate:
# await context.addCookies([{ name: "site_access", value: "granted", url: "http://192.168.178.50:3000" }])
# Toggle dark like a user: page.locator('button[aria-label="Toggle theme"]').click()

# Tests / lint
npm test -- --run
npx eslint src/components/marketing/labs-fde/

# FDE palette source (copy the .shell + :global(.dark) .shell blocks verbatim)
# src/components/marketing/labs-fde/labs-fde.module.css (latest iteration)
```

---

## Paste-into-next-session opener

```
Read /home/david/projects/GWTH_V2/kanban/1_planning/HANDOFF_2026-06-12_fde-rollout-public-pages.md end-to-end before doing anything else. It's a handoff from a previous session of mine. Follow the "First action" section to verify state before trusting anything in it, then proceed through "Next steps". Respect the "Don't do" list.
```
