/**
 * Regression tests for the hardened progress actions (gwth-launch-va6, N2
 * security; re-hardened after the N2 QA chain, gwth-launch-avo).
 *
 * Properties under test:
 *  1. `updateLessonProgressAction` forwards ONLY the whitelisted client
 *     fields — an authenticated curl can no longer write
 *     `bestQuizScore: 100, quizPassed: true` (or any quiz/completion field)
 *     straight into the progress row.
 *  2. The intro-video watch fraction is CREDITED against elapsed wall-clock
 *     time, so one forged write cannot claim a full watch (QA defect 3).
 *  3. `submitQuizAnswersAction` refuses callers without a valid session and
 *     content access BEFORE reading the answer key (QA defect 4).
 *  4. MAX_QUIZ_ATTEMPTS is enforced server-side from the persisted row, and
 *     a refusal carries NO answer reveal (QA defect 5).
 *  5. The quiz outcome persists through ONE atomic `recordQuizSubmission`
 *     call - never the old read-modify-write pair (QA defect 6).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const dataLayer = vi.hoisted(() => ({
  updateLessonProgress: vi.fn(),
  getLessonProgress: vi.fn(),
  recordQuizSubmission: vi.fn(),
}))

const lessonsLayer = vi.hoisted(() => ({
  getQuizQuestionsByLessonId: vi.fn(),
  getLessonMonthById: vi.fn(),
}))

const authLayer = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
}))

vi.mock("@/lib/data/progress", () => ({
  updateLessonProgress: dataLayer.updateLessonProgress,
  getLessonProgress: dataLayer.getLessonProgress,
  recordQuizSubmission: dataLayer.recordQuizSubmission,
}))

vi.mock("@/lib/data/lessons", () => ({
  getQuizQuestionsByLessonId: lessonsLayer.getQuizQuestionsByLessonId,
  getLessonMonthById: lessonsLayer.getLessonMonthById,
}))

vi.mock("@/lib/auth", () => ({
  getCurrentUser: authLayer.getCurrentUser,
  // Mirrors the real month gate closely enough for refusal tests: access up
  // to the user's subscription month.
  canUserAccessMonth: (
    user: { subscriptionMonth: number },
    month: number
  ) => month <= user.subscriptionMonth,
}))

import {
  submitQuizAnswersAction,
  updateLessonProgressAction,
} from "./progress"
import { QUIZ_PASS_SCORE } from "@/lib/progress/completion"
import { MAX_QUIZ_ATTEMPTS } from "@/lib/config"
import type { QuizGradeResult, QuizSubmitResult } from "@/lib/types"

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

const STUDENT = {
  id: "user_1",
  email: "student@example.com",
  subscriptionMonth: 3,
}

/** Narrows a submit result to the graded shape, failing the test otherwise. */
function asGrade(result: QuizSubmitResult): QuizGradeResult {
  if ("attemptLimitReached" in result) {
    throw new Error("expected a graded result, got the attempt-limit refusal")
  }
  return result
}

const ENV_KEYS = [
  "DATABASE_URL",
  "ENABLE_DEV_MOCK_USER",
  "PRIVATE_CONTENT_MODE",
  "CONTENT_ALLOWED_EMAILS",
] as const
const savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> =
  {}

beforeEach(() => {
  vi.clearAllMocks()
  for (const key of ENV_KEYS) savedEnv[key] = process.env[key]

  // Default: a real deployment with a real signed-in month-3 student and
  // content mode off (the launch state).
  process.env.DATABASE_URL = "postgresql://gwth:x@localhost:5443/gwth_v2"
  delete process.env.ENABLE_DEV_MOCK_USER
  process.env.PRIVATE_CONTENT_MODE = "off"
  delete process.env.CONTENT_ALLOWED_EMAILS

  authLayer.getCurrentUser.mockResolvedValue(STUDENT)
  lessonsLayer.getLessonMonthById.mockResolvedValue(1)
  lessonsLayer.getQuizQuestionsByLessonId.mockResolvedValue(QUESTIONS)

  dataLayer.updateLessonProgress.mockImplementation(
    async (lessonId: string, update: Record<string, unknown>) => ({
      lessonId,
      ...update,
    })
  )
  dataLayer.getLessonProgress.mockResolvedValue(null)
  dataLayer.recordQuizSubmission.mockImplementation(
    async (
      lessonId: string,
      score: number,
      opts: { passMark: number; maxAttempts: number }
    ) => ({
      outcome: "recorded",
      progress: {
        lessonId,
        quizScore: score,
        bestQuizScore: score,
        quizPassed: score >= opts.passMark,
        quizAttempts: 1,
      },
    })
  )
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = savedEnv[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
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

describe("intro-video watch crediting (QA defect 3)", () => {
  it("grants a forged full-watch first write only the bootstrap credit", async () => {
    dataLayer.getLessonProgress.mockResolvedValue(null)
    await updateLessonProgressAction(LESSON_ID, { introVideoProgress: 1 })
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID, {
      introVideoProgress: 0.15,
    })
  })

  it("credits by elapsed wall-clock time since the last write", async () => {
    // 9 seconds at the 2x/90s allowance earns 0.2 of the video.
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      introVideoProgress: 0.5,
      lastAccessedAt: new Date(Date.now() - 9_000),
    })
    await updateLessonProgressAction(LESSON_ID, { introVideoProgress: 1 })
    const [, update] = dataLayer.updateLessonProgress.mock.calls[0]!
    expect(update.introVideoProgress).toBeCloseTo(0.7, 5)
  })

  it("caps a single write's credit even after a long gap", async () => {
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      introVideoProgress: 0.5,
      lastAccessedAt: new Date(Date.now() - 3_600_000), // an hour ago
    })
    await updateLessonProgressAction(LESSON_ID, { introVideoProgress: 1 })
    const [, update] = dataLayer.updateLessonProgress.mock.calls[0]!
    expect(update.introVideoProgress).toBeCloseTo(0.75, 5) // 0.5 + 0.25 cap
  })

  it("grants the requested fraction in full when earned credit covers it", async () => {
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      introVideoProgress: 0.5,
      lastAccessedAt: new Date(Date.now() - 10_000),
    })
    await updateLessonProgressAction(LESSON_ID, { introVideoProgress: 0.6 })
    const [, update] = dataLayer.updateLessonProgress.mock.calls[0]!
    expect(update.introVideoProgress).toBeCloseTo(0.6, 5)
  })

  it("never lowers the stored fraction", async () => {
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      introVideoProgress: 0.9,
      lastAccessedAt: new Date(),
    })
    await updateLessonProgressAction(LESSON_ID, { introVideoProgress: 0.4 })
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID, {
      introVideoProgress: 0.9,
    })
  })
})

describe("submitQuizAnswersAction authorization (QA defect 4)", () => {
  it("refuses an unauthenticated caller BEFORE the answer key is read", async () => {
    authLayer.getCurrentUser.mockResolvedValue(null)
    await expect(
      submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    ).rejects.toThrow(/sign in/i)
    // The key must never have been touched, and nothing written.
    expect(lessonsLayer.getQuizQuestionsByLessonId).not.toHaveBeenCalled()
    expect(dataLayer.recordQuizSubmission).not.toHaveBeenCalled()
    expect(dataLayer.updateLessonProgress).not.toHaveBeenCalled()
  })

  it("refuses a learner whose subscription does not cover the lesson's month", async () => {
    authLayer.getCurrentUser.mockResolvedValue({
      ...STUDENT,
      subscriptionMonth: 1,
    })
    lessonsLayer.getLessonMonthById.mockResolvedValue(3)
    await expect(
      submitQuizAnswersAction(LESSON_ID, { q1: 1 })
    ).rejects.toThrow(/not part of your current access/i)
    expect(lessonsLayer.getQuizQuestionsByLessonId).not.toHaveBeenCalled()
    expect(dataLayer.recordQuizSubmission).not.toHaveBeenCalled()
  })

  it("refuses an unknown lesson id before grading", async () => {
    lessonsLayer.getLessonMonthById.mockResolvedValue(null)
    await expect(submitQuizAnswersAction("nope", { q1: 1 })).rejects.toThrow()
    expect(lessonsLayer.getQuizQuestionsByLessonId).not.toHaveBeenCalled()
  })

  it("applies the private-mode content allowlist like the page gate", async () => {
    delete process.env.PRIVATE_CONTENT_MODE // unset = private mode ON
    process.env.CONTENT_ALLOWED_EMAILS = "david@agilecommercegroup.com"
    await expect(
      submitQuizAnswersAction(LESSON_ID, { q1: 1 })
    ).rejects.toThrow(/not available to your account/i)
    expect(lessonsLayer.getQuizQuestionsByLessonId).not.toHaveBeenCalled()

    process.env.CONTENT_ALLOWED_EMAILS =
      "david@agilecommercegroup.com, student@example.com"
    const result = asGrade(await submitQuizAnswersAction(LESSON_ID, { q1: 1 }))
    expect(result.score).toBe(50)
  })

  it("still grades in pure mock mode (no DATABASE_URL, no session possible)", async () => {
    delete process.env.DATABASE_URL
    authLayer.getCurrentUser.mockResolvedValue(null)
    const result = asGrade(
      await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    )
    expect(result.score).toBe(100)
  })

  it("still grades for the staging mock learner (ENABLE_DEV_MOCK_USER, no session)", async () => {
    process.env.ENABLE_DEV_MOCK_USER = "true"
    authLayer.getCurrentUser.mockResolvedValue(null)
    const result = asGrade(await submitQuizAnswersAction(LESSON_ID, { q1: 1 }))
    expect(result.score).toBe(50)
  })
})

describe("MAX_QUIZ_ATTEMPTS server enforcement (QA defect 5)", () => {
  it("refuses grading past the cap using the PERSISTED attempt count", async () => {
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      quizAttempts: MAX_QUIZ_ATTEMPTS,
      bestQuizScore: 50,
    })

    const result = await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    expect(result).toMatchObject({
      attemptLimitReached: true,
      attemptsUsed: MAX_QUIZ_ATTEMPTS,
      maxAttempts: MAX_QUIZ_ATTEMPTS,
      bestQuizScore: 50,
      passMark: QUIZ_PASS_SCORE,
    })
    expect(
      ("message" in result && result.message.length) || 0
    ).toBeGreaterThan(0)
    // The refusal reveals NOTHING and writes NOTHING: the key was never
    // even read.
    expect(result).not.toHaveProperty("perQuestion")
    expect(lessonsLayer.getQuizQuestionsByLessonId).not.toHaveBeenCalled()
    expect(dataLayer.recordQuizSubmission).not.toHaveBeenCalled()
    expect(dataLayer.updateLessonProgress).not.toHaveBeenCalled()
  })

  it("returns the atomic write's refusal (race lost) without a reveal", async () => {
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      quizAttempts: MAX_QUIZ_ATTEMPTS - 1,
      bestQuizScore: 50,
    })
    dataLayer.recordQuizSubmission.mockResolvedValue({
      outcome: "attempt-limit",
      progress: {
        lessonId: LESSON_ID,
        quizAttempts: MAX_QUIZ_ATTEMPTS,
        bestQuizScore: 50,
      },
    })

    const result = await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    expect(result).toMatchObject({ attemptLimitReached: true })
    expect(result).not.toHaveProperty("perQuestion")
  })

  it("counts attempts even for a caller who already passed", async () => {
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      quizAttempts: MAX_QUIZ_ATTEMPTS,
      bestQuizScore: 100,
      quizPassed: true,
    })
    const result = await submitQuizAnswersAction(LESSON_ID, { q1: 1 })
    expect(result).toMatchObject({
      attemptLimitReached: true,
      bestQuizScore: 100,
    })
  })
})

describe("submitQuizAnswersAction server grading", () => {
  it("grades against the DB answer key and persists through ONE atomic call (QA defect 6)", async () => {
    const result = asGrade(
      await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 0 })
    )

    // One of two correct = 50%, below the pass mark.
    expect(result.score).toBe(50)
    expect(result.passed).toBe(false)
    expect(result.passMark).toBe(QUIZ_PASS_SCORE)

    // The write is the single atomic recordQuizSubmission - the increment,
    // GREATEST and cap all happen inside the data layer's one SQL statement,
    // never via the old getLessonProgress-then-updateLessonProgress pair.
    expect(dataLayer.recordQuizSubmission).toHaveBeenCalledTimes(1)
    expect(dataLayer.recordQuizSubmission).toHaveBeenCalledWith(
      LESSON_ID,
      50,
      { passMark: QUIZ_PASS_SCORE, maxAttempts: MAX_QUIZ_ATTEMPTS }
    )
    expect(dataLayer.updateLessonProgress).not.toHaveBeenCalled()
  })

  it("passes a perfect run", async () => {
    const result = asGrade(
      await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    )
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(result.progress.quizPassed).toBe(true)
  })

  it("reveals the key and explanation only in the grading response", async () => {
    const result = asGrade(await submitQuizAnswersAction(LESSON_ID, { q1: 1 }))
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
    const result = asGrade(
      await submitQuizAnswersAction(LESSON_ID, {
        q1: 1.0000001,
        injected: 1,
      } as never)
    )
    expect(result.score).toBe(0)
  })

  it("refuses to grade a lesson with no quiz (QA defect 7's fail-loudly path)", async () => {
    lessonsLayer.getQuizQuestionsByLessonId.mockResolvedValue([])
    await expect(submitQuizAnswersAction(LESSON_ID, {})).rejects.toThrow(
      /no quiz/
    )
    expect(dataLayer.recordQuizSubmission).not.toHaveBeenCalled()
    expect(dataLayer.updateLessonProgress).not.toHaveBeenCalled()
  })
})
