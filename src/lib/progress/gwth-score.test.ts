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

    // N6: the denominator is REQUIRED and per learner (the effective
    // edition's mandatory-lesson count) — 64 was the old global default.
    expect(calculateGwthScore(lessons, 64).overallScore).toBe(6)
  })

  it("scales the ceiling to the learner's own mandatory-lesson count", () => {
    const lessons = [0, 1, 2, 3].map((index) => ({
      ...createEmptyLessonProgress(`lesson_${index}`),
      isCompleted: true,
      bestQuizScore: 100,
    }))

    // Same work, smaller curated syllabus: same points, higher percentile.
    const curated = calculateGwthScore(lessons, 8)
    const full = calculateGwthScore(lessons, 64)
    expect(curated.overallScore).toBe(full.overallScore)
    expect(curated.maxPossibleScore).toBeLessThan(full.maxPossibleScore)
    expect(curated.percentile).toBeGreaterThan(full.percentile)
  })

  it("floors the percentile honestly when an edition has no mandatory lessons", () => {
    expect(calculateGwthScore([], 0).percentile).toBe(1)
    expect(calculateGwthScore([], 0).maxPossibleScore).toBe(0)
  })
})
