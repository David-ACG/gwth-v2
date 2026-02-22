# GWTH v2 — Infrastructure Configuration

> Living document. Updated as infrastructure is built.
>
> Last updated: 2026-02-22

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
| Status       | Running, healthy                    |

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

| Setting      | Value                        |
| ------------ | ---------------------------- |
| Service UUID | `i0owos0o4gosogg4kskgw8cg`   |
| Image        | louislam/uptime-kuma:2       |
| Domain       | https://status.gwth.ai       |
| Managed by   | Coolify (one-click service)  |
| Data         | Docker volume (auto-managed) |

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
