import { describe, expect, it } from "vitest"
import {
  getLessonCompletionStatus,
  hasPassedQuiz,
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
