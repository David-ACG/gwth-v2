# Service Setup Playbook

> Reusable guide for setting up monitoring (Uptime Kuma) and analytics (Plausible CE) on new sites deployed via Coolify on Hetzner.
>
> Based on the GWTH v2 setup (2026-02-22). Adapt domains, credentials, and URLs for each new site.

---

## Prerequisites

- Hetzner server with Coolify + Traefik running
- DNS A records pointing to the server IP for all domains
- SSH access configured (`ssh hetzner`)

---

## 1. Uptime Kuma (Status Page)

Uptime Kuma is deployed as a Coolify one-click service. One instance monitors all sites on the server.

### 1.1 Deploy via Coolify API

```bash
# Create the service
curl -s -X POST "http://195.201.177.66:8000/api/v1/services" \
  -H "Authorization: Bearer <COOLIFY_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "uptime-kuma",
    "name": "Uptime Kuma",
    "description": "Status monitoring",
    "server_uuid": "<SERVER_UUID>",
    "project_uuid": "<PROJECT_UUID>",
    "environment_name": "production",
    "destination_uuid": "<DESTINATION_UUID>"
  }'
```

Then update the domain in Coolify DB (the API doesn't support FQDN for services):

```bash
ssh hetzner 'docker exec coolify php artisan tinker --execute="
  use App\Models\Service;
  use App\Models\ServiceApplication;
  \$svc = Service::where(\"uuid\", \"<SERVICE_UUID>\")->first();
  \$app = ServiceApplication::where(\"service_id\", \$svc->id)->first();
  \$app->fqdn = \"https://status.<DOMAIN>\";
  \$app->save();
  echo \"FQDN set to: \" . \$app->fqdn;
"'
```

Start the service:

```bash
curl -s -X POST "http://195.201.177.66:8000/api/v1/services/<SERVICE_UUID>/start" \
  -H "Authorization: Bearer <COOLIFY_TOKEN>"
```

### 1.2 First-Time Setup

1. Navigate to `https://status.<DOMAIN>/setup-database`
2. Select **SQLite** (recommended for single-instance)
3. Click **Next**, wait for DB setup
4. Create admin account:
   - Username: `david`
   - Password: (use a strong, unique password)

### 1.3 Add Monitors

For each service, click **Add New Monitor** and configure:

| Setting                          | Value                              |
| -------------------------------- | ---------------------------------- |
| Monitor Type                     | HTTP(s)                            |
| Friendly Name                    | `<App Name> (<domain>)`           |
| URL                              | `https://<domain>/api/health` (or `/`) |
| Heartbeat Interval               | 60 seconds                         |
| Retries                          | 3                                  |
| Certificate Expiry Notification  | Enabled                            |
| Domain Name Expiry Notification  | Enabled                            |
| Accepted Status Codes            | 200-299                            |

Recommended monitors for a typical Coolify setup:

- Main app health endpoint (`/api/health`)
- Status page itself (self-monitoring)
- Analytics service
- Any other deployed services

### 1.4 Create Public Status Page

1. Go to **Status Pages** > **New Status Page**
2. Name: `<Site Name> Services`
3. Slug: `default` (shows at root `/status/default`)
4. Description: `Current status of <domain> services`
5. Footer: `For support, contact <email>`
6. Add all monitors to the page
7. Click **Save**

Public URL: `https://status.<DOMAIN>/status/default`

---

## 2. Plausible CE (Privacy-Friendly Analytics)

Plausible runs as a standalone Docker Compose stack outside Coolify, sharing Coolify's Traefik for routing and SSL.

### 2.1 Create Directory and Config

```bash
ssh hetzner 'mkdir -p /data/plausible'
```

### 2.2 Generate Secrets

```bash
# Secret key base (64 bytes)
openssl rand -base64 48

# TOTP vault key (32 bytes)
openssl rand -base64 32
```

### 2.3 Create Environment File

```bash
# /data/plausible/plausible.env
BASE_URL=https://analytics.<DOMAIN>
SECRET_KEY_BASE=<generated-secret-key-base>
TOTP_VAULT_KEY=<generated-totp-vault-key>
DATABASE_URL=postgres://plausible:<PG_PASSWORD>@plausible-db:5432/plausible
CLICKHOUSE_DATABASE_URL=http://plausible:<CH_PASSWORD>@plausible-events-db:8123/plausible_events_db
DISABLE_REGISTRATION=invite_only
```

### 2.4 Create Docker Compose File

Write `/data/plausible/docker-compose.yml` — use Python to avoid backtick escaping issues:

```bash
ssh hetzner 'python3 -c "
content = \"\"\"services:
  plausible:
    image: ghcr.io/plausible/community-edition:v2.1
    command: sh -c \x27sleep 15 && /entrypoint.sh db createdb && /entrypoint.sh db migrate && /entrypoint.sh run\x27
    depends_on:
      plausible-db:
        condition: service_healthy
      plausible-events-db:
        condition: service_healthy
    env_file:
      - plausible.env
    networks:
      - default
      - coolify
    labels:
      - traefik.enable=true
      - traefik.http.routers.plausible.rule=Host(\x60analytics.<DOMAIN>\x60)
      - traefik.http.routers.plausible.entrypoints=https
      - traefik.http.routers.plausible.tls=true
      - traefik.http.routers.plausible.tls.certresolver=letsencrypt
      - traefik.http.services.plausible.loadbalancer.server.port=8000
      - traefik.docker.network=coolify

  plausible-db:
    image: postgres:16-alpine
    restart: always
    environment:
      - POSTGRES_DB=plausible
      - POSTGRES_USER=plausible
      - POSTGRES_PASSWORD=<PG_PASSWORD>
    volumes:
      - plausible-db-data:/var/lib/postgresql/data
    healthcheck:
      test: pg_isready -U plausible
      interval: 10s
      timeout: 5s
      retries: 5

  plausible-events-db:
    image: clickhouse/clickhouse-server:24.3-alpine
    restart: always
    environment:
      - CLICKHOUSE_DB=plausible_events_db
      - CLICKHOUSE_USER=plausible
      - CLICKHOUSE_PASSWORD=<CH_PASSWORD>
    volumes:
      - plausible-events-data:/var/lib/clickhouse
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
    healthcheck:
      test: wget --no-verbose --tries=1 --spider http://127.0.0.1:8123/ping
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  plausible-db-data:
  plausible-events-data:

networks:
  coolify:
    external: true
\"\"\"
with open(\x27/data/plausible/docker-compose.yml\x27, \x27w\x27) as f:
    f.write(content)
print(\x27Written successfully\x27)
"'
```

**Key details:**
- `traefik.docker.network=coolify` is **critical** — without it, Traefik picks the wrong network and you get Gateway Timeout
- ClickHouse healthcheck must use `127.0.0.1` (not `localhost`) to avoid IPv6 issues
- The `sleep 15` gives the databases time to start before Plausible runs migrations

### 2.5 Start Plausible

```bash
ssh hetzner 'cd /data/plausible && docker compose up -d'
```

Wait ~30 seconds for migrations, then verify:

```bash
ssh hetzner 'curl -sk https://analytics.<DOMAIN> -o /dev/null -w "%{http_code}" --connect-to analytics.<DOMAIN>:443:127.0.0.1:443'
# Should return 302 (redirect to /register)
```

### 2.6 First-Time Setup

1. Navigate to `https://analytics.<DOMAIN>/register`
2. Create admin account (name, email, password)
3. Add site:
   - Domain: `<DOMAIN>` (naked domain, no https://)
   - Timezone: select appropriate timezone
4. Enable optional measurements:
   - **Outbound links** — tracks clicks to external sites
   - **404 error pages** — tracks broken links
5. Copy the tracking snippet
6. Click **Start collecting data**

### 2.7 Add Tracking Script to Next.js

In your root `app/layout.tsx`:

```tsx
import Script from "next/script"

// Inside the <html> tag, before <body>:
<head>
  <Script
    defer
    data-domain="<DOMAIN>"
    src="https://analytics.<DOMAIN>/js/script.outbound-links.js"
    strategy="afterInteractive"
  />
</head>
```

The script name changes based on enabled extensions:
- No extensions: `script.js`
- Outbound links: `script.outbound-links.js`
- Outbound + 404: `script.outbound-links.js` (404 uses the plausible function, not the script name)
- File downloads: `script.file-downloads.js`
- Multiple: `script.outbound-links.file-downloads.js`

### 2.8 Verify Installation

After deploying the site with the script:

```bash
# Send a test pageview via API
curl -s -X POST https://analytics.<DOMAIN>/api/event \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -d '{"name":"pageview","url":"https://<DOMAIN>/","domain":"<DOMAIN>"}'
# Should return: ok (HTTP 202)
```

Then check the Plausible dashboard — you should see 1 visitor.

### 2.9 Manage Plausible

```bash
# Start/stop
ssh hetzner 'cd /data/plausible && docker compose up -d'
ssh hetzner 'cd /data/plausible && docker compose down'

# View logs
ssh hetzner 'docker logs plausible-plausible-1 --tail 50'

# Restart after config change
ssh hetzner 'cd /data/plausible && docker compose down && docker compose up -d'
```

---

## 3. DNS Setup

For each new site, add these A records at your DNS provider (e.g. Namecheap):

| Subdomain    | Type | Value            | Purpose         |
| ------------ | ---- | ---------------- | --------------- |
| `@`          | A    | `<SERVER_IP>`    | Main site       |
| `status`     | A    | `<SERVER_IP>`    | Uptime Kuma     |
| `analytics`  | A    | `<SERVER_IP>`    | Plausible       |

**Important:** Configure DNS **before** starting services. If Traefik tries to get Let's Encrypt certs before DNS propagates, you'll hit rate limits (5 failed authorizations per domain per hour).

If you accidentally start services before DNS is ready:
1. Wait for the rate limit to expire (1 hour)
2. Ensure DNS is propagated: `nslookup <subdomain>.<DOMAIN> 8.8.8.8`
3. Restart Traefik: `ssh hetzner 'docker restart coolify-proxy'`

---

## 4. SSL Troubleshooting

### Traefik serves default cert (self-signed)

```bash
# Check if cert exists in acme.json
ssh hetzner 'docker exec coolify-proxy cat /traefik/acme.json | python3 -c "
import sys,json
data = json.load(sys.stdin)
certs = data.get(\"letsencrypt\",{}).get(\"Certificates\",[])
for c in certs:
    print(c[\"domain\"][\"main\"])
"'

# If cert exists but not being served, restart Traefik
ssh hetzner 'docker restart coolify-proxy'
```

### Gateway Timeout (504) for docker-compose services

Most common cause: Traefik connecting to wrong Docker network.

```bash
# Check which networks the container is on
ssh hetzner 'docker inspect <container> --format "{{json .NetworkSettings.Networks}}" | python3 -m json.tool'

# Fix: add this label to the container in docker-compose.yml
# traefik.docker.network=coolify
```

### Verify SSL cert

```bash
ssh hetzner "echo | openssl s_client -connect 127.0.0.1:443 -servername <DOMAIN> 2>/dev/null | openssl x509 -noout -subject -issuer -dates"
```

---

## 5. Checklist for New Site

- [ ] DNS A records created for main domain + subdomains
- [ ] DNS propagated (verify with `nslookup <domain> 8.8.8.8`)
- [ ] Main app deployed in Coolify, health check passing
- [ ] SSL cert valid (Let's Encrypt, not Traefik default)
- [ ] HTTP to HTTPS redirect working (307)
- [ ] Uptime Kuma monitor added for new site
- [ ] Plausible site added (`analytics.<DOMAIN>` > Add new site)
- [ ] Tracking script added to site's `<head>`
- [ ] First pageview verified in Plausible dashboard
- [ ] Public status page updated with new monitor
- [ ] Credentials saved to password manager
