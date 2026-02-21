# GWTH v2 — Infrastructure Configuration

> Living document. Updated as infrastructure is built.
>
> Last updated: 2026-02-21

---

## Server: Hetzner Production (ACG-GWTHPROD-105)

### Hardware (Proxmox VM)

| Resource | Value |
|----------|-------|
| VM ID | 105 |
| VM Name | ACG-GWTHPROD-105 |
| Proxmox Host | ACG-Proxmox1 |
| CPU | 16 cores, x86-64-v2-AES, 1 socket |
| RAM | 32 GB |
| Disk | 800 GB ZFS (iothread=on) |
| LVM | ubuntu-vg/ubuntu-lv extended to 785 GB usable |
| Network | virtio, bridge=vmbr0, firewall=1 |
| QEMU Agent | enabled |
| Auto-start | on boot |

### Operating System

| Setting | Value |
|---------|-------|
| OS | Ubuntu 24.04.4 LTS |
| Kernel | 6.8.0-100-generic |
| Hostname | acg-gwthprod-105 |
| Public IP | 195.201.177.66 |

### SSH Configuration

| Setting | Value |
|---------|-------|
| Port | 111 |
| Auth | Public key only (password disabled) |
| Root login | Disabled |
| Max auth tries | 3 |
| Allowed users | david |
| Config file | `/etc/ssh/sshd_config.d/00-hardened.conf` |
| Socket override | `/lib/systemd/system/ssh.socket` (ListenStream=111) |

### Firewall (UFW)

| Port | Protocol | Purpose |
|------|----------|---------|
| 111 | TCP | SSH |
| 80 | TCP | HTTP (Coolify/Traefik) |
| 443 | TCP | HTTPS (Coolify/Traefik) |
| 8000 | TCP | Coolify dashboard |

Default: deny incoming, allow outgoing.

### Fail2ban

| Setting | Value |
|---------|-------|
| Jail | sshd |
| Port | 111 |
| Max retries | 5 |
| Find time | 600s |
| Ban time | 3600s |
| Ban action | ufw |
| Config | `/etc/fail2ban/jail.local` |

### Unattended Upgrades

| Setting | Value |
|---------|-------|
| Enabled | Yes |
| Security origins | Ubuntu noble, noble-security, ESM |
| Auto-reboot | No (manual reboot required) |
| Auto-clean interval | 7 days |
| Remove unused kernels | Yes |
| Remove unused deps | Yes |

### Docker

| Setting | Value |
|---------|-------|
| Version | 29.2.1 |
| User access | david (docker group) |
| Install method | get.docker.com |

### Coolify

| Setting | Value |
|---------|-------|
| Version | 4.0.0-beta.463 |
| Dashboard | http://195.201.177.66:8000 |
| Data directory | /data/coolify/ |
| Env file | /data/coolify/source/.env |
| Containers | coolify, coolify-db, coolify-redis, coolify-realtime |

### Coolify Containers

| Container | Status | Ports |
|-----------|--------|-------|
| coolify | healthy | 8000→8080 |
| coolify-db | healthy | 5432 (internal) |
| coolify-redis | healthy | 6379 (internal) |
| coolify-realtime | healthy | 6001-6002 |

---

## Server: P520 Dev/Test

| Setting | Value |
|---------|-------|
| Hostname | (existing) |
| IP (Tailscale) | 100.79.248.39 |
| IP (LAN) | 192.168.178.50 |
| SSH Port | 22 |
| SSH Key | ~/.ssh/p520_ed25519 |
| RAM | 125 GB |
| Disk | 3.6 TB NVMe |
| Coolify | http://192.168.178.50:8000 |
| GWTH Test App | http://192.168.178.50:3001 |

---

## DNS Configuration

| Domain | Points To | Purpose | Status |
|--------|----------|---------|--------|
| gwth.ai | 195.201.177.66 | Main website | DNS configured, app not deployed |
| video.gwth.ai | 195.201.177.66 | HLS video delivery | DNS configured, app not deployed |
| status.gwth.ai | 195.201.177.66 | Uptime Kuma | Not configured |
| analytics.gwth.ai | 195.201.177.66 | Plausible | Not configured |

---

## Services to Deploy (TODO)

| Service | Image | Port | Status |
|---------|-------|------|--------|
| Next.js App | Built from repo | 3000 | Not deployed |
| Nginx Video | nginx:alpine | 443 (video subdomain) | Not deployed |
| Uptime Kuma | louislam/uptime-kuma:1 | 3001 | Not deployed |
| Plausible | ghcr.io/plausible/community-edition:v2 | 8008 | Not deployed |

---

## Build Log

| Date | Action | Result |
|------|--------|--------|
| 2026-02-21 | VM created in Proxmox (800 GB, 32 GB RAM, 16 cores) | OK |
| 2026-02-21 | Ubuntu 24.04 LTS installed | OK |
| 2026-02-21 | SSH key auth configured | OK |
| 2026-02-21 | Passwordless sudo for david | OK |
| 2026-02-21 | apt update/upgrade + base packages | OK |
| 2026-02-21 | LVM extended 98 GB → 785 GB | OK |
| 2026-02-21 | SSH hardened: port 111, key-only, no root | OK |
| 2026-02-21 | UFW enabled: 111, 80, 443, 8000 | OK |
| 2026-02-21 | Fail2ban configured for SSH | OK |
| 2026-02-21 | Unattended security upgrades enabled | OK |
| 2026-02-21 | Docker 29.2.1 installed | OK |
| 2026-02-21 | Coolify 4.0.0-beta.463 installed | OK |
