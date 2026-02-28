import type { Metadata } from "next"
import Link from "next/link"
import { getCourses } from "@/lib/data/courses"
import { getAllCourseProgress, getStreak } from "@/lib/data/progress"
import { getBookmarks } from "@/lib/data/bookmarks"
import { getNotifications } from "@/lib/data/notifications"
import { getMockUser, canAccessCourse } from "@/lib/auth"
import { ProgressRing } from "@/components/progress/progress-ring"
import { StudyStreakCalendar } from "@/components/progress/study-streak-calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Bell,
  Bookmark,
  ArrowRight,
  FlaskConical,
  Lock,
  Radar,
} from "lucide-react"
import { formatRelativeDate, formatProgress } from "@/lib/utils"
import { COURSE_MONTHLY_PRICE, MONTH_CONFIGS } from "@/lib/config"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your learning dashboard — course progress, labs, and activity.",
}

/**
 * Dashboard overview page. Shows different content based on subscription state:
 * - Registered (free): Labs, course teaser, subscribe CTA
 * - Subscriber: Course progress, current lesson, study streak, dynamic score
 * - Lapsed: Grace period warning, re-subscribe CTA
 */
export default async function DashboardPage() {
  const [user, courses, courseProgress, streak, bookmarks, notifications] =
    await Promise.all([
      getMockUser(),
      getCourses(),
      getAllCourseProgress(),
      getStreak(),
      getBookmarks(),
      getNotifications(),
    ])

  const state = user?.subscriptionState ?? "visitor"
  const hasCourseAccess = canAccessCourse(state)
  const course = courses[0] // Single GWTH course
  const progress = courseProgress.find((p) => p.courseId === course?.id)
  const unreadNotifications = notifications.filter((n) => !n.read)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {user?.name ?? "learner"}!
        </p>
      </div>

      {/* Lapsed subscription warning */}
      {state === "lapsed" && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h2 className="font-semibold text-destructive">
                Your subscription has lapsed
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your payment could not be processed. You still have access
                during the grace period, but please update your payment method
                to avoid losing access.
              </p>
            </div>
            <Button variant="destructive" asChild>
              <Link href="/settings">Update Payment</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Course progress section */}
      {hasCourseAccess && course ? (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Your Course</h2>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <ProgressRing
                  value={(progress?.progress ?? 0) * 100}
                  size={100}
                  strokeWidth={8}
                />
                <div className="flex-1">
                  <Link
                    href={`/course/${course.slug}`}
                    className="text-xl font-bold hover:text-primary transition-colors"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {progress
                      ? `${progress.completedLessons} of ${progress.totalLessons} lessons completed`
                      : "Start your journey"}
                  </p>
                  {progress && (
                    <div className="mt-3 max-w-sm space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Overall</span>
                        <span className="font-medium">
                          {formatProgress(progress.progress)}
                        </span>
                      </div>
                      <Progress
                        value={progress.progress * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                  <div className="mt-4">
                    <Button size="sm" className="gap-2" asChild>
                      <Link href={`/course/${course.slug}`}>
                        {progress && progress.progress > 0
                          ? "Continue Learning"
                          : "Start Course"}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Month progress indicators */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {MONTH_CONFIGS.map((month) => {
                  const monthSections = course.sections.filter(
                    (s) => s.month === month.month && !s.isOptional
                  )
                  const monthLessons = monthSections.flatMap((s) => s.lessons)
                  const completedInMonth = monthLessons.filter(
                    (l) => l.status === "completed"
                  ).length
                  const totalInMonth = monthLessons.length
                  const monthProgress =
                    totalInMonth > 0 ? completedInMonth / totalInMonth : 0

                  return (
                    <div
                      key={month.month}
                      className="rounded-lg border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Month {month.month}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {completedInMonth}/{totalInMonth}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {month.title}
                      </p>
                      <Progress
                        value={monthProgress * 100}
                        className="mt-2 h-1.5"
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        /* Free user — course teaser */
        <section>
          <h2 className="mb-4 text-xl font-semibold">The Course</h2>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <CardContent className="relative p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Lock className="size-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">
                    GWTH — Applied AI Skills
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    94 hands-on projects across 3 months. Build apps, automate
                    workflows, and solve real problems using AI — all in plain
                    English.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button className="gap-2" asChild>
                      <Link href="/pricing">
                        Subscribe — ${COURSE_MONTHLY_PRICE.toFixed(2)}/month
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/labs">Try a Free Lab First</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Quick links for free users */}
      {!hasCourseAccess && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-accent/10 p-3">
                <FlaskConical className="size-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Free Labs</h3>
                <p className="text-sm text-muted-foreground">
                  Build real projects with AI — no subscription required.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/labs">
                  Browse <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Radar className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Tech Radar</h3>
                <p className="text-sm text-muted-foreground">
                  60+ AI tools tracked and evaluated daily.
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tech-radar">
                  Explore <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Study Streak */}
        <Card>
          <CardContent className="p-6">
            <StudyStreakCalendar streak={streak} />
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="size-4" />
                Notifications
              </CardTitle>
              {unreadNotifications.length > 0 && (
                <Badge>{unreadNotifications.length} new</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 4).map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="mt-1.5 flex-1 space-y-0.5">
                    <p className="font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No notifications yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bookmark className="size-4" />
              Saved Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have {bookmarks.length} bookmarked{" "}
              {bookmarks.length === 1 ? "item" : "items"}.
            </p>
            <Button variant="link" className="mt-2 h-auto p-0" asChild>
              <Link href="/bookmarks">View all bookmarks</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
