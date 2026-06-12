# Analysis Report: Autonomous Build Workflow Optimization

**Date:** 2026-03-13
**Author:** Claude Code (research + analysis)

---

## Problem Statement

David reports two issues with the current workflow:

1. **Questions during build phase:** Despite planning being done upfront, Claude still asks "Do you want to proceed?" and similar confirmation questions during implementation, breaking the autonomous flow.
2. **Context window exhaustion:** The 200K token window fills up and runs out even when compaction is configured at 40-50% usage.

---

## Root Cause Analysis

### Problem 1: Why Claude Still Asks Questions

**Finding:** There are THREE different execution contexts, and only ONE is properly configured for autonomy:

| Context | Autonomy Level | Why |
|---------|---------------|-----|
| `run-kanban.sh` (headless) | **Fully autonomous** | Uses `--dangerously-skip-permissions` + injected "Do not ask questions" prompt |
| `/autonomous` slash command | **Mostly autonomous** | Good instructions but relies on `acceptEdits` permission mode — Bash commands still prompt |
| **Normal interactive session** | **Mixed** | CLAUDE.md says "act decisively" but `settings.json` only has `acceptEdits` mode + limited `allow` list |

**The gap:** When David works interactively (not via `run-kanban.sh`), Claude is in `acceptEdits` mode. This auto-approves file edits but **still prompts for most Bash commands** that aren't in the `allow` list. The `allow` list only covers: `ssh`, `ssh-keyscan`, `chmod`, `curl`, `jq`, `bash`. Missing: `npm`, `npx`, `git`, `node`, `bd`, `docker`, and others.

Additionally, the CLAUDE.md Execution Protocol says "Phase 1: INTERACTIVE — Ask ALL clarifying questions upfront" which is correct, but Phase 2 says "AUTONOMOUS — no questions" without any mechanism to actually enforce this. The instructions tell Claude not to ask, but the permission system still interrupts.

**The `defaultMode: acceptEdits`** means:
- File reads: auto-approved
- File edits/writes: auto-approved
- **Bash commands: PROMPTED** (unless in the `allow` list)
- This is why you see "Do you want to proceed?" — it's the permission system, not Claude choosing to ask

### Problem 2: Why Context Window Fills Up

**Finding:** Multiple compounding factors:

1. **Massive CLAUDE.md files:** The global CLAUDE.md is ~250 lines. The project CLAUDE.md is ~700+ lines. Together they consume ~15-20K tokens before any work begins. Add system prompt, tool definitions, and Beads context from `bd prime`, and you're at ~30-40K tokens before typing anything.

2. **Single-session monolithic execution:** When implementing a complex feature interactively, everything happens in one context window — reading files, writing code, running tests, fixing errors, committing, deploying, appending gate documentation. Each cycle adds tool call results that don't get cleaned up.

3. **Compaction timing is reactive, not structural:** The rule says "compact at 40-50%" but by then you've already used 80-100K tokens. Compaction helps but doesn't recover tokens perfectly — it summarizes but loses detail. After 2-3 compactions, Claude loses track of what it's already done.

4. **`run-kanban.sh` solves this but isn't being used:** The kanban runner spawns a **fresh Claude session per prompt file**. Each prompt gets a clean 200K window. This is the right architecture but David seems to be doing interactive sessions instead.

5. **No subagent delegation:** Heavy operations (reading many files, running tests, doing research) happen in the main context window instead of being delegated to subagents with their own windows.

---

## Current Setup vs. Best Practices

### What You Have Right (keep these)

1. **`run-kanban.sh`** — Excellent architecture. Fresh session per prompt, skip-permissions, injected pipeline instructions, Beads integration, automatic file moves.
2. **Beads tracking** — Dependency-aware issue tracking across sessions.
3. **4-gate quality system** — Good checkpoints for plan review, prompt review, implementation, testing.
4. **Notification hooks** — TTS + Slack + Telegram alerts when Claude needs attention.
5. **`/autonomous` slash command** — Good escape hatch for interactive sessions.

### What Needs Fixing

| Issue | Current State | Fix |
|-------|--------------|-----|
| Permission prompts in interactive mode | `acceptEdits` + small allow list | Expand `allowedTools` in settings.json |
| Context bloat from CLAUDE.md | ~950 lines loaded every session | Split into `.claude/rules/` directory |
| No subagent usage for heavy ops | Everything in main window | Use subagents for test runs, file exploration, deployments |
| Compaction not aggressive enough | Manual at 40-50% | Add auto-compact hook or use subagents to avoid filling up |
| Interactive vs headless confusion | Two paths, different behavior | Standardize on headless for builds, interactive only for planning |

---

## Recommended Changes

### Change 1: Fix Permission Settings (HIGH IMPACT, EASY)

Update `~/.claude/settings.json` to pre-approve all common build commands:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(node:*)",
      "Bash(git:*)",
      "Bash(bd:*)",
      "Bash(ssh:*)",
      "Bash(ssh-keyscan:*)",
      "Bash(chmod:*)",
      "Bash(curl:*)",
      "Bash(~/bin/jq:*)",
      "Bash(bash:*)",
      "Bash(docker:*)",
      "Bash(python:*)",
      "Bash(pytest:*)",
      "Bash(pip:*)",
      "Bash(cat:*)",
      "Bash(ls:*)",
      "Bash(mkdir:*)",
      "Bash(mv:*)",
      "Bash(cp:*)",
      "Bash(rm:*)",
      "Bash(grep:*)",
      "Bash(find:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(wc:*)",
      "Bash(sort:*)",
      "Bash(cd:*)",
      "Bash(powershell.exe:*)",
      "Bash(echo:*)"
    ],
    "defaultMode": "acceptEdits"
  }
}
```

This eliminates ~90% of "Do you want to proceed?" prompts during builds. You keep `acceptEdits` as the default mode (so Claude still asks before truly unusual operations) but pre-approve all standard dev tools.

**Alternative (nuclear option):** Change `defaultMode` to `"bypassPermissions"` — this is equivalent to `--dangerously-skip-permissions` for every session. Only do this if you're comfortable with Claude running any command without asking.

### Change 2: Split CLAUDE.md into Rules Directory (HIGH IMPACT, MEDIUM EFFORT)

Instead of one massive CLAUDE.md, use the `.claude/rules/` directory:

```
.claude/rules/
├── 01-autonomy.md          # Autonomy rules + execution protocol
├── 02-design-system.md     # Colors, typography, dimensions
├── 03-architecture.md      # Server components, streaming, etc.
├── 04-testing.md           # Test commands, verification
├── 05-deployment.md        # Coolify, P520, Hetzner
├── 06-kanban.md            # Gate rules, file lifecycle
└── 07-beads.md             # Beads commands and workflow
```

Benefits:
- Each rule file is loaded independently — smaller per-file overhead
- Claude can selectively load what's relevant
- Easier to maintain and update
- Reduces baseline token usage by ~30-40%

**Critical:** Keep the project CLAUDE.md but trim it to essentials (~100-150 lines). Move reference material (color tables, file structure trees, code examples) into rules files.

### Change 3: Standardize on Headless Builds (HIGH IMPACT, EASY)

**The workflow should be:**

1. **Interactive session** = Planning only (Phase 1)
   - Create beads issues
   - Write plan files
   - Write prompt files
   - Review and approve
   - Then EXIT the session

2. **`run-kanban.sh`** = Building (Phase 2)
   - Fresh session per prompt
   - Full autonomy
   - No questions
   - Automatic test → commit → push → deploy → verify
   - Each prompt gets clean 200K window

3. **Interactive session** = Verification (Phase 3)
   - Review what was built
   - Check P520 test URLs
   - Promote to production if good

**Never do planning AND building in the same interactive session.** This is where context runs out.

### Change 4: Use Subagents for Heavy Operations (MEDIUM IMPACT, EASY)

When working interactively, delegate context-heavy operations to subagents:

```
# Instead of running tests in main context:
# (main) npm test → 500 lines of output fills context

# Delegate to subagent:
# (subagent) "Run npm test and report pass/fail with any failure details"
# (main) Gets back 5-line summary
```

Operations to always delegate:
- Running test suites (`npm test`, `pytest`)
- Reading many files for exploration
- Deployment scripts
- Playwright browser checks
- Git log analysis

This keeps the main context window lean and focused on decision-making.

### Change 5: Add Context Management Hook (MEDIUM IMPACT, MEDIUM EFFORT)

Add a `PreToolUse` hook that warns when context is getting high:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "bash -c 'echo \"Context check: consider /compact if working on a long task\"'",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

Note: Claude Code doesn't expose token count to hooks directly, so this is more of a reminder. The real fix is Change 3 (headless builds with fresh sessions per prompt).

### Change 6: Create Project-Level Build Command (LOW EFFORT, HIGH CONVENIENCE)

Create `.claude/commands/build.md` for each project:

```markdown
Run the kanban build pipeline. Execute this in the terminal:

```bash
bash kanban/run-kanban.sh
```

This runs all PROMPT_*.md files from kanban/1_planning/ through the full pipeline (test → commit → push → deploy → verify).

Do NOT implement anything yourself — the script handles it.
```

Then David can just type `/build` to kick off the pipeline.

---

## Recommended Workflow (After Changes)

### Planning Session (Interactive, ~30 min)

```
David: "I need feature X"
Claude: [Creates beads issue, writes plan, writes prompts]
David: [Reviews plan + prompts, approves]
Claude: [Archives idea to 3_done/]
David: "OK run /build" or exits and runs run-kanban.sh manually
```

### Build Phase (Headless, unattended)

```bash
cd C:\Projects\GWTH_V2
bash kanban/run-kanban.sh
# Go make coffee. Each prompt gets its own fresh Claude session.
# TTS/Slack/Telegram alerts if something fails.
```

### Verification Session (Interactive, ~10 min)

```
David: "What was built?"
Claude: [Reads 2_testing/ files, summarizes]
David: [Checks P520 URLs, ticks checklist boxes]
David: "Promote to production"
Claude: [Deploys to Hetzner, moves files to 3_done/]
```

**Total human interaction:** ~40 min instead of hours of babysitting.

---

## About Ralph Wiggum / Loops

The `/loop` command is for **recurring monitoring tasks** (e.g., "check deploy status every 5 minutes"). It's not designed for build orchestration. Your `run-kanban.sh` is already a better solution for sequential task execution because:

- It spawns fresh sessions (clean context each time)
- It has proper error handling and retry logic
- It integrates with Beads
- It handles file lifecycle (move to 2_testing/)

You don't need `/loop` for builds. Keep it for monitoring (e.g., `/loop 5m check if P520 is healthy`).

---

## Implementation Priority

| # | Change | Impact | Effort | Do When |
|---|--------|--------|--------|---------|
| 1 | Fix settings.json allowedTools | Eliminates question prompts | 5 min | **Now** |
| 2 | Split CLAUDE.md into rules/ | Reduces context by ~30% | 1-2 hours | Next session |
| 3 | Standardize headless builds | Eliminates context exhaustion | Process change | **Now** |
| 4 | Use subagents in interactive | Keeps context lean | Habit change | **Now** |
| 5 | Add context hook | Reminder safety net | 15 min | Optional |
| 6 | Create /build command | Convenience | 5 min | **Now** |

---

## Key Insight

**Your `run-kanban.sh` already solves both problems.** The issue is that you're doing build work in interactive sessions instead of using it. The planning phase should produce self-contained prompt files, and then `run-kanban.sh` executes them in isolated sessions with full autonomy and fresh context windows.

The permission settings fix (Change 1) will help for the interactive planning sessions too — no more "Do you want to proceed?" when running `git`, `npm`, or `bd` commands during planning.
