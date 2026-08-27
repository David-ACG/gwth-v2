/**
 * Regression tests for the hardened progress actions (gwth-launch-va6, N2
 * security).
 *
 * Two properties under test:
 *  1. `updateLessonProgressAction` forwards ONLY the whitelisted client
 *     fields — an authenticated curl can no longer write
 *     `bestQuizScore: 100, quizPassed: true` (or any quiz/completion field)
 *     straight into the progress row.
 *  2. `submitQuizAnswersAction` computes the quiz outcome SERVER-SIDE from
 *     the `quiz_questions` answer key, persists the computed fields itself,
 *     and only reveals the key + explanations in its response (after
 *     submission).
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const dataLayer = vi.hoisted(() => ({
  updateLessonProgress: vi.fn(),
  getLessonProgress: vi.fn(),
}))

const lessonsLayer = vi.hoisted(() => ({
  getQuizQuestionsByLessonId: vi.fn(),
}))

vi.mock("@/lib/data/progress", () => ({
  updateLessonProgress: dataLayer.updateLessonProgress,
  getLessonProgress: dataLayer.getLessonProgress,
}))

vi.mock("@/lib/data/lessons", () => ({
  getQuizQuestionsByLessonId: lessonsLayer.getQuizQuestionsByLessonId,
}))

import {
  submitQuizAnswersAction,
  updateLessonProgressAction,
} from "./progress"
import { QUIZ_PASS_SCORE } from "@/lib/progress/completion"

const LESSON_ID = "m1_l01"

/** Two-question fixture with the answer key (server-side only). */
const QUESTIONS = [
  {
    id: "q1",
    question: "What should your first tool be?",
    options: ["A portfolio piece", "A pocket knife"],
    correctOptionIndex: 1,
    explanation: "Small and specific to your own week.",
  },
  {
    id: "q2",
    question: "Where should the output land?",
    options: ["A new tab", "A place you already look"],
    correctOptionIndex: 1,
    explanation: "Meet yourself where you already are.",
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  dataLayer.updateLessonProgress.mockImplementation(
    async (lessonId: string, update: Record<string, unknown>) => ({
      lessonId,
      ...update,
    })
  )
  dataLayer.getLessonProgress.mockResolvedValue(null)
  lessonsLayer.getQuizQuestionsByLessonId.mockResolvedValue(QUESTIONS)
})

describe("updateLessonProgressAction whitelist", () => {
  it("drops forged quiz and completion fields entirely", async () => {
    await updateLessonProgressAction(LESSON_ID, {
      progress: 0.5,
      // A hostile payload: every one of these must be stripped before the
      // data layer sees the update.
      bestQuizScore: 100,
      quizScore: 100,
      quizPassed: true,
      quizAttempts: 99,
      isCompleted: true,
      completedAt: new Date(),
      timeSpent: 123456,
    } as never)

    expect(dataLayer.updateLessonProgress).toHaveBeenCalledTimes(1)
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID, {
      progress: 0.5,
    })
  })

  it("passes both legitimate fractions through, clamped to 0..1", async () => {
    await updateLessonProgressAction(LESSON_ID, {
      progress: 7,
      introVideoProgress: -3,
    })
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID, {
      progress: 1,
      introVideoProgress: 0,
    })
  })

  it("drops non-numeric and non-finite values instead of persisting them", async () => {
    await updateLessonProgressAction(LESSON_ID, {
      progress: Number.NaN,
      introVideoProgress: "0.9",
    } as never)
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID, {})
  })
})

describe("submitQuizAnswersAction server grading", () => {
  it("grades against the DB answer key and persists the computed outcome", async () => {
    const result = await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 0 })

    // One of two correct = 50%, below the pass mark.
    expect(result.score).toBe(50)
    expect(result.passed).toBe(false)
    expect(result.passMark).toBe(QUIZ_PASS_SCORE)

    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID, {
      quizScore: 50,
      bestQuizScore: 50,
      quizPassed: false,
      quizAttempts: 1,
    })
  })

  it("passes a perfect run and derives quizPassed from the score", async () => {
    const result = await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID, {
      quizScore: 100,
      bestQuizScore: 100,
      quizPassed: true,
      quizAttempts: 1,
    })
  })

  it("keeps the best score and increments attempts from the persisted row", async () => {
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      bestQuizScore: 100,
      quizAttempts: 2,
    })
    await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 0 })
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID, {
      quizScore: 50,
      bestQuizScore: 100,
      quizPassed: true,
      quizAttempts: 3,
    })
  })

  it("reveals the key and explanation only in the grading response", async () => {
    const result = await submitQuizAnswersAction(LESSON_ID, { q1: 1 })
    expect(result.perQuestion).toEqual([
      {
        questionId: "q1",
        correct: true,
        correctOptionIndex: 1,
        explanation: "Small and specific to your own week.",
      },
      {
        questionId: "q2",
        correct: false,
        correctOptionIndex: 1,
        explanation: "Meet yourself where you already are.",
      },
    ])
  })

  it("ignores unknown question ids and non-integer answers", async () => {
    const result = await submitQuizAnswersAction(LESSON_ID, {
      q1: 1.0000001,
      injected: 1,
    } as never)
    expect(result.score).toBe(0)
  })

  it("refuses to grade a lesson with no quiz", async () => {
    lessonsLayer.getQuizQuestionsByLessonId.mockResolvedValue([])
    await expect(submitQuizAnswersAction(LESSON_ID, {})).rejects.toThrow(
      /no quiz/
    )
    expect(dataLayer.updateLessonProgress).not.toHaveBeenCalled()
  })
})
