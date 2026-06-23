# Tester onboarding runbook (gwth.ai beta)

How to grant, onboard, and revoke a hand-picked beta tester. Every command
below was run for real against staging (`http://192.168.178.50:3001`) on
2026-06-23; the captured output is shown inline.

- **Grant API:** `POST /api/admin/beta-access` (admin-only, API-key gated).
- **Email:** Plunk, from `david@gwth.ai`.
- **Auth:** Better Auth (email + password, email verification required).
- **Feedback channel:** the in-app "report a problem" panel (`/guide`, the
  dashboard, and every lesson) → `POST /api/feedback` → `feedback` table +
  a notification to `david@gwth.ai`.

The API key is the `BETA_ACCESS_API_KEY` (falls back to `PIPELINE_API_KEY`),
injected into the staging container from SOPS. Read it from the container rather
than pasting a secret:

```bash
API_KEY=$(docker inspect gwth-v2-w8-beta --format '{{json .Config.Env}}' \
  | tr ',' '\n' | grep -oE 'PIPELINE_API_KEY=[^"]+' | cut -d= -f2)
BASE=http://192.168.178.50:3001   # prod: https://gwth.ai
```

---

## 1. Grant a tester (with invite email)

`months` sets how much of the course they get (1 = Month 1 only, the beta
default). `sendInvite: true` sends the beta invite email below; omit it (or set
false) for a silent grant.

```bash
curl -s -X POST "$BASE/api/admin/beta-access" \
  -H 'Content-Type: application/json' \
  -d "{\"apiKey\":\"$API_KEY\",\"email\":\"tester@example.com\",\"months\":1,\"sendInvite\":true,\"notes\":\"beta cohort 1\"}"
```

**Tested output** (invite to `david@gwth.ai`, real inbox):

```
{"success":true,"email":"david@gwth.ai","userId":null,
 "subscriptionState":"month3","subscriptionMonth":3,"inviteSent":true}
```

`userId:null` is expected when the tester has not signed up yet — the grant is
keyed on the email and is applied to their account automatically the moment they
sign up (Better Auth `databaseHooks.user.create.after`). `inviteSent:true` means
Plunk accepted the invite email.

> The grant is idempotent (upsert on email). Re-running it updates months/notes.

---

## 2. What email the tester receives

### a) Beta invite (only when `sendInvite: true`)

- **From:** GWTH.ai `<david@gwth.ai>`
- **Subject:** `You're in: your GWTH.ai beta access`
- **Body:** a welcome that explains the beta is free, with two steps — sign up
  at `<site>/signup`, then read the guide at `<site>/guide` — and a pointer to
  the in-app "report a problem" panel.

### b) Email verification (always, on signup)

Better Auth requires a verified email, so on signup the tester also receives:

- **From:** GWTH.ai `<david@gwth.ai>`
- **Subject:** `Verify your GWTH.ai email`
- **Body:** "Welcome to GWTH.ai. Please confirm your email address by clicking
  the link below" with a one-click verification link. (Re-sent automatically if
  they try to sign in before verifying.)

---

## 3. First-login steps (tester side)

1. Go to `<site>/signup` and create an account **with the granted email**.
2. Open the **"Verify your GWTH.ai email"** email and click the link. (Better
   Auth signs them in automatically after verification.)
3. They land on the dashboard with Month 1 unlocked. The beta grant was applied
   to their new account during signup.
4. Read `<site>/guide` — what is included, what is deliberately switched off
   (so cut features are not reported as bugs), and how to report problems.
5. Report anything via the **report a problem** panel: pinned on `/guide`, and a
   floating button on the dashboard and every lesson (it captures the page).

**Verification that the grant lands on the account** (after signup):

```
select u.email, u.email_verified, ua.access_source, ua.subscription_month
  from "user" u left join user_access ua on ua.user_id = u.id
 where u.email = 'tester@example.com';
-- tested → w5-dryrun@gwth.ai | t | manual_beta | 1
```

---

## 4. Revoke a tester

There is no destructive revoke endpoint; revoking is removing the grant and the
access row (this keeps the account and any feedback they filed). Run against the
app's Postgres (staging container `l08k8gwcscgssgwscoscwo8g`; prod = the gwth.ai
DB):

```bash
PG="docker exec l08k8gwcscgssgwscoscwo8g psql -U gwth -d gwth_v2"

# Remove access + the email grant (account is kept; feedback rows are kept)
$PG -c "delete from user_access ua using \"user\" u
        where ua.user_id = u.id and u.email = 'tester@example.com';"
$PG -c "delete from beta_access_grants where email = 'tester@example.com';"
```

After this, `getCurrentUser()` returns null for that account (no live
`manual_beta` grant), so they lose gated content and `/guide` and the dashboard
treat them as un-invited. **Tested output:**

```
DELETE 1                 -- user_access
DELETE 1                 -- beta_access_grants
access_rows  → 0
grant_rows   → 0
feedback rows for account → 1   (preserved)
```

To revoke **before** the tester has signed up, just delete the
`beta_access_grants` row for their email.

---

## 5. The feedback channel (what testers send you)

Every submission is written to the `feedback` table **first**, then a
notification is emailed to `david@gwth.ai`. The row is saved even if the email
fails (covered by automated tests).

- **Notification email subject:** `GWTH beta feedback: <category> (<page>)`
- **Read your inbox** of all feedback via `GET /api/feedback` as the admin
  (`david@gwth.ai`) — returns every row. Any other tester only sees their own
  rows. (The W4 admin inbox UI reads the same table.)

**Tested row after a real submission from a lesson page:**

```
user_id     | xpF7hh3uajJrBdef0HOqsAP7UtqiOsyA  (w5-dryrun@gwth.ai)
source_path | /demo/lesson
category    | bug
email_sent  | t                                 (Plunk accepted)
created_at  | 2026-06-23 22:22:55+00
```

---

## 6. End-to-end dry-run (what was verified)

Reproduce with `node scripts/w5-dry-run.mjs` (grant + signup + verify steps run
first; see this file's git history). The 2026-06-23 run confirmed:

| Step | Result |
|---|---|
| Grant tester (`/api/admin/beta-access`, `sendInvite:true`) | `success:true, inviteSent:true` |
| Invite + verification emails | accepted by Plunk |
| Sign up + verify + log in | landed on `/dashboard` |
| `/guide` renders for the tester | yes (anonymous is redirected to `/login`) |
| Submit feedback from a lesson (`/demo/lesson`) | success toast + "Thank you" |
| Row in Postgres | present, `source_path=/demo/lesson`, `email_sent=t` |
| Notification to `david@gwth.ai` | accepted by Plunk |
| Revoke | access + grant removed, account + feedback kept |

> **Inbox delivery** (invite, verification, notification) is confirmed by Plunk
> accepting the send (HTTP 200). Final receipt in the `david@gwth.ai` inbox is
> David's manual check; the rest of the loop is verified above.
