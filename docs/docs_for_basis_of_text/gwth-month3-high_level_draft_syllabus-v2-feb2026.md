# GWTH.ai Month 3 Redesign — February 2026
## "AI Transformation & Enterprise-Scale Solutions"

---

## Design Rationale

### Where Students Are Coming From

Students entering Month 3 have completed Months 1 and 2 and can:
- Build and deploy multi-feature web applications using Cursor and Claude Code
- Create RAG-powered apps that use business-specific knowledge
- Set up sophisticated automation workflows with AI processing
- Build and manage AI agents with appropriate security guardrails
- Design content systems that produce at scale
- Apply AI to their specific industry (healthcare, legal, finance, etc.)
- Understand and apply security best practices for AI applications
- Analyse business data and build self-updating dashboards with forecasting
- Make the business case for AI adoption to teams and leadership
- Choose the right programming language and tech stack for any project
- Manage projects professionally with GitHub and proper documentation
- Present a portfolio of deployed, production-quality AI applications

They are **not** beginners or even intermediates. They've built real apps, deployed them on real domains, and have a working knowledge of RAG, APIs, agents, and security. Now they need to take these skills to **enterprise scale** — building tools that serve entire organisations, choosing the right models for the right problems, managing costs at scale, and leading AI transformation across teams and departments.

### Why Month 3 Matters Now (February 2026)

The AI landscape has shifted from "should we use AI?" to "how fast can we transform?" Three macro-trends make Month 3 urgent:

| Development | What It Means for GWTH Students | Date |
|-------------|-------------------------------|------|
| **Open-source models reach frontier quality** | DeepSeek V3.2 (MIT licence), Qwen3 80B matching Claude Sonnet 4.5 on coding, Mistral Large 3 (Apache 2.0, 675B MoE), Llama 4 Scout (10M context) — self-hosting production-quality AI is now viable for any business. | Jan–Feb 2026 |
| **Enterprise AI adoption is accelerating 4x faster than desktop internet** | Early AI adopters growing revenue 1.5x faster than peers (OpenAI). Anthropic Economic Index shows 77% enterprise automation rate. Companies that don't transform now will be left behind. | Feb 2026 |
| **AI agent frameworks go production-grade** | Claude Agent SDK exposes the same infrastructure powering Claude Code as a programmable library. OpenAI Agents SDK, LangGraph, CrewAI, AWS Strands Agents — building multi-agent systems is no longer experimental. | Jan–Feb 2026 |

The message is clear: **Enterprise AI transformation is no longer optional, and the tools to do it are accessible to GWTH graduates.** Month 3 teaches students to lead this transformation — choosing the right models, managing costs, governing AI responsibly, and building enterprise-grade applications that serve entire organisations.

### Why 35 Lessons: 20 Mandatory + 15 Optional

Month 2 taught students to build. Month 3 teaches students to **transform** — not just building apps, but changing how organisations work with AI.

The **20 mandatory lessons** teach enterprise AI strategy, advanced technical skills, and transformation leadership. Every graduate — regardless of role or industry — needs these skills to lead AI adoption in their organisation.

The **15 optional lessons** let students specialise:
- **5 Enterprise Verticals** — financial services, healthcare, public sector, manufacturing, professional services — each tackling industry-specific regulation, compliance, and scale challenges
- **5 Advanced Technical** — for students who want to go deeper into multi-agent orchestration, self-hosted infrastructure, security red teaming, open-source model deployment, or voice AI
- **5 Leadership & Transformation** — for students building internal AI training programs, consulting practices, or executive advisory roles

Students should complete **all 20 mandatory lessons** plus **3–5 optional lessons** relevant to their goals. This gives a personalised 23–25 lesson experience.

### Primitive Weighting for Month 3

Month 2 allocated 40% to coding/building. Month 3 shifts the balance — still building, but with more emphasis on agents, strategy, and governance:

| Primitive | Mandatory Lessons | Optional Lessons | % of Mandatory | Rationale |
|-----------|------------------|-----------------|----------------|-----------|
| **Coding / Building** | 6 | 4 | 30% | Projects are more complex but students are faster. Focus shifts to architecture and enterprise patterns. |
| **Automation & Agents** | 4 | 2 | 20% | Multi-agent systems, enterprise automation, and AI pipelines are the biggest value drivers for organisations. |
| **Strategy & Leadership** | 4 | 4 | 20% | The defining skill of Month 3: leading AI transformation, not just building tools. |
| **Research & RAG** | 2 | 1 | 10% | Enterprise-scale RAG with access controls, hybrid search, and multi-collection architecture. |
| **Security & Governance** | 2 | 1 | 10% | Enterprise security, OWASP AI Top 10, governance frameworks, compliance. |
| **Data Analysis** | 2 | 1 | 10% | Data pipelines, ROI measurement, analytics at enterprise scale. |

**Total: 20 mandatory + 15 optional = 35 lessons**

---

## Key Design Principles

### Inherited Principles (from Months 1 & 2, adapted for Month 3)

1. **Building is the backbone** — every lesson produces something usable at enterprise scale. If a student can't demo it to a C-suite executive, the lesson failed.

2. **Recommended stacks, not endless options** — but now students learn *when to deviate*. The GWTH stack is the default; the lesson teaches when a different model, database, or framework serves the enterprise better.

3. **Security is woven in, not bolted on** — at enterprise scale, security isn't optional. Every app-building lesson applies the OWASP AI Top 10 checklist. Every agent has human-in-the-loop approval for high-risk actions.

4. **Cursor and Claude Code remain primary tools** — but projects are harder: multi-tenant apps, enterprise integrations, production agent systems. Students use Cursor's multi-agent interface (8 parallel agents) and Claude Code's autonomous execution on large codebases.

5. **No code ≠ no understanding** — students now understand model selection (when to use Claude Opus 4.6 vs DeepSeek V3.2 vs a local Qwen3 8B), cost trade-offs (tokens are money at enterprise scale), and architectural patterns (when RAG beats fine-tuning, when agents beat automation).

6. **Address the fear** — Month 3 confronts enterprise-level fear: companies afraid of being left behind, employees afraid of being replaced, leaders afraid of making the wrong bet. Every lesson implicitly answers: "How does this make my organisation stronger?"

7. **Always up to date** — every model, tool, and service mentioned is current as of February 2026. The GWTH Tech Radar auto-scans daily. Month 3 introduces students to open-source models and Chinese AI that most Western courses ignore.

### New Principles for Month 3

8. **Choose the right model for the job** — the era of "just use ChatGPT for everything" is over. Students learn to match models to tasks: Claude Opus 4.6 for deep reasoning, GPT-5.3-Codex-Spark for speed (1,000+ tok/sec), DeepSeek V3.2 for self-hosted privacy, Qwen3 8B for cost-efficient local inference. The cheapest model that meets the quality bar wins.

9. **Enterprise means everyone** — tools built in Month 3 serve non-technical users. SSO authentication, role-based access, intuitive interfaces, mobile responsiveness. If a sales rep can't use it without training, it's not enterprise-ready.

10. **Cost awareness at every level** — API tokens, hosting, maintenance, training time — Month 3 treats cost as a first-class design constraint. Students build cost monitoring into every project and can justify every pound spent.

11. **Transformation over technology** — the hardest part of enterprise AI isn't the tech; it's the people. Month 3 dedicates 20% of mandatory lessons to strategy and leadership because the best tool in the world fails if nobody adopts it.

12. **Self-hosted is a superpower** — running LLMs locally (Ollama, vLLM) gives enterprises data privacy, predictable costs, and zero rate limits. Month 3 teaches this as a core skill, not an advanced option.

13. **Open source is not second-class** — DeepSeek, Qwen, Mistral, and Llama models now match or exceed proprietary models on many tasks. Students who only know Claude and GPT are missing half the landscape. GWTH graduates know the full field.

14. **Lead the transformation** — every GWTH Month 3 graduate should be able to walk into any organisation and lead their AI adoption. The capstone (askevery.one) is literally a tool for assessing AI readiness — students graduate by building the thing that starts transformations.

---

## The GWTH Recommended Stack (Month 3 — February 2026)

Month 3 expands the recommended stack to include enterprise and open-source options. The decision is no longer "what to use" but "what to use *when*."

*The full, always-current tool list lives on the **GWTH Tech Radar** (gwth.ai/tech-radar) — 47+ tools across 16 categories, updated daily by an automated scanner.*

| Category | Default Choice | Enterprise Alternative | When to Switch |
|----------|---------------|----------------------|----------------|
| **AI Chat (Reasoning)** | Claude Opus 4.6 | GPT-5.3-Codex (speed), Gemini 3 Pro (long context) | When you need deep research (Gemini 3 Deep Think) or real-time speed (Codex-Spark) |
| **AI Chat (Cost-Efficient)** | Claude Sonnet 4.6 | DeepSeek V3.2 (self-hosted, free) | When data privacy requires no external API calls |
| **AI Coding IDE** | Cursor | Windsurf (free tier for teams) | When budget is the primary constraint |
| **AI Coding CLI** | Claude Code | — | Claude Code remains the best for large codebases and autonomous execution |
| **Desktop Agent** | Claude Cowork | OpenClaw (self-hosted, with security hardening) | When you need messaging integration (WhatsApp/Slack) or local-only operation |
| **Agent Framework** | Claude Agent SDK | LangGraph, CrewAI, AWS Strands Agents | When you need multi-framework interop or AWS-native deployment |
| **Local LLM Runtime** | Ollama | vLLM (production, 19x throughput) | When serving multiple concurrent users (>10) |
| **Local Model (Small)** | Qwen3 8B | DeepSeek-R1-Distill-8B, Mistral Ministral 8B | Task-dependent: Qwen for general, DeepSeek for reasoning, Mistral for European compliance |
| **Local Model (Large)** | Llama 4 Scout (17B active, 10M context) | DeepSeek V3.2 (236B), Mistral Large 3 (675B MoE) | Scout for context-heavy tasks, DeepSeek for reasoning, Mistral for multilingual |
| **Automation** | n8n (self-hosted) | Make.com (managed, easier for non-technical teams) | When the automation team isn't technical enough for n8n |
| **Vector Database** | Qdrant (self-hosted) | Pinecone (managed, zero-ops) | When you can't manage infrastructure or need serverless scaling |
| **Database** | Supabase (PostgreSQL) | PostgreSQL direct (for enterprise with existing DB teams) | When you need full DBA control or have compliance requirements |
| **Hosting** | Vercel + Railway | AWS / Azure / GCP (enterprise accounts) | When the organisation already has cloud contracts and compliance requirements |
| **Monitoring** | Sentry | Datadog, New Relic (enterprise) | When you need APM, distributed tracing, and SLA monitoring |

---

## The Three Audiences Month 3 Serves

### 1. "My company needs to transform or we'll be left behind"
Month 3's answer: **Become the AI transformation leader your company needs.** You'll build the tools (AI readiness assessment, transformation dashboard, internal AI platform) and create the strategy (90-day plan, governance framework, ROI calculator) that turns AI from a threat into a competitive advantage. Lessons L2, L14, L15, and L19 directly equip you for this role. The capstone (askevery.one) is literally a tool for starting transformations.

### 2. "I've been made redundant and want to reinvent myself as an AI professional"
Month 3's answer: **You're now an AI consultant, not just an AI user.** By the end of Month 3, you can walk into any medium or large business and assess their AI readiness, build their internal tools, set up their agent systems, and train their teams. The optional lessons O13 (AI Consulting Practice) and O14 (Fractional CTO) turn your skills into a business. Your portfolio now includes enterprise-grade applications on real domains.

### 3. "We'll lose our best people unless we invest in AI training"
Month 3's answer: **This is the enterprise AI curriculum your organisation needs.** Every lesson produces something the business can immediately use — internal tools, automation workflows, governance frameworks, training programs. L14 specifically covers building an internal AI training program. The capstone deploys as a real assessment tool your company can use to benchmark AI readiness across departments.

---

## Validation Test Suite

These 12 tests are run after every syllabus revision to ensure quality:

| # | Test | Pass Criteria |
|---|------|---------------|
| 1 | **BUILD test** | Every lesson (35/35) has a BUILD project with clear requirements |
| 2 | **Enterprise readiness** | All mandatory BUILD outputs serve medium or large business needs |
| 3 | **No Month 1/2 duplication** | No lesson repeats content already covered in Months 1–2 (builds on it, doesn't rehash) |
| 4 | **Primitive coverage** | All 6 primitives appear in mandatory lessons; each appears at least twice |
| 5 | **Audience alignment** | Each of the 3 audiences (transformation leader, career changer, team investor) is explicitly addressed |
| 6 | **Optional distinctness** | Each optional lesson serves a clearly different audience subset with no overlap |
| 7 | **Dependency safety** | No mandatory lesson depends on content from an optional lesson |
| 8 | **Capstone scaffolding** | By L15, students have all skills needed for the capstone (multi-agent, RAG, voice, governance, deployment) |
| 9 | **Duration check** | Mandatory ≈ 23–25 hours, Optional ≈ 14–16 hours total |
| 10 | **Tool currency** | Every tool, model, and service mentioned is verified current as of February 2026 via GWTH Tech Radar |
| 11 | **Progressive complexity** | Each week is harder than the previous; no Week 3 concept appears in Week 1 |
| 12 | **Cost awareness** | Every BUILD project includes a cost estimate or cost comparison |

---

## The Month 3 Capstone: AI Readiness Assessment Tool (askevery.one)

The Month 3 capstone project is an **AI Readiness Assessment Tool** — an enterprise-grade system that:

1. **Assesses AI readiness** — guided conversational interview across 6 dimensions (Strategy, People, Technology, Data, Governance, Culture)
2. **Uses voice or chat** — natural conversational AI that makes assessment feel like a consultancy session, not a survey
3. **Provides RAG-powered recommendations** — retrieves best practices from a knowledge base of transformation frameworks (OpenAI, Anthropic, McKinsey, Gartner)
4. **Scores and benchmarks** — weighted maturity scoring with industry benchmarking
5. **Generates executive reports** — automated PDF/HTML report with radar charts, recommendations, and a 90-day action plan
6. **Uses multi-agent architecture** — assessor agent (conducts interview), analyst agent (scores and benchmarks), report agent (generates deliverables)
7. **Deploys to a real domain** — live on askevery.one, accessible to clients and employers

### Why This Capstone?

- It's **commercially valuable** — every consulting firm, IT department, and AI champion needs an assessment tool. This is a real product students can use professionally
- It uses **all 6 primitives**: Research (knowledge base of frameworks), Coding (building the platform), Data Analysis (scoring and benchmarking), Automation (agent pipeline), Strategy (transformation recommendations), Security (enterprise data handling)
- It builds directly on **L6** (multi-agent), **L7** (enterprise RAG), **L8** (local models), **L11** (transformation dashboard), and **L12** (advanced coding) — students have practiced every component
- It's **portfolio-defining** — "I built an AI readiness assessment tool used by real organisations" is a career-making statement
- It demonstrates **transformation leadership** — the tool itself starts AI transformations, proving the student can lead change

### Implementation Options (Students Choose)

| Approach | Difficulty | Best For | Tools |
|----------|-----------|----------|-------|
| **Next.js + Claude Agent SDK + Qdrant + Voice** | Recommended | Full control, most impressive, production-ready | Cursor, Claude Code, Supabase, Vercel |
| **Next.js + LangGraph + Pinecone** | Medium | Students preferring LangChain ecosystem | Cursor, Claude Code, Pinecone, Railway |
| **Python + Streamlit + Local Ollama** | Medium | Privacy-first, self-hosted, zero API cost | Claude Code, Ollama, Qdrant, Docker |
| **Lovable/Bolt + Anthropic API** | Easier | Fast deployment, focus on content over infrastructure | Lovable, Anthropic API, Pinecone |

---

## Complete Month 3 Syllabus: 20 Mandatory Lessons

### Week 1: Enterprise AI Strategy & Model Intelligence (L1–L5)
*Goal: Establish the Month 3 mindset, understand the full AI model landscape (including open-source and Chinese models), master cost optimisation, and learn enterprise AI governance.*

---

**L1: Welcome to Month 3 — From AI Builder to AI Transformation Leader**
- **Primitive:** Strategy & Leadership
- **Duration:** 60 min
- **Content:**
  - Month 3 overview: what you'll build and why enterprise AI skills are the most valuable in the market right now
  - The three audiences revisited: job protectors become AI champions, career changers become AI consultants, team leaders become transformation directors
  - The data that should make every business pay attention:
    - Early AI adopters growing revenue 1.5x faster than peers (OpenAI "Staying Ahead" guide)
    - Companies investing in AI training retain 34% more staff (Anthropic Economic Index)
    - AI adoption spreading 4x faster than desktop internet — this is the fastest technology shift in history
    - 77% of enterprise AI usage is automation, not augmentation — there's a massive untapped opportunity in human-AI collaboration
  - Addressing the elephant in the room: "What if my company won't adopt AI?" — become the person who makes the case. You'll build the tools and strategy to prove it.
  - For the recently redundant: AI skills are now the #1 differentiator in hiring. Your Month 1–2 portfolio already puts you ahead of 90% of candidates. Month 3 makes you a leader.
  - For companies worried about losing staff: this is the curriculum that turns retention risk into competitive advantage. Every lesson produces something the business can use immediately.
  - What's new since Month 2: open-source models reaching frontier quality, Claude Agent SDK, OWASP Agentic AI Top 10, enterprise RAG going mainstream
  - The GWTH Tech Radar: now with 47+ tools — how to use it as your daily intelligence source
  - Preview of the capstone: by lesson 18, you'll have a deployed AI readiness assessment tool on askevery.one
- **BUILD:** "My Transformation Vision" — conduct a self-assessment of your organisation's (or target organisation's) AI maturity across 6 dimensions (Strategy, People, Technology, Data, Governance, Culture). Score each 1–5. Identify three transformation opportunities with estimated business impact. Create a one-page executive summary. This becomes the foundation for your capstone.

---

**L2: The AI Transformation Framework — Align, Activate, Amplify, Accelerate, Govern**
- **Primitive:** Strategy & Leadership
- **Duration:** 75 min
- **Content:**
  - Why most AI projects fail: 70% of digital transformations fail — not because of technology, but because of people, process, and culture
  - The OpenAI "Staying Ahead in the Age of AI" framework — five steps every organisation must take:
    - **Align:** Get leadership, employees, and strategy pointing in the same direction. Define what AI means for *your* business, not AI in general. Create a shared vocabulary.
    - **Activate:** Enable and motivate teams to use AI. Sandbox environments, training paths, quick wins, AI champions in every department. Remove friction — every click between an employee and an AI tool is a barrier to adoption.
    - **Amplify:** Scale what works. When one team's AI workflow saves 10 hours/week, document it and roll it to every team. Create an internal "AI playbook" of proven use cases.
    - **Accelerate:** Speed up decisions. AI moves faster than annual planning cycles. Create rapid-experimentation frameworks, 2-week pilot programs, and AI policy committees that meet monthly, not yearly.
    - **Govern:** Responsible AI at organisational scale. Data privacy policies, model selection criteria, acceptable use guidelines, incident response plans. Governance enables speed — without it, legal blocks every project.
  - Case studies: Estée Lauder (marketing personalisation), Notion (product-embedded AI), BBVA (financial services transformation)
  - The Anthropic Economic Index lens: how different sectors are adopting AI (and where the biggest opportunities remain)
  - Common mistakes: starting with governance (kills momentum), skipping Activate (tools gather dust), not measuring Amplify (success stories die in silos)
- **BUILD:** "AI Transformation Playbook" — create a detailed transformation plan for your organisation using the 5-step framework. For each step: current state assessment, specific actions (with owners and deadlines), success metrics, and risks. Include a 90-day timeline. This is a living document you'll refine throughout Month 3.

---

**L3: Choosing the Right Model for the Job — The LLM Landscape**
- **Primitive:** Foundations + Strategy
- **Duration:** 75 min
- **Content:**
  - The model landscape in February 2026 — and why knowing it matters for every AI decision:
    - **Claude Opus 4.6** — best reasoning, 1M context, ideal for complex analysis, architecture, long documents
    - **Claude Sonnet 4.6** — Opus-level reasoning at lower cost, released Feb 17, 2026. Now the default for Free and Pro users
    - **GPT-5.3-Codex** — strong coding agent, runs autonomously for hours
    - **GPT-5.3-Codex-Spark** — 1,000+ tokens/sec on Cerebras hardware, real-time coding
    - **Gemini 3 Pro** — Google's latest: state-of-the-art reasoning, multimodal, agentic. Gemini 3 Flash for speed, Gemini 3 Deep Think for research and science
    - **DeepSeek V3.2** — MIT licence, frontier-quality, self-hostable, free. The model that proved open-source can compete.
    - **Qwen3** — Alibaba's 1T-parameter MoE, 119 languages, Qwen3-Coder-Next 80B matches Sonnet 4.6 on coding
    - **Mistral Large 3** — Apache 2.0, 675B MoE (41B active), European company, strong multilingual
    - **Llama 4 Scout** — Meta's open model, 17B active params, industry-leading 10M context window
    - **Llama 4 Maverick** — 17B active with 128 experts, beats GPT-4o on benchmarks
  - Chinese models: why Western-educated AI professionals need to know DeepSeek and Qwen (MIT-licensed, frontier-quality, massive adoption in Asia, paired with Baidu search)
  - The model selection matrix: Task → Quality needed → Privacy requirements → Budget → Latency → Model
  - Context windows compared: Claude 1M, Gemini 3 Pro 2M, Llama 4 Scout 10M, GPT-5.3 128K — and why bigger isn't always better (cost, noise, distraction)
  - Small models that punch above their weight: Qwen3 8B, DeepSeek-R1-Distill-8B, Mistral Ministral 8B, Llama 4 Scout — these run on a laptop and handle 80% of tasks
  - The 280x cost reduction: running a GPT-3.5-class model now costs 280x less than 18 months ago. What was expensive is now essentially free.
  - When to use proprietary vs open-source: proprietary for frontier quality + zero-ops, open-source for privacy + cost control + customisation
- **BUILD:** "Model Selection Advisor" — build an interactive tool (Cursor + Claude Artifacts) that recommends the right model based on: task type, quality requirements, privacy needs, budget, latency requirements, and context size. Include a cost calculator showing monthly estimates for each recommendation. This becomes a reference tool for every project going forward.

---

**L4: Cost Intelligence — Running AI at Enterprise Scale**
- **Primitive:** Strategy + Data Analysis
- **Duration:** 60 min
- **Content:**
  - Why cost matters now: a personal side project might cost $5/month in API calls. An enterprise deploying AI to 500 employees could cost $50,000/month — or $500/month if architected correctly.
  - Token economics deep dive: how pricing works across providers (input vs output tokens, cached vs uncached, batch vs real-time)
  - The cost pyramid:
    - **Layer 1: Free** — local models via Ollama (hardware cost only)
    - **Layer 2: Cheap** — small cloud models (Claude Haiku 4.5, Codex-Spark, GPT-4.1-mini)
    - **Layer 3: Standard** — full cloud models (Claude Sonnet 4.6, GPT-5.3)
    - **Layer 4: Premium** — frontier reasoning (Claude Opus 4.6, GPT-5.3 with extended thinking)
  - The hybrid architecture: route requests to the cheapest model that meets quality requirements
  - Context management at scale: why stuffing 1M tokens into every request is like driving a Ferrari to the corner shop
  - Prompt caching: Anthropic's prompt caching saves up to 90% on repeated system prompts
  - Batch processing: 50% cheaper for non-real-time tasks
  - Self-hosting economics: hardware costs (£1,500 GPU one-time) vs API costs (£500/month ongoing) — break-even analysis
  - The hidden costs: developer time, testing, monitoring, incident response, retraining
  - Cost monitoring dashboards: tracking spend across multiple providers in real-time
- **BUILD:** "AI Cost Dashboard" — build a cost monitoring tool that: tracks API usage across multiple providers (mock data is fine), calculates daily/weekly/monthly costs, compares actual vs budgeted spend, recommends cost optimisations (e.g., "Switch these 200 daily requests from Opus to Sonnet — save £340/month with <2% quality reduction"), and generates a monthly cost report. Deploy and share.

---

**L5: Enterprise AI Security & Governance**
- **Primitive:** Security & Governance
- **Duration:** 75 min
- **Content:**
  - Enterprise security is a different game: in Month 2, you secured an app. In Month 3, you secure an organisation's entire AI usage.
  - The OWASP Top 10 for Agentic Applications 2026 — the globally peer-reviewed framework developed with 100+ security experts from AWS, Microsoft, and Palo Alto Networks:
    1. Excessive agency — agents with too many permissions
    2. Insufficient oversight — lack of human-in-the-loop for high-risk actions
    3. Data exfiltration — agents leaking sensitive information
    4. Prompt injection at scale — attacking customer-facing AI systems
    5. Supply chain risks — malicious tools, plugins, and MCP servers
    6. And 5 more critical risks every enterprise must address
  - The OpenClaw lessons for enterprise: 200K+ GitHub stars, CVE-2026-25253 (CVSS 8.8), 1,800+ exposed instances, 335 malicious skills distributing keyloggers — all within weeks. What happens when agents have too much access without governance.
  - Data classification for AI: what data can go to which models? Public → any model. Internal → managed API with DPA. Confidential → self-hosted only. Restricted → no AI.
  - Model governance: approved model lists, version pinning, testing before deployment
  - API key management for organisations: secrets managers (AWS Secrets Manager, HashiCorp Vault), rotation policies, access auditing
  - AI usage policies: drafting acceptable use policies that enable innovation while managing risk
  - Compliance frameworks: NIST AI Risk Management Framework, ISO 42001, EU AI Act — what they require and how to comply
  - Incident response for AI: what to do when your agent hallucinates to a customer, leaks data, or gets prompt-injected
- **BUILD:** "Enterprise AI Governance Pack" — create a comprehensive governance package for your organisation: (1) AI Acceptable Use Policy (2-page document), (2) Model Selection & Approval Criteria, (3) Data Classification Guide for AI, (4) Security Checklist for AI Applications (extending L5 from Month 2), (5) AI Incident Response Playbook. These are real documents you can present to leadership.

---

### Week 2: Advanced Agents, RAG & Local AI (L6–L10)
*Goal: Build sophisticated multi-agent systems, enterprise-scale RAG, self-hosted AI infrastructure, and automation that serves entire organisations. These are the skills that make you indispensable to enterprise.*

---

**L6: Multi-Agent Systems — Building AI Teams That Work Together**
- **Primitive:** Automation & Agents + Coding / Building
- **Duration:** 90 min
- **Content:**
  - Beyond single agents: why enterprises need AI teams, not individual AI assistants
  - The Claude Agent SDK deep dive: Anthropic's production-grade framework that exposes the same infrastructure powering Claude Code
    - Installation and setup (Python and TypeScript)
    - Building your first agent: tool definitions, system prompts, agent loop
    - MCP integration: connecting agents to Slack, GitHub, Google Drive, Asana without custom code
    - Error handling, retries, and graceful degradation
  - Agent patterns for enterprise:
    - **Supervisor pattern** — one coordinator agent delegating to specialists
    - **Pipeline pattern** — sequential agents, each processing the output of the previous
    - **Parallel pattern** — multiple agents working simultaneously on different aspects
    - **Debate pattern** — agents that challenge each other's outputs for quality assurance
  - Alternative frameworks and when to use them:
    - **LangGraph** — when you need complex state machines and conditional routing
    - **CrewAI** — when you want role-based agents with minimal configuration
    - **AWS Strands Agents** — when deploying on AWS infrastructure
    - **OpenAI Agents SDK** — when using GPT models and OpenAI's ecosystem
  - Human-in-the-loop: requiring approval before agents take high-risk actions (sending emails, modifying data, making purchases)
  - Cost management for multi-agent systems: a 3-agent pipeline can cost 3x a single agent call — strategies for efficiency
  - Logging and observability: knowing what your agents did, why, and how much it cost
- **BUILD:** "Enterprise Research & Report System" — build a multi-agent system using the Claude Agent SDK (or LangGraph): Agent 1 (Researcher) searches web and documents for information on a given topic. Agent 2 (Analyst) evaluates sources, identifies key insights, and scores relevance. Agent 3 (Writer) produces a formatted executive brief with citations. Must include: cost tracking per agent, execution logging, human approval gate before final output, and error handling. This is a system you could deploy for any department that needs regular intelligence reports.

---

**L7: Enterprise RAG — Company-Wide Knowledge Systems**
- **Primitive:** Research & RAG + Coding / Building
- **Duration:** 90 min
- **Content:**
  - Enterprise RAG vs personal RAG: the 10 differences that matter at scale
    - Hundreds of thousands of documents, not hundreds
    - Multiple document types (PDFs, emails, Slack messages, wikis, databases)
    - Access control: users must only see documents they're authorised to see
    - Freshness: documents change constantly — the knowledge base must stay current
    - Multi-tenancy: different departments, different knowledge bases, same system
  - Hybrid search: combining BM25 keyword search with semantic embeddings for dramatically better retrieval
  - Re-ranking: using cross-encoder models (Cohere Rerank, BGE-Reranker) to score and reorder results
  - Agentic RAG: AI that decides *what* to retrieve, *when* to retrieve it, and *how much* context to include
  - Document pipelines: automated ingestion from SharePoint, Google Drive, Confluence, email, Slack
  - Chunking strategy for enterprise: parent-child chunks, sliding windows, document-aware splitting (tables and code blocks stay together)
  - Access control per document: implementing row-level security on your vector database (Qdrant payload filtering, Pinecone metadata)
  - Evaluation: RAGAS metrics — retrieval precision, recall, faithfulness, answer relevance
  - Scaling: from 10K to 10M documents — when to shard, when to use multiple collections, when to add GPU
  - Cost at scale: embedding costs, storage costs, inference costs — and how to manage them
- **BUILD:** "Company Knowledge Base" (aitranscriptionhub.com) — build an enterprise RAG system that: (1) ingests documents from multiple sources (upload, URL scrape, API), (2) implements hybrid search (BM25 + semantic), (3) includes re-ranking for quality, (4) supports role-based access control (admin sees everything, users see their department's docs), (5) provides usage analytics (most-queried topics, unanswered questions), (6) includes evaluation metrics. Deploy with a professional chat interface. This is the knowledge system every enterprise needs.

---

**L8: Hosting LLMs Locally — Privacy, Control & Cost**
- **Primitive:** Infrastructure + Coding / Building
- **Duration:** 75 min
- **Content:**
  - Why self-host: data never leaves your network, predictable costs, no rate limits, no vendor lock-in, works offline
  - The self-hosting landscape in February 2026:
    - **Ollama** — the "Docker for LLMs." One command to download and run any model. OpenAI-compatible API. Perfect for development and small teams. Supports macOS, Linux, Windows.
    - **vLLM** — production-grade inference server. PagedAttention reduces memory fragmentation by 40%+. 19x throughput vs Ollama at scale. Use when serving 10+ concurrent users.
    - **LM Studio** — GUI-based, perfect for non-technical team members who need local AI
    - **Jan** — open-source ChatGPT alternative that runs entirely offline
  - Hardware guide (what you actually need):
    - **8GB VRAM** (GTX 1080, RTX 3060) → runs 7–8B models (Qwen3 8B, Mistral Ministral 8B)
    - **12GB VRAM** (RTX 3060 12GB) → runs 14B models comfortably
    - **16GB VRAM** (RTX 4060 Ti 16GB) → runs 30B models
    - **24GB VRAM** (RTX 4090) → runs 70B models, or 2x 8B models simultaneously
    - **Apple Silicon** (M2/M3/M4 Pro/Max) — unified memory means 32–128GB available for models
  - Best models for self-hosting (February 2026):
    - **General purpose**: Qwen3 8B (best all-rounder), Llama 4 Scout (10M context)
    - **Reasoning**: DeepSeek-R1-Distill-8B (strong chain-of-thought)
    - **Coding**: Devstral Small 2 24B (Mistral, 72.2% SWE-bench), Qwen3-Coder-Next 80B
    - **Multilingual**: Mistral Large 3 (Apache 2.0, strong European languages)
  - Quantisation explained simply: how Q4_K_M and Q5_K_M let you run bigger models on smaller GPUs — the trade-off between size and quality
  - The hybrid architecture: local model handles 80% of requests (simple queries, classification, extraction), cloud API handles 20% (complex reasoning, long-context analysis)
  - Docker deployment: containerising your local AI stack for reproducible enterprise deployment
  - GPU sharing: serving multiple models or users from a single GPU
- **BUILD:** "Local AI Gateway" — set up Ollama with 3+ models (one general, one coding, one reasoning). Build a Python or Node.js API gateway that: (1) accepts requests in OpenAI-compatible format, (2) routes to the best local model based on task type, (3) falls back to cloud API for tasks that exceed local model capability, (4) logs all requests with latency and cost tracking, (5) provides a simple web UI for non-technical users. Include a cost comparison: "This month, 847 requests were handled locally (£0) vs 153 routed to cloud (£4.20). Total savings vs all-cloud: £38.50."

---

**L9: Workflow Automation at Enterprise Scale**
- **Primitive:** Automation & Agents
- **Duration:** 75 min
- **Content:**
  - Enterprise automation vs personal automation: the difference between "auto-sort my emails" and "process 500 invoices/day with AI classification, approval routing, and exception handling"
  - n8n at scale: building enterprise-grade automation workflows
    - Error handling and retry logic: what happens when step 3 of 8 fails?
    - Parallel execution: processing batches of items simultaneously
    - Sub-workflows: reusable automation components shared across the organisation
    - Credentials management: secure handling of API keys and OAuth tokens across workflows
  - AI-powered automation: embedding LLM calls at decision points in your workflows
    - Document classification: AI reads incoming document, classifies type, routes to correct workflow
    - Sentiment analysis: customer feedback → AI sentiment → route to support or success team
    - Data extraction: AI pulls structured data from unstructured documents (invoices, contracts, emails)
    - Quality assurance: AI reviews outputs before they reach customers
  - Cross-system integration: connecting CRM (Salesforce, HubSpot), ERP (SAP, NetSuite), HR (BambooHR, Workday), comms (Slack, Teams, email)
  - The automation audit: systematically finding the 20% of tasks that consume 80% of manual effort
  - Monitoring and alerting: knowing when automation fails before users notice
  - Documentation: every workflow needs a README — what it does, who owns it, what to do when it breaks
- **BUILD:** "Department Automation Suite" — build 3 interconnected automation workflows in n8n that automate real business processes: (1) **Document Intake**: email/upload → AI classification → route to correct handler → confirmation, (2) **Approval Pipeline**: request submitted → AI risk assessment → route to appropriate approver → track status → notify, (3) **Intelligence Report**: scheduled trigger → scrape 5+ sources → AI summarise → format report → email to stakeholders. Must include error handling, retry logic, and monitoring alerts.

---

**L10: Building Internal Tools for Enterprise Teams**
- **Primitive:** Coding / Building
- **Duration:** 90 min
- **Content:**
  - The internal tool opportunity: every department has manual processes that AI can replace. The person who builds these tools becomes indispensable.
  - Stakeholder interviews: how to identify what teams *actually* need (not what they *ask* for — they don't know what's possible)
  - Building for non-technical users: UI/UX principles for enterprise tools
    - Simple, clean interfaces — no developer jargon
    - Progressive disclosure — show basic features first, advanced options on demand
    - Excellent error messages — "Something went wrong" is unacceptable
    - Mobile responsiveness — people use tools on their phones
  - Enterprise authentication: SSO (SAML, OAuth), role-based access control (RBAC), team-based permissions
  - Data integration: connecting to existing databases, APIs, file systems, and SaaS tools
  - Real-time features: live dashboards, auto-refresh, collaborative editing, notifications
  - Multi-tenant architecture: one app serving multiple teams or clients with isolated data
  - Deployment options for enterprise: Vercel (fast, simple), Railway (backend-heavy), Docker on internal servers (compliance requirements)
  - Maintenance and support: building tools that are easy to update and extend
- **BUILD:** "Team Productivity Platform" — build an internal tool that solves a real problem for a team in your organisation. Must include: (1) SSO or role-based authentication, (2) integration with at least one existing data source (database, API, or file system), (3) a real-time dashboard with live metrics, (4) mobile-responsive design, (5) an admin panel for configuration. Use Cursor + Claude Code. Deploy and get at least 2 real users testing it.

---

### Week 3: Enterprise Applications & Change Management (L11–L15)
*Goal: Build enterprise-grade applications that track AI transformation, tackle harder coding projects, create data pipelines, master change management, and prove ROI. This week is where technical skills meet business leadership.*

---

**L11: AI Transformation Dashboard — Planning & Tracking Adoption**
- **Primitive:** Coding / Building + Strategy
- **Duration:** 90 min
- **Content:**
  - The problem: AI transformation involves dozens of initiatives across multiple departments. Without a tracking tool, progress is invisible and momentum dies.
  - The AI transformation dashboard: a single pane of glass showing adoption progress across the organisation
  - Maturity assessment visualisation: department-by-department scoring across the 6 dimensions (Strategy, People, Technology, Data, Governance, Culture)
  - Use case tracking: which AI projects are running, what's their status, what's the estimated and actual impact
  - Adoption metrics: how many employees are using AI tools, frequency, satisfaction
  - Integration with project management: importing data from Jira, Asana, Linear, or Notion
  - Executive view: board-ready summary with trend lines, risk indicators, and recommendations
  - Department view: drill-down into team-specific metrics, training completion, tool usage
  - Forecasting: projecting ROI based on current adoption curves
  - The "quick wins" tracker: highlighting successful AI implementations that can be amplified across the organisation
- **BUILD:** "AI Transformation Tracker" (productarchitect.dev) — build a comprehensive dashboard that: (1) tracks AI adoption across departments with maturity scores, (2) manages active AI use cases with status, owner, and impact metrics, (3) visualises progress with charts (radar charts for maturity, bar charts for adoption, line charts for trends), (4) generates executive reports (exportable PDF or HTML), (5) includes a "quick wins" board for amplifying successes. Deploy to productarchitect.dev.

---

**L12: Advanced Cursor & Claude Code — Tackling Harder Projects**
- **Primitive:** Coding / Building
- **Duration:** 90 min
- **Content:**
  - You've been building apps for two months. Now it's time to tackle the kind of projects that make engineering teams nervous — and do it with AI.
  - Cursor's multi-agent interface: running up to 8 agents in parallel on different parts of your project — frontend, backend, tests, and documentation all advancing simultaneously
  - Claude Code for large codebases: managing context across hundreds of files
    - CLAUDE.md architecture: project-level, directory-level, and file-level instructions
    - The `/compact` workflow: managing long sessions without losing context
    - Git worktrees: running parallel Claude Code sessions on different features
  - Monorepo strategies: when your project has frontend, backend, shared libraries, and infrastructure
  - The professional workflow:
    1. **Spec** — write a detailed specification before touching code
    2. **Architect** (Claude Code) — design the system, create file structure, define interfaces
    3. **Implement** (Cursor) — build features iteratively with visual feedback
    4. **Review** (Claude Code) — review for security, performance, and best practices
    5. **Deploy** — CI/CD pipeline with automated tests
  - Debugging complex issues: using Claude Code's deep reasoning to trace bugs across multiple files and services
  - Performance optimisation: profiling and optimising with AI assistance
  - Cost-aware development: choosing when to use Cursor (visual iteration, quick changes) vs Claude Code (architecture, complex reasoning) vs Codex-Spark (rapid prototyping)
- **BUILD:** "Enterprise Feature Sprint" — take your most complex project (from Month 2 or earlier this month) and add a major enterprise feature using both Cursor and Claude Code: multi-tenant support (separate data per client/team), bulk data import/export (CSV/JSON), comprehensive audit logging (who did what, when), or an admin console with user management. Document when you switched between Cursor and Claude Code and why. Push to GitHub with clean commit history.

---

**L13: AI-Powered Data Pipelines — From Collection to Insight**
- **Primitive:** Data Analysis + Automation
- **Duration:** 75 min
- **Content:**
  - Enterprise data challenges: multiple sources, inconsistent formats, stale data, missing context
  - Building data collection pipelines:
    - Web scraping: extracting data from websites (with ethical and legal considerations)
    - API polling: scheduled retrieval from external services
    - File watchers: monitoring folders for new documents (invoices, reports, contracts)
    - Email parsing: extracting structured data from unstructured emails
  - Data transformation with AI:
    - Classification: AI categorises incoming data (document type, sentiment, priority, department)
    - Extraction: AI pulls structured fields from unstructured text (names, dates, amounts from invoices)
    - Enrichment: AI adds context (company info from domain name, industry from job title)
    - Summarisation: AI creates executive summaries from lengthy documents
  - Automated reporting: generating daily/weekly intelligence reports without human intervention
  - Anomaly detection: AI-powered alerts when data looks unusual (spike in support tickets, drop in conversion rate)
  - Data quality: measuring and maintaining accuracy, completeness, freshness, consistency
  - Pipeline monitoring: knowing when a data source goes offline or returns unexpected data
- **BUILD:** "Automated Intelligence Brief" — build a data pipeline that: (1) collects data from 3+ sources (web scrape, API, file upload), (2) uses AI to classify, extract, and summarise, (3) detects anomalies and flags them, (4) generates a formatted daily brief (HTML email or PDF), (5) sends to stakeholders via email or Slack. Include monitoring that alerts you if any source fails. This is the kind of tool that gets you promoted.

---

**L14: Change Management — Training Teams & Driving AI Adoption**
- **Primitive:** Strategy & Leadership
- **Duration:** 60 min
- **Content:**
  - Why AI projects fail: the technology works fine — it's the people who struggle. 70% of digital transformations fail due to change management, not technical issues. BCG's research shows only 5% of companies generate value from AI at scale — their 10-20-70 rule explains why: 10% of AI value comes from algorithms, 20% from technology/data, and **70% from people and process change**.
  - Addressing the fears directly — the three conversations every AI champion must have:
    - **"AI will take my job"** → "AI will change your job — and you'll be better at it. The data shows AI-augmented workers are 40% more productive. Companies are hiring more, not fewer, people who can work with AI. Your job isn't disappearing; it's upgrading."
    - **"My company will be left behind by competitors adopting AI faster"** → "Here's the 90-day plan to close the gap. Early adopters are growing 1.5x faster, but it's not too late — most companies are still in the experimentation phase. The advantage goes to those who execute well, not those who started first."
    - **"I've been made redundant and need to reinvent myself"** → "AI skills are the single most in-demand capability in the job market right now. Your GWTH portfolio proves you can build, deploy, and lead AI projects. That puts you ahead of candidates with 10 years of experience in pre-AI roles."
  - Companies' fear: "We'll lose our best people unless we provide AI training"
    - The retention data: companies investing in AI training retain 34% more staff
    - The talent war: employees who don't get AI training start looking for employers who'll provide it
    - The solution: build an internal AI training program (and you're the one to build it)
  - Building an internal AI training program:
    - Week 1: awareness (what AI can do for our team)
    - Week 2: hands-on (guided AI tool usage in their actual workflow)
    - Week 3: building (create their first AI-powered tool with templates)
    - Week 4: measuring (what improved? What didn't? What's next?)
  - The AI champion role: what it is, how to get it, why it's the most secure position in any organisation
  - Quick wins: the 30-day plan to show AI value to sceptical leadership
  - Communication strategies: how to talk about AI to engineers (show the tech), executives (show the ROI), sales (show the quota impact), HR (show the retention data)
- **BUILD:** "AI Training Deck & Pilot Plan" — create a complete AI onboarding package for your organisation: (1) a 20-slide training presentation covering AI fundamentals, your recommended tools, security guidelines, and quick wins, (2) a 30-day pilot plan for one department including weekly goals and success metrics, (3) a one-page "AI Champion Role Description" you could present to HR. This should be something you could present to your CEO tomorrow.

---

**L15: Measuring ROI — Proving AI's Business Value**
- **Primitive:** Data Analysis + Strategy
- **Duration:** 60 min
- **Content:**
  - Why ROI matters: leadership won't fund what they can't measure. "It feels faster" isn't a business case.
  - The ROI framework for AI:
    - **Time saved** — hours per week reclaimed from manual tasks (multiply by hourly cost)
    - **Cost reduced** — subscriptions replaced, errors eliminated, rework avoided
    - **Revenue increased** — faster time to market, better customer experience, new capabilities
    - **Quality improved** — fewer errors, more consistent output, better compliance
    - **Risk mitigated** — security incidents prevented, compliance gaps closed, knowledge preserved
  - Building the business case: from "AI is cool" to "AI will save us £X per year and improve Y by Z%"
  - The Anthropic Economic Index lens: sector-specific productivity data — what's realistic and what's hype
  - Before/after measurement: establishing baselines before AI intervention (critical — you can't prove improvement without a starting point)
  - Intangible benefits worth mentioning: employee satisfaction, talent attraction, competitive positioning, speed to market
  - Common pitfalls: over-promising ("AI will replace 50% of the workforce"), under-measuring (no baseline), wrong metrics (measuring adoption, not impact), and the "pilot death spiral" (great pilot, no scale-up)
  - Reporting to leadership: quarterly AI impact reports, dashboard summaries, success story format
  - The compounding effect: AI ROI grows over time as more use cases are deployed and adoption increases
- **BUILD:** "AI ROI Calculator & Report" — build a tool that: (1) accepts inputs for a specific AI use case (current process time, frequency, error rate, employee cost), (2) calculates projected savings (time, cost, quality), (3) generates a one-page executive summary with charts, (4) includes a 12-month projection showing compounding returns. Use it to calculate the ROI of at least one project you've built this month. This is a tool you'll use for every AI proposal going forward.

---

### Week 4: Capstone & Transformation Leadership (L16–L20)
*Goal: Build and deploy the enterprise capstone on askevery.one, develop transformation leadership skills, and graduate with a portfolio that proves you can lead AI adoption at enterprise scale.*

---

**L16: Capstone Part 1 — AI Readiness Assessment Tool (askevery.one) — Planning & Architecture**
- **Primitive:** All 6
- **Duration:** 90 min
- **Content:**
  - The capstone brief: build an AI-powered tool that assesses an organisation's readiness for AI transformation and generates a personalised roadmap
  - Requirements deep dive:
    - **Assessment dimensions:** Strategy, People, Technology, Data, Governance, Culture — each with 5–8 questions
    - **Conversational interface:** chat or voice — the assessment should feel like talking to a consultant, not filling in a survey
    - **RAG-powered recommendations:** a knowledge base of transformation best practices (OpenAI "Staying Ahead," Anthropic Economic Index, McKinsey AI transformation framework, Gartner AI maturity model)
    - **Scoring & benchmarking:** weighted maturity scores per dimension, overall readiness score, comparison against industry averages
    - **Report generation:** automated executive report with radar chart, dimension breakdowns, prioritised recommendations, and 90-day action plan
    - **Multi-agent architecture:** assessor agent (conducts the interview), analyst agent (scores and benchmarks), report agent (generates the deliverable)
  - Architecture decisions:
    - Frontend: Next.js (recommended) or Streamlit
    - Backend: Claude Agent SDK or LangGraph
    - Database: Supabase (user management, assessment storage, analytics)
    - Vector DB: Qdrant (knowledge base of best practices)
    - Hosting: Vercel (frontend) + Railway (API) or Docker (self-hosted)
  - Sprint planning: breaking the project into 3 builds (this lesson, L17, L18)
    - Sprint 1 (L16): Requirements, architecture, repository setup, CI/CD, RAG knowledge base
    - Sprint 2 (L17): Assessment engine, scoring, multi-agent pipeline, chat/voice interface
    - Sprint 3 (L18): Report generation, deployment, security hardening, user testing
- **BUILD:** Begin the capstone — (1) finalise requirements document, (2) create architecture diagram, (3) set up GitHub repository with CI/CD, (4) build the RAG knowledge base (ingest 10+ best practice documents into Qdrant), (5) create the data model (assessment schema, scoring rubric, benchmark data). The foundation must be solid before building the application.

---

**L17: Capstone Part 2 — Building the Assessment Engine**
- **Primitive:** All 6
- **Duration:** 120 min
- **Content:**
  - Building the core assessment workflow:
    - Question flow: adaptive questioning based on previous answers (if they say "we have no AI policy," skip detailed governance questions and flag as critical gap)
    - Multi-agent pipeline: assessor generates questions and captures answers → analyst evaluates responses against the knowledge base → scorer calculates maturity levels
    - Natural language processing: converting free-text answers into structured scores
  - Implementing the conversational interface:
    - Chat-first approach: clean, professional chat UI with conversation history
    - Voice option (stretch goal): browser-based voice input → speech-to-text → AI processing → text-to-speech response
    - Progress indicator: "Dimension 3 of 6: Technology — 4 questions remaining"
  - The scoring algorithm:
    - Weighted dimensions: Technology and People weighted higher than others (they're the biggest barriers)
    - Maturity levels: 1 (Ad Hoc) → 2 (Repeatable) → 3 (Defined) → 4 (Managed) → 5 (Optimising)
    - Industry benchmarking: compare scores against average for their sector
  - Integration points:
    - Connect to the transformation dashboard (L11) so assessments feed into the tracking system
    - Export assessment data for further analysis
  - Testing: run the assessment yourself and iterate on question quality, scoring accuracy, and recommendation relevance
- **BUILD:** Continue the capstone — build the complete assessment engine: (1) conversational interview flow with adaptive questioning, (2) multi-agent scoring pipeline, (3) RAG-powered recommendations retrieval, (4) results dashboard showing dimension scores and overall readiness. The tool should be functional end-to-end at this point — someone should be able to complete a full assessment and see meaningful results.

---

**L18: Capstone Part 3 — Deploy, Test & Present**
- **Primitive:** All 6
- **Duration:** 90 min
- **Content:**
  - Report generation:
    - Automated executive report: radar chart of dimension scores, top 3 strengths, top 3 gaps, prioritised recommendations with timeframes
    - The 90-day action plan: auto-generated based on assessment results, using the Align-Activate-Amplify-Accelerate-Govern framework
    - Export formats: PDF, HTML, JSON (for API consumers)
  - Security hardening:
    - Apply the enterprise security checklist from L5 to the capstone
    - Data encryption at rest and in transit
    - Rate limiting and abuse prevention
    - Input validation (including prompt injection defences)
    - Access control: who can run assessments, who can see results
  - Performance testing:
    - Load testing: can it handle 10 concurrent assessments?
    - Latency: is the AI response time acceptable (<5 seconds per question)?
    - Caching: frequently asked questions should hit the cache, not the LLM
  - User testing:
    - Get 3+ people to complete the full assessment
    - Collect feedback: was it clear? Were recommendations useful? Was anything confusing?
    - Iterate based on feedback
  - Analytics: tracking completion rates, most common scores, frequently asked questions, drop-off points
  - Documentation: README, API documentation, deployment guide, user guide
  - Deployment: live on askevery.one with SSL, monitoring, and automated backups
  - The presentation: preparing a 5-minute demo for stakeholders or employers
- **BUILD:** Deploy the capstone to askevery.one. Complete: (1) automated report generation with PDF export, (2) security audit (apply L5 checklist), (3) performance testing, (4) user testing with 3+ participants, (5) analytics dashboard, (6) documentation (README + user guide). Record a 5-minute demo video showcasing the tool from start to finish.

---

**L19: Leading AI Transformation — The AI Champion's Playbook**
- **Primitive:** Strategy & Leadership
- **Duration:** 60 min
- **Content:**
  - The AI Champion role: what it is, why every organisation needs one, and how to become it
  - Building influence without formal authority: the art of driving change from any position in the organisation
  - The 90-day AI Transformation Plan:
    - **Days 1–30 (Align):** Audit current AI usage, identify top 3 opportunities, get leadership buy-in, form an AI working group
    - **Days 31–60 (Activate):** Launch pilot projects, train 10+ employees, deploy first internal tool, measure baseline metrics
    - **Days 61–90 (Amplify):** Document wins, present results to leadership, scale successful pilots to other departments, establish monthly AI review cadence
  - Handling resistance — the most common objections and how to respond:
    - "We tried AI before and it didn't work" → "The tools have changed fundamentally in the last 6 months. Let me show you what's possible now with a 2-week pilot."
    - "Our data isn't ready" → "You don't need perfect data to start. Here's a use case that works with the data you already have."
    - "It's too expensive" → "Here's the ROI calculation. The first project pays for itself in 3 months." (Use your L15 calculator.)
    - "What about security?" → "Here's our governance framework." (Show your L5 governance pack.)
    - "Our industry is different" → "Here are 3 companies in our sector already using AI for exactly this."
  - Building a community of practice: monthly AI meetups, Slack/Teams channel, shared resources, demo days
  - Staying current: GWTH Tech Radar, AI newsletters, key people to follow, conferences worth attending
  - The ethical dimension: being the voice of responsibility — advocating for AI that helps people, not replaces them
  - What's next after Month 3: freelancing, consulting, AI champion roles, further specialisation paths
- **BUILD:** "90-Day AI Transformation Proposal" — create a complete proposal for your organisation (real or target): (1) current state assessment (use your L1 self-assessment), (2) target state vision, (3) 90-day plan with weekly milestones and owners, (4) resource requirements and budget, (5) risk mitigation strategies, (6) success metrics and measurement plan, (7) one-page executive summary. This is your leadership capstone — the document that proves you can drive transformation, not just build tools.

---

**L20: Month 3 Review, Portfolio Showcase & What's Next**
- **Primitive:** All 6
- **Duration:** 60 min
- **Content:**
  - Review: three months of learning — from "What's AI?" to "I lead AI transformation for my organisation"
  - Portfolio update: your Month 3 projects represent a professional portfolio that most consultants would envy
    - Enterprise tools deployed on real domains
    - Multi-agent systems with production-grade architecture
    - Enterprise RAG and local AI infrastructure
    - Governance frameworks and transformation strategies
    - A live AI readiness assessment tool on askevery.one
  - Skills assessment: which primitives are you strongest in? Where do you still want to grow? What will you specialise in?
  - The GWTH community: staying connected, mentoring new students, sharing work, collaborating on projects
  - Career paths for GWTH graduates:
    - **AI Champion** — driving transformation within your current organisation
    - **AI Consultant** — advising multiple organisations on AI adoption
    - **Fractional CTO/AI Director** — part-time AI leadership for companies that can't hire full-time
    - **AI Product Builder** — launching SaaS products powered by AI
    - **AI Trainer** — running workshops and training programs for teams
  - The GWTH certification: what completing all three months demonstrates to employers and clients
  - The graduation challenge: 1-minute video pitch — "Here's what I can do with AI, and here's how I'll transform your organisation"
- **BUILD:** "Month 3 Portfolio & Graduation" — (1) update your professional portfolio with all Month 3 projects and deployed links, (2) record a 1-minute pitch video, (3) write a LinkedIn post announcing your GWTH graduation, (4) submit your best project to the GWTH showcase. Celebrate — you've earned it.

---

## 15 Optional Lessons

### Track A: Enterprise Verticals (O1–O5)
*For students working in (or targeting) specific enterprise sectors. Each lesson tackles industry-specific regulations, compliance, and scale challenges that don't apply to everyone.*

---

**O1: AI for Financial Services — Compliance, Risk & Automation**
- **Primitive:** Automation & Agents + Security + Coding
- **Duration:** 75 min
- **Who this is for:** Students in banking, insurance, investment, fintech, or financial advisory
- **Content:**
  - Financial services regulation and AI: FCA (UK), SEC (US), MiFID II (EU) — what you can and can't automate
  - KYC/AML automation: using AI to accelerate customer verification while maintaining compliance
  - Risk scoring: AI-powered credit assessment, fraud detection, and transaction monitoring
  - Report generation: automated regulatory reports (MiFID II best execution, Basel III capital adequacy)
  - The compliance guardrails: every AI output in financial services must be auditable, explainable, and traceable
  - Market data analysis: AI-powered trend detection, anomaly alerting, and portfolio analysis
  - Document processing: extracting structured data from financial documents (statements, contracts, policies)
  - The "human in the loop" mandate: where regulators require human oversight of AI decisions
- **BUILD:** "Financial Compliance Assistant" — build an AI tool that: (1) ingests financial documents (statements, contracts, regulatory filings), (2) extracts key data points, (3) flags compliance risks, (4) generates summary reports with citations. Must include audit logging and human approval for all compliance-related outputs.

---

**O2: AI for Healthcare — Regulation, Patient Safety & Clinical Decision Support**
- **Primitive:** Research & RAG + Security + Coding
- **Duration:** 75 min
- **Who this is for:** Students in healthcare, pharma, health tech, or medical administration
- **Content:**
  - Healthcare regulation and AI: NHS Digital, HIPAA, GDPR for health data, MDR (Medical Device Regulation)
  - Clinical decision support: AI that assists (never replaces) clinicians with evidence-based recommendations
  - Medical document processing: patient notes, lab results, clinical guidelines — RAG for healthcare
  - Patient-facing AI: chatbots for appointment booking, symptom checking (with massive disclaimers), medication reminders
  - Data privacy in healthcare: pseudonymisation, access controls, consent management, data retention policies
  - The liability question: who's responsible when AI gives wrong medical information?
  - Interoperability: HL7 FHIR, integration with existing hospital systems
  - Self-hosted models for healthcare: why many health organisations mandate local-only AI (Ollama + Qwen3 8B)
- **BUILD:** "Clinical Knowledge Assistant" (extending cdiffguide.com) — build a RAG-powered tool that answers clinical questions from a curated knowledge base of medical guidelines. Must include: source citations for every answer, confidence scoring, "I don't know" responses when evidence is insufficient, comprehensive audit logging, and HIPAA/GDPR-appropriate data handling. Use a self-hosted model (Ollama) for the inference layer.

---

**O3: AI for Public Sector — Procurement, Citizen Services & Transparency**
- **Primitive:** Automation + Coding + Strategy
- **Duration:** 75 min
- **Who this is for:** Students in government, public administration, NGOs, or public-sector suppliers
- **Content:**
  - Public sector AI adoption: opportunities and constraints (procurement rules, transparency requirements, accessibility standards)
  - Citizen-facing AI: chatbots for public services that meet WCAG 2.2 accessibility standards
  - FOI and transparency: how to build AI systems that can be audited and explained to the public
  - Procurement automation: AI-assisted tender evaluation, supplier scoring, compliance checking
  - Document management: AI-powered classification and retrieval for government archives
  - Bias and fairness: extra scrutiny required for AI decisions affecting citizens (benefits, permits, assessments)
  - The "algorithmic transparency" requirement: explaining AI decisions in plain language
  - Cost justification: public sector budgets require detailed ROI documentation
- **BUILD:** "Citizen Services Assistant" — build an AI chatbot for a public service (council, NHS trust, government department) that: (1) answers citizen queries from a knowledge base of FAQs and policies, (2) meets WCAG 2.2 accessibility standards, (3) includes a "How was this answer generated?" explanation for every response, (4) logs all interactions for transparency auditing. Deploy with government-appropriate security.

---

**O4: AI for Manufacturing & Supply Chain — Predictive Maintenance & Demand**
- **Primitive:** Data Analysis + Automation + Coding
- **Duration:** 75 min
- **Who this is for:** Students in manufacturing, logistics, supply chain, or operations management
- **Content:**
  - Manufacturing AI use cases: predictive maintenance, quality control, demand forecasting, inventory optimisation
  - Predictive maintenance: using AI to predict equipment failures before they happen (sensor data → anomaly detection → maintenance scheduling)
  - Demand forecasting: AI-powered prediction of customer demand, seasonal patterns, and supply chain disruptions
  - Quality control automation: image-based defect detection, statistical process control with AI alerts
  - Supply chain visibility: real-time tracking, risk assessment, alternative supplier recommendation
  - IoT integration: connecting AI to sensor data (temperature, vibration, pressure, throughput)
  - The ROI of predictive AI: unplanned downtime costs £10K–£100K/hour in manufacturing — even 10% reduction is massive
  - Self-hosted models for manufacturing: air-gapped environments, edge deployment, real-time inference
- **BUILD:** "Operations Intelligence Dashboard" — build a dashboard that: (1) ingests operational data (CSV or API — use sample data if you don't have real data), (2) visualises key metrics (throughput, defect rate, downtime, inventory levels), (3) uses AI to detect anomalies and predict trends, (4) generates automated alerts when metrics fall outside acceptable ranges. Include a cost-impact calculator showing the value of early detection.

---

**O5: AI for Professional Services — Consulting, Legal & Accounting**
- **Primitive:** Research & RAG + Automation + Coding
- **Duration:** 75 min
- **Who this is for:** Students in consulting, law, accounting, audit, or professional advisory services
- **Content:**
  - Professional services AI: automating the high-value, knowledge-intensive work that defines the sector
  - Legal document analysis: contract review, clause extraction, risk identification, precedent search
  - Accounting automation: invoice processing, reconciliation, anomaly detection, tax preparation support
  - Consulting deliverables: AI-assisted research, slide generation, client report writing, benchmarking analysis
  - Knowledge management: building firm-wide knowledge bases that preserve institutional knowledge
  - Client confidentiality: extra-strict data handling — every client's data must be isolated
  - Billing and utilisation: AI-powered time tracking, utilisation analysis, project profitability
  - The leverage model: AI as the "invisible associate" that does 80% of the research so professionals focus on strategy
- **BUILD:** "Professional Knowledge System" — build a RAG-powered tool for a professional services context: (1) ingest practice-area documents (contracts, guidelines, precedents), (2) enable natural-language search with citations, (3) client-isolated data (separate collections per client), (4) automated document summarisation, (5) export to formatted report. Use role-based access control so juniors see templates while partners see everything.

---

### Track B: Advanced Technical (O6–O10)
*For students who want to go deeper into enterprise AI infrastructure, security, open-source models, and voice AI.*

---

**O6: Advanced Multi-Agent Orchestration — Production Pipelines**
- **Primitive:** Automation & Agents + Coding / Building
- **Duration:** 75 min
- **Who this is for:** Students building complex AI systems with multiple cooperating and competing agents
- **Content:**
  - Advanced agent patterns: hierarchical teams (manager → team leads → workers), competing agents (evaluate multiple approaches), and self-improving agents (learn from past runs)
  - State management: how agents share context, memory, and intermediate results
  - Tool ecosystems: building custom MCP servers that give agents access to internal APIs, databases, and services
  - Evaluation frameworks: how to test whether your multi-agent system is actually better than a single well-prompted agent (often it isn't)
  - Production deployment: containerising agent systems, health checks, auto-scaling, cost monitoring
  - Failure modes: cascading failures in agent pipelines, hallucination amplification, infinite loops
  - Cost optimisation: using cheaper models for simple agent tasks, expensive models only for decision points
  - Real-world case studies: content pipelines, customer support triage, code review systems
- **BUILD:** "Multi-Agent Content Pipeline" — build a 4+ agent system: (1) Research Agent searches and retrieves source material, (2) Analysis Agent evaluates quality and extracts key points, (3) Writing Agent produces draft content, (4) Editor Agent reviews for quality, accuracy, and tone. Include: agent-to-agent communication logging, cost tracking per agent, quality scoring, and a human review step before publication.

---

**O7: Self-Hosted AI Infrastructure — Ollama, vLLM & GPU Management**
- **Primitive:** Infrastructure + Coding / Building
- **Duration:** 75 min
- **Who this is for:** Students deploying AI on company hardware for privacy, cost, or compliance reasons
- **Content:**
  - Production self-hosting: beyond the basics of L8, into enterprise-grade deployment
  - vLLM deep dive: PagedAttention, continuous batching, tensor parallelism — why it achieves 19x throughput vs Ollama
  - GPU management: monitoring utilisation, managing multiple models on shared hardware, scheduling inference jobs
  - Docker Compose for AI stacks: Ollama + Qdrant + n8n + your app — one command to deploy everything
  - Model versioning and updates: rolling out new model versions without downtime
  - Monitoring: Prometheus + Grafana for inference latency, throughput, GPU utilisation, and error rates
  - Backup and disaster recovery: what happens when your GPU server dies?
  - Multi-GPU strategies: model parallelism, data parallelism, serving different models on different GPUs
  - Cost modelling: hardware purchase vs cloud API — detailed break-even analysis for different usage patterns
- **BUILD:** "Production AI Server" — deploy a complete self-hosted AI stack using Docker Compose: (1) vLLM serving 2+ models with auto-routing, (2) Qdrant for vector search, (3) a web interface for internal users, (4) Prometheus + Grafana monitoring dashboard, (5) automated health checks and alerting. Include a cost comparison showing savings vs cloud API for your usage pattern.

---

**O8: AI Security Red Teaming — Pen Testing AI Systems**
- **Primitive:** Security & Governance + Coding / Building
- **Duration:** 75 min
- **Who this is for:** Students responsible for AI security, or anyone wanting to understand how AI systems get attacked
- **Content:**
  - Red teaming AI: systematically testing your AI systems for vulnerabilities
  - Prompt injection attacks: direct injection, indirect injection (via retrieved documents), multi-step injection
  - Jailbreaking techniques: role-play attacks, encoding tricks, many-shot attacks, context manipulation
  - Data exfiltration: getting AI to reveal training data, system prompts, or user data
  - Supply chain attacks: malicious MCP tools, poisoned embeddings, compromised model weights
  - The OWASP Agentic AI Top 10: testing each vulnerability in your own systems
  - Defence strategies: input filtering, output monitoring, sandboxed execution, privilege separation
  - Automated red teaming: building scripts that systematically test your AI for vulnerabilities
  - Responsible disclosure: what to do when you find vulnerabilities (in your systems or others')
- **BUILD:** "AI Security Audit" — perform a comprehensive security audit on your capstone (or most important Month 3 project): (1) test for all OWASP Agentic AI Top 10 vulnerabilities, (2) attempt prompt injection on every user-facing input, (3) test data access controls, (4) verify API key security, (5) check for information leakage in error messages. Document every finding with severity, impact, and remediation. Fix all critical and high issues.

---

**O9: Building with Open-Source Models — DeepSeek, Qwen, Mistral & Llama**
- **Primitive:** Coding / Building + Infrastructure
- **Duration:** 75 min
- **Who this is for:** Students who want to specialise in open-source AI deployment, reduce costs, or maintain full control
- **Content:**
  - The open-source AI landscape (February 2026): quality now matches proprietary models for many tasks
  - Model selection for specific tasks:
    - **DeepSeek V3.2** — MIT licence, frontier reasoning, best for complex analysis and code generation
    - **Qwen3 series** — 8B to 1T parameters, best multilingual support (119 languages), strong coding
    - **Mistral Large 3** — Apache 2.0, 675B MoE, best for European languages and enterprise compliance
    - **Llama 4 Scout/Maverick** — 10M context window, multimodal (text + image), best for document analysis
    - **Devstral 2** — Mistral's coding specialist, 72.2% on SWE-bench Verified
  - Fine-tuning basics: when and how to adapt an open model to your specific domain (LoRA, QLoRA)
  - Evaluation: how to benchmark models on your specific use case (not just public benchmarks)
  - Licensing: MIT vs Apache 2.0 vs Llama Community License — what you can and can't do commercially
  - The Chinese AI perspective: DeepSeek and Qwen are massively adopted in Asia — understanding global AI is a professional advantage
  - Combining models: using different open models for different tasks in the same system
  - Community and ecosystem: Hugging Face, model cards, safety evaluations, community benchmarks
- **BUILD:** "Open-Source Model Showcase" — deploy 3 different open-source models (one from each major family: DeepSeek, Qwen/Mistral, Llama) via Ollama or vLLM. Build a comparison interface that: (1) sends the same prompt to all three, (2) displays responses side-by-side, (3) measures latency and cost, (4) lets users vote on quality. Run 20+ comparisons on tasks relevant to your work and document which model wins for which task type.

---

**O10: Voice AI & Conversational Interfaces**
- **Primitive:** Coding / Building + Content Creation
- **Duration:** 75 min
- **Who this is for:** Students building voice-enabled AI applications, phone systems, or conversational interfaces
- **Content:**
  - Voice AI in 2026: ElevenLabs Eleven v3 (audio tags, text-to-dialogue), Kokoro (open-source, self-hosted), browser-native speech APIs
  - Speech-to-text: Whisper (self-hosted), Voxtral Transcribe 2 (Mistral, on-device, 13 languages), cloud APIs
  - Text-to-speech: choosing the right voice for your application (professional, friendly, authoritative)
  - Voice cloning: creating custom voices for your brand (ethics and consent requirements)
  - Conversational design: building dialogues that feel natural, handle interruptions, and manage context
  - Phone integration: connecting voice AI to phone systems (Twilio, Vonage) for automated customer service
  - Real-time voice: low-latency pipelines for live conversation (STT → LLM → TTS in <2 seconds)
  - Accessibility: voice interfaces as an accessibility feature for visually impaired or motor-impaired users
  - Multi-modal: combining voice with visual feedback (voice input, screen output)
- **BUILD:** "Voice-Enabled Assistant" — build a conversational AI that: (1) accepts voice input via browser microphone, (2) processes with an LLM (local or cloud), (3) responds with synthesised speech, (4) maintains conversation history, (5) can perform actions (search knowledge base, schedule events, generate reports). This can optionally be integrated into your capstone as the voice interface for the assessment tool.

---

### Track C: Leadership & Transformation (O11–O15)
*For students focused on building AI practices, leading transformation at scale, and developing executive-level AI advisory skills.*

---

**O11: Building an Internal AI Training Academy**
- **Primitive:** Strategy & Leadership + Content Creation
- **Duration:** 60 min
- **Who this is for:** Students tasked with training their organisation on AI, or HR/L&D professionals
- **Content:**
  - Why internal training beats external: tailored to your tools, your data, your use cases
  - Curriculum design: from "AI awareness" (1 hour) to "AI builder" (40 hours) — modular paths for different roles
  - Learning formats: live workshops, recorded modules, hands-on labs, mentoring, community of practice
  - Tool selection: which AI tools to standardise on (not "use everything" — pick 3–4 and go deep)
  - Measuring training effectiveness: not just "did they attend?" but "did their work improve?"
  - Train-the-trainer: building internal AI champions who can train their own teams
  - Content maintenance: AI evolves monthly — how to keep training current without rebuilding everything
  - Budget justification: the ROI of training (retention, productivity, risk reduction)
- **BUILD:** "AI Training Academy Blueprint" — design a complete internal AI training program: (1) role-based learning paths (executive, manager, individual contributor, developer), (2) curriculum for each path with learning objectives, (3) 3 sample lesson outlines with hands-on exercises, (4) assessment criteria, (5) maintenance plan for monthly updates. Include a budget estimate and ROI projection.

---

**O12: AI Ethics & Responsible Deployment at Scale**
- **Primitive:** Strategy & Leadership + Security
- **Duration:** 60 min
- **Who this is for:** Students in governance, compliance, or leadership roles — or anyone who wants to deploy AI responsibly
- **Content:**
  - AI ethics beyond buzzwords: concrete frameworks for making real decisions
  - Bias and fairness: how to detect, measure, and mitigate bias in AI systems (especially customer-facing ones)
  - Transparency: when and how to tell users they're interacting with AI
  - The EU AI Act: what it requires, when it applies, and how to comply (risk-based classification)
  - Environmental impact: the energy cost of AI — when self-hosting on efficient hardware beats cloud
  - Worker impact: honest conversation about job displacement vs job transformation — what the data actually shows
  - AI and creativity: copyright, attribution, and fair use in AI-generated content
  - Building an AI ethics review process: who reviews, what criteria, how fast (ethics shouldn't block but should guide)
  - The "red lines": things AI should never be used for in your organisation
- **BUILD:** "AI Ethics Framework" — create a practical ethics framework for your organisation: (1) ethical principles (5–7 statements), (2) risk assessment template for new AI projects, (3) bias testing checklist, (4) transparency policy (when to disclose AI usage), (5) red lines document (use cases explicitly prohibited). This should be a living document that evolves with the technology.

---

**O13: Starting an AI Consulting Practice**
- **Primitive:** Strategy & Leadership + Coding / Building
- **Duration:** 60 min
- **Who this is for:** Students wanting to freelance or build a consulting business around AI skills
- **Content:**
  - The AI consulting opportunity: demand for AI expertise far exceeds supply — especially for people who can *build*, not just advise
  - Your GWTH portfolio as your sales pitch: deployed apps, governance frameworks, transformation plans — this is what clients buy
  - Service offerings: AI readiness assessment (use askevery.one!), tool implementation, automation setup, training programs, ongoing advisory
  - Pricing strategies: day rate, project-based, retainer, value-based pricing
  - Finding clients: LinkedIn thought leadership, referrals, local business events, industry conferences
  - The discovery call: how to understand what a client actually needs in 30 minutes
  - Proposal writing: scope, deliverables, timeline, pricing, terms — with AI-assisted templates
  - Delivery frameworks: structured engagement models that deliver consistent quality
  - Building recurring revenue: from one-off projects to monthly retainers
  - Legal and business setup: business registration, insurance, contracts, IP ownership
- **BUILD:** "Consulting Practice Launch Kit" — create everything you need to start consulting: (1) service offerings page (3–5 packaged services with pricing), (2) proposal template, (3) discovery call script, (4) sample engagement contract, (5) a personal website or landing page showcasing your services and portfolio. If you're already freelancing, apply this to get your next client.

---

**O14: Advanced Career Strategy — Fractional CTO & AI Advisory**
- **Primitive:** Strategy & Leadership
- **Duration:** 60 min
- **Who this is for:** Senior professionals wanting to position themselves as AI leadership consultants or fractional executives
- **Content:**
  - The fractional executive model: providing C-suite AI leadership to companies that can't hire full-time (or don't know they need to)
  - What a Fractional AI Director does: strategy, vendor selection, team building, governance, and roadmap — typically 1–2 days per week per client
  - Building your advisory brand: thought leadership, speaking engagements, industry reports, case studies
  - Board-level communication: presenting AI strategy to non-technical executives and board members
  - Vendor evaluation: how to assess AI tools, platforms, and partners for organisations
  - Building AI teams: what roles to hire, when, and how to structure an AI function
  - The advisory relationship: balancing "tell them what to do" with "help them decide"
  - Scaling yourself: from 1 client to 5 — templates, frameworks, and leverage
- **BUILD:** "Advisory Practice Blueprint" — create: (1) your advisory positioning statement, (2) a "CTO-level AI audit" template you could run for any company, (3) a board presentation template for AI strategy, (4) a vendor evaluation framework, (5) a 12-month AI roadmap template. Pitch this to at least one real contact (even informally).

---

**O15: The Future of Work — Preparing for the Next 5 Years**
- **Primitive:** Strategy & Leadership + Research
- **Duration:** 60 min
- **Who this is for:** Everyone — this is the big-picture lesson about where AI is heading and how to stay ahead
- **Content:**
  - Where AI is heading: from assistants to agents to autonomous systems — the next 3 major shifts
  - The jobs that will grow: AI-augmented roles, new roles that don't exist yet, and why "AI specialist" is becoming "just how we work"
  - The skills that will matter: context engineering, model selection, system design, change management, ethics — the meta-skills above any specific tool
  - The open-source revolution: why the best AI will increasingly be free and self-hosted
  - Physical AI: robotics, autonomous vehicles, manufacturing — the next frontier after software agents
  - AGI and beyond: what it means, when it might arrive, and why it changes less than you think (organisations still need humans to set goals, make values-based decisions, and build relationships)
  - Continuous learning: how to stay current when the landscape changes every month
  - The GWTH commitment: always up to date, always practical, always building
  - Your personal AI strategy: a 5-year plan for your career in the age of AI
- **BUILD:** "My 5-Year AI Strategy" — write a personal strategic plan: (1) where you are now (skills, role, goals), (2) where AI will be in 5 years (your informed prediction), (3) the skills and experiences you need to get there, (4) a 12-month action plan with quarterly milestones, (5) a "stay current" system (newsletters, communities, tools, learning paths). Share it with a peer for feedback.

---

## Lesson-Primitive Map

### Mandatory Lessons (L1–L20)

| # | Lesson | Primary Primitive | Secondary | Week |
|---|--------|------------------|-----------|------|
| L1 | Welcome to Month 3 | Strategy & Leadership | — | 1 |
| L2 | AI Transformation Framework | Strategy & Leadership | — | 1 |
| L3 | Choosing the Right Model | Foundations + Strategy | — | 1 |
| L4 | Cost Intelligence | Strategy + Data Analysis | — | 1 |
| L5 | Enterprise Security & Governance | Security & Governance | — | 1 |
| L6 | Multi-Agent Systems | **Automation & Agents** + Coding | — | 2 |
| L7 | Enterprise RAG | **Research & RAG** + Coding | — | 2 |
| L8 | Hosting LLMs Locally | Infrastructure + Coding | — | 2 |
| L9 | Workflow Automation at Scale | **Automation & Agents** | — | 2 |
| L10 | Internal Tools for Enterprise | **Coding / Building** | — | 2 |
| L11 | AI Transformation Dashboard | **Coding / Building** + Strategy | — | 3 |
| L12 | Advanced Cursor & Claude Code | **Coding / Building** | — | 3 |
| L13 | AI-Powered Data Pipelines | Data Analysis + Automation | — | 3 |
| L14 | Change Management | Strategy & Leadership | — | 3 |
| L15 | Measuring ROI | Data Analysis + Strategy | — | 3 |
| L16 | Capstone Part 1 — Planning | All 6 | — | 4 |
| L17 | Capstone Part 2 — Build | All 6 | — | 4 |
| L18 | Capstone Part 3 — Deploy | All 6 | — | 4 |
| L19 | AI Champion's Playbook | Strategy & Leadership | — | 4 |
| L20 | Month 3 Review & Portfolio | All 6 | — | 4 |

### Optional Lessons (O1–O15)

| # | Lesson | Primary Primitive | Track | Industry |
|---|--------|------------------|-------|----------|
| O1 | AI for Financial Services | Automation + Security + Coding | Enterprise Vertical | Finance |
| O2 | AI for Healthcare | Research & RAG + Security + Coding | Enterprise Vertical | Healthcare |
| O3 | AI for Public Sector | Automation + Coding + Strategy | Enterprise Vertical | Government |
| O4 | AI for Manufacturing | Data Analysis + Automation + Coding | Enterprise Vertical | Manufacturing |
| O5 | AI for Professional Services | Research & RAG + Automation + Coding | Enterprise Vertical | Consulting/Legal |
| O6 | Advanced Multi-Agent | Automation + Coding | Advanced Technical | — |
| O7 | Self-Hosted AI Infra | Infrastructure + Coding | Advanced Technical | — |
| O8 | AI Security Red Teaming | Security + Coding | Advanced Technical | — |
| O9 | Open-Source Models | Coding + Infrastructure | Advanced Technical | — |
| O10 | Voice AI | Coding + Content | Advanced Technical | — |
| O11 | Internal AI Training Academy | Strategy + Content | Leadership | — |
| O12 | AI Ethics & Responsible AI | Strategy + Security | Leadership | — |
| O13 | AI Consulting Practice | Strategy + Coding | Leadership | — |
| O14 | Fractional CTO & Advisory | Strategy | Leadership | — |
| O15 | Future of Work | Strategy + Research | Leadership | — |

### Primitive Coverage Summary

| Primitive | Mandatory (Primary) | Mandatory (Secondary) | Optional (Primary) | Total |
|-----------|--------------------|-----------------------|-------------------|-------|
| **Coding / Building** | L6, L7, L8, L10, L11, L12, L16–L18 = **9** | L3, L4 | O1–O10, O13 = **11** | 22 |
| **Automation & Agents** | L6, L9 = **2** | L13, L16–L18 | O1, O3, O4, O5, O6 = **5** | 11 |
| **Strategy & Leadership** | L1, L2, L3, L4, L14, L15, L19 = **7** | L5, L11, L16–L18, L20 | O3, O11–O15 = **7** | 20 |
| **Research & RAG** | L7 = **1** | L16–L18 | O2, O5, O15 = **3** | 7 |
| **Security & Governance** | L5 = **1** (+woven into every build) | L16–L18 | O1, O2, O8, O12 = **4** | 8 |
| **Data Analysis** | L4, L13, L15 = **3** | L16–L18 | O4 = **1** | 7 |
| **Content Creation** | — | L16–L18, L20 | O10, O11 = **2** | 5 |

---

## Key Differences: Month 2 vs. Month 3

| Aspect | Month 2 | Month 3 |
|--------|---------|---------|
| **Total lessons** | 35 (20 mandatory + 15 optional) | 35 (20 mandatory + 15 optional) |
| **Focus** | Building real apps for SMBs | Enterprise transformation & scale |
| **Primary audience** | Individual builders and small teams | AI champions, leaders, and consultants |
| **Coding complexity** | Multi-file apps with databases and APIs | Multi-agent systems, enterprise RAG, local AI infrastructure |
| **Security** | Fundamentals + one deep dive | Enterprise governance, OWASP AI Top 10, red teaming |
| **RAG** | Basic RAG + one advanced optional | Enterprise RAG with hybrid search, access control, multi-collection |
| **Agents** | Single agents + one multi-agent optional | Multi-agent as core skill, Claude Agent SDK, production orchestration |
| **Model knowledge** | "Use Claude and GPT" | Full landscape: DeepSeek, Qwen, Mistral, Llama + proprietary. Right model for the job. |
| **Cost awareness** | Mentioned but not primary | Core design constraint — every project includes cost analysis |
| **Local AI** | Mentioned briefly | Full lesson on self-hosting (Ollama, vLLM, GPU management) |
| **Transformation** | One business case lesson (L19) | 4 mandatory strategy/leadership lessons + 5 optional |
| **Industry focus** | 7 optional verticals (any sector) | 5 optional verticals (enterprise-specific: finance compliance, healthcare regulation, public sector procurement) |
| **Career focus** | Portfolio, GitHub, interviews | AI consulting, fractional CTO, advisory practices |
| **Capstone** | AI Customer-Support Chatbot (askmyco.com) | AI Readiness Assessment Tool (askevery.one) |
| **Deployment** | Required for major projects | Required with enterprise security, monitoring, and documentation |
| **Open source** | Mentioned as alternative | Core curriculum — full lesson on choosing and deploying open models |
| **Change management** | Brief mention | Full lesson on training teams, handling resistance, measuring adoption |

---

## Duration Summary

### Mandatory Lessons (20)

| Week | Lessons | Total Duration |
|------|---------|---------------|
| Week 1 (L1–L5) | 5 lessons | 330 min (5h 30m) |
| Week 2 (L6–L10) | 5 lessons | 420 min (7h 00m) |
| Week 3 (L11–L15) | 5 lessons | 375 min (6h 15m) |
| Week 4 (L16–L20) | 5 lessons | 420 min (7h 00m) |
| **Total Mandatory** | **20 lessons** | **1,545 min (25h 45m)** |

### Optional Lessons (15)

| Track | Lessons | Total Duration |
|-------|---------|---------------|
| Enterprise Verticals (O1–O5) | 5 lessons | 375 min (6h 15m) |
| Advanced Technical (O6–O10) | 5 lessons | 375 min (6h 15m) |
| Leadership & Transformation (O11–O15) | 5 lessons | 300 min (5h 00m) |
| **Total Optional** | **15 lessons** | **1,050 min (17h 30m)** |

### Typical Student Path

| Path | Lessons | Duration |
|------|---------|----------|
| **Minimum** (mandatory only) | 20 | 25h 45m |
| **Recommended** (mandatory + 3–5 optional) | 23–25 | 29h 30m – 32h 00m |
| **Maximum** (all lessons) | 35 | 43h 15m |

---

## Tools & Services Referenced (All Current as of February 17, 2026)

*The full, always-current tool list lives on the **GWTH Tech Radar** (gwth.ai/tech-radar) — 47+ tools across 16 categories, updated daily by an automated scanner. The table below is a snapshot for reference.*

### LLMs & AI Models

| Model | Provider | Licence | Key Strength | Cost |
|-------|----------|---------|-------------|------|
| Claude Opus 4.6 | Anthropic | Proprietary | Best reasoning, 1M context | Max $100–200/mo |
| Claude Sonnet 4.6 | Anthropic | Proprietary | Opus-level reasoning, lower cost (released Feb 17, 2026) | Pro $20/mo |
| Claude Haiku 4.5 | Anthropic | Proprietary | Fastest, cheapest Claude | API pricing |
| GPT-5.3-Codex | OpenAI | Proprietary | Strong coding agent | ChatGPT Pro $200/mo |
| GPT-5.3-Codex-Spark | OpenAI + Cerebras | Proprietary | 1,000+ tok/sec real-time | ChatGPT Pro |
| Gemini 3 Pro | Google | Proprietary | State-of-the-art reasoning, multimodal, agentic | Free tier / paid |
| Gemini 3 Flash | Google | Proprietary | Pro-grade reasoning at Flash speed | Free tier / paid |
| Gemini 3 Deep Think | Google | Proprietary | Specialised for science and research | AI Ultra subscription |
| DeepSeek V3.2 | DeepSeek | MIT | Frontier reasoning, self-hostable | Free (self-hosted) |
| Qwen3 (8B–1T) | Alibaba | Apache 2.0 | 119 languages, strong coding | Free (self-hosted) |
| Qwen3-Coder-Next 80B | Alibaba | Apache 2.0 | Matches Sonnet 4.6 on coding | Free (self-hosted) |
| Mistral Large 3 | Mistral AI | Apache 2.0 | 675B MoE, European, multilingual | Free (self-hosted) |
| Devstral 2 (123B) | Mistral AI | Apache 2.0 | 72.2% SWE-bench Verified | Free (self-hosted) |
| Llama 4 Scout | Meta | Llama Licence | 10M context, multimodal | Free (self-hosted) |
| Llama 4 Maverick | Meta | Llama Licence | 128 experts, beats GPT-4o | Free (self-hosted) |

### Tools & Infrastructure

| Tool | Category | Status | Cost |
|------|----------|--------|------|
| Claude Code | CLI Coding Agent | GA | Max plan / API |
| Claude Cowork | Desktop Agent | Research Preview (macOS + Windows) | Included with paid plans |
| Claude Agent SDK | Agent Framework | GA | Free (open-source) |
| Cursor 2.0 | AI-Native IDE | GA (multi-agent, 8 parallel) | Free / Pro $20/mo |
| Windsurf | AI IDE | GA | Free tier / Pro |
| OpenClaw | Open-Source Agent | Active (200K+ stars, moving to foundation) | Free (BYOK) |
| Ollama | Local LLM Runtime | GA | Free (open-source) |
| vLLM | Production Inference | GA | Free (open-source) |
| LM Studio | Local LLM GUI | GA | Free |
| n8n 2.9 | Automation | GA (Feb 16, 2026) | Free (self-hosted) / Cloud |
| Make.com | Automation (Managed) | GA | Free tier / paid |
| LangGraph | Multi-Agent Framework | GA | Free (open-source) |
| CrewAI | Multi-Agent Framework | GA | Free (open-source) |
| AWS Strands Agents | Multi-Agent Framework | GA | Free (open-source) |
| OpenAI Agents SDK | Agent Framework | GA | Free (open-source) |
| Qdrant | Vector Database | GA | Free (self-hosted) / Cloud |
| Pinecone | Vector Database (Managed) | GA | Free tier / paid |
| Supabase | Database + Auth | GA | Free tier / paid |
| PostgreSQL | Relational Database | GA | Free (open-source) |
| Vercel | Hosting (Frontend) | GA | Free tier / Pro |
| Railway | Hosting (Backend) | GA | Free tier / Pro |
| Docker | Containers | GA | Free / Business |
| GitHub | Version Control + CI/CD | GA | Free / Enterprise |
| Sentry | Error Monitoring | GA | Free tier |
| Stripe | Payments | GA | 1.5% + 20p per transaction |
| ElevenLabs Eleven v3 | AI Voice | Alpha (Feb 11, 2026) | Free tier / paid |
| Kokoro | AI Voice (Self-Hosted) | GA | Free (open-source) |
| Voxtral Transcribe 2 | Speech-to-Text | GA | Free (open-source) |

---

## CSV Project Mapping (Month 3 Projects)

| Project | Domain | Type | Lesson | Track |
|---------|--------|------|--------|-------|
| AI Readiness Assessment Tool | askevery.one | Capstone | L16–L18 (Mandatory) | Capstone |
| AI Transformation Tracker | productarchitect.dev | Major | L11 (Mandatory) | — |
| Company Knowledge Base | aitranscriptionhub.com | Major | L7 (Mandatory) | — |

---

## Transition to Month 4 (and Beyond)

Month 3 ends with students who can:
- Lead AI transformation across an organisation using the Align-Activate-Amplify-Accelerate-Govern framework
- Build and deploy multi-agent systems with production-grade architecture
- Set up enterprise-scale RAG with hybrid search, access controls, and evaluation
- Host and manage LLMs locally for privacy, cost, and control
- Choose the right AI model for any task across the full landscape (proprietary + open-source + Chinese)
- Build enterprise-grade internal tools with SSO, RBAC, and real-time features
- Create and manage automation workflows at enterprise scale
- Measure and communicate AI ROI to leadership
- Train teams on AI adoption and manage organisational change
- Apply enterprise security and governance frameworks (OWASP AI, NIST, EU AI Act)
- Deliver a professional AI readiness assessment to any organisation
- Present a portfolio that includes live enterprise applications on real domains

For students who want to continue beyond Month 3, GWTH offers:
- **Specialisation tracks** — deep dives into specific domains (AI for startups, AI for education, advanced machine learning)
- **Community projects** — collaborative builds with other GWTH graduates
- **Mentorship** — experienced graduates mentoring new students
- **The GWTH Tech Radar** — stay current with daily-updated tool intelligence
- **Alumni events** — monthly demos, quarterly meetups, annual conference

---

## What's Different From a Hypothetical Previous Draft

| Change | Rationale |
|--------|-----------|
| **5-step framework (Align/Activate/Amplify/Accelerate/Govern)** | Based on OpenAI's "Staying Ahead" guide — the most actionable enterprise AI framework available |
| **Full LLM landscape including Chinese models** | DeepSeek V3.2 and Qwen3 are frontier-quality and MIT/Apache-licensed. Ignoring them is a disservice to students. |
| **Self-hosting as core curriculum** | Ollama and vLLM make local AI viable for any business. Privacy, cost, and control are enterprise priorities. |
| **Cost as first-class constraint** | At enterprise scale, token costs matter. Every project includes cost analysis. |
| **Change management as mandatory** | Technology doesn't fail; adoption does. 20% of mandatory time on strategy/leadership. |
| **Enterprise verticals (not SMB)** | Month 2 covered SMB. Month 3 tackles regulated industries: finance, healthcare, public sector, manufacturing. |
| **Claude Agent SDK as primary agent tool** | Production-grade, same infrastructure as Claude Code, MCP integration. The professional choice. |
| **OWASP Agentic AI Top 10** | The 2026 standard for AI security — developed by 100+ industry experts. Essential for enterprise. |
| **Capstone: AI Readiness Assessment** | Commercially viable, combines all skills, literally starts transformations. Students graduate by building the tool that helps other organisations adopt AI. |
