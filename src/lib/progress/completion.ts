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
