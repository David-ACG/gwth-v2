# Plan: Intro Script — Too Short & Contains Metadata (Triage)

**Date:** 2026-06-12
**Status:** Archived — Belongs in a Different Repo (no prompt generated)
**Source Idea:** GWTH-1zcz7u_intro-script-too-short-and-contains-metadata.md
**Beads:** GWTH-1zcz7u · **Linear:** https://linear.app/gwth/issue/GWTH-24

## Overview

The idea reports two problems with the **TTS Intro Video script generator**:

1. The intro script being fed to TTS contains production metadata that should never be spoken — e.g. `Duration: 75 seconds`, `Word count: 185`, `Colour palette: ... #33BBFF`, `Key text overlays`, `Suggested visual elements`, icon/animation direction. All of this leaks into the TTS audio.
2. The Month 1 / Lesson 1 intro script is too short and uses terse bullet-point sentences that may confuse beginners. The request is to make intro scripts **longer, simpler, and prose-based**, and to **update the relevant skill** so all future intro scripts are generated that way.

## Finding (triage on the current GWTH_V2 codebase — verified 2026-06-12)

**This work cannot be done from the `GWTH_V2` (platform) repo. It belongs in the `GWTH_curriculum` sibling repo.** Here is the evidence:

- The fix target is "the relevant **skill**" that generates intro scripts. There is **no `.claude/skills/` directory in `GWTH_V2`** (confirmed: the path does not exist), and **no intro-script / TTS script-generation code** in `GWTH_V2/src` or its tooling. The only `tts`-matching files in this repo are archived legacy assets under `docs/old-site/scripts/` (e.g. `test-tts.ts`, `apply-tts-migration.js`) — none of which generate lesson intro scripts.
- `GWTH_V2/CLAUDE.md` is explicit about the split: curriculum content (lesson ideas, syllabus, **future lesson/lab/project files**) moved out of this repo into `C:\Projects\GWTH_curriculum` ([David-ACG/gwth-curriculum](https://github.com/David-ACG/gwth-curriculum)) on **2026-04-23**, "so curriculum editing and platform engineering live in separate kanban/beads scopes." It states directly: *"Do not edit lesson-ideas or research files from this repo — they live in GWTH_curriculum. Switch sessions."*
- The TTS voiceover tooling referenced in this idea (the skill that produces lesson intro scripts and runs them through TTS) is curriculum-authoring tooling. The `anthropic-skills:tts-voices` and `elevenlabs-british-tts` skills generate audio from scripts but are not the script-*content* generator that needs the prose/metadata fix; the intro-script generation skill lives with the curriculum content.

The idea was captured (Beads import) before — or without awareness of — the 2026-04-23 repo split, so it landed in the platform repo's kanban by default. The substance of the request is valid and worth doing; it simply must be actioned in the `GWTH_curriculum` repo where the intro-script generation skill and the Month 1 / Lesson 1 script live.

## Recommended Action

1. **Re-file this in `GWTH_curriculum`.** Open a session in `C:\Projects\GWTH_curriculum` and run its kanban/idea workflow against Beads issue `GWTH-1zcz7u` / Linear `GWTH-24`. The two concrete deliverables there will be:
   - **Strip non-spoken metadata from the TTS input.** The script-generation skill should separate the *spoken script* from production metadata (duration, word count, colour palette/hex, text overlays, suggested visual elements, icon/animation direction). Only the spoken script should reach TTS. (This is likely a section/heading boundary in the skill's output template, or a pre-TTS sanitiser that drops everything under known metadata headings.)
   - **Rewrite the intro-script style guidance** in the skill so scripts are longer, simpler, beginner-friendly, and written as flowing prose — not short bullet-point fragments. Apply it to Month 1 / Lesson 1 as the first regenerated example.
2. **Do NOT generate an implementation prompt in this (`GWTH_V2`) repo.** There is nothing in this repo to implement against; a prompt here would point a build agent at files that do not exist.
3. **Keep the Beads/Linear issue open**, but reassign its working repo to `GWTH_curriculum`. (Beads could not be reached at triage time — see Dependencies.)

## Scope

### In Scope (for this triage plan)
- Determine whether the issue reproduces in `GWTH_V2` and where it actually belongs. Done: it belongs in `GWTH_curriculum`.

### Out of Scope
- Implementing the metadata strip or the prose-style rewrite **in this repo** — the code/skill is not here.
- Any change to `GWTH_V2` platform source.

## Acceptance Criteria (for the triage decision)

- [x] Confirmed there is no intro-script / TTS script-generation skill or generator in `GWTH_V2`.
- [x] Confirmed (via `GWTH_V2/CLAUDE.md`) that curriculum + intro-script tooling lives in `GWTH_curriculum` as of 2026-04-23.
- [x] Documented the two concrete deliverables for the `GWTH_curriculum` session.
- [ ] (Follow-up, in `GWTH_curriculum`) Metadata no longer reaches TTS; intro scripts are longer/simpler prose; Month 1 / Lesson 1 regenerated.

## Dependencies

- **Beads:** The project's Beads Dolt server was unreachable at triage time (2026-06-12). The issue (`GWTH-1zcz7u` / Linear `GWTH-24`) could not be updated programmatically. When Beads is back up, in the `GWTH_curriculum` repo, claim and action the issue there. No Beads issue was created or modified from this session.

## Estimated Complexity

**Small (in the correct repo)** — a template/sanitiser change to one skill plus a style-guidance rewrite and a single regenerated example script. Effectively **zero in `GWTH_V2`** — the only action here is to route it to the right repo, which this plan does.

---
## Review Checklist — 2026-06-12 13:35
- [ ] Triage conclusion is correct: intro-script generation lives in `GWTH_curriculum`, not `GWTH_V2`
- [ ] Evidence is sound (no `.claude/skills/` here; no intro-script generator in `src`; CLAUDE.md repo-split note dated 2026-04-23)
- [ ] No implementation prompt was generated for this repo (correct — nothing here to build against)
- [ ] The two concrete deliverables for the `GWTH_curriculum` session are clearly stated
- [ ] Beads-down caveat noted; issue GWTH-1zcz7u / Linear GWTH-24 to be actioned in the curriculum repo

**Review this plan:** [PLAN_2026-06-12_intro-script-too-short-and-contains-metadata.md](kanban/1_planning/PLAN_2026-06-12_intro-script-too-short-and-contains-metadata.md)
