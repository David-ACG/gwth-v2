import { describe, expect, it } from "vitest"
import {
  getLessonCompletionStatus,
  hasPassedQuiz,
  isLessonComplete,
  INTRO_VIDEO_COMPLETION_THRESHOLD,
} from "./completion"

describe("lesson completion rules", () => {
  it("requires at least 80 percent of the intro video", () => {
    const status = getLessonCompletionStatus({
      hasIntroVideo: true,
      questionCount: 0,
      introVideoProgress: INTRO_VIDEO_COMPLETION_THRESHOLD - 0.01,
    })

    expect(status.videoComplete).toBe(false)
    expect(status.canComplete).toBe(false)
    expect(status.missingReasons).toContain(
      "Watch at least 80% of the intro video"
    )
  })

  it("requires a passing Q&A score when questions exist", () => {
    const status = getLessonCompletionStatus({
      hasIntroVideo: false,
      questionCount: 3,
      bestQuizScore: 34,
    })

    expect(status.quizPassed).toBe(false)
    expect(status.canComplete).toBe(false)
    expect(status.missingReasons).toContain("Pass the lesson Q&A")
  })

  it("allows completion when video and Q&A gates pass", () => {
    const status = getLessonCompletionStatus({
      hasIntroVideo: true,
      questionCount: 3,
      introVideoProgress: 0.84,
      bestQuizScore: 67,
    })

    expect(status.canComplete).toBe(true)
    expect(status.missingReasons).toEqual([])
  })

  it("treats two out of three answers as passing", () => {
    expect(hasPassedQuiz(66)).toBe(false)
    expect(hasPassedQuiz(67)).toBe(true)
  })
})

describe("isLessonComplete (stored-row completion rule)", () => {
  // The W7 rule: complete = video >= 80% watched AND quiz passed.

  it("is incomplete at 79% video even with a passed quiz", () => {
    expect(
      isLessonComplete({
        introVideoProgress: INTRO_VIDEO_COMPLETION_THRESHOLD - 0.01, // 0.79
        quizPassed: true,
        bestQuizScore: 100,
      })
    ).toBe(false)
  })

  it("is incomplete at 80% video when the quiz is failed", () => {
    expect(
      isLessonComplete({
        introVideoProgress: INTRO_VIDEO_COMPLETION_THRESHOLD, // 0.80
        quizPassed: false,
        bestQuizScore: 40,
      })
    ).toBe(false)
  })

  it("is complete at 80% video AND a passed quiz", () => {
    expect(
      isLessonComplete({
        introVideoProgress: INTRO_VIDEO_COMPLETION_THRESHOLD, // 0.80
        quizPassed: true,
        bestQuizScore: 67,
      })
    ).toBe(true)
  })

  it("derives quizPassed from bestQuizScore when not explicitly set", () => {
    // 67 is the pass threshold, so this row completes without quizPassed set.
    expect(
      isLessonComplete({
        introVideoProgress: 0.9,
        quizPassed: undefined,
        bestQuizScore: 67,
      })
    ).toBe(true)
    // 60 < 67 → still failing → incomplete.
    expect(
      isLessonComplete({
        introVideoProgress: 0.9,
        quizPassed: undefined,
        bestQuizScore: 60,
      })
    ).toBe(false)
  })

  it("treats a resumed mid-video row (60%) as incomplete", () => {
    expect(
      isLessonComplete({
        introVideoProgress: 0.6,
        quizPassed: true,
        bestQuizScore: 90,
      })
    ).toBe(false)
  })

  it("treats a missing video fraction as 0% (incomplete)", () => {
    expect(
      isLessonComplete({
        introVideoProgress: undefined,
        quizPassed: true,
        bestQuizScore: 90,
      })
    ).toBe(false)
  })
})
