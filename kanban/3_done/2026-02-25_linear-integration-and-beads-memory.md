# Linear Integration + Beads as Long-Term Memory

**Date:** 2026-02-25
**Context:** Extending the Beads + Kanban Runner workflow with Linear as the intake layer and evaluating Beads memory vs interactive prompting.

---

## Part 1: Linear → Kanban Pipeline

### The Idea

You raise an issue in Linear from anywhere (phone, desktop, tablet). An hourly polling script detects it, creates a markdown file in `kanban/0_idea/`, and it flows through the existing pipeline. You never have to be at your desk to feed work into the system.

### Architecture

```
Phone/Desktop/Anywhere
    │
    ▼  Create issue in Linear (GWTH Dev team, label: "idea")
    │
    ▼  [Hourly: linear-poll.py via Windows Task Scheduler]
    │
    ├── Queries Linear API for issues with "idea" label + Todo/Backlog status
    ├── Creates markdown in kanban/0_idea/ for each new issue
    ├── Comments on the Linear issue: "Picked up by automation"
    ├── Moves Linear issue to "In Progress"
    │
    ▼  [Claude session or run-kanban.sh]
    │
    ├── Claude reads idea from 0_idea/, crafts PROMPT in 1_planning/
    ├── run-kanban.sh executes: code → test → commit → push → deploy
    ├── On completion: updates Linear issue to "Done" with summary comment
    │
    ▼  Done
```

### Why Polling, Not Webhooks

Linear supports webhooks but they require a publicly accessible HTTPS endpoint. Your dev machine is behind a home network (192.168.178.x). You'd need ngrok or a Hetzner receiver. Polling is simpler:

- One GraphQL query per hour — well within rate limits
- Zero infrastructure beyond a Python script + Task Scheduler
- Up to 1 hour latency is fine for kanban idea intake
- Your `LINEAR_API_KEY` is already set in your environment

### What Needs Creating in Linear

Your current labels are: Bug, Improvement, Feature. You need one new label:

| Label | Color | Purpose |
|-------|-------|---------|
| **idea** | `#F2C94C` (yellow) | Tag issues the polling script should pick up |

Issues you want to flow into kanban: create them in GWTH Dev with the "idea" label. Status doesn't matter (Todo or Backlog both work).

### The Polling Script

`kanban/linear-poll.py` — Python stdlib only, no pip installs needed. Uses your existing `LINEAR_API_KEY` env var.

```python
#!/usr/bin/env python3
"""
Linear -> Kanban Bridge
Polls Linear for issues labeled "idea" and creates markdown files in kanban/0_idea/.

Run hourly via Windows Task Scheduler:
  schtasks /Create /TN "LinearKanbanPoll" /TR "python C:\\Projects\\GWTH_V2\\kanban\\linear-poll.py" /SC HOURLY /ST 00:00
"""

import json
import os
import re
import urllib.request
from datetime import datetime
from pathlib import Path

# Config
LINEAR_API_KEY = os.environ["LINEAR_API_KEY"]
LINEAR_API_URL = "https://api.linear.app/graphql"
KANBAN_DIR = Path(__file__).parent
IDEA_DIR = KANBAN_DIR / "0_idea"
STATE_FILE = KANBAN_DIR / ".linear-poll-state.json"
LOG_FILE = KANBAN_DIR / ".linear-poll.log"
TEAM_NAME = "GWTH Dev"
PICKUP_LABEL = "idea"


def log(msg):
    """Append a timestamped message to the log file."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def graphql(query, variables=None):
    """Execute a GraphQL query against the Linear API."""
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    data = json.dumps(payload).encode()
    req = urllib.request.Request(LINEAR_API_URL, data=data, headers={
        "Content-Type": "application/json",
        "Authorization": LINEAR_API_KEY,
    })
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())


def load_state():
    """Load the set of already-processed issue IDs."""
    if STATE_FILE.exists():
        return set(json.loads(STATE_FILE.read_text()))
    return set()


def save_state(processed_ids):
    """Save processed issue IDs to prevent reprocessing."""
    STATE_FILE.write_text(json.dumps(list(processed_ids)))


def slugify(text):
    """Convert title to filename-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text[:60]


def fetch_new_ideas():
    """Fetch issues labeled 'idea' in Todo/Backlog status."""
    query = """
    {
      issues(filter: {
        team: { name: { eq: "%s" } }
        state: { type: { in: ["unstarted", "backlog"] } }
        labels: { name: { eq: "%s" } }
      }, first: 50, orderBy: createdAt) {
        nodes {
          id identifier title description
          state { name }
          labels { nodes { id name } }
          priority
          createdAt
        }
      }
    }
    """ % (TEAM_NAME, PICKUP_LABEL)
    result = graphql(query)
    return result["data"]["issues"]["nodes"]


def create_idea_file(issue):
    """Create a markdown file in kanban/0_idea/ from a Linear issue."""
    IDEA_DIR.mkdir(parents=True, exist_ok=True)
    slug = slugify(issue["title"])
    filename = f"{issue['identifier'].lower()}_{slug}.md"
    filepath = IDEA_DIR / filename

    labels = [l["name"] for l in issue["labels"]["nodes"] if l["name"] != PICKUP_LABEL]
    label_str = ", ".join(labels) if labels else "none"
    priority_map = {0: "None", 1: "Urgent", 2: "High", 3: "Normal", 4: "Low"}
    priority = priority_map.get(issue.get("priority", 0), "None")

    content = f"""# {issue['title']}

**Linear:** {issue['identifier']} | **Priority:** {priority} | **Labels:** {label_str} | **Created:** {issue['createdAt'][:10]}

## Description

{issue.get('description') or 'No description provided.'}

---
*Auto-imported from Linear issue {issue['identifier']}*
"""
    filepath.write_text(content, encoding="utf-8")
    return filepath


def mark_picked_up(issue_id):
    """Add a comment to the Linear issue noting it was picked up."""
    graphql(
        """
        mutation($issueId: String!, $body: String!) {
          commentCreate(input: { issueId: $issueId, body: $body }) {
            success
          }
        }
        """,
        {
            "issueId": issue_id,
            "body": f"Picked up by kanban automation at {datetime.now().isoformat()}",
        },
    )


def main():
    processed = load_state()
    try:
        issues = fetch_new_ideas()
    except Exception as e:
        log(f"ERROR: Failed to query Linear: {e}")
        return

    new_count = 0
    for issue in issues:
        if issue["id"] in processed:
            continue

        filepath = create_idea_file(issue)
        mark_picked_up(issue["id"])
        processed.add(issue["id"])
        new_count += 1
        log(f"Created: {filepath.name} (from {issue['identifier']})")

    save_state(processed)
    log(f"Polled Linear: {len(issues)} idea(s) found, {new_count} new")


if __name__ == "__main__":
    main()
```

### Scheduling on Windows

Register with Task Scheduler (run once in PowerShell):

```powershell
schtasks /Create /TN "LinearKanbanPoll" /TR "python C:\Projects\GWTH_V2\kanban\linear-poll.py" /SC HOURLY /ST 00:00 /F
```

To test manually:
```bash
python C:/Projects/GWTH_V2/kanban/linear-poll.py
```

To check logs:
```bash
cat C:/Projects/GWTH_V2/kanban/.linear-poll.log
```

### Closing the Loop: Updating Linear on Completion

When Claude finishes processing an idea through the kanban pipeline, it should update Linear. Two approaches:

**Option A — MCP tools in Claude Code sessions:**
Add to the `run-kanban.sh` injected system prompt:
```
After completing the task, check if the kanban idea file references a Linear issue
(look for "Linear: GWTH-XX"). If found, update it:
  - Use mcp__linear__update_issue to set status to "Done"
  - Use mcp__linear__create_comment with a summary of what was implemented
```

**Option B — Direct API in a post-processing script:**
Add a `kanban/linear-close.py` that reads completed prompt files in `2_testing/` or `3_done/`, extracts the Linear issue ID, and updates via the API. This is more reliable since it doesn't depend on Claude remembering.

### Files to Gitignore

Add to `.gitignore`:
```
kanban/.linear-poll-state.json
kanban/.linear-poll.log
```

---

## Part 2: Beads as Long-Term Memory — Does It Actually Work?

### How `bd prime` Works (The Key Mechanism)

When you run `bd setup claude`, it installs a **SessionStart hook** that automatically runs `bd prime` at the start of every Claude Code session. No human action needed.

`bd prime` generates a ~1-2k token summary containing:
- Open issues organized by priority (P0/P1/P2)
- Which issues are blocked and by what
- Which issues are ready to work on (no open blockers)
- Dependency graph overview
- Current workflow state

It uses optimized `BriefIssue` data models that achieve **97% token reduction** vs full issue objects (the full Issue struct has 81 fields — `bd prime` includes only what agents need for decision-making).

**Compare this to the MCP approach** (10-50k tokens) or human re-explaining (2-5k+ tokens, inconsistent, error-prone).

### The "Land the Plane" Handoff

At session end, you tell Claude "Land the Plane" which triggers:

1. Close completed Beads issues
2. File remaining discovered work as new issues
3. Run quality gates (tests)
4. Commit and push everything
5. Run `bd sync` to persist issue state to git
6. Generate a **handoff prompt** — what was done, what's next, known problems

The next session: `bd prime` auto-injects the current task state. If you also paste the handoff prompt, the agent has both structured data AND narrative context. Zero re-explaining.

### Beads Memory vs Interactive Prompting: Honest Comparison

| Dimension | Beads (`bd prime`) | You Re-Explaining |
|-----------|-------------------|-------------------|
| **Token cost per session** | ~1-2k (fixed, structured) | 2-5k+ (variable, verbose) |
| **Accuracy** | Deterministic — reflects actual issue state | You forget details, especially after 3+ sessions |
| **"What's next?"** | `bd ready` returns definitive answer | You have to remember and articulate |
| **Dependencies** | Queryable graph — agent knows what's blocked | "I think X depends on Y" (unreliable at scale) |
| **Multi-day projects** | Strong — persistent across unlimited sessions | Degrades rapidly, especially across 5 projects |
| **Setup cost** | `bd init` + `bd setup claude` per project | Zero |
| **Mid-session drift** | Still happens — agent forgets to check Beads unless prompted | Still happens — agent forgets your instructions |
| **Infrastructure** | Dolt DB, git hooks, background daemon | Nothing |

### Is Beads Better Than Interactive Prompting?

**Yes, for your situation. Here's why:**

You're running 5 projects with cross-dependencies. Interactive prompting breaks down at this scale because:

1. **You can't hold all the context.** At 2-3 sessions you could re-explain everything. At 5 sessions across 5 projects, you'd spend more time briefing agents than they spend coding.

2. **Your memory is the weakest link.** "Did I tell the design-system session about the token format change?" With Beads, it's in the issue graph — no question.

3. **Session boundaries become free.** Today, starting a new session costs you 5-15 minutes of re-explaining. With `bd prime` auto-injecting context, it costs 0 minutes of your time and 1-2k tokens.

4. **Agents self-serve.** Instead of you deciding what each agent works on, `bd ready` surfaces unblocked work automatically. You stop being the dispatcher.

**Where interactive prompting is still better:**

- **One-off tasks** — "Fix this typo" doesn't need Beads overhead
- **Creative/exploratory work** — "Explore dark mode approaches" benefits from conversation, not structured tasks
- **Mid-session course corrections** — When you see something wrong and need to redirect immediately, talking to the agent is faster than updating Beads issues
- **Projects with < 5 tasks** — The overhead isn't justified

### The Honest Caveats (From Real Users)

The research surfaced real complaints worth knowing:

**1. Agents don't proactively use Beads.** Ian Bull: "Claude doesn't proactively use it. You need to say 'track this in beads.'" The SessionStart hook helps, but mid-session the agent can still forget. Mitigation: short sessions (one issue per session), kill and restart rather than running long sessions.

**2. `bd setup claude` can overwrite settings.** One user reported it nearly destroyed their `~/.claude/settings.json`. **Back up your settings first.** Review what it modifies before accepting.

**3. Invasive hooks.** `bd init` installs git hooks that intercept commits with prompts. This can break CI pipelines and annoy you during rapid development. You can decline the hooks during init and manage Beads manually via `bd sync`.

**4. Stability issues reported.** SQLite corruption in dev containers, sync bugs (issues getting resurrected after deletion), macOS CGO crashes. These are mostly edge cases but worth knowing. The Dolt backend (now default) is more robust than the older SQLite backend.

**5. It's 2 months old.** Rapidly evolving, API changes, breaking updates possible. Your kanban scripts are the safety net — they continue working regardless of Beads' state.

### Practical Recommendation

**Use Beads for the structured memory layer. Keep interactive prompting for creative and exploratory work.**

The workflow becomes:

```
Beads handles:                     You handle:
────────────────                   ──────────────
- Session context injection        - Creative direction
- "What should I work on?"        - "Try this approach instead"
- Dependency tracking              - Cross-project unblocking
- Session handoffs                 - Production promotion
- Work discovery during execution  - Quality review
```

For most tasks (bugs, features, refactors with clear requirements), Beads + autonomous kanban is better than interactive prompting. The agent gets precise context in 1-2k tokens instead of a rambling 5k briefing, and you spend zero time on it.

For ambiguous work (design exploration, architecture decisions, "make this look better"), interactive prompting remains better because it's a conversation, not a task.

---

## Part 3: Updated Workflow With Linear + Beads

### The Full Picture

```
                         YOU
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
          Linear App   Linear App   Linear App
          (phone)      (desktop)    (tablet)
              │           │           │
              └─────┬─────┘           │
                    ▼                 │
            Create issue with         │
            label "idea"              │
                    │                 │
                    ▼                 │
         [Hourly: linear-poll.py]     │
                    │                 │
                    ▼                 │
          kanban/0_idea/*.md          │
                    │                 │
              ┌─────┼─────┐          │
              ▼     ▼     ▼          │
           Claude Claude Claude       │
           (bd     (bd    (bd         │
           prime)  prime) prime)       │
              │     │     │           │
              ▼     ▼     ▼           │
           1_planning/ (PROMPT files)  │
              │     │     │           │
              ▼     ▼     ▼           │
           run-kanban.sh (parallel)    │
           test → commit → push → deploy
              │     │     │           │
              ▼     ▼     ▼           │
           2_testing/ (verify on P520) │
              │                       │
              ▼                       │
        promote.sh → Hetzner prod     │
              │                       │
              ▼                       │
        Linear issue → "Done"         │
        (with summary comment)        │
              │                       │
              ▼                       │
        "Land the Plane" →            │
        handoff saved in Beads        │
              │                       │
              ▼                       │
        Next session starts with      │
        bd prime (auto-context)  ◄────┘
```

### Your New Daily Routine

**Morning (5 min):**
1. Check `linear-poll.log` — any new ideas picked up overnight?
2. Glance at `orchestrator.yaml` — any cross-project unblocks needed?
3. Launch agents: `bash C:/Projects/orchestrate.sh`

**During the day:**
- Raise ideas from anywhere via Linear (phone, desktop, wherever)
- Agents run autonomously — `bd prime` gives them context, `bd ready` gives them work
- Each session ends with "Land the Plane" — handoff saved for next time

**Evening (5 min):**
1. Review `2_testing/` folders — verify on P520
2. Promote to production where appropriate
3. Update `orchestrator.yaml` for cross-project completions

**Ad-hoc:**
- Use interactive Claude sessions for creative/exploratory work
- Use Linear for anything you want tracked and automated
- Use kanban `0_idea/` directly for quick notes when you're already at your desk

---

## Implementation Steps

| Step | Action | Effort |
|------|--------|--------|
| 1 | Create "idea" label in Linear | 1 min |
| 2 | Save `linear-poll.py` to `kanban/` | Already written above |
| 3 | Add `.linear-poll-state.json` and `.linear-poll.log` to `.gitignore` | 1 min |
| 4 | Test the script manually: `python kanban/linear-poll.py` | 2 min |
| 5 | Register Task Scheduler job for hourly polling | 2 min |
| 6 | Install Beads in active projects (per 2026-02-24 plan) | 30 min |
| 7 | Add "Land the Plane" instructions to each CLAUDE.md | 10 min |
| 8 | Test end-to-end: create Linear issue with "idea" label → wait for poll → verify markdown appears | 5 min |
| 9 | Add Linear update instructions to `run-kanban.sh` system prompt | 5 min |

Total: ~1 hour to set up, assuming Beads installation goes smoothly.

---

## Sources

### Beads Memory
- Beads docs: `steveyegge.github.io/beads/integrations/claude-code`
- DeepWiki: "Claude Plugin" and "AI Agent Integration" analysis
- Ian Bull: "Beads: Memory for Your Coding Agents" (hands-on review)
- qmx: "On Beads, Bloat, and Breaking Points" (critical review)
- Better Stack: "Beads Guide" (practical walkthrough)
- Mike Mason: "AI Coding Agents in 2026" (industry analysis)

### Linear API
- Linear developer docs: `linear.app/developers/graphql`
- Linear filtering docs: `linear.app/developers/filtering`
- Linear webhooks docs: `linear.app/developers/webhooks`
- Linear MCP: `linear.app/docs/mcp`
