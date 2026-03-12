"""Base scraper interface."""

from __future__ import annotations

from abc import ABC, abstractmethod

from src.models import RawArticle


class BaseScraper(ABC):
    """Abstract base class for all news source scrapers."""

    @abstractmethod
    async def fetch(self, source: dict) -> list[RawArticle]:
        """Fetch articles from a single source.

        Args:
            source: Source config dict with 'name', 'url', 'category' keys.

        Returns:
            List of raw articles fetched from the source.
        """
        ...
