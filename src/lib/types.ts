/**
 * Shared TypeScript interfaces for the GWTH learning platform.
 * These represent the domain model — how the UI thinks about data.
 * The actual storage/API shape may differ; the data layer maps between them.
 */

// ─── Subscription ────────────────────────────────────────────────────────────

/** The 7 possible subscription states a user can be in */
export type SubscriptionState =
  | "visitor"
  | "registered"
  | "month1"
  | "month2"
  | "month3"
  | "ongoing"
  | "lapsed"

// ─── User ─────────────────────────────────────────────────────────────────────

/** Authenticated user profile */
export interface User {
  /** Unique user identifier */
  id: string
  /** User's display name */
  name: string
  /** Email address (unique) */
  email: string
  /** URL to the user's avatar image */
  avatarUrl: string | null
  /** Short bio / about text */
  bio: string | null
  /** Current subscription state */
  subscriptionState: SubscriptionState
  /** Which subscription month the user has paid through (0 = free, 1-3 = course months, 4+ = ongoing) */
  subscriptionMonth: number
  /** Grace period end date if payment lapsed, null otherwise */
  gracePeriodEnds: Date | null
  /** Date of last successful payment */
  lastPaymentDate: Date | null
  /** How the learner has course access (manual_beta, prepaid, stripe_course...) */
  accessSource?: string
  /** When course access ends, when known (a prepaid pass or a dated grant) */
  accessEndsAt?: Date | null
  /** Hold the clock: the month they are waiting for while it is not open yet */
  courseOnHoldFor?: 2 | 3 | null
  /** When the user account was created */
  createdAt: Date
  /** When the user profile was last updated */
  updatedAt: Date
}

// ─── Dynamic Score ───────────────────────────────────────────────────────────

/** Student's dynamic score and related metrics */
export interface DynamicScore {
  /** Overall score (1.5 pts per lesson, decays if content not reviewed) */
  overallScore: number
  /** Maximum possible score based on completed lessons */
  maxPossibleScore: number
  /** Percentile rank among all students (0-100) */
  percentile: number
  /** Curiosity Index: ratio of optional/advanced lessons explored */
  curiosityIndex: number
  /** Consistency Score: regularity of study sessions (0-100) */
  consistencyScore: number
  /** Improvement Rate: trend in quiz scores over time (-100 to 100) */
  improvementRate: number
  /** Score history over time for chart display */
  scoreHistory: { date: Date; score: number }[]
}

// ─── Tech Radar ──────────────────────────────────────────────────────────────

/** A tool tracked on the GWTH Tech Radar */
export interface TechRadarTool {
  /** Tool name */
  name: string
  /** URL-friendly slug */
  slug: string
  /** Version string */
  version: string
  /** Tool category (e.g., "LLM", "Automation", "AI Image") */
  category: string
  /** Release status */
  status: "GA" | "Beta" | "Alpha" | "Deprecated" | "Research Preview"
  /** Pricing model */
  cost_tier: "free" | "freemium" | "paid" | "open_source"
  /** Tool website URL */
  url: string
  /** Brief description */
  description: string
  /** Searchable tags */
  tags: string[]
  /** Whether this tool is currently trending/notable */
  is_hot: boolean
  /** ISO 3166-1 alpha-2 country code for the tool's headquarters/origin (e.g., "US", "GB", "FR") */
  country_code: string
  /** When the tool entry was last verified */
  last_verified: string
}

// ─── Month Configuration ─────────────────────────────────────────────────────

/** Configuration for a course month */
export interface MonthConfig {
  /** Month number (1, 2, or 3) */
  month: 1 | 2 | 3
  /** Display title */
  title: string
  /** Subtitle shown on cards */
  subtitle: string
  /** Brief description */
  description: string
  /** Total mandatory lessons */
  mandatoryLessons: number
  /** Total optional lessons */
  optionalLessons: number
  /** Capstone project name */
  capstoneName: string
  /** Capstone project domain */
  capstoneDomain: string
  /** Capstone project description */
  capstoneDescription: string
}

// ─── Course ───────────────────────────────────────────────────────────────────

/** A course containing ordered sections of lessons */
export interface Course {
  /** Unique identifier */
  id: string
  /** URL-friendly slug */
  slug: string
  /** Course title */
  title: string
  /** Brief description shown on cards and listing pages */
  description: string
  /** URL to the course thumbnail image */
  thumbnail: string
  /** Tiny base64 placeholder for blur-up loading */
  blurDataUrl: string | null
  /** Price in cents (0 for free courses) */
  price: number
  /** Content category (e.g., "AI Fundamentals", "Machine Learning") */
  category: string
  /** Difficulty level */
  difficulty: "beginner" | "intermediate" | "advanced"
  /** Estimated total duration in minutes */
  estimatedDuration: number
  /** Ordered sections within the course */
  sections: CourseSection[]
  /** When the course was created */
  createdAt: Date
  /** When the course was last updated */
  updatedAt: Date
}

/** A named group of lessons within a course */
export interface CourseSection {
  /** Unique identifier */
  id: string
  /** Section title */
  title: string
  /** Display order within the course */
  order: number
  /** Which month this section belongs to (1, 2, or 3) */
  month: 1 | 2 | 3
  /** Whether this section contains optional lessons */
  isOptional?: boolean
  /** Optional track name (e.g., "Industry Verticals", "Advanced Technical") */
  optionalTrack?: string
  /** Lessons belonging to this section */
  lessons: LessonSummary[]
}

/** Minimal lesson data for listing inside a course/section */
export interface LessonSummary {
  /** Unique identifier */
  id: string
  /** URL-friendly slug */
  slug: string
  /** Lesson title */
  title: string
  /** Display order within the section */
  order: number
  /** Duration in minutes */
  duration: number
  /** Current completion status for the viewing user */
  status: LessonStatus
  /** Whether this is an optional lesson (Month 2 & 3 only) */
  isOptional?: boolean
  /** Optional track label (e.g., "Healthcare", "Career Accelerator") */
  optionalTrack?: string
}

// ─── Lesson ───────────────────────────────────────────────────────────────────

/** Possible states for a lesson from the user's perspective */
export type LessonStatus = "locked" | "available" | "in-progress" | "completed"

/** Full lesson data including all content tabs */
export interface Lesson {
  /** Unique identifier */
  id: string
  /** URL-friendly slug */
  slug: string
  /** Lesson title */
  title: string
  /** Brief description */
  description: string
  /** Display order within its section */
  order: number
  /** Duration in minutes */
  duration: number
  /** Difficulty level */
  difficulty: "beginner" | "intermediate" | "advanced"
  /** Content category tag */
  category: string
  /** ID of the section this lesson belongs to */
  sectionId: string
  /** ID of the course this lesson belongs to */
  courseId: string
  /** Slug of the course (for URL construction) */
  courseSlug: string
  /** Which month this lesson belongs to */
  month: 1 | 2 | 3
  /** Whether this is an optional lesson */
  isOptional?: boolean
  /** Optional track label */
  optionalTrack?: string

  // ── Learn tab content ──
  /** URL to the introductory video */
  introVideoUrl: string | null
  /** Rich text / MDX content for the Learn tab */
  learnContent: string
  /** URL to an audio version of the lesson */
  audioFileUrl: string | null
  /** Audio duration in seconds */
  audioDuration: number | null

  // ── Build tab content ──
  /** URL to the build-along video */
  buildVideoUrl: string | null
  /** Step-by-step build instructions (markdown) */
  buildInstructions: string | null

  // ── Quiz ──
  /** Quiz questions for this lesson */
  questions: QuizQuestion[]

  // ── Resources ──
  /** Supplementary resources (links, downloads) */
  resources: Resource[]

  /** Current status for the viewing user */
  status: LessonStatus
  /** When the lesson was created */
  createdAt: Date
  /** When the lesson was last updated */
  updatedAt: Date
}

/** A single quiz question with multiple-choice answers */
export interface QuizQuestion {
  /** Unique question identifier */
  id: string
  /** The question text */
  question: string
  /** Available answer options */
  options: string[]
  /** Index of the correct answer in the options array */
  correctOptionIndex: number
  /** Explanation shown after answering */
  explanation: string
}

/**
 * The quiz-question shape that may enter CLIENT component props
 * (gwth-launch-va6, N2 security). Deliberately has no `correctOptionIndex`
 * and no `explanation`: the full `QuizQuestion` row never leaves the server.
 * Grading happens in `submitQuizAnswersAction`, whose `QuizGradeResult`
 * reveals the correct answer and explanation only AFTER submission.
 */
export interface QuizQuestionPublic {
  /** Unique question identifier — the key a submitted answer is graded under */
  id: string
  /** The question text */
  question: string
  /** Available answer options */
  options: string[]
}

/**
 * Per-question outcome inside a `QuizGradeResult`.
 *
 * Reveal policy (N2 QA round-2 defect 2): while the learner can still
 * retry (attempts remain and the quiz is not passed), a WRONG answer's
 * `correctOptionIndex` and `explanation` are withheld - otherwise attempt 1
 * hands over the key and attempt 2 is a guaranteed forged pass. The full
 * reveal arrives only when no further grading can change the record: the
 * quiz is passed, or this grade consumed the final attempt.
 */
export interface QuizQuestionGrade {
  /** The graded question's id */
  questionId: string
  /** Whether the learner's answer matched the key */
  correct: boolean
  /** Index of the correct answer; absent while a wrong answer is retryable */
  correctOptionIndex?: number
  /** Explanation feedback; absent while a wrong answer is retryable */
  explanation?: string
}

/**
 * Server-computed quiz outcome returned by `submitQuizAnswersAction`.
 * The client renders from this and never computes a score or pass mark
 * itself, so its numbers are display-only and cannot be forged into the
 * progress record.
 */
export interface QuizGradeResult {
  /** Score 0..100, server computed */
  score: number
  /** Whether `score` clears the pass mark */
  passed: boolean
  /** The pass mark applied (the effective edition's pass_mark, N6) */
  passMark: number
  /** Per-question verdicts with the post-submission answer reveal */
  perQuestion: QuizQuestionGrade[]
  /** The merged, persisted progress row, for client reconciliation */
  progress: LessonProgress
}

/**
 * Server refusal when the persisted attempt count has reached
 * MAX_QUIZ_ATTEMPTS (N2 QA defect 5). Carries NO per-question reveal - the
 * answer key stays server-side on a refused submission - and a
 * ready-to-render message so the UI can explain the cap.
 */
export interface QuizAttemptLimitResult {
  /** Discriminant: nothing was graded, revealed or written */
  attemptLimitReached: true
  /** Attempts already on the persisted lesson_progress row */
  attemptsUsed: number
  /** The enforced cap (MAX_QUIZ_ATTEMPTS) */
  maxAttempts: number
  /** Best score already on record, for the UI to show */
  bestQuizScore: number
  /** The pass mark applied (the effective edition's pass_mark, N6) */
  passMark: number
  /** Human-readable refusal the UI can render directly */
  message: string
}

/**
 * A learner's saved, graded Q&A attempt, rebuilt on the server from their
 * progress row when they return to a lesson (bead gwth-launch-8ta). The
 * grade follows the same reveal policy as `submitQuizAnswersAction`, so it
 * carries nothing the learner was not already shown.
 */
export interface SavedQuizAttempt {
  /** The learner's answers, question id to option index */
  answers: Record<string, number>
  /** The verdicts for those answers, reveal policy applied */
  grade: QuizGradeResult
}

/** Everything `submitQuizAnswersAction` can return */
export type QuizSubmitResult = QuizGradeResult | QuizAttemptLimitResult

/** A supplementary resource attached to a lesson */
export interface Resource {
  /** Resource title */
  title: string
  /** URL to the resource */
  url: string
  /** Type of resource */
  type: "link" | "download" | "video" | "article"
}

// ─── Lab ──────────────────────────────────────────────────────────────────────

/**
 * A standalone marketing lead-magnet lab, tiered by difficulty
 * (beginner/intermediate/advanced). It is not tied to any specific lesson;
 * tier is its only course link. Distinct from a lesson's PROJECT (its practical
 * part), which has no dedicated website model yet. See pipeline board L14.
 */
export interface Lab {
  /** Unique identifier */
  id: string
  /** URL-friendly slug */
  slug: string
  /** Lab title */
  title: string
  /** Brief description */
  description: string
  /** Difficulty level */
  difficulty: "beginner" | "intermediate" | "advanced"
  /** Estimated duration in minutes */
  duration: number
  /** Technologies used in this lab */
  technologies: string[]
  /** What the student will learn */
  learningOutcomes: string[]
  /** Prerequisite knowledge or completed labs */
  prerequisites: string | null
  /** Main content (markdown) */
  content: string
  /** Step-by-step instructions */
  instructions: LabStep[]
  /** Content category */
  category: string
  /** Type of project */
  projectType: string
  /** Theme color for the lab card */
  color: string
  /** Icon name from lucide-react */
  icon: string
  /** Path to the lab's hero/thumbnail image */
  image?: string
  /** Whether the lab requires a pro subscription */
  isPremium: boolean
  /** When the lab was created */
  createdAt: Date
  /** When the lab was last updated */
  updatedAt: Date
}

/** A single step in a lab's instructions */
export interface LabStep {
  /** Step number (1-based) */
  step: number
  /** Step title */
  title: string
  /** Step instructions (markdown) */
  content: string
}

// ─── Model Lab (the six results pages at /labs, David 2026-10-21) ─────────────
//
// The shapes below are the JSON that model-bakeoff's `lab/site/export_gwth.py`
// writes into `src/lib/data/model-lab/`. Field names stay in the exporter's
// snake_case on purpose: the files are generated, and one spelling on both
// sides means a re-export never needs a mapping layer to be kept in step.

/** The six superpowers, each with its own lab page at /labs/<slug>. */
export type ModelLabSlug =
  | "research"
  | "content"
  | "thinking"
  | "building"
  | "data"
  | "automation"

/** One tested set-up named for a visitor: model, thinking level and maker. */
export interface ModelLabSetupName {
  /** Product name, e.g. "Claude Opus 5.5". */
  name: string
  /** Thinking level as tested: "standard", "low", "medium", "high", "xhigh" or "max". */
  level: string
  /** The company that makes the model, e.g. "Anthropic". */
  maker: string
}

/** A pick (best, best value) with its average mark and cost. */
export interface ModelLabPick extends ModelLabSetupName {
  /** Average mark out of 100 over the lab's tasks, rounded. */
  score: number
  /** About what one task costs at the maker's published API prices, e.g. "38p". */
  cost: string
  /** Tasks whose trap it caught. */
  basics: number
  /** Tasks it ran. */
  n: number
}

/** An everyday app plan a set-up can be chosen in. */
export interface ModelLabPlan {
  /** Plan name, e.g. "Claude Pro". */
  plan: string
  /** Price as shown, e.g. "£20 a month" or "free". */
  price: string
  /** Whether the plan is free. */
  free: boolean
  /** What the free allowance is, for free plans. */
  allowance?: string
}

/** The daily-driver and best-for-free picks, which name a plan rather than a cost. */
export interface ModelLabPlanPick extends ModelLabSetupName {
  /** Average mark out of 100, rounded. */
  score: number
  /** The plan it is available in. */
  plan: ModelLabPlan
}

/** One task in a lab. */
export interface ModelLabTask {
  /** Task id, e.g. "thinking_02_four_day_week". */
  id: string
  /** Short title, e.g. "The four-day week pilot". */
  title: string
  /** Whether this is the lab's main task, whose answers are shown. */
  signature: boolean
}

/** One file of an answer to the main task, as the blind comparison shows it. */
export type ModelLabAnswerFile =
  | {
      /** Markdown answer, carried inline. */
      kind: "md"
      /** File name, e.g. "pilot_plan.md". */
      name: string
      /** The model's markdown, verbatim (cut at 20,000 characters). */
      text: string
    }
  | {
      /** A model-written web page or chart, shown in a sandboxed frame or an image. */
      kind: "html" | "svg"
      /** File name. */
      name: string
      /** Path under /labs-files/. */
      src: string
    }
  | {
      /** A screenshot of a model-written page, with a link to open the page itself. */
      kind: "shot"
      /** File name of the page the screenshot was taken of. */
      name: string
      /** Path of the screenshot under /labs-files/. */
      src: string
      /** Path the link opens: the live page for Building, else the screenshot. */
      try: string
      /** Link label, "Try it" or "Open full size". */
      try_label: string
    }

/** One of the four blind answers to the main task. */
export interface ModelLabAnswer extends ModelLabSetupName {
  /** "A" to "D", in a fixed shuffled order. */
  letter: string
  /** Set-up id, e.g. "opus-5.5_medium". */
  setup: string
  /** The answer's files. */
  files: ModelLabAnswerFile[]
  /** Mark out of 100 on the main task. */
  score: number
  /** Whether it caught the main task's trap. */
  basics: boolean
  /** About what this answer cost. */
  cost: string
}

/** One file of a table row's answer to the main task. */
export interface ModelLabRowFile {
  /** File name; its extension decides how it is shown. */
  name: string
  /** Path under /labs-files/. */
  src: string
  /** The markdown, for .md files (rendered on the server when the row is opened). */
  text?: string
}

/** One row of "Every set-up we tested". */
export interface ModelLabRow extends ModelLabSetupName {
  /** Position by average mark; equal marks share a rank. */
  rank: number
  /** Set-up id. */
  setup: string
  /** Average mark out of 100, rounded. */
  score: number
  /** Tasks whose trap it caught. */
  basics: number
  /** Tasks it ran. */
  n: number
  /** Average cost of a task. */
  cost: string
  /** Mark on each task in the lab's task order; null where not marked yet. */
  tasks: (number | null)[]
  /** Where an everyday person can use it. */
  where: string
  /** Its answer to the main task. */
  sig_files: ModelLabRowFile[]
}

/** A premium set-up, shown for cost only and never ranked or picked. */
export interface ModelLabPremiumRow extends ModelLabSetupName {
  /** Average mark out of 100, rounded. */
  score: number
  /** Average cost of a task. */
  cost: string
}

/** The main-task cost check (GPT-6 Astra against GPT-6.1 Sol). */
export interface ModelLabPremiumMainRow extends ModelLabSetupName {
  /** What the main task cost. */
  cost: string
  /** Whether this is the premium set-up. */
  premium: boolean
}

/** The premium section's wording, split around its cost box. */
export interface ModelLabPremiumNote {
  /** Section title. */
  title: string
  /** Markdown before the cost box. */
  before: string
  /** The sentence on how GPT-6 Astra was run. */
  astra: string
  /** Markdown after the cost box. */
  after: string
  /** The sources line. */
  sources: string
}

/** Everything one lab page shows, exactly as the exporter writes it. */
export interface ModelLabData {
  /** The lab's slug. */
  sp: ModelLabSlug
  /** Display name, e.g. "Thinking". */
  sp_name: string
  /** Page headline, e.g. "Which AI is best at thinking a problem through?". */
  headline: string
  /** The blind comparison's question, e.g. "Which plan would you take to the board?". */
  ask: string
  /** The lab's tasks in table order. */
  tasks: ModelLabTask[]
  /** The main task's title. */
  sig_title: string
  /** The main task in plain English. */
  sig_plain: string
  /** The brief every model was given for the main task (markdown). */
  sig_task: string
  /** The best set-up. */
  best: ModelLabPick
  /** The best value set-up. */
  value: ModelLabPick
  /** The daily driver in an everyday app, or null if none qualifies. */
  app: ModelLabPlanPick | null
  /** The best set-up in a free app, or null if none qualifies. */
  free: ModelLabPlanPick | null
  /** Premium set-ups, cheapest first. */
  premium: ModelLabPremiumRow[]
  /** The main-task cost check, empty if not run in this lab. */
  premium_main: ModelLabPremiumMainRow[]
  /** Whether Claude Fable ran every task in this lab. */
  fable_all: boolean
  /** The premium section's wording. */
  premium_note: ModelLabPremiumNote
  /** The four blind answers. */
  answers: ModelLabAnswer[]
  /** Every set-up, best first. */
  table: ModelLabRow[]
  /** The six labs, for the lab menu. */
  nav: { id: ModelLabSlug; name: string }[]
  /** How many set-ups are in the table. */
  count: number
  /** First day any answer on the page was made (ISO date). */
  tested_from: string
  /** Last day any answer on the page was made (ISO date). */
  tested_to: string
}

/** One lab in the index. */
export interface ModelLabSummary {
  /** The lab's slug. */
  sp: ModelLabSlug
  /** Display name. */
  sp_name: string
  /** Page headline. */
  headline: string
  /** The blind comparison's question. */
  ask: string
  /** The main task's title. */
  sig_title: string
  /** The best set-up. */
  best: ModelLabPick
  /** The best value set-up. */
  value: ModelLabPick
  /** Set-ups in the table. */
  count: number
  /** Tasks in the lab. */
  tasks: number
  /** First test day (ISO date). */
  tested_from: string
  /** Last test day (ISO date). */
  tested_to: string
}

/** One bar of the cost-and-score chart on /labs. */
export interface ModelLabCostRow extends ModelLabSetupName {
  /** Set-up id. */
  setup: string
  /** Whether it is a premium set-up (shown with its own colour AND the word). */
  premium: boolean
  /** List-price cost in pounds of every scored task it ran, for the bar length. */
  cost_gbp: number
  /** The same cost as the page prints it, e.g. "£67.73" or "38p". */
  cost: string
  /** Average score out of 100 across the six labs, rounded. */
  score: number
  /** How many of the scored tasks it ran. */
  tasks_run: number
}

/** The cost-and-score chart: every set-up, dearest first. */
export interface ModelLabCostChart {
  /** How many scored tasks there are across the six labs. */
  tasks: number
  /** One row per set-up, dearest first. */
  rows: ModelLabCostRow[]
}

/** The lab list with the dates and counts the index page states. */
export interface ModelLabIndex {
  /** The six labs, in menu order. */
  labs: ModelLabSummary[]
  /** First test day across every lab (ISO date). */
  tested_from: string
  /** Last test day across every lab (ISO date). */
  tested_to: string
  /** Distinct models in the tables. */
  model_count: number
  /** Distinct set-ups (model plus thinking level) in the tables. */
  setup_count: number
  /** Pence to the dollar used for every cost. */
  p_per_usd: number
  /** The cost-and-score chart. */
  cost_chart: ModelLabCostChart
}

// ─── Progress ─────────────────────────────────────────────────────────────────

/** User's progress on a specific lesson */
export interface LessonProgress {
  /** Lesson ID */
  lessonId: string
  /** Whether the lesson is fully completed */
  isCompleted: boolean
  /** When the lesson was completed, null if not yet complete */
  completedAt?: Date | null
  /** Progress fraction (0 to 1) */
  progress: number
  /** Intro video watched fraction (0 to 1) */
  introVideoProgress?: number
  /** Latest quiz score (0 to 100), null if not attempted */
  quizScore: number | null
  /** Best quiz score achieved */
  bestQuizScore: number | null
  /** Whether the learner has passed this lesson's Q&A gate */
  quizPassed?: boolean
  /** Number of quiz attempts */
  quizAttempts: number
  /**
   * The learner's own answer set {questionId: optionIndex} behind the best
   * score (`lesson_progress.quiz_answers`), so a returning learner sees their
   * answers instead of a blank quiz (bead gwth-launch-8ta). Null or absent
   * when no server-graded submission exists.
   */
  quizAnswers?: Record<string, number> | null
  /** Total time spent on this lesson in seconds */
  timeSpent: number
  /** When the lesson was last accessed */
  lastAccessedAt: Date
}

/** User's progress on a specific lab */
export interface LabProgress {
  /** Lab ID */
  labId: string
  /** Whether the lab is fully completed */
  isCompleted: boolean
  /** Progress fraction (0 to 1) */
  progress: number
  /** Current step number (1-based) */
  currentStep: number
  /** When the lab was last accessed */
  lastAccessedAt: Date
}

/** User's overall progress on a course */
export interface CourseProgress {
  /** Course ID */
  courseId: string
  /** Overall progress fraction (0 to 1) */
  progress: number
  /** Number of completed lessons */
  completedLessons: number
  /** Total number of lessons in the course */
  totalLessons: number
  /** When the course was completed, null if not yet */
  completedAt: Date | null
}

// ─── Study Streak ─────────────────────────────────────────────────────────────

/** User's study activity tracking */
export interface StudyStreak {
  /** Current consecutive days studied */
  currentStreak: number
  /** Longest streak ever achieved */
  longestStreak: number
  /** Date of last study activity, null when the account has none yet */
  lastActiveDate: Date | null
  /** Last 7 days of activity (index 0 = 6 days ago, index 6 = today) */
  weeklyActivity: boolean[]
  /** Last 365 days of activity data for the heatmap */
  yearlyActivity: DayActivity[]
}

/** Activity data for a single day */
export interface DayActivity {
  /** The date */
  date: Date
  /** Number of lessons studied (accessed or completed) that day */
  count: number
}

// ─── Bookmark ─────────────────────────────────────────────────────────────────

/** A saved/bookmarked item */
export interface Bookmark {
  /** Unique bookmark identifier */
  id: string
  /** User who created the bookmark */
  userId: string
  /** Bookmarked lesson ID (null if bookmarking a lab) */
  lessonId: string | null
  /** Bookmarked lab ID (null if bookmarking a lesson) */
  labId: string | null
  /** When the bookmark was created */
  createdAt: Date
}

/** Exactly one piece of content addressed by a bookmark mutation. */
export type BookmarkTarget =
  | { lessonId: string; labId?: never }
  | { lessonId?: never; labId: string }

// ─── Note ─────────────────────────────────────────────────────────────────────

/**
 * What a learner note is pinned to (bead gwth-launch-fag3).
 *  - `part`: the free "Your notes" box at the end of a lesson part.
 *  - `paragraph`: one paragraph, from the desktop margin pencil.
 *  - `words`: the exact words the learner selected.
 */
export type NoteKind = "part" | "paragraph" | "words"

/**
 * Where a paragraph or words note sits in the part's text. Offsets count
 * characters of the block's text (the DOM `textContent`), so they survive
 * read-along wrapping words in spans. `quote` is what was pinned; the other
 * fields help find it again after the lesson text is rewritten.
 */
export interface NoteAnchor {
  /** Index of the paragraph-level block within the part's text. */
  block: number
  /** Start offset of the quote within that block's text. */
  start: number
  /** End offset (exclusive). */
  end: number
  /** The pinned text: the selected words, or the whole paragraph. */
  quote: string
  /** The sentence (or paragraph opening) around the quote, for display. */
  sentence: string
  /** Up to 40 characters before the quote, to tell repeats apart. */
  prefix: string
  /** Up to 40 characters after the quote. */
  suffix: string
}

/** A learner's note inside a lesson. Dates are ISO strings (client-safe). */
export interface LessonNote {
  /** Unique note identifier */
  id: string
  /** Lesson the note belongs to */
  lessonId: string
  /** Lesson title when the note was last saved (survives a removed lesson) */
  lessonTitle: string | null
  /** Part id (parts lessons) or section key (page-flip lessons); null = whole lesson */
  partKey: string | null
  /** Part title when the note was last saved */
  partTitle: string | null
  /** What the note is pinned to */
  kind: NoteKind
  /** The learner's text (plain text, may contain line breaks) */
  body: string
  /** Pinned text, for paragraph and words notes; null for a part note */
  anchor: NoteAnchor | null
  /** When the note was created (ISO) */
  createdAt: string
  /** When the note was last changed (ISO) */
  updatedAt: string
}

// ─── Certificate ──────────────────────────────────────────────────────────────

/** A course completion certificate */
export interface Certificate {
  /** Unique certificate identifier */
  id: string
  /** User who earned the certificate */
  userId: string
  /** Course the certificate was earned for */
  courseId: string
  /** Course title (denormalized for display) */
  courseTitle: string
  /** When the certificate was issued */
  issuedAt: Date
  /** URL to the downloadable certificate PDF */
  certificateUrl: string
}

// ─── Notification ─────────────────────────────────────────────────────────────

/** Notification type categories */
export type NotificationType = "achievement" | "reminder" | "announcement"

/** A user notification */
export interface Notification {
  /** Unique notification identifier */
  id: string
  /** User the notification is for */
  userId: string
  /** Notification category */
  type: NotificationType
  /** Short notification title */
  title: string
  /** Full notification message */
  message: string
  /** Whether the user has read this notification */
  read: boolean
  /** When the notification was created */
  createdAt: Date
}

// ─── News ────────────────────────────────────────────────────────────────────

/** Content categories for news articles */
export type NewsCategory =
  | "ai-launch"
  | "research"
  | "tool"
  | "industry"
  | "tutorial"

/** Sort options for the news feed */
export type NewsSortOption = "hot" | "new" | "top"

/** A curated news article posted by the GWTH team */
export interface NewsArticle {
  /** Unique identifier */
  id: string
  /** URL-friendly slug */
  slug: string
  /** Article headline */
  title: string
  /** Short summary shown on cards (1-2 sentences) */
  excerpt: string
  /** Full article content in markdown */
  content: string
  /** External source URL, null for original content */
  url: string | null
  /** Article category */
  category: NewsCategory
  /** Searchable tags (e.g. "claude", "anthropic", "agents") */
  tags: string[]
  /** URL to the article thumbnail image */
  thumbnailUrl: string | null
  /** Author name */
  author: string
  /** Total number of upvotes */
  voteCount: number
  /** Total number of comments */
  commentCount: number
  /** Slug of the lab created from this article, null if no lab exists */
  labSlug: string | null
  /** Whether this article is editorially featured */
  isFeatured: boolean
  /** Publication status */
  status: "draft" | "published" | "archived"
  /** When the article was published */
  publishedAt: Date
  /** Calculated hotness score for "hot" sorting */
  hotnessScore: number
  /** When the article was created */
  createdAt: Date
  /** When the article was last updated */
  updatedAt: Date
}

/** A user's upvote on a news article */
export interface NewsVote {
  /** Unique identifier */
  id: string
  /** Article that was voted on */
  articleId: string
  /** User who voted */
  userId: string
  /** When the vote was cast */
  createdAt: Date
}

/** A comment on a news article (supports threading via parentId) */
export interface NewsComment {
  /** Unique identifier */
  id: string
  /** Article the comment belongs to */
  articleId: string
  /** User who wrote the comment */
  userId: string
  /** Parent comment ID for threaded replies, null for top-level comments */
  parentId: string | null
  /** Comment body text */
  body: string
  /** When the comment was created */
  createdAt: Date
  /** When the comment was last updated */
  updatedAt: Date
  /** Display name of the commenter */
  userName: string
  /** Avatar URL of the commenter */
  userAvatar: string | null
}
