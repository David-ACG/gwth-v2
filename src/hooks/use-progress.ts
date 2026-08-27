"use client"

import { useOptimistic, useState, useTransition } from "react"
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
 * N2 security (gwth-launch-va6 / gwth-launch-avo): the client never computes
 * or submits quiz outcomes, and no stored fraction is client-writable. What
 * the client sends are REPORTS (watch fraction, raw quiz answers); every
 * persisted value comes back from the server, and each action's returned row
 * is folded into `serverProgress` so the hook's exposed `progress` reflects
 * what was actually credited/persisted rather than going stale (QA style
 * note: the old submitQuizAnswers pass-through never reconciled).
 */
export function useProgress(initialProgress: LessonProgress | null) {
  const [isPending, startTransition] = useTransition()

  // The last row the SERVER returned; the optimistic layer sits on top.
  const [serverProgress, setServerProgress] = useState(initialProgress)

  const [optimisticProgress, setOptimisticProgress] = useOptimistic(
    serverProgress,
    (_current, update: Partial<LessonProgress>) => {
      const lessonId = update.lessonId ?? _current?.lessonId
      if (!_current && !lessonId) return null
      return { ...(_current ?? createEmptyLessonProgress(lessonId!)), ...update }
    }
  )

  /**
   * Marks a lesson as completed with optimistic UI update. The request body
   * is EMPTY on purpose: completion is recomputed server-side from the
   * stored, verified gates, and the overall fraction is derived there too -
   * a client cannot claim either (gwth-launch-avo, QA round-2 defect 5).
   */
  function markComplete(lessonId: string) {
    setOptimisticProgress({
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
      progress: 1,
    })
    startTransition(async () => {
      const row = await updateLessonProgressAction(lessonId, {})
      setServerProgress(row)
    })
  }

  /**
   * Submits the learner's answers for server-side grading and returns the
   * graded result (score, pass verdict, and the post-submission reveal the
   * server chose to include), or the server's attempt-limit refusal once
   * MAX_QUIZ_ATTEMPTS is used up. A graded result's persisted row is folded
   * into the hook's progress; a refusal changes nothing.
   */
  async function submitQuizAnswers(
    lessonId: string,
    answers: Record<string, number>
  ): Promise<QuizSubmitResult> {
    const result = await submitQuizAnswersAction(lessonId, answers)
    if (!("attemptLimitReached" in result)) {
      setServerProgress(result.progress)
    }
    return result
  }

  /**
   * Reports intro-video watch progress. The server CREDITS the report
   * against banked wall-clock time, so the persisted fraction may lag the
   * optimistic one; the returned row is what was actually credited.
   */
  function updateIntroVideoProgress(lessonId: string, progress: number) {
    const boundedProgress = Math.max(0, Math.min(1, progress))
    setOptimisticProgress({ lessonId, introVideoProgress: boundedProgress })
    startTransition(async () => {
      const row = await updateLessonProgressAction(lessonId, {
        introVideoProgress: boundedProgress,
      })
      setServerProgress(row)
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
