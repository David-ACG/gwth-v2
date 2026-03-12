"""Benchmark multiple LLM providers against the same articles."""

from __future__ import annotations

import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path

import structlog

from src.config import PROVIDER_REGISTRY
from src.models import ArticleBenchmark, BenchmarkRun, RawArticle
from src.processing.llm_processor import (
    SYSTEM_PROMPT,
    LLMProvider,
    OllamaProvider,
    OpenAICompatibleProvider,
    _build_user_prompt,
)

logger = structlog.get_logger()


def _estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token for English."""
    return len(text) // 4


def _estimate_cost(
    input_tokens: int,
    output_tokens: int,
    cost_input_per_m: float,
    cost_output_per_m: float,
) -> float:
    """Calculate estimated cost in USD."""
    return (input_tokens * cost_input_per_m + output_tokens * cost_output_per_m) / 1_000_000


def build_available_providers(settings) -> list[tuple[dict, LLMProvider]]:
    """Build provider instances for all providers that have API keys configured.

    Returns list of (registry_entry, provider_instance) tuples.
    """
    available = []

    for entry in PROVIDER_REGISTRY:
        api_key_env = entry["api_key_env"]

        if entry["provider_type"] == "ollama":
            # Ollama doesn't need an API key — check if base_url is reachable
            provider = OllamaProvider(
                base_url=entry.get("base_url", settings.ollama_base_url),
                model=entry.get("model", settings.ollama_model),
            )
            available.append((entry, provider))
            continue

        # For OpenAI-compatible providers, check for API key
        api_key = getattr(settings, api_key_env.lower(), "") or os.environ.get(api_key_env, "")
        if not api_key:
            logger.info("provider_skipped_no_key", provider=entry["name"], env_var=api_key_env)
            continue

        provider = OpenAICompatibleProvider(
            base_url=entry["base_url"],
            api_key=api_key,
            model=entry["model"],
        )
        available.append((entry, provider))

    return available


async def benchmark_article(
    article: RawArticle,
    entry: dict,
    provider: LLMProvider,
) -> ArticleBenchmark:
    """Benchmark a single provider against a single article."""
    user_prompt = _build_user_prompt(article)
    input_text = SYSTEM_PROMPT + user_prompt
    est_input_tokens = _estimate_tokens(input_text)

    result = ArticleBenchmark(
        article_title=article.title,
        article_url=article.source_url,
        provider_id=entry["id"],
        provider_name=entry["name"],
        model=entry["model"],
        latency_ms=0,
        success=False,
        estimated_input_tokens=est_input_tokens,
    )

    start = time.perf_counter()
    try:
        response_text = await provider.complete(SYSTEM_PROMPT, user_prompt)
        elapsed_ms = (time.perf_counter() - start) * 1000
        result.latency_ms = round(elapsed_ms, 1)
        result.success = True

        # Estimate output tokens
        est_output_tokens = _estimate_tokens(response_text)
        result.estimated_output_tokens = est_output_tokens
        result.estimated_cost_usd = _estimate_cost(
            est_input_tokens,
            est_output_tokens,
            entry["cost_input"],
            entry["cost_output"],
        )

        # Check JSON validity
        cleaned = response_text.strip()
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

        try:
            data = json.loads(cleaned)
            result.json_valid = True

            # Check field completeness
            required = {"slug", "title", "excerpt", "content", "category", "tags", "importance_score"}
            result.fields_complete = required.issubset(data.keys())

            result.importance_score = data.get("importance_score")
            result.category = data.get("category", "")
            result.title_rewritten = data.get("title", "")
            result.excerpt = data.get("excerpt", "")
            result.content = data.get("content", "")
            result.content_length = len(result.content)
            result.tags = data.get("tags", [])

        except json.JSONDecodeError:
            result.json_valid = False

    except Exception as exc:
        elapsed_ms = (time.perf_counter() - start) * 1000
        result.latency_ms = round(elapsed_ms, 1)
        result.error = str(exc)
        logger.error(
            "benchmark_provider_error",
            provider=entry["name"],
            article=article.title[:50],
            error=str(exc),
        )

    return result


async def run_benchmark(
    articles: list[RawArticle],
    settings,
) -> BenchmarkRun:
    """Run all configured providers against the sample articles.

    Returns a BenchmarkRun with all results.
    """
    providers = build_available_providers(settings)
    if not providers:
        logger.error("no_providers_configured")
        return BenchmarkRun()

    run = BenchmarkRun(
        articles_sampled=len(articles),
        providers_tested=len(providers),
    )

    logger.info(
        "benchmark_start",
        providers=[e["name"] for e, _ in providers],
        articles=len(articles),
    )

    for entry, provider in providers:
        logger.info("benchmark_provider_start", provider=entry["name"])
        for article in articles:
            result = await benchmark_article(article, entry, provider)
            run.results.append(result)
            status = "OK" if result.success else "FAIL"
            logger.info(
                "benchmark_article_done",
                provider=entry["id"],
                article=article.title[:40],
                status=status,
                latency_ms=result.latency_ms,
                json_valid=result.json_valid,
            )

    return run


def save_benchmark_results(run: BenchmarkRun, output_dir: str = "benchmark_results") -> str:
    """Save benchmark results to a JSON file and print a summary table.

    Returns the path to the saved file.
    """
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    timestamp = run.run_at.strftime("%Y-%m-%d_%H-%M-%S")
    filename = out_path / f"benchmark_{timestamp}.json"
    filename.write_text(run.model_dump_json(indent=2), encoding="utf-8")

    # Print summary table
    print(f"\n{'='*90}")
    print(f"BENCHMARK RESULTS — {run.run_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"Articles: {run.articles_sampled} | Providers: {run.providers_tested}")
    print(f"{'='*90}")

    # Aggregate by provider
    provider_stats: dict[str, dict] = {}
    for r in run.results:
        pid = r.provider_id
        if pid not in provider_stats:
            provider_stats[pid] = {
                "name": r.provider_name,
                "model": r.model,
                "total": 0,
                "success": 0,
                "json_valid": 0,
                "fields_complete": 0,
                "total_latency": 0.0,
                "total_cost": 0.0,
            }
        s = provider_stats[pid]
        s["total"] += 1
        if r.success:
            s["success"] += 1
            s["total_latency"] += r.latency_ms
        if r.json_valid:
            s["json_valid"] += 1
        if r.fields_complete:
            s["fields_complete"] += 1
        s["total_cost"] += r.estimated_cost_usd

    print(
        f"\n{'Provider':<25s} {'Model':<25s} {'OK':>3s} {'JSON':>5s} "
        f"{'Full':>5s} {'Avg ms':>8s} {'Cost $':>8s}"
    )
    print("-" * 90)

    for pid, s in provider_stats.items():
        avg_latency = s["total_latency"] / s["success"] if s["success"] else 0
        print(
            f"{s['name']:<25s} {s['model']:<25s} "
            f"{s['success']:>3d}/{s['total']:<1d} "
            f"{s['json_valid']:>4d} "
            f"{s['fields_complete']:>5d} "
            f"{avg_latency:>7.0f} "
            f"{s['total_cost']:>8.6f}"
        )

    print(f"\nResults saved to: {filename}")
    return str(filename)


def _flesch_kincaid_grade(text: str) -> float:
    """Calculate Flesch-Kincaid Grade Level for readability comparison."""
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    words = text.split()
    if not sentences or not words:
        return 0.0
    syllable_count = 0
    for word in words:
        word = word.lower().strip(".,!?;:\"'()-")
        # Simple syllable estimation
        vowels = "aeiou"
        count = 0
        prev_vowel = False
        for ch in word:
            is_vowel = ch in vowels
            if is_vowel and not prev_vowel:
                count += 1
            prev_vowel = is_vowel
        if word.endswith("e") and count > 1:
            count -= 1
        syllable_count += max(count, 1)
    avg_sentence_len = len(words) / len(sentences)
    avg_syllables = syllable_count / len(words)
    return round(0.39 * avg_sentence_len + 11.8 * avg_syllables - 15.59, 1)


def _avg_sentence_length(text: str) -> float:
    """Average words per sentence."""
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    words = text.split()
    if not sentences:
        return 0.0
    return round(len(words) / len(sentences), 1)


async def run_compare(
    article: RawArticle,
    settings,
) -> list[ArticleBenchmark]:
    """Run a single article through all providers for side-by-side quality comparison.

    Returns list of ArticleBenchmark with full content for human review.
    """
    providers = build_available_providers(settings)
    if not providers:
        logger.error("no_providers_configured")
        return []

    results = []
    for entry, provider in providers:
        result = await benchmark_article(article, entry, provider)
        results.append(result)

    return results


def print_comparison(article: RawArticle, results: list[ArticleBenchmark]) -> None:
    """Print a side-by-side quality comparison for human review."""
    print(f"\n{'='*90}")
    print("SIDE-BY-SIDE QUALITY COMPARISON")
    print(f"{'='*90}")
    print(f"Source:   {article.source_name}")
    print(f"Original: {article.title}")
    print(f"URL:      {article.source_url}")
    if article.content_snippet:
        snippet = article.content_snippet[:200] + "..." if len(article.content_snippet) > 200 else article.content_snippet
        print(f"Snippet:  {snippet}")
    print(f"{'='*90}")

    for r in results:
        print(f"\n{'-'*90}")
        print(f"PROVIDER: {r.provider_name} ({r.model})")
        print(f"Latency: {r.latency_ms:.0f}ms | Cost: ${r.estimated_cost_usd:.6f}")
        print(f"{'-'*90}")

        if not r.success:
            print(f"  [FAILED] {r.error}")
            continue

        if not r.json_valid:
            print("  [INVALID JSON]")
            continue

        print(f"  Title:      {r.title_rewritten}")
        print(f"  Category:   {r.category}")
        print(f"  Importance: {r.importance_score}/10")
        print(f"  Tags:       {', '.join(r.tags)}")
        print(f"  Excerpt:    {r.excerpt}")
        print()
        print(f"  Content ({r.content_length} chars):")
        # Indent content for readability
        for line in r.content.split("\n"):
            print(f"    {line}")

        # Readability metrics
        if r.content:
            fk = _flesch_kincaid_grade(r.content)
            avg_sl = _avg_sentence_length(r.content)
            word_count = len(r.content.split())
            print()
            print(f"  --- Quality Metrics ---")
            print(f"  Word count:         {word_count}")
            print(f"  Avg sentence len:   {avg_sl} words")
            print(f"  Flesch-Kincaid:     {fk} (grade level; lower = easier to read)")

    # Summary table
    print(f"\n{'='*90}")
    print("SUMMARY")
    print(f"{'='*90}")
    print(
        f"{'Provider':<22s} {'Latency':>8s} {'Cost':>10s} {'Score':>6s} "
        f"{'Words':>6s} {'FK Grade':>9s} {'Avg Sent':>9s}"
    )
    print("-" * 80)
    for r in results:
        if not r.success or not r.json_valid:
            print(f"{r.provider_name:<22s} {'FAIL':>8s}")
            continue
        fk = _flesch_kincaid_grade(r.content) if r.content else 0
        avg_sl = _avg_sentence_length(r.content) if r.content else 0
        words = len(r.content.split()) if r.content else 0
        print(
            f"{r.provider_name:<22s} {r.latency_ms:>7.0f}ms "
            f"${r.estimated_cost_usd:>8.6f} "
            f"{r.importance_score or 0:>5d} "
            f"{words:>6d} "
            f"{fk:>8.1f} "
            f"{avg_sl:>8.1f}"
        )
    print()


def save_comparison_markdown(
    article: RawArticle,
    results: list[ArticleBenchmark],
    output_dir: str = "benchmark_results",
) -> str:
    """Save comparison to a markdown file for lesson content."""
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
    filename = out_path / f"compare_{timestamp}.md"

    lines = [
        f"# LLM Quality Comparison — {timestamp}",
        "",
        f"## Source Article",
        f"- **Source:** {article.source_name}",
        f"- **Title:** {article.title}",
        f"- **URL:** {article.source_url}",
        "",
    ]

    if article.content_snippet:
        lines.append(f"**Original snippet:**")
        lines.append(f"> {article.content_snippet[:500]}")
        lines.append("")

    # Summary table
    lines.append("## Results Summary")
    lines.append("")
    lines.append(
        "| Provider | Model | Latency | Cost | Score | Words | FK Grade | Avg Sent Len |"
    )
    lines.append(
        "|----------|-------|---------|------|-------|-------|----------|-------------|"
    )

    for r in results:
        if not r.success or not r.json_valid:
            lines.append(f"| {r.provider_name} | {r.model} | FAIL | — | — | — | — | — |")
            continue
        fk = _flesch_kincaid_grade(r.content) if r.content else 0
        avg_sl = _avg_sentence_length(r.content) if r.content else 0
        words = len(r.content.split()) if r.content else 0
        lines.append(
            f"| {r.provider_name} | {r.model} | {r.latency_ms:.0f}ms | "
            f"${r.estimated_cost_usd:.6f} | {r.importance_score}/10 | "
            f"{words} | {fk} | {avg_sl} |"
        )

    lines.append("")

    # Full outputs
    for r in results:
        lines.append(f"## {r.provider_name} ({r.model})")
        lines.append("")
        if not r.success:
            lines.append(f"**FAILED:** {r.error}")
            lines.append("")
            continue
        if not r.json_valid:
            lines.append("**INVALID JSON**")
            lines.append("")
            continue

        lines.append(f"- **Title:** {r.title_rewritten}")
        lines.append(f"- **Category:** {r.category}")
        lines.append(f"- **Importance:** {r.importance_score}/10")
        lines.append(f"- **Tags:** {', '.join(r.tags)}")
        lines.append(f"- **Excerpt:** {r.excerpt}")
        lines.append("")
        lines.append("**Content:**")
        lines.append("")
        lines.append(r.content)
        lines.append("")

    filename.write_text("\n".join(lines), encoding="utf-8")
    print(f"Comparison saved to: {filename}")
    return str(filename)


async def save_benchmark_to_supabase(run: BenchmarkRun, settings) -> str | None:
    """Save benchmark results to Supabase for aggregation and apicompare.net.

    Returns the run_id UUID or None on failure.
    """
    if not settings.supabase_url or not settings.supabase_service_role_key:
        logger.warning("supabase_not_configured_skipping_save")
        return None

    from supabase import acreate_client

    supabase = await acreate_client(
        settings.supabase_url,
        settings.supabase_service_role_key,
    )

    # Insert the run
    run_data = {
        "run_at": run.run_at.isoformat(),
        "articles_sampled": run.articles_sampled,
        "providers_tested": run.providers_tested,
    }
    run_resp = await supabase.table("benchmark_runs").insert(run_data).execute()
    run_id = run_resp.data[0]["id"]
    logger.info("benchmark_run_saved", run_id=run_id)

    # Insert all results
    results_data = [
        {
            "run_id": run_id,
            "article_title": r.article_title,
            "article_url": r.article_url,
            "provider_id": r.provider_id,
            "provider_name": r.provider_name,
            "model": r.model,
            "latency_ms": r.latency_ms,
            "success": r.success,
            "error": r.error,
            "json_valid": r.json_valid,
            "fields_complete": r.fields_complete,
            "importance_score": r.importance_score,
            "category": r.category,
            "title_rewritten": r.title_rewritten,
            "excerpt": r.excerpt,
            "content_length": r.content_length,
            "estimated_input_tokens": r.estimated_input_tokens,
            "estimated_output_tokens": r.estimated_output_tokens,
            "estimated_cost_usd": r.estimated_cost_usd,
        }
        for r in run.results
    ]

    # Insert in batches of 50
    for i in range(0, len(results_data), 50):
        batch = results_data[i : i + 50]
        await supabase.table("benchmark_results").insert(batch).execute()

    logger.info("benchmark_results_saved", count=len(results_data), run_id=run_id)
    print(f"Saved to Supabase: run_id={run_id}, {len(results_data)} results")
    return run_id
