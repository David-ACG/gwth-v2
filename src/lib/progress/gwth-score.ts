import type { DynamicScore, LessonProgress } from "@/lib/types"
import { POINTS_PER_LESSON, SCORE_PERCENTILE_MILESTONES } from "@/lib/config"
import { CAPSTONE_IDS, type CapstoneId } from "@/lib/capstones/guides"

/**
 * How the GWTH score out of 100 is split (David, 2026-10-27, bead
 * gwth-launch-9289 decision; built in gwth-launch-9289.10):
 *
 *  - lessons and quiz answers make {@link LESSON_SHARE} of the 100;
 *  - the three capstones make {@link CAPSTONE_SHARE}, shared equally, so each
 *    capstone's total out of 100 is worth about 16.7 points.
 */
export const LESSON_SHARE = 50
export const CAPSTONE_SHARE = 50
/** The most points one capstone can add to the score (50 / 3, about 16.7). */
export const POINTS_PER_CAPSTONE = CAPSTONE_SHARE / CAPSTONE_IDS.length

/**
 * The fall-back rule (bible item gwth-score-fall-back, David 2026-10-25): the
 * score holds for {@link FALL_BACK_HOLD_DAYS} days after the last lesson
 * passed, then falls by {@link FALL_BACK_WEEKLY_RATE} of the earned score for
 * each full week after that, until the learner passes a lesson again. It
 * applies to the WHOLE score, capstone points included.
 */
export const FALL_BACK_HOLD_DAYS = 28
export const FALL_BACK_WEEKLY_RATE = 0.05

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Each capstone's counted points out of 100, exactly as stored in
 * `capstone_submissions.best_total` (best of up to 3 hand-ins, a Not yet
 * already stored as 0, a provisional mark counting at once). A missing
 * capstone, or a null, counts 0.
 */
export type CapstoneBestTotals = Partial<Record<CapstoneId, number | null>>

export interface GwthScoreInputs {
  /** Counted points per capstone (see {@link CapstoneBestTotals}). */
  capstoneBestTotals?: CapstoneBestTotals
  /**
   * When the learner last passed a lesson (the latest `completedAt` of a
   * completed lesson). Null/absent = no fall-back is applied.
   */
  lastPassedAt?: Date | null
  /** The moment to score at; defaults to now. */
  now?: Date
}

/** Where the points came from, before rounding. */
export interface GwthScoreBreakdown {
  /** Lessons and quiz answers, out of {@link LESSON_SHARE}. */
  lessonPoints: number
  /** Each capstone's points, out of {@link POINTS_PER_CAPSTONE}. */
  capstonePoints: Record<CapstoneId, number>
  /** All three capstones, out of {@link CAPSTONE_SHARE}. */
  capstoneTotal: number
  /** Lessons plus capstones before the fall-back. */
  earned: number
  /** The share of the earned score still held (1 = no fall-back yet). */
  fallBackFactor: number
}

export type GwthScoreSummary = Pick<
  DynamicScore,
  "overallScore" | "maxPossibleScore" | "percentile" | "curiosityIndex" | "consistencyScore" | "improvementRate"
> & {
  percentileLabel: string
  trajectoryLabel: string
  breakdown: GwthScoreBreakdown
}

export function getPercentileLabel(score: number): string {
  if (score >= 96) return "Top 1% trajectory"
  if (score >= 90) return "Top 2% trajectory"
  if (score >= 75) return "Top 5% trajectory"
  if (score >= 55) return "Top 10% trajectory"
  if (score >= 30) return "Top 30% trajectory"
  return "Building foundations"
}

export function getTrajectoryLabel(score: number): string {
  if (score >= 90) return "Advanced applied AI"
  if (score >= 55) return "Confident builder"
  if (score >= 30) return "Month 1 foundations"
  return "Getting started"
}

/**
 * The share of the earned score still held under the fall-back rule: 1 until
 * {@link FALL_BACK_HOLD_DAYS} days after `lastPassedAt`, then 5% less for each
 * FULL week after that (day 35 = 0.95, day 42 = 0.90 ...), never below 0.
 * No date (nothing passed yet) or a date in the future = 1.
 */
export function fallBackFactor(lastPassedAt: Date | null | undefined, now: Date = new Date()): number {
  if (!lastPassedAt) return 1
  const days = (now.getTime() - lastPassedAt.getTime()) / DAY_MS
  if (!(days > FALL_BACK_HOLD_DAYS)) return 1
  const weeks = Math.floor((days - FALL_BACK_HOLD_DAYS) / 7)
  return Math.max(0, 1 - weeks * FALL_BACK_WEEKLY_RATE)
}

/** The latest `completedAt` among completed lessons: the fall-back clock. */
export function lastLessonPassedAt(lessonProgress: LessonProgress[]): Date | null {
  let latest: Date | null = null
  for (const lesson of lessonProgress) {
    if (!lesson.isCompleted || !lesson.completedAt) continue
    if (!latest || lesson.completedAt.getTime() > latest.getTime()) latest = lesson.completedAt
  }
  return latest
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Computes the GWTH Score summary (out of 100) from a learner's progress rows
 * and capstone marks.
 *
 * Lessons and quiz answers (out of {@link LESSON_SHARE}): the share of the
 * learner's mandatory lessons completed, weighted by their average best quiz
 * mark on those lessons (never below 0.8 once they have a mark), as before.
 * `totalMandatoryLessons` is REQUIRED (N6): the denominator is per learner,
 * derived from their effective syllabus edition via
 * `getMandatoryLessonCount()` in `@/lib/data/editions`, never a global
 * constant. Callers should pre-filter `lessonProgress` to the same mandatory
 * lesson set so optional/exclusive extras never inflate the numerator.
 *
 * Capstones (out of {@link CAPSTONE_SHARE}): each capstone's counted total out
 * of 100 scaled to {@link POINTS_PER_CAPSTONE}.
 *
 * The fall-back rule then applies to the whole score.
 */
export function calculateGwthScore(
  lessonProgress: LessonProgress[],
  totalMandatoryLessons: number,
  inputs: GwthScoreInputs = {}
): GwthScoreSummary {
  const completedLessons = lessonProgress.filter((lesson) => lesson.isCompleted)
  const quizAverage =
    completedLessons.length === 0
      ? 0
      : completedLessons.reduce(
          (sum, lesson) => sum + (lesson.bestQuizScore ?? 0),
          0
        ) / completedLessons.length
  const quizMultiplier = quizAverage > 0 ? Math.max(0.8, quizAverage / 100) : 1
  // The old points scale (1.5 per lesson) is kept only as the ratio's two
  // sides, so the lesson half reads exactly as the old score did, out of 50.
  const lessonCeiling = totalMandatoryLessons * POINTS_PER_LESSON
  const lessonPoints =
    lessonCeiling <= 0
      ? 0
      : clamp(
          ((completedLessons.length * POINTS_PER_LESSON * quizMultiplier) / lessonCeiling) * LESSON_SHARE,
          0,
          LESSON_SHARE
        )

  const capstonePoints = {} as Record<CapstoneId, number>
  for (const id of CAPSTONE_IDS) {
    const total = inputs.capstoneBestTotals?.[id]
    const counted = typeof total === "number" && Number.isFinite(total) ? clamp(total, 0, 100) : 0
    capstonePoints[id] = (counted / 100) * POINTS_PER_CAPSTONE
  }
  const capstoneTotal = CAPSTONE_IDS.reduce((sum, id) => sum + capstonePoints[id], 0)

  const earned = lessonPoints + capstoneTotal
  const factor = fallBackFactor(inputs.lastPassedAt, inputs.now)
  const overallScore = Math.round(earned * factor)
  // An edition with no mandatory lessons (fail-closed) can only earn the
  // capstone half; the ceiling says so rather than promising 100.
  const maxPossibleScore = (lessonCeiling > 0 ? LESSON_SHARE : 0) + CAPSTONE_SHARE
  const percentile = clamp(Math.round((overallScore / maxPossibleScore) * 100), 1, 99)

  return {
    overallScore,
    maxPossibleScore,
    percentile,
    curiosityIndex: 0,
    consistencyScore: Math.min(100, completedLessons.length * 3),
    improvementRate: 0,
    percentileLabel: getPercentileLabel(overallScore),
    trajectoryLabel: getTrajectoryLabel(overallScore),
    breakdown: {
      lessonPoints,
      capstonePoints,
      capstoneTotal,
      earned,
      fallBackFactor: factor,
    },
  }
}

export const GWTH_SCORE_MILESTONES = SCORE_PERCENTILE_MILESTONES
