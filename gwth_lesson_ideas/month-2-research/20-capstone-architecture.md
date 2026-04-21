# Capstone Architecture — AI Readiness Assessment Tool

*Research spine for L16–L19 (Capstone). Written 2026-04-21. Extended spec lives in `../MONTH_2_LESSON_IDEAS_2026-04-21.md` §Capstone. This file documents the architectural decisions and references the Month-3 version of the tool spec.*

## Why this design is the way it is

Four design pressures shaped the Capstone:

1. **It must be buildable in ~20 hours** by a Month-2-grad student directing Claude Code + Cursor — not a team.
2. **It must integrate every Month-2 skill** — Next.js, Supabase (Auth + Postgres + pgvector), Vercel AI SDK v5, RAG, agents (for the chat), PDF, deploy, observability.
3. **It must be useful on day one** — the student runs it on their own company and gets genuine insight, not a toy output.
4. **It must extend into Month 3** — the same codebase absorbs the 12 McKinsey themes, 7 Sivulka pillars, 6 Rewired capabilities without a rewrite.

## High-level architecture

```
┌──────────────────────────────────────────────────────────┐
│  Next.js 16 (App Router, React 19, Turbopack, RSC)       │
│  ├── /app (routes)                                       │
│  │     ├── /(public) — marketing + assessment entry      │
│  │     ├── /(app) — authenticated assessment experience  │
│  │     ├── /(share) — unique URL per assessment          │
│  │     └── /api — server routes + streaming endpoints    │
│  ├── /components (shadcn/ui)                             │
│  ├── /lib                                                │
│  │     ├── /scoring — DETERMINISTIC TypeScript           │
│  │     ├── /narrative — LLM-generated copy (via SDK v5)  │
│  │     ├── /rag — pgvector retrieval                     │
│  │     ├── /pdf — @react-pdf/renderer                    │
│  │     └── /observability — Sentry + PostHog + Langfuse  │
│  └── /prompts (version-controlled prompt files)          │
├──────────────────────────────────────────────────────────┤
│  Supabase (EU-west-2 / London)                            │
│  ├── Auth — magic link + Google + GitHub + LinkedIn      │
│  ├── Postgres                                            │
│  │     ├── assessments                                   │
│  │     ├── assessment_answers                            │
│  │     ├── assessment_scores                             │
│  │     ├── assessment_narratives                         │
│  │     ├── chat_sessions                                 │
│  │     ├── chat_messages                                 │
│  │     └── corpus_documents (pgvector)                   │
│  ├── Storage — uploaded PDFs, generated PDFs             │
│  └── Edge Functions — only if needed for light compute   │
├──────────────────────────────────────────────────────────┤
│  LLMs (via Vercel AI SDK v5 — one-flag swap)              │
│  ├── Claude Sonnet 4.6 (default)                         │
│  ├── Claude Opus 4.7 (for chat feature, optional)         │
│  ├── GPT-5 (swap option)                                 │
│  └── Gemini 3 Pro (swap option)                          │
└──────────────────────────────────────────────────────────┘
```

## Deterministic core vs LLM narrative (the hard architectural line)

| Component | Determinism | Why |
|-----------|------------|------|
| Scoring engine | **100% deterministic TypeScript** | Hallucinated scores are career-ending |
| Benchmarks | **100% deterministic** (static data + simple lookup) | Audit-friendly |
| Gap analysis | **Ordering is deterministic; narrative labels are LLM-generated** | Order must be auditable; wording can be richer |
| 90-day roadmap | **Framework is deterministic; initiative suggestions are LLM-generated** | Legal + brand safety |
| Ask-the-tool chat | **LLM with citation guardrails** | Chat is explicitly "the LLM grounded in the corpus" |
| PDF | **Deterministic rendering** of scored data + LLM narrative | Consistency + brand |

**The rule:** if a regulator asks "why did this user get this score?" the answer must be reproducible from inputs + code. If they ask "why did the roadmap suggest 'run a Dojo clone'?" the answer is "the LLM generated it; here is the prompt and the citations it used." Different provenance model for different components. *This is the Starling Bank pattern (file 11, §5).*

## The scoring schema (Month-2 version; extended in Month 3)

Six dimensions, each scored 1–5:

```typescript
export const DIMENSIONS = [
  'leadership',      // CEO tone, board engagement
  'talent',          // skills depth, hiring, L&D
  'dataReadiness',   // cleanliness, access, residency
  'technology',      // stack, APIs, vendors, security
  'governance',      // policies, risk, right-to-deploy
  'adoption',        // actual use, measurement, stickiness
] as const;

export const BANDS = [
  { min: 26, max: 30, label: 'Leader',    percentile: 'Top 20% (PwC frame)' },
  { min: 18, max: 25, label: 'Mover',     percentile: 'Mid 60%' },
  { min: 10, max: 17, label: 'Laggard',   percentile: 'Bottom 20%' },
  { min:  6, max:  9, label: 'Observer',  percentile: 'Just starting'    },
];
```

Month 3 will add:
- **12 McKinsey themes** as a layer over the six dimensions.
- **7 Sivulka pillars** as a second layer.
- **6 Rewired capabilities** as a third layer.

All three layers *aggregate into* the six dimensions; the UI can show drill-downs. The Month-2 starter scaffold has placeholder columns in `assessment_scores` so Month 3 can populate them without a migration.

## Data model (Supabase Postgres)

```sql
-- Simplified; see gwth-m2-capstone-starter for the full DDL.

create table assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),     -- nullable for anon
  company_name text,
  industry text,
  size_band text,
  revenue_band text,
  created_at timestamptz default now(),
  completed_at timestamptz,
  share_token text unique
);

create table assessment_answers (
  assessment_id uuid references assessments(id) on delete cascade,
  dimension text,
  sub_question text,
  answer_text text,
  answer_score int  -- 1..5; null if narrative-only
);

create table assessment_scores (
  assessment_id uuid primary key references assessments(id) on delete cascade,
  leadership int, talent int, data_readiness int,
  technology int, governance int, adoption int,
  total int, band text,
  -- Month-3 extension columns (nullable in Month 2)
  theme_scores jsonb, pillar_scores jsonb, capability_scores jsonb
);

create table assessment_narratives (
  assessment_id uuid references assessments(id) on delete cascade,
  section text,     -- 'summary' | 'gap' | 'roadmap' | ...
  content text,
  generated_with text,  -- 'claude-sonnet-4.6' | 'gpt-5' | ...
  generated_at timestamptz default now()
);

create table corpus_documents (
  id uuid primary key default gen_random_uuid(),
  title text, source_url text,
  content text, chunk_id int,
  embedding vector(1536),   -- OpenAI text-embedding-3-large
  metadata jsonb             -- {'country': 'UK', 'sector': 'banking', ...}
);
create index on corpus_documents using hnsw (embedding vector_l2_ops);
```

RLS enforced on all tables (`user_id = auth.uid()` pattern). Anonymous assessments use the `share_token` pattern — possessor of the token has read/write to that assessment, but nothing else.

## The UK research corpus (bundled with `gwth-m2-capstone-starter`)

~40 PDFs + structured JSON abstracts, curated by GWTH:

- ICO AI guidance (April 2026) + prior UK GDPR guidance
- NCSC Secure AI development + prompt-injection advisories
- FCA FS24/4 + Live Testing of AI
- DSIT AI Security Institute 2026 reports
- BCC March 2026 AI survey (54%/11%)
- HSBC UK £105bn research (Nov 2025)
- PwC UK AI Jobs Barometer (March 2026)
- CIPD 2026 skills report
- KPMG UK 2026 Tech Report
- Deloitte UK State of AI in Enterprise 2026
- UK AI Opportunities Action Plan + delivery tracker
- Lloyds / HSBC / NatWest / Starling / Monzo public AI disclosures
- Tesco / Ocado / M&S / Sainsbury's AI programme disclosures
- Octopus / OVO / E.ON Next (Kraken ecosystem) disclosures
- BA / IAG / easyJet ops AI disclosures
- Rolls-Royce / JLR / Wayve technical AI disclosures
- UK Civil Service Humphrey suite evaluations
- UK SME case-study library (techUK 2026; British Chambers of Commerce)

The corpus is **pre-chunked, pre-embedded, pre-cited**. Students don't have to ingest it themselves — it ships ready-to-query. (L17 teaches the ingestion pattern on a smaller example for learning purposes; the capstone reuses the pre-built corpus.)

## LLM prompt architecture

Three primary prompts, version-controlled in `/prompts`:

1. **Narrative summary prompt** — gets the scorecard + UK benchmarks, returns 3–5 paragraphs of the executive summary. Temperature 0.3 for consistency.
2. **Gap analysis prompt** — gets the scored gaps, returns ordered list with UK peer comparisons. Temperature 0.3.
3. **Roadmap prompt** — gets the scored dimensions + the student's sector + the UK peer case, returns a 90-day plan with specific initiatives. Temperature 0.5 for useful variation.
4. **Ask-the-tool chat prompt** — tool-using agent that can query `corpus_documents` via pgvector and returns cited answers. Temperature 0.2 for precision; citation guardrail = "refuse if no sources retrieved."

Each prompt uses Zod schemas for structured outputs, so the downstream code can rely on shape.

## Observability plan

- **Sentry:** errors + tracing. 100% sampling initially (free tier is generous).
- **PostHog:** every user event — `assessment.started`, `assessment.step.completed`, `assessment.scored`, `pdf.downloaded`, `chat.question.asked`, `chat.source.cited`. Funnel analysis for free.
- **Langfuse:** every LLM call traced. Cost per assessment tracked and surfaced to the user in the dashboard (*"this assessment cost you £0.17 in LLM calls"*).

## Deployment paths

| Student profile | Deploy target | Notes |
|-----------------|--------------|-------|
| **Default** | Vercel Hobby (free) | HTTPS, custom domain available, analytics built-in |
| **UK-data-sovereign** | Coolify on Hetzner Helsinki or a UK VPS | Covered in L18 |
| **Internal corporate** | Azure Web Apps UK South | Optional; covered in a Month-3 extension |

## Extending to Month 3

Month 3 adds (without rewriting):
- Scorecard UI populated with 12 themes / 7 pillars / 6 capabilities drill-downs.
- Collaborator invite flow (Slack + Google Meet integration) for multi-respondent teams.
- Consulting-handover mode: export assessment as a McKinsey-style briefing deck via Gamma or native `@react-pdf`.
- Anonymised benchmarking pool (opt-in across assessments).
- Enterprise white-label mode for GWTH bespoke clients.

## Acceptance criteria recap (from the main Month-2 doc)

1. First-time user completes assessment and downloads PDF in ≤ 12 minutes.
2. PDF is board-presentable.
3. Scoring is deterministic.
4. Narratives cite at least one UK benchmark + one UK company.
5. Bad input doesn't hallucinate capabilities.
6. Share URL works.
7. Chat never fabricates sources.
8. Playwright E2E green.
9. axe-core clean.
10. Live URL visible to a UK client on day one.

## Links

- Full spec — `../MONTH_2_LESSON_IDEAS_2026-04-21.md` §Capstone
- Month 3 context — `../MONTH_3_LESSON_IDEAS_2026-04-20.md`
- Starter repo (to be created) — `github.com/GWTH-ai/gwth-m2-capstone-starter`
- Research corpus bundle — `21-capstone-rag-corpus.md`
- Observability setup — `22-pdf-and-deploy.md`
