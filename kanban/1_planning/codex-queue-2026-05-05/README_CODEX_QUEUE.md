# Codex Queue - GWTH_V2

Date: 2026-05-05  
Purpose: staged prompts for the 2026-05-23 UK beta release.

These prompt files are staged in this subfolder so the root `kanban/run-kanban.sh` does not accidentally run them alongside older root prompts. Activate one prompt at a time by running it directly in Codex CLI, or move a selected prompt into `kanban/1_planning` after checking what other root prompts are present.

## Queue Order

0. `PROMPT_2026-05-05_beta-00-release-automation-secret-hygiene.md`
1. `PROMPT_2026-05-05_beta-01-product-copy-homepage.md`
2. `PROMPT_2026-05-05_beta-02-billing-and-beta-access.md`
3. `PROMPT_2026-05-05_beta-03-month1-import-rendering.md`
4. `PROMPT_2026-05-05_beta-04-completion-score-credential.md`
5. `PROMPT_2026-05-05_beta-05-capstone-admin-review.md`
6. `PROMPT_2026-05-05_beta-06-doc-source-cleanup.md`

## Root Prompt Check

```powershell
Get-ChildItem C:\Projects\GWTH_V2\kanban\1_planning -File -Filter "PROMPT_*.md"
```

## Key Sources

- `docs/product-source-of-truth-2026-05-04.md`
- `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md`
- `PRODUCT.md`
- `DESIGN.md`
- `src/lib/config.ts`
- `src/components/marketing/data.ts`

## Subagent Notes

- Public Tech Radar claims still appear in public areas despite beta deferral.
- `Dynamic Score` remains in some user-facing areas and should become `GWTH Score`.
- Local deploy scripts should not contain hardcoded Coolify tokens.
