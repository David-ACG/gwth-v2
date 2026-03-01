/**
 * Demo lesson data for the "Welcome to GWTH" lesson, restructured into
 * the new 5-section format (Intro, Objectives, Content, Q&A, Project).
 *
 * This data exercises ALL new lesson components:
 * - Callout boxes (note, warning, tip, deep-dive)
 * - Key term tooltips
 * - Code blocks with syntax highlighting
 * - Tables, blockquotes, lists
 * - Headings (H2/H3) for TOC scroll-spy
 */

import type { QuizQuestion } from "@/lib/types"

/** Structure for the new 5-section lesson layout */
export interface DemoLessonData {
  /** Section 1: Intro video */
  introVideo: {
    url: string
    duration: number
    title: string
    description: string
  }

  /** Section 2: Learning objectives */
  objectives: string[]

  /** Section 3: Main lesson content (markdown with custom syntax) */
  lessonContent: string
  audioUrl: string | null
  audioDuration: number | null

  /** Section 4: Quiz questions */
  questions: QuizQuestion[]

  /** Section 5: Hands-on project */
  project: {
    title: string
    description: string
    milestones: {
      title: string
      description: string
      completed: boolean
    }[]
    videoUrl: string | null
    videoDuration: number | null
  }
}

/** Demo lesson: "Welcome to GWTH — What AI Can Actually Do For You" */
export const demoLessonData: DemoLessonData = {
  // ── Section 1: Intro Video ──────────────────────────────────────────────
  introVideo: {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: 15,
    title: "Welcome to GWTH — What AI Can Actually Do For You",
    description:
      "A quick overview of what you'll build over the next three months — from AI basics to enterprise transformation.",
  },

  // ── Section 2: Objectives ──────────────────────────────────────────────
  objectives: [
    "Understand what modern AI tools can reliably do right now",
    "Learn the GWTH philosophy: plain English in, working products out",
    "See the 3-month journey from beginner to enterprise-ready practitioner",
    "Have your first meaningful AI conversation",
    "Set expectations for what this course will (and won't) teach you",
  ],

  // ── Section 3: Lesson Content ──────────────────────────────────────────
  lessonContent: `## Cutting Through the Noise

Welcome. If you're here, you've probably heard the hype. AI is going to change everything, replace every job, cure every disease, and possibly make you a cup of tea. Some of that is true. Most of it is noise.

This course is different. We're not here to talk about AI in the abstract. We're here to **build things** — starting today, using nothing but plain English and a handful of free tools.

:::note
This is a hands-on course. Every lesson has a practical output. By the end of today, you'll have had your first meaningful AI conversation and started building your GWTH portfolio.
:::

### The GWTH Philosophy

> **If you can describe it in plain English, you can build it with AI.**

We believe the most important AI skill is not coding — it's ==clear thinking|The ability to break down what you want into specific, unambiguous instructions that an AI can follow==. Every lesson in this course follows three principles:

1. **Plain English first.** You describe what you want in words, and AI helps you build it.
2. **Build, don't just learn.** Every lesson has a practical output — something you can use.
3. **Real problems, not toy examples.** We work on things that matter — business tools, automations, dashboards, bots.

## What AI Can Actually Do Right Now

Let's cut through the noise. Here's what AI tools can reliably do today:

| Capability | Example Tools | What It Means For You |
|-----------|---------------|----------------------|
| **Write anything** | Claude, ChatGPT, Gemini | Emails, reports, blog posts, marketing copy — in seconds |
| **Build apps** | Lovable, Bolt, v0 | Describe an app in English, get a working product |
| **Analyse data** | Claude, Code Interpreter | Upload a spreadsheet, ask questions, get charts |
| **Automate workflows** | Make.com, Zapier, n8n | Connect tools, trigger actions, eliminate manual work |
| **Create images** | Midjourney, DALL-E, Flux | Professional visuals from text descriptions |
| **Research anything** | Perplexity, Claude | Deep research with sources in minutes, not hours |

:::warning
AI tools are powerful but not infallible. They can generate incorrect information with confidence. Always verify critical facts, especially for business decisions, legal matters, and health advice.
:::

### Your Three-Month Journey

The course is structured as a progressive journey:

**Month 1: From Zero to Building** — Set up your AI toolkit, learn prompting, create content, build apps and websites, analyse data, and construct your first capstone project.

**Month 2: Real Apps & Your Industry** — Move into real development environments, build production-quality tools, connect APIs, create ==RAG|Retrieval-Augmented Generation — a technique where AI retrieves relevant documents before generating a response, reducing hallucinations and grounding answers in real data== applications, and explore AI for your specific industry.

**Month 3: Enterprise & Transformation** — Tackle enterprise-scale challenges: self-hosted AI, multi-tenant systems, governance frameworks, security, and learn to lead AI transformation.

:::tip
You don't need any technical background to start. Month 1 assumes zero prior knowledge. Each lesson builds on the previous one, so follow the sequence — especially in the first month.
:::

## Your First AI Interaction

Before we go any further, let's try something. Open Claude or ChatGPT and type this prompt:

\`\`\`text
I'm starting a course about using AI for practical tasks.
Give me three things I could build this week that would
save me time at work. Be specific and actionable.
\`\`\`

Read the response. Notice how specific and useful it is. That's the starting point — and we're going much further.

### What Makes a Good Prompt

Even in this simple example, notice the key elements:

- **Context**: "I'm starting a course about AI"
- **Specificity**: "three things" (not "some things")
- **Constraints**: "this week" and "save me time at work"
- **Quality direction**: "Be specific and actionable"

These four elements — context, specificity, constraints, and quality direction — form the foundation of effective ==prompting|The art of crafting instructions for AI tools to get the best possible results. Good prompts are specific, provide context, set constraints, and describe the desired output quality==. We'll master this in Lesson 3.

:::deep-dive[How AI Language Models Actually Work]
Under the hood, AI language models like Claude and ChatGPT are trained on vast amounts of text data. They learn patterns in language — grammar, facts, reasoning patterns, coding conventions — and can then generate new text that follows those patterns.

Think of it like autocomplete on steroids. When you type a prompt, the model predicts what text should come next, token by token. But "autocomplete" drastically undersells it — these models can follow complex instructions, maintain context across thousands of words, write code, analyse data, and reason about problems.

The key insight: **you don't need to understand how the engine works to drive the car.** Just as you don't need to know combustion chemistry to drive, you don't need to understand transformer architectures to use AI effectively. You just need to know how to give good directions.
:::

## What You'll Need

Getting started requires very little:

- A computer with internet access (any operating system)
- A free account on [Claude.ai](https://claude.ai) or [ChatGPT](https://chat.openai.com)
- Curiosity and willingness to experiment
- About 45-60 minutes per lesson

That's it. No software to install yet (we'll do that in the next lesson). No credit card required for Month 1.

### How Each Lesson Works

Every lesson in this course follows a consistent 5-section structure:

1. **Intro Video** — Watch a brief overview of the topic
2. **Objectives** — See what you'll learn before diving in
3. **Lesson Content** — Read the material with interactive elements (you're here now)
4. **Quiz** — Test your understanding with immediate feedback
5. **Project** — Follow hands-on steps to build something real

---

*Ready? In the next lesson, you'll set up your complete AI toolkit — the tools you'll use for the rest of the course and beyond.*`,

  audioUrl:
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  audioDuration: 2700,

  // ── Section 4: Quiz Questions ──────────────────────────────────────────
  questions: [
    {
      id: "demo_q1",
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
      id: "demo_q2",
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
      id: "demo_q3",
      question:
        "What are the four elements of an effective AI prompt mentioned in this lesson?",
      options: [
        "Speed, accuracy, brevity, and formality",
        "Context, specificity, constraints, and quality direction",
        "Grammar, spelling, punctuation, and tone",
        "Length, complexity, detail, and formatting",
      ],
      correctOptionIndex: 1,
      explanation:
        "The four key elements are context (background information), specificity (precise requests), constraints (boundaries and limits), and quality direction (how you want the output). We cover this in depth in Lesson 3.",
    },
  ],

  // ── Section 5: Project ─────────────────────────────────────────────────
  project: {
    title: "Your First AI Conversation",
    description:
      "This lesson's build exercise establishes your baseline with AI tools. You'll have three different types of conversation and start your GWTH portfolio.",
    milestones: [
      {
        title: "Open an AI Tool",
        description:
          "Go to Claude.ai or ChatGPT and create a free account if you haven't already.",
        completed: false,
      },
      {
        title: "Personal Productivity Prompt",
        description:
          'Ask: "What are five ways I could use AI to save time in my daily routine? Be specific and practical."',
        completed: false,
      },
      {
        title: "Work Application Prompt",
        description:
          'Ask: "I work in [your industry]. What are the three highest-impact ways AI could help me this week?"',
        completed: false,
      },
      {
        title: "Creative Exploration Prompt",
        description:
          'Ask: "Help me brainstorm a simple app idea that would solve a problem I face at work."',
        completed: false,
      },
      {
        title: "Save Your Portfolio Entry",
        description:
          "Copy your favourite response into a document. This is the start of your GWTH portfolio.",
        completed: false,
      },
    ],
    videoUrl: null,
    videoDuration: null,
  },
}
