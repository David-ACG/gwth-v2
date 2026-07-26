#!/usr/bin/env bash
#
# w26-reset-demo-progress.sh — put the CIPD demo account back to a clean start.
#
# Verifying the demo path means actually walking it: playing the intro video,
# submitting the quiz, finishing the lesson. That writes real rows, so the
# dashboard then greets the next visitor with "1 of 26 lessons complete" and
# points Continue at lesson 2. On Monday it needs to say "Your first lesson is
# ready", so run this after any rehearsal or verification run.
#
# Only lesson_progress is cleared. The account, its verified email and its
# manual_beta grant are untouched, so the W25 gate still admits it.
#
# Usage:
#   bash deploy/w26-reset-demo-progress.sh              # reset and report
#   EMAIL=someone@example.com bash deploy/w26-reset-demo-progress.sh
set -euo pipefail

EMAIL="${EMAIL:-familyuccelli@gmail.com}"
DB_CONTAINER="${DB_CONTAINER:-zo0gkcwoo0o4gow0go4cwk0o}"

psql() {
  ssh -o BatchMode=yes hetzner \
    "docker exec -i ${DB_CONTAINER} psql -U gwth -d gwth_v2 -A -F'|' $*"
}

echo "### Before"
psql -c "\"select u.email, count(lp.*) as progress_rows from \\\"user\\\" u
          left join lesson_progress lp on lp.user_id = u.id
          where u.email = '${EMAIL}' group by 1;\""

psql -c "\"delete from lesson_progress
          where user_id = (select id from \\\"user\\\" where email = '${EMAIL}');\""

echo "### After"
psql -c "\"select u.email, count(lp.*) as progress_rows from \\\"user\\\" u
          left join lesson_progress lp on lp.user_id = u.id
          where u.email = '${EMAIL}' group by 1;\""

echo "### Grant intact (the W25 gate depends on this)"
psql -c "\"select email, subscription_month, valid_until, notes from beta_access_grants
          where lower(email) = lower('${EMAIL}');\""
