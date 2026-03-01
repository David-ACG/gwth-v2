# Full-Stack Automation Setup Plan

**Date:** 2026-03-01
**Goal:** Unify Linear, Kanban Runner, Beads, and Heartbeat into a single autonomous workflow where David raises ideas from anywhere, agents self-serve tasks, and infrastructure health is monitored automatically.

---

## Architecture

```
                         DAVID
                          |
              +-----------+-----------+
              v           v           v
          Linear App   Linear App   Linear App
          (phone)      (desktop)    (tablet)
              |           |           |
              +-----+-----+
                    v
            Create issue with
            label "idea"
                    |
                    v
         [Hourly: linear-poll.py]       [Every 30 min: heartbeat.py]
                    |                              |
                    v                              v
          kanban/0_idea/*.md             Telegram alerts:
                    |                    - Poll freshness
              +-----+-----+             - P520 / Hetzner health
              v     v     v             - Items awaiting review
           Claude Claude Claude
           (bd     (bd    (bd
           prime)  prime) prime)
              |     |     |
              v     v     v
           1_planning/ (PROMPT files)
              |     |     |
              v     v     v
           run-kanban.sh (parallel)
           test -> commit -> push -> deploy
              |     |     |
              v     v     v
           2_testing/ (verify on P520)
              |
              v
        promote.sh -> Hetzner prod
              |
              v
        Linear issue -> "Done"
        (with summary comment)
              |
              v
        "Land the Plane" ->
        handoff saved in Beads
              |
              v
        Next session starts with
        bd prime (auto-context)
```

---

## Current Status (as of 2026-03-01)

| Component | Status | Evidence |
|-----------|--------|----------|
| Linear polling (`linear-poll.py`) | DONE | Running hourly, logging successfully (last: 18:00) |
| Heartbeat (`heartbeat.py`) | DONE | Running every 30 min, sends Telegram alerts |
| Task Scheduler: `LinearKanbanPoll` | DONE | Registered, next run scheduled |
| Task Scheduler: `KanbanHeartbeat` | DONE | Registered, next run scheduled |
| Beads CLI (`bd`) | DONE | v0.56.1 installed |
| Beads init (4 projects) | DONE | `.beads/` exists in GWTH_V2, gwthtest2026-520, 1_gwthpipeline520, design-system |
| `bd setup claude` hooks | PARTIAL | SessionStart hook works (bd prime), but Dolt server frequently down |
| Kanban Runner (`run-kanban.sh`) | DONE | Working in GWTH_V2 and gwthtest2026-520 |
| "idea" label in Linear | DONE | Created, polling script filters on it |
| `.gitignore` entries | DONE | `.linear-poll-state.json` and `.linear-poll.log` ignored |
| Beads workflow in CLAUDE.md | DONE | All 4 projects have Beads instructions |
| Land the Plane protocol | DONE | In CLAUDE.md |
| Cross-project orchestrator | NOT DONE | `orchestrator.yaml`, `orchestrate.sh`, `check-ready.sh` do not exist |
| Dolt server reliability | ISSUE | Server on port 3307 frequently down, breaks `bd` commands |
| Linear close-the-loop | NOT DONE | No automatic Linear issue update on task completion |
| Kanban Runner Beads integration | NOT DONE | Runner doesn't check `bd ready` or close issues |

---

## Implementation Steps

### Step 1: Fix Dolt Server Reliability [P1 — blocks Beads usage]

**Problem:** Dolt server on port 3307 goes down, breaking all `bd` commands.

**Action:**
1. Check if `C:\Users\david\AppData\Local\beads\start-dolt.bat` is registered as a startup task
2. If not, register it:
   ```powershell
   schtasks /Create /TN "BeadsDoltServer" /TR "C:\Users\david\AppData\Local\beads\start-dolt.bat" /SC ONLOGON /F
   ```
3. Verify Dolt starts and stays up after reboot
4. Add Dolt health check to `heartbeat.py`:
   ```python
   # Check Dolt server
   def check_dolt():
       try:
           import socket
           s = socket.create_connection(("127.0.0.1", 3307), timeout=5)
           s.close()
           return "OK", "Dolt server responding on port 3307"
       except Exception as e:
           return "FAIL", f"Dolt server unreachable: {e}"
   ```

### Step 2: Create Cross-Project Orchestrator [P2 — enables parallel agents]

Create 3 files in `C:\Projects\`:

**`orchestrator.yaml`** — Cross-project dependency tracker. Lists projects, their paths, test commands, deploy targets, and current tasks with dependencies.

**`orchestrate.sh`** — Reads `orchestrator.yaml`, finds projects with "ready" tasks, launches parallel `run-kanban.sh` instances (one per project). Logs to `.orchestrator-logs/`.

**`check-ready.sh`** — Quick status check across all projects. Shows `bd ready` output for each project, or falls back to counting PROMPT files if Beads isn't available.

Full file contents are in `kanban/0_idea/2026-02-24_beads-orchestrator-implementation-plan.md` (Phase 3, Steps 3.1-3.3).

### Step 3: Linear Close-the-Loop [P2 — completes the automation cycle]

When Claude finishes processing a kanban idea that originated from Linear, the Linear issue should be updated to "Done" with a summary comment.

**Two approaches (pick one):**

**Option A — MCP tools in Claude Code sessions (simpler):**
Add to `run-kanban.sh` injected system prompt:
```
After completing the task, check if the kanban idea file references a Linear issue
(look for "Linear: GWTH-XX"). If found:
  - Use mcp__linear__save_issue to set status to "Done"
  - Use mcp__linear__create_comment with a summary of what was implemented
```

**Option B — Post-processing script (more reliable):**
Create `kanban/linear-close.py` that:
1. Scans `3_done/` and `2_testing/` for files with Linear issue references
2. Extracts the issue identifier (e.g., `GWTH-42`)
3. Updates the Linear issue to "Done" via GraphQL API
4. Adds a summary comment

### Step 4: Kanban Runner + Beads Integration [P3 — additive enhancement]

Update `run-kanban.sh` in each project to:
1. **Before processing prompts:** Run `bd ready` to check for Beads tasks
2. **After successful execution:** Close the corresponding Beads issue (`bd close <id>`)
3. **On failure:** Update Beads issue with failure notes
4. **At the end:** Run `bd sync` to save state to git

This is additive — PROMPT files still execute as before, but agents also self-serve from Beads.

### Step 5: Seed Cross-Project Tasks in Orchestrator [P3 — one-time setup]

Populate `orchestrator.yaml` with current real tasks:

```yaml
projects:
  design-system:
    path: C:\Projects\design-system
    test_cmd: "npm test"
    deploy_target: none
    tasks:
      - id: ds-prompt-1
        title: "Design System PROMPT_1 (in 2_testing)"
        status: in_progress

  gwth_v2:
    path: C:\Projects\GWTH_V2
    test_cmd: "npm test"
    deploy_target: p520
    tasks:
      - id: gwth-oauth
        title: "Complete OAuth social login (Google/GitHub/LinkedIn)"
        status: ready
      - id: gwth-signup-conversion
        title: "Convert signup form from waitlist to registration"
        status: ready

  gwthtest2026:
    path: C:\Projects\gwthtest2026-520
    test_cmd: "npm test"
    deploy_target: p520_and_hetzner

  pipeline:
    path: C:\Projects\1_gwthpipeline520
    test_cmd: "python -m pytest tests/ -m 'not acceptance'"
    deploy_target: p520
```

### Step 6: End-to-End Test [P2 — validates the full pipeline]

Test the complete flow:
1. Create a Linear issue with "idea" label: "Add favicon to GWTH v2" (simple test task)
2. Wait for `linear-poll.py` to pick it up (max 1 hour, or run manually)
3. Verify markdown appears in `kanban/0_idea/`
4. Process through kanban runner
5. Verify `heartbeat.py` reports correctly on Telegram
6. Verify Linear issue gets updated (if step 3 is implemented)

---

## David's New Daily Routine

**Morning (5 min):**
1. Check `heartbeat.py` Telegram messages — any red alerts overnight?
2. Run `bash C:/Projects/check-ready.sh` — what's ready across projects?
3. Review/update `orchestrator.yaml` — any cross-project unblocks?
4. Launch agents: `bash C:/Projects/orchestrate.sh`

**During the day:**
- Raise ideas from anywhere via Linear (phone, desktop, tablet)
- Agents run autonomously — `bd prime` gives context, `bd ready` gives work
- Each session ends with "Land the Plane" — handoff saved for next time

**Evening (5 min):**
1. Check Telegram — any heartbeat alerts?
2. Review `2_testing/` folders — verify on P520 (http://192.168.178.50:3001)
3. Promote to production where appropriate
4. Update `orchestrator.yaml` for cross-project completions

---

## Component Details

### linear-poll.py
- **Location:** `C:\Projects\GWTH_V2\kanban\linear-poll.py`
- **Schedule:** Hourly via Task Scheduler (`LinearKanbanPoll`)
- **Queries:** Linear GraphQL API for issues in "GWTH Dev" team with "idea" label in Todo/Backlog status
- **Creates:** Markdown files in `kanban/0_idea/` with issue title, priority, labels, description
- **Comments:** Posts "Picked up by automation" on the Linear issue
- **State:** Tracks processed IDs in `.linear-poll-state.json` to avoid duplicates
- **Logs:** `.linear-poll.log`
- **Dependencies:** Python 3, `LINEAR_API_KEY` env var

### heartbeat.py
- **Location:** `C:\Projects\GWTH_V2\kanban\heartbeat.py`
- **Schedule:** Every 30 min via Task Scheduler (`KanbanHeartbeat`), offset by 30 min from poll
- **Checks:**
  1. Linear poll freshness (warns if log > 2 hours old)
  2. P520 test server health (HTTP 200 from `192.168.178.50:3001/api/health`)
  3. Hetzner prod health (HTTP 200 from `gwth.ai/api/health`)
  4. Items in `2_testing/` across all 4 projects
- **Sends:** Telegram message only if issues detected or items await review (green = silent)
- **Logs:** `.heartbeat.log`
- **Dependencies:** Python 3, `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` env vars

### Beads (`bd` CLI)
- **Version:** 0.56.1
- **Backend:** Dolt SQL server on port 3307
- **Init:** Done in GWTH_V2, gwthtest2026-520, 1_gwthpipeline520, design-system
- **Hooks:** SessionStart runs `bd prime` (injects ~1-2k tokens of task context)
- **Key commands:** `bd ready`, `bd create`, `bd update`, `bd close`, `bd dep add`

### Kanban Runner (`run-kanban.sh`)
- **Location:** Each project's `kanban/run-kanban.sh`
- **Flow:** Reads PROMPT files from `1_planning/`, launches Claude Code with --print flag, moves completed prompts to `2_testing/` or `3_done/`
- **Test:** Runs project test command before committing
- **Deploy:** Pushes to git, triggers Coolify deploy

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Dolt server goes down | Register as ONLOGON task, add to heartbeat monitoring |
| Beads is young (v0.56) | Kanban scripts remain as fallback — Beads is additive |
| Cross-project YAML gets stale | `check-ready.sh` surfaces staleness, 5 min/day to maintain |
| Linear polling misses issues | Heartbeat checks poll freshness, alerts on Telegram |
| Agents ignore Beads instructions | `bd prime` auto-injects via SessionStart hook + CLAUDE.md rules |
| `bd` doesn't work on Windows | Already verified working with PowerShell installer |

---

## Success Criteria

After 1 week of full operation:
- [ ] David spends < 15 min/day on scheduling (down from hours)
- [ ] Agents self-serve tasks via `bd ready` without human intervention
- [ ] Linear ideas flow through to completion without manual intervention
- [ ] Heartbeat alerts fire within 30 min of any infrastructure issue
- [ ] Cross-project dependencies tracked in orchestrator.yaml
- [ ] At least 2 agents running in parallel without David actively managing them
- [ ] Session handoffs work — new sessions resume from "Land the Plane" without re-explaining

---

*Consolidated from: `2026-02-24_beads-orchestrator-implementation-plan.md`, `2026-02-25_linear-integration-and-beads-memory.md`, and `heartbeat.py` runtime evidence.*
