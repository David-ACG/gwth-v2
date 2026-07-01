-- W7 — lesson_progress go-live DDL (idempotent, hand-authored).
--
-- Mirrors the Drizzle app schema (drizzle/schema.ts) for the per-user progress
-- table, for loading onto a FRESH prod gwth_v2 DB during the gwth.ai public-prod
-- cutover. The live staging/beta DB (Coolify PG 17.10 l08k8gwcscgssgwscoscwo8g)
-- ALREADY has this table with the Better-Auth FK — this file is the reproducible
-- source for the next prod DB, NOT something to re-run there.
--
-- Design decisions baked in:
--   * user_id FK → public."user"(id)  (Better Auth, D4). NOT Supabase auth.users.
--   * D2: NO row-level security. Per-user isolation is app-level (every query in
--     src/lib/data/progress.ts filters by the authenticated user_id).
--   * The lesson_id → lessons(id) FK is included to match staging, but is only
--     valid once the lessons table is populated (content import). If prod runs
--     mock content at cutover, comment out that one constraint line.
--
-- PREREQUISITE: the Better-Auth user table must exist first (W11:
--   session/account/verification too). Load W11's auth DDL BEFORE this.
--
-- Load command (run inside the target Postgres container):
--   docker exec -i <pg_container> psql -U <role> -d gwth_v2 < drizzle/manual/W7_lesson_progress.sql

CREATE TABLE IF NOT EXISTS "lesson_progress" (
  "id"                   uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id"              text NOT NULL,
  "lesson_id"            text NOT NULL,
  "is_completed"         boolean DEFAULT false NOT NULL,
  "progress"             real DEFAULT 0 NOT NULL,
  "quiz_score"           real,
  "best_quiz_score"      real,
  "quiz_attempts"        integer DEFAULT 0 NOT NULL,
  "time_spent"           integer DEFAULT 0 NOT NULL,
  "last_accessed_at"     timestamptz DEFAULT now(),
  "completed_at"         timestamptz,
  "intro_video_progress" real DEFAULT 0 NOT NULL,
  "quiz_passed"          boolean DEFAULT false NOT NULL,
  CONSTRAINT "lesson_progress_user_id_lesson_id_key" UNIQUE ("user_id", "lesson_id"),
  CONSTRAINT "lesson_progress_progress_check"
    CHECK ("progress" >= 0 AND "progress" <= 1),
  CONSTRAINT "lesson_progress_intro_video_progress_check"
    CHECK ("intro_video_progress" >= 0 AND "intro_video_progress" <= 1),
  CONSTRAINT "lesson_progress_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
  -- Requires a populated lessons table; comment out for mock-content prod.
  CONSTRAINT "lesson_progress_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_lesson_progress_user"   ON "lesson_progress" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_lesson_progress_lesson" ON "lesson_progress" ("lesson_id");
