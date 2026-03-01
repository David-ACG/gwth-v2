# Task: Create Cross-Project Orchestrator

## What to change

Create a cross-project orchestration system that lets David see status across all 4 projects and launch parallel kanban runners. Three files go in `C:\Projects\` (the parent of all project directories).

## Steps

### 1. Create `C:\Projects\orchestrator.yaml`

This YAML file tracks all projects, their paths, test commands, deploy targets, and known tasks. Seed it with real current data:

```yaml
# Cross-Project Orchestrator — manages parallel agent work across projects
# Updated: 2026-03-01

projects:
  gwth_v2:
    path: C:\Projects\GWTH_V2
    test_cmd: "npm test"
    deploy_target: p520
    prod_deploy: hetzner
    health_url: "https://gwth.ai/api/health"
    test_url: "http://192.168.178.50:3001/api/health"

  gwthtest2026:
    path: C:\Projects\gwthtest2026-520
    test_cmd: "npm test"
    deploy_target: p520_and_hetzner
    health_url: "https://gwth.ai"
    test_url: "http://192.168.178.50:3001"

  pipeline:
    path: C:\Projects\1_gwthpipeline520
    test_cmd: "python -m pytest tests/ -m 'not acceptance'"
    deploy_target: p520
    health_url: "http://192.168.178.50:8088/health"

  design_system:
    path: C:\Projects\design-system
    test_cmd: "npm test"
    deploy_target: none
```

### 2. Create `C:\Projects\check-ready.sh`

A quick status-check script that shows ready work across all projects. For each project in `orchestrator.yaml`:
- Print the project name and path
- Show count of PROMPT files in `kanban/1_planning/`
- Show count of items in `kanban/2_testing/` (awaiting verification)
- If `bd` CLI is available and Dolt is up, show `bd ready` output
- Print a summary line at the end

Use simple bash — parse the YAML with grep/awk (no Python dependency). The script should work even if some project paths don't exist (skip with a warning).

### 3. Create `C:\Projects\orchestrate.sh`

The main launcher that runs kanban runners in parallel across projects:
- Read `orchestrator.yaml` to find projects with PROMPT files in `1_planning/`
- For each project with ready prompts, launch `bash kanban/run-kanban.sh` in the background
- Log output per project to `C:\Projects\.orchestrator-logs/<project>-<timestamp>.log`
- Create the logs directory if it doesn't exist
- Wait for all background processes to complete
- Print a summary of which projects ran and their exit codes
- Add `.orchestrator-logs/` to a `.gitignore` in `C:\Projects\` if one doesn't exist

The script should be safe to run when no projects have ready prompts (just print "Nothing to do").

## Files likely affected
- `C:\Projects\orchestrator.yaml` (NEW)
- `C:\Projects\check-ready.sh` (NEW)
- `C:\Projects\orchestrate.sh` (NEW)
- `C:\Projects\.gitignore` (NEW — ignore `.orchestrator-logs/`)

## Acceptance criteria
- [ ] `orchestrator.yaml` exists at `C:\Projects\orchestrator.yaml` with all 4 projects
- [ ] `bash C:/Projects/check-ready.sh` runs and shows status for all projects
- [ ] `bash C:/Projects/orchestrate.sh` runs without errors (even when no prompts are ready)
- [ ] `.orchestrator-logs/` directory is gitignored
- [ ] Scripts handle missing project paths gracefully (skip with warning)
- [ ] Scripts work in Git Bash on Windows

## Notes
- All scripts must use bash (Git Bash on Windows). Use forward slashes in paths where possible.
- The `run-kanban.sh` script already exists in each project's `kanban/` folder.
- Don't use Python dependencies — keep it pure bash for simplicity.
- `yq` is NOT installed. Parse YAML with grep/sed/awk.
