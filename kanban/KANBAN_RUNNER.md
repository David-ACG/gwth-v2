# Kanban Runner — Full Deploy Pipeline with Quality Gates

Autonomous prompt loop that takes tasks from idea through test deployment, with structured review gates at every stage transition.

## Project Configuration

- **Project:** GWTH V2 (Student Learning Platform)
- **Test Command:** `npm test`
- **Deploy Target (Test):** P520 at http://192.168.178.50:3001
- **Deploy Target (Prod):** Hetzner at https://gwth.ai
- **Health Check:** /api/health
- **Verification Method:** Playwright browser check
- **Beads Integration:** Yes
- **Linear Integration:** Yes

## Workflow

```
0_idea/   ──Claude──>  1_planning/   ──run-kanban.sh──>  2_testing/  ──promote.sh──>  3_done/
(rough      (craft       (plan + prompt    implement         (verify)     deploy prod     (archived
 notes)     plan &       with review       test, deploy      on P520      w/ timestamp     w/ timestamp)
            prompts)     checklists)       P520, verify

  Gate 1: Plan Review          Gate 2: Prompt Review     Gate 3: Verify    Gate 4: Handoff
  (checklist appended          (checklist appended        (impl notes       (testing checklist
   to PLAN file)                to PROMPT file)            appended)         appended, move
                                                                             to 2_testing/)
```

## Quality Gates

### Gate 1: Plan Review

After writing a PLAN file, Claude appends a timestamped review checklist to the end of the plan and asks David to review it with a clickable file link.

### Gate 2: Prompt Review

After writing PROMPT file(s), Claude appends a timestamped review checklist to the end of each prompt and asks David to review with clickable file links.

### Gate 3: Implementation Verification

After implementing a prompt, Claude runs tests, verifies with Playwright, and appends timestamped implementation notes (commit hash, test results, verification URL, changes summary) to the end of the prompt file.

### Gate 4: Testing Handoff

After implementation, Claude appends a timestamped testing checklist to the prompt file — including an explicit **Actions for David** section that states exactly what David needs to do (or says "No actions required"). Then moves the file to `2_testing/` and tells David.

**Full gate specifications are in the global CLAUDE.md** (`~/.claude/CLAUDE.md` > Kanban Workflow section).

## File Naming Convention

All files MUST use: `PREFIX_YYYY-MM-DD_short-slug.md`

| Prefix      | Example                                      |
| ----------- | -------------------------------------------- |
| `IDEA_`     | `IDEA_2026-03-03_certificate-sharing.md`     |
| `PLAN_`     | `PLAN_2026-03-03_certificate-sharing.md`     |
| `PROMPT_`   | `PROMPT_2026-03-03_certificate-sharing.md`   |
| `RESEARCH_` | `RESEARCH_2026-03-03_diagramming-options.md` |

## File Lifecycle

Files are **archived** (moved to 3_done/), never deleted:

1. **Idea** → archived to `3_done/` when planning is complete (all prompts written)
2. **Plan** → archived to `3_done/` when all prompts from that plan are written
3. **Prompt** → moves `1_planning/` → `2_testing/` → `3_done/`

Gate sections (review checklists, implementation notes, testing checklists) are **appended** to the end of files as work progresses. Each append is date+timestamped.

## Stage Folders

| Folder        | Purpose                                                            |
| ------------- | ------------------------------------------------------------------ |
| `0_idea/`     | Rough notes — any `.md` file, no strict naming required            |
| `1_planning/` | Plans and ready prompts — `PLAN_*.md` and `PROMPT_*.md` files      |
| `2_testing/`  | Deployed to P520 — awaiting David's verification before production |
| `3_done/`     | Promoted to production OR archived — timestamped for audit trail   |

## Ideas → Plans → Prompts

1. Drop any `.md` file into `kanban/0_idea/` with rough notes
2. Ask Claude to process it — Claude creates `PLAN_*.md` in `1_planning/` with Gate 1 checklist
3. **Review the plan** (David checks the file link)
4. Claude creates `PROMPT_*.md` in `1_planning/` with Gate 2 checklist
5. **Review the prompt** (David checks the file link)
6. Idea file is archived to `3_done/`, plan is archived when all prompts are written
7. Implementation begins (manually or via `run-kanban.sh`)

## Scripts

### `run-kanban.sh` — Execute tasks & deploy to P520

```bash
cd C:\Projects\GWTH_V2
bash kanban/run-kanban.sh
```

Processes all `PROMPT_*.md` in `1_planning/` sequentially. Each gets a fresh Claude Code session with `--dangerously-skip-permissions`. The injected system prompt enforces: test → commit → push → deploy P520 → health check → append Gate 3 + Gate 4 to prompt file. On success, the prompt file moves to `2_testing/`.

### `promote.sh` — Deploy to Hetzner production

```bash
bash kanban/promote.sh         # Interactive — pick which to promote
bash kanban/promote.sh --all   # Promote everything in 2_testing/
```

Triggers a Coolify deploy to Hetzner, waits 90s, checks health at `https://gwth.ai/api/health`, then moves promoted files to `3_done/` with a timestamp prefix.

### `deploy-p520.sh` — Standalone P520 deploy

```bash
bash kanban/deploy-p520.sh
```

### `deploy-hetzner.sh` — Standalone production deploy

```bash
bash kanban/deploy-hetzner.sh
```

## Templates

- `PLAN_TEMPLATE.md` — Structure for plan files (includes Gate 1 placeholder)
- `PROMPT_TEMPLATE.md` — Structure for prompt files (includes Gate 2-4 placeholders)

## Quick Deploy Shorthands

For low-risk changes where you want to skip the full review:

| Phrase                                            | What happens                                              |
| ------------------------------------------------- | --------------------------------------------------------- |
| "New idea in 0_idea. Implement it."               | Read → implement → tests → stop (no deploy)               |
| "New idea in 0_idea. Implement and push to live." | Read → implement → tests → commit → push → deploy Hetzner |
| "New idea in 0_idea."                             | Read → craft plan+prompt → wait for review (default)      |

## Requirements

- Claude Code CLI installed and on PATH
- SSH access to P520 (`ssh p520`) configured
- `kanban/` folder structure exists (all stage folders)

## Safety Notes

- `--dangerously-skip-permissions` gives Claude full system access — review results in `2_testing/`
- The runner does NOT deploy to production — that's always a manual `promote.sh` step
- Each prompt gets a fresh context window (no token bleed between tasks)
- Failed prompts stay in `1_planning/` for review and retry
