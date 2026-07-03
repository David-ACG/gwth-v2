# Handoff: Port the four Claude Design bundles into the Next.js site — 2026-05-09

> Paste the one-line opener at the end of this file into a fresh Claude Code session to resume.

## Snapshot

| | |
|---|---|
| **Project** | `C:\Projects\GWTH_V2` |
| **Branch** | _no git repo here, `.git` absent_ |
| **Head commit** | _n/a, not a git checkout_ |
| **Uncommitted?** | _n/a, not a git checkout_ |
| **Status** | `four-bundles-ready-to-port` |
| **Blockers** | 0 |

## TL;DR (≤5 lines)

Across the 2026-05-08 evening session, four Claude Design surfaces were exported from a single homepage-derived template chat and bundled into `kanban/design-artefacts/2026-05-08/`: student dashboard, lesson viewer (multi-page + audiobook auto-advance + video + Q&A + mobile), public credential verify page, and lesson viewer widgets (feedback popout + highlight/notes). One bundle was rejected (lab page, see "What didn't work"). The Stone & Sage E2-E register, terracotta `#a94c2e` accent, share-ticker score card, and homepage editorial language are all locked. Job: port these four bundles into the Next.js app, one surface at a time, without redesigning anything. Marketing pages survey from the prior handoff is paused and lower priority than these ports.

## State of the world (external reality)

- **Dev server** at `http://localhost:3000` (Next.js 16 + Turbopack). If cold-started, run `npm run dev`.
- **SITE_PASSWORD access gate is on.** Set cookie before navigating in Playwright: `document.cookie = 'site_access=granted; path=/; max-age=86400'`.
- **No git repository** in `C:\Projects\GWTH_V2` (`.git` absent). Don't try `git status / commit / push`. Beads is local-only.
- **All quality gates green at handoff write-time.** 254/254 tests pass, build green (verified 2026-05-08 evening).
- **Background tasks**: none.

## State of the plan (decided, don't redo)

- **E2-E "Stone & Sage" is the locked editorial register.** Tokens already promoted to `:root` / `.dark` defaults in `src/app/globals.css`.
- **Logo accent is terracotta `#a94c2e`** in both modes. `--logo-wordmark` and `--logo-accent` in `:root` and `.dark`. Memory: `gwth-ai-logo-colours-locked-2026-05-08`. Don't touch.
- **Score-card share-ticker pattern is locked.** Implementation: `src/components/marketing/hero/hero-device.tsx` and primitives at `src/components/marketing/hero/`. The verify page port must reuse `<HeroDevice />` and friends, not reimplement.
- **No git remote, no PRs.** Local file changes only. Track work in beads.
- **Homepage editorial register is the typographic source of truth.** Public Sans display + body, Vollkorn italic for emphasis, JetBrains Mono for section labels and metadata. Sharp-bordered buttons (`border-2 rounded-none`, uppercase, tracking-wider). Borders not shadows.
- **Each Claude Design bundle is the visual source of truth for its surface.** Where bundle markup conflicts with existing Next.js components, prefer the bundle's intent and refactor the component. Where the bundle uses inline tokens, replace with the locked CSS variables.
- **Marketing pages survey from prior handoff is paused.** That work (`HANDOFF_2026-05-08_marketing-pages-editorial-port.md`) is lower priority than these four ports. Do not interleave it.
- **No git commits, no pushes, no PRs.** Local edits only. Each port closes a beads issue.

## Artefacts (external sources of truth)

### The four bundles to port (in recommended order)

| Order | Surface | Bundle | Key files | Notes |
|------|---------|--------|-----------|-------|
| 1 | **Student dashboard** | `kanban/design-artefacts/2026-05-08/dashboard-design-bundle/output/dashboard/` | `design-canvas.jsx`, `desktop-active.jsx`, `desktop-free.jsx`, `desktop-lapsed.jsx`, `mobile-active.jsx`, `shared.jsx`, `styles.css` | Three subscription states + mobile. Layout shell that hosts the lesson viewer. Port first because lesson viewer mounts inside this layout. |
| 2 | **Lesson viewer** | `kanban/design-artefacts/2026-05-08/lesson-viewer-design-bundle/output/` | `lesson-shell.jsx`, `surface-prose.jsx`, `surface-video-qa.jsx`, `surface-mobile-handoff.jsx`, `shared.jsx`, `styles.css` | Multi-page reading + audiobook auto-advance + video page + end-of-lesson Q&A + mobile. Includes the persistent audio bar with auto-advance toggle. Port second because dashboard layout must be stable first. |
| 3 | **Lesson viewer widgets** | `kanban/design-artefacts/2026-05-08/lesson-widgets-design-bundle/output/` | `widgets.jsx`, `surfaces.jsx`, `styles.css` | Feedback popout (right-edge pill, comments tied to section anchors) + highlight/notes (desktop-only annotation). Port third, bolt onto lesson viewer. No `shared.jsx`, widgets are self-contained. |
| 4 | **Public credential verify page** | `kanban/design-artefacts/2026-05-08/verify-page-design-bundle/output/` | `verify-desktop.jsx`, `verify-mobile.jsx`, `verify-shared.jsx`, `shared.jsx`, `styles.css` | Standalone public route at `/score/[id]`, no PublicNav, no Footer. Reuses `<HeroDevice />` for the score card. Port last (LinkedIn integration deferred to Phase 2/3 anyway). |

### Briefs (read these to understand intent before porting)

- `kanban/design-artefacts/2026-05-08/dashboard-design-bundle/BRIEF.md`
- `kanban/design-artefacts/2026-05-08/lesson-viewer-design-bundle/BRIEF.md`
- `kanban/design-artefacts/2026-05-08/lesson-widgets-design-bundle/BRIEF.md`
- `kanban/design-artefacts/2026-05-08/verify-page-design-bundle/BRIEF.md`

### Code source-of-truth files

| Ref | Purpose |
|-----|---------|
| `src/app/globals.css` | All tokens. Lines 99-172 (`:root`), 178-247 (`.dark`), 949-1057 (`[data-variant="e2-e"]` + variant tokens), 1061-1115 (variant utility classes). |
| `src/components/marketing/editorial-homepage/editorial-homepage.tsx` | Reference editorial idioms (mast-head, mono section eyebrows, italic serif accents, sharp buttons). |
| `src/components/marketing/hero/hero-device.tsx` | Locked share-ticker score card. Reuse on verify page. |
| `.claude/rules/design-system.md` | Stone & Sage rewritten 2026-05-08; typography + components reference. |
| `src/app/(public)/layout.tsx` | PublicNav + Footer wrapper. Verify page must NOT use this layout. |
| `src/app/(dashboard)/layout.tsx` | Dashboard shell (sidebar + header). Lesson viewer mounts inside this. |

## Progress

| Port | Status | Beads issue |
|------|--------|-------------|
| Dashboard surface (Stage 1) | ⚪ not started | _create on session start_ |
| Lesson viewer surface (Stage 2) | ⚪ not started | _create on session start_ |
| Lesson widgets (Stage 3) | ⚪ not started | _create on session start_ |
| Verify page (Stage 4) | ⚪ not started | _create on session start_ |

## What didn't work (dead ends, do NOT retry)

- **The lab page bundle was rejected.** A lab is just a video + instructions, basically a lesson-viewer variant, not the side-by-side instructions/workspace surface that was designed. Bundle is archived at `kanban/design-artefacts/2026-05-08/lab-page-design-bundle/output-rejected/` for reference only. **Do not port it.** When the lab page is revisited, treat it as a lesson-viewer variant with a "lab" chrome pill instead of designing a new surface.
- **The earlier homepage-match port already burned this lesson:** token-level CSS-variable plumbing is necessary but not sufficient. Components must apply `font-serif`, `variant-serif`, etc. to actually render. After each port, screenshot and visually compare against the bundle's `Dashboard.html` / `Lesson Viewer.html` / `Verify Page.html`, not just inspect computed styles.
- **Don't blanket-replace `font-sans` with `font-serif` on display headings.** `variant-serif` is for italic display lines + body emphasis only, never for h1.
- **Don't blanket-promote variant-* tokens out of `[data-variant="e2-e"]`** unless you also promote them in `:root` / `.dark` simultaneously, or wrapper-less utilities silently fail.

## Blockers (need external action)

_None._

## First action for the next session (verify-before-act)

Run these checks FIRST. Do not act on any claim above until verified:

```bash
# 1. Confirm dev server still up (or restart it)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/access
# Expected: 200 or 307. If 000, restart with `npm run dev`.

# 2. Confirm logo accent is still terracotta
grep -n "logo-accent: #" src/app/globals.css
# Expected: both --logo-accent values are #a94c2e.

# 3. Confirm score-card pattern intact in HeroDevice
grep -n "score-card-verify\|DEMO_SCORE_URL_DISPLAY" src/components/marketing/hero/hero-device.tsx
# Expected: both strings appear.

# 4. Confirm all four bundles extracted
ls kanban/design-artefacts/2026-05-08/dashboard-design-bundle/output/dashboard/
ls kanban/design-artefacts/2026-05-08/lesson-viewer-design-bundle/output/
ls kanban/design-artefacts/2026-05-08/lesson-widgets-design-bundle/output/
ls kanban/design-artefacts/2026-05-08/verify-page-design-bundle/output/
# Expected: each lists JSX + styles.css + HTML.

# 5. Tests + build
npm test -- --run 2>&1 | tail -5
npm run build 2>&1 | tail -10
# Expected: 254 tests passed, build exit 0.
```

If any check fails, STOP and tell the user. Do not "fix forward".

Then open each bundle's `*.html` in a browser to visually anchor on what you're porting. Do not skip this. The HTML is the visual source of truth, the JSX is the component reference.

## Next steps (after verification passes)

Port the bundles in order, one beads issue per port.

### Stage 1, dashboard (port first)

1. `bd create --title="Port dashboard design bundle to Next.js" --type=feature --priority=2`. Link bundle path in description.
2. Read `dashboard-design-bundle/BRIEF.md` end to end.
3. Open `output/dashboard/Dashboard.html` in a browser. This is the visual target.
4. Diff existing `src/app/(dashboard)/dashboard/page.tsx` and layout against the bundle. List delta, panels missing, panels to refactor, copy to update.
5. Apply changes one panel at a time. After each panel: screenshot + visual compare against the bundle HTML. Do not bundle 6 panels into one mega-edit.
6. Three subscription states (active / free / lapsed) plus mobile must all match the bundle.
7. Run `npm test -- --run`, `npm run build`. If both green, take fresh full-page screenshots in light + dark, save under `kanban/design-artefacts/2026-05-08/dashboard-design-bundle/after/`.
8. Close beads issue. Move on to Stage 2.

### Stage 2, lesson viewer

1. New beads issue. Same shape as Stage 1.
2. Bundle: `lesson-viewer-design-bundle/output/`. Visual target: `Lesson Viewer.html`.
3. The audio bar + auto-advance is novel. Likely needs a new client component with state machine (idle / playing / advancing / paused) and a per-page audio manifest. List manifest schema as a follow-up beads issue.
4. Multi-page reading state lives client-side; page boundary detection must hook into completion gates (intro video 80% watched + Q&A passed).
5. Q&A surface: pass / fail inline, no modal.
6. Mobile 412px must match the mobile surface in the bundle.
7. Tests, screenshots, close, move on.

### Stage 3, widgets

1. New beads issue. Bundle: `lesson-widgets-design-bundle/output/`. Visual target: `Lesson Viewer Widgets.html`.
2. Mount inside the lesson viewer shell from Stage 2 as fixed-position children. Z-index below the audio bar.
3. Two widgets: feedback popout (right-edge pill, panel slides out, composer with section-anchor pill) and highlight/notes (selection popover, persistent sage highlight, margin note marks, aggregated notes panel).
4. Mobile: feedback only, as a bottom sheet. Notes feature shows the desktop-only message.
5. Data models: comments scoped by `lessonId + pageNumber + sectionAnchor`, notes scoped by `lessonId + pageNumber + selectionRange`. Both private to the learner. List backend-table follow-ups as beads issues.
6. Tests, screenshots, close, move on.

### Stage 4, verify page

1. New beads issue. Bundle: `verify-page-design-bundle/output/`. Visual target: `Verify Page.html`.
2. Standalone route at `src/app/(public)/score/[id]/page.tsx` (or sibling). Do NOT use the public marketing layout, the dashboard layout, or the auth layout. Standalone shell with only a top-left `gwth.ai` mark and a thin institutional footer.
3. Reuse `<HeroDevice />` and primitives from `src/components/marketing/hero/`. Do not reimplement the score card.
4. Three states: verified (default), educational (first-time visitor with "What is a GWTH Score?" expanded), revoked.
5. The 5 credibility reasons block uses verbatim copy from the BRIEF, with italic Vollkorn lead phrases.
6. LinkedIn deep-link button is present but tagged `(coming soon)` since the integration is deferred.
7. Tests, screenshots, close, done.

### After all four ports

1. Run full test + lint + build. All must be green.
2. File any remaining backend-shape work (comments table, notes table, audio manifest, score history sparkline, LinkedIn deep-link wiring) as separate beads issues with clear titles. Do not start them in this session.
3. Summarise the four ports + open follow-ups in a single message back to David. Then stop.

## Don't do

- **Don't redesign anything.** The bundles are the design. Port the design as-is. If the design seems wrong, raise it as a question, do not "improve" silently.
- **Don't port the lab bundle.** It's archived as rejected. Treat lab as a lesson-viewer variant when revisited.
- **Don't modify `--logo-wordmark` or `--logo-accent`** in `globals.css`. Locked terracotta.
- **Don't touch `[data-variant="*"]` blocks** in `globals.css`.
- **Don't blanket-replace `font-sans` with `font-serif`.** Use `variant-serif` selectively.
- **Don't reinvent the score card.** Reuse `<HeroDevice />` and primitives.
- **Don't add inline editorial nav/footer** to any dashboard or lesson page. They live at the layout level.
- **Don't introduce new colour tokens.** Stone & Sage palette is locked.
- **Don't run `git` commands.** No `.git` directory here. Beads is local-only.
- **Don't use em dashes in UI copy.** Use commas or a colon. (Em dashes are fine in code comments.)
- **Don't use eyebrow pills.** Functional pills (status, tier, count, page-anchor) are fine.
- **Don't bundle multiple ports into one mega-edit.** One bundle, one beads issue, one screenshot pass.
- **Don't trust agent reports of "fonts matching".** Visually verify against bundle HTML.
- **Don't start backend wiring** in this session (comments DB, notes DB, audio manifest, LinkedIn deep-link). Each becomes a follow-up beads issue.
- **Don't pause for permission between stages.** Once verification passes and the user confirms the plan, execute all four stages autonomously per the global autonomy rules. Only stop on tests-failing-3-times or genuine ambiguity in a bundle.
- **Don't interleave the marketing-pages survey** from `HANDOFF_2026-05-08_marketing-pages-editorial-port.md`. That work is paused and lower priority.

## Cheat sheet

```bash
# Restart dev server cleanly
npm run dev    # Turbopack, serves http://localhost:3000

# Bypass site-password gate in browser console
document.cookie = 'site_access=granted; path=/; max-age=86400'

# Toggle theme in browser console
document.documentElement.classList.toggle('dark', true)   # dark
document.documentElement.classList.toggle('dark', false)  # light

# Open each bundle's HTML in default browser to anchor on the design
start "" "kanban\design-artefacts\2026-05-08\dashboard-design-bundle\output\dashboard\Dashboard.html"
start "" "kanban\design-artefacts\2026-05-08\lesson-viewer-design-bundle\output\Lesson Viewer.html"
start "" "kanban\design-artefacts\2026-05-08\lesson-widgets-design-bundle\output\Lesson Viewer Widgets.html"
start "" "kanban\design-artefacts\2026-05-08\verify-page-design-bundle\output\Verify Page.html"

# Test runs
npm test -- --run                                       # all 254
npm run lint
npm run build

# Beads, find work
bd ready
bd list --status=in_progress
bd search "port"
```

---

## Paste-into-next-session opener

```
Read C:\Projects\GWTH_V2\kanban\1_planning\HANDOFF_2026-05-09_port-claude-design-bundles-to-nextjs.md end-to-end before doing anything else. It's a handoff that walks you through porting the four Claude Design bundles from 2026-05-08 into the Next.js site. Follow the "First action" section to verify state before trusting anything in it, then proceed through "Next steps" stage by stage (dashboard, lesson viewer, widgets, verify page). Respect the "Don't do" list. The lab bundle is rejected, do not port it. Open each bundle's HTML in a browser before touching code so you anchor on the visual target. Run all four ports autonomously, one beads issue per port, screenshot-verify after each, do not pause for permission between stages.
```
