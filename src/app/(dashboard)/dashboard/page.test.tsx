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
    expect(view.getByText("CAPSTONE PROJECTS · 0 OF 3")).toBeInTheDocument()
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

describe("ActiveDashboard month + ordering (gwth-launch-26b)", () => {
  // A course whose `sections` rows are broken exactly as prod's are: several
  // sections tie at order=0 with the lessons distributed out of array order.
  // The authoritative signal is each lesson's global `order` (1..N).
  const scrambledCourse: Course = {
    ...course,
    sections: [
      {
        id: "s_b",
        title: "Second in array",
        order: 0,
        month: 1,
        lessons: [
          { id: "lesson_13", slug: "lesson-13", title: "Lesson 13", order: 13, duration: 20, status: "available" },
          { id: "lesson_2", slug: "lesson-2", title: "Lesson 2", order: 2, duration: 20, status: "available" },
        ],
      },
      {
        id: "s_a",
        title: "First in array",
        order: 0,
        month: 1,
        lessons: [
          { id: "lesson_1", slug: "lesson-1", title: "Lesson 1", order: 1, duration: 20, status: "available" },
          { id: "lesson_14", slug: "lesson-14", title: "Lesson 14", order: 14, duration: 20, status: "available" },
        ],
      },
    ],
  }

  // A Month-1 student whose grant defaulted to Month 3 (the prod defect).
  const month3Grant: User = { ...user, subscriptionMonth: 3, subscriptionState: "month3" }

  it("orders lessons by global order and points Continue at the first incomplete lesson", () => {
    const view = within(
      render(
        <ActiveDashboard
          user={month3Grant}
          course={scrambledCourse}
          progress={undefined}
          lessonProgress={[]}
          streak={emptyStreak()}
          notifications={[]}
        />
      ).container
    )

    // Fresh account: lesson order-1 is up next, NOT the section-array-first
    // lesson 13 that the old (section.order, lesson.order) sort surfaced.
    expect(view.getByText("Start Lesson 1")).toBeInTheDocument()
    // The up-next row carries the order-1 lesson title, not the array-first
    // lesson 13 that the old (section.order, lesson.order) sort surfaced.
    expect(view.getAllByText("Lesson 1").length).toBeGreaterThan(0)
    expect(view.queryByText("Continue Lesson 13")).not.toBeInTheDocument()
  })

  it("shows the month of the live content, not the (defaulted) grant month", () => {
    const view = within(
      render(
        <ActiveDashboard
          user={month3Grant}
          course={scrambledCourse}
          progress={undefined}
          lessonProgress={[]}
          streak={emptyStreak()}
          notifications={[]}
        />
      ).container
    )

    // Only Month 1 content is live, so a Month-1 student reads "MONTH 1 OF 3"
    // even though their grant defaulted to subscriptionMonth=3.
    expect(view.getByText("MONTH 1 OF 3")).toBeInTheDocument()
    expect(view.queryByText("MONTH 3 OF 3")).not.toBeInTheDocument()
  })
})

/**
 * David, 2026-07-26: "when I'm in the dashboard and I click on lesson one in
 * month one or three, it doesn't actually go to lesson one. I have to click on
 * the button at the top called start lesson one. This isn't natural."
 *
 * The rows were inert `<div>`s. They are links now, and the Start button stays.
 */
describe("ActiveDashboard lesson rows are links", () => {
  function renderFresh() {
    const { container } = render(
      <ActiveDashboard
        user={user}
        course={course}
        progress={undefined}
        lessonProgress={[]}
        streak={emptyStreak()}
        notifications={[]}
      />
    )
    return container
  }

  /** Anchors whose text is a lesson table row, keyed by href. */
  function rowLinks(container: HTMLElement) {
    return Array.from(container.querySelectorAll("a")).filter((a) =>
      /^\/course\/applied-ai-skills\/lesson\//.test(a.getAttribute("href") ?? "")
    )
  }

  it("makes the lesson row itself open that lesson", () => {
    const container = renderFresh()
    // The row reading "L01 ... Lesson 1 ... NEXT UP" is an anchor to lesson 1.
    const row = rowLinks(container).find((a) =>
      (a.textContent ?? "").includes("L01")
    )
    expect(row).toBeDefined()
    expect(row!.getAttribute("href")).toBe(
      "/course/applied-ai-skills/lesson/lesson-1"
    )
    expect(row!.textContent).toContain("Lesson 1")
  })

  it("points each row at its own lesson, not all at the first", () => {
    const container = renderFresh()
    const byLabel = new Map(
      rowLinks(container).map((a) => [
        (a.textContent ?? "").slice(1, 4),
        a.getAttribute("href"),
      ])
    )
    expect(byLabel.get("L02")).toBe(
      "/course/applied-ai-skills/lesson/lesson-2"
    )
    expect(byLabel.get("L03")).toBe(
      "/course/applied-ai-skills/lesson/lesson-3"
    )
  })

  it("keeps the Start Lesson button as well as the clickable rows", () => {
    const container = renderFresh()
    const start = Array.from(container.querySelectorAll("a")).find((a) =>
      (a.textContent ?? "").trim().startsWith("Start Lesson 1")
    )
    expect(start).toBeDefined()
    expect(start!.getAttribute("href")).toBe(
      "/course/applied-ai-skills/lesson/lesson-1"
    )
    // Six upcoming rows are listed, and every one of them is now a link.
    expect(rowLinks(container).length).toBeGreaterThanOrEqual(6)
  })
})
