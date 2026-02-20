# Recover Data from Compromised Hetzner Server Before Wiping — 20 Feb 2026

## Context

The Hetzner production server (195.201.177.66) was compromised with a crypto miner trojan. Two malicious cron jobs (`/run/user/1000/.update startup`) persist in david's crontab and would re-infect on reboot if the dropper runs again. The server needs to be wiped and rebuilt from scratch.

Before wiping, we need to extract all valuable data (code, screenshots, videos, docs, DB backup, configs) and organize it locally for reference during the v2 rebuild. The old code is already on GitHub (`David-ACG/GWTH-OLD-Live105-2025`), so we only need to SCP files that aren't in git.

**Total data to transfer: ~880 MB** (mostly 2 intro videos at 574 MB + docs at 212 MB + audio at 51 MB)

---

## Step 1: Create local directory structure

Create `C:\Projects\GWTH_V2\docs\old-site\` with subdirectories for organized storage.

```
docs/old-site/
├── screenshots/           # Frontend/backend screenshots (from server docs/design/screenshots/)
├── design-docs/           # Architecture diagrams, planning docs, syllabus
├── videos/                # 4K and 1080p intro videos
├── audio/                 # TTS-generated lesson audio files
├── lesson-uploads/        # Lesson media from public/uploads/lessons/
├── nginx-configs/         # gwth.ai, video.gwth.ai, clerk.video.gwth.ai configs
├── scripts/               # Migration scripts, deployment scripts
├── prisma/                # Schema and migrations from old app
├── db-backup/             # PostgreSQL dump
├── env-reference.md       # Documented secrets (values redacted, names listed for rotation)
└── README.md              # What's in each folder and what secrets need rotation
```

## Step 2: SCP files from compromised server

Transfer in priority order (most critical first):

1. **DB backup** (1.9 MB) — `/home/david/tmp/gwthai_production_backup_20260220.sql.gz`
2. **Screenshots** (~30 MB) — `/var/www/gwth-ai/docs/design/screenshots/`
3. **Design docs** (~212 MB) — `/var/www/gwth-ai/docs/` (architecture, planning, requirements, syllabus)
4. **.env.local** (8 KB) — `/var/www/gwth-ai/.env.local` (for secret names — all values must be rotated)
5. **Nginx configs** (~4 KB) — `/etc/nginx/sites-available/gwth.ai`, `video.gwth.ai`, `clerk.video.gwth.ai`
6. **Prisma schema** (72 KB) — `/var/www/gwth-ai/prisma/`
7. **Scripts** (208 KB) — `/var/www/gwth-ai/scripts/`
8. **Audio files** (51 MB) — `/var/www/gwth-ai/public/audio/`
9. **Lesson uploads** (~41 MB) — `/var/www/gwth-ai/public/uploads/lessons/`
10. **Intro videos** (574 MB) — `/var/www/gwth-ai/public/uploads/Intro_video_v7*`

**NOT copying:** `node_modules/`, `.next/`, any executables/binaries, `tts-service/`, `video-generator/`.
**Source code:** Already on GitHub at `David-ACG/GWTH-OLD-Live105-2025` — will clone separately.

## Step 3: Clone old repo from GitHub

```bash
git clone git@github.com:David-ACG/GWTH-OLD-Live105-2025.git C:\Projects\GWTH-OLD
```

This gives us the full source code safely from GitHub (not from the compromised server).

## Step 4: Create reference documentation

Create `docs/old-site/README.md` with:
- Inventory of what was saved and where
- List of all secrets that need rotation (with service names, NOT values)
- Notes on the old stack (Next.js 15, Prisma, Better Auth, PM2) vs new (Next.js 16, Supabase, standalone Docker)
- Links to the screenshots for each page

Create `docs/old-site/env-reference.md` with:
- All env var names from the old .env.local
- Which ones need rotation vs which are obsolete
- New service equivalents (e.g., Better Auth secret → Supabase Auth, no secret needed)

## Step 5: Add old-site to .gitignore

Add `docs/old-site/videos/` and `docs/old-site/audio/` to `.gitignore` (large binary files shouldn't go in git). The screenshots and text docs can be committed.

## Step 6: Secret rotation checklist

Document which secrets are compromised and need rotation:

| Secret | Service | Action |
|--------|---------|--------|
| Google OAuth client secret | Google Cloud Console | Regenerate |
| GitHub OAuth client secret | GitHub Settings | Regenerate |
| Stripe secret key | Stripe Dashboard | Roll key |
| Stripe webhook secret | Stripe Dashboard | Regenerate |
| MailerSend API key | MailerSend Dashboard | Regenerate |
| MailerLite API key | MailerLite Dashboard | Regenerate |
| SSH keys on server | All SSH configs | Generate new keys for new VM |
| Database password | N/A | New DB on rebuild |
| Better Auth secret | N/A | Obsolete (switching to Supabase Auth) |
| NextAuth secret | N/A | Obsolete |

## Step 7: Verify extraction completeness

Before giving the green light to wipe:
- [ ] All screenshots viewable locally
- [ ] DB backup file intact (gzip test)
- [ ] .env.local captured (for secret names)
- [ ] Nginx configs saved
- [ ] Old repo cloned from GitHub
- [ ] Intro videos play locally
- [ ] Audio files play locally

## Step 8: User wipes the VM

User action (requires Proxmox access):
1. Delete the compromised VM in Proxmox
2. Create new Ubuntu 24.04 LTS VM with target specs (64 GB RAM, 1.5-2 TB disk)
3. Basic install (user account, SSH key access)

Then we proceed with the original infrastructure plan from the architecture docs.

---

## Verification

After all SCP transfers complete:
- Check file counts match between server and local
- Verify video files play (not corrupted)
- Verify DB backup decompresses (`gzip -t` on the .sql.gz)
- View screenshots to confirm they captured the old UI
- Read .env.local to compile the rotation checklist

## What this does NOT include

- Running the old app locally (different stack, unnecessary)
- Copying any binaries or executables from the compromised server
- Setting up the new VM (that's the next plan, after wipe)
- Rotating secrets (user must do this in each service's dashboard)
