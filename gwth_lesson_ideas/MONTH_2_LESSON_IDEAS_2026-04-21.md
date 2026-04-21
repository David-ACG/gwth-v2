# Month 2 Lesson Ideas — AI for Your Industry

*Generated 2026-04-21. Supersedes `LESSON_IDEAS_2026-03-12.md` (Newsbot-only, outdated) and the `syllabus.json` Month 2 draft (35 lessons, Feb 2026). A scoring comparison against the current `syllabus.json` Month 2 lessons is in [`SYLLABUS_DIFF_MONTH_2_2026-04-21.md`](SYLLABUS_DIFF_MONTH_2_2026-04-21.md).*

### Revision log

- **2026-04-21** — First version. Written after Month 1 and Month 3 redesigns. Adopts the same structural pattern (20 lessons at a glance, build-project table, Optional lessons, Lab ideas, Sources) and the prescriptive stack approach from Month 1's L9 (big three + one challenger).

*Sources (global, intentionally diversified so Month 2 isn't a summary of one vendor): **Anthropic** (Claude Code docs, Agent SDK docs, MCP specification, Projects docs, Artifacts docs, Agentic Coding Trends Report Feb 2026) · **OpenAI** ("Identifying and Scaling AI Use Cases" Apr 2025, "A Practical Guide to Building Agents" Dec 2024, "AI in the Enterprise" Nov 2024, Responses API + Agent SDK docs, Codex docs) · **Google** (Gemini 3 Pro/Flash docs, Gemini CLI, Vertex AI, Firebase Studio, Stitch) · **Meta** (Llama 3.3, Code Llama) · **Vercel** (AI SDK v5, Open Agents reference platform, v0) · **Supabase** (Auth, Postgres, pgvector, Edge Functions docs) · **Stripe** (Payments + Subscriptions docs + AI integrations) · **Sentry / PostHog / Helicone / Langfuse / Braintrust** (production observability) · **LangChain / LangGraph / CrewAI / AWS Strands** (agent orchestration) · **Qdrant / Pinecone / Weaviate** (vector DB) · **ElevenLabs Agents / Vapi / Retell** (voice agents) · **n8n 2.0 / Make Maia / Zapier Agents** (automation) · **Lovable / Bolt / v0 / Replit** (vibe coding) · **Ethan Mollick** (Lab/Crowd/Leadership framings) · **a16z Sivulka** (Institutional AI) · **Ramp Goddijn/Glyman** (Glass harness engineering) · **NLW AI Daily Brief**, **Latent Space**, **No Priors**, **Every Eval**, **AI Engineer podcast**.*

*Sources (UK): FCA "Live Testing of AI" + FS24/4 AI statement · ICO AI + pgvector guidance · NCSC "Secure AI development" · DSIT AI Security Institute 2026 evaluations · Bank of England AI strategy · HSBC UK £105bn opportunity research · Octopus Energy Kraken case · Tesco AI Whoosh case · NatWest Cora+ assistant · Lloyds 200-exec AI programme · British Airways/IAG Copilot · Ocado Time Smart Shopping · Starling/Monzo/Revolut agentic banking · Wayve self-driving · Synthesia · ElevenLabs UK presence · Stability AI UK-founded · ARIA UK research agency · techUK 2026 surveys · British Chambers of Commerce 54%/11% finding · ONS productivity + AI statistics · PwC UK AI Jobs Barometer · CIPD 2026 skills report · UK civil-service Humphrey suite.*

*Research library: [`month-2-research/`](month-2-research/) · Pipeline ingestion folder (to be created): `C:/Projects/1_gwthpipeline520/data/PDFs_manual_download/GWTH_Month_2/`*

**Why source diversification matters more for Month 2 than any other month.** Month 2 is the **fastest-changing month** of the course — the production-build tooling (Cursor releases, Claude Code releases, Gemini CLI releases, MCP spec revisions, vector-DB pricing shifts, agent framework churn) moves on a weekly-to-daily cycle. If we anchored Month 2 to a single book or a single vendor, every lesson would be out of date before the student pressed play. **We therefore:**

1. **Only prescribe tools from trusted labs** (Anthropic, OpenAI, Google, Meta for models; Vercel, Supabase, Anthropic, OpenAI for infrastructure) as the **default** in core lessons — these are labs that will still exist in 12 months.
2. **Quarantine everything experimental into Labs** — head-to-head comparisons that go stale fast (which vector DB is cheapest this month, which agent framework has fewer bugs this week, which new eval library is best). Labs are dated and refreshed; core lessons stay stable.
3. **Rebuild from first principles every lesson** so that when Gemini 3.2 ships, or when MCP v2 adds a new transport, or when Supabase renames a feature, updating the lesson is a three-line swap, not a rewrite.

*Why UK additions?* Per the Month 1 + 3 pattern: every concept, tool and case study has a UK-native anchor so students can see what a British company, regulator, or developer actually did — then compare to the global benchmark. UK examples are the applied reality; global examples are the context.

**Audience.** Students who have completed Month 1. They have built 15+ things with Claude Artifacts, Lovable, Bolt, and Claude Cowork. They can brief AI like a colleague. They have a tool log, a prompt library, and a Family AI Bot running in their home. They are now ready to **stop being helped by AI and start directing AI to build for them** — *from* vibe-coding *into* professional, deployable, revenue-generating production apps.

Like Month 1 and Month 3, the primary audience is **individuals and SMEs**, with larger organisations served through the **bespoke-lesson service** (one custom lesson per 100 students a single company enrols).

---

## Month mapping recap

- **Month 1 — AI for Your Life** — foundations, first builds, automations for yourself. *Vibe coding dominates.*
- **Month 2 — AI for Your Industry** — production apps, agents, RAG, integrations. *Professional tooling dominates. The AI Readiness Assessment Tool is the capstone.*
- **Month 3 — AI for Your Company** — leadership, strategy, governance, culture. *Uses the AI Readiness Assessment Tool built in Month 2 as a strategic artefact.*

Month 2 exists to take a Month-1 graduate — *"I can prompt Claude Artifacts to build a utility, I can wire Zapier to Cowork"* — and in four weeks make them someone who:

1. **Builds in a professional IDE** (Cursor, Claude Code, or Windsurf — chosen prescriptively) with CLAUDE.md / .cursorrules / MCP tools set up.
2. **Calls model APIs directly from their own code** (Claude, OpenAI, Gemini) and **deploys** the result to a live URL.
3. **Builds RAG systems** that ground AI in their own data — PDFs, Word docs, Excel, web pages — using Supabase pgvector or Qdrant.
4. **Ships real agents** built on Claude Agent SDK, OpenAI Agents SDK, or LangGraph — with MCP tools, retries, observability, and a cost ceiling.
5. **Builds the AI Readiness Assessment Tool** — a portfolio-quality SaaS that evaluates any business's AI maturity, produces a transformation roadmap, and (for students who want one) becomes their own consulting lead-gen asset.

---

## The core argument for Month 2

After Month 1 the student has the mindset and the hands. What they do **not** yet have is the ability to build something that runs **while they're asleep, for a user who isn't them, on an URL their friend can visit, using data their friend uploaded, without the student paying Anthropic's full API bill for every request.** That is the Month 2 delta.

**The transition.** In Month 1 the student used Claude Artifacts, Lovable and v0 to build tools — the AI wrote every line and the student never saw the code. In Month 2 the student **sees the code**, **owns the code**, and **directs AI** through proper dev tooling (Cursor, Claude Code, Windsurf) to build apps the student can extend forever. This is the **"vibe coding → agentic coding"** transition that NLW, Anthropic's 2026 Agentic Coding Trends Report, and Ethan Mollick's *Lab/Crowd/Leadership* framing all point at: the builder keeps the AI leverage but gains control, portability, and production-grade delivery.

**Why building dominates more than in Month 1 or Month 3.** 20 of 20 lessons include a hands-on build. Month 2 has the **most builds of any month** — because this is where students go from "I can make a prototype" to "I have seven shipped apps on live URLs" — the single most career-changing transition in the whole course. Ethan Mollick's research (*Lab*) and the April 2026 PwC UK AI Jobs Barometer converge on the same point: the people who **actually build** are the ones whose salaries moved.

**UK framing.** The UK's **AI Opportunities Action Plan** (Matt Clifford, Jan 2025) called explicitly for the UK to become *"an AI maker, not just an AI taker."* The **British Chambers of Commerce** (March 2026) found **54% of UK firms use AI but only 11% use it deeply**. The 43-point gap is not a tooling gap — it is a *building* gap. Month 2 turns students into the people who close it. The UK has the talent (Wayve, Synthesia, Stability AI, ElevenLabs UK, DeepMind, ARIA), the capital (HSBC £105bn opportunity), and the regulatory clarity (FCA sandbox, ICO AI guidance, NCSC secure-AI-dev). What it lacks, at SME scale, is shippers. Month 2 creates shippers.

---

## The 20 lessons at a glance

| # | Lesson | Primary primitive | Build | Week |
|---|--------|-------------------|-------|------|
| L1 | Welcome to Month 2 — from vibe-coding to agentic coding | Foundations / Mindset | *Project brief + capstone preview* | 5 |
| L2 | Your professional builder stack — Cursor, Claude Code, Windsurf | Coding / Building | *Dev environment + first repo* | 5 |
| L3 | Context engineering — CLAUDE.md, specs, and the stop-vibing rule | Coding / Building | *Spec template + re-spec a Month 1 app* | 5 |
| L4 | Calling model APIs from your own code | Coding / Building | *API-powered mini-app* | 5 |
| L5 | Security from day one — keys, injection, GDPR, UK ICO | Safety + Coding | *Hardened project template* | 5 |
| L6 | Ingesting real business data — PDFs, Word, Excel, websites | Data + Coding | *Document parser* | 6 |
| L7 | Vectors & embeddings explained without the maths | Data + Research | *Semantic-search demo* | 6 |
| L8 | Build your first RAG app — Supabase pgvector + Claude | **Coding / Building** | **Company Knowledge Bot** | 6 |
| L9 | Making RAG actually work — chunking, re-ranking, evals | Data + Coding | *RAG-tuning notebook* | 6 |
| L10 | Persistent data + multi-user — Supabase Postgres + Auth + RLS | Coding / Building | *Multi-user app skeleton* | 6 |
| L11 | Agents that take actions — Claude Agent SDK + MCP | **Automation + Coding** | **MCP-enabled agent** | 7 |
| L12 | Browser & computer-use agents — when your app is the web | Automation + Coding | *Research agent* | 7 |
| L13 | Voice agents — ElevenLabs Agents & Vapi for UK SMEs | Automation + Content | *First voice agent* | 7 |
| L14 | Multimodal pipelines — image, audio, video in production | Content + Coding | *Content pipeline* | 7 |
| L15 | Production automation — n8n self-hosted, Make, Zapier Agents | Automation | *Multi-step automation* | 7 |
| L16 | Capstone part 1 — design the Scoring Engine | **Coding / Building** | **Deterministic scoring engine** | 8 |
| L17 | Capstone part 2 — RAG & Ask-the-tool chat | **Coding / Building** | **Chat grounded in UK research** | 8 |
| L18 | Capstone part 3 — PDF export, Auth, deploy | **Coding / Building** | **PDF + Coolify/Vercel deploy** | 8 |
| L19 | Capstone part 4 — demo, portfolio, launch | Content + Meta | **Public URL + demo video + LinkedIn post** | 8 |
| L20 | Month 2 review & Month 3 preview — what you can charge for | Strategy / Meta | **Consulting service page** | 8 |

**Build project count:** 20 of 20 lessons have a hands-on build. 7 of them (L8, L10, L11, L14, L16, L17, L18) are production-grade multi-file projects. 4 (L16–L19) are the Capstone.

---

## The prescriptive stack (the "big 3 + one challenger" rule applied to Month 2)

Carrying forward from Month 1's L9, and deliberately extending it to production tooling. The rule: **for each job we commit to one GWTH default (from the big labs where possible) and one challenger for a Lab comparison.** Anything else waits outside the core.

| Job | GWTH default | Big-3 alternatives | Challenger (Labs) | Lab # |
|-----|--------------|--------------------|-------------------|------|
| **Professional coding IDE** | **Claude Code** (terminal) + **Cursor** (IDE) — dual-tool workflow | OpenAI Codex CLI, Gemini CLI | Windsurf, Cline | M2-Lab 1 |
| **Frontend framework** | **Next.js 16** (App Router, RSC) | Remix, SvelteKit, Astro | — | — |
| **UI component library** | **shadcn/ui + Tailwind v4** | Radix UI, Chakra, Mantine | — | — |
| **Backend language/framework** | **TypeScript on Next.js API routes / server actions** (stay in one language) | Python FastAPI, Go Chi | Bun Elysia | M2-Lab 5 |
| **Database + auth + storage** | **Supabase** (Postgres + Auth + Storage + Edge Functions) | Neon + Clerk + Cloudflare R2, Firebase, AWS Amplify | Convex | M2-Lab 6 |
| **Vector DB for RAG** | **Supabase pgvector** (default for Next.js apps) | Qdrant (self-host), Pinecone | Weaviate, Turso Vector | M2-Lab 8 |
| **Document ingestion** | **Docling** (IBM) for PDF/Word; **Firecrawl** for websites | Unstructured, LlamaParse, Markitdown | Mistral OCR | M2-Lab 9 |
| **Agent framework** | **Claude Agent SDK** (TypeScript + Python) | OpenAI Agents SDK, LangGraph, CrewAI | AWS Strands, Pydantic AI | M2-Lab 11 |
| **Agent tool integration — CLIs first, MCP second** | **(a) CLIs via Bash** (gh, supabase, stripe, vercel, aws, gcloud, git, pnpm, ffmpeg, docker, kubectl, gemini, codex, claude) — the *first* reach for most agentic-coding tasks. **(b) Anthropic MCP** for persistent, discoverable, non-CLI tools (Gmail, Slack, internal APIs, CRM). | Direct HTTP/SDK calls when neither fits; Function calling (OpenAI-specific) | — | M2-Lab 20 |
| **Browser / computer-use agent** | **Claude for Chrome** (paid tier) + **Anthropic Computer Use** | ChatGPT Atlas (macOS), Google Project Mariner, Perplexity Comet | OpenClaw (only in labs — CVE warnings) | M2-Lab 12 |
| **Voice agent** | **ElevenLabs Agents** (UK presence; great voices) | OpenAI Voice Agents, Google AI Voice | Vapi, Retell | M2-Lab 13 |
| **Automation platform** | **n8n 2.0 self-hosted on Coolify** (UK data-sovereignty) + **Zapier Agents** (for quick wins) | Make Maia, Pipedream | — | M2-Lab 15 |
| **Deployment** | **Vercel** (free tier) for public apps; **Coolify on a VPS** for UK-data-sovereign apps | Netlify, Railway, Render | Fly.io, Cloudflare Workers | M2-Lab 18 |
| **Observability & evals** | **Sentry** (errors) + **PostHog** (product analytics) + **Langfuse** (LLM traces/evals) | Helicone, LangSmith, Braintrust | Phoenix (Arize), Comet Opik | M2-Lab 16 |
| **Payments** | **Stripe** | Lemon Squeezy, Paddle | Polar.sh | M2-Lab 17 |

**Why these defaults?**

- **Single-language full-stack** (TypeScript + Next.js + Supabase) reduces the concept load massively. One language to learn, one deploy target, one auth provider. Students who want Python for LLM work use it *inside* Next.js serverless routes or Supabase Edge Functions — no split codebase.
- **All the AI APIs (Claude, GPT, Gemini) speak TypeScript fluently** with Vercel AI SDK v5. No reason to force Python on a beginner unless they need specific Python-only libraries (Docling, a specific fine-tuning toolkit, etc.).
- **Supabase is the single-subscription UK-acceptable stack** — EU region, GDPR-friendly, Auth + Postgres + pgvector + Storage in one bill.
- **CLIs first, MCP second, direct APIs last.** April 2026 reality: the majority of agentic-coding tasks get solved by the agent (Claude Code, Codex CLI, Gemini CLI) **invoking an existing developer CLI via Bash** — `gh`, `supabase`, `stripe`, `vercel`, `aws`, `gcloud`, `git`, `pnpm`, `ffmpeg`, `docker`, `kubectl`. Every mature SaaS now ships a CLI, and Claude Code's Bash tool is the shortest path to tool use. **MCP earns its place** where the CLI doesn't exist or is a bad fit — persistent agent connections to Gmail/Slack/CRM, internal-system integrations, tools that benefit from MCP's discovery + resource + prompt surfaces, and anything that needs to work inside a non-terminal runtime (Claude Cowork, Claude for Chrome). Teach both — CLIs as the default, MCP as the upgrade. (Note: many community MCP servers are themselves thin wrappers around a CLI. Skipping the wrapper is often fine.)
- **MCP is the only inter-vendor standard that exists** in April 2026. Anthropic launched it in Dec 2024; by April 2026 it's supported by Claude Code, Cursor, Windsurf, Claude Cowork, Claude for Chrome, OpenAI's Agent SDK (via a bridge), and ~300 community servers. No rival standard emerged. When you *do* need a discoverable protocol, MCP wins — but don't reach for it before you've tried a CLI.

---

## Why Month 2 changes more than any other month (and how we cope)

Two honest statements to put in front of the cohort in L1:

1. **Month 2 is the fastest-aging month in the course.** The April 2026 Cursor release, Claude Code release, Gemini CLI release, MCP spec revision and Supabase pgvector rev all landed within the last 8 weeks. Something on this list will be stale by the time the student gets to it.
2. **We designed Month 2 so that staleness is survivable.** Every lesson is built from first principles — the *pattern* is what's durable, not the *tool version*. When Cursor releases 4.0 and changes Composer mode, the lesson still holds; only the screenshot changes.

**Our defences:**

- **Dated Labs.** Every tool-comparison Lab has a "first published / last reviewed" date. When a Lab is stale, we say so and refresh it. Core lessons stay stable.
- **Big-labs-only rule for defaults.** We only make lesson defaults out of things from Anthropic / OpenAI / Google / Meta / Vercel / Supabase / Stripe — labs with enough runway that they will still exist (and mostly still work the same way) in 12 months.
- **Versioned CLAUDE.md templates.** We maintain a `gwth-m2-claude-md` template that students copy into every project. When Anthropic changes something in Claude Code, we update the template once, not every lesson.
- **Live "What changed this month" note** prepended to Month 2 at the start of each cohort — one paragraph, no more.

---

## Week 5 — Professional Builder Setup + Your First APIs (L1–L5)

**Arc:** *Stop vibe-coding. Open a terminal. Call an API. Handle a key safely. Deploy.*

### L1. Welcome to Month 2 — From Vibe-Coding to Agentic Coding

**Description:** Sets the frame for the month. Students have just finished Month 1 and built the Family AI Bot. Now we zoom out: *"what you built in Artifacts or Lovable lives inside one tab of one product. This month you learn to build things that live on your own URL, in your own repo, under your own control, with your own revenue if you want it."* A live demo walks from a Claude Artifact (Month 1) → the same idea, re-built in Cursor + Next.js + Supabase, deployed to Vercel, with Supabase Auth and Stripe attached (Month 2 territory). Then we preview the Capstone: the **AI Readiness Assessment Tool** — a live SaaS that any UK business owner can use to evaluate their AI maturity and receive a 90-day roadmap. Four weekly mini-capstones build directly toward it. Addresses the common fear (*"I've never opened a terminal"*) with the honest counter-fear (*"you'll be two weeks ahead of 95% of UK SME leaders by Lesson 6"*).

**Key concepts:** vibe coding → agentic coding transition · the builder's triangle (LLM + IDE + harness) · institutional vs individual AI (Sivulka) · the April 2026 PwC UK finding (20% of UK firms capture 74% of value) · the Mollick Lab/Crowd/Leadership framing · why Month 2 is the career-defining month.

**Build / activity:** ***My Month 2 Charter + Capstone Brief*** — a one-page document: (a) what three business problems you want to solve by end of month, (b) your role in your company/life (so we can tailor Labs), (c) your preferred capstone framing (personal asset vs consulting lead-gen vs internal tool), (d) your "Week 8 demo day" commitment (date, audience).

**UK context:** The British Chambers of Commerce (March 2026) 54%/11% gap is the opportunity you're being trained to capture. HSBC UK says £105bn of revenue is available to UK mid-sized firms by 2030 if they adopt AI meaningfully. You can be the person who makes that happen in one company you know.

**Research:** [`month-2-research/01-month-2-manifesto.md`](month-2-research/01-month-2-manifesto.md), [`month-2-research/02-april-2026-tool-ecosystem-m2.md`](month-2-research/02-april-2026-tool-ecosystem-m2.md).

---

### L2. Your Professional Builder Stack — Cursor, Claude Code, Windsurf

**Description:** The first practical lesson. Students install and configure the GWTH-prescribed toolchain: **Claude Code** (terminal agent, for the autonomous multi-file work) + **Cursor** (IDE, for the interactive Composer workflow) + **Git + GitHub Desktop** (version control, non-negotiable) + **Node 22 + pnpm** (package manager) + the GWTH starter repo (`gwth-m2-starter`). Covers the dual-tool workflow: Claude Code for big architecture moves, Cursor for in-the-flow editing. **Honest framing:** we explain *why* we picked these two — Cursor is closed-source and proprietary but its Composer mode is still best-in-class in April 2026; Claude Code is Anthropic's CLI agent with the best-in-class diff + tool-use behaviour. Both will change; the pattern (IDE + terminal agent + MCP) is what's durable. The one-big-3 alternative to teach (in passing) is **Gemini CLI + VS Code with Gemini Code Assist** — free for Google AI Pro users. Windsurf is Lab 1.

**Key concepts:** terminal as an AI interface · diff-based editing · Git basics (init, commit, push, pull, PR) · `.gitignore` · project structure · the claude command and claude.md · the cursor command and .cursorrules.

**Build / activity:** ***Dev Environment Ready*** — install everything, clone `gwth-m2-starter`, make your first commit, push to GitHub, see your first deployment preview on Vercel. Ends with a 5-minute video recording of the student's first agentic coding session. **Thorough walkthrough video (45 min)** for students who have never opened a terminal — every keystroke, every Windows/Mac/Linux divergence called out.

**UK context:** Cursor has a significant UK user base in April 2026 (~12% of its revenue per Similarweb UK traffic estimates). Claude Code is Anthropic's fastest-growing product and is sold in GBP on Claude.ai UK.

**Research:** [`month-2-research/02-april-2026-tool-ecosystem-m2.md`](month-2-research/02-april-2026-tool-ecosystem-m2.md), [`month-2-research/03-agentic-coding-trends-2026.md`](month-2-research/03-agentic-coding-trends-2026.md).

---

### L3. Context Engineering — CLAUDE.md, Specs, and the Stop-Vibing Rule

**Description:** Why professional builders produce better results than vibe coders 10× their speed: they **write specifications before they write code**, and they **give the AI persistent context** through `CLAUDE.md`, `.cursorrules`, and Claude Projects. This lesson teaches the describe-specify-build-iterate workflow: plain-English description → structured spec (feature list, data model, routes, acceptance criteria) → first build → iterate. Covers the cost economics of context windows (Claude Sonnet 4.6's 1M-token context is powerful but *not* free — teach students to fill it *deliberately*, not with every file). Also covers the GWTH Prompt Library pattern (a `/prompts/` folder in every repo) and the GWTH `CLAUDE.md` template.

**Key concepts:** context engineering as the 2026 upgrade of prompt engineering · spec-driven development · `CLAUDE.md` and `.cursorrules` as project-level system prompts · Claude Projects for multi-session knowledge · context cost economics · the "stop vibing and spec" rule.

**Build / activity:** ***Re-spec a Month 1 App*** — take one of your Month 1 Artifacts (e.g. the Budget Calculator from L1) and rebuild it professionally in Next.js with a full spec, CLAUDE.md, and a Git history. Compare the end-state (working, extensible, deployable) to the Artifact (stuck in one Claude tab).

**UK context:** Daniel Priestley's "Key Person of Influence" framing maps onto this cleanly: the person who specs and directs is the leverage holder, not the person who types.

**Research:** [`month-2-research/04-context-engineering-playbook.md`](month-2-research/04-context-engineering-playbook.md).

---

### L4. Calling Model APIs From Your Own Code

**Description:** The moment the student graduates from "uses AI products" to "builds AI products." Covers the three big-lab APIs (Anthropic, OpenAI, Google Gemini) using **Vercel AI SDK v5** — the single TypeScript library that speaks all three fluently. Students build a small Next.js app that takes user input, sends it to Claude, shows the response, and logs cost. Covers the non-negotiables: `.env` files, `process.env`, key rotation, rate limits, and the first API bill (usually £0.80 for a student's first week). Explains streaming responses (why they look cooler), structured outputs (JSON mode / tool use / Zod schemas with Vercel AI SDK), and why you almost always want `temperature: 0` for data extraction and `temperature: 0.7` for creative work.

**Key concepts:** LLM APIs · the Vercel AI SDK · streaming vs non-streaming · structured outputs (Zod + AI SDK) · environment variables · cost per 1M tokens (Claude Sonnet 4.6 / GPT-5 / Gemini 3 Pro April 2026 prices in the appendix) · per-request cost estimation · the "always stream, always structure, always log" rule.

**Build / activity:** ***API-Powered Mini-App*** — a tiny tool: user pastes a job ad, app returns a matching CV summary (or: user pastes a contract, app returns a red-flag list). Single page, live URL. First time the student sees "their own code talking to Claude." **Thorough walkthrough video (60 min)** covering every concept with UK pricing examples.

**UK context:** FCA Live AI Testing (2025–2026) is the regulatory scaffold. Every API call is data processing under UK GDPR — if the student collects user input that includes personal data, they need an ICO-compliant privacy notice. Teach that at the API moment, not as a separate compliance lesson. Highlight UK-friendly providers: Anthropic (UK enterprise team, EU data residency option), OpenAI (EU data residency available), Google (Vertex AI eu-west2 region).

**Research:** [`month-2-research/05-vercel-ai-sdk-v5.md`](month-2-research/05-vercel-ai-sdk-v5.md), [`month-2-research/06-api-pricing-april-2026.md`](month-2-research/06-api-pricing-april-2026.md).

---

### L5. Security From Day One — Keys, Injection, GDPR, UK ICO

**Description:** We teach security at Lesson 5, not Lesson 20, because **every project for the rest of the course will have at least one API key, one user input, and one potential prompt-injection surface**. Covers the three things that most often trip up beginners: leaked API keys on GitHub (students who've never used Git commit their `.env`), prompt injection from untrusted inputs (the OWASP LLM Top 10 of 2026: injection, output handling, training-data poisoning — simplified), and UK GDPR basics for any user-data app (lawful basis, retention, data subject rights, ICO registration fee £40/year for most SMEs). Ends with the **GWTH hardened project template** — every new repo starts with it.

**Key concepts:** `.env` discipline · GitHub secret scanning · prompt injection (examples from NCSC April 2026 research) · OWASP LLM Top 10 · the principle of least privilege for AI tools · UK ICO AI guidance (April 2026 update) · GDPR lawful basis for AI · why the NCSC 2025 "secure AI dev" guidance is UK-specific. Introduces Claude's `claude safe` mode and `output policy` feature.

**Build / activity:** ***Hardened Project Template*** — clone the GWTH hardened starter, harden your L4 mini-app. Commit. Push. Scan with GitHub Advanced Security and `gitleaks`. Write a 5-line privacy notice for your app.

**UK context:** Real UK incidents from the last 12 months: (a) the ICO's 2025 enforcement notice against a fintech that exposed customer PII to a third-party AI API without lawful basis; (b) NCSC's 2026 advisory on prompt-injection attacks observed in UK local-government chatbots; (c) the FCA's FS24/4 response to AI in financial services. All three are named, linked, and explained.

**Research:** [`month-2-research/07-uk-security-and-ico-guidance.md`](month-2-research/07-uk-security-and-ico-guidance.md).

---

## Week 6 — Data, Embeddings, RAG, Persistence (L6–L10)

**Arc:** *Get real data into your app. Teach AI about your business. Give your app memory and users.*

### L6. Ingesting Real Business Data — PDFs, Word, Excel, Websites

**Description:** Real apps need real data. This lesson covers the four most common data sources UK SMEs actually have: **PDFs** (policies, contracts, reports), **Word documents** (internal docs), **Excel spreadsheets** (everything), and **websites** (their own + competitors'). We use **Docling** (IBM's OSS PDF/Word/Excel parser) inside a Next.js serverless route — it handles layout, tables, formulas, footnotes — and **Firecrawl** for websites. Both run with a `wrap with AI SDK` layer so the student can ask Claude to clean up/summarise/extract from the parsed output in the same step. Honest limits: OCR on handwritten UK council forms is still hard; we use Mistral OCR as the fallback in a Lab.

**Key concepts:** structured vs unstructured data · the "clean first, prompt second" rule · text extraction vs semantic extraction · PDF layout vs text order · table extraction in Docling · website crawling etiquette · robots.txt · rate limiting · UK copyright and text-and-data-mining (TDM) rules for training vs inference.

**Build / activity:** ***Document Parser*** — upload a PDF, Word, or Excel file; see the cleaned structured output. Demo on a UK public document: HMRC's 2025/26 income-tax guide, ICO AI guidance, an Office for National Statistics release.

**UK context:** UK public sector is a goldmine of PDFs. HMRC, DWP, ICO, FCA, ONS, NHS, every council — all publish PDFs. The UK IP Office's 2024 consultation on TDM is the compliance backdrop for any app that ingests UK content.

**Research:** [`month-2-research/08-document-ingestion-and-uk-data.md`](month-2-research/08-document-ingestion-and-uk-data.md).

---

### L7. Vectors & Embeddings Explained Without the Maths

**Description:** A foundational understanding lesson, not a library-use lesson. 60 minutes to install the *feel* of how semantic search works, using analogies instead of vector algebra: *"an embedding is the AI's internal 'feel' of a piece of text — similar pieces get similar feels; search means find the closest feel to your query"*. Students play with a visual embedding explorer (Atlas, TensorFlow Projector, or a Claude-Artifacts visualisation) on their own Month 1 content. Introduces **embedding models** (OpenAI text-embedding-3-large, Voyage AI, Cohere Embed v3) and their April 2026 prices.

**Key concepts:** embeddings as compressed meaning · cosine similarity (intuitively, not mathematically) · the "feel vs the exact words" difference · cost of embedding (usually one-tenth of inference) · embedding dimensions (why 1536 vs 3072) · embedding caching.

**Build / activity:** ***Semantic-Search Demo*** — embed a folder of 50 short UK news headlines; query "London house prices going up"; see the ten closest matches even if none contain those exact words. Students *feel* RAG before they build it.

**UK context:** Use UK-specific content for the demo corpus (BBC news, Guardian, FT headlines April 2026).

**Research:** [`month-2-research/09-embeddings-without-maths.md`](month-2-research/09-embeddings-without-maths.md).

---

### L8. Build Your First RAG App — Supabase pgvector + Claude

**Description:** The big one. The first multi-file, multi-page, multi-concept app — and the skeleton that the Capstone AI Readiness Assessment Tool will extend. Students build a **Company Knowledge Bot**: upload ≤ 20 PDFs (their company handbook, policies, sales decks), vectorise with OpenAI embeddings into Supabase pgvector, query via a chat UI, get grounded answers with citations. Prescribed stack: Next.js 16 + Vercel AI SDK v5 + Supabase (Auth + Postgres + pgvector) + Claude Sonnet 4.6 + Docling for ingest. Covers the three RAG failure modes beginners hit (irrelevant retrieval, too-small chunks, hallucinated citations) — all three are fixed in L9.

**Key concepts:** end-to-end RAG pipeline · chunking strategies (fixed-size, recursive, semantic) · upsert to pgvector · hybrid search (keyword + semantic with the `RRF` function) · source citations · retrieval-augmented vs retrieval-grounded outputs · the "never cite what you didn't retrieve" rule.

**Build / activity:** ***Company Knowledge Bot*** — live URL, upload UI, chat UI, cited answers. **Thorough walkthrough video (90 min)** — full start-to-finish build; every copy-paste line explained.

**UK context:** Use UK company case studies of "knowledge bots" from the last 12 months: **NatWest Cora+** (internal customer-ops assistant grounded on their policies, rolled out to 10k staff 2025–26); **BT Openreach's** engineer knowledge bot (grounded on 40 years of network docs); **Starling's** internal compliance assistant. Each is a real grounded-RAG story the student can point to.

**Research:** [`month-2-research/10-rag-foundations-april-2026.md`](month-2-research/10-rag-foundations-april-2026.md), [`month-2-research/11-uk-rag-case-studies.md`](month-2-research/11-uk-rag-case-studies.md).

---

### L9. Making RAG Actually Work — Chunking, Re-ranking, Evals

**Description:** Most students' L8 bot answers 70% of questions well and 30% disastrously. L9 closes the gap. Three techniques: **smarter chunking** (parent-child chunks, document-aware splits — via LangChain's text splitters or Claude's structured-doc parsing), **re-ranking** with Cohere Rerank v3 or Voyage Rerank-2 (the cheapest production quality lift you can buy), and **evals** using Langfuse + Braintrust (or a DIY Claude-graded eval in 20 lines). Plus the essential "when NOT to use RAG" frame: if the data fits in the context window, *don't* RAG — just put the documents in. Many UK SMEs have fewer pages than a Claude 1M context holds.

**Key concepts:** advanced chunking · re-ranking architecture (retrieve 20, re-rank to top 5) · RAG evals (precision@k, recall@k, faithfulness) · RAGAS framework · Langfuse traces · the context-vs-RAG decision.

**Build / activity:** ***RAG Tuning Notebook*** — take your L8 bot, measure its precision on a 20-question eval set, add re-ranking, measure again; produce a before/after screenshot for your portfolio.

**UK context:** HSBC UK's and Lloyds' internal knowledge bots both moved from pure vector search to hybrid + re-ranking in H2 2025, a shift their public engineering blogs document.

**Research:** [`month-2-research/12-advanced-rag.md`](month-2-research/12-advanced-rag.md).

---

### L10. Persistent Data + Multi-User — Supabase Postgres + Auth + RLS

**Description:** The student's apps so far are single-user. This lesson adds the three things every SaaS needs: **user accounts** (Supabase Auth with magic link, Google, GitHub, LinkedIn OIDC), **per-user data** (Postgres tables with a `user_id` foreign key), and **row-level security** (RLS policies so a user can only read their own rows). Also teaches **database migrations** (Supabase CLI + SQL), a surprising beginner-friendly topic once framed right. Prescribes **Drizzle ORM** (TypeScript-native, the Next.js community default) over Prisma (still fine, but Drizzle is winning in April 2026).

**Key concepts:** user-owned data · JWT auth · server vs client components · RLS policies · migrations · foreign keys · the "always filter by user_id in every query" rule. Optional: Stripe subscriptions (covered properly in L20 but previewed here).

**Build / activity:** ***Multi-User App Skeleton*** — take your L8 Knowledge Bot, add sign-up/login, give each user their own isolated documents, test that two users can't see each other's data. Deploy.

**UK context:** Supabase's EU-west-2 (London) region is the GDPR-safe choice for UK apps. Teach the default: *"EU region, never send personal data to a US-region Postgres unless you have a legitimate transfer mechanism."*

**Research:** [`month-2-research/13-supabase-auth-postgres-rls.md`](month-2-research/13-supabase-auth-postgres-rls.md).

---

## Week 7 — Agents, Voice, Multimodal, Automation (L11–L15)

**Arc:** *Your apps start doing work without you. They talk. They see. They integrate.*

### L11. Agents That Take Actions — Claude Agent SDK, CLIs, and MCP

**Description:** The agentic leap. Students build a **real agent** (not a fancy prompt) that reads an email, decides whether it needs a human, replies if it doesn't, and files it if it's done. Uses **Claude Agent SDK** (TypeScript version) as the framework. Tool use is taught in two complementary surfaces: **(a) CLIs via Bash** — the agent invokes `gh`, `supabase`, `stripe`, `vercel`, `gcloud`, `git`, `gmail` (Google's `gmail` CLI or a thin wrapper), etc.; **(b) MCP servers** — where the task needs persistent discovery, non-CLI surfaces, or cross-runtime portability (Cowork, Claude for Chrome). We wire up: the **Supabase CLI + Stripe CLI + gcloud** for the action surface *(CLI-first)*, and a **Gmail MCP + Sentry MCP** where CLI ergonomics break down *(MCP-second)*. The lesson covers the three agent architectures from OpenAI's "Practical Guide to Building Agents": **single-step tool-use**, **multi-step plan-then-execute**, and **manager-worker**. We stick to single-step + multi-step; manager-worker is a Lab.

**Why CLIs first.** Most agentic-coding tasks in April 2026 are solved fastest by Claude (Claude Code, Codex CLI, Gemini CLI) calling an existing SaaS CLI via Bash. No new code, no new protocol, no server to maintain. MCP earns its place where CLIs don't exist, don't expose the right verbs, or need to work inside non-terminal runtimes. **Teach students to try a CLI first**; introduce MCP when the CLI approach breaks. Many community MCP servers are, under the hood, CLI wrappers — saving the wrapper is often the point.

**Key concepts:** agent vs chain-of-prompts · tools vs APIs · CLIs as the fastest tool surface · MCP as the portable-discoverable tool surface · agent loop (perceive → decide → act → observe) · retries, timeouts, cost ceilings · observability (every action logged) · the "dry run by default" rule · the kill-switch pattern · the "try the CLI first" rule.

**Build / activity:** ***CLI + MCP Email-Triage Agent*** — an email-triage agent that processes your own Gmail inbox in `--dry-run` mode and produces a "what I would have done" report. Reading email via a Gmail MCP server; filing decisions via the Supabase CLI; alerting to Slack via an `slack` CLI; optional Stripe reconciliation via the Stripe CLI. **Thorough walkthrough video (90 min)** — from clean repo to running agent, explicitly showing both CLI and MCP paths for the same tool so the student can feel the difference.

**UK context:** **Octopus Energy Kraken's** agentic customer-ops platform (65+ energy retailers worldwide, UK-founded) is the gold-standard UK agent-at-scale story. Talk to Sleep's founder story (UK solo-operator AI music business). Lloyds' internal agent rollout (200+ senior execs trained H1 2026). *Your agent is the same pattern, smaller.*

**Research:** [`month-2-research/14-agents-and-mcp-april-2026.md`](month-2-research/14-agents-and-mcp-april-2026.md), [`month-2-research/15-uk-agent-case-studies.md`](month-2-research/15-uk-agent-case-studies.md).

---

### L12. Browser & Computer-Use Agents — When Your App Is the Web

**Description:** Some jobs can't be done through an API. *"Log into the council website, download the latest planning applications, summarise the ones within 500m of my address, post to Slack."* For these, we need browser agents. Covers **Claude for Chrome** (default), **Anthropic Computer Use** (the more powerful, sandbox-required option), and a quick tour of **ChatGPT Atlas** (macOS-only) and **Perplexity Comet**. The lesson is structured around the severe security warning in Month 1's L15 (updated April 2026): these agents have access to your logged-in sessions, so they need tight scoping, explicit action allowlists, and a kill switch.

**Key concepts:** browser automation architecture · the DOM-vs-screenshot choice (Claude for Chrome uses DOM; Computer Use uses screenshots) · action allowlists · the "never run a browser agent on your personal logged-in browser" rule · Firefox containers and separate profiles.

**Build / activity:** ***Research Agent*** — an agent that, given a UK town name, pulls the last week's planning applications from the relevant council site, summarises them, and emails a digest. Safe because council sites are public and the agent is only reading.

**UK context:** UK local government runs on PDF planning portals. There's a genuine small-business opportunity for anyone who can build reliable monitoring against them (property developers, trees-and-hedges consultants, local newspapers). This is one UK SME industry the student could sell into.

**Research:** [`month-2-research/16-browser-and-computer-use-agents.md`](month-2-research/16-browser-and-computer-use-agents.md).

---

### L13. Voice Agents — ElevenLabs Agents & Vapi for UK SMEs

**Description:** The most commercially useful single day of Month 2 for UK sole-traders. Voice agents became viable in late 2025 and are now mainstream (ElevenLabs Agents, Vapi, Retell, OpenAI Voice Agents). We prescribe **ElevenLabs Agents** because they have the cleanest UK-accent voices, a friendly web dashboard, and direct Twilio + phone-number integration. The lesson covers: the audio-in → STT → LLM → TTS → audio-out loop, tool-use inside the loop (so the agent can check a diary), latency (why it matters), interruption handling (why it's hard), and the handover-to-human pattern (because voice agents should *know* when they can't help).

**Key concepts:** STT (Whisper, ElevenLabs Scribe) · LLM in the loop · TTS voice quality vs latency trade-off · real-time API architecture · phone-number provisioning · the "human handover" rule · voice-agent UX ethics (always say you're AI at the top of the call).

**Build / activity:** ***First Voice Agent*** — a simple appointment-booking voice agent for a fictitious UK plumber, wired to a Google Calendar via Zapier. Ring your own burner number; talk to your own agent.

**UK context:** UK sole-trader phone-call pain is a real documented market — CBI 2025 survey found 37% of UK sole-traders *refuse calls* because answering is too disruptive. A £40/month voice agent is a real fix. Several UK startups are building this (Curran AI, Voxel AI, numerous plumbing-industry SaaS). This is a legitimate solo-founder business.

**Research:** [`month-2-research/17-voice-agents-april-2026.md`](month-2-research/17-voice-agents-april-2026.md).

---

### L14. Multimodal Pipelines — Image, Audio, Video in Production

**Description:** Going beyond single-turn image generation (Month 1) to production pipelines that produce image + audio + video *at scale*. Classic UK use cases: property listings (20 photos → AI-enhanced hero images + voiceover tour + floor-plan summary); podcast production (audio in → Whisper transcript → show notes → audiograms → YouTube upload); e-commerce listings (product photo in → background-removed + lifestyle composite + SEO copy + Amazon listing). Prescribes **GPT Image 1.5** and **Ideogram v3** for images, **ElevenLabs v3** for audio, **Veo 3.1** and **Runway Gen-4.5** for video, **FFmpeg** for glue.

**Key concepts:** multimodal pipelines · batch processing · queue systems (Inngest + Vercel Cron) · asset storage (Supabase Storage) · FFmpeg basics · thumbnail generation · watermarking · cost control at scale.

**Build / activity:** ***Content Pipeline*** — a working pipeline that takes 5 product photos + a 1-paragraph description and outputs a ready-to-publish product page (hero image, 4 lifestyle composites, 30-second voiceover, SEO copy).

**UK context:** **Rightmove / Zoopla** have rolled out AI-enhanced property imagery in 2025–26; independent UK estate agents can now match them at a tenth of the cost. UK ecommerce: Notonthehighstreet, Etsy UK sellers, Shopify UK merchants all benefit from AI product pages.

**Research:** [`month-2-research/18-multimodal-pipelines.md`](month-2-research/18-multimodal-pipelines.md).

---

### L15. Production Automation — n8n Self-Hosted, Make, Zapier Agents

**Description:** The upgrade from Month 1's L17. Month 1 used Zapier/Make/n8n in "first-click" mode. Month 2 uses **self-hosted n8n 2.0** (on Coolify, for UK data sovereignty) with its 70 AI nodes, custom code steps, and MCP server integration; plus **Zapier Agents** (for the quick-wins that are easier in Zapier) and **Make Maia** (for when visual design matters). The lesson covers multi-step workflows with error handling, retries, queue backpressure, and cost control. Emphasises that **self-hosted n8n is free and runs on a £4/month Hetzner VPS** — a massive TCO win for UK SMEs vs the Zapier Team plan.

**Key concepts:** self-hosting tradeoffs · error handling patterns · retries with exponential backoff · queue depth · MCP inside n8n · cost comparison (Zapier Pro £29/month vs n8n self-hosted £4/month for comparable throughput).

**Build / activity:** ***Multi-Step Automation*** — a real end-to-end pipeline: Stripe new-customer webhook → n8n → Supabase insert → Claude-generated welcome email → Gmail send → PostHog event. Deploy. Test. Celebrate.

**UK context:** **UK data sovereignty angle** — for NHS, law firms, and financial services clients, self-hosted n8n on a UK-region VPS is often the only acceptable automation platform. This is a genuine consulting niche.

**Research:** [`month-2-research/19-automation-april-2026.md`](month-2-research/19-automation-april-2026.md).

---

## Week 8 — The AI Readiness Assessment Tool (Capstone) (L16–L20)

**Arc:** *Build the tool. Ship the tool. Use the tool. Launch the tool.*

### L16. Capstone Part 1 — Design the Scoring Engine

**Description:** The Capstone begins. Students design and build the **deterministic scoring engine** at the core of the AI Readiness Assessment Tool — because **hallucinated scores are career-ending** for any consultant who ships this. We define six AI-maturity dimensions (Leadership, Talent, Data Readiness, Technology, Governance, Adoption) each scored 1-5, then the aggregation into an overall maturity band. Explicit architecture choice: the LLM generates the **narrative** (the "why" + the "what to do next") but never the **score**. The score is pure TypeScript. We also scaffold the Next.js app, the Supabase schema, and the Vercel deploy.

**Key concepts:** deterministic vs stochastic code · test-driven development for scoring logic · domain-driven design (core vs narrative vs UI) · Zod schemas everywhere · starter scaffolding.

**Build / activity:** ***Scoring Engine + App Scaffold*** — `gwth-m2-capstone-starter` cloned, scoring engine tested, first deploy live at a vanity subdomain (e.g. `<yourname>-assessment.vercel.app`).

**UK context:** The scoring model is explicitly designed around UK SME realities — not FTSE-100 transformation. UK peer benchmarks (BCC 54%/11%, HSBC £105bn, PwC UK AI Jobs Barometer) are baked in.

**Research:** [`month-2-research/20-capstone-architecture.md`](month-2-research/20-capstone-architecture.md).

---

### L17. Capstone Part 2 — RAG + Ask-the-Tool Chat

**Description:** Layer in the RAG feature so that users can ask follow-up questions *"why did I score 2 on Governance?"* and get grounded answers citing UK research (BCC, HSBC UK, FCA, ICO, Bank of England, PwC UK AI Jobs Barometer, KPMG UK, Deloitte UK). Reuses the L8/L9 RAG patterns at capstone scale. The research corpus is a curated set of ~40 UK-relevant PDFs that GWTH provides (baked into `gwth-m2-capstone-starter`). Covers the **"never fabricate sources"** rule — every quoted stat must trace back to a document in the Qdrant/pgvector collection.

**Key concepts:** RAG at capstone scale · citation-first prompt design · Claude tool use for retrieval · guardrails against fabrication · Langfuse trace review.

**Build / activity:** ***Ask-the-Tool Chat Feature*** — the chat UI is live; every answer shows at least one cited UK source.

**UK context:** The UK corpus is the differentiator. Any generic AI-readiness tool can cite McKinsey. Only yours cites FCA FS24/4, ICO April 2026 guidance, HSBC UK £105bn, BCC 54%/11%, Starling/Octopus/Wayve case studies. That's the UK moat.

**Research:** [`month-2-research/21-capstone-rag-corpus.md`](month-2-research/21-capstone-rag-corpus.md).

---

### L18. Capstone Part 3 — PDF Export, Auth, Deploy

**Description:** Turn the tool into something a student can hand to a client. Covers: **Supabase Auth** for saving assessments (magic link + optional Google/GitHub), **react-pdf** or **@react-pdf/renderer** for the board-presentable PDF output (cover, summary, scorecard, gap analysis, 90-day roadmap, sources), and production deployment. Prescribes **Vercel free tier** for the default (UK-friendly, HTTPS out of the box, analytics built in) and **Coolify self-host** for students who need UK data sovereignty. We also wire **Sentry** (errors) and **PostHog** (product analytics) for free.

**Key concepts:** server-side PDF rendering · HTML-to-PDF vs declarative PDF · brand-fit design · deployment pipelines · rollback strategy · observability in production.

**Build / activity:** ***PDF + Deploy*** — the tool is production. A real PDF downloads. It's on a live URL you can give a UK client or a prospective employer.

**UK context:** UK-branded PDF template comes with the GWTH colour palette and UK-formatted dates/currency. UK businesses respond better to a UK-native-looking report than a US-looking one.

**Research:** [`month-2-research/22-pdf-and-deploy.md`](month-2-research/22-pdf-and-deploy.md).

---

### L19. Capstone Part 4 — Demo, Portfolio, Launch

**Description:** The capstone ships. Students: (a) run the tool on their **own** business or the business they work for — because you must eat your own dog food to sell it, (b) record a 3-minute demo video (OBS / Loom), (c) write a 500-word LinkedIn post announcing the launch (with the URL, with the PDF as an attachment), and (d) make a real plan to get 3 UK prospects to try it in the next 30 days. The lesson also covers the "open-source the template" option — students can publish the repo with an MIT licence + their branding removed, which tends to drive inbound interest.

**Key concepts:** own-dogfooding · demo-video best practices (no-music, clear narration, cursor focus) · LinkedIn for consultants · the 3-prospect rule · open-source as a marketing move · STAR method for the project description.

**Build / activity:** ***Launch Package*** — public URL, demo video, LinkedIn post, GitHub repo with README, a real assessment of your own business, 3 named prospects in a CRM (HubSpot free tier).

**UK context:** UK LinkedIn is a serious channel for SME consulting. Daniel Priestley-style positioning (Scorecard → Key Person of Influence) converts well here.

**Research:** [`month-2-research/23-launch-and-portfolio.md`](month-2-research/23-launch-and-portfolio.md).

---

### L20. Month 2 Review & Month 3 Preview — What You Can Charge For

**Description:** The close. Students compile their Month 2 portfolio (one public URL for L8 bot, L11 agent, L13 voice agent, the Capstone; plus GitHub repos for all; plus demo videos). We do a skills self-assessment (same rubric as L1's charter so deltas are visible), a frank pricing conversation (*"£500–2,000 for a bespoke Knowledge Bot; £3,000–10,000 for a custom Assessment Tool; £200/month for ongoing Voice Agent support"*), and a Month 3 preview (*"now you can build — Month 3 teaches you to lead the adoption inside a company"*). Ends with the GWTH training CTA, the bespoke-lesson service for larger clients, and a personal Month 3 enrolment prompt.

**Key concepts:** portfolio review · skills self-assessment · UK consultancy pricing · day-rate benchmarks (CIPD + IR35 context) · the consulting-vs-product fork · Month 3 as the bridge from building to leading.

**Build / activity:** ***Consulting Service Page*** — a Lovable or Next.js landing page that says "AI Readiness Assessments for UK SMEs from £X" with the demo video, the PDF sample, and a Calendly link. *Your first lead-gen asset.*

**UK context:** UK AI-consulting market data from techUK and CIPD 2026 reports; IR35 and sole-trader structuring basics; UK day-rate benchmarks for AI engineers vs AI strategists (AI engineers £600–1,200/day in April 2026; strategists £800–2,500).

**Research:** [`month-2-research/24-consulting-and-pricing-uk.md`](month-2-research/24-consulting-and-pricing-uk.md).

---

## Build projects — 20 builds + the Capstone throughline

Every lesson has a hands-on build. **Month 2 has the most builds of any month** — by design, and to match the user request.

| # | Lesson | Build | Primary tool(s) | Time | Portfolio? |
|---|--------|-------|-----------------|------|------------|
| 1 | L1 | Month 2 Charter + Capstone Brief | Notion / Markdown | 30 min | No |
| 2 | L2 | Dev Environment Ready (+ first commit) | Claude Code + Cursor + Git | 60 min | No |
| 3 | L3 | Re-spec a Month 1 App | Next.js + CLAUDE.md | 60 min | Optional |
| 4 | L4 | **API-Powered Mini-App** | Next.js + Vercel AI SDK + Claude | 90 min | **Yes** |
| 5 | L5 | Hardened Project Template | GWTH starter + gitleaks | 45 min | Template |
| 6 | L6 | Document Parser | Docling + Next.js | 60 min | Yes |
| 7 | L7 | Semantic-Search Demo | OpenAI embeddings + visualiser | 60 min | Optional |
| 8 | L8 | **Company Knowledge Bot** | Next.js + Supabase pgvector + Claude | 90 min | **Yes** |
| 9 | L9 | RAG Tuning Notebook | Cohere Rerank + Langfuse | 60 min | Attach to L8 |
| 10 | L10 | **Multi-User App Skeleton** | Supabase Auth + RLS + Drizzle | 90 min | **Yes** |
| 11 | L11 | **MCP-Enabled Email-Triage Agent** | Claude Agent SDK + MCP + Gmail | 90 min | **Yes** |
| 12 | L12 | Planning-Applications Research Agent | Claude for Chrome | 60 min | Yes |
| 13 | L13 | **First Voice Agent** | ElevenLabs Agents + Twilio + Zapier | 90 min | **Yes** |
| 14 | L14 | Content Pipeline (product-page generator) | GPT Image + ElevenLabs + FFmpeg | 90 min | Yes |
| 15 | L15 | Multi-Step Automation | n8n 2.0 self-hosted + Stripe + Supabase | 60 min | Yes |
| 16 | L16 | Capstone — Scoring Engine + App Scaffold | Next.js + Supabase | 120 min | Capstone |
| 17 | L17 | Capstone — Ask-the-Tool Chat | pgvector + Claude + citation guardrails | 120 min | Capstone |
| 18 | L18 | Capstone — PDF + Auth + Deploy | @react-pdf + Vercel + Sentry | 120 min | Capstone |
| 19 | L19 | **Capstone — Launch Package** | Live URL + demo video + LinkedIn | 90 min | **Capstone** |
| 20 | L20 | **Consulting Service Page** | Lovable or Next.js + Calendly + HubSpot | 60 min | **Yes** |

**Portfolio artefacts count:** at least **10 standalone deployable projects** (L4, L6, L8, L10, L11, L12, L13, L14, L15, L20) + the **Capstone** (L16–L19) = **11 total portfolio-quality shippables**. Most students will end Month 2 with 7–11 live URLs they can show clients or employers.

### Capstone Project — AI Readiness Assessment Tool

**Spans:** Weeks 5–7 set up the skills; Week 8 is intensive build; launch at end of Week 8.

**Description:** A production-quality web application that any UK business leader can use to evaluate their organisation's AI maturity and receive a 90-day transformation roadmap. This is not a toy — it is the tool the student can immediately use to (a) evaluate their own company, (b) prospect UK SME consulting clients, (c) present as a portfolio piece to AI-engineering employers, or (d) launch as a lead-gen asset for their own business.

**Why Month 2, not Month 3:** In the April 2026 curriculum redesign, the Assessment Tool moves from Month 3 to Month 2 because **the build itself is a Month-2 skill task** — it integrates everything Month 2 teaches (Next.js, Supabase, RAG, auth, PDF, deploy). Month 3 then **uses** the tool that Month 2 students built: Month 3's strategy lessons teach the McKinsey 12 themes, the PwC 20/74 rule, the Sivulka seven pillars, and the Rewired six capabilities — and the tool is the vehicle through which students apply those frameworks to their own company. Month 3 also adds depth to the tool's scoring rubric (six basic dimensions in Month 2 → enriched with 12 themes + 7 pillars + 6 capabilities by end of Month 3). **Students evolve the tool across both months.**

**Full feature list (Month 2 version — Month 3 will extend):**

1. **Company profile intake.** Wizard UI collecting: industry, size, revenue band, current AI use (free text), AI investment YTD, named initiatives, perceived biggest blocker. ~5 minutes.
2. **Scoring engine (v1).** Six dimensions scored 1–5 each (Leadership, Talent, Data Readiness, Technology, Governance, Adoption). Aggregate into a PwC-style maturity band.
3. **UK benchmark overlay.** Comparison against BCC 54%/11%, HSBC £105bn, sector-specific PwC UK productivity multiples.
4. **Gap analysis.** Ordered list of the five biggest gaps, with concrete UK peer comparisons.
5. **90-day roadmap.** Four pillars (personal tech muscle, Lab charter, Crowd enrolment, governance gate) with 3–5 named initiatives each.
6. **UK peer case picker.** Based on the user's industry, recommends one UK case study to read (Lloyds, HSBC, BA/IAG, Tesco, Ocado, Kraken/Octopus, JLR, Rolls-Royce, Humphrey, etc.).
7. **Training recommendations.** Named GWTH.ai enrolment seats and role profiles.
8. **Radar/heatmap visualisation** (shadcn/ui charts or Recharts).
9. **PDF executive report.** 8–12 pages, board-presentable. Covers, summary, scorecard, benchmarks, gap analysis, roadmap, training plan, sources.
10. **Ask-the-tool chat.** RAG-grounded Q&A over the UK research corpus (see L17).
11. **Share URL.** Unique per assessment; colleagues can take the assessment independently and aggregate (Month 3 extension).
12. **Observability.** Sentry for errors, PostHog for product analytics, Langfuse for LLM traces.

**Tech stack (single-language, one-subscription-per-box):**

- **Frontend + backend:** Next.js 16 (App Router, React 19), TypeScript strict, Tailwind v4, shadcn/ui, Motion, Recharts.
- **Database + auth + vectors + storage:** Supabase (EU-west-2 region) — Postgres + pgvector + Auth + Storage + Edge Functions.
- **LLM:** Claude Sonnet 4.6 default (students can swap to GPT-5 or Gemini 3 Pro with a flag via Vercel AI SDK v5).
- **PDF:** `@react-pdf/renderer` server-side.
- **Observability:** Sentry (free), PostHog (free), Langfuse (self-host).
- **Deploy:** Vercel free tier (default) or Coolify on a UK VPS (if data sovereignty is a requirement).

**Acceptance criteria:**

1. A first-time user completes an assessment, sees their scores, and downloads a PDF in **≤ 12 minutes**.
2. The PDF is board-presentable: typography, no broken layouts, all scores consistent with on-screen values.
3. The scoring engine is **deterministic** given the same input — LLM is only used for narrative, not for scoring.
4. All LLM-generated narrative cites at least **one UK benchmark** and **one UK company**.
5. Given an obviously bad input (*"we don't use AI at all"*), the tool produces a plausible roadmap without hallucinating capabilities the user said they don't have.
6. A leader can share the assessment URL with colleagues.
7. The "Ask the tool" chat never fabricates sources — every quoted UK stat traces back to a document in the pgvector corpus.
8. End-to-end test suite (Playwright) passes: profile → score → roadmap → PDF → chat, all green.
9. Accessible (axe-core clean) and responsive to mobile.
10. Deployed to a live URL the student can show a prospective UK client on day one.

**The submission.** Students present:

- Live URL.
- 3-minute walkthrough video.
- GitHub repo with README, architecture diagram, and a "how this was built" log (Claude Code session transcripts welcome).
- Their **own** assessment — they must run the tool on their own business.
- A two-paragraph reflection: what this tool helped them see about their own company that the L1–L15 lessons alone hadn't revealed.

**Estimated total effort:** 15–25 hours spread over the month. Students using Claude Code well should land around 15; students who fight the tools will land at 25+.

**Fallback scope for time-constrained students:** company profile intake → six-dimension scoring → PDF output with a 90-day roadmap. That alone is still useful and submittable.

**Stretch goals (for advanced students / Month 3 carryover):**
- CRM integration (HubSpot free tier) to auto-create leads from assessments.
- Slack bot for exec-team multi-person assessments (Month 3 carryover).
- White-label mode so consultancies can rebrand and sell the tool.
- Multi-language (Welsh first, then Spanish for IAG / LATAM reach).
- The Month 3 rubric extension: 12 McKinsey themes + 7 Sivulka pillars + 6 Rewired capabilities layered into the Month-2 scoring engine.

---

## Coverage of the six OpenAI primitives

| Primitive | Primary lessons | Supporting role | Total exposure |
|-----------|-----------------|-----------------|----------------|
| **Coding / Building** 🔨 | L2, L3, L4, L8, L10, L11, L16, L17, L18 = **9** | L5, L6, L9, L12, L14, L15, L19, L20 | **17** |
| **Data Analysis** | L6, L7, L9 = **3** | L8, L14, L16, L17 | 7 |
| **Research & Analysis** | L7, L12 = **2** | L8, L9, L17 | 5 |
| **Automation** | L11, L15 = **2** | L12, L13, L14, L19 | 6 |
| **Content Creation** | L14 = **1** | L4, L19 | 3 |
| **Ideation & Strategy** | L1, L20 = **2** | L19 | 3 |
| **Safety / Governance** (cross-cutting) | L5 = **1** | L11, L12, L13, L17, L18 | 6 |

*Coding/Building dominates (9 primary + 8 supporting = 17 of 20 lessons).* That matches the course's explicit priority. Every lesson involves building; most lessons involve multiple primitives.

---

## Appendix A — Applied concepts taught just-in-time

Instead of theory lessons, technical concepts are drip-fed at the moment they become useful.

| Concept | Where taught | Why it matters at that moment |
|---------|--------------|-------------------------------|
| Terminal basics | L2 | You can't use Claude Code without a terminal |
| Git + GitHub | L2 | Every project lives in a repo |
| Context engineering | L3 | Installs the "spec before code" habit before it's too late |
| Environment variables | L4 | Moment you first get an API key |
| `.gitignore` | L4 / L5 | Moment you first commit (prevents key leaks) |
| Streaming responses | L4 | Makes AI feel fast |
| Zod + structured outputs | L4 / L8 | Foundation of every reliable AI pipeline |
| Prompt injection | L5 | Moment you first take user input |
| UK GDPR + ICO | L5 | Moment you first store user data |
| Embeddings | L7 | Foundation of RAG |
| Chunking strategies | L8 / L9 | When RAG is failing, chunking is the first fix |
| Re-ranking | L9 | Cheapest production quality lift |
| RLS (Row-Level Security) | L10 | Moment app becomes multi-user |
| JWT auth | L10 | Moment app becomes multi-user |
| CLIs as agent tools (Bash + `gh`/`supabase`/`stripe`/...) | L2 / L11 | Fastest tool surface; Claude Code's Bash tool makes this the first reach |
| MCP | L11 | The portable agent-tool protocol when a CLI doesn't fit |
| Observability (Sentry, PostHog, Langfuse) | L11 / L18 | Moment app goes public |
| Queue + cron patterns | L14 / L15 | Moment batch work starts |
| PDF generation | L18 | Moment you need a client deliverable |
| IR35 + UK consulting basics | L20 | Moment you start charging |

---

## Appendix B — Cross-cutting principles

These show up in every Month 2 lesson:

1. **Spec before code.** Every build starts with a `/spec` folder and a `CLAUDE.md`.
2. **Stay in TypeScript.** Single-language full-stack unless there's a specific Python-only library you need.
3. **Big 3 + one challenger.** Defaults from Anthropic / OpenAI / Google / Meta / Vercel / Supabase / Stripe. Challengers quarantined to Labs.
4. **Observability from day 1.** Sentry + PostHog + Langfuse in every project — free tiers are enough.
5. **UK-friendly defaults.** EU regions, GBP pricing, UK examples, UK compliance.
6. **Every build goes live.** No "local only" builds. If it's not on a URL, it didn't happen.
7. **Every build has a cost ceiling.** Every LLM call has a logged cost; every agent has a kill switch.
8. **Portfolio-first framing.** Every lesson asks "what will a future UK employer or client see?"
9. **Dry run by default.** Any action-taking code starts in `--dry-run` mode.
10. **GWTH bespoke-lesson service.** Every lesson ends with a "bring your team along" prompt; L20 makes it an explicit CTA for larger organisations.

---

## Appendix C — Format & delivery notes for the GWTH team

- **20 core lessons**, avg 75 min each (60 min foundations; 90–120 min builds; 45 min review). Plus up to **12 Optional lessons** (see section below).
- **Each lesson file:** short intro video (≤10 min), **thorough walkthrough video (45–120 min)** (*emphasis: Month 2 needs the most detailed walkthroughs of any month to keep students excited*), written article, hands-on build brief, starter repo link, downloadable prompt(s), quiz (3–5 questions).
- **Weekly live build clinics (90 min).** Students bring their week's builds; GWTH instructor reviews on-screen; common problems solved for everyone.
- **Capstone Demo Day — end of Week 8.** Students present their AI Readiness Assessment Tool in 5 minutes. Cohorts of ~6.
- **Community channel** (Discord / Slack). Pinned: capstone starter repo, CLAUDE.md template, hardened project template, UK research corpus (PDF bundle), live tool-pricing sheet.
- **Starter repos** (in GWTH's GitHub org):
  - `gwth-m2-starter` — bare Next.js + Supabase + Vercel template.
  - `gwth-m2-hardened-starter` — adds GDPR-safe defaults, Sentry/PostHog, gitleaks.
  - `gwth-m2-rag-starter` — L8 Knowledge Bot template.
  - `gwth-m2-agent-starter` — L11 Claude Agent SDK + MCP template.
  - `gwth-m2-voice-starter` — L13 ElevenLabs Agent template.
  - `gwth-m2-capstone-starter` — full Assessment Tool scaffold with the UK research corpus.
- **"What changed this month" one-pager** prepended to Month 2 at each cohort launch.

---

## Optional lessons (10–12)

These sit **outside the 20-lesson core sequence**. They are planning placeholders for cutting-edge, industry-specific, or advanced material that might graduate into the core later — or quietly retire if they never mature. Many map onto industry verticals from the current Feb 2026 Month 2 draft.

**O1. AI for UK Healthcare — RAG for Clinical Guidelines + NHS GDPR.**
*Why optional:* large audience but high regulatory burden (MHRA, CQC, UK GDPR for health data). Needs specialist legal review. Example project: a clinical-reference assistant for UK GPs grounded in NICE guidelines.
*Primary audience:* NHS GPs, private clinicians, UK medtech founders.
*Assumed prerequisites:* L8 (RAG), L10 (auth + RLS), L18 (deploy).
*Likely core candidate:* no — too specialised. Stays Optional. Anchors a **Health + Life Sciences Lab**.

**O2. AI for UK Legal — Employment Law Buddy + SRA Compliance.**
*Why optional:* useful for law-tech founders and employment-law SMEs; but hallucinated case law is career-ending for solicitors, so the governance overhead is high.
*Primary audience:* UK solicitors, HR consultants, employment-law researchers.
*Assumed prerequisites:* L8 (RAG), L9 (re-ranking is mandatory for legal), L17 (citation guardrails).
*UK context:* SRA November 2023 + 2026 AI guidance; the Bar Council's 2025 AI practice note.

**O3. AI for UK Finance — FCA Live Testing + Stock Analysis.**
*Why optional:* market of one-person wealth advisers is real but regulated (FCA, Consumer Duty). Needs a big compliance caveat.
*Primary audience:* UK IFAs, fintech founders, algorithmic-strategy researchers.
*Assumed prerequisites:* L4 (APIs), L10 (auth), L14 (multimodal for dashboards), L15 (automation for alerts).
*UK context:* FCA "Live Testing of AI" is a genuine opportunity — the UK has the most AI-friendly financial regulator in the G7 as of 2026.

**O4. AI for UK Property + Planning — Council Scraping + Listing Generation.**
*Why optional:* concentrated use case; overlaps with L12's research-agent example.
*Primary audience:* UK estate agents, property developers, local-news startups.
*Assumed prerequisites:* L12 (browser agents), L14 (multimodal pipelines for listings).

**O5. AI for UK Creative Industries — Music, Voiceover, Avatar Video.**
*Why optional:* commercially exciting (Talk to Sleep story) but a specific audience.
*Primary audience:* solo creators, UK boutique agencies.
*Assumed prerequisites:* L14 (multimodal).

**O6. Advanced RAG — Hybrid Search, Agentic Retrieval, Evals at Scale.**
*Why optional:* L9 covers the basics; this is the next level. Useful for students going into LLM engineering roles.
*Primary audience:* career-changers targeting AI engineer titles.
*Assumed prerequisites:* L9.
*Likely core candidate:* yes, if the RAG engineering job market keeps growing.

**O7. Multi-Agent Systems — Supervisor Pattern, LangGraph, Manager-Worker.**
*Why optional:* cutting edge; most SMEs don't need multi-agent; many build teams over-engineer with it.
*Primary audience:* AI engineers, researchers.
*Assumed prerequisites:* L11.

**O8. Real-Time Collaboration — WebSockets, WebRTC, Live Docs.**
*Why optional:* technically advanced; useful for a subset of SaaS builders.
*Primary audience:* SaaS founders targeting team-based products.
*Assumed prerequisites:* L10.

**O9. Self-Hosting LLMs — Ollama, vLLM, Llama 3.3 on a UK GPU Box.**
*Why optional:* privacy-first audience (ICO-minded professionals, UK data-sovereign enterprises). Budget-friendly ($5/month VPS won't run Llama 3.3 70B though — explain that up front).
*Primary audience:* UK regulated professionals, privacy-curious builders.
*Assumed prerequisites:* L5 (security), L11 (agents).

**O10. Fine-Tuning & Distillation — When, When Not, and How Cheaply.**
*Why optional:* 95% of 2026 problems don't need fine-tuning — RAG + good prompting solves them. But for the 5% that do, OpenAI's fine-tuning API and Anthropic's model distillation (Apr 2026) are the tools.
*Primary audience:* AI engineers targeting specialised domains.
*Assumed prerequisites:* L4 (APIs), L9 (evals).

**O11. Observability Deep Dive — Langfuse + Braintrust + Helicone + Custom Evals.**
*Why optional:* L18 gives the basics; this is for students building serious LLM products.
*Primary audience:* LLM product engineers.
*Assumed prerequisites:* L18.

**O12. Building a SaaS — Stripe, Pricing, 3-Month First-Customers Plan.**
*Why optional:* many students don't want to be founders; those who do, need this.
*Primary audience:* solo SaaS founders.
*Assumed prerequisites:* L10 (auth), L20 (consulting vs product).
*UK context:* VAT threshold £90k (April 2026), HMRC making-tax-digital, IR35 for limited companies.

---

## Lab ideas — candidates from lessons we decided not to teach

Lessons we considered and decided **not** to include in the core 20 — because the topic is a head-to-head tool comparison that goes stale fast, or because the underlying technology isn't proven enough yet. **These become Labs instead.** Same format as Month 1's Labs: short (20–40 min), dated, repeatable, ranked head-to-head against the GWTH default, refreshable without touching the core curriculum.

*Starter list (Month 2 specific; numbering continues from Month 1's 17):*

1. **M2-Lab 1 — Claude Code vs Cursor vs Windsurf on the same refactor.** Same repo, same brief, three tools; measure time-to-green, diff quality, bug count. *GWTH default today: Claude Code + Cursor dual-tool; Windsurf is the challenger.*
2. **M2-Lab 2 — OpenAI Codex CLI vs Gemini CLI vs Claude Code.** Same repo, same task; judge correctness and safety of changes. Big-3 terminal-agent shoot-out.
3. **M2-Lab 3 — Vercel AI SDK v5 vs LangChain JS vs native SDKs** on a streaming-chat app. Compare DX, LOC, reliability.
4. **M2-Lab 4 — Anthropic Claude Sonnet 4.6 vs GPT-5 vs Gemini 3 Pro vs Llama 3.3 on a UK-SME RAG benchmark.** Same 20-question eval; compare accuracy, latency, cost.
5. **M2-Lab 5 — TypeScript (Next.js) vs Python (FastAPI) vs Go (Chi) for an LLM API wrapper.** Same feature set; compare DX and performance.
6. **M2-Lab 6 — Supabase vs Neon+Clerk+R2 vs Firebase vs Convex** for a mid-size full-stack app. Compare setup time, feature coverage, TCO.
7. **M2-Lab 7 — Drizzle vs Prisma vs Kysely** on the same Supabase schema. DX, LOC, migration UX.
8. **M2-Lab 8 — Supabase pgvector vs Qdrant vs Pinecone vs Weaviate vs Turso Vector** on the same RAG workload. Cost, latency, recall.
9. **M2-Lab 9 — Docling vs Unstructured vs LlamaParse vs Markitdown vs Mistral OCR** on a pack of UK public-sector PDFs (HMRC, ICO, FCA).
10. **M2-Lab 10 — Cohere Rerank v3 vs Voyage Rerank-2 vs BGE Reranker vs Jina Reranker** on the same retrieval benchmark.
11. **M2-Lab 11 — Claude Agent SDK vs OpenAI Agents SDK vs LangGraph vs CrewAI vs AWS Strands** on the email-triage task from L11.
12. **M2-Lab 12 — Claude for Chrome vs ChatGPT Atlas vs Perplexity Comet vs Google Project Mariner** on a UK research workflow.
13. **M2-Lab 13 — ElevenLabs Agents vs OpenAI Voice Agents vs Vapi vs Retell** on a UK appointment-booking scenario with regional accents.
14. **M2-Lab 14 — GPT Image 1.5 vs FLUX 2 vs Ideogram v3 vs Midjourney V8** on UK product-photography briefs (already a Month 1 Lab; Month 2 version tests in-app APIs and pricing).
15. **M2-Lab 15 — n8n 2.0 vs Make Maia vs Zapier Agents vs Pipedream** on a multi-step UK-SME automation.
16. **M2-Lab 16 — Sentry + PostHog + Langfuse vs LangSmith vs Helicone vs Braintrust** for full-stack LLM observability.
17. **M2-Lab 17 — Stripe vs Lemon Squeezy vs Paddle** for a UK-based SaaS launch (VAT handling, Stripe Tax, Paddle MoR).
18. **M2-Lab 18 — Vercel vs Netlify vs Railway vs Coolify vs Fly.io** for a Next.js + Supabase app. Cost, DX, UK data sovereignty.
19. **M2-Lab 19 — AI-generated UK SEO content tool-off** — Site Geo (L6 Month 1 industry) vs Frase vs Clearscope vs Surfer on real UK SERPs.
20. **M2-Lab 20 — CLI-via-Bash vs MCP vs direct HTTP vs OpenAI function calling** — same task (e.g. "add a Supabase row and create a Stripe customer") built four ways. Compare DX, LOC, latency, fragility, portability. *This is the Lab that settles the "which tool-use surface should I reach for?" question for the student's own builds.*
21. **M2-Lab 21 — Self-hosted Llama 3.3 70B on consumer hardware (Ollama) vs Claude Sonnet 4.6 vs GPT-5** on a privacy-first RAG task. Inference speed, quality, cost per 1k queries.

**Format.** Each Lab has: a brief (one paragraph), the GWTH-default-today ranking, the scoring rubric, a short demo video, and a publish date / last-reviewed date. When a Lab goes stale (tool drops support, price changes, better alternative arrives), refresh it.

**AI Skills Hub pitch angle (carrying from Month 1):** Month-2 Labs are even better Skills-Hub candidates than Month-1 Labs because they're **industry-specific, comparison-first, UK-focused, free to do, and genuinely evergreen when refreshed.** A solo-trader plumber doing Lab 13 (voice-agent shoot-out) gets more value in 30 minutes than a 6-week "Intro to AI" US-big-tech-badge course.

---

## Sources (global — read in this order, not McKinsey-first, so Month 2 isn't mistaken for an Anthropic or OpenAI summary)

**Anthropic (primary for Claude Code, Agent SDK, MCP, Projects — but paired with peer sources at every point)**
- Claude Code docs — https://docs.anthropic.com/en/docs/claude-code
- Claude Agent SDK (TypeScript + Python) — https://docs.anthropic.com/en/docs/agent-sdk
- Model Context Protocol — https://modelcontextprotocol.io/
- Claude Projects — https://support.anthropic.com/en/articles/9517075
- Agentic Coding Trends Report (Feb 2026)

**OpenAI (paired with Anthropic in every build lesson)**
- "A Practical Guide to Building Agents" (Dec 2024)
- "Identifying and Scaling AI Use Cases" (Apr 2025)
- "AI in the Enterprise" (Nov 2024)
- Codex CLI docs, Responses API, Agent SDK docs

**Google**
- Gemini 3 Pro / Flash docs
- Gemini CLI
- Vertex AI (EU region)
- Firebase Studio

**Meta**
- Llama 3.3 model card + technical report
- Code Llama

**Infrastructure labs (diversified so we don't anchor to one)**
- Vercel AI SDK v5, v0, Open Agents — https://vercel.com/ai
- Supabase docs — https://supabase.com/docs
- Stripe — https://stripe.com/docs
- Sentry, PostHog, Langfuse, Braintrust — official docs

**Agent frameworks (compared in Labs)**
- LangChain / LangGraph — https://langchain.com
- CrewAI — https://www.crewai.com
- AWS Strands Agents — https://aws.amazon.com/bedrock/agents
- Pydantic AI

**Voice**
- ElevenLabs Agents — https://elevenlabs.io/agents
- OpenAI Voice Agents
- Vapi, Retell (labs only)

**Thinkers and research (the "triangulation" layer so Month 2 isn't a vendor summary)**
- Ethan Mollick — *Co-Intelligence* + One Useful Thing; Lab/Crowd/Leadership framing (2025–26)
- Andrej Karpathy — Software 3.0; "English is the new programming language"
- Simon Willison — Weblog on LLMs and prompt engineering (daily, high signal)
- Latent Space podcast — the weekly AI engineering pulse (swyx + Alessio)
- No Priors podcast — Elad Gil + Sarah Guo, weekly founder interviews
- Every Eval newsletter — evals and LLM engineering
- AI Daily Brief (NLW) — daily news spine
- a16z Sivulka — Institutional AI vs Individual AI (Mar 2026)
- Ramp Glass — Seb Goddijn & Eric Glyman on harness engineering at scale
- Anthropic Economic Index — https://www.anthropic.com/economic-index

---

## Sources (UK)

**UK Government + Regulators**
- UK AI Opportunities Action Plan (Matt Clifford, Jan 2025) + delivery tracker
- ICO AI & data-protection guidance (April 2026 update) — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/
- NCSC Secure AI development + prompt-injection advisories (April 2026) — https://www.ncsc.gov.uk/collection/ai
- FCA AI feedback statement FS24/4 + Live AI Testing sandbox — https://www.fca.org.uk/
- DSIT AI Security Institute — https://www.aisi.gov.uk/
- Bank of England AI strategy + FPC AI record
- UK Intellectual Property Office TDM consultation + guidance

**UK adoption + economics**
- British Chambers of Commerce AI surveys (March 2026) — 54%/11%
- PwC UK AI Jobs Barometer
- HSBC UK AI opportunity research (£105bn)
- techUK AI reports
- ONS productivity + AI statistics
- CIPD AI + skills reports (2026)
- KPMG UK 2026 Tech Report
- Deloitte UK State of AI in Enterprise 2026

**UK tools + companies (cited across lessons)**
- Lovable (Europe; big UK user base) — shareable web apps
- Synthesia (UK-founded; AI avatar video) — Labs + L14
- Stability AI (UK-founded) — image models (historical + Labs)
- Wayve (UK AI self-driving) — architecture deep-dives
- ElevenLabs (UK presence) — Labs 13 + L13
- ARIA (UK Advanced Research & Invention Agency) — frontier research
- Supabase (EU-west-2 London region)
- Octopus Energy Kraken (UK-founded agent platform at scale)

**UK case studies (cited across Month 2 lessons)**
- NatWest Cora+ assistant
- Lloyds Banking Group AI programme (£50m → £100m+)
- HSBC UK + HSBC Chief AI Officer
- BT Openreach knowledge bot
- Starling / Monzo / Revolut agentic banking
- Tesco AI Whoosh + £500m productivity programme
- Ocado Time Smart Shopping
- JLR AI predictive maintenance
- Rolls-Royce IntelligentEngine
- British Airways / IAG Copilot
- UK civil service Humphrey suite (GOV.UK assistants)

**UK creator / thought-leader references (continuity with Month 1 + 3)**
- Azeem Azhar — Exponential View
- Daniel Priestley — Key Person of Influence, Scorecards
- Tom Goodwin — Substack
- Steven Bartlett — Diary of a CEO AI episodes

---

*This document supersedes: `LESSON_IDEAS_2026-03-12.md` (Newsbot-only, outdated) and the `syllabus.json` Month 2 draft (35 lessons, Feb 2026 — see [`SYLLABUS_DIFF_MONTH_2_2026-04-21.md`](SYLLABUS_DIFF_MONTH_2_2026-04-21.md) for the scoring comparison). Cross-reference: this doc assumes Month 1 v2 (`MONTH_1_LESSON_IDEAS_2026-04-20.md`) and is the build substrate for Month 3 (`MONTH_3_LESSON_IDEAS_2026-04-20.md`). Together the three docs describe the April 2026 GWTH.ai curriculum.*
