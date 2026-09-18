# Month 3 Lesson Ideas — Leading AI in Your Company

*Generated 2026-04-20. Revised 2026-04-21. Sources (deliberately diversified): **McKinsey** (Rewired 2nd ed; AI Transformation Manifesto; State of AI Trust 2026) — used for structure where it's genuinely the best source, but **triangulated with BCG** (Build for the Future 2026; CEO AI Agenda), **PwC** (2026 AI Performance Study; UK AI Jobs Barometer), **Deloitte** (State of AI in Enterprise 2026, 3,235 leaders surveyed), **KPMG** (2026 Global Tech Report; 2025/26 CEO Outlook), **Accenture** (Technology Vision 2026), **IDC** (Worldwide AI Spending Guide), **Gartner** (AI Maturity Model; Hype Cycle), **Stanford AI Index 2026**, **MIT Sloan Review** (AI transformation research), **Harvard Business Review** (Iansiti & Lakhani, *Competing in the Age of AI*), **World Economic Forum** (Future of Jobs 2026), **Microsoft Work Trend Index 2026**, **a16z** (Sivulka, "Institutional AI vs Individual AI"), **Ramp** (Goddijn/Glyman on Glass), **Ethan Mollick** (Leadership/Lab/Crowd), **DBS Bank** (PURE framework), **Vercel Open Agents**, **Azeem Azhar** (Exponential View), and the UK-specific landscape below.*

*UK-specific sources:* UK AI Opportunities Action Plan (Clifford, Jan 2025) + delivery tracker, Bank of England AI strategy + FPC record, FCA/ICO/CMA/AISI guidance, techUK + British Chambers of Commerce 2026 surveys, HSBC UK £105bn opportunity research, CIPD 2026 labour-market reports, ICAEW AI audit guidance, Lloyd's of London AI coverage briefs, NHS AI adoption research, Ofcom adults' media use, and UK company cases: Lloyds / HSBC / NatWest / Barclays, Tesco / M&S / Ocado, Octopus Energy Kraken, JLR, Rolls-Royce, British Airways / IAG, BT / Openreach, Starling / Monzo / Revolut, UK civil service Humphrey suite.

### Revision log

- **2026-04-23 (afternoon)** — **BBC / Sunak "fewer jobs for young people" woven in.** Faisal Islam's BBC interview with Rishi Sunak (former UK PM, now adviser to Anthropic, Microsoft and Goldman Sachs; founder of the UK AI Safety Summit 2023 and the AI Security Institute), 23 Apr 2026, added to: L1 (*"flat is the new up"* as the CEO-intent corollary of the 20/75 Rule), L13 (Sunak's named flattening of law/accountancy/creative hiring + his proposed fiscal response — abolish NI, tax AI-boosted corporate profits), L15 (Sunak's *"we shouldn't rely on companies to mark their own homework"* as the UK governance line endorsing AISI's independent role; AISI named in-lesson), and UK sources. Gives M3 leaders political-level UK cover for the distribution and reskilling arguments already in the curriculum.
- **2026-04-23 (morning)** — **FT/Focaldata "AI workforce divide" woven into the leadership argument.** Added the first release of the FT/Focaldata Workforce AI Tracker (Murgia & Burn-Murdoch, 23 Apr 2026; UK n=2,365 / US n=1,754) to: L1 (the 20/75 Rule — company-level divide now paired with the individual-level 60%/16% divide), L13 (Agentic Talent — the FT "bottom of the career pyramid erodes" warning becomes the ethical pivot of the lesson), L15 (Right to Deploy — Acemoglu's inequality quote becomes part of the governance case for "AI for everyone in the firm, not just the top decile"). Quotes added from Acemoglu (MIT), Pissarides (LSE), Chatterji (OpenAI), Frey (Oxford Internet Institute). Source ingested to the vector DB.
- **2026-04-21** —
  - **Source diversification.** Intro and lesson-level references rebalanced to reduce over-reliance on McKinsey's *Rewired* and *Manifesto*. Rewired remains the structural spine where no peer source is clearer (ch. 3, 4, 5, 29, 30, 32, 34, 35), but every anchor claim is now paired with a BCG, PwC, Deloitte, KPMG, MIT Sloan, HBR, Stanford AI Index, or UK-regulator corroboration. The goal: students see a body of evidence, not a book summary.
  - **"The 20 lessons at a glance"** summary table added (parity with Month 1).
  - **Audience broadened.** Individuals and SMEs remain the primary audience; larger organisations are attracted through the **bespoke-lesson service** — one custom Month 3 lesson per 100 enrolled students from a single company.
  - **Optional lessons (10–15)** section added — cutting-edge, small-audience, or niche lessons held outside the core 20 for planning purposes.
  - **Lab ideas** section added — head-to-head governance/framework/case-study comparisons we decided *not* to bake into core lessons because they go stale or are too specialised.

*Research library: [`month-3-research/`](month-3-research/) · Book notes: [`rewired-book-notes/`](rewired-book-notes/) · UK landscape: [`month-3-research/12-uk-ai-landscape.md`](month-3-research/12-uk-ai-landscape.md) · UK case studies: [`month-3-research/13-uk-company-case-studies.md`](month-3-research/13-uk-company-case-studies.md)*

**Why UK additions?** The core argument of Month 3 is global, but GWTH participants are majority UK SMEs. Every non-UK data point below is paired with a UK equivalent so students can benchmark against domestic peers, cite UK regulators, and point to British case studies their teams can read, visit, or hire from. Nothing US or global is removed — the comparison is deliberately maintained so students can see how the UK is and isn't different.

---

## Month mapping recap

- **Month 1 — AI for Your Life** — foundations, first builds, automations for yourself.
- **Month 2 — AI for Your Industry** — production apps: pipelines, data, integrations.
- **Month 3 — AI for Your Company** — leadership, strategy, org-design, governance, culture. *Majority strategy, but with one Capstone build and four weekly mini-builds that produce concrete tools students can take back to their team.*

Month 3 is for the students who've finished Month 2 with working apps and now need to take AI back to their team, department, or company. The question moves from *"how do I use AI?"* to *"how do I get my team to use AI well?"* — and critically, *"what can I build that makes this transformation easier?"*

**Audience.** The core GWTH audience in Month 3 is **individuals with leadership intent** (exec-team members, founders, department heads, senior practitioners in SMEs) and **leaders of UK small and mid-sized companies** — the population the BCC's 54%/11% gap actually describes. GWTH is not restricted to this audience. **Larger organisations (FTSE 250+, public sector at scale, multinationals)** are served through the **bespoke-lesson service — one custom Month 3 lesson built for every 100 students a single company enrols**. That service is how enterprise L&D plugs into GWTH without forcing the core curriculum to be pitched at a CIO-of-a-bank level. Month 3 lessons therefore default to the language and numbers an SME leader can act on in 90 days (and then the bespoke module, where commissioned, tunes the same frameworks to the larger-scale reality).

## Build projects in Month 3

Month 3 is mostly strategy, but strategy lessons produce artefacts. **We turn those artefacts into working tools.** Four weekly mini-builds and one Capstone give students something to *ship*, not just something to plan:

- **Week 9:** AI Maturity Scorecard Web App
- **Week 10:** Domain Discovery Assistant
- **Week 11:** Right-to-Deploy Template Generator
- **Week 12:** Internal AI Skills Library ("Dojo clone")
- **Capstone (spans the month, presented end of Week 12):** **AI Readiness Assessment Tool** — a working SaaS that evaluates any business's AI maturity across the six capabilities, 12 themes and seven pillars, and produces an actionable transformation roadmap.

See the [Build Projects](#build-projects--mini-builds--capstone) section after Week 12 for full specs. Every build is designed to be:
- Buildable in 1–2 evenings for the mini-builds, ~10–15 hours for the Capstone.
- Portfolio-quality — live URLs the student can show a prospective client, employer, or their own leadership team.
- Reusable — they produce the exact artefacts the strategy lessons ask for (scorecards, domain maps, right-to-deploy gates, skill libraries, 90-day plans), but on demand and without manual work.

## Throughline — the core argument for Month 3

The PwC 2026 study found **20% of companies are capturing 74% of AI's economic value** — and they are 7.2× more productive than the average competitor. These leaders are doing things *fundamentally* differently. They treat AI as a **growth** lever (not a productivity one), they build **institutional systems** around individual AI use, and they **raise the floor** rather than lowering the ceiling. Month 3 is the bridge from the individual AI productivity the student has already earned, to institutional AI value in the company they lead.

**UK framing.** The British Chambers of Commerce (March 2026) found **54% of UK firms are actively using AI** — but only **11% deeply** (structured workflows, training, measurement). HSBC UK estimates **£105bn in additional revenue** is available to UK mid-sized firms alone by 2030 if they adopt AI meaningfully. The PwC UK AI Jobs Barometer shows productivity growth in AI-exposed UK industries (financial services, IT, professional services) has **nearly quadrupled** (7% → 27%) since 2022. The UK's **AI Opportunities Action Plan** (Matt Clifford, Jan 2025) — all 50 recommendations endorsed — is the domestic analogue of McKinsey's manifesto. The upside is real; the gap is wide; the clock is ticking.

## The GWTH training recommendation, woven into every lesson

Every lesson ends with a **"Bring your team along"** prompt. The argument is consistent: *you cannot outsource this transformation; your team must build the capability in-house; [GWTH.ai](https://gwth.ai) is the fastest way to upskill the 70% in-house talent McKinsey says you need.* The closing lesson (L20) makes this an explicit CTA. Soft-sell throughout; hard-sell at the end.

---

## The 20 lessons at a glance

| # | Lesson | Primary frame | Week | Build link |
|---|--------|---------------|------|------------|
| L1 | The 20/75 Rule — Why Most Companies Are Already Losing the AI Race | Strategy / Economics | 9 | — |
| L2 | The AI Transformation Manifesto — 12 Themes (with BCG/Deloitte corroboration) | Strategy | 9 | 🔨 Mini-Build 1 anchor |
| L3 | Growth, Not Productivity — Reframing What AI Is For | Strategy | 9 | — |
| L4 | The Economics of AI Transformation | Strategy / Finance | 9 | — |
| L5 | Find Your Economic Leverage Points | Strategy / Domain | 9 | 🔨 Mini-Build 2 anchor |
| L6 | Domains, Not Use Cases — The Unit of AI Transformation | Operating Model | 10 | — |
| L7 | Business Leaders Lead the Reimagination | Leadership | 10 | — |
| L8 | Reimagining Workflows With Agents — Humans + AI, Not Humans vs AI | Operating Model | 10 | — |
| L9 | Institutional AI vs Individual AI — The 10× Paradox | Strategy / Frame | 10 | — |
| L10 | Harness Engineering at Organisational Scale — Ramp Glass | Tech / Operating Model | 10 | 🔨 Mini-Build 4 anchor |
| L11 | Tech Muscle for Business Leaders — From Awareness to Operating Fluency | Leadership / Talent | 11 | — |
| L12 | The 30/70 Rule — Why AI Transformation Must Be In-House | Talent | 11 | — |
| L13 | The Agentic Talent Model — When Agents Join the Team | Talent / Org | 11 | — |
| L14 | Your Proprietary Data Advantage — Building an AI-Era Moat | Data / Moat | 11 | — |
| L15 | Risk, Trust & the Right to Deploy AI | Governance | 11 | 🔨 Mini-Build 3 anchor |
| L16 | Make Adoption Stick — It's a Redesign Problem, Not a Training Problem | Adoption | 12 | — |
| L17 | Tracking Impact — Measuring What Actually Matters | Measurement | 12 | — |
| L18 | Plan for Midstream Adjustments — When (and How) to Pivot | Execution | 12 | — |
| L19 | Culture — The Quiet Prerequisite | Culture | 12 | — |
| L20 | Your 90-Day Plan — Train Your Team, Start Your Transformation | Synthesis / CTA | 12 | Capstone presentation |

**Build layer.** 4 mini-builds (anchored to L2, L5, L15, L10) + 1 Capstone (AI Readiness Assessment Tool, spanning the month) sit alongside the strategy lessons. See [Build Projects](#build-projects--mini-builds--capstone) below.

---

## Week 9 — Why AI Leaders Win: Strategy & Economics

**Arc:** The gap is real. It is structural, not tooling. The leaders think about AI as growth, not efficiency. The economics justify the investment.

### L1. The 20/75 Rule — Why Most Companies Are Already Losing the AI Race

**Description:** The PwC 2026 AI Performance Study of 1,217 executives across 25 sectors found that 20% of companies are capturing 74% of AI's economic value — and generating 7.2× more AI-driven revenue than the average competitor. This lesson unpacks what separates the 20% from the 80% (it isn't more tools) and asks participants where they currently sit.

**Key concepts:** 20/75 rule · leaders vs laggards · the widening gap · why tool quantity doesn't correlate with value.

**Project / activity:** Self-diagnostic — participants rate their own org 1–5 on five PwC dimensions (growth vs productivity framing, autonomous deployment, responsible AI framework, governance board, business-reinvention ambition). Produces a one-page *"Where are we on the AI maturity curve?"* artefact they can take to their leadership team.

**Bring your team along:** A one-page brief leaders can email to their team titled *"Why we need to get serious about AI now"*, citing the PwC finding.

**UK context:** The British Chambers of Commerce's March 2026 survey shows **54% of UK firms using AI** (up from 25% in 2024) — but only **11% of UK SMEs use AI to a great extent** to streamline operations. Top UK adopter sectors: IT & telecoms (56%), media/marketing (53%). Laggards: real estate (11%), transport (15%), hospitality (18%), manufacturing (19%), retail (19%). **HSBC UK** estimates AI adoption could unlock **£105bn in additional revenue for UK mid-sized firms by 2030** — a UK-scale answer to PwC's global 20/74 finding. The UK version of the diagnostic question is sharper: *we know the upside — are we capturing it, or sitting on the £105bn?*

**The 20/75 Rule has a human counterpart.** The **FT/Focaldata Workforce AI Tracker** (Murgia & Burn-Murdoch, 23 April 2026; UK n=2,365 / US n=1,754) found that **more than 60% of top-10% earners use AI daily vs only 16% of the bottom 10%** — the same concentration pattern that PwC documents at the company level shows up, even more sharply, at the individual level *inside* companies. **Daron Acemoglu (MIT Nobel laureate)**: *"AI is going to increase inequality between labour and capital. That is almost for sure."* For the Month 3 leader this is the critical corollary of the 20/75 Rule: being in the top-20% of companies *and* having the AI value concentrated in the top 10% of *your own* employees is the default path. If you don't actively push AI down the pay distribution in your firm, you will replicate the FT's divide inside your walls — which is both a moral and a commercial problem (the 1-to-9 pay decile is often where your service quality, customer handoff, and repeat-purchase outcomes actually live).

**"Flat is the new up" — the UK CEO consensus that turns 20/75 into a hiring plan.** On the same day the FT published its divide data, former UK PM **Rishi Sunak** told the BBC (Faisal Islam, 23 April 2026) what UK CEOs are saying to him privately: *"They're talking about this concept that they think they can continue to grow their businesses without having to significantly increase employment because they're starting to see how they can deploy AI."* The phrase — *"flat is the new up"* — is the 2026 CEO-intent corollary of the 20/75 Rule. The top-quintile company expects top-line growth *without* headcount growth. For the Month 3 participant, that is the fork in the road: **if you are a leader of a top-20% AI firm, your next strategic decision is not "how many people do I hire?" but "how do I *reshape* the team I already have?"** Sunak adds the UK political framing that follows: *"We should be thinking about how do we tip the balance in favour of AI being used in that positive way to help people do their jobs better [rather than replacing them]."* That reshape-not-replace framing becomes the tone the rest of Month 3 uses for every talent and operating-model decision (picked up again in L13).

**Research:** [02-pwc-ai-leaders-study.md](month-3-research/02-pwc-ai-leaders-study.md), [11-podcast-transcript-summary.md](month-3-research/11-podcast-transcript-summary.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md), FT/Focaldata Workforce AI Tracker (23 Apr 2026).

---

### L2. The 12 Themes of AI Transformation — A Triangulated Framework

**Description:** In April 2026 McKinsey published "The AI Transformation Manifesto" — 12 themes distilled from hundreds of engagements that separate AI leaders from laggards. This lesson uses those 12 themes as a **checklist and rubric**, but deliberately corroborates each with a peer source so students graduate with a body of evidence rather than a single firm's view. The peer anchors for each theme: **BCG's *Build for the Future 2026*** (the 8 Capabilities of AI Leaders), **Deloitte's *State of AI in Enterprise 2026*** (3,235 leaders surveyed), **KPMG's *2026 Global Tech Report*** (88% agent embedding), **PwC's 2026 AI Performance Study** (20/74 rule), and **Iansiti & Lakhani's *Competing in the Age of AI*** (HBR, for the operating-model themes). Where the 12 themes and the peer research diverge, we flag the disagreement and let students draw their own conclusion. It is the structural spine of the rest of Month 3 — but it is not gospel.

**Key concepts:** enduring capabilities · economic leverage points · 20% EBITDA uplift · 30/70 talent · metabolic rate · right to deploy · agentic engineering · continuous re-learning · **evidence triangulation** (i.e. how to cite more than one source for any claim).

**Project / activity:** 12-theme scorecard. Participants rate their org 1–5 on each theme and identify their three lowest scores — those become the 90-day priorities in L20.

**Bring your team along:** Share the scorecard with two colleagues. Compare scores. Where do you agree? Where do your perspectives diverge?

**UK context:** The **UK AI Opportunities Action Plan** (Matt Clifford review, Jan 2025) is the UK-government analogue of McKinsey's 12 themes. Its framing — *"AI maker, not just an AI taker"* — rhymes with Theme 1 (enduring capabilities) and Theme 7 (platforms as strategic assets). All **50 recommendations** have been endorsed by government, with most immediate steps scheduled within 12 months. KPMG's 2026 Global Tech Report (UK-led): **88% of organisations embedding AI agents** into workflows; **71% of CEOs** make AI a top investment priority. These are not US-only numbers — the manifesto's themes map directly onto the UK's own strategic map.

**🔨 Build link:** This lesson anchors **Mini-Build 1 — AI Maturity Scorecard Web App**. Students implement the 12-theme + PwC-leader rubric as a working web form that returns a radar chart and a one-page PDF. Details in the [Build Projects](#build-projects--mini-builds--capstone) section.

**Peer sources to cite alongside the 12 themes (teach students to triangulate):**
- **BCG *Build for the Future 2026*** — the 8 Capabilities of AI Leaders (Strategy, Digital platforms, Data architecture, People, Processes, AI & Analytics, Ways of working, Ecosystems). Overlaps ~70% with the McKinsey 12.
- **Deloitte *State of AI in Enterprise 2026*** (3,235 leaders) — the agentic-AI adoption curve, scaling barriers, realised value breakdown. Empirical counterpart to the McKinsey 12.
- **KPMG *2026 Global Tech Report*** — 88% agent embedding, 71% CEO investment priority; complements McKinsey's "agentic engineering" theme.
- **Iansiti & Lakhani, *Competing in the Age of AI*** (HBR Press, 2020; still the cleanest academic statement of AI-era operating models).
- **Accenture *Technology Vision 2026*** — the "cognitive digital brain" framing; good complement to McKinsey's "enduring capabilities."
- **MIT Sloan Review** — 2025-26 AI transformation research series (Ransbotham, Kiron et al.).

**Research:** [01-mckinsey-manifesto.md](month-3-research/01-mckinsey-manifesto.md), [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md). *Students reading only `01-mckinsey-manifesto.md` should then read the BCG / Deloitte / KPMG executive summaries linked in the Sources section.*

---

### L3. Growth, Not Productivity — Reframing What AI Is For

**Description:** The most counterintuitive finding of the PwC and McKinsey 2026 work: AI leaders are 2.6× more likely to use AI to *reinvent their business model*, not just to save time. This lesson challenges the default "productivity pilot" mental model and gives participants a vocabulary for growth-framed AI conversations with their boards and teams.

**Key concepts:** productivity trap · growth flywheels · business-model reinvention · new-revenue thesis · PwC 2.6× reinvention ratio.

**Project / activity:** *Growth Thesis Canvas* — a one-page template. Participants identify: (a) one new product or service AI could enable, (b) one customer they couldn't previously serve, (c) one margin-expanding move. Write it as a paragraph a CEO could read in 30 seconds.

**Bring your team along:** Run the same canvas with two other members of your leadership team. Compare.

**UK context:** **Lloyds Banking Group** is the UK's clearest "growth-over-productivity" trajectory: **£50m of AI value in 2025 → £100m+ expected in 2026** (part of a **$5bn digital transformation** envelope), with the agentic AI financial assistant rolling out to **21m customer accounts**. **Tesco** is tracking **£500m of FY2026 productivity savings** alongside **£1.5bn of digital capex** — framed as growth (higher on-shelf availability, new micro-fulfilment formats, Whoosh expansion) not just cost-cut. UK CEOs agree: **79% of CEOs** in KPMG's 2025 survey say AI has made them rethink how they train and develop employees — a structural reinvention signal, not a productivity one.

**Research:** [02-pwc-ai-leaders-study.md](month-3-research/02-pwc-ai-leaders-study.md), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L4. The Economics of AI Transformation

**Description:** The economic case for AI transformation from *three independent data sets*: **McKinsey Rewired 2nd ed** (20% EBITDA uplift, 1–2 year payback, $3:$1 incremental EBITDA), **BCG's CEO AI Agenda 2026** (top-quartile adopters 2.1× ROIC vs peers), and **IDC's *Worldwide AI Spending Guide 2026*** (global AI spend $632B in 2026, 27.7% CAGR through 2028). The **Stanford AI Index 2026** adds the inference-cost curve (cost per million tokens down ~80% year-on-year for frontier models). **Gartner's 2026 Hype Cycle** flags the trough expectation most SME leaders haven't priced in. This lesson translates these numbers into an SME-scale investment case participants can actually write and defend. Covers the 1:1 investment rule ($1 on adoption for every $1 on build), unit economics of inference, and the (often-overlooked) **cost of *not* investing** — computed using BCG's Digital Acceleration Index.

**Key concepts:** unit economics · 1:1 adoption investment rule · value-at-stake · payback curves · inference cost curves · **evidence across three firms** (McKinsey / BCG / IDC) · cost of inaction.

**Project / activity:** *AI Business Case One-Pager* template. Participants size one AI initiative: cost, timeline, expected value, payback. Must include a line for adoption investment.

**Bring your team along:** Present the one-pager to a finance-minded colleague. Stress-test the assumptions.

**UK context:** The **Bank of England** projects generative AI could deliver **productivity gains of up to 30%** to UK banking, insurance and capital markets over 15 years — a number UK leaders can cite to their own boards. Concrete UK case numbers to benchmark against: **Lloyds £100m+ value in 2026** on a **$5bn digital investment envelope** (payback curve visible); **Tesco £500m FY2026 productivity** against **£1.5bn FY26 capex** (roughly 33% year-one return on the capex). The 1:1 adoption rule applies in the UK too — Lloyds' explicit **AI Academy** for **200 senior executives** *is* the adoption leg of the £100m+ build.

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 2), [01-mckinsey-manifesto.md](month-3-research/01-mckinsey-manifesto.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L5. Find Your Economic Leverage Points

**Description:** McKinsey: *"Any business model has a few key economic leverage points that provide the biggest impact when improved with AI."* Toyota's leverage point is supply-chain integration; LATAM's is customer experience; DBS's is customer-journey embedding. This lesson teaches the diagnostic — how to identify *your* 3–5 leverage points, not boil the ocean with a portfolio of 30 pilots.

**Key concepts:** leverage-point diagnostic · domain vs use-case (preview of L6) · sequencing · the "three big rocks" rule.

**Project / activity:** Draw the participant's company's value chain on one page. Mark the 3–5 places where a 10% improvement would cascade. Rank them by feasibility × impact.

**Bring your team along:** Share the map with operating peers. Ask: *do you agree these are our leverage points?* If not, why?

**🔨 Build link:** This lesson anchors **Mini-Build 2 — Domain Discovery Assistant**. Students build a conversational LLM tool that interviews a user about their business and returns a prioritised domain map — the exact artefact this lesson asks for, but generated in 10 minutes instead of a 2-hour workshop. Details in the [Build Projects](#build-projects--mini-builds--capstone) section.

**UK context:** UK exemplars of leverage-point thinking, per industry:
- **Manufacturing (Toyota parallel):** **Jaguar Land Rover** — leverage point is the supply chain + connected vehicle. 2.5TB of data/day, 500k ECU updates/month, from 2026 NVIDIA DRIVE AGX in every new Range Rover, Defender, Discovery, Jaguar. Private 5G + AI smart manufacturing with Ericsson.
- **Grocery/logistics (no direct Rewired case):** **Ocado** — leverage point is the automated warehouse. 100+ AI applications embedded end-to-end; robot fleet with AI "air traffic control" (10 comms/sec per bot).
- **Aviation (LATAM parallel):** **British Airways / IAG** — leverage point is ops reliability. Heathrow 86% on-time departures (record) driven by ML landing-slot optimisation. **£100m biometric + AI investment.**
- **Engineering (Freeport-McMoRan parallel):** **Rolls-Royce R² Data Labs** — 30 years of data-led services, turned into the "IntelligentEngine" product proposition.

**Research:** [01-mckinsey-manifesto.md](month-3-research/01-mckinsey-manifesto.md), [07-dbs-bank-case-study.md](month-3-research/07-dbs-bank-case-study.md), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

## Week 10 — Domains, Workflows & the Operating Model

**Arc:** The unit of transformation is a domain, not a use case. Business leaders own the redesign, not IT. Workflows must be reimagined around humans + agents. Institutional AI is the point, and it looks like Ramp's Glass.

### L6. Domains, Not Use Cases — The Unit of AI Transformation

**Description:** The defining argument of the operating-model shift: use-case-hunting produces a portfolio of disconnected pilots; domain work produces sequenced, cumulative value. A "domain" is a customer journey, a process, or a product line. A "use case" is a feature. **Rewired Ch 3** (expanded) is the canonical statement, but the same conclusion is reached independently by **Iansiti & Lakhani** (HBR, *Competing in the Age of AI* — the "AI factory" is domain-shaped), **MIT Sloan Review's 2025 "Achieving Individual and Organizational AI Value"**, and **BCG's Build for the Future 2026** (capability 5: Processes — explicitly rejects feature-level framing). This is the chapter that most contradicts what SME companies actually do.

**Key concepts:** domain · use-case-hunting as anti-pattern · domain prioritisation · the "reimagine" vs "automate" distinction.

**Project / activity:** List the three AI "use cases" already underway in the participant's org. Re-frame them as one or two *domains*. If you can't, that's the signal.

**Bring your team along:** Bring the re-framing to your next exec meeting. Propose that the team commits to *domains* going forward, not *use cases*.

**UK context:** **British Airways / IAG** is a *worked example* of the use-case-to-domain pivot. The group mapped **600 AI use cases** in value-mapping exercises, then consolidated into a focused AI strategy that went live in **January 2026** — a concrete, recent, British transition from use-case-hunting to domain-led. The mapping exercise wasn't wasted; it was the diagnostic that told them which domains mattered. Contrast with the **UK public sector's** experience: Appian research (2026) found that nearly half of UK public-sector AI initiatives are deployed as "bolt-on" standalone tools rather than integrated into workflows — use-case-hunting at scale, without the domain pivot.

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 3, Ch 4), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L7. Business Leaders Lead the Reimagination

**Description:** Rewired Ch 4: the business leader — not the CIO — owns the redesign of their domain. IT cannot lead the rethink because the rethink is about the business model, not the tech. This lesson is where participants realise *they* are the leader Rewired is talking about, and it's not a book about engineers.

**Key concepts:** domain ownership · the reimagination ≠ the implementation · decision rights · time investment (how many hours a week are you giving this?).

**Project / activity:** Time-audit. For one week, log hours spent on AI / tech / AI-affected domain work. Most participants will discover <5%. Target: 20%+ of leadership time.

**Bring your team along:** Invite one business leader peer to do the same time audit. Compare.

**UK context:** UK banking has moved as a cohort on this in 2026: **HSBC promoted David Rice as its first Chief AI Officer** (from COO of corporate & institutional banking). **Lloyds, Barclays, and NatWest** all expanded their AI leadership structures in the same window. **IAG** appointed **Dr Ben Dias as Chief AI Scientist**. The UK norm is now: a named C-level owner of AI, drawn from the business (not only from IT). The signal for SME leaders: the top of the UK corporate sector has already accepted that business leaders lead AI. If your exec team doesn't have that ownership, you're behind your UK peers.

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 4), [08-ethan-mollick-leadership.md](month-3-research/08-ethan-mollick-leadership.md), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L8. Reimagining Workflows With Agents — Humans + AI, Not Humans vs AI

**Description:** Agentic AI as a workflow-design primitive, not a feature. The lesson teaches a pattern language — "what part is the agent? what part is the human? what's the handoff?" — and the difference between bolt-on automation (decorated workflow) and reimagination (redesigned workflow). Evidence base: **Rewired Ch 5** (the "reimagine" framing), **Microsoft's *Work Trend Index 2026*** (the agentic-workflow patterns emerging in customer data), **Anthropic's Economic Index** (what Claude is actually being used for — task-level aggregate data), **OpenAI's "A Practical Guide to Building Agents"** (the pattern primitives: retrieval, tool use, verification, multi-step), and **Harvard Business Review's April 2026 agentic-workflow special issue**. The aim is not to teach students to *build* agents (Month 2) but to *design around* them.

**Key concepts:** human–agent workflow · handoffs · bolt-on vs reimagined · agentic patterns (retrieval, tool use, verification) at the workflow level.

**Project / activity:** Pick one process in the participant's company. Redesign it as a human-+-agent workflow on one page: what agents do, what humans do, where they hand off, what evidence triggers escalation.

**Bring your team along:** Walk the redesigned workflow through the team who currently run it. Capture their reactions — especially the objections. Those are the seeds of the real design.

**UK context:** UK-native worked examples of workflow reimagination:
- **Starling Bank** — AI-generated chat summaries save **8,000 staff-hours per month** (admin time liberated, not eliminated). Agentic 'assistant' on Google Gemini for personalised customer insights.
- **Monzo** — **42% of simpler customer queries** now resolved by the customer themselves via AI self-service.
- **Openreach (BT)** — redesigned **15 million customer journeys** during the UK's biggest fibre rollout using NiCE Cognigy proactive AI agents.
- **UK Civil Service** — **Humphrey** suite (Consult, Parlex, Minute, Lex, Redbox) built in-house by i.AI; redesigns consultation analysis, Hansard search, meeting minutes, legal research, and policy drafting as human-agent workflows.
- **NatWest Cora+** — enhanced GenAI chatbot: **150% increase in customer satisfaction scores**.

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 5, Ch 22), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L9. Institutional AI vs Individual AI — The 10× Paradox

**Description:** George Sivulka's thesis (a16z, Mar 2026): individual AI has made every worker 10× more productive, but no company has become 10× more valuable. The difference is *institutional AI* — coordination, signal, edge, objectivity. Sivulka's seven pillars give a diagnostic that every participant can run against their own org. This is the single most important frame-shift in Month 3.

**Key concepts:** institutional vs individual AI · seven pillars (coordination, signal, bias, edge, outcomes, enablement, unprompted) · the electricity analogy (1890s textile mills) · why individual productivity without coordination = chaos.

**Project / activity:** Seven-pillar scorecard. Rate the org 1–5 on each pillar. The lowest score is where institutional AI investment should go first.

**Bring your team along:** Read Sivulka's essay with your senior team. Debate. Where do you agree? Where are you overclaiming?

**UK context:** **Azeem Azhar** is the UK thought-leader equivalent to Ethan Mollick on this territory — founder of **Exponential View** (newsletter + HBR podcast + Bloomberg Originals *Exponentially*). Merton College, Oxford; ex-Guardian tech correspondent. Regularly in dialogue with Mollick and Sivulka on the same coordination-over-chaos argument, framed through a UK/European lens. Pair Sivulka's essay with an Exponential View episode for the course reading list. The empirical UK angle: **techUK's 2026 research** with Public First surveyed 500 UK business leaders and found a *"confidence gap"* between government AI rhetoric and operating reality — the same individual-versus-institutional gap Sivulka names, visible at national scale.

**Research:** [03-institutional-vs-individual-ai.md](month-3-research/03-institutional-vs-individual-ai.md), [11-podcast-transcript-summary.md](month-3-research/11-podcast-transcript-summary.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md).

---

### L10. Harness Engineering at Organisational Scale — The Ramp Glass Case Study

**Description:** The showcase lesson of Month 3. Ramp's Glass is the clearest public example of an organisation building "institutional AI" in 2026. Seb Goddijn's principles — *don't limit anyone's upside, one person's breakthrough is everyone's baseline, the product is the enablement, everything connects on day one* — are a takeaway design doc for any company. The lesson also covers the Dojo skills marketplace and Sensei guidance engine.

**Key concepts:** harness engineering · raise the floor vs lower the ceiling · skills library · agent memory · internal productivity as moat · buy vs build.

**Project / activity:** *"What would a Glass look like at our company?"* one-pager. What are the five most-used workflows? What integrations matter? Who's the first 10 users? Build vs buy vs fork (e.g. Vercel's Open Agents)?

**Bring your team along:** Identify one "power user" inside your company. Interview them. What have they figured out that no one else has? That's your first Dojo skill.

**🔨 Build link:** This lesson anchors **Mini-Build 4 — Internal AI Skills Library ("Dojo clone")**. Students build a lightweight internal Dojo for their own team: a skills marketplace with submission, vector search, and a Sensei recommendation engine. Modelled on Ramp's Dojo, sized for SMEs. Details in the [Build Projects](#build-projects--mini-builds--capstone) section.

**UK context:** The UK's best equivalent to Ramp Glass is **Kraken (Octopus Energy)** — an internal AI/automation platform built to run Octopus's own utility operations, now licensed to **over 70M accounts worldwide** (EDF, E.ON, Origin, Good Energy, Plenitude/Eni, Severn Trent) and spun out in Dec 2025 at a **$8.65bn valuation** with a **$1bn raise**. Kraken processes **15 billion data points per day**. The internal harness became the moat and — eventually — the entire business. This is the clearest British validation of Seb Goddijn's thesis: *internal AI infrastructure is a moat, and you don't hand your moat to a vendor.* Other UK harness examples to reference:
- **Ocado Smart Platform** — AI "air traffic control" talking to every bot 10 times/second; 3,000+ patents; 100+ AI applications; MODEX 2026 launch of **Ocado IQ** cloud platform.
- **IAG.ai labs** (London + Barcelona) — in-house designed **Engine Optimisation System**.
- **Humphrey** (UK civil service) — built by i.AI in-house, not bought.

**Research:** [05-harness-engineering-ramp-glass.md](month-3-research/05-harness-engineering-ramp-glass.md), [06-open-agents-vercel.md](month-3-research/06-open-agents-vercel.md), [11-podcast-transcript-summary.md](month-3-research/11-podcast-transcript-summary.md), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

## Week 11 — Talent, Data & Your Moat

**Arc:** You cannot outsource this. 70% of talent must be in-house. Business leaders need tech muscle. Your proprietary data is your moat. Governance isn't a brake; it's a growth engine.

### L11. Tech Muscle for Business Leaders — From Awareness to Operating Fluency

**Description:** Awareness is reading the newsletter. Muscle is knowing enough about the tech to make credible decisions and to push back on bad ones. This lesson draws on **Rewired Ch 8** for the "awareness → muscle" framing but adds the **World Economic Forum *Future of Jobs 2026*** skills taxonomy (what specifically to build), **LinkedIn's UK Skills on the Rise 2026** (the fastest-growing skills UK employers are actually paying for), **KPMG's CEO Outlook** (79% of CEOs rethinking training), and **CIPD's *AI at Work 2026*** (what HR and L&D in the UK are actually funding). It maps a development path for non-technical leaders: what to learn, in what order, to a level that lets you lead domain redesign credibly. It's also the most direct argument for personal time investment (and for training the rest of the exec team).

**Key concepts:** tech literacy vs tech muscle · competency framework for leaders · learning cadence · the peer network.

**Project / activity:** Personal AI-muscle development plan — a 12-week schedule with specific tools the participant will use, topics they will learn, and demos they will give to their own team.

**Bring your team along:** Propose that every member of your leadership team does the same personal plan. [GWTH.ai](https://gwth.ai) is the fastest off-the-shelf curriculum for this.

**UK context:** The UK reference model for this is **Lloyds Banking Group's AI Academy** — launched 2026 and already trained **200 senior executives** in AI fluency. Note: it's called an *Academy*, not a briefing or a workshop — the structural framing matches Rewired Ch 8 exactly (awareness → muscle). UK peer signal: **techUK research** finds **27% of non-tech businesses and 35% of tech businesses** name expanding AI training as the top skills-gap priority for 2026 — so the pressure is institutional, not just personal. For SME leaders without a Lloyds-scale budget, GWTH.ai is explicitly positioned as the SME equivalent to an internal academy.

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 8), [08-ethan-mollick-leadership.md](month-3-research/08-ethan-mollick-leadership.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L12. The 30/70 Rule — Why AI Transformation Must Be In-House

**Description:** The 70%-in-house argument has three independent endorsements — the lesson teaches all three so students see consensus, not a single-firm opinion. **McKinsey** (Rewired + Manifesto): 70%+ of AI talent should be in-house. **Ethan Mollick** (One Useful Thing, HBR): you cannot outsource AI transformation to consultants because AI is *organisational learning*, and learning can't be bought. **Iansiti & Lakhani** (HBR, *Competing in the Age of AI*): the AI factory sits inside the firm or it doesn't sit at all. **Deloitte *Human Capital Trends 2026*** provides the empirical backbone (scaled orgs outperform on retention + speed-to-value when ≥70% in-house). This lesson combines Mollick's **Leadership / Lab / Crowd** framework with the talent-ratio research and gives participants a concrete in-house-vs-consultant decision rubric.

**Key concepts:** 70/30 rule · Leadership / Lab / Crowd · consultant-as-enabler (not transformer) · the Lab charter · the Crowd's permission and time budget.

**Project / activity:** Map the org's current AI talent. Who's in-house? Who's a consultant? What's the ratio? What moves in the next 90 days would improve it?

**Bring your team along:** Show the map to HR and the CFO. The 30/70 ratio is as much a finance and HR conversation as a tech one.

**UK context:** The UK has explicit, quotable 70%-in-house examples:
- **IAG.ai labs** in London and Barcelona — an in-house AI Lab structure, not a consulting engagement. **100+ data scientists** across the group; **80 at British Airways alone**.
- **UK Civil Service Humphrey** — built **in-house by i.AI** (the government's own Incubator for Artificial Intelligence). The government *chose* to build rather than buy at national scale.
- **Kraken (Octopus Energy)** — 100% in-house origin before becoming a product.
- **Lloyds AI Academy** — explicitly about building internal capability, not importing it.
- **British Chambers of Commerce (April 2026)**: *"Britain's workforce is not ready for what is coming"* — the warning is specifically about the UK under-investing in internal capability. Use the BCC quote to validate the chapter's in-house argument.

**Research:** [08-ethan-mollick-leadership.md](month-3-research/08-ethan-mollick-leadership.md), [01-mckinsey-manifesto.md](month-3-research/01-mckinsey-manifesto.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L13. The Agentic Talent Model — When Agents Join the Team

**Description:** Rewired Ch 11 (new). Agents join teams as collaborators. The talent model has to describe new role shapes, new ratios, new performance measurement. If an agent is doing the junior analyst's work, what does the junior analyst do? (Answer: they supervise the agents — which is a different skill.) This lesson is deliberately forward-looking and flags that specific claims in this space will date fast.

**The career-pyramid erosion warning (FT/Focaldata, April 2026).** The single sharpest finding in the first FT/Focaldata AI Workforce Tracker release (Murgia & Burn-Murdoch, 23 April 2026) is *not* the income divide — it is the age and tenure distribution. **The heaviest users of AI at work are not the youngest employees, but workers in their 30s with existing tenure.** AI, in the current generation of tools, **complements proficiency** rather than substitutes for it. OpenAI's chief economist **Ronni Chatterji** confirmed in the FT piece that ChatGPT's own usage data shows AI *"allowing established experts to be more productive."* That sounds positive until you read the corollary the FT and its expert panel flagged: *"AI may erode the bottom of the career pyramid, with some work previously done by junior staff now performed by AI at the behest of senior workers, leaving new staff unable to build up skills and expertise."* Chatterji himself: *"We have to go back to the education system and think about how we're going to set up the sort of incentives for people to acquire that kind of expertise, critical thinking. You [need] the deep expertise versus being a substitute . . . where you're outsourcing the thinking to a machine."* For the Month 3 leader, this is the ethics-meets-operations question at the heart of the agentic talent model: **if AI eats your graduate roles, where does your senior talent pipeline come from in 2030?** No org chart that answers "we'll hire seniors from the market" survives a decade of that answer being given by every firm simultaneously.

**UK political confirmation.** On the same day the FT launched the tracker, former UK PM **Rishi Sunak** (now an adviser to Anthropic, Microsoft and Goldman Sachs) told the BBC (Faisal Islam, 23 April 2026) that AI is *"flattening the jobs market for young people"* — specifically in **law, accountancy and the creative industries**, exactly the service sectors where UK SME leaders recruit graduates. Sunak: *"There are reasons to be worried and think about the future. But we are able to do something about this."* His proposed national-level intervention — *abolish National Insurance over time, replace it with higher taxes on the corporate profits that AI is boosting* — is a policy statement, not an operating one, but the *firm-level* corollary is: **fund apprenticeships, agent-supervision roles, and paid AI-training sprints out of the productivity surplus AI gives you, because no one else is going to subsidise your talent pipeline.** That is the line a Month 3 leader can take straight to their CFO.

**Key concepts:** agents as team members · role redefinition · supervision as the new junior skill · performance measurement in mixed teams · org-chart implications · **career-pyramid erosion (FT 2026)** · the senior-talent-pipeline problem · AI complements proficiency (why experience now compounds faster, not slower).

**Project / activity:** Pick one team in the participant's org. Redesign its structure for a world where agents do 30–50% of the current junior work. What roles disappear? What roles emerge? **Extend the exercise:** write a one-paragraph "senior talent pipeline plan" — if agents do the work graduates used to do, where will your 2030 team leads come from? (Acceptable answers include: rotation programmes, apprenticeships, agent-supervision as a graduate role, reverse-mentoring, paid AI-training sprints. "We'll hire from the market" is disqualified.)

**Bring your team along:** Share the redesign with the team. Their reaction is data. (If they panic, you have a culture problem to address before you have a tech problem to solve.)

**UK context:** The UK has two contrasting 2026 case shapes for the agentic talent model:
- **Lloyds** — agentic AI rolling out to **21m customer accounts** in early 2026. The agents *augment*; staff are trained in the AI Academy to manage and supervise them. Growth story.
- **BT Group** — **up to 55,000 jobs** to be cut by 2030 (CEO warns the real number may be higher as AI matures). Openreach's **15M customer journey** redesign is happening in parallel with that workforce reduction. Cost-extraction story.
- **Barclays** — **Microsoft 365 Copilot to 100,000 employees** globally — a reshape-not-replace bet.

Use these three side-by-side to open the honest conversation participants are avoiding: *which version of the agentic talent model are we running?* The answer shapes every other decision.

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 11), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L14. Your Proprietary Data Advantage — Building an AI-Era Moat

**Description:** Rewired Ch 29 (new): when foundation models are a commodity, proprietary data is the durable competitive moat. This lesson defines "proprietary" (owned, exclusive, accumulating), walks through what counts and what doesn't, and gives participants a concrete 90-day move to start building their own advantage.

**Key concepts:** proprietary, exclusive, accumulating · data products · data as a long-term investment · the compounding asset.

**Project / activity:** *Proprietary Data Audit* — one page: what data do we already own that no one else has? What data *could* we own if we instrumented three processes differently? Which of those would matter?

**Bring your team along:** The audit is a cross-functional conversation (sales, ops, product, legal). Schedule the workshop.

**UK context:** The UK's biggest proprietary-data moats are visible in the numbers:
- **Ocado Group** — **3,000+ patents**, **100+ AI applications**, robot fleet "air traffic control" (10 comms/sec per bot), deployed in 120+ warehouses worldwide.
- **Kraken (Octopus Energy)** — **15 billion data points/day** from utility operations; 70M+ accounts under licensing. The data volume itself is the moat.
- **JLR** — **2.5TB of vehicle data per day**, **500,000 ECU updates/month**. Proprietary because it comes off a fleet no one else has.
- **Rolls-Royce R² Data Labs** — **30 years of data-led services** as the compounding asset, now packaged as the "IntelligentEngine" proposition.
- **DeepMind AlphaFold** — Nobel-prize-winning proprietary output that rewrote biology. UK-bred.

For SME students the lesson is: *your moat doesn't have to be 30 years of turbine telemetry. It might be the call transcripts you haven't been keeping, or the sign-off patterns your customers don't realise they follow.*

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 29), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L15. Risk, Trust & the Right to Deploy AI

**Description:** A solution doesn't ship by default; it must *earn* the right to ship. This lesson gives participants a concrete "right-to-deploy gate" checklist (model card, risk register, fairness review, monitoring plan, kill switch) drawing on multiple independent frameworks so the student isn't locked into any one. The anchors: **NIST AI Risk Management Framework (NIST AI RMF 1.0, 2023 + 2026 Generative AI Profile)** — the closest thing to an international standard for an AI risk register. **ISO/IEC 42001:2023** — the AI Management System standard; the audit benchmark UK SMEs will increasingly be asked about in procurement. **EU AI Act** (in force August 2026 for Article 50 disclosure) — UK-facing tools with EU customers must comply. **UK five cross-regulator principles** (DSIT-led: safety, transparency, fairness, accountability, contestability). **DBS Bank's PURE framework** (Purposeful, Unsurprising, Respectful, Explainable) — a four-word operational summary any SME can teach a team. **McKinsey's 2026 State of AI Trust** and **Rewired Ch 34** provide supporting commentary on governance as growth engine. Trust isn't a brake on adoption — the leaders with the strongest governance are also the most aggressive deployers.

**Key concepts:** right-to-deploy gate · PURE (Purposeful, Unsurprising, Respectful, Explainable) · bounded autonomy · the three failure modes of agentic AI · governance as growth engine.

**Project / activity:** Write a one-page "right to deploy" template the participant's org can adopt. Draft a PURE-style four-word test for their own customer data.

**Bring your team along:** Share with compliance, legal, IT security. The template is the conversation starter.

**🔨 Build link:** This lesson anchors **Mini-Build 3 — Right-to-Deploy Template Generator**. Students build a form-based tool that produces a full governance artefact pack (model card, risk register, fairness review, monitoring plan, escalation path, kill switch) with selectable profiles for UK FCA/ICO principles, DBS PURE, or Rewired Ch 34. Details in the [Build Projects](#build-projects--mini-builds--capstone) section.

**UK context:** UK students have a direct, citeable regulatory framework to reference — arguably clearer than the US fragmented approach:
- **UK's five principles** (cross-regulator, DSIT-led): **safety, transparency, fairness, accountability, contestability**.
- **FCA**: CEO Nikhil Rathi (Dec 2025): *"we will not introduce AI-specific rules"* — AI governed under existing regulatory frameworks, not bespoke ones.
- **ICO**: guidance on AI and data protection; joint guidance with FCA on AI and vulnerable customers expected early 2026.
- **Bank of England + PRA**: AI strategy focused on safe adoption; joint AI survey with FCA in 2026.
- **DSIT + DBT (Jan 2026)**: strategic letters to 19 regulators directing them to publish AI-enablement plans and report annually.
- **Public-trust benchmark**: the **NHS** commands a **63% net trust rating** — the highest of any UK organisation for AI use. Worth citing when students argue "nobody trusts AI".
- Use **DBS's PURE framework** (Purposeful, Unsurprising, Respectful, Explainable) alongside the UK's five principles as a customer-facing distillation.

**The inequality question belongs in the Right-to-Deploy conversation.** Governance isn't only about whether the model is safe *for the customer* — it is also about who *inside* the organisation is allowed to benefit from it. **Daron Acemoglu (MIT Nobel laureate), FT/Focaldata Workforce AI Tracker, 23 April 2026**: *"AI is going to increase inequality between labour and capital. That is almost for sure."* **Chris Pissarides (LSE Nobel)**, same article: *"The more intelligent technology we invent, the more your intelligence matters."* A right-to-deploy gate that checks model cards and kill switches but permits a firm to concentrate all AI productivity in the top 10% of its pay distribution has earned the right to ship the model and forfeited the right to claim responsible deployment. **Add a "distribution gate" to the template**: *"Who in this firm can use the AI capability being deployed, and who can't? If access correlates tightly with seniority or pay, why?"* The FT tracker finding that **corporate training is the single biggest driver of AI use at work** (and Google's evidence that a single training session *tripled* daily usage among women aged 55+) is the operational answer: a governance framework that mandates model cards but no training budget is half a framework.

**Independent testing as a UK governance norm.** On 23 April 2026 former UK PM **Rishi Sunak** (BBC, Faisal Islam) endorsed AISI's testing of Anthropic's Claude Mythos with the line that has become the UK's de facto 2026 governance motto: *"We shouldn't rely on companies to mark their own homework."* Sunak is in an unusual position to say it — he is an adviser to Anthropic and Microsoft, he founded what became AISI, and the comment was made on the week AISI became the *first* regulator to test Mythos. The practical translation for a UK SME writing its right-to-deploy gate: **every high-risk AI deployment should cite an independent evaluator** — AISI for frontier models, the relevant sector regulator (FCA / ICO / MHRA / SRA / CAA / Ofgem) for regulated deployments, an external ISO/IEC 42001 auditor for procurement-sensitive deployments, or a GWTH-style third-party assessment for capability claims. *"Mark your own homework"* is an anti-pattern the template must explicitly flag.

**Research:** [09-ai-trust-right-to-deploy.md](month-3-research/09-ai-trust-right-to-deploy.md), [07-dbs-bank-case-study.md](month-3-research/07-dbs-bank-case-study.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md), FT/Focaldata Workforce AI Tracker (23 Apr 2026).

---

## Week 12 — Adoption, Culture & Your 90-Day Plan

**Arc:** Adoption is the hardest part. Measure what matters, not what's easy. Expect to pivot. Culture is the quiet prerequisite. Ship a 90-day plan and train your team.

### L16. Make Adoption Stick — It's a Redesign Problem, Not a Training Problem

**Description:** Most AI programmes fail at adoption, not at model development. Adoption is not solved by more training; it's solved by redesigning the underlying business process around the new capability. This lesson explores the difference between *launched* and *adopted*, and introduces the 1:1 investment rule ($1 on adoption for every $1 on build). Anchors: **Rewired Ch 30** (expanded), **Gartner's 2026 "Why AI Projects Fail" research** (~30% reach production; adoption is the single biggest cause of the 70% failure), **IDC's Business Value of AI 2026** (realised value 3.2× when adoption investment matches build investment — the empirical backing for the 1:1 rule), **Prosci ADKAR** (the change-management framework most UK HR functions already know), and the **Microsoft *Work Trend Index 2026*** section on Copilot adoption patterns across 31 countries. UK SMEs specifically: **Appian's 2026 UK Public Sector AI** research ("bolt-on" failure mode is the dominant UK antipattern).

**Key concepts:** launched vs adopted · adoption as process redesign · the 1:1 investment rule · user journeys through the new workflow · sustaining vs one-off use.

**Project / activity:** Pick one AI capability already launched in the participant's org. Walk the end-to-end user journey. Where does it fall off the cliff? Redesign those junctures.

**Bring your team along:** The adoption walk is a shadowing exercise — spend an hour next to a user. This is leadership work, not delegated work.

**UK context:** The UK public sector is the cautionary tale and the bright spot, both at once:
- **NHS staff** report spending **~50% of their time on bureaucracy** — they believe AI use could cut this by **18 percentage points**, the equivalent of saving almost a full working day each week.
- **UK Civil Service research (20,000 participants)** — AI use saved **26 minutes/person/day = 2 weeks/year**; scaled to ~550k civil servants this is **1M+ weeks of effort saved annually**.
- **Appian (2026)**: nearly half of UK public-sector AI initiatives are deployed as *"bolt-on" standalone tools* — the exact failure mode the chapter is warning against.
- **BCC (April 2026)**: "Britain's workforce is not ready for what is coming." Most UK SMEs have licences but no process redesign.
- **Tesco AI shopping assistant trial with 280,000 colleagues** before any customer rollout — a strong UK example of adoption-first thinking.

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 30), [01-mckinsey-manifesto.md](month-3-research/01-mckinsey-manifesto.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L17. Tracking Impact — Measuring What Actually Matters

**Description:** Rewired Ch 32. DBS Bank: SGD 180M economic value in 2022 → SGD 1B+ in 2025 — because every programme has a measurable value line from day one. This lesson distinguishes activity metrics (pilots launched) from outcome metrics (EBITDA moved), and teaches participants to set value commitments *before* building.

**Key concepts:** activity vs outcome metrics · EBITDA attribution · value-line discipline · leading vs lagging indicators · the "so what" test.

**Project / activity:** For each of their 3 leverage-point initiatives (from L5), write the single value metric. If it's not a number with a currency sign in front of it, it doesn't count.

**Bring your team along:** Get the CFO to sign off on the metric. If they won't, the metric isn't real.

**UK context:** **Lloyds Banking Group** is DBS's UK mirror on value tracking — **£50m of AI value in 2025 → £100m+ in 2026** on a $5bn digital investment. Exactly the compounding shape DBS showed (SGD 180m → SGD 1b+). Other UK value-metric examples to cite:
- **Tesco** — **£500m productivity savings** in FY2026 from AI + automation, against £1.5bn capex.
- **British Airways / IAG** — Heathrow **86% on-time departures** record attributed to ML optimisation.
- **Starling Bank** — **8,000 staff-hours/month** saved on admin.
- **NatWest** — **150% increase in chatbot customer satisfaction** post-GenAI rollout.
- **Openreach** — redesigned **15M customer journeys** in the UK fibre rollout.
- **UK Civil Service** — **£80m+/year** savings from consultation analysis alone.

Every UK number comes with a currency sign or a percentage — the shape the CFO wants.

**Research:** [07-dbs-bank-case-study.md](month-3-research/07-dbs-bank-case-study.md), [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 32), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L18. Plan for Midstream Adjustments — When (and How) to Pivot

**Description:** Rewired Ch 33 (new). The realism chapter. Programmes pivot; the original plan never survives contact with reality. This lesson is permission-giving: participants learn that adjustment is *planned for*, not a failure of planning, and acquire a decision rubric for pivot / persist / pause / shut down. The counter-instinct is to sink more cost into a failing initiative to save face.

**Key concepts:** sunk-cost trap · pivot / persist / pause / shut down · warning signs · the "kill committee" · the decision memo pattern.

**Project / activity:** Draft a one-page *"AI initiative kill rubric"* — when would we shut down an AI project? What evidence? Who decides?

**Bring your team along:** Socialise the rubric *before* you need it. This is much easier to agree on in peacetime.

**UK context:** The UK public sector is a live experiment in midstream adjustment failures:
- **Diagnostic AI across 66 NHS trusts** — technology deployed, but "misalignment in processes and insufficient engagement with staff led to slow integration." A programme that needs adjustment, not cancellation.
- **Appian 2026 research**: nearly half of UK public-sector AI initiatives are deployed as "bolt-on" tools rather than integrated — symptom of plans that didn't survive contact with workflow reality.
- **British Chambers of Commerce (April 2026)**: workforce not ready for the transition — a large-scale signal that original plans (training, timelines, comms) need revision mid-flight.
- **UK AI Opportunities Action Plan — 2026 Progress Report**: the year-one review itself is an institutional example of structured midstream recalibration. A model worth copying at SME scale.

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 33), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L19. Culture — The Quiet Prerequisite

**Description:** Culture is the quiet prerequisite to sustained AI transformation. The leaders in the PwC 20% share cultural traits: curiosity, permission to experiment, psychological safety around "I don't know", celebration of learning over being right. This lesson walks through cultural anti-patterns (blame for failed pilots, hero culture around senior technologists, "we've always done it this way") and the concrete cultural interventions that work. Evidence across four independent studies so students see the pattern, not a single author's preference: **Rewired Ch 35**, **Amy Edmondson's psychological-safety research** (HBS), **Deloitte's *Human Capital Trends 2026*** (the "curiosity gap"), **Microsoft *Work Trend Index 2026*** (the "great training divide"), and **KPMG 2025 CEO Outlook** (79% of CEOs rethinking training = culture shift in motion).

**Key concepts:** curiosity · permission to experiment · learning over being right · the "I don't know" norm · cultural anti-patterns · agentic-era culture shifts.

**Project / activity:** Culture diagnostic. Three questions the participant asks their team: *when was the last time you admitted you didn't know how to use AI for something? what happened? would you do it again?* Report the pattern.

**Bring your team along:** The diagnostic itself is the intervention — it signals that "I don't know" is acceptable, starting at the top.

**UK context:** UK cultural data is unusually good on this:
- **techUK "confidence gap"** (2026, 500 UK business leaders) — the gap between leadership enthusiasm for AI and day-to-day operating reality. Evidence that the ambient UK culture is ready for the conversation but not yet for the behaviour change.
- **NHS 63% net trust rating** — the highest of any UK organisation for AI use. Public-facing cultures that invest in trust deploy more, not less.
- **Deloitte UK State of AI in Enterprise 2026** (3,235 leaders surveyed): 34% of orgs using AI to "deeply transform", 30% redesigning key processes, **37% still at surface level**. The UK distribution mirrors the global one — and surface-level culture is as common here as anywhere.
- **KPMG 2026 Global CEO Outlook**: 79% of CEOs say AI has made them rethink how they train and develop employees. The cultural shift from "hire for AI" to "train for AI" is already underway in UK C-suites.

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 35), [08-ethan-mollick-leadership.md](month-3-research/08-ethan-mollick-leadership.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md).

---

### L20. Your 90-Day Plan — Train Your Team, Start Your Transformation

**Description:** The closing lesson. Participants assemble the artefacts from Weeks 9–12 (maturity scorecard, 12-theme scorecard, growth thesis, leverage points, domain redesign, seven-pillar scorecard, right-to-deploy template, proprietary data audit, adoption walk, value metrics, kill rubric, culture diagnostic) into a single 90-day plan. The plan has four pillars: **(1) Build your own tech muscle.** **(2) Run your Lab.** **(3) Give the Crowd time, tools, and training.** **(4) Set your governance gate.** The lesson then makes the explicit GWTH.ai CTA: your team needs the same 12 weeks you just had. Don't make them figure it out alone.

**Key concepts:** 90-day plan · pillar 1 personal · pillar 2 Lab · pillar 3 Crowd · pillar 4 governance · the "train your team" CTA · in-house capability as moat.

**Project / activity:** *The 90-Day Plan* — a single-page document combining the week's artefacts. Participants publish it to their leadership team with one ask: *"Sign off on these four moves, and give me 90 days."* Includes a "team enrolment" line: how many people in your org need to take a course like GWTH in the next 90 days, and when will you start them?

**The GWTH.ai close:**
- You cannot outsource this transformation (Mollick, Iansiti/Lakhani, Deloitte).
- 70%+ of your AI talent must be in-house (McKinsey, corroborated by Deloitte Human Capital Trends 2026 and BCG CEO AI Agenda).
- Individual breakthroughs are wasted if they don't become the team's baseline (Goddijn / Ramp; Sivulka's "institutional AI").
- [GWTH.ai](https://gwth.ai) is the fastest way to take the 12 weeks you just did and put every member of your team through them.
- Name three people in your organisation. Enrol them this week. Don't make them figure it out alone.
- **If you bring 100+ colleagues, GWTH builds a bespoke lesson just for your company** — the **bespoke-lesson service** tunes Month 3's frameworks (the 12 themes, the seven pillars, the six capabilities, the right-to-deploy gate) to your sector, your regulator, your named leverage points, and your workforce. This is the route in for enterprise L&D teams that need the same frameworks at a different scale.

**UK context — bring the plan home:**
- **The 70/30 rule in British terms.** Don't argue it theoretically — cite it: IAG.ai Labs London+Barcelona (100+ in-house data scientists), i.AI inside UK government (Humphrey built in-house), Kraken at Octopus Energy (built in-house, became the moat), Lloyds AI Academy (200 senior execs, Pillar 1 in action).
- **The UK investment signal.** HSBC UK says **£105bn** of revenue is available to UK mid-sized firms by 2030 if they adopt AI. That number belongs on the first slide of the 90-day plan: *"this is what we're leaving on the table"*.
- **The UK regulatory reality.** FCA / ICO / BoE / ICO five principles (safety, transparency, fairness, accountability, contestability) + the FCA's explicit *"no AI-specific rules"* stance — no regulator is going to stop you; the only question is whether you start.
- **The UK thought-leader pairing.** Ethan Mollick + **Azeem Azhar** as the course reading duo. American framework + British lens.
- **The training argument, British version.** British Chambers of Commerce (April 2026): *"Britain's workforce is not ready for what is coming."* techUK: 27% of non-tech / 35% of tech UK businesses name AI training as the top 2026 skills gap. **The BCC-named gap is why GWTH.ai exists.** Your 90-day plan should name every team member you're enrolling and the date you're starting them.

**Research:** all files in [`month-3-research/`](month-3-research/) — including [`12-uk-ai-landscape.md`](month-3-research/12-uk-ai-landscape.md) and [`13-uk-company-case-studies.md`](month-3-research/13-uk-company-case-studies.md).

---

## Build Projects — Mini-Builds + Capstone

Month 3's strategy lessons produce artefacts (scorecards, roadmaps, domain maps, right-to-deploy gates). The build projects turn each of those artefacts into working software the student can use and — crucially — share with colleagues to accelerate their own organisation's transformation.

Students come in with Month 1–2 skills: Python, REST APIs, LLM integrations, Next.js/React basics, PostgreSQL, Docker. Every build uses only those skills. Nothing new is taught that the strategy lessons themselves don't already motivate.

### Build stack (default — students can substitute)

| Layer | Default choice | Why |
|-------|---------------|-----|
| Backend | FastAPI (Python) | Matches Month 2 stack; fast to scaffold |
| Frontend | Next.js 16 + shadcn/ui + Tailwind | Matches the GWTH platform and ACG; production-quality on day one |
| LLM | Claude Sonnet 4.6 via Anthropic SDK or OpenAI GPT-5 | Either works; students pick one |
| Storage | SQLite locally → Supabase in production | Zero setup for local, cloud-ready when they deploy |
| Deployment | Coolify on P520 (course-provided) or Vercel free tier | Students deploy to a URL their team can open |
| Auth (optional) | Supabase Auth / magic link | Added only if students want multi-user |

### Build helper repos (provided as starter templates)

- `gwth-m3-capstone-starter` — Next.js + FastAPI + Supabase, CI, Playwright, ready for Coolify.
- `gwth-m3-mini-starter` — CLI or FastAPI-only starter for the weekly mini-builds.

---

### Mini-Build 1 (Week 9) — AI Maturity Scorecard Web App

**Sits alongside:** L2 (12 Themes), L1 (20/74 Rule).

**Description:** A single-page web app that walks a leader through a self-assessment on McKinsey's 12 themes and PwC's five leader-signals, returns a radar chart of their org's maturity, and drops out a personalised one-page PDF they can email to their leadership team — exactly the artefact L1 and L2 ask for, but generated in five minutes instead of drawn by hand.

**Build scope:**
- 12 slider / radio inputs (one per theme), scored 1–5.
- Five additional questions on PwC leader signals.
- Radar chart (Recharts / Chart.js).
- LLM-generated narrative: *"your organisation looks like a Theme-1 laggard but a Theme-11 leader — here's what to do about it"* (200 words, grounded in the scores).
- PDF export (server-side via `@react-pdf/renderer` or Puppeteer).
- Anonymous by default; shareable link.

**Tech stack:** Next.js 16 + shadcn/ui + a single FastAPI endpoint for LLM narrative + Puppeteer-driven PDF export. Supabase optional (for saving results across sessions).

**Acceptance criteria:**
1. Filling all 17 questions < 4 minutes.
2. Radar chart renders on mobile.
3. PDF downloads in < 10 seconds and fits on one A4 page.
4. Narrative names at least two specific themes by number.
5. Deployed to a URL that loads in < 2 seconds.
6. Includes a "book a conversation" link or a CTA to enrol the team in GWTH.

**Why this helps the enterprise:** Most SME leaders won't sit down and do a 12-theme self-assessment on paper. They will do it on a web form in 4 minutes. The scorecard is a Trojan horse for the strategic conversation.

**Estimated time:** 6–8 hours. Pair programming with Claude Code keeps it to one evening.

---

### Mini-Build 2 (Week 10) — Domain Discovery Assistant

**Sits alongside:** L5 (Leverage Points), L6 (Domains Not Use Cases).

**Description:** A conversational LLM app that interviews the user about their business — industry, size, value chain, current initiatives — and returns a prioritised domain map: the 3–5 places where an AI investment would cascade. The output replaces the "pick three use cases" workshop SMEs default to.

**Build scope:**
- Multi-turn chat UI (streaming). LLM asks ~10 questions about the business.
- Structured extraction into a typed "Business Profile" JSON (company name, sector, main processes, current AI use, 3-year goals).
- Domain-scoring prompt: takes the profile and outputs 3–5 ranked domains with (a) a one-sentence opportunity, (b) expected economic leverage, (c) feasibility, (d) a first concrete experiment.
- Map output: simple Sankey or matrix visualisation.
- Shareable output URL.

**Tech stack:** Next.js + Vercel AI SDK (streaming), single LLM call per turn, JSON mode for structured extraction. No database required — results are in-URL encoded.

**Acceptance criteria:**
1. Conversation feels natural, not form-like.
2. Output includes sector-relevant leverage points (supply chain for manufacturers, pricing for airlines, customer journey for retail, fraud for banks — matching the UK examples from L5).
3. Shareable URL preserves the full output.
4. Works with *either* Claude or GPT backing.
5. Graceful fallback when the LLM is rate-limited.

**Why this helps the enterprise:** Exec teams sit in rooms for 2-hour workshops arguing about AI priorities. This tool does the framing job in 10 minutes and produces a starter artefact the team can argue about.

**Estimated time:** 8–10 hours. LLM integration is the bulk of the work; UI can be minimal.

---

### Mini-Build 3 (Week 11) — Right-to-Deploy Template Generator

**Domain:** **`governancekit.co.uk`** — positions it as a UK-first compliance toolkit, which is the natural audience.

**Sits alongside:** L14 (Proprietary Data), L15 (Right to Deploy).

**Description:** A form-based generator that takes a description of an AI solution and produces a full "Right to Deploy" artefact pack: model card, risk register, fairness review, monitoring plan, escalation path, kill switch procedure. Outputs a downloadable PDF + a machine-readable JSON bundle. Pre-configured for UK principles (FCA/ICO five principles) with a DBS-PURE option.

**Build scope:**
- Structured input form (~15 fields): solution name, purpose, data inputs, model type, deployment mode, users affected, failure modes, etc.
- LLM-assisted generation of each artefact section.
- Governance-profile switch: UK (FCA/ICO), DBS PURE, or McKinsey Rewired — each produces a differently-framed output.
- Version history (stored in Supabase or just localStorage).
- PDF export + JSON bundle.
- **Non-LLM reviewer mode:** a second pass that checks the output against a hard-coded checklist and flags gaps in the generated artefacts.

**Tech stack:** Next.js + FastAPI + Supabase + Puppeteer PDF. Uses LLM structured output for the sections that need rich prose, deterministic logic for the checks.

**Acceptance criteria:**
1. PDF output is presentation-quality and ready to send to compliance / legal without further editing.
2. The UK principles mode cites the five FCA/ICO principles by name.
3. The DBS PURE mode produces a four-word summary that passes a trivial human sanity check.
4. JSON bundle is re-ingestible (re-running the generator on the same JSON reproduces the PDF).
5. Non-LLM reviewer catches at least three classes of missing content.

**Why this helps the enterprise:** Governance artefacts are the single biggest blocker to scaling AI deployment in regulated UK sectors. Producing them takes days of a compliance officer's time per initiative. This tool turns the first 80% into minutes.

**Estimated time:** 10–12 hours — the most complex of the mini-builds.

---

### Mini-Build 4 (Week 12) — Internal AI Skills Library ("Dojo clone")

**Domain:** **`aiconfident.io`** (primary); alt-domains `aiserviceindex.com`, `corporateaihub.com`, `vibeappmarket.com` available for positioning experiments. `aiconfident.io` frames the library as a confidence-building tool for enterprises early in their AI journey — which is the natural buyer.

**Sits alongside:** L10 (Harness Engineering / Ramp Glass), L16 (Adoption).

**Description:** A lightweight internal skill marketplace modelled on Ramp's Dojo. Any team member can publish an "AI skill" — a reusable prompt, workflow, or MCP server configuration, stored as markdown with frontmatter. The app indexes them, embeds them for semantic search, and has a "Sensei" recommendation feature that surfaces the top 5 skills for a user based on their role and current project.

**Build scope:**
- Skill file format: markdown with frontmatter (name, author, team, tags, intended tool, expected output, example input).
- Submission form (upload markdown or paste inline).
- Search (keyword + vector via Qdrant local or pgvector in Supabase).
- Sensei: LLM call that takes user role + current project + top-N skills and returns the 5 most relevant.
- Usage logging so the "popular skills" list is data-driven.
- Slash-command export: any skill can be exported as a Claude Code skill file or a Cursor rule.

**Tech stack:** Next.js + FastAPI + Qdrant (reuses the GWTH pipeline's Qdrant) + Anthropic SDK for Sensei + simple auth.

**Acceptance criteria:**
1. Minimum 10 seed skills shipped with the starter.
2. Submitting a new skill takes < 60 seconds.
3. Search returns relevant results for a natural-language query.
4. Sensei recommendations change when the user's role / project changes.
5. Each skill has a "clone to Claude Code" button that produces a valid skill file.
6. Deployed URL the student can share with their actual team.

**Why this helps the enterprise:** Ramp's thesis — *one person's breakthrough should become everyone's baseline* — requires a skill-sharing harness. Most UK SMEs have a Slack channel and scattered docs. This gives them a proper internal Dojo without building from scratch.

**Estimated time:** 10–15 hours. The vector search is the new piece; everything else is straightforward.

---

### Capstone Project — AI Readiness Assessment Tool

**Domain:** **`productarchitect.dev`** — **continues the same codebase students shipped in Month 2** (no rewrite; no new domain). Month 3 extends the scoring engine with 12 McKinsey themes + 7 Sivulka pillars + 6 Rewired capabilities, adds multi-respondent team mode, CRM/HubSpot lead export, consulting-handover deck, anonymised benchmarking pool, and enterprise white-label.

**Spans:** The full month. Background work in Weeks 9–11 (each mini-build feeds a layer into the Capstone), intensive extension in Week 12, presentation at end of Week 12.

**Description:** A production-quality web application that any UK business leader can use to evaluate their organisation's AI maturity and receive an actionable transformation roadmap. The tool takes a company profile (free text about the business, ~5 minutes to complete), scores the organisation across the **six Rewired capabilities**, the **12 McKinsey themes**, and the **seven pillars of institutional AI** (Sivulka), benchmarks the result against UK peer data (BCC, PwC UK, HSBC UK), and generates a personalised 90-day roadmap with specific initiatives, priority scores, and explicit enrolment prompts for GWTH.

**This is not a toy.** It is the tool the student will use to prospect consulting clients, drive conversations with their own leadership team, and (for some) launch as a lead-generation asset.

**Full feature list:**

1. **Company profile intake.** Wizard UI collecting: industry, size, revenue band, current AI use (free text), AI investment YTD, named initiatives, perceived biggest blocker. ~5 minutes.
2. **Scoring engine.**
   - Six capabilities scored 1–5 each (Roadmap, Talent, Operating Model, Technology, Data, Adoption).
   - 12 themes scored 1–5 each.
   - Seven pillars scored 1–5 each.
   - Aggregate: PwC-style "which quintile are you in" band (20%, 80%, bottom).
3. **UK benchmark overlay.** Comparison against BCC 54% (using AI), 11% (deep use), HSBC £105bn opportunity for mid-sized firms, sector-specific PwC UK productivity multiples.
4. **Gap analysis.** Ordered list of the five biggest gaps, with concrete language: *"Your Theme 5 (30/70 talent) score is 2 — UK peers average 3.4. You are investing in consultants while Lloyds, HSBC, NatWest and Barclays have all appointed Chief AI Officers from inside the business this year."*
5. **90-day roadmap.** Pillar-1 (personal tech muscle), Pillar-2 (Lab charter), Pillar-3 (Crowd enrolment), Pillar-4 (governance gate). Each pillar has 3–5 named initiatives, a lead, a success metric, and a due date 90 days from today.
6. **UK peer case picker.** Based on the user's industry, recommends one UK case study to read (Lloyds, HSBC, BA/IAG, Tesco, Ocado, Kraken/Octopus, JLR, Rolls-Royce, Humphrey, etc.) — each with a link, key numbers, and a "what to steal" summary.
7. **Training recommendations.** Named seats for GWTH.ai: how many people to enrol, which role profiles, estimated budget, onboarding order.
8. **Live radar / heatmap visualisation.** Dashboard view showing the six capabilities, drillable into themes and pillars.
9. **PDF executive report.** 8–12 pages, designed to be board-presentable. Includes cover, executive summary, scorecard, benchmarks, gap analysis, roadmap, training plan, and sources.
10. **Sharing / collaboration.** A unique URL per assessment; option to invite 2–3 colleagues to answer independently and see a team-consensus view.
11. **"Ask the tool" chat.** Optional LLM chat surface where the leader can ask follow-up questions — *"Why did we score low on Theme 11?"* — grounded in their own assessment data + the research corpus.
12. **Anonymous benchmarking.** Opt-in: share anonymised scores to a global benchmark pool, see how you rank.

**Tech stack:**
- **Frontend:** Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui, Motion for animation, Recharts or Visx for the radar/heatmap.
- **Backend:** FastAPI (Python) with LangChain or direct Anthropic/OpenAI SDK usage; separation between the deterministic scoring engine and LLM-generated narrative.
- **Data:** Supabase (Postgres) for user accounts, assessments, benchmarks. Qdrant (reusing the GWTH pipeline collection) for the research corpus the chat feature queries.
- **Auth:** Supabase Auth (magic link) for saving assessments; anonymous mode for first-time users.
- **PDF:** React PDF / Puppeteer server-side generation.
- **LLM:** Claude Sonnet 4.6 default (students can swap to GPT-5 or Gemini with a flag).
- **Infra:** Dockerised; deployed to Vercel free tier at **`productarchitect.dev`** (default), or Coolify on a UK VPS for students with data-sovereign clients.

**Acceptance criteria:**

1. A first-time user completes an assessment, sees their scores, and downloads a PDF in **≤ 12 minutes**.
2. The PDF is board-presentable: typography, no broken layouts, all scores consistent with on-screen values.
3. The scoring engine is **deterministic** given the same input — LLM is only used for narrative, not for scoring.
4. All LLM-generated narrative cites at least **one UK benchmark** and **one UK company**.
5. Given an obviously bad input (*"we don't use AI at all"*), the tool produces a plausible roadmap without hallucinating capabilities the user said they don't have.
6. A leader can share the assessment URL with colleagues; collaborators can answer independently; the dashboard aggregates.
7. The "Ask the tool" chat never fabricates sources — every quoted UK stat traces back to a document in the Qdrant corpus.
8. End-to-end test suite (Playwright) passes: profile → score → roadmap → PDF → chat, all green.
9. Analytics integrated so the student can see who completed assessments (if they use it as a lead-gen tool).
10. Accessible (axe-core clean) and responsive to mobile.
11. Deployed to a live URL the student can show a prospective client on day one.

**The submission.** Students present:
- Live URL.
- 3-minute walkthrough video.
- GitHub repo with README, architecture diagram, and a "how this was built" log (Claude Code session transcripts welcome).
- Their *own* assessment — they must run the tool on their own business.
- A two-paragraph reflection: *what this tool actually helped them see about their own company that the strategy lessons alone hadn't revealed*.

**Why this helps the enterprise (and the student's career):**

- The **enterprise** gets a tool that replaces a £50k–£100k consulting engagement with a structured, repeatable assessment.
- The **student** gets a portfolio-quality deliverable: *"I built an AI readiness assessment tool for SMEs"* is a legitimate consulting / employment offer. For many students this becomes the service they sell under their own brand.
- **GWTH** gets a channel: every assessment recommends GWTH.ai by role. The better the students' assessments work, the more GWTH grows — aligned incentives throughout.

**Build cadence (suggested):**
- **Week 9:** Scaffolding + scoring engine (deterministic part). Mini-Build 1 (Scorecard) is a direct building block.
- **Week 10:** LLM narrative generation + domain mapping. Mini-Build 2 (Domain Assistant) feeds in.
- **Week 11:** Governance section + PDF export. Mini-Build 3 (Right to Deploy) feeds in.
- **Week 12:** Chat feature + benchmarking + polish + deployment. Mini-Build 4 (Dojo clone) isn't directly reused but reinforces the skill-library thinking the Roadmap section recommends.

**Estimated total effort:** 15–25 hours spread over the month. Students using Claude Code well should land around 15; students who fight the tools will land at 25+.

**Fallback scope for time-constrained students:**
If a student runs out of time, the minimum viable Capstone is: company profile intake → six-capability scoring → PDF output with a 90-day roadmap. That alone is still useful and submittable.

**Stretch goals for advanced students:**
- Integration with CRM (HubSpot / Pipedrive) to auto-create leads from assessments.
- Slack bot that lets exec teams complete a section each and aggregates.
- White-label mode: consultancies can rebrand and sell the tool.
- Multi-language (starting with Welsh, then Spanish for IAG / LATAM reach).

---

## Appendix — Cross-cutting principles to weave through every lesson

Not lessons of their own, but themes that should surface in multiple lessons for reinforcement:

1. **You are the leader Rewired is written for.** Not "the CIO." *You.*
2. **Raise the floor, don't lower the ceiling.** Every staff member should be able to access the full capability — the harness does the work of hiding complexity.
3. **One person's breakthrough is everyone's baseline.** Private wins are wasted.
4. **Metabolic rate matters.** Speed of decision, release, and learning is a first-class capability.
5. **Adoption costs as much as build.** Plan for the 1:1 investment rule.
6. **Trust is a growth engine.** Governance lets you scale, not slow down.
7. **You cannot outsource this.** Consultants can map; you must lead.
8. **Train your team.** The capability is in your people.
9. **UK peer pressure is real.** Every UK bank now has a Chief AI Officer; Lloyds has trained 200 senior executives; the NHS commands 63% public trust for AI use; HSBC says £105bn of revenue is available to UK mid-sized firms by 2030. Your UK peers are moving — the Month 3 plan is how you catch up.

---

## Format and delivery notes for the GWTH team

- **Strategy-first with builds attached.** Most lessons are recorded discussion + workbook + activity. Four weekly mini-builds plus a Capstone sit alongside — optional for students who want to stop at the strategy, mandatory for students pursuing the full certification.
- **Each lesson ~20–25 min video + 20 min activity.** Lighter on screen time than Months 1–2; heavier on reflection and worksheet.
- **Workbooks.** Every lesson has a downloadable PDF worksheet (canvas, scorecard, template). These become the participant's 90-day plan evidence pack — and several of them are the input format for the build projects.
- **Build sessions.** Each week has a ~60-minute build walkthrough (recorded + live office hours). Students use Claude Code / Cursor to pair-program with the instructor's reference implementation.
- **Capstone presentations.** End of Week 12: each student presents their AI Readiness Assessment Tool live — URL, demo, reflection. Aim: 15 minutes per student in a cohort session of ~6 students.
- **Guest commentary.** Consider short clips from the AI Daily Brief transcript, the RAMP engineers, Ethan Mollick, or **Azeem Azhar's Exponential View** (check fair use before embedding).
- **Weekly live session.** Office hours where participants bring their worksheets *and* their mini-build work-in-progress. Questions get solved for the whole cohort.
- **Consistent closing.** Every lesson ends with the "Bring your team along" prompt. By L20, the CTA to enrol colleagues into GWTH is the natural conclusion, not a sales pitch. The Capstone URL — the student's own tool — is the asset they use to start those conversations.

---

## Optional lessons (10–15)

These sit **outside the 20-lesson core**. Each is a real candidate for promotion — they're cutting-edge, audience-specific, or evolving fast enough that we'd rather prototype as a Lab first and graduate into the core only if the topic proves durable. Listed in rough priority order.

**O1. Building a Chief AI Officer Role — the 2026 UK Playbook.** JD templates, compensation, reporting lines, decision rights. Drawing on Lloyds, HSBC (David Rice, Mar 2026), NatWest, Barclays, IAG (Dr Ben Dias). *Why optional:* most SMEs won't appoint a CAIO; mid-market leaders might.

**O2. The AI Board Briefing — What to Tell Your Board, How Often, Which Slides.** Directors' oversight duties under UK Companies Act 2006 s.172; ICAEW 2026 AI audit guidance; audit-committee's role; FRC expectations. *Why optional:* specific to leaders with board reporting duties.

**O3. M&A and AI — Valuing AI Moats, Due-Diligence Checklists.** Acquiring AI capability, measuring proprietary data accumulation, earn-out structures for AI-dependent revenue. Ties to Sivulka's institutional-AI thesis. *Why optional:* niche audience but valuable when it matters.

**O4. AI and ESG / Sustainability — Data-Centre Footprint, Scope 3 Emissions, SECR.** UK Streamlined Energy and Carbon Reporting; data-centre water usage (Microsoft 2025 disclosures, AWS UK data); the Greener AI agenda. *Why optional:* growing fast; specific to sustainability-focused leaders.

**O5. AI Procurement and Vendor Risk.** SOC 2, ISO/IEC 42001, NIST AI RMF vendor assessment, contract clauses for AI, liability allocation, data residency. Pairs naturally with a Lab. *Why optional:* operational more than strategic.

**O6. AI Insurance and Liability.** 2026 emerging coverage (Lloyd's of London AI Affirmative Coverage; Beazley; Munich Re); who pays when an agent errs; the *Mata v. Avianca* precedent for business; UK GDPR liability cascade. *Why optional:* niche; changes fast.

**O7. Responsible AI Disclosure — Building Your AI Ethics Statement.** Annual AI transparency reports (Microsoft, Accenture, Anthropic as exemplars); stakeholder engagement; ICO alignment; cost of *not* disclosing. *Why optional:* primarily for consumer-facing businesses.

**O8. AI and Intellectual Property.** UK IPO position on generated-output ownership; text-and-data mining exception; training-data disputes (*Getty v Stability*, *NYT v OpenAI*, UK Music licensing lobby); what SME leaders actually need to know. *Why optional:* legal-adjacent and changing quickly.

**O9. Workforce Transition Planning.** UK redundancy risks, Section 188 TULRCA consultations, CIPD/ACAS 2026 guidance, fair-process AI restructures, alternative redeployment. The "BT cuts 55,000 vs Lloyds trains 200 execs" dichotomy made operational. *Why optional:* HR-heavy.

**O10. AI and Accessibility / Inclusion.** Ensuring AI rollout doesn't accidentally exclude. UK Equality Act 2010 implications; screen-reader/voice/dyslexia/SEN considerations; the EHRC 2026 guidance. *Why optional:* specific mandate but increasingly a compliance issue.

**O11. AI Auditing — the 2026 Emerging Profession.** ISO/IEC 42001 certification path; what a third-party AI audit looks like; UK's Big Four audit-firm AI practices. *Why optional:* too specialised for most — but growing.

**O12. Trade Association and Industry Body Strategy.** How to shape AI policy through techUK, CBI, IOD, FSB, Sector Councils, TechLocal. Who to call; when; what gets heard. *Why optional:* niche strategic activity.

**O13. Building the AI P&L.** Your own financial model for AI investments: unit economics, chargeback models, capacity planning. Excel / Google Sheets templates. *Why optional:* FD/CFO-oriented; CEOs need the summary not the model.

**O14. Public Procurement and AI.** For UK suppliers selling to government: GDS / Crown Commercial Service process; G-Cloud; AI Opportunities Action Plan procurement levers; DSIT/DBT strategic letters. *Why optional:* specific supplier subset.

**O15. AI in Family-Owned Businesses.** Governance, succession, ownership transitions in an AI era — the under-covered UK mid-market segment (family firms are ~14% of UK GDP). *Why optional:* niche but important for a big slice of the UK economy.

---

## Lab ideas — lessons we decided not to teach

Lessons we considered and decided **not** to include in the core 20 because the topic is a head-to-head framework or case-study comparison that goes stale fast, or because it's a narrow one-audience deep-dive. These become **Labs** — short (≈30–60 min), repeatable, refreshable independently of the core curriculum, and ranked against the GWTH default frameworks. For Month 3, Labs tend to be governance-framework comparisons, case-study deep-dives, or hands-on scorecard tests rather than the tool shoot-outs that dominate the Month 1 Lab list.

1. **Lab 1 — Governance framework shoot-out.** NIST AI RMF vs ISO/IEC 42001 vs EU AI Act vs UK five principles vs DBS PURE. Same AI solution (e.g., an SME customer-service bot); produce the right-to-deploy artefact in each framework; score on completeness, effort, board-readability. *Anchored to L15.*
2. **Lab 2 — Strategy framework shoot-out.** McKinsey 12 themes vs BCG 8 Capabilities vs Deloitte 5 Scaling Dimensions vs the UK AI Opportunities Action Plan's 50 recommendations. Score the same mid-market UK company in all four. *Anchored to L2.*
3. **Lab 3 — UK banking adoption model comparison.** Lloyds AI Academy vs Barclays Copilot-for-100k vs HSBC first-CAIO-from-inside vs NatWest Cora+ vs Santander. Who's doing what; how it's funded; early signals of what's working. *Anchored to L7, L11, L13.*
4. **Lab 4 — Build-your-own harness comparison.** Ramp Glass vs Vercel Open Agents vs LangChain LangGraph vs Microsoft Semantic Kernel vs Anthropic's Claude Agent SDK. Stand up a minimal skills-library for your own team in each; compare build time and extensibility. *Anchored to L10.*
5. **Lab 5 — Enterprise AI suite comparison.** Claude Enterprise vs Microsoft Copilot for M365 (Enterprise) vs Google Gemini for Workspace vs OpenAI Enterprise. Same 10-person pilot team; same 5 tasks; real UK TCO. *Anchored to L8, L16.*
6. **Lab 6 — AI ROI methodology comparison.** McKinsey $3:$1 vs BCG ROIC multiple vs Deloitte realised-value methodology vs IDC Business Value vs Forrester Total Economic Impact. Apply each to the same hypothetical SME AI programme; see where they diverge. *Anchored to L4, L17.*
7. **Lab 7 — UK harness-as-product deep dives.** Octopus Kraken vs Ocado Smart Platform vs Rolls-Royce R² Data Labs vs Darktrace vs Wayve. How each crossed the line from internal tool to licensable product — extract the transferable pattern. *Anchored to L10.*
8. **Lab 8 — UK AI trust benchmark.** NHS 63% vs UK banking ~48% vs UK retail ~31% vs UK public sector ~27%. Read the Ofcom + techUK + Deloitte trust-survey raw data; what drives the spread? *Anchored to L15, L19.*
9. **Lab 9 — Five UK AI regulators in action.** FCA vs ICO vs CMA vs Bank of England/PRA vs AISI. What each has actually enforced, signalled, or approved in 2026 so far; side-by-side 2026 guidance. *Anchored to L15.*
10. **Lab 10 — National AI strategy comparison.** UK AI Opportunities Action Plan (50 recs, 38 delivered) vs France AI Strategy vs Germany vs Singapore vs UAE. Where the UK is ahead, where behind, what SME leaders can borrow. *Anchored to L1, L20.*
11. **Lab 11 — Market intelligence source comparison.** Stanford AI Index vs Accenture AI Maturity vs IDC AI Spending vs Gartner Hype Cycle vs CB Insights AI 100. Which to subscribe to and for what purpose. *Anchored to L4.*
12. **Lab 12 — AI business case formats.** Same underlying AI initiative; produce a one-pager, a 10-page board paper, a 60-second elevator pitch, and a 3-slide CFO briefing. Practice the range. *Anchored to L4, L20.*
13. **Lab 13 — UK public sector AI: failures and successes.** Diagnostic AI across 66 NHS trusts (slow integration) vs Humphrey suite inside UK Civil Service (in-house win) vs DVLA modernisation vs HMRC Digital. What structural difference produced the different outcomes? *Anchored to L7, L16.*
14. **Lab 14 — Internal AI skills-library comparison.** Ramp Dojo vs Accenture internal GenAI Hub vs GitHub Copilot Workspaces vs Anthropic Skills + MCP ecosystem. How each manages reusable prompts + workflows at scale. *Anchored to L10.*
15. **Lab 15 — AI-first business reinvention case studies.** Lovable (tech, vibe-coding) vs Tesco (retail, Clubcard+AI) vs JLR (manufacturing, connected vehicle) vs BBC (media, Beeb+Licensing) vs Octopus Energy (utility, Kraken). Read the 2026 annual reports and earnings calls; extract the reinvention moves. *Anchored to L3.*
16. **Lab 16 — Three CEO approaches, compared.** Lloyds (growth-first), BT (cost-extraction-first), Barclays (reshape-not-replace). Compare on ethics, ROI, staff trust, market reaction. *Anchored to L3, L13.*
17. **Lab 17 — Three 2026 hot topics.** Sovereign AI (France's phase-out of US big tech; UK's data sovereignty); on-prem / private LLMs (Llama 3.3, Qwen 3 for regulated industries); federated governance (multi-entity AI risk register). 30-minute briefing on each. *Anchored to L14, L15.*

*Format.* Each Lab has: a brief (one paragraph), the ranking-as-of-publish-date, the scoring rubric, a short demo/write-up. Labs are **dated** — "first published 2026-04-21 · last reviewed 2026-07-01" — so students see how fresh the analysis is. Labs that mature graduate into the core; Labs that go stale get refreshed or archived. **Note for the UK AI Skills Hub pitch:** Labs are free, UK-focused, platform-/framework-agnostic, and learning-by-doing. That makes them the first asset GWTH offers the Hub (see `../month-1-research/13-uk-regulatory-context.md` for the full Hub strategy).

---

## Sources

Full research library at [`month-3-research/`](month-3-research/). Key primary sources:

### Global — non-McKinsey (read these first so the course isn't mistaken for a Rewired summary)

**BCG**
- BCG *Build for the Future 2026* (AI Maturity / 8 Capabilities) — https://www.bcg.com/publications
- BCG *CEO AI Agenda 2026*
- BCG *Digital Acceleration Index 2026*

**Deloitte**
- [Deloitte State of AI in Enterprise 2026](https://www.deloitte.com/uk/en/issues/generative-ai/state-of-ai-in-enterprise.html)
- Deloitte *Human Capital Trends 2026*
- Deloitte Tech Trends 2026

**PwC**
- [PwC 2026 AI Performance Study](https://www.pwc.com/gx/en/news-room/press-releases/2026/pwc-2026-ai-performance-study.html)
- [PwC UK AI Jobs Barometer](https://www.pwc.co.uk/services/technology/generative-artificial-intelligence/uk-ai-jobs-barometer.html)
- PwC *Annual Global CEO Survey 2026*

**KPMG**
- [KPMG Global Tech Report 2026](https://kpmg.com/uk/en/insights/technology/kpmg-global-tech-report.html)
- KPMG *2025 / 2026 CEO Outlook*

**Accenture**
- Accenture *Technology Vision 2026*
- Accenture *Reinventing with AI* research

**IDC / Gartner / Forrester**
- IDC *Worldwide AI Spending Guide 2026*
- IDC *Business Value of AI 2026*
- Gartner *Hype Cycle for AI 2026*; *AI Maturity Model*
- Forrester *Total Economic Impact of Enterprise AI* series

**Academic / Thought leaders**
- Iansiti & Lakhani — *Competing in the Age of AI* (HBR Press) — https://www.hbr.org/books/iansiti/competing-in-the-age-of-ai
- MIT Sloan Review — Ransbotham / Kiron AI research series
- Stanford *AI Index 2026* — https://aiindex.stanford.edu/
- World Economic Forum *Future of Jobs 2026*
- Amy Edmondson — psychological safety research (HBS)
- Ethan Mollick — [One Useful Thing](https://www.oneusefulthing.org/); *Co-Intelligence* (2024)
- Azeem Azhar — [Exponential View](https://www.exponentialview.co/)
- **Daron Acemoglu** (MIT, 2024 Nobel laureate in economics) — *Power and Progress* (2023); 2024–26 NBER working papers on AI and inequality (search "Acemoglu + Simple Macroeconomics of AI", NBER WP 32487)
- **Chris Pissarides** (LSE, Nobel laureate in economics) — Pissarides Review on the Future of Work & Wellbeing (Institute for the Future of Work, ifow.org)
- **Carl Benedikt Frey** (Oxford Internet Institute) — *The Technology Trap* (2019) + Oxford Martin School AI & labour research
- **Brynjolfsson, Li & Raymond — "Generative AI at Work"** (QJE 2025 / NBER WP 31161) — call-centre RCT showing gains concentrated in less-experienced workers (the counter-finding to the FT high-earner thesis — teach both)

**Financial journalism + polling (2026 currency)**
- **Financial Times — "High earners race ahead on AI as workplace divide widens"** (Murgia & Burn-Murdoch, 23 Apr 2026) — first release of the **FT/Focaldata Workforce AI Tracker** (UK n=2,365 / US n=1,754, monthly). Canonical 2026 source for the 60% vs 16% adoption divide, the 20% gender gap, the "heaviest users are in their 30s" finding, and the "corporate training is the biggest driver" evidence. Quotes Acemoglu, Pissarides, Frey, Curto Millet (Google), Chatterji (OpenAI). *Used in L1, L13, L15.*

**Frameworks / standards**
- NIST AI Risk Management Framework 1.0 + 2026 Generative AI Profile
- ISO/IEC 42001:2023 — AI Management System Standard
- EU AI Act (Article 50, August 2026) — https://artificialintelligenceact.eu/
- DBS PURE framework (Purposeful, Unsurprising, Respectful, Explainable)

**Microsoft / Anthropic / OpenAI (primary sources for agentic patterns)**
- Microsoft *Work Trend Index 2026*
- Anthropic *Economic Index* — https://www.anthropic.com/economic-index
- OpenAI *A Practical Guide to Building Agents* (Dec 2024)
- OpenAI *Identifying and Scaling AI Use Cases* (Apr 2025)

### Global — McKinsey primary sources (cited, but triangulated above)

- [The AI Transformation Manifesto — McKinsey (Apr 2026)](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-ai-transformation-manifesto)
- [Rewired 2nd Edition — McKinsey on Books](https://www.mckinsey.com/featured-insights/mckinsey-on-books/rewired)
- [State of AI Trust 2026 — McKinsey](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/tech-forward/state-of-ai-trust-in-2026-shifting-to-the-agentic-era)

### Global — case studies and commentary

- [Institutional AI vs Individual AI — George Sivulka, a16z](https://www.a16z.news/p/institutional-ai-vs-individual-ai)
- [DBS Bank — AI-Powered Digital Transformation](https://www.dbs.com/artificial-intelligence-machine-learning/artificial-intelligence/dbs-ai-powered-digital-transformation.html)
- [Eric Glyman — Ramp Glass announcement](https://x.com/eglyman/status/2043362828178841860)
- [Open Agents — Vercel Labs](https://github.com/vercel-labs/open-agents)
- [Ethan Mollick on Leadership / Lab / Crowd — One Useful Thing](https://www.oneusefulthing.org/p/making-ai-work-leadership-lab-and)
- [Harness engineering — ignorance.ai](https://www.ignorance.ai/p/the-emerging-harness-engineering)
- [How the Best Companies Use AI — AI Daily Brief transcript](file:///C:/Users/david/Downloads/How%20the%20Best%20Companies%20Use%20AI.txt) (local)

### UK-specific

- [UK AI Opportunities Action Plan (Clifford review, Jan 2025)](https://www.gov.uk/government/publications/ai-opportunities-action-plan)
- [PwC UK AI Jobs Barometer](https://www.pwc.co.uk/services/technology/generative-artificial-intelligence/uk-ai-jobs-barometer.html)
- [Bank of England — AI in the financial system](https://www.bankofengland.co.uk/financial-stability-in-focus/2025/april-2025)
- [HSBC UK — AI could unlock £105bn for UK mid-sized firms](https://www.about.hsbc.co.uk/news-and-media/ai-adoption-could-unlock-105bn-in-additional-revenue-for-uk-mid-sized-firms-by-2030)
- [Lloyds Banking Group — £100m+ AI value in 2026](https://www.lloydsbankinggroup.com/media/press-releases/2026/lloyds-banking-group/ai-driven-benefits-2026.html)
- [HSBC first Chief AI Officer (Mar 2026)](https://www.resultsense.com/news/2026-03-25-hsbc-appoints-first-chief-ai-officer)
- [techUK + Public First — State of UK Tech 2026](https://www.techuk.org/resource/the-state-of-uk-tech-in-2026-polling-from-techuk-public-first.html)
- [British Chambers of Commerce — Britain's Workforce Not Ready (Apr 2026)](https://www.britishchambers.org.uk/news/2026/04/britains-workforce-is-not-ready-for-what-is-coming)
- [GOV.UK AI Adoption Research](https://www.gov.uk/government/publications/ai-adoption-research/ai-adoption-research)
- [Octopus Energy — Kraken $8.65bn spin-out](https://kraken.tech/press-releases/octopus-energy-group-to-spin-out-kraken-at-valuation-of-8-65bn)
- [Tesco Digital Transformation FY2026 — £500m savings](https://infotechlead.com/cio/tesco-digital-transformation-2026-ai-clubcard-data-1-5-bn-capex-drive-growth-and-500-mn-savings-95179)
- [NVIDIA — JLR AI partnership](https://www.nvidia.com/en-us/solutions/autonomous-vehicles/partners/jlr/)
- [IAG — Engine Optimisation System (in-house AI)](https://www.aerotime.aero/articles/iag-eos-engine-maintenance-scheduling-artificial-intelligence)
- [Humphrey — UK civil service AI suite](https://www.globalgovernmentforum.com/yes-civil-servant-meet-humphrey-the-governments-ai-package-for-officials/)
- [BBC — "AI is already leading to fewer jobs for young people, says Sunak" (Faisal Islam, 23 Apr 2026)](https://www.bbc.co.uk/news/articles/cvg07x4rejdo) — former UK PM Rishi Sunak on entry-level flattening, *"flat is the new up"* CEO consensus, the proposed NI-to-corporate-profits tax rebalance, Lammy/Sunak cross-party *"Londonmaxxing / Britmaxxing"* tech-investment push, AISI's Mythos test, and the *"we shouldn't rely on companies to mark their own homework"* governance line. Cross-party UK political cover for M3 L1, L13 and L15.
- [FCA AI approach](https://www.fca.org.uk/firms/innovation/ai-approach)
- [ICO AI and biometrics strategy](https://ico.org.uk/about-the-ico/our-information/our-strategies-and-plans/artificial-intelligence-and-biometrics-strategy/our-plan-of-action/)
- [Azeem Azhar — Exponential View](https://www.exponentialview.co/)
- [Deloitte UK State of AI in the Enterprise 2026](https://www.deloitte.com/uk/en/issues/generative-ai/state-of-ai-in-enterprise.html)
- [KPMG Global Tech Report 2026](https://kpmg.com/uk/en/insights/technology/kpmg-global-tech-report.html)
