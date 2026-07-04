/**
 * Unit tests for the W14 progress derivations. These are the drift sentinels
 * for the honest-zero contract: a fresh account derives to zero everywhere,
 * and real lesson_progress rows derive to real numbers — never the old
 * 5/14-streak or 12/24-course fixtures.
 */
import { describe, expect, it } from "vitest"
import {
  deriveCourseProgress,
  deriveStreak,
  emptyDynamicScore,
  emptyStreak,
  toDayKey,
} from "./derive"
import type { Course, LessonProgress } from "@/lib/types"

/** Noon UTC avoids timezone edges: same calendar day in UTC and London. */
const NOW = new Date("2026-07-04T12:00:00Z")

function row(overrides: Partial<LessonProgress> & { lessonId: string }): LessonProgress {
  return {
    isCompleted: false,
    completedAt: null,
    progress: 0,
    introVideoProgress: 0,
    quizScore: null,
    bestQuizScore: null,
    quizPassed: false,
    quizAttempts: 0,
    timeSpent: 0,
    lastAccessedAt: NOW,
    ...overrides,
  }
}

/** A date at noon UTC `daysAgo` days before NOW. */
function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 86_400_000)
}

const course: Course = {
  id: "course_gwth",
  slug: "applied-ai-skills",
  title: "Applied AI Skills",
  description: "",
  thumbnail: "",
  blurDataUrl: null,
  price: 0,
  category: "AI",
  difficulty: "beginner",
  estimatedDuration: 0,
  createdAt: NOW,
  updatedAt: NOW,
  sections: [
    {
      id: "s1",
      title: "Month 1",
      order: 1,
      month: 1,
      lessons: Array.from({ length: 4 }, (_, i) => ({
        id: `l${i + 1}`,
        slug: `l-${i + 1}`,
        title: `Lesson ${i + 1}`,
        order: i + 1,
        duration: 20,
        status: "available" as const,
      })),
    },
  ],
}

describe("deriveCourseProgress", () => {
  it("returns null for a fresh account (no rows at all)", () => {
    expect(deriveCourseProgress(course, [])).toBeNull()
  })

  it("ignores rows for lessons outside the course", () => {
    const rows = [row({ lessonId: "other_course_lesson", isCompleted: true })]
    expect(deriveCourseProgress(course, rows)).toBeNull()
  })

  it("derives real completion counts from lesson_progress rows", () => {
    const rows = [
      row({ lessonId: "l1", isCompleted: true, completedAt: daysAgo(2) }),
      row({ lessonId: "l2", progress: 0.4 }),
    ]
    const progress = deriveCourseProgress(course, rows)
    expect(progress).toEqual({
      courseId: "course_gwth",
      progress: 0.25,
      completedLessons: 1,
      totalLessons: 4,
      completedAt: null,
    })
  })

  it("stamps completedAt with the latest completion when the course is done", () => {
    const rows = [1, 2, 3, 4].map((n) =>
      row({ lessonId: `l${n}`, isCompleted: true, completedAt: daysAgo(5 - n) })
    )
    const progress = deriveCourseProgress(course, rows)
    expect(progress?.progress).toBe(1)
    expect(progress?.completedLessons).toBe(4)
    expect(progress?.completedAt?.getTime()).toBe(daysAgo(1).getTime())
  })
})

describe("deriveStreak", () => {
  it("is all zeros with no rows (fresh account)", () => {
    const streak = deriveStreak([], NOW)
    expect(streak.currentStreak).toBe(0)
    expect(streak.longestStreak).toBe(0)
    expect(streak.lastActiveDate).toBeNull()
    expect(streak.weeklyActivity).toEqual([
      false, false, false, false, false, false, false,
    ])
    expect(streak.yearlyActivity).toHaveLength(365)
    expect(streak.yearlyActivity.every((d) => d.count === 0)).toBe(true)
  })

  it("counts consecutive activity days ending today", () => {
    const rows = [
      row({ lessonId: "l1", lastAccessedAt: daysAgo(2) }),
      row({ lessonId: "l2", lastAccessedAt: daysAgo(1) }),
      row({ lessonId: "l3", lastAccessedAt: daysAgo(0) }),
    ]
    const streak = deriveStreak(rows, NOW)
    expect(streak.currentStreak).toBe(3)
    expect(streak.longestStreak).toBe(3)
    expect(streak.weeklyActivity).toEqual([
      false, false, false, false, true, true, true,
    ])
  })

  it("keeps the streak alive when today has no activity yet", () => {
    const rows = [
      row({ lessonId: "l1", lastAccessedAt: daysAgo(2) }),
      row({ lessonId: "l2", lastAccessedAt: daysAgo(1) }),
    ]
    expect(deriveStreak(rows, NOW).currentStreak).toBe(2)
  })

  it("resets the current streak after a missed day but keeps the longest", () => {
    const rows = [
      row({ lessonId: "l1", lastAccessedAt: daysAgo(6) }),
      row({ lessonId: "l2", lastAccessedAt: daysAgo(5) }),
      row({ lessonId: "l3", lastAccessedAt: daysAgo(4) }),
      row({ lessonId: "l4", lastAccessedAt: daysAgo(0) }),
    ]
    const streak = deriveStreak(rows, NOW)
    expect(streak.currentStreak).toBe(1)
    expect(streak.longestStreak).toBe(3)
  })

  it("counts distinct lessons per day in yearlyActivity", () => {
    const rows = [
      row({
        lessonId: "l1",
        isCompleted: true,
        completedAt: daysAgo(0),
        lastAccessedAt: daysAgo(0),
      }),
      row({ lessonId: "l2", lastAccessedAt: daysAgo(0) }),
    ]
    const streak = deriveStreak(rows, NOW)
    const today = streak.yearlyActivity[streak.yearlyActivity.length - 1]!
    expect(toDayKey(today.date)).toBe(toDayKey(NOW))
    expect(today.count).toBe(2)
    expect(streak.lastActiveDate).not.toBeNull()
  })
})

describe("empty states", () => {
  it("emptyStreak is the designed zero, not the 5/14 fixture", () => {
    const streak = emptyStreak(NOW)
    expect(streak.currentStreak).toBe(0)
    expect(streak.longestStreak).toBe(0)
    expect(streak.yearlyActivity).toHaveLength(365)
  })

  it("emptyDynamicScore carries no fixture numbers", () => {
    expect(emptyDynamicScore()).toEqual({
      overallScore: 0,
      maxPossibleScore: 0,
      percentile: 0,
      curiosityIndex: 0,
      consistencyScore: 0,
      improvementRate: 0,
      scoreHistory: [],
    })
  })
})
