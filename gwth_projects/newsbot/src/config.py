"""Newsbot configuration — settings, source definitions, and schedule."""

from __future__ import annotations

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")

    # LLM — primary provider for scrape command
    anthropic_api_key: str = Field(default="", alias="ANTHROPIC_API_KEY")
    llm_model: str = Field(default="claude-haiku-4-5-20251001", alias="NEWSBOT_LLM_MODEL")

    # LLM — provider API keys (for benchmark and multi-provider support)
    deepseek_api_key: str = Field(default="", alias="DEEPSEEK_API_KEY")
    groq_api_key: str = Field(default="", alias="GROQ_API_KEY")
    zhipu_api_key: str = Field(default="", alias="ZHIPU_API_KEY")
    moonshot_api_key: str = Field(default="", alias="MOONSHOT_API_KEY")
    dashscope_api_key: str = Field(default="", alias="DASHSCOPE_API_KEY")
    mistral_api_key: str = Field(default="", alias="MISTRAL_API_KEY")

    # Ollama (local)
    ollama_base_url: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")
    ollama_model: str = Field(default="qwen2.5:7b", alias="OLLAMA_MODEL")

    # Runtime
    log_level: str = Field(default="INFO", alias="NEWSBOT_LOG_LEVEL")
    dry_run: bool = Field(default=False, alias="NEWSBOT_DRY_RUN")

    # Revalidation (Phase 2)
    gwth_url: str = Field(default="", alias="GWTH_URL")
    revalidation_secret: str = Field(default="", alias="REVALIDATION_SECRET")

    # Alerting (Phase 2)
    telegram_bot_token: str = Field(default="", alias="TELEGRAM_BOT_TOKEN")
    telegram_chat_id: str = Field(default="", alias="TELEGRAM_CHAT_ID")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


# ─── News source definitions ────────────────────────────────────────────────

CATEGORIES = ("ai-launch", "research", "tool", "industry", "tutorial")

# Each source: (name, url, type, default_category, check_every_run)
RSS_SOURCES: list[dict] = [
    {
        "name": "OpenAI Blog",
        "url": "https://openai.com/blog/rss.xml",
        "category": "ai-launch",
    },
    # Anthropic has no RSS feed — will use HTML scraper in Phase 2
    {
        "name": "AI News (Artificial Intelligence News)",
        "url": "https://www.artificialintelligence-news.com/feed/",
        "category": "industry",
    },
    {
        "name": "Google AI Blog",
        "url": "https://blog.google/technology/ai/rss/",
        "category": "ai-launch",
    },
    {
        "name": "Hugging Face Blog",
        "url": "https://huggingface.co/blog/feed.xml",
        "category": "tool",
    },
    {
        "name": "The Verge AI",
        "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
        "category": "industry",
    },
    {
        "name": "Ars Technica",
        "url": "https://feeds.arstechnica.com/arstechnica/technology-lab",
        "category": "industry",
    },
    {
        "name": "MIT Technology Review",
        "url": "https://www.technologyreview.com/feed/",
        "category": "research",
    },
    {
        "name": "TechCrunch AI",
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
        "category": "industry",
    },
    {
        "name": "The Register AI",
        "url": "https://www.theregister.com/software/ai_ml/headlines.atom",
        "category": "industry",
    },
    {
        "name": "VentureBeat AI",
        "url": "https://venturebeat.com/category/ai/feed/",
        "category": "industry",
    },
    {
        "name": "Simon Willison",
        "url": "https://simonwillison.net/atom/everything/",
        "category": "tool",
    },
    {
        "name": "Hacker News AI",
        "url": "https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT+OR+Claude",
        "category": "industry",
    },
    {
        "name": "Lilian Weng",
        "url": "https://lilianweng.github.io/index.xml",
        "category": "research",
    },
    {
        "name": "Sebastian Raschka",
        "url": "https://magazine.sebastianraschka.com/feed",
        "category": "research",
    },
    {
        "name": "Towards Data Science",
        "url": "https://towardsdatascience.com/feed",
        "category": "tutorial",
    },
]

# Minimum importance score (0-10) for an article to be published
MIN_IMPORTANCE_SCORE = 3

# Maximum articles to process per run (cost control)
MAX_ARTICLES_PER_RUN = 50

# Deduplication title similarity threshold (0-100)
DEDUP_TITLE_THRESHOLD = 85

# HTTP request timeout in seconds
HTTP_TIMEOUT = 30

# User-Agent for polite scraping
USER_AGENT = "Newsbot/0.1 (+https://newsbot.biz; AI news aggregator)"


# ─── LLM Provider Registry ──────────────────────────────────────────────────

# Each provider: name, base_url, model, cost_per_million_input, cost_per_million_output
# Costs in USD per 1M tokens (as of March 2026)
PROVIDER_REGISTRY: list[dict] = [
    {
        "id": "deepseek-v3",
        "name": "DeepSeek V3.2",
        "base_url": "https://api.deepseek.com",
        "model": "deepseek-chat",
        "api_key_env": "DEEPSEEK_API_KEY",
        "cost_input": 0.14,
        "cost_output": 0.28,
        "provider_type": "openai",
    },
    {
        "id": "groq-llama",
        "name": "Groq (Llama 3.3 70B)",
        "base_url": "https://api.groq.com/openai",
        "model": "llama-3.3-70b-versatile",
        "api_key_env": "GROQ_API_KEY",
        "cost_input": 0.0,
        "cost_output": 0.0,
        "provider_type": "openai",
    },
    {
        "id": "zhipu-glm5",
        "name": "GLM-5 (Zhipu AI)",
        "base_url": "https://open.bigmodel.cn/api/paas/v4",
        "model": "glm-4-plus",
        "api_key_env": "ZHIPU_API_KEY",
        "cost_input": 0.70,
        "cost_output": 0.70,
        "provider_type": "openai",
    },
    {
        "id": "moonshot-kimi",
        "name": "Kimi K2.5 (Moonshot)",
        "base_url": "https://api.moonshot.cn",
        "model": "moonshot-v1-8k",
        "api_key_env": "MOONSHOT_API_KEY",
        "cost_input": 0.85,
        "cost_output": 0.85,
        "provider_type": "openai",
    },
    {
        "id": "qwen-plus",
        "name": "Qwen 3.5 (Alibaba)",
        "base_url": "https://dashscope.aliyuncs.com/compatible-mode",
        "model": "qwen-plus",
        "api_key_env": "DASHSCOPE_API_KEY",
        "cost_input": 0.80,
        "cost_output": 2.00,
        "provider_type": "openai",
    },
    {
        "id": "mistral-small",
        "name": "Mistral Small",
        "base_url": "https://api.mistral.ai",
        "model": "mistral-small-latest",
        "api_key_env": "MISTRAL_API_KEY",
        "cost_input": 0.10,
        "cost_output": 0.30,
        "provider_type": "openai",
    },
    {
        "id": "ollama-local",
        "name": "Ollama Local (Qwen 2.5 7B)",
        "base_url": "http://localhost:11434",
        "model": "qwen2.5:7b",
        "api_key_env": "",
        "cost_input": 0.0,
        "cost_output": 0.0,
        "provider_type": "ollama",
    },
]

# Number of articles to use in benchmark (small sample for cost control)
BENCHMARK_SAMPLE_SIZE = 5
