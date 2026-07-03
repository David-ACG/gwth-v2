# Implementation Prompt: Autonomous Build Workflow — Settings Cleanup & Discipline Doc

**Date:** 2026-06-12
**Plan Reference:** PLAN_2026-06-12_autonomous-build-optimization.md
**Status:** Ready for Implementation (post-review)

## Context

GWTH v2 is a Next.js 16 / React 19 student learning platform. This task is **not** a product feature — it is a harness/tooling cleanup. A 2026-03-13 analysis report recommended six workflow improvements for autonomous builds; five are already implemented and one is obsolete. The only remaining low-risk work is (a) consolidating and de-secreting the project's `.claude/settings.local.json` permission allow-list, and (b) adding a short session-discipline note to the kanban runner doc. No `src/` application code changes.

## Task

1. Consolidate the `allow` array in `.claude/settings.local.json` and remove any literal secrets embedded in it, without making routine build/test commands start prompting again.
2. Add a "Recommended Session Discipline" subsection to `kanban/KANBAN_RUNNER.md`.

## Specific Instructions

1. **Read `.claude/settings.local.json`.** Inspect the `permissions.allow` array (it has ~220 entries).

2. **Remove inlined secrets.** Delete any allow-list entry whose command string embeds a literal credential. At minimum this includes:
   - The entry containing a Plunk secret key (`printf '%s' 'sk_...'`).
   - The entries containing a Supabase access token (`SUPABASE_ACCESS_TOKEN=sbp_...` prefixed `npx supabase ...` commands).
   These must not remain in the file. (Provider-side rotation is a separate security task — see "When Done".)

3. **Consolidate redundant entries.** Where a broad glob already covers narrower one-off entries, remove the narrower ones. Keep the broad, safe globs that everyday work relies on, e.g.: `Bash(npm:*)`, `Bash(npm run:*)`, `Bash(npm test:*)`, `Bash(npx:*)`, `Bash(node:*)`, `Bash(git:*)`, `Bash(bd:*)`, `Bash(ssh:*)`, `Bash(python:*)`, `Bash(python3:*)`, `Bash(pip install:*)`, `Bash(grep:*)`, `Bash(find:*)`, `Bash(ls:*)`, `Bash(cp:*)`, `Bash(rm:*)`, `Bash(mkdir:*)`, `Bash(cd:*)`, `Bash(head:*)`, `Bash(tail:*)`, `Bash(echo:*)`, the `mcp__playwright__*` entries, and the `WebFetch(domain:*)` entries. Remove obvious one-shot pasted commands that will never recur (e.g. specific `cp` of image-cache files to dated artefact paths, the giant `mkdir -p` lesson-folder command, the literal `find "C:\\Projects\\..."` strings) — those are already covered by `Bash(cp:*)` / `Bash(mkdir:*)` / `Bash(find ...)` or are simply stale.
   - Do NOT broaden permissions beyond what is already implicitly allowed. The goal is fewer, cleaner entries with equivalent-or-narrower effective scope — never wider.
   - Preserve `enableAllProjectMcpServers`, `enabledMcpjsonServers`, and the entire `hooks` block exactly as-is.

4. **Validate JSON.** After editing, confirm the file still parses (e.g. `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.local.json','utf8')); console.log('ok')"`). Fix any trailing-comma or bracket errors.

5. **Edit `kanban/KANBAN_RUNNER.md`.** Add a new subsection titled `## Recommended Session Discipline` near the workflow sections. Content (concise):
   - **Plan in an interactive session** (Phase 1) — questions allowed; produce plan + prompt files; do not build.
   - **Build headless via `bash kanban/run-kanban.sh`** — fresh session per prompt, full autonomy, no questions.
   - **Verify in a short interactive session** — review `2_testing/` output and the P520 URL, then promote.
   - One line: "Never do planning AND building in the same interactive session — that is where context runs out."

## Patterns to Follow

- This task does NOT touch `src/`. Do not modify application code, components, or tests.
- Do not commit secrets. The whole point of step 2 is removing them.
- Keep `.claude/settings.local.json` valid JSON; preserve `hooks` and MCP blocks verbatim.
- Make the smallest change that satisfies the goal — this is cleanup, not a rewrite.
- Run `npm test` once at the end as a sanity check that nothing in the repo broke (it should be unaffected).

## Acceptance Criteria

- [ ] `.claude/settings.local.json` parses as valid JSON.
- [ ] No literal secrets (the `sk_...` Plunk key, the `sbp_...` Supabase token) remain anywhere in the file.
- [ ] Redundant narrow/one-shot entries are removed; broad safe globs retained; no everyday command (`npm test`, `npm run build`, `git`, `bd`, `npx`) is newly restricted.
- [ ] `hooks`, `enableAllProjectMcpServers`, and `enabledMcpjsonServers` blocks are unchanged.
- [ ] `kanban/KANBAN_RUNNER.md` has a "Recommended Session Discipline" subsection.
- [ ] No file under `src/` is modified.
- [ ] `npm test` still passes.

## Files to Create / Modify

| File | Action | Notes |
| --- | --- | --- |
| `.claude/settings.local.json` | Modify | Consolidate allow-list; remove inlined secrets; preserve hooks/MCP blocks |
| `kanban/KANBAN_RUNNER.md` | Modify | Add "Recommended Session Discipline" subsection |

## When Done

1. Validate JSON parses; run `npm test` (must still pass — repo is unaffected by the config change).
2. **Beads:** the Dolt server was down at planning time. If `bd` is reachable, create a tracking task for this cleanup AND a separate security issue: `bd create --title="Rotate exposed Plunk + Supabase credentials (were in settings.local.json)" --type=task`. If `bd` still fails, note that in Gate 3 implementation notes and skip Beads.
3. Commit with a descriptive message (do NOT push/deploy unless the runner instructs).
4. If Beads is up: `bd close <id>` for the cleanup issue (leave the rotation issue open), then `bd sync`.

---
## Review Checklist — 2026-06-12 13:40
- [ ] Instructions are clear and self-contained
- [ ] File paths are correct (`.claude/settings.local.json`, `kanban/KANBAN_RUNNER.md`) — no `src/` changes
- [ ] Acceptance criteria match the plan
- [ ] The prompt doesn't introduce scope creep (no re-implementing already-done recommendations, no context-hook build, no provider-side secret rotation in-code)
- [ ] Secret-removal is explicit and the rotation follow-up is flagged, not silently done
- [ ] Consolidation is narrowing-or-equivalent, never widening permissions
- [ ] Beads-down fallback is stated

**Review this prompt:** [PROMPT_2026-06-12_autonomous-build-optimization.md](kanban/1_planning/PROMPT_2026-06-12_autonomous-build-optimization.md)
