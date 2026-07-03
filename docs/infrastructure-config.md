# GWTH v2 — Infrastructure Configuration

> Living document. Updated as infrastructure is built.
>
> Last updated: 2026-07-03 (I2: Hetzner prod DB + full hardening delta + backups + rollback)

---

## Server: Hetzner Production (ACG-GWTHPROD-105)

### Hardware (Proxmox VM)

| Resource     | Value                                         |
| ------------ | --------------------------------------------- |
| VM ID        | 105                                           |
| VM Name      | ACG-GWTHPROD-105                              |
| Proxmox Host | ACG-Proxmox1                                  |
| CPU          | 16 cores, x86-64-v2-AES, 1 socket             |
| RAM          | 32 GB                                         |
| Disk         | 800 GB ZFS (iothread=on)                      |
| LVM          | ubuntu-vg/ubuntu-lv extended to 785 GB usable |
| Network      | virtio, bridge=vmbr0, firewall=1              |
| QEMU Agent   | enabled                                       |
| Auto-start   | on boot                                       |

### Operating System

| Setting   | Value              |
| --------- | ------------------ |
| OS        | Ubuntu 24.04.4 LTS |
| Kernel    | 6.8.0-100-generic  |
| Hostname  | acg-gwthprod-105   |
| Public IP | 195.201.177.66     |

### SSH Configuration

| Setting         | Value                                               |
| --------------- | --------------------------------------------------- |
| Port            | 111                                                 |
| Auth            | Public key only (password disabled)                 |
| Root login      | Disabled                                            |
| Max auth tries  | 3                                                   |
| Allowed users   | david                                               |
| Config file     | `/etc/ssh/sshd_config.d/00-hardened.conf`           |
| Socket override | `/lib/systemd/system/ssh.socket` (ListenStream=111) |

### Firewall (UFW)

| Port | Protocol | Purpose                 |
| ---- | -------- | ----------------------- |
| 111  | TCP      | SSH                     |
| 80   | TCP      | HTTP (Coolify/Traefik)  |
| 443  | TCP      | HTTPS (Coolify/Traefik) |
| 8000 | TCP      | Coolify dashboard       |

Default: deny incoming, allow outgoing.

### Fail2ban

| Setting     | Value                      |
| ----------- | -------------------------- |
| Jail        | sshd                       |
| Port        | 111                        |
| Max retries | 5                          |
| Find time   | 600s                       |
| Ban time    | 3600s                      |
| Ban action  | ufw                        |
| Config      | `/etc/fail2ban/jail.local` |

### Unattended Upgrades

| Setting               | Value                             |
| --------------------- | --------------------------------- |
| Enabled               | Yes                               |
| Security origins      | Ubuntu noble, noble-security, ESM |
| Auto-reboot           | No (manual reboot required)       |
| Auto-clean interval   | 7 days                            |
| Remove unused kernels | Yes                               |
| Remove unused deps    | Yes                               |

### Docker

| Setting        | Value                |
| -------------- | -------------------- |
| Version        | 29.2.1               |
| User access    | david (docker group) |
| Install method | get.docker.com       |

### Coolify

| Setting        | Value                                                |
| -------------- | ---------------------------------------------------- |
| Version        | 4.0.0-beta.463                                       |
| Dashboard      | http://195.201.177.66:8000                           |
| Data directory | /data/coolify/                                       |
| Env file       | /data/coolify/source/.env                            |
| Containers     | coolify, coolify-db, coolify-redis, coolify-realtime |

### Coolify Containers

| Container        | Status  | Ports           |
| ---------------- | ------- | --------------- |
| coolify          | healthy | 8000→8080       |
| coolify-db       | healthy | 5432 (internal) |
| coolify-redis    | healthy | 6379 (internal) |
| coolify-realtime | healthy | 6001-6002       |

### Hetzner Production Database (I2 / D2 — 2026-07-03)

Greenfield prod `gwth_v2` — the W7-era note about a `p48owok…` PG resource was
stale (that container never survived; W7's live verify actually ran against the
**P520 staging** DB `l08k8gwcscgssgwscoscwo8g`). Provisioned fresh, schema
applied **once** from a schema-only dump of the verified staging DB (W7
`lesson_progress` + W11 Better Auth `user` tables included — never re-authored).

| Setting          | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| Coolify resource | `gwth-v2-db-prod` (uuid `zo0gkcwoo0o4gow0go4cwk0o`)          |
| Image (pinned)   | `postgres:17.10-alpine` — matches P520 staging exactly       |
| Network          | `coolify` (internal) — **no published host port** (verified `ss -tlnp`) |
| User / DB        | `gwth` / `gwth_v2`                                           |
| Limits           | 2g memory / 2 CPUs, own volume `postgres-data-zo0gk…`        |
| Schema           | 24 public tables; `lesson_progress` FKs → `lessons` + `"user"` verified |
| Canary row       | `waitlist.email = backup-canary@gwth.internal` (known-row check for every restore drill — do not delete) |

**DATABASE_URL contract (prod).** Same as staging: the app reads `DATABASE_URL`
(runtime env, injected via Coolify env store on app `tw0cc8oc0w4scwoccs0cw0go`;
preview row auto-created by Coolify):

```
postgres://gwth:<password>@zo0gkcwoo0o4gow0go4cwk0o:5432/gwth_v2
```

The password lives **only** in SOPS (`deploy/secrets.production.env`,
age-encrypted) and the Coolify env store. `SUPABASE_*` keys are **retired**
(deleted from the env store 2026-07-03; zero remain anywhere in Coolify).
A fresh prod `BETTER_AUTH_SECRET` is minted and injected (unused by the current
build; live at the W6 cutover deploy).

### Backups & Tested Restore (I2 / D3)

| Leg | Mechanism | Schedule | State |
| --- | --------- | -------- | ----- |
| Primary dump | Coolify scheduled `pg_dump` (custom format) → `/data/coolify/backups/databases/root-team-0/gwth-v2-db-prod-zo0gk…/` | 03:00 daily, retain 7 | LIVE (backup id 1, first run success) |
| Offsite (R2) | Coolify S3 destination → Cloudflare R2 bucket `gwth-db-backups` | with primary | **BLOCKED on David**: create the R2 bucket + scoped token (Cloudflare dashboard → R2), then Coolify UI → Storages → add S3 (endpoint `https://<account-id>.r2.cloudflarestorage.com`), then on the DB backup set `save_s3 = true` |
| Backstop | P520 pull: `/home/david/backups/gwth-v2-db/pull.sh` — sudo-rsync dumps off-box, freshness gate (<26 h), restic snapshot `/home/david/backups/gwth-v2-db/restic-repo` (keep 14d/8w), key `/home/david/backups/restic-keys/gwth-v2-db.key` | 03:30 daily (P520 cron) | LIVE (snapshot `ce7365db` verified) |
| Dead-man | Kuma push monitor 4 → Telegram; pull.sh heartbeats **only after** a fresh dump is snapshotted, so a never-fired Coolify cron, a stale dump, or a failed pull all stop the heartbeat (alert ≤26 h) | 26 h window | LIVE |

**Restore drill (2026-07-03, gate PASSED):** Coolify `.dmp` → fresh throwaway
`postgres:17.10-alpine` container via `pg_restore`. Gate: (a) schema fingerprint
match with source (`pg_dump --schema-only`, ignoring pg17's random `\restrict`
token lines); (b) known-row: canary present; (c) **RTO ≈ 2 s restore / ~40 s
including container spin-up** at current (empty-data) size. Re-drill after real
content lands.

### Hetzner Applied Hardening Baseline (I2 / D8 — FULL public-grade delta, 2026-07-03)

The Feb-2026 breach-enabling gaps are now closed. Lockout-risky items D8 marks
post-launch (default-deny egress, `userland-proxy:false`, `icc:false`) remain deferred.

| Item | State |
| ---- | ----- |
| auditd | **ACTIVE**, `-e 1`, ruleset `/etc/audit/rules.d/gwth-prelaunch.rules` (identity, sudoers, sshd, pam, docker/ufw config, cron persistence, kernel modules, root-exec trail) — closes the #1 forensic gap |
| Egress logging | UFW `logging medium` (outbound/new-connection visibility — miner C2 would light up) |
| SSH | `PermitRootLogin no`; `AllowUsers david` (root **dropped**); modern algorithm set `/etc/ssh/sshd_config.d/99-gwth-algos.conf` (sntrup761x25519/curve25519 kex, AEAD ciphers, etm MACs); `LoginGraceTime 30`. ssh-audit: **6 fail / 9 warn → 0 / 0**. Applied watched, one change per reconnect, fresh-login verified each step, 10-min auto-revert net armed/disarmed per change |
| Docker daemon | `live-restore: true` (applied via SIGHUP first) + `no-new-privileges: true` (daemon restart; **all 19 containers survived**, gwth.ai stayed up apart from Traefik's ~seconds docker-provider reconnect) |
| Published-port reconcile | Traefik `:8080` (dead dashboard mapping, nothing listens) — DOCKER-USER DROP guard, persisted via `docker-user-rules.service`; Coolify realtime `:6001-2` kept (required by Coolify UI terminal/logs) and made intentional via commented UFW allow rules |
| CIS-reference score | Lynis hardening index **62 → 63** (before/after reports `/var/log/lynis-report.{BEFORE,AFTER}-i2.dat`); big wins (auditd, SSH) show in ssh-audit + closed gaps rather than Lynis' weighting of deferred post-launch items |

### Rollback Procedure (I2 — feeds W6 runbook)

Coolify retains previous app images on-box (verified: 2 images for
`tw0cc8oc0w4scwoccs0cw0go`, e.g. `…:376d434…` currently live).

1. **UI path (preferred):** Coolify → My first project → production →
   GWTH v2 → **Deployments** → pick the last good deployment → **Rollback**
   (instant — restarts from the retained image, no rebuild).
2. **Headless path** (Coolify web terminal → `coolify` container, or
   `ssh hetzner 'docker exec coolify php artisan tinker …'`):

   ```php
   use App\Models\Application;
   use App\Models\ApplicationDeploymentQueue;
   $app = Application::where('uuid','tw0cc8oc0w4scwoccs0cw0go')->first();
   $q = ApplicationDeploymentQueue::create([
     'application_id' => $app->id,
     'deployment_uuid' => Illuminate\Support\Str::uuid()->toString(),
     'commit' => '<last-good-sha>',   // e.g. 376d434287a78ecb3dd28f37a064d182eba785ba
     'rollback' => true,              // true = instant image restart, false = rebuild at that commit
     'force_rebuild' => false,
     'status' => 'queued',
     'is_webhook' => false,
     'server_id' => $app->destination->server->id,
   ]);
   dispatch(new App\Jobs\ApplicationDeploymentJob($q->id));
   ```
3. **DB rollback** (only if a migration must be reversed): restore the newest
   dump per the drill above into a scratch DB, verify, then swap — never
   restore over the live DB blind.
4. Verify: `curl -s https://gwth.ai/api/health` → 200, then Kuma monitors green.

Dry-checked 2026-07-03: retained images present, `rollback`/`commit` queue
columns confirmed on beta.463. (**Do not** run an actual rollback casually —
both retained images are 3-month-old pre-W7 builds.)

### Secrets (I2 / D9)

- Canonical store: **SOPS + age** in git — `deploy/secrets.production.env`
  (app runtime: `DATABASE_URL`, `BETTER_AUTH_SECRET`, …) and
  `deploy/secrets.hetzner-ops.env` (Coolify/Kuma/Plausible ops creds + the
  **new** Coolify API token `claude-i2-2026-07-03`; the old `claude-deploy`
  token was already invalidated by the beta.463 upgrade). Age key:
  `~/.config/sops/age/keys.txt` on hlab — **back up to Vaultwarden**.
- Plaintext `docs/connection-secrets.md` **DELETED** (2026-07-03; never in git
  history — verified). Hetzner-side plaintext DB password file deleted.
- **Rotation still owed (David, external dashboards):** Google OAuth secret,
  GitHub OAuth secret, Stripe live keys + webhook, MailerSend, MailerLite —
  the Feb-compromise set (see `docs/old-site/env-reference.md`). Everything
  born since (DB password, Coolify token, BETTER_AUTH_SECRET) is fresh today.

### Monitoring (I2 / D10)

- Kuma monitors 1–3 (gwth.ai `/api/health`, status page, Plausible) confirmed,
  cert-expiry alerts on, Telegram notification attached.
- **Monitor 4 (new):** `GWTH v2 DB backup dead-man (P520 pull)` — push type,
  26 h window, heartbeat from `pull.sh`.
- **External watcher (new, launch-blocking):** P520 cron
  `/home/david/gwth-hetzner-watch.sh` every 5 min →
  `https://gwth.ai/api/health` + `https://status.gwth.ai`, Telegram alerts on
  state change (token sourced from `~/.gwth-telegram.env`, not hardcoded).
  Survives a full Hetzner outage.
- Gap (website task): `/api/health` is currently shallow (no DB/disk check) —
  D10 rider 1 wants it deep once the Better-Auth build deploys.

---

## Server: P520 Dev/Test

| Setting        | Value                      |
| -------------- | -------------------------- |
| Hostname       | hlab                       |
| IP (Tailscale) | 100.79.248.39              |
| IP (LAN)       | 192.168.178.50             |
| SSH Port       | 22                         |
| SSH Key        | ~/.ssh/p520_ed25519        |
| RAM            | 125 GB                     |
| Disk           | 3.6 TB NVMe                |
| Coolify        | http://192.168.178.50:8000 |
| GWTH v2 Test   | http://192.168.178.50:3001 |

### P520 GWTH v2 App (Coolify)

| Setting      | Value                               |
| ------------ | ----------------------------------- |
| App UUID     | `xw4csk0ssos8800kws0cswwk`          |
| GitHub Repo  | `David-ACG/gwth-v2` (public, HTTPS) |
| Branch       | master                              |
| Build Pack   | Dockerfile                          |
| Base Dir     | `/`                                 |
| Health Check | `GET /api/health`                   |
| Port         | 3001 → 3000                         |
| Status       | Coolify app record `exited`; :3001 is served by a hand-run image (below) |

> **Topology note (I1, updated 2026-06-23):** the live `:3001` is **not** the
> Coolify app record — it is a hand-run container `gwth-v2-w8-beta` redeployed via
> `GWTH_V2/deploy/run-staging.sh`. It now runs the **current HEAD build**
> (`gwth-v2:staging`, rebuilt 2026-06-23) — wired to the staging DB, dead Supabase
> env dropped. It serves cleanly: `/` `200`, `/dashboard` `307`-redirects via Better
> Auth (no Supabase crash), **no Supabase error noise in logs**. DB-backed dashboard
> reads activate once a Better Auth user logs in. Some data modules
> (news/credentials) still *import* Supabase in code — full de-Supabase is a code
> refactor (W-track), not a rebuild.

### P520 GWTH v2 Staging Database (I1 / D1 / D2)

Dedicated, **internal-only** Postgres for the `:3001` test instance — Coolify-managed,
**never** another project's DB, **no public port**.

| Setting          | Value                                                          |
| ---------------- | -------------------------------------------------------------- |
| Coolify resource | `gwth-v2-staging-db` (uuid `l08k8gwcscgssgwscoscwo8g`)         |
| Image (pinned)   | `postgres:17.10-alpine` (digest `sha256:dc17045c…`) — matches prod PG 17.10, **not** a floating tag |
| Network          | `coolify` (internal) — **no published host port**             |
| User / DB        | `gwth` / `gwth_v2`                                             |
| Schema applied   | Drizzle via `drizzle-kit push` (D1 — no `_prisma_migrations`); 22 tables + `news_articles_ranked` view, identical column set to dev |
| Scoping          | per-user filter centralised in `src/lib/data/*.ts` (`currentUserId()`); **no DB RLS** (D2) — tested in `src/lib/data/progress.db.test.ts` |
| Legacy roles     | inert `anon`/`authenticated`/`service_role` (NOLOGIN) created only to satisfy introspected Supabase GRANTs — drop when schema is re-introspected post-Supabase |

**DATABASE_URL contract.** The app reads `DATABASE_URL` and **mock-falls-back when it is unset**
(`src/db/index.ts` throws if a DB op runs without it; `src/lib/data/*.ts` gate on
`isDbConfigured()`). The staging URL is **internal-network only**:

```
postgres://gwth:<password>@l08k8gwcscgssgwscoscwo8g:5432/gwth_v2
```

The password lives **only** in SOPS (`GWTH_V2/deploy/secrets.staging.env`, age-encrypted) and the
running container env — never in plaintext in the repo. Deploy/redeploy with
`./deploy/run-staging.sh` (decrypts secrets to a 0600 tmpfile, shredded on exit).

**Backups (I1 step 3).** Coolify scheduled `pg_dump` (gzip logical), daily `0 3 * * *`,
**local-only**, retain 7. Restore-drill-verified (both the manual gzip dump and the Coolify
`.dmp` restore into a scratch DB with 0 errors). **Deferred to I3:** the Cloudflare R2 offsite
copy and the D10 backup dead-man monitor (both gated on the R2 bucket, not yet provisioned).

### P520 Applied Hardening Baseline (I1 / D8 — LIGHT, LAN+Tailscale)

hlab is a **local dev box** — the public-grade lockdown (key-only SSH, egress controls,
immutable audit) is reserved for the **Hetzner** box, a separate task. Applied here:

| Item        | State                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| Patching    | `apt full-upgrade` applied (Docker engine pkgs **held** — bounce all containers; deferred to a David-scheduled window with the kernel reboot 6.8.0-117 → -124). Unattended-upgrades on, auto-reboot off. |
| auditd      | installed + enabled; light forensic ruleset `/etc/audit/rules.d/i1-hardening.rules` (identity, sudoers, sshd, docker, priv-esc) |
| SSH (:22)   | `/etc/ssh/sshd_config.d/99-hardening.conf` — modern Kex/Ciphers/MACs, `MaxAuthTries 4`, `X11Forwarding no`, `PermitRootLogin prohibit-password`. **Password auth intentionally LEFT ENABLED** (dev box). Pubkey login re-verified through the new config. |
| Docker      | `daemon.json` + `no-new-privileges: true`, `live-restore: true` (applied via reload — zero container bounce; keeps containers up across future daemon restarts) |
| CIS audit   | Lynis hardening index **61 → 63** (`lynis audit system`)                 |
| Secrets     | SOPS + age adopted (`~/.config/sops/age/keys.txt`, 0600 — **back up to Vaultwarden**); staging DB credential generated fresh; app secrets sourced from the encrypted store. Legacy plaintext credential files flagged for source-rotation (see I1 completion packet). |

---

## DNS Configuration

| Domain            | Points To      | Purpose            | Status                                   |
| ----------------- | -------------- | ------------------ | ---------------------------------------- |
| gwth.ai           | 195.201.177.66 | Main website       | DNS configured, app deployed, SSL active |
| video.gwth.ai     | 195.201.177.66 | HLS video delivery | DNS configured, app not deployed         |
| status.gwth.ai    | 195.201.177.66 | Uptime Kuma        | DNS configured, app deployed, SSL active |
| analytics.gwth.ai | 195.201.177.66 | Plausible          | DNS configured, app deployed, SSL active |

---

## Deployed Services

| Service           | Image                                    | Port | Domain                    | Status           |
| ----------------- | ---------------------------------------- | ---- | ------------------------- | ---------------- |
| GWTH v2 (Next.js) | Built from Dockerfile                    | 3000 | https://gwth.ai           | Running, healthy |
| Uptime Kuma       | louislam/uptime-kuma:2                   | 3001 | https://status.gwth.ai    | Running, healthy |
| Plausible CE      | ghcr.io/plausible/community-edition:v2.1 | 8000 | https://analytics.gwth.ai | Running, healthy |

### GWTH v2 App (Coolify)

| Setting       | Value                                       |
| ------------- | ------------------------------------------- |
| App UUID      | `tw0cc8oc0w4scwoccs0cw0go`                  |
| Project UUID  | `gswck0c4ksoo0cwc4skg8w40`                  |
| Environment   | production (`yskwskcwosooggskko0okcgo`)     |
| GitHub Repo   | `David-ACG/gwth-v2` (public)                |
| Branch        | master                                      |
| Build Pack    | Dockerfile                                  |
| Health Check  | `GET /api/health` (30s interval)            |
| Reverse Proxy | Traefik (auto-configured by Coolify)        |
| SSL           | Let's Encrypt (auto-provisioned by Traefik) |

### Deploy Command

```bash
curl -s "http://195.201.177.66:8000/api/v1/deploy?uuid=tw0cc8oc0w4scwoccs0cw0go&force=false" \
  -H "Authorization: Bearer <COOLIFY_TOKEN>"
```

### Uptime Kuma (Coolify Service)

| Setting      | Value                                 |
| ------------ | ------------------------------------- |
| Service UUID | `i0owos0o4gosogg4kskgw8cg`            |
| Image        | louislam/uptime-kuma:2                |
| Domain       | https://status.gwth.ai                |
| Managed by   | Coolify (one-click service)           |
| Database     | SQLite                                |
| Data         | Docker volume (auto-managed)          |
| Status page  | https://status.gwth.ai/status/default |

**Monitors configured:**

| Monitor                                 | URL                        | Interval | Retries |
| --------------------------------------- | -------------------------- | -------- | ------- |
| GWTH v2 (gwth.ai)                       | https://gwth.ai/api/health | 60s      | 3       |
| Uptime Kuma (status.gwth.ai)            | https://status.gwth.ai     | 60s      | 3       |
| Plausible Analytics (analytics.gwth.ai) | https://analytics.gwth.ai  | 60s      | 3       |

All monitors have certificate expiry and domain expiry notifications enabled.

### Plausible CE (Docker Compose — outside Coolify)

| Setting      | Value                                                         |
| ------------ | ------------------------------------------------------------- |
| Compose file | `/data/plausible/docker-compose.yml`                          |
| Env file     | `/data/plausible/plausible.env`                               |
| Domain       | https://analytics.gwth.ai                                     |
| Routing      | Traefik labels (in compose, `traefik.docker.network=coolify`) |
| PostgreSQL   | plausible-plausible-db-1 (postgres:16-alpine)                 |
| ClickHouse   | plausible-plausible-events-db-1 (clickhouse:24.3-alpine)      |
| Registration | invite_only                                                   |
| Site domain  | gwth.ai (timezone: Europe/Berlin)                             |
| Tracking     | `script.outbound-links.js` (outbound links + 404 tracking)    |

**Manage Plausible:**

```bash
# Start/stop
ssh hetzner 'cd /data/plausible && docker compose up -d'
ssh hetzner 'cd /data/plausible && docker compose down'

# View logs
ssh hetzner 'docker logs plausible-plausible-1 --tail 50'
```

## Services to Deploy (TODO)

| Service     | Image        | Port                  | Status                                            |
| ----------- | ------------ | --------------------- | ------------------------------------------------- |
| Nginx Video | nginx:alpine | 443 (video subdomain) | Not deployed (deferred until video content ready) |

---

## Build Log

| Date       | Action                                                                   | Result |
| ---------- | ------------------------------------------------------------------------ | ------ |
| 2026-02-21 | VM created in Proxmox (800 GB, 32 GB RAM, 16 cores)                      | OK     |
| 2026-02-21 | Ubuntu 24.04 LTS installed                                               | OK     |
| 2026-02-21 | SSH key auth configured                                                  | OK     |
| 2026-02-21 | Passwordless sudo for david                                              | OK     |
| 2026-02-21 | apt update/upgrade + base packages                                       | OK     |
| 2026-02-21 | LVM extended 98 GB → 785 GB                                              | OK     |
| 2026-02-21 | SSH hardened: port 111, key-only, root key-only (for Coolify)            | OK     |
| 2026-02-21 | UFW enabled: 111, 80, 443, 8000                                          | OK     |
| 2026-02-21 | Fail2ban configured for SSH                                              | OK     |
| 2026-02-21 | Unattended security upgrades enabled                                     | OK     |
| 2026-02-21 | Docker 29.2.1 installed                                                  | OK     |
| 2026-02-21 | Coolify 4.0.0-beta.463 installed                                         | OK     |
| 2026-02-21 | Coolify onboarding completed (localhost server)                          | OK     |
| 2026-02-21 | Coolify API enabled + token created (deploy/read/write)                  | OK     |
| 2026-02-22 | GWTH v2 app created in Coolify (Dockerfile build, public GitHub)         | OK     |
| 2026-02-22 | First successful deployment to https://gwth.ai                           | OK     |
| 2026-02-22 | Health check verified: GET /api/health returns 200                       | OK     |
| 2026-02-22 | SSL cert verified: Let's Encrypt R12, valid to 2026-05-22                | OK     |
| 2026-02-22 | HTTP→HTTPS redirect verified (307)                                       | OK     |
| 2026-02-22 | P520 GWTH v2 app updated to gwth-v2 repo, deployed successfully          | OK     |
| 2026-02-22 | Uptime Kuma deployed (Coolify service, status.gwth.ai)                   | OK     |
| 2026-02-22 | Plausible CE deployed (docker-compose, analytics.gwth.ai)                | OK     |
| 2026-02-22 | DNS A records added for status.gwth.ai and analytics.gwth.ai (Namecheap) | OK     |
| 2026-02-22 | SSL certs verified for status.gwth.ai (R12) and analytics.gwth.ai (R13)  | OK     |
| 2026-02-22 | Plausible Gateway Timeout fixed (added traefik.docker.network=coolify)   | OK     |
| 2026-02-22 | Uptime Kuma setup: SQLite DB, admin account, 3 monitors, public page     | OK     |
| 2026-02-22 | Plausible setup: admin account, gwth.ai site, outbound links + 404       | OK     |
| 2026-02-22 | Plausible tracking script added to GWTH v2 root layout, deployed         | OK     |
| 2026-02-22 | First pageview verified in Plausible dashboard                           | OK     |
| 2026-07-03 | I2: prod DB `gwth-v2-db-prod` (PG 17.10, internal-only) + schema from verified staging dump | OK |
| 2026-07-03 | I2: DATABASE_URL injected into gwth.ai app; SUPABASE_\* retired from Coolify env store | OK |
| 2026-07-03 | I2: nightly Coolify pg_dump (03:00) + P520 restic backstop (03:30) + Kuma dead-man; restore drill gate PASSED (RTO ~2 s) | OK |
| 2026-07-03 | I2: auditd active (-e 1, forensic ruleset); UFW logging medium (egress visibility) | OK |
| 2026-07-03 | I2: SSH root login disabled + AllowUsers david only + modern algos (ssh-audit 6 fail → 0); watched, revert-net protocol | OK |
| 2026-07-03 | I2: Docker live-restore + no-new-privileges (19/19 containers survived restart); :8080 DOCKER-USER guard; :6001-2 documented | OK |
| 2026-07-03 | I2: SOPS prod + ops stores committed; plaintext connection-secrets.md deleted; new Coolify API token | OK |
| 2026-07-03 | I2: external P520→Hetzner watcher (5-min cron → Telegram); rollback procedure documented + dry-checked | OK |
| 2026-07-03 | PENDING (David): R2 bucket `gwth-db-backups` + scoped token → flip backup `save_s3`; external-SaaS key rotations | TODO |
