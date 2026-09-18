# Agents, CLIs, and MCP — April 2026

*Research spine for L11. Written 2026-04-21. Updated 2026-04-21 to elevate CLIs to equal billing with MCP, reflecting the empirical reality of how most builders integrate tools in April 2026. Extends Month-1 `15-agents-april-2026.md` into production-builder territory.*

## The two tool-use surfaces builders actually reach for

When a student's agent needs to *do* something — read an email, add a database row, open a PR, charge a card, deploy code, post a message — there are four plausible integration surfaces in April 2026. Ranked by the order most builders reach for them:

1. **CLIs invoked via Bash** — *fastest, most common*. The agent (Claude Code, OpenAI Codex CLI, Gemini CLI) calls an existing SaaS CLI: `gh`, `supabase`, `stripe`, `vercel`, `aws`, `gcloud`, `firebase`, `cloudflared`, `git`, `pnpm`, `ffmpeg`, `docker`, `kubectl`, `slack`, `curl`. No server to build, no new protocol to learn, full Unix composability. This is the **default** most Anthropic Feb 2026 data points at.
2. **MCP (Model Context Protocol)** — *the inter-vendor standard*. Use when the tool isn't a CLI, when the agent runs in a non-terminal runtime (Claude Cowork, Claude for Chrome, an embedded agent), or when you want persistent discovery of tools the agent can find-and-use without being told.
3. **Direct HTTP / SDK calls** — *when neither of the above fits*. You're writing code that the agent executes; the code calls an API directly. Works when CLIs are absent and MCP feels too heavy.
4. **Vendor-specific function calling** (OpenAI function-calling, Anthropic tool-use, Google tool-use) — *only when staying inside one vendor*. Not portable; avoid for anything that might swap LLMs.

**The GWTH rule: CLIs first, MCP second, direct HTTP third, vendor-specific function calling last.**

## Why CLIs dominate in practice

- **Every mature SaaS ships a CLI in 2026.** Supabase CLI, Stripe CLI, Vercel CLI, AWS CLI v3, gcloud, Firebase CLI, GitHub CLI, Cloudflare Wrangler, Sentry CLI, PostHog CLI, Langfuse CLI. If the service is worth integrating with, it has a CLI.
- **Claude Code's `Bash` tool is the shortest path.** Claude Code (and Cursor's agent, and Codex CLI, and Gemini CLI) all execute Bash natively. The agent learns the CLI's `--help` output at runtime and composes it into multi-step plans. No client code required.
- **Unix composability is still the most expressive integration style ever invented.** Pipe stdout to `jq`, redirect to a file, chain with `&&`, background with `&`. MCP can't do that.
- **Debuggability is better.** A failing CLI command shows the student a real error message in a terminal. A failing MCP server's error surfaces through an abstraction layer that beginners struggle to read.
- **Onboarding for students is faster.** *"Install the Supabase CLI, authenticate, call it from your agent"* is a 10-minute exercise. *"Install an MCP server, configure the transport, wire it into Claude Code's settings"* is a 30-minute exercise.

## Why MCP still matters (and the specific cases where it wins)

MCP is not obsolete in a CLI-first world. It wins cleanly in these cases:

1. **Non-terminal runtimes.** Claude Cowork, Claude for Chrome, and Claude for iPhone don't have Bash. MCP is how they discover tools.
2. **Persistent, discoverable tool sets.** If the agent should *find* a tool at runtime rather than being told, MCP's discovery + resource + prompt model is the right shape. Gmail MCP, Slack MCP, internal-wiki MCP — these feel right as MCP because you want the agent to *browse* them.
3. **Cross-vendor portability.** MCP works in Claude Code, Cursor, Windsurf, Codex CLI, Gemini CLI, n8n 2.0, Zapier Agents, Make Maia. Writing a CLI wrapper for an internal system only helps if the caller is a shell; writing an MCP server helps every runtime.
4. **Internal tool catalogues at scale.** Enterprises standardising on MCP for internal systems (customer-data API, product-catalogue API, compliance-data API) get a single protocol for every agent to consume. This is the Octopus Kraken pattern.
5. **Resources and prompts (not just tools).** MCP lets a server expose *resources* (data the agent can read) and *prompts* (templates the agent can choose) in addition to *tools* (functions it can call). CLIs only expose tools.

**The honest caveat:** in April 2026, probably 40% of community MCP servers are thin wrappers around a CLI. If you already have a CLI, skip the wrapper.

## The MCP ecosystem at April 21, 2026

- **300+ MCP servers** in the community registry.
- **Direct MCP support** in: Claude Code, Cursor, Windsurf, Claude Cowork (desktop + mobile), Claude for Chrome, Claude.ai web.
- **Indirect/bridged support** in: OpenAI Agents SDK, Google Gemini Code Assist, most LangGraph / CrewAI pipelines.
- **MCP inside automation platforms:** n8n 2.0 native MCP node (March 2026); Zapier Agents MCP bridge; Make Maia MCP (April 2026).

The protocol is simple: a **server** exposes tools (functions), resources (data), and prompts (templates); a **client** (Claude, GPT, Gemini, whatever) discovers them at runtime and calls them as needed. JSON-RPC over stdio, SSE, or HTTP.

## CLIs worth teaching by name in L11 (April 2026)

All Unix-executable; all scriptable; all usable by Claude Code / Codex CLI / Gemini CLI out of the box (just `npm i -g` or equivalent and authenticate).

| CLI | Verb coverage | Used in GWTH |
|-----|--------------|--------------|
| `gh` (GitHub CLI) | Full GitHub API | L2, L11 |
| `supabase` | Postgres, Auth, Storage, Edge Functions | L10, L11, Capstone |
| `stripe` | Customers, Subscriptions, Events, Webhooks | L15, Capstone |
| `vercel` | Deploy, env, domains, logs | L18 |
| `gcloud` | Anything Google Cloud | Capstone (stretch) |
| `aws` (v3) | Anything AWS | Optional |
| `firebase` | Firebase services | Optional |
| `cloudflared` + `wrangler` | Cloudflare Workers, Tunnels | Optional |
| `git` | Source control | Every lesson |
| `pnpm` / `npm` | Package management | Every lesson |
| `ffmpeg` | Audio/video processing | L14 |
| `docker` | Container lifecycle | L18 (Coolify) |
| `kubectl` | Kubernetes | Rare; capstone stretch |
| `sentry-cli` | Release tracking | L18 |
| `posthog-cli` | Events, flags | L18 |
| `slack` (community CLI) | Messages, channels | L11 |
| `gemini` / `codex` / `claude` | Call other LLM CLIs from inside an agent | Advanced |

**Meta-CLI pattern.** Claude Code can call Gemini CLI or Codex CLI — and vice versa — as tools. Students can compose agents across vendors via Bash. This is a surprisingly underrated pattern.

## Why no rival protocol (to MCP) emerged

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

Use these when the CLI path doesn't fit — typically: the tool isn't CLI-shaped (Gmail, Slack, web search), the agent runtime isn't a terminal (Claude Cowork, Claude for Chrome), or the team wants persistent discovery across runtimes.

| MCP Server | Publisher | What it does | CLI alternative? | Used in GWTH |
|------------|-----------|--------------|------------------|--------------|
| `filesystem` | Anthropic | Read/write files in a sandbox | Native Bash | L11 (rarely needed) |
| `gmail` | Community (Anthropic-blessed) | Read/send/label Gmail | `gmail` CLI is thin; MCP wins | L11 |
| `slack` | Anthropic | Send messages / read threads | `slack` CLI exists; MCP wins for discovery | Capstone stretch |
| `web-search` | Various (Perplexity, Tavily, Brave) | Live search | None — MCP wins | L12 |
| `playwright` | Microsoft | Browser automation | `playwright` CLI exists; MCP wins for LLM shape | L12 |
| `calendar` | Community | Google/Microsoft calendar | Thin CLIs; MCP wins | L13 voice agent |
| `hubspot` / `salesforce` | Respective vendors | CRM CRUD | CLIs awkward; MCP wins | Capstone stretch |
| `internal-wiki` | You (organisation-specific) | Search internal knowledge | No CLI exists | Capstone / bespoke |
| **(Supabase)** | Supabase | Postgres + Auth + Storage | `supabase` CLI is excellent — **prefer CLI** | Capstone (CLI-first) |
| **(Stripe)** | Stripe | Customer + Subscription CRUD | `stripe` CLI is excellent — **prefer CLI** | L15 (CLI-first) |
| **(GitHub)** | Anthropic | Repo CRUD | `gh` CLI is excellent — **prefer CLI** | L2, L11 (CLI-first) |
| **(Sentry)** | Sentry | Error CRUD | `sentry-cli` is excellent — **prefer CLI** | Observability (CLI-first) |
| **(Postgres)** | Anthropic | Arbitrary Postgres | `psql` exists — **prefer CLI** | Capstone (CLI-first) |
| **(n8n)** | n8n | Trigger n8n workflows | `n8n` CLI — **prefer CLI** | L15 (CLI-first) |

*The "prefer CLI" rows are included to demonstrate the rule: when a mature CLI exists and works in a terminal runtime, skip the MCP wrapper.*

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
