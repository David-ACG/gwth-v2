-- ============================================================================
-- GWTH Auth Integration — Migrate user_id columns to UUID + RLS policies
-- Run this in Supabase SQL Editor AFTER enabling Supabase Auth.
-- ============================================================================

-- ─── 1. DELETE MOCK DATA ──────────────────────────────────────────────────────
-- TEXT user_id values (e.g. "user_mock_001") can't cast to UUID,
-- so we must clear existing votes/comments before altering column types.

DELETE FROM news_votes;
DELETE FROM news_comments;

-- ─── 2. ALTER user_id COLUMNS TO UUID ─────────────────────────────────────────

-- Drop existing unique constraint on news_votes first
ALTER TABLE news_votes DROP CONSTRAINT IF EXISTS news_votes_article_id_user_id_key;

-- Alter votes user_id to UUID
ALTER TABLE news_votes
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Add FK constraint to auth.users
ALTER TABLE news_votes
  ADD CONSTRAINT news_votes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Re-add unique constraint
ALTER TABLE news_votes
  ADD CONSTRAINT news_votes_article_id_user_id_key UNIQUE (article_id, user_id);

-- Alter comments user_id to UUID
ALTER TABLE news_comments
  ALTER COLUMN user_id TYPE UUID USING user_id::UUID;

-- Add FK constraint to auth.users
ALTER TABLE news_comments
  ADD CONSTRAINT news_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ─── 3. UPDATE toggle_news_vote FUNCTION ──────────────────────────────────────
-- Change p_user_id parameter from TEXT to UUID

CREATE OR REPLACE FUNCTION toggle_news_vote(p_article_id UUID, p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_existing UUID;
  v_new_count INTEGER;
  v_voted BOOLEAN;
BEGIN
  -- Check if vote exists
  SELECT id INTO v_existing
  FROM news_votes
  WHERE article_id = p_article_id AND user_id = p_user_id;

  IF v_existing IS NOT NULL THEN
    DELETE FROM news_votes WHERE id = v_existing;
    UPDATE news_articles
      SET vote_count = vote_count - 1, updated_at = NOW()
      WHERE id = p_article_id;
    v_voted := FALSE;
  ELSE
    INSERT INTO news_votes (article_id, user_id) VALUES (p_article_id, p_user_id);
    UPDATE news_articles
      SET vote_count = vote_count + 1, updated_at = NOW()
      WHERE id = p_article_id;
    v_voted := TRUE;
  END IF;

  SELECT vote_count INTO v_new_count FROM news_articles WHERE id = p_article_id;

  RETURN json_build_object('voted', v_voted, 'vote_count', v_new_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 4. REPLACE PERMISSIVE RLS POLICIES WITH AUTH-BASED ONES ──────────────────

-- Drop old permissive policies for votes
DROP POLICY IF EXISTS "Public can read votes" ON news_votes;
DROP POLICY IF EXISTS "Service role manages votes" ON news_votes;

-- New auth-based vote policies
CREATE POLICY "Anyone can read votes"
  ON news_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own votes"
  ON news_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON news_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Drop old permissive policies for comments
DROP POLICY IF EXISTS "Public can read comments" ON news_comments;
DROP POLICY IF EXISTS "Service role manages comments" ON news_comments;

-- New auth-based comment policies
CREATE POLICY "Anyone can read comments"
  ON news_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own comments"
  ON news_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON news_comments FOR DELETE
  USING (auth.uid() = user_id);
