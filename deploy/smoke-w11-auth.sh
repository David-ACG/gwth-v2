#!/usr/bin/env bash
#
# W11 — live Better Auth round-trip smoke against the :3001 staging deploy
# (hlab, behind the real proxy chain; prod-class PG 17.10 schema).
#
# Exercises the parts of the D4 "green smoke" that are automatable in a headless
# night run: email/password signup (invite-gated), session survives a reload,
# getAccessForUser returns the right user id, password reset dispatch, two-user
# isolation, and sign-out. OAuth-consent legs are NOT covered here — they need
# real Google/GitHub/LinkedIn client creds (never provisioned to staging) plus a
# human at the provider consent screen, neither of which exists headlessly.
#
# The email-verification click is short-circuited via a direct DB UPDATE
# (requireEmailVerification:true blocks sign-in until verified). That is a test
# shortcut for the link-click only; it exercises the real session/cookie/proxy
# path, which is the load-bearing D4 risk.
set -uo pipefail

# Default = the LAN origin (trusted via the hardcoded list in better-auth.ts);
# override with W11_SMOKE_BASE to smoke another trusted origin, e.g. the
# Tailscale one: W11_SMOKE_BASE=http://hlab.taila51191.ts.net:3001
B="${W11_SMOKE_BASE:-http://192.168.178.50:3001}"
JARA="$(mktemp)"; JARB="$(mktemp)"
EA="w11-smoke-a-$(date +%s)@example.com"
EB="w11-smoke-b-$(date +%s)@example.com"
PW="Test-W11-Smoke-9281!"
PASS=0; FAIL=0
ok(){ echo "  PASS: $1"; PASS=$((PASS+1)); }
bad(){ echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export SOPS_AGE_KEY_FILE="${SOPS_AGE_KEY_FILE:-$HOME/.config/sops/age/keys.txt}"
DBURL="$(sops -d --input-type dotenv --output-type dotenv "$HERE/deploy/secrets.staging.env" 2>/dev/null | grep '^DATABASE_URL=' | cut -d= -f2-)"
psql(){ docker run --rm --network coolify postgres:17 psql "$DBURL" "$@"; }

echo "### W11 live auth smoke @ $B  ($(date -u +%FT%TZ))"
echo "users: $EA / $EB"

# --- grant beta access to both emails (so the create hook admits them) ---
psql -q -c "insert into beta_access_grants(email,subscription_month) values ('$EA',3),('$EB',3) on conflict(email) do update set subscription_month=3;" >/dev/null 2>&1 \
  && ok "seeded beta grants" || bad "seed beta grants"

echo "## 1. signup A (invite-gated, expect 200)"
c=$(curl -sS -m 25 -o /tmp/w11a.json -w "%{http_code}" -X POST "$B/api/auth/sign-up/email" -H "Origin: $B" -H 'Content-Type: application/json' -d "{\"email\":\"$EA\",\"password\":\"$PW\",\"name\":\"W11 A\"}")
[ "$c" = "200" ] && ok "signup A http 200" || bad "signup A http $c ($(cat /tmp/w11a.json))"

echo "## 2. user row + user_access (manual_beta) created by hook"
uidA=$(psql -tAc "select id from \"user\" where email='$EA'" 2>/dev/null | tr -d '[:space:]')
[ -n "$uidA" ] && ok "user A row id=$uidA" || bad "user A row missing"
srcA=$(psql -tAc "select access_source||':'||subscription_month from user_access where user_id='$uidA'" 2>/dev/null | tr -d '[:space:]')
[ "$srcA" = "manual_beta:3" ] && ok "user_access A = $srcA" || bad "user_access A = '$srcA' (want manual_beta:3)"

echo "## 3. unverified sign-in is blocked (requireEmailVerification)"
c=$(curl -sS -m 20 -o /tmp/w11blk.json -w "%{http_code}" -X POST "$B/api/auth/sign-in/email" -H "Origin: $B" -H 'Content-Type: application/json' -d "{\"email\":\"$EA\",\"password\":\"$PW\"}")
[ "$c" != "200" ] && ok "unverified sign-in rejected (http $c)" || bad "unverified sign-in WRONGLY accepted"

echo "## 4. verify email in DB (shortcut for the emailed link only), then sign in -> session cookie"
psql -q -c "update \"user\" set email_verified=true where email='$EA';" >/dev/null 2>&1
c=$(curl -sS -m 20 -c "$JARA" -o /tmp/w11sa.json -w "%{http_code}" -X POST "$B/api/auth/sign-in/email" -H "Origin: $B" -H 'Content-Type: application/json' -d "{\"email\":\"$EA\",\"password\":\"$PW\"}")
[ "$c" = "200" ] && ok "sign-in A http 200" || bad "sign-in A http $c ($(cat /tmp/w11sa.json))"
grep -qi "better-auth" "$JARA" && ok "session cookie set for A" || bad "no session cookie for A"

echo "## 5. session SURVIVES a reload (re-read get-session with the same cookie) — the D4 CSRF/loop risk"
sid1=$(curl -sS -m 15 -b "$JARA" "$B/api/auth/get-session" | grep -oE '"id":"[^"]+"' | head -1)
sid2=$(curl -sS -m 15 -b "$JARA" "$B/api/auth/get-session" | grep -oE '"id":"[^"]+"' | head -1)
suidA=$(curl -sS -m 15 -b "$JARA" "$B/api/auth/get-session" | grep -oE '"userId":"[^"]+"|"id":"'"$uidA"'"' | head -1)
[ -n "$sid1" ] && [ "$sid1" = "$sid2" ] && ok "session persists across reloads ($sid1)" || bad "session lost on reload ('$sid1' vs '$sid2')"
curl -sS -m 15 -b "$JARA" "$B/api/auth/get-session" | grep -q "$uidA" && ok "get-session returns user A id ($uidA)" || bad "get-session missing user A id"

echo "## 6. guard lets the authenticated session into /dashboard (W7 read path)"
c=$(curl -sS -m 20 -b "$JARA" -o /dev/null -w "%{http_code}" "$B/dashboard")
[ "$c" = "200" ] && ok "/dashboard authed http 200" || bad "/dashboard authed http $c"

echo "## 7. getAccessForUser correctness — user_access row joins to the SESSION user id"
joined=$(psql -tAc "select ua.access_source from user_access ua join session s on s.user_id=ua.user_id where ua.user_id='$uidA' limit 1" 2>/dev/null | tr -d '[:space:]')
[ "$joined" = "manual_beta" ] && ok "session.user_id -> user_access manual_beta" || bad "session/user_access join = '$joined'"

echo "## 8. password reset dispatch (expect 200)"
c=$(curl -sS -m 25 -o /tmp/w11pr.json -w "%{http_code}" -X POST "$B/api/auth/request-password-reset" -H "Origin: $B" -H 'Content-Type: application/json' -d "{\"email\":\"$EA\",\"redirectTo\":\"$B/reset-password\"}")
[ "$c" = "200" ] || c=$(curl -sS -m 25 -o /tmp/w11pr.json -w "%{http_code}" -X POST "$B/api/auth/forget-password" -H "Origin: $B" -H 'Content-Type: application/json' -d "{\"email\":\"$EA\",\"redirectTo\":\"$B/reset-password\"}")
[ "$c" = "200" ] && ok "password reset dispatch http 200" || bad "password reset http $c ($(cat /tmp/w11pr.json))"

echo "## 9. USER ISOLATION — sign in B, confirm A's cookie != B's session"
psql -q -c "update \"user\" set email_verified=true where email='$EB';" >/dev/null 2>&1
curl -sS -m 25 -o /dev/null -X POST "$B/api/auth/sign-up/email" -H "Origin: $B" -H 'Content-Type: application/json' -d "{\"email\":\"$EB\",\"password\":\"$PW\",\"name\":\"W11 B\"}"
psql -q -c "update \"user\" set email_verified=true where email='$EB';" >/dev/null 2>&1
curl -sS -m 20 -c "$JARB" -o /dev/null -X POST "$B/api/auth/sign-in/email" -H "Origin: $B" -H 'Content-Type: application/json' -d "{\"email\":\"$EB\",\"password\":\"$PW\"}"
uidB=$(psql -tAc "select id from \"user\" where email='$EB'" 2>/dev/null | tr -d '[:space:]')
aSees=$(curl -sS -m 15 -b "$JARA" "$B/api/auth/get-session" | grep -oE "$uidA|$uidB" | sort -u | tr '\n' ',')
bSees=$(curl -sS -m 15 -b "$JARB" "$B/api/auth/get-session" | grep -oE "$uidA|$uidB" | sort -u | tr '\n' ',')
[ "$aSees" = "$uidA," ] && ok "A cookie sees ONLY A ($aSees)" || bad "A cookie leak: sees '$aSees'"
[ "$bSees" = "$uidB," ] && ok "B cookie sees ONLY B ($bSees)" || bad "B cookie leak: sees '$bSees'"

echo "## 10. sign-out A -> session destroyed"
curl -sS -m 20 -b "$JARA" -o /dev/null -X POST "$B/api/auth/sign-out" -H "Origin: $B" -H "Content-Type: application/json" -d "{}"
after=$(curl -sS -m 15 -b "$JARA" "$B/api/auth/get-session")
[ "$after" = "null" ] || [ -z "$after" ] && ok "sign-out destroyed session (get-session=null)" || bad "session still live after sign-out: $after"

echo "## 11. OAuth initiation (creds NOT provisioned to staging -> expected to fail, NOT a Better Auth defect)"
oc=$(curl -sS -m 15 -o /dev/null -w "%{http_code}" -X POST "$B/api/auth/sign-in/social" -H 'Content-Type: application/json' -d '{"provider":"google","callbackURL":"/dashboard"}')
echo "  INFO: google OAuth init http $oc (missing GOOGLE_CLIENT_ID/SECRET on staging)"

# --- cleanup test rows ---
psql -q -c "delete from \"user\" where email in ('$EA','$EB'); delete from beta_access_grants where email in ('$EA','$EB');" >/dev/null 2>&1
rm -f "$JARA" "$JARB"

echo "### RESULT: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "### SMOKE GREEN (email/password path)" || echo "### SMOKE HAS FAILURES"
exit "$FAIL"
