# GWTH.ai Month 1 Redesign v2 — February 2026
## "From Zero to Building: AI for Your Life"

---

## Core Principles

These five principles govern every lesson in Month 1. If content doesn't serve at least one, it gets cut.

### 1. Applied AI Only
No history of AI. No "what is machine learning." No neural network diagrams. Students learn what AI *does*, not what AI *is*. Theory is introduced only at the exact moment it becomes useful — e.g., "context windows" is taught when students first encounter a conversation that stops working because it got too long.

### 2. Only What's Useful
Every concept earns its place by being immediately applicable. Example: we don't explain transformer architecture — but we *do* explain why you should start a new conversation rather than keep going in a 50-message thread (context window filling up degrades quality). We don't explain tokenisation — but we *do* explain why uploading a 200-page PDF and asking "summarise this" gives worse results than breaking it into chapters.

### 3. Get Building Fast
Building is the dopamine hit that keeps learners engaged. The feeling of telling AI what you want, watching it appear on screen, and then using something *you made* is genuinely thrilling. Students should be building by Lesson 6 at the latest. By the end of Month 1, they'll have built multiple tools, a website, a dashboard, and their capstone Family AI Bot.

### 4. Completely Up to Date
GWTH updates content monthly. Lessons reference the actual tools available *right now*.

**The GWTH Tech Radar** (gwth.ai/tech-radar) is our live registry of 47+ AI tools across 16 categories — LLMs, coding agents, image generation, automation, TTS, and more. It tracks version, status (GA/Beta/Alpha/Deprecated), cost tier, and which lessons use each tool. A daily scanner searches the web and YouTube for new AI tools and surfaces alerts when something noteworthy appears. Students can browse the Tech Radar at any time to see the current landscape.

The tools referenced throughout Month 1:

| Tool | What It Is | Status (Feb 2026) |
|------|-----------|-------------------|
| **Claude Cowork** | Desktop agent that works with your files, no coding needed. "Claude Code for everyone." | Windows + Mac, $20/mo on Pro plan. Powered by Opus 4.6 with 1M context window. Plugins for sales, legal, finance, marketing. |
| **GPT-5.3-Codex-Spark** | Ultra-fast real-time coding model, 1,000+ tokens/sec on Cerebras chips | Research preview for ChatGPT Pro ($200/mo). Best for rapid iteration. |
| **GPT-5.3-Codex** | OpenAI's most capable agentic coding model. Can work autonomously for hours/days. | Available to Pro users. State-of-the-art on SWE-Bench Pro. |
| **OpenClaw** | Open-source personal AI agent. 145K+ GitHub stars. Runs locally, connects via WhatsApp/Telegram/Slack. Cron jobs, webhooks, 50+ integrations. | Free (bring your own API key). Security risks for non-technical users — Cisco found vulnerabilities in third-party skills. |
| **Claude Code** | Terminal-based coding agent for developers | $20/mo with Pro. $1B+ annual run-rate revenue. |
| **Claude Artifacts** | Build interactive apps directly in the chat window | Included with all Claude plans. Best for quick prototyping. |
| **Lovable / Bolt / v0** | No-code app builders powered by AI | Various pricing. Good for full web apps without command line. |
| **Cursor / Windsurf** | AI-powered code editors | For Month 2/3 when students are ready for more control. |

*See the full, always-current list on the GWTH Tech Radar.*

### 5. True Beginner Starting Point
Month 1 assumes students have:
- Used ChatGPT or similar for basic questions
- Possibly used AI for light research or writing help
- Never built anything with AI
- Never written code (and don't want to)
- No understanding of APIs, databases, or automation

The language throughout is conversational, never technical. When technical terms are unavoidable, they're defined in plain English at the moment of use, not in a glossary.

---

## The Capstone: Family AI Bot

The Month 1 capstone project is a **Family AI Bot** — a personal AI system that:

1. **Takes a recording** of a weekly family meeting (or any recurring meeting)
2. **Transcribes and processes** the recording using AI
3. **Extracts structured data**: tasks, events, meals, shopping list
4. **Sends tasks** to family members (via email, WhatsApp, or calendar)
5. **Books events** into the calendar (including daily meals)
6. **Produces a shopping list** from the week's meal plan
7. **Runs on a schedule** — cron or automated trigger so it just *works*

### Why This Capstone?

- It's **personally useful** — every family has this problem
- It uses **all 6 primitives**: Research (finding recipes), Content Creation (generating the shopping list/meal plan), Coding (building the app), Data Analysis (processing the transcript), Ideation (planning the system), Automation (the scheduled pipeline)
- It's **impressive** — students can show family/friends something that genuinely improves their life
- It demonstrates the **compound effect** of combining primitives
- It's **adaptable** — works for team meetings, committee meetings, any recurring gathering

### Implementation Options (Students Choose)

| Approach | Difficulty | Best For | Tools |
|----------|-----------|----------|-------|
| **Cowork Pipeline** | Easiest | Mac/Windows users with Claude Pro | Claude Cowork with folder instructions + plugins. Cowork processes the recording, generates outputs, saves to local files. |
| **Claude Artifacts App** | Easy | Quick prototype | Build the processing UI as a Claude Artifact. Manual upload, automatic processing, copy-paste outputs. |
| **Lovable/Bolt Web App** | Medium | Students wanting a shareable web app | Full web app with upload, processing, calendar integration, task distribution. |
| **OpenClaw Bot** | Medium-Hard | Tech-curious students who want always-on automation | WhatsApp/Telegram bot that accepts audio, processes it, distributes tasks via messages. Cron-based scheduling. **Security note: we teach this with hardened configuration.** |

### Security Considerations (Built Into the Teaching)

OpenClaw is genuinely powerful but comes with real risks that we don't hide from students:
- Cisco found data exfiltration in third-party skills
- CrowdStrike released an enterprise scanner/removal tool
- One of OpenClaw's own maintainers warned it's "far too dangerous" for users who don't understand the command line
- We teach a hardened setup: limited permissions, no third-party skills, API key management, isolated environment

The Cowork approach is recommended for most students as it runs in a sandboxed VM with user-controlled permissions.

---

## Complete Month 1 Syllabus: 24 Lessons

### Week 1: Quick Wins & Foundations You'll Actually Use (L1–L5)
*Goal: See what AI can do RIGHT NOW, set up tools, learn the skills that make everything else work. No theory — just "here's how to get great results."*

---

**L1: Welcome to GWTH — What AI Can Actually Do For You (Right Now)**
- **Primitive:** Foundations (Applied)
- **Duration:** 45 min
- **What students learn:**
  - Live demos: 6 things AI can do that most people don't know about (one from each primitive)
    - Research: "Find me the best-rated dishwasher under £500 that fits a 60cm space" → comprehensive comparison in 2 minutes
    - Content: Upload a photo of a sunset → get an Instagram post with caption, hashtags, and alternative crops
    - Coding: "Build me a mortgage calculator" → working app in 30 seconds (Claude Artifacts live demo)
    - Data: Upload a bank statement CSV → instant spending breakdown with charts
    - Ideation: "I want to start a side business but I only have evenings free" → structured business ideas with pros/cons
    - Automation: Show Claude Cowork organising a messy Downloads folder while you watch
  - The 6 primitives explained simply: "These are the 6 superpowers AI gives you"
  - Why coding/building has become #1 (the $4B story) — and why that's exciting for non-coders
  - What you'll build by the end of this month (preview the Family AI Bot)
  - The GWTH promise: 90 days from "I've asked ChatGPT some questions" to "I build tools and automate my life"
- **BUILD:** "My AI Wishlist" — write down 10 things you wish AI could do for you. Rate each 1-5 for how much it would improve your life. By the end of the month, we'll cross off most of them.
- **Teaching note:** This lesson is pure motivation and demonstration. No setup, no accounts, no homework beyond the wishlist. Students should leave thinking "I had no idea AI could do all that."

---

**L2: Your AI Toolkit — Set Up Once, Use Forever**
- **Primitive:** Foundations (Applied)
- **Duration:** 45 min
- **What students learn:**
  - Create accounts: Claude (free or Pro), ChatGPT (free or Plus), Perplexity (free)
  - Why we use multiple tools: Claude is best for building and reasoning, ChatGPT is best for quick tasks and browsing, Perplexity is best for research with sources
  - Install Claude Desktop (for Cowork later) — Mac or Windows
  - The one setting most people miss: turn on web search / deep research / artifacts
  - Mobile apps: set up on your phone for AI on the go
  - When to pay: honest breakdown of free vs. Pro vs. Max tiers
  - Privacy: what each tool does with your data (the 30-second version)
- **BUILD:** "The Same Question Test" — ask all three tools the same question about something you actually need to know. Compare the answers. Write one sentence about which tool you preferred and why. Save this — you'll update it throughout the course.

---

**L3: Getting Great Results — The Prompting Skills That Matter**
- **Primitive:** Foundations (Applied)
- **Duration:** 60 min
- **What students learn:**
  - Why most people get mediocre results from AI (they ask vague questions)
  - The 5 elements of a great prompt: Role, Context, Task, Format, Constraints
  - **Applied concept: Context windows** — AI has a working memory. The longer your conversation, the more it "forgets" the beginning. Practical rules:
    - Start a new chat for a new topic
    - Don't try to do everything in one conversation
    - If AI starts giving weird answers, it's probably confused by earlier messages
    - Paste key information at the top of your message, don't rely on it remembering from 20 messages ago
  - Metaprompting: "Write me a prompt that will..." — using AI to write better prompts
  - The iterate-don't-restart approach: refine what AI gives you instead of starting over
  - Tone and style control: "Write like a friendly expert" vs. "Write formally"
- **BUILD:** "Prompt Makeover" — take something you've actually asked AI before and got a mediocre result. Rewrite the prompt using the 5 elements. Compare before/after. Save your best prompts — this becomes your prompt library.

---

**L4: AI Safety in 60 Seconds — Just the Rules That Matter**
- **Primitive:** Foundations (Applied)
- **Duration:** 30 min
- **What students learn:**
  - **Rule 1: Never trust, always verify.** AI makes things up confidently. Always check important facts.
  - **Rule 2: Don't share secrets.** Don't paste passwords, financial details, or confidential documents into free-tier AI tools.
  - **Rule 3: AI content needs your stamp.** Always review and edit before sending/publishing. You're responsible for what goes out with your name on it.
  - **Rule 4: Check the date.** AI knowledge has cutoffs. Ask "when is your information from?" for time-sensitive topics.
  - **Rule 5: If it seems too good to be true, it is.** Fake citations, hallucinated statistics, made-up experts — all common. Verify.
  - How to spot deepfakes and AI-generated content (the 2-minute version)
  - Your personal AI usage policy (a simple one-page template they fill in)
- **BUILD:** "Catch the Hallucination" — AI is given 10 factual claims. 3 are wrong. Students must identify which ones and prove it. This builds the verification habit early.
- **Teaching note:** This is intentionally short. Safety is critical but shouldn't be a barrier to getting started. The rules are simple, memorable, and immediately actionable. Deeper ethics comes in Month 2.

---

**L5: Research with AI — Find Anything, Fast**
- **Primitive:** Research & Analysis
- **Duration:** 45 min
- **What students learn:**
  - Perplexity for sourced research (it gives you references)
  - ChatGPT with web browsing for current information
  - Claude for deep analysis of documents you upload
  - The research workflow: broad scan → dig deeper → verify → synthesise
  - **Applied concept: Upload and ask** — drag PDFs, images, spreadsheets into AI and ask questions about them
  - Multi-source checking: ask two different AI tools the same research question, compare
  - Summarising long documents: how to break a 100-page report into sections AI can handle (avoiding context window overload)
- **BUILD:** "Life Research Project" — pick something you genuinely need to research right now (holiday destination, school for your kids, a health question, a major purchase, career options). Conduct a full AI-assisted research project. Produce a one-page summary with key findings and verified sources. This should be something you actually use.

---

### Week 2: Content, Building & Your First "I Made This!" Moment (L6–L10)
*Goal: Master content creation, then experience the thrill of building your first working tools. By the end of this week, you'll have built things you can actually use.*

---

**L6: Content Creation — Write Anything, Fast**
- **Primitive:** Content Creation
- **Duration:** 45 min
- **What students learn:**
  - Professional writing: emails, reports, proposals that sound like you, not a robot
  - Training AI on your voice: paste examples of your writing and say "match this style"
  - The editing workflow: rough draft → AI polish → your final touches
  - Social media content: posts, captions, hashtags, content calendars
  - Long-form: blog posts, articles, newsletters
  - The "70/30 rule": let AI do 70% of the heavy lifting, you add the 30% that makes it genuinely yours
  - **Applied concept: System prompts** — some tools let you set permanent instructions ("always write in British English", "never use exclamation marks"). Set these up once and forget.
- **BUILD:** "Content Sprint" — create three pieces of content you actually need this week: one email, one social post, and one longer piece (blog post/report/letter). Each must sound like you wrote it. Time yourself — you'll be shocked how fast this is.

---

**L7: Content Creation — Images, Audio & Video**
- **Primitive:** Content Creation
- **Duration:** 45 min
- **What students learn:**
  - AI image generation: DALL-E (in ChatGPT), Ideogram, Midjourney — when to use what
  - Creating consistent visual branding with AI
  - AI presentations: using ChatGPT or Cowork to build slide decks
  - Text-to-speech: making audio versions of your content (ElevenLabs, built-in tools)
  - AI video: current state of the art — what works, what's still rough
  - Copyright: what you can and can't do with AI-generated images (the honest version)
- **BUILD:** "Visual Content Package" — for the same topic as your L6 content: create a matching social media image, a simple 3-slide presentation, and experiment with TTS for an audio version. This is a complete content package from one idea.

---

**L8: Build Your First App — The Moment Everything Changes**
- **Primitive:** Coding / Building
- **Duration:** 60 min
- **What students learn:**
  - What "vibe coding" means: you describe what you want, AI builds it. No programming knowledge needed.
  - Why this is the #1 AI use case globally: $4B in enterprise spend, 50% of developers use AI coding tools daily
  - **Your first build with Claude Artifacts**: step-by-step, describe what you want → watch it appear → use it immediately
  - The power of private, ad-free, subscription-free tools: everything you build is yours
  - The iteration loop: "That's great, but make the button bigger" / "Add a dark mode" / "Can it also calculate..."
  - What you can build: calculators, planners, games, converters, quizzes, trackers, forms — anything you can describe
  - **Applied concept: Claude Artifacts** runs HTML/React/JavaScript in your browser. You don't need to understand those words. Just know that what you describe gets built instantly and runs right there in the chat.
- **BUILD:** "My First App" — build a tool you'll actually use. Suggestions ranked by impact:
  - A household budget calculator with your actual categories
  - A recipe scaler (input servings, get adjusted quantities)
  - A quiz for your kids on a topic they're studying
  - A daily planner/routine tracker
  - A gift idea generator for family birthdays
  - A unit converter for something you actually convert (cooking, currency, measurements)
  - **The standard: when you close your laptop, you should want to show someone what you made.**

---

**L9: Build Something Bigger — Tools That Solve Real Problems**
- **Primitive:** Coding / Building
- **Duration:** 60 min
- **What students learn:**
  - Going beyond simple apps: forms that collect data, tools that remember state, interactive dashboards
  - Design principles you get for free: colour schemes, responsive layouts, professional typography — AI handles all of this
  - Multiple pages / views within one app
  - Saving and exporting: how to keep what you build (download HTML, save to files)
  - Using Lovable or Bolt for more complex builds that need hosting
  - **Applied concept: When to use what** — Claude Artifacts for quick tools, Lovable/Bolt for full web apps you want to share with others, Cowork for file-based automation
- **BUILD:** "Personal Utility" — build a genuinely useful tool that solves a real problem. This should be more ambitious than L8. Suggestions:
  - A client intake form that collects information and formats it nicely
  - A personal CRM: track contacts, last interaction, follow-up dates
  - A habit tracker with streak counting and visual progress
  - An invoice generator with your business details pre-filled
  - A meeting agenda builder with timer
  - **Stretch goal: build it in Lovable and get a shareable URL you can send to someone**

---

**L10: Build Your First Website**
- **Primitive:** Coding / Building
- **Duration:** 60 min
- **What students learn:**
  - Every professional, freelancer, and small business should have a web presence
  - Using AI to build a complete, professional website from a description
  - What makes a good landing page: headline, value proposition, social proof, call to action
  - Mobile-responsive design (AI handles this automatically)
  - Images, branding, and visual consistency
  - Publishing: free hosting options (GitHub Pages, Netlify, Vercel) — step-by-step
  - Connecting a custom domain (optional, for those who want it)
- **BUILD:** "My Website" — build and publish a real website. Options:
  - Personal portfolio / CV site
  - Landing page for a business idea or side project
  - A simple site for a club, community group, or event
  - **Must be published to a real URL and shareable** — this is the moment students go from "I built something on my computer" to "I put something on the internet."

---

### Week 3: Data, Agents & Making AI Work For You (L11–L15)
*Goal: Turn data into decisions, meet AI agents that work autonomously, and start building the Family AI Bot foundation.*

---

**L11: Data Analysis — Ask Questions, Get Answers**
- **Primitive:** Data Analysis
- **Duration:** 60 min
- **What students learn:**
  - Upload a spreadsheet/CSV to Claude or ChatGPT and ask questions in plain English
  - "What are my top 5 expenses?" / "Show me the trend over the last 6 months" / "Which products are most profitable?"
  - AI-generated charts and visualisations: bar charts, pie charts, line graphs, heatmaps
  - Data cleaning: "This spreadsheet is a mess — can you fix it?" (AI is surprisingly good at this)
  - **Applied concept: Structured vs. unstructured data** — a spreadsheet is structured (rows and columns). A meeting transcript is unstructured (just words). AI can convert one to the other. This concept is the foundation of the Family AI Bot.
  - The data analysis workflow: upload → explore → question → visualise → decide
- **BUILD:** "Personal Finance Analysis" — using your own spending data (bank export CSV, or sample data we provide), ask AI to: identify your top 5 spending categories, show spending trends over time, find surprising patterns, and give three specific recommendations. Produce at least two charts. This should reveal something you didn't know about your spending.

---

**L12: Data Analysis — Build a Dashboard**
- **Primitive:** Coding / Building + Data Analysis
- **Duration:** 60 min
- **What students learn:**
  - Combining two primitives: building + data analysis = interactive dashboards
  - Why dashboards beat spreadsheets: visual, interactive, shareable, impressive
  - Building a dashboard in Claude Artifacts: upload data → ask for a dashboard → iterate on design
  - Filters, dropdowns, tabs: making dashboards interactive
  - **Applied concept: The power of combining primitives** — neither data analysis alone nor coding alone creates a dashboard this good. Together, they create something neither could alone. This is the core GWTH insight.
- **BUILD:** "My Dashboard" — build an interactive dashboard from your L11 data analysis (or business data if you have it). Must include: at least 3 different chart types, filters or tabs, a clean professional design, and at least one insight that would be hard to spot in a spreadsheet. **This is portfolio-worthy work.**

---

**L13: Meet the Agents — AI That Works While You Sleep**
- **Primitive:** Automation + Coding / Building
- **Duration:** 60 min
- **What students learn:**
  - What AI agents are: software that takes actions on your behalf, not just answers questions
  - The agent landscape right now (February 2026):
    - **Claude Cowork** — desktop agent, works with your files, runs in a sandboxed VM. Now on Windows + Mac at $20/mo. Can organise files, create documents, process data, manage workflows. Powered by Opus 4.6 with 1M token context.
    - **OpenClaw** — open-source, runs locally, 145K GitHub stars. Connects via WhatsApp/Telegram/Signal. Cron jobs, webhooks, 50+ integrations. BUT: real security risks (Cisco, CrowdStrike warnings). Needs command-line comfort.
    - **ChatGPT with Actions** — can browse web, run code, use plugins. Good for one-off automated tasks.
    - **Custom GPTs / Claude Projects** — personalised AI assistants with uploaded knowledge and specific instructions
  - The automation spectrum: one-off tasks → scheduled jobs → always-on agents
  - **Security reality check**: agents that can access your files/email/calendar can also be exploited. We teach responsible use.
- **BUILD:** "My First Agent Task" — use Claude Cowork (or ChatGPT with Actions if no paid Claude plan) to:
  - Organise a folder of files (rename, sort, move)
  - Process a batch of documents (summarise 10 PDFs into one report)
  - Create a set of templated documents from a list
  - **The "wow" here is watching AI work autonomously on your computer.**

---

**L14: Custom GPTs & Claude Projects — Your Personal AI Assistant**
- **Primitive:** Coding / Building + Automation
- **Duration:** 60 min
- **What students learn:**
  - Building a Custom GPT (ChatGPT) or Claude Project with specific knowledge and personality
  - Uploading documents to create a domain-specific expert (your company handbook, product catalogue, study notes)
  - Writing system instructions that define behaviour
  - Testing and refining: the conversation that makes your assistant smarter
  - Real examples: a customer service bot, a study tutor, a recipe advisor, a writing coach
  - **This is the foundation for the Family AI Bot** — the "brain" that processes meeting recordings
  - **Applied concept: System prompts vs. user prompts** — system prompts are permanent instructions the AI always follows. User prompts are individual questions. This is how you create consistent, reliable AI behaviour.
- **BUILD:** "My Personal AI Assistant" — build a Custom GPT or Claude Project that:
  - Has a clear role (tutor, advisor, assistant, coach)
  - Contains uploaded reference documents relevant to that role
  - Has well-written system instructions
  - Handles at least 5 different types of questions reliably
  - **Test it with 10 real queries and document the results**

---

**L15: Automation Basics — Connect Your Tools**
- **Primitive:** Automation
- **Duration:** 60 min
- **What students learn:**
  - What automation means in practice: "When X happens, do Y automatically"
  - Tools: Zapier (easiest), Make.com (more powerful), native integrations
  - Your first automation: step-by-step setup
  - Common automations that save real time:
    - New email with attachment → save attachment to specific folder
    - Form submission → add to spreadsheet + send confirmation
    - Social media post scheduled at optimal times
    - Daily digest email summarising your news sources
  - **Applied concept: Triggers, actions, and conditions** — every automation has these three components. Once you understand this pattern, you can automate almost anything.
  - The automation audit: "What do I do every day/week that's the same steps every time?"
- **BUILD:** "Save Yourself an Hour" — identify one genuinely repetitive task in your life and automate it. Must actually work and save real time. Document: what the task was, how long it used to take, and how the automation works.

---

### Week 4: The Family AI Bot — Building Your Capstone (L16–L20)
*Goal: Build the complete Family AI Bot capstone project, piece by piece, combining everything learned so far.*

---

**L16: Ideation & Planning — Designing Your Family AI Bot**
- **Primitive:** Ideation & Strategy
- **Duration:** 45 min
- **What students learn:**
  - Strategic thinking with AI: using AI as a planning partner, not just a task executor
  - Designing a system: inputs → processing → outputs → distribution
  - The Family AI Bot architecture:
    - **Input:** Audio recording of family meeting
    - **Processing:** Transcription → AI extraction of tasks, events, meals, shopping
    - **Output:** Structured data (tasks list, calendar events, meal plan, shopping list)
    - **Distribution:** Tasks sent to family members, events to calendar, shopping list to shared app
  - Using AI to brainstorm system design: "I want to build something that does X, Y, Z — help me plan it"
  - Choosing your implementation approach (Cowork, Artifacts, Lovable, or OpenClaw)
  - **Applied concept: Breaking big problems into small steps** — this is the most transferable skill in AI. Every complex project is just a sequence of simple tasks.
- **BUILD:** "Family AI Bot Blueprint" — use AI to plan your capstone project in detail. Produce:
  - A system diagram (can be hand-drawn or AI-generated)
  - A list of components you need to build
  - A list of tools you'll use for each component
  - A timeline for the remaining lessons
  - **This is project management with AI — a skill that transfers to everything.**

---

**L17: Transcription & Extraction — Teaching AI to Listen**
- **Primitive:** Research & Analysis + Content Creation
- **Duration:** 60 min
- **What students learn:**
  - How speech-to-text works (the 2-minute version: audio → AI → text)
  - Free transcription options: Whisper (via ChatGPT), Google Docs voice typing, Otter.ai
  - Quality factors: good microphone placement, quiet room, speaking clearly
  - **The extraction prompt** — the core technique that makes the Family Bot work:
    - Take an unstructured transcript
    - Use a carefully crafted prompt to extract: tasks (who, what, when), events (what, date, time), meals (day, meal, recipe), shopping items
    - Output as structured data (JSON or formatted text)
  - Testing and refining extraction accuracy
  - **Applied concept: Prompt engineering for extraction** — this is a specific, powerful pattern. "Given this messy text, extract [specific categories] in [specific format]." This works for meeting notes, emails, articles, reports — anything.
- **BUILD:** "Family Meeting v1" — record a 10-minute family meeting (or simulate one). Transcribe it. Write an extraction prompt that pulls out tasks, events, meals, and shopping items. Compare the AI output to what was actually discussed. Refine the prompt until accuracy is high.

---

**L18: Building the Processing Engine**
- **Primitive:** Coding / Building
- **Duration:** 60 min
- **What students learn:**
  - Building the core of the Family AI Bot — the part that takes a transcript and produces structured outputs
  - **Cowork approach:** Create a folder with instructions. Drop a transcript file in. Cowork processes it and creates output files (tasks.md, events.md, meals.md, shopping.md)
  - **Artifacts approach:** Build an interactive app where you paste a transcript and get structured outputs with copy/export buttons
  - **Lovable approach:** Build a web app with upload functionality and formatted output pages
  - Handling edge cases: what if the recording quality is poor? What if people talk over each other? What if the meeting goes off-topic?
  - **Applied concept: The processing pipeline** — input → transform → output. This is the fundamental pattern of all software. You've just built one without writing code.
- **BUILD:** "Processing Engine v1" — build the working core of your Family Bot. It should take a transcript (from L17) and produce four clean outputs: tasks list, events list, meal plan, and shopping list. Test with at least 2 different transcripts.

---

**L19: Distribution — Getting Outputs to the Right People**
- **Primitive:** Automation + Coding / Building
- **Duration:** 60 min
- **What students learn:**
  - Connecting your Family Bot to the outside world:
    - **Calendar integration:** Google Calendar API (via Zapier/Make.com) or Cowork calendar plugin
    - **Task distribution:** Email, WhatsApp (via OpenClaw or Zapier), shared task lists
    - **Shopping list:** Shared Google Sheet, AnyList, Apple Reminders, or a dedicated page on your web app
  - Scheduling: making the pipeline run automatically
    - Cowork: set up folder instructions so processing starts when a new transcript file appears
    - OpenClaw: cron jobs that trigger processing at set times
    - Zapier/Make.com: webhook triggers from transcription services
  - **Security for the Family Bot:**
    - Don't expose API keys in shared apps
    - Use environment variables for sensitive data
    - If using OpenClaw: disable third-party skills, limit file access, isolate from sensitive data
    - The Cowork sandboxed VM approach is safest for most users
  - **Applied concept: APIs explained simply** — when your bot "sends a task to Google Calendar," it's using an API — like placing an order at a restaurant. You describe what you want (the event), the API delivers it (books it in your calendar). You don't need to understand the kitchen.
- **BUILD:** "End-to-End Test" — connect your processing engine to at least one output channel. Minimum: tasks appear in a shared document or get emailed to family members. Stretch: events land in Google Calendar automatically. Gold standard: the whole pipeline runs when you drop a recording file into a folder.

---

**L20: Polishing & Presenting — Make It Beautiful, Make It Yours**
- **Primitive:** Content Creation + Coding / Building
- **Duration:** 60 min
- **What students learn:**
  - Design polish: making your Family Bot outputs look professional
  - Formatting the shopping list, meal plan, and task list so they're a pleasure to read
  - Building a simple "hub" page that shows the latest outputs (web dashboard or Cowork-generated report)
  - Creating a demo: how to show someone what your bot does in 2 minutes
  - Documentation: writing simple instructions so your family can use the system
  - **The "teach someone else" test:** if you can explain how your system works to a non-technical family member, you understand it
- **BUILD:** "Family Bot Launch" — complete, polish, and demo your Family AI Bot. Requirements:
  - Process a real (or realistic) family meeting recording
  - Produce clean, formatted outputs for tasks, events, meals, shopping
  - At least one automated distribution channel working
  - A 2-minute demo you could show anyone
  - Simple instructions for ongoing use

---

### Week 5: Review, Portfolio & Optional Deep Dives (L21–L24)
*Goal: Consolidate learning, build your portfolio, and optionally go deeper.*

---

**L21: Month 1 Review — Look How Far You've Come**
- **Primitive:** Meta / All
- **Duration:** 45 min
- **What students learn:**
  - Revisit the AI Wishlist from L1 — cross off everything you can now do
  - Review the 6 primitives: rate your confidence in each (compare to week 1)
  - Tool review: update your tool log with preferences and honest assessments
  - What to pay for: now that you've tried everything, which subscriptions are worth keeping?
  - The "I can now..." list: write down every new capability you've gained
  - Preview of Month 2: from personal tools to team/business transformation
  - Setting goals for Month 2
- **BUILD:** "Progress Portfolio" — compile your best work into a portfolio:
  - Best prompts from your prompt library
  - Research project from L5
  - Content pieces from L6-L7
  - Apps/tools built in L8-L10
  - Dashboard from L12
  - Family AI Bot demo
  - Personal statement: "Before GWTH, I... Now I..."
  - **This portfolio is evidence of transformation. It's also useful for LinkedIn, job applications, and showing employers what you can do with AI.**

---

**L22: Advanced Building Workshop (Optional)**
- **Primitive:** Coding / Building
- **Duration:** 60 min
- **What students learn:**
  - Going beyond basic builds: apps with databases, user authentication, multi-page navigation
  - Deploying to production: hosting that handles real traffic
  - Using GPT-5.3-Codex-Spark for ultra-fast iteration (1,000 tokens/sec, real-time pair coding feel)
  - Building with APIs: connecting your app to weather data, stock prices, news feeds, any public API
  - The code quality conversation: when "it works" isn't enough (intro to spec-driven development)
  - From vibe coding to viable code: Gene Kim's "Vibe Coding for Grownups" framework
- **BUILD:** "Advanced App" — build and deploy a more complex application. Could extend the Family Bot, build a client-facing tool, or create something entirely new. Must be deployed and shareable.

---

**L23: The OpenClaw Deep Dive (Optional)**
- **Primitive:** Automation + Coding / Building
- **Duration:** 60 min
- **What students learn:**
  - Full OpenClaw setup: hardened, security-first configuration
  - How it works: local gateway → AI model (Claude/GPT) → actions via messaging
  - Key integrations: calendar, email, reminders, file management, browser automation
  - Cron jobs and scheduled tasks: making your agent work on a schedule
  - Security hardening: no third-party skills, limited permissions, API key management, isolated environment
  - What NOT to do: common mistakes that expose your data
  - The Moltbook phenomenon: what happens when AI agents talk to each other (fascinating, but a cautionary tale)
  - **Honest assessment:** OpenClaw is powerful but risky. Cowork is safer for most people. OpenClaw is for students who want maximum control and understand the trade-offs.
- **BUILD:** "Hardened Personal Agent" — set up OpenClaw with a security-first configuration. Connect it to one messaging platform (WhatsApp or Telegram). Set up three useful automations with cron scheduling. Document your security setup so you can audit it later.

---

**L24: Content & Automation Systems (Optional)**
- **Primitive:** Content Creation + Automation
- **Duration:** 60 min
- **What students learn:**
  - Building end-to-end content pipelines: idea → research → write → edit → publish → promote
  - Using Cowork for batch content processing: "Create blog posts from these 10 topic ideas"
  - Automated social media scheduling and cross-posting
  - Newsletter automation: collecting content throughout the week, generating a newsletter
  - Building a personal brand system that runs on autopilot
- **BUILD:** "Content Machine" — build an automated pipeline that takes a topic and produces ready-to-publish content for at least two platforms with minimal manual intervention. Must actually work for at least one real cycle.

---

## Lesson-Primitive Map

| # | Lesson | Primary Primitive | Also Uses | Week |
|---|--------|------------------|-----------|------|
| 1 | Welcome & What AI Can Do | Foundations | All (demos) | 1 |
| 2 | Your AI Toolkit | Foundations | — | 1 |
| 3 | Getting Great Results (Prompting) | Foundations | All | 1 |
| 4 | AI Safety (Just the Rules) | Foundations | — | 1 |
| 5 | Research with AI | Research | — | 1 |
| 6 | Content — Writing | Content Creation | — | 2 |
| 7 | Content — Visual/Audio/Video | Content Creation | — | 2 |
| 8 | Build Your First App | **Coding/Building** | — | 2 |
| 9 | Build Something Bigger | **Coding/Building** | — | 2 |
| 10 | Build Your First Website | **Coding/Building** | Content | 2 |
| 11 | Data Analysis | Data Analysis | — | 3 |
| 12 | Build a Dashboard | **Coding/Building** + Data | Data Analysis | 3 |
| 13 | Meet the Agents | Automation | Coding | 3 |
| 14 | Custom GPTs & Claude Projects | **Coding/Building** | Automation | 3 |
| 15 | Automation Basics | Automation | — | 3 |
| 16 | Ideation — Design Your Family Bot | Ideation & Strategy | All | 4 |
| 17 | Transcription & Extraction | Research | Content | 4 |
| 18 | Building the Processing Engine | **Coding/Building** | Data | 4 |
| 19 | Distribution & Scheduling | Automation | Coding | 4 |
| 20 | Polish & Present | Content + Coding | All | 4 |
| 21 | Month 1 Review | Meta | All | 5 |
| 22 | Advanced Building (Optional) | **Coding/Building** | — | 5 |
| 23 | OpenClaw Deep Dive (Optional) | Automation + Coding | — | 5 |
| 24 | Content & Automation Systems (Optional) | Content + Automation | — | 5 |

### Primitive Count

| Primitive | Primary Lessons | Supporting Role | Total Exposure |
|-----------|----------------|-----------------|----------------|
| **Coding / Building** | L8, L9, L10, L12, L14, L18, L22 = **7** | L13, L19, L20, L23 | 11 |
| **Content Creation** | L6, L7, L24 = **3** | L10, L17, L20 | 6 |
| **Research & Analysis** | L5, L17 = **2** | L4 (verify), L16 | 4 |
| **Data Analysis** | L11 = **1** | L12, L18 | 3 |
| **Automation** | L13, L15, L19, L23 = **4** | L14, L24 | 6 |
| **Ideation & Strategy** | L16 = **1** | L1 (planning), L21 | 3 |
| **Foundations** | L1, L2, L3, L4 = **4** | — | 4 |

**Key shift from v1:** Automation gets more lessons because the capstone *is* an automation project. Data Analysis gets fewer standalone lessons because it's integrated into the dashboard build (L12) and the processing engine (L18). Coding/Building dominates because students are building throughout.

---

## How "Applied Concepts" Work

Instead of theory lessons, technical knowledge is drip-fed exactly when needed:

| Concept | Where It's Taught | Why It Matters at That Moment |
|---------|-------------------|-------------------------------|
| Context windows | L3 (Prompting) | "Here's why your long conversation is giving bad answers" |
| Structured vs. unstructured data | L11 (Data) | "This is how your Family Bot will turn a recording into a task list" |
| System prompts | L6 (Content) | "Set this once so AI always writes in your voice" |
| APIs | L19 (Distribution) | "This is how your bot sends events to Google Calendar" |
| JSON | L17 (Extraction) | "This is the format AI uses to organise the data it extracts" |
| Tokens | L22 (Optional) | "This is why GPT-5.3-Codex-Spark at 1,000 tokens/sec feels instant" |
| Sandboxing / VMs | L13 (Agents) | "This is why Cowork is safer than OpenClaw — it runs in an isolated box" |
| Cron jobs | L19 (Distribution) | "This is how you tell your bot to run every Sunday at 7pm" |
| Prompt injection | L23 (Optional) | "This is the specific attack that makes OpenClaw risky" |

---

## What's Different From v1 of This Redesign

| Change | v1 | v2 | Why |
|--------|----|----|-----|
| Theory lessons | L3 "How AI Works" was still somewhat theoretical | Eliminated. Concepts are drip-fed as "Applied Concepts" only when needed | David's principle: "Only tell you what is useful" |
| Safety lesson | L5 was 45 min with deep ethics | L4 is 30 min, "Just the Rules That Matter" — 5 simple rules | Beginners need rules, not philosophy. Ethics depth in Month 2 |
| Building start | L10 (end of Week 2) | L8 (middle of Week 2) | "Get building as quickly as possible" |
| Latest tools | Generic references | Specific: Cowork on Windows ($20/mo), GPT-5.3-Codex-Spark, OpenClaw with security warnings | "Include the latest advances" |
| Capstone | Generic multi-primitive project | Family AI Bot with specific implementation paths | Much more tangible and personally useful |
| Week 4 | Mixed topics | Entirely dedicated to building the capstone | Gives students a full week of focused building |
| Agent coverage | One lesson | Two lessons (L13 agents overview + L14 custom assistants) + optional L23 OpenClaw | Agents are the biggest story of 2025-2026 |
| Beginner calibration | Some lessons assumed comfort with technical concepts | Every lesson assumes "I've only asked AI questions before" | True beginner starting point |
| Content creation | 4 lessons | 3 lessons (but content skills are used throughout capstone) | More time for building |
| Research | 3 lessons | 2 lessons (L5 fundamentals + L17 extraction for capstone) | Research is useful but not the differentiator |
