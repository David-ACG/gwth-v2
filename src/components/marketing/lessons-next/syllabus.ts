/**
 * The syllabus as the public course page (`/lessons`) lists it.
 *
 * ## Where every title comes from
 *
 * The syllabus database of the lesson pipeline (`gwth_pipeline.db`, the v3
 * Syllabus page, the source of truth for lesson identity; the same register
 * `MONTH_CONFIGS` in `lib/config.ts` is counted from). Read on 19 Nov 2026:
 * the `month1`, `month2` and `month3` modules, in syllabus order, with core or
 * optional taken from each row's `metadata.mandatory`. `id` is the row id
 * there, kept so a title can be traced back; it is never shown.
 *
 * Nothing here is invented. A title was changed in three mechanical ways only:
 * it is split at " - " into a name and a gloss, it is set in sentence case
 * (paper-first register), and "&" and "/" became "and". No lesson was added,
 * dropped or renamed. The per-lesson project titles in that database are NOT
 * used: `home-fde` records that the field is stale for Months 1 and 3.
 *
 * ## The count, and the five lessons added since it was taken
 *
 * `MONTH_CONFIGS` holds the core count per month (22, 20 and 21, counted on
 * 2026-10-20). The lesson restructure of 14 Nov 2026 added five core rows to
 * the database: two in Month 1 and three in Month 2. They are marked
 * `sinceCount` below. The page must never show a number that disagrees with
 * its own list, or with the pricing page, so {@link coreLessons} lists them
 * only once `MONTH_CONFIGS` counts them. Raise the config counts to 24 and 23
 * and all five appear, with every number on the page following.
 *
 * No optional count is printed anywhere (David, a-20260914-201426-ae7f0e).
 *
 * Nothing on the page links into a lesson (David, 1 Nov 2026). The one lesson
 * a visitor can take is the free lesson, at `/start-here`.
 */

export type SyllabusLesson = {
  /** Row id in the syllabus database. Provenance only; never shown. */
  id: number
  /** The lesson's name: the part of the title before " - ". */
  title: string
  /** What it covers: the part of the title after " - ", when there is one. */
  gloss?: string
  /**
   * `free`: the free lesson at /start-here. `project`: a lesson that builds
   * the month's project (its title says so).
   */
  kind?: "free" | "project"
  /** Added to the syllabus after the config count was taken (see above). */
  sinceCount?: true
}

export type OptionalGroup = {
  /** A plain heading for a handful of optional lessons. */
  title: string
  lessons: readonly SyllabusLesson[]
}

export type SyllabusMonth = {
  month: 1 | 2 | 3
  /** Every core row, in syllabus order, including the `sinceCount` ones. */
  core: readonly SyllabusLesson[]
  /** Every optional row, grouped for reading. Order inside a group is syllabus order. */
  optional: readonly OptionalGroup[]
}

export const SYLLABUS: readonly SyllabusMonth[] = [
  {
    month: 1,
    core: [
      { id: 262, title: "Start here", gloss: "The tips we wish we'd had when we started", kind: "free" },
      { id: 1, title: "Welcome to GWTH", gloss: "Six ways AI can give you superpowers" },
      { id: 192, title: "Your AI colleague", gloss: "How to get brilliant help without giving up your judgement" },
      { id: 4, title: "How AI works", gloss: "The useful bits that make you better at it" },
      { id: 268, title: "Stay safe with AI", gloss: "Check, protect and spot fakes", sinceCount: true },
      { id: 2, title: "Frontier labs tooling", gloss: "OpenAI, Anthropic, Google and what to use when" },
      { id: 5, title: "Research superpower", gloss: "Find, compare and verify anything" },
      { id: 6, title: "Content superpower", gloss: "Write, design and communicate in your voice" },
      { id: 7, title: "Images and short video", gloss: "Make visuals for your message with AI" },
      { id: 269, title: "Know your rights with AI", gloss: "Refunds, complaints, work and access", sinceCount: true },
      { id: 8, title: "Thinking superpower", gloss: "Plan, decide and learn faster" },
      { id: 10, title: "Building superpower", gloss: "Make your first useful thing without coding" },
      { id: 11, title: "Data superpower", gloss: "Turn messy information into answers" },
      { id: 208, title: "AI tooling landscape", gloss: "Where AI shows up in real life" },
      { id: 12, title: "Agent safety", gloss: "How to stay in control" },
      { id: 13, title: "CV and LinkedIn upgrade", gloss: "Tell your story better with AI" },
      { id: 14, title: "Job search and interview confidence with AI" },
      { id: 15, title: "AI presentations and websites", gloss: "Make ideas visible" },
      { id: 16, title: "AI data dashboards", gloss: "Turn numbers into decisions" },
      { id: 209, title: "AI power tools", gloss: "MCPs, CLIs, skills, plugins and connectors" },
      { id: 17, title: "Transcription and extraction", gloss: "Teaching AI to listen" },
      { id: 18, title: "Choosing your coding tool", gloss: "Codex, Claude Code, OpenCode and what to use when" },
      { id: 20, title: "Your AI garage", gloss: "Test free and low-cost models" },
      { id: 248, title: "OpenAI aka ChatGPT" },
    ],
    optional: [
      {
        title: "The FamilyBot project",
        lessons: [
          { id: 255, title: "FamilyBot blueprint", gloss: "Design a helpful AI for home life", kind: "project" },
          { id: 256, title: "FamilyBot listens", gloss: "Turn voice notes or meetings into useful text", kind: "project" },
          { id: 257, title: "FamilyBot organises", gloss: "Extract tasks, meals, events and shopping", kind: "project" },
          { id: 258, title: "FamilyBot shares", gloss: "Make the outputs useful for real life", kind: "project" },
        ],
      },
      {
        title: "More to explore",
        lessons: [
          { id: 253, title: "Automation superpower", gloss: "Save time by connecting repeatable steps" },
          { id: 254, title: "Agents superpower", gloss: "AI that can do things for you" },
          { id: 132, title: "Test a small online shop with AI", gloss: "Before you spend money" },
          { id: 267, title: "Build an audience with AI", gloss: "Test a podcast, YouTube or Instagram channel" },
          { id: 249, title: "Anthropic aka Claude" },
          { id: 250, title: "Google aka Gemini" },
        ],
      },
      {
        title: "Rounding off the month",
        lessons: [
          { id: 259, title: "Month 1 portfolio", gloss: "Show what you can now do with AI" },
          { id: 260, title: "Month 1 review", gloss: "Your next step toward Month 2" },
        ],
      },
    ],
  },
  {
    month: 2,
    core: [
      { id: 210, title: "Welcome to Month 2", gloss: "From AI user to AI builder" },
      { id: 211, title: "Advanced thinking superpower", gloss: "Specs, context and AI builder judgement" },
      { id: 212, title: "Your AI garage", gloss: "Get more value from paid models" },
      { id: 213, title: "GitHub, projects and professional workflow" },
      { id: 214, title: "GWTH AI app architecture", gloss: "Useful, secure, reliable, efficient" },
      { id: 215, title: "Security from day one", gloss: "Keys, permissions, UK GDPR, prompt injection" },
      { id: 216, title: "Advanced building superpower", gloss: "From vibe coding to agentic engineering" },
      { id: 217, title: "Supabase foundations", gloss: "Data, auth, roles and business records" },
      { id: 218, title: "Testing AI-built apps", gloss: "TDD, Playwright and regression checks" },
      { id: 219, title: "Advanced research superpower", gloss: "Business knowledge and RAG foundations" },
      { id: 220, title: "Embeddings, retrieval and search without the maths" },
      { id: 221, title: "RAG that actually works", gloss: "Citations, chunking, trust" },
      { id: 222, title: "AskMyCo part 1", gloss: "Build the company knowledge engine", kind: "project" },
      { id: 223, title: "Advanced data superpower", gloss: "Dashboards, reports and evaluation" },
      { id: 224, title: "Advanced automation superpower", gloss: "Workflows, agents and human control" },
      { id: 225, title: "GEO and agent shopping", gloss: "The new SEO for UK businesses" },
      { id: 270, title: "Agent shopping", gloss: "When AI agents compare and buy for your customers", sinceCount: true },
      { id: 226, title: "Advanced content superpower", gloss: "Brand, proposals, decks and sites" },
      { id: 227, title: "FractionalBuddy part 1", gloss: "AI consultant and business assistant blueprint", kind: "project" },
      { id: 228, title: "Capstone build", gloss: "AskMyCo and FractionalBuddy production sprint", kind: "project" },
      { id: 229, title: "Month 2 portfolio", gloss: "Sell your skills, show your builds, bridge to Month 3" },
      { id: 271, title: "AI design tools workshop", gloss: "Claude Design, Impeccable and UI polish", sinceCount: true },
      { id: 272, title: "Performers' voice and likeness", gloss: "Your rights when AI can copy you", sinceCount: true },
    ],
    optional: [
      {
        title: "AI in your own field",
        lessons: [
          { id: 240, title: "AI for UK healthcare" },
          { id: 241, title: "AI for UK legal" },
          { id: 242, title: "AI for UK finance" },
          { id: 264, title: "AI for UK HR and people teams" },
          { id: 265, title: "AI for UK marketing" },
          { id: 266, title: "AI for UK sales" },
          { id: 243, title: "AI for travel and event planning" },
          { id: 244, title: "AI for creative industries" },
          { id: 246, title: "AI for product and project management", gloss: "Roadmaps, delivery and team efficiency" },
        ],
      },
      {
        title: "Going further into building",
        lessons: [
          { id: 261, title: "Browser and computer-use agents", gloss: "Research and admin on autopilot" },
          { id: 230, title: "Codex deep dive", gloss: "Desktop first, CLI when it helps" },
          { id: 231, title: "Claude Code deep dive", gloss: "Desktop first, Warp and CLI when it helps" },
          { id: 232, title: "Advanced AI coding harnesses", gloss: "CLI, remote control, multi-machine workflows" },
          { id: 233, title: "Design systems and AI design tools", gloss: "Claude Design, Impeccable, UI polish" },
          { id: 247, title: "AI second brain", gloss: "Build a personal knowledge wiki" },
          { id: 234, title: "Advanced RAG", gloss: "Hybrid search, re-ranking and production retrieval" },
          { id: 235, title: "Observability and evals", gloss: "Langfuse, Braintrust, Helicone, custom tests" },
          { id: 236, title: "Security deep dive", gloss: "Hardening, auditing, compliance" },
          { id: 237, title: "Self-hosting LLMs", gloss: "Local models, privacy and UK data control" },
          { id: 245, title: "Cheaper and open models", gloss: "China, Europe and when frontier models are worth it" },
          { id: 238, title: "Fine-tuning and distillation", gloss: "When to use them and when not to" },
          { id: 239, title: "Open source and community", gloss: "Build credibility in public" },
        ],
      },
    ],
  },
  {
    month: 3,
    core: [
      { id: 157, title: "Welcome to Month 3", gloss: "From AI builder to AI transformation leader" },
      { id: 77, title: "The AI transformation reality", gloss: "20/75, growth and economic leverage" },
      { id: 158, title: "AI readiness framework", gloss: "Domains, maturity and the 12 themes" },
      { id: 78, title: "Interviewing the organisation", gloss: "Discover where AI can actually help" },
      { id: 79, title: "Voice-first assessment", gloss: "Speech, conversation and accessibility" },
      { id: 159, title: "Consent, trust and UK AI governance" },
      { id: 80, title: "Evidence wiki", gloss: "Enterprise RAG for interview knowledge" },
      { id: 160, title: "Thematic analysis", gloss: "Find patterns across teams" },
      { id: 81, title: "AI maturity scoring", gloss: "Benchmarks, confidence and evidence" },
      { id: 161, title: "Transformation roadmaps", gloss: "Prioritise work that matters" },
      { id: 162, title: "Enterprise economics", gloss: "ROI, cost and the AI P&L" },
      { id: 82, title: "Workflow redesign with agents", gloss: "Humans, tools and new operating models" },
      { id: 263, title: "Your company's AI workspace", gloss: "What a rollout really takes" },
      { id: 163, title: "Your AI garage", gloss: "Premium models and multi-model workflows" },
      { id: 83, title: "Adoption that sticks", gloss: "Culture, training and change management" },
      { id: 84, title: "AI transformation dashboard", gloss: "Track impact and midstream adjustments" },
      { id: 164, title: "Capstone part 1", gloss: "Build the voice interview prototype", kind: "project" },
      { id: 165, title: "Capstone part 2", gloss: "Build the evidence RAG and scoring engine", kind: "project" },
      { id: 85, title: "Capstone part 3", gloss: "Generate the roadmap and executive report", kind: "project" },
      { id: 86, title: "AI champion playbook", gloss: "Board briefing and 90-day plan" },
      { id: 166, title: "Month 3 portfolio", gloss: "Transformation leader showcase" },
    ],
    optional: [
      {
        title: "AI in your own field",
        lessons: [
          { id: 88, title: "Public sector, procurement and vendor risk" },
          { id: 168, title: "AI for financial services", gloss: "Compliance, risk and automation" },
          { id: 89, title: "AI for healthcare", gloss: "Safety, evidence and clinical boundaries" },
          { id: 169, title: "AI for professional services", gloss: "Consulting, legal and accounting" },
          { id: 90, title: "AI for manufacturing and supply chain" },
        ],
      },
      {
        title: "Leading the change",
        lessons: [
          { id: 87, title: "Building a Chief AI Officer role", gloss: "The UK playbook" },
          { id: 167, title: "The AI board briefing", gloss: "What to tell your board and how often" },
          { id: 93, title: "Responsible AI, ethics, IP and disclosure" },
          { id: 173, title: "Workforce transition, accessibility and inclusion" },
          { id: 94, title: "AI consulting practice", gloss: "Advisory, fractional CTO and AI auditing" },
        ],
      },
      {
        title: "Going further into building",
        lessons: [
          { id: 170, title: "Advanced voice AI and conversational interfaces" },
          { id: 91, title: "Advanced multi-agent orchestration", gloss: "Production pipelines" },
          { id: 171, title: "Self-hosted AI infrastructure", gloss: "Ollama, vLLM and GPU management" },
          { id: 92, title: "Open-source models at enterprise scale", gloss: "DeepSeek, Qwen, Mistral, Llama" },
          { id: 172, title: "AI security red teaming", gloss: "Testing AI systems before deployment" },
        ],
      },
    ],
  },
]

/** The syllabus for one month. */
export function syllabusMonth(month: number): SyllabusMonth {
  const found = SYLLABUS.find((m) => m.month === month)
  if (!found) throw new Error(`No syllabus for month ${month}`)
  return found
}

/**
 * The core lessons the page lists for a month, so the list always has exactly
 * as many rows as the count printed beside it.
 *
 * `counted` is the month's `mandatoryLessons` from `MONTH_CONFIGS`. When it
 * equals the whole core list, every lesson is listed. While it is still the
 * 20 October count, the lessons added since are left out (see the file
 * comment). The test fails if neither case holds, which is the signal to
 * re-read the syllabus database.
 */
export function coreLessons(
  month: number,
  counted: number
): readonly SyllabusLesson[] {
  const all = syllabusMonth(month).core
  if (counted >= all.length) return all
  return all.filter((lesson) => !lesson.sinceCount)
}
