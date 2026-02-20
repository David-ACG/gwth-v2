# Old GWTH.ai Site — Reference Archive

> Extracted from the compromised Hetzner server (195.201.177.66) on 2026-02-20.
> The server had a crypto miner trojan. All executables, binaries, and node_modules were excluded.
> Only source code, media, configs, and database backup were saved.

## What Happened

The Hetzner production VM was compromised with a crypto miner. Two malicious cron jobs ran every minute:
```
* * * * * /run/user/1000/.update startup
```
The binary was in tmpfs and cleared on reboot, but the cron entries persisted. The VM was wiped and rebuilt from scratch.

## Old Stack vs New Stack

| Layer | Old (v1) | New (v2) |
|-------|----------|----------|
| Framework | Next.js 15 | Next.js 16 |
| Styling | Tailwind CSS 3 | Tailwind CSS 4 |
| Auth | Better Auth (was Clerk before that) | Supabase Auth |
| Database | PostgreSQL (local, Prisma ORM) | Supabase PostgreSQL |
| Payments | Stripe | Stripe (same) |
| Email (transactional) | MailerSend | Resend |
| Email (marketing) | MailerLite | MailerLite (same) |
| Deployment | PM2 + Nginx | Docker standalone + Coolify |
| Monitoring | Custom server_status_logs | Sentry + Uptime Kuma + Plausible |

## Directory Contents

### `screenshots/` — Old UI Screenshots
Frontend screenshots in light and dark mode for reference when building v2:
- `current-state/frontend/Home_light.png`, `Home_dark.png`
- `current-state/frontend/Lesson_light.png`, `Lesson_dark.png`
- `current-state/frontend/labs_light.png`, `labs_dark.png`
- `current-state/frontend/pricing_dark.png`
- `current-state/frontend/Register_light.png`, `Register_dark.png`
- `current-state/frontend/Profile_light.png`, `Profile_dark.png` (+ tab2, tab3, tab4)
- `current-state/backend/` — Backend dashboard attempts

### `design-docs/` — Architecture & Planning
- `GWTH Architecture - draft 15_12_25_Small.png` — architecture diagram
- `GWTH Syllabus - 3_9_25 - Sheet1.csv` — course syllabus
- `requirements/` — requirement screenshots
- `planning/` — planning docs
- `design/` — design docs and additional screenshots
- Various `.md` files: auth analysis, migration plans, beta testing docs

### `videos/` (gitignored — large files)
- `Intro_video_v7--13-12-bluelines-4k.mp4` (401 MB) — 4K intro video
- `Intro_video_v7--13-12-b;ueline-background=1080.mp4` (174 MB) — 1080p intro video

### `audio/` (gitignored — large files)
- TTS-generated lesson audio files (51 MB total, 4 files)

### `lesson-uploads/`
- Lesson media files (images, PDFs) from the old site (40 MB, 12 files)

### `nginx-configs/`
- `gwth.ai` — Reverse proxy to Next.js on port 3000
- `video.gwth.ai` — Reverse proxy to video generator on port 3002
- `clerk.video.gwth.ai` — Clerk custom domain proxy

### `prisma/`
- `schema.prisma` — Old database schema (Prisma ORM)
- `seed.ts` — Database seed script
- `init.sql` — Initial SQL
- `migrations/` — Prisma migrations

### `scripts/`
- 38 migration, deployment, and test scripts from the old site
- Useful for reference but not for direct reuse (different stack)

### `db-backup/`
- `gwthai_production_backup_20260220.sql.gz` (1.9 MB) — Full PostgreSQL dump
- Tables: 4 users, 1 course, 197 lessons, 1 lab, 5 waitlist, 3 whitelist, 9 email subs

### `env-reference.md`
- Documents all environment variables from the old site
- Lists which secrets need rotation and which are obsolete
- Maps old secrets to v2 equivalents

### `.env.local` (gitignored — contains compromised secrets)
- Actual .env.local from the old server, kept locally for reference only
- **DO NOT commit this file — it contains live (compromised) API keys**

## Source Code

The old source code is available on GitHub: `David-ACG/GWTH-OLD-Live105-2025` (private).
Cloned locally to `C:\Projects\GWTH-OLD\`.

## Secret Rotation Checklist

See `env-reference.md` for the full list. Key actions:
- [ ] Rotate Google OAuth client secrets
- [ ] Rotate GitHub OAuth client secret
- [ ] Roll Stripe API keys
- [ ] Regenerate Stripe webhook secret
- [ ] Regenerate MailerSend API key (or skip — switching to Resend)
- [ ] Regenerate MailerLite API key
- [ ] Generate new SSH keys for new VM
