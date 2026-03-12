"""Newsbot entry point — CLI and pipeline orchestration."""

from __future__ import annotations

import argparse
import asyncio
import sys

import structlog

from src.config import MAX_ARTICLES_PER_RUN, RSS_SOURCES, Settings
from src.models import ScrapeResult
from src.processing.dedup import Deduplicator
from src.processing.llm_processor import (
    AnthropicProvider,
    LLMProcessor,
    OllamaProvider,
)
from src.processing.publisher import Publisher
from src.scrapers.rss_scraper import RSSFeedScraper
from src.utils.logging import setup_logging

logger = structlog.get_logger()


async def run_scrape(settings: Settings, dry_run: bool = False) -> ScrapeResult:
    """Execute a full scrape run: fetch → dedup → process → publish.

    Args:
        settings: Application settings.
        dry_run: If True, scrape and process but don't write to Supabase.

    Returns:
        ScrapeResult with run statistics.
    """
    result = ScrapeResult()
    log = logger.bind(dry_run=dry_run)
    log.info("scrape_run_start", source_count=len(RSS_SOURCES))

    # ─── 1. Initialise Supabase ──────────────────────────────────────────────
    if not dry_run:
        from supabase import acreate_client

        supabase = await acreate_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
        publisher = Publisher(supabase)

        # Fetch known articles for dedup
        known_urls = await publisher.get_known_urls()
        known_titles = await publisher.get_known_titles()
    else:
        publisher = None
        known_urls = set()
        known_titles = []

    dedup = Deduplicator(known_urls, known_titles)

    # ─── 2. Scrape all RSS sources ──────────────────────────────────────────
    scraper = RSSFeedScraper()
    all_raw = []

    for source in RSS_SOURCES:
        result.sources_checked += 1
        try:
            articles = await scraper.fetch(source)
            all_raw.extend(articles)
        except Exception as exc:
            result.sources_failed += 1
            result.errors.append(f"{source['name']}: {exc}")
            log.error("source_failed", source=source["name"], error=str(exc))

    result.raw_articles_fetched = len(all_raw)
    log.info("scrape_fetched", total=len(all_raw), sources_failed=result.sources_failed)

    # ─── 3. Deduplicate ─────────────────────────────────────────────────────
    new_articles, skipped = dedup.filter_new(all_raw)
    result.duplicates_skipped = skipped
    log.info("dedup_complete", new=len(new_articles), skipped=skipped)

    # Cap per run
    if len(new_articles) > MAX_ARTICLES_PER_RUN:
        new_articles = new_articles[:MAX_ARTICLES_PER_RUN]
        log.info("articles_capped", cap=MAX_ARTICLES_PER_RUN)

    if not new_articles:
        log.info("scrape_run_complete_no_new")
        return result

    # ─── 4. LLM processing ──────────────────────────────────────────────────
    if settings.anthropic_api_key:
        provider = AnthropicProvider(settings.anthropic_api_key, settings.llm_model)
    else:
        # Fall back to Ollama
        provider = OllamaProvider()

    processor = LLMProcessor(provider)
    processed = await processor.process_batch(new_articles)
    result.articles_processed = len(processed)
    result.articles_below_threshold = sum(
        1 for a in processed if a.importance_score < 3
    )
    log.info("llm_processing_complete", processed=len(processed))

    # ─── 5. Publish ──────────────────────────────────────────────────────────
    if dry_run:
        log.info("dry_run_skip_publish", would_publish=len(processed))
        for p in processed:
            log.info(
                "dry_run_article",
                slug=p.slug,
                title=p.title,
                importance=p.importance_score,
                category=p.category,
            )
    elif publisher:
        published = await publisher.publish_batch(processed)
        result.articles_published = published
        log.info("publish_complete", published=published)

        # Archive raw articles
        for raw in new_articles:
            await publisher.archive_raw(raw)

    log.info("scrape_run_complete", **result.model_dump())
    return result


async def run_clean_seeds(settings: Settings) -> None:
    """Delete manually seeded articles from news_articles."""
    from supabase import acreate_client

    supabase = await acreate_client(
        settings.supabase_url,
        settings.supabase_service_role_key,
    )
    publisher = Publisher(supabase)
    count = await publisher.delete_seed_articles()
    logger.info("seed_cleanup_done", deleted=count)


def cli():
    """Command-line interface for Newsbot."""
    parser = argparse.ArgumentParser(description="Newsbot — AI news scraper")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # scrape command
    scrape_parser = subparsers.add_parser("scrape", help="Run a scrape cycle")
    scrape_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Scrape and process but don't publish to Supabase",
    )

    # clean-seeds command
    subparsers.add_parser("clean-seeds", help="Delete manually seeded articles")

    # test-feeds command
    subparsers.add_parser("test-feeds", help="Test RSS feed connectivity (no LLM)")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    # Load settings (allow missing API key for test-feeds)
    try:
        settings = Settings()  # type: ignore[call-arg]
    except Exception:
        if args.command == "test-feeds":
            settings = None
        else:
            raise

    setup_logging(settings.log_level if settings else "INFO")

    if args.command == "scrape":
        result = asyncio.run(run_scrape(settings, dry_run=args.dry_run or settings.dry_run))
        if result.errors:
            sys.exit(1)

    elif args.command == "clean-seeds":
        asyncio.run(run_clean_seeds(settings))

    elif args.command == "test-feeds":
        asyncio.run(_test_feeds())


async def _test_feeds():
    """Test connectivity to all RSS sources without LLM processing."""
    from src.scrapers.rss_scraper import RSSFeedScraper

    scraper = RSSFeedScraper()
    total = 0
    failed = 0

    for source in RSS_SOURCES:
        articles = await scraper.fetch(source)
        count = len(articles)
        total += count
        status = f"OK ({count} articles)" if count > 0 else "EMPTY or FAILED"
        if count == 0:
            failed += 1
        mark = "[OK]" if count else "[FAIL]"
        print(f"  {mark:6s} {source['name']:30s} {status}")

    print(f"\nTotal: {total} articles from {len(RSS_SOURCES)} sources ({failed} failed)")


if __name__ == "__main__":
    cli()
