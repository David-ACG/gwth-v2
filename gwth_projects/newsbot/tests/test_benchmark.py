"""Tests for the benchmark module."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, patch

import pytest

from src.models import RawArticle
from src.processing.benchmark import (
    _estimate_cost,
    _estimate_tokens,
    benchmark_article,
)
from src.processing.llm_processor import LLMProvider


# ─── Fixtures ────────────────────────────────────────────────────────────────

SAMPLE_ARTICLE = RawArticle(
    source_name="Test Source",
    source_url="https://example.com/article-1",
    title="New AI Model Released",
    content_snippet="A new large language model has been released today.",
)

VALID_JSON_RESPONSE = json.dumps({
    "slug": "new-ai-model-released",
    "title": "New AI Model Released",
    "excerpt": "A new LLM has been released.",
    "content": "A significant new model was released today.",
    "category": "ai-launch",
    "tags": ["llm", "ai"],
    "importance_score": 7,
})

PROVIDER_ENTRY = {
    "id": "test-provider",
    "name": "Test Provider",
    "model": "test-model-v1",
    "cost_input": 0.50,
    "cost_output": 1.00,
    "provider_type": "openai",
    "base_url": "https://api.test.com",
    "api_key_env": "TEST_API_KEY",
}


class MockProvider(LLMProvider):
    def __init__(self, response: str):
        self._response = response

    async def complete(self, system: str, user: str) -> str:
        return self._response


class FailingProvider(LLMProvider):
    async def complete(self, system: str, user: str) -> str:
        raise ConnectionError("Provider unavailable")


# ─── Tests ───────────────────────────────────────────────────────────────────


def test_estimate_tokens():
    assert _estimate_tokens("hello world") == 2  # 11 chars // 4
    assert _estimate_tokens("") == 0
    assert _estimate_tokens("a" * 400) == 100


def test_estimate_cost():
    # 1000 input tokens at $0.50/M + 500 output tokens at $1.00/M
    cost = _estimate_cost(1000, 500, 0.50, 1.00)
    assert abs(cost - 0.001) < 0.0001


@pytest.mark.asyncio
async def test_benchmark_article_success():
    provider = MockProvider(VALID_JSON_RESPONSE)
    result = await benchmark_article(SAMPLE_ARTICLE, PROVIDER_ENTRY, provider)

    assert result.success is True
    assert result.json_valid is True
    assert result.fields_complete is True
    assert result.importance_score == 7
    assert result.category == "ai-launch"
    assert result.provider_id == "test-provider"
    assert result.latency_ms >= 0
    assert result.estimated_cost_usd > 0


@pytest.mark.asyncio
async def test_benchmark_article_invalid_json():
    provider = MockProvider("This is not JSON at all")
    result = await benchmark_article(SAMPLE_ARTICLE, PROVIDER_ENTRY, provider)

    assert result.success is True  # API call succeeded
    assert result.json_valid is False
    assert result.fields_complete is False


@pytest.mark.asyncio
async def test_benchmark_article_missing_fields():
    partial = json.dumps({"slug": "test", "title": "Test"})
    provider = MockProvider(partial)
    result = await benchmark_article(SAMPLE_ARTICLE, PROVIDER_ENTRY, provider)

    assert result.success is True
    assert result.json_valid is True
    assert result.fields_complete is False


@pytest.mark.asyncio
async def test_benchmark_article_provider_error():
    provider = FailingProvider()
    result = await benchmark_article(SAMPLE_ARTICLE, PROVIDER_ENTRY, provider)

    assert result.success is False
    assert result.error == "Provider unavailable"
    assert result.latency_ms >= 0


@pytest.mark.asyncio
async def test_benchmark_article_markdown_fencing():
    fenced = f"```json\n{VALID_JSON_RESPONSE}\n```"
    provider = MockProvider(fenced)
    result = await benchmark_article(SAMPLE_ARTICLE, PROVIDER_ENTRY, provider)

    assert result.success is True
    assert result.json_valid is True
    assert result.fields_complete is True


@pytest.mark.asyncio
async def test_benchmark_free_provider_zero_cost():
    free_entry = {**PROVIDER_ENTRY, "cost_input": 0.0, "cost_output": 0.0}
    provider = MockProvider(VALID_JSON_RESPONSE)
    result = await benchmark_article(SAMPLE_ARTICLE, free_entry, provider)

    assert result.estimated_cost_usd == 0.0
