"""Tests for deduplication logic."""

from __future__ import annotations

import pytest

from src.models import RawArticle
from src.processing.dedup import Deduplicator


def _make_article(url: str = "https://example.com/article", title: str = "Test Article") -> RawArticle:
    return RawArticle(
        source_name="Test",
        source_url=url,
        title=title,
        content_snippet="Some content",
    )


def test_dedup_exact_url_match():
    """Articles with URLs already in the database should be flagged as duplicates."""
    dedup = Deduplicator(
        known_urls={"https://example.com/existing-article"},
        known_titles=[],
    )
    article = _make_article(url="https://example.com/existing-article")
    assert dedup.is_duplicate(article) is True


def test_dedup_url_normalisation():
    """URL comparison should normalise trailing slashes and tracking params."""
    dedup = Deduplicator(
        known_urls={"https://example.com/article"},
        known_titles=[],
    )
    # Trailing slash
    assert dedup.is_duplicate(_make_article(url="https://example.com/article/")) is True
    # UTM params
    assert dedup.is_duplicate(
        _make_article(url="https://example.com/article?utm_source=twitter&utm_medium=social")
    ) is True
    # Fragment
    assert dedup.is_duplicate(
        _make_article(url="https://example.com/article#section-2")
    ) is True


def test_dedup_title_similarity():
    """Articles with very similar titles should be flagged as duplicates."""
    dedup = Deduplicator(
        known_urls=set(),
        known_titles=["Claude 4 Released with Amazing New Features"],
    )
    # Very similar title
    article = _make_article(
        url="https://other.com/new",
        title="Claude 4 Released with Amazing New Feature",
    )
    assert dedup.is_duplicate(article) is True


def test_dedup_different_title_passes():
    """Articles with sufficiently different titles should not be flagged."""
    dedup = Deduplicator(
        known_urls=set(),
        known_titles=["Claude 4 Released with Amazing New Features"],
    )
    article = _make_article(
        url="https://other.com/new",
        title="OpenAI Launches GPT-5 with Extended Context Window",
    )
    assert dedup.is_duplicate(article) is False


def test_dedup_intra_batch():
    """Duplicate articles within the same batch should be caught."""
    dedup = Deduplicator(known_urls=set(), known_titles=[])

    article1 = _make_article(url="https://example.com/a", title="First Article")
    article2 = _make_article(url="https://example.com/a", title="Different Title")

    assert dedup.is_duplicate(article1) is False
    assert dedup.is_duplicate(article2) is True  # Same URL


def test_filter_new():
    """filter_new should return only non-duplicate articles."""
    dedup = Deduplicator(
        known_urls={"https://example.com/old"},
        known_titles=["Old Article Title"],
    )
    articles = [
        _make_article(url="https://example.com/old", title="Old Article Title"),
        _make_article(url="https://example.com/new1", title="Brand New Article"),
        _make_article(url="https://example.com/new2", title="Another New Article"),
    ]

    new, skipped = dedup.filter_new(articles)
    assert len(new) == 2
    assert skipped == 1
    assert new[0].title == "Brand New Article"


def test_dedup_case_insensitive_url():
    """URL dedup should be case-insensitive."""
    dedup = Deduplicator(
        known_urls={"https://example.com/article"},
        known_titles=[],
    )
    assert dedup.is_duplicate(
        _make_article(url="https://Example.COM/Article")
    ) is True
