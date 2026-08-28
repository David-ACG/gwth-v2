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

// ─── Model Arena labs (the current lab format, David 2026-07-22) ──────────────

/**
 * One contestant in a Model Arena matchup: a named AI tool run on the shared
 * task, recorded with its exact model id so the test is checkable and dated.
 */
export interface ArenaContestant {
  /** Friendly product name, e.g. "Claude", "ChatGPT". */
  name: string
  /** Exact model id, never rounded, e.g. "claude-opus-4-8", "gpt-5.6-sol". */
  modelId: string
  /** Human model label, e.g. "Claude Opus 4.8". */
  modelLabel?: string
  /** Exactly how it was run, e.g. "Codex CLI 0.144.1 at high reasoning effort". */
  howRun: string
}

/** One contestant's verbatim answer to the shared prompt. */
export interface ArenaOutput {
  /** Which contestant produced it (matches {@link ArenaContestant.name}). */
  by: string
  /** The output exactly as generated. Never edited, trimmed or paraphrased. */
  verbatim: string
}

/** A single rubric criterion a beginner scores each output against. */
export interface ArenaRubricItem {
  /** A plain question the student answers for each output. */
  criterion: string
  /** One line on what a strong answer looks like. */
  goodLooksLike: string
}

/** The dated verdict for a matchup, always fair to the loser. */
export interface ArenaVerdict {
  /** Contestant name, or "Close" / "Tie". Honest, never rigged. */
  winner?: string
  /** The reasoned verdict, fair to the loser. */
  callText: string
  /** Reminder that models change, so this holds only for these versions/date. */
  freshnessNote: string
}

/**
 * A Model Arena lab: one realistic task, two AI models run head-to-head on the
 * same prompt, outputs shown verbatim side by side, a beginner rubric, and a
 * dated verdict. Deliberately perishable; superseded to the archive when models
 * change. Authored to `model-arena.schema.json` (launch task L23).
 */
export interface ModelArenaLab {
  /** Stable unique id, e.g. "arena_001". */
  id: string
  /** URL-friendly slug. */
  slug: string
  /** Discriminates this from the retired tiered-lab format. */
  format: "model-arena"
  /** Plain and specific: the task, then the matchup. */
  title: string
  /** live = one of the ~6 current labs; archived = superseded but kept. */
  status: "live" | "archived"
  /** Broad task area, e.g. "Writing", "HR", "Research", "Admin". */
  category?: string
  /** The date both outputs were generated (ISO yyyy-mm-dd). */
  testedOn: string
  /** One paragraph: who the student pretends to be, the task, why it matters. */
  brief: string
  /** Exactly two contestants. */
  matchup: [ArenaContestant, ArenaContestant]
  /** The single prompt given to BOTH models, verbatim and identical. */
  prompt: string
  /** Each contestant's real answer, verbatim, in the same order as matchup. */
  outputs: [ArenaOutput, ArenaOutput]
  /** 4-6 criteria a beginner can score by reading. */
  rubric: ArenaRubricItem[]
  /** The dated verdict. */
  verdict: ArenaVerdict
  /** Short numbered steps for the student to run the same task themselves. */
  tryItYourself: string[]
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

// ─── Note ─────────────────────────────────────────────────────────────────────

/** A personal annotation on a lesson */
export interface Note {
  /** Unique note identifier */
  id: string
  /** User who created the note */
  userId: string
  /** Lesson the note is attached to */
  lessonId: string
  /** Note content (markdown) */
  content: string
  /** Video timestamp in seconds (if note is tied to a video position) */
  timestamp: number | null
  /** When the note was created */
  createdAt: Date
  /** When the note was last updated */
  updatedAt: Date
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
