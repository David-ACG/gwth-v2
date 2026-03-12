# Lesson Ideas — Newsbot Project

> Generated 2026-03-12. All lessons use the Newsbot AI news scraper as the teaching vehicle.

## Month Mapping

- **Month 1** — "From Zero to Building" (AI for Your Life): Foundational concepts, first API calls, basic automation
- **Month 2** — "Building Real Apps" (AI for Your Industry): Production patterns, data pipelines, integrations
- **Month 3** — "Enterprise AI & Multi-Agent Systems" (AI Transformation): DevOps, monitoring, scaling, governance

## Lesson Ideas

| # | Lesson | Month | Category | Description |
|---|--------|-------|----------|-------------|
| 1 | How to Compare API Models on Cost and Quality | 1 | LLM Fundamentals | Evaluate LLMs across benchmarks (MMLU, IFEval, Arena ELO), pricing tiers, and latency. Build a decision framework for choosing the right model for a task. |
| 2 | How to Use API Models in an App | 1 | LLM Integration | Make your first API call to Claude, DeepSeek, and Groq. Handle authentication, rate limits, and structured responses. |
| 3 | How to Build a Local App That Is Automated | 1 | Automation | Build a Python CLI tool that runs on a schedule, fetches data, processes it, and stores results — no manual intervention needed. |
| 4 | Parsing RSS/Atom Feeds with Python | 1 | Data Collection | Use feedparser to consume RSS and Atom feeds. Handle date formats, content extraction, and malformed XML gracefully. |
| 5 | Web Scraping Ethics: robots.txt, Rate Limiting, and User-Agent Etiquette | 1 | Data Collection | Responsible scraping practices — respecting robots.txt, setting polite User-Agents, implementing rate limits, and avoiding IP bans. |
| 6 | HTML Scraping with BeautifulSoup | 1 | Data Collection | Extract structured data from web pages when no API or RSS feed exists. CSS selectors, navigation, and content cleaning. |
| 7 | Handling Unreliable Sources: Timeouts, Retries, and Graceful Degradation | 2 | Resilience | Build fault-tolerant data fetching with httpx timeouts, exponential backoff retries, and fallback strategies when sources go down. |
| 8 | Deduplication Strategies: URL Normalisation vs Fuzzy Title Matching | 2 | Data Processing | Implement URL normalisation (strip tracking params, fragments, trailing slashes) and fuzzy string matching with rapidfuzz to detect duplicate content. |
| 9 | Text Preprocessing for LLM Input | 2 | Data Processing | Strip HTML, truncate to token limits, structure prompts with system/user roles, and prepare clean input for language models. |
| 10 | Scoring and Filtering: Building an Importance Threshold System | 2 | Data Processing | Design a scoring rubric for content quality, implement threshold-based filtering, and balance recall vs precision in automated curation. |
| 11 | Prompt Engineering for Structured JSON Output | 2 | LLM Integration | Craft prompts that reliably produce valid JSON with specific fields. Handle edge cases: markdown fencing, partial responses, schema validation. |
| 12 | Building a Provider Abstraction Layer | 2 | Architecture | Design an ABC-based provider pattern so your app can swap between Anthropic, DeepSeek, Groq, or Ollama without changing business logic. |
| 13 | Handling LLM Failures: Retries and Fallbacks | 2 | Resilience | Implement retry logic for transient LLM errors, automatic fallback to secondary providers, and partial batch processing when some items fail. |
| 14 | Cost Monitoring and Budget Controls for API Usage | 2 | Operations | Track token usage per run, set daily/monthly spend caps, implement alerts when costs exceed thresholds, and optimise prompt length for cost. |
| 15 | Pydantic for Config and Settings Management | 1 | Architecture | Use pydantic-settings to load config from .env files, validate types, set defaults, and keep secrets out of code. |
| 16 | Structured Logging with structlog | 2 | Operations | Replace print statements with structured JSON logs. Add context (run ID, source name), configure log levels, and make logs machine-parseable. |
| 17 | Scheduling with Cron and APScheduler | 3 | Automation | Set up recurring jobs with APScheduler and system cron. Handle overlapping runs, missed schedules, and idempotent execution. |
| 18 | CLI Design with argparse | 1 | Architecture | Build a multi-command CLI (scrape, clean, test-feeds) with flags, help text, and dry-run modes. Good UX for developer tools. |
| 19 | Designing Tables for a Content Pipeline | 2 | Database | Model raw → processed → published content stages in PostgreSQL. Choose appropriate types, constraints, indexes, and default values. |
| 20 | Row Level Security in Supabase/PostgreSQL | 2 | Database | Implement RLS policies to control who can read/write each table. Service role vs authenticated user vs anonymous access patterns. |
| 21 | Idempotent Writes: Handling Duplicate Inserts | 2 | Database | Use UNIQUE constraints, ON CONFLICT clauses, and application-level checks to safely re-run pipelines without creating duplicates. |
| 22 | Dockerizing a Python Service | 3 | DevOps | Write a multi-stage Dockerfile, manage dependencies, handle environment variables, and deploy a containerised service to a server. |
| 23 | Alerting on Content Quality Issues | 3 | Operations | Build a notification system (Telegram, email) that fires when content receives downvotes, sources fail repeatedly, or quality scores drop. |
| 24 | Building a Daily Digest Newsletter Pipeline | 3 | Integration | Collect top articles, render an HTML email template, integrate with MailerLite, and schedule daily sends with subscriber management. |
| 25 | Mocking HTTP Requests for Deterministic Tests | 2 | Testing | Use respx to intercept and mock HTTP calls in pytest. Write tests that don't depend on external services being available. |
| 26 | Testing LLM Integrations Without Burning Credits | 2 | Testing | Build mock LLM providers, fixture-based response testing, and dry-run modes so you can test your pipeline for free. |
| 27 | Dry-Run Modes for Safe Development | 1 | Testing | Implement --dry-run flags that execute the full pipeline without side effects. Essential for debugging and safe iteration. |
