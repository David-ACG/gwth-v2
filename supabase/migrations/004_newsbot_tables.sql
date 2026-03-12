-- ============================================================================
-- Newsbot — Raw Articles Archive & Admin Review Tracking
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ─── 1. RAW ARTICLES ARCHIVE ──────────────────────────────────────────────
-- Stores every article fetched by the scraper, before LLM processing.
-- Used for debugging, auditing, reprocessing, and lesson content.

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

-- RLS: Only service role can read/write raw articles
ALTER TABLE newsbot_raw_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages raw articles"
    ON newsbot_raw_articles FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── 2. ADD reviewed_by_admin TO news_articles ────────────────────────────
-- Tracks whether David has reviewed a Newsbot-authored article.
-- Used for downvote alerting: only alert on unreviewed articles.

ALTER TABLE news_articles
    ADD COLUMN IF NOT EXISTS reviewed_by_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── 3. NEWSLETTER SUBSCRIBERS ────────────────────────────────────────────
-- Tracks subscribers for the daily newsletter (synced with MailerLite).

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

CREATE POLICY "Service role manages subscribers"
    ON newsletter_subscribers FOR ALL
    USING (true)
    WITH CHECK (true);

-- ─── 4. DELETE SEED ARTICLES ──────────────────────────────────────────────
-- Remove the manually seeded articles (author = 'David') so the feed
-- starts clean for Newsbot-generated content.

DELETE FROM news_comments WHERE article_id IN (
    SELECT id FROM news_articles WHERE author = 'David'
);
DELETE FROM news_votes WHERE article_id IN (
    SELECT id FROM news_articles WHERE author = 'David'
);
DELETE FROM news_articles WHERE author = 'David';
