"""Pydantic models for the Newsbot pipeline."""

from __future__ import annotations

from datetime import datetime, timezone
from pydantic import BaseModel, Field


class RawArticle(BaseModel):
    """An article as fetched from a source, before LLM processing."""

    source_name: str
    source_url: str
    title: str
    content_snippet: str = ""
    author: str = ""
    tags: list[str] = Field(default_factory=list)
    published_at: datetime | None = None
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProcessedArticle(BaseModel):
    """An article after LLM processing, ready for publishing."""

    slug: str
    title: str
    excerpt: str
    content: str
    source_url: str
    source_name: str
    category: str
    tags: list[str]
    importance_score: int = Field(ge=0, le=10)
    published_at: datetime | None = None


class ScrapeResult(BaseModel):
    """Summary of a single scrape run."""

    run_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sources_checked: int = 0
    sources_failed: int = 0
    raw_articles_fetched: int = 0
    duplicates_skipped: int = 0
    articles_processed: int = 0
    articles_published: int = 0
    articles_below_threshold: int = 0
    errors: list[str] = Field(default_factory=list)


class ArticleBenchmark(BaseModel):
    """Benchmark result for a single article processed by a single provider."""

    article_title: str
    article_url: str
    provider_id: str
    provider_name: str
    model: str
    latency_ms: float
    success: bool
    error: str = ""
    json_valid: bool = False
    fields_complete: bool = False
    importance_score: int | None = None
    category: str = ""
    title_rewritten: str = ""
    excerpt: str = ""
    content: str = ""
    content_length: int = 0
    tags: list[str] = Field(default_factory=list)
    estimated_input_tokens: int = 0
    estimated_output_tokens: int = 0
    estimated_cost_usd: float = 0.0


class BenchmarkRun(BaseModel):
    """Summary of a full benchmark run across all providers."""

    run_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    articles_sampled: int = 0
    providers_tested: int = 0
    results: list[ArticleBenchmark] = Field(default_factory=list)
