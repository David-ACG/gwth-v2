# Kanban Runner + Beads + Orchestrator: Full Research

## The Problem

David runs 5+ projects under `C:\Projects`, many interdependent (design-system feeds GWTH_V2, pipeline feeds the website). He currently manages 2-3 parallel Claude Code sessions but has become the bottleneck — mentally tracking cross-project dependencies, deciding which agent works on what, and re-explaining context every session. He wants to scale to 5 parallel agents without being the scheduler.

---

## Part 1: Does a Cross-Project Agent Orchestrator Already Exist?

**Yes. Steve Yegge's Gas Town is exactly this.**

### Gas Town — The Multi-Project Orchestrator

Gas Town (`gt`) is a Go-based multi-agent workspace manager released January 2, 2026. It sits on top of Beads and manages 20-30 parallel Claude Code agents across multiple repositories.

**Architecture:**
- A **Town** (the `gt` binary) manages all workers across all your **Rigs** (projects/repos)
- The Town lives in a separate config repo
- Each project under management is called a **Rig**
- Seven distinct agent roles with specialized responsibilities:

| Role | Purpose |
|------|---------|
| **Mayor** | Strategic coordinator — reviews, prioritizes, assigns work |
| **Polecats** | Workers — execute implementation tasks |
| **Refinery** | Code review — reviews PRs before merge |
| **Witness** | Quality assurance — runs tests, validates changes |
| **Deacon** | Documentation — keeps docs in sync with changes |
| **Dogs** | Security — scans for vulnerabilities, secrets |
| **Crew** | Infrastructure — CI/CD, deploy, DevOps |

**Cross-project capabilities:**
- All rig-level workers (refinery, witness, polecats, crew) can work **cross-rig**
- `gt worktree` lets any worker grab an isolated clone of any rig
- **Beads has cross-rig routing** — commands like `bd create` and `bd show` automatically route to the correct database based on issue prefix
- All Beads commands work from anywhere in Gas Town

**How it runs:** Built on **tmux** — each agent gets its own tmux pane. Gas Town manages session lifecycle, context windows, and handoffs.

**Cost warning:** ~$100/hour in Claude tokens when running 20-30 agents. At 5 agents, roughly ~$25/hour.

**Sources:**
- GitHub: `steveyegge/gastown`
- Blog: "Welcome to Gas Town" (Medium, Jan 2026)
- Blog: "The Future of Coding Agents" (Medium)
- Analysis: "GasTown and the Two Kinds of Multi-Agent" (paddo.dev)
- Article: "What Kubernetes for AI Coding Agents Looks Like" (Cloud Native Now)

---

### Composio Agent Orchestrator — Single-Project Parallelism

The strongest general-purpose parallel agent orchestrator for a single codebase.

- Each agent gets its own git worktree, branch, and PR
- Autonomous CI fix loop: agent fixes CI failures, addresses review comments
- Agent-agnostic: supports Claude Code, Codex, Aider
- Runtime-agnostic: tmux, Docker
- Tracker-agnostic: GitHub, Linear
- Plugin system for agents, runtimes, trackers, notifications
- Built by 30 concurrent agents (40,000 lines of TypeScript, 3,288 tests in 8 days)

**Gap:** Single-codebase only. No cross-project dependency awareness.

**Source:** GitHub: `ComposioHQ/agent-orchestrator`

---

### Anthropic Agent Teams — Built Into Claude Code

Claude Code now has experimental Agent Teams (February 2026, with Opus 4.6).

- One session acts as team lead, coordinating work
- Teammates work independently in their own context windows
- Teammates can communicate directly with each other
- Good for: research, new modules, debugging, cross-layer coordination

**Gap:** Operates within a single codebase/session. There is an open feature request (Issue #497) for multi-repo support.

**Source:** Anthropic docs: `code.claude.com/docs/en/agent-teams`

---

### Terminal Multiplexers (Parallel Sessions Without Coordination)

These tools let you run multiple agent sessions side-by-side but provide **no shared awareness or dependency tracking**.

| Tool | Key Feature | Platform |
|------|------------|----------|
| **Superset** | 10+ parallel agents, isolated worktrees, diff viewer, notifications | Cross-platform |
| **Maestro** | Desktop app, 1-6 sessions, visual git graph, batch playbooks | macOS/Windows/Linux |
| **cmux (Coder)** | Electron-based, isolated worktrees | Cross-platform |
| **cmux (Manaflow)** | Native macOS terminal using libghostty | macOS |
| **constellagent** | Agents with own terminal, editor, worktree | macOS |

---

### JAT (Joe's Agentic Terminal)

Combines Beads + Agent Mail + 50 bash tools with a visual dashboard.

- Live session monitoring, task management, code editor, terminal
- Epic Swarm parallel workflows
- Auto-proceed rules and automation patterns
- Supervise 20+ agents from one UI
- Connect RSS, Slack, Telegram, Gmail — events create tasks and spawn agents

**Source:** GitHub: `joewinke/jat`

---

### The Expert View: How Many Agents Is Practical?

Addy Osmani (Google Chrome team) wrote extensively about this:

> "The natural bottleneck isn't generating code — it's reviewing it."
> "Two well-reviewed implementations beat five half-reviewed ones."

**Consensus across multiple sources:**
- **3-5 parallel agents** is the practical sweet spot
- Beyond 8-10, merge complexity eats the productivity gains
- Review capacity is the hard constraint, not compute
- WIP limits (from Kanban) apply to agents too

**Sources:**
- "Your AI Coding Agents Need a Manager" (Addy Osmani)
- "The 80% Problem in Agentic Coding" (Addy Osmani, Substack)
- "The Rise of Coding with Parallel Agents" (LeadDev)

---

## Part 2: How Does OpenClaw Handle This?

### What OpenClaw Is

OpenClaw (formerly Clawdbot, then Moltbot) is a free, open-source autonomous AI agent by Peter Steinberger. It's a personal assistant you run locally that connects to messaging platforms (WhatsApp, Telegram, Slack, Discord, etc.) and lets you interact with LLMs through those channels.

- 219,000+ GitHub stars
- Node.js/TypeScript Gateway process
- Memory stored as Markdown files on disk
- MIT licensed
- Steinberger joined OpenAI in Feb 2026; project moving to an open-source foundation

### OpenClaw's Multi-Agent Model

OpenClaw supports **multiple isolated agents** within a single Gateway:
- Each agent is a "fully scoped brain" with its own workspace, personality files, auth, sessions
- Routing: messages go to agents via a most-specific-wins hierarchy (peer > guild > channel > default)
- Agent-to-agent messaging: supported but disabled by default, must be explicitly allowlisted
- Per-agent sandboxing: individual sandbox modes, tool allow/deny lists, optional Docker

### The Critical Gap: Not Built for Parallel Coding

OpenClaw's multi-agent features were designed for **routing different conversations to different assistant personas**, not for **coordinated parallel coding across repos**.

**What it lacks natively:**
- No task board, kanban, or dependency graph
- No progress tracking dashboard
- No DAG-based dependency management
- No automatic workload distribution
- No git-worktree isolation per task
- Agent-to-agent communication is basic message passing, not structured state sharing

### Community Projects Filling the Gap

The OpenClaw community has built several orchestration layers:

| Project | What It Does |
|---------|-------------|
| **Clawe** (`getclawe/clawe`) | "Trello for OpenClaw agents." Kanban tasks, @mentions, shared files, web dashboard |
| **Agent Board** (`quentintou/agent-board`) | Kanban + DAG dependencies + MCP server + auto-retry + audit trail |
| **Mission Control** (`abhi1693/openclaw-mission-control`) | Centralized operations dashboard with approval controls |
| **Claw-Kanban** (`GreenSheep01201/Claw-Kanban`) | Kanban that routes tasks to Claude Code, Codex CLI, Gemini CLI with role-based auto-assignment |
| **Antfarm** (`snarktank/antfarm`) | Specialized agent team (planner, developer, verifier, tester, reviewer) |
| **Claworc** (`gluk-w/claworc`) | Structured multi-agent workflows |

### Your Local OpenClaw Project

Your `C:\Projects\Openclaw` is **not an OpenClaw installation** — it's a research/planning workspace containing:

- `architecture/openclaw-local-llm-plan.md` — 1050-line research doc on running OpenClaw with local LLMs on RTX 3090
- `architecture/gwth-lesson-agentic-mindset.md` — GWTH lesson plan teaching "The Agentic Mindset"
- `architecture/higgs-audio-v2-research.md` — Higgs Audio V2 research for GWTH lesson audio
- `kanban/` — Same kanban runner pattern as your other projects (serial execution, not parallel orchestration)

### Verdict on OpenClaw

**OpenClaw alone is not the answer for coordinating 5+ parallel coding agents across repos.** It's a personal assistant framework, not a CI/CD orchestrator. You'd need to bolt on Clawe or Agent Board to get structured task coordination, and even then the cross-project dependency awareness you need isn't built in.

However, OpenClaw + Agent Board could be a future option if you also adopt OpenClaw as your general AI assistant platform. That's a bigger commitment than just adding Beads.

---

## Part 3: Comparison Matrix — All Options

| | Gas Town + Beads | Composio | Agent Teams | OpenClaw + Agent Board | Beads + Your Kanban | Custom Orchestrator |
|---|---|---|---|---|---|---|
| **Cross-project deps** | A (cross-rig routing) | F (single repo) | F (single session) | C (basic messaging) | B (manual YAML) | B (you build it) |
| **Intra-project scheduling** | A (bd ready) | A (worktree per task) | B (team lead assigns) | B (kanban board) | A (bd ready) | C (file-based) |
| **Agent memory** | A (Land the Plane) | C (no handoffs) | C (session-scoped) | B (markdown memory) | A (Land the Plane) | F (none) |
| **Execution pipeline** | B (you wire it up) | A (CI fix loop) | C (manual) | C (manual) | A (your scripts) | A (your scripts) |
| **Deploy integration** | F (none built in) | C (GitHub Actions) | F (none) | F (none) | A (P520 + Hetzner) | A (P520 + Hetzner) |
| **Setup effort** | High (Go, tmux, config) | Medium (npm) | Low (built into Claude) | High (Node.js, Gateway) | Medium (bd init per project) | Medium (bash scripting) |
| **Cost** | ~$25/hr at 5 agents | Agent tokens only | Agent tokens only | Agent + Gateway tokens | Agent tokens only | Agent tokens only |
| **Maturity** | 2 months old | 2 months old | Experimental | 4 months old (community tools newer) | Beads: 2 months | You maintain it |
| **Best for** | Power users, 10+ agents | Single-project parallelism | Within-session teams | OpenClaw ecosystem users | Incremental upgrade | Full control |

---

## Part 4: Recommendation

### For David's Situation (5 agents, 5+ projects, Windows)

**Short term (this week): Beads + Enhanced Kanban Runner**

Gas Town is the most complete solution but it's heavy (Go binary, tmux-based, designed for 20-30 agents on Linux/macOS). For 5 agents on Windows with your existing deploy scripts, the lighter approach is:

1. Install Beads in your 3-4 active projects
2. Add a cross-project `orchestrator.yaml` in `C:\Projects\`
3. Enhance `run-kanban.sh` to use `bd ready` for task selection
4. Add "Land the Plane" to each session's workflow
5. Write a thin `orchestrate.sh` that runs parallel kanban loops across projects

**Medium term (1-2 months): Evaluate Gas Town or Composio**

Once you've validated the Beads workflow, consider:
- Gas Town if you want full cross-rig routing and are willing to invest in the tmux/Go setup
- Composio if most of your parallel work is within a single project
- Agent Teams if Anthropic ships multi-repo support

**Avoid for now:**
- OpenClaw orchestration — too much infrastructure for your use case, and the community tools are very new
- Building a full custom orchestrator from scratch — Gas Town already exists

---

## Part 5: 10 Name Options for This Setup

Your setup: Beads (agent memory + task graph) + Kanban Runner (execution + deploy pipeline) + cross-project orchestrator. It needs a name.

| # | Name | Rationale |
|---|------|-----------|
| 1 | **GWTH Forge** | A forge shapes raw material into finished product. Ideas go in, deployed code comes out. |
| 2 | **Rig Runner** | Nods to Gas Town's "Rig" terminology. Each project is a rig, the runner executes across them. |
| 3 | **Beadwork** | The combination of Beads (memory/tasks) with your execution framework. Implies craftsmanship. |
| 4 | **Pipeline Ops** | Straightforward. It's a pipeline that operates across projects. |
| 5 | **Hive** | Multiple agents working in parallel, coordinated by a shared graph. Queen bee = orchestrator, workers = Claude sessions. |
| 6 | **Threadmill** | Each agent runs a "thread" of work. The mill coordinates them. Also a pun — it keeps things moving. |
| 7 | **Relay** | Like a relay race — tasks pass between stages (idea → plan → execute → test → deploy) and between projects. |
| 8 | **Loom** | Weaves multiple threads (agents, projects, dependencies) into a coherent fabric. |
| 9 | **Conductor** | You conduct the orchestra — set the tempo, cue the sections, but each musician (agent) plays independently. |
| 10 | **Crossbow** | **Cross**-project **B**eads **O**rchestrated **W**orkflow. Also: aims precisely, fires autonomously. |

---

## Part 6: The Landscape at a Glance

```
                        CROSS-PROJECT COORDINATION
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              Gas Town        orchestrator.yaml   Linear
              (heavy,          (lightweight,     (external,
               Go/tmux)        you maintain)     full PM tool)
                    │              │              │
                    └──────┬───────┘              │
                           │                      │
                    INTRA-PROJECT SCHEDULING       │
                           │                      │
                ┌──────────┼──────────┐           │
                │          │          │           │
             Beads     Composio   Agent Teams     │
             (bd ready,  (worktree   (built-in,   │
              memory)    per task)   experimental) │
                │          │          │           │
                └──────┬───┘          │           │
                       │              │           │
                    EXECUTION & DEPLOY            │
                       │                          │
              ┌────────┼────────┐                 │
              │        │        │                 │
         run-kanban.sh  CI/CD   Manual            │
         promote.sh    (GitHub  (Claude Code      │
         deploy-*.sh   Actions) interactive)      │
              │                                   │
              └───────────────────────────────────┘
                       YOUR CURRENT SETUP
                    (kanban scripts + manual scheduling)
```

---

## Sources

### Gas Town & Beads
- GitHub: `steveyegge/gastown`, `steveyegge/beads`
- "Welcome to Gas Town" — Yegge, Medium (Jan 2026)
- "The Future of Coding Agents" — Yegge, Medium
- "GasTown and the Two Kinds of Multi-Agent" — paddo.dev
- "What Kubernetes for AI Coding Agents Looks Like" — Cloud Native Now
- "Steve Yegge on AI Agents" — Pragmatic Engineer newsletter

### Composio & Terminal Multiplexers
- GitHub: `ComposioHQ/agent-orchestrator`
- "Open-Sourcing Agent Orchestrator" — pkarnal.com
- GitHub: `superset-sh/superset`, `its-maestro-baby/maestro`, `coder/mux`, `manaflow-ai/cmux`
- `awesome-agent-orchestrators` — github.com/andyrewlee

### Anthropic Agent Teams
- Anthropic docs: `code.claude.com/docs/en/agent-teams`
- "Building a C Compiler with Parallel Claudes" — anthropic.com/engineering
- "Claude Code Hidden Multi-Agent System" — paddo.dev

### OpenClaw Ecosystem
- GitHub: `openclaw/openclaw`
- OpenClaw Multi-Agent docs: `docs.openclaw.ai/concepts/multi-agent`
- "OpenClaw Multi-Agent Orchestration Advanced Guide" — zenvanriel.nl
- Community: `getclawe/clawe`, `quentintou/agent-board`, `abhi1693/openclaw-mission-control`
- Community: `GreenSheep01201/Claw-Kanban`, `snarktank/antfarm`, `gluk-w/claworc`

### Expert Analysis
- "Your AI Coding Agents Need a Manager" — Addy Osmani
- "The 80% Problem in Agentic Coding" — Addy Osmani, Substack
- "The Rise of Coding with Parallel Agents" — LeadDev
- "Anthropic 2026 Agentic Coding Trends Report" — resources.anthropic.com
