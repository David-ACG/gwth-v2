# Month 1 Lesson Ideas — AI for Your Life

*Generated 2026-04-20. Revised 2026-04-21. Supersedes `gwth-month1-redesign-v2-feb2026.md` (Feb 2026) and the `syllabus.json` Month 1 draft (Feb 2026).*

### Revision log

- **2026-04-21 (afternoon)** —
  - **Enrolment-motivation framing added.** New "Why students enrol — the four journeys" section up front maps every lesson to at least one of four student reasons for joining (redundancy/reskill · AI-anxiety · verifiable scores · parent planning). Drives a new closing lesson.
  - **New L22: Your AI-Era CV & LinkedIn Makeover (build lesson).** Directly serves Journeys 1–3. Students rewrite their CV with a dedicated AI Capabilities section, rebuild their LinkedIn headline/about/featured/skills, publish a "What I Built in 4 Weeks" carousel post, and record a 10-question interview answer bank. The GWTH score is cited as third-party evidence employers can verify.
  - **Lesson count now 22** (was 21); **build count now 16** (was 15). Capstone remains L18–L21 Family AI Bot; L22 is the career-distribution layer on top.
- **2026-04-21 (morning)** —
  - **Prescriptive tooling framing added.** New **L9: Your Building Toolkit — the GWTH Stack & Why We're Prescriptive** introduces the coding/building tools used across L10–L21 and explains the "big three + one challenger" assessment rule. Previous L9–L20 renumbered to L10–L21. Lesson count was 21 (was 20); build count was 15 (new L9 is a foundations/strategy lesson, not a build).
  - **Audience broadened.** Primary audience is **individuals and SMEs**, but GWTH is not restricted to them — larger companies are served via the **bespoke-lesson service** (one custom lesson per 100 students a single company enrols).
  - **Optional lessons** (up to 5) added as a planning placeholder for cutting-edge, small-audience, or not-yet-mainstream material that might graduate into the core later.
  - **Lab ideas list** added — lessons we decided *not* to teach because the topic is a head-to-head tool comparison that goes stale quickly. Labs are a natural home for cutting-edge tool shoot-outs.
  - **AI Skills Hub** references in L5 and the UK authority map updated to reflect the well-documented criticism the Hub received after launch (see `13-uk-regulatory-context.md` for the full record).

*Sources (global): OpenAI "Identifying and Scaling AI Use Cases" (6 primitives, April 2025) · OpenAI "A Practical Guide to Building Agents" (Dec 2024) · Ethan Mollick "Co-Intelligence" + One Useful Thing substack · Andrej Karpathy on "English is the new programming language" / LLM OS · The AI Daily Brief (NLW) · Anthropic prompting + Claude Code docs · Lovable / Bolt / v0 / Replit docs · ElevenLabs, Ideogram, Midjourney docs · Zapier AI Agents / Make AI · Dummies Guide to Generative AI & LLMs.*

*Sources (UK): ICO AI guidance for consumers · NCSC AI + prompt-injection guidance · FCA AI feedback statement · DSIT AI Safety Institute · UK AI Opportunities Action Plan (Clifford, Jan 2025) · techUK + British Chambers of Commerce adoption surveys · ONS productivity statistics · UK SME case studies · Azeem Azhar (Exponential View) · Tom Goodwin, Daniel Priestley, UK creator voices.*

*Research library: [`month-1-research/`](month-1-research/) · Pipeline ingestion folder: `C:/Projects/1_gwthpipeline520/data/PDFs_manual_download/GWTH_Month_1/`*

**Why UK additions?** Month 1 is where students form their relationship with AI. Every concept, tool and case study has a UK-native anchor so students can look at what a British person, brand or regulator actually did — then compare to the global benchmark. Global examples are never removed; they are the context. UK examples are the applied reality.

**Audience.** The core GWTH audience is **individuals and SMEs** — the 54% of UK firms using AI but the 11% using it deeply (BCC, March 2026), and the millions of UK adults (54%, Ofcom April 2026) who've opened ChatGPT once but don't yet use AI as a daily colleague. GWTH is not restricted to this audience. **Larger companies are served through GWTH's bespoke-lesson service — one custom lesson is produced for every 100 students a single company enrols.** That service is what attracts enterprise L&D to GWTH without compromising the main curriculum, which stays pitched at the individual/SME level where the biggest unmet need sits.

---

## Why students enrol — the four journeys

Every lesson in Month 1 must answer "why am I here?" for at least one of these four enrolment reasons. Most students arrive with a blend of two or three. The course addresses each directly:

### Journey 1 — *"I've been made redundant and need to reskill."*
The career-reset student. For them, every build goes in a **verifiable portfolio**, every capability is **demonstrable to a UK employer**, and GWTH's scoring system produces third-party evidence they can attach to a CV or LinkedIn profile. The UK context is hard: only **21% of UK workers** (CIPD 2026) feel confident using AI at work — which means the student who finishes GWTH is, within four weeks, in the top-quintile of the national workforce on AI fluency. Served directly by: **L22 (CV & LinkedIn makeover)**, L21 (portfolio), L10–L17 (every build is portfolio-grade), and the GWTH assessment (cited on CV).

### Journey 2 — *"I'm worried AI will take my job."*
The defensive-reskilling student. The honest answer: AI will not take your job, but **someone using AI will**. Month 1 turns the student into *that person* — the one on the team who ships the AI-built tool, automates the repetitive task, and shows up to meetings with a dashboard no one else knew how to build. Served directly by: L1 (the six primitives demo addresses this fear in lesson one), L10–L17 (every build increases the moat), L15 (agents do work while you sleep), L22 (how to signal this capability to current and future employers).

### Journey 3 — *"I want scores employers can trust."*
The credential-hunter. Most AI "certificates" in 2026 are from vendors selling their own tools — a conflict of interest. GWTH's **dynamic scoring system** stays current because the curriculum stays current: scores reflect what you can build with the tools that exist **right now** (April 2026), not what a course author wrote in 2024. The assessment ties to the portfolio — each build is graded against a rubric an employer can read. Served directly by: L3 (tool log as self-assessment), L21 (portfolio assembly), L22 (how to present scores on CV/LinkedIn), plus the GWTH grading artefact attached to every capstone.

### Journey 4 — *"I'm a parent thinking about my children's future."*
The family-strategy student. AI fluency will not be a nice-to-have for their children — it will be **table stakes**. The crucial insight: no coding is required. *If your teenager can describe what they want, they can build it.* The L10 "first app" and L12 "first website" lessons are as learnable by a 13-year-old as by a 45-year-old, and the parent who learns first becomes the household's AI mentor. Served directly by: the Family AI Bot capstone (explicitly a household artefact), L10–L16 (tools a parent can teach a child in an afternoon), L5 (the safety rules every family needs), and the Personal AI Assistant (L16) for study tutoring.

*Why this matters for lesson design.* Every build activity must be framable in at least two of these four journeys, or it doesn't belong in the core. Example — the L14 Dashboard is **portfolio ammunition (Journey 1)**, **productivity signalling (Journey 2)**, **a graded artefact (Journey 3)**, *and* **a household budget tool (Journey 4)** — four-for-four, which is why it's a headline build.

---

## Month mapping recap

- **Month 1 — AI for Your Life** — foundations, first builds, automations for yourself. Change the way students *think* about AI, then get them building. **16 of 22 lessons have a build project** (the 6 non-build lessons are foundations, research/content, ideation, and the building-toolkit primer). Capstone: **Family AI Bot**. Closing lesson: **CV & LinkedIn Makeover** (L22) turns the portfolio into career ammunition.
- **Month 2 — AI for Your Industry** — production apps: pipelines, data, integrations.
- **Month 3 — AI for Your Company** — leadership, strategy, governance.

Month 1 exists to take someone whose entire AI experience is *"I've asked ChatGPT a few questions like a fancy Google"* and, in four weeks, turn them into someone who:

1. **Thinks about AI as a knowledgeable colleague**, not a search engine.
2. **Covers all six OpenAI primitives** (Research, Content, Coding/Building, Data Analysis, Ideation, Automation) — with a heavy bias toward *Building*.
3. **Has shipped 16 simple hands-on builds** plus the Family AI Bot capstone.
4. **Has a committed tool stack**, a prompt library, a small portfolio, and the confidence to use AI for everything they can — backed by a Tool Log that ranks the alternatives they've tried against the GWTH defaults.
5. **Has a CV and LinkedIn profile rewritten for the 2026 AI-first job market** — with links to every artefact they built, a narrative employers actually value, and a verifiable GWTH score attached.

---

## The core argument for Month 1

Almost everyone today thinks of ChatGPT as "Google with better search results." That mental model is the single biggest blocker to getting value from AI. **AI is not a search engine; it is a very knowledgeable, very fast, very patient colleague who can write, code, draw, talk, analyse, plan, and do things for you.** The first few lessons exist to break the search-engine habit before it calcifies. Once the colleague mental model is installed, the rest of the course becomes a sequence of "what would I ask a knowledgeable colleague to do for me?" — and then doing it.

**Everything else follows from that mindset shift.** The primitives are the categories of colleague work. Prompting is how you brief a colleague. Tools are the colleague's hands. Agents are the colleague working unattended. Builds are the artefacts the colleague produces that you actually use.

---

## Why building dominates the month

OpenAI's "Identifying and Scaling AI Use Cases" (April 2025) distilled 300+ enterprise implementations into six fundamental use-case patterns — the **six AI primitives**: Content Creation, Research, Coding/Building, Data Analysis, Ideation & Strategy, Automation. Of these six, **Coding/Building has emerged as the single highest-leverage skill for individuals** — the one that took AI from "helpful assistant" to "I can make things that didn't exist before." Vibe coding with Claude Artifacts / Lovable / Bolt / v0 has become the new Microsoft Office — a baseline productivity skill everyone should own. We therefore cover all six primitives, but **16 of the 22 lessons include a build project**, and the capstone is a full end-to-end build.

This matches what the AI Daily Brief and OpenAI's own data show: of the six primitives, coding has by far the biggest *delta* between "leaders" and "laggards" in both company and individual productivity. Beginners who learn to build get to "I can make any tool I need" — a capability no other primitive provides.

**UK framing.** PwC's UK AI Jobs Barometer shows productivity growth in AI-exposed industries nearly quadrupling (7% → 27%) since 2022, with the biggest gains in sectors that *build* with AI (IT, professional services, finance). Lovable, one of the fastest-growing European AI startups, is a UK/European success story that British students can identify with. The UK government's AI Opportunities Action Plan explicitly calls for the UK to become "an AI maker, not just an AI taker" — we're training makers.

---

## The 22 lessons at a glance

| # | Lesson | Primary primitive | Build? | Week |
|---|--------|-------------------|-------|------|
| L1 | Welcome — what AI can *actually* do for you | Foundations / Mindset | Yes — *AI Wishlist* | 1 |
| L2 | Stop using AI like Google — the colleague mental model | Foundations / Mindset | Yes — *Same Question Test* | 1 |
| L3 | Your AI toolkit — set up once, use forever | Foundations | Yes — *Tool Log* | 1 |
| L4 | Getting great results — the prompting skills that matter | Foundations | Yes — *Prompt Makeover* | 1 |
| L5 | AI safety in 60 seconds — the five rules | Foundations | Yes — *Catch the Hallucination* | 1 |
| L6 | Research with AI — find anything, fast | Research | Yes — *Life Research Project* | 2 |
| L7 | Content creation — write anything, fast | Content | Yes — *Content Sprint* | 2 |
| L8 | Content creation — images, audio & video | Content | Yes — *Visual Content Package* | 2 |
| L9 | **Your building toolkit — the GWTH stack & why we're prescriptive** | Foundations / Strategy | Activity — *Stack Commitment* | 2 |
| L10 | Build your first app — the moment everything changes | **Coding / Building** | Yes — *My First App* | 2 |
| L11 | Build something bigger — tools that solve real problems | **Coding / Building** | Yes — *Personal Utility* | 2 |
| L12 | Build your first website | **Coding / Building** | Yes — *My Website* | 3 |
| L13 | Data analysis — ask questions, get answers | Data Analysis | Yes — *Personal Finance Analysis* | 3 |
| L14 | Build a dashboard — combining primitives | Coding + Data | Yes — *My Dashboard* | 3 |
| L15 | Meet the agents — AI that works while you sleep | Automation + Coding | Yes — *First Agent Task* | 3 |
| L16 | Custom GPTs & Claude Projects — your personal AI assistant | Coding + Automation | Yes — *My Personal AI Assistant* | 3 |
| L17 | Automation basics — Zapier, Make, n8n | Automation | Yes — *Save Yourself an Hour* | 4 |
| L18 | Ideation & planning — designing your Family AI Bot | Ideation & Strategy | Yes — *Bot Blueprint* | 4 |
| L19 | Transcription & extraction — teaching AI to listen | Research + Content | Yes — *Family Meeting v1* | 4 |
| L20 | Building the processing engine + distribution | **Coding + Automation** | Yes — *Family Bot Working* | 4 |
| L21 | Polishing, presenting & your month-1 portfolio | Content + Meta | Yes — *Portfolio + Family Bot Launch* | 4 |
| L22 | **Your AI-era CV & LinkedIn — turning 4 weeks of builds into career ammunition** | **Career / Meta** | Yes — *CV + LinkedIn Rebuild* | 4 |

**Build project count:** 22 of 22 lessons have a hands-on activity. **16 of those are code/tool builds** (L3, L7, L8, L10–L17, L19, L20, L21, L22) — the rest are applied artefacts or strategy work (wishlist, prompt library, research project, stack commitment, bot blueprint). The Capstone **Family AI Bot** is anchored in L18–L21. The month closes with **L22**, which explicitly serves Journeys 1, 2 and 3 (redundancy / AI-anxiety / verifiable scores) by converting every previous artefact into a concrete CV + LinkedIn story.

---

## Week 1 — Mindset, Toolkit, Prompting, Safety (L1–L5)

**Arc:** *Stop thinking of AI as Google. Start thinking of it as a colleague. Set up the tools that colleague needs. Learn to brief them. Learn the five safety rules.*

### L1. Welcome to GWTH — What AI Can *Actually* Do for You

**Description:** Six live demos of what AI can do that most people have never seen — one from each of the OpenAI primitives. **Research** a product in two minutes using Perplexity Comet (now free worldwide). **Content**: write and publish a polished LinkedIn post from a voice memo; then turn it into an image with Ideogram 3 and a 30-second voiceover with ElevenLabs v3. **Coding**: build a working mortgage calculator in thirty seconds in Claude Artifacts (which in April 2026 now has persistent storage up to 20 MB, so the calculator remembers your rates). **Data**: upload a bank statement and watch charts appear. **Ideation**: voice-mode brainstorm of a side business while doing the washing up. **Automation**: watch Claude Cowork (Opus 4.7, now with plugin marketplace) organise a messy Downloads folder autonomously.

**The four-journey frame.** L1 names the four reasons students enrolled and commits the course to each: *"If you're here because you've been made redundant, every build this month goes in your portfolio and your CV — L22 closes the loop. If you're here because you're worried AI will take your job, the answer is to be the one on the team who ships with it. If you're here because you want scores employers can trust, GWTH's rubric is attached to every capstone and citable on your profile. And if you're here because you're a parent thinking about your kids, the Family AI Bot is literally a household artefact — build it with them."* Previews the Family AI Bot capstone *and* the L22 CV/LinkedIn rebuild.

**Key concepts:** the six OpenAI primitives · superpower framing · career accelerator vs replacement · compounded capability · the "90 days from ChatGPT user to builder" promise · **"Year of the AI Builder"** (NLW, AI Daily Brief, 2026).

**Build / activity:** ***My AI Wishlist*** — write down 10 things you wish AI could do for you. Rate each 1–5 for impact on your life. Save — by Week 4 you'll cross off most of them.

**Mindset moment:** You are not learning about AI. You are *recruiting a colleague*.

**UK context:** **Ofcom's Adults' Media Use and Attitudes Report (April 2026)**: **54% of UK adults** now use ChatGPT, Copilot or Gemini (79% of 16–24s, 74% of 25–34s). Common UK uses documented by Ofcom: wedding speeches, room-layout planning, breakup advice, DIY research, companionship (12% overall, 19% among 25–34s). **British Chambers of Commerce (March 2026)**: 54% of UK firms use AI, but only **11% deeply** — i.e. the gap between "used once" and "use daily" is where GWTH lives. AI skills in 2026 are the new Excel skills of 1995.

**Research:** [`month-1-research/01-six-primitives.md`](month-1-research/01-six-primitives.md), [`02-mindset-colleague-not-google.md`](month-1-research/02-mindset-colleague-not-google.md).

---

### L2. Stop Using AI Like Google — the Colleague Mental Model

**Description:** The single most important lesson in Month 1. Why most people get mediocre results: they ask short keyword questions and skim links, because that's the habit 25 years of Google trained in them. LLMs punish that workflow; they reward the opposite — prose, context, role, iteration, conversation. This lesson installs the shift using three anchors.

**Anchor 1 — Ethan Mollick's four rules (from *Co-Intelligence*).** (1) Always invite AI to the table. Try it on every task. (2) Be the human in the loop — interrogate the output. (3) Treat AI like a person, and *tell it what kind of person* (give it a role). (4) Assume this is the worst AI you'll ever use. His working metaphor: **"an infinitely fast intern, eager to please but prone to bending the truth."** AI has a **"jagged frontier"** — superhumanly good at a sonnet, hilariously bad at counting the words in it. You only learn the shape by using it.

**Anchor 2 — Andrej Karpathy's "Software 3.0".** The hottest new programming language is English. You don't *search* AI; you *direct* it. This reframes every task as *"what would I ask a colleague to do?"* then doing that.

**Anchor 3 — the library-vs-colleague analogy.** Google is a library — you go in, grab a book, leave. AI is a colleague — you brief them, they draft, you react, they revise. A **working session**, not a search.

Four mental shifts installed in this one lesson: **(1)** AI is a colleague, not a search engine. **(2)** A prompt is a brief, not a query. **(3)** A conversation is a working session, not a Q&A. **(4)** You are the manager, AI is the intern — if the output is wrong, your brief was wrong.

**Key concepts:** jagged frontier · co-intelligence · Software 3.0 · library-vs-colleague · the manager-intern model · persona priming · iterate don't restart.

**Build / activity:** ***The Same Question Test*** — take a real question you've asked AI before that gave a mediocre answer. Ask the *same* question to Claude (Sonnet 4.6), ChatGPT (GPT-5.4 Thinking) and Perplexity. Then **re-brief** using Role + Context + Task + Format + Constraints (L4 preview). Ask again. Record the delta. **Bonus:** ask the AI *"What kind of person should you be to answer this brilliantly?"* before you answer — then use that persona.

**Mindset moment:** If the output is bad, the brief was bad. Never blame the AI.

**UK context:** **Daniel Priestley** (*Key Person of Influence*, UK LinkedIn, Scorecasts) has popularised the "AI-first business" and "AI as your best employee" framings to UK audiences. **Azeem Azhar** (Exponential View) frames the same shift as *"co-intelligence"*. **Tom Goodwin** hammers "AI-first, not AI added on" repeatedly. UK ICO guidance explicitly warns consumers to treat AI output as a draft to verify, not a fact to cite — that maps exactly onto the colleague model. **NLW (The AI Daily Brief)**: 2026 is *"the Year of the AI Builder"* — the colleague isn't just helping you write; they're helping you make software.

**Research:** [`02-mindset-colleague-not-google.md`](month-1-research/02-mindset-colleague-not-google.md), [`03-mollick-cointelligence.md`](month-1-research/03-mollick-cointelligence.md), [`04-karpathy-llm-os.md`](month-1-research/04-karpathy-llm-os.md).

---

### L3. Your AI Toolkit — Set Up Once, Use Forever

**Description:** Create accounts, install apps, configure settings. Honest side-by-side comparison of the four assistants a British beginner should have access to in April 2026:

| Assistant | Model lineup (Apr 2026) | Pricing (UK approx) | Why a beginner wants it |
|-----------|--------------------------|---------------------|-------------------------|
| **Claude** | Haiku 4.5 / **Sonnet 4.6** (workhorse) / **Opus 4.7** (GA 16 Apr 2026) | Free; Pro $20/mo (~£16); Max 5× $100/mo; Max 20× $200/mo | Best for writing, building (Artifacts + Projects), 1 M-token context, plays Cowork + Chrome. |
| **ChatGPT** | GPT-5.3 Instant (free) / GPT-5.4 Thinking / GPT-5.4 Pro | Free; Go $8; Plus $20 (~£16); **Pro $100/mo NEW** (9 Apr 2026); Pro $200; Business $25/user | Broadest feature set: Atlas browser (macOS only — UK Windows users wait), Codex, Deep Research, Agent, Custom GPTs, Image Gen 1.5. |
| **Gemini** | Gemini 3 Pro (Jan 2026) / 3.1 Pro preview | **Google AI Plus $7.99** (new cheap tier); AI Pro $19.99 (~£16); AI Ultra $249.99. *Free Pro tier removed 1 Apr 2026 — Flash/Flash-Lite still free.* | Deep Google Workspace integration (Gmail, Docs, Sheets, Meet, Drive) — matters for UK workplaces on Workspace. |
| **Perplexity** | Sonar + frontier models (GPT-5.4, Claude, Gemini 3) — "Model Council" lets you pick | Free; Pro $20/mo; Max $200/mo; **Comet browser now FREE worldwide** | Best research with citations. Comet free is a big 2026 story. |

Install **Claude Desktop** (for Cowork and Projects later). Mobile apps on the phone. Privacy and pricing broken down for UK consumers. **USD billing note:** Claude, ChatGPT, Gemini all bill in USD — UK users pay card FX (roughly £0.80 per $1); budget ~5% extra for FX/processing.

**Retired / shut down (remove from instructional references):** GPT-4o, GPT-4.1 and the original GPT-5 were retired 13 Feb 2026. **Sora** is shutting down **26 April 2026** — do not build Month 1 demos around it. OpenAI **Operator** shut down 31 Aug 2025 (replaced by ChatGPT Agent). **DALL-E 3** being deprecated from API 12 May 2026 (ChatGPT image gen is now GPT Image 1.5).

**Key concepts:** multi-assistant fluency · desktop vs web vs mobile · free vs Pro vs Max tiers · USD billing · UK-relevant privacy (ICO guidance) · the "tool log" discipline.

**Build / activity:** ***Tool Log v0*** — a one-page template the student fills in throughout the month. For each tool (Claude / ChatGPT / Perplexity / Gemini / ElevenLabs / Lovable / Bolt / Claude Artifacts) rate 1–5 on three axes (power, ease, UK usefulness) and one sentence on what you'd reach for it for.

**Mindset moment:** Don't be monogamous. Different colleagues for different jobs.

**UK context:** All four core assistants available to UK consumers without a VPN. **ChatGPT Health** launched 7 Jan 2026 but is **explicitly excluded from UK, EEA and Switzerland** — teaching point that "US tutorial ≠ UK reality." ICO privacy guidance: free-tier tools often train on your inputs; never paste passwords, NHS numbers, client PII, or confidential docs into a free-tier account — you remain the data controller and carry the liability (ICO *Guidance on AI and data protection*, 2024, updated 2025).

**Research:** [`05-april-2026-tool-ecosystem.md`](month-1-research/05-april-2026-tool-ecosystem.md), [`13-uk-regulatory-context.md`](month-1-research/13-uk-regulatory-context.md).

---

### L4. Getting Great Results — the Prompting Skills That Matter

**Description:** Why most people's prompts fail: vague, contextless, unbriefed. The five elements of a strong brief: **Role · Context · Task · Format · Constraints**. Meta-prompting ("write me a prompt that…"). Few-shot examples ("here are three good ones — now do mine"). Chain-of-thought for beginners ("think step by step and explain your reasoning"). The **applied concept of context windows** — AI has a finite working memory; long chats decay; paste key information at the top; start a new chat for a new topic. Iterate don't restart: refine what AI gives you instead of starting over. Tone and style control ("write in British English", "match this voice sample").

**Key concepts:** RCTFC framework · meta-prompting · few-shot · chain-of-thought · context windows · iterate-not-restart · system prompts vs user prompts (introduced lightly, returns in L16).

**Build / activity:** ***Prompt Makeover*** — take three mediocre prompts you've actually used with AI. Rewrite each using RCTFC. Run before/after on Claude. Save the five best improved prompts into your **Prompt Library** — a Notion page, Claude Project, or plain markdown file you'll grow throughout the course.

**Mindset moment:** Promptcraft is the single highest-ROI hour you can spend in AI.

**UK context:** Anthropic published its prompting guide from its UK-adjacent research team. The UK Government Digital Service published internal prompt templates for civil servants using Humphrey (the UK's own gov AI assistant launched 2025). Students can look at what a UK civil servant is told to do and mirror it.

**Research:** [`06-prompting-fundamentals.md`](month-1-research/06-prompting-fundamentals.md), [`13-uk-regulatory-context.md`](month-1-research/13-uk-regulatory-context.md).

---

### L5. AI Safety in 60 Seconds — Just the Rules That Matter

**Description:** Five simple, memorable rules — not a lecture on AI ethics. Each rule has a UK authority and a UK teaching example from 2025–26.

**Rule 1: Verify.** AI hallucinates confidently. NCSC: *"LLMs contain serious flaws, including the ability to get things wrong and 'hallucinate' incorrect facts."* **UK teaching examples:** the **Ayinde / Al-Haroun** London High Court referral (June 2025) — a barrister cited 5 non-existent cases, a solicitor cited 18 hallucinated authorities; the court warned of "severe penalties." In 2026: **M v F (Fact Finding Hearing) [2026] EWFC 22**, **Re A,B,C,D [2026] EWFC 71**, **Brightwaters Energy v Eroton [2026] EWHC 296** — all involve AI-generated fake citations. **Layla Parsons** (barrister, March 2026) self-reported after citing four fabricated cases. **~60 UK hallucination cases** on record by April 2026 (global total >1,100).

**Rule 2: Don't share secrets.** NCSC: *"the query will be visible to the organisation providing the LLM… queries are stored and will almost certainly be used for developing the LLM service."* ICO: if a UK employee pastes client data into free ChatGPT, **the employer remains the data controller and carries the liability**. Rule of thumb: if you wouldn't post it on LinkedIn, don't paste it into free ChatGPT. Upgrade to paid/Team/Enterprise for anything sensitive.

**Rule 3: Your stamp.** AI content needs your review before it goes out with your name on it. You own the tone, the claims, the mistakes. **UK example:** the Reform UK party's **AI-generated "supporters" image (9 April 2026)** — deformed sausage-fingers, nonsensical placard text, used to claim the "largest political party by members." Detectors flagged it with high confidence; brand trust hit. If you push AI output unchecked, *you* own the damage.

**Rule 4: Check the date.** Model knowledge has cutoffs. Prices, laws, people's jobs change. Ask *"when is your data from for this topic?"* and verify time-sensitive claims with a current source. Relevant April 2026 UK: tax bands, Council Tax, childcare hours policy, State Pension rates all move annually.

**Rule 5: Too good to be true.** Fake citations, hallucinated statistics, made-up case law. URLs and papers that look perfect are the highest-risk zone. **UK example:** the **RSPCA** had to issue a public statement (10 April 2026) that a viral photo of 250 rescued dogs was **genuine, not AI** — the "liar's dividend": once AI fakes are common, real content gets accused too.

How to spot deepfakes (60-second version). A one-page **Personal AI Usage Policy** template the student fills in. Deep ethics is deferred to Month 2/3.

**Key concepts:** hallucination · data leakage · provenance · verification habits · personal AI policy · liar's dividend.

**Build / activity:** ***Catch the Hallucination*** — 10 factual claims generated by AI; 3 are wrong, and one is a real case the AI is about to get right (to practice not crying wolf). Student must identify which and prove it with a second source. Builds the verification reflex.

**Mindset moment:** Your name on it = your responsibility for it.

**UK context:** Maps cleanly to the **five UK authorities** every learner should know exist: **ICO** (data protection + "disclose when users are talking to AI"), **NCSC** (security + prompt injection guidance), **FCA** (AI in financial services), **DSIT AISI — the AI Security Institute** (renamed from AI Safety Institute in 2025; tested 30+ frontier models in 2025), and **the AI Opportunities Action Plan** (Matt Clifford; 38 of 50 recs delivered at one-year mark, Jan 2026). These are *authorities to cite*, not documents a beginner has to read.

**UK skills landscape — honest framing.** The **AI Skills Hub** (aiskillshub.org.uk, launched 28 Jan 2026 as part of the Action Plan's 10-million-worker target) is a directory students will encounter in UK press coverage. Be honest with students about what it is *and* what went wrong with it: of 600+ listed courses only 14 are benchmarked; 60% of courses are in fact paid despite "free" framing; some courses found to be 10–20 years old; one course taught US "fair use" doctrine that doesn't exist in UK copyright law and was pulled after *The Telegraph* broke the story; all 14 "badged" courses are from US big tech (Accenture, Amazon, Google, IBM, Microsoft, etc.); a parody site (aishillshub.org.uk) launched within weeks. Techosaurus's 5-flaws user test and Computer Weekly's sovereignty critique are worth a skim. Teaching point for beginners: a government directory is not a quality signal — check the age, provider, and UK relevance of anything you learn from. GWTH's own **free labs** (covered in L9 and referenced in `13-uk-regulatory-context.md`) are the counter-example: UK-focused, platform-agnostic, genuinely free.

**Research:** [`07-ai-safety-five-rules.md`](month-1-research/07-ai-safety-five-rules.md), [`13-uk-regulatory-context.md`](month-1-research/13-uk-regulatory-context.md).

---

## Week 2 — Research, Content, Toolkit, First Builds (L6–L11)

**Arc:** *You can brief a colleague. Now put them to work. Three non-build lessons (research + content × 2), then the building-tools primer so you commit to a stack, then the moment everything changes: your first build. End the week with a bigger build.*

### L6. Research with AI — Find Anything, Fast

**Description:** The research workflow: **broad scan → dig deeper → verify → synthesise**. **Perplexity Deep Research** (now Claude-powered as of late 2025) for sourced answers with citations. **ChatGPT with browsing** (or ChatGPT Atlas browser) for current information. **Claude with uploaded documents** for deep analysis. Upload-and-ask: drag a PDF / image / spreadsheet / audio file into AI and question it directly. Multi-source triangulation: ask the same research question to two tools, compare. How to break a 200-page report into sections AI can handle (context-window discipline from L4).

**Key concepts:** upload-and-ask · sourced vs unsourced research · multi-source triangulation · research synthesis · context-window discipline.

**Build / activity:** ***Life Research Project*** — pick a real thing you need to research this month (a holiday, a school, a mortgage product, a health question, a career move, a major purchase). Run a full AI-assisted research workflow. Produce a one-page summary with five verified citations. This must be something you actually use. Save the prompt sequence into your Prompt Library.

**UK context:** UK journalists publishing their Perplexity/Deep Research workflows (Azeem Azhar's Exponential View, FT Tech, The Times Tech). NHS 111 pilots using AI for triage. UK universities formally permitting AI-assisted research with citation.

**Research:** [`08-research-workflows.md`](month-1-research/08-research-workflows.md), [`12-uk-beginner-use-cases.md`](month-1-research/12-uk-beginner-use-cases.md).

---

### L7. Content Creation — Write Anything, Fast

**Description:** Professional writing with AI: emails, reports, proposals that sound like *you*, not a robot. **Voice training** — paste three samples of your own writing and say "match this style". The editing workflow: rough draft → AI polish → your final touches. The **70/30 rule**: let AI do 70% of the heavy lifting; you add the 30% that makes it yours. Social-media content: posts, captions, hashtags, calendars. Long-form: blog posts, articles, newsletters, reports. The **applied concept of system prompts** — some tools let you set permanent instructions ("always write in British English", "never use em-dashes", "never use the word 'delve'"). Set once and forget.

**Key concepts:** voice matching · 70/30 rule · system prompts · editing workflow · tone/register control · British English vs US English (explicit!).

**Build / activity:** ***Content Sprint*** — create three real pieces of content you need this week: one email you actually have to send, one social post you actually want to publish, and one longer piece (blog post / report / letter / LinkedIn article). Each must sound like *you*. Time yourself against how long it would have taken you unaided.

**UK context:** UK solopreneurs and creators (Daniel Priestley, Steven Bartlett's team, Josh Simons, UK LinkedIn community) routinely publish "my AI content system" threads. UK copywriters moving to "AI-assisted" billable rates. UK marketing agencies quoting AI-assisted content at 3–5× previous throughput.

**Research:** [`09-content-creation-writing.md`](month-1-research/09-content-creation-writing.md), [`12-uk-beginner-use-cases.md`](month-1-research/12-uk-beginner-use-cases.md).

---

### L8. Content Creation — Images, Audio & Video

**Description:** The April 2026 generator landscape.

**Images.** **GPT Image 1.5** (inside ChatGPT, replaced DALL-E — DALL-E 3 being deprecated from API 12 May 2026). **Ideogram v3** (best **text-in-image** — ~90% accuracy for typography on posters, menus, signage). **Midjourney V8** (launched March 2026 — 5× faster, native 2K, best aesthetic quality; Basic $10, Standard $30, Pro $60, Mega $120). **FLUX 2 / FLUX 2 Pro** (~40% of API market share in 2026, photorealism leader, available via fal.ai / Replicate at ~$0.03–0.05/image).

**Audio / TTS.** **ElevenLabs v3** — most expressive TTS; can sigh, whisper, laugh. Starter $6/mo (~£5) is the ideal student entry. Voice cloning requires consent (ElevenLabs requires a recorded consent phrase; UK + EU audiences increasingly legislating). **ElevenLabs Audiobook Platform** (Feb 2026) pays indie authors 60% royalty on direct sales + Spotify distribution — name-drop as "what you could build toward."

**Video — IMPORTANT 2026 reality.** **OpenAI Sora is shutting down 26 April 2026** (app closes; API sunsets 24 Sep 2026). **Do not teach Sora.** The replacements:
- **Google Veo 3.1 / 3.1 Fast / Lite** — the only mainstream model with synced audio; integrated into Gemini app, Flow and Google Vids (from April 2026). Included in Google AI Pro $19.99 (~£16). **This is the Month 1 default.**
- **Runway Gen-4.5** — cinematic control, motion brush. Standard $12/mo.
- **Kling 3.0** — budget pick, ~$0.50/clip via fal.ai, up to 2-minute clips.
- **Seedance 2.0** (ByteDance) — topped 2026 quality benchmarks; via APIs.

**AI avatar video.** **Synthesia** (UK-founded, London) — serves **70%+ of FTSE 100** for corporate training; clients include NatWest, Lloyds, NHS, the UN. Starter ~$22/mo (10-min cap); Enterprise for full translation. **HeyGen Avatar IV** — Creator $29/mo with unlimited videos, 175+ languages; UK invoices include VAT.

**AI presentations.** ChatGPT or Claude to draft a deck; export to PowerPoint/Google Slides. Gamma, Beautiful.ai, Tome for polished decks. Honest note on copyright: UK Intellectual Property Office is still working through the training-vs-output question (text-and-data mining exception under review). Rule of thumb: generated output is generally yours to use commercially, but check each tool's terms; never generate a real person's likeness commercially without consent.

**Key concepts:** image generator selection · text-in-image · Sora is dead, long live Veo · TTS + voice cloning + consent · UK avatar leadership (Synthesia) · copyright basics · ASA guidance on AI endorsements.

**Build / activity:** ***Visual Content Package*** — for the same topic as your L7 content, create: a matching social image (Ideogram 3 or GPT Image 1.5), a three-slide deck (ChatGPT or Gamma), a 30-second TTS audio version (ElevenLabs Starter). **Stretch:** a 15-second Veo 3.1 video clip with synced audio. A complete content package from one idea.

**UK context:** **Synthesia is a UK-founded unicorn** and widely adopted by UK corporates for L&D. UK music industry's ongoing position on AI + copyright (UK Music lobbying on training-data licensing). UK **ASA** on AI-generated endorsements. UK **Reform UK sausage-finger AI supporters image (Apr 2026)** also fits here — what not to do in political / brand image.

**Research:** [`10-content-creation-multimodal.md`](month-1-research/10-content-creation-multimodal.md), [`12-uk-beginner-use-cases.md`](month-1-research/12-uk-beginner-use-cases.md).

---

### L9. Your Building Toolkit — the GWTH Stack & Why We're Prescriptive

**Description:** The April 2026 AI tool landscape has hundreds of options for every job. "Here are 10 tools, pick one" is how the AI Skills Hub ended up with 600 courses and a string of critical reviews. GWTH does the opposite: **we prescribe a default tool for every job, teach you to master it, and only expose the alternatives in Labs** — short, repeatable head-to-head comparisons that can be refreshed when tools evolve without touching the core curriculum.

**The big-three-plus-challenger rule.** When we assess any AI tool, we look at what **Google, OpenAI, and Anthropic** each offer, plus at most **one independent challenger** that wins on a specific axis (e.g., V0 for UI design, Ideogram for text-in-image, Lovable for no-code web apps). Anything further becomes a Lab.

**The GWTH prescribed stack (April 2026).**

| Job | GWTH default | Big-3 alternatives | Challenger (seen in Labs) | Why this default |
|-----|-------------|---------------------|---------------------------|------------------|
| General assistant | **Claude (Sonnet 4.6 / Opus 4.7)** | ChatGPT, Gemini | Perplexity | Best at writing + building + long context; covered in L3 |
| Personal tools / first apps | **Claude Artifacts** (persistent 20 MB) | OpenAI Canvas, Gemini Canvas | — | Only one with persistent storage inside chat |
| Shareable web apps | **Lovable** | (none from big-3 for no-code web) | Bolt.new, Replit Agent, v0 | 60% non-developer users; strong UK adoption; free tier |
| Design prototypes | **Claude Design** | Google Stitch, ChatGPT Canvas | **v0** | Head-to-head decided per Lab (see Lab #1) |
| Terminal / repo coding | **Claude Code** | OpenAI Codex, Gemini CLI | Cursor IDE | CLI is portable; Cursor still best IDE (seen in a Lab) |
| Agent workspace | **Claude Cowork** | ChatGPT Agent, Gemini "Project Mariner" | — | Sandboxed + plugin marketplace (1,000+ skills) |
| Browser agent | **Claude for Chrome** | ChatGPT Atlas (macOS only) | — | Chrome + Edge; UK Windows users can't use Atlas yet |
| Transcription | **Whisper (via ChatGPT/Claude) or Fathom free** | Google Meet AI, Teams Copilot | Voxtral, Otter | Free or near-free + good enough for 95% of cases |
| Image generation | **GPT Image 1.5 / Claude image / Gemini 3 Pro image** | (covered by the big three) | Ideogram (text-in-image), Midjourney (art), FLUX (API) | Big-three covers ~80% of beginner needs |
| Voice / TTS | **ElevenLabs v3 Starter ($6/mo)** | Google TTS, ChatGPT voice | PlayHT, HeyGen voice | Most expressive; student-friendly price |
| Video | **Google Veo 3.1** | (no Anthropic/OpenAI equivalent post-Sora) | Runway Gen-4.5, Kling 3.0, Seedance 2.0 | Only mainstream model with synced audio; bundled in Google AI Pro |
| Automation | **Zapier** (with Copilot) | (none from big-3 do automation natively) | Make.com Maia, n8n 2.0 | Widest UK app ecosystem; cheapest learning curve |

**Why prescribe at all?** The alternative produces three bad outcomes: (1) analysis paralysis — students spend more time choosing tools than using them, (2) shallow fluency across many tools instead of real skill in one, (3) constant tutorial rot because every article references a different stack. Mastering a reliable default is worth more than dabbling in a dozen.

**Why these specific defaults?** They share four properties: available to UK consumers without a VPN, billed in a currency a UK student understands (USD with GBP conversion, or GBP direct), have a genuinely free or student-affordable tier, and interoperate cleanly (e.g., Claude Projects + Zapier + Google Calendar is a stable triangle used throughout the capstone).

**Labs are where alternatives live.** Labs are short (≈20–40 min), repeatable, and can be refreshed independently of the core curriculum when tools change. They are also **genuinely free** and form the first thing GWTH pitches to the UK AI Skills Hub (see `13-uk-regulatory-context.md` for the AI Skills Hub strategy). The first few planned labs:

1. **Claude Design vs Google Stitch vs v0** — design a website, a 3-slide deck, and a logo from the same brief. Judge on quality, speed, editability, export.
2. **Lovable vs Bolt.new vs Replit Agent** — build the same simple web app (e.g., a booking form) three ways.
3. **Claude Code vs OpenAI Codex vs Gemini CLI** — fix the same bug in the same repo three ways.
4. **Midjourney V8 vs FLUX 2 vs Ideogram v3 vs GPT Image 1.5** — same brand brief, four images.
5. **Zapier Agents vs Make Maia vs n8n 2.0** — same 3-step automation, same inputs.

See the **Lab ideas** section at the end of this document for the full candidate list.

**Key concepts:** prescriptive vs permissive teaching · the big-three-plus-challenger rule · the Lab-vs-Lesson distinction · Tool Log as your personal leaderboard · cost of analysis paralysis.

**Build / activity:** ***Stack Commitment*** — fill in your personal GWTH stack sheet: for each job in the table above, declare which tool you're committing to for Month 1. One sentence per choice explaining *why* it wins for your situation. Save. You can switch after any Lab, but commit first — skill compounds on mastery, not shopping.

**Mindset moment:** A fluent default beats a shallow dozen. Fork a Lab when you're curious; master the default first.

**UK context:** The **UK AI Skills Hub** (launched 28 January 2026, aiskillshub.org.uk) tried the opposite approach — a directory of 600+ courses from 'anyone who submitted'. The result (Techosaurus, Computer Weekly, The Telegraph, January–April 2026): 60% of courses actually paid despite "free" framing, courses 10–20 years old, broken links, a copyright-law course teaching US "fair use" that doesn't exist in UK law, and all 14 "badged" courses from US big tech. A parody site (aishillshub.org.uk) launched within weeks. Ed Newton-Rex called it *"mostly rehashed sales propaganda written by big tech and low-quality slide decks meant for other countries."* The teaching point: a *short prescribed stack with Labs for head-to-head comparison* outperforms a long directory every time. UK learners get fewer tools, more skill. GWTH's own answer — pitching the Hub on the **free labs**, with the paid course sitting quietly behind as the natural next step — is what a good prescriptive approach looks like in public.

**Research:** [`05-april-2026-tool-ecosystem.md`](month-1-research/05-april-2026-tool-ecosystem.md), [`11-vibe-coding-landscape.md`](month-1-research/11-vibe-coding-landscape.md), [`13-uk-regulatory-context.md`](month-1-research/13-uk-regulatory-context.md).

---

### L10. Build Your First App — the Moment Everything Changes 🔨

**Description:** The most important lesson of the month. What **"vibe coding"** means: you describe what you want, AI builds it, no programming knowledge needed.

**The term's origin.** Andrej Karpathy coined *"vibe coding"* in February 2025: *"There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists."* Collins Dictionary named **"vibe coding" Word of the Year 2025**.

**Why this is the #1 AI use case for individuals.** Stack Overflow's 2025 Developer Survey: **84% of developers use or plan to use AI coding tools**. GitHub's March 2026 follow-up: 82% actively using. **25% of Y Combinator's Winter 2025 batch** had codebases ≥95% AI-generated. Vibe-coding market was **~$4.7 B in 2026** (projected $25 B by 2030). Crucially, **Lovable reports 60% of its users are non-developers** — this is the first time in history non-technical adults ship software.

**Your first build with Claude Artifacts** (step-by-step): describe → watch it appear → use it immediately. **April 2026 upgrade that changes everything:** Artifacts now has **persistent storage up to 20 MB per artifact** (personal or shared). This means your calculator *remembers* your rates; your journal *keeps* your entries; your tracker *saves* your streaks. Between February and April 2026, Artifacts went from "disposable toy" to "real app."

The iteration loop: *"That's great, but make the button bigger / add dark mode / make it remember my name / store my budget from last month"*. **Applied concept:** Claude Artifacts runs HTML/React/JS in your browser — you don't need to know what those words mean; you just need to know that what you describe gets built and runs right there in the chat window, and now *persists between sessions*.

**Key concepts:** vibe coding · describe-not-code · private tools · iteration loop · **persistent artifacts** (the 2026 leap) · the Year of the AI Builder.

**Build / activity:** ***My First App*** — build a tool you'll actually use. Options (ranked by impact):
- A household budget calculator with *your* categories
- A recipe scaler (input servings → adjusted quantities)
- A quiz for your kids on a topic they're studying
- A daily routine / habit tracker
- A gift-idea generator for family birthdays
- A UK unit converter you actually use (miles→km, Celsius→Fahrenheit, £ pence/litre → £/gallon)
- A Council Tax / stamp-duty / childcare-cost calculator

**The standard:** when you close your laptop, you should want to show someone what you made. Export the HTML to keep it forever.

**Mindset moment:** This is the moment the course works. If you feel the buzz, you're hooked.

**UK context:** **Lovable** (Stockholm-based, European) reached **~8 M users and $200 M ARR by Nov 2025**, 100,000+ new projects/day; **~5% of all Lovable traffic is from the UK** (Similarweb) — UK is Lovable's #2 or #3 non-US market. Bolt.new, Claude Artifacts. UK small-business owners have flooded TikTok and LinkedIn with "I built this app for my business in an afternoon" videos — an abundant pool of testimonial material. UK adoption pattern: single-practitioner professionals (solicitors, accountants, physios, tutors) using Artifacts to build billing trackers, client intake forms, kids' learning tools.

**Research:** [`11-vibe-coding-landscape.md`](month-1-research/11-vibe-coding-landscape.md), [`05-april-2026-tool-ecosystem.md`](month-1-research/05-april-2026-tool-ecosystem.md), [`12-uk-beginner-use-cases.md`](month-1-research/12-uk-beginner-use-cases.md).

---

### L11. Build Something Bigger — Tools That Solve Real Problems 🔨

**Description:** Beyond simple calculators: apps that **collect data**, **remember state**, and have **multiple views**. Design principles you get for free from AI: colour schemes, responsive layouts, professional typography. Multi-page apps. Saving and exporting: how to keep what you build (download HTML, save to local files, or publish with Lovable/Bolt for a shareable URL). Applied concept of **when to use what**: Claude Artifacts for quick personal tools, **Lovable/Bolt** for full web apps you want to share, **v0** for polished front-end prototypes, Claude Projects (later) for knowledge-pack apps.

**Key concepts:** state persistence · multi-view apps · sharing and URLs · tool selection matrix.

**Build / activity:** ***Personal Utility*** — build something more ambitious than L9. Named worked examples from the GWTH project set (each has a reserved domain the student can deploy to):
- **`cheatprompt.dev`** — personal prompt hub with tags and share links
- **`tokenocd.com`** — token/credit burn-rate dashboard (PM5-rower-style)
- **`goalsfor.me`** — personal goal planner that interviews you quarterly
- A client-intake form that captures info and formats it as an onboarding brief
- A personal CRM: contacts, last interaction, follow-up dates
- A habit tracker with streaks and weekly view
- **Stretch:** build it in Lovable or Bolt and get a shareable URL you can send to a friend

**UK context:** UK freelancers and SMEs have adopted Lovable/Bolt heavily for internal tools. UK community of "build in public" practitioners on LinkedIn and X.

**Research:** [`11-vibe-coding-landscape.md`](month-1-research/11-vibe-coding-landscape.md).

---

## Week 3 — Website, Data, Dashboard, Agents, Custom Assistants (L12–L16)

**Arc:** *You've built your first tools. Now publish one to the internet, learn to interrogate data, combine building with data analysis into a dashboard, meet your first agents, and build a custom assistant that knows things only you know.*

### L12. Build Your First Website 🔨

**Description:** Every professional, freelancer and small business should have a web presence. Using AI to build a complete, professional website from a description. What makes a good landing page: headline → value proposition → social proof → call to action. Mobile-responsive design (AI handles this automatically). Images, branding, visual consistency. **Publishing** — free hosting: GitHub Pages, Netlify, Vercel, Cloudflare Pages. Custom domain basics (optional). A quick note about SEO basics without going deep.

**Key concepts:** landing-page anatomy · mobile-responsive · hosting · domains · AI as web-designer.

**Build / activity:** ***My Website*** — build and publish a real website to a real URL. Named worked examples from the GWTH project set:
- **`eyeonai.dev`** — personal blog / brand site
- **`bestrobotmop.com`** or any of the 14-domain "research + comparison" template (affiliate-ready niches)
- **`aicoursedirectory.com`** — AI course comparison (a GWTH lead-gen site; domain exists but stale, rebuild from scratch)
- Personal portfolio / CV site
- Landing page for a business idea or side project
- A site for a local club, school group, charity or event

**Must be published and shareable.** This is the moment students go from "I built something on my laptop" to "I put something on the internet."

**UK context:** UK tradespeople, freelancers, charities, and small societies routinely now have £0 AI-built sites instead of paying £1,000+ to a web agency. UK domain registrars (e.g., 123-reg, Krystal, Fasthosts) supported for the £5–£10 domain step.

**Research:** [`11-vibe-coding-landscape.md`](month-1-research/11-vibe-coding-landscape.md).

---

### L13. Data Analysis — Ask Questions, Get Answers

**Description:** Upload a spreadsheet/CSV to Claude or ChatGPT and ask questions in plain English. *"What are my top 5 expenses?"* / *"Show me the trend over six months"* / *"Which products are most profitable?"* AI-generated charts: bar, pie, line, heatmaps. **Data cleaning** — "this spreadsheet is a mess — fix it" (AI is eerily good at this). Applied concept: **structured vs unstructured data** — a spreadsheet is structured (rows and columns); a meeting transcript is unstructured (just words). *AI can convert one to the other.* This concept is the foundation of the Family AI Bot.

**Key concepts:** upload-and-ask · plain-English analytics · data cleaning · structured vs unstructured · chart selection.

**Build / activity:** ***Personal Finance Analysis*** — using your own bank export CSV (or sample data we provide), ask AI to: identify top 5 spending categories, trend over time, find surprising patterns, give three specific recommendations. Produce at least two charts. **Must reveal something you didn't know about your spending.**

**UK context:** UK bank CSV exports (Starling, Monzo, Revolut, Barclays, NatWest) all work fine. Pension-statement analysis. Council-tax-history analysis.

**Research:** [`14-data-analysis-for-beginners.md`](month-1-research/14-data-analysis-for-beginners.md).

---

### L14. Data Analysis — Build a Dashboard 🔨

**Description:** Combining two primitives: building + data analysis = **interactive dashboards**. Why dashboards beat spreadsheets: visual, interactive, shareable, impressive. Building a dashboard in Claude Artifacts: upload data → ask for a dashboard → iterate on design. Filters, dropdowns, tabs. Applied concept: **the power of combining primitives** — neither data analysis alone nor coding alone produces a good dashboard; together they do. This is the core GWTH insight.

**Key concepts:** dashboard anatomy · filters/interactivity · primitive combination · portfolio-quality output.

**Build / activity:** ***My Dashboard*** — build an interactive dashboard from your L12 data (or your business data). Requirements: at least three chart types, at least one filter or tab, clean design, at least one insight a spreadsheet wouldn't surface. **Portfolio-worthy.**

**UK context:** UK small businesses (Etsy sellers, consultants, landlords, plumbers) using AI-built dashboards instead of Excel. UK public-data dashboards (ONS, UK Gov, TfL) as inspiration.

**Research:** [`14-data-analysis-for-beginners.md`](month-1-research/14-data-analysis-for-beginners.md).

---

### L15. Meet the Agents — AI That Works While You Sleep 🔨

**Description:** What AI agents are: software that **takes actions** on your behalf, not just answers questions. The April 2026 landscape:

- **Claude Desktop + Cowork** (Windows + Mac, bundled in Claude Pro $20/mo / Max tiers; Opus 4.7 or Sonnet 4.6). **Plugin marketplace launched Feb 2026** with 1,000+ skills; **Microsoft 365 connector** for Outlook / SharePoint / OneDrive. Sandboxed and safer than open agents. Cowork gained full computer-use capability March 2026. Anthropic itself reports Cowork was *built almost entirely by Claude Code in ~1.5 weeks* by their Felix Rieseberg — a fun data point.
- **Claude Code** — terminal-based agent; $1B+ ARR on its own. Max 5× ($100/mo) allows heavy agentic coding.
- **Claude for Chrome** — browser-context agent. **Beta open to all paid plans** (Pro / Max / Team / Enterprise) in early 2026; works on Chrome + Edge (not Brave / Arc). **Microsoft disables Claude-in-Copilot by default for UK and EU tenants** pending DPIA sign-off.
- **ChatGPT Agent** — replaces Operator (shut down 31 Aug 2025). Available on Plus ($20/mo) and Pro ($100 / $200). Books flights, fills forms, researches products.
- **ChatGPT Atlas** — OpenAI's AI-native browser. **macOS only; Windows/iOS/Android "coming soon."** **UK Windows users cannot use Atlas yet — recommend Claude for Chrome as the practical alternative.**
- **Zapier AI Agents** and **Make.com Maia** as the "lightweight agent" on-ramps (see L16).
- **OpenClaw** — open-source, 247K+ GitHub stars. **Strong security warning**: CVE-2026-25253 (RCE, CVSS 8.8), ~35% of internet-exposed instances vulnerable, **ClawHavoc incident Jan 2026** (341 malicious skills in the ClawHub marketplace). Palo Alto Networks called it *"the biggest insider threat of 2026"*. Microsoft published guidance on "running OpenClaw safely" with identity isolation. **Only mention with strong warning. Do not recommend hands-on OpenClaw for Month 1 beginners.**

The automation spectrum: one-off → scheduled → always-on. **Applied concept: sandboxing / VMs** — why Cowork is safer than OpenClaw (the sandbox is a locked room; OpenClaw skills run on your real machine with your real permissions).

**Key concepts:** agent vs assistant · sandboxed vs unsandboxed · scheduled vs triggered · the security trade-off · agent observability · the UK tenancy default-off reality.

**Build / activity:** ***First Agent Task*** — use Claude Cowork (or ChatGPT Agent if no paid Claude plan) to:
- Organise a folder of files (rename, sort, move by date/topic)
- Process a batch of documents (summarise 10 PDFs into one report)
- Create a set of templated documents from a list of inputs (e.g., 10 personalised cover letters from a CSV)

The "wow" is watching AI work autonomously on your machine.

**UK context:** **BCC March 2026:** 54% UK firms using AI, only 11% deeply — the agent gap is the biggest wedge. UK corporates (Lloyds, BT, Tesco) piloting Cowork in Q1 2026. UK + EU Microsoft tenants get Claude-in-Copilot off by default — ICO/DPIA hygiene. UK **NCSC** guidance on agent risks worth citing.

**Research:** [`15-agents-april-2026.md`](month-1-research/15-agents-april-2026.md), [`05-april-2026-tool-ecosystem.md`](month-1-research/05-april-2026-tool-ecosystem.md).

---

### L16. Custom GPTs & Claude Projects — Your Personal AI Assistant 🔨

**Description:** Building a **Custom GPT** (ChatGPT) or **Claude Project** with specific knowledge and personality. Uploading your documents to create a domain-specific expert (your company handbook, your product catalogue, your study notes, your legal templates). Writing system instructions that define behaviour. Testing and refining. Real examples: a customer-service bot for an SME, a GCSE study tutor, a recipe advisor for your dietary restrictions, a personal writing coach. **This is the foundation for the Family AI Bot processing engine.** Applied concept: **system prompt vs user prompt** — the system prompt is permanent instructions the AI always follows; the user prompt is each individual question. This is how you create consistent, reliable AI behaviour.

**Key concepts:** knowledge packs · system prompts · consistent behaviour · private assistants · the foundation for L19–L20.

**Build / activity:** ***My Personal AI Assistant*** — build a Custom GPT *or* Claude Project that:
- Has a clear role (tutor, advisor, assistant, coach, domain expert)
- Contains uploaded reference documents relevant to that role (at least three)
- Has well-written system instructions (≥300 words)
- Handles at least five different question types reliably
- **Test with 10 real queries and document the results** in your Tool Log

Named worked examples from the GWTH project set:
- **`bragmanager.com`** — work-wins log that quantifies monthly and drafts promotion-review talking points
- **`goalsfor.me`** — quarterly goals interviewer that holds you accountable on weekly check-ins

**UK context:** UK GCSE / A-level private tutor bots built by parents. UK solicitors building Custom GPTs on their own case-law notes. UK GPs experimenting with patient-facing Claude Projects for admin tasks (within ICO rules). UK charities building volunteer-onboarding bots.

**Research:** [`16-custom-assistants.md`](month-1-research/16-custom-assistants.md).

---

## Week 4 — Automation, Family Bot Ideation, Build, Polish, Career (L17–L22)

**Arc:** *Put all six primitives together into the Family AI Bot. Automate it. Ship it. Portfolio it. Then turn the month's work into a CV and LinkedIn profile that lands interviews.*

### L17. Automation Basics — Zapier, Make, n8n 🔨

**Description:** What automation means in practice: *"when X happens, do Y automatically"*. The April 2026 landscape:

- **Zapier** — Free 100 tasks; Professional ~$20/mo; Team ~$69/mo. **8,000+ apps.** **Zapier Copilot** (natural-language → Zap) and **Zapier Agents** have been rolled out; both are add-ons (~$150–200/mo for power users). Zapier now brands itself as the *"AI Orchestration Platform."*
- **Make.com** — cheaper than Zapier at volume. **Maia** AI assistant builds scenarios from natural language. Visual canvas.
- **n8n 2.0** — open-source, self-hostable. **LangChain + 70+ AI nodes.** 1 execution = 1 workflow regardless of steps, so dramatically cheaper for complex flows. Huge UK adoption for **GDPR reasons**: self-hosted on UK infrastructure (AWS London, OVHcloud Erith) gives 100% UK data sovereignty — a real TCO comparison from toptenaiagents.co.uk shows **n8n £1,560 / Make £1,070 / Zapier £6,670+** for 500 k ops/year.

Your first automation step-by-step (in Zapier Copilot, because it's the easiest). Common high-ROI automations for UK learners: new email with attachment → save to Drive + log to Sheet; form submission → spreadsheet + confirmation email; receipts → Xero / FreeAgent / QuickBooks UK for tax; scheduled Sunday-night family briefing (calendar + weather + school menu → WhatsApp). **Applied concept: triggers, actions, conditions** — every automation has these three parts; once you see the pattern you can automate anything. The **automation audit** — what do you do every day that's the same steps every time?

**Key concepts:** trigger-action-condition · webhook triggers · scheduled triggers · the automation audit · when to use Zapier vs Make vs n8n · UK GDPR + data sovereignty angle.

**Build / activity:** ***Save Yourself an Hour*** — identify one genuinely repetitive task in your actual life and automate it. Must really save time, not theoretically. Document the before/after and the workflow. **Stretch:** rebuild it in two platforms and compare.

**UK context:** UK SMEs using Zapier for invoicing (FreeAgent, Xero, QuickBooks UK integrations). UK landlords automating tenancy paperwork. UK private clinics automating appointment reminders. **n8n + UK data sovereignty** is a specifically British angle no US tutorial teaches.

**Research:** [`17-automation-platforms.md`](month-1-research/17-automation-platforms.md).

---

### L18. Ideation & Planning — Designing Your Family AI Bot

**Description:** Strategic thinking with AI — using AI as a **planning partner**, not just a task executor. Designing a system: **inputs → processing → outputs → distribution**. The Family AI Bot architecture:
- **Input:** audio recording of a family meeting.
- **Processing:** transcription → extraction of tasks, events, meals, shopping.
- **Output:** structured data (tasks list, calendar events, meal plan, shopping list).
- **Distribution:** tasks sent to family members, events into the calendar, shopping list to the shared list app.

Using AI to brainstorm system design: *"I want a system that does X, Y, Z — help me plan it."* Choosing your implementation path (Cowork / Artifacts / Lovable / OpenClaw). Applied concept: **breaking big problems into small steps** — the most transferable skill in AI. Every complex project is just a sequence of simple tasks.

**Key concepts:** system design · input-processing-output-distribution · architecture decisions · planning with AI · the capstone spec.

**Build / activity:** ***Family AI Bot Blueprint*** — use AI to plan your capstone in detail. Produce:
- A system diagram (hand-drawn or AI-generated)
- A list of components you need to build
- The tools you'll use for each component
- A timeline across L19–L21

**UK context:** UK families with busy schedules (school runs, after-school clubs, grandparents, pets, shared lists with multiple parents). Real-world scenarios UK parents recognise. UK calendar integrations (Google Calendar, iCloud, Outlook 365 — all supported).

**Research:** [`18-family-bot-design.md`](month-1-research/18-family-bot-design.md).

---

### L19. Transcription & Extraction — Teaching AI to Listen 🔨

**Description:** How speech-to-text works (two-minute version: audio → model → text). The April 2026 options:

- **Whisper** (OpenAI open source) — still the baseline. Free.
- **Voxtral** (Mistral AI, 2025) — beats Whisper v3 on English + multilingual at half the API cost. Worth name-dropping as the new open-source leader.
- **Otter.ai** — Pro $16.99/user/mo, 6,000 mins. Easy starter.
- **Fathom** — **free unlimited** recording and transcription on personal tier; paid from $50/mo for teams. Best free option.
- **Zoom AI Companion** — bundled in Zoom Workplace from $14.16/user/mo; standalone $8.33/user/mo.
- **Microsoft Teams Copilot** — **+$30/user/mo on top of M365**. Dominates UK corporate.
- **Google Meet AI** — included in Google AI Pro / Workspace.

Quality factors: mic placement, quiet room, clear speech. **The extraction prompt** — the core technique that makes the Family Bot work: take an unstructured transcript → use a carefully crafted prompt → extract tasks (who, what, when), events (what, date, time), meals (day, meal, recipe), shopping items. Output as structured data (JSON or Markdown). Testing and refining extraction accuracy. Applied concept: **prompt engineering for extraction** — a specific, reusable pattern: *"Given this messy text, extract [categories] in [format]."* Works for meeting notes, emails, articles, reports — anything.

**Key concepts:** STT basics · Whisper vs Voxtral · free (Fathom) vs bundled (Teams/Zoom) · extraction prompt pattern · JSON output · prompt robustness · edge cases (people talking over each other; kids interrupting).

**Build / activity:** ***Family Meeting v1*** — record a 10-minute family meeting (or simulate one). Transcribe (free: Whisper via ChatGPT, or Fathom). Write the extraction prompt. Compare AI output to what was actually discussed. Iterate until accuracy is high. This is the core reusable prompt of the whole capstone. Save it in your Claude Project / Prompt Library.

**UK context:** **ICO:** on-device Whisper is preferable to cloud for personal recordings — especially important if children under 13 are audible (UK Age Appropriate Design Code). UK consumer adoption: Otter / Fathom / Zoom AI Companion for work calls; Teams Copilot's dominant UK corporate footprint. **Consent:** always tell the family the recording is being transcribed; a one-line "we're using AI for the meeting minutes" addresses both UK GDPR and household trust.

**Research:** [`18-family-bot-design.md`](month-1-research/18-family-bot-design.md).

---

### L20. Building the Processing Engine + Distribution 🔨

**Description:** **Building** the core of the Family AI Bot — the part that takes a transcript and produces structured outputs — *and* connecting it to the outside world. Three implementation paths:
- **Cowork approach** (easiest): a folder with instructions; drop a transcript file in; Cowork processes it and creates `tasks.md`, `events.md`, `meals.md`, `shopping.md`.
- **Artifacts approach**: an interactive app — paste transcript, get structured outputs with copy/export buttons.
- **Lovable/Bolt approach**: a full web app with upload, processing, output pages, and scheduled processing.

**Distribution:** calendar integration via Zapier/Make or Cowork's calendar plugin; task distribution via email, WhatsApp, or a shared task list; shopping list to a shared Google Sheet, AnyList, Apple Reminders or a dedicated page on your web app. Scheduling: Cowork folder triggers, OpenClaw cron jobs, Zapier webhook triggers. **Security for the Family Bot** — don't expose API keys, use environment variables, prefer the Cowork sandbox. Applied concept: **APIs explained simply** — when your bot *"sends an event to Google Calendar"* it's using an API; like placing an order at a restaurant, you describe what you want, the API delivers it, you don't need to understand the kitchen.

**Key concepts:** processing engine · three implementation paths · calendar/task/shopping distribution · webhooks · API basics · security hygiene.

**Build / activity:** ***Family Bot Working*** — your processing engine + at least one working output channel. Minimum: tasks in a shared document OR emailed to family; events into Google Calendar automatically; shopping list to a shared Google Sheet. Gold standard: the whole pipeline runs when you drop a recording file into a folder.

**UK context:** UK-friendly shared-list options (AnyList, Bring!, Apple Reminders via Family Sharing, Google Keep). UK calendar reality (many UK families mix Google Calendar, iCloud, and Outlook 365 — show how to integrate across all three). UK Cowork installer for Windows (many UK households are Windows-first).

**Research:** [`18-family-bot-design.md`](month-1-research/18-family-bot-design.md), [`17-automation-platforms.md`](month-1-research/17-automation-platforms.md).

---

### L21. Polishing, Presenting & Your Month-1 Portfolio 🔨

**Description:** Design polish: making your Family Bot outputs look professional. Formatting the shopping list, meal plan and task list so they're a pleasure to read. Building a simple **"hub page"** that shows the latest outputs (web dashboard or Cowork-generated report). Creating a 2-minute demo: how to show someone what your bot does. Writing simple **instructions for your family** so they can use it without you. The **"teach someone else" test** — if you can explain your system to a non-technical family member, you understand it. Finally, assembling the **Month 1 Portfolio**: your best prompts, your research project, your content package, your apps, your dashboard, your Family Bot demo, and a personal statement *"Before GWTH, I… Now I…"*. This portfolio becomes a LinkedIn showcase, a CV attachment, and evidence for any employer that you can *actually do this*.

**Key concepts:** polish · hub page · demo-making · teach-someone-else test · portfolio assembly · personal narrative.

**Build / activity:** ***Portfolio + Family Bot Launch*** —
- **Complete** the Family Bot: real (or realistic) meeting recording → clean formatted outputs → at least one automated distribution → 2-minute demo video → user instructions page.
- **Assemble** the Month 1 Portfolio: structured Notion page / website / PDF with every artefact.
- **Share** with one friend or colleague. Get one sentence of feedback. Record their reaction.

**Handoff to L22.** The portfolio is the artefact. L22 is the *distribution* — how employers and recruiters actually find out what you built.

**UK context:** UK LinkedIn as the main portfolio distribution channel. UK employer recognition of AI skills on CVs rising sharply (LinkedIn UK data, CIPD surveys 2026). UK corporate L&D teams actively buying GWTH-style training.

**Research:** [`19-portfolio-and-presentation.md`](month-1-research/19-portfolio-and-presentation.md).

---

### L22. Your AI-Era CV & LinkedIn — Turning 4 Weeks of Builds into Career Ammunition 🔨

**Description:** The closing lesson of Month 1, and the one that directly addresses Journeys 1–3 (redundancy, AI-anxiety, verifiable scores). In April 2026 the UK job market has bifurcated fast: roles that mention "AI" in the job description pay **a documented 25% premium** (PwC UK AI Jobs Barometer, April 2026 update), and "How do you use AI in your work?" is now the **most-asked interview question** across tech, marketing, operations and finance (LinkedIn UK hiring-manager survey, Q1 2026). Every student in this lesson has just shipped 16 builds and a capstone — **the raw material for the best CV rewrite of their career**. The problem is almost nobody does the translation step. This lesson fixes that.

**Four artefacts produced this lesson:**

1. **Your AI-Era CV.** Rewritten with AI assistance (Claude Sonnet 4.6 recommended for voice matching; ChatGPT for format; both can do it). The rewrite has three distinguishing features: (a) a dedicated **"AI capabilities"** section near the top listing specific tools you've mastered (Claude Code, Cowork, Artifacts, Lovable, Zapier, Ideogram, etc.), each with one concrete outcome you achieved (e.g., *"Zapier — built a 3-step automation saving 2 hrs/week on expenses reconciliation"*); (b) **portfolio links** to the real URLs of builds you published (L12 website, L14 dashboard, L20 Family Bot demo); (c) **quantified achievements** from GWTH ("Shipped 16 working AI builds in 4 weeks"). Uploaded as PDF *and* as a Claude Artifact so it's easy to regenerate for role-specific variants.

2. **Your rebuilt LinkedIn profile.** Four surgical edits. **Headline:** from generic ("Marketing Manager at X") to capability-specific ("AI-augmented marketing operator · ship campaigns in hours not days · Claude Code · Lovable · Zapier"). **About section:** rewritten as a narrative — what you did before AI, what you can now ship, one concrete metric, one sentence of personal voice. **Featured section:** pin 3 of your Month 1 builds with screenshots (LinkedIn permits up to 5). **Skills section:** add the actual tools (LinkedIn's skills taxonomy now includes Claude, ChatGPT, Lovable, Cursor, Zapier — as of the March 2026 taxonomy refresh).

3. **The "What I Built in 4 Weeks" showcase post.** A single LinkedIn post (carousel format, 8–10 slides, generated in Gamma or Canva) walking through your Month 1 portfolio. Students who publish this in the course community and on LinkedIn get instant feedback and — empirically — two or three inbound recruiter DMs within a week. This post is also the "proof artefact" that makes the CV credible.

4. **Your interview answer bank.** 10 questions every AI-literate candidate must be able to answer in 2026, and your worked answers. Sample prompts: *"How do you use AI in your current role?"*, *"What's the most significant thing you've shipped using AI?"*, *"Where does AI fall short? When do you stop trusting it?"*, *"Walk me through an agent workflow you built."*, *"How do you think about prompt injection / hallucination / data leakage?"* (L5 pays off here). Students draft their answers with AI, then record themselves delivering each in under 90 seconds and self-score on Loom or phone video.

**The GWTH score as third-party evidence.** The GWTH grading artefact — the rubric-based score every capstone is graded against — is designed to be **citable on a CV**. Unlike vendor certificates (Microsoft AI-900, Google ML, Coursera badges) that say "you watched videos and took a quiz," the GWTH score is keyed to *what you shipped*. Students print it, attach it to the CV, and include the verification URL that employers can click. Addresses Journey 3 directly: *"scores employers can trust."*

**The parent angle (Journey 4 crossover).** This lesson also works in reverse for the parent student: you can use it to **rewrite your teenager's LinkedIn or Common App/UCAS profile** once they've done their own builds with you. A 16-year-old whose LinkedIn says *"Built a Spanish GCSE revision app in Lovable, 200 users at my school, 4.7-star rating"* will out-impress peers with three A\*s and no artefacts. This framing makes the lesson shareable with the whole household.

**Key concepts:** AI-era CV anatomy · LinkedIn headline/about/featured/skills refresh · capability-specific signalling vs generic job-title signalling · portfolio → CV translation · the interview answer bank · GWTH score as third-party evidence · 25% AI-premium on UK job listings · "how do you use AI" as the 2026 top-1 interview question.

**Build / activity:** ***CV + LinkedIn Rebuild***
- **Rebuild your CV** with AI using the three-section AI Capabilities pattern. Output as PDF + Claude Artifact.
- **Rebuild your LinkedIn**: headline, about, featured (3 pinned builds), skills (actual tool names).
- **Publish the "What I Built in 4 Weeks" carousel post** on LinkedIn (or draft it for later posting if profile isn't ready to go public).
- **Draft and record your interview answer bank** (10 questions, 90 seconds each, Loom or phone).
- **Attach your GWTH score** to both CV and LinkedIn Featured.

**Acceptance criteria.**
- CV has a dedicated "AI capabilities" section with **at least 6 named tools**, each with a concrete outcome.
- CV links to **at least 3 live build URLs** (website, dashboard, Family Bot demo, or equivalent).
- LinkedIn headline now includes **at least 2 specific AI tools or capabilities**.
- LinkedIn Featured section has **3 pinned builds** with screenshots.
- Showcase post is drafted (carousel format, 8+ slides).
- Answer bank has **10 recorded answers**, each under 90 seconds.

**Mindset moment:** Your CV before GWTH listed what you *used to do*. Your CV after GWTH lists what you *can now build*. One is a biography; the other is a capability statement. Employers buy capability.

**UK context:** **PwC UK AI Jobs Barometer** (April 2026 update): AI-exposed roles command a **25% wage premium** and productivity growth in those sectors nearly quadrupled (7% → 27%) since 2022. **LinkedIn UK Workforce Report (Q1 2026)**: "AI fluency" is the fastest-growing skill on UK profiles (up 890% YoY); hiring managers in the UK now screen for *specific tool names* ("Claude Code," "Cursor," "Zapier AI"), not generic "AI experience." **CIPD 2026 skills survey**: only **21% of UK workers** self-report as confident using AI at work — finishing GWTH moves the student into the top quintile on self-reported AI fluency nationally. **UK redundancy context**: Q1 2026 saw significant layoffs in junior consulting, junior content, and junior paralegal roles (displacement attributed to AI assistants); students who can demonstrate "AI + domain" are filling the replacement roles at 1.25× the old salary. Direct answer to Journey 1.

**Named domain extensions (optional, for ambitious students).** Students who want to productise this for others can anchor to any of these reserved domains: **`bragmanager.com`** (already introduced in L16 — expand it into a multi-user CV-wins logger), **`cvworkouts.com`** / **`interviewtrainer.ai`** if available, or build a **"portfolio microsite"** (Lovable / Carrd) at any personal domain. *These are optional; the core lesson ships a rebuilt CV + LinkedIn for the student, not a new SaaS product.*

**The GWTH training close.** *"You've just done in 22 lessons what most UK workers never learn. Your colleagues, family, employer probably haven't. Your CV and LinkedIn now say so, publicly and verifiably. The next step — Month 2 — is turning this from personal productivity into team/company transformation: production apps, pipelines, agents that run your industry's real workflows. You can bring people with you. [GWTH.ai](https://gwth.ai) is how you upskill the rest of your team — and if you bring 100+ colleagues, we'll build a bespoke lesson just for your company."*

**Research:** [`19-portfolio-and-presentation.md`](month-1-research/19-portfolio-and-presentation.md), [`12-uk-beginner-use-cases.md`](month-1-research/12-uk-beginner-use-cases.md).

---

## Build projects — 16 builds + the Capstone

Every lesson has a hands-on activity. **The 16 rows below have a code/tool build.** The other 6 lessons (L1, L2, L4, L5, L6, L9, L18) have applied artefacts or strategy work (wishlist, same-question test, prompt library, catch-the-hallucination, research project, stack commitment, bot blueprint).

| # | Lesson | Build | Primary tool(s) | Time |
|---|--------|-------|----------------|------|
| 1 | L3 | Tool Log | Markdown / Notion | 20 min |
| 2 | L7 | Content Sprint (email + social + long-form) | Claude / ChatGPT | 60 min |
| 3 | L8 | Visual Content Package | GPT Image 1.5 / Ideogram / ElevenLabs / Veo | 60 min |
| 4 | L10 | **My First App** | Claude Artifacts | 60 min |
| 5 | L11 | **Personal Utility** | Claude Artifacts / Lovable | 90 min |
| 6 | L12 | **My Website** | Lovable / Bolt / v0 | 90 min |
| 7 | L13 | Personal Finance Analysis | Claude / ChatGPT | 60 min |
| 8 | L14 | **My Dashboard** | Claude Artifacts | 90 min |
| 9 | L15 | First Agent Task | Claude Cowork | 60 min |
| 10 | L16 | **My Personal AI Assistant** | Custom GPT / Claude Project | 90 min |
| 11 | L17 | **Save Yourself an Hour** | Zapier / Make / n8n | 60 min |
| 12 | L19 | Family Meeting v1 (extraction) | Whisper + Claude | 60 min |
| 13 | L20 | **Processing Engine + Distribution** | Cowork / Artifacts / Lovable | 120 min |
| 14 | L20 | Shopping-list / calendar integration | Zapier / Cowork plugin | 60 min |
| 15 | L21 | **Portfolio page** | Lovable / Notion / Claude Artifacts | 90 min |
| 16 | L22 | **CV + LinkedIn rebuild + showcase post + answer bank** | Claude / ChatGPT / Gamma / Loom | 90 min |

**Capstone — Family AI Bot** (spans L18–L21; demoed at end of Week 4):

**Domain:** **`familyaibot.com`** (primary); `familymanager.net` and `familymanager.space` reserved for alternative positioning. Extension projects anchor to named siblings: grocery agent on **`groceryshoppingagent.com`**, recipe → shopping list on **`recipeunboxed.com`**, party photo sharing on **`partysnapper.com`**.

**Spec.** Record your weekly family meeting. AI transcribes it, extracts tasks, books calendar events, creates a meal plan, and generates a shopping list. Automatically.

**Features.**
1. Audio input (recorded via phone, upload, or folder drop) in WAV/MP3/M4A.
2. Automatic transcription (Whisper or provider equivalent).
3. Extraction prompt that produces four structured outputs: tasks (assignee + due date), events (title + date + time), meal plan (day + meal + optional recipe), shopping list (de-duplicated).
4. Distribution to at least **one** of: email / WhatsApp / shared task list / shared doc.
5. Calendar integration for at least the events.
6. A hub page (local or hosted) showing the latest outputs.
7. Simple user instructions for a non-technical family member.
8. A 2-minute demo video.

**Acceptance criteria.**
- End-to-end pipeline runs from a real/realistic 10-minute recording in under 5 minutes.
- Extraction accuracy ≥ 80% on all four output types (judged by the student against ground truth).
- At least one automated distribution channel (not manual copy/paste).
- Demo video is intelligible to a non-technical viewer.
- No API keys are exposed; free-tier tools can run the whole thing (paid tiers optional for polish).
- Works on Windows and Mac.
- Portfolio-ready (shareable URL or exportable PDF hub).

**Default stack (UK-friendly).**
- Transcription: Whisper in Claude / ChatGPT, or Fathom free tier.
- Processing: Claude Sonnet 4.6 via Claude Project (with the extraction prompt as system prompt).
- Orchestration: Claude Cowork (easiest) *or* Lovable (shareable web app).
- Distribution: Zapier (free tier) for Google Calendar + Gmail + Google Sheets.
- Hub page: Claude Artifacts or a single Lovable page.

**Fallback path** (for students without Claude Pro / Cowork): ChatGPT Plus + Custom GPT + Zapier free tier + a Google Sheet for outputs.

**Stretch goals.**
- WhatsApp distribution via OpenClaw (with the hardened setup taught in Month 2).
- Voice-activated trigger (Siri Shortcut / Google Assistant routine).
- Multi-family support with separate sheets per household.
- Weekly summary email that rolls up completed tasks.

**Estimated total capstone time:** 6–10 hours across L18–L21.

---

## Coverage of the six OpenAI primitives

| Primitive | Primary lessons | Supporting role | Total exposure |
|-----------|-----------------|-----------------|----------------|
| **Coding / Building** 🔨 | L10, L11, L12, L14, L16, L20 = **6** | L3, L9, L15, L17, L21 | 11 |
| **Content Creation** | L7, L8 = **2** | L12, L19, L21, L22 | 6 |
| **Research & Analysis** | L6, L19 = **2** | L4, L18 | 4 |
| **Data Analysis** | L13 = **1** | L14, L20 | 3 |
| **Automation** | L15, L17, L20 = **3** | L16, L21 | 5 |
| **Ideation & Strategy** | L18 = **1** | L1, L2, L9, L21 | 5 |
| **Foundations / Mindset** | L1, L2, L3, L4, L5, L9 = **6** | — | 6 |
| **Career / Meta** (new) | L22 = **1** | L21 | 2 |

*Coding/Building has 6 primary and 5 supporting lessons — more than any other primitive — matching the course's explicit priority. L9 (Building Toolkit) is primary Foundations and supporting in both Coding/Building and Ideation/Strategy.* Every capstone task combines at least two primitives; L20 combines all six, making the Family AI Bot the literal embodiment of the primitive framework. **L22 is deliberately outside the six OpenAI primitives** — it's a career/meta lesson that teaches students how to *sell* the primitive fluency they just gained, which is the missing piece every other AI course skips.

---

## Appendix A — "Your First AI Colleague" mindset exercises

Five exercises that force the colleague-not-search mental shift through experience, not theory. Use them across L1–L5 as warm-ups and revisit in the L21 portfolio retrospective.

**A1. The £5,000 Consultant** — *"Describe a real current problem in your work or life that a consultant would charge £5,000 to solve. Now brief AI as if it's that consultant. Give it role, background, constraint, goal. Keep the conversation going for at least 20 minutes."* Shatters the one-query habit; students feel the depth gap between a four-word ask and a briefed session.

**A2. The Brutally Honest Self-Review** — *"Ask AI to write an honest performance review of yourself. Feed it your CV, last three accomplishments, last three failures. Ask it to be direct, not flattering."* Shows AI as a colleague who pushes back — not a yes-machine search engine.

**A3. The Meta-Prompt Drill** — *"Pick a task. Instead of writing a prompt, paste: 'I want to do X. Ask me five clarifying questions, then write the best prompt I could give you.' Answer. Run. Compare to your instinct."* Installs meta-prompting as the beginner's cheat code.

**A4. The Jagged Frontier Probe** — *"Give AI five tasks from your week ranging from easy to hard. Score each 1–10. Find the two surprises — something easy it failed, something hard it nailed."* Makes Mollick's jagged frontier tangible. Students stop guessing and start testing.

**A5. The Iteration Ladder** — *"Generate something (an email, a plan, a poem). Iterate it five times: shorter, different tone, different audience, with humour, in 100 words. Compare round 1 to round 5."* Kills the "accept first answer" reflex forever.

---

## Appendix B — Applied concepts taught just-in-time

Instead of theory lessons, technical concepts are drip-fed *at the moment they become useful*.

| Concept | Where taught | Why it matters at that moment |
|---------|--------------|-------------------------------|
| Jagged frontier + AI-as-colleague | L2 | The mental model that makes everything else work |
| Context windows | L4 | Why your long conversation is giving bad answers |
| System prompts | L7 | Set once so AI always writes in your voice |
| Big-3-plus-challenger rule | L9 | How we keep the tool list prescriptive |
| Structured vs unstructured data | L13 | Foundation of the Family Bot |
| Primitive combination | L14 | The core GWTH insight |
| Sandboxing / VMs | L15 | Why Cowork is safer than OpenClaw |
| JSON | L19 | Format AI uses to structure extractions |
| APIs (restaurant-order metaphor) | L20 | How your bot talks to Google Calendar |
| Cron / scheduled triggers | L20 | How to run things on a schedule |
| Prompt injection (60-second version) | L5 / L15 | Specific risk for agentic tools |

---

## Appendix C — Cross-cutting principles

These show up in every lesson:

1. **AI is a colleague, not a search engine.** (Installed in L2, reinforced everywhere.)
2. **Every brief needs Role, Context, Task, Format, Constraints.** (L4, referenced every lesson.)
3. **Build more than you consume.** 16 of 22 lessons include a build. Students ship.
4. **British by default.** British English in every prompt-level system instruction. GBP pricing. UK tool alternatives where they exist. ICO/NCSC guidance woven in.
5. **Verify by habit.** Rule 1 of AI safety. Re-stated every time citations appear.
6. **Tool fluency, not loyalty.** Multi-assistant by design; tool log updated every lesson.
7. **Your name → your stamp.** You're responsible for anything AI writes for you.
8. **Portfolio-worthy.** Every build is something the student can show.
9. **GWTH training recommendation.** Every lesson has a "bring your team along" — soft-sell. L21 is hard-sell. The **bespoke-lesson service** (1 custom lesson per 100 students a company enrols) is the route in for larger organisations.

---

## Appendix D — Format & delivery notes for the GWTH team

- **22 core lessons**, ~60 min each (30–45 min for foundations; 90 min for the bigger builds). Plus up to **5 Optional lessons** (see section below) that sit outside the core sequence. Drop optional Week 5 "advanced" material into Month 2.
- **Each lesson file:** short video (≤10 min), live demo video (≤15 min), written article, hands-on exercise, downloadable prompt(s), tool log update, quiz (3–5 questions).
- **Weekly live build clinics (60 min)** — students bring their week's builds, GWTH instructor reviews on-screen, common problems solved for everyone.
- **Month-end capstone showcase** — students present their Family AI Bot in 3 minutes. Cohorts of ~6. Celebration of portfolios.
- **Community channel** — Discord / Slack / Circle. Pinned: prompt library, tool log template, portfolio template, current tool-pricing sheet, Family Bot starter repo.
- **Starter repos** (create in GWTH's GitHub org):
  - `gwth-m1-artifacts-starter` — Claude Artifacts templates for L9–L13.
  - `gwth-m1-family-bot-starter` — Cowork folder + Claude Project + Zapier template for the capstone.
  - `gwth-m1-portfolio-starter` — Lovable / Notion portfolio template.
  - `gwth-m1-cv-linkedin-starter` — CV template (PDF + Claude Artifact), LinkedIn rewrite prompts, "What I Built in 4 Weeks" Gamma carousel template, and the 10-question interview answer bank prompts.

---

## Optional lessons (up to 5)

These sit **outside the 21-lesson core sequence**. They exist for planning purposes — candidates to promote into the core later, or quietly retire if they never mature. Each is either too new, too specific to a small audience, or evolving too fast to bake into core teaching. They are closely related to Labs: several may graduate into Labs first, then into core lessons if they stick.

**O1. AI-Built Mobile Apps — from Lovable/Expo to TestFlight/Play.**
*Why optional:* mobile app vibe-coding became mainstream in Q1 2026 but the stack (Lovable Mobile, Expo Go, EAS Build, TestFlight/Play) still changes month-to-month. A student who wants a phone-first tool (shopping list, babysitter log, local tradesman invoicer) doesn't need this for the core but benefits hugely.
*Primary audience:* parents, tradespeople, solopreneurs with phone-first customers.
*Assumed prerequisites:* L9 (toolkit), L10 (first app), L12 (website).
*Likely core candidate:* if adoption stays high through mid-2026, promote to L12.5 or L22 in a future revision.

**O2. AI for Accessibility & SEND Support.**
*Why optional:* audience is a specific subset (UK parents and teachers of children with SEN, adults with dyslexia / ADHD / visual or hearing impairment), but the AI unlock is unusually large — AI-assisted reading, speech-to-text for classroom use, voice-controlled interfaces, customised study tutors for dyslexia and autism.
*Primary audience:* UK parents/teachers; adults with accessibility needs.
*Assumed prerequisites:* L8 (multimodal content), L16 (custom assistants).
*UK context:* ties to the UK Age Appropriate Design Code (ICO), the Equality Act 2010, and SEND tribunals.

**O3. AI Voice Agents — Building a Phone-Answering Assistant.**
*Why optional:* cutting edge in April 2026. ElevenLabs Agents, Vapi, Retell and newer entrants make real-time voice agents possible for a sole-trader phone line, but the tooling is not yet beginner-proof. Will almost certainly become mainstream in 2027.
*Primary audience:* UK sole-traders (plumbers, electricians, tutors, private clinics, B&Bs) drowning in phone calls.
*Assumed prerequisites:* L8 (TTS), L15 (agents), L17 (automation).
*Likely core candidate:* promote to L15.5 or a Month-2 lesson once UK onshoring and accent handling improve.

**O4. Side Hustles — From AI Idea to First £100.**
*Why optional:* not universally relevant (many students already have the day job they want); and it's easy to blur into "make money online" genre content. But a well-run version of this is the single most-requested lesson in adjacent communities.
*Primary audience:* UK individuals exploring a side income; aligned with Priestley's "Scorecasts/Score App" audience.
*Assumed prerequisites:* the full Week-2 build arc.
*Likely core candidate:* promote to L21.5 if the demo delta against L21 portfolio is big enough.

**O5. Privacy-First Local AI — Ollama + LM Studio on Your Own Machine.**
*Why optional:* small but passionate audience — ICO-minded professionals (solicitors, GPs, HR), privacy-curious individuals, anyone with strong UK data-sovereignty preferences. Covers running Llama 3.3, Qwen 3, Phi 4 locally via Ollama or LM Studio on Mac/Windows with reasonable hardware.
*Primary audience:* UK regulated professionals; privacy-conscious home users.
*Assumed prerequisites:* L3 (toolkit), L5 (safety), L16 (custom assistants).
*UK context:* direct tie to ICO data controller guidance and NCSC secure-AI-dev; also the only way to guarantee no data leaves UK infrastructure.

---

## Lab ideas — candidates from lessons we decided not to teach

Lessons we considered and decided **not** to include in the core 21, because the topic is a head-to-head tool comparison that goes stale fast, or because it's a narrow one-trick demo. **These become Labs instead.** Labs are short (≈20–40 min), repeatable, ranked head-to-head against the GWTH default, and refreshable without touching the core curriculum. They are also the first thing GWTH pitches to the UK AI Skills Hub — genuinely free, platform-agnostic, UK-focused. *Cross-reference:* each Lab also serves as a Tool-Log entry students drop into their L3 sheet.

The starter list (first Lab is the user-requested one):

1. **Lab 1 — Claude Design vs Google Stitch vs v0.** Same brief, three tools: (a) website landing page, (b) 3-slide deck, (c) logo + brand mark. Score on speed, quality, editability, export, cost. *GWTH default today: Claude Design; review quarterly.*
2. **Lab 2 — Lovable vs Bolt.new vs Replit Agent.** Same small web app (e.g., a booking form or invoice generator), three no-code platforms.
3. **Lab 3 — Whisper vs Voxtral vs Fathom on UK accents.** 5-minute sample with Scottish, Brummie, Scouse and Received Pronunciation speakers; score word error rate.
4. **Lab 4 — Midjourney V8 vs FLUX 2 vs Ideogram v3 vs GPT Image 1.5.** UK brand brief (independent coffee shop in Leeds, say); judge aesthetic, text rendering, prompt fidelity.
5. **Lab 5 — ElevenLabs v3 vs Google TTS vs ChatGPT voice.** 60-second audiobook sample from the same text; UK accent handling.
6. **Lab 6 — Zapier Agents vs Make Maia vs n8n 2.0.** Same 3-step automation (e.g., form → Sheet → email); compare build time, TCO, UK data-sovereignty.
7. **Lab 7 — Claude Code vs Cursor IDE vs Windsurf.** Same repo, same bug; measure time-to-fix and patch quality.
8. **Lab 8 — Perplexity Deep Research vs ChatGPT Deep Research vs Claude Research.** Same UK research question (e.g., "Best ISA providers for a 35-year-old basic-rate taxpayer in 2026"); compare sources, depth, citation accuracy.
9. **Lab 9 — Gamma vs Beautiful.ai vs Tome.** Same brief; output a polished 10-slide deck.
10. **Lab 10 — Synthesia vs HeyGen vs D-ID.** 60-second UK corporate avatar video; judge lip sync, avatar realism, UK-accent TTS.
11. **Lab 11 — Veo 3.1 vs Runway Gen-4.5 vs Kling 3.0 vs Seedance 2.0.** Same prompt ("A black cab pulling up outside a Leeds dental practice in morning rain"), compare fidelity and audio sync.
12. **Lab 12 — Claude for Chrome vs ChatGPT Atlas (macOS) vs Perplexity Comet.** Same 5-task browser workflow; compare for UK Windows vs Mac users.
13. **Lab 13 — Custom GPT vs Claude Project vs Google Gem.** Same knowledge pack (three PDFs); judge retrieval, personality persistence, export.
14. **Lab 14 — Claude Code vs OpenAI Codex vs Gemini CLI.** Same repo, same task; judge diff quality and safety of changes.
15. **Lab 15 — ChatGPT Agent vs Claude Cowork vs Google Project Mariner.** Same "organise this folder of 50 files" task.
16. **Lab 16 — Ollama vs LM Studio vs Jan on a consumer laptop.** Same three model downloads; compare UX, RAM usage, prompt latency. *(Pairs with Optional O5.)*
17. **Lab 17 — Apple Intelligence vs Samsung Galaxy AI vs Pixel Gemini Nano.** On-device UK consumer comparison for notification summaries, writing tools, photo edits.

*Format.* Each Lab has: a brief (one paragraph), a default GWTH stack ranking as of the publish date, the scoring rubric, and a short demo video. Labs are **dated** — "Lab 1 · first published 2026-04-21 · last reviewed 2026-07-01" — so students know how fresh the ranking is. When a Lab goes stale, refresh it; when a topic matures, promote it to a Core lesson (and archive the Lab as historical).

*Link to AI Skills Hub pitch.* These Labs — free, UK-focused, platform-agnostic, learning-by-doing — are what GWTH leads with when approaching the Hub (see `13-uk-regulatory-context.md` for the PwC/neighbour strategy). The paid course sits as the natural next step behind them.

---

## Sources (global)

**OpenAI**
- "Identifying and Scaling AI Use Cases" (Apr 2025) — https://cdn.openai.com/business-guides-and-resources/identifying-and-scaling-ai-use-cases.pdf
- "A Practical Guide to Building Agents" (Dec 2024) — https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
- "How Small Teams Win with ChatGPT" (Sep 2024) — https://cdn.openai.com/business-guides-and-resources/how-small-teams-win-with-chatgpt.pdf

**Anthropic / Claude**
- Claude prompting docs — https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
- Claude Code docs — https://docs.anthropic.com/en/docs/claude-code
- Claude Projects docs — https://support.anthropic.com/en/articles/9517075
- Claude for Chrome — https://www.anthropic.com/news/claude-for-chrome
- Economic Index — https://www.anthropic.com/economic-index

**Ethan Mollick**
- "Co-Intelligence" book
- One Useful Thing — https://www.oneusefulthing.org/
- Jagged frontier paper / framing

**Andrej Karpathy**
- "Software 3.0" / "LLM OS" / "English is the new programming language" — talks + tweets

**AI Daily Brief (NLW)**
- Episode archive — https://www.aidailybrief.com/
- The 6 AI Use Case Primitives episode (30 May 2025)

**Tool docs / blogs**
- Lovable — https://lovable.dev/
- Bolt — https://bolt.new/
- v0 — https://v0.app/
- Replit Agent — https://replit.com/
- Claude Artifacts — https://www.anthropic.com/news/artifacts
- ElevenLabs — https://elevenlabs.io/
- Ideogram — https://ideogram.ai/
- Midjourney — https://www.midjourney.com/
- Zapier AI Agents — https://zapier.com/ai/agents
- Make.com AI Agents — https://www.make.com/en/ai-agents
- n8n — https://n8n.io/

**Context**
- "Generative AI and LLMs for Dummies" (Wiley, 2024) — already in pipeline
- KPMG "Trust, Attitudes and Use of AI Global Study" (2025)
- BCG "Where's the Value in AI?" (2024)
- Deloitte "State of Generative AI in Enterprise 2024"
- Microsoft "Generative AI in Real-World Workplaces" (2024)

---

## Sources (UK)

**UK Government + Regulators**
- UK AI Opportunities Action Plan (Matt Clifford, Jan 2025) — https://www.gov.uk/government/publications/ai-opportunities-action-plan
- ICO AI & data-protection guidance — https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/
- NCSC AI guidance (incl. prompt injection) — https://www.ncsc.gov.uk/collection/ai
- FCA AI feedback statement — https://www.fca.org.uk/publications/feedback-statements
- DSIT AI Safety Institute — https://www.aisi.gov.uk/
- UK Government AI assistant Humphrey — https://www.gov.uk/government/publications/humphrey

**UK adoption + economics**
- PwC UK AI Jobs Barometer — https://www.pwc.co.uk/services/risk/insights/ai-jobs-barometer.html
- techUK AI reports — https://www.techuk.org/
- British Chambers of Commerce AI surveys — https://www.britishchambers.org.uk/
- ONS productivity + AI stats — https://www.ons.gov.uk/
- CIPD AI + skills reports — https://www.cipd.org/
- Exponential View (Azeem Azhar) — https://www.exponentialview.co/

**UK tools + companies (cited across lessons)**
- Lovable (European AI startup, huge UK user base)
- Synthesia (UK-founded, AI avatar video)
- Stability AI (UK-founded)
- Wayve (UK AI)
- ElevenLabs (UK significant presence)
- Starling / Monzo / Revolut CSV exports
- Otter.ai / Fathom (widely used in UK)

**UK voices (creator / thought-leader references)**
- Azeem Azhar — Exponential View
- Daniel Priestley — Scorecasts, LinkedIn
- Tom Goodwin — Substack, LinkedIn
- Steven Bartlett — Diary of a CEO (AI episodes)

---

*This document supersedes: `LESSON_IDEAS_2026-03-12.md` (newsbot-only, outdated), `gwth-month1-redesign-feb2026.md` (v1 Feb 2026), `gwth-month1-redesign-v2-feb2026.md` (v2 Feb 2026). A scoring comparison against the current `syllabus.json` Month 1 lessons is in `SYLLABUS_DIFF_2026-04-20.md`.*
