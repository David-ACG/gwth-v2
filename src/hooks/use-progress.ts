"use client"

import { useOptimistic, useTransition } from "react"
import { updateLessonProgress } from "@/lib/data/progress"
import { createEmptyLessonProgress, hasPassedQuiz } from "@/lib/progress/completion"
import type { LessonProgress } from "@/lib/types"

/**
 * Provides optimistic UI updates for lesson progress tracking.
 * Uses React 19's useOptimistic for instant feedback while
 * the server-side update completes in the background.
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

  /** Marks a lesson as completed with optimistic UI update */
  function markComplete(lessonId: string) {
    setOptimisticProgress({
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
      progress: 1,
    })
    startTransition(async () => {
      await updateLessonProgress(lessonId, {
        isCompleted: true,
        completedAt: new Date(),
        progress: 1,
      })
    })
  }

  /** Updates quiz score with optimistic UI */
  function submitQuizScore(lessonId: string, score: number) {
    const bestQuizScore = Math.max(score, optimisticProgress?.bestQuizScore ?? 0)
    setOptimisticProgress({
      lessonId,
      quizScore: score,
      bestQuizScore,
      quizPassed: hasPassedQuiz(bestQuizScore),
      quizAttempts: (optimisticProgress?.quizAttempts ?? 0) + 1,
    })
    startTransition(async () => {
      const persistedBestScore = Math.max(score, initialProgress?.bestQuizScore ?? 0)
      await updateLessonProgress(lessonId, {
        quizScore: score,
        bestQuizScore: persistedBestScore,
        quizPassed: hasPassedQuiz(persistedBestScore),
        quizAttempts: (initialProgress?.quizAttempts ?? 0) + 1,
      })
    })
  }

  /** Updates intro video progress with optimistic UI */
  function updateIntroVideoProgress(lessonId: string, progress: number) {
    const boundedProgress = Math.max(0, Math.min(1, progress))
    setOptimisticProgress({ lessonId, introVideoProgress: boundedProgress })
    startTransition(async () => {
      await updateLessonProgress(lessonId, {
        introVideoProgress: boundedProgress,
      })
    })
  }

  return {
    progress: optimisticProgress,
    isPending,
    markComplete,
    submitQuizScore,
    updateIntroVideoProgress,
  }
}
