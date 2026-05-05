import type { DynamicScore, LessonProgress } from "@/lib/types"
import { POINTS_PER_LESSON, SCORE_PERCENTILE_MILESTONES } from "@/lib/config"

export type GwthScoreSummary = Pick<
  DynamicScore,
  "overallScore" | "maxPossibleScore" | "percentile" | "curiosityIndex" | "consistencyScore" | "improvementRate"
> & {
  percentileLabel: string
  trajectoryLabel: string
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

export function calculateGwthScore(
  lessonProgress: LessonProgress[],
  totalMandatoryLessons = 64
): GwthScoreSummary {
  const completedLessons = lessonProgress.filter((lesson) => lesson.isCompleted)
  const completedScore = completedLessons.length * POINTS_PER_LESSON
  const quizAverage =
    completedLessons.length === 0
      ? 0
      : completedLessons.reduce(
          (sum, lesson) => sum + (lesson.bestQuizScore ?? 0),
          0
        ) / completedLessons.length
  const quizMultiplier = quizAverage > 0 ? Math.max(0.8, quizAverage / 100) : 1
  const overallScore = Math.round(completedScore * quizMultiplier)
  const maxPossibleScore = Math.round(totalMandatoryLessons * POINTS_PER_LESSON)
  const percentile = Math.min(
    99,
    Math.max(1, Math.round((overallScore / maxPossibleScore) * 100))
  )

  return {
    overallScore,
    maxPossibleScore,
    percentile,
    curiosityIndex: 0,
    consistencyScore: Math.min(100, completedLessons.length * 3),
    improvementRate: 0,
    percentileLabel: getPercentileLabel(overallScore),
    trajectoryLabel: getTrajectoryLabel(overallScore),
  }
}

export const GWTH_SCORE_MILESTONES = SCORE_PERCENTILE_MILESTONES
