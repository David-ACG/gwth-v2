/**
 * Application-wide configuration constants.
 * All magic numbers, layout dimensions, animation defaults, and feature flags
 * are centralized here to avoid scattering them across components.
 */

import type { MonthConfig, NewsCategory, NewsSortOption } from "@/lib/types"

// ─── Layout Dimensions ────────────────────────────────────────────────────────

/** Sidebar width in pixels when fully expanded */
export const SIDEBAR_WIDTH = 280

/** Sidebar width in pixels when collapsed (icon-only mode) */
export const SIDEBAR_COLLAPSED_WIDTH = 64

/** Header height in pixels */
export const HEADER_HEIGHT = 64

/** Maximum width of the main content area in pixels */
export const CONTENT_MAX_WIDTH = 1400

// ─── Animation ────────────────────────────────────────────────────────────────

/** Default spring transition for Motion layout animations */
export const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
}

/** Default fade-in transition duration in seconds */
export const FADE_DURATION = 0.2

/** Stagger delay between children in list animations (seconds) */
export const STAGGER_DELAY = 0.05

/** Duration for progress ring/bar animations (seconds) */
export const PROGRESS_ANIMATION_DURATION = 0.8

// ─── Pagination & Limits ──────────────────────────────────────────────────────

/** Default number of items per page for paginated lists */
export const DEFAULT_PAGE_SIZE = 12

/** Maximum number of quiz attempts allowed per lesson */
export const MAX_QUIZ_ATTEMPTS = 3

/** Maximum number of notes a user can create per lesson */
export const MAX_NOTES_PER_LESSON = 50

// ─── Breakpoints ──────────────────────────────────────────────────────────────

/** Breakpoint (px) below which the sidebar becomes a sheet overlay */
export const MOBILE_BREAKPOINT = 768

/** Breakpoint (px) for tablet layouts */
export const TABLET_BREAKPOINT = 1024

// ─── App Metadata ─────────────────────────────────────────────────────────────

/** Application name used in metadata and UI */
export const APP_NAME = "GWTH.ai"

/** Application tagline */
export const APP_TAGLINE = "Learn to Build with AI"

/** Base URL for the production site */
export const APP_URL = "https://gwth.ai"

/** Support email address */
export const SUPPORT_EMAIL = "support@gwth.ai"

/** Teams/enterprise contact email */
export const TEAMS_EMAIL = "teams@gwth.ai"

// ─── Subscription & Pricing ──────────────────────────────────────────────────
// All prices are in GBP (£)

/** Monthly price during the 3-month course (GBP) */
export const COURSE_MONTHLY_PRICE = 29

/** Public label for the launch price; price may rise after beta/starter period */
export const COURSE_PRICE_LABEL = "Starter pricing"

/** Monthly price for ongoing access after course completion (GBP) */
export const ONGOING_MONTHLY_PRICE = 7.5

/** Number of days in the grace period after a payment failure */
export const GRACE_PERIOD_DAYS = 14

/** Days at which payment reminder emails are sent during grace period */
export const PAYMENT_REMINDER_DAYS = [1, 7, 12] as const

/** Total number of course months */
export const TOTAL_COURSE_MONTHS = 3

/** Points earned per completed lesson */
export const POINTS_PER_LESSON = 1.5

/** Days after a significant lesson update before the old lesson points decay */
export const SCORE_DECAY_DAYS = 14

/** Estimated hours of new content added per month (ongoing subscribers) */
export const ONGOING_NEW_CONTENT_HOURS = 5

/** Total course cost for 3 months (GBP) */
export const TOTAL_COURSE_COST = COURSE_MONTHLY_PRICE * TOTAL_COURSE_MONTHS

/** Whether marketing pages should prominently show the three-month total */
export const SHOW_TOTAL_COURSE_COST = false

/** Public GWTH Score percentile milestones for applied AI skill */
export const SCORE_PERCENTILE_MILESTONES = [
  { label: "Top 30%", description: "Complete Month 1" },
  { label: "Top 10%", description: "Complete Month 2 mandatory lessons" },
  { label: "Top 5%", description: "Complete Month 2 with most optional lessons" },
  { label: "Top 2%", description: "Complete Month 3 mandatory lessons" },
  { label: "Top 1%", description: "Complete Month 3 with most optional lessons" },
] as const

// ─── Course Structure ────────────────────────────────────────────────────────

/** Configuration for each month of the course */
export const MONTH_CONFIGS: MonthConfig[] = [
  {
    month: 1,
    // The month names and descriptions were rewritten in plain words for the
    // launch (launch readiness review, 2026-10-20): "the six primitives", "the
    // main spine", "the strategic layer" and "an actionable transformation
    // roadmap" were jargon a beginner could not decode, and the names are in
    // sentence case so every page that reads them uses one set.
    title: "From zero to building",
    subtitle: "AI for your own life and work",
    description:
      "Learn to get good results from AI tools, then build useful things with their help: a simple app or website, a dashboard, a research report, your own AI assistant and an automation for a regular task.",
    // The counts on every month follow the syllabus database (the pipeline's
    // v3 syllabus, the source of truth for lesson identity), re-counted on
    // 2026-10-20 for the launch readiness check: Month 1 is 22 core and 10
    // optional, Month 2 is 20 and 22 (with the HR, marketing and sales
    // lessons), Month 3 is 21 and 15. The pages had said 26 core in Month 1,
    // 66 core and 30 optional in all. Re-count when the syllabus changes.
    mandatoryLessons: 22,
    optionalLessons: 10,
    capstoneName: "Family AI Bot",
    capstoneDomain: "familyaibot.com",
    capstoneDescription:
      "Record your weekly family meeting, and AI turns it into a written record, a list of jobs, calendar events, a meal plan and a shopping list.",
  },
  {
    month: 2,
    title: "Building real apps",
    subtitle: "AI for business and consulting",
    description:
      "Go further with building: write code with an AI helper, connect tools into workflows, and make small apps for real business tasks. You also learn what you need to help other people use AI, for example as a consultant.",
    mandatoryLessons: 20,
    optionalLessons: 22,
    capstoneName: "AI customer support chatbot",
    capstoneDomain: "askmyco.com",
    // 2026-09-17 (bead gwth-launch-88z.32.36, marketing copy gate): this said
    // "A production-grade chatbot trained on real business data. The kind of
    // thing companies pay consultants thousands to build." Neither half was
    // supportable: nothing establishes what a company would pay a consultant,
    // and "production-grade" contradicts what the course pages say the project
    // is. The line now says what the project does, in the same words the
    // lesson and marketing copy use for it.
    capstoneDescription:
      "A working chatbot that answers from a company's own documents and shows where each answer came from.",
  },
  {
    month: 3,
    title: "Leading AI at work",
    subtitle: "AI across an organisation",
    description:
      "Learn to lead AI work in an organisation. You set up several AI assistants to share one job, run AI models on your own computer so data stays with you, and learn the rules and checks an organisation needs before it relies on AI.",
    mandatoryLessons: 21,
    optionalLessons: 15,
    capstoneName: "AI readiness assessment tool",
    capstoneDomain: "askevery.one",
    capstoneDescription:
      "A working tool that asks a business how it uses AI today and gives it a step-by-step plan for what to do next.",
  },
]

/**
 * Total mandatory lessons across all 3 months.
 *
 * Derived from {@link MONTH_CONFIGS} rather than hardcoded: it used to be a
 * standalone 64 and drifted out of step with the per-month numbers, so the
 * marketing pages and the course page disagreed (W26 defect 4).
 */
export const TOTAL_MANDATORY_LESSONS = MONTH_CONFIGS.reduce(
  (total, month) => total + month.mandatoryLessons,
  0
)

/** Total optional lessons across all 3 months, derived the same way. */
export const TOTAL_OPTIONAL_LESSONS = MONTH_CONFIGS.reduce(
  (total, month) => total + month.optionalLessons,
  0
)

/** Additional official capstones beyond the primary month card capstone */
export const ADDITIONAL_CAPSTONES = [
  {
    month: 2,
    name: "FractionalBuddy",
    description:
      "A second Month 2 capstone based on the real FractionalBuddy project: a practical AI consulting/productivity tool for fractional leaders and small-business advisory work.",
  },
] as const

// ─── Feature Flags ────────────────────────────────────────────────────────────

/** Whether the search palette (Cmd+K) is enabled */
export const ENABLE_SEARCH = true

/** Whether study streak tracking is enabled */
export const ENABLE_STREAKS = true

/** Whether the notes panel is enabled */
export const ENABLE_NOTES = true

/** Whether certificate generation is enabled */
export const ENABLE_CERTIFICATES = true

function envFlagEnabled(value: string | undefined): boolean {
  return ["1", "true", "yes", "on"].includes(value?.toLowerCase() ?? "")
}

/** Explicit billing kill-switch. Defaults off for the 23 June beta. */
export const ENABLE_BILLING = envFlagEnabled(process.env.BILLING_ENABLED)

/** Explicit GWTH Score feature flag. Defaults off for the 23 June beta. */
export const ENABLE_GWTH_SCORE = envFlagEnabled(process.env.GWTH_SCORE_ENABLED)

/** Whether the dev state switcher toolbar is shown (development only) */
export const ENABLE_DEV_TOOLBAR = process.env.NODE_ENV === "development"

/**
 * Route of the one live course. There is a single course during beta, so the
 * dashboard sidebar and the public nav both need this literal; keeping it here
 * stops the two drifting apart. When a second course exists this becomes a
 * lookup, and both call sites already read from one place.
 */
export const COURSE_PATH = "/course/applied-ai-skills"

// ─── News ────────────────────────────────────────────────────────────────────

/**
 * Whether the news section is enabled. Disabled 2026-06-12 (David's call:
 * the page was taking too long). Gates the nav and footer links, the
 * search-palette News group, and the route guards. The route directory is
 * also renamed to `src/app/(public)/_news` (underscore = excluded from
 * routing) so /news returns a real 404; to re-enable, rename it back to
 * `news` and flip this to true.
 */
export const ENABLE_NEWS = false

/** Number of news articles per page */
export const NEWS_PAGE_SIZE = 12

/** Default sort option for the news feed */
export const NEWS_DEFAULT_SORT: NewsSortOption = "hot"

/** Maximum comment body length */
export const NEWS_MAX_COMMENT_LENGTH = 2000

/** Category configuration for news articles — labels and Tailwind color classes */
export const NEWS_CATEGORIES: Record<
  NewsCategory,
  { label: string; color: string; bgColor: string }
> = {
  "ai-launch": {
    label: "AI Launch",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  research: {
    label: "Research",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  tool: {
    label: "Tool",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  industry: {
    label: "Industry",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  tutorial: {
    label: "Tutorial",
    color: "text-success",
    bgColor: "bg-success/10",
  },
}
