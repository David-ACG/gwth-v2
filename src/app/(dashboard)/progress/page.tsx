import type { Metadata } from "next"
import Link from "next/link"
import {
  getAllCourseProgress,
  getAllLessonProgress,
  getStreak,
  getDynamicScore,
} from "@/lib/data/progress"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
import { getCourses } from "@/lib/data/courses"
import { StudyStreakCalendar } from "@/components/progress/study-streak-calendar"
import { formatDuration, formatProgress, getGradeFromScore } from "@/lib/utils"
import styles from "./progress-fde.module.css"

export const metadata: Metadata = {
  title: "Progress",
  description: "Track your learning progress and achievements.",
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
    <div className={styles.shell} data-section="progress">
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>Progress</h1>
        <p className={styles.mono}>Your record</p>
      </div>
      <p className={styles.pageLead}>
        {ENABLE_GWTH_SCORE
          ? "Track your learning journey and GWTH Score"
          : "Track your learning journey and course progress"}
      </p>

      {ENABLE_GWTH_SCORE && (
        <div className={styles.scorePanel}>
          <p className={styles.mono}>GWTH Score</p>
          <p className={styles.pageLead} style={{ marginTop: "0.4rem" }}>
            Your score reflects current competence. It grows as you learn and
            decays if updated content is not reviewed.
          </p>
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div>
              <div className={styles.scoreValue}>
                {dynamicScore.overallScore}
              </div>
              <p className={styles.mono}>
                of {dynamicScore.maxPossibleScore} possible
              </p>
            </div>
            <div className={`flex-1 ${styles.scoreFacts}`}>
              <div>
                <p className={styles.mono}>Percentile</p>
                <p className={styles.scoreFactValue}>
                  {dynamicScore.percentile}%
                </p>
              </div>
              <div>
                <p className={styles.mono}>Curiosity</p>
                <p className={styles.scoreFactValue}>
                  {Math.round(dynamicScore.curiosityIndex * 100)}%
                </p>
              </div>
              <div>
                <p className={styles.mono}>Consistency</p>
                <p className={styles.scoreFactValue}>
                  {dynamicScore.consistencyScore}
                </p>
              </div>
              <div>
                <p className={styles.mono}>Improvement</p>
                <p className={styles.scoreFactValue}>
                  +{dynamicScore.improvementRate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats overview (§5.6 stat list) */}
      <div className={styles.statList}>
        <div className={styles.statListRow}>
          <span className={styles.statListValue}>{completedLessons}</span>
          <span className={styles.statListLabel}>Lessons Completed</span>
          <span className={styles.mono}>All time</span>
        </div>
        <div className={styles.statListRow}>
          <span className={styles.statListValue}>
            {formatDuration(Math.round(totalTimeSpent / 60))}
          </span>
          <span className={styles.statListLabel}>Time Spent</span>
          <span className={styles.mono}>All time</span>
        </div>
        <div className={styles.statListRow}>
          <span className={styles.statListValue}>
            {streak.currentStreak} days
          </span>
          <span className={styles.statListLabel}>Current Streak</span>
          <span className={styles.mono}>
            Longest {streak.longestStreak} days
          </span>
        </div>
        <div className={styles.statListRow}>
          <span className={styles.statListValue}>
            {avgQuizScore !== null ? `${avgQuizScore}%` : "·"}
          </span>
          <span className={styles.statListLabel}>Avg Quiz Score</span>
          <span className={styles.mono}>
            {avgQuizScore !== null ? "Best attempts" : "No quizzes yet"}
          </span>
        </div>
      </div>

      {/* Study streak */}
      <div className={styles.streakPanel}>
        <StudyStreakCalendar streak={streak} />
      </div>

      {/* Course progress */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Course Progress</h2>
          <p className={styles.mono}>Issue by issue</p>
        </div>
        {courseProgress.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No progress yet</p>
            <p className={styles.emptyBody}>
              Start the course to track your progress here.
            </p>
            <div className="mt-5">
              <Link
                href="/course/applied-ai-skills"
                className={styles.buttonOutline}
              >
                Start the Course
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {courseProgress.map((cp) => {
              const course = courses.find((c) => c.id === cp.courseId)
              if (!course) return null
              return (
                <div key={cp.courseId} className={styles.courseRow}>
                  <div className="flex items-baseline justify-between gap-4 flex-wrap">
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    <span className={styles.coursePct}>
                      {formatProgress(cp.progress)}
                    </span>
                  </div>
                  <p className={`${styles.courseMeta} mt-1`}>
                    {cp.completedLessons} of {cp.totalLessons} lessons
                  </p>
                  <div className="mt-4">
                    <DashProgress
                      value={cp.completedLessons}
                      total={cp.totalLessons}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Certificates placeholder */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Certificates</h2>
          <p className={styles.mono}>Credential</p>
        </div>
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No certificates yet</p>
          <p className={styles.emptyBody}>
            Complete the course to earn your certificate.
          </p>
          <div className="mt-5">
            <Link
              href="/course/applied-ai-skills"
              className={styles.buttonOutline}
            >
              Continue Learning
            </Link>
          </div>
        </div>
      </section>

      {/* Quiz scores */}
      {lessonProgress.filter((lp) => lp.bestQuizScore !== null).length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Quiz Scores</h2>
            <p className={styles.mono}>Best attempts</p>
          </div>
          <div className={styles.quizGrid}>
            {lessonProgress
              .filter((lp) => lp.bestQuizScore !== null)
              .map((lp) => {
                const grade = getGradeFromScore(lp.bestQuizScore!)
                return (
                  <div key={lp.lessonId} className={styles.quizRow}>
                    <div>
                      <p className={styles.quizTitle}>Lesson {lp.lessonId}</p>
                      <p className={styles.quizMeta}>
                        {lp.quizAttempts} attempt
                        {lp.quizAttempts !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className={styles.quizScore}>
                        {lp.bestQuizScore}%
                      </span>
                      <span className={styles.mono}>Grade {grade}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * §4.5 dash-progress strip. aria-hidden; always rendered next to text that
 * states the same fact ("4 of 12 lessons").
 */
function DashProgress({ value, total }: { value: number; total: number }) {
  const segs = Math.max(1, Math.min(total, 24))
  const filled =
    total === 0 ? 0 : Math.round((Math.max(0, Math.min(value, total)) / total) * segs)
  return (
    <div className={styles.dashes} aria-hidden="true">
      {Array.from({ length: segs }, (_, dash) => (
        <span key={dash} data-active={dash < filled ? "true" : undefined} />
      ))}
    </div>
  )
}
