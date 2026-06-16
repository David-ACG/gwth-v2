import type { LessonProgress } from "@/lib/types"

export const INTRO_VIDEO_COMPLETION_THRESHOLD = 0.8
export const QUIZ_PASS_SCORE = 67

export type LessonCompletionInput = {
  hasIntroVideo: boolean
  questionCount: number
  introVideoProgress?: number | null
  bestQuizScore?: number | null
}

export type LessonCompletionStatus = {
  videoComplete: boolean
  quizPassed: boolean
  canComplete: boolean
  missingReasons: string[]
}

export function hasPassedQuiz(score: number | null | undefined): boolean {
  return typeof score === "number" && score >= QUIZ_PASS_SCORE
}

export function getLessonCompletionStatus(
  input: LessonCompletionInput
): LessonCompletionStatus {
  const videoComplete =
    !input.hasIntroVideo ||
    (input.introVideoProgress ?? 0) >= INTRO_VIDEO_COMPLETION_THRESHOLD
  const quizPassed =
    input.questionCount === 0 || hasPassedQuiz(input.bestQuizScore)

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
