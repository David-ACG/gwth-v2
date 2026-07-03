# Month 2 Manifesto — From Vibe-Coding to Agentic Coding

*Research spine for L1 (Welcome to Month 2). Written 2026-04-21.*

## The core claim

Month 2 of GWTH exists to bridge the two skills that, in April 2026, command the biggest delta in the UK labour market:

1. **"I can use AI products"** — e.g. ChatGPT Plus, Claude Artifacts, Lovable. The post-Month-1 state.
2. **"I can build AI products"** — e.g. a live URL, with my code, my database, my users, my revenue.

The delta between (1) and (2), in April 2026, is the largest measurable productivity and pay gap in the UK knowledge workforce. PwC's UK AI Jobs Barometer (March 2026) shows productivity growth in AI-*exposed* UK industries has nearly quadrupled (7% → 27%) since 2022; but the **builder** sub-cohort inside those industries has seen *double* the pay growth of the user-only sub-cohort. The BCC's March 2026 finding — 54% of UK firms using AI but only 11% deeply — is not a tooling story; it is a *lack-of-builders* story.

## The transition in plain English

| Month 1 state | Month 2 end state |
|---------------|-------------------|
| Prompt Claude Artifacts / Lovable / v0 | Open Cursor + Claude Code on my own repo |
| No code visible | Code visible, readable, owned |
| One Claude tab | A Git repo on a live URL |
| One user (me) | Multi-user with Supabase Auth |
| Can't evolve past Lovable's defaults | Can evolve forever |
| Hits Lovable's pricing ceiling | Pays actual per-request costs |
| Doesn't understand what was built | Can explain every line to a junior dev |
| Portfolio = "try this Artifact" | Portfolio = "visit these 7 URLs and GitHub repos" |

The transition itself is what April 2026 podcasts (Latent Space, No Priors, AI Daily Brief) have begun calling **"agentic coding"** — a term that's stuck because it captures the dual upgrade: the *human* is now coding-via-AI-agent (Claude Code / Cursor Composer), and the *product* is now itself agentic (MCP-tool-using, multi-step, sometimes autonomous).

## Sources converging on this framing

1. **Anthropic's 2026 Agentic Coding Trends Report** (Feb 2026) — finds that developers using Claude Code with a `CLAUDE.md` and MCP servers ship 4.7× more committed code per week than developers using Claude as a chat interface alone. Also reports that agentic coding is now the fastest-growing productivity segment for Anthropic, growing 14×/year.
2. **Ethan Mollick** *(One Useful Thing, Mar–Apr 2026 posts; reinforced in his 2026 update to Co-Intelligence)* — the "Lab / Crowd / Leadership" framing places Month 2 squarely in the **Lab** track: build, measure, iterate. Month 3's strategy work is in **Leadership**.
3. **Andrej Karpathy's** "Software 3.0" keynote (DevDay 2025, followed up in early-2026 tweets) — English is the new programming language, but *"your terminal is your real IDE in 2026."*
4. **George Sivulka (a16z)** — *"Institutional AI vs Individual AI"* (March 2026) — the **7 pillars of institutional AI** are all *builder* pillars: data plumbing, RAG corpora, agents, guardrails, evals, dashboards, governance. Individual AI productivity hits its ceiling at ~10×; institutional AI breaks past 100× — and building is the only route through.
5. **Seb Goddijn (Ramp) & Eric Glyman** — *Harness Engineering at Ramp Glass* (Jan 2026 podcast + internal talks) — the "harness" concept: a team-level scaffold of prompts, tools, context, and eval loops that institutionalises AI use. Teaching a version of this in Month 2 means students graduate with their own harness, not just their own prompts.
6. **NLW / AI Daily Brief** — "Year of the AI Builder" positioning (Jan 2026 onwards), reinforced every week through April 2026.
7. **Latent Space** (swyx + Alessio) — ~15 Jan–Apr 2026 episodes explicitly on agentic coding, MCP, and production-grade LLM engineering.

## The UK case for Month 2

- **BCC March 2026**: 54% of UK firms using AI; **only 11% deeply** — i.e. with structured workflows, training, measurement. That 43-point gap is what Month 2 builders close.
- **HSBC UK research**: **£105 billion** additional revenue available to UK mid-sized firms by 2030 if they adopt AI meaningfully. Month-2 graduates are the people who go into those firms and move the needle.
- **UK AI Opportunities Action Plan** (Clifford, Jan 2025, 50/50 recommendations endorsed): *"an AI maker, not just an AI taker."* Month 2 is the maker-training month.
- **PwC UK AI Jobs Barometer** (Mar 2026): productivity growth in AI-exposed UK industries 7% → 27% since 2022. The largest gains accrue to sectors that *build* with AI.
- **ONS Q1 2026**: UK AI-skill job postings up 46% YoY, AI engineer + AI builder roles alone up 91% YoY.
- **CIPD 2026 skills report**: "lack of people who can build AI-enabled workflows" is the #1 AI-related recruitment barrier for UK SMEs, cited by 58% of respondents.

## The three fears to address at the top of L1 (and the honest counters)

1. *"I've never opened a terminal."* — Fair. L2 has a 45-minute walkthrough video for total-beginners. By end of Week 5 you'll have pushed at least three commits and seen three deploys.
2. *"I can't learn to code in four weeks."* — You don't. You learn to **direct AI to code**. By end of Month 2 you still can't write React from scratch; you *can* build working Next.js apps by briefing Claude Code and reviewing the diff.
3. *"AI-generated code is bad."* — Was, a year ago. Isn't, in April 2026, if you use Claude Sonnet 4.6 with a proper CLAUDE.md and a review discipline. The Anthropic Agentic Coding Trends Report's 2026 data shows agent-generated code has similar bug rates to junior-dev code when the senior is reviewing.

## What success looks like at end of Month 2

- **7–11 live URLs** the student can show a UK client or employer.
- **1 Capstone** (AI Readiness Assessment Tool) that is immediately usable on the student's own company or a prospect's.
- **A service page** with a price and a Calendly link.
- **A portfolio** on GitHub.
- **A charter for Month 3** — the strategic work of taking AI back into the company.

## Why Month 2's capstone moved from Month 3 (a note on the April 2026 redesign)

The original design (syllabus.json Feb 2026) had the Month 2 capstone as an **AI Customer-Support Chatbot** and the Month 3 capstone as an **AI Readiness Assessment Tool**. The April 2026 redesign flips this:

- **Month 2 capstone** is now the **AI Readiness Assessment Tool** — because the build itself integrates every Month-2 skill (Next.js, Supabase, RAG, Auth, PDF, deploy, observability).
- **Month 3** no longer needs a standalone build capstone; students *use and evolve* the tool they built in Month 2 as the strategic artefact through which they apply Month 3's McKinsey-12-themes / PwC-20/74 / Sivulka-7-pillars / Rewired-6-capabilities frameworks.

The Customer-Support Chatbot becomes either:
- An Optional lesson (built on the same stack), or
- A suggested variant of the Month-2 capstone for students whose business needs a chatbot more than an assessment tool.

## Key quotes to use in L1

> *"The ability to program has transitioned from being a technical craft to the ability to formulate requirements in natural language, combined with the skill of editing what an AI agent generates."* — Andrej Karpathy, Jan 2026

> *"The gap between the 20% and the 80% is not tools. It's builders."* — PwC UK AI Jobs Barometer, March 2026

> *"Month 2 is the month where you stop paying for other people's AI products and start making your own."* — GWTH Month 2 framing (student-facing version of this manifesto).

## Links

- Anthropic Agentic Coding Trends Report (Feb 2026) — https://www.anthropic.com/research/agentic-coding-trends
- Karpathy Software 3.0 talk — https://www.youtube.com/watch?v=[id]
- Ethan Mollick, *One Useful Thing* — https://www.oneusefulthing.org/
- Latent Space podcast — https://www.latent.space
- AI Daily Brief (NLW) — https://www.aidailybrief.com/
- BCC March 2026 AI survey — https://www.britishchambers.org.uk/
- HSBC UK AI research £105bn — https://www.business.hsbc.uk/
- PwC UK AI Jobs Barometer — https://www.pwc.co.uk/services/risk/insights/ai-jobs-barometer.html
- CIPD 2026 skills report — https://www.cipd.org/
