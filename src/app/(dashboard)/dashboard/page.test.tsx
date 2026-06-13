import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ActiveDashboard } from "./page"
import type { Course, User } from "@/lib/types"

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
        streak={{
          currentStreak: 5,
          longestStreak: 8,
          lastActiveDate: new Date("2026-06-10T00:00:00.000Z"),
          weeklyActivity: [true, true, false, true, false, true, true],
          yearlyActivity: [],
        }}
        notifications={[]}
      />
    )

    expect(screen.getByText("Course progress")).toBeInTheDocument()
    expect(screen.queryByText("GWTH Score")).not.toBeInTheDocument()
    expect(container.querySelector("[data-role=hero-device]")).toBeNull()
  })
})
