# Handoff: GWTH Redesign POC — Phase 0 Logo Vector Finalisation — 2026-04-26

> Paste the one-line opener from the end of this file into a fresh Claude Code session to resume.

## Snapshot

| | |
|---|---|
| **Project** | `C:\Projects\GWTH_V2` |
| **Branch** | `experiment/redesign-poc-2026-04` |
| **Head commit** | `8eee10e chore: auto-commit 4 files changed` (auto-commit hook is on) |
| **Uncommitted?** | no — working tree clean |
| **Status** | in-progress · Phase 0 step 3 (vector finalisation) about to start |
| **Blockers** | none — Claude (next session) draws SVG; David reviews and iterates |

## TL;DR (≤5 lines)

GWTH.ai redesign POC, 2 pages (homepage + student dashboard), running interactively (NOT `/build` headless). Phase 0 (logo) is mid-flight. Brand brief written. Concept locked: **wordmark "GWTH.ai" with the G's interior carved out as a mint up-right arrow + matching mint tittle on the i in `.ai`**. Image-tool iteration is exhausted (Stitch + OpenAI; ~7 rounds). Next session's job: **draft the wordmark + monogram + dark/light variants as clean SVG**, render scale tests at 256/64/32, hand David the 512 PNG so he can run realfavicongenerator.net for the favicon set, then close `bm5` and unblock Phase 1a.

## State of the world (external reality)

- **Claude Design quota**: still ~0% used (Phase 0 only used Stitch + OpenAI; Claude Design itself is reserved for Phase 1a homepage exploration). Weekly reset Sat 02:00. Baseline screenshot at `kanban/design-artefacts/2026-04-24/quota-snapshots/2026-04-25_pre-poc-start.jpg`. Re-snapshot before starting Phase 1a.
- **P520 dev URL**: http://192.168.178.50:3001 reachable, returns 200 on `/`, 307 redirect on `/dashboard` (Supabase auth — expected). Not used in Phase 0; will matter for Phase 1b deploy.
- **Impeccable skill installed globally** at `~/.claude/skills/impeccable/` (source-install — `npm`-installed `impeccable@2.1.7` provides `npx impeccable` execution). Available skills list in the Skills tool now shows `impeccable: Use when the user wants to design...`. Use `/audit /critique /polish` during Phase 1b verify.
- **Bun installed** (`v1.3.13` via `npm install -g bun`).
- **No background tasks running.**

## State of the plan (decided — don't redo)

**Logo concept (Phase 0):**
- Wordmark "GWTH.ai" — bold geometric sans (Geist / Inter Display / Cabinet Grotesk family)
- The G's interior is a mint up-right arrow that *replaces* the G's leg (custom letterform, not a separate icon)
- The dot/tittle on the lowercase `i` in `.ai` is mint — visual rhyme with the arrow
- WTH and `ai` letterforms are the foreground colour (white on dark / warm-charcoal on light)
- One accent only (mint). NO blue, NO teal, NO second colour, NO gradients, NO glow
- Reference visual quality: Linear / Vercel / Stripe / Notion / Supabase — productivity tools, NOT e-learning
- Mint colour: `#1CBA93` for dark mode, `#0E9F76` (or close) for light mode — needs slightly darker mint in light mode to maintain pop against warm-off-white ground
- Dark mode ground: warm charcoal `#191817`. Light mode ground: warm off-white `#FAF8F4` (NOT pure white, NOT pure black)
- The canonical reference image is `kanban/design-artefacts/2026-04-24/concepts/wordmark/stitch-A-arrow-G-v3-dark-with-mint-tittle.png` — this is the visual target for vectorising

**Dashboard direction (Phase 2a, blocked on Phase 1):**
- Continue-Lesson hero card replaces generic "Continue Learning" CTA
- Dynamic Score tile on hero strip (NOT just on `/progress`) — 100-point system: 100 = mandatory + 3 capstones; >100 = optional; <100 = incomplete or decayed; QR + shareable URL for LinkedIn
- `dynamicScore.percentile` to be DROPPED (David 2026-04-25)
- 3-card KPI strip: hours this week + sessions this week + score change this week
- Activity heatmap (rename from `StudyStreakCalendar`, no consecutive-day counter)
- Skip leaderboards / XP / streaks. Skip cohort widget v1. Skip Cmd+K hint button (keyboard-only). Visitor framing stays "locked + subscribe"
- 3 deferred dashboard decisions (lapsed-state design, first-time-user flow, cohort/team enrolment infra) — answer when David is ready, not blocking

**Branding:**
- GWTH = "Growth With Tech and Humans" — explainer on About page only, NOT the hero
- Hero copy stays as-is: "Stop watching AI change the world. Start building with it."
- 7 audience journeys; 4 covered on homepage today; 3 NEW journey-section drafts at `BRAND_BRIEF.md` §2c ready for Phase 1b
- No brand tagline; positioning copy is the work, not slogans

## Artefacts (external sources of truth)

| Type | Ref | Purpose |
|------|-----|---------|
| Plan | `file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-04-24_gwth-redesign-poc.md` | Full POC plan; §0 has all decisions; §17 the interactive-mode contract |
| Brand brief | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/brand-brief/BRAND_BRIEF.md` | Voice, audience, palette, logo deliverables, paste-ready paragraph for design tools |
| Dashboard synthesis | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/baselines/dashboard-current-and-inspiration.md` | Current state + research + widget catalogue + decisions log |
| Quota baseline | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/quota-snapshots/2026-04-25_pre-poc-start.jpg` | Re-snapshot before Phase 1a |
| Concept reference | `file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/concepts/wordmark/stitch-A-arrow-G-v3-dark-with-mint-tittle.png` | THE visual target for SVG drafting |
| Beads | `bm5` in_progress; `6om`/`w5y`/`9t0`/`eay`/`m0s`/`6if`/`32e` blocked behind it | `bd show beads_GWTH-bm5` |
| Project CLAUDE.md | `file:///C:/Projects/GWTH_V2/CLAUDE.md` | Stack, conventions, sibling repos |
| Global rules | `~/.claude/CLAUDE.md` + `~/.claude/rules/` | Autonomy, kanban gates, infra |

## Progress

| Task | Status | Ref |
|------|--------|-----|
| Pre-flight (`suy`) — branch + folders + baselines + quota | ✅ done | bd closed |
| Impeccable install (`72z`) | ✅ done | bd closed |
| Phase 0 step 1 — Brand brief | ✅ done | `BRAND_BRIEF.md` |
| Phase 0 step 2 — Concept generation in Stitch + OpenAI | ✅ done (concept locked) | `concepts/wordmark/stitch-A-arrow-G-v3-*.png` |
| Phase 0 step 3 — Vector finalisation (SVG) | 🟡 next session starts here | `bm5` in_progress |
| Phase 0 step 4 — Favicon set generation | ⚪ blocks on step 3 — David uploads 512 PNG to realfavicongenerator.net |
| Phase 0 step 5 — Commit logo files to `public/` | ⚪ blocks on step 4 |
| Phase 1a — Homepage Claude Design exploration | ⚪ blocked on `bm5` close |
| Phase 1b — Homepage Claude Code implementation + P520 deploy | ⚪ blocked on `6om` close |
| Quota gate (`9t0`) | ⚪ blocked on Phase 1b |
| Phase 2a, 2b, 3, 5 | ⚪ blocked downstream |

## What didn't work (dead ends — do NOT retry)

- **Stitch generating original concepts** — produces generic-AI-startup defaults (chips, eyes, leaves, glowing G) regardless of how sharp the prompt is. Use Stitch ONLY to refine an existing image.
- **OpenAI image tool with `n>1`** (multi-image grids) — David tried 6-image generation; results were weak. Single-image generation produced the breakthrough concept (`openai-A-arrow-G-v1.png`). **Use 1-image mode only** if you need to fall back to image tools.
- **Stitch icon-only crop** — when given the wordmark image and asked to "show only the G+arrow mark, centred, filling canvas", Stitch broke the G into two brackets and floated `.ai` text in negative space (see `concepts/icon/stitch-A-icon-only-FAIL-v1.png`). Image tools cannot reliably crop. The icon-only mark MUST be vectored manually from the wordmark.
- **Stitch in light mode** — produced the wordmark fine but the mint at `#1CBA93` washes out against warm-off-white. Solvable in vector by darkening to `#0E9F76` for light mode. Don't ask Stitch to "make the light version pop more" — it'll either over-saturate or invent a new colour.
- **`Bun.Bun` via winget** — package doesn't exist. Use `npm install -g bun` (~24 s).
- **Impeccable dist build** (`bun run build` then `cp dist/claude-code/.claude/* ~/.claude/`) — v3.0.1 of the build prepends an empty-description frontmatter wrapper that makes the skill description show as `---` in the Skills tool list. Use **source-install** instead: `cp -r /c/Projects/_tools/impeccable/source/skills/impeccable/. ~/.claude/skills/impeccable/`. Functionally identical content; correct frontmatter. (npm package `impeccable@2.1.7` provides the `npx impeccable` runtime — both install paths rely on it.)
- **`npm run dev` on Windows/Git-Bash/Node 22** — segfaults the bash wrapper. Workaround: `node ./node_modules/next/dist/bin/next dev --turbopack -p 3001`. Lifted from the FB Track A handoff. Will matter for Phase 1b.
- **Gemini Advanced screenshot QA** (FB Track A learning) — ~85% hallucination rate on Tailwind class recommendations. Not used in this POC; do NOT add it back.
- **Dashboard literal-screenshot baseline** — `/dashboard` is auth-gated (Supabase 307 redirect). David opted for option (c) — code-read + research synthesis at `dashboard-current-and-inspiration.md` IS the baseline. Do NOT chase a test-user login.
- **Tagline writing** — David tried a hero tagline framing earlier; correctly rejected as cheesy. Use **positioning copy**, not slogans (already in CLAUDE.md / hero).

## Blockers (need external action)

- _None._ The vector work is unblocked; David is available to review SVG iterations through the day.

## First action for the next session (verify-before-act)

Run these checks FIRST — do not act on any claim above until verified:

```bash
# Project + branch
cd /c/Projects/GWTH_V2 && git rev-parse --abbrev-ref HEAD
# Expect: experiment/redesign-poc-2026-04

git status --short
# Expect: clean (auto-commit hook is on; if dirty, investigate before working)

# Beads state
bd list --status=in_progress
# Expect: 1 issue, beads_GWTH-bm5 (Phase 0 logo)

# Concept reference image exists
ls kanban/design-artefacts/2026-04-24/concepts/wordmark/stitch-A-arrow-G-v3-dark-with-mint-tittle.png
# Expect: file present, ~600 KB

# Impeccable skill is loaded (check the Skills tool list shows "impeccable: Use when...")
ls ~/.claude/skills/impeccable/SKILL.md
# Expect: file present
```

If any check fails, STOP and tell David — do not "fix forward" based on the handoff alone. The most likely failure is the skill list showing `impeccable: ---` (empty description), which would mean someone re-installed from the dist build by mistake; reinstall from source per the dead-ends section above.

## Next steps (after verification passes)

1. **Read the concept reference image** (`stitch-A-arrow-G-v3-dark-with-mint-tittle.png`) and the brand brief §6 (deliverables list) so you know the visual target and the format requirements.
2. **Draft `public/logo.svg`** — primary horizontal wordmark, dark-mode (white WTH/ai + mint arrow + mint tittle on transparent bg, designed to sit on `#191817`). Use a real font (Geist or Inter Display Bold) inlined as paths if shadcn doesn't ship it locally — DO NOT rely on a system font. Save as a clean, hand-readable SVG with no editor cruft.
3. **Draft `public/logo-light.svg`** — same composition but warm-charcoal `#191817` letterforms + mint `#0E9F76` accents on transparent bg (designed to sit on `#FAF8F4`).
4. **Draft `public/icon.svg`** — icon-only G-with-arrow mark, square, no wordmark, no `.ai` text. This is the favicon source + Dynamic Score credential mark. Make sure it reads at 32px.
5. **Draft `public/icon-light.svg`** — same icon, light-mode colours.
6. **Draft `public/logo-stacked.svg`** + light variant — for square contexts (LinkedIn share image, OG image).
7. **Render scale tests** — write a tiny HTML preview at `kanban/design-artefacts/2026-04-24/concepts/_scale-test.html` showing the wordmark + icon at 256 / 64 / 32 in both modes side-by-side, on the actual ground colours. Open in a browser; share the file path with David.
8. **Iterate** — David reviews; you adjust paths in the SVG; loop. Cheap because SVG edits are instant.
9. **Once approved** — generate a 512×512 PNG export of `icon.svg` and put it at `kanban/design-artefacts/2026-04-24/concepts/icon/icon-512-master.png`. **Then David** uploads it to https://realfavicongenerator.net/ — that's a browser flow he runs himself; it outputs `favicon.ico`, `apple-touch-icon.png`, `web-app-manifest-{192,512}.png`, `site.webmanifest`. He drops them into `public/`, you commit.
10. **Close `bm5`** with a `--notes` summary (committed file paths, decisions). Then `bd ready` should show `6om` (Phase 1a homepage explore) — at which point you tell David and pause for his Claude Design session.

## Don't do

- **Don't run another image-tool round.** Stitch + OpenAI are exhausted for this concept. Vector work from here.
- **Don't introduce a second accent colour** beyond mint. The brief is single-accent for a reason.
- **Don't reach for the cascading-spiral SVG** (`public/logo-spiral*.svg`) for the new logo — different concept; the spiral may stay as an atmospheric asset only if Phase 1a's hero design wants it.
- **Don't change the hero copy** ("Stop watching AI change the world. Start building with it.") — David confirmed it stays.
- **Don't edit `src/app/(public)/page.tsx` in this session** — the 3 missing journey-section drafts (in `BRAND_BRIEF.md` §2c) get added in Phase 1b, NOT Phase 0.
- **Don't `npm run dev`** if you need to preview — it segfaults. Use `node ./node_modules/next/dist/bin/next dev --turbopack -p 3001` (and you probably don't need a dev server at all for Phase 0 — the HTML scale-test preview is enough).
- **Don't switch sessions to GWTH_curriculum** for any reason — that's a sibling repo for curriculum content; this work is in `GWTH_V2`.
- **Don't `bd close beads_GWTH-bm5`** until David has approved the final SVGs AND the favicon set is in `public/`.
- **Don't add a visible "Ctrl K" hint button** to any layout — David explicitly chose keyboard-only (Q8b).
- **Don't add `percentile` to any rendered Dynamic Score widget** — David chose to drop it (Q5).

## Cheat sheet

```bash
# Re-verify project state quickly
git -C /c/Projects/GWTH_V2 rev-parse --abbrev-ref HEAD && bd list --status=in_progress

# Concept reference paths
ls kanban/design-artefacts/2026-04-24/concepts/wordmark/

# Dev server workaround (if needed)
node ./node_modules/next/dist/bin/next dev --turbopack -p 3001

# Production build (Phase 1b later, not Phase 0)
node ./node_modules/next/dist/bin/next build && node ./node_modules/next/dist/bin/next start

# Coolify P520 deploy trigger (Phase 1b — not Phase 0)
# See ~/.claude/rules/04-infrastructure.md for the SSH tinker block
ssh p520 'docker exec coolify php artisan tinker --execute="..."'

# Beads
bd list --status=in_progress     # what's claimed
bd show beads_GWTH-bm5          # current task detail
bd ready                        # what unblocks after bm5 closes

# Open the canonical concept image (paste into a browser)
file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/concepts/wordmark/stitch-A-arrow-G-v3-dark-with-mint-tittle.png

# Plan + brand brief + dashboard synthesis (paste into a browser)
file:///C:/Projects/GWTH_V2/kanban/1_planning/PLAN_2026-04-24_gwth-redesign-poc.md
file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/brand-brief/BRAND_BRIEF.md
file:///C:/Projects/GWTH_V2/kanban/design-artefacts/2026-04-24/baselines/dashboard-current-and-inspiration.md
```

---

## Paste-into-next-session opener

```
Read C:\Projects\GWTH_V2\kanban\1_planning\HANDOFF_2026-04-26_phase-0-logo-vector.md end-to-end before doing anything else. It's a handoff from a previous session of mine. Follow the "First action" section to verify state before trusting anything in it, then proceed through "Next steps". Respect the "Don't do" list.
```
