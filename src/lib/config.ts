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

/** Monthly price during the 3-month course (USD) */
export const COURSE_MONTHLY_PRICE = 37.5

/** Monthly price for ongoing access after course completion (USD) */
export const ONGOING_MONTHLY_PRICE = 7.5

/** Number of days in the grace period after a payment failure */
export const GRACE_PERIOD_DAYS = 14

/** Days at which payment reminder emails are sent during grace period */
export const PAYMENT_REMINDER_DAYS = [1, 7, 12] as const

/** Total number of course months */
export const TOTAL_COURSE_MONTHS = 3

/** Points earned per completed lesson */
export const POINTS_PER_LESSON = 1.5

/** Score decay period — days after content update before score starts decaying */
export const SCORE_DECAY_DAYS = 14

/** Estimated hours of new content added per month (ongoing subscribers) */
export const ONGOING_NEW_CONTENT_HOURS = 5

/** Total optional lessons available across Months 2 & 3 */
export const TOTAL_OPTIONAL_LESSONS = 30

/** Total mandatory lessons across all 3 months */
export const TOTAL_MANDATORY_LESSONS = 64

/** Total course cost for 3 months (USD) */
export const TOTAL_COURSE_COST = COURSE_MONTHLY_PRICE * TOTAL_COURSE_MONTHS

// ─── Course Structure ────────────────────────────────────────────────────────

/** Configuration for each month of the course */
export const MONTH_CONFIGS: MonthConfig[] = [
  {
    month: 1,
    title: "From Zero to Building",
    subtitle: "AI for Your Life",
    description:
      "Go from your first AI conversation to building real, working tools — apps, websites, dashboards, research projects, content packages, AI assistants, and automations — by typing plain English descriptions of what you want.",
    mandatoryLessons: 24,
    optionalLessons: 0,
    capstoneName: "Family AI Bot",
    capstoneDomain: "familyaibot.com",
    capstoneDescription:
      "Record your weekly family meeting. AI transcribes it, extracts tasks, books calendar events, creates a meal plan, and generates a shopping list. Automatically.",
  },
  {
    month: 2,
    title: "Building Real Apps",
    subtitle: "AI for Your Industry",
    description:
      "Build for the real world. Choose your industry — healthcare, legal, finance, travel, creative, marketing, or HR — and build applications that solve actual problems in that field.",
    mandatoryLessons: 20,
    optionalLessons: 15,
    capstoneName: "AI Customer-Support Chatbot",
    capstoneDomain: "askmyco.com",
    capstoneDescription:
      "A production-grade chatbot trained on real business data. The kind of thing companies pay consultants thousands to build.",
  },
  {
    month: 3,
    title: "Enterprise AI & Multi-Agent Systems",
    subtitle: "AI Transformation",
    description:
      "Go from individual contributor to the person who can lead an AI transformation. Multi-agent systems. Self-hosted AI. Governance frameworks. The strategic layer that separates someone who uses AI from someone who deploys it.",
    mandatoryLessons: 20,
    optionalLessons: 15,
    capstoneName: "AI Readiness Assessment Tool",
    capstoneDomain: "askevery.one",
    capstoneDescription:
      "A working tool that evaluates any business's AI maturity and produces an actionable transformation roadmap.",
  },
]

// ─── Feature Flags ────────────────────────────────────────────────────────────

/** Whether the search palette (Cmd+K) is enabled */
export const ENABLE_SEARCH = true

/** Whether study streak tracking is enabled */
export const ENABLE_STREAKS = true

/** Whether the notes panel is enabled */
export const ENABLE_NOTES = true

/** Whether certificate generation is enabled */
export const ENABLE_CERTIFICATES = false

/** Whether the dev state switcher toolbar is shown (development only) */
export const ENABLE_DEV_TOOLBAR = process.env.NODE_ENV === "development"

// ─── News ────────────────────────────────────────────────────────────────────

/** Whether the news section is enabled */
export const ENABLE_NEWS = true

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
