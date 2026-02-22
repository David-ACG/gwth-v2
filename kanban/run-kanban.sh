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

    PROMPT="You are working in project: $PROJECT_ROOT

CONTEXT MANAGEMENT: If your context usage exceeds 110k tokens out of 200k, immediately run /compact to summarize context before continuing.

REFERENCE FILES: The kanban/1_planning/ folder contains plan files (without PROMPT_ prefix) that may be referenced in this task. Read them if the prompt below refers to them.

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

6. REPORT: Summarize what was changed, committed, pushed, and whether P520 deploy succeeded.

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
