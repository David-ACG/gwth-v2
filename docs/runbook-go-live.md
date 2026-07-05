# Go-Live Runbook — gwth.ai beta (23 June 2026)

> **Task:** W6 (launch board, `website` track) — the terminal go-live gate.
> **Owner:** David. **Target:** 23 June 2026 beta, hand-picked testers, invite-only.
> **This file is the deliverable David audits.** Every checklist item is ticked
> only with evidence (command output, URL, screenshot path) recorded inline.
>
> **Status: NOT LIVE — readiness in progress.** Do **not** deploy to production
> or invite testers until §0 (dependency gate) is all-green and §1 pre-flight
> passes on staging. Production deploy + invites are a single gated human step.

Last updated: **2026-06-16** · Staging: http://192.168.178.50:3001 · Prod: https://gwth.ai

---

## §0 — Dependency gate (GO / NO-GO)

W6 depends on every other `website` task. The go-live cannot proceed until each
is `done`. Status snapshot **2026-06-16** (re-check at go-live:
`python3 /home/david/projects/GWTH-launch-plan/scripts/update_launch_task.py --list`):

| Task | What it gates | 2026-06-16 status | Go-live blocker? |
|------|---------------|-------------------|------------------|
| **W11** | Auth migration off Supabase → ratified provider (D4). **Auth does not work in prod without this** (Supabase subscription cancelled). | ⛔ **todo 0%** | **YES — hard** |
| **W7** | Per-user progress persistence (self-hosted Postgres). Pre-flight test "progress survives re-login" fails without it. | ⛔ **todo 0%** | **YES — hard** |
| W1 | Auth surfaces re-skinned to FDE (`/login`, `/signup`, `/forgot-password`). | 🟡 in_progress 70% | yes — visual gate |
| W3 | Real Month 1 content on the site (lesson + lab a tester actually reaches). | 🟡 in_progress 15% | yes — content gate |
| W4 | Admin dashboard (`/admin` must render without console errors). | 🟡 in_progress 10% | yes — surface gate |
| W5 | Tester access + **`docs/tester-onboarding.md`** (the invite step depends on it). | 🟡 in_progress 20% | yes — invites blocked |
| W2 | Marketing pages polish (home `/` console-clean). | 🟡 in_progress 85% | soft |
| W10 | FDE re-skin of shipped surfaces. | ✅ **done** | no |

**Gate rule:** if any row above is not `done` at go-live, STOP and flag to David.
As of 2026-06-16 the gate is **NO-GO** (W7 + W11 at 0%).

---

## §1 — Pre-flight on staging (P520)

Run against staging http://192.168.178.50:3001 before any prod deploy.

### Automated (verified 2026-06-16, commit `6b2e4f7`)

- [x] **`npm test` green** — Vitest **260 passed / 0 failed** (39 files, 6.4s). _2026-06-16, `6b2e4f7`._
- [x] **`npm run build` clean** — `next build` exit 0, "Compiled successfully", 66 static pages, no errors/warnings. _2026-06-16, `6b2e4f7`._
- [x] **Typecheck clean** — `tsc --noEmit` exit 0, zero errors. _2026-06-16, `6b2e4f7`._

> Re-run all three on the exact commit being deployed and update the date/hash.

### Manual (to perform at go-live — fill evidence)

- [ ] **No console errors** on each of: `/`, `/login`, `/dashboard`, a real lesson page, a lab page, `/guide`, `/admin`. _(evidence: screenshot per page → `docs/go-live-evidence/`)_
- [ ] **412px mobile pass** on all of the above, **light + dark**. _(evidence: screenshots)_
- [ ] **W8 beta cuts re-verified:** signup is invite-only, Stripe routes return 503, no checkout CTA anywhere, no score widget. _(commit `6b2e4f7` "enforce invite-only launch scope" is the baseline — re-confirm on staging)_
- [ ] **FDE conformance:** W10 re-skin landed — student-facing surfaces match [`DESIGN_FDE.md`](../DESIGN_FDE.md) (spot-check against the application map; one design language end to end).
- [ ] **W7 progress persistence:** a granted test account completes a lesson, logs out, logs back in → progress survives. _(blocked until W7 done)_

---

## §2 — Production environment (Coolify · Hetzner)

App: **GWTH v2 / gwth.ai** · Coolify `http://195.201.177.66:8000` · App UUID
`tw0cc8oc0w4scwoccs0cw0go` · Project: *My first project › production*.
(Deploy mechanics: [`docs/architecture/infrastructure-and-deployment.md`](architecture/infrastructure-and-deployment.md) and `~/.claude/rules/04-infrastructure.md`.)

Confirm in Coolify **before deploy** (values copied from staging env — never committed):

- [ ] `DATABASE_URL` → self-hosted Postgres (NOT Supabase). See [`DECISION_2026-06-12_database-off-supabase.md`](architecture/DECISION_2026-06-12_database-off-supabase.md).
- [ ] Auth provider env vars for the **D4-ratified provider** (W11). Supabase Auth is **retired** — its keys must be absent/unused.
- [ ] Plunk (transactional email) API key set.
- [ ] **Assert `ENABLE_DEV_MOCK_USER` is absent in prod env** (staging-only review flag; it hands anonymous visitors a logged-in mock learner). Backstop: `src/instrumentation.ts` refuses to boot when the flag is set while `BETTER_AUTH_URL` is gwth.ai (W15).
- [ ] Any other secret the build needs (cross-check against `.env.example` / staging).

---

## §3 — Deploy procedure

Deploy is via Coolify on Hetzner. Three equivalent triggers (pick one):

1. **GitHub Actions (default):** push to `master` runs the `deploy-hetzner` job
   (`.github/workflows/ci.yml`), which calls the Coolify deploy API for the app
   UUID after lint/typecheck/test/build pass. **Preferred** — it gates on CI.
2. **Coolify UI:** Login → *My first project › production › GWTH v2 → Redeploy*.
3. **Coolify web terminal (tinker)** — see the ACG example in
   `~/.claude/rules/04-infrastructure.md`; substitute app UUID
   `tw0cc8oc0w4scwoccs0cw0go`. (David's user is **not** in the docker group on
   Hetzner — use the UI or web terminal, not SSH docker exec.)

- [ ] Record the **deployed commit hash** here: `__________`
- [ ] Record the **deploy timestamp** here: `__________`

---

## §4 — Post-deploy verification (production)

- [ ] `https://gwth.ai` serves with **valid SSL** (no cert warning). _(evidence: `curl -sI https://gwth.ai | head` + browser padlock)_
- [ ] `https://gwth.ai/api/health` returns **OK** (route: `src/app/api/health/route.ts`). _(evidence: `curl -s https://gwth.ai/api/health`)_
- [ ] **Auth round-trip** works with a test account (sign in → authenticated page → sign out).
- [ ] A **granted tester reaches a real Month 1 lesson AND a lab**.
- [ ] **Feedback form round-trips** (submit → stored/received).

---

## §5 — Backup verification (check — do not assume)

- [ ] The **nightly `pg_dump`** of the `gwth_v2` Postgres is in place on Hetzner and produces a **restorable** dump (test a restore into a scratch DB). Context: [`DECISION_2026-06-12_database-off-supabase.md`](architecture/DECISION_2026-06-12_database-off-supabase.md) and the prior incident recovery notes [`docs/recover-hetzner-data-20-feb-2026.md`](recover-hetzner-data-20-feb-2026.md).
- [ ] Record where the dump lives + retention here: `__________`

---

## §6 — Rollback procedure (document BEFORE inviting anyone)

If the deploy is bad, roll back **before** any tester sees it:

1. **Fastest — redeploy the previous Coolify deployment:** Coolify → GWTH v2 →
   **Deployments** tab → select the **last-known-good** deployment → **Redeploy**.
   Coolify keeps prior built images, so this is near-instant and needs no rebuild.
2. **Source rollback (if the bad state is in code):** `git revert <bad-commit>`
   on `master` and push — CI redeploys the reverted tree. (Avoid `reset --hard`
   on the shared prod branch.)
3. **Data rollback (only if a migration corrupted data):** restore the latest
   good `pg_dump` per §5 / [`recover-hetzner-data-20-feb-2026.md`](recover-hetzner-data-20-feb-2026.md). DB rollback is last-resort — prefer code rollback.

- [ ] **Last-known-good deployment id recorded** here before go-live: `__________`

---

## §7 — Tester invites (final step)

- [ ] `docs/tester-onboarding.md` exists and is final (**W5 deliverable** — blocked until W5 done).
- [ ] Send invites per that doc to the hand-picked beta testers.
- [ ] Record who was invited + when: `__________`

---

## Go / No-Go sign-off

| Gate | Status |
|------|--------|
| §0 dependency gate all `done` | ☐ |
| §1 pre-flight (automated + manual) all ticked | ☐ |
| §2 prod env confirmed | ☐ |
| §4 post-deploy verification all green | ☐ |
| §5 backup verified restorable | ☐ |
| §6 rollback documented + last-good id recorded | ☐ |
| §7 invites sent | ☐ |

**GO requires every box above ticked with evidence.** Record final result via:

```bash
python3 /home/david/projects/GWTH-launch-plan/scripts/update_launch_task.py \
  W6 --progress 100 --status done --note "gwth.ai live, testers invited"
```
