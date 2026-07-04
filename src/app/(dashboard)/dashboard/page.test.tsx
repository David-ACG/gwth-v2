import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ActiveDashboard } from "./page"
import { emptyStreak } from "@/lib/progress/derive"
import type { Course, LessonProgress, User } from "@/lib/types"

const user: User = {
  id: "user_beta_1",
  name: "Beta Learner",
  email: "beta@example.com",
  avatarUrl: null,
  bio: null,
  subscriptionState: "month1",
  subscriptionMonth: 1,
  gracePeriodEnds: null,
  lastPaymentDate: null,
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  updatedAt: new Date("2026-06-01T00:00:00.000Z"),
}

const course: Course = {
  id: "course_gwth",
  slug: "applied-ai-skills",
  title: "Applied AI Skills",
  description: "Course",
  thumbnail: "/thumb.jpg",
  blurDataUrl: null,
  price: 0,
  category: "AI",
  difficulty: "beginner",
  estimatedDuration: 1200,
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
  updatedAt: new Date("2026-06-01T00:00:00.000Z"),
  sections: [
    {
      id: "m1",
      title: "Month 1",
      order: 1,
      month: 1,
      lessons: Array.from({ length: 24 }, (_, index) => ({
        id: `lesson_${index + 1}`,
        slug: `lesson-${index + 1}`,
        title: `Lesson ${index + 1}`,
        order: index + 1,
        duration: 20,
        status: index < 12 ? "completed" : "available",
      })),
    },
  ],
}

/** Real-shaped progress rows: the first `completedCount` lessons complete. */
function lessonRows(completedCount: number): LessonProgress[] {
  return Array.from({ length: completedCount }, (_, index) => ({
    lessonId: `lesson_${index + 1}`,
    isCompleted: true,
    completedAt: new Date("2026-06-10T00:00:00.000Z"),
    progress: 1,
    introVideoProgress: 1,
    quizScore: 90,
    bestQuizScore: 90,
    quizPassed: true,
    quizAttempts: 1,
    timeSpent: 1800,
    lastAccessedAt: new Date("2026-06-10T00:00:00.000Z"),
  }))
}

describe("ActiveDashboard beta score flag", () => {
  it("shows plain progress and hides the score widget by default", () => {
    const { container } = render(
      <ActiveDashboard
        user={user}
        course={course}
        progress={{
          courseId: course.id,
          progress: 0.5,
          completedLessons: 12,
          totalLessons: 24,
          completedAt: null,
        }}
        lessonProgress={lessonRows(12)}
        streak={{
          currentStreak: 5,
          longestStreak: 8,
          lastActiveDate: new Date("2026-06-10T00:00:00.000Z"),
          weeklyActivity: [true, true, false, true, false, true, true],
          yearlyActivity: emptyStreak().yearlyActivity,
        }}
        notifications={[]}
      />
    )

    expect(screen.getByText("Course progress")).toBeInTheDocument()
    expect(screen.queryByText("GWTH Score")).not.toBeInTheDocument()
    expect(container.querySelector("[data-role=hero-device]")).toBeNull()
  })
})

describe("ActiveDashboard honest-zero state (W14)", () => {
  it("renders a fresh account with zero progress and no fixture numbers", () => {
    // Scope queries to this render: the suite has no RTL auto-cleanup, so
    // `screen` would also see earlier renders in this file.
    const view = within(
      render(
        <ActiveDashboard
          user={user}
          course={course}
          progress={undefined}
          lessonProgress={[]}
          streak={emptyStreak()}
          notifications={[]}
        />
      ).container
    )

    // Course progress reads 0 of 24 and the first real lesson is next up.
    expect(view.getByText("0 / 24 mandatory")).toBeInTheDocument()
    expect(view.getByText("Start Lesson 1")).toBeInTheDocument()
    expect(view.getAllByText("Lesson 1").length).toBeGreaterThan(0)

    // Streak is honestly zero: never the old 5-day / 14-day fixture.
    expect(view.queryByText(/Held for 5 days/)).not.toBeInTheDocument()
    expect(
      view.getByText("Complete a lesson to start your streak.")
    ).toBeInTheDocument()

    // The fixture activity/portfolio numbers are gone.
    expect(view.queryByText("5.2")).not.toBeInTheDocument()
    expect(view.queryByText(/12 PROJECTS/)).not.toBeInTheDocument()
    expect(view.getByText("SHIPPED · 0 PROJECTS")).toBeInTheDocument()
    expect(view.getByText("CAPSTONES · 0 OF 3")).toBeInTheDocument()
    expect(view.getByText("No notifications yet.")).toBeInTheDocument()
  })

  it("reflects real lesson_progress rows in the course table", () => {
    const view = within(
      render(
        <ActiveDashboard
          user={user}
          course={course}
          progress={{
            courseId: course.id,
            progress: 1 / 24,
            completedLessons: 1,
            totalLessons: 24,
            completedAt: null,
          }}
          lessonProgress={lessonRows(1)}
          streak={emptyStreak()}
          notifications={[]}
        />
      ).container
    )

    expect(view.getByText("1 / 24 mandatory")).toBeInTheDocument()
    expect(view.getByText(/1 lesson complete\./)).toBeInTheDocument()
    // The next real lesson (2) is up next, by title from the course outline.
    expect(view.getByText("Continue Lesson 2")).toBeInTheDocument()
    expect(view.getAllByText("Lesson 2").length).toBeGreaterThan(0)
  })
})
