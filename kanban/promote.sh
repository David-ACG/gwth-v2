#!/usr/bin/env bash
# Promote — deploy tested changes to Hetzner production and move prompts to 3_done
# Usage: bash kanban/promote.sh [--all]

set -e

PROJECT_ROOT="$(pwd)"
TESTING="$PROJECT_ROOT/kanban/2_testing"
DONE="$PROJECT_ROOT/kanban/3_done"

HETZNER_COOLIFY="http://195.201.177.66:8000"
APP_UUID="tw0cc8oc0w4scwoccs0cw0go"
API_TOKEN="2|uKyrlgQXkxsAZIwMY0FJugLsZmIN3tjN5qsTekwFaedd0d74"
HEALTH_URL="https://gwth.ai/api/health"

# Verify folders exist
if [ ! -d "$TESTING" ]; then
    echo "ERROR: $TESTING not found. Run this from your project root."
    exit 1
fi
mkdir -p "$DONE"

# Collect tested prompt files
PROMPTS=($(ls "$TESTING"/PROMPT_*.md 2>/dev/null | sort))

if [ ${#PROMPTS[@]} -eq 0 ]; then
    echo "No PROMPT_*.md files in 2_testing/ — nothing to promote."
    exit 0
fi

echo "========================================"
echo "Files ready to promote to production:"
for i in "${!PROMPTS[@]}"; do
    echo "  [$((i+1))] $(basename "${PROMPTS[$i]}")"
done
echo "========================================"

# Selection
if [ "$1" = "--all" ]; then
    SELECTED=("${PROMPTS[@]}")
    echo "Promoting ALL (--all flag)."
else
    echo ""
    echo "Enter numbers to promote (space-separated), or 'all':"
    read -r CHOICE
    if [ "$CHOICE" = "all" ]; then
        SELECTED=("${PROMPTS[@]}")
    else
        SELECTED=()
        for NUM in $CHOICE; do
            IDX=$((NUM - 1))
            if [ $IDX -ge 0 ] && [ $IDX -lt ${#PROMPTS[@]} ]; then
                SELECTED+=("${PROMPTS[$IDX]}")
            else
                echo "WARNING: Invalid selection $NUM, skipping."
            fi
        done
    fi
fi

if [ ${#SELECTED[@]} -eq 0 ]; then
    echo "No files selected. Aborting."
    exit 0
fi

echo ""
echo "Deploying to Hetzner production..."

# Trigger Coolify deploy
RESPONSE=$(curl -sf "$HETZNER_COOLIFY/api/v1/deploy?uuid=$APP_UUID&force=false" \
    -H "Authorization: Bearer $API_TOKEN" 2>&1) || {
    echo "ERROR: Coolify deploy trigger failed."
    echo "$RESPONSE"
    exit 1
}
echo "Deploy triggered: $RESPONSE"

# Wait for build
echo "Waiting 90s for build to complete..."
sleep 90

# Health check with retry
echo "Checking health at $HEALTH_URL..."
if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
    echo "Hetzner production is healthy!"
else
    echo "First health check failed. Waiting 30s and retrying..."
    sleep 30
    if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
        echo "Hetzner production is healthy (retry succeeded)!"
    else
        echo "ERROR: Hetzner health check failed after retry."
        echo "Files NOT moved to 3_done/. Investigate before retrying."
        exit 1
    fi
fi

# Move promoted files to 3_done with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
for FILE in "${SELECTED[@]}"; do
    NAME=$(basename "$FILE")
    DEST="$DONE/${TIMESTAMP}_${NAME}"
    mv "$FILE" "$DEST"
    echo "PROMOTED: $NAME -> 3_done/${TIMESTAMP}_${NAME}"
done

echo ""
echo "========================================"
echo "Production deploy complete!"
echo "  Promoted: ${#SELECTED[@]} file(s)"
echo "  Verify at: https://gwth.ai"
echo "========================================"
