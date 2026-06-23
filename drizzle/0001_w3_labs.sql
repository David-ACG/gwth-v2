-- W3 — labs content table (Drizzle / self-hosted Postgres).
-- Mirrors the `Lab` shape in src/lib/types.ts and drizzle/schema.ts (labs).
-- Idempotent: safe to re-run against dev (5443) and staging Postgres.
-- Apply manually, e.g.:
--   docker exec -i gwth-v2-dev-postgres psql -U gwth -d gwth_v2 < drizzle/0001_w3_labs.sql
--   docker exec -i <staging-pg> psql -U gwth -d gwth_v2 < drizzle/0001_w3_labs.sql

CREATE TABLE IF NOT EXISTS "labs" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"difficulty" text DEFAULT 'beginner' NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"technologies" text[] DEFAULT '{}' NOT NULL,
	"learning_outcomes" text[] DEFAULT '{}' NOT NULL,
	"prerequisites" text,
	"content" text DEFAULT '' NOT NULL,
	"instructions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"project_type" text DEFAULT '' NOT NULL,
	"color" text DEFAULT '' NOT NULL,
	"icon" text DEFAULT '' NOT NULL,
	"image" text,
	"is_premium" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "labs_slug_key" UNIQUE ("slug"),
	CONSTRAINT "labs_difficulty_check" CHECK (difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_labs_slug" ON "labs" USING btree ("slug" text_ops);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_labs_category" ON "labs" USING btree ("category" text_ops);
