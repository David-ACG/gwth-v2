-- ============================================================================
-- Newsbot DDL — Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zdhnwxknovzdnxgvwykt/sql/new
-- ============================================================================

-- ─── 1. RAW ARTICLES ARCHIVE ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS newsbot_raw_articles (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_name       TEXT NOT NULL,
    source_url        TEXT NOT NULL UNIQUE,
    title             TEXT NOT NULL,
    content_snippet   TEXT,
    author            TEXT,
    tags              TEXT[] DEFAULT '{}',
    published_at      TIMESTAMPTZ,
    fetched_at        TIMESTAMPTZ DEFAULT NOW(),
    processed         BOOLEAN DEFAULT FALSE,
    processing_result JSONB,
    importance_score  INTEGER DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_articles_source ON newsbot_raw_articles(source_name);
CREATE INDEX IF NOT EXISTS idx_raw_articles_fetched ON newsbot_raw_articles(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_raw_articles_processed ON newsbot_raw_articles(processed);

ALTER TABLE newsbot_raw_articles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Service role manages raw articles"
        ON newsbot_raw_articles FOR ALL
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 2. ADD reviewed_by_admin TO news_articles ────────────────────────────

ALTER TABLE news_articles
    ADD COLUMN IF NOT EXISTS reviewed_by_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── 3. NEWSLETTER SUBSCRIBERS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email                   TEXT NOT NULL UNIQUE,
    source                  TEXT NOT NULL DEFAULT 'newsbot',
    subscribed_at           TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at         TIMESTAMPTZ,
    is_active               BOOLEAN DEFAULT TRUE,
    mailerlite_subscriber_id TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Service role manages subscribers"
        ON newsletter_subscribers FOR ALL
        USING (true)
        WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
