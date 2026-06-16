-- ============================================================================
-- 010 — Better Auth (W11 Phase 1): Supabase Auth → self-hosted Better Auth
-- ============================================================================
-- Replaces the Supabase `auth.users` model with Better Auth's own tables, held
-- in `public`. Better Auth `user.id` is TEXT (library default; D-W11-3), so the
-- canonical user table becomes `public."user"`.
--
-- The four core Better Auth tables (user / session / account / verification) use
-- the default singular names (D-W11-4) and the column names declared in
-- `src/db/auth-schema.ts` (Drizzle keys are camelCase Better-Auth field names;
-- the DB columns are snake_case and Drizzle translates).
--
-- Then the three user-scoped tables the app reads via Drizzle have their
-- `user_id` re-pointed from `auth.users(id)` (uuid) to `public."user"(id)`
-- (text): lesson_progress, user_access, beta_access_grants. The dev DB is EMPTY
-- (0 rows in all three + the auth.users stub), so this destructive type change
-- is safe. The dev `auth.users` stub (and the now-empty `auth` schema) is
-- dropped LAST.
--
-- "user" is a reserved word in SQL — always double-quote it.
-- ============================================================================

-- ── 1. Better Auth core tables ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "user" (
    id             TEXT PRIMARY KEY,
    name           TEXT NOT NULL,
    email          TEXT NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    image          TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT user_email_unique UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS "session" (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token      TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT session_token_unique UNIQUE (token)
);

CREATE TABLE IF NOT EXISTS "account" (
    id                       TEXT PRIMARY KEY,
    user_id                  TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    account_id               TEXT NOT NULL,
    provider_id              TEXT NOT NULL,
    access_token             TEXT,
    refresh_token            TEXT,
    access_token_expires_at  TIMESTAMP,
    refresh_token_expires_at TIMESTAMP,
    scope                    TEXT,
    id_token                 TEXT,
    password                 TEXT,
    created_at               TIMESTAMP NOT NULL,
    updated_at               TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
    id         TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value      TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"(user_id);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"(user_id);

-- ── 2. Re-point the app-read user-scoped FKs: uuid → text, auth.users → user ─
-- Safe because all three tables are empty. Drop the old FK, change the column
-- type to TEXT, then add the new FK to public."user"(id).
--
-- First drop the legacy Supabase RLS policies that reference user_id (they use
-- `auth.uid()`, which disappears with the auth schema). Postgres blocks an
-- ALTER COLUMN TYPE while a policy depends on the column. Per src/db/index.ts
-- (D2) there is NO row-level security under Better Auth — per-user scoping is
-- enforced in application/data-layer code — so these policies are dead and
-- removed here.
DROP POLICY IF EXISTS "Users read own progress"   ON lesson_progress;
DROP POLICY IF EXISTS "Users insert own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users update own progress" ON lesson_progress;
DROP POLICY IF EXISTS "Users can read own access"  ON user_access;

-- lesson_progress.user_id  (was uuid → auth.users(id) ON DELETE CASCADE)
ALTER TABLE lesson_progress DROP CONSTRAINT IF EXISTS lesson_progress_user_id_fkey;
ALTER TABLE lesson_progress ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- user_access.user_id  (PK, was uuid → auth.users(id) ON DELETE CASCADE)
ALTER TABLE user_access DROP CONSTRAINT IF EXISTS user_access_user_id_fkey;
ALTER TABLE user_access ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE user_access
    ADD CONSTRAINT user_access_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- beta_access_grants.user_id  (nullable, was uuid → auth.users(id) ON DELETE SET NULL)
ALTER TABLE beta_access_grants DROP CONSTRAINT IF EXISTS beta_access_grants_user_id_fkey;
ALTER TABLE beta_access_grants ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE beta_access_grants
    ADD CONSTRAINT beta_access_grants_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;

-- ── 2b. The other tables that FK auth.users(id) and are read via Drizzle ─────
-- DEVIATION from the Phase-1 three-table list, but REQUIRED: auth.users cannot
-- be dropped while these FKs exist, and dropping it CASCADE would leave these
-- columns as orphaned uuid (no FK), making them impossible to populate with a
-- TEXT Better-Auth user.id. They are read by src/lib/data/news.ts and
-- credentials.ts, so they are genuinely user-scoped tables; re-point them too.
-- Same empty-table safety (0 rows). Drop their auth.uid()-based RLS policies
-- first (dead under Better Auth — no RLS; app-layer scoping).

-- news_votes.user_id  (was uuid → auth.users(id) ON DELETE CASCADE)
DROP POLICY IF EXISTS "Users can delete own votes"            ON news_votes;
DROP POLICY IF EXISTS "Authenticated users can insert own votes" ON news_votes;
DROP POLICY IF EXISTS "Anyone can read votes"                 ON news_votes;
ALTER TABLE news_votes DROP CONSTRAINT IF EXISTS news_votes_user_id_fkey;
ALTER TABLE news_votes ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE news_votes
    ADD CONSTRAINT news_votes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- news_comments.user_id  (was uuid → auth.users(id) ON DELETE CASCADE)
DROP POLICY IF EXISTS "Users can delete own comments"            ON news_comments;
DROP POLICY IF EXISTS "Authenticated users can insert own comments" ON news_comments;
DROP POLICY IF EXISTS "Anyone can read comments"                 ON news_comments;
ALTER TABLE news_comments DROP CONSTRAINT IF EXISTS news_comments_user_id_fkey;
ALTER TABLE news_comments ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE news_comments
    ADD CONSTRAINT news_comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- credential_verifications.user_id  (was uuid → auth.users(id) ON DELETE CASCADE)
DROP POLICY IF EXISTS "Users can update own credential sharing" ON credential_verifications;
DROP POLICY IF EXISTS "Users can read own credentials"          ON credential_verifications;
DROP POLICY IF EXISTS "Public can read shared credentials"      ON credential_verifications;
ALTER TABLE credential_verifications DROP CONSTRAINT IF EXISTS credential_verifications_user_id_fkey;
ALTER TABLE credential_verifications ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE credential_verifications
    ADD CONSTRAINT credential_verifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- ── 3. Drop the dev Supabase auth.users stub (LAST) ─────────────────────────
-- All FKs that referenced it have been re-pointed above. Drop the table, then
-- the auth schema if it is now empty.
DROP TABLE IF EXISTS auth.users;
-- The dev stub also carries Supabase shim functions auth.uid()/auth.role(),
-- now dead (no auth.users, no RLS under Better Auth). CASCADE removes them with
-- the schema. auth.users is already dropped above, so nothing of value remains.
DROP SCHEMA IF EXISTS auth CASCADE;

-- NOTE: in production the `auth` schema may host other Supabase objects. There
-- this CASCADE drop must be reviewed/narrowed before any prod apply — only the
-- dev stub is known to contain just users + uid()/role() shims.
