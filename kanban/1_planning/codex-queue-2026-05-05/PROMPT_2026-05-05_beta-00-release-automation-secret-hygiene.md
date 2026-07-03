# Task: Beta 00 - Release Automation Secret Hygiene

**Date:** 2026-05-05  
**Plan Reference:** `kanban/1_planning/PLAN_2026-05-04_beta-launch-23-may.md`

## What to change

Remove hardcoded deployment secrets from local release scripts before using automation more heavily.

## Specific Instructions

1. Inspect `kanban/deploy-hetzner.sh`, `kanban/promote.sh`, `kanban/deploy-p520.sh`, and `.github/workflows/ci.yml`.
2. Move any hardcoded Coolify token, app UUID, webhook URL, or similarly sensitive value out of shell scripts into environment variables.
3. Add clear failure messages when required env vars are missing.
4. Do not change the GitHub Actions secret-based deploy flow unless it is broken.
5. Update docs/comments to show required env var names without real secret values.

## Files likely affected

- `kanban/deploy-hetzner.sh`
- `kanban/promote.sh`
- `kanban/deploy-p520.sh`
- `kanban/KANBAN_RUNNER.md`
- `.env.local.example` only if needed for non-secret variable names

## Acceptance criteria

- [ ] No hardcoded Coolify token remains in tracked shell scripts.
- [ ] Scripts fail clearly when required env vars are missing.
- [ ] GitHub Actions deploy behavior is not regressed.
- [ ] No real secret values are added to any file.

## Verification

```bash
bash -n kanban/deploy-hetzner.sh
bash -n kanban/promote.sh
bash -n kanban/deploy-p520.sh
git diff -- kanban/deploy-hetzner.sh kanban/promote.sh kanban/deploy-p520.sh
```

## Notes

Do this before broad automated deploy/promotion work.
