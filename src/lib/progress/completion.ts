import type { LessonProgress } from "@/lib/types"

export const INTRO_VIDEO_COMPLETION_THRESHOLD = 0.8

/**
 * The historic default pass mark. Since N6 the REAL pass mark is per
 * syllabus edition (`syllabus_edition.pass_mark`, decision 4 2026-08-28) and
 * is threaded by callers via the `passMark` parameters below; this constant
 * is the fallback that keeps the pre-edition behaviour (and the gwth-default
 * edition's seeded value) at 67.
 */
export const QUIZ_PASS_SCORE = 67

export type LessonCompletionInput = {
  hasIntroVideo: boolean
  questionCount: number
  introVideoProgress?: number | null
  bestQuizScore?: number | null
  /** Edition pass mark; defaults to QUIZ_PASS_SCORE when not threaded */
  passMark?: number
}

export type LessonCompletionStatus = {
  videoComplete: boolean
  quizPassed: boolean
  canComplete: boolean
  missingReasons: string[]
}

/**
 * Whether a score clears the pass mark. `passMark` is the effective
 * edition's value where the caller has it (N6); the default keeps every
 * legacy call site on the historic 67.
 */
export function hasPassedQuiz(
  score: number | null | undefined,
  passMark: number = QUIZ_PASS_SCORE
): boolean {
  return typeof score === "number" && score >= passMark
}

export function getLessonCompletionStatus(
  input: LessonCompletionInput
): LessonCompletionStatus {
  const videoComplete =
    !input.hasIntroVideo ||
    (input.introVideoProgress ?? 0) >= INTRO_VIDEO_COMPLETION_THRESHOLD
  const quizPassed =
    input.questionCount === 0 ||
    hasPassedQuiz(input.bestQuizScore, input.passMark)

  const missingReasons: string[] = []
  if (!videoComplete) missingReasons.push("Watch at least 80% of the intro video")
  if (!quizPassed) missingReasons.push("Pass the lesson Q&A")

  return {
    videoComplete,
    quizPassed,
    canComplete: videoComplete && quizPassed,
    missingReasons,
  }
}

/**
 * The single source of truth for "is this lesson complete?".
 *
 * A lesson is complete when the intro video is at least 80% watched AND the
 * lesson's Q&A gate has been passed. Partial states are incomplete:
 *   - video 80% but quiz failed → incomplete
 *   - quiz passed but video 60% → incomplete
 *
 * This works on a stored progress row (the shape the data layer reads/writes):
 * it trusts `quizPassed` if present, otherwise derives it from the best quiz
 * score, and reads the watched fraction from `introVideoProgress`.
 */
export function isLessonComplete(
  row: Pick<
    LessonProgress,
    "introVideoProgress" | "quizPassed" | "bestQuizScore"
  >
): boolean {
  const videoComplete =
    (row.introVideoProgress ?? 0) >= INTRO_VIDEO_COMPLETION_THRESHOLD
  const quizPassed = row.quizPassed ?? hasPassedQuiz(row.bestQuizScore)
  return videoComplete && quizPassed
}

/**
 * Server-side derivation of the overall lesson `progress` fraction (N2 QA
 * round-2 defect 5). The fraction is DERIVED from the two completion gates,
 * never accepted from a client: half for the verified watch fraction
 * (scaled so clearing the 80% gate fills the half), half for the quiz pass.
 * A complete lesson reads 1. The dashboard's "started" flag (`progress >
 * 0`) flips on the first credited watch report or quiz pass, exactly the
 * activities that are actually verified.
 */
export function deriveLessonFraction(
  row: Pick<
    LessonProgress,
    "introVideoProgress" | "quizPassed" | "bestQuizScore"
  >
): number {
  if (isLessonComplete(row)) return 1
  const videoHalf =
    Math.min((row.introVideoProgress ?? 0) / INTRO_VIDEO_COMPLETION_THRESHOLD, 1) *
    0.5
  const quizHalf =
    (row.quizPassed ?? hasPassedQuiz(row.bestQuizScore)) ? 0.5 : 0
  return Math.min(0.99, videoHalf + quizHalf)
}

export function createEmptyLessonProgress(lessonId: string): LessonProgress {
  return {
    lessonId,
    isCompleted: false,
    progress: 0,
    quizScore: null,
    bestQuizScore: null,
    quizAttempts: 0,
    timeSpent: 0,
    lastAccessedAt: new Date(),
    completedAt: null,
    introVideoProgress: 0,
    quizPassed: false,
  }
}
