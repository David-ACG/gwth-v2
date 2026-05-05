#!/usr/bin/env bash
# Deploy current master to Hetzner production via Coolify
# Usage: bash kanban/deploy-hetzner.sh

set -e

HETZNER_COOLIFY="${HETZNER_COOLIFY:-http://195.201.177.66:8000}"
APP_UUID="${COOLIFY_APP_UUID:-}"
API_TOKEN="${COOLIFY_TOKEN:-}"
HEALTH_URL="${HETZNER_HEALTH_URL:-https://gwth.ai/api/health}"

if [ -z "$APP_UUID" ]; then
    echo "ERROR: COOLIFY_APP_UUID is required."
    exit 1
fi

if [ -z "$API_TOKEN" ]; then
    echo "ERROR: COOLIFY_TOKEN is required."
    exit 1
fi

echo "Deploying to Hetzner production..."

RESPONSE=$(curl -sf "$HETZNER_COOLIFY/api/v1/deploy?uuid=$APP_UUID&force=false" \
    -H "Authorization: Bearer $API_TOKEN" 2>&1) || {
    echo "ERROR: Coolify deploy trigger failed."
    echo "$RESPONSE"
    exit 1
}
echo "Deploy triggered: $RESPONSE"

echo "Waiting 90s for build..."
sleep 90

echo "Checking health at $HEALTH_URL..."
if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
    echo "Hetzner production is healthy!"
else
    echo "First check failed. Waiting 30s and retrying..."
    sleep 30
    if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
        echo "Hetzner production is healthy (retry succeeded)!"
    else
        echo "ERROR: Hetzner health check failed after retry."
        exit 1
    fi
fi
