#!/usr/bin/env bash
#
# purge_cdn_cache.sh — Cloudflare edge cache invalidation on deploy / content
# change (D6, task I3). Env-driven and safe to wire into the Coolify post-deploy
# hook once the credentials exist.
#
# Requires (env):
#   CF_API_TOKEN   Cloudflare API token scoped to **Cache Purge** on the zone
#                  ONLY (do not reuse the DNS-edit token).
#   CF_ZONE_ID     the gwth.ai zone id.
#
# Usage:
#   ./purge_cdn_cache.sh --all                 # purge everything (post-deploy default)
#   ./purge_cdn_cache.sh --files URL [URL...]  # purge specific URLs (overwritten media)
#   ./purge_cdn_cache.sh --prefixes PFX [PFX]  # purge by URL prefix (Enterprise only)
#
# Exit non-zero on failure so a deploy hook surfaces the error.
set -euo pipefail

API="https://api.cloudflare.com/client/v4"

die() { echo "purge_cdn_cache: $*" >&2; exit 1; }

[[ -n "${CF_API_TOKEN:-}" ]] || die "CF_API_TOKEN is not set"
[[ -n "${CF_ZONE_ID:-}"  ]] || die "CF_ZONE_ID is not set"

command -v curl >/dev/null || die "curl not found"
command -v jq   >/dev/null || die "jq not found"

mode="${1:---all}"; shift || true

case "$mode" in
  --all)
    body='{"purge_everything":true}'
    ;;
  --files)
    [[ $# -gt 0 ]] || die "--files needs at least one URL"
    body=$(jq -cn --args '{files: $ARGS.positional}' "$@")
    ;;
  --prefixes)
    [[ $# -gt 0 ]] || die "--prefixes needs at least one prefix"
    body=$(jq -cn --args '{prefixes: $ARGS.positional}' "$@")
    ;;
  *)
    die "unknown mode '$mode' (use --all | --files | --prefixes)"
    ;;
esac

resp=$(curl -sS -X POST \
  "${API}/zones/${CF_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "${body}")

if [[ "$(echo "$resp" | jq -r '.success')" == "true" ]]; then
  echo "purge_cdn_cache: OK ($mode)"
  exit 0
else
  echo "$resp" | jq -r '.errors' >&2
  die "purge failed"
fi
