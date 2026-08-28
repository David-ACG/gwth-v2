/**
 * Regression tests for the hardened progress actions (gwth-launch-va6, N2
 * security; re-hardened twice under the N2 QA chain, gwth-launch-avo).
 *
 * Properties under test:
 *  1. No stored fraction is client-writable: `updateLessonProgressAction`
 *     routes a watch REPORT to the credited `recordIntroVideoProgress` and
 *     drops everything else (forged quiz outcomes, the overall `progress`
 *     fraction - QA round-2 defect 5) into an empty recompute ping.
 *  2. `submitQuizAnswersAction` refuses callers without a valid session and
 *     content access BEFORE reading the answer key (QA defect 4); mock envs
 *     are admitted only via the shared sessionless check (round-2 defect 1).
 *  3. MAX_QUIZ_ATTEMPTS is enforced server-side from the persisted row, and
 *     a refusal carries NO answer reveal (QA defect 5).
 *  4. The quiz outcome persists through ONE atomic `recordQuizSubmission`
 *     call - never a read-modify-write pair (QA defect 6).
 *  5. A wrong answer's key/explanation is revealed only when no further
 *     grading can change the record (round-2 defect 2).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const dataLayer = vi.hoisted(() => ({
  updateLessonProgress: vi.fn(),
  getLessonProgress: vi.fn(),
  recordQuizSubmission: vi.fn(),
  recordIntroVideoProgress: vi.fn(),
}))

const lessonsLayer = vi.hoisted(() => ({
  getQuizQuestionsByLessonId: vi.fn(),
  getLessonGradingMetaById: vi.fn(),
}))

const editionsLayer = vi.hoisted(() => ({
  getEffectivePassMark: vi.fn(),
}))

const authLayer = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
}))

const accessLayer = vi.hoisted(() => ({
  isSessionlessMockRequest: vi.fn(),
}))

vi.mock("@/lib/data/progress", () => ({
  updateLessonProgress: dataLayer.updateLessonProgress,
  getLessonProgress: dataLayer.getLessonProgress,
  recordQuizSubmission: dataLayer.recordQuizSubmission,
  recordIntroVideoProgress: dataLayer.recordIntroVideoProgress,
}))

vi.mock("@/lib/data/lessons", () => ({
  getQuizQuestionsByLessonId: lessonsLayer.getQuizQuestionsByLessonId,
  getLessonGradingMetaById: lessonsLayer.getLessonGradingMetaById,
}))

// N6: the pass mark now resolves from the caller's effective syllabus
// edition; the default mock keeps the historic 67 so every pre-edition
// property stays under test unchanged.
vi.mock("@/lib/data/editions", () => ({
  getEffectivePassMark: editionsLayer.getEffectivePassMark,
}))

vi.mock("@/lib/auth", () => ({
  getCurrentUser: authLayer.getCurrentUser,
  // The real staging/dev mock learner identity (month-3 access).
  getMockUser: async () => ({
    id: "user_mock_001",
    email: "david@agilecommercegroup.com",
    subscriptionMonth: 3,
  }),
  // Mirrors the real month gate closely enough for refusal tests: access up
  // to the user's subscription month.
  canUserAccessMonth: (
    user: { subscriptionMonth: number },
    month: number
  ) => month <= user.subscriptionMonth,
}))

vi.mock("@/lib/content-access", () => ({
  isSessionlessMockRequest: accessLayer.isSessionlessMockRequest,
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
  "PRIVATE_CONTENT_MODE",
  "CONTENT_ALLOWED_EMAILS",
  "ADMIN_EMAILS",
] as const
const savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> =
  {}

beforeEach(() => {
  vi.clearAllMocks()
  for (const key of ENV_KEYS) savedEnv[key] = process.env[key]

  // Default: a real signed-in month-3 student, content mode off (the launch
  // state), and NOT the sessionless mock learner.
  process.env.PRIVATE_CONTENT_MODE = "off"
  delete process.env.CONTENT_ALLOWED_EMAILS
  delete process.env.ADMIN_EMAILS

  authLayer.getCurrentUser.mockResolvedValue(STUDENT)
  accessLayer.isSessionlessMockRequest.mockResolvedValue(false)
  lessonsLayer.getLessonGradingMetaById.mockResolvedValue({
    month: 1,
    courseSlug: "applied-ai-skills",
  })
  lessonsLayer.getQuizQuestionsByLessonId.mockResolvedValue(QUESTIONS)
  editionsLayer.getEffectivePassMark.mockResolvedValue(QUIZ_PASS_SCORE)

  dataLayer.updateLessonProgress.mockImplementation(
    async (lessonId: string) => ({ lessonId })
  )
  dataLayer.recordIntroVideoProgress.mockImplementation(
    async (lessonId: string, fraction: number) => ({
      lessonId,
      introVideoProgress: fraction,
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

describe("updateLessonProgressAction: no stored fraction is client-writable", () => {
  it("drops forged quiz, completion AND overall-progress fields entirely", async () => {
    await updateLessonProgressAction(LESSON_ID, {
      // A hostile payload: every one of these must be stripped. `progress`
      // is included on purpose (QA round-2 defect 5): it used to persist.
      progress: 1,
      bestQuizScore: 100,
      quizScore: 100,
      quizPassed: true,
      quizAttempts: 99,
      isCompleted: true,
      completedAt: new Date(),
      timeSpent: 123456,
    } as never)

    // Nothing creditable in the payload: the payload-FREE recompute ping
    // only (QA round-3 defect 4 - the data layer accepts no fields at all).
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledTimes(1)
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID)
    expect(dataLayer.recordIntroVideoProgress).not.toHaveBeenCalled()
  })

  it("routes a watch report to the CREDITED path, clamped to 0..1", async () => {
    await updateLessonProgressAction(LESSON_ID, { introVideoProgress: 7 })
    expect(dataLayer.recordIntroVideoProgress).toHaveBeenCalledWith(
      LESSON_ID,
      1
    )
    expect(dataLayer.updateLessonProgress).not.toHaveBeenCalled()
  })

  it("treats a non-numeric watch report as absent", async () => {
    await updateLessonProgressAction(LESSON_ID, {
      introVideoProgress: "0.9",
    } as never)
    expect(dataLayer.recordIntroVideoProgress).not.toHaveBeenCalled()
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID)
  })

  it("sends the FINISH ping as an empty update (completion derives server-side)", async () => {
    await updateLessonProgressAction(LESSON_ID, {})
    expect(dataLayer.updateLessonProgress).toHaveBeenCalledWith(LESSON_ID)
  })
})

describe("submitQuizAnswersAction authorization (QA defect 4; round-2 defect 1)", () => {
  it("refuses an unauthenticated caller BEFORE the answer key is read", async () => {
    authLayer.getCurrentUser.mockResolvedValue(null)
    accessLayer.isSessionlessMockRequest.mockResolvedValue(false)
    await expect(
      submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    ).rejects.toThrow(/sign in/i)
    // The key must never have been touched, and nothing written.
    expect(lessonsLayer.getQuizQuestionsByLessonId).not.toHaveBeenCalled()
    expect(dataLayer.recordQuizSubmission).not.toHaveBeenCalled()
    expect(dataLayer.updateLessonProgress).not.toHaveBeenCalled()
  })

  it("admits the SESSIONLESS mock learner only via the shared check", async () => {
    authLayer.getCurrentUser.mockResolvedValue(null)
    accessLayer.isSessionlessMockRequest.mockResolvedValue(true)
    const result = asGrade(
      await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    )
    expect(result.score).toBe(100)
    expect(accessLayer.isSessionlessMockRequest).toHaveBeenCalledTimes(1)
    // The month gate still ran for the mock learner (round-3 defect 9).
    expect(lessonsLayer.getLessonGradingMetaById).toHaveBeenCalledWith(
      LESSON_ID
    )
  })

  it("still refuses the mock learner an unknown or inaccessible lesson (round-3 defect 9)", async () => {
    authLayer.getCurrentUser.mockResolvedValue(null)
    accessLayer.isSessionlessMockRequest.mockResolvedValue(true)
    lessonsLayer.getLessonGradingMetaById.mockResolvedValue(null)
    await expect(
      submitQuizAnswersAction("no_such_lesson", { q1: 1 })
    ).rejects.toThrow(/not part of your current access/i)
    expect(lessonsLayer.getQuizQuestionsByLessonId).not.toHaveBeenCalled()
  })

  it("refuses a forged cookie in a mock env (the shared check says no)", async () => {
    // isSessionlessMockRequest returns FALSE for any presented session
    // cookie, even under ENABLE_DEV_MOCK_USER - so a forged cookie that
    // fails validation (getCurrentUser null) is refused (round-2 defect 1).
    authLayer.getCurrentUser.mockResolvedValue(null)
    accessLayer.isSessionlessMockRequest.mockResolvedValue(false)
    await expect(
      submitQuizAnswersAction(LESSON_ID, { q1: 1 })
    ).rejects.toThrow(/sign in/i)
    expect(lessonsLayer.getQuizQuestionsByLessonId).not.toHaveBeenCalled()
  })

  it("refuses a learner whose subscription does not cover the lesson's month", async () => {
    authLayer.getCurrentUser.mockResolvedValue({
      ...STUDENT,
      subscriptionMonth: 1,
    })
    lessonsLayer.getLessonGradingMetaById.mockResolvedValue({
      month: 3,
      courseSlug: "applied-ai-skills",
    })
    await expect(
      submitQuizAnswersAction(LESSON_ID, { q1: 1 })
    ).rejects.toThrow(/not part of your current access/i)
    expect(lessonsLayer.getQuizQuestionsByLessonId).not.toHaveBeenCalled()
    expect(dataLayer.recordQuizSubmission).not.toHaveBeenCalled()
  })

  it("refuses an unknown lesson id before grading", async () => {
    lessonsLayer.getLessonGradingMetaById.mockResolvedValue(null)
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

  it("admits an ADMIN not on the content allowlist, like every other surface (QA round-3 appendix 3)", async () => {
    delete process.env.PRIVATE_CONTENT_MODE // private mode ON
    process.env.CONTENT_ALLOWED_EMAILS = "someone-else@example.com"
    process.env.ADMIN_EMAILS = "student@example.com" // our caller is an admin
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

  it("refuses further grading once PASSED, even with attempts left (round-3 defect 8)", async () => {
    // A pass CLOSES the quiz: the post-pass reveal can never be resubmitted
    // to inflate bestQuizScore from 67 to 100.
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      quizAttempts: 1,
      bestQuizScore: 67,
      quizPassed: true,
    })
    const result = await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    expect(result).toMatchObject({
      attemptLimitReached: true,
      bestQuizScore: 67,
    })
    expect(result).not.toHaveProperty("perQuestion")
    expect(lessonsLayer.getQuizQuestionsByLessonId).not.toHaveBeenCalled()
    expect(dataLayer.recordQuizSubmission).not.toHaveBeenCalled()
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
      {
        passMark: QUIZ_PASS_SCORE,
        maxAttempts: MAX_QUIZ_ATTEMPTS,
        // N6 (016): the raw submission rides along as the audit trail.
        answers: { q1: 1, q2: 0 },
      }
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

describe("answer-reveal policy (QA round-2 defect 2)", () => {
  it("withholds a wrong answer's key and explanation while a retry remains", async () => {
    // Attempt 1 of 3, failed: q1 right, q2 wrong.
    const result = asGrade(
      await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 0 })
    )
    expect(result.passed).toBe(false)
    expect(result.perQuestion).toEqual([
      {
        questionId: "q1",
        correct: true,
        correctOptionIndex: 1,
        explanation: "Small and specific to your own week.",
      },
      // The wrong answer reveals NOTHING an attacker could resubmit with.
      { questionId: "q2", correct: false },
    ])
  })

  it("reveals everything on a pass (safe: a pass closes the quiz to grading)", async () => {
    const result = asGrade(
      await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    )
    expect(result.passed).toBe(true)
    for (const grade of result.perQuestion) {
      expect(grade.correctOptionIndex).toBe(1)
      expect(grade.explanation).toBeTruthy()
    }
  })

  it("reveals everything once the FINAL attempt is spent (no grading can use it)", async () => {
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      quizAttempts: MAX_QUIZ_ATTEMPTS - 1,
      bestQuizScore: 0,
    })
    dataLayer.recordQuizSubmission.mockResolvedValue({
      outcome: "recorded",
      progress: {
        lessonId: LESSON_ID,
        quizScore: 0,
        bestQuizScore: 0,
        quizPassed: false,
        quizAttempts: MAX_QUIZ_ATTEMPTS,
      },
    })
    const result = asGrade(
      await submitQuizAnswersAction(LESSON_ID, { q1: 0, q2: 0 })
    )
    expect(result.passed).toBe(false)
    for (const grade of result.perQuestion) {
      expect(grade.correctOptionIndex).toBe(1)
      expect(grade.explanation).toBeTruthy()
    }
  })
})

describe("edition pass mark threading (N6)", () => {
  it("grades against the effective edition's pass mark, not the constant", async () => {
    // A stricter institution edition: 100 to pass. The same 50% run that
    // fails at 67 fails here too, but a 100% run must clear it.
    editionsLayer.getEffectivePassMark.mockResolvedValue(100)

    const half = asGrade(await submitQuizAnswersAction(LESSON_ID, { q1: 1 }))
    expect(half.score).toBe(50)
    expect(half.passed).toBe(false)
    expect(half.passMark).toBe(100)

    const perfect = asGrade(
      await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    )
    expect(perfect.passed).toBe(true)
    expect(perfect.passMark).toBe(100)

    // The persistence layer received the edition's mark, so quiz_passed and
    // completion derive from the same number the learner was told.
    expect(dataLayer.recordQuizSubmission).toHaveBeenLastCalledWith(
      LESSON_ID,
      100,
      expect.objectContaining({ passMark: 100 })
    )
  })

  it("a laxer edition pass mark admits a score the default would fail", async () => {
    editionsLayer.getEffectivePassMark.mockResolvedValue(50)
    const result = asGrade(await submitQuizAnswersAction(LESSON_ID, { q1: 1 }))
    expect(result.score).toBe(50)
    expect(result.passed).toBe(true)
    expect(result.passMark).toBe(50)
  })

  it("never resolves the edition for an unauthorized caller", async () => {
    authLayer.getCurrentUser.mockResolvedValue(null)
    accessLayer.isSessionlessMockRequest.mockResolvedValue(false)
    await expect(
      submitQuizAnswersAction(LESSON_ID, { q1: 1 })
    ).rejects.toThrow(/sign in/i)
    expect(editionsLayer.getEffectivePassMark).not.toHaveBeenCalled()
  })

  it("carries the edition pass mark on the attempt-limit refusal", async () => {
    editionsLayer.getEffectivePassMark.mockResolvedValue(80)
    dataLayer.getLessonProgress.mockResolvedValue({
      lessonId: LESSON_ID,
      quizAttempts: MAX_QUIZ_ATTEMPTS,
      bestQuizScore: 70,
    })
    const result = await submitQuizAnswersAction(LESSON_ID, { q1: 1, q2: 1 })
    expect(result).toMatchObject({
      attemptLimitReached: true,
      passMark: 80,
    })
  })
})
