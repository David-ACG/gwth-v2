/**
 * Application-wide configuration constants.
 * All magic numbers, layout dimensions, animation defaults, and feature flags
 * are centralized here to avoid scattering them across components.
 */

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

// ─── Feature Flags ────────────────────────────────────────────────────────────

/** Whether the search palette (Cmd+K) is enabled */
export const ENABLE_SEARCH = true

/** Whether study streak tracking is enabled */
export const ENABLE_STREAKS = true

/** Whether the notes panel is enabled */
export const ENABLE_NOTES = true

/** Whether certificate generation is enabled */
export const ENABLE_CERTIFICATES = false
