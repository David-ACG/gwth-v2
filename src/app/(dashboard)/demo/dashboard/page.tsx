import type { Metadata } from "next"
import { cn } from "@/lib/utils"
import { getCourses } from "@/lib/data/courses"
import {
  mockCourseProgress,
  mockLessonProgress,
  mockNotifications,
  mockStudyStreak,
} from "@/lib/data/mock-data"
import {
  ActiveDashboard,
  FreeDashboard,
  LapsedDashboard,
  DASHBOARD_BREAKOUT,
} from "@/app/(dashboard)/dashboard/page"
import type { User } from "@/lib/types"

export const metadata: Metadata = {
  title: "Demo — Dashboard",
  description: "Visual verification surface for the dashboard port.",
  robots: { index: false, follow: false },
}

const DEMO_USER_BASE: Omit<User, "subscriptionState" | "subscriptionMonth"> = {
  id: "demo_user",
  name: "Alex Example",
  email: "alex@example.com",
  avatarUrl: null,
  bio: null,
  gracePeriodEnds: null,
  lastPaymentDate: new Date("2026-04-08"),
  createdAt: new Date("2026-03-15"),
  updatedAt: new Date("2026-05-08"),
}

/**
 * Auth-bypassed demo of the dashboard for visual verification. /demo/* is
 * whitelisted in the Supabase middleware so this renders without a logged-in
 * user. Use ?state=active|free|lapsed to switch the rendered subscription
 * state.
 */
export default async function DemoDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>
}) {
  const params = await searchParams
  const state = params.state ?? "active"

  // A demo surface, not a session: it always renders the design fixtures
  // (real sessions get real derived data via the dashboard route, W14).
  const courses = await getCourses()
  const courseProgress = mockCourseProgress
  const lessonProgress = mockLessonProgress
  const streak = mockStudyStreak
  const notifications = mockNotifications
  const course = courses[0]
  const progress = course
    ? courseProgress.find((p) => p.courseId === course.id)
    : undefined

  if (state === "free") {
    const user: User = {
      ...DEMO_USER_BASE,
      name: "Sam Khan",
      subscriptionState: "registered",
      subscriptionMonth: 0,
    }
    return (
      <div
        className={cn(DASHBOARD_BREAKOUT, "font-sans")}
        data-variant="e2-e"
      >
        <FreeDashboard user={user} />
      </div>
    )
  }

  if (state === "lapsed") {
    const user: User = {
      ...DEMO_USER_BASE,
      subscriptionState: "lapsed",
      subscriptionMonth: 1,
      gracePeriodEnds: new Date("2026-05-23"),
    }
    return (
      <div
        className={cn(DASHBOARD_BREAKOUT, "font-sans")}
        data-variant="e2-e"
      >
        <LapsedDashboard
          user={user}
          course={course}
          progress={progress}
          lessonProgress={lessonProgress}
          notifications={notifications}
        />
      </div>
    )
  }

  // active (default)
  const user: User = {
    ...DEMO_USER_BASE,
    subscriptionState: "month1",
    subscriptionMonth: 1,
  }
  if (!course) {
    return <div>No course found</div>
  }
  return (
    <div className={cn(DASHBOARD_BREAKOUT, "font-sans")} data-variant="e2-e">
      <ActiveDashboard
        user={user}
        course={course}
        progress={progress}
        lessonProgress={lessonProgress}
        streak={streak}
        notifications={notifications}
      />
    </div>
  )
}
