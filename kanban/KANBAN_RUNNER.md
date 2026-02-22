# Kanban Runner — Full Deploy Pipeline

Autonomous prompt loop that takes tasks from idea through test deployment, with a manual promotion step for production.

## Workflow

```
0_idea/  ──Claude──>  1_planning/  ──run-kanban.sh──>  2_testing/  ──promote.sh──>  3_done/
(rough     (craft      (structured    code+test+commit    (verify)    deploy prod     (archived
 notes)    prompt)      prompt)       push+deploy P520    on P520     w/ timestamp     w/ timestamp)
           you review
```

1. Drop rough notes (any `.md` file) into `kanban/0_idea/`
2. Ask Claude to turn the idea into a prompt — Claude creates `PROMPT_*.md` in `1_planning/` and deletes the idea file
3. **Review the prompt** before proceeding
4. Exit Claude Code, run: `bash kanban/run-kanban.sh`
5. Each prompt executes: **code change -> npm test -> commit -> push -> deploy P520 -> health check**
6. Completed prompts move to `2_testing/`
7. Verify changes at **http://192.168.178.50:3001**
8. Promote to production: `bash kanban/promote.sh`
9. Verify at **https://gwth.ai**

## Scripts

### `run-kanban.sh` — Execute tasks & deploy to P520

```bash
cd C:\Projects\GWTH_V2
bash kanban/run-kanban.sh
```

Processes all `PROMPT_*.md` in `1_planning/` sequentially. Each gets a fresh Claude Code session with `--dangerously-skip-permissions`. The injected system prompt enforces the full pipeline (test, commit, push, deploy P520, health check). On success, the prompt file moves to `2_testing/`.

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

Deploys current master to P520 and checks health. Useful during interactive Claude sessions or manual testing.

### `deploy-hetzner.sh` — Standalone production deploy

```bash
bash kanban/deploy-hetzner.sh
```

Deploys current master to Hetzner production and checks health. Use when you want to deploy without the promote workflow.

## Stage Folders

| Folder | Purpose |
|--------|---------|
| `0_idea/` | Rough notes — any `.md` file, no naming convention required |
| `1_planning/` | Ready prompts — `PROMPT_*.md` files the runner will execute |
| `2_testing/` | Deployed to P520 — awaiting user verification before production |
| `3_done/` | Promoted to production — timestamped for audit trail |

## Ideas → Prompts

Drop any `.md` file into `0_idea/` with rough notes about what you want. No structure needed — bullet points, half sentences, screenshots references, whatever captures the idea. Then ask Claude to craft it into a prompt.

Claude will:
1. Read the idea file from `0_idea/`
2. Create a structured `PROMPT_*.md` in `1_planning/` with clear acceptance criteria (see `PROMPT_TEMPLATE.md` for the format)
3. Delete the original idea file from `0_idea/`
4. Tell you the prompt is ready for review

**Always review the prompt before running the kanban loop or implementing it.** The idea-to-prompt step is where requirements get clarified and scoped — catching issues here is much cheaper than after implementation.

## Prompt Format

The generated prompts follow `PROMPT_TEMPLATE.md`. Key rules:

- File must be named `PROMPT_*.md` (e.g., `PROMPT_fix-sidebar.md`)
- Reference files (plans, specs) can go in `1_planning/` without the `PROMPT_` prefix — the runner tells Claude they exist
- Acceptance criteria should be specific so the autonomous session knows when it's done
- Each prompt gets a completely fresh Claude Code session — don't assume state from previous prompts

## Requirements

- Claude Code CLI installed and on PATH
- SSH access to P520 (`ssh p520`) configured
- `kanban/` folder structure exists (all stage folders)

## Safety Notes

- `--dangerously-skip-permissions` gives Claude full system access — review results in `2_testing/`
- The runner does NOT deploy to production — that's always a manual `promote.sh` step
- Each prompt gets a fresh context window (no token bleed between tasks)
- Health checks have retries but will fail-fast if the server is unreachable
- Failed prompts stay in `1_planning/` for review and retry
