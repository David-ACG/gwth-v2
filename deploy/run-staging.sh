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
  -e NEXT_PUBLIC_SITE_URL="http://hlab.taila51191.ts.net:${HOST_PORT}" \
  -e BETTER_AUTH_URL="http://hlab.taila51191.ts.net:${HOST_PORT}" \
  "$IMAGE" >/dev/null
# ENABLE_DEV_MOCK_USER removed 2026-07-05: the mock learner made every
# anonymous visitor look like a logged-in student (and disabled the proxy
# route guard), so David's pre-launch snag testing saw the wrong reality
# (full syllabus without an account). Staging now matches production auth:
# use a real tester account (the staging DB carries beta_access_grants).
#
# Canonical staging origin = the Tailscale MagicDNS name (2026-07-01, David):
# reachable from every tailnet device (remote incl.), WireGuard-encrypted on
# the wire despite the http scheme, and Better Auth auto-trusts its own
# baseURL origin so tailnet browsers pass the CSRF origin check. The LAN
# origin (http://192.168.178.50:3001) keeps working via the hardcoded
# trustedOrigins list in src/lib/better-auth.ts — the on-box smoke uses it.
# Deliberately NOT https via `tailscale serve`: the app stamps
# Strict-Transport-Security on every response, and HSTS pins per-HOSTNAME —
# one https page-load would break every plain-http service on hlab
# (:8090 board, :3001 itself) in that browser for max-age (2 years).

echo "deployed $NAME on :${HOST_PORT} (network=$NET, secrets via SOPS, Supabase env dropped)"
