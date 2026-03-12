"""Tests for RSS feed scraper."""

from __future__ import annotations

import pytest
import httpx
import respx

from src.scrapers.rss_scraper import RSSFeedScraper

SAMPLE_RSS = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test AI Blog</title>
    <link>https://example.com</link>
    <item>
      <title>Claude 4 Released</title>
      <link>https://example.com/claude-4</link>
      <description>Anthropic releases Claude 4 with amazing capabilities.</description>
      <pubDate>Wed, 12 Mar 2026 10:00:00 GMT</pubDate>
      <author>Test Author</author>
      <category>AI</category>
      <category>LLM</category>
    </item>
    <item>
      <title>GPT-5 Benchmark Results</title>
      <link>https://example.com/gpt5-bench</link>
      <description>New benchmarks show GPT-5 improvements across the board.</description>
      <pubDate>Tue, 11 Mar 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title></title>
      <link></link>
      <description>Entry with no title or link — should be skipped</description>
    </item>
  </channel>
</rss>"""

SAMPLE_ATOM = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Test Atom Feed</title>
  <entry>
    <title>Ollama 2.0 Released</title>
    <link href="https://example.com/ollama-2"/>
    <summary>Run even bigger models locally.</summary>
    <updated>2026-03-10T12:00:00Z</updated>
    <author><name>Atom Author</name></author>
  </entry>
</feed>"""

SOURCE = {"name": "Test Source", "url": "https://example.com/feed.xml", "category": "tool"}


@respx.mock
@pytest.mark.asyncio
async def test_rss_scraper_fetches_articles():
    """RSS scraper should parse valid feed entries into RawArticle instances."""
    respx.get("https://example.com/feed.xml").mock(
        return_value=httpx.Response(200, text=SAMPLE_RSS)
    )

    scraper = RSSFeedScraper()
    articles = await scraper.fetch(SOURCE)

    # Should get 2 articles (3rd entry has no title/link)
    assert len(articles) == 2
    assert articles[0].title == "Claude 4 Released"
    assert articles[0].source_url == "https://example.com/claude-4"
    assert articles[0].source_name == "Test Source"
    assert "Anthropic releases" in articles[0].content_snippet
    assert articles[0].published_at is not None


@respx.mock
@pytest.mark.asyncio
async def test_rss_scraper_extracts_tags():
    """RSS scraper should extract category tags from entries."""
    respx.get("https://example.com/feed.xml").mock(
        return_value=httpx.Response(200, text=SAMPLE_RSS)
    )

    scraper = RSSFeedScraper()
    articles = await scraper.fetch(SOURCE)

    assert "ai" in articles[0].tags
    assert "llm" in articles[0].tags


@respx.mock
@pytest.mark.asyncio
async def test_rss_scraper_handles_atom():
    """RSS scraper should handle Atom feeds as well as RSS."""
    respx.get("https://example.com/feed.xml").mock(
        return_value=httpx.Response(200, text=SAMPLE_ATOM)
    )

    scraper = RSSFeedScraper()
    articles = await scraper.fetch(SOURCE)

    assert len(articles) == 1
    assert articles[0].title == "Ollama 2.0 Released"


@respx.mock
@pytest.mark.asyncio
async def test_rss_scraper_handles_http_error():
    """RSS scraper should return empty list on HTTP error."""
    respx.get("https://example.com/feed.xml").mock(
        return_value=httpx.Response(404)
    )

    scraper = RSSFeedScraper()
    articles = await scraper.fetch(SOURCE)

    assert articles == []


@respx.mock
@pytest.mark.asyncio
async def test_rss_scraper_handles_timeout():
    """RSS scraper should return empty list on timeout."""
    respx.get("https://example.com/feed.xml").mock(
        side_effect=httpx.ConnectTimeout("timeout")
    )

    scraper = RSSFeedScraper()
    articles = await scraper.fetch(SOURCE)

    assert articles == []


@respx.mock
@pytest.mark.asyncio
async def test_rss_scraper_handles_invalid_xml():
    """RSS scraper should handle malformed XML gracefully."""
    respx.get("https://example.com/feed.xml").mock(
        return_value=httpx.Response(200, text="<not valid xml at all")
    )

    scraper = RSSFeedScraper()
    articles = await scraper.fetch(SOURCE)

    # feedparser is very lenient — may return 0 entries rather than error
    assert isinstance(articles, list)
