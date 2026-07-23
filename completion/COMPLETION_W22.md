# Completion: W22 — Rework /labs to the Model Arena format + fix bbg anon-access

**Date:** 2026-07-23 · **Repo:** GWTH_V2 · **Commit (master):** `c54d1b7`
**Staging:** `gwth-v2:staging` (fresh HEAD build) live on hlab `:3001`
(`http://192.168.178.50:3001/labs`, tailnet `http://hlab.taila51191.ts.net:3001/labs`)
**Prod:** gwth.ai, Coolify app `tw0cc8oc0w4scwoccs0cw0go` (git source
`David-ACG/gwth-v2` @ `master`), deploy `rkokw4wc0o44s48cck08gw8s` (finished)
**Status:** verified on staging AND production
**Beads:** closes `gwth-launch-bbg` (P1, free-no-account promise); depends on
`L23` (pilot lab + template + schema, present)

Retires the tiered-difficulty labs and rebuilds `/labs` as the **Model Arena**:
a lab is a head-to-head test of two AI tools on one real task, same prompt,
outputs verbatim side by side, a beginner rubric, and a dated verdict. Labs now
complement lessons (lessons teach HOW; labs show WHICH TOOL WHEN). Only ~6 run
live at once and are deliberately perishable; superseded labs move to a dated
archive that is never deleted. FDE register only, British English, no em dashes
in authored copy, no new dependencies, no old lab deleted.

## What to verify (3 bullets)

- **The pilot lab reads as a real head-to-head.** Open
  `https://gwth.ai/labs/job-advert-claude-vs-chatgpt`: matchup header (Claude
  Opus 4.8 vs OpenAI GPT-5.6, exact model ids, tested 23 July 2026), the task
  brief, the shared prompt, **both answers verbatim side by side** (raw markdown
  and the ChatGPT dashes preserved on purpose — rubric criterion 4 judges them),
  the six-question rubric, the honest dated verdict, and try-it-yourself. On a
  390px phone the two answers **stack** with no horizontal scroll.
- **The free-no-account promise now holds on first click (bbg).** The whole
  `/labs` subtree is public. Anonymous `curl` returns **200, no redirect** for
  `/labs`, the pilot, and an archived legacy lab; `/dashboard` still **307s** to
  `/login`, so no other route's auth is weakened. Proof below.
- **Old labs are kept as a dated archive, not deleted.** The landing shows a
  LIVE NOW row (the pilot) and an ARCHIVE list: every retired tiered lab is
  reachable read-only with an "Archived" label and a date, content unchanged.

## Before / after — /labs landing

| Width | Before (tiered "Free Labs") | After (Model Arena) |
|---|---|---|
| 1440 | ![before labs 1440](W22/before-labs-1440.png) | ![after labs 1440](W22/after-labs-1440.png) |
| 390 | ![before labs 390](W22/before-labs-390.png) | ![after labs 390](W22/after-labs-390.png) |

## After — pilot lab head-to-head detail (net-new page)

| Width | Pilot detail |
|---|---|
| 1440 | ![after pilot 1440](W22/after-pilot-1440.png) |
| 390 (outputs stacked, no h-scroll) | ![after pilot 390](W22/after-pilot-390.png) |

## After — a retired tiered lab, read-only in the archive

![after archive legacy 1440](W22/after-archive-legacy-1440.png)

## Dark mode (FDE light + dark parity, staging)

| Landing (dark, 1440) | Pilot detail (dark, 1440) |
|---|---|
| ![dark labs 1440](W22/dark-labs-1440.png) | ![dark pilot 1440](W22/dark-pilot-1440.png) |

## Anon-access proof (bbg fixed)

Verified against **production** (`https://gwth.ai`) with no session cookie. The
original bug report checked `https://gwth.ai/labs/three-chatbots-one-difficult-email`
→ HTTP 307 → `/login`; it is now 200.

```text
/labs                                     200
/labs/job-advert-claude-vs-chatgpt        code=200 redirect=''
/labs/three-chatbots-one-difficult-email  code=200 redirect=''   (archived legacy lab)
/dashboard  (auth NOT weakened)           code=307 redirect='https://gwth.ai/login'
```

Same result on staging `:3001` (which runs the real proxy guard, no
`ENABLE_DEV_MOCK_USER`). Zero horizontal overflow at 1440 and 390 on every
captured surface (`document.scrollWidth == clientWidth`).

## What changed (code)

- **Landing** `src/components/marketing/labs-fde/labs-fde.tsx` reworked: Model
  Arena masthead, a "how it works" explainer, a **Live now** card row, a dated
  **archive** list (superseded arena labs first, then the retired tiered labs).
  Page `src/app/(public)/labs/page.tsx` feeds it from the new data seam.
- **Detail** new public route `src/app/(public)/labs/[slug]/` with
  `src/components/lab/arena/` — `ArenaLabDetail` (head-to-head) and
  `ArchiveLabDetail` (read-only retired labs). The old
  `(dashboard)/labs/[slug]` route was removed (it would collide and sat behind
  the auth guard).
- **Data** `ModelArenaLab` types + `src/lib/data/model-arena.ts` reading the L23
  JSON fixtures (`getLiveArenaLabs` / `getArchivedArenaLabs` / `getArenaLab`).
- **bbg** `src/proxy.ts`: dropped `/labs` from `PROTECTED_PATHS` so the whole
  subtree is public; `/dashboard`, `/course/*/lesson/*`, etc. unchanged.
- **ADR** `wiki/lessons/labs-format.md` in GWTH-launch-plan records the Model
  Arena decision and supersedes the tiered-labs approach (integrated across the
  lessons space per WIKI_AGENTS).

## Gates

- **Tests:** 411 Vitest pass (new: model-arena data, ArenaLabDetail render,
  proxy anon-access). ESLint clean, `tsc --noEmit` clean, knip adds no new
  unused exports, production build green.
- **L23 dependency:** present. The pilot renders from
  `src/lib/data/model-arena/lab-01-job-advert-claude-vs-chatgpt.json` (both
  sides real generations, exact model ids, tested 2026-07-23). No placeholder
  copy was needed.

## Known limitations / follow-up

- Only the **pilot** lab is LIVE today. The remaining ~5 live labs and the
  rotation process are post-demo work (follow-up bead per the CIPD demo plan).
- The bible item `model-arena-labs` (seeded by L23) is still **pending David's
  verdict** at `/bible`; it governs house-style wording, not the format.
