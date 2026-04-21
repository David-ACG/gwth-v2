# Month 2 Syllabus Diff & Scoring — April 2026

*Generated 2026-04-21 to compare the current `syllabus.json` Month 2 (35 lessons, created Feb 2026) against the new [`MONTH_2_LESSON_IDEAS_2026-04-21.md`](MONTH_2_LESSON_IDEAS_2026-04-21.md) (20 core + 12 optional + 21 labs).*

## TL;DR

- **Current syllabus:** 35 lessons (15 optional "Week 0" industry/advanced + 20 mandatory Week 1-4). Capstone = AI Customer-Support Chatbot on askmyco.com. Created/last-updated 2026-02-17.
- **New design:** 20 core lessons + 12 optional + 21 labs. Capstone = **AI Readiness Assessment Tool** (moved from Month 3). Every lesson has a build project (20 of 20).
- **Survival rate:** roughly **65% of the current Month 2** material survives — mostly with "keep + refresh" scoring; a handful of high-value lessons survive unchanged. 15 industry-vertical "Week 0" lessons demote from core to Labs + Optional (more appropriate home given their churn). 3 new lessons are additions.
- **Capstone swap:** biggest structural change. Customer-Support Chatbot → AI Readiness Assessment Tool. The Chatbot becomes an Optional lesson or a capstone variant. (Month 3's current capstone slot is now occupied by "use + evolve the Assessment Tool strategically" — see Month 3 doc for how this is designed not to duplicate.)

## Scoring rubric

Each current-syllabus lesson is scored **0–3** on eight dimensions. **Total 0–24.**

| # | Criterion | 0 (drop) | 1 (weak) | 2 (OK) | 3 (strong) |
|---|-----------|----------|----------|--------|------------|
| C1 | **Currency** — reflects April 2026 reality | Wrong tools/models | Somewhat dated | Mostly current | Current + future-proofed |
| C2 | **Build intensity** — produces a kept, shippable artefact | No build | Soft activity | Activity with output | Real portfolio-quality build |
| C3 | **Prescriptive-stack fit** — aligns with GWTH's big-3+challenger rule | Wrong stack | Neutral | Aligned | Anchors the stack |
| C4 | **UK applicability** — UK tools, regulators, examples | US-only | Mostly US | UK-usable | UK-native examples |
| C5 | **Beginner-after-Month-1 accessibility** — pitched for a Month-1 grad | Too advanced | Gaps | Mostly fine | Perfectly pitched |
| C6 | **Capstone alignment** — feeds AI Readiness Assessment Tool | No link | Tangential | Supports | Explicit capstone building block |
| C7 | **Stickiness** — memorable "I shipped something" moment | Forgettable | Dry | Good | "I have a live URL!" moment |
| C8 | **Evergreen vs churn** — durable pattern vs tool-of-the-month | Will go stale in weeks | Unstable | Will hold for months | Will hold for a year+ |

**Decision thresholds.**
- **18–24 Keep + refresh** — structurally strong; update tool names + April 2026 references.
- **12–17 Substantial rewrite** — good bones, wrong meat; rewrite description and project.
- **< 12 Demote to Lab / Optional, or drop**.

---

## Part 1 — Week 0 (15 Optional Industry + Advanced lessons) — scored

These are the 15 "Week 0" lessons in the current syllabus. Most are industry-vertical lessons (healthcare, legal, finance, travel, creative, marketing, HR) + advanced-technical lessons (full-stack, advanced RAG, multi-agent, security, collaboration, SaaS, open source, career).

| # | Title | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | Total | Decision | → New doc |
|---|-------|----|----|----|----|----|----|----|----|-------|----------|----------|
| 1 | AI for Healthcare | 1 | 3 | 2 | 2 | 2 | 1 | 3 | 1 | **15** | **Demote to Optional + Lab** — churn too high for core | O1 |
| 2 | AI for Legal | 2 | 3 | 2 | 2 | 2 | 1 | 3 | 2 | **17** | **Demote to Optional** — solid but niche | O2 |
| 3 | AI for Finance | 2 | 3 | 2 | 3 | 2 | 1 | 3 | 1 | **17** | **Demote to Optional** — FCA Live Testing keeps it current | O3 |
| 4 | AI for Travel & Event Planning | 1 | 3 | 2 | 2 | 2 | 1 | 3 | 1 | **15** | **Demote to Optional** | O4 |
| 5 | AI for Creative Industries | 1 | 3 | 2 | 2 | 2 | 1 | 3 | 1 | **15** | **Demote to Optional** | O5 |
| 6 | AI for Marketing (SEO post-Google) | 2 | 3 | 2 | 2 | 2 | 1 | 2 | 1 | **15** | **Demote to Lab** — SEO/GEO changes weekly | Lab 19 |
| 7 | AI for HR & Recruitment (Video CVs) | 1 | 3 | 1 | 2 | 2 | 1 | 2 | 1 | **13** | **Demote to Lab** — too narrow; recruiter-AI churns | Lab (new) |
| 8 | Advanced Full-Stack | 3 | 3 | 3 | 2 | 2 | 3 | 3 | 3 | **22** | **Keep** — but distributed across L10, L18 | **L10 + L18** |
| 9 | Advanced RAG | 3 | 3 | 3 | 2 | 2 | 3 | 3 | 3 | **22** | **Keep + promote into core** | **L9 + Optional O6** |
| 10 | Multi-Agent Systems | 2 | 3 | 2 | 1 | 1 | 2 | 2 | 2 | **15** | **Demote to Optional** — too advanced for core | O7 |
| 11 | Security Deep Dive | 3 | 3 | 3 | 3 | 2 | 3 | 3 | 3 | **23** | **Keep + promote** — front-load into **L5** | **L5 (basics) + retained full version as Optional** |
| 12 | Real-Time Collaboration | 1 | 3 | 1 | 1 | 1 | 1 | 2 | 1 | **11** | **Drop from core; keep as Optional** | O8 |
| 13 | Building a SaaS Product | 2 | 3 | 2 | 2 | 2 | 2 | 3 | 2 | **18** | **Keep** — fold into L20 + Optional O12 | **L20 + O12** |
| 14 | Open Source & Community | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **15** | **Demote to Optional** — not central to Month 2 | (dropped / Month 3) |
| 15 | Career Showcase | 2 | 2 | 2 | 3 | 3 | 2 | 3 | 3 | **20** | **Keep + refresh** — folds into **L19 + L20** | **L19 + L20** |

### Summary of Part 1

- **Keep as core (with refresh / merge):** 4 lessons (full-stack, RAG, security, SaaS / career) → merged into new L5, L9, L10, L18, L19, L20.
- **Demote to Optional:** 7 lessons (7 industry verticals + multi-agent + collaboration + SaaS + open-source).
- **Demote to Lab:** 2 lessons (marketing/SEO, HR video-CV).
- **Drop:** 2 lessons (real-time collab, open source) as low-priority — retained as Optional only.

The industry-vertical lessons (healthcare, legal, finance, travel, creative, marketing, HR) all score in the 13–17 band — decent content, but **churn is too high for core** and the primitive-combinations they teach are covered elsewhere. They become Optional + Lab candidates — still delivered, but refreshed independently without blocking core release.

---

## Part 2 — Week 1-4 (20 Mandatory Core) — scored

These are the 20 "mandatory core" lessons in the current syllabus.

| W | # | Title | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | Total | Decision | → New doc |
|---|---|-------|----|----|----|----|----|----|----|----|-------|----------|----------|
| 1 | 16 | Welcome to Month 2 | 2 | 2 | 3 | 2 | 3 | 2 | 2 | 3 | **19** | **Keep + refresh** — update to April 2026 framing + new capstone | **L1** |
| 1 | 17 | Setting Up Your Dev Environment | 3 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | **23** | **Keep + refresh** — perfect; just add thorough walkthrough video | **L2** |
| 1 | 18 | When to Use Which Language | 1 | 2 | 1 | 2 | 2 | 1 | 2 | 2 | **13** | **Drop / merge** — new design is TS-first; language-choice is a sub-topic not a lesson | merged into **L2** |
| 1 | 19 | Context Engineering | 3 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | **23** | **Keep** — exactly right | **L3** |
| 1 | 20 | AI Security Fundamentals | 3 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | **23** | **Keep + refresh** — add UK ICO + FCA April 2026 update | **L5** |
| 2 | 21 | Your First Cursor App | 2 | 3 | 3 | 2 | 3 | 2 | 3 | 2 | **20** | **Keep + refresh** — broaden to dual-tool (Cursor + Claude Code) | merged into **L2 + L4** |
| 2 | 22 | Claude Code | 3 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | **23** | **Keep** — merge with Cursor into dual-tool | merged into **L2** |
| 2 | 23 | Building a Business Tool (Replace £20/mo Sub) | 2 | 3 | 2 | 3 | 3 | 2 | 3 | 2 | **20** | **Keep + refresh** — feeds L4 and L6 | merged into **L4 + L6** |
| 2 | 24 | APIs | 3 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | **23** | **Keep** — but reframed around Vercel AI SDK v5 | **L4** |
| 2 | 25 | Automation with Claude Cowork & Desktop Agents | 2 | 3 | 2 | 2 | 3 | 2 | 2 | 2 | **18** | **Keep + refresh** — MCP-first now; Cowork less central | merged into **L11 + L15** |
| 3 | 26 | RAG Explained | 3 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | **23** | **Keep** | **L7 + L8 setup** |
| 3 | 27 | Building a RAG App with Cursor | 3 | 3 | 3 | 2 | 3 | 3 | 3 | 3 | **23** | **Keep** — add Supabase pgvector detail + UK corpus | **L8** |
| 3 | 28 | Business Data — Dashboards | 2 | 3 | 2 | 2 | 2 | 2 | 3 | 2 | **18** | **Keep + refresh** — shift under L14 multimodal + L18 capstone PDF | merged into **L14 + L18** |
| 3 | 29 | Advanced Automation (n8n, Make) | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | **24** | **Keep** — gold | **L15** |
| 3 | 30 | Building AI Agents That Take Action | 2 | 3 | 2 | 2 | 2 | 3 | 3 | 2 | **19** | **Keep + refresh** — rebuild around Claude Agent SDK + MCP | **L11** |
| 4 | 31 | Content & Multimedia Systems at Scale | 2 | 3 | 2 | 2 | 2 | 2 | 3 | 2 | **18** | **Keep + refresh** — expand with voice + video pipelines | **L14** |
| 4 | 32 | Capstone Planning (Customer-Support Chatbot) | 2 | 2 | 2 | 2 | 3 | 1 | 2 | 2 | **16** | **Rewrite** — capstone changes to AI Readiness Assessment Tool | **L16** |
| 4 | 33 | Capstone Build, Deploy & Present | 2 | 3 | 2 | 2 | 3 | 1 | 3 | 2 | **18** | **Rewrite** — now split across L17, L18, L19 | **L17 + L18 + L19** |
| 4 | 34 | AI for Teams — Making the Business Case | 2 | 2 | 2 | 2 | 3 | 2 | 2 | 3 | **18** | **Keep + refresh** — UK-first; overlaps with L20 and Month 3's L20 | merged into **L20** |
| 4 | 35 | Month 2 Review — Portfolio | 2 | 2 | 2 | 2 | 3 | 2 | 2 | 3 | **18** | **Keep + refresh** — merges with L19 launch + L20 consulting | merged into **L19 + L20** |

### Summary of Part 2

- **Strong (21–24):** 9 lessons — almost all the Cursor/Claude Code/Context Engineering/Security/RAG core. These survive nearly unchanged; only the April 2026 refresh is needed.
- **Good (18–20):** 8 lessons — merge/refresh rather than rewrite.
- **Weak (14–17):** 2 lessons — language-choice (drop into L2 sub-topic) and the Chatbot Capstone (rewrite as AI Readiness Assessment Tool).
- **Drop (< 14):** 1 lesson (language-choice, alone, doesn't deserve a slot).

---

## Part 3 — What's new in the 20-lesson core vs old 20-mandatory

New ideas that **didn't exist** in the Feb 2026 core and are now in the April 2026 core:

| New lesson | Why new |
|------------|--------|
| **L6** — Ingesting real business data (PDFs, Word, Excel, websites) | Current syllabus skipped straight to RAG without addressing data ingestion. Docling + Firecrawl + UK TDM rules deserve a whole lesson. |
| **L7** — Vectors & embeddings without the maths | Current syllabus treated embeddings as an implementation detail inside L26 RAG Explained. New design gives it its own foundational lesson so RAG actually clicks. |
| **L9** — Making RAG actually work (chunking, re-ranking, evals) | Current syllabus had "Advanced RAG" as Week-0 Optional — but this belongs in core because 70% of students' L8 RAG bots fail without re-ranking. Promoted. |
| **L10** — Persistent data + multi-user (Supabase Auth + RLS) | Current syllabus treated auth as Week-0 Advanced Full-Stack — but it's core. Every L8+ build needs it. Promoted. |
| **L12** — Browser & computer-use agents | April 2026 reality — Claude for Chrome is GA on all paid tiers; Atlas exists; Project Mariner exists. Current syllabus pre-dates this landscape. |
| **L13** — Voice agents | Current syllabus has no voice-agent lesson. Q1 2026 made this a commercially vital skill for UK sole-traders. |

Net effect: the 20-lesson core is tighter *and* more complete — trading industry-vertical variety (which moves to Optional + Lab) for production-engineering depth (which is stable under GWTH's "big-labs only" defaults rule).

---

## Part 4 — What moved where

### Survives in new core
- Welcome L16 → **L1** (refreshed)
- Dev setup L17 → **L2** (thorough walkthrough added)
- Context engineering L19 → **L3** (kept)
- Security fundamentals L20 → **L5** (UK ICO added)
- Cursor app L21 + Claude Code L22 → **L2 + L4** (merged into dual-tool + APIs lesson)
- APIs L24 → **L4** (Vercel AI SDK v5 added)
- RAG explained L26 + RAG app L27 → **L7 + L8** (split into "feel it" + "build it")
- Advanced automation L29 → **L15** (kept as gold-standard)
- Agents that take action L30 → **L11** (rebuilt around Agent SDK + MCP)
- Content at scale L31 → **L14** (expanded)
- Business case L34 + Month 2 review L35 → merged into **L20**

### Promoted from Week 0 Optional into new core
- Advanced RAG → **L9**
- Advanced Full-Stack → **L10 + L18**
- Security Deep Dive → **L5 (fundamentals kept; deep-dive as Optional O-retained)**
- Career Showcase → **L19 + L20**
- SaaS Product → **L20 + O12**

### Moved to Labs (refreshable, non-blocking)
- Marketing / SEO / GEO → Lab 19
- HR video CVs → new Lab
- Every industry-vertical that made sense as a head-to-head (healthcare RAG vs legal RAG vs finance RAG comparison could genuinely be a Lab)

### Moved to Optional (still delivered, but outside core)
- Healthcare, Legal, Finance, Travel, Creative industry lessons → O1–O5
- Multi-Agent Systems → O7
- Real-Time Collaboration → O8
- Open Source → retained but not prioritised for Month 2
- SaaS deep-dive → O12

### Dropped (as standalone lessons; sub-topics absorbed into others)
- "When to Use Which Language" — now a 10-min sub-topic in L2, not a lesson

### Genuinely new (no predecessor in Feb 2026 syllabus)
- **L6 — Ingesting real business data** (PDF/Word/Excel/websites with Docling + Firecrawl)
- **L7 — Vectors & embeddings explained without the maths**
- **L12 — Browser & computer-use agents**
- **L13 — Voice agents**

---

## Part 5 — The Capstone change

**Old:** AI Customer-Support Chatbot on askmyco.com. Two-part (planning + build). Integrates RAG, NLP, API, deployment.

**New:** AI Readiness Assessment Tool. Four-part (L16 scoring engine → L17 RAG chat → L18 PDF + deploy → L19 launch). Integrates everything Month 2 teaches. **Also the vehicle Month 3 uses** for its strategic frameworks.

### Why the change is the right call (and what's lost)

**Why right:**
1. **Better primitive integration.** Assessment Tool touches every Month-2 skill end-to-end; Chatbot is weighted toward RAG + LLM with less Auth / PDF / multi-user.
2. **Better career artefact.** *"I built an AI Readiness Assessment Tool for UK SMEs"* is a consulting pitch by itself. *"I built a chatbot"* is 2023-sounding.
3. **Better Month-3 coupling.** Month 3's strategic frameworks (McKinsey 12 themes, PwC 20/74, Sivulka 7 pillars, Rewired 6 capabilities) *extend* the Assessment Tool naturally. A chatbot doesn't have that hook.
4. **Better UK case-study alignment.** HSBC £105bn, BCC 54%/11%, PwC UK AI Jobs Barometer — all natural fits for the Assessment Tool, not for a chatbot.

**What's lost:**
1. Students who *specifically want a chatbot* (e.g. local estate agents, local GP practices) don't get one in core. → Mitigation: chatbot framework is taught in L8 (Knowledge Bot) and can be extended; also becomes a stretch / variant Capstone.
2. The L32/L33 "two-part planning + build" rhythm is replaced by a four-part (L16–L19) arc. → Actually an improvement — more build, less planning theatre.
3. askmyco.com domain loses its capstone role. → GWTH can repurpose it for the Optional Chatbot variant.

---

## Overall scoring summary

| Band | Current Month 2 count | Action |
|------|----------------------|--------|
| **21–24** (strong) | **10** (mostly Week 1-4 core) | Keep with refresh |
| **18–20** (good) | **11** | Keep + substantive refresh |
| **14–17** (weak) | **11** | Rewrite or merge |
| **< 14** (poor) | **3** | Drop / demote |
| **Total** | **35** | |

**Average:** 18.4/24 — the Feb 2026 syllabus scored surprisingly well given its age; it was well-designed for the time and the core had good bones. The main issues are (a) capstone alignment with Month 3, (b) industry-vertical churn, (c) missing April 2026 landscape items (Vercel AI SDK v5, Claude Agent SDK + MCP, browser agents, voice agents), and (d) the prescribed-stack discipline.

**New doc target average:** ~22/24. Expected uplift from (a) capstone swap + new Month-3 coupling, (b) new lessons on voice + browser + ingestion + embeddings, (c) single-language stack, (d) UK case studies woven in every core lesson.

| Dimension | Old avg | New target |
|-----------|---------|-----------|
| Currency | 2.2 | 3.0 |
| Build intensity | 2.7 | 3.0 |
| Prescriptive-stack fit | 2.2 | 2.9 |
| UK applicability | 2.1 | 2.8 |
| Beginner-after-M1 accessibility | 2.5 | 2.8 |
| Capstone alignment | 2.0 | 2.8 |
| Stickiness | 2.6 | 2.9 |
| Evergreen vs churn | 2.1 | 2.8 |

**Overall uplift:** ~18.4 → ~22.0. Driven primarily by (i) the capstone swap, (ii) the big-labs-only rule, (iii) moving industry verticals out of core into refreshable Labs/Optionals, and (iv) adding L6/L7/L12/L13 to fill April 2026 gaps.

---

## Migration plan (for the syllabus.json pipeline)

When applying this to `syllabus.json`:

1. **Create new records** for L6, L7, L12, L13 (new lessons with no predecessor).
2. **Update in place** for L1, L2, L3, L5, L8, L11, L14, L15 (strong lessons that survive with refresh).
3. **Merge records** for L10 (absorbs Advanced Full-Stack + current L23 Business Tool subtopics), L18 (absorbs PDF + Auth + deploy from multiple sources).
4. **Split** current L33 (Capstone) into new L16, L17, L18, L19.
5. **Demote** the 15 Week-0 industry lessons to an Optional table with status=optional and a separate lifecycle.
6. **Drop** current L18 (When to Use Which Language) as a standalone; fold as sub-topic in new L2.

All IDs should be preserved where possible to maintain pipeline continuity.
