#!/usr/bin/env bash
#
# I1 / D9 — (re)deploy the GWTH_V2 staging container on hlab :3001 with
# SOPS-injected secrets and a DATABASE_URL pointing at the dedicated,
# internal-only Coolify Postgres (PG 17.10, uuid l08k8gwcscgssgwscoscwo8g).
#
# Secrets come from deploy/secrets.staging.env (SOPS+age encrypted at rest);
# they are decrypted to a 0600 tmpfile that is shredded on exit. No plaintext
# credential is written to the repo or left on disk.
#
# Usage:  ./deploy/run-staging.sh            (uses ~/.config/sops/age/keys.txt)
#
set -euo pipefail

IMAGE="${IMAGE:-gwth-v2:staging}"         # current HEAD build (retag a fresh build to this; override to pin)
NAME="gwth-v2-w8-beta"
NET="coolify"                              # share the network with the Coolify-managed DB
HOST_PORT="3001"
CONTAINER_PORT="3000"
KEYFILE="${SOPS_AGE_KEY_FILE:-$HOME/.config/sops/age/keys.txt}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS="$HERE/deploy/secrets.staging.env"

[ -f "$KEYFILE" ]  || { echo "FATAL: age key not found at $KEYFILE" >&2; exit 1; }
[ -f "$SECRETS" ]  || { echo "FATAL: $SECRETS missing" >&2; exit 1; }

ENVFILE="$(mktemp)"; chmod 600 "$ENVFILE"
trap 'shred -u "$ENVFILE" 2>/dev/null || rm -f "$ENVFILE"' EXIT
SOPS_AGE_KEY_FILE="$KEYFILE" sops -d --input-type dotenv --output-type dotenv "$SECRETS" > "$ENVFILE"

docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" \
  --network "$NET" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --restart unless-stopped \
  --env-file "$ENVFILE" \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e HOSTNAME=0.0.0.0 \
  -e PORT="$CONTAINER_PORT" \
  -e NEXT_PUBLIC_SITE_URL="http://192.168.178.50:${HOST_PORT}" \
  -e BETTER_AUTH_URL="http://192.168.178.50:${HOST_PORT}" \
  "$IMAGE" >/dev/null

echo "deployed $NAME on :${HOST_PORT} (network=$NET, secrets via SOPS, Supabase env dropped)"
