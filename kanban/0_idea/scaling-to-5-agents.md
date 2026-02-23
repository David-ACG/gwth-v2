# Scaling to 5 Parallel Agents: The Real Problem and Options

## The Actual Problem

You are not bottlenecked by tooling. You are bottlenecked by being **the human scheduler, dependency tracker, and context store** across 5+ projects simultaneously. Today you can manage 2-3 tabs because you can mentally hold:

- "GWTH_V2 is working on the sidebar, don't touch layout components"
- "design-system just finished tokens, so ACG can start theming"
- "pipeline is blocked until the website API endpoint lands"

At 5 agents, this mental model breaks. You'd spend more time coordinating than producing. The question isn't "which task tracker?" — it's "what replaces me as the orchestrator?"

## Your Current Landscape

| Project | Status | Kanban | Dependencies |
|---------|--------|--------|-------------|
| **GWTH_V2** | Active dev | Yes | Consumes design-system tokens |
| **gwthtest2026-520** | Production | Yes | Deploys from GWTH_V2 work |
| **1_gwthpipeline520** | Production | Yes (planning/testing) | Feeds lesson content to website |
| **design-system** | Active dev | Yes | Feeds GWTH_V2, ACG |
| **acgtest2026-520** | Active dev | Yes (empty) | Consumes design-system |
| **GCSEReady-520** | Planning | No | Independent (for now) |

Cross-project flow:
```
design-system --> GWTH_V2 --> gwthtest2026-520 (production)
             \-> acgtest2026-520 (production)

1_gwthpipeline520 --> lesson content --> gwthtest2026-520
```

## Option 1: Beads

**What it gives you:**
- Per-project dependency graphs with `bd ready` surfacing unblocked work
- Agent memory via "Land the Plane" handoff prompts — no re-explaining next session
- Multi-agent safe: hash IDs, atomic claim operations, no merge collisions
- Agents self-serve their next task: `bd ready` → pick top priority → `bd update --claim` → work

**What it doesn't give you:**
- Cross-project coordination — Beads is per-repo. It can't model "GWTH_V2 task X is blocked by design-system task Y"
- Execution pipeline — no test/commit/push/deploy. You keep your kanban scripts for that
- Human review gates — no built-in concept of "verify on P520 before production"

**How you'd use it:**
1. `bd init` in each active project
2. Add to each project's CLAUDE.md: "Use `bd ready` to find your next task. Use `bd update --claim` before starting. Run `bd` commands for task management."
3. Each agent session starts with `bd ready` instead of you telling it what to do
4. Each session ends with "Land the Plane" — files remaining work, generates handoff prompt
5. Your kanban run-kanban.sh still handles execution + deploy

**Cross-project gap:** You'd still need to manually say "design-system is done with tokens, GWTH_V2 can start theming." Beads can't model this today.

**Verdict:** Solves 70% of the bottleneck (intra-project scheduling + memory). Doesn't solve cross-project coordination.

## Option 2: Linear as the Orchestrator

You already have Linear MCP connected. Linear is designed for exactly this — cross-project dependency tracking with teams, projects, and issue relationships.

**What it gives you:**
- Cross-project visibility: one board showing all work across all repos
- Blocking relationships: "GWTH_V2 #45 is blocked by design-system #12"
- Priorities, labels, cycles — proper project management
- API + MCP: agents can query and update Linear programmatically
- You already have it set up

**What it doesn't give you:**
- Agent memory / session handoffs (no "Land the Plane")
- Agents can't self-serve "what should I work on?" without custom tooling
- Git-native storage — Linear is external, not in the repo
- The lightweight feel of your kanban folder approach

**How you'd use it:**
1. Create a Linear team/project per repo (or one umbrella project)
2. File all tasks in Linear with cross-project blocking relationships
3. Agents query Linear MCP at session start: "What's assigned to me and unblocked?"
4. Agents update Linear on completion
5. You manage priorities and dependencies in Linear's UI — visual, not mental

**Verdict:** Best cross-project coordination. Weakest on agent memory and session handoffs. Adds external dependency.

## Option 3: Beads + Linear Hybrid

Use both layers for what they're good at:

```
Linear (strategic layer)                    Beads (tactical layer)
───────────────────────                     ─────────────────────
Cross-project dependencies                  Per-project task breakdown
"design-system blocks GWTH_V2 theming"      "bd-a3f8: Implement token loader"
Priorities across the whole portfolio        "bd-a3f8.1: Add dark mode variants"
Human review & approval gates               Agent memory & session handoffs
                                            "bd ready" for self-serve scheduling
```

**Flow:**
1. You create high-level tasks in Linear with cross-project blocking relationships
2. When a Linear task is unblocked, you (or a script) creates Beads issues in the relevant project
3. Agents use `bd ready` within their project — no need to query Linear for intra-project work
4. Agents "Land the Plane" at session end — handoff prompts for next session
5. On completion, agent updates Beads; you (or a script) updates Linear
6. Kanban scripts still handle execution + deploy

**Verdict:** Most complete solution but most complex. Two systems to maintain.

## Option 4: Enhanced Kanban Runner (no new tools)

Extend what you have. Add a central orchestrator file that models cross-project dependencies and auto-generates PROMPT files when dependencies clear.

**New file: `C:\Projects\orchestrator.md`**
```markdown
## Active Work

### design-system
- [x] Generate GWTH tokens
- [ ] Generate ACG tokens (in progress)

### GWTH_V2 (blocked by: design-system GWTH tokens)
- [ ] Implement sidebar with new tokens ← UNBLOCKED
- [ ] Quiz engine refactor (no dependencies)

### gwthtest2026-520
- [ ] Deploy after GWTH_V2 sidebar lands (blocked)
```

**New script: `C:\Projects\orchestrate.sh`**
- Reads orchestrator.md (or a structured YAML/JSON version)
- Checks which tasks are unblocked
- Generates PROMPT files in the correct project's `kanban/1_planning/`
- Runs multiple `run-kanban.sh` instances in parallel (one per project)

**What it gives you:**
- Cross-project dependency tracking (in a file you control)
- Parallel execution across projects
- No new tools to install
- Builds on your existing kanban infrastructure

**What it doesn't give you:**
- Agent memory / session handoffs
- Sophisticated dependency queries
- Multi-agent collision safety (you'd need file locking or separate branches)

**Verdict:** Lowest friction, stays in your comfort zone, but doesn't solve the memory problem and requires you to maintain the orchestrator file manually.

## Option 5: Beads + Enhanced Kanban (Recommended)

This is the sweet spot for your situation:

```
                    YOU (strategic decisions only)
                     │
                     ▼
            Cross-project orchestrator.yaml
            (which projects are blocked/unblocked)
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   design-system   GWTH_V2    pipeline
   bd ready        bd ready    bd ready
   run-kanban.sh   run-kanban  run-kanban
   Land the Plane  Land Plane  Land Plane
```

**Your new role:** You stop being the scheduler and become the **release manager**. You make two decisions:

1. **Morning:** Review cross-project blockers. Unblock projects in orchestrator.yaml. Takes 5 minutes.
2. **Evening:** Review what landed. Promote to production. Approve cross-project unblocks.

**Agents handle everything else:**
- `bd ready` → pick task → execute → test → commit → push → deploy to P520 → `Land the Plane`
- Next session: read handoff prompt → `bd ready` → continue

**Implementation steps:**

1. Install Beads in the 3-4 active projects (`bd init`)
2. Add Beads instructions to each project's CLAUDE.md
3. Create `C:\Projects\orchestrator.yaml` for cross-project dependencies
4. Modify `run-kanban.sh` to start with `bd ready` instead of scanning for PROMPT files
5. Add "Land the Plane" as the final step in run-kanban.sh
6. Write a thin `orchestrate.sh` that checks orchestrator.yaml and kicks off run-kanban.sh per project

**What this costs:** ~2 hours to set up Beads in your projects. ~1 hour to write orchestrator.yaml + orchestrate.sh. Your existing deploy scripts stay untouched.

**What this buys:** You go from "I am the scheduler for 5 agents" to "I review results and unblock cross-project work twice a day."

---

## Decision Matrix

| Criterion | Beads Only | Linear Only | Beads+Linear | Enhanced Kanban | Beads+Kanban |
|-----------|-----------|-------------|-------------|----------------|-------------|
| Intra-project scheduling | A | C | A | C | A |
| Cross-project deps | F | A | A | B | B |
| Agent memory | A | F | A | F | A |
| Execution pipeline | F | F | F | A | A |
| Setup effort | Low | Low | Medium | Low | Medium |
| Ongoing maintenance | Low | Medium | High | Medium | Low |
| Scales to 5 agents | Yes | Partial | Yes | Partial | Yes |
| Removes you as bottleneck | Mostly | Partially | Yes | Partially | Mostly |

## My Take

**Go with Option 5: Beads + Enhanced Kanban.**

Beads directly solves your two biggest pain points:
1. **You stop being the scheduler** — agents self-serve via `bd ready`
2. **You stop being the context store** — "Land the Plane" handoffs mean no re-explaining

Your kanban scripts keep doing what they're good at: test → commit → push → deploy → health check.

The remaining gap (cross-project coordination) is small enough to handle with a simple YAML file that you review once or twice a day. You don't need Linear for this unless your project count grows past 8-10.

The key mindset shift: **you become a release manager, not a dispatcher.**
