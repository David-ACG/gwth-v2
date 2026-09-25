/**
 * Tests for the shared quiz grading + the saved-attempt rebuild a returning
 * learner is shown (bead gwth-launch-8ta).
 */
import { describe, expect, it } from "vitest"
import type { LessonProgress, QuizQuestion } from "@/lib/types"
import {
  applyRevealPolicy,
  gradeQuizAnswers,
  isQuizClosed,
  rebuildSavedQuizAttempt,
  sanitizeQuizAnswers,
} from "./quiz-grading"

const QUESTIONS: QuizQuestion[] = [
  { id: "q1", question: "One?", options: ["a", "b"], correctOptionIndex: 1, explanation: "b is right" },
  { id: "q2", question: "Two?", options: ["a", "b", "c"], correctOptionIndex: 2, explanation: "c is right" },
  { id: "q3", question: "Three?", options: ["a", "b"], correctOptionIndex: 0, explanation: "a is right" },
]

function row(overrides: Partial<LessonProgress> = {}): LessonProgress {
  return {
    lessonId: "l1",
    isCompleted: false,
    progress: 0,
    quizScore: null,
    bestQuizScore: null,
    quizPassed: false,
    quizAttempts: 0,
    timeSpent: 0,
    lastAccessedAt: new Date(),
    ...overrides,
  }
}

describe("sanitizeQuizAnswers", () => {
  it("keeps only integer choices in range for known questions", () => {
    expect(
      sanitizeQuizAnswers(QUESTIONS, { q1: 1, q2: 5, q3: 0.5, qX: 0 })
    ).toEqual({ q1: 1 })
    expect(sanitizeQuizAnswers(QUESTIONS, null)).toEqual({})
  })
})

describe("gradeQuizAnswers", () => {
  it("scores against the key and rounds to a whole percent", () => {
    const { score, graded } = gradeQuizAnswers(QUESTIONS, { q1: 1, q2: 2, q3: 1 })
    expect(score).toBe(67)
    expect(graded.map((g) => g.correct)).toEqual([true, true, false])
  })
})

describe("isQuizClosed / applyRevealPolicy", () => {
  it("closes on a pass or a spent cap", () => {
    expect(isQuizClosed(row({ quizPassed: true }), 3)).toBe(true)
    expect(isQuizClosed(row({ quizAttempts: 3 }), 3)).toBe(true)
    expect(isQuizClosed(row({ quizAttempts: 1 }), 3)).toBe(false)
    expect(isQuizClosed(null, 3)).toBe(false)
  })

  it("withholds a wrong answer's key while the quiz is open", () => {
    const { graded } = gradeQuizAnswers(QUESTIONS, { q1: 0, q2: 2, q3: 0 })
    expect(applyRevealPolicy(graded, false)[0]).toEqual({ questionId: "q1", correct: false })
    expect(applyRevealPolicy(graded, true)[0]).toMatchObject({ correctOptionIndex: 1 })
  })
})

describe("rebuildSavedQuizAttempt", () => {
  it("returns null when there are no saved answers", () => {
    expect(
      rebuildSavedQuizAttempt({ questions: QUESTIONS, progress: row(), passMark: 67, maxAttempts: 3 })
    ).toBeNull()
    expect(
      rebuildSavedQuizAttempt({ questions: QUESTIONS, progress: null, passMark: 67, maxAttempts: 3 })
    ).toBeNull()
    expect(
      rebuildSavedQuizAttempt({
        questions: QUESTIONS,
        progress: row({ quizAnswers: { gone: 1 } }),
        passMark: 67,
        maxAttempts: 3,
      })
    ).toBeNull()
  })

  it("rebuilds a passed attempt with the persisted score and the full reveal", () => {
    const progress = row({
      quizAttempts: 1,
      quizScore: 67,
      bestQuizScore: 67,
      quizPassed: true,
      quizAnswers: { q1: 1, q2: 2, q3: 1 },
    })
    const saved = rebuildSavedQuizAttempt({ questions: QUESTIONS, progress, passMark: 67, maxAttempts: 3 })
    expect(saved?.answers).toEqual({ q1: 1, q2: 2, q3: 1 })
    expect(saved?.grade).toMatchObject({ score: 67, passed: true, passMark: 67 })
    // Closed quiz: the wrong answer's key is shown, as it was at submit time.
    expect(saved?.grade.perQuestion[2]).toMatchObject({ correct: false, correctOptionIndex: 0 })
  })

  it("never reveals a wrong answer's key while attempts remain", () => {
    const progress = row({
      quizAttempts: 1,
      quizScore: 33,
      bestQuizScore: 33,
      quizPassed: false,
      quizAnswers: { q1: 1, q2: 0, q3: 1 },
    })
    const saved = rebuildSavedQuizAttempt({ questions: QUESTIONS, progress, passMark: 67, maxAttempts: 3 })
    expect(saved?.grade.passed).toBe(false)
    expect(saved?.grade.perQuestion[1]).toEqual({ questionId: "q2", correct: false })
    expect(saved?.grade.perQuestion[2]).toEqual({ questionId: "q3", correct: false })
  })
})
