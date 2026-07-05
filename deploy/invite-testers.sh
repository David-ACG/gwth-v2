#!/usr/bin/env bash
#
# W6 — beta tester invites (PREPARED by the 2026-07-05 night run, HELD for
# David; per the launch plan the send is always David's action, never an
# agent's).
#
# One action to invite the cohort:
#   1. put one email per line in deploy/testers.txt (comments with #)
#   2. ./deploy/invite-testers.sh            (defaults to PROD https://gwth.ai)
#
# Mechanics per docs/tester-onboarding.md: each email gets an idempotent
# manual_beta grant for Month 1 plus the Plunk invite email (sign up at
# /signup, read /guide). Re-running is safe (upsert on email).
#
# Requires: the prod PIPELINE_API_KEY (BETA_ACCESS_API_KEY fallback). By
# default it is read from the Coolify prod env store over ssh so no secret
# lives in this repo. Override with API_KEY=... for staging tests.
set -euo pipefail

BASE="${BASE:-https://gwth.ai}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIST="${LIST:-$HERE/testers.txt}"
MONTHS="${MONTHS:-1}"
NOTES="${NOTES:-beta cohort 1 (2026-07-08)}"

[ -f "$LIST" ] || { echo "FATAL: $LIST missing — one tester email per line" >&2; exit 1; }

if [ -z "${API_KEY:-}" ]; then
  export SOPS_AGE_KEY_FILE="${SOPS_AGE_KEY_FILE:-$HOME/.config/sops/age/keys.txt}"
  OPS="$HERE/secrets.hetzner-ops.env"
  CT="$(sops -d --input-type dotenv --output-type dotenv "$OPS" | grep '^COOLIFY_API_TOKEN=' | cut -d= -f2-)"
  API_KEY="$(ssh -o BatchMode=yes hetzner \
    "curl -s -m 20 -H 'Authorization: Bearer $CT' 'http://localhost:8000/api/v1/applications/tw0cc8oc0w4scwoccs0cw0go/envs'" \
    | python3 -c 'import json,sys; envs=json.load(sys.stdin); print(next(e["value"] for e in envs if e["key"]=="PIPELINE_API_KEY" and not e.get("is_preview")))')"
fi
[ -n "$API_KEY" ] || { echo "FATAL: could not resolve the beta-access API key" >&2; exit 1; }

echo "### Inviting testers on $BASE (months=$MONTHS)"
while IFS= read -r email; do
  [[ -z "$email" || "$email" =~ ^# ]] && continue
  resp=$(curl -s -m 25 -X POST "$BASE/api/admin/beta-access" \
    -H 'Content-Type: application/json' \
    -d "{\"apiKey\":\"$API_KEY\",\"email\":\"$email\",\"months\":$MONTHS,\"sendInvite\":true,\"notes\":\"$NOTES\"}")
  echo "$email -> $resp"
done < "$LIST"
echo "### Done. Record who was invited + when in docs/runbook-go-live.md section 7."
