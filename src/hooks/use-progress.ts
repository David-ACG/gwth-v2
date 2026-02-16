"use client"

import { useOptimistic, useTransition } from "react"
import { updateLessonProgress } from "@/lib/data/progress"
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
      if (!_current) return null
      return { ..._current, ...update }
    }
  )

  /** Marks a lesson as completed with optimistic UI update */
  function markComplete(lessonId: string) {
    setOptimisticProgress({ isCompleted: true, progress: 1 })
    startTransition(async () => {
      await updateLessonProgress(lessonId, {
        isCompleted: true,
        progress: 1,
      })
    })
  }

  /** Updates quiz score with optimistic UI */
  function submitQuizScore(lessonId: string, score: number) {
    setOptimisticProgress({
      quizScore: score,
      bestQuizScore: Math.max(
        score,
        optimisticProgress?.bestQuizScore ?? 0
      ),
      quizAttempts: (optimisticProgress?.quizAttempts ?? 0) + 1,
    })
    startTransition(async () => {
      await updateLessonProgress(lessonId, {
        quizScore: score,
        bestQuizScore: Math.max(
          score,
          initialProgress?.bestQuizScore ?? 0
        ),
        quizAttempts: (initialProgress?.quizAttempts ?? 0) + 1,
      })
    })
  }

  return {
    progress: optimisticProgress,
    isPending,
    markComplete,
    submitQuizScore,
  }
}
