"""RSS/Atom feed scraper using feedparser."""

from __future__ import annotations

import html
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import feedparser
import httpx
import structlog

from src.config import HTTP_TIMEOUT, USER_AGENT
from src.models import RawArticle
from src.scrapers.base import BaseScraper

logger = structlog.get_logger()


def _parse_date(entry: dict) -> datetime | None:
    """Extract publication date from a feed entry."""
    for field in ("published", "updated", "created"):
        raw = entry.get(field)
        if not raw:
            continue
        try:
            return parsedate_to_datetime(raw)
        except (ValueError, TypeError):
            pass
        # feedparser also provides *_parsed as a time.struct_time
        parsed = entry.get(f"{field}_parsed")
        if parsed:
            try:
                return datetime(*parsed[:6], tzinfo=timezone.utc)
            except (ValueError, TypeError):
                pass
    return None


def _extract_snippet(entry: dict) -> str:
    """Get the best content snippet from a feed entry (plain text, max ~500 chars)."""
    # Prefer summary, then content, then description
    raw = ""
    if entry.get("summary"):
        raw = entry["summary"]
    elif entry.get("content"):
        # content is a list of dicts with 'value'
        raw = entry["content"][0].get("value", "")
    elif entry.get("description"):
        raw = entry["description"]

    # Strip HTML tags naively (good enough for snippets)
    import re

    text = re.sub(r"<[^>]+>", " ", raw)
    text = html.unescape(text)
    text = " ".join(text.split())  # collapse whitespace
    return text[:500]


def _extract_tags(entry: dict) -> list[str]:
    """Extract tags/categories from a feed entry."""
    tags = []
    for tag_info in entry.get("tags", []):
        term = tag_info.get("term", "").strip().lower()
        if term and len(term) < 50:
            tags.append(term)
    return tags[:10]


class RSSFeedScraper(BaseScraper):
    """Fetches and parses RSS/Atom feeds."""

    def __init__(self, client: httpx.AsyncClient | None = None):
        self._client = client

    async def fetch(self, source: dict) -> list[RawArticle]:
        """Fetch articles from an RSS/Atom feed.

        Args:
            source: Dict with 'name', 'url', 'category'.

        Returns:
            List of RawArticle instances.
        """
        name = source["name"]
        url = source["url"]
        log = logger.bind(source=name, url=url)

        try:
            client = self._client or httpx.AsyncClient(
                timeout=HTTP_TIMEOUT,
                headers={"User-Agent": USER_AGENT},
                follow_redirects=True,
            )
            manage_client = self._client is None

            try:
                response = await client.get(url)
                response.raise_for_status()
            finally:
                if manage_client:
                    await client.aclose()

            feed = feedparser.parse(response.text)

            if feed.bozo and not feed.entries:
                log.warning("feed_parse_error", error=str(feed.bozo_exception))
                return []

            articles = []
            for entry in feed.entries:
                link = entry.get("link", "").strip()
                title = entry.get("title", "").strip()
                if not link or not title:
                    continue

                articles.append(
                    RawArticle(
                        source_name=name,
                        source_url=link,
                        title=title,
                        content_snippet=_extract_snippet(entry),
                        author=entry.get("author", ""),
                        tags=_extract_tags(entry),
                        published_at=_parse_date(entry),
                    )
                )

            log.info("feed_fetched", article_count=len(articles))
            return articles

        except httpx.HTTPStatusError as exc:
            log.error("feed_http_error", status=exc.response.status_code)
            return []
        except httpx.RequestError as exc:
            log.error("feed_request_error", error=str(exc))
            return []
        except Exception as exc:
            log.error("feed_unexpected_error", error=str(exc))
            return []
