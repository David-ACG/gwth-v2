# Handoff: Make `/` look like `/redesign_v2` (+ favicon decision) — 2026-05-08

> Paste the one-line opener from the end of this file into a fresh Claude Code session to resume.

## Snapshot

| | |
|---|---|
| **Project** | `C:\Projects\GWTH_V2` |
| **Branch** | _no git repo here — `.git` absent_ |
| **Head commit** | _n/a — not a git checkout this session_ |
| **Uncommitted?** | _n/a — but multiple files edited this session, see Progress_ |
| **Status** | `awaiting-user-decision` (Option 1 vs Option 2) + `awaiting-fresh-favicon-audit` |
| **Blockers** | 2 — user decision on layout-port scope; favicon audit not yet trustworthy |

## TL;DR (≤5 lines)

E2-E "Stone & Sage" colour palette and locked logo colours are now wired into `:root` / `.dark` defaults; Vollkorn + Public Sans CSS variables are in place. **Production `/` still does NOT visually match `/redesign_v2`** because (a) no homepage component applies `font-serif` so headings/body all render Public Sans, (b) buttons are rounded sentence-case while `/redesign_v2` uses sharp uppercase, (c) `/redesign_v2`'s mast-head + pull-quote / drench / postscript editorial sections don't exist on `/`. User has been offered Option 1 (port the redesign_v2 layout to `/`) vs Option 2 (incremental serif/button upgrades) and has not yet chosen. Favicon audit is also outstanding.

## State of the world (external reality)

- **Dev server** running at `http://localhost:3000` (Next.js 16 + Turbopack), started this session via `npm run dev`. Background task ID was `b03f2567b` in this session — **a new session must restart it** with `npm run dev` if not already running.
- **SITE_PASSWORD access gate is on.** Bypass for Playwright/manual checks by setting cookie before navigating:
  ```js
  document.cookie = 'site_access=granted; path=/; max-age=86400'
  ```
- **No git repository** in `C:\Projects\GWTH_V2` (`.git` does not exist). Don't try to commit, push, branch, or run any `git` command — they will fail. Beads (`bd`) is local-only too.
- **Multiple node processes** lingering from prior `npm run dev` attempts; if port 3000 conflicts, kill stale node PIDs first.
- **Theme provider** sets `light` as default; toggle in DevTools via `document.documentElement.classList.toggle('dark', true|false)`.

## State of the plan (decided — don't redo)

- **E2-E "Stone & Sage" is the locked redesign winner** (chosen 2026-04-29, accent revised 2026-04-30). Light: warm-stone bg `oklch(0.965 0.004 75)`, charcoal-stone fg, terracotta `#a94c2e` primary. Dark: deep warm forest bg `oklch(0.2 0.005 75)`, warm off-white fg, same terracotta primary.
- **Logo colours locked** via `--logo-wordmark` / `--logo-accent` CSS vars in `globals.css`. Light wordmark `#22301f`, dark wordmark `#edeae6`, accent `#d4a73c` gold (both modes). `<LogoGwth />` defaults to those vars — never pass colour props.
- **E2-E colour tokens promoted to `:root` / `.dark` defaults** this session. The `[data-variant="e2-e"]` block is now redundant but kept in place so `/redesign_v2` palette-explorer keeps working.
- **`design-system.md` colour tables rewritten** this session to reflect Stone & Sage (was still documenting aqua/mint).
- **Editorial vocabulary already applied** to `/pricing` (`src/app/(public)/pricing/page.tsx`) and `/for-teams` (`src/app/(public)/for-teams/page.tsx`) in earlier sessions: editorial mast-heads, mono section eyebrows, no eyebrow-pill antipattern, `bg-card border-border` panels.
- **Other variants left intact** (`a..h`, `e2-a..f`, `e3`) — they power the `/redesign/v-*` explorer pages. Don't delete.
- **Fonts**: Vollkorn + Public Sans loaded via `next/font/google` in `src/app/layout.tsx` (verify); `--font-sans` chains Public Sans → Inter; `--font-serif` chains Vollkorn → Georgia. Variable plumbing is done; **what remains is applying `font-serif` class on display headings**.

## Artefacts (external sources of truth)

| Type | Ref | Purpose |
|------|-----|---------|
| Globals CSS | `file:///C:/Projects/GWTH_V2/src/app/globals.css` | All token defaults; lines 99-172 (`:root`), 178-247 (`.dark`), 943-993 (`[data-variant="e2-e"]`) |
| Design rule | `file:///C:/Projects/GWTH_V2/.claude/rules/design-system.md` | Stone & Sage tables (rewritten 2026-05-08); typography + components |
| Brand brief | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/brand-brief/BRAND_BRIEF.md` | Voice, audience, positioning |
| Logo SVG component | `file:///C:/Projects/GWTH_V2/src/components/marketing/redesign/logo-gwth.tsx` | Theme-aware; defaults to CSS vars |
| Palette explorer (target visual) | `file:///C:/Projects/GWTH_V2/src/components/marketing/redesign/palette-explorer.tsx` | Source layout for editorial port (Option 1) |
| Production homepage | `file:///C:/Projects/GWTH_V2/src/app/(public)/page.tsx` | Current `/` entry; renders Hero + ProductPillars + ResearchStats + PricingCards + FinalCTA |
| Hero component | `file:///C:/Projects/GWTH_V2/src/components/marketing/hero/hero.tsx` | Where `font-serif` would land for h1 |
| Public layout | `file:///C:/Projects/GWTH_V2/src/app/(public)/layout.tsx` | Wraps PublicNav + Footer |
| Public nav | `file:///C:/Projects/GWTH_V2/src/components/layout/public-nav.tsx` | Logo placement (verify it uses `<LogoGwth />`) |
| Logo picker reference | `http://localhost:3000/logo_picker` | Live colour-locked logo |
| Redesign target page | `http://localhost:3000/redesign_v2` | Editorial visual target |
| Production homepage | `http://localhost:3000/` | The page that needs to match |
| Screenshots — promotion | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-05-08/e2e-promotion/` | Light/dark of /, /pricing, /for-teams after E2-E promotion |
| Screenshots — homepage match attempts | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-05-08/homepage-match/` | `baseline/`, `after/`, `after-fonts/` from prior agents |
| User comparison shot | `file:///C:/Projects/GWTH_V2/screenshots/March/2026-05-08_142157.jpg` | The "these don't look the same" side-by-side |

## Progress

| Task | Status | Ref |
|------|--------|-----|
| Promote E2-E colour tokens to `:root` / `.dark` defaults | ✅ done | globals.css `:root` lines 99-172, `.dark` lines 178-247 |
| Lock `--logo-wordmark` / `--logo-accent` CSS vars | ✅ done (earlier session) | globals.css logo block; `<LogoGwth />` defaults to them |
| Rewrite Stone & Sage tables in design-system.md | ✅ done | `.claude/rules/design-system.md` |
| Wire up Vollkorn + Public Sans CSS vars | 🟡 claimed done by prior agent — **NEEDS VISUAL VERIFICATION** | `globals.css` `@theme inline` block + `src/app/layout.tsx` font imports |
| Swap bitmap logos to `<LogoGwth />` SVG | 🟡 claimed by prior agent — **NEEDS VERIFICATION** across PublicNav, Footer, MarketingFooter, OG generators | `src/components/layout/public-nav.tsx` etc. |
| Apply `font-serif` to display headings on `/` | ⚪ not started — this is the missing visual flip | Hero h1, PricingCards h2, ProductPillars h2 |
| Switch buttons to sharp + uppercase to match `/redesign_v2` | ⚪ pending Option 1 vs 2 user decision | `src/components/ui/button.tsx` + tailwind variants |
| Add editorial pull-quote / drench / postscript sections to `/` | ⚪ pending Option 1 vs 2 user decision | New components or port from `palette-explorer.tsx` |
| Favicon audit | 🟡 claimed by prior agent — report cut off; no decision delivered to user | `public/favicon.{ico,svg}`, `public/icon-*.png`, `public/apple-touch-icon.png` |
| Investigate "empty middle block" on home screenshots | ⚪ flagged by E2-E-promotion agent; never resolved | `src/app/(public)/page.tsx` |

## What didn't work (dead ends — do NOT retry)

- **Trusting agent reports of "fonts matching" without visual verification.** Two prior agents in this session reported "Public Sans applied globally" / "fonts confirmed matching" via `getComputedStyle` checks. The user looked at actual rendered screenshots and disagreed. Lesson: token-level wiring (CSS variable plumbing) is necessary but not sufficient — components must apply `font-serif` class for serif to actually render. Always re-screenshot and visually compare, not just inspect computed styles.
- **Token promotion alone closes the colour gap but not the layout gap.** After promoting E2-E tokens to `:root`, the user still saw `/` looking different from `/redesign_v2` because typography classes, button shapes, and editorial section structure all live in components, not tokens. Don't expect another globals.css edit to fix this.
- **Treating `/pricing` and `/for-teams` as "polished" while they shipped aqua/mint.** Earlier sessions added editorial vocabulary (mast-heads, mono eyebrows) to those pages but didn't realise the default theme was still aqua/mint, so visitors saw editorial structure with the old palette. Resolved by the E2-E promotion this session — but watch for similar half-landed work elsewhere.

## Blockers (need external action)

- [ ] **User**: choose between Option 1 (port `/redesign_v2` editorial layout to `/` directly — extract page-shell from `palette-explorer.tsx`, strip palette-picker scaffolding, swap into `(public)/page.tsx`) or Option 2 (incremental: add `font-serif` to display headings, switch Buttons to sharp+uppercase, add a single editorial pull-quote between Hero and ProductPillars). Posed in last assistant message; no answer yet.
- [ ] **User**: favicon. Existing files in `public/`: `favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `icon.png`, `icon-light.png`. Prior agent never delivered the audit verdict. If none use deep-forest `#22301f` + gold `#d4a73c`, the user needs to commission a new favicon (probably G-mark only, not full wordmark, scalable to 16/32/96 PNG + SVG + .ico).

## First action for the next session (verify-before-act)

Run these checks FIRST — do not act on any claim above until verified:

```bash
# 1. Confirm dev server still up (or restart it)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/access
# Expected: 200 (gate page) or 307 (redirect). Anything else → restart with `npm run dev`.

# 2. Confirm globals.css E2-E promotion is intact
grep -n "oklch(0.965 0.004 75)" src/app/globals.css | head -2
# Expected: at least one match in :root block (around line 102) and one in [data-variant="e2-e"] (~943).

# 3. Confirm logo CSS vars are still locked
grep -nE "logo-wordmark|logo-accent" src/app/globals.css
# Expected: 4 hits (light + dark, wordmark + accent).

# 4. Confirm Vollkorn / Public Sans variables wired
grep -nE "var\(--font-public-sans|var\(--font-vollkorn" src/app/globals.css | head -4
# Expected: at least one --font-sans line referencing public-sans, one --font-serif line referencing vollkorn.

# 5. Confirm tests still green and build still passes
npm test -- --run 2>&1 | tail -5
npm run build 2>&1 | tail -10
# Expected: 236 tests passed, build exit 0.
```

If any check fails, STOP and tell the user — do not try to "fix forward" based on the handoff alone.

Then visually verify via Playwright MCP (cookie required):

```js
// In Playwright/DevTools console
document.cookie = 'site_access=granted; path=/; max-age=86400'
```

Navigate to `/` and `/redesign_v2`, take 1440×900 full-page screenshots of both light + dark, and visually compare typography (serif vs sans on body), button shape (rounded vs sharp), and section presence (pull-quote panel on /redesign_v2 absent on /). **Do not trust earlier "fonts matching" claims** — confirm with your own eyes.

## Next steps (after verification passes)

1. **Read the user's reply to the Option 1 vs Option 2 question** (last message in the previous conversation). If user has answered, proceed accordingly. If not, ask them once and wait.
2. **If Option 1 (port editorial layout):**
   - Read `src/components/marketing/redesign/palette-explorer.tsx` end-to-end. The page-shell content (mast-head, drench section, hero, score-vis embed, pull-quote, postscript, footer) starts after the swatch-picker control bar — find the boundary.
   - Extract the page-shell into a new component, e.g. `src/components/marketing/redesign/editorial-homepage.tsx`. Remove the swatch-picker hooks, theme-toggle button, and any `useState` related to palette overrides.
   - Replace `src/app/(public)/page.tsx` to render `<EditorialHomepage />` instead of the current Hero + ProductPillars + … composition (or keep the existing composition as a fallback if needed for tests).
   - Verify the existing 236 tests still pass — some may assert on Hero / PricingCards / ProductPillars markup. Update tests minimally if structural changes break them.
3. **If Option 2 (incremental upgrade):**
   - Add `font-serif` class to: Hero h1 (`src/components/marketing/hero/hero.tsx`), PricingCards h2 (only when not headingless), ProductPillars h2.
   - Update Button defaults: `rounded-none` (or a more conservative `rounded-sm`) and `uppercase tracking-wide` for the primary `default` variant. Be careful — this affects every Button site-wide; consider a new variant `editorial` if that's too disruptive.
   - Add one editorial pull-quote section between Hero and ProductPillars in `(public)/page.tsx` — copy a `variant-warm-panel` block (mustard yellow) from `palette-explorer.tsx`. Note: `--variant-warm-panel-bg` etc are still scoped to `[data-variant="e2-e"]`; either promote those tokens too or wrap the pull-quote in `<div data-variant="e2-e">` locally.
4. **Favicon audit (do this FIRST regardless of option):**
   - Read `public/favicon.svg` — check fill colours. Locked target: wordmark `#22301f` (light) / `#edeae6` (dark), accent `#d4a73c`.
   - Read `src/app/layout.tsx` and any `app/icon.tsx` / `app/apple-icon.tsx` — see what favicon paths are wired.
   - If `favicon.svg` matches: report "favicon OK, no action".
   - If it doesn't match: tell the user explicitly — give the spec for the new favicon (probably the G-mark only, not full wordmark; SVG + 16/32/96 PNGs + 180×180 apple-touch-icon + .ico). **Do NOT generate the favicon yourself** — defer to user (they may use Claude Design or realfavicongenerator.net).
5. **Re-screenshot** `/` light + dark side-by-side with `/redesign_v2` light + dark. Save to `kanban/design-artefacts/2026-05-08/homepage-match/<timestamp>/`. Compare and report.
6. Run `npm run lint`, `npm test`, `npm run build`. All must pass before reporting done.

## Don't do

- **Don't trust prior agent reports of "fonts matching"** — verify visually. The user has already once corrected an agent on this; don't repeat the mistake.
- **Don't restructure homepage components without user signing off on Option 1 vs Option 2.** The two options have very different blast radii.
- **Don't run `git` commands** — there is no `.git` directory here. Beads is local-only; don't try `bd dolt push/pull` either.
- **Don't generate a favicon yourself.** Audit and report. The user asked to be asked.
- **Don't alter `--logo-wordmark` or `--logo-accent`.** Separately locked.
- **Don't touch `[data-variant="*"]` blocks** in globals.css — they back the `/redesign/v-*` and `/redesign_v2` explorer pages.
- **Don't blanket-replace `font-sans` with `font-serif`.** Only add `font-serif` where `/redesign_v2` clearly uses serif (display headings + the "If you can describe what you want…" pull-quote body); body paragraphs in `/redesign_v2` may also be serif — check before applying broadly.
- **Don't remove the original homepage composition** without confirming tests still pass on the replacement. Several tests assert on PricingCards / ProductPillars markup.
- **Don't let the dev server's "EV: Month 3" debug overlay** distract you — it's a pre-existing dev banner, not part of the redesign.

## Cheat sheet

```bash
# Restart dev server cleanly (kill stale node, then start)
# Find PIDs: Get-Process node | Select Id, StartTime
# Kill: Stop-Process -Id <pid>
npm run dev    # Turbopack; serves http://localhost:3000

# Bypass site-password gate in browser console
document.cookie = 'site_access=granted; path=/; max-age=86400'

# Toggle theme in browser console
document.documentElement.classList.toggle('dark', true)   # dark
document.documentElement.classList.toggle('dark', false)  # light

# Targeted test runs
npm test -- --run src/app/\(public\)/pricing
npm test -- --run src/app/\(public\)/for-teams
npm test                                          # all 236

# Read computed font on a page (Playwright/DevTools)
getComputedStyle(document.body).fontFamily
getComputedStyle(document.querySelector('h1')).fontFamily

# Find logo placements still on bitmaps
grep -rn "logo-light\|logo_dark\|logo.png" src/

# Quick beads check (local-only)
bd ready
bd list --status=in_progress
```

---

## Paste-into-next-session opener

```
Read C:\Projects\GWTH_V2\kanban\1_planning\HANDOFF_2026-05-08_homepage-match-redesign-v2.md end-to-end before doing anything else. It's a handoff from a previous session of mine. Follow the "First action" section to verify state before trusting anything in it, then proceed through "Next steps". Respect the "Don't do" list.
```

---

## Resolution — 2026-05-08 15:55

**Status:** `resolved` (port complete; favicon deferred with spec).

### What was done
- Verification step: dev server up (200), 236 tests pass, E2-E tokens promoted, logo vars locked, font vars wired — all five "first action" checks green.
- **Empty-middle bug was a false alarm.** `/` was rendering all 8 sections fine (heights summed to 7272 px); the apparent gap was a thumbnail-rendering artefact at ~27% scale where light-bg content blends together. No fix needed.
- **`/redesign_v2` h1 also renders Public Sans** — handoff's `font-serif` theory was wrong. `variant-serif` is applied selectively to italic display lines + body paragraphs in the editorial sections, not h1. The visual gap was structural (mast-head, pillar/journey/drench/postscript sections, sharp uppercase buttons), not display-font.
- **Option 1 chosen and executed.** Created `src/components/marketing/editorial-homepage/editorial-homepage.tsx` (server component) extracted from `PaletteExplorer` minus the swatch picker, inline header, and inline footer. Updated `(public)/page.tsx` to render `<EditorialHomepage />`. Layout's `PublicNav` + `Footer` provide the chrome.
- **Favicon spec written, regeneration deferred.** Audit confirmed `public/favicon.svg` (RealFaviconGenerator 2026-04-29) contains zero of the locked colours. Spec at `kanban/1_planning/SPEC_2026-05-08_favicon-regeneration.md`. Per memory note, Claude Code does NOT generate the favicon itself — handed off to realfavicongenerator.net or a human design pass.

### Verification artefacts
- After-port screenshots: `kanban/design-artefacts/2026-05-08/homepage-match/after-port/home-light.png` and `home-dark.png` (1440×~6500, full page).
- Side-by-side reference: `redesign-v2-light.png` / `redesign-v2-dark.png` in `homepage-match/verify/`.

### Quality gates
| Gate | Result |
|------|--------|
| `npm test` | 235/236 (one unrelated flaky timeout in `site-access.test.ts` — passes in isolation in 90 ms) |
| `npm run lint` | 0 errors (1 pre-existing warning in `scripts/font-probe.mjs`) |
| `npm run build` | ✓ Compiled successfully in 29.7 s; 64/64 static pages generated |

### Beads tracking
- `beads_GWTH-796` — Port E2-E redesign_v2 editorial layout to production homepage — **closed (done)**.
- `beads_GWTH-3ak` — Port v-a-1 (A1 Field Notebook Refined) — **closed (superseded by GWTH-796)**.
- `beads_GWTH-r7a` — Regenerate favicon for locked 2026-04-30 logo colours — **open (deferred to design pass)**.

### Files changed
- Added `src/components/marketing/editorial-homepage/editorial-homepage.tsx`
- Replaced `src/app/(public)/page.tsx`
- Added `kanban/1_planning/SPEC_2026-05-08_favicon-regeneration.md`
- Updated memory `project_a1_chosen.md`

### What did NOT change (intentionally)
- `src/app/globals.css` (already had E2-E tokens promoted from prior session)
- `src/app/layout.tsx` (font wiring already in place)
- Existing homepage components (Hero, ProductPillars, etc.) remain — still used by `/redesign/v-*` explorer pages
- Public/layout.tsx (PublicNav + Footer kept; the editorial port piggy-backs on them)
- Favicon files (per user decision: spec only, defer the work)
