# Go-Live Runbook — gwth.ai beta (invites target 8 July 2026)

> **Task:** W6 (launch board, `website` track), the terminal go-live gate.
> **Owner:** David. **Target:** beta invites Wed 2026-07-08, hand-picked testers, invite-only.
> **This file is the deliverable David audits.** Every checklist item is ticked
> only with evidence (command output, URL, screenshot path) recorded inline.
>
> **Status: I3 GATE CLEARED 2026-07-05 evening; pre-flight fully GREEN re-run
> on the current build; production cutover deploy executed by this run.**
> I3 finished at 100% (board entry 2026-07-05 19:18 UTC: DNS on Cloudflare,
> media.gwth.ai live, email lane DKIM d=gwth.ai + DMARC pass, mail-tester
> 8.1/10). Every pre-flight item below was re-verified fresh in THIS run
> (2026-07-05 night, "r2") against staging on the current master; inherited
> ticks from earlier runs counted for nothing.

Last updated: **2026-07-05 (W6 night run r2)** · Staging: http://192.168.178.50:3001 · Prod: https://gwth.ai

---

## §0 — Dependency gate (GO / NO-GO)

Status snapshot **2026-07-05 19:20 UTC** (re-checked live on the board:
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
| W13 | Real media playback + progress writes in the live lesson viewer. | ✅ done, merged (PR #36), re-verified this run | no |
| W14 | Fixture progress data replaced with real-or-honest-zero. | ✅ done, merged (PR #35), re-verified this run | no |
| W15 | Beta polish sweep (OAuth guard, dev routes, mock-user fail-fast). | ✅ done (on master), re-verified this run | no |
| I2 | Prod DB + backups + hardening. | ✅ done (verdict APPROVED 2026-07-04, [COMPLETION_I2.md](../../GWTH-launch-plan/completion/COMPLETION_I2.md)) | no |
| **I3** | **R2 + edge CDN; Cloudflare DNS/edge cutover; lesson media from the CDN.** | ✅ **done 100% (board 2026-07-05 19:18 UTC).** Verified live this run: gwth.ai NS = diana/dilbert.ns.cloudflare.com, site proxied HTTP/2 200 through the edge, media.gwth.ai serving R2 (lesson video + audio curl 200 from the CDN), staging lesson viewer streams from media.gwth.ai. Email lane: DKIM d=gwth.ai, DMARC pass, mail-tester 8.1/10. | **no — gate cleared** |

**Gate rule:** if any row above is not `done` at go-live, STOP and flag to David.
As of 2026-07-05 19:20 UTC every row is `done`: **GO**.

> Merge-state note (re-proven 2026-07-05 night): W13 = PR #36, W14 = PR #35,
> both merged; W15 commits (6eba5c7, b7b8be7, 2632e90) are on master directly.
> The 25 open PRs in the repo are A6 nm-trial leftovers, dependabot bumps and
> a kanban demo; none is a W13/W14/W15 gate PR, so nothing needed merging in
> the pre-step.

---

## §1 — Pre-flight on staging (P520)

Run against staging http://192.168.178.50:3001 before any prod deploy.
**All re-verified 2026-07-05 night (r2). Sweep + persistence on commit
`17bbfae` (image `gwth-v2:staging-i3-17bbfae`); the signup-fix delta re-built
and re-verified on `40e09b1` (image `gwth-v2:staging-w6-40e09b1`), which is
the deploy candidate.**

### Automated (verified 2026-07-05 night, commit `17bbfae`; full vitest re-run green after the `40e09b1` signup fix)

- [x] **`npm test` green** — Vitest **381 passed / 13 skipped / 0 failed** (54 files; 380 pre-fix, 381 after the signup-form test update). Skips are the two DB-gated suites. CI also green on `40e09b1` (run 28752562898). _2026-07-05 night._
- [x] **`npm run build` clean** — `next build` exit 0, compiled 8.6s, 73/73 static pages, zero warnings that matter. Docker build of `40e09b1` (which runs `next build`) also clean. _2026-07-05 night._
- [x] **Typecheck clean** — `npx tsc --noEmit` exit 0. _2026-07-05 night._

### Manual (all reproduced 2026-07-05 night on the current staging build)

- [x] **No console errors** on `/`, `/login`, `/dashboard`, lesson (`/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers`), lab (`/labs/build-your-prompt-cheat-sheet`), `/guide`, `/admin`, `/progress` — light + dark, 1280 + 412. **Sweep: 30 checks pass / 0 fail, consoleErrors empty** (`deploy/shot-w6.mjs`, evidence `completion/W6/*.png` + `completion/W6/preflight-sweep.json`, timestamps 19:27+ UTC). _2026-07-05 night._
- [x] **412px mobile pass** on all of the above, light + dark — same sweep, screenshots in `completion/W6/`.
- [x] **W8 beta cuts re-verified:** signup page carries invite-only framing (now WITH the working registration form, see the signup-fix note below); `POST /api/stripe/{checkout,webhook,portal}` all **503** (GET 405); **no checkout CTA** and **no GWTH Score widget** on `/`, `/dashboard`, lesson (light+dark, both widths). _2026-07-05 night._
- [x] **FDE conformance:** 10 fresh screenshots reviewed against [`DESIGN_FDE.md`](../DESIGN_FDE.md) — **PASS** on all surfaces, one register end to end, zero banned patterns, two-ink logo rule pixel-checked at 3x zoom. Two cosmetic non-blockers noted: static ink offset shadow on the auth panel (spec sanctions only the teal hover offset), and the dashboard sidebar wordmark is text, not the locked vector. _2026-07-05 night._
- [x] **W7+W13 persistence FROM THE UI:** brand-new account `w6r2-fresh-1783279485@example.com` UI-logged-in, **played the real intro video from the CDN** (currentTime 2.42s, then watched past 80%: 85.3/89.5s), **played the real audio narration** (kokoro_main.wav, currentTime 2.46s), **passed the Q&A via real clicks** (3/3, 100%), clicked **Finish**, **signed out via the UI, signed back in** → `/progress` shows 1 lesson completed, "1 of 26 lessons", 100% avg quiz (screenshot `completion/W6/progress-after-relogin-1280.png`); DB row `m1_l01 | is_completed=t | quiz_score=100 | intro_video_progress=0.92 | completed_at=2026-07-05 19:30:02+00`. _2026-07-05 night._
- [x] **Honest data (W14):** the same brand-new account BEFORE completing anything showed real zeros ("Not started yet", no 5-day streak, no 12/24, no pre-completed labs) and the greeting is the fresh account, not the mock learner. _2026-07-05 night, `completion/W6/dashboard-light-1280.png`._
- [x] **I3 CDN media on staging:** lesson video src `https://media.gwth.ai/lessons/19e4bc1c-…/video/lesson_01_intro.mp4` (curl 200, video/mp4, 6.2 MB) and audio src `https://media.gwth.ai/lessons/19e4bc1c-…/audio/kokoro_main.wav` (curl 200, audio/wav, 92.7 MB). _2026-07-05 night._

> **Signup fix (this run, commit `40e09b1`):** adversarial re-verification
> found a launch blocker the previous GREEN missed: `/signup` rendered only
> invite-only copy pointing at OAuth buttons that the W15 guard hides (no
> provider apps registered), and the email/password form was dormant — the
> invite email sends testers to `/signup`, where they could not register.
> Fixed by rendering the real registration form under the invite-only framing
> (course access stays gated by the manual_beta grant; ungranted signups get
> free labs only, so the open form does not open the beta). Re-verified end
> to end on the rebuilt staging (`40e09b1`): grant → UI signup ("W6 Invitee")
> → success surface → verification flip (substitutes for the inbox link) →
> UI login → dashboard with Month 1 access and the grant auto-attached
> (`user_access: manual_beta/month1`). Evidence
> `completion/W6/signup-fixed-*.png`; tests updated (4/4 green).

### New gap items (added 2026-07-04, re-verified 2026-07-05 night)

- [x] **7a — `ENABLE_DEV_MOCK_USER` ABSENT from the prod env.** Coolify env store read fresh via API this run: 8 keys, flag **not present**, zero `SUPABASE_*`. Backstops unchanged (`src/instrumentation.ts` + `src/lib/mock-user-guard.ts` hard-exit, W15). The flag remains staging-only (`deploy/run-staging.sh` line 44; bypass paths `src/lib/auth.ts` + `src/proxy.ts`). _2026-07-05 night._
- [x] **7b — no dev/review route answers 200.** Staging current build, anonymous: `/demo`, `/logo_picker`, `/redesign`, `/redesign_v2`, `/old-design`, `/score-card-variants` all **307 → /login** (W15 gate). Re-run against gwth.ai post-deploy in §4. _2026-07-05 night._
- [x] **7c — OAuth buttons hidden while provider creds are unset.** `/login` and `/signup` render **zero** OAuth buttons on staging (W15 `getEnabledOAuthProviders` guard; no provider creds set anywhere). A visible button therefore cannot 500. The signup fix keeps the same guard on the new form. _2026-07-05 night._
- [x] **7d — W13, W14, W15 merged and verified** — see §0 merge-state note and items above. _2026-07-05 night._

---

## §2 — Production environment (Coolify · Hetzner)

App: **GWTH v2 / gwth.ai** · Coolify `http://195.201.177.66:8000` · App UUID
`tw0cc8oc0w4scwoccs0cw0go` · Project: *My first project › production*.
(Deploy mechanics: [`docs/architecture/infrastructure-and-deployment.md`](architecture/infrastructure-and-deployment.md) and the `gwth-infrastructure` skill. API token: SOPS `deploy/secrets.hetzner-ops.env`.)

Confirmed in the Coolify env store **2026-07-05 night** (values verified via API over `ssh hetzner`, never committed):

- [x] `DATABASE_URL` → **self-hosted Postgres** `postgres://…@zo0gkcwoo0o4gow0go4cwk0o:5432/gwth_v2` (the I2 `gwth-v2-db-prod`, PG 17.10, internal-only re-confirmed: no published ports). NOT Supabase; zero `SUPABASE_*` vars.
- [x] Better Auth vars (W11): `BETTER_AUTH_SECRET` present; `BETTER_AUTH_URL=https://gwth.ai` present (added 2026-07-05 morning run).
- [x] `PLUNK_SECRET_KEY` present (invites + verification + feedback email).
- [x] `PIPELINE_API_KEY` present (beta-access grant API; used by `deploy/invite-testers.sh`).
- [x] `NEXT_PUBLIC_SITE_URL=https://gwth.ai`.
- [x] **`ENABLE_DEV_MOCK_USER` absent** (7a).
- [x] **I3 media vars SET** (set by the I3 run 2026-07-05): `MEDIA_CDN_BASE_URL=https://media.gwth.ai` (runtime) and `NEXT_PUBLIC_MEDIA_CDN_BASE_URL=https://media.gwth.ai` (**is_build_time=true**, required since NEXT_PUBLIC_* is inlined at `next build`; the Dockerfile takes it as a build arg since `17bbfae`).
- [x] **`SITE_PASSWORD` REMOVED from the Coolify env store this run (2026-07-05 night, decision executed).** Rationale: the invite email contains no password and testers must reach `/signup`, `/login`, `/guide`; keeping the gate breaks the invite flow. The value is preserved in the canonical SOPS store `deploy/secrets.production.env` (intentional drift, restore from there if a gate is ever needed again). Consequence: the password gate and its `X-Robots-Tag: noindex` header drop with the next deploy. `ALLOW_INDEXING` stays UNSET, so robots.txt and the meta robots tag keep the site noindexed during the invite-only beta; David flips `ALLOW_INDEXING=1` at public launch.

---

## §3 — Deploy procedure

Deploy is via Coolify on Hetzner. The GitHub Actions auto-deploy is opt-in per
push: `deploy-hetzner` / `deploy-p520` in `.github/workflows/ci.yml` run only
when the pushed head commit message contains **`[deploy]`**.

Three equivalent triggers (pick one):

1. **GitHub Actions:** push to `master` with `[deploy]` in the commit message,
   deploys after lint/typecheck/knip/test/build pass. Preferred: gates on CI.
2. **Coolify UI:** Login → *My first project › production › GWTH v2 → Redeploy*.
3. **Coolify API** (token from SOPS `deploy/secrets.hetzner-ops.env`):
   `curl -X POST -H "Authorization: Bearer $COOLIFY_API_TOKEN" "http://localhost:8000/api/v1/deploy?uuid=tw0cc8oc0w4scwoccs0cw0go&force=false"` (over `ssh hetzner`).

- [x] Deployed commit: **`40e09b1`** ("fix(W6): render the real registration form on /signup for invited testers"; master HEAD, CI green run 28752562898).
- [x] Deploy trigger + timestamp: **Coolify API, queued 2026-07-05 19:48:30 UTC, deployment `qgk44skg44skoo8ok8oc4c04`, status `finished` 19:51 UTC**, health check passed.
- [x] **Content import (found missing post-deploy, fixed this run):** prod content tables were EMPTY (the W3/W13 import only ever ran against staging), so the lesson viewer 404'd on prod. Fixed by copying exactly the verified staging content tables (courses 1, sections 4, lessons 26, quiz_questions 78, lesson_resources 0, labs 30) via `pg_dump --data-only --column-inserts` in a single transaction after a byte-identical schema diff; counts match staging exactly. No user/auth/progress/feedback tables touched. _2026-07-05 ~20:05 UTC._

---

## §4 — Post-deploy verification (production)

All re-run fresh against https://gwth.ai after the cutover deploy, 2026-07-05 19:51 to 20:15 UTC:

- [x] `https://gwth.ai` serves the NEW build with **valid SSL** through Cloudflare (HTTP/2 200, curl verify OK; the `x-robots-tag` header from the old password gate is gone).
- [x] `https://gwth.ai/api/health` → `{"status":"healthy"}` (new build timestamps).
- [x] **Auth round-trip** with test account `w6-prodcheck-1783281150@example.com`: grant (API, sendInvite:false) → UI signup on the fixed /signup form → email_verified flip (substitutes for the inbox link; one row) → UI login → /dashboard "Welcome, W6." with Month 1 unlocked and honest zeros. Evidence `completion/W6/prod-signup-1280.png`, `prod-dashboard-1280.png`.
- [x] **Granted tester reaches a real Month 1 lesson AND a lab:** after the content import, `/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers` renders (video src `https://media.gwth.ai/lessons/19e4bc1c-…/video/lesson_01_intro.mp4`, plays with currentTime advancing; audio src on media.gwth.ai, both 200/206); `/labs` lists 30 labs, `/labs/build-your-prompt-cheat-sheet` renders. Dashboard shows "26 lessons ahead", not the 95-lesson mock catalog. Zero console errors on all checked pages. Evidence `completion/W6/prod-lesson-1280.png`, `prod-lesson-412.png`, `prod-lab-1280.png`, `prod-content-verify.json` (17/17 checks).
- [x] **Feedback form round-trips:** submitted from /guide via the UI; prod DB row `2d8de311-… | general | "W6 post-deploy feedback round-trip test" | /guide | 2026-07-05 20:01:10+00`.
- [x] **7b re-run against gwth.ai:** `/demo`, `/logo_picker`, `/redesign`, `/redesign_v2`, `/old-design`, `/score-card-variants` all **307 → /login**, none 200.
- [x] Password gate gone: `/signup` 200 with the registration form (no `/access` redirect); robots stay noindex via robots.txt (`Disallow: /`) + `<meta name="robots" content="noindex, nofollow">` (ALLOW_INDEXING unset).
- [x] Stripe cuts hold on prod: checkout/webhook/portal POST all **503** `billing_disabled_for_beta`.

---

## §5 — Backup verification (re-verified fresh 2026-07-05 night, citing I2)

- [x] **I2 chain covers the PROD `gwth_v2` DB** — verdict APPROVED 2026-07-04, [COMPLETION_I2.md](../../GWTH-launch-plan/completion/COMPLETION_I2.md); this run re-confirmed the Coolify backup id 1 is bound to `gwth-v2-db-prod` (uuid `zo0gkcwoo0o4gow0go4cwk0o`, db `gwth_v2`), the exact DB in the app's `DATABASE_URL`.
- [x] **Fresh spot-check this run:** newest dump `pg-dump-gwth_v2-1783220402.dmp` **2026-07-05 03:00:02 UTC, success, s3_uploaded=true** (R2 bucket `gwth-db-backups`, storage usable); schedule enabled, cron `0 3 * * *`. P520 pull 03:30: `pull+snapshot ok (newest 0h, 4 dumps staged)`; restic newest snapshot `ef47116e` 03:30:02 (keep 14d/8w); Kuma dead-man monitor #4 armed (push type, 26h window, Telegram notify), last heartbeat **2026-07-05 03:30:04 `dump-0h-old` (up)**. _2026-07-05 night._
- [x] Dump locations + retention: Hetzner `/data/coolify/backups/databases/root-team-0/gwth-v2-db-prod-…/` (retain 7) → R2 `gwth-db-backups` (retain 7) → P520 `/home/david/backups/gwth-v2-db/` + restic (keep 14d/8w).

---

## §6 — Rollback procedure (documented BEFORE the deploy; re-verified this run)

If the cutover deploy is bad, roll back **before** any tester sees it:

1. **Fastest — redeploy the previous image via Coolify:** Coolify → GWTH v2 →
   **Deployments** → select the last-known-good deployment → **Redeploy**.
   NOTE (verified this run): the Coolify deployments API history is EMPTY for
   this app (`{"count":0}`), so the reliable anchor is the retained image tag
   below; if the UI list is also empty, roll back by re-tagging + restarting
   the retained image on the host, or by trigger 2.
2. **Source rollback:** `git revert <bad-commit>` on `master`, push with
   `[deploy]` in the message; CI redeploys the reverted tree. (Never
   `reset --hard` on master.)
3. **Data rollback (last resort):** restore the latest good dump per §5
   (three independent copies: Hetzner local, R2, P520 restic).

- [x] **Last-known-good re-verified 2026-07-05 night (pre-deploy):** running
  prod container `tw0cc8oc0w4scwoccs0cw0go-091231751958`, image tag
  **`tw0cc8oc0w4scwoccs0cw0go:376d434287a78ecb3dd28f37a064d182eba785ba`**
  (commit `376d434`, built 2026-03-24), status `running:healthy`, 0 restarts,
  up since 2026-06-14. Retained images on the host: `376d4342…` and
  `6eedc7ca…` (both 411 MB). Verified readable via `docker ps`/`docker images`
  over `ssh hetzner` in THIS run. NOTE: this pre-cutover image carries the old
  Supabase env shape; rolling back to it restores the "marketing site up, app
  pre-cutover" posture (and the removed SITE_PASSWORD would need re-adding to
  the env store from SOPS for the gate to return).

---

## §7 — Tester invites

- [x] `docs/tester-onboarding.md` exists and is final (W5, dry-run verified 2026-06-23).
- [x] **Invite mechanics:** fill emails into [`deploy/testers.txt`](../deploy/testers.txt), run [`deploy/invite-testers.sh`](../deploy/invite-testers.sh); it grants Month 1 + sends the Plunk invite per tester (idempotent), resolving the API key from the Coolify prod env.
- [x] **Smoke invite SENT (authorized by David 2026-07-05): exactly one, to `familyuccelli@gmail.com`**, 2026-07-05 20:09:48 UTC via `deploy/invite-testers.sh` against https://gwth.ai. Verified without the inbox: API `{"success":true,…,"inviteSent":true}` (Plunk accepted the send), prod DB row in `beta_access_grants` (month 1, notes "beta cohort 1 (2026-07-08)", user_id empty until signup), and the identical signup journey proven with the prodcheck account. **What David should see in that inbox:** an email from GWTH via Plunk, subject "You're in: your GWTH.ai beta access", pointing to sign up at https://gwth.ai/signup with that address then read /guide; after signup a separate verification email arrives.
- [x] **Full batch: READY and HELD, waiting only on the tester list.** No real list exists (testers.txt held only comments; docs/tester-onboarding.md contains no email list), so per David's 2026-07-05 instruction the batch was NOT invented. David was Telegrammed 2026-07-05 20:16 UTC (message 1882) asking for the beta email list; the moment it lands in `deploy/testers.txt`, run `./deploy/invite-testers.sh` and the batch fires (idempotent; the smoke address can safely stay in the file).
- [x] Record who was invited + when: **familyuccelli@gmail.com, 2026-07-05 20:09:48 UTC (smoke). Batch pending David's list.**

---

## Go / No-Go sign-off

| Gate | Status |
|------|--------|
| §0 dependency gate all `done` | ✅ 2026-07-05 19:20 UTC (I3 cleared at 100%) |
| §1 pre-flight (automated + manual + 7a-7d) all ticked | ✅ 2026-07-05 night (r2), fresh evidence, incl. the signup fix |
| §2 prod env confirmed | ✅ 2026-07-05 night (media vars set; SITE_PASSWORD removed by decision) |
| §4 post-deploy verification all green | ✅ 2026-07-05 19:51 to 20:15 UTC (incl. the prod content import fix) |
| §5 backup verified restorable | ✅ 2026-07-05 night (fresh dump + R2 + dead-man, citing I2) |
| §6 rollback documented + last-good id recorded | ✅ 2026-07-05 night (re-verified pre-deploy) |
| §7 invites | ✅ smoke sent + verified 20:09 UTC; batch READY, held only on David's tester list (Telegram sent) |

**gwth.ai is LIVE on the beta build.** Remaining for David: check the
familyuccelli@gmail.com inbox, reply with the beta email list (the batch then
fires via `deploy/invite-testers.sh`), and flip the board when done:

```bash
python3 /home/david/projects/GWTH-launch-plan/scripts/update_launch_task.py \
  W6 --progress 100 --status done --note "gwth.ai live, testers invited"
```
