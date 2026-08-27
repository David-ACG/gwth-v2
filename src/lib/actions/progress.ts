"use server"

/**
 * Server Actions for lesson-progress mutations (W7, hardened under N2
 * security / gwth-launch-va6).
 *
 * Called from Client Components (the `useProgress` hook) and run on the server.
 * The data layer (`@/lib/data/progress`) reaches the DB and reads auth cookies,
 * so it cannot be imported into a client bundle directly — this action is the
 * client-callable boundary. Per-user scoping is enforced inside the data layer
 * via `getCurrentUser()`; unauthenticated calls are a safe no-op there.
 *
 * TRUST BOUNDARY: everything arriving here is attacker-controlled. The
 * update action therefore forwards ONLY the whitelisted fields the UI
 * legitimately sends (watch fraction and reading fraction), and every quiz
 * outcome (`quizScore`, `bestQuizScore`, `quizPassed`, `quizAttempts`) is
 * computed exclusively by `submitQuizAnswersAction`, which grades the
 * learner's answers against the `quiz_questions` rows server-side. Before
 * this hardening an authenticated curl could write `bestQuizScore: 100,
 * quizPassed: true` directly, and `mergeLessonProgress` recomputed the
 * completion gate FROM that forged best score, so the verified-record
 * positioning rested on client honesty.
 */
import { QUIZ_PASS_SCORE, hasPassedQuiz } from "@/lib/progress/completion"
import {
  getLessonProgress,
  updateLessonProgress as updateLessonProgressData,
} from "@/lib/data/progress"
import { getQuizQuestionsByLessonId } from "@/lib/data/lessons"
import type { LessonProgress, QuizGradeResult } from "@/lib/types"

/**
 * The only fields a client may write directly, each a fraction the UI
 * observes locally (video watched, page read). Quiz fields are deliberately
 * absent — see `submitQuizAnswersAction`. `isCompleted`/`completedAt` are
 * absent because the data layer recomputes them from the merged state via
 * `isLessonComplete()` regardless of what a caller sends.
 */
export type LessonProgressClientUpdate = {
  /** Overall lesson progress fraction, clamped to 0..1 */
  progress?: number
  /** Intro-video watched fraction, clamped to 0..1 */
  introVideoProgress?: number
}

/** Clamps a client-supplied fraction to 0..1; non-finite values become null. */
function sanitizeFraction(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return Math.max(0, Math.min(1, value))
}

/**
 * Persists a partial lesson-progress update for the current user.
 * Returns the merged, completion-evaluated progress row.
 *
 * Only the whitelisted `LessonProgressClientUpdate` fields survive; anything
 * else in the payload (forged quiz outcomes included) is dropped before the
 * data layer sees it.
 */
export async function updateLessonProgressAction(
  lessonId: string,
  update: LessonProgressClientUpdate
): Promise<LessonProgress> {
  const safe: Partial<LessonProgress> = {}

  const progress = sanitizeFraction(update?.progress)
  if (progress !== null) safe.progress = progress

  const introVideoProgress = sanitizeFraction(update?.introVideoProgress)
  if (introVideoProgress !== null) safe.introVideoProgress = introVideoProgress

  return updateLessonProgressData(lessonId, safe)
}

/**
 * Grades a quiz submission SERVER-SIDE and persists the outcome
 * (gwth-launch-va6).
 *
 * @param lessonId The lesson whose quiz is being submitted.
 * @param answers Map of question id to the chosen option index. Unanswered
 *   or unknown question ids simply grade as wrong; extra keys are ignored.
 * @returns The graded result, including the post-submission answer reveal
 *   (correct option + explanation per question) so the UI can show feedback
 *   without the key ever having been in its props.
 *
 * The score, best score, pass verdict and attempt count are all computed
 * here from the `quiz_questions` answer key and the user's existing row —
 * the client's numbers are never consulted. Unauthenticated calls grade
 * honestly but persist nothing (the data layer's safe no-op), matching the
 * behaviour of every other progress write.
 */
export async function submitQuizAnswersAction(
  lessonId: string,
  answers: Record<string, number>
): Promise<QuizGradeResult> {
  const questions = await getQuizQuestionsByLessonId(lessonId)
  if (questions.length === 0) {
    throw new Error(`Lesson ${lessonId} has no quiz to grade`)
  }

  const perQuestion = questions.map((q) => {
    const chosen = answers?.[q.id]
    const correct =
      typeof chosen === "number" &&
      Number.isInteger(chosen) &&
      chosen === q.correctOptionIndex
    return {
      questionId: q.id,
      correct,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
    }
  })

  const correctCount = perQuestion.filter((p) => p.correct).length
  const score = Math.round((correctCount / questions.length) * 100)

  const existing = await getLessonProgress(lessonId)
  const bestQuizScore = Math.max(score, existing?.bestQuizScore ?? 0)

  const progress = await updateLessonProgressData(lessonId, {
    quizScore: score,
    bestQuizScore,
    quizPassed: hasPassedQuiz(bestQuizScore),
    quizAttempts: (existing?.quizAttempts ?? 0) + 1,
  })

  return {
    score,
    passed: score >= QUIZ_PASS_SCORE,
    passMark: QUIZ_PASS_SCORE,
    perQuestion,
    progress,
  }
}
