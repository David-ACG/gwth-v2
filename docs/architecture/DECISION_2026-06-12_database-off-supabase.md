# Decision: drop Supabase for data — self-hosted PostgreSQL (2026-06-12)

**Status:** decided by David, 2026-06-12 (cost reasons). Recorded here by a
launch-plan session because no prior written record existed; the older
endorsements of Supabase in `technology-decisions.md`,
`infrastructure-and-deployment.md` and `CLAUDE.md` are superseded for the
DATA layer by this note.

## The decision

GWTH_V2 does NOT use Supabase for application data. All persistence
(lessons/labs content, per-user progress, feedback, beta-access grants,
waitlist) lives in **self-hosted PostgreSQL**:

- **Production:** a PostgreSQL service managed by Coolify on the existing
  Hetzner box (the same pattern as the v1 site, which already runs
  Postgres + Prisma there at zero marginal cost). New dedicated database
  `gwth_v2` — never point V2 at the v1 production database.
- **Staging/dev (P520):** a Postgres container alongside the staging
  deploy; local dev may use the same or the mock fallback.
- **Access layer:** Prisma (schema + migrations committed to the repo,
  `prisma migrate deploy` on deploy). Matches the v1 stack David already
  operates.
- **Connection contract:** a single `DATABASE_URL` env var; when it is
  absent the data layer falls back to the existing in-memory mocks (the
  established fallback pattern).
- **Backups:** nightly `pg_dump` via cron to the P520 backup store — same
  pattern as the other self-hosted services; no Supabase Pro tier needed
  (this was the cost driver).
- **Per-user isolation:** app-level scoping (every query filtered by the
  authenticated user id in the server-side data layer) with tests, instead
  of Supabase RLS.

## Auth — explicitly still open

The 23 June beta KEEPS the existing, working Supabase **Auth** (its free
tier has no cost at beta scale; the cost problem was the database/Pro
tier). The data layer must read the authenticated user id through ONE
accessor so the auth provider can be swapped post-beta (candidate:
Auth.js + Postgres adapter) without touching persistence code. If David
wants auth off Supabase BEFORE the beta, that is a separate launch-board
task — flag it, do not fold it into a data task.

## What this changes on the launch board

W3 (content import), W4 (admin dashboard), W5 (feedback table), W6
(go-live env/backups) and W7 (progress persistence) all target the
self-hosted Postgres + Prisma layer — their prompts on the 8090 board
were rewritten accordingly on 2026-06-12. Any older prompt or doc that
says "create a Supabase table" should be read as "add a Prisma model +
migration".
