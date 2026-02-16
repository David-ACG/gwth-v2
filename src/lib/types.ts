/**
 * Shared TypeScript interfaces for the GWTH learning platform.
 * These represent the domain model — how the UI thinks about data.
 * The actual storage/API shape may differ; the data layer maps between them.
 */

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
  /** Subscription plan tier */
  plan: "free" | "pro" | "team"
  /** When the user account was created */
  createdAt: Date
  /** When the user profile was last updated */
  updatedAt: Date
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

/** A hands-on lab exercise */
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

// ─── Progress ─────────────────────────────────────────────────────────────────

/** User's progress on a specific lesson */
export interface LessonProgress {
  /** Lesson ID */
  lessonId: string
  /** Whether the lesson is fully completed */
  isCompleted: boolean
  /** Progress fraction (0 to 1) */
  progress: number
  /** Latest quiz score (0 to 100), null if not attempted */
  quizScore: number | null
  /** Best quiz score achieved */
  bestQuizScore: number | null
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
  /** Date of last study activity */
  lastActiveDate: Date
  /** Last 7 days of activity (index 0 = 6 days ago, index 6 = today) */
  weeklyActivity: boolean[]
  /** Last 365 days of activity data for the heatmap */
  yearlyActivity: DayActivity[]
}

/** Activity data for a single day */
export interface DayActivity {
  /** The date */
  date: Date
  /** Number of items completed that day */
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
