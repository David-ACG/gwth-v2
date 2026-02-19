# GWTH.ai Month 2 Redesign — February 2026
## "Building Real Apps & AI for Your Industry"

---

## Design Rationale

### Where Students Are Coming From

Students entering Month 2 have completed Month 1 and can:
- Use all 6 primitives independently for personal/small-business tasks
- Build simple apps and tools using vibe coding (Claude Artifacts, Lovable, Bolt)
- Conduct professional-quality research with multiple AI tools
- Create multi-format content efficiently
- Analyse data and present insights visually
- Set up basic automations and build simple AI agents
- Think strategically about AI implementation
- Build and demo their Family AI Bot capstone (familyaibot.com)

They are **not** beginners. They've had their "wow" moments and built real things. Now they want to build things that *matter* — apps that solve business problems, tools that replace subscriptions, systems that run while they sleep.

### Why Month 2 Matters Now (February 2026)

The AI landscape has shifted dramatically even since Month 1 was designed. Three developments make Month 2 urgent:

| Development | What It Means for GWTH Students | Date |
|-------------|-------------------------------|------|
| **Claude Cowork on Windows** | Desktop AI agent now available to 70% of computer users. File management, multi-step task execution, MCP connectors — all without code. | Feb 10, 2026 |
| **GPT-5.3-Codex & Codex-Spark** | OpenAI's most capable coding agent + a real-time model doing 1,000+ tokens/sec. Coding agents can now work for hours autonomously. | Feb 5–12, 2026 |
| **OpenClaw goes viral** | Open-source AI agent with 200K+ GitHub stars. Runs locally, connects to WhatsApp/Telegram/Slack. "The AI that actually does things." Also a cautionary tale — CVE-2026-25253 (CVSS 8.8), 1,800+ exposed instances, 335 malicious skills on ClawHub. Creator joining OpenAI Feb 14; project moving to open-source foundation. | Jan–Feb 2026 |

The message is clear: **AI agents that take real action are here, and they're accessible to non-programmers.** But with great power comes genuine security risks. Month 2 teaches students to harness this power responsibly.

### Why 35 Lessons: 20 Mandatory + 15 Optional

Month 1 had 24 lessons for everyone. Month 2 recognises that **students are now diverging**. A healthcare professional doesn't need the travel planning lesson. A finance analyst doesn't need the music production lesson. But they all need RAG, APIs, and security.

The **20 mandatory lessons** teach universal AI builder skills — the foundation every graduate needs regardless of their sector or role.

The **15 optional lessons** let students specialise:
- **7 Industry Verticals** — healthcare, legal, finance, travel, creative, marketing, HR — each building a real project on a real domain
- **5 Advanced Technical** — for students who want to go deeper into full-stack, RAG, agents, security, or collaboration tech
- **3 Career Accelerators** — for students building toward a specific career outcome (SaaS founder, open-source contributor, job seeker)

Students should complete **all 20 mandatory lessons** plus **3–5 optional lessons** relevant to their goals. This gives a personalised 23–25 lesson experience.

### Primitive Weighting for Month 2

Month 1 allocated 25% to coding/building. Month 2 doubles down, because the tools have caught up with the ambition:

| Primitive | Mandatory Lessons | Optional Lessons | % of Mandatory | Rationale |
|-----------|------------------|-----------------|----------------|-----------|
| **Coding / Building** | 8 | 5 | 40% | Students are ready for real apps. Cursor, Claude Code, and Windsurf make it possible without traditional programming. |
| **Automation & Agents** | 3 | 2 | 15% | Biggest demand from Month 1 graduates. Claude Cowork, OpenClaw, and n8n make sophisticated automation accessible. |
| **Research & RAG** | 2 | 2 | 10% | RAG is the bridge from "AI that chats" to "AI that knows your business." Essential for the capstone. |
| **Data Analysis** | 1 | 1 | 5% | Business-grade analysis integrated into dashboard building lesson. |
| **Content Creation** | 1 | 2 | 5% | Content systems and pipelines, not one-off pieces. Merged into one powerful lesson. |
| **Security & Safety** | 1 (+woven into every build) | 1 | 5% | Fundamentals mandatory; deep security optional. Woven into every coding lesson. |
| **Strategy & Career** | 1 | 3 | 5% | The human side: making the business case, industry applications. |
| **Foundations (Month 2)** | 3 | 0 | 15% | Recommended stacks, language awareness, context engineering — the professional toolkit. |

**Total: 20 mandatory + 15 optional = 35 lessons**

---

## Key Design Principles

### Original Principles (from Month 1, adapted for Month 2)

1. **Building is the backbone** — every lesson produces something usable, not just educational. If a student can't show someone what they built, the lesson failed.

2. **Recommended stacks, not endless options** — students get opinionated guidance on what to use and when. Decision fatigue kills momentum. We recommend Cursor + Claude Code + Supabase + Vercel and explain *why*.

3. **Security is woven in, not bolted on** — every app-building lesson includes security considerations. The L5 security checklist applies to every BUILD project. Students never submit an insecure app.

4. **Cursor and Claude Code are primary tools** — the two dominant AI coding environments, taught properly. Cursor for visual iteration, Claude Code for architecture and autonomous execution.

5. **No code ≠ no understanding** — students learn *when* to use Python vs JavaScript vs SQL, even though AI writes it. They make informed choices, not random ones.

6. **Address the fear** — job displacement anxiety is real. Month 2 confronts it head-on and turns it into motivation. Every lesson implicitly answers: "Is this making me more employable?"

7. **Always up to date** — every tool, model, and service mentioned is current as of February 2026. The GWTH Tech Radar auto-scans web and YouTube daily for new AI tools and surfaces alerts. GWTH updates content monthly.

### New Principles for Month 2

8. **One project, one domain** — every project builds toward a real, deployable product. Students leave with a portfolio of live URLs on purchased domains, not localhost prototypes. The capstone deploys on askmyco.com.

9. **Industry depth through optionals** — the mandatory track teaches universal AI skills. Optional lessons go deep into specific sectors (healthcare, law, finance, travel, creative, marketing, HR). A healthcare professional shouldn't sit through travel planning content, and vice versa.

10. **Portfolio-worthy by default** — every mandatory BUILD output should be good enough to include in a professional portfolio. If it wouldn't impress a hiring manager, we haven't gone far enough.

11. **Progressive scaffolding** — each lesson builds precisely on the previous. By the time students reach the capstone (L17–L18), every component (RAG, APIs, agents, security) has been individually practiced and validated in earlier lessons.

12. **Teach the trade-off** — never recommend a tool without explaining when NOT to use it. "Use Cursor for…" must always include "but switch to Claude Code when…" Students make informed choices, not follow recipes blindly.

13. **The 80/20 rule for complexity** — mandatory lessons cover the 80% that matters for 100% of students. Optional lessons cover the 20% that matters deeply for specific subsets. No one is forced to sit through content that doesn't apply to them.

---

## The GWTH Recommended Stack (February 2026)

A core principle of Month 2: stop drowning in options. Here's what we recommend and why.

**The GWTH Tech Radar** (gwth.ai/tech-radar) is the living, always-current version of this table — a registry of 47+ tools across 16 categories with version, status, cost tier, and lesson links. A daily scanner searches the web and YouTube for new AI tools, so the radar stays current without manual effort. Browse it any time to see what's new, what's changed, and what's been deprecated. The table below is a curated snapshot for Month 2.

| Category | Recommended Tool | Why | Alternative |
|----------|-----------------|-----|-------------|
| **AI Chat (Primary)** | Claude (Opus 4.6 / Sonnet 4.5) | Best reasoning, 1M context window, Projects, Cowork | ChatGPT (GPT-5.3) |
| **AI Chat (Research)** | Perplexity | Purpose-built for research with citations | Gemini Deep Research |
| **AI Coding IDE** | Cursor | Most mature AI-native IDE, huge ecosystem | Windsurf (free tier) |
| **AI Coding CLI** | Claude Code | Terminal-based, 200K context, autonomous execution | OpenAI Codex CLI |
| **Desktop Agent** | Claude Cowork | File management, multi-step tasks, MCP plugins | — |
| **Personal Agent** | OpenClaw | Open-source, local-first, multi-platform messaging | — (with security caveats) |
| **App Builder (No-Code)** | Lovable / Bolt | Full-stack apps from descriptions, instant deploy | Replit |
| **Automation** | n8n (self-hosted) or Make.com | Visual workflow builder with AI nodes | Zapier |
| **Vector Database** | Qdrant or Pinecone | For RAG — Qdrant is free/self-hosted, Pinecone is managed | ChromaDB |
| **Database** | Supabase (PostgreSQL) | Database + Auth + Realtime in one. Free tier. | SQLite (local) |
| **Hosting** | Vercel / Netlify (frontend), Railway (backend) | Free tiers, one-click deploy from GitHub | Render, Fly.io |
| **Version Control** | GitHub + GitHub Desktop | Essential for AI coding — your safety net | — |

---

## The Three Audiences Month 2 Serves

### 1. "I'm worried AI will take my job"
Month 2's answer: **Become the person who brings AI to your team.** Every company needs someone who can build internal tools, automate workflows, and train colleagues. That person is unfireable. Lessons L1, L15, and L19 directly address this. Optional lessons in their specific industry (healthcare, legal, finance, etc.) make the skills directly applicable.

### 2. "I've been made redundant and need to reinvent myself"
Month 2's answer: **Build a portfolio of real AI-powered tools and apps.** By the end of Month 2, you'll have a GitHub profile, deployed apps on real domains, and demonstrable skills that most hiring managers don't even know are possible yet. The capstone (L17–L18) deploys on askmyco.com. Optional O13–O15 accelerate the career transition.

### 3. "My company needs to train people on AI or we'll lose our best staff"
Month 2's answer: **This is the curriculum your team needs.** Practical, project-based, always current. Every lesson produces something the business can actually use. L19 specifically covers making the business case. The industry verticals (O1–O7) let different departments go deep in their own domain.

---

## Validation Test Suite

These 12 tests are run after every syllabus revision to ensure quality:

| # | Test | Pass Criteria |
|---|------|---------------|
| 1 | **BUILD test** | Every lesson (35/35) has a BUILD project with clear requirements |
| 2 | **CSV project mapping** | All 10 Month 2 CSV projects assigned to specific lessons |
| 3 | **No Month 1 duplication** | No lesson repeats content already covered in Month 1 (check against L1–L24) |
| 4 | **Primitive coverage** | All 6 primitives appear in mandatory lessons; each appears at least twice |
| 5 | **Audience alignment** | Each of the 3 audiences (job keeper, career changer, team leader) is explicitly addressed |
| 6 | **Optional distinctness** | Each optional lesson serves a clearly different audience subset with no overlap |
| 7 | **Dependency safety** | No mandatory lesson depends on content from an optional lesson |
| 8 | **Capstone scaffolding** | By L16, students have all skills needed for the capstone (RAG, APIs, deployment, security) |
| 9 | **Duration check** | Mandatory ≈ 20–22 hours, Optional ≈ 13–15 hours total |
| 10 | **Tool currency** | Every tool mentioned is verified current as of February 2026 |
| 11 | **Progressive complexity** | Each week is harder than the previous; no Week 3 concept appears in Week 1 |
| 12 | **Month 3 bridge** | Transition section accurately describes graduate capabilities |

---

## The Month 2 Capstone: AI Customer-Support Chatbot (askmyco.com)

The Month 2 capstone project is an **AI Customer-Support Chatbot** — a RAG-powered system that:

1. **Ingests company documents** — policies, FAQs, product info, procedures
2. **Builds a knowledge base** — vector embeddings stored in Qdrant or Pinecone
3. **Provides a chat interface** — customers ask questions in natural language
4. **Returns accurate answers with citations** — grounded in the company's actual documents
5. **Handles edge cases** — "I don't know" when the answer isn't in the knowledge base
6. **Deploys to a real domain** — live on askmyco.com, accessible to the public
7. **Includes basic analytics** — which questions are asked most, unanswered queries, satisfaction

### Why This Capstone?

- It's **commercially valuable** — every business wants an AI chatbot but most don't know how to build one safely
- It uses **all 6 primitives**: Research (gathering company knowledge), Content Creation (crafting responses), Coding (building the app), Data Analysis (usage analytics), Ideation (system design), Automation (the RAG pipeline)
- It builds directly on **L11–L12** (RAG) and **L9** (APIs) — students have already practiced every component
- It's **portfolio-worthy** — "I built an AI customer support system deployed on a real domain" is a genuine career differentiator
- It demonstrates **responsible AI** — citations prevent hallucination, security prevents data leakage

### Implementation Options (Students Choose)

| Approach | Difficulty | Best For | Tools |
|----------|-----------|----------|-------|
| **Next.js + Qdrant + Anthropic API** | Recommended | Full control, most impressive portfolio piece | Cursor, Claude Code, Supabase, Vercel |
| **Lovable/Bolt + Pinecone** | Medium | Students who prefer visual builders | Lovable or Bolt, Pinecone, Anthropic API |
| **Python + Streamlit + ChromaDB** | Medium | Students comfortable with Python from data lessons | Claude Code, Streamlit, ChromaDB |
| **Claude Projects + Custom Integration** | Easier | Quick deployment, less custom | Claude Projects, webhook integration |

---

## Complete Month 2 Syllabus: 20 Mandatory Lessons

### Week 1: Levelling Up — Your Month 2 Toolkit & Foundations (L1–L5)
*Goal: Establish the Month 2 mindset, set up professional development tools, understand when to use different languages, master context engineering, and learn security fundamentals.*

---

**L1: Welcome to Month 2 — From AI User to AI Builder**
- **Primitive:** Foundations (Month 2)
- **Duration:** 60 min
- **Content:**
  - Month 2 overview: what you'll build and why it matters for your career
  - The AI builder mindset: you're not learning to code — you're learning to direct AI to code *for* you
  - Addressing the elephant in the room: "Will AI take my job?" — reframing fear as opportunity
  - The data: companies that invest in AI training retain 34% more staff (Anthropic Economic Index)
  - For career changers: what employers actually want in 2026 (hint: it's not a CS degree)
  - What's new since Month 1: Claude Cowork on Windows, GPT-5.3-Codex, OpenClaw, Cursor 2.0
  - The GWTH Recommended Stack: your curated toolkit for Month 2
  - The GWTH Tech Radar: a live registry of 47+ AI tools that auto-scans for new discoveries — how to use it to stay current throughout the course
  - Preview of the capstone: by lesson 18, you'll have a deployed AI chatbot on askmyco.com
  - The optional tracks: pick 3–5 that match your industry or goals
- **BUILD:** "My Month 2 Plan" — revisit the self-assessment from Month 1's L1. Set three specific goals: one personal app to build, one business problem to solve, one skill to master. Choose which optional lessons you'll take. Create a project board (Notion, Trello, or a vibe-coded one) to track progress.

---

**L2: Setting Up Your Professional Dev Environment**
- **Primitive:** Foundations (Month 2)
- **Duration:** 60 min
- **Content:**
  - GitHub: your new best friend — why version control matters even for non-programmers (it's your undo button for everything AI builds)
  - Setting up GitHub Desktop (visual, no command line needed)
  - Installing Cursor: the AI-native IDE that understands your entire project
  - Installing Claude Code: the terminal-based powerhouse (with step-by-step for people who've never opened a terminal)
  - Setting up Claude Cowork on your desktop (macOS or Windows — both fully supported as of Feb 10, 2026)
  - Connecting MCP servers: giving Claude access to your tools
  - Your first Cursor project: opening a folder, understanding the file tree, running a preview
  - Context windows explained properly: what they are, why they matter, how to avoid filling them with junk (the single most important technical concept for AI builders)
- **BUILD:** "Dev Environment Ready" — install and configure GitHub Desktop, Cursor, and Claude Code. Create a GitHub repository. Open a sample project in Cursor, make an AI-assisted change, commit it, and push to GitHub. This is the workflow you'll use for every project this month.

---

**L3: When to Use Which Language (You Won't Write Any of Them)**
- **Primitive:** Coding / Building
- **Duration:** 45 min
- **Content:**
  - Why this lesson exists: you don't need to *learn* languages, but you need to *choose* them
  - The five languages that matter for AI builders (and when AI should use each):
    - **JavaScript/TypeScript** — web apps, interactive tools, anything that runs in a browser
    - **Python** — data analysis, AI/ML, automation scripts, backend APIs, RAG pipelines
    - **SQL** — talking to databases (every business app needs this)
    - **HTML/CSS** — the visual layer of every web page (AI handles this beautifully)
    - **Bash/Shell** — system automation, file management, deployment scripts
  - The decision framework: "What am I building?" → "Where does it run?" → "Which language?"
  - How to tell Cursor or Claude Code which language to use (and when to let it choose)
  - Real examples: "Build me a budget tracker" → JavaScript. "Analyse this CSV" → Python. "Set up a nightly backup" → Bash.
  - Why TypeScript is eating the world (and why AI is accelerating that)
  - What "full-stack" means in 2026: frontend (React/Next.js) + backend (Node.js or Python) + database (PostgreSQL or SQLite)
- **BUILD:** "Language Decision Tree" — create a simple interactive tool (using Claude Artifacts) that asks "What are you building?" and recommends the right language, framework, and tools. This becomes a personal reference guide for the rest of the course.

---

**L4: Context Engineering — The Skill That Separates Good from Great**
- **Primitive:** Coding / Building
- **Duration:** 60 min
- **Content:**
  - Beyond prompt engineering: why "context engineering" is the real skill in 2026
  - Context windows deep dive: Claude's 1M tokens, GPT-5.3's 128K, what this means in practice
  - The cost of context: why stuffing everything into the prompt is expensive and counterproductive
  - CLAUDE.md and .cursorrules: project-level instructions that persist across sessions
  - How to write effective project context files (the single highest-leverage thing you can do)
  - Spec-driven development: writing specifications *before* asking AI to build
  - The "describe, specify, build, iterate" workflow that professionals use
  - Managing long conversations: when to start fresh vs. when to continue
  - Using Claude Projects to organise knowledge for specific domains
- **BUILD:** "Project Spec Template" — create a reusable specification template that includes: project description, tech stack, file structure, key features, constraints, and examples. Test it by giving the same spec to Cursor and Claude Code — compare results. Save this template; you'll use it for every project this month.

---

**L5: AI Security Fundamentals — Building Things That Won't Bite You**
- **Primitive:** Security & Safety
- **Duration:** 60 min
- **Content:**
  - Why security is now a Month 2 topic (the OpenClaw lesson: 200K+ GitHub stars, CVE-2026-25253 with CVSS 8.8, 1,800+ exposed instances leaking API keys, 335 malicious skills distributing keyloggers — all within weeks of launch)
  - The three threats every AI builder must understand:
    1. **Prompt injection** — when malicious input hijacks your AI's instructions
    2. **Data leakage** — when your app accidentally exposes sensitive information
    3. **API key exposure** — when your credentials end up on GitHub (the #1 beginner mistake)
  - Environment variables (.env files): the right way to handle secrets
  - .gitignore: keeping sensitive files out of your repository
  - HTTPS, authentication, and basic access control explained simply
  - The "principle of least privilege": only give AI access to what it needs
  - Privacy by design: what data your app collects, where it goes, who can see it
  - GDPR and data protection basics for AI apps (especially relevant for UK/EU students)
  - When to use local models vs. cloud APIs (the privacy trade-off)
- **BUILD:** "Security Audit Checklist" — create a reusable checklist for every app you build this month. Includes: .env file present? .gitignore configured? API keys hidden? Input validation? Error messages safe? Apply it to one of your Month 1 projects and fix any issues found.

---

### Week 2: Building Real Apps with AI (L6–L10)
*Goal: Build progressively more complex applications using Cursor and Claude Code. Every app solves a real business problem and deploys to a real URL.*

---

**L6: Your First Cursor App — From Idea to Running Code**
- **Primitive:** Coding / Building
- **Duration:** 60 min
- **Content:**
  - Cursor deep dive: Composer mode, Tab completion, multi-file editing, codebase indexing, multi-agent interface (run up to 8 agents in parallel), visual editor (drag-and-drop UI edits)
  - The Cursor workflow: open project → write spec in CLAUDE.md → use Composer to build → iterate
  - Building a real app step-by-step: a client intake form that saves to a database
  - Understanding what Cursor creates: file structure, components, styling (you don't need to write it, but you should recognise it)
  - Debugging with AI: when something breaks, how to describe the problem so AI can fix it
  - The iterate-don't-restart principle: building in small steps, committing often
  - Live preview: seeing your changes instantly in the browser
  - When Cursor shines vs. when to switch to Claude Code
- **BUILD:** "Client Intake App" — build a professional intake form for a business (real or fictional) using Cursor. Must include: a multi-step form with validation, data saved to local storage or a database (SQLite), a dashboard view showing submitted entries, and responsive design that works on mobile. Deploy to Vercel or Netlify.

---

**L7: Claude Code — The Terminal Powerhouse**
- **Primitive:** Coding / Building
- **Duration:** 60 min
- **Content:**
  - Why Claude Code exists alongside Cursor (different tools for different jobs)
  - Claude Code's superpowers: 200K context window, autonomous multi-file execution, deep reasoning
  - The terminal isn't scary: a gentle introduction for people who've never used one
  - Setting up a project with Claude Code: `claude` command, project structure, CLAUDE.md
  - Claude Code for refactoring: taking a messy Month 1 project and making it professional
  - Git worktrees: running parallel sessions on different features
  - MCP integration: connecting Claude Code to external tools and services
  - The professional workflow: Claude Code for architecture + Cursor for iteration
  - Cost awareness: understanding usage-based pricing and how to be efficient
- **BUILD:** "Refactor & Extend" — take your best Month 1 app (the landing page, dashboard, or personal tool) and use Claude Code to: restructure the code professionally, add a new feature (e.g., user preferences, export to PDF, dark mode), set up proper error handling, and write a README.md. Push to GitHub with a clean commit history.

---

**L8: Building a Business Tool — Replace a £20/Month Subscription**
- **Primitive:** Coding / Building
- **Duration:** 90 min
- **Content:**
  - The "replace a subscription" mindset: every £20/month SaaS tool is an app you could build for free
  - Choosing your project: inventory tracker, appointment booking system, or simple CRM
  - Database fundamentals (just enough): what a database is, tables, rows, columns, queries
  - Why PostgreSQL (via Supabase) or SQLite: the two databases AI builds with best
  - Building a CRUD app: Create, Read, Update, Delete — the four operations behind every business tool
  - Authentication basics: letting users log in (Supabase Auth makes this almost free)
  - The design conversation: telling AI what you want it to look like (with reference screenshots)
  - From "it works" to "it works well": adding search, filters, sorting, and pagination
- **BUILD:** "My Business Tool" — build one of the following using Cursor or Claude Code:
  - **Inventory tracker**: add items, track quantities, set low-stock alerts, export reports
  - **Booking system**: calendar view, time slots, confirmation emails, no double-booking
  - **Simple CRM**: contacts, companies, interactions log, follow-up reminders
  Must include: database persistence, basic authentication, mobile-responsive design. Deploy and share the link.

---

**L9: APIs — Connecting Your App to the World**
- **Primitive:** Coding / Building
- **Duration:** 60 min
- **Content:**
  - What APIs are (finally, properly explained): they're just ways for apps to talk to each other
  - The restaurant analogy: your app is the customer, the API is the waiter, the server is the kitchen
  - REST APIs: the standard way the internet works (GET, POST, PUT, DELETE)
  - API keys: what they are, how to get them, how to keep them safe (reinforcing L5)
  - Real APIs you'll use: OpenAI, Anthropic, weather, email (SendGrid), payments (Stripe)
  - Building an API-connected app: a tool that pulls real data and displays it
  - Rate limiting and error handling: what happens when APIs say "slow down" or "no"
  - Webhooks explained: when other services need to talk to *your* app
  - The AI advantage: API integration is one of the tasks AI coding tools handle best
- **BUILD:** "Connected App" — extend your L8 business tool OR build a new one that connects to at least two external APIs. Examples: a dashboard that pulls weather + calendar data, a tool that uses the Anthropic API to summarise uploaded documents, or a CRM that auto-enriches contact info from public data. Must handle API errors gracefully.

---

**L10: Automation with Claude Cowork & Desktop Agents**
- **Primitive:** Automation & Agents
- **Duration:** 60 min
- **Content:**
  - Claude Cowork deep dive: the desktop AI agent that changed everything
  - Setting up Cowork: folder access, permissions, global instructions, folder-specific instructions
  - What Cowork can do: organise files, create documents from templates, process spreadsheets, draft emails, manage projects
  - Real-world workflows: "Prepare my weekly report" → Cowork reads your data files, analyses trends, creates a formatted report, saves it to the right folder
  - The 11 Anthropic Labs plugins: sales, legal, finance, marketing, data analysis, and software development
  - MCP connectors: connecting Cowork to your other tools (Slack, email, CRMs)
  - Cowork vs. Claude Code vs. Claude chat: when to use each
  - Security with Cowork: the principle of least privilege, reviewing planned actions, sandboxed execution
  - OpenClaw introduction: what it is, what it can do, and the security implications (CVE-2026-25253 RCE vulnerability, 335 malicious ClawHub skills, CrowdStrike enterprise scanner, the "lethal trifecta" warning from Palo Alto Networks)
- **BUILD:** "Automated Workflow" — set up Claude Cowork to handle a recurring business task. Examples: process all invoices in a folder (extract key data, create a summary spreadsheet, flag overdue items), organise a chaotic downloads folder by content type with descriptive names, or generate weekly status reports from project files. Must include a written "workflow spec" documenting what Cowork does and what permissions it needs.

---

### Week 3: RAG, Data & Intelligent Systems (L11–L15)
*Goal: Build apps that know your business. RAG transforms AI from generic to expert. Combine with data, automation, and agents to create systems that drive decisions and take action.*

---

**L11: RAG Explained — Teaching AI About Your Business**
- **Primitive:** Research & RAG
- **Duration:** 60 min
- **Content:**
  - What RAG actually is: giving AI access to *your* documents so it can answer questions about *your* business
  - Why RAG matters: LLMs know the internet but they don't know your company policies, product catalogue, or customer history
  - The RAG pipeline explained simply: documents → chunks → embeddings → vector database → retrieval → AI response
  - Embeddings demystified: turning text into numbers so AI can find similar things
  - Vector databases: Qdrant (free, self-hosted), Pinecone (managed, free tier), ChromaDB (lightweight)
  - The chunking problem: too big = irrelevant noise, too small = missing context (512 tokens is the sweet spot)
  - When to use RAG vs. when to use Claude Projects vs. when to fine-tune (spoiler: RAG for almost everything)
  - Hallucination reduction: how RAG with citations makes AI trustworthy for business use
  - Agentic RAG: the next evolution where AI decides what to retrieve and when
- **BUILD:** "Company Knowledge Bot" — create a RAG-powered chatbot for a business (real or fictional). Upload 5–10 documents (policies, FAQs, product info, procedures). Use Claude Code or a Python script to create embeddings, store them in a vector database, and build a simple chat interface that answers questions from the documents. Must include source citations in responses.

---

**L12: Building a RAG App with Cursor**
- **Primitive:** Research & RAG + Coding / Building
- **Duration:** 90 min
- **Content:**
  - From prototype to product: turning the L11 knowledge bot into a proper web application
  - Tech stack for RAG apps: Next.js frontend + Python backend + Qdrant/Pinecone + Anthropic API
  - Document upload and processing: letting users add their own documents through the UI
  - Chunking strategies in practice: recursive text splitting, preserving document structure
  - Retrieval quality: hybrid search (combining keyword + semantic), re-ranking results
  - The UI/UX of AI apps: chat interfaces, source highlighting, confidence indicators
  - Streaming responses: making the AI feel fast by showing words as they generate
  - Cost management: caching frequent queries, limiting context size, choosing the right model per task
  - Testing your RAG: how to know if it's retrieving the right information
- **BUILD:** "Business Knowledge App" — extend your L11 bot into a full web application with: document upload UI, searchable document library, chat interface with streaming, source citations with highlights, and at least one non-chat feature (e.g., document summarisation, FAQ generation, or report builder). Deploy to Railway or Vercel.

---

**L13: Business Data — Dashboards, Forecasting & Automated Reports**
- **Primitive:** Data Analysis + Coding / Building
- **Duration:** 75 min
- **Content:**
  - Month 1 taught you to analyse data. Month 2 teaches you to build systems that analyse data *automatically*.
  - The business dashboard: what decision-makers actually need to see (KPIs, trends, alerts)
  - Real-time vs. scheduled: when your dashboard should update live vs. daily/weekly
  - Data sources for SMBs: spreadsheets, accounting software exports, website analytics, CRM data
  - Building interactive dashboards with Cursor: React + Recharts/Chart.js
  - Adding filters, date ranges, and drill-downs that business users expect
  - From descriptive ("what happened") to predictive ("what will happen"): simple forecasting with AI
  - Automated report generation: the PDF report pipeline (data → analysis → charts → narrative → formatted PDF → email)
  - AI-powered insights: using the Anthropic API to generate natural-language summaries of your data
  - The "so what?" test: every chart must answer a business question
- **BUILD:** "Live Business Dashboard with Reports" — build a dashboard for an SMB scenario (or your actual business) that: displays at least 5 KPIs with visual charts, includes date range filtering, auto-generates a written summary of trends (using Claude API), can export a formatted PDF report, and can import data from CSV or a connected API. Deploy and share.

---

**L14: Advanced Automation — n8n, Make.com & Multi-Step Workflows**
- **Primitive:** Automation & Agents
- **Duration:** 60 min
- **Content:**
  - Beyond Zapier: why serious automation needs n8n or Make.com
  - n8n: the open-source automation platform (self-hosted = free, no message limits)
  - Visual workflow design: triggers → actions → conditions → branches → outputs
  - AI in automation: adding Claude/GPT nodes that process data mid-workflow
  - Real business workflows:
    - New lead comes in → AI enriches data → adds to CRM → sends personalised welcome email
    - Customer support email arrives → AI categorises urgency → routes to right team → drafts response
    - Invoice received → AI extracts data → adds to accounting spreadsheet → flags anomalies
  - Error handling and monitoring: what happens when a step fails (and why you must plan for this)
  - Webhooks in practice: connecting your custom apps (from L8–L9) to automation workflows
  - The automation audit: identifying every repetitive task in a business and scoring it for automation potential
- **BUILD:** "Business Automation Pipeline" — build a multi-step automation in n8n or Make.com that handles a real business process end-to-end. Must include: at least one AI processing step (classification, summarisation, or generation), connection to at least two services (email, Slack, spreadsheet, database, or custom app), error handling with notifications, and documentation of the workflow logic.

---

**L15: Building AI Agents That Take Action**
- **Primitive:** Automation & Agents + Coding / Building
- **Duration:** 90 min
- **Content:**
  - From chatbots to agents: the evolution from "responds to questions" to "takes action"
  - The agent architecture: perception → planning → action → observation → iteration
  - MCP (Model Context Protocol): the standard for connecting AI to external tools
  - Building a custom MCP server: giving Claude access to your business tools
  - Claude Code as an agent: running autonomous multi-step tasks from the terminal
  - Multi-agent systems: having specialised agents collaborate (researcher → analyst → writer)
  - Agent memory: making agents remember context across sessions (persistent storage patterns)
  - The guardrails conversation: limiting what agents can do, human-in-the-loop checkpoints
  - When agents go wrong: real examples of unintended behaviour and how to prevent it
  - OpenClaw revisited: what its architecture teaches us about agent design (and its security failures)
- **BUILD:** "Business Agent" — build an AI agent using Claude Code or a custom MCP server that: performs a specific business function (e.g., research assistant, content reviewer, data analyst), connects to at least one external service, maintains context across interactions, includes human approval for consequential actions, and has clear documentation of its capabilities and limitations.

---

### Week 4: Content, Capstone & Professional Growth (L16–L20)
*Goal: Build content systems at scale, complete the capstone AI Customer-Support Chatbot, and prepare for Month 3 and your career.*

---

**L16: Content & Multimedia Systems at Scale**
- **Primitive:** Content Creation + Coding / Building
- **Duration:** 60 min
- **Content:**
  - Month 1 taught you to create content. Month 2 teaches you to build content *factories*.
  - The content pipeline: ideation → research → drafting → editing → formatting → publishing → promotion
  - Multi-channel content: one input → blog post + LinkedIn post + email newsletter + video script + tweet thread
  - AI multimedia production: ElevenLabs Eleven v3 for voice (audio tags for emotion control, Text-to-Dialogue for multi-speaker content), AI presentations with Python-pptx + Claude, AI image generation for business graphics
  - Building a content management system: a custom app that stores, organises, and publishes content
  - AI-powered editing: style consistency, tone matching, brand voice enforcement
  - SEO with AI: keyword research, meta descriptions, internal linking — all automated
  - Content personalisation: using RAG to tailor content for different audiences
  - Copyright and AI-generated content: what you can and can't use commercially (Feb 2026 landscape)
  - The human element: what AI can't do (original insight, authentic voice, lived experience)
- **BUILD:** "Content Pipeline App" — build a web application that: takes a topic as input, generates content for at least 3 platforms (blog, social media, email — each properly formatted), includes an editing interface for human refinement, saves drafts to a database, and can schedule or export for publishing. Use Cursor to build; deploy for portfolio.

---

**L17: Capstone Planning — Your AI Customer-Support Chatbot**
- **Primitive:** All 6
- **Duration:** 90 min
- **Content:**
  - The capstone brief: build a complete, deployed AI customer-support chatbot on askmyco.com
  - Project scoping: what's achievable in two sessions vs. what to save for after the course
  - Architecture planning with AI: using Claude to design your system before building it
  - The system design: company knowledge base (RAG from L11–L12) + chat interface (from L6) + API integration (from L9) + security (from L5)
  - Writing a professional spec: requirements, user stories, tech stack, database schema, API design
  - Setting up the project: repository, file structure, CLAUDE.md, development environment
  - Sprint planning: breaking the build into manageable chunks
  - Portfolio thinking: what makes a project impressive to employers, clients, or investors
  - Choosing your implementation approach (see Capstone section above)
- **BUILD:** Complete project specification, architecture diagram, and initial setup with: repository on GitHub, authentication framework, document upload pipeline working, and at least one successful RAG query returning a cited answer. Push to GitHub with clear README.

---

**L18: Capstone Build, Deploy & Present**
- **Primitive:** All 6
- **Duration:** 120 min
- **Content:**
  - Building day: implementing the core features from the L17 spec
  - Using Cursor + Claude Code together: the professional dual-tool workflow
  - Integration testing: making sure all the parts work together
  - Security review: applying the L5 checklist before deployment (auth, input validation, API key handling, rate limiting, prompt injection defences)
  - Deployment: getting your chatbot live on askmyco.com (or your chosen domain)
  - Documentation: README, setup instructions, user guide
  - The portfolio presentation: how to showcase your project on GitHub, LinkedIn, and in interviews
  - Recording a demo: a 2-minute video walkthrough of your chatbot
  - Self-assessment: what you built vs. what you planned — and what that teaches you
- **BUILD:** Complete the capstone. Must be: fully deployed and accessible via URL, documented on GitHub with README and screenshots, functional (not a prototype — real documents ingested, real questions answered with citations), secure (passes the L5 checklist), and presentable (clean UI, handles edge cases). Record a demo video.

---

**L19: AI for Teams — Making the Business Case**
- **Primitive:** Strategy & Career
- **Duration:** 45 min
- **Content:**
  - The business case for AI training: retention, productivity, competitive advantage
  - The fear factor: "AI will replace us" vs. "AI will make us invaluable" — presenting the data
  - For employees: how to become your company's AI champion (and why that's the safest career move)
  - For managers: the ROI conversation — how to calculate and present AI training investment
  - For companies: "Train your people or lose them" — the retention argument backed by data
  - Change management: introducing AI tools to a team without causing panic
  - The AI policy framework: acceptable use, data handling, quality control, accountability
  - Quick wins: the first three AI implementations that win every team over
  - Building an internal AI toolkit: curating tools, creating guides, establishing best practices (the GWTH Tech Radar is an example — an automated system that tracks tools, scans for new ones, and keeps the team current)
  - The "AI champion" role: what it looks like and why every department needs one
- **BUILD:** "AI Implementation Proposal" — create a professional proposal document for introducing AI to a team or department. Must include: executive summary, current pain points with time/cost estimates, proposed AI solutions with specific tools, implementation timeline, risk assessment, ROI projection, and training plan. This should be good enough to actually present to management.

---

**L20: Month 2 Review — Portfolio & Month 3 Preview**
- **Primitive:** Foundations (Meta)
- **Duration:** 45 min
- **Content:**
  - Skills assessment: compare where you are now vs. your Month 2 L1 self-assessment
  - Portfolio review: compile all projects from the month into a presentable portfolio
  - Tool review: which tools earned their place in your workflow? Which didn't?
  - Cost review: what are you spending on AI tools and is it worth it?
  - The skills gap analysis: where do you need to go deeper?
  - Career action plan: specific next steps for each of the three audience types (job keeper, career changer, team leader)
  - Month 3 preview: enterprise AI, advanced coding, governance, industry specialisation, AI Readiness Voice Agent capstone
  - Community: sharing your capstone, getting feedback, helping others
- **BUILD:** "Month 2 Portfolio" — compile a professional portfolio document/page including: your GitHub profile with all Month 2 projects, the capstone chatbot with demo video, key metrics (apps built, hours saved, tools replaced), your best optional lesson project, a personal statement about your AI journey, and your Month 3 goals.

---

## Complete Month 2 Syllabus: 15 Optional Lessons

### Track A: Industry Verticals — "AI for Your Sector" (O1–O7)
*Each lesson applies Month 2 skills to a specific industry, building a real project on a real domain. Take the ones that match your sector.*

---

**O1: AI for Healthcare — Medical Research & Health Tracking**
- **Primitive:** Research & RAG + Coding / Building
- **Duration:** 60 min
- **Who this is for:** Healthcare professionals, medical researchers, health-tech entrepreneurs, anyone interested in health applications of AI
- **Content:**
  - The state of AI in healthcare (February 2026): what's approved, what's experimental, what's hype
  - Medical RAG: building a research tool that searches PubMed, clinical guidelines, and drug databases
  - Health data sensitivity: HIPAA (US), GDPR (EU/UK), and why healthcare AI has stricter rules
  - AI for patient-facing content: generating accurate, readable health information (with mandatory medical review)
  - Health tracking apps: logging symptoms, medications, vitals — AI providing trend analysis and summaries
  - The "not a doctor" problem: liability, disclaimers, and responsible AI in healthcare
  - Case study: C. difficile guide (cdiffguide.com) — a focused medical research aggregator
  - Case study: Health logging (healthlog.app) — personal health tracking with AI insights
- **BUILD:** Choose one:
  - **"Medical Research Hub"** (cdiffguide.com) — build an AI-driven research aggregator for a specific medical condition. Must include: search across medical literature, plain-language summaries of complex studies, treatment comparison tables, and clear disclaimers. Deploy to cdiffguide.com.
  - **"Health Tracker"** (healthlog.app) — build a health logging app where users track symptoms, medications, and vitals. AI provides trend analysis and generates summaries formatted for sharing with healthcare providers. Deploy to healthlog.app.

---

**O2: AI for Legal — Employment Law Research & Compliance**
- **Primitive:** Research & RAG + Coding / Building
- **Duration:** 60 min
- **Who this is for:** Legal professionals, HR managers, compliance officers, employment law enthusiasts
- **Content:**
  - AI in legal practice (February 2026): research automation, contract review, compliance checking
  - Legal RAG: building a tool that searches case law, statutes, and legal commentary
  - The accuracy imperative: why legal AI must cite sources and why hallucinated case law is career-ending
  - Employment law specifics: unfair dismissal, discrimination, redundancy, working time regulations
  - Jurisdiction awareness: UK vs US vs EU employment law — how to build tools that know the difference
  - AI for plain-language legal guidance: translating legalese into actionable advice
  - Limitations and disclaimers: "This is not legal advice" — when and how to use them
  - Regulatory landscape: SRA (UK) and ABA (US) guidance on AI in legal practice
- **BUILD:** "Employment Law Buddy" (employmentlawbuddy.com) — build an AI-powered legal research tool focused on employment law. Must include: RAG-powered search across employment legislation and case summaries, plain-language explanations of rights and procedures, jurisdiction selection (UK/US/EU), clear "not legal advice" disclaimers, and source citations for every answer. Deploy to employmentlawbuddy.com.

---

**O3: AI for Finance — Investment Analysis & Portfolio Tools**
- **Primitive:** Data Analysis + Coding / Building
- **Duration:** 60 min
- **Who this is for:** Finance professionals, individual investors, fintech entrepreneurs, financial advisors
- **Content:**
  - AI in finance (February 2026): robo-advisors, sentiment analysis, algorithmic screening
  - Financial data APIs: Yahoo Finance, Alpha Vantage, IEX Cloud — getting real market data into your apps
  - Stock analysis with AI: fundamental analysis, technical indicators, sentiment from news
  - Portfolio tracking: building dashboards that show holdings, performance, allocation
  - Risk assessment: using AI to analyse portfolio diversification and downside scenarios
  - The regulatory minefield: FCA (UK), SEC (US) — what you can and can't say about investments
  - AI-generated reports vs. financial advice: understanding the legal line
  - Backtesting: testing investment strategies against historical data
- **BUILD:** "Share Trajectory" (sharetrajectory.com) — build a financial analysis app that: pulls real stock/share data from a public API, displays price charts and key metrics, uses AI to generate analysis summaries (technical + fundamental), provides a simple buy/hold/sell signal with supporting rationale, and includes clear risk disclaimers. Must NOT provide personalised financial advice. Deploy to sharetrajectory.com.

---

**O4: AI for Travel & Event Planning**
- **Primitive:** Automation & Agents + Coding / Building
- **Duration:** 60 min
- **Who this is for:** Travel agents, event planners, hospitality professionals, anyone building travel tools
- **Content:**
  - AI in travel (February 2026): itinerary generation, dynamic pricing, personalised recommendations
  - Travel data: APIs for flights, hotels, activities, weather, exchange rates
  - Itinerary planning with AI: multi-day trips with budgets, logistics, and alternatives
  - Group event planning: the specific challenges of stag/hen parties, corporate retreats, group holidays
  - Budget management: tracking costs across flights, accommodation, activities, meals
  - Integration with booking platforms: when to link out vs. when to build your own
  - Personalisation: learning preferences from past trips and reviews
  - The agent opportunity: an AI travel assistant that handles the entire planning process
- **BUILD:** "Stags & Hens Guide" (stagsguide.co.uk / hensguide.co.uk) — build an AI-powered travel planning tool for group events. Must include: destination recommendations based on preferences and budget, multi-day itinerary generation with timings and logistics, budget calculator with per-person cost splitting, export to PDF for sharing with the group, and at least one API integration (weather, flights, or activities). Deploy to stagsguide.co.uk.

---

**O5: AI for Creative Industries — Music, Audio & Distribution**
- **Primitive:** Content Creation + Automation
- **Duration:** 60 min
- **Who this is for:** Musicians, content creators, podcasters, audio producers, creative entrepreneurs
- **Content:**
  - AI music generation (February 2026): Suno, Udio, Stable Audio — what's commercially usable
  - Creating AI-generated sleep music: ambient soundscapes, binaural beats, nature compositions
  - Album artwork with AI: Midjourney V7, Ideogram 3.0, FLUX — creating consistent visual branding
  - Music distribution: getting tracks on Spotify, Apple Music, Amazon Music (DistroKid, TuneCore)
  - The copyright question: who owns AI-generated music? Current legal landscape (Feb 2026)
  - AI voice narration: creating sleep stories and guided meditations with ElevenLabs
  - Building a promotional website: landing page with audio previews and streaming links
  - The business model: streaming royalties, sync licensing, direct sales
- **BUILD:** "Talk to Sleep" (talktosleep.com) — create and launch AI-generated sleep content. Must include: at least 3 sleep music tracks generated with AI, album artwork created with AI image generation, a promotional website with audio previews, distribution to at least one streaming platform (Spotify via DistroKid), and optional: an AI-narrated sleep story. Deploy the website to talktosleep.com.

---

**O6: AI for Marketing — SEO in the Post-Google Era**
- **Primitive:** Research & Analysis + Content Creation
- **Duration:** 60 min
- **Who this is for:** Marketers, SEO professionals, content strategists, business owners who need web traffic
- **Content:**
  - The search landscape in 2026: Google AI Overviews, Perplexity, ChatGPT search, Gemini
  - The death of traditional SEO? Not quite — but the rules have changed dramatically
  - AI bot optimisation: how to make your content discoverable by AI assistants (not just Google)
  - Structured data and schema markup: helping AI understand your content
  - Content strategy for dual audiences: humans who read AND AI that scrapes
  - Building an SEO analysis tool: keyword research, competitor analysis, content gap identification
  - AI-generated content vs. AI-assisted content: what Google penalises vs. what it rewards
  - The app directory opportunity: building niche directories that AI bots reference
  - Measuring success: new metrics beyond traditional rankings (AI citations, featured in AI answers)
- **BUILD:** "Site Geo" (sitegeo.net) — build an AI-powered SEO analysis and optimisation tool. Must include: website analysis (crawl a URL and assess SEO health), AI-generated improvement recommendations, keyword research with search volume data, content optimisation suggestions (for both human and AI discovery), and a dashboard showing SEO metrics. Deploy to sitegeo.net.

---

**O7: AI for HR & Recruitment — Video CVs & Talent Tools**
- **Primitive:** Content Creation + Coding / Building
- **Duration:** 60 min
- **Who this is for:** HR professionals, recruiters, career coaches, job seekers building their personal brand
- **Content:**
  - AI in recruitment (February 2026): CV screening, interview scheduling, skills assessment
  - Video CVs: why they work, how to create them, the technology behind them
  - The video CV pipeline: traditional CV → AI script generation → video recording → editing → hosting
  - AI voice interviews: having an AI interviewer ask questions and record responses
  - Payment integration: building a service with Stripe (subscription or per-CV pricing)
  - Analytics: tracking who views CVs, how long they watch, which sections engage
  - Privacy and bias: ethical considerations in AI recruitment tools
  - Building the platform: upload CV → generate script → record → publish → share
- **BUILD:** "My Video CV" (myvideo.cv) — build a video CV creation platform. Must include: CV upload and parsing, AI-generated interview script based on CV content, video recording interface (webcam capture), basic editing (trim, reorder sections), published video page with shareable URL, and view analytics. Deploy to myvideo.cv.

---

### Track B: Advanced Technical — "Going Deeper" (O8–O12)
*For students who want more technical depth. Each lesson extends mandatory curriculum into production-grade territory.*

---

**O8: Advanced Full-Stack — Databases, Auth & Production Deploy**
- **Primitive:** Coding / Building
- **Duration:** 60 min
- **Who this is for:** Students who want to build more complex, production-ready applications
- **Content:**
  - Beyond SQLite: PostgreSQL with Supabase — relations, indexes, Row Level Security
  - Authentication deep dive: OAuth (Google, GitHub login), JWT tokens, session management
  - Role-based access control: admin vs. user vs. viewer permissions
  - Database migrations: changing your schema without losing data
  - Production deployment: environment variables, build optimisation, CDN configuration
  - Monitoring: knowing when your app is down (uptime checks, error tracking with Sentry)
  - Performance: lazy loading, caching, image optimisation — making your app fast
  - CI/CD basics: pushing to GitHub automatically deploys your app (GitHub Actions)
- **BUILD:** "Production App Upgrade" — take your L8 business tool and upgrade it to production quality. Add: OAuth authentication (Google login), role-based permissions, PostgreSQL on Supabase, environment-based configuration (dev/staging/prod), uptime monitoring, and CI/CD deployment via GitHub Actions. This should be genuinely production-ready.

---

**O9: Advanced RAG — Agentic Retrieval & Production Systems**
- **Primitive:** Research & RAG + Coding / Building
- **Duration:** 60 min
- **Who this is for:** Students building RAG-based products or working with large document collections
- **Content:**
  - Beyond basic RAG: the limitations of simple vector search (semantic drift, context loss, stale data)
  - Hybrid search: combining BM25 keyword search with semantic embeddings for better retrieval
  - Re-ranking: using a second model to score and reorder results (Cohere Rerank, cross-encoders)
  - Agentic RAG: AI that decides *what* to retrieve, *when* to retrieve it, and *how much* context to include
  - Multi-collection RAG: searching across different document types with different strategies
  - Evaluation: RAGAS metrics, retrieval precision/recall, faithfulness scoring
  - Chunking advanced: parent-child chunks, sliding windows, document-aware splitting
  - Production concerns: incremental indexing, document versioning, access control per document
  - Cost optimisation: when to use embeddings vs. full-text search, model selection per query
- **BUILD:** "Production Knowledge Base" — upgrade your L12 RAG app with: hybrid search (keyword + semantic), re-ranking of results, an evaluation pipeline that measures retrieval quality, incremental document indexing (add new docs without re-indexing everything), and access control (different users see different documents). Benchmark before/after improvements.

---

**O10: Multi-Agent Systems — Orchestration & Collaboration**
- **Primitive:** Automation & Agents + Coding / Building
- **Duration:** 60 min
- **Who this is for:** Students interested in building sophisticated AI systems with multiple cooperating agents
- **Content:**
  - Multi-agent orchestration: building systems where multiple AI agents collaborate
  - The agent supervisor pattern: one agent coordinates specialist agents
  - Building with LangGraph (v1.0 stable), CrewAI, or AWS Strands Agents: frameworks for multi-agent systems
  - The Anthropic Claude Agent SDK: building custom agents with tool use
  - Communication patterns: sequential pipeline, parallel execution, debate/consensus
  - Agent evaluation: how to test whether your agents are actually doing what you want
  - Production considerations: monitoring, logging, cost tracking, graceful degradation
  - Real-world multi-agent examples:
    - Research team: web scraper + analyst + writer
    - Customer support: classifier + responder + escalator
    - Content pipeline: researcher + writer + editor + publisher
  - When NOT to use multi-agent: the simplicity principle (single agent > multi-agent for most tasks)
- **BUILD:** "Multi-Agent System" — build a system with at least 2 coordinating agents that perform a complete workflow. Example: a "research and report" system where Agent 1 researches a topic (web search, document analysis) and Agent 2 produces a formatted report from the research. Must include logging, error handling, and a human approval step.

---

**O11: Security Deep Dive — Hardening, Auditing & Compliance**
- **Primitive:** Security & Safety + Coding / Building
- **Duration:** 60 min
- **Who this is for:** Students building apps that handle sensitive data, or anyone wanting to understand AI security at a deeper level
- **Content:**
  - Security review of everything built this month: applying comprehensive checks to L6–L18 projects
  - Authentication and authorisation deep dive: Supabase Auth, NextAuth, JWT tokens, session security
  - Input validation: never trust user input — SQL injection, XSS, prompt injection in AI apps
  - Secure API design: rate limiting, CORS configuration, API key rotation, request signing
  - Data encryption: at rest (database-level) and in transit (HTTPS, TLS)
  - AI-specific security: prompt injection defences (input/output filtering, system prompt protection), output filtering, model access controls
  - OWASP top 10 for AI applications: the emerging threats specific to AI-powered apps
  - Audit logging: knowing who did what and when (essential for compliance)
  - Backup and recovery: because things will go wrong
  - Penetration testing basics: thinking like an attacker to find vulnerabilities
- **BUILD:** "Security Hardening Sprint" — take your capstone chatbot (or most important Month 2 project) and apply a comprehensive security review. Implement: proper authentication, input validation (including prompt injection defences), secure API key handling, rate limiting, error handling that doesn't leak information, and an audit log. Document every change with before/after. This is the version you'd be comfortable showing to a security auditor.

---

**O12: Real-Time Collaboration — Whiteboard & Meeting Tech**
- **Primitive:** Coding / Building + Content Creation
- **Duration:** 60 min
- **Who this is for:** Students interested in collaboration tools, hybrid meeting solutions, or real-time applications
- **Content:**
  - The hybrid meeting problem: remote participants can't see the physical whiteboard
  - Real-time web technologies: WebSockets, Server-Sent Events, WebRTC
  - Camera capture in the browser: accessing webcam feeds with JavaScript
  - Image processing with AI: cleaning up whiteboard photos, enhancing contrast, OCR for handwriting
  - Building real-time sharing: one person captures, many people view simultaneously
  - Beyond whiteboards: live document collaboration, shared cursors, presence indicators
  - Integration with meeting platforms: Zoom, Teams, Google Meet — embedding your tool
  - Performance: handling real-time streams without lag (compression, adaptive quality)
- **BUILD:** "Whiteboard Bot" (whiteboard.bot) — build an app that captures a physical whiteboard via camera and shares it live with remote participants. Must include: webcam capture interface, AI-powered image enhancement (auto-crop, contrast, OCR), real-time sharing (multiple viewers see updates), session management (create/join rooms), and export to PDF/image. Deploy to whiteboard.bot.

---

### Track C: Career Accelerators — "What's Next" (O13–O15)
*For students focused on specific career outcomes. Each lesson builds toward a tangible professional milestone.*

---

**O13: Building a SaaS Product — From Side Project to Revenue**
- **Primitive:** Coding / Building + Strategy & Career
- **Duration:** 60 min
- **Who this is for:** Entrepreneurs, aspiring founders, anyone who wants to monetise their AI skills
- **Content:**
  - What makes a side project a SaaS business: recurring revenue, scalability, customer retention
  - Validating your idea: before you build, make sure people will pay (landing page test, waitlist, pre-sales)
  - The minimum viable SaaS: authentication + core feature + payment + basic analytics
  - Payment integration with Stripe: subscriptions, one-time payments, usage-based billing
  - Pricing strategy: how to price AI-powered tools (cost-plus, value-based, freemium)
  - Customer acquisition: where your first 10 customers come from (not ads — personal outreach)
  - Legal basics: terms of service, privacy policy, business registration
  - Support and operations: handling bugs, feature requests, and customer complaints as a solo founder
  - The AI advantage: you can build in a weekend what used to take a team months
- **BUILD:** "SaaS MVP" — take any project from Month 2 and turn it into a revenue-ready SaaS. Add: Stripe payment integration (subscription or per-use), a landing page with pricing, terms of service and privacy policy (AI-generated, then reviewed), basic customer support (help page, contact form), and usage analytics. This should be a real product you could charge for.

---

**O14: Open Source & Community — Contributing to AI Projects**
- **Primitive:** Coding / Building + Strategy & Career
- **Duration:** 60 min
- **Who this is for:** Students wanting to build a public reputation, contribute to open-source AI tools, or understand the open-source ecosystem
- **Content:**
  - Why open source matters for your career: visibility, credibility, network, learning
  - Finding projects to contribute to: GitHub Explore, "good first issue" labels, trending repos
  - The contribution workflow: fork → branch → change → PR → review → merge
  - OpenClaw as a case study: 145K stars, rapid growth, security concerns — anatomy of a viral open-source project
  - Writing good issues: bug reports, feature requests, documentation improvements
  - Code review: how to give and receive feedback professionally
  - Building your own open-source project: licensing, README, contributing guidelines, code of conduct
  - The "bus factor": why open-source experience shows you can work in a team
  - Community management: Discord, GitHub Discussions, responding to issues
- **BUILD:** "Open Source Contribution" — make a genuine contribution to an open-source AI project. Options: fix a documented bug (find a "good first issue"), improve documentation, add a test, or submit a small feature. Must include: a merged PR (or pending review), a well-written commit message, and a screenshot of the PR for your portfolio. Alternatively: publish one of your Month 2 projects as an open-source repository with proper README, license, and contributing guidelines.

---

**O15: Career Showcase — Portfolio, GitHub & Technical Interviews**
- **Primitive:** Strategy & Career + Content Creation
- **Duration:** 60 min
- **Who this is for:** Job seekers, career changers, anyone preparing for AI-related roles
- **Content:**
  - The AI-era CV: what hiring managers look for in 2026 (hint: GitHub profile > degree)
  - GitHub as your portfolio: profile README, pinned repositories, contribution graph, README quality
  - LinkedIn optimisation: the AI-skills section, featured projects, recommendations
  - The technical interview for AI roles: what to expect, how to prepare, what they're really testing
  - "Tell me about a project" — how to present your GWTH work in 2 minutes (the STAR method adapted for tech)
  - Demo videos: recording professional walkthroughs of your projects (OBS, Loom)
  - The "build something live" interview: using AI coding tools in a technical assessment (yes, companies allow this now)
  - Freelancing with AI skills: platforms, pricing, landing your first client
  - The AI champion pitch: how to propose an AI transformation role to your current employer
- **BUILD:** "Professional Portfolio" — create a complete professional presence including: polished GitHub profile with README and pinned Month 2 projects, updated LinkedIn with AI skills and featured projects, a personal portfolio website (using your Month 1 skills) showcasing 3–5 best projects with demo videos, and a 2-minute "elevator pitch" script about your AI journey. This should be ready for a job application or client proposal.

---

## Lesson-Primitive Map

### Mandatory Lessons (L1–L20)

| # | Lesson | Primary Primitive | Secondary | Week |
|---|--------|------------------|-----------|------|
| L1 | Welcome to Month 2 | Foundations | Strategy & Career | 1 |
| L2 | Professional Dev Environment | Foundations | Coding / Building | 1 |
| L3 | When to Use Which Language | Coding / Building | — | 1 |
| L4 | Context Engineering | Coding / Building | — | 1 |
| L5 | AI Security Fundamentals | Security & Safety | — | 1 |
| L6 | First Cursor App | **Coding / Building** | — | 2 |
| L7 | Claude Code — Terminal Powerhouse | **Coding / Building** | — | 2 |
| L8 | Building a Business Tool | **Coding / Building** | Data Analysis | 2 |
| L9 | APIs — Connecting to the World | **Coding / Building** | — | 2 |
| L10 | Claude Cowork & Desktop Agents | Automation & Agents | — | 2 |
| L11 | RAG Explained | Research & RAG | — | 3 |
| L12 | Building a RAG App | Research & RAG + **Coding** | — | 3 |
| L13 | Business Data — Dashboards & Reports | Data Analysis + **Coding** | Automation | 3 |
| L14 | Advanced Automation (n8n/Make) | Automation & Agents | — | 3 |
| L15 | AI Agents That Take Action | Automation & Agents + **Coding** | — | 3 |
| L16 | Content & Multimedia at Scale | Content Creation | Coding / Building | 4 |
| L17 | Capstone Part 1 — Planning | All 6 | — | 4 |
| L18 | Capstone Part 2 — Build & Deploy | All 6 | — | 4 |
| L19 | AI for Teams — Business Case | Strategy & Career | — | 4 |
| L20 | Month 2 Review & Portfolio | Foundations | — | 4 |

### Optional Lessons (O1–O15)

| # | Lesson | Primary Primitive | Track | Project Domain |
|---|--------|------------------|-------|---------------|
| O1 | AI for Healthcare | Research & RAG + Coding | Industry | cdiffguide.com, healthlog.app |
| O2 | AI for Legal | Research & RAG + Coding | Industry | employmentlawbuddy.com |
| O3 | AI for Finance | Data Analysis + Coding | Industry | sharetrajectory.com |
| O4 | AI for Travel & Events | Automation + Coding | Industry | stagsguide.co.uk |
| O5 | AI for Creative/Music | Content Creation + Automation | Industry | talktosleep.com |
| O6 | AI for Marketing/SEO | Research + Content | Industry | sitegeo.net |
| O7 | AI for HR/Recruitment | Content + Coding | Industry | myvideo.cv |
| O8 | Advanced Full-Stack | Coding / Building | Technical | — |
| O9 | Advanced RAG | Research & RAG + Coding | Technical | — |
| O10 | Multi-Agent Systems | Automation + Coding | Technical | — |
| O11 | Security Deep Dive | Security & Safety | Technical | — |
| O12 | Real-Time Collaboration | Coding + Content | Technical | whiteboard.bot |
| O13 | Building a SaaS Product | Coding + Strategy | Career | — |
| O14 | Open Source Contribution | Coding + Strategy | Career | — |
| O15 | Career Showcase | Strategy + Content | Career | — |

### Primitive Coverage Summary

| Primitive | Mandatory (Primary) | Mandatory (Secondary) | Optional (Primary) | Total Exposure |
|-----------|--------------------|-----------------------|-------------------|----------------|
| **Coding / Building** | L3, L4, L6, L7, L8, L9, L12, L13, L15, L17, L18 = **11** | L2, L16 | O1, O2, O3, O4, O7, O8, O9, O10, O12, O13, O14 | 24 |
| **Automation & Agents** | L10, L14, L15 = **3** | L13, L17, L18 | O4, O5, O10 | 9 |
| **Research & RAG** | L11, L12 = **2** | L17, L18 | O1, O2, O6, O9 | 8 |
| **Data Analysis** | L13 = **1** | L8, L17, L18 | O3 | 5 |
| **Content Creation** | L16 = **1** | L17, L18 | O5, O6, O7, O12, O15 | 8 |
| **Security & Safety** | L5 = **1** (+woven into every build) | L17, L18 | O11 | 4+ |
| **Strategy & Career** | L19 = **1** | L1, L20 | O13, O14, O15 | 6 |
| **Foundations** | L1, L2, L20 = **3** | — | — | 3 |

---

## Key Differences: Month 1 vs. Month 2

| Aspect | Month 1 | Month 2 |
|--------|---------|---------|
| **Total lessons** | 24 (20 core + 4 optional) | 35 (20 mandatory + 15 optional) |
| **Primary coding tools** | Claude Artifacts, Lovable, Bolt | Cursor, Claude Code, Cowork |
| **Code complexity** | Single-file apps, no database | Multi-file apps with databases, APIs, auth |
| **Security** | One introductory lesson (L4) | One mandatory + one optional deep dive + woven into every build |
| **RAG** | Not covered | Two mandatory + one advanced optional |
| **Automation** | Basic (Zapier, simple agents) | Advanced (n8n, MCP, multi-agent, desktop agents) |
| **Deployment** | Optional | Required for every major project |
| **Version control** | Not required | GitHub for every project |
| **Language awareness** | "You don't need to know" | "You don't write it, but you choose it" |
| **Audience focus** | Personal productivity | SMB business tools + career development |
| **Industry content** | Not addressed | 7 sector-specific optional lessons |
| **Career content** | Not addressed | 1 mandatory + 3 career-accelerator optionals |
| **Context engineering** | Prompting basics | Full lesson on context windows, specs, CLAUDE.md |
| **Capstone** | Family AI Bot (familyaibot.com) | AI Customer-Support Chatbot (askmyco.com) |
| **Personalisation** | Same path for all | 20 mandatory + pick 3–5 from 15 optional |

---

## Duration Summary

### Mandatory Lessons (20)

| Week | Lessons | Total Duration |
|------|---------|---------------|
| Week 1 (L1–L5) | 5 lessons | 285 min (4h 45m) |
| Week 2 (L6–L10) | 5 lessons | 330 min (5h 30m) |
| Week 3 (L11–L15) | 5 lessons | 375 min (6h 15m) |
| Week 4 (L16–L20) | 5 lessons | 360 min (6h 00m) |
| **Total Mandatory** | **20 lessons** | **1,350 min (22h 30m)** |

### Optional Lessons (15)

| Track | Lessons | Total Duration |
|-------|---------|---------------|
| Industry Verticals (O1–O7) | 7 lessons | 420 min (7h 00m) |
| Advanced Technical (O8–O12) | 5 lessons | 300 min (5h 00m) |
| Career Accelerators (O13–O15) | 3 lessons | 180 min (3h 00m) |
| **Total Optional** | **15 lessons** | **900 min (15h 00m)** |

### Typical Student Path

| Path | Lessons | Duration |
|------|---------|----------|
| **Minimum** (mandatory only) | 20 | 22h 30m |
| **Recommended** (mandatory + 3–5 optional) | 23–25 | 25h 30m – 27h 30m |
| **Maximum** (all lessons) | 35 | 37h 30m |

---

## Tools & Services Referenced (All Current as of February 17, 2026)

*The full, always-current tool list lives on the **GWTH Tech Radar** (gwth.ai/tech-radar) — 47+ tools across 16 categories, updated daily by an automated scanner. The table below is a snapshot for reference.*

| Tool | Category | Status | Cost |
|------|----------|--------|------|
| Claude Opus 4.6 | LLM | Current flagship | Pro $20/mo, Max $100/mo |
| Claude Cowork | Desktop Agent | Research preview, macOS + Windows (Feb 10, 2026) | Included with paid Claude plans |
| Claude Code | CLI Coding Agent | GA | Included with Max plan / API usage |
| Cursor 2.0 (v2.4.37) | AI-Native IDE | GA, multi-agent interface (8 parallel agents) | Free / Pro $20/mo |
| Windsurf | AI IDE | GA (acquired by Cognition) | Free tier / Pro plans |
| GPT-5.3-Codex | Coding Agent | GA | ChatGPT Pro $200/mo |
| GPT-5.3-Codex-Spark | Fast Coding Model | Research preview (Cerebras) | ChatGPT Pro |
| OpenClaw | Open-Source AI Agent | Active, 200K+ stars, moving to foundation (creator joined OpenAI Feb 14) | Free (bring own API key) |
| Perplexity | AI Research | GA | Free / Pro $20/mo |
| n8n 2.9 | Automation | GA, open-source (v2.9.0, Feb 16, 2026) | Free (self-hosted) / Cloud plans |
| Make.com | Automation | GA | Free tier / paid plans |
| Supabase | Database + Auth | GA | Free tier / paid plans |
| Qdrant | Vector Database | GA, open-source | Free (self-hosted) / Cloud |
| Pinecone | Vector Database (Managed) | GA | Free tier / paid plans |
| Vercel | Hosting | GA | Free tier / Pro |
| Railway | Hosting (Backend) | GA | Free tier / Pro |
| GitHub | Version Control | GA | Free |
| ElevenLabs Eleven v3 | AI Voice | Alpha (Feb 11, 2026), audio tags + Text-to-Dialogue | Free tier / paid plans |
| Lovable | No-Code App Builder | GA | Free tier / paid |
| Bolt | No-Code App Builder | GA | Free tier / paid |
| Midjourney V7 | AI Image Generation | GA | $10/mo starter |
| Ideogram 3.0 | AI Image Generation | GA | Free tier / Pro |
| Suno / Udio | AI Music Generation | GA | Free tier / Pro |
| Stripe | Payments | GA | 1.5% + 20p per transaction (UK) |
| LangGraph | Multi-Agent Framework | GA | Free (open-source) |
| CrewAI | Multi-Agent Framework | GA | Free (open-source) |
| Sentry | Error Monitoring | GA | Free tier |

---

## CSV Project Mapping (All 10 Month 2 Projects)

| Project | Domain | Type | Lesson | Track |
|---------|--------|------|--------|-------|
| AI Customer-Support Chatbot | askmyco.com | Capstone | L17–L18 (Mandatory) | Capstone |
| AI-Generated Sleep Music | talktosleep.com | Smaller | O5 (Optional) | Industry |
| Marketing SEO for AI Bots | sitegeo.net | Smaller | O6 (Optional) | Industry |
| Medical Research (C. Diff) | cdiffguide.com | Smaller | O1 (Optional) | Industry |
| Employment Law Research | employmentlawbuddy.com | Smaller | O2 (Optional) | Industry |
| Health Logging | healthlog.app | Smaller | O1 (Optional) | Industry |
| Whiteboard Sharing | whiteboard.bot | Smaller | O12 (Optional) | Technical |
| Financial Share Analysis | sharetrajectory.com | Smaller | O3 (Optional) | Industry |
| Travel/Event Planning | stagsguide.co.uk | Smaller | O4 (Optional) | Industry |
| Video CV | myvideo.cv | Smaller | O7 (Optional) | Industry |

---

## Transition to Month 3

Month 2 ends with students who can:
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

Month 3 then takes these skills to **enterprise scale**:
- **Capstone:** AI Readiness Voice Agent (askevery.one) — combining voice AI with enterprise assessment
- **Governance frameworks** for AI at organisational level
- **Advanced coding** — full SaaS applications with subscription management
- **Industry-specific solutions** at enterprise scale (financial services compliance, healthcare regulation, public sector procurement)
- **AI security at enterprise level** — pen testing, compliance auditing, incident response
- **Leadership skills** needed to drive AI transformation across an organisation
- **Company RAG systems** (aitranscriptionhub.com) — enterprise-scale document intelligence
- **AI business transformation planning** (productarchitect.dev) — strategic roadmaps and ROI frameworks

---

## What's Different From the Previous Draft

| Change | Previous (24 lessons) | Updated (35 lessons) | Why |
|--------|----------------------|---------------------|-----|
| Lesson count | 24 (23 mandatory + 1 optional) | 35 (20 mandatory + 15 optional) | Students are diverging by industry and depth |
| Optional structure | 1 advanced agents lesson | 15 lessons in 3 tracks (Industry, Technical, Career) | Students in healthcare shouldn't sit through travel planning |
| Industry coverage | None | 7 sector-specific lessons with real domains | CSV projects mapped; each audience subset gets relevant content |
| Mandatory count | 23-24 | 20 | Focused on universal skills; specialist content moved to optional |
| Merged lessons | L13 + L14 separate | L13 merged (Dashboards + Forecasting + Reports) | Both are data analysis; one powerful lesson > two thin ones |
| Merged lessons | L17 + L18 separate | L16 merged (Content Systems + Multimedia) | Both are content creation; combined for efficiency |
| Security structure | L5 (fundamentals) + L20 (practice) both mandatory | L5 mandatory + O11 optional deep dive | Security fundamentals are universal; enterprise hardening is specialist |
| AI for Teams | L19 mandatory (45 min) | L19 mandatory (45 min) — unchanged | All three audiences need this |
| Capstone focus | Generic options | Specific: AI Customer-Support Chatbot on askmyco.com | CSV alignment; directly builds on RAG curriculum |
| Principles | 7 | 13 (7 original + 6 new) | Portfolio-first, progressive scaffolding, industry depth, trade-offs, 80/20 |
| Validation | None formalised | 12 explicit tests run after every revision | Ensures syllabus quality is measurable |
| Duration tracking | Informal | Explicit per-week and per-track totals | Students can plan their time; instructors can schedule |
