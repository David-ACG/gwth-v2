"""Deduplication logic — URL match and title similarity."""

from __future__ import annotations

from rapidfuzz import fuzz
import structlog

from src.config import DEDUP_TITLE_THRESHOLD
from src.models import RawArticle

logger = structlog.get_logger()


class Deduplicator:
    """Deduplicates articles against a set of known URLs and titles."""

    def __init__(self, known_urls: set[str], known_titles: list[str]):
        """
        Args:
            known_urls: Set of canonical URLs already in the database.
            known_titles: List of titles already in the database (for fuzzy match).
        """
        self._known_urls = {self._normalise_url(u) for u in known_urls}
        self._known_titles = known_titles
        # Also track URLs/titles seen within this run to avoid intra-batch dupes
        self._seen_urls: set[str] = set()
        self._seen_titles: list[str] = []

    @staticmethod
    def _normalise_url(url: str) -> str:
        """Normalise a URL for comparison — strip trailing slashes, fragments, tracking params."""
        url = url.strip().rstrip("/")
        # Strip common tracking params
        if "?" in url:
            base, query = url.split("?", 1)
            import urllib.parse

            params = urllib.parse.parse_qs(query)
            # Remove common tracking params
            for tracking in ("utm_source", "utm_medium", "utm_campaign", "ref", "source"):
                params.pop(tracking, None)
            clean_query = urllib.parse.urlencode(params, doseq=True)
            url = f"{base}?{clean_query}" if clean_query else base
        # Strip fragment
        url = url.split("#")[0]
        return url.lower()

    def _is_title_similar(self, title: str) -> bool:
        """Check if a title is too similar to any known title."""
        for known in self._known_titles + self._seen_titles:
            score = fuzz.ratio(title.lower(), known.lower())
            if score >= DEDUP_TITLE_THRESHOLD:
                return True
        return False

    def is_duplicate(self, article: RawArticle) -> bool:
        """Check whether an article is a duplicate.

        Args:
            article: The raw article to check.

        Returns:
            True if the article is a duplicate and should be skipped.
        """
        norm_url = self._normalise_url(article.source_url)

        # Check URL match (exact)
        if norm_url in self._known_urls or norm_url in self._seen_urls:
            logger.debug("dedup_url_match", url=article.source_url, title=article.title)
            return True

        # Check title similarity (fuzzy)
        if self._is_title_similar(article.title):
            logger.debug("dedup_title_match", title=article.title)
            return True

        # Not a dupe — register it for intra-batch dedup
        self._seen_urls.add(norm_url)
        self._seen_titles.append(article.title)
        return False

    def filter_new(self, articles: list[RawArticle]) -> tuple[list[RawArticle], int]:
        """Filter a list of articles, returning only new ones.

        Returns:
            Tuple of (new_articles, duplicates_skipped_count).
        """
        new = []
        skipped = 0
        for article in articles:
            if self.is_duplicate(article):
                skipped += 1
            else:
                new.append(article)
        return new, skipped
