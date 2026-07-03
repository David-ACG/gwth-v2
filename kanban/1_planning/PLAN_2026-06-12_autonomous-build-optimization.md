# Plan: Autonomous Build Workflow Optimization (Re-Triage)

**Date:** 2026-06-12
**Status:** Awaiting Review
**Source Idea:** IDEA_2026-03-13_autonomous-build-optimization.md

## Overview

The source idea (2026-03-13) is an analysis report diagnosing two workflow pains: (1) Claude still asking "Do you want to proceed?" during builds, and (2) the context window filling up despite compaction. It proposed six changes. **Most of those six have since been implemented** — the project has matured a lot in the three months since the report was written. This plan re-triages the report against today's repo state (verified 2026-06-12), records what is already done, and scopes the small remainder of genuinely-outstanding, low-risk work.

This is a **tooling/process** idea, not a GWTH_V2 product-feature idea. Almost all of it touches `.claude/` config and the kanban runner — not `src/`. That keeps the buildable remainder tiny.

## Re-Triage Against Current Repo State (verified 2026-06-12)

| # | Original recommendation | Current state | Verdict |
|---|---|---|---|
| 1 | Expand permission allow-list to kill Bash prompts | `.claude/settings.local.json` has a very large `allow` list covering `npm`, `npx`, `node`, `git`, `bd`, `ssh`, `python`, `playwright`, etc. Global `~/.claude/CLAUDE.md` adds a hard autonomy OVERRIDE banning permission-seeking questions. | **Done.** No further action needed. |
| 2 | Split CLAUDE.md into a `.claude/rules/` directory | Both layers exist: global `~/.claude/rules/01–07*.md` AND project `.claude/rules/` (`tech-stack`, `design-system`, `routing`, `data-layer`, `middleware-and-layout`), path-scoped via the CLAUDE.md "Path-scoped rules" table. | **Done.** |
| 3 | Standardise on headless builds (plan interactive, build via `run-kanban.sh`) | `kanban/run-kanban.sh` exists and is documented in `KANBAN_RUNNER.md` (fresh session per prompt, `--dangerously-skip-permissions`, gate automation). The 4-gate workflow enforces plan/build separation. | **Done** (process + script). Residual: it is a discipline, not a code change. |
| 4 | Use subagents for heavy ops | Now a standing rule in global `~/.claude/rules/02-context-management.md` ("Delegate heavy operations to subagents"). | **Done** (codified as a rule). |
| 5 | Add a context-management hook | The report itself flags this as weak ("Claude Code doesn't expose token count to hooks"). Current `settings.local.json` has `SessionStart`/`PreCompact` → `bd prime` hooks, plus a `PostToolUse` lint hook. Context is now 1M (per the running model), materially reducing the original pressure. | **Largely obsolete.** Low value; do not build the reminder hook. |
| 6 | Create a project-level `/build` command | A `build` skill/command exists (listed in available skills: "Run the kanban build pipeline for this project"). `/autonomous` also exists. | **Done.** |

**Net:** 5 of 6 recommendations are already implemented; #5 is obsolete given 1M context and the limitation the report itself noted. The idea has substantially served its purpose — it was an analysis that drove real changes that are now in place.

## Genuinely-Outstanding, Low-Risk Remainder

Only a couple of small, concrete improvements remain worth doing, all in `.claude/` / `kanban/` (not `src/`):

1. **Permission-prompt audit pass.** The allow-list in `.claude/settings.local.json` has grown organically to ~220 entries, many one-off (image copies, specific Supabase SQL strings, hashed secrets pasted inline). Run a consolidation pass: collapse one-off entries into glob patterns where safe, and **remove the inlined secrets** (e.g. a literal `sk_...` Plunk key and a `sbp_...` Supabase access token appear as allow-list entries — those should not live in a checked-in/committed settings file). This is the highest-value, lowest-risk item and it has a security angle.
2. **Document the standard loop in `KANBAN_RUNNER.md`.** Add a short "Recommended Session Discipline" note codifying the plan-interactive / build-headless / verify-interactive loop the report recommended, so it is discoverable next to the runner rather than only living in the global rules.

Everything else from the report is either done or obsolete.

## Goals

- Record (in 3_done, via this plan) that the 2026-03-13 analysis has been actioned and which recommendations are live.
- Consolidate and **de-secret** the project `.claude/settings.local.json` allow-list.
- Add a brief session-discipline note to `KANBAN_RUNNER.md`.

## Scope

### In Scope
- Audit + consolidate `.claude/settings.local.json` `allow` entries; remove inlined secrets; keep behaviour equivalent (no new prompts introduced).
- Add a "Recommended Session Discipline" subsection to `kanban/KANBAN_RUNNER.md`.

### Out of Scope
- Re-implementing recommendations 1–4 and 6 — already done.
- Building the context-reminder hook (#5) — obsolete with 1M context and the noted hook limitation.
- Any change to `src/` GWTH_V2 platform code (this is a tooling idea).
- Rotating the exposed secrets at their providers — **flagged separately as a security follow-up** (see Dependencies); this plan only removes them from the settings file.

## Technical Approach

No application stack involved. The work is editing two config/doc files:

- **`.claude/settings.local.json`** — group the `allow` array: keep broad safe globs (`Bash(npm:*)`, `Bash(git:*)`, `Bash(npx:*)`, `Bash(bd:*)`, etc.), delete redundant narrower entries those globs already cover, and delete the handful of entries that embed literal secrets or one-shot pasted commands. Validate it stays valid JSON and that no everyday build command newly prompts.
- **`kanban/KANBAN_RUNNER.md`** — append a short subsection under the existing workflow docs.

## Files Affected / Created

| File | Action | Notes |
| --- | --- | --- |
| `.claude/settings.local.json` | Modify | Consolidate allow-list; remove inlined secrets + one-shot entries; keep JSON valid |
| `kanban/KANBAN_RUNNER.md` | Modify | Add "Recommended Session Discipline" subsection |

## Architecture Notes

- Not applicable (no RSC/client, no data layer). This is harness configuration.
- **Security:** the allow-list currently contains at least one literal API key and one access token as command strings. Removing them from the file is in scope; rotating them at the provider is a separate security follow-up (Dependencies).
- **Behaviour-preserving:** the consolidation must not make any routine build/test command start prompting again — that would regress the very pain the original report fixed.

## Acceptance Criteria

- [ ] `.claude/settings.local.json` remains valid JSON and parses.
- [ ] No literal secrets (API keys, access tokens) remain as allow-list entries.
- [ ] Redundant narrow entries already covered by broad globs are removed; everyday commands (`npm test`, `npm run build`, `git`, `bd`, `npx`) still resolve without new prompts.
- [ ] `kanban/KANBAN_RUNNER.md` has a "Recommended Session Discipline" subsection describing plan-interactive / build-headless / verify-interactive.
- [ ] No change to any file under `src/`.

## Dependencies

- **Beads:** Dolt server unreachable at planning time (2026-06-12). No Beads issue created. When Beads is up, file a tracking task and a **separate security issue** to ROTATE the exposed Plunk (`sk_...`) and Supabase (`sbp_...`) credentials at their providers, since they have been committed in `settings.local.json` history.
- **Security follow-up (out of this plan's scope):** rotate the two exposed credentials. Removing them from the file does not invalidate already-committed copies in git history.

## Testing Plan

- Validate `settings.local.json` parses as JSON (e.g. `node -e "require('./.claude/settings.local.json')"` or `jq . .claude/settings.local.json`).
- Smoke-check: run `npm test` and a `git status` in a session and confirm no new permission prompts appear for routine commands.
- No app tests apply (no `src/` change).

## Estimated Complexity

**Small** — two config/doc file edits, no application code, no tests to write. The judgement is in pruning the allow-list without regressing autonomy and in correctly identifying the inlined secrets. The bulk of the original report's value is already realised.

---
## Review Checklist — 2026-06-12 13:40
- [ ] Re-triage is accurate: 5 of 6 original recommendations already implemented, #5 obsolete
- [ ] Scope is correctly bounded to the small `.claude/` + `kanban/` remainder (no `src/` changes)
- [ ] The security angle (inlined secrets in the allow-list) is captured, with rotation flagged as a separate follow-up
- [ ] Acceptance criteria are specific and testable (valid JSON, no secrets, no new prompts, docs added)
- [ ] No unexpected dependencies introduced
- [ ] Estimated complexity feels right (Small)

**Review this plan:** [PLAN_2026-06-12_autonomous-build-optimization.md](kanban/1_planning/PLAN_2026-06-12_autonomous-build-optimization.md)
