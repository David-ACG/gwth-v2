# Month 1 Lesson Ideas — AI for Your Life

*Generated 2026-04-20. Supersedes `gwth-month1-redesign-v2-feb2026.md` (Feb 2026) and the `syllabus.json` Month 1 draft (Feb 2026).*

*Sources (global): OpenAI "Identifying and Scaling AI Use Cases" (6 primitives, April 2025) · OpenAI "A Practical Guide to Building Agents" (Dec 2024) · Ethan Mollick "Co-Intelligence" + One Useful Thing substack · Andrej Karpathy on "English is the new programming language" / LLM OS · The AI Daily Brief (NLW) · Anthropic prompting + Claude Code docs · Lovable / Bolt / v0 / Replit docs · ElevenLabs, Ideogram, Midjourney docs · Zapier AI Agents / Make AI · Dummies Guide to Generative AI & LLMs.*

*Sources (UK): ICO AI guidance for consumers · NCSC AI + prompt-injection guidance · FCA AI feedback statement · DSIT AI Safety Institute · UK AI Opportunities Action Plan (Clifford, Jan 2025) · techUK + British Chambers of Commerce adoption surveys · ONS productivity statistics · UK SME case studies · Azeem Azhar (Exponential View) · Tom Goodwin, Daniel Priestley, UK creator voices.*

*Research library: [`month-1-research/`](month-1-research/) · Pipeline ingestion folder: `C:/Projects/1_gwthpipeline520/data/PDFs_manual_download/GWTH_Month_1/`*

**Why UK additions?** Month 1 is where students form their relationship with AI. Every concept, tool and case study has a UK-native anchor so students can look at what a British person, brand or regulator actually did — then compare to the global benchmark. Global examples are never removed; they are the context. UK examples are the applied reality.

---

## Month mapping recap

- **Month 1 — AI for Your Life** — foundations, first builds, automations for yourself. Change the way students *think* about AI, then get them building. **15 of 20 lessons have a build project.** Capstone: **Family AI Bot**.
- **Month 2 — AI for Your Industry** — production apps: pipelines, data, integrations.
- **Month 3 — AI for Your Company** — leadership, strategy, governance.

Month 1 exists to take someone whose entire AI experience is *"I've asked ChatGPT a few questions like a fancy Google"* and, in four weeks, turn them into someone who:

1. **Thinks about AI as a knowledgeable colleague**, not a search engine.
2. **Covers all six OpenAI primitives** (Research, Content, Coding/Building, Data Analysis, Ideation, Automation) — with a heavy bias toward *Building*.
3. **Has shipped 15 simple hands-on builds** plus the Family AI Bot capstone.
4. **Has a tool log**, a prompt library, a small portfolio, and the confidence to use AI for everything they can.

---

## The core argument for Month 1

Almost everyone today thinks of ChatGPT as "Google with better search results." That mental model is the single biggest blocker to getting value from AI. **AI is not a search engine; it is a very knowledgeable, very fast, very patient colleague who can write, code, draw, talk, analyse, plan, and do things for you.** The first few lessons exist to break the search-engine habit before it calcifies. Once the colleague mental model is installed, the rest of the course becomes a sequence of "what would I ask a knowledgeable colleague to do for me?" — and then doing it.

**Everything else follows from that mindset shift.** The primitives are the categories of colleague work. Prompting is how you brief a colleague. Tools are the colleague's hands. Agents are the colleague working unattended. Builds are the artefacts the colleague produces that you actually use.

---

## Why building dominates the month

OpenAI's "Identifying and Scaling AI Use Cases" (April 2025) distilled 300+ enterprise implementations into six fundamental use-case patterns — the **six AI primitives**: Content Creation, Research, Coding/Building, Data Analysis, Ideation & Strategy, Automation. Of these six, **Coding/Building has emerged as the single highest-leverage skill for individuals** — the one that took AI from "helpful assistant" to "I can make things that didn't exist before." Vibe coding with Claude Artifacts / Lovable / Bolt / v0 has become the new Microsoft Office — a baseline productivity skill everyone should own. We therefore cover all six primitives, but **15 of the 20 lessons include a build project**, and the capstone is a full end-to-end build.

This matches what the AI Daily Brief and OpenAI's own data show: of the six primitives, coding has by far the biggest *delta* between "leaders" and "laggards" in both company and individual productivity. Beginners who learn to build get to "I can make any tool I need" — a capability no other primitive provides.

**UK framing.** PwC's UK AI Jobs Barometer shows productivity growth in AI-exposed industries nearly quadrupling (7% → 27%) since 2022, with the biggest gains in sectors that *build* with AI (IT, professional services, finance). Lovable, one of the fastest-growing European AI startups, is a UK/European success story that British students can identify with. The UK government's AI Opportunities Action Plan explicitly calls for the UK to become "an AI maker, not just an AI taker" — we're training makers.

---

## The 20 lessons at a glance

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
| L9 | Build your first app — the moment everything changes | **Coding / Building** | Yes — *My First App* | 2 |
| L10 | Build something bigger — tools that solve real problems | **Coding / Building** | Yes — *Personal Utility* | 2 |
| L11 | Build your first website | **Coding / Building** | Yes — *My Website* | 3 |
| L12 | Data analysis — ask questions, get answers | Data Analysis | Yes — *Personal Finance Analysis* | 3 |
| L13 | Build a dashboard — combining primitives | Coding + Data | Yes — *My Dashboard* | 3 |
| L14 | Meet the agents — AI that works while you sleep | Automation + Coding | Yes — *First Agent Task* | 3 |
| L15 | Custom GPTs & Claude Projects — your personal AI assistant | Coding + Automation | Yes — *My Personal AI Assistant* | 3 |
| L16 | Automation basics — Zapier, Make, n8n | Automation | Yes — *Save Yourself an Hour* | 4 |
| L17 | Ideation & planning — designing your Family AI Bot | Ideation & Strategy | Yes — *Bot Blueprint* | 4 |
| L18 | Transcription & extraction — teaching AI to listen | Research + Content | Yes — *Family Meeting v1* | 4 |
| L19 | Building the processing engine + distribution | **Coding + Automation** | Yes — *Family Bot Working* | 4 |
| L20 | Polishing, presenting & your month-1 portfolio | Content + Meta | Yes — *Portfolio + Family Bot Launch* | 4 |

**Build project count:** 20 of 20 lessons have a hands-on activity. **15 of those are code/tool builds** (L3, L7–L19 excluding L17, L20) — the rest are applied artefacts (wishlist, prompt library, research project, portfolio). The Capstone **Family AI Bot** is anchored in L17–L20 and demonstrated at the end of week 4.

---

## Week 1 — Mindset, Toolkit, Prompting, Safety (L1–L5)

**Arc:** *Stop thinking of AI as Google. Start thinking of it as a colleague. Set up the tools that colleague needs. Learn to brief them. Learn the five safety rules.*

### L1. Welcome to GWTH — What AI Can *Actually* Do for You

**Description:** Six live demos of what AI can do that most people have never seen — one from each of the OpenAI primitives. **Research** a product in two minutes using Perplexity Comet (now free worldwide). **Content**: write and publish a polished LinkedIn post from a voice memo; then turn it into an image with Ideogram 3 and a 30-second voiceover with ElevenLabs v3. **Coding**: build a working mortgage calculator in thirty seconds in Claude Artifacts (which in April 2026 now has persistent storage up to 20 MB, so the calculator remembers your rates). **Data**: upload a bank statement and watch charts appear. **Ideation**: voice-mode brainstorm of a side business while doing the washing up. **Automation**: watch Claude Cowork (Opus 4.7, now with plugin marketplace) organise a messy Downloads folder autonomously. Addresses the "will AI take my job?" fear directly — positions AI skills as the #1 career differentiator in 2026. Previews the Family AI Bot capstone.

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

**Key concepts:** RCTFC framework · meta-prompting · few-shot · chain-of-thought · context windows · iterate-not-restart · system prompts vs user prompts (introduced lightly, returns in L15).

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

**Research:** [`07-ai-safety-five-rules.md`](month-1-research/07-ai-safety-five-rules.md), [`13-uk-regulatory-context.md`](month-1-research/13-uk-regulatory-context.md).

---

## Week 2 — Research, Content, First Builds (L6–L10)

**Arc:** *You can brief a colleague. Now put them to work. Three non-build lessons (research + content × 2) then the moment everything changes: your first build.*

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

### L9. Build Your First App — the Moment Everything Changes 🔨

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

### L10. Build Something Bigger — Tools That Solve Real Problems 🔨

**Description:** Beyond simple calculators: apps that **collect data**, **remember state**, and have **multiple views**. Design principles you get for free from AI: colour schemes, responsive layouts, professional typography. Multi-page apps. Saving and exporting: how to keep what you build (download HTML, save to local files, or publish with Lovable/Bolt for a shareable URL). Applied concept of **when to use what**: Claude Artifacts for quick personal tools, **Lovable/Bolt** for full web apps you want to share, **v0** for polished front-end prototypes, Claude Projects (later) for knowledge-pack apps.

**Key concepts:** state persistence · multi-view apps · sharing and URLs · tool selection matrix.

**Build / activity:** ***Personal Utility*** — build something more ambitious than L9. Options:
- A client-intake form that captures info and formats it as an onboarding brief
- A personal CRM: contacts, last interaction, follow-up dates
- A habit tracker with streaks and weekly view
- An invoice generator with your business details pre-filled
- A meeting-agenda builder with a live timer
- **Stretch:** build it in Lovable or Bolt and get a shareable URL you can send to a friend

**UK context:** UK freelancers and SMEs have adopted Lovable/Bolt heavily for internal tools. UK community of "build in public" practitioners on LinkedIn and X.

**Research:** [`11-vibe-coding-landscape.md`](month-1-research/11-vibe-coding-landscape.md).

---

## Week 3 — Website, Data, Dashboard, Agents, Custom Assistants (L11–L15)

**Arc:** *You've built your first tools. Now publish one to the internet, learn to interrogate data, combine building with data analysis into a dashboard, meet your first agents, and build a custom assistant that knows things only you know.*

### L11. Build Your First Website 🔨

**Description:** Every professional, freelancer and small business should have a web presence. Using AI to build a complete, professional website from a description. What makes a good landing page: headline → value proposition → social proof → call to action. Mobile-responsive design (AI handles this automatically). Images, branding, visual consistency. **Publishing** — free hosting: GitHub Pages, Netlify, Vercel, Cloudflare Pages. Custom domain basics (optional). A quick note about SEO basics without going deep.

**Key concepts:** landing-page anatomy · mobile-responsive · hosting · domains · AI as web-designer.

**Build / activity:** ***My Website*** — build and publish a real website to a real URL. Options:
- Personal portfolio / CV site
- Landing page for a business idea or side project
- A site for a local club, school group, charity or event

**Must be published and shareable.** This is the moment students go from "I built something on my laptop" to "I put something on the internet."

**UK context:** UK tradespeople, freelancers, charities, and small societies routinely now have £0 AI-built sites instead of paying £1,000+ to a web agency. UK domain registrars (e.g., 123-reg, Krystal, Fasthosts) supported for the £5–£10 domain step.

**Research:** [`11-vibe-coding-landscape.md`](month-1-research/11-vibe-coding-landscape.md).

---

### L12. Data Analysis — Ask Questions, Get Answers

**Description:** Upload a spreadsheet/CSV to Claude or ChatGPT and ask questions in plain English. *"What are my top 5 expenses?"* / *"Show me the trend over six months"* / *"Which products are most profitable?"* AI-generated charts: bar, pie, line, heatmaps. **Data cleaning** — "this spreadsheet is a mess — fix it" (AI is eerily good at this). Applied concept: **structured vs unstructured data** — a spreadsheet is structured (rows and columns); a meeting transcript is unstructured (just words). *AI can convert one to the other.* This concept is the foundation of the Family AI Bot.

**Key concepts:** upload-and-ask · plain-English analytics · data cleaning · structured vs unstructured · chart selection.

**Build / activity:** ***Personal Finance Analysis*** — using your own bank export CSV (or sample data we provide), ask AI to: identify top 5 spending categories, trend over time, find surprising patterns, give three specific recommendations. Produce at least two charts. **Must reveal something you didn't know about your spending.**

**UK context:** UK bank CSV exports (Starling, Monzo, Revolut, Barclays, NatWest) all work fine. Pension-statement analysis. Council-tax-history analysis.

**Research:** [`14-data-analysis-for-beginners.md`](month-1-research/14-data-analysis-for-beginners.md).

---

### L13. Data Analysis — Build a Dashboard 🔨

**Description:** Combining two primitives: building + data analysis = **interactive dashboards**. Why dashboards beat spreadsheets: visual, interactive, shareable, impressive. Building a dashboard in Claude Artifacts: upload data → ask for a dashboard → iterate on design. Filters, dropdowns, tabs. Applied concept: **the power of combining primitives** — neither data analysis alone nor coding alone produces a good dashboard; together they do. This is the core GWTH insight.

**Key concepts:** dashboard anatomy · filters/interactivity · primitive combination · portfolio-quality output.

**Build / activity:** ***My Dashboard*** — build an interactive dashboard from your L12 data (or your business data). Requirements: at least three chart types, at least one filter or tab, clean design, at least one insight a spreadsheet wouldn't surface. **Portfolio-worthy.**

**UK context:** UK small businesses (Etsy sellers, consultants, landlords, plumbers) using AI-built dashboards instead of Excel. UK public-data dashboards (ONS, UK Gov, TfL) as inspiration.

**Research:** [`14-data-analysis-for-beginners.md`](month-1-research/14-data-analysis-for-beginners.md).

---

### L14. Meet the Agents — AI That Works While You Sleep 🔨

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

### L15. Custom GPTs & Claude Projects — Your Personal AI Assistant 🔨

**Description:** Building a **Custom GPT** (ChatGPT) or **Claude Project** with specific knowledge and personality. Uploading your documents to create a domain-specific expert (your company handbook, your product catalogue, your study notes, your legal templates). Writing system instructions that define behaviour. Testing and refining. Real examples: a customer-service bot for an SME, a GCSE study tutor, a recipe advisor for your dietary restrictions, a personal writing coach. **This is the foundation for the Family AI Bot processing engine.** Applied concept: **system prompt vs user prompt** — the system prompt is permanent instructions the AI always follows; the user prompt is each individual question. This is how you create consistent, reliable AI behaviour.

**Key concepts:** knowledge packs · system prompts · consistent behaviour · private assistants · the foundation for L18–L19.

**Build / activity:** ***My Personal AI Assistant*** — build a Custom GPT *or* Claude Project that:
- Has a clear role (tutor, advisor, assistant, coach, domain expert)
- Contains uploaded reference documents relevant to that role (at least three)
- Has well-written system instructions (≥300 words)
- Handles at least five different question types reliably
- **Test with 10 real queries and document the results** in your Tool Log

**UK context:** UK GCSE / A-level private tutor bots built by parents. UK solicitors building Custom GPTs on their own case-law notes. UK GPs experimenting with patient-facing Claude Projects for admin tasks (within ICO rules). UK charities building volunteer-onboarding bots.

**Research:** [`16-custom-assistants.md`](month-1-research/16-custom-assistants.md).

---

## Week 4 — Automation, Family Bot Ideation, Build, Polish (L16–L20)

**Arc:** *Put all six primitives together into the Family AI Bot. Automate it. Ship it. Portfolio it.*

### L16. Automation Basics — Zapier, Make, n8n 🔨

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

### L17. Ideation & Planning — Designing Your Family AI Bot

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
- A timeline across L18–L20

**UK context:** UK families with busy schedules (school runs, after-school clubs, grandparents, pets, shared lists with multiple parents). Real-world scenarios UK parents recognise. UK calendar integrations (Google Calendar, iCloud, Outlook 365 — all supported).

**Research:** [`18-family-bot-design.md`](month-1-research/18-family-bot-design.md).

---

### L18. Transcription & Extraction — Teaching AI to Listen 🔨

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

### L19. Building the Processing Engine + Distribution 🔨

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

### L20. Polishing, Presenting & Your Month-1 Portfolio 🔨

**Description:** Design polish: making your Family Bot outputs look professional. Formatting the shopping list, meal plan and task list so they're a pleasure to read. Building a simple **"hub page"** that shows the latest outputs (web dashboard or Cowork-generated report). Creating a 2-minute demo: how to show someone what your bot does. Writing simple **instructions for your family** so they can use it without you. The **"teach someone else" test** — if you can explain your system to a non-technical family member, you understand it. Finally, assembling the **Month 1 Portfolio**: your best prompts, your research project, your content package, your apps, your dashboard, your Family Bot demo, and a personal statement *"Before GWTH, I… Now I…"*. This portfolio becomes a LinkedIn showcase, a CV attachment, and evidence for any employer that you can *actually do this*.

**Key concepts:** polish · hub page · demo-making · teach-someone-else test · portfolio assembly · personal narrative.

**Build / activity:** ***Portfolio + Family Bot Launch*** —
- **Complete** the Family Bot: real (or realistic) meeting recording → clean formatted outputs → at least one automated distribution → 2-minute demo video → user instructions page.
- **Assemble** the Month 1 Portfolio: structured Notion page / website / PDF with every artefact.
- **Share** with one friend or colleague. Get one sentence of feedback. Record their reaction.

**The GWTH training close.** *"You've just done in 20 lessons what most people never learn. Your colleagues, family, employer probably haven't. The next step — Month 2 — is turning this from personal productivity into team/company transformation. And you can bring people with you. [GWTH.ai](https://gwth.ai) is how you upskill the rest of your team."*

**UK context:** UK LinkedIn as the main portfolio distribution channel. UK employer recognition of AI skills on CVs rising sharply (LinkedIn UK data, CIPD surveys 2026). UK corporate L&D teams actively buying GWTH-style training.

**Research:** [`19-portfolio-and-presentation.md`](month-1-research/19-portfolio-and-presentation.md).

---

## Build projects — 15 builds + the Capstone

Every lesson has a hands-on activity. **The 15 lessons below have a code/tool build.** The rest have applied artefacts (wishlist, prompt library, research project, bot blueprint, portfolio) that still require active work.

| # | Lesson | Build | Primary tool(s) | Time |
|---|--------|-------|----------------|------|
| 1 | L3 | Tool Log | Markdown / Notion | 20 min |
| 2 | L7 | Content Sprint (email + social + long-form) | Claude / ChatGPT | 60 min |
| 3 | L8 | Visual Content Package | DALL-E / Ideogram / ElevenLabs | 60 min |
| 4 | L9 | **My First App** | Claude Artifacts | 60 min |
| 5 | L10 | **Personal Utility** | Claude Artifacts / Lovable | 90 min |
| 6 | L11 | **My Website** | Lovable / Bolt / v0 | 90 min |
| 7 | L12 | Personal Finance Analysis | Claude / ChatGPT | 60 min |
| 8 | L13 | **My Dashboard** | Claude Artifacts | 90 min |
| 9 | L14 | First Agent Task | Claude Cowork | 60 min |
| 10 | L15 | **My Personal AI Assistant** | Custom GPT / Claude Project | 90 min |
| 11 | L16 | **Save Yourself an Hour** | Zapier / Make / n8n | 60 min |
| 12 | L18 | Family Meeting v1 (extraction) | Whisper + Claude | 60 min |
| 13 | L19 | **Processing Engine + Distribution** | Cowork / Artifacts / Lovable | 120 min |
| 14 | L19 | Shopping-list / calendar integration | Zapier / Cowork plugin | 60 min |
| 15 | L20 | **Portfolio page** | Lovable / Notion / Claude Artifacts | 90 min |

**Capstone — Family AI Bot** (spans L17–L20; demoed at end of Week 4):

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

**Estimated total capstone time:** 6–10 hours across L17–L20.

---

## Coverage of the six OpenAI primitives

| Primitive | Primary lessons | Supporting role | Total exposure |
|-----------|-----------------|-----------------|----------------|
| **Coding / Building** 🔨 | L9, L10, L11, L13, L15, L19 = **6** | L3, L14, L16, L20 | 10 |
| **Content Creation** | L7, L8 = **2** | L11, L18, L20 | 5 |
| **Research & Analysis** | L6, L18 = **2** | L4, L17 | 4 |
| **Data Analysis** | L12 = **1** | L13, L19 | 3 |
| **Automation** | L14, L16, L19 = **3** | L15, L20 | 5 |
| **Ideation & Strategy** | L17 = **1** | L1, L2, L20 | 4 |
| **Foundations / Mindset** | L1, L2, L3, L4, L5 = **5** | — | 5 |

*Coding/Building has 6 primary and 4 supporting lessons — more than any other primitive — matching the course's explicit priority.* Every capstone task combines at least two primitives; L19 combines all six, making the Family AI Bot the literal embodiment of the primitive framework.

---

## Appendix A — "Your First AI Colleague" mindset exercises

Five exercises that force the colleague-not-search mental shift through experience, not theory. Use them across L1–L5 as warm-ups and in the L21 review.

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
| Structured vs unstructured data | L12 | Foundation of the Family Bot |
| Primitive combination | L13 | The core GWTH insight |
| Sandboxing / VMs | L14 | Why Cowork is safer than OpenClaw |
| JSON | L18 | Format AI uses to structure extractions |
| APIs (restaurant-order metaphor) | L19 | How your bot talks to Google Calendar |
| Cron / scheduled triggers | L19 | How to run things on a schedule |
| Prompt injection (60-second version) | L5 / L14 | Specific risk for agentic tools |

---

## Appendix C — Cross-cutting principles

These show up in every lesson:

1. **AI is a colleague, not a search engine.** (Installed in L2, reinforced everywhere.)
2. **Every brief needs Role, Context, Task, Format, Constraints.** (L4, referenced every lesson.)
3. **Build more than you consume.** 15 of 20 lessons include a build. Students ship.
4. **British by default.** British English in every prompt-level system instruction. GBP pricing. UK tool alternatives where they exist. ICO/NCSC guidance woven in.
5. **Verify by habit.** Rule 1 of AI safety. Re-stated every time citations appear.
6. **Tool fluency, not loyalty.** Multi-assistant by design; tool log updated every lesson.
7. **Your name → your stamp.** You're responsible for anything AI writes for you.
8. **Portfolio-worthy.** Every build is something the student can show.
9. **GWTH training recommendation.** Every lesson has a "bring your team along" — soft-sell. L20 is hard-sell.

---

## Appendix D — Format & delivery notes for the GWTH team

- **20 core lessons**, ~60 min each (30–45 min for foundations; 90 min for the bigger builds). Drop optional Week 5 "advanced" material into Month 2.
- **Each lesson file:** short video (≤10 min), live demo video (≤15 min), written article, hands-on exercise, downloadable prompt(s), tool log update, quiz (3–5 questions).
- **Weekly live build clinics (60 min)** — students bring their week's builds, GWTH instructor reviews on-screen, common problems solved for everyone.
- **Month-end capstone showcase** — students present their Family AI Bot in 3 minutes. Cohorts of ~6. Celebration of portfolios.
- **Community channel** — Discord / Slack / Circle. Pinned: prompt library, tool log template, portfolio template, current tool-pricing sheet, Family Bot starter repo.
- **Starter repos** (create in GWTH's GitHub org):
  - `gwth-m1-artifacts-starter` — Claude Artifacts templates for L9–L13.
  - `gwth-m1-family-bot-starter` — Cowork folder + Claude Project + Zapier template for the capstone.
  - `gwth-m1-portfolio-starter` — Lovable / Notion portfolio template.

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
