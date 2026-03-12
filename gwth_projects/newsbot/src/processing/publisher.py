"""Supabase publisher — writes processed articles to the news_articles table."""

from __future__ import annotations

from datetime import datetime, timezone

import structlog
from supabase import AsyncClient as SupabaseClient

from src.config import MIN_IMPORTANCE_SCORE
from src.models import ProcessedArticle, RawArticle

logger = structlog.get_logger()


class Publisher:
    """Publishes processed articles to Supabase."""

    def __init__(self, supabase: SupabaseClient):
        self._db = supabase

    async def get_known_urls(self, days: int = 30) -> set[str]:
        """Fetch URLs of articles published in the last N days for dedup."""
        from datetime import timedelta

        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        response = (
            await self._db.table("news_articles")
            .select("url")
            .not_.is_("url", "null")
            .gte("published_at", cutoff)
            .execute()
        )
        return {row["url"] for row in response.data if row.get("url")}

    async def get_known_titles(self, days: int = 30) -> list[str]:
        """Fetch titles of articles published in the last N days for dedup."""
        from datetime import timedelta

        cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        response = (
            await self._db.table("news_articles")
            .select("title")
            .gte("published_at", cutoff)
            .execute()
        )
        return [row["title"] for row in response.data if row.get("title")]

    async def publish(self, article: ProcessedArticle) -> bool:
        """Insert a single processed article into news_articles.

        Returns True if published, False if skipped or errored.
        """
        log = logger.bind(slug=article.slug, title=article.title)

        if article.importance_score < MIN_IMPORTANCE_SCORE:
            log.info("article_below_threshold", score=article.importance_score)
            return False

        try:
            await (
                self._db.table("news_articles")
                .insert(
                    {
                        "slug": article.slug,
                        "title": article.title,
                        "excerpt": article.excerpt,
                        "content": article.content,
                        "url": article.source_url,
                        "category": article.category,
                        "tags": article.tags,
                        "author": "Newsbot",
                        "status": "published",
                        "published_at": (
                            article.published_at.isoformat()
                            if article.published_at
                            else datetime.now(timezone.utc).isoformat()
                        ),
                        "vote_count": 0,
                        "comment_count": 0,
                        "is_featured": article.importance_score >= 8,
                    }
                )
                .execute()
            )
            log.info("article_published", importance=article.importance_score)
            return True

        except Exception as exc:
            # Handle unique constraint violation (slug already exists)
            if "duplicate key" in str(exc).lower() or "23505" in str(exc):
                log.info("article_slug_exists", slug=article.slug)
                return False
            log.error("publish_error", error=str(exc))
            return False

    async def publish_batch(self, articles: list[ProcessedArticle]) -> int:
        """Publish a batch of articles. Returns count of successfully published."""
        published = 0
        for article in articles:
            if await self.publish(article):
                published += 1
        return published

    async def archive_raw(self, article: RawArticle, result: dict | None = None) -> None:
        """Archive a raw article to newsbot_raw_articles for auditing."""
        try:
            await (
                self._db.table("newsbot_raw_articles")
                .insert(
                    {
                        "source_name": article.source_name,
                        "source_url": article.source_url,
                        "title": article.title,
                        "content_snippet": article.content_snippet[:2000],
                        "author": article.author or None,
                        "tags": article.tags,
                        "published_at": (
                            article.published_at.isoformat() if article.published_at else None
                        ),
                        "processed": result is not None,
                        "processing_result": result,
                        "importance_score": (
                            result.get("importance_score", 0) if result else 0
                        ),
                    }
                )
                .execute()
            )
        except Exception as exc:
            # Archive failures are non-fatal — log and continue
            if "duplicate key" not in str(exc).lower():
                logger.warning("archive_error", error=str(exc), url=article.source_url)

    async def delete_seed_articles(self) -> int:
        """Delete manually seeded articles (author = 'David' with non-null urls)."""
        response = (
            await self._db.table("news_articles")
            .delete()
            .eq("author", "David")
            .execute()
        )
        count = len(response.data) if response.data else 0
        logger.info("seed_articles_deleted", count=count)
        return count
