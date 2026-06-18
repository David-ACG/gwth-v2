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
  NewsArticle,
  NewsVote,
  NewsComment,
} from "@/lib/types"

import { m1Labs } from "./m1-labs"

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
          { id: "m3_e06b", slug: "localwhisper-build", title: "LocalWhisper — Build a Local Speech-to-Text App", order: 2, duration: 90, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m3_e07", slug: "voice-ai-agents", title: "Voice AI Agents", order: 3, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m3_e08", slug: "security-red-teaming", title: "Security Red Teaming", order: 4, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
          { id: "m3_e09", slug: "cost-optimisation-at-scale", title: "Cost Optimisation at Scale", order: 5, duration: 60, status: "locked", isOptional: true, optionalTrack: "Advanced Technical" },
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

  // LocalWhisper — Build a Local Speech-to-Text App
  {
    id: "m3_e06b",
    slug: "localwhisper-build",
    title: "LocalWhisper — Build a Local Speech-to-Text App",
    description:
      "Build a privacy-first, system-wide dictation app that runs entirely on your machine. Uses AI speech-to-text models, audio capture, hotkeys, and a settings web UI — all orchestrated with Claude Code.",
    order: 2,
    duration: 90,
    difficulty: "advanced",
    category: "Self-Hosted AI",
    sectionId: "m3_opt_advanced",
    courseId: "course_gwth",
    courseSlug: "applied-ai-skills",
    month: 3,
    isOptional: true,
    optionalTrack: "Advanced Technical",
    introVideoUrl: null,
    learnContent: `# LocalWhisper — Build a Local Speech-to-Text App

You have used cloud-based speech-to-text services. They are convenient, fast, and accurate — but your voice data leaves your machine, crosses the internet, and lands on someone else's servers. For many people and organisations, that is a dealbreaker.

In this lesson, you will build **LocalWhisper** — a fully local, privacy-first dictation app for Windows. Press a hotkey, speak, and text appears wherever your cursor is. No internet required. No data leaves your machine. Ever.

:::note
This is a real, working application — not a toy demo. You will end this lesson with an installable Windows app that you can use daily. The full source code is available in the \`gwth_projects/localwhisper\` directory.
:::

## Why Build This?

Commercial dictation tools like SuperWhisper and Wispr Flow cost £8-15/month and send your audio to the cloud. LocalWhisper gives you the same functionality for free, running on your own hardware.

More importantly, building this teaches you how to:

- **Deploy AI models locally** — download, load, and run inference on your own GPU or CPU
- **Orchestrate complex systems** — audio capture, VAD, transcription, text injection, UI, and a web server all running together
- **Build desktop apps with AI** — system tray icons, overlays, hotkeys, and settings pages
- **Use Claude Code for real projects** — every component was built using AI-assisted development

## Architecture Overview

LocalWhisper has a clean, modular architecture:

\`\`\`
[Hotkey Press] → [Microphone Capture] → [Voice Activity Detection] → [STT Engine]
                                                                          |
                                                                  [Transcribed Text]
                                                                          |
                                                              [Clipboard + Ctrl+V]
                                                                          |
                                                               [Text in Active App]
\`\`\`

### Core Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Audio Capture** | sounddevice (PortAudio) | Records microphone input at 16kHz mono |
| **Voice Activity Detection** | Silero VAD | Detects speech vs silence — stops recording automatically |
| **STT Engine** | faster-whisper or SenseVoice | Converts audio to text on your GPU or CPU |
| **Text Injection** | Clipboard + pyautogui | Pastes transcribed text into any active window |
| **Hotkey System** | keyboard library | Global push-to-talk or toggle hotkey |
| **System Tray** | pystray | Background icon with status and controls |
| **Recording Overlay** | tkinter | Non-intrusive recording indicator on each monitor |
| **Settings UI** | FastAPI + Jinja2 | Web-based settings page at localhost:9876 |
| **Database** | SQLite | Stores transcription history |
| **Configuration** | TOML | User-editable config file |

### The Engine Abstraction

One of the most interesting design decisions is the **engine abstraction**. LocalWhisper supports multiple STT backends through a Python Protocol:

\`\`\`python
class STTEngine(Protocol):
    model_name: str
    is_loaded: bool

    def load_model(self) -> None: ...
    def transcribe(self, audio: np.ndarray, sample_rate: int) -> TranscriptionResult: ...
    def unload_model(self) -> None: ...
\`\`\`

A factory function creates the right engine based on config:

\`\`\`python
engine = create_engine(
    "faster-whisper",
    model_name="large-v3-turbo",
    device="cuda",
    compute_type="int8",
)
\`\`\`

This means you can swap between faster-whisper (Whisper-based, best accuracy) and SenseVoice (5-15x faster, great for CPU) without changing any other code.

:::tip
The Protocol-based approach (duck typing) is more Pythonic than abstract base classes. Any class that has the right methods and attributes automatically satisfies the protocol — no inheritance required.
:::

## How Text Injection Works

The trickiest part of a dictation app is getting text into the active window. LocalWhisper uses a clipboard-based approach:

1. **Save** the current clipboard contents
2. **Copy** the transcribed text to the clipboard
3. **Simulate** Ctrl+V (or Ctrl+Shift+V for terminal windows)
4. **Restore** the original clipboard contents

This works in every Windows application — browsers, editors, terminals, Notion, Word, everything. The \`TextInjector\` class detects terminal windows (Windows Terminal, cmd, PowerShell) and uses Ctrl+Shift+V instead, since terminals use Ctrl+V for other purposes.

## The Pipeline Orchestrator

The \`Pipeline\` class is the heart of LocalWhisper. It coordinates the entire flow:

\`\`\`python
class Pipeline:
    def start_recording(self):
        # Begin capturing audio from microphone
        self.recorder.start()
        self.on_state_change(PipelineState.RECORDING)

    def stop_recording(self):
        # Stop capture, get audio data
        audio = self.recorder.stop()
        self.on_state_change(PipelineState.PROCESSING)
        # Submit to background worker for transcription
        self._work_queue.put(audio)
\`\`\`

The worker thread handles transcription asynchronously, so the UI never freezes:

\`\`\`python
def _worker(self):
    while self._running:
        audio = self._work_queue.get()
        result = self.transcriber.transcribe(audio, sample_rate=16000)
        self.on_transcription(result)
        self.on_state_change(PipelineState.IDLE)
\`\`\`

## Multi-Monitor Support

The recording overlay shows a thin status bar on **every connected monitor**. This uses the Windows API to enumerate displays:

\`\`\`python
import ctypes
monitors = []
def callback(hMonitor, hdcMonitor, lprcMonitor, dwData):
    rect = lprcMonitor.contents
    monitors.append((rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top))
    return True
ctypes.windll.user32.EnumDisplayMonitors(None, None, MONITORENUMPROC(callback), 0)
\`\`\`

Each monitor gets its own tkinter overlay window positioned at the top, with drag-to-move support.

## The Settings Web UI

Rather than building a complex native GUI, LocalWhisper serves a web page at \`http://127.0.0.1:9876\` using FastAPI and Jinja2 templates. This lets you:

- Change the STT model and engine
- Switch between GPU and CPU
- Select your microphone
- Adjust the hotkey and recording mode
- View transcription history with search
- Add custom words to improve recognition

The settings page writes changes to a TOML config file and offers a "Restart to Apply" button that spawns a new process and shuts down the old one.

## Key Lessons from Building This

### 1. pythonw.exe Breaks Everything
Windows GUI apps use \`pythonw.exe\` (no console window), which sets \`sys.stdout\` and \`sys.stderr\` to \`None\`. Libraries that try to write to stdout (uvicorn, funasr) crash immediately. The fix: redirect to \`os.devnull\` before importing anything.

### 2. Windows MME Truncates Device Names
The Windows Multimedia Extension (MME) audio API truncates device names to 31 characters. To show the full name, you need to look it up from another host API (DirectSound or WASAPI).

### 3. Global Hotkeys Are Hard
The \`keyboard\` library installs a low-level keyboard hook that can interfere with other applications. Push-to-talk mode (hold to record) is more reliable than toggle mode for most users.

### 4. Clipboard Restore Is Tricky
Some applications clear the clipboard on paste, making it impossible to restore the original content. The \`paste_delay_ms\` setting gives applications time to read the clipboard before we restore it.

### 5. Model Loading Takes Time
Large AI models take 5-30 seconds to load. Loading in a background thread with a fallback model prevents the app from appearing frozen on startup.

## Hardware Requirements

| Setup | GPU | Model | Speed |
|-------|-----|-------|-------|
| **Best** | NVIDIA GPU (4GB+ VRAM) | large-v3-turbo (int8) | ~0.5s for 10s audio |
| **Good** | NVIDIA GPU (2GB+ VRAM) | SenseVoice | ~0.3s for 10s audio |
| **CPU Only** | Any modern CPU | SenseVoice | ~2s for 10s audio |
| **CPU Fallback** | Any modern CPU | small (faster-whisper) | ~3s for 10s audio |

:::deep-dive[VRAM Management]
The large-v3-turbo model with int8 quantisation uses approximately 2.5GB of VRAM. On a 4GB GPU like the T1000, this leaves enough room for the CUDA runtime and VAD model. If VRAM is tight, SenseVoice is an excellent alternative — it uses far less memory and is actually faster, though it supports fewer languages.
:::

## Project Structure

\`\`\`
localwhisper/
├── src/localwhisper/
│   ├── app.py              # Main entry point — wires everything together
│   ├── config.py            # TOML configuration management
│   ├── core/
│   │   ├── engine.py        # STT engine Protocol + factory
│   │   ├── transcriber.py   # faster-whisper implementation
│   │   ├── sensevoice.py    # SenseVoice implementation
│   │   ├── pipeline.py      # Recording → transcription orchestrator
│   │   ├── audio_recorder.py # Microphone capture with pre-buffer
│   │   ├── text_injector.py # Clipboard-based text paste
│   │   └── hotkey_manager.py # Global hotkey registration
│   ├── ui/
│   │   ├── tray.py          # System tray icon
│   │   ├── status_bar.py    # Recording overlay bars
│   │   └── overlay.py       # Legacy overlay (replaced by status bars)
│   ├── web/
│   │   ├── server.py        # FastAPI server wrapper
│   │   ├── routes.py        # API endpoints + page routes
│   │   ├── templates/       # Jinja2 HTML templates
│   │   └── static/          # CSS + JavaScript
│   └── db/
│       ├── database.py      # SQLite wrapper
│       └── models.py        # Data models
├── config/default.toml      # Default configuration
├── installer/               # PyInstaller + Inno Setup scripts
└── tests/                   # Unit, integration, and E2E tests
\`\`\``,
    audioFileUrl: null,
    audioDuration: null,
    buildVideoUrl: null,
    buildInstructions: `## Build: Set Up and Run LocalWhisper

Follow these steps to get LocalWhisper running on your machine. You will need Python 3.11+ and optionally an NVIDIA GPU with CUDA support.

### Step 1: Clone the Project

The full source code is in the \`gwth_projects/localwhisper\` directory of this course repository. Copy it to your working directory:

\`\`\`bash
cp -r gwth_projects/localwhisper ~/Projects/LocalWhisper
cd ~/Projects/LocalWhisper
\`\`\`

### Step 2: Create a Virtual Environment

\`\`\`bash
python -m venv .venv
# Windows:
.venv\\Scripts\\activate
# macOS/Linux:
source .venv/bin/activate
\`\`\`

### Step 3: Install Dependencies

\`\`\`bash
# Core dependencies
pip install -r requirements.txt

# For SenseVoice engine (optional, recommended for CPU-only setups)
pip install funasr torch torchaudio
\`\`\`

### Step 4: Configure Your Setup

Edit \`config/default.toml\` or create a user config at \`%APPDATA%/LocalWhisper/config/localwhisper.toml\`:

**For GPU users:**
\`\`\`toml
[model]
engine = "faster-whisper"
name = "large-v3-turbo"
device = "cuda"
compute_type = "int8"
\`\`\`

**For CPU-only users:**
\`\`\`toml
[model]
engine = "sensevoice"
name = "iic/SenseVoiceSmall"
device = "cpu"
\`\`\`

### Step 5: Run LocalWhisper

\`\`\`bash
python -m localwhisper
\`\`\`

The app will:
1. Open an audio stream to your microphone
2. Start the settings web server at http://127.0.0.1:9876
3. Load the STT model in the background
4. Show a system tray icon and recording overlay
5. Wait for your hotkey (default: Ctrl+Space)

### Step 6: Test Dictation

1. Press and hold **Ctrl+Space**
2. Speak clearly
3. Release the key
4. Watch text appear wherever your cursor is

### Step 7: Explore the Settings

Open http://127.0.0.1:9876 in your browser to:
- Change the model, engine, and device
- Select a different microphone
- Adjust the hotkey and VAD threshold
- View your transcription history

### Step 8: Run the Tests

\`\`\`bash
# Unit tests
python -m pytest tests/unit/ -v

# All tests
python -m pytest tests/ -v
\`\`\`

### Step 9: Build the Installer (Optional)

If you want to create a distributable Windows installer:

\`\`\`bash
# Build with PyInstaller
pip install pyinstaller
pyinstaller installer/localwhisper.spec

# Package with Inno Setup (requires Inno Setup 6 installed)
iscc installer/localwhisper.iss
\`\`\`

This produces \`installer/Output/LocalWhisper-Setup-0.1.0.exe\`.

### Challenge: Add a New Feature

Try extending LocalWhisper with one of these features using Claude Code:

1. **Auto-punctuation** — Post-process transcriptions to add proper punctuation
2. **Speaker identification** — Detect different speakers in multi-person dictation
3. **Keyboard shortcut customisation** — Let users pick any key combination from the settings UI
4. **Audio preprocessing** — Add noise reduction before transcription
5. **Export history** — Add a CSV/JSON export button to the history page`,
    questions: [
      {
        id: "m3_e06b_q1",
        question: "Why does LocalWhisper use a clipboard-based approach for text injection instead of simulating individual keystrokes?",
        options: [
          "Simulating keystrokes is slower",
          "Clipboard paste works in every Windows application regardless of input method",
          "Individual keystrokes are blocked by antivirus software",
          "The keyboard library does not support keystroke simulation",
        ],
        correctOptionIndex: 1,
        explanation:
          "Clipboard-based injection (Ctrl+V) works universally across all Windows applications — browsers, editors, terminals, Notion, Word, everything. Keystroke simulation can be intercepted, filtered, or handled differently by each application.",
      },
      {
        id: "m3_e06b_q2",
        question: "What is the purpose of the STTEngine Protocol in LocalWhisper's architecture?",
        options: [
          "It forces all engines to inherit from a base class",
          "It provides a common interface so engines can be swapped without changing other code",
          "It encrypts audio data before sending it to the model",
          "It manages GPU memory allocation for different models",
        ],
        correctOptionIndex: 1,
        explanation:
          "The Protocol defines a duck-typed interface (model_name, load_model, transcribe, unload_model). Any class that implements these methods automatically satisfies the protocol, allowing faster-whisper and SenseVoice to be swapped via config without changing the pipeline, UI, or any other code.",
      },
      {
        id: "m3_e06b_q3",
        question: "Why does LocalWhisper redirect sys.stdout and sys.stderr to os.devnull when running under pythonw.exe?",
        options: [
          "To improve performance by reducing log output",
          "To prevent log files from growing too large",
          "Because pythonw.exe sets them to None, causing libraries to crash when they try to write",
          "To hide error messages from the user",
        ],
        correctOptionIndex: 2,
        explanation:
          "Windows GUI apps launched via pythonw.exe have no console, so Python sets sys.stdout and sys.stderr to None. Libraries like uvicorn and funasr call methods like write() or isatty() on these streams, which crashes with AttributeError. Redirecting to devnull provides a valid file object that silently discards output.",
      },
    ],
    resources: [
      { title: "LocalWhisper Source Code", url: "https://github.com/David-ACG/LocalWhisper", type: "link" },
      { title: "faster-whisper — CTranslate2-based Whisper", url: "https://github.com/SYSTRAN/faster-whisper", type: "link" },
      { title: "SenseVoice — Fast Multilingual Speech Understanding", url: "https://github.com/FunAudioLLM/SenseVoice", type: "link" },
      { title: "Silero VAD — Voice Activity Detection", url: "https://github.com/snakers4/silero-vad", type: "link" },
      { title: "PyInstaller — Freeze Python Apps", url: "https://pyinstaller.org", type: "link" },
      { title: "Inno Setup — Windows Installer Builder", url: "https://jrsoftware.org/isinfo.php", type: "link" },
    ],
    status: "locked",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-03-12"),
  },
]

// ─── Labs ─────────────────────────────────────────────────────────────────────

export const mockLabs: Lab[] = m1Labs

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

// ─── GWTH Score ───────────────────────────────────────────────────────────────

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

// ─── News Articles ────────────────────────────────────────────────────────────

export const mockNewsArticles: NewsArticle[] = [
  {
    id: "news_001",
    slug: "claude-remote-control",
    title: "Claude Can Now Control Your Computer Remotely",
    excerpt:
      "Anthropic launches remote computer control for Claude, enabling AI agents to operate desktop applications directly. This changes what's possible with AI automation.",
    content: `## Remote Control Changes Everything

Anthropic has released a new capability allowing Claude to remotely control computers — navigating desktop applications, clicking buttons, filling forms, and executing multi-step workflows.

### What This Means for Builders

This isn't just a demo. Remote computer control means AI agents can now:

- **Automate legacy software** that has no API
- **Bridge applications** that don't integrate natively
- **Handle repetitive workflows** across multiple tools
- **Test user interfaces** by actually interacting with them

### How It Works

Claude uses a combination of screenshot analysis and action primitives (click, type, scroll, keypress) to interact with any graphical interface. The model reasons about what it sees on screen and plans multi-step actions to accomplish goals.

### Try It Yourself

The feature is available today through the Claude API and Claude Code. We'll be building a lab on this — vote if you want it prioritised!`,
    url: null,
    category: "ai-launch",
    tags: ["claude", "anthropic", "agents", "computer-use", "automation"],
    thumbnailUrl: null,
    author: "David",
    voteCount: 142,
    commentCount: 3,
    labSlug: null,
    isFeatured: true,
    status: "published",
    publishedAt: new Date("2026-02-27"),
    hotnessScore: 95,
    createdAt: new Date("2026-02-27"),
    updatedAt: new Date("2026-02-27"),
  },
  {
    id: "news_002",
    slug: "mcp-protocol-explained",
    title: "MCP: The Protocol That Lets AI Tools Talk to Each Other",
    excerpt:
      "Model Context Protocol is becoming the USB-C of AI integrations. Every major tool now supports it. Here's a plain-English breakdown of why it matters.",
    content: `## What is MCP?

Model Context Protocol (MCP) is an open standard that lets AI models connect to external tools, data sources, and services through a unified interface.

### Why It Matters

Before MCP, every AI tool had its own way of connecting to external services. Want Claude to read your database? Custom integration. Want it to call an API? Another custom integration. MCP standardises all of this.

### The Ecosystem Today

Major tools with MCP support:
- **Claude Code** — connects to any MCP server
- **Cursor** — IDE integration via MCP
- **Windsurf** — full MCP tool support
- **Linear, GitHub, Slack** — official MCP servers

### Build Your Own MCP Server

It's surprisingly simple. An MCP server is just a program that exposes tools via JSON-RPC. You can build one in Python or TypeScript in under an hour.`,
    url: null,
    category: "tool",
    tags: ["mcp", "anthropic", "integrations", "agents", "protocol"],
    thumbnailUrl: null,
    author: "David",
    voteCount: 98,
    commentCount: 1,
    labSlug: "build-mcp-server",
    isFeatured: false,
    status: "published",
    publishedAt: new Date("2026-02-25"),
    hotnessScore: 82,
    createdAt: new Date("2026-02-25"),
    updatedAt: new Date("2026-02-25"),
  },
  {
    id: "news_003",
    slug: "gpt5-benchmarks-analysis",
    title: "GPT-5 Benchmarks Are In — And They're Not What You Expected",
    excerpt:
      "OpenAI's latest model excels at reasoning but falls short on code generation compared to Claude Opus 4. The benchmark wars are getting interesting.",
    content: `## The Benchmark Results

GPT-5 landed with impressive reasoning scores but a surprising gap in code generation. Here's the breakdown.

### Where GPT-5 Excels
- Mathematical reasoning: +15% over GPT-4o
- Multi-step logic: best-in-class
- Long-form analysis: excellent coherence

### Where It Falls Short
- Code generation: Claude Opus 4 still leads
- Tool use reliability: more hallucinated function calls
- Context window utilisation: effective window is smaller than advertised

### What This Means for You

The "best model" depends entirely on your use case. For coding and tool-heavy workflows, Claude remains the leader. For pure reasoning tasks, GPT-5 is worth testing.`,
    url: "https://openai.com/research/gpt5",
    category: "research",
    tags: ["openai", "gpt-5", "benchmarks", "comparison", "claude"],
    thumbnailUrl: null,
    author: "David",
    voteCount: 76,
    commentCount: 0,
    labSlug: null,
    isFeatured: false,
    status: "published",
    publishedAt: new Date("2026-02-23"),
    hotnessScore: 68,
    createdAt: new Date("2026-02-23"),
    updatedAt: new Date("2026-02-23"),
  },
  {
    id: "news_004",
    slug: "ai-customer-support-30-minutes",
    title: "How to Build an AI Customer Support Bot in 30 Minutes",
    excerpt:
      "Step-by-step tutorial using Claude + MCP + Lovable. From zero to a working chatbot that answers from your docs. No coding experience needed.",
    content: `## Build a Support Bot in 30 Minutes

This tutorial walks you through building a production-ready AI customer support chatbot using free tools.

### What You'll Build
A chatbot that:
- Answers questions from your documentation
- Handles follow-up questions with context
- Escalates to a human when it can't help
- Runs 24/7 on a free tier

### Prerequisites
- A Claude API key (free tier works)
- Your documentation in markdown or PDF format
- 30 minutes of focus

### Step 1: Set Up Your Knowledge Base
Upload your docs to a vector store...

### Step 2: Create the Chat Interface
Using Lovable, describe the interface you want...

### Step 3: Connect Claude via MCP
Wire the chatbot to Claude using the MCP protocol...

The full walkthrough is available as a lab — check it out!`,
    url: null,
    category: "tutorial",
    tags: ["tutorial", "chatbot", "no-code", "claude", "lovable", "mcp"],
    thumbnailUrl: null,
    author: "David",
    voteCount: 203,
    commentCount: 2,
    labSlug: "ai-customer-support-bot",
    isFeatured: true,
    status: "published",
    publishedAt: new Date("2026-02-20"),
    hotnessScore: 91,
    createdAt: new Date("2026-02-20"),
    updatedAt: new Date("2026-02-20"),
  },
  {
    id: "news_005",
    slug: "eu-ai-act-what-builders-need",
    title: "EU AI Act: What Builders Actually Need to Know",
    excerpt:
      "The EU AI Act is now enforceable. Here's a no-nonsense guide to what it means for people building with AI tools — without the legal jargon.",
    content: `## The Short Version

The EU AI Act categorises AI systems into risk levels. Most things you're building probably fall into "limited risk" — which means transparency requirements, not bans.

### Risk Levels
1. **Unacceptable risk** — banned (social scoring, real-time biometric surveillance)
2. **High risk** — heavy regulation (medical devices, recruitment tools, credit scoring)
3. **Limited risk** — transparency required (chatbots must disclose they're AI)
4. **Minimal risk** — no specific requirements (most creative and productivity tools)

### What You Actually Need to Do
- **Label AI-generated content** — if your tool generates text, images, or audio
- **Keep records** — document what models you use and how
- **Monitor for bias** — especially if your tool makes decisions about people

### Don't Panic
If you're building internal tools, prototypes, or educational projects, the compliance burden is minimal. The Act primarily targets companies deploying AI at scale in high-risk domains.`,
    url: null,
    category: "industry",
    tags: ["regulation", "eu", "compliance", "governance", "legal"],
    thumbnailUrl: null,
    author: "David",
    voteCount: 34,
    commentCount: 0,
    labSlug: null,
    isFeatured: false,
    status: "published",
    publishedAt: new Date("2026-02-18"),
    hotnessScore: 35,
    createdAt: new Date("2026-02-18"),
    updatedAt: new Date("2026-02-18"),
  },
  {
    id: "news_006",
    slug: "cursor-vs-windsurf-vs-claude-code",
    title: "Cursor vs Windsurf vs Claude Code: The AI Editor Showdown",
    excerpt:
      "We tested all three on the same project. The results might surprise you — especially if you've been loyal to one tool.",
    content: `## Test Methodology

We built the same Next.js application using all three AI-powered coding tools. Same requirements, same starting point, same human operator.

### The Project
A full-stack todo app with authentication, real-time updates, and deployment. Complex enough to test real capabilities, simple enough to complete in a day.

### Results

| Feature | Cursor | Windsurf | Claude Code |
|---------|--------|----------|-------------|
| Code quality | Good | Good | Excellent |
| Speed | Fast | Fast | Medium |
| Context awareness | Good | Excellent | Excellent |
| Multi-file edits | Good | Good | Excellent |
| Debugging | Good | Good | Excellent |
| Cost | $20/mo | $15/mo | Pay-per-use |

### Our Take

Claude Code wins on quality and multi-file reasoning. Cursor wins on speed for small edits. Windsurf is the best balance. The right choice depends on your workflow.`,
    url: null,
    category: "tool",
    tags: ["cursor", "windsurf", "claude-code", "ide", "comparison"],
    thumbnailUrl: null,
    author: "David",
    voteCount: 167,
    commentCount: 0,
    labSlug: null,
    isFeatured: false,
    status: "published",
    publishedAt: new Date("2026-02-15"),
    hotnessScore: 78,
    createdAt: new Date("2026-02-15"),
    updatedAt: new Date("2026-02-15"),
  },
  {
    id: "news_007",
    slug: "multi-agent-workflows-production-ready",
    title: "Multi-Step AI Agents Are Finally Reliable Enough for Production",
    excerpt:
      "After a year of hype, the tooling has caught up. Here's what changed and how to build reliable agent workflows today.",
    content: `## What Changed

A year ago, multi-step AI agents were impressive demos that broke in production. Today, they're deployable. Three things changed:

### 1. Better Tool Use
Models now call tools with >95% accuracy. Claude Opus 4 in particular handles complex tool chains reliably.

### 2. Structured Outputs
JSON mode and function calling mean agents return predictable, parseable responses instead of free-form text.

### 3. Observability
Tools like LangSmith, Helicone, and Braintrust let you trace every step of an agent's reasoning. When something fails, you can see exactly where and why.

### Building Reliable Agents Today

The key is **constraint, not capability**. Limit your agent's scope, validate every tool call, and build human-in-the-loop checkpoints for high-stakes actions.

We're developing a lab on building production agent workflows — vote if you'd like to see it!`,
    url: null,
    category: "ai-launch",
    tags: ["agents", "automation", "workflows", "production", "reliability"],
    thumbnailUrl: null,
    author: "David",
    voteCount: 89,
    commentCount: 0,
    labSlug: null,
    isFeatured: false,
    status: "published",
    publishedAt: new Date("2026-02-12"),
    hotnessScore: 52,
    createdAt: new Date("2026-02-12"),
    updatedAt: new Date("2026-02-12"),
  },
]

// ─── News Votes ──────────────────────────────────────────────────────────────

export const mockNewsVotes: NewsVote[] = [
  { id: "vote_001", articleId: "news_001", userId: "user_mock_001", createdAt: new Date("2026-02-27") },
  { id: "vote_002", articleId: "news_004", userId: "user_mock_001", createdAt: new Date("2026-02-20") },
  { id: "vote_003", articleId: "news_006", userId: "user_mock_001", createdAt: new Date("2026-02-15") },
]

// ─── News Comments ───────────────────────────────────────────────────────────

export const mockNewsComments: NewsComment[] = [
  {
    id: "nc_001",
    articleId: "news_001",
    userId: "user_mock_001",
    parentId: null,
    body: "This is a game changer. The sustained context window alone makes it worth exploring for automation workflows.",
    createdAt: new Date("2026-02-27T10:30:00"),
    updatedAt: new Date("2026-02-27T10:30:00"),
    userName: "David",
    userAvatar: null,
  },
  {
    id: "nc_002",
    articleId: "news_001",
    userId: "user_002",
    parentId: "nc_001",
    body: "Agreed! I've been testing it for a week and the difference in reliability is noticeable compared to earlier computer-use attempts.",
    createdAt: new Date("2026-02-27T11:15:00"),
    updatedAt: new Date("2026-02-27T11:15:00"),
    userName: "Sarah Chen",
    userAvatar: null,
  },
  {
    id: "nc_003",
    articleId: "news_001",
    userId: "user_003",
    parentId: null,
    body: "Would love a lab on this! Especially for automating desktop apps that don't have APIs.",
    createdAt: new Date("2026-02-27T14:00:00"),
    updatedAt: new Date("2026-02-27T14:00:00"),
    userName: "Marcus Johnson",
    userAvatar: null,
  },
  {
    id: "nc_004",
    articleId: "news_002",
    userId: "user_002",
    parentId: null,
    body: "The MCP lab was brilliant. Built my own server connecting to our internal wiki in about 45 minutes.",
    createdAt: new Date("2026-02-25T16:00:00"),
    updatedAt: new Date("2026-02-25T16:00:00"),
    userName: "Sarah Chen",
    userAvatar: null,
  },
  {
    id: "nc_005",
    articleId: "news_004",
    userId: "user_003",
    parentId: null,
    body: "Followed this tutorial and had my bot running in under 25 minutes. Would love a lab on customising the responses!",
    createdAt: new Date("2026-02-21T09:00:00"),
    updatedAt: new Date("2026-02-21T09:00:00"),
    userName: "Marcus Johnson",
    userAvatar: null,
  },
  {
    id: "nc_006",
    articleId: "news_004",
    userId: "user_mock_001",
    parentId: "nc_005",
    body: "Great to hear! The lab goes deeper into response customisation — check it out.",
    createdAt: new Date("2026-02-21T10:30:00"),
    updatedAt: new Date("2026-02-21T10:30:00"),
    userName: "David",
    userAvatar: null,
  },
]
