/**
 * Types for the Pipeline-to-Site lesson bridge.
 * These represent the data format exchanged between the GWTH Pipeline
 * (content producer) and GWTH V2 site (content consumer).
 *
 * The pipeline assembler outputs JSON matching the shared schema at
 * schemas/lesson.schema.json. The admin import API validates and transforms
 * this data into the site's internal Lesson type.
 */

import type { Lesson, QuizQuestion, Resource } from "@/lib/types"

// ─── Pipeline Import Format ──────────────────────────────────────────────────

/**
 * The JSON format output by the pipeline's lesson_assembler.py.
 * Extends the site's Lesson interface with pipeline-specific metadata.
 * All dates are ISO-8601 strings (not Date objects) for JSON serialization.
 */
export interface PipelineLessonPayload {
  /** Lesson ID matching site format (e.g. 'm1_l01') */
  id: string
  /** URL-safe slug derived from title */
  slug: string
  /** Full lesson title */
  title: string
  /** Brief description */
  description: string
  /** Display order within the section (1-indexed on site) */
  order: number
  /** Duration in minutes */
  duration: number
  /** Difficulty level (lowercase) */
  difficulty: "beginner" | "intermediate" | "advanced"
  /** Content category (mapped from pipeline's 'primitive' field) */
  category: string
  /** Parent section ID (e.g. 'm1_w1') */
  sectionId: string
  /** Section display title (e.g. 'Week 1: Quick Wins & Foundations') */
  sectionTitle?: string
  /** Section display order */
  sectionOrder?: number
  /** Course ID — always 'course_gwth' */
  courseId: string
  /** Course slug — always 'applied-ai-skills' */
  courseSlug: string
  /** Month number (1, 2, or 3) */
  month: 1 | 2 | 3
  /** Whether this is an optional lesson */
  isOptional?: boolean
  /** Optional track label */
  optionalTrack?: string | null

  // Content
  /** URL to intro video (null until uploaded to CDN) */
  introVideoUrl: string | null
  /** Main lesson markdown with custom callout syntax */
  learnContent: string
  /** URL to audio narration (null until uploaded) */
  audioFileUrl: string | null
  /** Audio duration in seconds */
  audioDuration: number | null
  /** URL to build-along video */
  buildVideoUrl: string | null
  /** Build/project instructions markdown */
  buildInstructions: string | null

  // Quiz & resources
  /** Structured quiz questions */
  questions: QuizQuestion[]
  /** Supplementary resources */
  resources: Resource[]

  // Status & metadata
  /** Default publish status */
  status: "locked" | "available" | "in-progress" | "completed"
  /** Learning objectives from syllabus */
  objectives?: string[]
  /** Searchable tags */
  tags?: string[]
  /** Prerequisite lesson titles */
  prerequisites?: string[]

  // Pipeline-specific
  /** Original UUID from pipeline syllabus.json */
  pipelineId?: string | null
  /** Pipeline-side status at export time */
  pipelineStatus?: "draft" | "in_progress" | "review" | "published" | "exported" | null
  /** When this lesson was exported from the pipeline */
  exportedAt?: string | null

  // Timestamps as ISO strings
  createdAt?: string
  updatedAt?: string
}

/**
 * Batch import request payload for the admin API.
 */
export interface PipelineImportRequest {
  /** Array of lessons to import */
  lessons: PipelineLessonPayload[]
  /** Whether to overwrite existing lessons (default: true) */
  overwrite?: boolean
  /** API key for authentication */
  apiKey: string
}

/**
 * Response from a single lesson import operation.
 */
export interface PipelineImportResult {
  /** Lesson ID that was imported */
  lessonId: string
  /** Whether the import succeeded */
  success: boolean
  /** Error message if import failed */
  error?: string
  /** Number of quiz questions imported */
  questionsCount: number
  /** Number of resources imported */
  resourcesCount: number
}

/**
 * Response from the batch import API.
 */
export interface PipelineImportResponse {
  /** Total lessons processed */
  total: number
  /** Number successfully imported */
  successful: number
  /** Number that failed */
  failed: number
  /** Individual results */
  results: PipelineImportResult[]
}

// ─── Conversion Utilities ────────────────────────────────────────────────────

/**
 * Converts a PipelineLessonPayload to the site's internal Lesson type.
 * Handles date string → Date conversion and any field normalization.
 */
export function pipelinePayloadToLesson(payload: PipelineLessonPayload): Lesson {
  return {
    id: payload.id,
    slug: payload.slug,
    title: payload.title,
    description: payload.description,
    order: payload.order,
    duration: payload.duration,
    difficulty: payload.difficulty,
    category: payload.category,
    sectionId: payload.sectionId,
    courseId: payload.courseId,
    courseSlug: payload.courseSlug,
    month: payload.month,
    isOptional: payload.isOptional,
    optionalTrack: payload.optionalTrack ?? undefined,
    introVideoUrl: payload.introVideoUrl,
    learnContent: payload.learnContent,
    audioFileUrl: payload.audioFileUrl,
    audioDuration: payload.audioDuration,
    buildVideoUrl: payload.buildVideoUrl,
    buildInstructions: payload.buildInstructions,
    questions: payload.questions,
    resources: payload.resources,
    status: payload.status,
    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
    updatedAt: payload.updatedAt ? new Date(payload.updatedAt) : new Date(),
  }
}
