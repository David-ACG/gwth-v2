# Completion: W23 — Claude Design polish pass on the demo path (pre-CIPD demo)

**Date:** 2026-07-23 · **Repo:** GWTH_V2 · **Commit (master):** `594f4b8`
**Staging:** `gwth-v2:staging-w23` live on hlab `:3001` · **Prod:** gwth.ai (Coolify `tw0cc8oc0w4scwoccs0cw0go` @ `master`)
**Status:** mechanicals (items 1-3) verified on staging AND production; audit inventory + 3-up variation previews ready for W24
**Demo:** CIPD, Mon 2026-07-27. Audience: two viewers aged 50-60 in reading glasses over a Teams screen share — everything on the demo path must read comfortably without leaning in.

A design-review pass, not a bug hunt. Only the three mechanical fixes land on the
site; typeface / palette / layout-direction changes are **preview-only** (item 5)
and were never committed to master or deployed. FDE register throughout, British
English, no em dashes, no eyebrow pills, no new dependencies. W20/W21/W22 fixes
left intact (checked `git log` first; zero-overflow QA re-run and still clean).

## What to verify (3 bullets)

- **The small text is comfortably readable.** One shared type scale
  (`--fde-*` tokens in `globals.css :root`) now floors mono labels at 0.8rem+
  and body at 1.06-1.12rem across all 32 FDE modules (293 hardcoded sizes
  rewired). The worst offenders are gone: nav mono labels 0.70→0.82rem, avatar
  initials / menu email / footer legal / stat citations 0.62-0.66→0.80rem,
  card/issue body 0.93-0.98→1.06rem, the lesson reading column 1.00→1.12rem.
  Compare `before/` vs `after/` on any page at 1440 or 390.
- **The logo is one canonical mark with a named on-dark variant.** `LogoGwth`
  and `LogoGwthMark` gained an `onDark` prop (cream wordmark + mustard accent
  via new mode-independent `--logo-*-on-dark` vars); the `/login` masthead now
  uses `<LogoGwth onDark />` instead of a per-page colour hardcode. Every other
  surface already used the canonical component; W19's regenerated static assets
  (`icon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og-image.png`) are all
  referenced. Two-ink rule holds: terracotta on light grounds, mustard on the
  teal masthead. No visual delta (consolidation only).
- **Home media has rhythm.** The 90-second tour video is no longer slammed
  straight into the cutout image: a connective line ("What building looks
  like…") now sits between them, and the journeys plate gets a mono caption
  ("Nine ways in, one proof at the end.") plus real breathing room before the
  card grid. No console errors; 0 horizontal overflow on all 7 demo routes ×
  light/dark × {1440, 390}.

## Scope items — one line each

1. **Logo consistency** — audited every surface (nav, login mast, dashboard
   chrome, footer, favicons, hero device, score header, lesson chrome). Already
   canonical `LogoGwth`/`LogoGwthMark` everywhere; the only divergence was the
   login mast's hardcoded cream+mustard, now folded into a deliberate `onDark`
   component variant. W19 static assets confirmed wired.
2. **Type scale** — introduced the first shared FDE type ramp (`--fde-mono-xs/sm/md`,
   `--fde-body-sm/body/lg`) in `globals.css`; a scripted, reviewed sweep
   (`/tmp/raise_type_scale.py`, 293 replacements / 32 modules) put every small
   size on it. Larger, not louder: floors raised, hierarchy unchanged.
3. **Media spacing/rhythm** — added connective copy + a figure caption + bottom
   margin in `home-fde`; swept the other marketing pages and found no other
   bare stacked-media (lessons-fde's essay image is already followed by prose).
4. **Design audit (find, do NOT fix)** — full demo-path inventory below.
   Nothing from it was fixed under this task.
5. **Variation previews for W24 (build, do NOT apply)** — served three-up page
   at [W23/variations.html](W23/variations.html): typeface, palette, imagery.
   Option A is always the current UI. Preview-only (runtime overrides, never
   shipped).
6. **Tests + deploy** — `npm test` 411 pass (13 pre-existing DB skips), `tsc`
   clean, `eslint` clean; staging rebuilt + prod deployed with items 1-3 only;
   both verified.

## Before / after (both widths, both modes)

7 demo routes captured at 1440 and 390 in light + dark, before (pre-W23 staging
build, W22 code) and after (W23 build):

| Route | Before | After |
|---|---|---|
| Home (media rhythm + type) | `before/home-{light,dark}-{1440,390}.png` | `after/home-{light,dark}-{1440,390}.png` |
| Login (onDark logo + type) | `before/login-*.png` | `after/login-*.png` |
| /labs | `before/labs-public-*.png` | `after/labs-public-*.png` |
| Pilot lab | `before/pilot-lab-*.png` | `after/pilot-lab-*.png` |
| Dashboard | `before/dashboard-*.png` | `after/dashboard-*.png` |
| Lesson viewer (body size) | `before/lesson-*.png` | `after/lesson-*.png` |
| /progress | `before/progress-*.png` | `after/progress-*.png` |

Full grids in [W23/before/](W23/before/) and [W23/after/](W23/after/) (28 each).
Note: `before/login-*` were re-captured from the W23 container (the auth-logo
change is a code consolidation with no visual delta, so before == after by
design). Home below-the-fold plates render as empty boxes in some full-page
captures — that is a `next/image` lazy-load screenshot artefact (all plates HTTP
200 on staging), not a page bug.

## Design audit inventory (item 4 — found, NOT fixed)

Severity P1 = breaks/embarrasses the demo · P2 = noticeably weak · P3 = minor.
Type: **OBJ** = fixable without taste · **DIR** = needs David's direction.

| Page / where | Diagnosis | Sev | Type |
|---|---|---|---|
| Lesson H1 | Em dash in the flagship lesson title: "Welcome to GWTH — What AI Can Actually Do For You". Content-layer (DB/mock), so out of the items-1-3 scope; flag for a content fix. | P1 | OBJ |
| Lesson intro video | Lesson 1 shows "Video unavailable / Retry" (light) or a flat teal block (dark). Media wiring (W13 pipeline), not design. High demo risk. | P1 | OBJ |
| Dashboard vs lesson | L01 title differs: dashboard "…Six Ways AI Can Give You Superpowers" vs lesson page "…What AI Can Actually Do For You". Only the dashboard copy is de-em-dashed. | P2 | OBJ |
| Progress / dashboard | The fixed rust "REPORT A PROBLEM" tab overlaps the right-aligned stat meta ("LONGEST 0 DAYS", "NO QUIZZES YET"), both modes, worse at 390. | P2 | OBJ |
| Lesson / 390 | 3-item bottom nav (PREVIOUS / PAGE X OF Y / CONTINUE) is tight; "CONTINUE →" sits flush/clipped at the edge. Pre-existing (identical in `before`), no page overflow. | P2 | OBJ |
| Dashboard / 390 | Lesson table title column squeezed between fixed NO./LENGTH columns; long titles wrap to 4-5 lines. | P2 | OBJ |
| Pilot lab | ChatGPT column shows raw markdown (`**…**`, leading `#`) in the "verbatim" output; reads as a render bug to a lay audience. | P2 | OBJ |
| Pilot lab | Claude vs ChatGPT answer columns have very uneven heights, leaving a tall empty block. | P2 | OBJ |
| Login / dark | Near-black card on near-black ground separates only by a hairline + faint offset; panel barely reads as a surface. | P2 | OBJ |
| Labs archive | All 23 archived rows stamped the identical date "JUN 17, 2026" — reads as seed data, undercuts the "dated, kept forever" story. | P2 | OBJ |
| Home / journeys grid | Teal `#2c4a47` and moss `#2a4530` card tops read as one green side by side; colour-coding lost, worse over a screen share. | P2 | DIR |
| Home imagery | Two busy AI stock plates stacked; decorative, slightly off the careful-journal register. | P2 | DIR |
| Dashboard / progress | Demoing on a fresh account shows 0/26, 0.0h, 0-day streak, empty grids everywhere — honest but undersells in a high-stakes demo. | P2 | DIR |
| Hero / dark answer cols | All-serif body on saturated teal / near-black is soft over a screen share for the audience. | P3 | DIR |
| Nav / archive meta | Mono labels, though raised, are still at the low end of comfortable at arm's length. | P3 | OBJ |

**Positives confirmed:** two-ink logo correct everywhere; square corners honoured
(no rounded); no decorative eyebrow pills; the single sanctioned hard-offset
shadow only on the login credential panel; no gradient text.

**Top DIRECTION questions for David** (the biggest are rendered as three-ups in
[W23/variations.html](W23/variations.html)):
1. Body typeface: all-serif vs sans body + serif headings (Q1, rendered).
2. Colour: push teal/moss apart or replace one (Q2, rendered).
3. Homepage imagery density: five plates vs one vs image-light (Q3, rendered).
4. Demo on an empty vs a seeded account (data call, not rendered).
5. Lab output: render the markdown vs keep it byte-verbatim (content call, not rendered).

## Variation previews for W24 (item 5)

Served page: [W23/variations.html](W23/variations.html) — three-up per direction
question, current UI always Option A, real screenshots of the same pages (home
hero + journeys grid, lesson viewer) with each treatment applied. Treatments are
runtime style overrides (`deploy/shot-w23-variations.mjs`, `bypassCSP` for a
preview webfont) — **never written to source, never merged to master, never
deployed.** Groups: typeface (serif vs Inter vs Source Sans 3), palette (current
vs hue-shift vs indigo-replacement), imagery (five plates vs one vs none).

## Changes (items 1-3 only, what shipped)

- `src/app/globals.css` — new `--fde-*` type ramp + `--logo-*-on-dark` vars; `.lesson-prose` body 1.00→1.12rem, table onto `--fde-body-sm`.
- `src/components/marketing/redesign/logo-gwth.tsx` — `onDark` prop on `LogoGwth` + `LogoGwthMark`.
- `src/app/(auth)/layout.tsx` — masthead uses `<LogoGwth onDark />` (drops the hardcode).
- `src/components/marketing/home-fde/home-fde.tsx` + `.module.css` — connective copy, figure caption, breathing room.
- 31 further `*-fde.module.css` — small-text `font-size` literals rewired to the shared `--fde-*` tokens.
- `deploy/shot-w23*.mjs`, `deploy/measure-w23.mjs` — screenshot / overflow / variation harness.

## URLs

Staging (log in via `192.168.178.50:3001`, LAN-trusted origin):
- Home: http://192.168.178.50:3001/
- Login: http://192.168.178.50:3001/login
- Dashboard: http://192.168.178.50:3001/dashboard
- Lesson: http://192.168.178.50:3001/course/applied-ai-skills/lesson/welcome-to-gwth
- Progress: http://192.168.178.50:3001/progress
- Labs + pilot: http://192.168.178.50:3001/labs · /labs/job-advert-claude-vs-chatgpt

Production: https://gwth.ai/ · /login · /dashboard · /progress · /labs
