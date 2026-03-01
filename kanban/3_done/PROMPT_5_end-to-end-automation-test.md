# Task: End-to-End Automation Pipeline Test

## What to change

Validate the full automation pipeline by running a simple test task through every stage: Linear idea → poll → prompt → implement → deploy → verify → Linear close.

## Steps

### 1. Create a test Linear issue

Use the Linear MCP tools to create a small, safe test issue:
- **Team:** GWTH Dev
- **Title:** "Add automation test timestamp to footer"
- **Description:** "Add a hidden HTML comment `<!-- automation-test: 2026-03-01 -->` to the public footer component. This tests the full Linear → Kanban → Deploy pipeline."
- **Label:** "idea"
- **Priority:** Low

Note the issue identifier (e.g., GWTH-XX).

### 2. Run the Linear poll manually

```bash
python kanban/linear-poll.py
```

Verify:
- A new `.md` file appears in `kanban/0_idea/` with the test issue content
- The Linear issue gets a "Picked up by automation" comment

### 3. Process the idea into a prompt

Read the idea file and create a PROMPT in `1_planning/` following the standard kanban workflow. The prompt should be trivial:
- Edit `src/components/layout/footer.tsx`
- Add `{/* <!-- automation-test: 2026-03-01 --> */}` as a React comment in the footer JSX
- Run `npm test`
- Commit and push

### 4. Execute via kanban runner

```bash
bash kanban/run-kanban.sh
```

Verify:
- The prompt executes successfully
- Tests pass
- Code is committed and pushed
- Prompt file moves to `2_testing/`

### 5. Verify deployment on P520

Wait for Coolify deploy, then check:
```bash
curl -s http://192.168.178.50:3001 | grep "automation-test"
```

### 6. Run the Linear close-the-loop

```bash
python kanban/linear-close.py
```

Verify:
- The Linear issue status is updated to "Done"
- A summary comment is added to the issue

### 7. Run heartbeat to confirm all green

```bash
python kanban/heartbeat.py
```

Verify no alerts fire (all systems healthy).

### 8. Clean up

- Remove the automation test comment from `footer.tsx`
- Commit and push the cleanup
- Move the test file from `2_testing/` to `3_done/`

## Files likely affected
- `src/components/layout/footer.tsx` — add then remove test comment
- `kanban/0_idea/` — test idea file (created by poll)
- `kanban/1_planning/` — test prompt (created during processing)
- `kanban/2_testing/` — completed prompt (moved by runner)

## Acceptance criteria
- [ ] Linear issue created with "idea" label
- [ ] `linear-poll.py` picks up the issue and creates idea file
- [ ] Idea is crafted into a PROMPT file
- [ ] `run-kanban.sh` executes the prompt successfully (tests pass, committed, pushed)
- [ ] Change is visible on P520 test server
- [ ] `linear-close.py` updates the Linear issue to Done
- [ ] `heartbeat.py` reports all green
- [ ] Test comment is cleaned up from footer

## Notes
- This is a validation test — the actual change is trivial on purpose
- If any step fails, note which step and the error. Don't force it through.
- The Linear poll runs hourly via Task Scheduler, but can be triggered manually
- Steps 3-4 can be run via `bash kanban/run-kanban.sh` after the prompt is created
- If `linear-close.py` doesn't exist yet (PROMPT_3 not run), skip step 6
- If Beads integration is active (PROMPT_4 done), verify `bd` commands work during the run
