"""LLM-based article processor with provider abstraction."""

from __future__ import annotations

import json
import re
from abc import ABC, abstractmethod
from datetime import datetime

import structlog

from src.models import ProcessedArticle, RawArticle

logger = structlog.get_logger()

SYSTEM_PROMPT = """You are Newsbot, an AI news editor for GWTH.ai — a UK-based AI training platform.
Your job is to process raw news articles into structured, reader-friendly items.

For each article, produce a JSON object with these fields:
- "slug": URL-friendly slug (lowercase, hyphens, max 80 chars)
- "title": Clear, engaging headline (max 120 chars). Rewrite if the original is clickbait.
- "excerpt": 1-2 sentence summary for the news feed card (max 200 chars)
- "content": 2-4 paragraph markdown summary. Include what happened, why it matters for AI learners, key technical details, and UK angle if applicable.
- "category": One of: ai-launch, research, tool, industry, tutorial
- "tags": 3-5 lowercase tags (e.g. "claude", "openai", "llm", "agents", "uk-policy")
- "importance_score": 1-10 rating of significance for the AI community. Set to 0 if trivial or off-topic.

Rules:
- Write for a UK audience learning to build with AI — not for ML researchers
- Keep language clear and jargon-free
- Never fabricate details not in the source material
- Always output valid JSON only — no markdown fencing, no explanation text

Respond with ONLY the JSON object."""


def _build_user_prompt(article: RawArticle) -> str:
    """Build the user message for the LLM."""
    parts = [
        f"Source: {article.source_name}",
        f"URL: {article.source_url}",
        f"Title: {article.title}",
    ]
    if article.author:
        parts.append(f"Author: {article.author}")
    if article.tags:
        parts.append(f"Source tags: {', '.join(article.tags)}")
    if article.published_at:
        parts.append(f"Published: {article.published_at.isoformat()}")
    if article.content_snippet:
        parts.append(f"\nContent:\n{article.content_snippet}")
    return "\n".join(parts)


def _parse_llm_response(text: str, article: RawArticle) -> ProcessedArticle | None:
    """Parse the LLM JSON response into a ProcessedArticle."""
    # Strip markdown code fencing if present
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        logger.error("llm_json_parse_error", error=str(exc), raw=text[:200])
        return None

    try:
        return ProcessedArticle(
            slug=data["slug"],
            title=data["title"],
            excerpt=data["excerpt"],
            content=data["content"],
            source_url=article.source_url,
            source_name=article.source_name,
            category=data["category"],
            tags=data.get("tags", []),
            importance_score=data.get("importance_score", 0),
            published_at=article.published_at,
        )
    except (KeyError, ValueError) as exc:
        logger.error("llm_response_invalid", error=str(exc), data=data)
        return None


class LLMProvider(ABC):
    """Abstract LLM provider interface."""

    @abstractmethod
    async def complete(self, system: str, user: str) -> str:
        """Send a prompt to the LLM and return the text response."""
        ...


class AnthropicProvider(LLMProvider):
    """Claude API provider (requires ANTHROPIC_API_KEY)."""

    def __init__(self, api_key: str, model: str = "claude-haiku-4-5-20251001"):
        import anthropic

        self._client = anthropic.AsyncAnthropic(api_key=api_key)
        self._model = model

    async def complete(self, system: str, user: str) -> str:
        response = await self._client.messages.create(
            model=self._model,
            max_tokens=2000,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return response.content[0].text


class OllamaProvider(LLMProvider):
    """Ollama local LLM provider (OpenAI-compatible API)."""

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        model: str = "llama3.1",
    ):
        self._base_url = base_url.rstrip("/")
        self._model = model

    async def complete(self, system: str, user: str) -> str:
        import httpx

        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{self._base_url}/api/chat",
                json={
                    "model": self._model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "stream": False,
                    "format": "json",
                },
            )
            response.raise_for_status()
            return response.json()["message"]["content"]


class OpenAICompatibleProvider(LLMProvider):
    """Any OpenAI-compatible API (e.g., Groq, Together, vLLM)."""

    def __init__(self, base_url: str, api_key: str, model: str):
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._model = model

    async def complete(self, system: str, user: str) -> str:
        import httpx

        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(
                f"{self._base_url}/v1/chat/completions",
                headers={"Authorization": f"Bearer {self._api_key}"},
                json={
                    "model": self._model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "temperature": 0.3,
                },
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]


class LLMProcessor:
    """Processes raw articles through an LLM to produce structured output."""

    def __init__(self, provider: LLMProvider):
        self._provider = provider

    async def process(self, article: RawArticle) -> ProcessedArticle | None:
        """Process a single raw article through the LLM.

        Returns None if the article fails to process or is deemed irrelevant.
        """
        log = logger.bind(title=article.title, source=article.source_name)

        try:
            user_prompt = _build_user_prompt(article)
            response_text = await self._provider.complete(SYSTEM_PROMPT, user_prompt)
            result = _parse_llm_response(response_text, article)

            if result is None:
                log.warning("llm_process_failed")
                return None

            log.info(
                "article_processed",
                importance=result.importance_score,
                category=result.category,
            )
            return result

        except Exception as exc:
            log.error("llm_process_error", error=str(exc))
            return None

    async def process_batch(
        self, articles: list[RawArticle]
    ) -> list[ProcessedArticle]:
        """Process a batch of articles, returning only successfully processed ones."""
        results = []
        for article in articles:
            result = await self.process(article)
            if result is not None:
                results.append(result)
        return results
