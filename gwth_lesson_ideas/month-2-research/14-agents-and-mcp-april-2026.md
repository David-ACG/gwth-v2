# Agents + MCP — April 2026

*Research spine for L11. Written 2026-04-21. Extends Month-1 `15-agents-april-2026.md` into production-builder territory.*

## The MCP moment

In April 2026, the **Model Context Protocol** (Anthropic's open standard for connecting LLMs to tools, data, and workflows) has decisively won as the agent-tool protocol. The ecosystem at April 21, 2026:

- **300+ MCP servers** in the community registry.
- **Direct MCP support** in: Claude Code, Cursor, Windsurf, Claude Cowork (desktop + mobile), Claude for Chrome, Claude.ai web.
- **Indirect/bridged support** in: OpenAI Agents SDK, Google Gemini Code Assist, most LangGraph / CrewAI pipelines.
- **MCP inside automation platforms:** n8n 2.0 has a native MCP node (launched March 2026); Zapier Agents has an MCP bridge; Make Maia added MCP in April 2026.

The protocol is simple: a **server** exposes tools (functions), resources (data), and prompts (templates); a **client** (Claude, GPT, Gemini, whatever) discovers them at runtime and calls them as needed. JSON-RPC over stdio, SSE, or HTTP.

## Why no rival emerged

In early 2025, there were three plausible rivals to MCP:

1. **OpenAI function calling** — vendor-specific; no cross-model portability.
2. **LangChain tool abstractions** — framework-specific; too heavy.
3. **Anthropic MCP** — spec-first, open, under an MIT-ish licence.

By late 2025, OpenAI and Google both bridged to MCP rather than launch rivals. The decision was signalled publicly in November 2025 by OpenAI's Agents SDK docs shipping an MCP bridge. By Q1 2026, new tool-use integrations ship MCP-first.

## Agent frameworks in April 2026 (ranked for Month 2 prescription)

### Claude Agent SDK (TypeScript + Python) — GWTH default

- **Strengths:** First-party from Anthropic. Native MCP. Strong streaming. Good observability hooks. Works with the Vercel AI SDK.
- **Why default:** the dual-language choice matches the GWTH TS-first stack without forcing Python. Anthropic's own engineering team uses it internally — so it's well-maintained.
- **Gotchas:** newer than LangGraph (fewer community patterns); some advanced multi-agent orchestration cases are easier in LangGraph.

### OpenAI Agents SDK — Lab 11

- **Strengths:** GPT-5-optimised. Good Responses API integration. Native Computer Use.
- **Why not default:** OpenAI-specific; portability suffers.

### LangGraph — Lab 11 / Optional O7

- **Strengths:** Most mature OSS framework. Graph-based control flow. Excellent for the supervisor/manager-worker multi-agent pattern.
- **Why not default:** conceptually heavier for beginners. Better as the *upgrade* after Claude Agent SDK.

### CrewAI — Lab 11

- **Strengths:** Role-based multi-agent. Very pedagogically intuitive ("hire agents, give them roles, let them collaborate").
- **Why not default:** the role-based frame is cute but easy to over-engineer; most L11-scope tasks are single-step.

### AWS Strands Agents — Lab 11

- **Strengths:** AWS-native, Bedrock integration, corporate-friendly.
- **Why not default:** only relevant for AWS-committed shops; most GWTH students aren't there.

### Pydantic AI — Lab only

- **Strengths:** Pydantic-first; very type-safe; nice for Python-first shops.
- **Why not default:** Python-only; we're TS-first.

## Agent architectures (simplified for Month 2)

From OpenAI's "Practical Guide to Building Agents" (Dec 2024) and Anthropic's Agent SDK docs:

### 1. Single-step tool use

Agent reads input, calls one tool (or several in one LLM turn), returns output. Simple, safe, easy to observe. *Most L11 tasks are this.*

### 2. Multi-step plan-then-execute

Agent reads input, plans (may or may not be visible), executes steps sequentially (may call different tools each step). Re-plans on failure. *Useful for anything that takes more than 1 tool call.*

### 3. Manager-worker (a.k.a. supervisor)

A "manager" agent decomposes the task, delegates to "worker" agents (often specialised by tool/role), aggregates results. *This is Optional O7 territory — not core Month 2.*

### 4. Plan-act-observe (ReAct)

Classic ReAct loop: *plan, call a tool, observe the result, update the plan, repeat.* Most commercial agents (Cowork, Devin, SWE-agent) use this under the hood.

Month 2 teaches (1) and (2). (3) and (4) are optional.

## Observability: non-negotiable from L11

Every Month-2 agent build ships with:

- **Sentry** — any exception anywhere, captured with the relevant agent-loop context.
- **PostHog** — event for every tool call: `agent.tool.called` with tool name, cost, latency.
- **Langfuse** — full LLM trace: prompt, response, tokens, cost, tool-call tree. Students can watch their agent think.

These are free-tier offerings at GWTH's expected student scale. Teach them as defaults; upgrade only if the student's own app scales beyond free-tier.

## Cost control: the kill switch pattern

Every L11 agent starts with:

1. **Per-run budget.** `MAX_AGENT_COST_USD = 0.50` — after this, the loop terminates with a warning.
2. **Max iterations.** `MAX_ITERATIONS = 10` — prevents runaway infinite loops.
3. **Max tool calls.** `MAX_TOOL_CALLS = 20` — even if the agent thinks it's productive.
4. **Dry-run mode.** `--dry-run` as default; real actions require an explicit flag. The email-triage agent in L11 does a one-week dry run before any real reply is sent.
5. **Kill switch.** A simple env flag (`AGENT_KILL=1`) that the agent polls every iteration; if set, it exits gracefully.

The pattern comes straight from Anthropic's Agent SDK best-practices doc and from a16z Sivulka's "7 pillars of institutional AI" (where governance is pillar 7).

## MCP servers worth teaching by name (April 2026)

| MCP Server | Publisher | What it does | Used in GWTH |
|------------|-----------|--------------|--------------|
| `filesystem` | Anthropic | Read/write files in a sandbox | L11 |
| `gmail` | Community (Anthropic-blessed) | Read/send/label Gmail | L11 |
| `supabase` | Supabase | Postgres + Auth + Storage access | L11, Capstone |
| `slack` | Anthropic | Send messages / read threads | Capstone stretch |
| `hubspot` | HubSpot | CRM CRUD | Capstone stretch |
| `calendar` | Community | Google/Microsoft calendar | L13 voice agent |
| `stripe` | Stripe | Customer + Subscription CRUD | L15, Capstone |
| `web-search` | Various (Perplexity, Tavily, Brave) | Live search | L12 |
| `sentry` | Sentry | Error CRUD | Observability |
| `github` | Anthropic | Repo CRUD | L2, L11 |
| `playwright` | Microsoft | Browser automation | L12 |
| `postgres` | Anthropic | Arbitrary Postgres | Capstone |
| `n8n` | n8n | Trigger n8n workflows | L15 |

## UK-specific angle

- **NCSC's Secure AI Development guidance** (updated April 2026) explicitly recommends **MCP or equivalent open protocols** over vendor-specific integrations, citing reduced lock-in and better auditability.
- **FCA's FS24/4 AI Statement** is friendly to agentic systems provided "explainability at every action point" — which MCP's trace model satisfies.
- **ICO guidance (April 2026)** treats agent tool-calls as "processing activities" under UK GDPR — meaning each tool call can be a data-processing step that requires lawful-basis documentation. This is why the dry-run + observability + kill-switch pattern matters: it makes UK compliance straightforward.

## Warning: OpenClaw (continued)

Third-party tool OpenClaw (Anthropic project fork) continues to have serious CVEs through 2026: CVE-2026-25253 (RCE, March 2026), CVE-2026-32922 (privilege escalation, April 2026). **Lab-only in GWTH** — never a core-lesson default. Flag severely in L11 and L12.

## Links

- Anthropic Agent SDK — https://docs.anthropic.com/en/docs/agent-sdk
- MCP spec — https://modelcontextprotocol.io/
- MCP server registry — https://github.com/modelcontextprotocol/servers
- OpenAI "Practical Guide to Building Agents" — Dec 2024 PDF
- OpenAI Agents SDK — https://platform.openai.com/docs/agents
- LangGraph — https://langchain-ai.github.io/langgraph/
- CrewAI — https://docs.crewai.com
- NCSC Secure AI development — https://www.ncsc.gov.uk/collection/ai
- FCA FS24/4 — https://www.fca.org.uk
- ICO AI guidance (April 2026) — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/
