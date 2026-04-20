# Month 3 Lesson Ideas — Leading AI in Your Company

*Generated 2026-04-20. Sources: Rewired 2nd ed (McKinsey), PwC 2026 AI Performance Study, McKinsey AI Transformation Manifesto, a16z "Institutional AI vs Individual AI" (Sivulka), Ramp Glass write-ups (Goddijn, Glyman), Ethan Mollick, DBS Bank case, Vercel Open Agents, AI Daily Brief podcast transcript. **UK additions (2026-04-20):** PwC UK AI Jobs Barometer, UK AI Opportunities Action Plan (Clifford), Bank of England AI work, techUK + British Chambers of Commerce, Lloyds / HSBC / NatWest / Barclays, Tesco / M&S / Ocado, Octopus Energy Kraken, JLR, Rolls-Royce, British Airways / IAG, BT / Openreach, Starling / Monzo / Revolut, UK civil service (Humphrey), Azeem Azhar (Exponential View).*

*Research library: [`month-3-research/`](month-3-research/) · Book notes: [`rewired-book-notes/`](rewired-book-notes/) · UK landscape: [`month-3-research/12-uk-ai-landscape.md`](month-3-research/12-uk-ai-landscape.md) · UK case studies: [`month-3-research/13-uk-company-case-studies.md`](month-3-research/13-uk-company-case-studies.md)*

**Why UK additions?** The core argument of Month 3 is global, but GWTH participants are majority UK SMEs. Every non-UK data point below is paired with a UK equivalent so students can benchmark against domestic peers, cite UK regulators, and point to British case studies their teams can read, visit, or hire from. Nothing US or global is removed — the comparison is deliberately maintained so students can see how the UK is and isn't different.

---

## Month mapping recap

- **Month 1 — AI for Your Life** — foundations, first builds, automations for yourself.
- **Month 2 — AI for Your Industry** — production apps: pipelines, data, integrations.
- **Month 3 — AI for Your Company** — leadership, strategy, org-design, governance, culture. *Majority strategy, but with one Capstone build and four weekly mini-builds that produce concrete tools students can take back to their team.*

Month 3 is for the students who've finished Month 2 with working apps and now need to take AI back to their team, department, or company. The question moves from *"how do I use AI?"* to *"how do I get my team to use AI well?"* — and critically, *"what can I build that makes this transformation easier?"*

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

## Week 9 — Why AI Leaders Win: Strategy & Economics

**Arc:** The gap is real. It is structural, not tooling. The leaders think about AI as growth, not efficiency. The economics justify the investment.

### L1. The 20/75 Rule — Why Most Companies Are Already Losing the AI Race

**Description:** The PwC 2026 AI Performance Study of 1,217 executives across 25 sectors found that 20% of companies are capturing 74% of AI's economic value — and generating 7.2× more AI-driven revenue than the average competitor. This lesson unpacks what separates the 20% from the 80% (it isn't more tools) and asks participants where they currently sit.

**Key concepts:** 20/75 rule · leaders vs laggards · the widening gap · why tool quantity doesn't correlate with value.

**Project / activity:** Self-diagnostic — participants rate their own org 1–5 on five PwC dimensions (growth vs productivity framing, autonomous deployment, responsible AI framework, governance board, business-reinvention ambition). Produces a one-page *"Where are we on the AI maturity curve?"* artefact they can take to their leadership team.

**Bring your team along:** A one-page brief leaders can email to their team titled *"Why we need to get serious about AI now"*, citing the PwC finding.

**UK context:** The British Chambers of Commerce's March 2026 survey shows **54% of UK firms using AI** (up from 25% in 2024) — but only **11% of UK SMEs use AI to a great extent** to streamline operations. Top UK adopter sectors: IT & telecoms (56%), media/marketing (53%). Laggards: real estate (11%), transport (15%), hospitality (18%), manufacturing (19%), retail (19%). **HSBC UK** estimates AI adoption could unlock **£105bn in additional revenue for UK mid-sized firms by 2030** — a UK-scale answer to PwC's global 20/74 finding. The UK version of the diagnostic question is sharper: *we know the upside — are we capturing it, or sitting on the £105bn?*

**Research:** [02-pwc-ai-leaders-study.md](month-3-research/02-pwc-ai-leaders-study.md), [11-podcast-transcript-summary.md](month-3-research/11-podcast-transcript-summary.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md).

---

### L2. The AI Transformation Manifesto — McKinsey's 12 Themes

**Description:** In April 2026 McKinsey published "The AI Transformation Manifesto" — 12 themes distilled from hundreds of engagements that separate AI leaders from laggards. This lesson walks through all 12 as a checklist and rubric. It is the structural spine of the rest of Month 3.

**Key concepts:** enduring capabilities · economic leverage points · 20% EBITDA uplift · 30/70 talent · metabolic rate · right to deploy · agentic engineering · continuous re-learning.

**Project / activity:** 12-theme scorecard. Participants rate their org 1–5 on each theme and identify their three lowest scores — those become the 90-day priorities in L20.

**Bring your team along:** Share the scorecard with two colleagues. Compare scores. Where do you agree? Where do your perspectives diverge?

**UK context:** The **UK AI Opportunities Action Plan** (Matt Clifford review, Jan 2025) is the UK-government analogue of McKinsey's 12 themes. Its framing — *"AI maker, not just an AI taker"* — rhymes with Theme 1 (enduring capabilities) and Theme 7 (platforms as strategic assets). All **50 recommendations** have been endorsed by government, with most immediate steps scheduled within 12 months. KPMG's 2026 Global Tech Report (UK-led): **88% of organisations embedding AI agents** into workflows; **71% of CEOs** make AI a top investment priority. These are not US-only numbers — the manifesto's themes map directly onto the UK's own strategic map.

**🔨 Build link:** This lesson anchors **Mini-Build 1 — AI Maturity Scorecard Web App**. Students implement the 12-theme + PwC-leader rubric as a working web form that returns a radar chart and a one-page PDF. Details in the [Build Projects](#build-projects--mini-builds--capstone) section.

**Research:** [01-mckinsey-manifesto.md](month-3-research/01-mckinsey-manifesto.md), [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md).

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

**Description:** McKinsey's new-for-2nd-edition economic framing: AI leaders report **20% EBITDA uplift**, **1–2 year payback**, and **$3 of incremental EBITDA per $1 invested**. This lesson translates those enterprise numbers into an SME-scale investment case participants can actually write and defend. Covers the 1:1 investment rule ($1 on adoption for every $1 on build) and unit economics of inference, experimentation, and platforms.

**Key concepts:** unit economics · 1:1 adoption investment rule · value-at-stake · payback curves · inference cost curves.

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

**Description:** Rewired's defining argument (Ch 3, expanded): use-case-hunting produces a portfolio of disconnected pilots; domain work produces sequenced, cumulative value. A "domain" is a customer journey, a process, or a product line. A "use case" is a feature. This is the chapter that most contradicts what SME companies actually do.

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

**Description:** Rewired Ch 5 (new): agentic AI as a workflow-design primitive, not a feature. The lesson teaches a pattern language — "what part is the agent? what part is the human? what's the handoff?" — and the difference between bolt-on automation (decorated workflow) and reimagination (redesigned workflow).

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

**Description:** Rewired Ch 8 (new). Awareness is reading the newsletter. Muscle is knowing enough about the tech to make credible decisions and to push back on bad ones. This lesson maps a development path for non-technical leaders: what to learn, in what order, to a level that lets you lead domain redesign credibly. It's also the most direct argument for personal time investment (and for training the rest of the exec team).

**Key concepts:** tech literacy vs tech muscle · competency framework for leaders · learning cadence · the peer network.

**Project / activity:** Personal AI-muscle development plan — a 12-week schedule with specific tools the participant will use, topics they will learn, and demos they will give to their own team.

**Bring your team along:** Propose that every member of your leadership team does the same personal plan. [GWTH.ai](https://gwth.ai) is the fastest off-the-shelf curriculum for this.

**UK context:** The UK reference model for this is **Lloyds Banking Group's AI Academy** — launched 2026 and already trained **200 senior executives** in AI fluency. Note: it's called an *Academy*, not a briefing or a workshop — the structural framing matches Rewired Ch 8 exactly (awareness → muscle). UK peer signal: **techUK research** finds **27% of non-tech businesses and 35% of tech businesses** name expanding AI training as the top skills-gap priority for 2026 — so the pressure is institutional, not just personal. For SME leaders without a Lloyds-scale budget, GWTH.ai is explicitly positioned as the SME equivalent to an internal academy.

**Research:** [04-rewired-2nd-edition.md](month-3-research/04-rewired-2nd-edition.md) (Ch 8), [08-ethan-mollick-leadership.md](month-3-research/08-ethan-mollick-leadership.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md), [13-uk-company-case-studies.md](month-3-research/13-uk-company-case-studies.md).

---

### L12. The 30/70 Rule — Why AI Transformation Must Be In-House

**Description:** McKinsey: 70%+ of AI talent should be in-house. Ethan Mollick: you cannot outsource AI transformation to consultants because AI is *organisational learning*, and learning can't be bought. This lesson combines Mollick's "Leadership / Lab / Crowd" framework with McKinsey's talent ratio and gives participants a concrete in-house-vs-consultant decision rubric.

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

**Key concepts:** agents as team members · role redefinition · supervision as the new junior skill · performance measurement in mixed teams · org-chart implications.

**Project / activity:** Pick one team in the participant's org. Redesign its structure for a world where agents do 30–50% of the current junior work. What roles disappear? What roles emerge?

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

**Description:** Rewired Ch 34 (expanded) and McKinsey's 2026 AI Trust research. A solution doesn't ship by default; it must *earn* the right to ship. This lesson gives participants a concrete "right-to-deploy gate" checklist (model card, risk register, fairness review, monitoring plan, kill switch) and introduces DBS Bank's PURE framework as a four-word operational summary. Trust isn't a brake on adoption — the leaders with the strongest governance are also the most aggressive deployers.

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

**Research:** [09-ai-trust-right-to-deploy.md](month-3-research/09-ai-trust-right-to-deploy.md), [07-dbs-bank-case-study.md](month-3-research/07-dbs-bank-case-study.md), [12-uk-ai-landscape.md](month-3-research/12-uk-ai-landscape.md).

---

## Week 12 — Adoption, Culture & Your 90-Day Plan

**Arc:** Adoption is the hardest part. Measure what matters, not what's easy. Expect to pivot. Culture is the quiet prerequisite. Ship a 90-day plan and train your team.

### L16. Make Adoption Stick — It's a Redesign Problem, Not a Training Problem

**Description:** Rewired Ch 30 (expanded). Most AI programmes fail at adoption, not at model development. Adoption is not solved by more training; it's solved by redesigning the underlying business process around the new capability. This lesson explores the difference between *launched* and *adopted*, and introduces the 1:1 investment rule ($1 on adoption for every $1 on build).

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

**Description:** Rewired Ch 35 (rewritten). Culture is the quiet prerequisite and the final chapter of the book. The leaders in the PwC 20% share cultural traits: curiosity, permission to experiment, psychological safety around "I don't know", celebration of learning over being right. This lesson walks through cultural anti-patterns (blame for failed pilots, hero culture around senior technologists, "we've always done it this way") and the concrete cultural interventions that work.

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
- You cannot outsource this transformation (Mollick).
- 70%+ of your AI talent must be in-house (McKinsey).
- Individual breakthroughs are wasted if they don't become the team's baseline (Goddijn / Ramp).
- [GWTH.ai](https://gwth.ai) is the fastest way to take the 12 weeks you just did and put every member of your team through them.
- Name three people in your organisation. Enrol them this week. Don't make them figure it out alone.

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

**Spans:** The full month. Background work in Weeks 9–11, intensive build in Week 12, presentation at end of Week 12.

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
- **Infra:** Dockerised; deployed to Coolify on P520 at `assessment.gwth.ai` (course-provided domain) or Vercel free tier.

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

## Sources

Full research library at [`month-3-research/`](month-3-research/). Key primary sources:

### Global

- [The AI Transformation Manifesto — McKinsey (Apr 2026)](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-ai-transformation-manifesto)
- [PwC 2026 AI Performance Study](https://www.pwc.com/gx/en/news-room/press-releases/2026/pwc-2026-ai-performance-study.html)
- [Institutional AI vs Individual AI — George Sivulka, a16z](https://www.a16z.news/p/institutional-ai-vs-individual-ai)
- [Rewired 2nd Edition — McKinsey on Books](https://www.mckinsey.com/featured-insights/mckinsey-on-books/rewired)
- [DBS Bank — AI-Powered Digital Transformation](https://www.dbs.com/artificial-intelligence-machine-learning/artificial-intelligence/dbs-ai-powered-digital-transformation.html)
- [Eric Glyman — Ramp Glass announcement](https://x.com/eglyman/status/2043362828178841860)
- [Open Agents — Vercel Labs](https://github.com/vercel-labs/open-agents)
- [Ethan Mollick on Leadership / Lab / Crowd — One Useful Thing](https://www.oneusefulthing.org/p/making-ai-work-leadership-lab-and)
- [State of AI Trust 2026 — McKinsey](https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/tech-forward/state-of-ai-trust-in-2026-shifting-to-the-agentic-era)
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
- [FCA AI approach](https://www.fca.org.uk/firms/innovation/ai-approach)
- [ICO AI and biometrics strategy](https://ico.org.uk/about-the-ico/our-information/our-strategies-and-plans/artificial-intelligence-and-biometrics-strategy/our-plan-of-action/)
- [Azeem Azhar — Exponential View](https://www.exponentialview.co/)
- [Deloitte UK State of AI in the Enterprise 2026](https://www.deloitte.com/uk/en/issues/generative-ai/state-of-ai-in-enterprise.html)
- [KPMG Global Tech Report 2026](https://kpmg.com/uk/en/insights/technology/kpmg-global-tech-report.html)
