import { describe, expect, it } from "vitest"
import {
  calculateGwthScore,
  getPercentileLabel,
  getTrajectoryLabel,
} from "./gwth-score"
import { createEmptyLessonProgress } from "./completion"

describe("GWTH Score", () => {
  it("maps score bands to public percentile labels", () => {
    expect(getPercentileLabel(10)).toBe("Building foundations")
    expect(getPercentileLabel(30)).toBe("Top 30% trajectory")
    expect(getPercentileLabel(55)).toBe("Top 10% trajectory")
    expect(getPercentileLabel(96)).toBe("Top 1% trajectory")
  })

  it("maps score bands to plain-English trajectories", () => {
    expect(getTrajectoryLabel(10)).toBe("Getting started")
    expect(getTrajectoryLabel(35)).toBe("Month 1 foundations")
    expect(getTrajectoryLabel(70)).toBe("Confident builder")
  })

  it("calculates score from completed lessons and quiz quality", () => {
    const lessons = [0, 1, 2, 3].map((index) => ({
      ...createEmptyLessonProgress(`lesson_${index}`),
      isCompleted: true,
      bestQuizScore: 100,
    }))

    expect(calculateGwthScore(lessons).overallScore).toBe(6)
  })
})
