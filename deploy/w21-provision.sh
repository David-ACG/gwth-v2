#!/usr/bin/env bash
#
# W21 — provision a real Better Auth tester on :3001 staging with representative
# progress, so the full authed route set (dashboard, lesson viewer, /progress,
# lab detail) can be screenshotted for the pre-CIPD-demo polish sweep.
#
# Prints the cookie-jar path and the user id. Idempotent-ish: re-running reuses
# the same email suffix passed in W21_EMAIL, else mints a fresh one.
set -uo pipefail

B="${W21_BASE:-http://192.168.178.50:3001}"
JAR="${W21_JAR:-/tmp/w21-jar.txt}"
EMAIL="${W21_EMAIL:-w21-polish-$(date +%s)@example.com}"
PW="Test-W21-Polish-7714!"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export SOPS_AGE_KEY_FILE="${SOPS_AGE_KEY_FILE:-$HOME/.config/sops/age/keys.txt}"
DBURL="$(sops -d --input-type dotenv --output-type dotenv "$HERE/deploy/secrets.staging.env" 2>/dev/null | grep '^DATABASE_URL=' | cut -d= -f2-)"
psql(){ docker run --rm --network coolify -e PGCONNECT_TIMEOUT=8 postgres:17 psql "$DBURL" "$@"; }

echo "### W21 provision @ $B  user=$EMAIL"

# 1. beta access (month 3 unlocks all content)
psql -q -c "insert into beta_access_grants(email,subscription_month) values ('$EMAIL',3) on conflict(email) do update set subscription_month=3;" >/dev/null 2>&1 \
  && echo "  beta grant ok" || echo "  beta grant FAILED"

# 2. signup, verify email in DB, sign in -> jar
curl -sS -m 25 -o /tmp/w21-signup.json -w "signup http %{http_code}\n" -X POST "$B/api/auth/sign-up/email" \
  -H "Origin: $B" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\",\"name\":\"Alex Rivera\"}"
psql -q -c "update \"user\" set email_verified=true where email='$EMAIL';" >/dev/null 2>&1
curl -sS -m 20 -c "$JAR" -o /tmp/w21-signin.json -w "signin http %{http_code}\n" -X POST "$B/api/auth/sign-in/email" \
  -H "Origin: $B" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\"}"

DBUID="$(psql -tAc "select id from \"user\" where email='$EMAIL'" 2>/dev/null | tr -d '[:space:]')"
echo "  uid=$DBUID"
[ -n "$DBUID" ] || { echo "  FATAL no uid"; exit 1; }

# 3. seed representative progress: 2 completed lessons with quiz scores (today =>
#    current streak 1), 1 in-progress. Enough to populate /progress + /dashboard.
psql -q <<SQL >/dev/null 2>&1
delete from lesson_progress where user_id='$DBUID';
insert into lesson_progress (user_id, lesson_id, is_completed, progress, quiz_score, best_quiz_score, quiz_attempts, time_spent, last_accessed_at, completed_at)
values
 ('$DBUID','m1_l01', true, 1.0, 0.9, 0.9, 1, 1080, now(), now()),
 ('$DBUID','m1_l02', true, 1.0, 0.75, 0.75, 2, 900, now(), now()),
 ('$DBUID','m1_l03', false, 0.4, null, null, 0, 420, now(), null);
SQL
echo "  seeded lesson_progress (2 complete, 1 in-progress)"

echo "JAR=$JAR"
echo "EMAIL=$EMAIL"
echo "DBUID=$DBUID"
