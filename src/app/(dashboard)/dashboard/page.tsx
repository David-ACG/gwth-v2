import type { Metadata } from "next"
import { getCourses } from "@/lib/data/courses"
import { getAllCourseProgress, getStreak } from "@/lib/data/progress"
import { getBookmarks } from "@/lib/data/bookmarks"
import { getNotifications } from "@/lib/data/notifications"
import { CourseCard } from "@/components/course/course-card"
import { StudyStreakCalendar } from "@/components/progress/study-streak-calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Bookmark } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your learning dashboard — courses, progress, and activity.",
}

/**
 * Dashboard overview page showing course cards with progress,
 * study streak calendar, recent activity, and bookmarks.
 */
export default async function DashboardPage() {
  const [courses, courseProgress, streak, bookmarks, notifications] =
    await Promise.all([
      getCourses(),
      getAllCourseProgress(),
      getStreak(),
      getBookmarks(),
      getNotifications(),
    ])

  const unreadNotifications = notifications.filter((n) => !n.read)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back! Continue where you left off.
        </p>
      </div>

      {/* Course cards with progress */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Your Courses</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const progress = courseProgress.find(
              (p) => p.courseId === course.id
            )
            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={progress?.progress}
              />
            )
          })}
        </div>
      </section>

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
              <CardTitle className="text-base">Notifications</CardTitle>
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
                  <Bell className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="mt-1.5 size-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
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
              You have {bookmarks.length} bookmarked items.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
