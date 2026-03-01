# Plan: News & Voting System — Backend (Supabase)

## Overview

Backend for the GWTH news/voting system. Uses the same Supabase instance as the main site — one database, one auth system, zero extra infrastructure.

## Decision: Supabase for Everything

- Main site already uses Supabase for auth and data
- News/voting tables live alongside course/lesson tables
- RLS policies handle vote deduplication and access control
- Real-time subscriptions available for live vote counts
- Free tier handles the scale (news section won't approach limits)
- No P520 PostgreSQL — avoids network topology issues (Hetzner can't reach local network)

---

## Database Schema

### Table: `news_articles`

Stores curated news items posted by admin (David).

```sql
CREATE TABLE news_articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  excerpt         TEXT NOT NULL,               -- Short summary for cards (max ~200 chars)
  content         TEXT NOT NULL,               -- Full article body in Markdown
  url             TEXT,                        -- External link (e.g. Anthropic blog post)
  category        TEXT NOT NULL DEFAULT 'ai-launch',
  tags            TEXT[] DEFAULT '{}',         -- e.g. {'claude', 'anthropic', 'agents'}
  thumbnail_url   TEXT,                        -- Card image
  author          TEXT NOT NULL DEFAULT 'David',
  vote_count      INTEGER NOT NULL DEFAULT 0, -- Denormalized for fast sorting
  comment_count   INTEGER NOT NULL DEFAULT 0, -- Denormalized for fast sorting
  lab_slug        TEXT,                        -- Links to lab if one was created from this news item
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  status          TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_news_articles_slug ON news_articles(slug);
CREATE INDEX idx_news_articles_status ON news_articles(status);
CREATE INDEX idx_news_articles_category ON news_articles(category);
CREATE INDEX idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_votes ON news_articles(vote_count DESC);
CREATE INDEX idx_news_articles_tags ON news_articles USING GIN(tags);
```

**Categories** (stored as text, validated in app code):
- `ai-launch` — New AI product/feature releases (e.g. "Claude remote control")
- `research` — Papers, benchmarks, breakthroughs
- `tool` — Developer tools, frameworks, libraries
- `industry` — Business/industry news (funding, acquisitions, regulation)
- `tutorial` — Community tutorials, guides, how-tos

### Table: `news_votes`

One vote per user per article. No downvotes.

```sql
CREATE TABLE news_votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(article_id, user_id)  -- One vote per user per article
);

CREATE INDEX idx_news_votes_article ON news_votes(article_id);
CREATE INDEX idx_news_votes_user ON news_votes(user_id);
```

### Table: `news_comments`

Threaded comments on news articles.

```sql
CREATE TABLE news_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES news_comments(id) ON DELETE CASCADE,  -- For threaded replies
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_comments_article ON news_comments(article_id);
CREATE INDEX idx_news_comments_parent ON news_comments(parent_id);
```

---

## Row Level Security (RLS)

### news_articles

```sql
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can read published articles (public page, no auth required)
CREATE POLICY "Public can read published articles"
  ON news_articles FOR SELECT
  USING (status = 'published');

-- Only admin can insert/update/delete
-- (Use Supabase service role key in Server Actions, or check admin role)
CREATE POLICY "Admin can manage articles"
  ON news_articles FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

### news_votes

```sql
ALTER TABLE news_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read votes (for displaying counts, checking if user voted)
CREATE POLICY "Public can read votes"
  ON news_votes FOR SELECT
  USING (true);

-- Authenticated users can insert their own vote
CREATE POLICY "Users can vote"
  ON news_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own vote (un-vote)
CREATE POLICY "Users can remove own vote"
  ON news_votes FOR DELETE
  USING (auth.uid() = user_id);
```

### news_comments

```sql
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "Public can read comments"
  ON news_comments FOR SELECT
  USING (true);

-- Authenticated users can add comments
CREATE POLICY "Users can comment"
  ON news_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can edit their own comments
CREATE POLICY "Users can edit own comments"
  ON news_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON news_comments FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Database Functions

### Toggle Vote (atomic insert-or-delete + update count)

```sql
CREATE OR REPLACE FUNCTION toggle_news_vote(p_article_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing UUID;
  v_new_count INTEGER;
  v_voted BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if vote exists
  SELECT id INTO v_existing
  FROM news_votes
  WHERE article_id = p_article_id AND user_id = v_user_id;

  IF v_existing IS NOT NULL THEN
    -- Remove vote
    DELETE FROM news_votes WHERE id = v_existing;
    UPDATE news_articles
      SET vote_count = vote_count - 1, updated_at = NOW()
      WHERE id = p_article_id;
    v_voted := FALSE;
  ELSE
    -- Add vote
    INSERT INTO news_votes (article_id, user_id) VALUES (p_article_id, v_user_id);
    UPDATE news_articles
      SET vote_count = vote_count + 1, updated_at = NOW()
      WHERE id = p_article_id;
    v_voted := TRUE;
  END IF;

  SELECT vote_count INTO v_new_count FROM news_articles WHERE id = p_article_id;

  RETURN json_build_object('voted', v_voted, 'vote_count', v_new_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Hotness Score (computed on read via a view)

Uses Hacker News formula: `(votes - 1) / (hours + 2)^1.8`

```sql
CREATE OR REPLACE VIEW news_articles_ranked AS
SELECT
  *,
  -- HN-style hotness score
  CASE
    WHEN vote_count <= 1 THEN 0
    ELSE (vote_count - 1)::FLOAT /
         POWER(EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600 + 2, 1.8)
  END AS hotness_score
FROM news_articles
WHERE status = 'published';
```

### Increment Comment Count (trigger)

```sql
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE news_articles SET comment_count = comment_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE news_articles SET comment_count = comment_count - 1 WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER news_comment_count_trigger
  AFTER INSERT OR DELETE ON news_comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();
```

---

## Server Actions (Next.js)

These live in the GWTH v2 Next.js app, not the pipeline.

### `lib/actions/news.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Toggle upvote on a news article. Returns new vote state. */
export async function toggleVote(articleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("toggle_news_vote", {
    p_article_id: articleId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/news");
  return data as { voted: boolean; vote_count: number };
}

/** Add a comment to a news article. */
export async function addComment(articleId: string, body: string, parentId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const { error } = await supabase.from("news_comments").insert({
    article_id: articleId,
    user_id: user.id,
    parent_id: parentId ?? null,
    body,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/news`);
}

/** Delete own comment. */
export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("news_comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);
  revalidatePath("/news");
}
```

---

## Data Fetching (Next.js)

### `lib/data/news.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export type NewsSortOption = "hot" | "new" | "top";

interface NewsQueryParams {
  sort?: NewsSortOption;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

/** Fetch news articles with sorting and filtering. */
export async function getNews(params: NewsQueryParams = {}) {
  const { sort = "hot", category, tag, page = 1, limit = 12 } = params;
  const supabase = await createClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from(sort === "hot" ? "news_articles_ranked" : "news_articles")
    .select("*", { count: "exact" })
    .eq("status", "published")
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);

  // Sort order
  switch (sort) {
    case "hot":
      query = query.order("hotness_score", { ascending: false });
      break;
    case "new":
      query = query.order("published_at", { ascending: false });
      break;
    case "top":
      query = query.order("vote_count", { ascending: false });
      break;
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { articles: data ?? [], total: count ?? 0 };
}

/** Fetch a single news article by slug. */
export async function getNewsArticle(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_articles_ranked")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

/** Check if current user has voted on an article. */
export async function hasUserVoted(articleId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("news_votes")
    .select("id")
    .eq("article_id", articleId)
    .eq("user_id", user.id)
    .maybeSingle();
  return !!data;
}

/** Fetch comments for an article. */
export async function getComments(articleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_comments")
    .select("*, user:auth.users(id, raw_user_meta_data)")
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
```

---

## Admin: Posting News Articles

For Phase 1, post articles directly via Supabase Dashboard (Table Editor) or a simple SQL insert. No admin UI needed yet.

For Phase 2, consider:
- A `/admin/news` route with a markdown editor
- Or a Supabase Edge Function that accepts a webhook from a Slack bot/Telegram bot ("post this to news")

### Quick insert example (Supabase SQL Editor):

```sql
INSERT INTO news_articles (slug, title, excerpt, content, url, category, tags)
VALUES (
  'claude-remote-control',
  'Claude Can Now Control Your Computer Remotely',
  'Anthropic launches remote computer control for Claude, enabling AI agents to operate desktop applications directly.',
  '## Claude Remote Control

Anthropic has released a new capability allowing Claude to remotely control computers...

### What This Means for Developers

...',
  'https://anthropic.com/news/claude-remote-control',
  'ai-launch',
  ARRAY['claude', 'anthropic', 'agents', 'computer-use']
);
```

---

## Rate Limiting

Use Supabase's built-in rate limiting or add a simple check in Server Actions:

```typescript
// Simple in-memory rate limit for Server Actions (per-server instance)
const voteLimiter = new Map<string, number[]>();
const VOTE_LIMIT = 20;       // max votes
const VOTE_WINDOW = 60_000;  // per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = (voteLimiter.get(userId) ?? []).filter(t => now - t < VOTE_WINDOW);
  if (timestamps.length >= VOTE_LIMIT) return false;
  timestamps.push(now);
  voteLimiter.set(userId, timestamps);
  return true;
}
```

For production scale, use Upstash Ratelimit ($0 on free tier) or Supabase Edge Function rate limits.

---

## Email Notifications (Optional — Phase 2)

When a voted news item becomes a lab, notify voters via MailerSend (already configured):

```sql
-- Get all voters for an article
SELECT u.email, u.raw_user_meta_data->>'name' as name
FROM news_votes v
JOIN auth.users u ON v.user_id = u.id
WHERE v.article_id = '<article-id>';
```

Trigger this from a Supabase Edge Function or Server Action when `lab_slug` is set on an article.

---

## Migration Order

1. Create `news_articles` table + indexes
2. Create `news_votes` table + unique constraint + indexes
3. Create `news_comments` table + indexes
4. Enable RLS on all three tables
5. Create RLS policies
6. Create `toggle_news_vote` function
7. Create `news_articles_ranked` view
8. Create `update_comment_count` trigger
9. Insert 3-5 seed articles for development
10. Test voting via Supabase Dashboard → SQL Editor
