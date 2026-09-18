# April 2026 Tool Ecosystem — Month 2 Edition

*Research spine for L1, L2. Written 2026-04-21. **Expected to age fastest of any Month 2 brief.***

Extends the Month-1 equivalent (`../month-1-research/05-april-2026-tool-ecosystem.md`) with the **production-builder** layer: IDEs, agent frameworks, backend services, observability, and the prescribed GWTH Month-2 stack.

## The prescription in one paragraph

For any Month 2 lesson, the default stack is: **Next.js 16 + TypeScript + shadcn/ui + Tailwind v4** for the app; **Supabase** for Auth + Postgres + pgvector + Storage + Edge Functions; **Claude Sonnet 4.6** (via Vercel AI SDK v5) as the default LLM with GPT-5 and Gemini 3 Pro as one-flag swaps; **Claude Agent SDK + MCP** for agent builds; **Claude Code + Cursor** as the dual-tool dev environment; **Vercel** (default) or **Coolify** (UK data sovereignty) for deploy; **Sentry + PostHog + Langfuse** for observability; **Stripe** for payments. Every alternative is relegated to a Lab.

## Coding IDEs — big-3 + challenger

| Tool | Strength (April 2026) | Pricing | GWTH role | Used in |
|------|----------------------|---------|-----------|---------|
| **Claude Code** | Terminal agent; best-in-class diff, tool-use, autonomous multi-file | Claude Pro / Max 5× ($100/mo) / Max 20× ($200/mo) | **DEFAULT terminal** | L2+ |
| **Cursor** | IDE with Composer mode, Tab completion, multi-agent (up to 8 parallel) | Pro $20/mo; Business $40/mo | **DEFAULT IDE** | L2+ |
| **OpenAI Codex CLI** | OpenAI's terminal agent; strong with GPT-5.x | Included in ChatGPT Plus/Pro | Big-3 alternative (Lab 2) | Lab only |
| **Gemini CLI** | Google's terminal agent; 1M-token native | Free with Google AI Pro | Big-3 alternative (Lab 2) | Lab only |
| **Windsurf** (Codeium) | IDE, Cascade agent; strong on codebase indexing | Pro $15/mo | **Challenger** (Lab 1) | Lab only |
| **Cline** (VS Code ext) | Open-source agent in VS Code; pluggable models | Free (pay for models) | Niche / Lab | Lab only |

**Why Claude Code + Cursor dual-tool?** In April 2026 Cursor's Composer is still the best interactive-IDE experience; Claude Code's terminal autonomy is best-in-class for multi-file work. The two complement each other: **Cursor for the flow, Claude Code for the heavy lifting.** Anthropic's Agentic Coding Trends Report (Feb 2026) shows the top-decile-productivity cohort of developers use both.

## Full-stack framework choice

| Framework | Strength | Pricing | GWTH role |
|-----------|----------|---------|-----------|
| **Next.js 16** (App Router, React 19, RSC, Turbopack) | Best-in-class TS full-stack; native Vercel deploy; huge AI-SDK support | Free (Node hosting costs) | **DEFAULT** |
| Remix | Runtime-agnostic; strong forms story | Free | Not taught |
| SvelteKit | Smaller bundles; rising popularity | Free | Lab option |
| Astro | Best for content sites | Free | Lab option |

## Backend + data + auth

| Tool | Strength | Pricing | GWTH role |
|------|----------|---------|-----------|
| **Supabase** (Postgres + Auth + pgvector + Storage + Edge Functions) | Single subscription; EU-west-2 region; strong DX | Free tier generous (500MB DB, 1GB storage); Pro $25/mo | **DEFAULT** |
| Neon + Clerk + Cloudflare R2 | Best-of-breed per slice | Free tiers sum to ~$0; paid ~$45/mo | Lab 6 |
| Firebase | Google's full-stack; NoSQL-first | Pay-as-you-go | Not preferred |
| Convex | Reactive DB + functions | $25/mo | Challenger (Lab 6) |

**EU-west-2 (London) region** is the right Supabase region for UK data. Teach this as a default.

## LLM providers (big 4 in April 2026)

| Provider | Flagship | Cost per 1M input/output tokens | Context | Strength |
|----------|----------|------------------------------------|---------|----------|
| Anthropic | Claude Opus 4.7 (GA 16 Apr 2026) | $15 / $75 | 1M | Reasoning + code |
| Anthropic | Claude Sonnet 4.6 | $3 / $15 | 1M | **Default workhorse** |
| Anthropic | Claude Haiku 4.5 | $0.80 / $4 | 200K | Cheap, fast |
| OpenAI | GPT-5 (Flagship) | $4 / $12 | 400K | All-rounder |
| OpenAI | GPT-5.3-Codex | $6 / $24 | 400K | Coding |
| OpenAI | GPT-5-mini | $0.40 / $1.60 | 400K | Cheap |
| Google | Gemini 3 Pro | $2.50 / $15 | 2M | Huge context |
| Google | Gemini 3 Flash | $0.30 / $2.50 | 1M | Cheap, fast |
| Meta | Llama 3.3 70B (via Groq / Cerebras / Together) | $0.40 / $0.60 | 128K | Open-weight |

**GWTH default:** Claude Sonnet 4.6 for everything except the Capstone Ask-the-tool chat (Opus 4.7 for quality) and cheap batch work (Haiku 4.5 or Gemini 3 Flash). Vercel AI SDK v5 lets students swap with one line.

## Vector DB

| Option | Strength | Cost | GWTH role |
|--------|----------|------|-----------|
| **Supabase pgvector** | Inside the same DB as user data; RLS-compatible | Included in Supabase | **DEFAULT** |
| Qdrant (self-host on Coolify) | Fastest OSS vector DB; great UK data sovereignty story | Free (VPS cost ~£4/mo) | Challenger (Lab 8) |
| Pinecone | Managed, serverless, fast | $70/mo starter | Lab only |
| Weaviate | OSS + managed; hybrid search native | Varies | Lab only |
| Turso Vector | SQLite-backed, edge-native | Pay-as-you-go | Lab only |

## Agent framework

| Framework | Strength | Pricing | GWTH role |
|-----------|----------|---------|-----------|
| **Claude Agent SDK** (TS + Python) | First-party from Anthropic; tight MCP integration | Free (pay LLM) | **DEFAULT** |
| OpenAI Agents SDK | First-party from OpenAI; good for GPT-5 | Free (pay LLM) | Lab 11 |
| LangGraph | Most mature OSS framework; graph-based | Free (pay LLM) | Lab 11, Optional O7 |
| CrewAI | Role-based; easy multi-agent | Free + paid cloud | Lab 11 |
| AWS Strands Agents | AWS-native; Bedrock integration | Pay-as-you-go | Lab 11 |
| Pydantic AI | Pydantic-first TypeScript equivalent in Python | Free | Lab only |

## Observability

| Tool | Coverage | Pricing | GWTH role |
|------|----------|---------|-----------|
| **Sentry** | Errors, performance, session replay | Free 5k events/mo; Team $26/mo | **DEFAULT** (errors) |
| **PostHog** | Product analytics, feature flags, session replay, experiments | Free 1M events/mo; paid scaling | **DEFAULT** (product) |
| **Langfuse** | LLM traces, evals, prompt management | Free self-host; Cloud $29/mo | **DEFAULT** (LLM) |
| LangSmith | LangChain-native LLM observability | $39/mo | Lab 16 |
| Braintrust | Evals + observability | Usage-based | Lab 16 |
| Helicone | LLM proxy observability | Free 10k/mo | Lab 16 |
| Phoenix (Arize) | OSS LLM observability | Free | Lab 16 |

## Voice agents (covered in detail in `17-voice-agents-april-2026.md`)

| Provider | Strength | UK-accent quality | GWTH role |
|----------|----------|-------------------|-----------|
| **ElevenLabs Agents** | Best-in-class voices; Twilio integration; UK-accent library | Excellent (RP, Scottish, Welsh, Northern) | **DEFAULT** |
| OpenAI Voice Agents | GPT-5-Voice real-time; low latency | Good (RP only by default) | Lab 13 |
| Vapi | Developer-first; bring-your-own-voice | Good | Lab 13 |
| Retell | Similar to Vapi | Good | Lab 13 |
| Google AI Voice | Gemini Live + TTS | Mixed | Lab 13 |

## Automation platforms (extends Month-1 `17-automation-platforms.md`)

| Tool | Strength | Pricing | GWTH role |
|------|----------|---------|-----------|
| **n8n 2.0** (self-host on Coolify) | 70 AI nodes; MCP integration; UK data sovereignty | Free (self-host) | **DEFAULT** for UK-data-sovereign |
| **Zapier Agents + Copilot** | Easiest; huge integration catalogue | Starter £20/mo; Pro £39/mo (Team £75/mo for Agents) | **DEFAULT** for quick wins |
| Make Maia | Best visual designer | €9/mo starter | Lab 15 |
| Pipedream | Code-first | Free tier | Lab 15 |

## Deployment

| Platform | Strength | Pricing | GWTH role |
|----------|----------|---------|-----------|
| **Vercel** | Best Next.js experience; previews; free tier | Free Hobby; Pro £20/mo | **DEFAULT** |
| **Coolify** (self-host on Hetzner / Scaleway UK) | Self-host; UK data sovereignty; one-click deploy | VPS £4–20/mo | **DEFAULT for UK sovereignty** |
| Netlify | Good alternative to Vercel | Free tier | Lab 18 |
| Railway | Docker-native | Pay-as-you-go | Lab 18 |
| Render | Similar to Railway | Pay-as-you-go | Lab 18 |
| Fly.io | Edge-native, Docker | Pay-as-you-go | Lab 18 |
| Cloudflare Workers | Edge-native, V8 isolates | Free tier generous | Lab 18 |

## Payments

| Provider | UK VAT handling | Pricing | GWTH role |
|----------|-----------------|---------|-----------|
| **Stripe** | Stripe Tax (~0.5% of transaction); Billing; Stripe UK entity | 1.5% + 20p (UK domestic) | **DEFAULT** |
| Lemon Squeezy | Merchant of Record (handles VAT) | 5% + 50¢ | Lab 17 |
| Paddle | MoR | 5% + 50¢ | Lab 17 |
| Polar.sh | Developer-first MoR; creator-friendly | 4% + 40¢ | Lab only |

## What's new since the Month 1 April 2026 snapshot

These are the items that changed between the Month 1 ecosystem brief (2026-04-20) and this Month 2 brief (2026-04-21):

- **Claude Opus 4.7** went GA 16 April 2026 — marginal recommendation change for high-reasoning capstone work.
- **Vercel AI SDK v5** landed with Zod v4 support, improved structured outputs, MCP client support. New default for API-caller work.
- **Supabase pgvector** added **HNSW index** improvements in April 2026 — teach this as default.
- **n8n 2.0** added **native MCP node** — enables agent+automation composition.
- **Claude for Chrome** rolled out to all paid tiers (including Claude Pro) in March 2026; now GWTH default for browser agents.
- **OpenClaw** (third-party) had a new CVE (CVE-2026-25253) in March 2026 — continues to be Labs-only with severe warnings.

## Prescription rationale — why these defaults?

1. **One language (TypeScript) reduces cognitive load.** Students who fought with Python vs JS in Feb-2026 cohorts lost ~8 hours to context switching. Staying in TS for frontend + backend + scripts + edge functions removes that tax.
2. **Supabase wins the single-subscription game.** One login, one bill, one admin UI for Postgres + Auth + Storage + Vectors + Edge Functions.
3. **Claude Code + Cursor is the empirically validated dual-tool workflow.** From Anthropic's Feb 2026 data + independent UK-developer surveys.
4. **CLIs + MCP together, CLIs first.** The majority of agentic-coding tool-use in April 2026 goes through CLIs invoked via Bash (`gh`, `supabase`, `stripe`, `vercel`, `aws`, `gcloud`, `git`, `ffmpeg`, `docker`). MCP earns its place for non-CLI surfaces (Gmail, Slack, web search, internal-wiki), for non-terminal runtimes (Claude Cowork, Claude for Chrome), and for cross-runtime portability. Teach both; default to CLI where one exists. *See `14-agents-and-mcp-april-2026.md` for the decision rule.*
5. **Vercel + Coolify covers both deployment demands.** Most students want fastest deploy (Vercel); UK-regulated clients need sovereignty (Coolify).

## Review cadence

This file needs re-checking **monthly** for price/version drift. Tool rankings stay relatively stable at 3-month intervals; pricing and version numbers drift weekly.

Last reviewed: 2026-04-21.

## Links

- Claude Code — https://docs.anthropic.com/en/docs/claude-code
- Cursor — https://www.cursor.com
- Vercel AI SDK v5 — https://sdk.vercel.ai
- Supabase — https://supabase.com
- Anthropic API pricing — https://www.anthropic.com/pricing
- OpenAI API pricing — https://openai.com/api/pricing
- Google AI pricing — https://ai.google.dev/pricing
- Groq pricing — https://groq.com/pricing
- Stripe UK — https://stripe.com/gb
