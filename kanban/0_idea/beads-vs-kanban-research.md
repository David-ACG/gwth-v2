# Beads vs Kanban Runner: Research & Comparison

## Executive Summary

Steve Yegge's **Beads** (`bd`) is a git-backed, dependency-graph issue tracker designed specifically for AI coding agents. Your **Kanban Runner** is a file-based autonomous pipeline that moves markdown prompts through stages (idea -> planning -> testing -> done) with deploy automation baked in.

They solve overlapping but different problems. Beads is primarily about **agent memory and task coordination**. Kanban Runner is primarily about **autonomous execution and deployment**. The strongest outcome may be combining them.

---

## What Is Beads?

Beads is a CLI tool (`bd`) created by Steve Yegge in January 2026. It gives AI agents persistent, structured memory that travels with your git repo. The core insight: agents suffer from "50 First Dates" syndrome — every new session starts from zero context. Beads fixes this with a queryable task graph stored in `.beads/` alongside your code.

**Key mechanics:**
- SQLite database locally (fast queries), JSONL file in git (portable sync)
- Hash-based IDs (`bd-a3f8`) prevent merge collisions between concurrent agents
- Dependency graph: `blocks`, `parent-child`, `related`, `discovered-from`
- `bd ready` — the killer command — returns only tasks with zero open blockers
- "Land the Plane" protocol: formalized session end that files remaining work, updates statuses, and generates a handoff prompt for the next session
- MCP integration so agents can query/update Beads natively
- Supports multiple modes: standard, stealth (local-only), contributor (separate repo)

**GitHub:** github.com/steveyegge/beads (Go binary, cross-platform)

---

## Your Kanban Runner: How It Works Today

```
0_idea/ --> Claude crafts prompt --> 1_planning/ --> run-kanban.sh --> 2_testing/ --> promote.sh --> 3_done/
```

1. Drop rough notes in `0_idea/`
2. Claude structures them into `PROMPT_*.md` in `1_planning/`
3. You review the prompt
4. `run-kanban.sh` processes each prompt: fresh Claude Code session with `--dangerously-skip-permissions`, executes code changes, runs tests, commits, pushes, deploys to P520, health checks
5. Successful prompts move to `2_testing/`
6. You verify on P520, then `promote.sh` deploys to Hetzner production
7. Promoted files move to `3_done/` with timestamps

**Strengths of this approach:**
- Simple, file-based, zero dependencies beyond Claude CLI + bash
- Full CI/CD pipeline baked into each task (test -> commit -> push -> deploy -> health check)
- Clear human gates: review prompt before execution, verify on P520 before production
- Failed prompts stay in `1_planning/` for retry — no lost work
- Each prompt gets a fresh context window — no token bleed between tasks

---

## Head-to-Head Comparison

| Dimension | Kanban Runner | Beads |
|-----------|--------------|-------|
| **Task storage** | Markdown files in folders | SQLite + JSONL in `.beads/` |
| **Task relationships** | Sequential processing, no dependencies | Full dependency graph (blocks, parent-child, related) |
| **Agent memory** | None — each session is fresh | Persistent across sessions via `bd ready` + handoff prompts |
| **Multi-session context** | Re-explain everything each time | "Land the Plane" generates a handoff prompt; next session resumes instantly |
| **Multi-agent support** | Not supported (sequential only) | Hash-based IDs, atomic `--claim`, designed for 20+ concurrent agents |
| **Deployment pipeline** | Built-in (test -> commit -> push -> deploy -> health check) | Not included — Beads is task tracking only, not CI/CD |
| **Human review gates** | Explicit: review prompt, verify P520, promote to prod | Not built-in — you'd add these yourself |
| **Complexity** | ~150 lines of bash + markdown | Go binary + SQLite + JSONL + MCP server + daemon |
| **Setup** | `mkdir kanban/{0_idea,1_planning,2_testing,3_done}` | `npm install -g @beads/bd && bd init` |
| **Discoverability** | `ls kanban/1_planning/` | `bd ready`, `bd list`, `bd show <id>` |
| **Audit trail** | Timestamped files in `3_done/` | Full status history in database, commit message linking (`bd-abc`) |
| **Scope** | Per-project deployment pipeline | Cross-session task management for any project |
| **Failure handling** | Failed prompts stay in `1_planning/` | `bd doctor --fix` detects orphaned/stale issues |

---

## Advantages of Beads Over Kanban Runner

### 1. Agent Memory Across Sessions
The biggest win. Today, if a Kanban Runner task partially completes or you need to continue work the next day, you start from scratch. Beads' handoff prompts and `bd ready` give the agent instant context on what was done, what's left, and what's blocked.

### 2. Dependency-Aware Task Ordering
Your kanban processes prompts sequentially by filename sort order. If task C depends on task A but not B, you have to manually order the files. Beads models this as a graph — `bd ready` automatically surfaces only unblocked work.

### 3. Work Discovery During Execution
When Claude finds a bug while implementing a feature, there's no structured way to capture it in your kanban. Beads has `discovered-from` links — the agent files a new issue, links it to the current task, and continues. Nothing gets forgotten.

### 4. Multi-Agent Parallelism
Your runner processes prompts sequentially. Beads supports multiple agents working concurrently on the same repo with atomic claim operations and collision-resistant hash IDs. This matters if you ever want to run 3-4 Claude sessions in parallel.

### 5. Queryable Task State
"What's blocked?" "What's high priority?" "What did I finish yesterday?" — these require reading files and mentally tracking state in your kanban. With Beads, they're one-liners: `bd ready`, `bd list --status open -p 0`, `bd list --closed-after yesterday`.

### 6. Scales Better for Complex Work
If you're building GWTH v2 with 20+ phases and many interdependent tasks, a flat list of PROMPT files gets unwieldy. Beads' hierarchical IDs (`bd-a3f8.1.1`) and dependency graph handle complex project structures naturally.

---

## Advantages of Kanban Runner Over Beads

### 1. Built-In Deployment Pipeline
This is the big one. Your kanban runner doesn't just track tasks — it **executes them end-to-end**: code -> test -> commit -> push -> deploy to P520 -> health check. Beads tracks what needs doing but doesn't do any of it. You'd need to build the execution layer yourself.

### 2. Explicit Human Gates
Your workflow has two deliberate friction points: reviewing the prompt before execution, and verifying on P520 before production. These are safety rails for autonomous AI execution. Beads has no concept of deployment stages or human approval gates (though its "gates" feature is in development).

### 3. Simplicity
Your entire system is ~150 lines of bash and some markdown conventions. No binary to install, no database, no daemon, no MCP server. Anyone can understand it in 5 minutes by reading `KANBAN_RUNNER.md`. Beads is a full application with SQLite, JSONL sync, a background daemon, and dozens of CLI commands.

### 4. Zero Dependencies
Kanban Runner needs: bash, Claude CLI, ssh. That's it. Beads needs: Go binary (or npm install), plus optionally pip for MCP integration. Your approach has less that can break.

### 5. Transparent State
Your task state is visible in the filesystem. `ls kanban/2_testing/` shows you exactly what's awaiting verification. No need to learn CLI commands. Beads stores state in SQLite — you need `bd list` to see anything.

### 6. Battle-Tested Deploy Flow
The P520 -> verify -> Hetzner promotion flow with health checks is production-ready infrastructure. Moving to Beads would mean rebuilding this from scratch or wrapping it around Beads.

---

## Disadvantages of Each

### Kanban Runner Weaknesses
- **No memory between sessions** — context is lost after each task
- **No dependency modeling** — you manually order tasks by filename
- **Sequential only** — one task at a time, no parallelism
- **No work discovery** — bugs found during execution get lost or are ad-hoc
- **File-based scaling limit** — 20+ PROMPT files become hard to manage
- **No progress tracking** — no way to query "how far are we on the overall plan?"
- **Prompt files are opaque** — you can't ask "what's blocked?" without reading every file

### Beads Weaknesses
- **No execution pipeline** — tracks tasks but doesn't run them
- **New tool (Jan 2026)** — less than 2 months old, still evolving rapidly
- **Added complexity** — SQLite, JSONL, daemon, MCP server — more moving parts
- **Learning curve** — dozens of CLI commands and concepts (formulas, molecules, gates)
- **Not designed for deployment workflows** — no concept of "test environment" vs "production"
- **Overkill for small projects** — if you're running 2-3 tasks per day, the overhead may not pay off
- **Go dependency** — another binary to install and keep updated

---

## The Hybrid Approach: Best of Both

The smartest path may be using Beads for **planning and memory** while keeping your kanban scripts for **execution and deployment**.

```
Beads (planning layer)              Kanban (execution layer)
─────────────────────              ──────────────────────────
bd create "Fix sidebar"     -->     PROMPT_fix-sidebar.md in 1_planning/
bd dep add child parent     -->     (ordering handled by bd ready)
bd ready                    -->     run-kanban.sh processes ready tasks
  "Land the Plane"          -->     Handoff prompt for next session
bd update --close           <--     2_testing/ verification complete
                                    promote.sh deploys to production
```

**How this would work:**
1. Use `bd` to manage the backlog, dependencies, and priorities
2. When ready to execute, `bd ready` tells you what's unblocked
3. Generate PROMPT files from ready Beads issues (could be scripted)
4. `run-kanban.sh` executes and deploys as today
5. On completion, update Beads status
6. "Land the Plane" at session end to preserve context for tomorrow
7. Next session starts with the Beads handoff prompt — zero re-explanation

This gives you agent memory + dependency tracking (Beads) without losing your battle-tested deploy pipeline (Kanban Runner).

---

## Recommendation

**For where you are today** — building GWTH v2 with a known task list and mostly sequential work — your Kanban Runner is sufficient and simpler. The deploy pipeline is genuinely valuable and Beads offers nothing equivalent.

**When Beads becomes worth adding:**
- When you start having tasks with complex dependencies (A blocks B, C blocks D, B+D unblock E)
- When you lose context between sessions and waste time re-explaining to Claude
- When you want to run multiple agents in parallel
- When the task backlog grows beyond what's comfortable to manage as flat files
- When you find yourself filing follow-up tasks discovered during implementation

**If you adopt Beads, keep your kanban scripts.** Beads replaces `0_idea/` and the planning stage. Your `run-kanban.sh`, `deploy-p520.sh`, `promote.sh`, and `deploy-hetzner.sh` remain the execution backbone. The two layers complement each other.

**Effort to integrate:** Medium. You'd install `bd`, add a few lines to `CLAUDE.md` telling agents to use it, and write a small bridge script that converts `bd ready` output into PROMPT files. The "Land the Plane" protocol would need to be added to your session workflow (could be a CLAUDE.md instruction).

---

## Sources

- GitHub: github.com/steveyegge/beads
- Yegge's blog posts on Medium (Jan-Feb 2026): "Introducing Beads", "The Beads Revolution", "Beads Best Practices"
- Community writeups: paddo.dev, ianbull.com, edgartools.io
- AI Tinkerers interview with Yegge on agentic coding workflows
