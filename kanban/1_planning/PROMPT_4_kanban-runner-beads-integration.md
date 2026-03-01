# Task: Kanban Runner + Beads Integration

## What to change

Update `kanban/run-kanban.sh` so that it also interacts with Beads (`bd` CLI) for task tracking. This is additive — PROMPT files still execute as before, but agents also self-serve from Beads and close issues on completion.

## Steps

### 1. Add Beads pre-flight to `run-kanban.sh`

Before processing PROMPT files, the runner should:
- Check if `bd` CLI is available on PATH
- Check if Dolt server is responding on port 3307
- If both available, run `bd ready` and log the output (informational — don't block if Beads is down)

### 2. Add Beads context to the injected system prompt

The `run-kanban.sh` script injects a system prompt into each Claude Code session. Add instructions telling the agent:
- Run `bd prime` at session start for task context
- If the PROMPT file references a Beads issue ID (e.g., `Beads: beads-xxx`), claim it with `bd update <id> --status=in_progress` before starting work
- On successful completion, close it with `bd close <id>`
- On failure, add notes: `bd update <id> --notes="Failed: <reason>"`

### 3. Add Beads post-processing to `run-kanban.sh`

After each prompt completes successfully:
- If `bd` is available, run `bd sync` to persist state
- Log Beads status in the run output

At the end of all prompts:
- Run `bd sync` one final time
- Print `bd stats` for a summary

### 4. Ensure graceful degradation

All Beads operations must be wrapped in availability checks. If Dolt is down or `bd` isn't installed, the runner must still work exactly as it does today. Beads is additive, never blocking.

## Files likely affected
- `kanban/run-kanban.sh` — add Beads pre-flight, injected prompt additions, post-processing

## Acceptance criteria
- [ ] `run-kanban.sh` checks for `bd` CLI and Dolt availability at startup
- [ ] Injected system prompt includes Beads instructions for the agent
- [ ] After successful prompt execution, `bd sync` is called (if available)
- [ ] If Beads/Dolt is unavailable, the runner works exactly as before (no errors, no changes)
- [ ] Running `bash kanban/run-kanban.sh` with no PROMPT files exits cleanly
- [ ] Running `bash kanban/run-kanban.sh` with Dolt down exits cleanly (Beads steps skipped)

## Notes
- `bd` is installed globally via npm: `C:\Users\david\AppData\Local\beads\bd.exe`
- Dolt server runs on port 3307
- Check Dolt with: `nc -z 127.0.0.1 3307 2>/dev/null` or a bash TCP check
- The existing `run-kanban.sh` uses `claude --print --dangerously-skip-permissions` with a piped system prompt
- Don't break the existing flow — Beads is purely additive
- Reference `kanban/KANBAN_RUNNER.md` for the current architecture
