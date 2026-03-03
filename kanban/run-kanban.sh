#!/usr/bin/env bash
# Kanban Runner — loops through PROMPT_*.md files in 1_planning
# Usage: cd to any project with a kanban/ folder, then run:
#   bash kanban/run-kanban.sh

set -e

PROJECT_ROOT="$(pwd)"
PLANNING="$PROJECT_ROOT/kanban/1_planning"
TESTING="$PROJECT_ROOT/kanban/2_testing"

# Verify folders exist
if [ ! -d "$PLANNING" ]; then
    echo "ERROR: $PLANNING not found. Run this from your project root."
    exit 1
fi
mkdir -p "$TESTING"

# ── Beads pre-flight ──────────────────────────────────
BD_AVAILABLE=0
if command -v bd &>/dev/null; then
    # Check Dolt server (Beads dependency)
    if bd stats --json &>/dev/null 2>&1; then
        BD_AVAILABLE=1
        echo "========================================"
        echo "BEADS STATUS:"
        bd stats 2>/dev/null | grep -E "Open|In Progress|Blocked|Ready" || true
        echo ""
        echo "READY TO WORK:"
        bd ready 2>/dev/null || echo "  (none)"
        echo "========================================"
    else
        echo "WARNING: Dolt server not reachable — Beads integration disabled for this run."
        echo "  Start with: C:\\Users\\david\\AppData\\Local\\beads\\start-dolt.bat"
    fi
else
    echo "WARNING: bd not found in PATH — Beads integration disabled for this run."
fi
echo ""

# Collect prompt files
PROMPTS=($(ls "$PLANNING"/PROMPT_*.md 2>/dev/null | sort))

if [ ${#PROMPTS[@]} -eq 0 ]; then
    echo "No PROMPT_*.md files found in $PLANNING"
    exit 0
fi

echo "========================================"
echo "Found ${#PROMPTS[@]} prompt(s) to process:"
for f in "${PROMPTS[@]}"; do
    echo "  - $(basename "$f")"
done
echo "========================================"

COMPLETED=0
FAILED=0

for FILE in "${PROMPTS[@]}"; do
    NAME=$(basename "$FILE")
    CONTENT=$(cat "$FILE")

    echo ""
    echo "========================================"
    echo "RUNNING: $NAME"
    echo "========================================"
    echo ""

    # Extract Beads reference from prompt content if present
    BEADS_REF=$(grep -oP 'Beads:\s*\K\S+' "$FILE" 2>/dev/null || true)

    # Build Beads instructions block if Beads is available and prompt has a reference
    BEADS_INSTRUCTIONS=""
    if [ "$BD_AVAILABLE" -eq 1 ] && [ -n "$BEADS_REF" ]; then
        BEADS_INSTRUCTIONS="
BEADS TRACKING: This task is tracked as Beads issue $BEADS_REF.
- At the START of work, run: bd update $BEADS_REF --status=in_progress
- When ALL work is COMPLETE (tests pass, committed, pushed), run: bd close $BEADS_REF
- If the task fails after 3 retries, leave the issue open and add a note: bd update $BEADS_REF --notes=\"Failed: <reason>\"
"
    elif [ "$BD_AVAILABLE" -eq 1 ]; then
        BEADS_INSTRUCTIONS="
BEADS TRACKING: If you discover the Beads issue ID for this task during execution, claim it with bd update <id> --status=in_progress and close it with bd close <id> when done.
"
    fi

    PROMPT="You are working in project: $PROJECT_ROOT

CONTEXT MANAGEMENT: If your context usage exceeds 110k tokens out of 200k, immediately run /compact to summarize context before continuing.

REFERENCE FILES: The kanban/1_planning/ folder contains plan files (without PROMPT_ prefix) that may be referenced in this task. Read them if the prompt below refers to them.
$BEADS_INSTRUCTIONS
TASK — Execute the following prompt completely. Do not ask questions. Do not stop until every requirement is met. If something fails, fix it and retry up to 3 times before moving on.

PIPELINE — After implementing the changes, follow these steps in order:

1. RUN TESTS: Execute \`npm test\` — all tests must pass. If tests fail, fix the failures and retry up to 3 times. Do not proceed if tests are still failing.

2. COMMIT: Stage and commit all changes with a descriptive commit message that explains what was changed and why. Do not use generic messages like \"auto-commit\".

3. PUSH: Push to origin/master.

4. DEPLOY TO P520 TEST SERVER: Run this exact command:
   ssh p520 'docker exec coolify php artisan tinker --execute=\"
   use App\\\\Models\\\\Application;
   use App\\\\Models\\\\ApplicationDeploymentQueue;
   \\\$app = Application::where(\\\"uuid\\\", \\\"xw4csk0ssos8800kws0cswwk\\\")->first();
   \\\$server = \\\$app->destination->server;
   \\\$queue = ApplicationDeploymentQueue::create([
       \\\"application_id\\\" => \\\$app->id,
       \\\"deployment_uuid\\\" => Illuminate\\\\Support\\\\Str::uuid()->toString(),
       \\\"force_rebuild\\\" => false,
       \\\"commit\\\" => \\\"HEAD\\\",
       \\\"status\\\" => \\\"queued\\\",
       \\\"is_webhook\\\" => false,
       \\\"server_id\\\" => \\\$server->id,
   ]);
   dispatch(new App\\\\Jobs\\\\ApplicationDeploymentJob(\\\$queue->id));
   echo \\\"Deploy queued! Queue ID: \\\" . \\\$queue->id;
   \"'

5. WAIT & VERIFY: Wait 60 seconds for the build to complete, then check health:
   curl -sf http://192.168.178.50:3001/api/health
   If the health check fails, wait another 30 seconds and retry once.

6. IMPLEMENTATION DOCUMENTATION (Gate 3): After ALL code changes are complete and tests pass, APPEND the following to the prompt file at $FILE:
   ---
   ## Implementation Notes — <current date and time>
   - **Commit:** <commit hash + message>
   - **Tests:** <pass/fail summary>
   - **Verification URL:** http://192.168.178.50:3001 (P520 test)
   - **Playwright check:** <passed/failed + what was verified>
   - **Changes summary:** <bullet list of what was actually done>
   - **Deviations from plan:** <any differences from the prompt>
   - **Follow-up issues:** <new work discovered, or \"None\">

7. TESTING CHECKLIST (Gate 4): Then APPEND a testing checklist to the same prompt file:
   ---
   ## Testing Checklist — <current date and time>
   **Check the changes:** http://192.168.178.50:3001
   - [ ] Page loads without errors
   - [ ] <Feature-specific check based on what was implemented>
   - [ ] Light/dark mode correct (if applicable)
   - [ ] Mobile responsive (if applicable)
   - [ ] No console errors

   ### Actions for David
   <Tell David exactly what he needs to do — e.g. "Visit the URL above and verify the feature works" or "No actions required — this was a backend-only change". NEVER omit this section.>

   **Review this file:** \`file:///\${FILE}\`

8. REPORT: Summarize what was changed, committed, pushed, and whether P520 deploy succeeded.

DO NOT deploy to Hetzner production — that happens separately after user verification on P520.

---

$CONTENT"

    if claude --dangerously-skip-permissions "$PROMPT"; then
        mv "$FILE" "$TESTING/$NAME"
        echo ""
        echo "MOVED $NAME -> 2_testing"
        COMPLETED=$((COMPLETED + 1))
    else
        echo ""
        echo "FAILED $NAME (leaving in 1_planning)"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "========================================"
echo "ALL PROMPTS PROCESSED"
echo "  Completed: $COMPLETED"
echo "  Failed:    $FAILED"
echo "========================================"

# ── Beads post-processing ─────────────────────────────
if [ "$BD_AVAILABLE" -eq 1 ]; then
    echo ""
    echo "Syncing Beads closures to Linear..."
    bd linear sync --push 2>/dev/null && echo "Linear sync complete." || echo "WARNING: Linear sync failed (non-fatal)."
fi
