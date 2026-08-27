"use client"

import { useOptimistic, useTransition } from "react"
import {
  submitQuizAnswersAction,
  updateLessonProgressAction,
} from "@/lib/actions/progress"
import { createEmptyLessonProgress } from "@/lib/progress/completion"
import type { LessonProgress, QuizSubmitResult } from "@/lib/types"

/**
 * Provides optimistic UI updates for lesson progress tracking.
 * Uses React 19's useOptimistic for instant feedback while
 * the server-side update completes in the background.
 *
 * N2 security (gwth-launch-va6): the client never computes or submits quiz
 * outcomes any more. `submitQuizAnswers` sends the learner's raw answers to
 * `submitQuizAnswersAction`, which grades them against the DB answer key and
 * writes quizScore/bestQuizScore/quizPassed itself; the optimistic numbers
 * here are display-only.
 */
export function useProgress(initialProgress: LessonProgress | null) {
  const [isPending, startTransition] = useTransition()

  const [optimisticProgress, setOptimisticProgress] = useOptimistic(
    initialProgress,
    (_current, update: Partial<LessonProgress>) => {
      const lessonId = update.lessonId ?? _current?.lessonId
      if (!_current && !lessonId) return null
      return { ...(_current ?? createEmptyLessonProgress(lessonId!)), ...update }
    }
  )

  /**
   * Marks a lesson as completed with optimistic UI update. Only the progress
   * fraction is sent; the server recomputes `isCompleted`/`completedAt` from
   * the merged gates, so a client cannot claim completion it has not earned.
   */
  function markComplete(lessonId: string) {
    setOptimisticProgress({
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
      progress: 1,
    })
    startTransition(async () => {
      await updateLessonProgressAction(lessonId, { progress: 1 })
    })
  }

  /**
   * Submits the learner's answers for server-side grading and returns the
   * graded result (score, pass verdict, and the post-submission answer
   * reveal), or the server's attempt-limit refusal once MAX_QUIZ_ATTEMPTS
   * is used up. The persisted quiz fields come back on `result.progress`
   * for a graded result; a refusal writes (and returns) nothing new.
   */
  async function submitQuizAnswers(
    lessonId: string,
    answers: Record<string, number>
  ): Promise<QuizSubmitResult> {
    return submitQuizAnswersAction(lessonId, answers)
  }

  /** Updates intro video progress with optimistic UI */
  function updateIntroVideoProgress(lessonId: string, progress: number) {
    const boundedProgress = Math.max(0, Math.min(1, progress))
    setOptimisticProgress({ lessonId, introVideoProgress: boundedProgress })
    startTransition(async () => {
      await updateLessonProgressAction(lessonId, {
        introVideoProgress: boundedProgress,
      })
    })
  }

  return {
    progress: optimisticProgress,
    isPending,
    markComplete,
    submitQuizAnswers,
    updateIntroVideoProgress,
  }
}
