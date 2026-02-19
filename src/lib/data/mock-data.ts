/**
 * Mock/seed data for the GWTH v2 learning platform.
 * Single course: "GWTH — Applied AI Skills" delivered over 3 months.
 * This file is the single source of truth for all mock data during development.
 *
 * Course structure:
 *   Month 1 — 24 mandatory lessons (5 sections/weeks)
 *   Month 2 — 20 mandatory + 15 optional lessons (7 sections)
 *   Month 3 — 20 mandatory + 15 optional lessons (7 sections)
 */

import type {
  Course,
  Lab,
  Lesson,
  LessonProgress,
  LabProgress,
  CourseProgress,
  StudyStreak,
  Bookmark,
  Note,
  Certificate,
  Notification,
  DynamicScore,
} from "@/lib/types"

// ─── Courses ──────────────────────────────────────────────────────────────────

export const mockCourses: Course[] = [
  {
    id: "course_gwth",
    slug: "applied-ai-skills",
    title: "GWTH — Applied AI Skills",
    description:
      "Master AI in plain English. Build real apps, automate workflows, and transform your career — no coding required. A 3-month journey from AI beginner to enterprise-ready practitioner.",
    thumbnail: "/images/courses/applied-ai-skills.jpg",
    blurDataUrl: null,
    price: 0,
    category: "Applied AI",
    difficulty: "beginner",
    estimatedDuration: 5880,
    sections: [
      // ── Month 1: From Zero to Building ─────────────────────────────────────

      {
        id: "m1_w1",
        title: "Week 1: Quick Wins & Foundations",
        order: 1,
        month: 1,
        lessons: [
          { id: "m1_l01", slug: "welcome-to-gwth", title: "Welcome to GWTH — What AI Can Actually Do For You", order: 1, duration: 45, status: "completed" },
          { id: "m1_l02", slug: "your-ai-toolkit", title: "Your AI Toolkit — Set Up Once, Use Forever", order: 2, duration: 45, status: "completed" },
          { id: "m1_l03", slug: "prompting-skills", title: "Getting Great Results — The Prompting Skills That Matter", order: 3, duration: 60, status: "completed" },
          { id: "m1_l04", slug: "ai-safety-rules", title: "AI Safety in 60 Seconds — Just the Rules That Matter", order: 4, duration: 30, status: "completed" },
          { id: "m1_l05", slug: "research-with-ai", title: "Research with AI — Find Anything, Fast", order: 5, duration: 45, status: "completed" },
        ],
      },
      {
        id: "m1_w2",
        title: "Week 2: Content, Building & First Apps",
        order: 2,
        month: 1,
        lessons: [
          { id: "m1_l06", slug: "content-creation-writing", title: "Content Creation — Write Anything, Fast", order: 1, duration: 45, status: "completed" },
          { id: "m1_l07", slug: "content-creation-media", title: "Content Creation — Images, Audio & Video", order: 2, duration: 45, status: "completed" },
          { id: "m1_l08", slug: "build-your-first-app", title: "Build Your First App — The Moment Everything Changes", order: 3, duration: 60, status: "completed" },
          { id: "m1_l09", slug: "build-something-bigger", title: "Build Something Bigger — Tools That Solve Real Problems", order: 4, duration: 60, status: "completed" },
          { id: "m1_l10", slug: "build-your-first-website", title: "Build Your First Website", order: 5, duration: 60, status: "completed" },
        ],
      },
      {
        id: "m1_w3",
        title: "Week 3: Data, Agents & Automation",
        order: 3,
        month: 1,
        lessons: [
          { id: "m1_l11", slug: "data-analysis", title: "Data Analysis — Ask Questions, Get Answers", order: 1, duration: 60, status: "completed" },
          { id: "m1_l12", slug: "build-a-dashboard", title: "Build a Dashboard — Your Data, Visualised", order: 2, duration: 60, status: "completed" },
          { id: "m1_l13", slug: "ai-agents-intro", title: "AI Agents — Your New Digital Assistants", order: 3, duration: 45, status: "in-progress" },
          { id: "m1_l14", slug: "custom-gpts", title: "Custom GPTs and Project-Specific AI", order: 4, duration: 45, status: "available" },
          { id: "m1_l15", slug: "automation-basics", title: "Automation Basics — Make AI Work While You Sleep", order: 5, duration: 60, status: "available" },
        ],
      },
      {
        id: "m1_w4",
        title: "Week 4: Family AI Bot Capstone",
        order: 4,
        month: 1,
        lessons: [
          { id: "m1_l16", slug: "family-bot-plan", title: "Family AI Bot — Plan & Design (Capstone Pt.1)", order: 1, duration: 45, status: "locked" },
          { id: "m1_l17", slug: "family-bot-record", title: "Family AI Bot — Record & Transcribe (Capstone Pt.2)", order: 2, duration: 60, status: "locked" },
          { id: "m1_l18", slug: "family-bot-process", title: "Family AI Bot — Process & Extract (Capstone Pt.3)", order: 3, duration: 60, status: "locked" },
          { id: "m1_l19", slug: "family-bot-automate", title: "Family AI Bot — Distribute & Automate (Capstone Pt.4)", order: 4, duration: 60, status: "locked" },
          { id: "m1_l20", slug: "family-bot-polish", title: "Family AI Bot — Polish & Present (Capstone Pt.5)", order: 5, duration: 45, status: "locked" },
        ],
      },
      {
        id: "m1_w5",
        title: "Week 5: Review & Optional Deep Dives",
        order: 5,
        month: 1,
        lessons: [
          { id: "m1_l21", slug: "portfolio-review", title: "Portfolio Review — Show Off What You've Built", order: 1, duration: 45, status: "locked" },
          { id: "m1_l22", slug: "advanced-building", title: "Advanced Building — When Simple Isn't Enough", order: 2, duration: 60, status: "locked" },
          { id: "m1_l23", slug: "openclaw-deep-dive", title: "OpenClaw Deep Dive — Power and Responsibility", order: 3, duration: 60, status: "locked" },
          { id: "m1_l24", slug: "content-systems", title: "Content Systems — From One-Off to Pipeline", order: 4, duration: 60, status: "locked" },
        ],
      },

      // ── Month 2: Building Real Apps & AI for Your Industry ──────────────────

      {
        id: "m2_w1",
        title: "Week 1: Month 2 Toolkit",
        order: 6,
        month: 2,
        lessons: [
          { id: "m2_l01", slug: "welcome-to-month-2", title: "Welcome to Month 2 — What Changes Now", order: 1, duration: 30, status: "locked" },
          { id: "m2_l02", slug: "dev-environment-cursor-claude", title: "Your Development Environment — Cursor & Claude Code", order: 2, duration: 60, status: "locked" },
          { id: "m2_l03", slug: "language-selection", title: "Language Selection — Picking the Right Tool", order: 3, duration: 45, status: "locked" },
          { id: "m2_l04", slug: "context-engineering", title: "Context Engineering — The Skill That Separates Good from Great", order: 4, duration: 60, status: "locked" },
          { id: "m2_l05", slug: "security-fundamentals", title: "Security Fundamentals — Building Safely", order: 5, duration: 45, status: "locked" },
        ],
      },
      {
        id: "m2_w2",
        title: "Week 2: Real Apps with AI",
        order: 7,
        month: 2,
        lessons: [
          { id: "m2_l06", slug: "cursor-deep-dive", title: "Cursor Deep Dive — Your AI-Powered IDE", order: 1, duration: 60, status: "locked" },
          { id: "m2_l07", slug: "claude-code-mastery", title: "Claude Code Mastery — Terminal-Based Building", order: 2, duration: 60, status: "locked" },
          { id: "m2_l08", slug: "business-tools", title: "Business Tools — From Idea to Working Product", order: 3, duration: 60, status: "locked" },
          { id: "m2_l09", slug: "apis-and-integrations", title: "APIs & Integrations — Connecting Everything", order: 4, duration: 60, status: "locked" },
          { id: "m2_l10", slug: "cowork-automation", title: "Cowork Automation — AI That Works While You Sleep", order: 5, duration: 60, status: "locked" },
        ],
      },
      {
        id: "m2_w3",
        title: "Week 3: RAG, Data & Intelligence",
        order: 8,
        month: 2,
        lessons: [
          { id: "m2_l11", slug: "rag-explained", title: "RAG Explained — Your Data, AI-Powered", order: 1, duration: 60, status: "locked" },
          { id: "m2_l12", slug: "building-rag-applications", title: "Building RAG Applications", order: 2, duration: 60, status: "locked" },
          { id: "m2_l13", slug: "business-dashboards", title: "Business Dashboards — Data You Can Act On", order: 3, duration: 60, status: "locked" },
          { id: "m2_l14", slug: "advanced-automation", title: "Advanced Automation — Multi-Step Workflows", order: 4, duration: 60, status: "locked" },
          { id: "m2_l15", slug: "multi-agent-intro", title: "Multi-Agent Introduction — AI Teams", order: 5, duration: 45, status: "locked" },
        ],
      },
      {
        id: "m2_w4",
        title: "Week 4: Capstone & Career",
        order: 9,
        month: 2,
        lessons: [
          { id: "m2_l16", slug: "content-systems-at-scale", title: "Content Systems at Scale", order: 1, duration: 45, status: "locked" },
          { id: "m2_l17", slug: "support-chatbot-planning", title: "AI Customer-Support Chatbot — Planning (Capstone Pt.1)", order: 2, duration: 60, status: "locked" },
          { id: "m2_l18", slug: "support-chatbot-build", title: "AI Customer-Support Chatbot — Build & Deploy (Capstone Pt.2)", order: 3, duration: 60, status: "locked" },
          { id: "m2_l19", slug: "teams-and-business-case", title: "Teams & Business Case", order: 4, duration: 45, status: "locked" },
          { id: "m2_l20", slug: "month-2-portfolio-review", title: "Month 2 Portfolio Review", order: 5, duration: 45, status: "locked" },
        ],
      },

      // ── Month 2: Optional Tracks ───────────────────────────────────────────

      {
        id: "m2_opt_industry",
        title: "Industry Verticals",
        order: 10,
        month: 2,
        isOptional: true,
        optionalTrack: "Industry Verticals",
        lessons: [
          { id: "m2_o01", slug: "healthcare-ai", title: "Healthcare AI", order: 1, duration: 60, status: "locked", isOptional: true, optionalTrack: "Healthcare" },
          { id: "m2_o02", slug: "legal-ai", title: "Legal AI", order: 2, duration: 60, status: "locked", isOptional: true, optionalTrack: "Legal" },
          { id: "m2_o03", slug: "finance-ai", title: "Finance AI", order: 3, duration: 60, status: "locked", isOptional: true, optionalTrack: "Finance" },
          { id: "m2_o04", slug: "travel-events-ai", title: "Travel & Events AI", order: 4, duration: 60, status: "locked", isOptional: true, optionalTrack: "Travel" },
          { id: "m2_o05", slug: "creative-ai", title: "Creative AI", order: 5, duration: 60, status: "locked", isOptional: true, optionalTrack: "Creative" },
          { id: "m2_o06", slug: "marketing-ai", title: "Marketing AI", order: 6, duration: 60, status: "locked", isOptional: true, optionalTrack: "Marketing" },
          { id: "m2_o07", slug: "hr-ai", title: "HR AI", order: 7, duration: 60, status: "locked", isOptional: true, optionalTrack: "HR" },
        ],
      },
      {
        id: "m2_opt_advanced",
        title: "Advanced Technical",
        order: 11,
        month: 2,
        isOptional: true,
        optionalTrack: "Advanced Technical",
        lessons: [
          { id: "m2_o08", slug: "full-stack-databases", title: "Full-Stack Databases", order: 1, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m2_o09", slug: "advanced-rag", title: "Advanced RAG", order: 2, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m2_o10", slug: "multi-agent-orchestration", title: "Multi-Agent Orchestration", order: 3, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m2_o11", slug: "security-hardening", title: "Security Hardening", order: 4, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m2_o12", slug: "real-time-collaboration", title: "Real-Time Collaboration", order: 5, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
        ],
      },
      {
        id: "m2_opt_career",
        title: "Career Accelerators",
        order: 12,
        month: 2,
        isOptional: true,
        optionalTrack: "Career Accelerators",
        lessons: [
          { id: "m2_o13", slug: "saas-productisation", title: "SaaS Productisation", order: 1, duration: 60, status: "locked", isOptional: true, optionalTrack: "Career Accelerators" },
          { id: "m2_o14", slug: "open-source-contribution", title: "Open-Source Contribution", order: 2, duration: 60, status: "locked", isOptional: true, optionalTrack: "Career Accelerators" },
          { id: "m2_o15", slug: "portfolio-and-interview-prep", title: "Portfolio & Interview Prep", order: 3, duration: 60, status: "locked", isOptional: true, optionalTrack: "Career Accelerators" },
        ],
      },

      // ── Month 3: AI Transformation & Enterprise-Scale Solutions ─────────────

      {
        id: "m3_w1",
        title: "Week 1: Enterprise Foundations",
        order: 13,
        month: 3,
        lessons: [
          { id: "m3_l01", slug: "enterprise-ai", title: "Enterprise AI — A Different Game", order: 1, duration: 45, status: "locked" },
          { id: "m3_l02", slug: "transformation-mindset", title: "Transformation Mindset — Leading Change", order: 2, duration: 60, status: "locked" },
          { id: "m3_l03", slug: "model-selection", title: "Model Selection — Choosing the Right AI", order: 3, duration: 60, status: "locked" },
          { id: "m3_l04", slug: "self-hosted-ai", title: "Self-Hosted AI — When Data Cannot Leave", order: 4, duration: 60, status: "locked" },
          { id: "m3_l05", slug: "cost-management", title: "Cost Management — AI That Pays for Itself", order: 5, duration: 45, status: "locked" },
        ],
      },
      {
        id: "m3_w2",
        title: "Week 2: Enterprise-Scale Building",
        order: 14,
        month: 3,
        lessons: [
          { id: "m3_l06", slug: "enterprise-scale-applications", title: "Enterprise-Scale Applications", order: 1, duration: 60, status: "locked" },
          { id: "m3_l07", slug: "multi-tenant-systems", title: "Multi-Tenant Systems", order: 2, duration: 60, status: "locked" },
          { id: "m3_l08", slug: "enterprise-integrations", title: "Enterprise Integrations", order: 3, duration: 60, status: "locked" },
          { id: "m3_l09", slug: "advanced-agents", title: "Advanced Agents — Autonomous Systems", order: 4, duration: 60, status: "locked" },
          { id: "m3_l10", slug: "workflow-orchestration", title: "Workflow Orchestration", order: 5, duration: 60, status: "locked" },
        ],
      },
      {
        id: "m3_w3",
        title: "Week 3: Enterprise Automation & Governance",
        order: 15,
        month: 3,
        lessons: [
          { id: "m3_l11", slug: "enterprise-automation", title: "Enterprise Automation — Process Transformation", order: 1, duration: 60, status: "locked" },
          { id: "m3_l12", slug: "governance-frameworks", title: "Governance Frameworks", order: 2, duration: 60, status: "locked" },
          { id: "m3_l13", slug: "owasp-ai-top-10", title: "OWASP AI Top 10 — Security That Matters", order: 3, duration: 60, status: "locked" },
          { id: "m3_l14", slug: "data-pipelines", title: "Data Pipelines — Enterprise Data Flow", order: 4, duration: 60, status: "locked" },
          { id: "m3_l15", slug: "roi-measurement", title: "ROI Measurement — Proving the Value", order: 5, duration: 45, status: "locked" },
        ],
      },
      {
        id: "m3_w4",
        title: "Week 4: Deployment & Leadership",
        order: 16,
        month: 3,
        lessons: [
          { id: "m3_l16", slug: "deployment-strategies", title: "Deployment Strategies", order: 1, duration: 60, status: "locked" },
          { id: "m3_l17", slug: "readiness-assessment-planning", title: "AI Readiness Assessment — Planning (Capstone Pt.1)", order: 2, duration: 60, status: "locked" },
          { id: "m3_l18", slug: "readiness-assessment-build", title: "AI Readiness Assessment — Build & Deploy (Capstone Pt.2)", order: 3, duration: 60, status: "locked" },
          { id: "m3_l19", slug: "internal-training-design", title: "Internal Training Design", order: 4, duration: 45, status: "locked" },
          { id: "m3_l20", slug: "transformation-roadmap", title: "Transformation Roadmap & Final Review", order: 5, duration: 60, status: "locked" },
        ],
      },

      // ── Month 3: Optional Tracks ───────────────────────────────────────────

      {
        id: "m3_opt_enterprise",
        title: "Enterprise Verticals",
        order: 17,
        month: 3,
        isOptional: true,
        optionalTrack: "Enterprise Verticals",
        lessons: [
          { id: "m3_e01", slug: "financial-services-ai", title: "Financial Services AI", order: 1, duration: 60, status: "locked", isOptional: true, optionalTrack: "Enterprise Verticals" },
          { id: "m3_e02", slug: "healthcare-enterprise-ai", title: "Healthcare Enterprise AI", order: 2, duration: 60, status: "locked", isOptional: true, optionalTrack: "Enterprise Verticals" },
          { id: "m3_e03", slug: "public-sector-ai", title: "Public Sector AI", order: 3, duration: 60, status: "locked", isOptional: true, optionalTrack: "Enterprise Verticals" },
          { id: "m3_e04", slug: "manufacturing-ai", title: "Manufacturing AI", order: 4, duration: 60, status: "locked", isOptional: true, optionalTrack: "Enterprise Verticals" },
          { id: "m3_e05", slug: "professional-services-ai", title: "Professional Services AI", order: 5, duration: 60, status: "locked", isOptional: true, optionalTrack: "Enterprise Verticals" },
        ],
      },
      {
        id: "m3_opt_advanced",
        title: "Advanced Technical",
        order: 18,
        month: 3,
        isOptional: true,
        optionalTrack: "Advanced Technical",
        lessons: [
          { id: "m3_e06", slug: "self-hosted-model-deployment", title: "Self-Hosted Model Deployment", order: 1, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m3_e07", slug: "voice-ai-agents", title: "Voice AI Agents", order: 2, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m3_e08", slug: "security-red-teaming", title: "Security Red Teaming", order: 3, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m3_e09", slug: "cost-optimisation-at-scale", title: "Cost Optimisation at Scale", order: 4, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m3_e10", slug: "compliance-automation", title: "Compliance Automation", order: 5, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
        ],
      },
      {
        id: "m3_opt_leadership",
        title: "Leadership & Transformation",
        order: 19,
        month: 3,
        isOptional: true,
        optionalTrack: "Leadership & Transformation",
        lessons: [
          { id: "m3_e11", slug: "internal-training-programme-design", title: "Internal Training Programme Design", order: 1, duration: 60, status: "locked", isOptional: true, optionalTrack: "Leadership & Transformation" },
          { id: "m3_e12", slug: "consulting-practice", title: "Consulting Practice", order: 2, duration: 60, status: "locked", isOptional: true, optionalTrack: "Leadership & Transformation" },
          { id: "m3_e13", slug: "executive-advisory", title: "Executive Advisory", order: 3, duration: 60, status: "locked", isOptional: true, optionalTrack: "Leadership & Transformation" },
          { id: "m3_e14", slug: "board-level-communication", title: "Board-Level Communication", order: 4, duration: 60, status: "locked", isOptional: true, optionalTrack: "Leadership & Transformation" },
          { id: "m3_e15", slug: "change-management", title: "Change Management", order: 5, duration: 60, status: "locked", isOptional: true, optionalTrack: "Leadership & Transformation" },
        ],
      },
    ],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-02-15"),
  },
]

// ─── Full Lessons (for lesson viewer) ─────────────────────────────────────────

export const mockLessons: Lesson[] = [
  // L1: Welcome to GWTH
  {
    id: "m1_l01",
    slug: "welcome-to-gwth",
    title: "Welcome to GWTH — What AI Can Actually Do For You",
    description:
      "Discover what modern AI tools can really do, cut through the hype, and see the practical skills you will build over the next three months.",
    order: 1,
    duration: 45,
    difficulty: "beginner",
    category: "Foundations",
    sectionId: "m1_w1",
    courseId: "course_gwth",
    courseSlug: "applied-ai-skills",
    month: 1,
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    learnContent: `# Welcome to GWTH — What AI Can Actually Do For You

Welcome. If you are here, you have probably heard the hype. AI is going to change everything, replace every job, cure every disease, and possibly make you a cup of tea. Some of that is true. Most of it is noise.

This course is different. We are not here to talk about AI in the abstract. We are here to **build things** — starting today, using nothing but plain English and a handful of free tools.

## What You Will Learn

Over the next three months, you will go from "I have heard of ChatGPT" to **building real applications, automating workflows, and leading AI transformation** in your organisation. No coding required. No computer science degree. Just clear thinking and a willingness to experiment.

### Month 1: From Zero to Building
You will set up your AI toolkit, learn to get great results from AI, create content, build your first apps and websites, analyse data, and construct a capstone project — a Family AI Bot that records, transcribes, processes, and distributes information automatically.

### Month 2: Real Apps & Your Industry
You will move into real development environments (Cursor, Claude Code), build production-quality tools, connect APIs, create RAG-powered applications, and explore AI for your specific industry — healthcare, legal, finance, marketing, and more.

### Month 3: Enterprise & Transformation
You will tackle enterprise-scale challenges: self-hosted AI, multi-tenant systems, governance frameworks, security (OWASP AI Top 10), and learn to lead AI transformation within organisations.

## The GWTH Philosophy

> **If you can describe it in plain English, you can build it with AI.**

We believe the most important AI skill is not coding — it is **clear thinking**. Every lesson in this course follows three principles:

1. **Plain English first.** You will describe what you want in words, and AI will help you build it.
2. **Build, do not just learn.** Every lesson has a practical output. You will finish each one with something you can use.
3. **Real problems, not toy examples.** We work on things that matter — business tools, automations, dashboards, bots.

## What AI Can Actually Do Right Now

Let us cut through the noise. Here is what AI tools can reliably do today:

| Capability | Example Tools | What It Means For You |
|-----------|---------------|----------------------|
| **Write anything** | Claude, ChatGPT, Gemini | Emails, reports, blog posts, marketing copy — in seconds |
| **Build apps** | Lovable, Bolt, v0 | Describe an app in English, get a working product |
| **Analyse data** | Claude, ChatGPT Code Interpreter | Upload a spreadsheet, ask questions, get charts |
| **Automate workflows** | Make.com, Zapier, n8n | Connect tools, trigger actions, eliminate manual work |
| **Create images** | Midjourney, DALL-E, Flux | Professional visuals from text descriptions |
| **Research anything** | Perplexity, Claude | Deep research with sources in minutes, not hours |
| **Build websites** | Lovable, Bolt, Cursor | Full websites from a description — no HTML required |

## Your First AI Interaction

Before we go any further, let us try something. Open [Claude](https://claude.ai) or [ChatGPT](https://chat.openai.com) and type this:

> "I am starting a course about using AI for practical tasks. Give me three things I could build this week that would save me time at work."

Read the response. Notice how specific and useful it is. That is the starting point — and we are going much further.

## What You Will Need

- A computer with internet access (any operating system)
- A free account on [Claude.ai](https://claude.ai) or [ChatGPT](https://chat.openai.com)
- Curiosity and willingness to experiment
- About 45-60 minutes per lesson

That is it. No software to install yet (we will do that in the next lesson). No credit card required for Month 1.

## How This Course Works

Each lesson follows the same structure:

1. **Learn** — Watch the video and read the content (this tab)
2. **Build** — Follow the hands-on instructions (the Build tab)
3. **Quiz** — Test your understanding (the Quiz tab)
4. **Resources** — Explore further reading and tools

You can do lessons in order or skip ahead if a topic excites you. But we recommend following the sequence, especially in Month 1 — each lesson builds on the last.

## Ready?

In the next lesson, you will set up your complete AI toolkit — the tools you will use for the rest of the course and beyond. It takes about 30 minutes, and you will only need to do it once.

Let us get building.`,
    audioFileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    audioDuration: 2700,
    buildVideoUrl: null,
    buildInstructions: `## Build: Your First AI Conversation

This lesson's build exercise is simple but important — it establishes your baseline with AI tools.

### Step 1: Open an AI Tool
Go to [Claude.ai](https://claude.ai) or [ChatGPT](https://chat.openai.com) and create a free account if you have not already.

### Step 2: Ask Three Questions
Try these three prompts, one at a time:

**Prompt 1 — Personal productivity:**
> "What are five ways I could use AI to save time in my daily routine? Be specific and practical."

**Prompt 2 — Work application:**
> "I work in [your industry]. What are the three highest-impact ways AI could help me this week? Focus on things I can do today with free tools."

**Prompt 3 — Creative exploration:**
> "Help me brainstorm a simple app idea that would solve a problem I face at work. Ask me questions to understand my needs, then suggest three ideas."

### Step 3: Reflect
Notice how the AI responds differently to each prompt. The more specific you are, the better the response. This is the foundation of prompting — something we will master in Lesson 3.

### Step 4: Save Your Responses
Copy your favourite response into a document. This is the start of your GWTH portfolio — you will keep adding to it throughout the course.`,
    questions: [
      {
        id: "m1_l01_q1",
        question: "What is the core philosophy of GWTH?",
        options: [
          "You need to learn to code before you can use AI",
          "If you can describe it in plain English, you can build it with AI",
          "AI will replace all human workers within 5 years",
          "Only technical people can benefit from AI tools",
        ],
        correctOptionIndex: 1,
        explanation:
          "The GWTH philosophy is that clear thinking and plain English are the most important AI skills. You describe what you want, and AI helps you build it — no coding required.",
      },
      {
        id: "m1_l01_q2",
        question: "Which of these is something AI tools can reliably do today?",
        options: [
          "Make perfect predictions about the stock market",
          "Build working apps from a plain English description",
          "Replace the need for human judgement entirely",
          "Guarantee 100% accurate information every time",
        ],
        correctOptionIndex: 1,
        explanation:
          "Tools like Lovable, Bolt, and v0 can build working applications from plain English descriptions. AI is powerful but not infallible — it still requires human oversight and judgement.",
      },
      {
        id: "m1_l01_q3",
        question: "What is the recommended approach for going through this course?",
        options: [
          "Skip straight to Month 3 for the advanced content",
          "Only watch the videos and skip the build exercises",
          "Follow the lessons in sequence, especially in Month 1",
          "Complete all optional tracks before moving to mandatory lessons",
        ],
        correctOptionIndex: 2,
        explanation:
          "Each lesson builds on the previous one, especially in Month 1. Following the sequence ensures you have the foundation for later lessons. However, you can skip ahead if a topic excites you.",
      },
    ],
    resources: [
      { title: "Claude.ai — Free AI Assistant", url: "https://claude.ai", type: "link" },
      { title: "ChatGPT — OpenAI's AI Assistant", url: "https://chat.openai.com", type: "link" },
      { title: "Perplexity — AI-Powered Research", url: "https://perplexity.ai", type: "link" },
      { title: "GWTH Course Overview (PDF)", url: "/downloads/gwth-course-overview.pdf", type: "download" },
    ],
    status: "completed",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-15"),
  },

  // L8: Build Your First App
  {
    id: "m1_l08",
    slug: "build-your-first-app",
    title: "Build Your First App — The Moment Everything Changes",
    description:
      "Use AI-powered app builders to turn a plain English description into a working application. No code, no templates — just describe what you want.",
    order: 3,
    duration: 60,
    difficulty: "beginner",
    category: "Building",
    sectionId: "m1_w2",
    courseId: "course_gwth",
    courseSlug: "applied-ai-skills",
    month: 1,
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    learnContent: `# Build Your First App — The Moment Everything Changes

This is the lesson that changes how you think about technology. By the end of it, you will have built a working application — not by writing code, but by describing what you want in plain English.

## The Old Way vs The New Way

**The old way:** Learn a programming language (6-12 months), learn a framework (3-6 months), design a database, write thousands of lines of code, debug for weeks, deploy to a server. Total time: 1-2 years.

**The new way:** Open an AI app builder, describe what you want, refine the result, deploy. Total time: 30-60 minutes.

This is not an exaggeration. This is what AI app builders like Lovable, Bolt, and v0 actually do.

## The Tools

### Lovable (lovable.dev)
Lovable is an AI-powered app builder that takes a text description and produces a fully functional web application. It generates real code (React, TypeScript, Tailwind CSS) but you never need to touch it.

**Best for:** Complete applications with multiple pages, user accounts, and data storage.

### Bolt (bolt.new)
Bolt is similar to Lovable but runs entirely in your browser. It gives you a live preview alongside the AI chat, so you can iterate quickly.

**Best for:** Quick prototypes and tools you want to test immediately.

### v0 by Vercel (v0.dev)
v0 focuses on generating individual UI components and pages. It is excellent for creating specific pieces of an application.

**Best for:** Individual screens, dashboards, and UI components.

## How AI App Builders Work

The process is surprisingly simple:

1. **You describe** what you want in plain English
2. **The AI generates** a complete application with code, styling, and functionality
3. **You review** the result and ask for changes
4. **The AI refines** the application based on your feedback
5. **You deploy** the finished app with one click

The key skill is **describing clearly**. The better your description, the closer the first result will be to what you want.

## Writing a Good App Description

Here is the difference between a weak prompt and a strong one:

### Weak Prompt
> "Make me a to-do app"

This will produce a generic to-do list. Functional, but boring.

### Strong Prompt
> "Build a personal task manager with these features:
> - Tasks grouped by project (Work, Personal, Learning)
> - Each task has a title, description, priority (high/medium/low), and due date
> - A dashboard showing overdue tasks at the top, then today's tasks, then upcoming
> - Colour-coded priority badges (red for high, amber for medium, green for low)
> - Clean, modern design with a dark mode option
> - Mobile-friendly layout"

This will produce something much closer to what you actually want.

## The Description Framework

Use this structure for every app you build:

1. **What is it?** (one sentence)
2. **Who is it for?** (the user)
3. **Core features** (bullet list, 5-8 items)
4. **Design preferences** (colours, style, feel)
5. **Special requirements** (mobile, dark mode, data storage)

## Real Examples

Here are three apps GWTH students have built in their first session:

### Example 1: Meeting Notes Organiser
A tool that stores meeting notes, tags them by project, and lets you search across all meetings. Built in 20 minutes.

### Example 2: Client Tracker
A simple CRM for freelancers — tracks clients, projects, invoices, and follow-up dates. Built in 35 minutes.

### Example 3: Recipe Manager
A personal recipe collection with ingredients search, meal planning, and shopping list generation. Built in 25 minutes.

None of these students had any programming experience. They described what they wanted, and AI built it.

## Iteration Is Normal

Your first result will not be perfect — and that is fine. AI app building is a conversation:

- "Move the sidebar to the left"
- "Make the buttons bigger on mobile"
- "Add a search bar at the top"
- "Change the colour scheme to blue and white"
- "Add a button to export data as CSV"

Each instruction refines the app. Most students get to a polished result in 3-5 rounds of feedback.

## Deployment

Once you are happy with your app, deployment is typically one click:

- **Lovable:** Click "Deploy" — gives you a public URL
- **Bolt:** Click "Deploy" — hosts it on Bolt's servers
- **v0:** Export the code and deploy to Vercel (also one click)

Your app is now live on the internet. Anyone with the link can use it.

## Summary

You now have a superpower: the ability to turn ideas into working software using nothing but clear descriptions. This changes everything — not just for this course, but for your career. Every time you think "I wish there was an app for that," you can build it.

In the next lesson, we will build something bigger.`,
    audioFileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    audioDuration: 3600,
    buildVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    buildInstructions: `## Build: Your First App

In this exercise, you will build a real, working application using an AI app builder. By the end, you will have a deployed app with a public URL.

### Step 1: Choose Your Builder

Pick one of these tools (all have free tiers):
- [Lovable](https://lovable.dev) — Best for complete apps
- [Bolt](https://bolt.new) — Best for quick prototypes

Create a free account if you have not already.

### Step 2: Choose Your App Idea

Pick one of these starter ideas, or use your own:

**Option A — Personal Expense Tracker**
> "Build a personal expense tracker app. Features: add expenses with amount, category (food, transport, bills, entertainment, other), and date. Show a dashboard with total spending this month, spending by category as a pie chart, and a list of recent expenses. Clean, modern design with a green and white colour scheme. Mobile-friendly."

**Option B — Daily Journal**
> "Build a daily journal app. Features: write entries with a date and text, tag entries with moods (great, good, okay, tough), search entries by date or keyword, show a monthly mood overview as coloured dots on a calendar. Warm, calm design with soft colours. Mobile-friendly."

**Option C — Book Tracker**
> "Build a book tracking app. Features: add books with title, author, and status (want to read, reading, finished). Rate finished books 1-5 stars. Show reading stats: books read this year, average rating, currently reading. A nice bookshelf-style layout. Mobile-friendly."

### Step 3: Build It

Paste your chosen description into the AI builder and wait for the result. This usually takes 30-90 seconds.

### Step 4: Refine It

Review the result and ask for 3-5 changes. Try instructions like:
- "Make the header background darker"
- "Add a button to delete expenses"
- "Show the total at the top of the page"
- "Make the fonts larger on mobile"

### Step 5: Deploy It

Click the deploy button in your chosen tool. Copy the public URL.

### Step 6: Share It

Paste your app URL in the GWTH community channel. Congratulations — you have just built and deployed your first app!`,
    questions: [
      {
        id: "m1_l08_q1",
        question: "What is the key skill when using AI app builders?",
        options: [
          "Knowing JavaScript and React",
          "Describing what you want clearly and specifically",
          "Having a background in UX design",
          "Writing code in the builder's editor",
        ],
        correctOptionIndex: 1,
        explanation:
          "The key skill is clear description. AI app builders convert your plain English description into a working application. The more specific your description, the better the result.",
      },
      {
        id: "m1_l08_q2",
        question: "How many rounds of feedback do most students need to get a polished app?",
        options: [
          "The first result is always perfect",
          "1 round",
          "3-5 rounds of feedback",
          "More than 20 rounds",
        ],
        correctOptionIndex: 2,
        explanation:
          "Most students reach a polished result in 3-5 rounds of feedback. Each round refines specific aspects like layout, colours, features, or mobile responsiveness.",
      },
      {
        id: "m1_l08_q3",
        question: "Which of these is the best prompt for an AI app builder?",
        options: [
          "Make me an app",
          "Build a task manager with projects, priorities, due dates, a dashboard showing overdue items, and a clean dark-mode design",
          "I need something for tasks",
          "Create a website",
        ],
        correctOptionIndex: 1,
        explanation:
          "A good prompt specifies what the app is, its core features, and design preferences. The more detail you provide, the closer the first result will be to what you want.",
      },
    ],
    resources: [
      { title: "Lovable — AI App Builder", url: "https://lovable.dev", type: "link" },
      { title: "Bolt — Browser-Based App Builder", url: "https://bolt.new", type: "link" },
      { title: "v0 — AI UI Component Generator", url: "https://v0.dev", type: "link" },
      { title: "App Description Template (PDF)", url: "/downloads/app-description-template.pdf", type: "download" },
    ],
    status: "completed",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-20"),
  },

  // M2-L11: RAG Explained
  {
    id: "m2_l11",
    slug: "rag-explained",
    title: "RAG Explained — Your Data, AI-Powered",
    description:
      "Understand Retrieval-Augmented Generation (RAG) — the technique that lets AI answer questions using your own documents, data, and knowledge base.",
    order: 1,
    duration: 60,
    difficulty: "intermediate",
    category: "RAG & Data",
    sectionId: "m2_w3",
    courseId: "course_gwth",
    courseSlug: "applied-ai-skills",
    month: 2,
    introVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    learnContent: `# RAG Explained — Your Data, AI-Powered

You have been using AI tools like Claude and ChatGPT for weeks now. They are impressive — but they have a fundamental limitation: **they do not know your data.** They know the internet, but not your company documents, your customer records, your internal processes.

RAG fixes this. And it is one of the most important concepts in applied AI.

## What Is RAG?

**RAG stands for Retrieval-Augmented Generation.** In plain English:

> RAG lets an AI answer questions using your own documents and data, instead of just its training data.

Here is how it works, step by step:

### The Simple Version
1. You have a collection of documents (PDFs, web pages, spreadsheets, emails)
2. RAG processes these into a searchable format
3. When you ask a question, RAG finds the most relevant parts of your documents
4. It feeds those relevant parts to the AI along with your question
5. The AI answers using your actual data, not just its general knowledge

### A Real Example

**Without RAG:**
> "What is our company's refund policy?"
> AI response: "Generally, companies offer refunds within 30 days..." (generic, probably wrong)

**With RAG:**
> "What is our company's refund policy?"
> AI response: "According to your Customer Service Handbook (page 14), refunds are available within 45 days for all products except custom orders, which have a 15-day window. Customers must contact support@yourcompany.com to initiate the process." (accurate, sourced)

That is the power of RAG. The AI goes from guessing to quoting your actual documents.

## Why RAG Matters

### The Knowledge Problem
AI models like Claude and GPT-4 were trained on public data up to a certain date. They do not know:
- Your company's internal documents
- Your latest product specs
- Your customer conversations
- Your proprietary processes
- Anything that happened after their training cutoff

### The RAG Solution
RAG bridges this gap by giving the AI access to your specific information **at query time** — without retraining the model. This means:
- **Always up to date** — add new documents whenever you want
- **Always accurate** — answers come from your actual data
- **Always sourced** — you can trace every answer back to a document
- **Always private** — your data stays in your system

## How RAG Works (The Slightly More Technical Version)

RAG has three phases:

### Phase 1: Ingestion
Your documents are processed and stored:
1. **Chunking** — Documents are split into small, meaningful pieces (usually 200-500 words each)
2. **Embedding** — Each chunk is converted into a numerical representation (a vector) that captures its meaning
3. **Storage** — These vectors are stored in a specialised database (a vector database)

### Phase 2: Retrieval
When a user asks a question:
1. **Query embedding** — The question is converted to a vector using the same method
2. **Similarity search** — The vector database finds chunks whose meaning is closest to the question
3. **Ranking** — The most relevant chunks are selected (usually the top 5-10)

### Phase 3: Generation
The AI produces an answer:
1. **Context assembly** — The retrieved chunks are combined into a context block
2. **Prompting** — The AI receives: "Using the following information, answer this question: [question]. Information: [retrieved chunks]"
3. **Response** — The AI generates an answer grounded in your actual data

## RAG in Practice: No-Code Tools

You do not need to be a developer to use RAG. Several tools make it accessible:

| Tool | Best For | Difficulty |
|------|----------|-----------|
| **ChatGPT with file upload** | Quick, one-off document Q&A | Easiest |
| **Claude Projects** | Ongoing projects with document collections | Easy |
| **NotebookLM (Google)** | Research and multi-document analysis | Easy |
| **CustomGPT.ai** | Customer-facing chatbots with your data | Medium |
| **Voiceflow** | Conversational AI with knowledge bases | Medium |
| **Botpress** | Business chatbots with RAG built in | Medium |

### Quick Win: Claude Projects
The simplest way to experience RAG right now:
1. Open Claude.ai and create a new Project
2. Upload your documents (PDFs, text files, etc.)
3. Ask questions about the content
4. Claude will answer using your actual documents

This is RAG in its simplest form — and it is incredibly powerful.

## When to Use RAG

RAG is the right approach when:
- You need AI to answer questions about your specific data
- Your data changes regularly and the AI needs to stay current
- You need traceable, sourced answers (not AI guesses)
- You are building a customer support bot, internal knowledge base, or document Q&A system
- Compliance requires you to show where answers come from

## Common RAG Pitfalls

Even with RAG, things can go wrong. Watch out for:

1. **Poor chunking** — If documents are split badly, relevant context can be missed
2. **Insufficient retrieval** — Sometimes the right document is not found; tuning the search parameters helps
3. **Hallucination despite context** — The AI might still make things up; always check sourced answers
4. **Stale data** — If documents are not updated, answers will be outdated
5. **Too much context** — Flooding the AI with irrelevant chunks can confuse it

## Summary

RAG is the bridge between AI's general knowledge and your specific data. It lets you build AI systems that are accurate, sourced, and private — answering questions using your actual documents instead of guessing.

In the next lesson, you will build a RAG application yourself.`,
    audioFileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    audioDuration: 3600,
    buildVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    buildInstructions: `## Build: Your First RAG Experience

In this exercise, you will set up a simple RAG system using Claude Projects and test it with real documents.

### Step 1: Gather Your Documents
Collect 3-5 documents you want to ask questions about. Good options:
- A company handbook or policy document
- Meeting notes from the past month
- A product specification or user guide
- Research papers or articles on a topic you care about

If you do not have documents handy, download the sample GWTH documents from the Resources tab.

### Step 2: Create a Claude Project
1. Go to [claude.ai](https://claude.ai)
2. Click "Projects" in the sidebar
3. Create a new project called "My RAG Test"
4. Upload your documents to the project

### Step 3: Test Basic Retrieval
Ask questions that can only be answered from your documents:
- "What does [specific document] say about [specific topic]?"
- "Summarise the key points from [document name]"
- "What are the three most important findings in my research?"

### Step 4: Test Cross-Document Queries
Ask questions that require information from multiple documents:
- "Compare the approaches described in document A and document B"
- "What themes appear across all my uploaded documents?"

### Step 5: Test the Limits
Try asking something your documents do NOT cover:
- Notice how Claude distinguishes between what is in your documents and what it knows generally
- Try asking "Only using the uploaded documents, what is our policy on [topic not covered]?"

### Step 6: Reflect
Write down three insights:
1. When did RAG give you a better answer than plain ChatGPT/Claude?
2. Where did it struggle?
3. What kind of work project could benefit from a RAG setup?`,
    questions: [
      {
        id: "m2_l11_q1",
        question: "What does RAG stand for?",
        options: [
          "Rapid AI Generation",
          "Retrieval-Augmented Generation",
          "Real-time Automated Grounding",
          "Ranked Answer Generation",
        ],
        correctOptionIndex: 1,
        explanation:
          "RAG stands for Retrieval-Augmented Generation. It augments the AI's generation capability by first retrieving relevant information from your own documents.",
      },
      {
        id: "m2_l11_q2",
        question: "What is the main problem RAG solves?",
        options: [
          "AI models are too slow for real-time use",
          "AI models do not know your specific data and documents",
          "AI models cannot generate text longer than 100 words",
          "AI models require expensive hardware to run",
        ],
        correctOptionIndex: 1,
        explanation:
          "AI models are trained on public data and do not know your company documents, customer records, or internal processes. RAG bridges this gap by giving the AI access to your specific data at query time.",
      },
      {
        id: "m2_l11_q3",
        question: "What are the three phases of RAG?",
        options: [
          "Training, Testing, Deployment",
          "Input, Processing, Output",
          "Ingestion, Retrieval, Generation",
          "Upload, Search, Download",
        ],
        correctOptionIndex: 2,
        explanation:
          "RAG works in three phases: Ingestion (processing and storing your documents), Retrieval (finding relevant chunks when a question is asked), and Generation (the AI creates an answer using the retrieved context).",
      },
      {
        id: "m2_l11_q4",
        question: "Which of these is a common RAG pitfall?",
        options: [
          "The AI answers too quickly",
          "Poor chunking causes relevant context to be missed",
          "RAG only works with English-language documents",
          "Vector databases cannot store more than 100 documents",
        ],
        correctOptionIndex: 1,
        explanation:
          "Poor chunking is a common pitfall. If documents are split in ways that break up important context, the retrieval step may not find the right information to answer a question accurately.",
      },
    ],
    resources: [
      { title: "Claude Projects — Official Guide", url: "https://docs.anthropic.com/en/docs/build-with-claude/projects", type: "article" },
      { title: "NotebookLM by Google", url: "https://notebooklm.google.com", type: "link" },
      { title: "What Is RAG? — Anthropic Explainer", url: "https://www.anthropic.com/news/contextual-retrieval", type: "article" },
      { title: "Sample Documents for RAG Exercise", url: "/downloads/rag-sample-documents.zip", type: "download" },
    ],
    status: "locked",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-02-01"),
  },
]

// ─── Labs ─────────────────────────────────────────────────────────────────────

export const mockLabs: Lab[] = [
  {
    id: "lab_001",
    slug: "build-your-first-ai-app",
    title: "Build Your First AI App",
    description:
      "Use Lovable or Bolt to turn a plain English description into a working, deployed application. No code required — just describe what you want and watch it come to life.",
    difficulty: "beginner",
    duration: 60,
    technologies: ["Lovable", "Bolt", "Plain English", "AI App Builders"],
    learningOutcomes: [
      "Describe an application clearly enough for AI to build it",
      "Use an AI app builder to generate a working application",
      "Iterate on the result using natural language feedback",
      "Deploy a finished app to a public URL",
    ],
    prerequisites: null,
    content: `# Build Your First AI App

In this lab, you will go from an idea to a working, deployed application using nothing but plain English and an AI app builder. This is the foundational skill of the GWTH course — if you can describe it clearly, you can build it.

## What You Will Build

A **Personal Expense Tracker** — a web application that lets you log expenses by category, view spending trends, and see monthly summaries. You will describe the app, generate it with AI, refine it, and deploy it.

## Why This Matters

This lab proves that building software no longer requires coding skills. The barrier to creation has dropped from "learn programming for a year" to "describe what you want in 60 minutes." This changes what is possible for you professionally.`,
    instructions: [
      {
        step: 1,
        title: "Set Up Your Builder",
        content: `Create a free account on [Lovable](https://lovable.dev) or [Bolt](https://bolt.new). Both tools convert plain English descriptions into working web applications.\n\nIf you are unsure which to choose:\n- **Lovable** is better for complete, multi-page applications\n- **Bolt** is better for quick prototypes you want to test immediately`,
      },
      {
        step: 2,
        title: "Write Your App Description",
        content: `Use the GWTH description framework to write a clear, detailed prompt:\n\n**Paste this into your builder:**\n\n> Build a personal expense tracker with the following features:\n> - Add expenses with an amount, category (Food, Transport, Bills, Entertainment, Shopping, Other), and date\n> - Dashboard showing: total spending this month, spending by category as a colourful pie chart, and a list of recent expenses sorted by date\n> - Ability to edit or delete expenses\n> - Monthly summary view showing spending trends\n> - Clean, modern design with a teal and white colour scheme\n> - Mobile-friendly responsive layout\n> - Dark mode toggle`,
      },
      {
        step: 3,
        title: "Generate and Review",
        content: `Click "Generate" or "Build" and wait 30-90 seconds for the AI to create your app.\n\nOnce generated, review the result:\n- Does it have all the features you described?\n- Is the layout clean and usable?\n- Does the pie chart display correctly?\n- Is it mobile-friendly? (Resize your browser window to check)`,
      },
      {
        step: 4,
        title: "Refine with Feedback",
        content: `Now iterate. Give the AI specific feedback to improve the app. Try these refinements one at a time:\n\n1. "Make the category colours match: Food = green, Transport = blue, Bills = red, Entertainment = purple, Shopping = amber, Other = grey"\n2. "Add a search bar above the expense list to filter by category or description"\n3. "Show a running total in the header that updates when I add or remove expenses"\n4. "Add smooth animations when adding or removing items"\n\nEach round should take 15-30 seconds. Review after each change.`,
      },
      {
        step: 5,
        title: "Deploy Your App",
        content: `When you are happy with the result, deploy it:\n\n**Lovable:** Click the "Deploy" button in the top right. You will receive a public URL like \`https://your-app.lovable.app\`\n\n**Bolt:** Click "Deploy" in the header. You will get a URL like \`https://your-app.bolt.new\`\n\nOpen the URL on your phone to test the mobile experience. Share it with a friend or colleague — you just built and shipped your first app!`,
      },
    ],
    category: "App Building",
    projectType: "Web Application",
    color: "oklch(0.7 0.18 220)",
    icon: "Rocket",
    isPremium: false,
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-02-01"),
  },
  {
    id: "lab_002",
    slug: "research-with-ai",
    title: "Research with AI",
    description:
      "Use Perplexity and Claude to conduct deep, sourced research on any topic in minutes instead of hours. Learn to verify AI research and create professional research summaries.",
    difficulty: "beginner",
    duration: 45,
    technologies: ["Perplexity", "Claude", "AI Research", "Fact-Checking"],
    learningOutcomes: [
      "Use Perplexity for source-backed research queries",
      "Use Claude for deep analysis and synthesis of findings",
      "Verify AI-generated research with real sources",
      "Create a professional research brief from AI outputs",
    ],
    prerequisites: null,
    content: `# Research with AI

Traditional research takes hours or days — reading articles, cross-referencing sources, synthesising findings, and formatting a report. With AI research tools, you can compress this into minutes while maintaining quality and traceability.

## What You Will Build

A **Professional Research Brief** on a topic of your choice. You will use Perplexity for sourced research, Claude for deep analysis, and your own judgement to verify and polish the result.

## Why This Matters

The ability to rapidly research any topic — with sources — is one of the most immediately useful AI skills. Whether you are preparing for a meeting, evaluating a business decision, or exploring a new field, AI research gives you an unfair advantage.`,
    instructions: [
      {
        step: 1,
        title: "Choose Your Research Topic",
        content: `Pick a topic that is genuinely useful to you. Suggestions:\n- A market trend in your industry\n- A technology you are evaluating for your business\n- A competitor analysis\n- A regulation or policy that affects your work\n\nWrite a single-sentence research question, e.g.:\n> "What are the main benefits and risks of implementing AI chatbots for customer support in mid-sized businesses?"`,
      },
      {
        step: 2,
        title: "Initial Research with Perplexity",
        content: `Go to [Perplexity](https://perplexity.ai) and enter your research question.\n\nPerplexity will return an answer with numbered source citations. For each key claim:\n1. Note the source it cites\n2. Click through to verify the source is real and says what Perplexity claims\n3. Note any data points, statistics, or expert quotes\n\nAsk 3-4 follow-up questions to deepen the research:\n- "What are the cost implications?"\n- "Which industries have seen the best results?"\n- "What are the most common implementation mistakes?"`,
      },
      {
        step: 3,
        title: "Deep Analysis with Claude",
        content: `Open [Claude](https://claude.ai) and paste your Perplexity findings. Then ask:\n\n> "I am researching [your topic]. Here are my initial findings from Perplexity:\n> [paste findings]\n>\n> Please:\n> 1. Identify the 3 most important insights\n> 2. Note any gaps or contradictions in the research\n> 3. Suggest 3 additional angles I should investigate\n> 4. Create a structured outline for a research brief"\n\nClaude will synthesise and structure your research in a way that Perplexity alone cannot.`,
      },
      {
        step: 4,
        title: "Assemble Your Research Brief",
        content: `Ask Claude to generate the final research brief:\n\n> "Using all the research we have discussed, write a professional 1-page research brief with these sections:\n> - Executive Summary (3 sentences)\n> - Key Findings (5 bullet points with source references)\n> - Risks & Considerations (3 bullet points)\n> - Recommended Next Steps (3 actionable items)\n> - Sources (numbered list)"\n\nReview the output. Edit anything that does not match your own understanding. Add your own insights where relevant. The AI does the heavy lifting, but your judgement shapes the final product.`,
      },
    ],
    category: "Research & Analysis",
    projectType: "Research Brief",
    color: "oklch(0.65 0.16 165)",
    icon: "Search",
    isPremium: false,
    createdAt: new Date("2026-01-12"),
    updatedAt: new Date("2026-02-01"),
  },
  {
    id: "lab_003",
    slug: "automate-your-inbox",
    title: "Automate Your Inbox",
    description:
      "Build an email automation workflow using Make.com or Zapier that categorises, summarises, and routes your emails automatically. Reclaim hours every week.",
    difficulty: "intermediate",
    duration: 90,
    technologies: ["Make.com", "Zapier", "Gmail", "AI Automation"],
    learningOutcomes: [
      "Design an automation workflow using visual tools",
      "Connect email to AI processing via Make.com or Zapier",
      "Automatically categorise and summarise incoming emails",
      "Route emails to the right folders or team members based on content",
    ],
    prerequisites: "Basic familiarity with email and cloud tools. Completion of Lesson 15 (Automation Basics) recommended.",
    content: `# Automate Your Inbox

Email is the biggest time sink in most professionals' days. Studies show the average knowledge worker spends 2.5 hours per day on email. What if AI could handle the routine parts — categorising, summarising, routing — so you only deal with what actually needs your attention?

## What You Will Build

An **Automated Email Processing Pipeline** that reads incoming emails, uses AI to categorise and summarise them, and routes them to the right place. No coding required — you will use visual automation tools.

## Why This Matters

Email automation is one of the highest-ROI AI applications. Even saving 30 minutes a day adds up to over 120 hours per year — three full work weeks reclaimed for meaningful work.`,
    instructions: [
      {
        step: 1,
        title: "Set Up Your Automation Tool",
        content: `Create a free account on [Make.com](https://make.com) (recommended) or [Zapier](https://zapier.com).\n\nMake.com is recommended because its free tier is more generous for AI-powered automations.\n\nConnect your email account:\n- In Make.com: Add a Gmail or Outlook module as a trigger\n- In Zapier: Add Gmail or Outlook as a trigger app\n\nSet the trigger to "New Email Received."`,
      },
      {
        step: 2,
        title: "Add AI Categorisation",
        content: `Add an AI processing step after the email trigger:\n\n**In Make.com:** Add an "OpenAI" or "Anthropic" module\n**In Zapier:** Add a "ChatGPT" or "Claude" action\n\nConfigure the AI prompt:\n> "Categorise this email into exactly one of these categories: URGENT, ACTION_REQUIRED, FYI, NEWSLETTER, SPAM.\n> Also write a 1-sentence summary.\n>\n> Email subject: {{subject}}\n> Email body: {{body}}\n>\n> Respond in this exact format:\n> Category: [category]\n> Summary: [one sentence summary]"\n\nThis turns every incoming email into a categorised, summarised item.`,
      },
      {
        step: 3,
        title: "Build the Routing Logic",
        content: `Add a Router or Filter after the AI step to handle each category differently:\n\n- **URGENT** — Send a Slack/Teams message to you immediately, move email to "Urgent" folder\n- **ACTION_REQUIRED** — Add to your task list (Todoist, Notion, or Google Tasks), keep in inbox\n- **FYI** — Move to "Read Later" folder, send a daily digest summary\n- **NEWSLETTER** — Move to "Newsletters" folder automatically\n- **SPAM** — Archive or delete\n\nConfigure each route with the appropriate actions for your email provider and productivity tools.`,
      },
      {
        step: 4,
        title: "Add a Daily Digest",
        content: `Create a second automation that runs once daily (e.g., 8:00 AM):\n\n1. Trigger: Schedule (daily at 8:00 AM)\n2. Action: Collect all "FYI" emails from the past 24 hours\n3. Action: Send them to AI with this prompt:\n\n> "Here are my FYI emails from the past 24 hours. Create a brief daily digest with:\n> - 3-5 key highlights\n> - Any items that might need attention this week\n> - One interesting thing I might have missed"\n\n4. Action: Send the digest to yourself via email or Slack.`,
      },
      {
        step: 5,
        title: "Test and Refine",
        content: `Run the automation for 3 days before fully trusting it:\n\n1. Send yourself test emails in each category to verify routing\n2. Check the AI categorisation accuracy — is it getting categories right at least 90% of the time?\n3. Review the daily digest — is it useful and concise?\n4. Adjust the AI prompt if categories are being assigned incorrectly\n\nCommon adjustments:\n- Add example emails to the prompt for better accuracy\n- Add a "CLIENT" category if you get a lot of client emails\n- Adjust the summary length based on your preference`,
      },
    ],
    category: "Automation",
    projectType: "Workflow Automation",
    color: "oklch(0.75 0.15 75)",
    icon: "Mail",
    isPremium: false,
    createdAt: new Date("2026-01-20"),
    updatedAt: new Date("2026-02-05"),
  },
  {
    id: "lab_004",
    slug: "build-a-personal-dashboard",
    title: "Build a Personal Dashboard",
    description:
      "Create a data dashboard that visualises your personal or business metrics using AI tools. Track goals, habits, finances, or any data that matters to you.",
    difficulty: "intermediate",
    duration: 75,
    technologies: ["Lovable", "Claude", "Data Visualisation", "AI Analysis"],
    learningOutcomes: [
      "Structure raw data for dashboard presentation",
      "Use AI to design and build a data dashboard",
      "Create meaningful visualisations from your own data",
      "Deploy an interactive dashboard with filtering and drill-down",
    ],
    prerequisites: "Completion of Lesson 11 (Data Analysis) and Lesson 12 (Build a Dashboard) recommended.",
    content: `# Build a Personal Dashboard

Dashboards turn data into decisions. In this lab, you will build a personal dashboard that visualises metrics you actually care about — whether that is finances, fitness, business KPIs, or learning progress.

## What You Will Build

An **Interactive Personal Dashboard** with charts, metrics cards, and filtering capabilities. You will use AI to analyse your data, design the layout, and build the entire dashboard from a description.

## Why This Matters

Everyone has data scattered across spreadsheets, apps, and tools. A dashboard brings it all together into a single, visual overview. With AI tools, you can build one in an hour instead of hiring a developer or learning a BI tool.`,
    instructions: [
      {
        step: 1,
        title: "Prepare Your Data",
        content: `Gather data you want to visualise. Choose one of these options:\n\n**Option A — Personal Finances:** Export your last 3 months of bank transactions as CSV\n**Option B — Business Metrics:** Collect your monthly revenue, expenses, customers, and any KPIs\n**Option C — Health & Habits:** Track a week of sleep, exercise, water intake, and screen time\n**Option D — Use Sample Data:** Download the GWTH sample dashboard data from the Resources tab\n\nClean the data: make sure columns are labelled clearly and dates are in a consistent format.`,
      },
      {
        step: 2,
        title: "Analyse with Claude",
        content: `Upload your data to Claude and ask:\n\n> "Analyse this data and suggest:\n> 1. The 5 most interesting metrics to track\n> 2. What charts would best visualise each metric\n> 3. Any trends or anomalies you notice\n> 4. A suggested dashboard layout with 6 widgets"\n\nUse Claude's suggestions to plan your dashboard. You might be surprised by what patterns it finds in your data.`,
      },
      {
        step: 3,
        title: "Build the Dashboard",
        content: `Open Lovable and describe your dashboard based on Claude's suggestions:\n\n> "Build a personal dashboard with these widgets:\n> [paste Claude's layout suggestion]\n>\n> Use these colours: teal for primary metrics, green for positive trends, red for negative trends.\n> Include a date range filter at the top.\n> Add hover tooltips on all charts showing exact values.\n> Mobile-responsive layout — cards stack vertically on small screens.\n> Dark mode support."`,
      },
      {
        step: 4,
        title: "Add Interactivity",
        content: `Refine the dashboard with interactive features:\n\n- "Add a dropdown filter to view data by month or by category"\n- "Make the charts animate when the page loads"\n- "Add a summary card at the top showing the single most important metric in large text"\n- "Add click-to-drill-down on the pie chart — clicking a slice shows the detailed breakdown"`,
      },
      {
        step: 5,
        title: "Deploy and Share",
        content: `Deploy your dashboard and make it useful:\n\n1. Click "Deploy" to get a public URL\n2. Open it on your phone — does it look good?\n3. Bookmark it as a browser tab you check daily\n4. Optional: Set up a daily/weekly reminder to update your data\n\nFor ongoing use, consider connecting your dashboard to live data sources (covered in Month 2, Lesson 9: APIs & Integrations).`,
      },
    ],
    category: "Data & Analytics",
    projectType: "Dashboard",
    color: "oklch(0.627 0.265 303.9)",
    icon: "BarChart3",
    isPremium: true,
    createdAt: new Date("2026-01-25"),
    updatedAt: new Date("2026-02-10"),
  },
  {
    id: "lab_005",
    slug: "ai-customer-support-bot",
    title: "Create an AI Customer-Support Bot",
    description:
      "Build a RAG-powered chatbot that answers customer questions using your own documentation. Deploy it as an embeddable widget for any website.",
    difficulty: "advanced",
    duration: 120,
    technologies: ["RAG", "Claude", "Botpress", "Knowledge Base", "Embeddings"],
    learningOutcomes: [
      "Set up a RAG-powered knowledge base from your documents",
      "Configure a customer-facing AI chatbot",
      "Test and improve chatbot accuracy with edge cases",
      "Deploy an embeddable chat widget on a website",
    ],
    prerequisites: "Completion of Lesson M2-L11 (RAG Explained) and M2-L12 (Building RAG Applications) required.",
    content: `# Create an AI Customer-Support Bot

Customer support is one of the highest-impact applications of RAG. A well-built support bot can handle 60-80% of routine questions instantly, 24/7, in any language — while your human team focuses on complex issues that need a personal touch.

## What You Will Build

A **RAG-Powered Customer Support Chatbot** that answers questions using your actual documentation. You will build it using Botpress (no coding required), connect it to your knowledge base, and deploy it as an embeddable widget.

## Why This Matters

The Month 2 capstone project involves building exactly this kind of system. This lab gives you hands-on experience with every component before the capstone, so you will be ready to build something more ambitious.`,
    instructions: [
      {
        step: 1,
        title: "Prepare Your Knowledge Base",
        content: `Gather the documents your chatbot will use to answer questions:\n\n**Recommended documents:**\n- FAQ page content (copy-paste from your website)\n- Product/service descriptions\n- Pricing information\n- Return/refund policies\n- Common troubleshooting guides\n\nIf you do not have real documents, use the GWTH sample support docs from the Resources tab.\n\nClean the documents: remove headers/footers, navigation text, and anything that is not actual content.`,
      },
      {
        step: 2,
        title: "Set Up Botpress",
        content: `Create a free account on [Botpress](https://botpress.com).\n\n1. Create a new bot\n2. Go to the "Knowledge Base" section\n3. Upload your documents — Botpress will automatically chunk and embed them\n4. Wait for processing to complete (usually 1-2 minutes)\n\nBotpress handles the entire RAG pipeline for you — chunking, embedding, retrieval, and generation. No configuration needed.`,
      },
      {
        step: 3,
        title: "Configure the Bot Personality",
        content: `Set up how your bot communicates:\n\n1. Go to the "Agent" or "Instructions" section\n2. Add these instructions:\n\n> "You are a friendly, helpful customer support assistant for [your company name]. \n> - Always answer based on the knowledge base. If the answer is not in the knowledge base, say: 'I do not have information about that. Let me connect you with our support team at support@company.com.'\n> - Be concise — aim for 2-3 sentence answers\n> - Use a warm, professional tone\n> - If the customer seems frustrated, acknowledge their frustration before answering\n> - Never make up information. Only use what is in the knowledge base."\n\n3. Set the bot name and welcome message\n4. Configure the fallback behaviour (what happens when the bot cannot answer)`,
      },
      {
        step: 4,
        title: "Test with Edge Cases",
        content: `Thorough testing is critical before deployment. Test these scenarios:\n\n**Happy path:**\n- "What is your refund policy?" (should find the answer)\n- "How much does [product] cost?" (should quote pricing)\n- "How do I reset my password?" (should give troubleshooting steps)\n\n**Edge cases:**\n- "What is the meaning of life?" (should gracefully decline)\n- "I am really angry about my order" (should acknowledge frustration)\n- "Can I speak to a human?" (should provide handoff path)\n- "Tell me about your CEO's personal life" (should decline politely)\n- A question in a different language (test multilingual support)\n\nFor each test, note:\n- Was the answer accurate?\n- Was the source document correct?\n- Was the tone appropriate?\n\nRefine the bot instructions based on your findings.`,
      },
      {
        step: 5,
        title: "Deploy the Widget",
        content: `Deploy your chatbot as an embeddable widget:\n\n1. In Botpress, go to "Integrations" or "Deploy"\n2. Select "Web Chat" or "Website Widget"\n3. Copy the embed code (a small JavaScript snippet)\n4. Paste it into any HTML page before the closing \`</body>\` tag\n\nFor testing, create a simple HTML file:\n\n\`\`\`html\n<!DOCTYPE html>\n<html>\n<head><title>Support Bot Test</title></head>\n<body>\n  <h1>Welcome to Our Support Page</h1>\n  <p>Click the chat icon in the bottom right to get help.</p>\n  <!-- Paste your Botpress embed code here -->\n</body>\n</html>\n\`\`\`\n\nOpen the file in your browser and test the full experience. The chat widget should appear in the bottom-right corner.`,
      },
    ],
    category: "AI Chatbots",
    projectType: "Customer Support Bot",
    color: "oklch(0.65 0.18 50)",
    icon: "MessageCircle",
    isPremium: true,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-15"),
  },
]

// ─── Progress ─────────────────────────────────────────────────────────────────

export const mockLessonProgress: LessonProgress[] = [
  // Week 1: All completed
  { lessonId: "m1_l01", isCompleted: true, progress: 1, quizScore: 100, bestQuizScore: 100, quizAttempts: 1, timeSpent: 2700, lastAccessedAt: new Date("2026-01-20") },
  { lessonId: "m1_l02", isCompleted: true, progress: 1, quizScore: 80, bestQuizScore: 80, quizAttempts: 2, timeSpent: 2500, lastAccessedAt: new Date("2026-01-21") },
  { lessonId: "m1_l03", isCompleted: true, progress: 1, quizScore: 90, bestQuizScore: 90, quizAttempts: 1, timeSpent: 3600, lastAccessedAt: new Date("2026-01-23") },
  { lessonId: "m1_l04", isCompleted: true, progress: 1, quizScore: 100, bestQuizScore: 100, quizAttempts: 1, timeSpent: 1800, lastAccessedAt: new Date("2026-01-24") },
  { lessonId: "m1_l05", isCompleted: true, progress: 1, quizScore: 70, bestQuizScore: 85, quizAttempts: 3, timeSpent: 2700, lastAccessedAt: new Date("2026-01-26") },

  // Week 2: All completed
  { lessonId: "m1_l06", isCompleted: true, progress: 1, quizScore: 85, bestQuizScore: 85, quizAttempts: 1, timeSpent: 2700, lastAccessedAt: new Date("2026-01-28") },
  { lessonId: "m1_l07", isCompleted: true, progress: 1, quizScore: 95, bestQuizScore: 95, quizAttempts: 1, timeSpent: 2700, lastAccessedAt: new Date("2026-01-30") },
  { lessonId: "m1_l08", isCompleted: true, progress: 1, quizScore: 90, bestQuizScore: 90, quizAttempts: 1, timeSpent: 3600, lastAccessedAt: new Date("2026-02-01") },
  { lessonId: "m1_l09", isCompleted: true, progress: 1, quizScore: 75, bestQuizScore: 85, quizAttempts: 2, timeSpent: 3600, lastAccessedAt: new Date("2026-02-03") },
  { lessonId: "m1_l10", isCompleted: true, progress: 1, quizScore: 80, bestQuizScore: 80, quizAttempts: 1, timeSpent: 3600, lastAccessedAt: new Date("2026-02-05") },

  // Week 3: Two completed, one in progress
  { lessonId: "m1_l11", isCompleted: true, progress: 1, quizScore: 85, bestQuizScore: 85, quizAttempts: 1, timeSpent: 3600, lastAccessedAt: new Date("2026-02-08") },
  { lessonId: "m1_l12", isCompleted: true, progress: 1, quizScore: 90, bestQuizScore: 90, quizAttempts: 1, timeSpent: 3600, lastAccessedAt: new Date("2026-02-11") },
  { lessonId: "m1_l13", isCompleted: false, progress: 0.4, quizScore: null, bestQuizScore: null, quizAttempts: 0, timeSpent: 1080, lastAccessedAt: new Date("2026-02-18") },
]

export const mockLabProgress: LabProgress[] = [
  { labId: "lab_001", isCompleted: true, progress: 1, currentStep: 5, lastAccessedAt: new Date("2026-02-02") },
  { labId: "lab_002", isCompleted: true, progress: 1, currentStep: 4, lastAccessedAt: new Date("2026-01-28") },
  { labId: "lab_003", isCompleted: false, progress: 0.4, currentStep: 2, lastAccessedAt: new Date("2026-02-12") },
]

export const mockCourseProgress: CourseProgress[] = [
  {
    courseId: "course_gwth",
    progress: 0.5,
    completedLessons: 12,
    totalLessons: 24,
    completedAt: null,
  },
]

// ─── Study Streak ─────────────────────────────────────────────────────────────

export const mockStudyStreak: StudyStreak = {
  currentStreak: 5,
  longestStreak: 14,
  lastActiveDate: new Date("2026-02-19"),
  weeklyActivity: [true, false, true, true, true, true, true],
  yearlyActivity: Array.from({ length: 365 }, (_, i) => {
    const date = new Date("2025-02-20")
    date.setDate(date.getDate() + i)
    return {
      date,
      // More active as the course progresses (started in late January 2026)
      count:
        i < 335
          ? Math.random() < 0.1
            ? 1
            : 0 // Before the course: occasional activity
          : i < 345
            ? Math.floor(Math.random() * 3) // First week: ramping up
            : Math.random() < 0.85
              ? Math.floor(Math.random() * 4) + 1 // During course: mostly active
              : 0, // Occasional rest day
    }
  }),
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export const mockBookmarks: Bookmark[] = [
  { id: "bm_001", userId: "user_mock_001", lessonId: "m1_l08", labId: null, createdAt: new Date("2026-02-01") },
  { id: "bm_002", userId: "user_mock_001", lessonId: "m1_l13", labId: null, createdAt: new Date("2026-02-18") },
  { id: "bm_003", userId: "user_mock_001", lessonId: null, labId: "lab_003", createdAt: new Date("2026-02-12") },
  { id: "bm_004", userId: "user_mock_001", lessonId: null, labId: "lab_005", createdAt: new Date("2026-02-10") },
]

// ─── Notes ────────────────────────────────────────────────────────────────────

export const mockNotes: Note[] = [
  {
    id: "note_001",
    userId: "user_mock_001",
    lessonId: "m1_l01",
    content:
      "Key takeaway: the GWTH philosophy is about clear thinking first, tools second. If I can describe it in plain English, I can build it. This shifts the bottleneck from technical skill to clarity of thought.",
    timestamp: 420,
    createdAt: new Date("2026-01-20"),
    updatedAt: new Date("2026-01-20"),
  },
  {
    id: "note_002",
    userId: "user_mock_001",
    lessonId: "m1_l03",
    content:
      "Prompting framework to remember: Role + Context + Task + Format + Constraints. The more specific the prompt, the better the output. Tested this with Claude and the difference was huge.",
    timestamp: null,
    createdAt: new Date("2026-01-23"),
    updatedAt: new Date("2026-01-23"),
  },
  {
    id: "note_003",
    userId: "user_mock_001",
    lessonId: "m1_l08",
    content:
      "Built my first app with Lovable — an expense tracker. Took about 40 minutes including refinements. The key was being specific in the description. Vague prompts = generic apps.",
    timestamp: 1800,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
  },
]

// ─── Certificates ─────────────────────────────────────────────────────────────

/** No certificates earned yet — the user is still in Month 1 */
export const mockCertificates: Certificate[] = []

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    userId: "user_mock_001",
    type: "achievement",
    title: "5-Day Study Streak!",
    message:
      "You have studied for 5 consecutive days. Keep up the momentum — your longest streak is 14 days!",
    read: false,
    createdAt: new Date("2026-02-19"),
  },
  {
    id: "notif_002",
    userId: "user_mock_001",
    type: "reminder",
    title: "Continue Data Analysis",
    message:
      "You are 40% through \"AI Agents — Your New Digital Assistants\". Pick up where you left off!",
    read: false,
    createdAt: new Date("2026-02-19"),
  },
  {
    id: "notif_003",
    userId: "user_mock_001",
    type: "announcement",
    title: "New Lab Published: Build a Personal Dashboard",
    message:
      "A new intermediate lab is now available! Build a data dashboard using AI tools — perfect practice for Week 3 concepts.",
    read: true,
    createdAt: new Date("2026-02-15"),
  },
  {
    id: "notif_004",
    userId: "user_mock_001",
    type: "achievement",
    title: "Month 1: 50% Complete",
    message:
      "You have completed 12 out of 24 lessons in Month 1: From Zero to Building. Halfway there — keep going!",
    read: true,
    createdAt: new Date("2026-02-11"),
  },
]

// ─── Dynamic Score ────────────────────────────────────────────────────────────

export const mockDynamicScore: DynamicScore = {
  overallScore: 18,
  maxPossibleScore: 36,
  percentile: 72,
  curiosityIndex: 0.15,
  consistencyScore: 84,
  improvementRate: 12,
  scoreHistory: Array.from({ length: 30 }, (_, i) => {
    const date = new Date("2026-01-21")
    date.setDate(date.getDate() + i)
    // Score increases as lessons are completed, with slight daily variation
    const baseScore = Math.min(18, (i / 29) * 18)
    const variation = (Math.random() - 0.5) * 1
    return {
      date,
      score: Math.round((baseScore + variation) * 10) / 10,
    }
  }),
}
