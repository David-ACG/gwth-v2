#!/usr/bin/env bash
# Deploy current master to P520 test server via Coolify
# Usage: bash kanban/deploy-p520.sh

set -e

echo "Deploying to P520 test server..."

ssh p520 'docker exec coolify php artisan tinker --execute="
use App\Models\Application;
use App\Models\ApplicationDeploymentQueue;
\$app = Application::where(\"uuid\", \"xw4csk0ssos8800kws0cswwk\")->first();
\$server = \$app->destination->server;
\$queue = ApplicationDeploymentQueue::create([
    \"application_id\" => \$app->id,
    \"deployment_uuid\" => Illuminate\Support\Str::uuid()->toString(),
    \"force_rebuild\" => false,
    \"commit\" => \"HEAD\",
    \"status\" => \"queued\",
    \"is_webhook\" => false,
    \"server_id\" => \$server->id,
]);
dispatch(new App\Jobs\ApplicationDeploymentJob(\$queue->id));
echo \"Deploy queued! Queue ID: \" . \$queue->id;
"'

echo "Waiting 60s for build..."
sleep 60

echo "Checking health..."
if curl -sf http://192.168.178.50:3001/api/health > /dev/null 2>&1; then
    echo "P520 is healthy!"
else
    echo "First check failed. Waiting 30s and retrying..."
    sleep 30
    if curl -sf http://192.168.178.50:3001/api/health > /dev/null 2>&1; then
        echo "P520 is healthy (retry succeeded)!"
    else
        echo "ERROR: P520 health check failed after retry."
        exit 1
    fi
fi
