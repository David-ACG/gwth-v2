# Task: Linear Close-the-Loop — Auto-Update Issues on Completion

## What to change

When a kanban idea that originated from Linear is completed (moved to `2_testing/` or `3_done/`), the Linear issue should be automatically updated to "Done" with a summary comment. This closes the automation loop: Linear idea → poll → prompt → implement → deploy → Linear done.

## Approach: Post-processing script (Option B from the plan)

Create `kanban/linear-close.py` — a standalone Python script that scans completed kanban files for Linear issue references and updates them via the Linear API.

## Steps

### 1. Create `kanban/linear-close.py`

The script should:

1. Scan all `.md` files in `kanban/2_testing/` and `kanban/3_done/`
2. Look for Linear issue references in the file content. The `linear-poll.py` script writes these as:
   - `Linear: GWTH-XX` (in the frontmatter/header)
   - Or `linear_issue_id: <uuid>` if the UUID was included
3. For each found reference:
   - Query Linear API to check current status (skip if already Done/Canceled)
   - Update the issue status to "Done"
   - Add a comment summarizing what was implemented (extract from the prompt file content)
4. Track which files have already been processed to avoid duplicate updates (use a state file like `.linear-close-state.json`)
5. Log actions to `.linear-close.log`

### 2. Wire into kanban workflow

Add a call to `linear-close.py` at the end of `kanban/run-kanban.sh`, after prompts are moved to `2_testing/`. This is non-blocking — if it fails, the kanban run still succeeds.

Add to `run-kanban.sh` after the move-to-testing step:
```bash
# Close the loop on Linear issues
if [ -f "kanban/linear-close.py" ]; then
    echo "Updating Linear issues..."
    python kanban/linear-close.py 2>&1 || echo "Warning: Linear close-the-loop failed (non-blocking)"
fi
```

### 3. Add state/log files to .gitignore

Add `.linear-close-state.json` and `.linear-close.log` to the project `.gitignore`.

## Files likely affected
- `kanban/linear-close.py` (NEW)
- `kanban/run-kanban.sh` — add linear-close call after testing move
- `.gitignore` — add `.linear-close-state.json` and `.linear-close.log`

## Acceptance criteria
- [ ] `kanban/linear-close.py` exists and runs without errors: `python kanban/linear-close.py`
- [ ] Script correctly identifies Linear issue references in `2_testing/` and `3_done/` files
- [ ] Script updates Linear issues to "Done" status via GraphQL API
- [ ] Script adds a summary comment to the Linear issue
- [ ] State file prevents duplicate processing
- [ ] `run-kanban.sh` calls `linear-close.py` after moving prompts (non-blocking)
- [ ] State and log files are gitignored

## Notes
- The Linear API key is in env var `LINEAR_API_KEY` (same as `linear-poll.py` uses)
- Linear GraphQL endpoint: `https://api.linear.app/graphql`
- The "Done" status needs to be resolved by querying the team's workflow states (same approach as `linear-poll.py`)
- Reference `kanban/linear-poll.py` for Linear API patterns and the markdown format it generates
- The team is "GWTH Dev" — query for the team ID first if needed
- Keep the script self-contained (no external dependencies beyond `requests` or `urllib`)
