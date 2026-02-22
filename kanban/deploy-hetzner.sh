#!/usr/bin/env bash
# Deploy current master to Hetzner production via Coolify
# Usage: bash kanban/deploy-hetzner.sh

set -e

HETZNER_COOLIFY="http://195.201.177.66:8000"
APP_UUID="tw0cc8oc0w4scwoccs0cw0go"
API_TOKEN="2|uKyrlgQXkxsAZIwMY0FJugLsZmIN3tjN5qsTekwFaedd0d74"
HEALTH_URL="https://gwth.ai/api/health"

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
