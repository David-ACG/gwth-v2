/**
 * Pure quiz grading + reveal policy, shared by the grading action and the
 * lesson page (bead gwth-launch-8ta).
 *
 * `submitQuizAnswersAction` grades a live submission with these functions,
 * and the lesson page uses the SAME functions to rebuild the learner's saved
 * attempt from `lesson_progress.quiz_answers` when they come back to a lesson.
 * Sharing them is the point: a returning learner is shown exactly the verdicts
 * and reveal the grading action would have given them for those answers, and
 * never a key the reveal policy withholds.
 *
 * No I/O here: the callers load the answer key and the progress row.
 */
import type {
  LessonProgress,
  QuizQuestion,
  QuizQuestionGrade,
  SavedQuizAttempt,
} from "@/lib/types"

/**
 * Keeps ONLY integer choices within each KNOWN question's option range (QA
 * round-1 defect 6). An unknown key or out-of-range choice was never a
 * correct answer, so grading is unchanged; the stored audit trail stays
 * bounded in key count and value range.
 */
export function sanitizeQuizAnswers(
  questions: QuizQuestion[],
  answers: Record<string, unknown> | null | undefined
): Record<string, number> {
  const sanitized: Record<string, number> = {}
  for (const q of questions) {
    const chosen = answers?.[q.id]
    if (
      typeof chosen === "number" &&
      Number.isInteger(chosen) &&
      chosen >= 0 &&
      chosen < q.options.length
    ) {
      sanitized[q.id] = chosen
    }
  }
  return sanitized
}

/**
 * Grades sanitized answers against the key. Returns the FULL per-question
 * verdicts (key and explanation included) and the 0..100 score; apply
 * `applyRevealPolicy` before anything reaches a client.
 */
export function gradeQuizAnswers(
  questions: QuizQuestion[],
  answers: Record<string, number>
): { graded: QuizQuestionGrade[]; score: number } {
  const graded = questions.map((q) => {
    const chosen = answers[q.id]
    const correct =
      typeof chosen === "number" && chosen === q.correctOptionIndex
    return {
      questionId: q.id,
      correct,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
    }
  })
  const correctCount = graded.filter((p) => p.correct).length
  const score =
    questions.length === 0
      ? 0
      : Math.round((correctCount / questions.length) * 100)
  return { graded, score }
}

/**
 * True once no further grading can change the record: passed, or the final
 * attempt spent. Only then may a WRONG answer's key be revealed (QA round-2
 * defect 2; round-3 defect 8).
 */
export function isQuizClosed(
  progress: Pick<LessonProgress, "quizPassed" | "quizAttempts"> | null,
  maxAttempts: number
): boolean {
  if (!progress) return false
  return (
    progress.quizPassed === true || (progress.quizAttempts ?? 0) >= maxAttempts
  )
}

/**
 * The reveal policy: a correct answer keeps its verdict and explanation; a
 * wrong one carries its key only when `revealAll` (the quiz is closed), so no
 * revealed key can ever be fed back into a grading request.
 */
export function applyRevealPolicy(
  graded: QuizQuestionGrade[],
  revealAll: boolean
): QuizQuestionGrade[] {
  return graded.map((g) =>
    g.correct || revealAll ? g : { questionId: g.questionId, correct: false }
  )
}

/**
 * Rebuilds the learner's saved, graded attempt from their progress row so a
 * returning learner sees their answers as answered (bead gwth-launch-8ta:
 * "He had to redo all the answers").
 *
 * `quiz_answers` holds the answer set behind the STANDING best score, so the
 * rebuilt attempt is that one, shown with the best score and the persisted
 * pass verdict. Returns null when there is nothing to show: no row, no stored
 * answers (a row graded before migration 016), or no answer that still maps
 * onto a current question.
 */
export function rebuildSavedQuizAttempt({
  questions,
  progress,
  passMark,
  maxAttempts,
}: {
  /** The lesson's FULL quiz rows (answer key included), server-side only. */
  questions: QuizQuestion[]
  /** The learner's persisted progress row for this lesson. */
  progress: LessonProgress | null
  /** The effective edition's pass mark. */
  passMark: number
  /** The server-enforced attempt cap. */
  maxAttempts: number
}): SavedQuizAttempt | null {
  if (!progress?.quizAnswers || questions.length === 0) return null
  const answers = sanitizeQuizAnswers(questions, progress.quizAnswers)
  if (Object.keys(answers).length === 0) return null

  const { graded, score } = gradeQuizAnswers(questions, answers)
  const passed = progress.quizPassed ?? score >= passMark
  return {
    answers,
    grade: {
      score: progress.bestQuizScore ?? score,
      passed,
      passMark,
      perQuestion: applyRevealPolicy(
        graded,
        isQuizClosed(progress, maxAttempts)
      ),
      progress,
    },
  }
}
