# Infrastructure & Deployment

> Server topology, VM configuration, Coolify setup, networking, backups, and monitoring for GWTH v2.
>
> Last updated: 2026-02-19

---

## Table of Contents

1. [Server Topology](#1-server-topology)
2. [Hetzner Production VM](#2-hetzner-production-vm)
3. [P520 Dev/Test VM](#3-p520-devtest-vm)
4. [Coolify Configuration](#4-coolify-configuration)
5. [Networking & DNS](#5-networking--dns)
6. [Docker Architecture](#6-docker-architecture)
7. [Backup Strategy](#7-backup-strategy)
8. [Monitoring Stack](#8-monitoring-stack)
9. [Security Hardening](#9-security-hardening)

---

## 1. Server Topology

```mermaid
graph TB
    subgraph "Internet"
        Users[Users UK/EU]
        GH[GitHub]
        Services[Managed Services<br/>Supabase, Stripe, Resend,<br/>MailerLite, Sentry]
    end

    subgraph "Hetzner Dedicated Server (Germany)"
        subgraph "Proxmox Host (128 GB RAM)"
            subgraph "GWTH Production VM (64 GB RAM)"
                direction TB
                CoolifyProd[Coolify Manager :8000]
                NextProd[Next.js App :3000]
                NginxVideo[Nginx Video :443]
                KumaProd[Uptime Kuma :3001]
                PlausibleProd[Plausible :8008]
            end
            OtherVMs[Other Proxmox VMs]
        end
    end

    subgraph "P520 Local Server (Home, 128 GB RAM)"
        subgraph "KVM VM (64 GB RAM)"
            CoolifyDev[Coolify Dev :8000]
            NextDev[Next.js Dev :3000]
            NginxDev[Nginx Video Dev :8443]
            KumaDev[Uptime Kuma Dev :3001]
        end
        subgraph "Pipeline VM (existing)"
            Pipeline[GWTH Pipeline :8088<br/>FFmpeg + TTS + Whisper]
        end
    end

    Users --> NextProd
    Users --> NginxVideo
    GH -->|Actions + Webhook| CoolifyProd
    GH -->|Actions + Webhook| CoolifyDev
    NextProd --> Services
    Pipeline -->|rsync HLS segments| NginxVideo
    Pipeline -->|API sync lessons| Services
```

---

## 2. Hetzner Production VM

### Resource Allocation

| Resource | Allocation | Notes |
|----------|-----------|-------|
| RAM | 64 GB | More than sufficient. Next.js standalone uses ~256-512 MB. Nginx, Kuma, Plausible are lightweight. |
| CPU | 8 cores (from host) | Adjust based on Proxmox host total. 4 cores minimum. |
| Disk | 1.5-2 TB (from 3.6 TB host) | 50 GB OS + containers, ~720 GB video HLS files (all 3 qualities), remainder for backups and growth. |
| Network | Host bridge | Full host network speed. |

### Operating System

- **Ubuntu 24.04 LTS Server** (matches existing infrastructure)
- Unattended security updates enabled
- UFW firewall configured

### Initial Setup Checklist

```bash
# 1. Create VM in Proxmox
# 2. Install Ubuntu 24.04 LTS
# 3. Basic hardening
sudo apt update && sudo apt upgrade -y
sudo apt install -y ufw fail2ban curl git

# 4. Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Coolify redirects to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8000/tcp  # Coolify dashboard
sudo ufw enable

# 5. Install Docker (required by Coolify)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 6. Install Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# 7. Configure SSH key access (disable password auth)
# Add P520 and local machine SSH public keys to authorized_keys
```

---

## 3. P520 Dev/Test VM

### Resource Allocation

| Resource | Allocation | Notes |
|----------|-----------|-------|
| RAM | 64 GB | Generous for dev. Shares host with Pipeline VM. |
| CPU | 8 cores | From host's total. |
| Disk | 1.5-2 TB (from 3.6 TB host) | Mirrors production video library. Shared host with Pipeline VM. |
| Network | Bridge to host | Accessible at 192.168.178.50 (or dedicated IP on KVM bridge). |

### Purpose

- **Staging environment** — mirrors production for pre-deploy testing
- **Integration testing** — test Supabase, Stripe (test mode), and video delivery
- **Pipeline testing** — content sync from Pipeline VM to dev website

### Coolify Dev Configuration

Mirrors production but with:
- Supabase project: separate dev project (free tier allows 2 projects)
- Stripe: test mode keys
- Video: points to dev HLS directory
- Email: Resend test mode (emails caught, not sent)

---

## 4. Coolify Configuration

### Services to Deploy

| Service | Image | Port | Persistent Volume |
|---------|-------|------|-------------------|
| **Next.js App** | Built from repo (`output: standalone`) | 3000 | None (stateless) |
| **Nginx Video** | `nginx:alpine` | 443 (video subdomain) | `/var/www/gwth-videos` |
| **Uptime Kuma** | `louislam/uptime-kuma:1` | 3001 | `/data` (SQLite DB) |
| **Plausible** | `ghcr.io/plausible/community-edition:v2` | 8008 | `/data` (ClickHouse + Postgres) |

### Next.js Deployment via Coolify

1. **Source:** GitHub repo `David-ACG/gwth-v2` (or similar)
2. **Build:** Dockerfile (Next.js standalone output)
3. **Environment variables:** Set in Coolify dashboard (never in code)
4. **Deploy trigger:** Coolify webhook called by GitHub Actions on `master` push
5. **Health check:** `GET /api/health` returns 200

### Dockerfile

```dockerfile
# Multi-stage build for Next.js standalone
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Coolify Deploy Commands

**Production (Hetzner):**
```bash
# Trigger deploy via API (same as CLAUDE.md)
curl -s "http://195.201.177.66:8000/api/v1/deploy?uuid=<APP_UUID>&force=false" \
  -H "Authorization: Bearer <COOLIFY_TOKEN>"
```

**Dev/Test (P520):**
```bash
# Via SSH tinker (same as CLAUDE.md)
ssh p520 'docker exec coolify php artisan tinker --execute="..."'
```

---

## 5. Networking & DNS

### Domain Configuration

| Domain | Points To | Purpose |
|--------|----------|---------|
| `gwth.ai` | Hetzner IP (Coolify reverse proxy) | Main website |
| `video.gwth.ai` | Hetzner IP (Nginx) | HLS video delivery |
| `status.gwth.ai` | Hetzner IP (Uptime Kuma) | Public status page |
| `analytics.gwth.ai` | Hetzner IP (Plausible) | Self-hosted analytics |

### SSL/TLS

- **Coolify handles SSL** via Let's Encrypt auto-renewal for all services
- All traffic is HTTPS-only (HTTP redirects to HTTPS)
- Video subdomain gets its own certificate

### Coolify Reverse Proxy

Coolify uses Traefik (or Caddy, depending on version) as a reverse proxy:

```
gwth.ai:443          → Next.js container :3000
video.gwth.ai:443    → Nginx container :80 (internal)
status.gwth.ai:443   → Uptime Kuma container :3001
analytics.gwth.ai:443 → Plausible container :8008
```

---

## 6. Docker Architecture

```mermaid
graph TB
    subgraph "Coolify Network (Production)"
        Traefik[Traefik Reverse Proxy<br/>:80, :443]

        NextJS[Next.js Standalone<br/>:3000<br/>256-512 MB RAM]
        Nginx[Nginx Video Server<br/>:80 internal<br/>64 MB RAM]
        Kuma[Uptime Kuma<br/>:3001<br/>128 MB RAM]
        Plausible[Plausible CE<br/>:8008<br/>512 MB RAM]
        ClickHouse[ClickHouse<br/>Plausible backend<br/>512 MB RAM]
        PlausibleDB[Postgres 14<br/>Plausible metadata<br/>256 MB RAM]
    end

    subgraph "Volumes"
        V1[/var/www/gwth-videos<br/>HLS segments]
        V2[/data/uptime-kuma<br/>SQLite]
        V3[/data/plausible<br/>ClickHouse data]
    end

    Traefik --> NextJS
    Traefik --> Nginx
    Traefik --> Kuma
    Traefik --> Plausible
    Plausible --> ClickHouse
    Plausible --> PlausibleDB
    Nginx --> V1
    Kuma --> V2
    ClickHouse --> V3
```

### Total Resource Usage (Production)

| Container | RAM | CPU (typical) |
|-----------|-----|---------------|
| Traefik | 64 MB | <1% |
| Next.js | 512 MB | 2-5% |
| Nginx | 64 MB | <1% |
| Uptime Kuma | 128 MB | <1% |
| Plausible + ClickHouse + Postgres | 1,280 MB | 1-3% |
| **Total** | **~2 GB** | **<10%** |

**64 GB VM is vastly oversized for current needs.** This is intentional — leaves headroom for growth, video transcoding, and additional services. Consider starting with 16-32 GB and scaling up.

---

## 7. Backup Strategy

### Architecture

```mermaid
flowchart LR
    subgraph "Hetzner Production"
        A[Proxmox VM Snapshot]
        B[Docker Volumes]
    end

    subgraph "Backup Targets"
        C[Proxmox Backup Server<br/>on P520 10TB SATA]
        D[Supabase<br/>Auto daily backup]
    end

    A -->|"Daily VM snapshot<br/>via Proxmox"| C
    B -->|"rsync volumes<br/>via SSH"| C
    D -->|"Built-in PITR<br/>(Pro tier)"| D
```

### Database Backups

| What | How | Frequency | Retention | Stored On |
|------|-----|-----------|-----------|-----------|
| **Supabase DB** (free tier) | Manual `pg_dump` via cron | Daily | 30 days | P520 10TB SATA |
| **Supabase DB** (Pro tier) | Built-in daily + 7-day PITR | Automatic | 7 days PITR | Supabase cloud |
| **Video HLS files** | rsync from Hetzner to P520 | After each deploy | Indefinite | P520 10TB SATA |
| **Docker volumes** | rsync from Hetzner to P520 | Daily | 30 days | P520 10TB SATA |

### Proxmox Backup Server

- **Already planned** by the user
- Runs on P520, backs up both P520 VMs and Hetzner VMs
- Hetzner VM backed up via Proxmox Backup Client over SSH tunnel
- Schedule: daily incremental, weekly full
- Retention: 30 daily, 4 weekly, 3 monthly

### Supabase Database Backup Script

```bash
#!/bin/bash
# backup-supabase.sh — Daily Supabase database backup
# Run via cron on P520: 0 3 * * * /opt/scripts/backup-supabase.sh

BACKUP_DIR="/mnt/backup/supabase"
DATE=$(date +%Y%m%d_%H%M%S)
SUPABASE_DB_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"

mkdir -p "$BACKUP_DIR"

# Dump database
pg_dump "$SUPABASE_DB_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  -f "$BACKUP_DIR/gwth_v2_$DATE.dump"

# Compress
gzip "$BACKUP_DIR/gwth_v2_$DATE.dump"

# Retain last 30 days
find "$BACKUP_DIR" -name "*.dump.gz" -mtime +30 -delete

echo "$(date): Backup completed — gwth_v2_$DATE.dump.gz" >> "$BACKUP_DIR/backup.log"
```

---

## 8. Monitoring Stack

### Overview

| Tool | What It Monitors | Alerts Via |
|------|-----------------|-----------|
| **Sentry** | Runtime errors, performance, session replays | Email + Telegram (via webhook) |
| **Uptime Kuma** | Endpoint availability, response times | Telegram |
| **Plausible** | Traffic, conversions, referrers | Dashboard only (no alerts) |
| **Coolify** | Container health, resource usage | Built-in notifications |
| **Stripe Dashboard** | Payment success rates, MRR, churn | Email |

### Sentry Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,        // 10% of requests for performance
  replaysSessionSampleRate: 0,   // No session replays on free tier
  replaysOnErrorSampleRate: 1.0, // 100% replay on errors
})
```

### Uptime Kuma Monitors

Configure via the Uptime Kuma web UI after deployment:

| Monitor | Type | URL/Host | Interval | Expected |
|---------|------|----------|----------|----------|
| Website | HTTP(s) | `https://gwth.ai` | 60s | 200 |
| API Health | HTTP(s) | `https://gwth.ai/api/health` | 60s | 200 + JSON |
| Video Server | HTTP(s) | `https://video.gwth.ai/health` | 60s | 200 |
| Supabase | TCP Port | `db.PROJECT.supabase.co:5432` | 300s | Open |
| P520 Pipeline | HTTP(s) | `http://192.168.178.50:8088/health` | 300s | 200 |

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const checks: Record<string, string> = {}

  // Database connectivity
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    checks.database = error ? 'unhealthy' : 'healthy'
  } catch {
    checks.database = 'unreachable'
  }

  const allHealthy = Object.values(checks).every(v => v === 'healthy')

  return Response.json(
    { status: allHealthy ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allHealthy ? 200 : 503 }
  )
}
```

---

## 9. Security Hardening

### Server Level

| Measure | Implementation |
|---------|---------------|
| **SSH key only** | Disable password auth in `/etc/ssh/sshd_config` |
| **Non-standard SSH port** | Hetzner uses port 111 (already configured) |
| **Fail2ban** | Auto-ban IPs after 5 failed SSH attempts |
| **UFW firewall** | Only ports 22, 80, 443, 8000 open |
| **Unattended upgrades** | Auto-install security patches |
| **Docker security** | Non-root container users, read-only filesystems where possible |

### Application Level

| Measure | Implementation |
|---------|---------------|
| **HTTPS everywhere** | Coolify/Traefik handles TLS termination with Let's Encrypt |
| **Security headers** | CSP, X-Frame-Options, X-Content-Type-Options via Next.js config |
| **Rate limiting** | Nginx rate limiting on video endpoints, Next.js rate limiting on API routes |
| **Input validation** | Zod schemas on all API inputs (already in `lib/validations.ts`) |
| **SQL injection** | Prevented by Supabase parameterised queries (never raw SQL with user input) |
| **XSS** | React auto-escapes by default. CSP headers. No `dangerouslySetInnerHTML` with user content. |
| **CSRF** | Supabase Auth uses httpOnly cookies with SameSite=Lax |

### Secrets Management

| Secret | Where Stored | Who Has Access |
|--------|-------------|---------------|
| Supabase keys | Coolify env vars | Coolify dashboard only |
| Stripe keys | Coolify env vars | Coolify dashboard only |
| Video signing secret | Coolify env vars | Coolify dashboard only |
| Resend API key | Coolify env vars | Coolify dashboard only |
| Sentry DSN | Coolify env vars (public DSN is OK client-side) | Public (by design) |
| SSH keys | `~/.ssh/` on dev machine | Local only |

**Never in code. Never in `.env` committed to git. Always in Coolify environment variables.**

### Content Security Policy

```typescript
// next.config.ts — Security headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://plausible.gwth.ai",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://*.supabase.co",
      "media-src 'self' https://video.gwth.ai",
      "connect-src 'self' https://*.supabase.co https://video.gwth.ai wss://*.supabase.co",
      "frame-src 'self' https://js.stripe.com",
      "font-src 'self'",
    ].join('; '),
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```
