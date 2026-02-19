import type { Metadata } from "next"
import {
  getAllCourseProgress,
  getAllLessonProgress,
  getStreak,
  getDynamicScore,
} from "@/lib/data/progress"
import { getCourses } from "@/lib/data/courses"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ProgressRing } from "@/components/progress/progress-ring"
import { StudyStreakCalendar } from "@/components/progress/study-streak-calendar"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Trophy,
  TrendingUp,
  Brain,
  Target,
  Zap,
} from "lucide-react"
import { formatDuration, formatProgress, getGradeFromScore } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Progress",
  description: "Track your learning progress, dynamic score, and achievements.",
}

export default async function ProgressPage() {
  const [courseProgress, lessonProgress, streak, courses, dynamicScore] =
    await Promise.all([
      getAllCourseProgress(),
      getAllLessonProgress(),
      getStreak(),
      getCourses(),
      getDynamicScore(),
    ])

  const totalTimeSpent = lessonProgress.reduce(
    (sum, lp) => sum + lp.timeSpent,
    0
  )
  const completedLessons = lessonProgress.filter((lp) => lp.isCompleted).length
  const avgQuizScore =
    lessonProgress.filter((lp) => lp.bestQuizScore !== null).length > 0
      ? Math.round(
          lessonProgress
            .filter((lp) => lp.bestQuizScore !== null)
            .reduce((sum, lp) => sum + (lp.bestQuizScore ?? 0), 0) /
            lessonProgress.filter((lp) => lp.bestQuizScore !== null).length
        )
      : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="mt-1 text-muted-foreground">
          Track your learning journey and dynamic score
        </p>
      </div>

      {/* Dynamic Score */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">Dynamic Score</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your score reflects current competence. It grows as you learn and
            decays if updated content is not reviewed.
          </p>
          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {dynamicScore.overallScore}
              </div>
              <p className="text-xs text-muted-foreground">
                of {dynamicScore.maxPossibleScore} possible
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Target className="size-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    {dynamicScore.percentile}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Percentile</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Brain className="size-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    {Math.round(dynamicScore.curiosityIndex * 100)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Curiosity</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Zap className="size-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    {dynamicScore.consistencyScore}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Consistency</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="size-3.5 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    +{dynamicScore.improvementRate}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Improvement</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Lessons Completed</p>
            <p className="mt-1 text-3xl font-bold">{completedLessons}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Time Spent</p>
            <p className="mt-1 text-3xl font-bold">
              {formatDuration(Math.round(totalTimeSpent / 60))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="mt-1 text-3xl font-bold">
              {streak.currentStreak} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
            <p className="mt-1 text-3xl font-bold">
              {avgQuizScore !== null ? `${avgQuizScore}%` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Study streak */}
      <Card>
        <CardContent className="p-6">
          <StudyStreakCalendar streak={streak} />
        </CardContent>
      </Card>

      {/* Course progress */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Course Progress</h2>
        {courseProgress.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No progress yet"
            description="Start the course to track your progress here."
            action={{
              label: "Start the Course",
              href: "/course/applied-ai-skills",
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courseProgress.map((cp) => {
              const course = courses.find((c) => c.id === cp.courseId)
              if (!course) return null
              return (
                <Card key={cp.courseId}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <ProgressRing value={cp.progress} size={64}>
                      <span className="text-xs font-bold">
                        {formatProgress(cp.progress)}
                      </span>
                    </ProgressRing>
                    <div className="flex-1">
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cp.completedLessons}/{cp.totalLessons} lessons
                      </p>
                      <Progress
                        value={cp.progress * 100}
                        className="mt-2 h-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Certificates placeholder */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Certificates</h2>
        <EmptyState
          icon={Trophy}
          title="No certificates yet"
          description="Complete the course to earn your certificate."
          action={{
            label: "Continue Learning",
            href: "/course/applied-ai-skills",
          }}
        />
      </section>

      {/* Quiz scores */}
      {lessonProgress.filter((lp) => lp.bestQuizScore !== null).length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Quiz Scores</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {lessonProgress
              .filter((lp) => lp.bestQuizScore !== null)
              .map((lp) => {
                const grade = getGradeFromScore(lp.bestQuizScore!)
                return (
                  <Card key={lp.lessonId}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">
                          Lesson {lp.lessonId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lp.quizAttempts} attempt
                          {lp.quizAttempts !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {lp.bestQuizScore}%
                        </span>
                        <Badge variant="outline">Grade {grade}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </section>
      )}
    </div>
  )
}
