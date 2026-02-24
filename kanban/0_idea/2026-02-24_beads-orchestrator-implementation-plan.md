# Implementation Plan: Beads + Kanban Runner + Cross-Project Orchestrator

**Date:** 2026-02-24
**Author:** Claude (researched and drafted for David)
**Goal:** Remove David as the scheduling bottleneck, enabling 5 parallel agents across projects

---

## Current State

| Project | Branch | Uncommitted | Kanban Runner | Test Cmd | Deploy Target |
|---------|--------|-------------|---------------|----------|---------------|
| GWTH_V2 | master | 1 file | Full setup | `npm test` | P520 + Hetzner |
| gwthtest2026-520 | main | 20 files | Full setup | `npm test` | P520 (prod) |
| 1_gwthpipeline520 | master | 224 files | Full setup | `pytest` | P520 |
| design-system | master | 16 files | Has runner, no docs | Unknown | None (library) |
| acgtest2026-520 | master | 23 files | Folder only, no runner | Unknown | Hetzner (live) |

**None have Beads installed yet.**

### Cross-Project Dependency Graph

```
design-system ──→ GWTH_V2 ──→ gwthtest2026-520 (P520 test / Hetzner prod)
             └──→ acgtest2026-520 (Hetzner prod)

1_gwthpipeline520 ──→ lesson content ──→ gwthtest2026-520
```

---

## Phase 1: Install Beads (Day 1)

### Step 1.1 — Install the `bd` CLI

Open PowerShell (not Git Bash):

```powershell
irm https://raw.githubusercontent.com/steveyegge/beads/main/install.ps1 | iex
```

Verify:
```powershell
bd version
bd help
```

If the PowerShell script fails, fallback to npm:
```bash
npm install -g @beads/bd
```

### Step 1.2 — Commit uncommitted work in all projects

Before adding `.beads/` to any repo, commit or stash everything in flight. The big one is `1_gwthpipeline520` with 224 uncommitted files.

```bash
# For each project:
cd C:/Projects/GWTH_V2 && git status
cd C:/Projects/gwthtest2026-520 && git status
cd C:/Projects/1_gwthpipeline520 && git status
cd C:/Projects/design-system && git status
```

Commit or stash as appropriate. Do not init Beads on a dirty repo.

### Step 1.3 — Init Beads in 4 projects

```bash
cd C:/Projects/GWTH_V2 && bd init
cd C:/Projects/gwthtest2026-520 && bd init
cd C:/Projects/1_gwthpipeline520 && bd init
cd C:/Projects/design-system && bd init
```

Skip `acgtest2026-520` for now — it has minimal kanban setup and can be added later.

Each `bd init` will:
- Create `.beads/` directory with Dolt database
- Prompt for role (choose "maintainer" for all)
- Offer git hooks (accept — they auto-sync beads state on commit/push)
- Offer git merge driver (accept — enables cell-level merge for multi-agent)

### Step 1.4 — Set up Claude Code integration in each project

```bash
cd C:/Projects/GWTH_V2 && bd setup claude
cd C:/Projects/gwthtest2026-520 && bd setup claude
cd C:/Projects/1_gwthpipeline520 && bd setup claude
cd C:/Projects/design-system && bd setup claude
```

Verify each:
```bash
bd setup claude --check
```

This installs two Claude Code hooks:
- **SessionStart:** runs `bd prime` — injects ~1-2k tokens of task context into every session
- **PreCompact:** runs `bd sync` — saves beads state to git before context compaction

### Step 1.5 — Add Beads workflow section to each project's CLAUDE.md

Append this block to each project's `CLAUDE.md` (create one for `1_gwthpipeline520` and `design-system` if they don't have one):

```markdown
## Beads Workflow

Use the `bd` CLI for task tracking. This replaces manually reading task files.

### Core Commands
- `bd ready` — find unblocked work (start every session with this)
- `bd create "<title>" -p <priority> -t <type>` — add tasks
- `bd update <id> --claim` — atomically claim a task (sets assignee + in_progress)
- `bd close <id> --reason "<what was done>"` — complete work
- `bd dep add <dependent> <blocking>` — create dependency (dependent waits for blocking)
- `bd dep tree <id>` — visualize dependency chains
- `bd list` — view all issues
- `bd stats` — progress snapshot

### Rules
- Start every session with `bd ready` to find your next task
- Always `bd update <id> --claim` before starting work
- Always `bd close <id>` before committing
- Include issue ID in commit messages: `git commit -m "Fix auth bug (bd-abc)"`
- Do NOT use `bd edit` (interactive editor). Use `bd update` with flags instead.
- At session end, run "Land the Plane": close completed issues, file discovered work as new issues, push to git

### Priority Levels
0 = critical, 1 = urgent, 2 = high, 3 = medium, 4 = backlog

### Issue Types
bug, feature, task, epic, chore
```

### Step 1.6 — Commit Beads setup in each project

```bash
cd C:/Projects/GWTH_V2 && git add .beads/ CLAUDE.md && git commit -m "feat: add Beads task tracker for agent memory and scheduling"
# Repeat for each project
```

---

## Phase 2: Seed Initial Tasks (Day 1-2)

### Step 2.1 — Convert existing kanban ideas into Beads issues

For each project, check `kanban/0_idea/` and `kanban/1_planning/` for pending work. Create Beads issues from them.

**GWTH_V2 example** (3 items currently in `0_idea/`):

```bash
cd C:/Projects/GWTH_V2
bd create "Research: Beads vs Kanban comparison" -p 4 -t chore
bd create "Research: Scaling to 5 parallel agents" -p 4 -t chore
bd create "Research: Kanban + Beads + Orchestrator findings" -p 4 -t chore
# These are already done (the research docs). Close them immediately:
bd close <id1> --reason "Research complete, doc in kanban/0_idea/"
bd close <id2> --reason "Research complete, doc in kanban/0_idea/"
bd close <id3> --reason "Research complete, doc in kanban/0_idea/"
```

Then create actual work items from any planning prompts or known tasks.

### Step 2.2 — Model intra-project dependencies

For each project, identify tasks that block other tasks:

```bash
# Example: GWTH_V2
bd create "Set up Beads + orchestrator infrastructure" -p 1 -t task
bd create "Build course detail page" -p 2 -t feature
bd create "Build lesson viewer" -p 2 -t feature
bd dep add <lesson-viewer-id> <course-detail-id>  # Lesson viewer depends on course detail
```

The key is that `bd ready` will now only surface tasks with zero open blockers. Agents self-serve — no David needed.

---

## Phase 3: Cross-Project Orchestrator (Day 2-3)

### Step 3.1 — Create `C:\Projects\orchestrator.yaml`

This is the lightweight cross-project dependency tracker. It lives outside any single repo.

```yaml
# C:\Projects\orchestrator.yaml
# Cross-project dependency tracker
# David reviews this 1-2x per day to unblock downstream projects
#
# Status: blocked | ready | in_progress | done
# When a blocking project completes its task, update downstream status to "ready"

projects:
  design-system:
    path: C:\Projects\design-system
    test_cmd: "npm test"
    deploy_target: none
    tasks:
      - id: ds-tokens-gwth
        title: "Generate GWTH v2 design tokens"
        status: ready
        blocks:
          - gwth_v2:gwth-theming
      - id: ds-tokens-acg
        title: "Generate ACG design tokens"
        status: ready
        blocks:
          - acgtest2026:acg-theming

  gwth_v2:
    path: C:\Projects\GWTH_V2
    test_cmd: "npm test"
    deploy_target: p520
    tasks:
      - id: gwth-theming
        title: "Apply design-system tokens to GWTH v2"
        status: blocked
        blocked_by:
          - design-system:ds-tokens-gwth
      - id: gwth-lesson-viewer
        title: "Build lesson viewer page"
        status: ready
        blocks:
          - gwthprod:deploy-lesson-viewer

  gwthtest2026:
    path: C:\Projects\gwthtest2026-520
    test_cmd: "npm test"
    deploy_target: p520_and_hetzner
    tasks:
      - id: deploy-lesson-viewer
        title: "Deploy lesson viewer to production"
        status: blocked
        blocked_by:
          - gwth_v2:gwth-lesson-viewer

  pipeline:
    path: C:\Projects\1_gwthpipeline520
    test_cmd: "python -m pytest tests/ -m 'not acceptance'"
    deploy_target: p520
    tasks:
      - id: lesson-content-gen
        title: "Generate lesson content for new course"
        status: ready

  acgtest2026:
    path: C:\Projects\acgtest2026-520
    test_cmd: "npm test"
    deploy_target: hetzner
    tasks:
      - id: acg-theming
        title: "Apply design-system tokens to ACG"
        status: blocked
        blocked_by:
          - design-system:ds-tokens-acg
```

### Step 3.2 — Create `C:\Projects\orchestrate.sh`

This script reads `orchestrator.yaml`, finds ready projects, and kicks off parallel kanban runs.

```bash
#!/usr/bin/env bash
# orchestrate.sh — Cross-project parallel agent launcher
# Usage: bash C:/Projects/orchestrate.sh
#
# Reads orchestrator.yaml, finds projects with "ready" tasks,
# launches parallel kanban runners (one per project).

set -e

ORCH_DIR="C:/Projects"
ORCH_FILE="$ORCH_DIR/orchestrator.yaml"
LOG_DIR="$ORCH_DIR/.orchestrator-logs"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "========================================"
echo "ORCHESTRATOR — $TIMESTAMP"
echo "========================================"

if [ ! -f "$ORCH_FILE" ]; then
    echo "ERROR: $ORCH_FILE not found"
    exit 1
fi

# Find projects with ready tasks (simple grep — no YAML parser needed)
# Each project with "status: ready" gets a kanban run
READY_PROJECTS=()

# Parse the YAML for project paths that have ready tasks
# This is intentionally simple — upgrade to yq if it gets complex
current_path=""
has_ready=false

while IFS= read -r line; do
    # Detect project path lines
    if [[ "$line" =~ ^[[:space:]]+path:[[:space:]]+(.*) ]]; then
        if [ "$has_ready" = true ] && [ -n "$current_path" ]; then
            READY_PROJECTS+=("$current_path")
        fi
        current_path="${BASH_REMATCH[1]}"
        has_ready=false
    fi
    # Detect ready status
    if [[ "$line" =~ status:[[:space:]]+ready ]]; then
        has_ready=true
    fi
done < "$ORCH_FILE"

# Don't forget the last project
if [ "$has_ready" = true ] && [ -n "$current_path" ]; then
    READY_PROJECTS+=("$current_path")
fi

if [ ${#READY_PROJECTS[@]} -eq 0 ]; then
    echo "No projects with ready tasks found."
    exit 0
fi

echo "Projects with ready tasks:"
for p in "${READY_PROJECTS[@]}"; do
    echo "  - $p"
done
echo ""

# Launch parallel kanban runners
PIDS=()
for PROJECT_PATH in "${READY_PROJECTS[@]}"; do
    PROJECT_NAME=$(basename "$PROJECT_PATH")
    LOG_FILE="$LOG_DIR/${TIMESTAMP}_${PROJECT_NAME}.log"

    if [ -f "$PROJECT_PATH/kanban/run-kanban.sh" ]; then
        echo "LAUNCHING: $PROJECT_NAME → $LOG_FILE"
        (cd "$PROJECT_PATH" && bash kanban/run-kanban.sh) > "$LOG_FILE" 2>&1 &
        PIDS+=($!)
    else
        echo "SKIPPING: $PROJECT_NAME (no kanban/run-kanban.sh)"
    fi
done

echo ""
echo "Waiting for ${#PIDS[@]} parallel runners..."
echo ""

# Wait for all and report
FAILED=0
for i in "${!PIDS[@]}"; do
    if wait "${PIDS[$i]}"; then
        echo "DONE: ${READY_PROJECTS[$i]} (success)"
    else
        echo "FAIL: ${READY_PROJECTS[$i]} (check log)"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "========================================"
echo "ORCHESTRATOR COMPLETE"
echo "  Launched: ${#PIDS[@]}"
echo "  Failed:   $FAILED"
echo "  Logs:     $LOG_DIR/${TIMESTAMP}_*.log"
echo "========================================"
```

### Step 3.3 — Create `C:\Projects\check-ready.sh`

A quick status check you run before launching the orchestrator.

```bash
#!/usr/bin/env bash
# check-ready.sh — Show what's ready across all projects
# Usage: bash C:/Projects/check-ready.sh

echo "=== Cross-Project Status ==="
echo ""

for PROJECT in GWTH_V2 gwthtest2026-520 1_gwthpipeline520 design-system; do
    DIR="C:/Projects/$PROJECT"
    if [ -d "$DIR/.beads" ]; then
        echo "--- $PROJECT ---"
        (cd "$DIR" && bd ready 2>/dev/null || echo "  (no ready tasks)")
        echo ""
    else
        echo "--- $PROJECT --- (no beads)"
        # Fallback: check for PROMPT files
        PROMPTS=$(ls "$DIR/kanban/1_planning/PROMPT_"*.md 2>/dev/null | wc -l)
        echo "  $PROMPTS prompt(s) in planning"
        echo ""
    fi
done

echo "=== Orchestrator Dependencies ==="
grep -A2 "status:" C:/Projects/orchestrator.yaml 2>/dev/null | grep -E "(title|status)" || echo "(no orchestrator.yaml)"
```

---

## Phase 4: Enhance Kanban Runner for Beads (Day 3)

### Step 4.1 — Update `run-kanban.sh` in each project

Add Beads integration to the runner. The key changes:

1. **Before processing prompts:** Run `bd ready` to check for Beads tasks
2. **After successful execution:** Close the corresponding Beads issue
3. **On failure:** Update Beads issue with failure notes
4. **At the end:** Run `bd sync` to save state to git

The existing PROMPT file flow continues to work alongside Beads. This is additive, not a replacement — prompts in `1_planning/` still execute as before, but agents also check `bd ready` for task context.

### Step 4.2 — Add "Land the Plane" to session workflow

Add this to every project's `CLAUDE.md`:

```markdown
## Land the Plane (Session End Protocol)

When ending a session or when context is running low:

1. **File remaining work** — Create Beads issues for anything discovered but not completed
2. **Close completed work** — `bd close <id> --reason "<what was done>"`
3. **Run quality gates** — `npm test` or `pytest` as appropriate
4. **Push everything** — `git push` (critical: unpushed work breaks multi-agent coordination)
5. **Sync Beads** — `bd sync`
6. **Generate handoff** — Write a brief summary of:
   - What was accomplished this session
   - What the immediate next task is
   - Any known problems or blockers
   Print this summary so it can be copy-pasted into the next session.
```

---

## Phase 5: David's New Daily Workflow (Day 4+)

### Morning (5-10 minutes)

```bash
# 1. Check cross-project status
bash C:/Projects/check-ready.sh

# 2. Review orchestrator.yaml — update any blocked→ready transitions
#    based on what completed yesterday
code C:/Projects/orchestrator.yaml

# 3. Launch parallel agents
bash C:/Projects/orchestrate.sh
```

### During the day

- Agents run autonomously. Each one:
  - Starts with `bd ready` (via the Claude Code SessionStart hook)
  - Claims a task, executes it, tests, commits, pushes, deploys
  - Files discovered work as new Beads issues
  - Moves to the next `bd ready` task
- If an agent finishes all ready tasks, it "Lands the Plane" and exits

### Evening (5-10 minutes)

```bash
# 1. Check what completed
bash C:/Projects/check-ready.sh

# 2. Review any items in 2_testing/ across projects
ls C:/Projects/GWTH_V2/kanban/2_testing/
ls C:/Projects/gwthtest2026-520/kanban/2_testing/
# etc.

# 3. Verify on P520 (http://192.168.178.50:3001)
# 4. Promote to production where appropriate
bash C:/Projects/GWTH_V2/kanban/promote.sh

# 5. Update orchestrator.yaml — mark completed cross-project tasks as done,
#    unblock downstream projects
```

### Your role changes from:

| Before | After |
|--------|-------|
| "Claude, work on the sidebar next" | Agents self-serve via `bd ready` |
| "Remember, the sidebar depends on..." | Dependencies modeled in `bd dep` |
| "Here's what happened last session..." | "Land the Plane" handoff prompts |
| Mentally tracking 5 sessions | `check-ready.sh` shows status in 3 seconds |
| Deciding task order per project | `bd ready` handles priority + dependency ordering |
| Only cross-project decisions remain | Review `orchestrator.yaml` 1-2x/day |

---

## What This Does NOT Cover (Intentionally Deferred)

- **Gas Town adoption** — Overkill at 5 agents. Revisit if you scale to 10+
- **OpenClaw integration** — Your OpenClaw project is research/planning, not infrastructure. Revisit when you set up local LLMs on RTX 3090
- **Linear integration** — Your Linear MCP is connected but unnecessary for this workflow. Revisit if you need external stakeholder visibility
- **acgtest2026-520** — Add Beads when it has active development work in flight
- **Automated cross-project unblocking** — The orchestrator.yaml is manual. Automating it (e.g., a script that watches for Beads closures and auto-unblocks downstream) is a Phase 6 enhancement

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Beads is 2 months old, could have bugs | Keep kanban scripts as fallback. Beads is additive, not replacing your execution pipeline |
| `bd` doesn't work on Windows | PowerShell installer + native Windows binaries available. Fallback: `npm install -g @beads/bd` |
| Agents ignore Beads instructions | The `bd setup claude` hooks inject context automatically. Plus CLAUDE.md instructions |
| Cross-project YAML gets stale | `check-ready.sh` surfaces staleness. It's 5 min/day to maintain |
| 224 uncommitted files in pipeline | Commit/stash before Phase 1. Do not init Beads on dirty repos |
| Token cost at 5 agents | ~$25/hr with Claude. Budget ~$200/day for a full workday. Monitor usage |

---

## Success Criteria

After 1 week of running this setup:

- [ ] David spends < 15 min/day on scheduling (down from hours)
- [ ] Agents self-serve tasks via `bd ready` without human intervention
- [ ] Session handoffs work — new sessions resume from "Land the Plane" prompts without re-explaining
- [ ] Cross-project dependencies are tracked in orchestrator.yaml and reviewed 1-2x/day
- [ ] Deploy pipeline (test → commit → push → P520 → verify → promote) continues working unchanged
- [ ] At least 3 agents running in parallel without David actively managing them
