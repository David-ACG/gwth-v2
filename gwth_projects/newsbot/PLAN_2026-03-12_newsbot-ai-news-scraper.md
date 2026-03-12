# Newsbot — Automated AI News Scraper & Newsletter

**Created:** 2026-03-12
**Status:** Planning
**Domain:** newsbot.biz (standalone) + gwth.ai/news (integrated)
**Purpose:** Automated AI news aggregation, voting, and daily newsletter

---

## 1. What Is Newsbot?

Newsbot is an automated AI news aggregation service that:

1. **Scrapes** 20+ AI news sources twice daily (06:00 and 18:00 UTC)
2. **Deduplicates** and **categorises** articles using an LLM
3. **Publishes** to both newsbot.biz (standalone) and gwth.ai/news (integrated)
4. **Sends** a daily newsletter with the top-voted article from the previous day
5. **Serves** as a GWTH lesson project — students build their own version

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Newsbot Service                       │
│                  (Python + Docker)                       │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐   │
│  │ Scraper  │──▶│ LLM      │──▶│ Supabase Writer  │   │
│  │ Engine   │   │ Processor │   │ (news_articles)  │   │
│  └──────────┘   └──────────┘   └──────────────────┘   │
│       │                              │                  │
│       │         ┌──────────┐         │                  │
│       └────────▶│ Raw Feed │         │                  │
│                 │ Archive  │         │                  │
│                 └──────────┘         │                  │
│                                      ▼                  │
│                           ┌──────────────────┐         │
│                           │ Newsletter Sender │         │
│                           │ (daily @ 08:00)   │         │
│                           └──────────────────┘         │
└─────────────────────────────────────────────────────────┘
         │                         │
         ▼                         ▼
┌─────────────┐          ┌──────────────┐
│ newsbot.biz │          │ gwth.ai/news │
│ (standalone)│          │ (integrated) │
└─────────────┘          └──────────────┘
```

### Why Python (not Node)?

- **Lesson value**: Students learn Python web scraping — the most common real-world choice
- **Library ecosystem**: `httpx`, `beautifulsoup4`, `feedparser`, `newspaper3k` are battle-tested
- **LLM integration**: `anthropic` SDK is first-class Python
- **Docker**: Runs as a scheduled container on P520 alongside the GWTH pipeline
- **Standalone**: newsbot.biz can run independently of the Next.js app

### Why Not OpenCrawl?

- Overkill for 20-30 RSS/HTML sources
- Gives a third-party service access to GWTH infrastructure
- Less educational — students learn more building their own scraper
- The scraping logic is straightforward: RSS feeds + targeted HTML selectors

---

## 3. News Sources

### Tier 1 — RSS/Atom Feeds (reliable, structured)

These sources provide full RSS/Atom feeds that `feedparser` can consume directly:

| Source | Feed URL | Category | Notes |
|--------|----------|----------|-------|
| OpenAI Blog | `https://openai.com/blog/rss.xml` | ai-launch | Official announcements |
| Anthropic Blog | `https://www.anthropic.com/rss.xml` | ai-launch | Claude updates, research |
| Google AI Blog | `https://blog.google/technology/ai/rss/` | ai-launch, research | DeepMind, Gemini |
| Hugging Face Blog | `https://huggingface.co/blog/feed.xml` | tool, research | Open-source ML |
| The Verge AI | `https://www.theverge.com/rss/ai-artificial-intelligence/index.xml` | industry | Consumer-facing AI news |
| Ars Technica AI | `https://feeds.arstechnica.com/arstechnica/technology-lab` | industry | Technical AI coverage |
| MIT Technology Review AI | `https://www.technologyreview.com/feed/` | research | Filtered for AI tags |
| TechCrunch AI | `https://techcrunch.com/category/artificial-intelligence/feed/` | industry, ai-launch | Startup/product launches |
| The Register AI | `https://www.theregister.com/software/ai_ml/headlines.atom` | industry | UK-focused tech |
| VentureBeat AI | `https://venturebeat.com/category/ai/feed/` | industry | Enterprise AI |
| Simon Willison's Blog | `https://simonwillison.net/atom/everything/` | tool, tutorial | LLM tooling, practical AI |
| Hacker News (AI filtered) | `https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT+OR+Claude` | mixed | Community-curated |
| Towards Data Science | `https://towardsdatascience.com/feed` | tutorial, research | Medium-based, needs filtering |
| Lil'Log (Lilian Weng) | `https://lilianweng.github.io/index.xml` | research | Deep technical ML posts |
| Sebastian Raschka | `https://magazine.sebastianraschka.com/feed` | research | ML/LLM research digests |

### Tier 2 — HTML Scraping (no RSS, need selectors)

These require targeted HTML parsing with `beautifulsoup4`:

| Source | URL | Selector Strategy | Category |
|--------|-----|-------------------|----------|
| Anthropic News | `https://www.anthropic.com/news` | Article cards with date + title | ai-launch |
| Cursor Blog | `https://www.cursor.com/blog` | Blog post list | tool |
| Vercel Blog | `https://vercel.com/blog` | Blog cards filtered for AI tags | tool |
| Ollama Blog | `https://ollama.com/blog` | Blog post list | tool |
| UK Gov AI Policy | `https://www.gov.uk/search/news-and-communications?topical_events%5B%5D=ai-safety-summit` | Gov.uk result cards | industry |

### Tier 3 — API Sources (structured, rate-limited)

| Source | API | Category | Notes |
|--------|-----|----------|-------|
| Arxiv | `https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.CL&sortBy=submittedDate&max_results=20` | research | Pre-prints, needs filtering for significance |
| GitHub Trending | `https://api.github.com/search/repositories?q=topic:llm+OR+topic:ai-agent&sort=stars&order=desc` | tool | New trending AI repos |
| Product Hunt | `https://api.producthunt.com/v2/api/graphql` | ai-launch | Requires API key, AI category filter |

### Source Rotation Strategy

- **Tier 1** sources are checked every run (twice daily)
- **Tier 2** sources are checked once daily (morning run only) — less frequent to be respectful
- **Tier 3** sources are checked once daily with rate limiting
- All sources have a `last_checked` timestamp and `check_interval` config
- Failed sources are retried on the next run, not immediately

---

## 4. Scraping Pipeline

### Step 1: Fetch Raw Content

```python
# Each source has a scraper class
class RSSFeedScraper:
    """Fetches and parses RSS/Atom feeds using feedparser."""
    async def fetch(self, source: NewsSource) -> list[RawArticle]

class HTMLScraper:
    """Fetches HTML pages and extracts articles using CSS selectors."""
    async def fetch(self, source: NewsSource) -> list[RawArticle]

class APIFetcher:
    """Fetches from structured APIs (Arxiv, GitHub, etc.)."""
    async def fetch(self, source: NewsSource) -> list[RawArticle]
```

**RawArticle** contains:
- `source_url` — canonical URL of the article
- `source_name` — which source it came from
- `title` — article headline
- `content_snippet` — first ~500 chars of content (or full RSS description)
- `published_at` — publication date (parsed from feed or page)
- `author` — if available
- `tags` — any tags/categories from the source
- `fetched_at` — when we scraped it

### Step 2: Deduplication

Before processing with the LLM, deduplicate using:

1. **URL match** — exact canonical URL already in `news_articles` table
2. **Title similarity** — fuzzy match using `rapidfuzz` (threshold: 85% similarity)
3. **Content fingerprint** — MinHash of content snippet for near-duplicate detection

Articles that match existing entries are skipped. The dedup cache covers the last 30 days.

### Step 3: LLM Processing (Claude)

Each new article is processed by Claude to generate the fields needed for `news_articles`:

```python
SYSTEM_PROMPT = """
You are Newsbot, an AI news editor for GWTH.ai — a UK-based AI training platform.
Your job is to process raw news articles into structured, reader-friendly items.

For each article, produce:
1. **slug** — URL-friendly slug (lowercase, hyphens, max 80 chars)
2. **title** — Clear, engaging headline (max 120 chars). Rewrite if the original is clickbait.
3. **excerpt** — 1-2 sentence summary for the news feed card (max 200 chars)
4. **content** — 2-4 paragraph markdown summary of the article. Include:
   - What happened / what was announced
   - Why it matters (for AI practitioners and learners)
   - Key technical details (if relevant)
   - UK-specific angle if applicable
5. **category** — One of: ai-launch, research, tool, industry, tutorial
6. **tags** — 3-5 lowercase tags (e.g. "claude", "openai", "llm", "agents", "uk-policy")
7. **importance_score** — 1-10 rating of how significant this is for the AI community

Rules:
- Write for a UK audience learning to build with AI — not for ML researchers
- Keep language clear and jargon-free
- If the article is trivial, minor, or off-topic, set importance_score to 0 (we'll skip it)
- Never fabricate details not present in the source material
- Always preserve the original source URL for attribution
"""
```

**Filtering**: Articles with `importance_score < 3` are dropped. This prevents low-quality or off-topic content from polluting the feed.

**Cost estimate**: ~20-40 articles per run × ~1000 tokens per article = ~40K tokens per run. At Claude Haiku pricing (~$0.25/M input, $1.25/M output), this is approximately $0.05-0.10 per run, or ~$3-6/month.

### Step 4: Write to Supabase

Processed articles are inserted into the existing `news_articles` table:

```python
async def publish_articles(articles: list[ProcessedArticle]):
    """Insert processed articles into Supabase news_articles table."""
    for article in articles:
        await supabase.table("news_articles").insert({
            "slug": article.slug,
            "title": article.title,
            "excerpt": article.excerpt,
            "content": article.content,
            "url": article.source_url,       # Original source link
            "category": article.category,
            "tags": article.tags,
            "author": "Newsbot",             # Attribution
            "status": "published",
            "published_at": article.published_at,
            "vote_count": 0,
            "comment_count": 0,
            "is_featured": article.importance_score >= 8,
        }).execute()
```

**No schema changes needed** — the existing `news_articles` table already has every field Newsbot needs. Articles written by Newsbot are identified by `author = "Newsbot"` and have `url` pointing to the original source.

### Step 5: Archive Raw Data

All raw scraped data is stored in a `newsbot_raw_articles` table for:
- Debugging and auditing
- Reprocessing if the LLM prompt improves
- Lesson content: students can explore the raw vs. processed data

```sql
CREATE TABLE newsbot_raw_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_name TEXT NOT NULL,
    source_url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content_snippet TEXT,
    author TEXT,
    tags TEXT[],
    published_at TIMESTAMPTZ,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    processing_result JSONB,          -- LLM output for debugging
    importance_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_raw_articles_source ON newsbot_raw_articles(source_name);
CREATE INDEX idx_raw_articles_fetched ON newsbot_raw_articles(fetched_at DESC);
CREATE INDEX idx_raw_articles_processed ON newsbot_raw_articles(processed);
```

---

## 5. Newsletter System

### Daily Newsletter — "Newsbot Daily"

**Schedule**: 08:00 UTC daily (after morning scrape at 06:00 gives time for votes)

**Content**:
- **Hero article**: Top-voted article from the previous 24 hours
- **Top 5**: Next 5 highest-voted articles with excerpts
- **New today**: Count of new articles added in the last 24 hours
- **CTA**: "Read more on newsbot.biz" / "Learn to build this yourself at gwth.ai"

### Subscriber Management

**Option A: MailerLite (recommended for MVP)**
- GWTH already has a newsletter stub referencing MailerLite
- MailerLite free tier: 1,000 subscribers, 12,000 emails/month
- API for subscriber management + email sending
- Built-in unsubscribe handling (legal compliance)

**Option B: Self-hosted (future)**
- Store subscribers in Supabase `newsletter_subscribers` table
- Send via MailerSend (already configured for GWTH waitlist)
- Manage unsubscribes ourselves

**Recommendation**: Start with MailerLite for both newsbot.biz and gwth.ai. Migrate to self-hosted only if subscriber volume demands it.

### Subscriber Table (for tracking, even with MailerLite)

```sql
CREATE TABLE newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL DEFAULT 'newsbot',  -- 'newsbot' or 'gwth'
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    mailerlite_subscriber_id TEXT,           -- Sync with MailerLite
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Email Template

```
Subject: Newsbot Daily — {top_article_title}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NEWSBOT DAILY — {date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 TOP STORY
{title}
{excerpt}
{vote_count} votes · Read more →

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TODAY'S TOP 5
1. {title} — {votes} votes
2. {title} — {votes} votes
3. {title} — {votes} votes
4. {title} — {votes} votes
5. {title} — {votes} votes

See all → newsbot.biz

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Want to build your own AI news aggregator?
Learn how at gwth.ai →

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 6. newsbot.biz — Standalone Site

### Purpose

- Public-facing AI news aggregator at newsbot.biz
- Advertising for gwth.ai (banner, footer link, "Build this yourself" CTA)
- Demonstration of what GWTH students learn to build

### Tech Stack

Two options:

**Option A: Subdomain of GWTH (recommended for MVP)**
- Point newsbot.biz DNS to the same Coolify deployment
- Add a route group or middleware rewrite: `newsbot.biz/* → gwth.ai/news/*`
- Newsbot.biz gets a simplified layout (no GWTH sidebar/dashboard)
- Shared Supabase database — same articles, votes, comments
- Minimal extra code: just a layout variant + middleware check

**Option B: Separate Next.js app (future)**
- Own repo, own Coolify deployment
- Reads from the same Supabase database
- Full creative freedom for newsbot.biz branding
- More infrastructure to maintain

**Recommendation**: Start with Option A. The news pages already exist on gwth.ai — newsbot.biz is just a branded entry point. When/if Newsbot needs its own identity, spin it out.

### newsbot.biz Layout

```
┌────────────────────────────────────────────┐
│ NEWSBOT.biz          [Subscribe] [Sign In] │
│ AI news, curated automatically             │
├────────────────────────────────────────────┤
│                                            │
│  [Hot] [New] [Top]        [Search...]      │
│                                            │
│  ┌─────────────────────────────────────┐   │
│  │ ▲ 203  Claude 4 Remote Control      │   │
│  │        Anthropic · 2h ago · 12 💬   │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ ▲ 156  GPT-5 Launch Details         │   │
│  │        OpenAI · 5h ago · 8 💬       │   │
│  └─────────────────────────────────────┘   │
│  ...                                       │
│                                            │
├────────────────────────────────────────────┤
│ Powered by GWTH.ai                         │
│ Learn to build this yourself →             │
└────────────────────────────────────────────┘
```

### DNS Configuration

```
newsbot.biz     A     → Coolify server IP (Hetzner or P520)
www.newsbot.biz CNAME → newsbot.biz
```

---

## 7. Project Structure

```
gwth_projects/newsbot/
├── PLAN_2026-03-12_newsbot-ai-news-scraper.md   # This file
├── src/
│   ├── __init__.py
│   ├── main.py                  # Entry point: CLI + scheduler
│   ├── config.py                # Settings, source list, schedule
│   ├── models.py                # Pydantic models (RawArticle, ProcessedArticle)
│   ├── scrapers/
│   │   ├── __init__.py
│   │   ├── base.py              # Abstract base scraper
│   │   ├── rss_scraper.py       # RSS/Atom feed scraper
│   │   ├── html_scraper.py      # HTML page scraper
│   │   └── api_fetcher.py       # API-based fetchers (Arxiv, GitHub)
│   ├── processing/
│   │   ├── __init__.py
│   │   ├── dedup.py             # Deduplication logic
│   │   ├── llm_processor.py     # Claude-based article processing
│   │   └── publisher.py         # Supabase writer
│   ├── newsletter/
│   │   ├── __init__.py
│   │   ├── composer.py          # Build newsletter content
│   │   ├── sender.py            # MailerLite / MailerSend integration
│   │   └── templates/
│   │       └── daily.html       # Email template
│   └── utils/
│       ├── __init__.py
│       ├── logging.py           # Structured logging
│       └── rate_limiter.py      # Per-source rate limiting
├── tests/
│   ├── test_scrapers.py
│   ├── test_dedup.py
│   ├── test_llm_processor.py
│   ├── test_publisher.py
│   └── test_newsletter.py
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml               # Dependencies + project metadata
├── .env.example                 # Required environment variables
└── README.md
```

---

## 8. Environment Variables

```bash
# Supabase (same instance as GWTH)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LLM Processing
ANTHROPIC_API_KEY=sk-ant-...
NEWSBOT_LLM_MODEL=claude-haiku-4-5-20251001    # Cost-effective for summarisation

# Newsletter
MAILERLITE_API_KEY=eyJ...
MAILERLITE_GROUP_ID=...                          # Newsbot subscriber group

# Optional
NEWSBOT_LOG_LEVEL=INFO
NEWSBOT_DRY_RUN=false                            # true = scrape but don't publish
TELEGRAM_BOT_TOKEN=...                           # For failure alerts
TELEGRAM_CHAT_ID=...
```

---

## 9. Scheduling & Deployment

### Docker Container on P520

```yaml
# docker-compose.yml
services:
  newsbot:
    build: .
    container_name: newsbot
    restart: unless-stopped
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - MAILERLITE_API_KEY=${MAILERLITE_API_KEY}
    volumes:
      - ./data:/app/data    # Raw article archive
    # Runs on schedule via APScheduler inside the container
```

### Scheduling Options

**Option A: APScheduler inside the container (recommended)**
- Python's `APScheduler` runs the scrape job on a cron trigger
- Single long-running container, no external cron dependency
- Built-in retry, job persistence

**Option B: System cron + docker exec**
- More traditional but less portable
- Depends on host cron

**Option C: Coolify scheduled tasks**
- If Coolify supports scheduled containers

**Recommendation**: APScheduler. Self-contained, portable, easy to test.

```python
# main.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = AsyncIOScheduler()

# Scrape twice daily
scheduler.add_job(run_scrape, CronTrigger(hour="6,18", minute=0))

# Newsletter daily at 08:00 UTC
scheduler.add_job(send_newsletter, CronTrigger(hour=8, minute=0))

scheduler.start()
```

---

## 10. GWTH Integration

### Existing News Page

The scraper writes directly to the same `news_articles` table that gwth.ai/news reads. No API changes needed. The existing:

- ISR caching (12hr revalidate) means new articles appear within 12 hours
- Voting and comments work immediately on scraped articles
- Hotness scoring formula ranks Newsbot articles alongside any manually added content

### Forced Revalidation After Scrape

After each scrape run, call the Next.js revalidation API to force-refresh the news cache:

```python
async def trigger_revalidation():
    """Tell gwth.ai to refresh its news cache after a scrape run."""
    async with httpx.AsyncClient() as client:
        await client.post(
            f"{GWTH_URL}/api/revalidate",
            json={"tag": "news-feed"},
            headers={"Authorization": f"Bearer {REVALIDATION_SECRET}"},
        )
```

This requires adding a small API route to GWTH:

```typescript
// src/app/api/revalidate/route.ts
import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization")
  if (authHeader !== `Bearer ${process.env.REVALIDATION_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { tag } = await request.json()
  revalidateTag(tag, { expire: 0 })

  return NextResponse.json({ revalidated: true })
}
```

### newsbot.biz Middleware (Option A approach)

```typescript
// In GWTH middleware.ts — detect newsbot.biz hostname
if (request.headers.get("host")?.includes("newsbot.biz")) {
  // Rewrite to /news with newsbot layout flag
  const url = request.nextUrl.clone()
  url.pathname = url.pathname === "/" ? "/news" : url.pathname
  url.searchParams.set("layout", "newsbot")
  return NextResponse.rewrite(url)
}
```

---

## 11. Lesson Content Plan

This project becomes a GWTH lesson: **"Build an AI News Aggregator"**

### Lesson Structure

**Lesson 1: Planning Your News Aggregator**
- What RSS feeds are and how to find them
- Choosing sources for your niche
- Designing a data pipeline (fetch → process → store → display)
- Hands-on: Use `feedparser` to read your first RSS feed in Python

**Lesson 2: Building the Scraper**
- `httpx` for async HTTP requests
- `feedparser` for RSS/Atom
- `beautifulsoup4` for HTML extraction
- Rate limiting and being a good citizen
- Hands-on: Build a multi-source scraper with error handling

**Lesson 3: AI-Powered Content Processing**
- Using Claude to summarise and categorise articles
- Prompt engineering for structured output
- Deduplication strategies (URL, title similarity, content fingerprinting)
- Hands-on: Process raw articles through Claude and output structured JSON

**Lesson 4: Database & Publishing**
- Supabase as a backend (tables, RLS, functions)
- Writing scraped content to a database
- Triggering frontend cache refresh
- Hands-on: Set up Supabase tables and publish your first automated article

**Lesson 5: The Newsletter**
- Email deliverability basics
- Building an HTML email template
- Subscriber management with MailerLite
- Hands-on: Build and send your first automated newsletter

**Lesson 6: Docker & Scheduling**
- Containerising your scraper
- APScheduler for time-based jobs
- Monitoring and alerting (Telegram notifications)
- Hands-on: Deploy your news aggregator as a Docker service

### Lab Integration

Each lesson can have a corresponding GWTH lab where students:
- Fork a starter template
- Build their own news aggregator for a topic they choose
- Deploy it to their own Supabase + Docker setup

---

## 12. Implementation Phases

### Phase 1: Core Scraper (Week 1)

**Goal**: Scrape RSS feeds, process with Claude, write to Supabase

1. Set up project structure with `pyproject.toml`
2. Implement `RSSFeedScraper` for Tier 1 sources
3. Implement deduplication (URL + title similarity)
4. Implement LLM processor with Claude Haiku
5. Implement Supabase publisher
6. Write tests for each component
7. Manual CLI run: `python -m newsbot scrape`

**Acceptance Criteria**:
- [ ] Scrapes 15+ RSS feeds successfully
- [ ] Deduplicates against existing articles in Supabase
- [ ] Claude processes articles into structured format
- [ ] Articles appear in gwth.ai/news feed
- [ ] All tests pass

### Phase 2: HTML Scraping + Scheduling (Week 2)

**Goal**: Add HTML scrapers, Docker container, automated schedule

1. Implement `HTMLScraper` for Tier 2 sources
2. Implement `APIFetcher` for Tier 3 sources (Arxiv, GitHub)
3. Add APScheduler (06:00 and 18:00 UTC)
4. Dockerise the service
5. Deploy to P520
6. Add Telegram alerts for failures
7. Add revalidation API route to GWTH

**Acceptance Criteria**:
- [ ] HTML and API scrapers work reliably
- [ ] Docker container runs on P520
- [ ] Scrapes run automatically twice daily
- [ ] gwth.ai/news refreshes after each scrape
- [ ] Telegram alerts on failure

### Phase 3: Newsletter (Week 3)

**Goal**: Daily newsletter with top-voted articles

1. Set up MailerLite account and API integration
2. Build newsletter composer (top article + top 5)
3. Build HTML email template
4. Wire newsletter signup on gwth.ai and newsbot.biz
5. Add daily 08:00 UTC schedule
6. Test with real subscribers (David + test accounts)

**Acceptance Criteria**:
- [ ] Newsletter sends daily at 08:00 UTC
- [ ] Contains top-voted article from previous 24 hours
- [ ] Signup works on both gwth.ai/newsletter and newsbot.biz
- [ ] Unsubscribe works
- [ ] Email renders correctly in Gmail, Outlook, Apple Mail

### Phase 4: newsbot.biz (Week 4)

**Goal**: Standalone branded news site at newsbot.biz

1. Register/configure newsbot.biz DNS
2. Add hostname detection in GWTH middleware
3. Create newsbot-specific layout (simplified header, GWTH branding in footer)
4. Add "Build this yourself at gwth.ai" CTA
5. Deploy to Hetzner (production)

**Acceptance Criteria**:
- [ ] newsbot.biz loads with branded layout
- [ ] All news feed features work (vote, comment, filter, search)
- [ ] Newsletter signup works
- [ ] GWTH advertising visible but not intrusive
- [ ] Mobile responsive

### Phase 5: Lesson Content (Week 5-6)

**Goal**: Write the 6-lesson module for GWTH course

1. Write lesson content for all 6 lessons
2. Create starter templates for labs
3. Record video walkthroughs (or plan for recording)
4. Add lesson and lab entries to GWTH data

---

## 13. Monitoring & Observability

| What | How | Alert |
|------|-----|-------|
| Scrape failures | Log + Telegram | Immediate |
| Zero articles from a source for 3+ days | Source health check | Daily summary |
| LLM processing errors | Log + Telegram | Immediate |
| Newsletter send failures | MailerLite webhook + Telegram | Immediate |
| Container crashes | Docker restart policy + Telegram | On restart |
| Cost tracking | Anthropic dashboard | Monthly review |

---

## 14. Cost Estimate

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Claude Haiku (processing) | ~$3-6 | ~60 runs × ~40 articles × ~1K tokens |
| Supabase | $0 | Free tier (existing GWTH instance) |
| MailerLite | $0 | Free tier up to 1,000 subscribers |
| Docker on P520 | $0 | Already running other containers |
| newsbot.biz domain | ~$1/month | Annual registration |
| **Total** | **~$4-7/month** | |

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Sources change their RSS/HTML structure | Scraper breaks for that source | Source health monitoring + alerts. Fallback to other sources. |
| Rate limiting / IP blocking | Can't fetch from a source | Respect `robots.txt`, use reasonable intervals, rotate User-Agent |
| LLM hallucination in summaries | Inaccurate article content | Always link to original source. Include "AI-generated summary" disclaimer. |
| Newsletter marked as spam | Low deliverability | Use MailerLite (good reputation). Double opt-in. Clean list regularly. |
| Duplicate articles slip through | Cluttered feed | Multi-layer dedup (URL + title + content fingerprint). Manual review initially. |
| High Claude API costs | Budget overrun | Use Haiku (cheapest). Set daily token budget. Alert on threshold. |

---

## 16. Open Questions

1. **newsbot.biz hosting**: Same Coolify deployment (Hetzner) or separate? Recommendation is same for MVP.
2. **Moderation**: Should scraped articles auto-publish or go through a review queue? Recommendation: auto-publish with importance_score >= 3, with ability to archive manually.
3. **User accounts**: Should newsbot.biz have its own auth or share GWTH Supabase Auth? Recommendation: share auth — one account for both.
4. **Content licensing**: Some sources may have restrictive terms. Need to review each source's ToS. Using excerpts + links (not full articles) should be fair use.
5. **MailerLite vs MailerSend**: MailerLite for marketing emails (newsletter), MailerSend for transactional (already configured). Or consolidate?

---

## 17. Dependencies

### Python Packages

```toml
[project]
dependencies = [
    "httpx>=0.28",
    "feedparser>=6.0",
    "beautifulsoup4>=4.12",
    "lxml>=5.0",
    "rapidfuzz>=3.0",
    "anthropic>=0.52",
    "supabase>=2.0",
    "apscheduler>=4.0",
    "pydantic>=2.0",
    "pydantic-settings>=2.0",
    "jinja2>=3.1",
    "structlog>=24.0",
    "python-telegram-bot>=21.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.24",
    "pytest-httpx>=0.35",
    "ruff>=0.8",
]
```

### GWTH Changes Required

1. **New API route**: `src/app/api/revalidate/route.ts` — cache revalidation endpoint
2. **Middleware update**: hostname detection for newsbot.biz (Phase 4)
3. **New Supabase migration**: `newsbot_raw_articles` table + `newsletter_subscribers` table
4. **Environment variable**: `REVALIDATION_SECRET` for the revalidation API
5. **Newsletter signup wiring**: Connect existing stub to MailerLite API

---

*This plan was generated on 2026-03-12 as part of the GWTH Newsbot project.*
*It serves both as a project plan and as reference material for the GWTH lesson: "Build an AI News Aggregator".*
