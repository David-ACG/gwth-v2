# Go-Live Runbook — gwth.ai beta (invites target 8 July 2026)

> **Task:** W6 (launch board, `website` track) — the terminal go-live gate.
> **Owner:** David. **Target:** beta invites Wed 2026-07-08, hand-picked testers, invite-only.
> **This file is the deliverable David audits.** Every checklist item is ticked
> only with evidence (command output, URL, screenshot path) recorded inline.
>
> **Status: HELD AT THE I3 GATE — pre-flight fully GREEN 2026-07-05.** Every
> pre-flight item below was re-verified in this run against staging on the
> merged master (`830cac8`). The production deploy is deliberately NOT executed:
> I3 (R2 + edge CDN, Part 2 watched DNS/edge cutover with David) is at 55%,
> blocked on a Cloudflare token with the wrong scope (see the I3 board entry,
> "gated exit 2026-07-05"). Per the launch plan the cutover deploy happens only
> after I3 Part 2 is complete, days before invites.

Last updated: **2026-07-05 (W6 night run)** · Staging: http://192.168.178.50:3001 · Prod: https://gwth.ai

---

## §0 — Dependency gate (GO / NO-GO)

Status snapshot **2026-07-05** (re-check at go-live:
`python3 /home/david/projects/GWTH-launch-plan/scripts/update_launch_task.py`):

| Task | What it gates | 2026-07-05 status | Go-live blocker? |
|------|---------------|-------------------|------------------|
| W11 | Auth migration off Supabase (Better Auth). | ✅ done | no |
| W7 | Per-user progress persistence (self-hosted Postgres). | ✅ done | no |
| W1 | Auth surfaces re-skinned to FDE. | ✅ done | no |
| W3 | Real Month 1 content on the site. | ✅ done | no |
| W4 | Admin dashboard. | ✅ done | no |
| W5 | Tester access + `docs/tester-onboarding.md`. | ✅ done | no |
| W2 | Marketing pages polish. | ✅ done | no |
| W10 | FDE re-skin of shipped surfaces. | ✅ done | no |
| W13 | Real media playback + progress writes in the live lesson viewer. | ✅ done — **merged to master this run** (PR #36, CI green) | no |
| W14 | Fixture progress data replaced with real-or-honest-zero. | ✅ done — **merged to master this run** (PR #35, CI green) | no |
| W15 | Beta polish sweep (OAuth guard, dev routes, mock-user fail-fast). | ✅ done (on master) | no |
| I2 | Prod DB + backups + hardening. | ✅ done (verdict APPROVED 2026-07-04, [COMPLETION_I2.md](../../GWTH-launch-plan/completion/COMPLETION_I2.md)) | no |
| **I3** | **R2 + edge CDN; Part 2 = watched Cloudflare DNS/edge cutover with David; lesson media must serve from the CDN.** | ⛔ **in_progress 55% — gated on David (Cloudflare token scope), Part 2 not run** | **YES — hard. HOLD.** |

**Gate rule:** if any row above is not `done` at go-live, STOP and flag to David.
As of 2026-07-05 the gate is **NO-GO on I3 only** — everything else is green.

> Merge note (2026-07-05): the W13 real-media lesson viewer existed ONLY in
> PR #36 until this run — master, the W14 branch and the previous staging build
> all carried the older demo viewer. Both gate PRs were brought green
> (lint/typecheck/knip fixes) and merged; staging was rebuilt from the merged
> master, and every item below was verified against THAT build.

---

## §1 — Pre-flight on staging (P520)

Run against staging http://192.168.178.50:3001 before any prod deploy.
**All verified 2026-07-05 on commit `830cac8` (image `gwth-v2:staging-w6-830cac8`).**

### Automated (verified 2026-07-05, commit `830cac8`)

- [x] **`npm test` green** — Vitest **380 passed / 13 skipped / 0 failed** (54 files), incl. the W13 viewer suite (real playback, 80% video persistence, quiz grading). Locally AND in CI run [28733768206→830cac8](https://github.com/David-ACG/gwth-v2/actions) (first green master CI in weeks; the master lint error, two ProcessEnv typecheck errors and knip failures were fixed in `40355be`). _2026-07-05._
- [x] **`npm run build` clean** — `next build` exit 0 on the merged tree, locally and in CI on `830cac8`. Per-user routes are `force-dynamic` (static-bake trap): dashboard, guide, notifications, profile, progress, settings — the `/settings`+`/notifications` fix (`3409841`) was cherry-picked from the staging branch into PR #35 this run. _2026-07-05._
- [x] **Typecheck clean** — `tsc --noEmit` exit 0 locally + CI. _2026-07-05, `830cac8`._

### Manual (all reproduced 2026-07-05 on the `830cac8` staging build)

- [x] **No console errors** on `/`, `/login`, `/dashboard`, lesson (`/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers`), lab (`/labs/build-your-prompt-cheat-sheet`), `/guide`, `/admin`, `/progress` — light + dark, 1280 + 412. **0 console errors across all 32 page renders** (`deploy/shot-w6.mjs` sweep: 30 checks pass / 0 fail; evidence `completion/W6/*.png` + `completion/W6/preflight-sweep.json`).
- [x] **412px mobile pass** on all of the above, light + dark — same sweep, screenshots in `completion/W6/`.
- [x] **W8 beta cuts re-verified:** signup page carries invite-only copy; an ungranted signed-in account gets free labs only ("BETA INVITE REQUIRED FOR COURSE", reproduced on a mock-flag-free container); `POST /api/stripe/{checkout,webhook,portal}` all **503**; **no checkout CTA** and **no GWTH Score widget** on `/`, `/dashboard`, lesson (light+dark, both widths). _2026-07-05._
- [x] **FDE conformance:** all 7 surfaces reviewed against [`DESIGN_FDE.md`](../DESIGN_FDE.md) — **PASS**, one design language end to end, zero banned patterns, logo two-ink rule pixel-exact. Minor polish notes (login panel resting shadow, missing login kicker, sidebar text wordmark) filed as non-blocking. _2026-07-05._
- [x] **W7+W13 persistence FROM THE UI:** fresh account `w6-fresh-1783238713@example.com` UI-logged-in, **played the real intro video** (currentTime advanced, then watched past 80%: 85.3/89.5s), **played the real audio narration** (kokoro_main.wav, currentTime advanced), **passed the Q&A via real clicks** (3/3 correct, 100%), clicked **Finish** (lesson-complete surface), **signed out via the UI, signed back in** → `/progress` shows **1 Lessons Completed, 1-day streak, 100% avg quiz, "1 of 26 lessons", Lesson m1_l01 Grade A** (screenshot `completion/W6/progress-after-relogin-1280.png`) and the DB row confirms `m1_l01 | is_completed=t | quiz_score=100 | intro_video_progress=0.92`. _2026-07-05._
- [x] **Honest data (W14):** the same brand-new account BEFORE completing anything showed real zeros — "Not started yet. 26 lessons ahead of you.", 0-day streak, no pre-completed labs; the fixture tells ("Held for 5 days", "12 / 24") are absent; the session greeting is the fresh account, not the mock learner. _2026-07-05, `completion/W6/dashboard-light-1280.png`._

### New gap items (added 2026-07-04, verified 2026-07-05)

- [x] **7a — `ENABLE_DEV_MOCK_USER` ABSENT from the prod env.** Coolify env store for app `tw0cc8oc0w4scwoccs0cw0go` read via API: the flag is **not present** (11 vars, list in §2). Backstops: `src/instrumentation.ts`/`src/lib/mock-user-guard.ts` hard-exit when the flag is set while `BETTER_AUTH_URL` is gwth.ai (W15), and a mock-flag-free container from the same image booted healthy on :3005. The flag remains staging-only (`deploy/run-staging.sh` line 44, bypass paths `src/lib/auth.ts` + `src/proxy.ts`). _2026-07-05._
- [x] **7b — no dev/review route answers 200.** Staging (`830cac8`): `/demo`, `/logo_picker`, `/redesign`, `/redesign_v2`, `/old-design`, `/score-card-variants` all **307 → /login** for anonymous (W15 gate, active even with the staging flag). Prod (current old build): all six **307 → /access** (site password gate) — no 200s today; **re-run this check against gwth.ai right after the cutover deploy** (the W15 auth gate ships with it). _2026-07-05._
- [x] **7c — OAuth buttons hidden while provider creds are unset.** `/login` and `/signup` render **zero** Google/GitHub/LinkedIn buttons on staging (W15 `getEnabledOAuthProviders` guard; no provider creds set anywhere yet). A visible button therefore cannot 500. When David registers provider apps for https://gwth.ai, set `<PROVIDER>_CLIENT_ID`+`_CLIENT_SECRET` in the Coolify env and the buttons reappear with no code change. _2026-07-05._
- [x] **7d — W13, W14, W15 merged and verified** — see §0 merge note and the three items above. _2026-07-05._

---

## §2 — Production environment (Coolify · Hetzner)

App: **GWTH v2 / gwth.ai** · Coolify `http://195.201.177.66:8000` · App UUID
`tw0cc8oc0w4scwoccs0cw0go` · Project: *My first project › production*.
(Deploy mechanics: [`docs/architecture/infrastructure-and-deployment.md`](architecture/infrastructure-and-deployment.md) and the `gwth-infrastructure` skill. API token: SOPS `deploy/secrets.hetzner-ops.env`.)

Confirmed in the Coolify env store **2026-07-05** (values verified via API over `ssh hetzner`, never committed):

- [x] `DATABASE_URL` → **self-hosted Postgres** `postgres://…@zo0gkcwoo0o4gow0go4cwk0o:5432/gwth_v2` (the I2 `gwth-v2-db-prod`, PG 17.10, internal-only, 24 tables). NOT Supabase; zero `SUPABASE_*` vars remain.
- [x] Better Auth vars (W11): `BETTER_AUTH_SECRET` set; **`BETTER_AUTH_URL=https://gwth.ai` was MISSING and was added to the env store this run (2026-07-05)** — without it `src/lib/better-auth.ts` throws at boot in production, so the cutover deploy would have crash-looped.
- [x] `PLUNK_SECRET_KEY` set (invites + verification + feedback email).
- [x] `PIPELINE_API_KEY` set (beta-access grant API; used by `deploy/invite-testers.sh`).
- [x] `NEXT_PUBLIC_SITE_URL=https://gwth.ai`.
- [x] **`ENABLE_DEV_MOCK_USER` absent** (7a).
- [ ] **I3 media vars NOT set yet** (`MEDIA_CDN_BASE_URL` / `NEXT_PUBLIC_MEDIA_CDN_BASE_URL`) — correct for now (I3 Part 1 blocked on the Cloudflare token); **they MUST be set before the cutover deploy** or prod lesson media falls back to the LAN-only `http://192.168.178.50:8088` URLs and will not play for testers. This is the concrete reason the I3 gate blocks W6.
- [!] **`SITE_PASSWORD` is set (prod).** The password gate exempts only `/`, `/access`, `/auth`, `/api` — so `/signup`, `/login` and `/guide` are behind it. **Decide before invites:** either remove `SITE_PASSWORD` at the cutover (the pre-launch `X-Robots-Tag: noindex` also drops with it) or invites must include the site password. The invite email template mentions neither.

---

## §3 — Deploy procedure

Deploy is via Coolify on Hetzner. **Changed 2026-07-05:** the GitHub Actions
auto-deploy is now **opt-in per push** — `deploy-hetzner` / `deploy-p520` in
`.github/workflows/ci.yml` run only when the pushed head commit message
contains **`[deploy]`**. A green master push alone no longer ships to prod
(this run made master CI green again, which would otherwise have auto-deployed
mid-I3-hold).

Three equivalent triggers (pick one):

1. **GitHub Actions:** push to `master` with `[deploy]` in the commit message —
   deploys after lint/typecheck/knip/test/build pass. Preferred: gates on CI.
2. **Coolify UI:** Login → *My first project › production › GWTH v2 → Redeploy*.
3. **Coolify API** (token from SOPS `deploy/secrets.hetzner-ops.env`):
   `curl -X POST -H "Authorization: Bearer $COOLIFY_API_TOKEN" "http://localhost:8000/api/v1/deploy?uuid=tw0cc8oc0w4scwoccs0cw0go&force=false"` (over `ssh hetzner`).

- [ ] Record the **deployed commit hash** here: `__________` *(HELD — deploy not executed 2026-07-05; the candidate is `830cac8`, pre-flight green.)*
- [ ] Record the **deploy timestamp** here: `__________`

---

## §4 — Post-deploy verification (production) — HELD with the deploy

Not run 2026-07-05 (no deploy happened). What CAN be asserted about prod today:

- [x] `https://gwth.ai` serves with **valid SSL** — cert CN=gwth.ai, valid 2026-07-04 → 2026-10-02, `curl` verify OK. _2026-07-05._
- [x] `https://gwth.ai/api/health` → `{"status":"healthy"}`. _2026-07-05 (old build `376d434`, 2026-03-24 image — prod is pre-cutover by design, see [COMPLETION_I2.md](../../GWTH-launch-plan/completion/COMPLETION_I2.md))._
- [ ] **Auth round-trip** with a test account — after the cutover deploy.
- [ ] A **granted tester reaches a real Month 1 lesson AND a lab** — after the cutover deploy (and media requires the I3 CDN vars).
- [ ] **Feedback form round-trips** — after the cutover deploy.
- [ ] **Re-run 7b dev-route checks against gwth.ai** — after the cutover deploy.

---

## §5 — Backup verification (verified 2026-07-05, do not assume)

- [x] **I2 chain covers the PROD `gwth_v2` DB** — verdict APPROVED 2026-07-04, [COMPLETION_I2.md](../../GWTH-launch-plan/completion/COMPLETION_I2.md) (restore drill PASSED twice: local RTO ~2s, R2-copy RTO 0.68s; the 2026-07-04 re-verify also found and fixed the Coolify-lockout backup regression).
- [x] **Fresh spot-check this run:** latest Coolify dump execution #4 `pg-dump-gwth_v2-1783220402.dmp` **success 2026-07-05 03:00** (the scheduled path works post-fix); `save_s3=true` (R2 offsite leg, bucket `gwth-db-backups` EU) and `enabled=true`; P520 pull 03:30 logged `pull+snapshot ok (newest 0h, 4 dumps staged)` with the restic snapshot + Kuma dead-man heartbeat (monitor #4, 26h window). _2026-07-05._
- [x] Dump locations + retention: Hetzner `/data/coolify/backups/databases/root-team-0/gwth-v2-db-prod-…/` (retain 7) → R2 `gwth-db-backups` (retain 7) → P520 `/home/david/backups/gwth-v2-db/` + restic (keep 14d/8w).

---

## §6 — Rollback procedure (documented BEFORE any deploy)

If the cutover deploy is bad, roll back **before** any tester sees it:

1. **Fastest — redeploy the previous image via Coolify:** Coolify → GWTH v2 →
   **Deployments** → select the last-known-good deployment → **Redeploy**.
   Coolify keeps prior built images; near-instant, no rebuild.
2. **Source rollback:** `git revert <bad-commit>` on `master`, push with
   `[deploy]` in the message — CI redeploys the reverted tree. (Never
   `reset --hard` on master.)
3. **Data rollback (last resort):** restore the latest good dump per §5
   (three independent copies: Hetzner local, R2, P520 restic).

- [x] **Last-known-good recorded 2026-07-05:** the running prod container is
  `tw0cc8oc0w4scwoccs0cw0go-091231751958`, image tag
  **`tw0cc8oc0w4scwoccs0cw0go:376d434287a78ecb3dd28f37a064d182eba785ba`**
  (commit `376d434` "fix: use correct Plunk API endpoint", built 2026-03-24),
  status `running:healthy`. Retained rollback images on the host: `376d4342…`
  and `6eedc7ca…`. Verified readable via `docker ps`/`docker images` over
  `ssh hetzner`. NOTE: this pre-cutover image still carries the old Supabase
  env shape — rolling back to it restores today's "marketing site up,
  app pre-cutover" state, which is the safe posture.

---

## §7 — Tester invites (final step — ALWAYS David's action)

- [x] `docs/tester-onboarding.md` exists and is final (W5, dry-run verified 2026-06-23).
- [x] **Invite pack PREPARED and HELD (2026-07-05):** fill the hand-picked
  emails into [`deploy/testers.txt`](../deploy/testers.txt), then run
  [`deploy/invite-testers.sh`](../deploy/invite-testers.sh) — one action; it
  grants Month 1 + sends the Plunk invite per tester (idempotent), resolving
  the API key from the Coolify prod env so no secret is committed.
  **No invite was or will be sent by an agent.**
- [ ] Send invites (David, after I3 Part 2 + cutover deploy + §4 green).
- [ ] Record who was invited + when: `__________`

---

## Go / No-Go sign-off

| Gate | Status |
|------|--------|
| §0 dependency gate all `done` | ⛔ **I3 at 55% — HOLD** (everything else ✅) |
| §1 pre-flight (automated + manual + 7a-7d) all ticked | ✅ 2026-07-05, commit `830cac8` |
| §2 prod env confirmed | ✅ 2026-07-05 (BETTER_AUTH_URL added; I3 media vars + SITE_PASSWORD decision outstanding) |
| §4 post-deploy verification all green | ⏸ held with the deploy |
| §5 backup verified restorable | ✅ 2026-07-05 (fresh dump + dead-man + R2, citing I2) |
| §6 rollback documented + last-good id recorded | ✅ 2026-07-05 |
| §7 invites sent | ⏸ prepared + HELD for David |

**GO requires every box above ticked with evidence.** Remaining path to GO:

1. David fixes the Cloudflare token scope → I3 Part 1 finishes autonomously
   (R2 bucket, split tokens, backfill, env vars).
2. I3 Part 2: watched DNS/edge cutover with David (days before invites).
3. Set the I3 media vars in Coolify; decide `SITE_PASSWORD`.
4. Deploy `master` (`[deploy]` push or Coolify UI), run §4, re-run 7b on prod.
5. David fills `deploy/testers.txt` and runs `deploy/invite-testers.sh`.

```bash
python3 /home/david/projects/GWTH-launch-plan/scripts/update_launch_task.py \
  W6 --progress 100 --status done --note "gwth.ai live, testers invited"
```
