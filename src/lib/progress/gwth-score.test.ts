import { describe, expect, it } from "vitest"
import {
  CAPSTONE_SHARE,
  LESSON_SHARE,
  POINTS_PER_CAPSTONE,
  calculateGwthScore,
  fallBackFactor,
  getPercentileLabel,
  getTrajectoryLabel,
  lastLessonPassedAt,
} from "./gwth-score"
import { createEmptyLessonProgress } from "./completion"

const DAY = 24 * 60 * 60 * 1000

function completed(count: number, bestQuizScore = 100, completedAt: Date | null = null) {
  return Array.from({ length: count }, (_, index) => ({
    ...createEmptyLessonProgress(`lesson_${index}`),
    isCompleted: true,
    bestQuizScore,
    completedAt,
  }))
}

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

  it("splits the 100 in half: lessons and quiz answers 50, capstones 50 (about 16.7 each)", () => {
    expect(LESSON_SHARE).toBe(50)
    expect(CAPSTONE_SHARE).toBe(50)
    expect(POINTS_PER_CAPSTONE).toBeCloseTo(16.667, 2)

    // Every mandatory lesson passed with full marks, no capstones: 50.
    const lessonsOnly = calculateGwthScore(completed(30), 30)
    expect(lessonsOnly.overallScore).toBe(50)
    expect(lessonsOnly.maxPossibleScore).toBe(100)

    // No lessons, all three capstones at 100: 50.
    const capstonesOnly = calculateGwthScore([], 30, {
      capstoneBestTotals: { familybot: 100, askmyco: 100, askeveryone: 100 },
    })
    expect(capstonesOnly.overallScore).toBe(50)

    // Everything: 100.
    const all = calculateGwthScore(completed(30), 30, {
      capstoneBestTotals: { familybot: 100, askmyco: 100, askeveryone: 100 },
    })
    expect(all.overallScore).toBe(100)
    expect(all.percentile).toBe(99)
  })

  it("scales each capstone's total out of 100 to its third of the capstone half", () => {
    const result = calculateGwthScore([], 30, { capstoneBestTotals: { familybot: 60 } })
    expect(result.breakdown.capstonePoints.familybot).toBeCloseTo(10, 5)
    expect(result.breakdown.capstonePoints.askmyco).toBe(0)
    expect(result.overallScore).toBe(10)

    // Half the lessons at full marks (25) plus FamilyBot 72 (12) and AskMyCo 54 (9).
    const mixed = calculateGwthScore(completed(15), 30, {
      capstoneBestTotals: { familybot: 72, askmyco: 54 },
    })
    expect(mixed.breakdown.lessonPoints).toBeCloseTo(25, 5)
    expect(mixed.breakdown.capstoneTotal).toBeCloseTo(21, 5)
    expect(mixed.overallScore).toBe(46)
  })

  it("counts a Not yet (stored as 0), a missing capstone and a null best_total as 0", () => {
    const result = calculateGwthScore(completed(30), 30, {
      capstoneBestTotals: { familybot: 0, askmyco: null },
    })
    expect(result.breakdown.capstoneTotal).toBe(0)
    expect(result.overallScore).toBe(50)
  })

  it("uses the stored best_total as given, so the best of up to 3 hand-ins is what counts", () => {
    // applyMark() stores the best hand-in's counted points: a Not yet (0),
    // then 58, then 81 leaves best_total at 81, and a later 70 never lowers it.
    const best = calculateGwthScore([], 30, { capstoneBestTotals: { askeveryone: 81 } })
    expect(best.breakdown.capstonePoints.askeveryone).toBeCloseTo(13.5, 5)
    expect(best.overallScore).toBe(14)
  })

  it("keeps out-of-range capstone totals inside 0 to 100", () => {
    const result = calculateGwthScore([], 30, {
      capstoneBestTotals: { familybot: 140, askmyco: -5 },
    })
    expect(result.breakdown.capstonePoints.familybot).toBeCloseTo(POINTS_PER_CAPSTONE, 5)
    expect(result.breakdown.capstonePoints.askmyco).toBe(0)
  })

  it("weights the lesson half by quiz quality, never below 0.8", () => {
    expect(calculateGwthScore(completed(30, 90), 30).overallScore).toBe(45)
    expect(calculateGwthScore(completed(30, 50), 30).overallScore).toBe(40)
  })

  it("scales the lesson half to the learner's own mandatory-lesson count", () => {
    // Same work, smaller curated syllabus: a bigger share of the lesson half.
    const curated = calculateGwthScore(completed(4), 8)
    const full = calculateGwthScore(completed(4), 64)
    expect(curated.overallScore).toBe(25)
    expect(full.overallScore).toBe(3)
    expect(curated.maxPossibleScore).toBe(full.maxPossibleScore)
    expect(curated.percentile).toBeGreaterThan(full.percentile)
  })

  it("caps the ceiling at the capstone half when an edition has no mandatory lessons", () => {
    const empty = calculateGwthScore([], 0)
    expect(empty.overallScore).toBe(0)
    expect(empty.percentile).toBe(1)
    expect(empty.maxPossibleScore).toBe(50)
  })

  describe("fall-back rule (bible gwth-score-fall-back)", () => {
    const passed = new Date("2026-10-01T12:00:00Z")
    const at = (days: number) => new Date(passed.getTime() + days * DAY)

    it("holds for 4 weeks, then drops 5% of the earned score per full week", () => {
      expect(fallBackFactor(null, at(400))).toBe(1)
      expect(fallBackFactor(passed, at(0))).toBe(1)
      expect(fallBackFactor(passed, at(28))).toBe(1)
      expect(fallBackFactor(passed, at(34.9))).toBe(1)
      expect(fallBackFactor(passed, at(35))).toBeCloseTo(0.95, 10)
      expect(fallBackFactor(passed, at(42))).toBeCloseTo(0.9, 10)
      expect(fallBackFactor(passed, at(28 + 7 * 20))).toBe(0)
      expect(fallBackFactor(passed, at(28 + 7 * 40))).toBe(0)
      expect(fallBackFactor(passed, at(-3))).toBe(1)
    })

    it("applies to the whole score, capstone points included", () => {
      const inputs = {
        capstoneBestTotals: { familybot: 100, askmyco: 100, askeveryone: 100 },
        lastPassedAt: passed,
      }
      const held = calculateGwthScore(completed(30), 30, { ...inputs, now: at(28) })
      expect(held.overallScore).toBe(100)

      // Two full weeks past the hold: 90% of 100, capstones fall too.
      const falling = calculateGwthScore(completed(30), 30, { ...inputs, now: at(42) })
      expect(falling.breakdown.earned).toBeCloseTo(100, 5)
      expect(falling.breakdown.fallBackFactor).toBeCloseTo(0.9, 10)
      expect(falling.overallScore).toBe(90)

      // Capstones only, no lesson passed: nothing starts the clock.
      const noClock = calculateGwthScore([], 30, {
        capstoneBestTotals: inputs.capstoneBestTotals,
        lastPassedAt: null,
        now: at(400),
      })
      expect(noClock.overallScore).toBe(50)
    })

    it("goes straight back to the earned score on the next lesson passed", () => {
      const old = completed(29, 100, passed)
      const falling = calculateGwthScore(old, 30, { lastPassedAt: lastLessonPassedAt(old), now: at(60) })
      expect(falling.overallScore).toBeLessThan(falling.breakdown.earned)

      const fresh = [...old, { ...createEmptyLessonProgress("lesson_new"), isCompleted: true, bestQuizScore: 100, completedAt: at(60) }]
      const back = calculateGwthScore(fresh, 30, { lastPassedAt: lastLessonPassedAt(fresh), now: at(60) })
      expect(back.breakdown.fallBackFactor).toBe(1)
      expect(back.overallScore).toBe(50)
    })

    it("times the clock from the latest completed lesson only", () => {
      const rows = [
        { ...createEmptyLessonProgress("a"), isCompleted: true, completedAt: at(1) },
        { ...createEmptyLessonProgress("b"), isCompleted: true, completedAt: at(9) },
        { ...createEmptyLessonProgress("c"), isCompleted: false, completedAt: at(20) },
        { ...createEmptyLessonProgress("d"), isCompleted: true, completedAt: null },
      ]
      expect(lastLessonPassedAt(rows)?.getTime()).toBe(at(9).getTime())
      expect(lastLessonPassedAt([])).toBeNull()
    })
  })
})
