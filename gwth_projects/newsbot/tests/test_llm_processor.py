"""Tests for LLM processor with mocked provider."""

from __future__ import annotations

import json
import pytest

from src.models import RawArticle
from src.processing.llm_processor import LLMProcessor, LLMProvider, _parse_llm_response


class MockProvider(LLMProvider):
    """Mock LLM provider that returns a predefined response."""

    def __init__(self, response: str):
        self._response = response

    async def complete(self, system: str, user: str) -> str:
        return self._response


class FailingProvider(LLMProvider):
    """Mock LLM provider that raises an error."""

    async def complete(self, system: str, user: str) -> str:
        raise RuntimeError("LLM unavailable")


def _make_raw() -> RawArticle:
    return RawArticle(
        source_name="Test Blog",
        source_url="https://example.com/article",
        title="Test AI Article",
        content_snippet="This is a test article about AI developments.",
    )


VALID_LLM_RESPONSE = json.dumps({
    "slug": "test-ai-article",
    "title": "Test AI Article — Major Development",
    "excerpt": "A major AI development has been announced.",
    "content": "## What Happened\n\nA significant AI development.\n\n## Why It Matters\n\nThis changes everything.",
    "category": "ai-launch",
    "tags": ["ai", "test", "development"],
    "importance_score": 7,
})


@pytest.mark.asyncio
async def test_process_valid_response():
    """Processor should correctly parse a valid LLM JSON response."""
    provider = MockProvider(VALID_LLM_RESPONSE)
    processor = LLMProcessor(provider)

    result = await processor.process(_make_raw())

    assert result is not None
    assert result.slug == "test-ai-article"
    assert result.title == "Test AI Article — Major Development"
    assert result.category == "ai-launch"
    assert result.importance_score == 7
    assert result.source_url == "https://example.com/article"
    assert "ai" in result.tags


@pytest.mark.asyncio
async def test_process_with_markdown_fencing():
    """Processor should strip markdown code fencing from LLM response."""
    fenced = f"```json\n{VALID_LLM_RESPONSE}\n```"
    provider = MockProvider(fenced)
    processor = LLMProcessor(provider)

    result = await processor.process(_make_raw())

    assert result is not None
    assert result.slug == "test-ai-article"


@pytest.mark.asyncio
async def test_process_invalid_json():
    """Processor should return None for invalid JSON responses."""
    provider = MockProvider("This is not JSON at all")
    processor = LLMProcessor(provider)

    result = await processor.process(_make_raw())

    assert result is None


@pytest.mark.asyncio
async def test_process_missing_fields():
    """Processor should return None when required fields are missing."""
    incomplete = json.dumps({"slug": "test", "title": "Test"})  # Missing excerpt, content, etc.
    provider = MockProvider(incomplete)
    processor = LLMProcessor(provider)

    result = await processor.process(_make_raw())

    assert result is None


@pytest.mark.asyncio
async def test_process_provider_error():
    """Processor should return None when the LLM provider fails."""
    provider = FailingProvider()
    processor = LLMProcessor(provider)

    result = await processor.process(_make_raw())

    assert result is None


@pytest.mark.asyncio
async def test_process_batch():
    """Batch processing should return only successfully processed articles."""
    provider = MockProvider(VALID_LLM_RESPONSE)
    processor = LLMProcessor(provider)

    articles = [_make_raw(), _make_raw(), _make_raw()]
    results = await processor.process_batch(articles)

    assert len(results) == 3
    assert all(r.slug == "test-ai-article" for r in results)


@pytest.mark.asyncio
async def test_process_batch_with_failures():
    """Batch processing should skip failures and return successful ones."""

    class AlternatingProvider(LLMProvider):
        def __init__(self):
            self._call_count = 0

        async def complete(self, system: str, user: str) -> str:
            self._call_count += 1
            if self._call_count % 2 == 0:
                return "invalid json"
            return VALID_LLM_RESPONSE

    provider = AlternatingProvider()
    processor = LLMProcessor(provider)

    articles = [_make_raw() for _ in range(4)]
    results = await processor.process_batch(articles)

    # Calls 1, 3 succeed; calls 2, 4 fail
    assert len(results) == 2
