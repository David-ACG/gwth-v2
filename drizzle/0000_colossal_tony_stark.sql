-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "lesson_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"type" text DEFAULT 'link' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "lesson_resources_type_check" CHECK (type = ANY (ARRAY['link'::text, 'download'::text, 'video'::text, 'article'::text]))
);
--> statement-breakpoint
ALTER TABLE "lesson_resources" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sections" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"month" integer NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"optional_track" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sections_month_check" CHECK (month = ANY (ARRAY[1, 2, 3]))
);
--> statement-breakpoint
ALTER TABLE "sections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"duration" integer DEFAULT 45 NOT NULL,
	"difficulty" text DEFAULT 'beginner' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"section_id" text NOT NULL,
	"course_id" text NOT NULL,
	"course_slug" text DEFAULT 'applied-ai-skills' NOT NULL,
	"month" integer NOT NULL,
	"is_optional" boolean DEFAULT false NOT NULL,
	"optional_track" text,
	"intro_video_url" text,
	"learn_content" text DEFAULT '' NOT NULL,
	"audio_file_url" text,
	"audio_duration" real,
	"build_video_url" text,
	"build_instructions" text,
	"status" text DEFAULT 'available' NOT NULL,
	"objectives" text[] DEFAULT '{""}',
	"tags" text[] DEFAULT '{""}',
	"prerequisites" text[] DEFAULT '{""}',
	"pipeline_id" uuid,
	"pipeline_status" text,
	"exported_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "lessons_slug_key" UNIQUE("slug"),
	CONSTRAINT "lessons_difficulty_check" CHECK (difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])),
	CONSTRAINT "lessons_month_check" CHECK (month = ANY (ARRAY[1, 2, 3])),
	CONSTRAINT "lessons_status_check" CHECK (status = ANY (ARRAY['locked'::text, 'available'::text, 'in-progress'::text, 'completed'::text])),
	CONSTRAINT "lessons_pipeline_status_check" CHECK (pipeline_status = ANY (ARRAY['draft'::text, 'in_progress'::text, 'review'::text, 'published'::text, 'exported'::text]))
);
--> statement-breakpoint
ALTER TABLE "lessons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"question" text NOT NULL,
	"options" text[] DEFAULT '{""}' NOT NULL,
	"correct_option_index" integer DEFAULT 0 NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "quiz_questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"thumbnail" text,
	"blur_data_url" text,
	"price" integer DEFAULT 0 NOT NULL,
	"category" text DEFAULT 'Applied AI' NOT NULL,
	"difficulty" text DEFAULT 'beginner' NOT NULL,
	"estimated_duration" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "courses_slug_key" UNIQUE("slug"),
	CONSTRAINT "courses_difficulty_check" CHECK (difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))
);
--> statement-breakpoint
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"url" text,
	"category" text DEFAULT 'ai-launch' NOT NULL,
	"tags" text[] DEFAULT '{""}',
	"thumbnail_url" text,
	"author" text DEFAULT 'David' NOT NULL,
	"vote_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"lab_slug" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"published_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"reviewed_by_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "news_articles_slug_key" UNIQUE("slug"),
	CONSTRAINT "news_articles_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))
);
--> statement-breakpoint
ALTER TABLE "news_articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "news_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "news_votes_article_id_user_id_key" UNIQUE("user_id","article_id")
);
--> statement-breakpoint
ALTER TABLE "news_votes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "news_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_id" uuid,
	"body" text NOT NULL,
	"user_name" text DEFAULT 'Anonymous' NOT NULL,
	"user_avatar" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "news_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "benchmark_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"articles_sampled" integer DEFAULT 0 NOT NULL,
	"providers_tested" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "benchmark_runs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "benchmark_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"article_title" text NOT NULL,
	"article_url" text NOT NULL,
	"provider_id" text NOT NULL,
	"provider_name" text NOT NULL,
	"model" text NOT NULL,
	"latency_ms" real DEFAULT 0 NOT NULL,
	"success" boolean DEFAULT false NOT NULL,
	"error" text DEFAULT '',
	"json_valid" boolean DEFAULT false,
	"fields_complete" boolean DEFAULT false,
	"importance_score" integer,
	"category" text DEFAULT '',
	"title_rewritten" text DEFAULT '',
	"excerpt" text DEFAULT '',
	"content_length" integer DEFAULT 0,
	"estimated_input_tokens" integer DEFAULT 0,
	"estimated_output_tokens" integer DEFAULT 0,
	"estimated_cost_usd" real DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "benchmark_results" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "stripe_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_access" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"access_source" text DEFAULT 'registered' NOT NULL,
	"subscription_state" text DEFAULT 'registered' NOT NULL,
	"subscription_month" integer DEFAULT 0 NOT NULL,
	"valid_until" timestamp with time zone,
	"grace_period_ends" timestamp with time zone,
	"last_payment_at" timestamp with time zone,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_price_id" text,
	"stripe_subscription_status" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_access_stripe_customer_id_key" UNIQUE("stripe_customer_id"),
	CONSTRAINT "user_access_stripe_subscription_id_key" UNIQUE("stripe_subscription_id"),
	CONSTRAINT "user_access_access_source_check" CHECK (access_source = ANY (ARRAY['registered'::text, 'manual_beta'::text, 'stripe_course'::text, 'stripe_ongoing'::text])),
	CONSTRAINT "user_access_subscription_state_check" CHECK (subscription_state = ANY (ARRAY['registered'::text, 'month1'::text, 'month2'::text, 'month3'::text, 'ongoing'::text, 'lapsed'::text])),
	CONSTRAINT "user_access_subscription_month_check" CHECK ((subscription_month >= 0) AND (subscription_month <= 3))
);
--> statement-breakpoint
ALTER TABLE "user_access" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"progress" real DEFAULT 0 NOT NULL,
	"quiz_score" real,
	"best_quiz_score" real,
	"quiz_attempts" integer DEFAULT 0 NOT NULL,
	"time_spent" integer DEFAULT 0 NOT NULL,
	"last_accessed_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"intro_video_progress" real DEFAULT 0 NOT NULL,
	"quiz_passed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "lesson_progress_user_id_lesson_id_key" UNIQUE("user_id","lesson_id"),
	CONSTRAINT "lesson_progress_progress_check" CHECK ((progress >= (0)::double precision) AND (progress <= (1)::double precision)),
	CONSTRAINT "lesson_progress_intro_video_progress_check" CHECK ((intro_video_progress >= (0)::double precision) AND (intro_video_progress <= (1)::double precision))
);
--> statement-breakpoint
ALTER TABLE "lesson_progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "credential_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" text NOT NULL,
	"verification_code" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"learner_name" text NOT NULL,
	"gwth_score" real DEFAULT 0 NOT NULL,
	"percentile_label" text DEFAULT 'Building foundations' NOT NULL,
	"trajectory_label" text DEFAULT 'In progress' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credential_verifications_verification_code_key" UNIQUE("verification_code"),
	CONSTRAINT "credential_verifications_user_id_course_id_key" UNIQUE("user_id","course_id")
);
--> statement-breakpoint
ALTER TABLE "credential_verifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "newsbot_raw_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_name" text NOT NULL,
	"source_url" text NOT NULL,
	"title" text NOT NULL,
	"content_snippet" text,
	"author" text,
	"tags" text[] DEFAULT '{""}',
	"published_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now(),
	"processed" boolean DEFAULT false,
	"processing_result" jsonb,
	"importance_score" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "newsbot_raw_articles_source_url_key" UNIQUE("source_url")
);
--> statement-breakpoint
ALTER TABLE "newsbot_raw_articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'newsbot' NOT NULL,
	"subscribed_at" timestamp with time zone DEFAULT now(),
	"unsubscribed_at" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"mailerlite_subscriber_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "newsletter_subscribers_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "waitlist" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "beta_access_grants" (
	"email" text PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"subscription_month" integer DEFAULT 3 NOT NULL,
	"valid_until" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "beta_access_grants_subscription_month_check" CHECK ((subscription_month >= 1) AND (subscription_month <= 3)),
	CONSTRAINT "beta_access_grants_email_check" CHECK (email = lower(TRIM(BOTH FROM email)))
);
--> statement-breakpoint
ALTER TABLE "beta_access_grants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "lesson_resources" ADD CONSTRAINT "lesson_resources_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_votes" ADD CONSTRAINT "news_votes_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_votes" ADD CONSTRAINT "news_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_comments" ADD CONSTRAINT "news_comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_comments" ADD CONSTRAINT "news_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."news_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_comments" ADD CONSTRAINT "news_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "benchmark_results" ADD CONSTRAINT "benchmark_results_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."benchmark_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_access" ADD CONSTRAINT "user_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_verifications" ADD CONSTRAINT "credential_verifications_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential_verifications" ADD CONSTRAINT "credential_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beta_access_grants" ADD CONSTRAINT "beta_access_grants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_lesson_resources_lesson" ON "lesson_resources" USING btree ("lesson_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sections_course" ON "sections" USING btree ("course_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sections_month" ON "sections" USING btree ("month" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_sections_order" ON "sections" USING btree ("order" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_lessons_course" ON "lessons" USING btree ("course_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lessons_month" ON "lessons" USING btree ("month" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_lessons_order" ON "lessons" USING btree ("order" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_lessons_section" ON "lessons" USING btree ("section_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lessons_slug" ON "lessons" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lessons_tags" ON "lessons" USING gin ("tags" array_ops);--> statement-breakpoint
CREATE INDEX "idx_quiz_questions_lesson" ON "quiz_questions" USING btree ("lesson_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_news_articles_category" ON "news_articles" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_news_articles_published" ON "news_articles" USING btree ("published_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_news_articles_slug" ON "news_articles" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_news_articles_status" ON "news_articles" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_news_articles_tags" ON "news_articles" USING gin ("tags" array_ops);--> statement-breakpoint
CREATE INDEX "idx_news_articles_votes" ON "news_articles" USING btree ("vote_count" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_news_votes_article" ON "news_votes" USING btree ("article_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_news_votes_user" ON "news_votes" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_news_comments_article" ON "news_comments" USING btree ("article_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_news_comments_parent" ON "news_comments" USING btree ("parent_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_benchmark_runs_date" ON "benchmark_runs" USING btree ("run_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_benchmark_results_provider" ON "benchmark_results" USING btree ("provider_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_benchmark_results_run" ON "benchmark_results" USING btree ("run_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_user_access_stripe_customer_id" ON "user_access" USING btree ("stripe_customer_id" text_ops) WHERE (stripe_customer_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_user_access_stripe_subscription_id" ON "user_access" USING btree ("stripe_subscription_id" text_ops) WHERE (stripe_subscription_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_lesson_progress_lesson" ON "lesson_progress" USING btree ("lesson_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_lesson_progress_user" ON "lesson_progress" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_credential_verifications_code" ON "credential_verifications" USING btree ("verification_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_raw_articles_fetched" ON "newsbot_raw_articles" USING btree ("fetched_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_raw_articles_processed" ON "newsbot_raw_articles" USING btree ("processed" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_raw_articles_source" ON "newsbot_raw_articles" USING btree ("source_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_active" ON "newsletter_subscribers" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_email" ON "newsletter_subscribers" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_waitlist_email" ON "waitlist" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_beta_access_grants_user_id" ON "beta_access_grants" USING btree ("user_id" uuid_ops) WHERE (user_id IS NOT NULL);--> statement-breakpoint
CREATE VIEW "public"."news_articles_ranked" AS (SELECT id, slug, title, excerpt, content, url, category, tags, thumbnail_url, author, vote_count, comment_count, lab_slug, is_featured, status, published_at, created_at, updated_at, CASE WHEN vote_count <= 1 THEN 0::double precision ELSE (vote_count - 1)::double precision / power(EXTRACT(epoch FROM now() - published_at) / 3600::numeric + 2::numeric, 1.8)::double precision END AS hotness_score FROM news_articles WHERE status = 'published'::text);--> statement-breakpoint
CREATE POLICY "Service role manages resources" ON "lesson_resources" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Public can read resources" ON "lesson_resources" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Service role manages sections" ON "sections" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Public can read sections" ON "sections" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Service role manages lessons" ON "lessons" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Public can read lessons" ON "lessons" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Service role manages quiz questions" ON "quiz_questions" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Public can read quiz questions" ON "quiz_questions" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Service role manages courses" ON "courses" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Public can read courses" ON "courses" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Service role manages articles" ON "news_articles" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Public can read published articles" ON "news_articles" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can delete own votes" ON "news_votes" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Authenticated users can insert own votes" ON "news_votes" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Anyone can read votes" ON "news_votes" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can delete own comments" ON "news_comments" AS PERMISSIVE FOR DELETE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Authenticated users can insert own comments" ON "news_comments" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Anyone can read comments" ON "news_comments" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Public can read benchmark runs" ON "benchmark_runs" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Service role manages benchmark runs" ON "benchmark_runs" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "Public can read benchmark results" ON "benchmark_results" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Service role manages benchmark results" ON "benchmark_results" AS PERMISSIVE FOR ALL TO public;--> statement-breakpoint
CREATE POLICY "Users can read own access" ON "user_access" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((( SELECT auth.uid() AS uid) = user_id));--> statement-breakpoint
CREATE POLICY "Users update own progress" ON "lesson_progress" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users insert own progress" ON "lesson_progress" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users read own progress" ON "lesson_progress" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can update own credential sharing" ON "credential_verifications" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));--> statement-breakpoint
CREATE POLICY "Users can read own credentials" ON "credential_verifications" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Public can read shared credentials" ON "credential_verifications" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Service role manages raw articles" ON "newsbot_raw_articles" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Service role manages subscribers" ON "newsletter_subscribers" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Service role can manage waitlist" ON "waitlist" AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
*/