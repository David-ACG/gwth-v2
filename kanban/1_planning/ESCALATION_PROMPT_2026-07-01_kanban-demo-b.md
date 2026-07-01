# ⛔ Kanban gate escalation — needs David

- **Project:** gwth-v2-kanban
- **Prompt:** PROMPT_2026-07-01_kanban-demo-b.md (left in `1_planning/`)
- **Reason:** no-mistakes ask-user escalation
- **When:** 2026-07-01 18:35:39

## What happened
The no-mistakes gate paused on an `ask-user` finding (or failed) and the
headless runner did **not** auto-accept it. Your call is required.

## Resolve
```bash
cd /tmp/gwth-v2-kanban
no-mistakes axi status        # read the ask-user finding verbatim
# then respond: no-mistakes axi respond --action approve|fix|skip ...
```
Or drive it from Desktop with `/no-mistakes`. Once resolved and the PR is
clean, re-run the kanban pipeline to move this prompt to 2_testing/.
