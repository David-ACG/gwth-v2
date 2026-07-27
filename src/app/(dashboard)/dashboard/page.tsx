import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { getCourses } from "@/lib/data/courses"
import {
  getAllCourseProgress,
  getAllLessonProgress,
  getStreak,
} from "@/lib/data/progress"
import { getNotifications } from "@/lib/data/notifications"
import {
  getDashboardUser,
  canUserAccessCourse,
  isInGracePeriod,
} from "@/lib/auth"
import { HeroDevice } from "@/components/marketing/hero/hero-device"
import {
  ENABLE_BILLING,
  ENABLE_GWTH_SCORE,
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
} from "@/lib/config"
import { cn } from "@/lib/utils"
import type {
  User,
  Course,
  CourseProgress,
  LessonProgress,
  LessonSummary,
} from "@/lib/types"
import styles from "./dashboard-fde.module.css"
import { requireContentAccessOrRedirect } from "@/lib/content-access"

/**
 * Render per request, never statically. The dashboard is a per-user authed
 * page (real user via `getDashboardUser()` → `getCurrentUser()`); serving it as
 * a shared build-time static snapshot would show one user's view to all and
 * hide real state (W7). See the matching note on the progress page.
 */
export const dynamic = "force-dynamic"

/**
 * Paired with force-dynamic so the W25 content gate is evaluated per request
 * and can never be served from a cached or prerendered render.
 */
export const revalidate = 0

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your learning dashboard and course progress.",
}

/**
 * Tailwind classes used to negate the dashboard layout padding so section
 * borders run edge-to-edge inside the max-w-[1400px] wrapper. Exported for
 * the demo route to mirror the breakout.
 */
export const DASHBOARD_BREAKOUT =
  "-mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8"

/**
 * Student dashboard. Renders one of three FDE journal-register layouts based
 * on subscription state: active (month1/2/3/ongoing or grace period), lapsed,
 * or free (visitor/registered). The visual register is the FDE journal system
 * (see DESIGN_FDE.md): Source Serif 4 display + body, JetBrains Mono metadata,
 * paper surfaces with hairline rules, dash-progress strips, square corners.
 *
 * All numbers shown to a real session are real (W14): course progress and the
 * streak derive from `lesson_progress`, lesson rows come from the imported
 * course, and stores that do not exist yet (labs, portfolio, capstones,
 * notifications) render designed honest-zero states instead of fixtures.
 * Post-beta score panel reuses <HeroDevice /> behind a flag.
 */
export default async function DashboardPage() {
  await requireContentAccessOrRedirect()

  const [user, courses, courseProgress, lessonProgress, streak, notifications] =
    await Promise.all([
      getDashboardUser(),
      getCourses(),
      getAllCourseProgress(),
      getAllLessonProgress(),
      getStreak(),
      getNotifications(),
    ])

  const course = courses[0]
  const progress = course
    ? courseProgress.find((p) => p.courseId === course.id)
    : undefined

  // Layout breakout: the dashboard layout adds p-4..p-8 padding around children
  // and centers them inside max-w-[1400px]. The FDE register relies on section
  // borders running edge-to-edge, so we negate the padding here.
  const breakout = DASHBOARD_BREAKOUT

  if (!user) {
    return (
      <div className={breakout}>
        <FreeDashboard user={null} />
      </div>
    )
  }

  if (user.subscriptionState === "lapsed" && isInGracePeriod(user)) {
    return (
      <div className={breakout}>
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

  if (canUserAccessCourse(user) && course) {
    return (
      <div className={breakout}>
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

  return (
    <div className={breakout}>
      <FreeDashboard user={user} />
    </div>
  )
}

// ─── Active learner dashboard ─────────────────────────────────────────────────

export type ActiveDashboardProps = {
  user: User
  course: Course
  progress: CourseProgress | undefined
  /** The user's real lesson-progress rows; empty for a fresh account. */
  lessonProgress: LessonProgress[]
  streak: Awaited<ReturnType<typeof getStreak>>
  notifications: Awaited<ReturnType<typeof getNotifications>>
}

/**
 * A lesson from the course outline paired with its 1-based position and the
 * user's real progress row (if any). Derived per render in `deriveLessonPlan`.
 */
type PlannedLesson = {
  lesson: LessonSummary
  /** The month of the section this lesson belongs to (for the display month). */
  month: number
  number: number
  row: LessonProgress | undefined
}

/**
 * Flattens the course outline into syllabus order and splits it around the
 * user's real progress: how many are complete, and which lessons come next.
 * Honest zero for a fresh account: 0 complete, lesson 1 up next.
 *
 * Ordering is by the authoritative per-lesson `order` (1..N), NOT by section
 * grouping: the `sections` rows are unreliable (several tie at `order=0` with
 * scrambled ids), which previously scrambled the list and pointed Continue at
 * the wrong lesson (gwth-launch-26b). Each lesson carries its section month so
 * the dashboard can show the month of the content actually being studied.
 */
function deriveLessonPlan(course: Course, rows: LessonProgress[]) {
  const ordered = course.sections
    .flatMap((section) =>
      section.lessons.map((lesson) => ({ lesson, month: section.month }))
    )
    .sort((a, b) => a.lesson.order - b.lesson.order)
  const rowByLesson = new Map(rows.map((row) => [row.lessonId, row]))
  const planned: PlannedLesson[] = ordered.map((entry, index) => ({
    lesson: entry.lesson,
    month: entry.month,
    number: index + 1,
    row: rowByLesson.get(entry.lesson.id),
  }))
  const upcoming = planned.filter((p) => !p.row?.isCompleted)
  return { planned, upcoming, next: upcoming[0] }
}

/**
 * The month number shown across the dashboard. Derived from the content the
 * student is actually on (the section month of their next incomplete lesson,
 * or the last lesson's month once the syllabus is complete), rather than the
 * raw `subscriptionMonth` grant, which defaults to 3 for manual beta grants
 * even though only Month 1 is live (gwth-launch-26b). Clamped to 1..3.
 */
function deriveDisplayMonth(
  plan: ReturnType<typeof deriveLessonPlan>,
  subscriptionMonth: number
): number {
  const fromContent =
    plan.next?.month ??
    plan.planned[plan.planned.length - 1]?.month ??
    Math.max(1, subscriptionMonth)
  return Math.min(3, Math.max(1, fromContent))
}

/** Formats seconds of study time as decimal hours for the activity panel. */
function formatHours(seconds: number): string {
  return (seconds / 3600).toFixed(1)
}

export function ActiveDashboard({
  user,
  course,
  progress,
  lessonProgress,
  streak,
  notifications,
}: ActiveDashboardProps) {
  const completed = progress?.completedLessons ?? 0
  const total =
    progress?.totalLessons ??
    course.sections.flatMap((s) => s.lessons).length ??
    24
  const plan = deriveLessonPlan(course, lessonProgress)
  const { upcoming, next } = plan
  const monthNumber = deriveDisplayMonth(plan, user.subscriptionMonth)
  const nextLessonNumber = next?.number ?? completed + 1
  const nextLessonStarted = (next?.row?.progress ?? 0) > 0
  const nextLessonHref = next
    ? `/course/${course.slug}/lesson/${next.lesson.slug}`
    : `/course/${course.slug}`
  const timeSpentSeconds = lessonProgress.reduce(
    (sum, row) => sum + row.timeSpent,
    0
  )
  const quizzesPassed = lessonProgress.filter((row) => row.quizPassed).length
  const daysActive = streak.yearlyActivity.filter((d) => d.count > 0).length

  return (
    <div className={styles.shell} data-section="dashboard-active">
      <MastRow section={`DASHBOARD · TODAY`} date={formatToday()} />

      {/* TOP TASK BAND */}
      <section className={styles.band}>
        <div>
          <p className={styles.mono}>TODAY · {formatTimeBst()}</p>
          <h1 className={styles.bandTitle}>
            Welcome{completed > 0 ? " back" : ""}, {firstName(user.name)}.
            <br />
            <em>
              {completed > 0
                ? `${completed} of ${total} lessons complete.`
                : "Your first lesson is ready."}
            </em>
          </h1>
          <p className={styles.bandLead}>
            Month {monthNumber}, lesson {nextLessonNumber}.{" "}
            {ENABLE_GWTH_SCORE
              ? "Your GWTH Score grows as you complete verified work."
              : completed > 0
                ? "Your course progress is ready to continue."
                : "Everything starts from lesson one."}
          </p>
        </div>
        <div className={styles.bandAside}>
          <p className={styles.mono}>
            {next
              ? `NEXT, IF YOU HAVE ${next.lesson.duration} MINUTES`
              : "MONTH COMPLETE"}
          </p>
          <p className={cn(styles.mono, "mt-3")}>
            {next
              ? `LESSON ${nextLessonNumber} · MONTH ${monthNumber}`
              : `MONTH ${monthNumber} · ALL LESSONS DONE`}
          </p>
          <div className={styles.asideTitle}>
            {next ? next.lesson.title : "Every lesson is complete."}
          </div>
          <div className={styles.asideNote}>
            {next
              ? nextLessonStarted
                ? "Pick up where you left off."
                : completed > 0
                  ? "Fresh lesson, same rhythm."
                  : "Start here. It sets up everything that follows."
              : "New content unlocks with your next month."}
          </div>
          <div className={styles.actionRow}>
            <Link href={nextLessonHref} className={styles.buttonSolid}>
              {next
                ? completed > 0
                  ? `Continue Lesson ${nextLessonNumber}`
                  : "Start Lesson 1"
                : "Review the course"}
            </Link>
            <Link
              href={`/course/${course.slug}`}
              className={cn(styles.buttonOutline, styles.buttonSm)}
            >
              Course outline
            </Link>
          </div>
        </div>
      </section>

      {/* COURSE */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            Month {monthNumber} of 3. <em>Plain English.</em>
          </h2>
          <p className={styles.mono}>SECTION 01 · YOUR COURSE</p>
        </div>
        <div className="flex items-baseline justify-between">
          <span className={styles.mono}>
            {completed} / {total} mandatory
          </span>
        </div>
        <div className="mt-3">
          <Dashes value={completed} total={total} />
        </div>
        <div className={styles.dashMeta}>
          <span className={styles.mono}>MONTH {monthNumber} OF 3</span>
          <span className={styles.mono}>
            {completed} DONE · {Math.max(0, total - completed)} TO GO
          </span>
        </div>

        {/* lesson list — real course outline + real progress rows */}
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span />
            <span className={styles.mono}>NO.</span>
            <span className={styles.mono}>LESSON</span>
            <span className={styles.mono}>LENGTH</span>
          </div>
          {completed > 0 && (
            <div className={styles.tableRow}>
              <span className={styles.glyphDone} aria-hidden="true">
                ✓
              </span>
              <span className={styles.mono}>DONE</span>
              <span className={styles.rowTitle}>
                {completed} lesson{completed === 1 ? "" : "s"} complete.{" "}
                <span className={styles.rowNote}>
                  Revisit any of them from the course page.
                </span>
              </span>
              <Link href={`/course/${course.slug}`} className={styles.monoLinkMuted}>
                REVIEW →
              </Link>
            </div>
          )}
          {upcoming.slice(0, 6).map((planned, index) => (
            <LessonRow
              key={planned.lesson.id}
              num={planned.number}
              title={planned.lesson.title}
              length={`${planned.lesson.duration} MIN`}
              state={
                index === 0
                  ? nextLessonStarted
                    ? "current"
                    : "next"
                  : "pending"
              }
              tag={planned.lesson.isOptional ? "OPTIONAL" : undefined}
              href={`/course/${course.slug}/lesson/${planned.lesson.slug}`}
            />
          ))}
          {upcoming.length === 0 && (
            <div className={styles.tableRow}>
              <span className={styles.glyphDone} aria-hidden="true">
                ✓
              </span>
              <span className={styles.mono}>ALL</span>
              <span className={styles.rowTitle}>
                Every lesson this month is complete.
              </span>
              <span />
            </div>
          )}
          <div className={styles.tableFoot}>
            <span className={styles.mono}>
              + {Math.max(0, upcoming.length - 6)} MORE LESSONS THIS MONTH
            </span>
            <Link href={`/course/${course.slug}`} className={styles.monoLink}>
              VIEW ALL {total} →
            </Link>
          </div>
        </div>

        {/* upcoming months */}
        <div className={styles.cardsRow}>
          <div className={styles.card}>
            <div className={cn(styles.cardTop, styles.flvMoss)}>
              <span>MONTH 02 · LOCKED</span>
              <span>No. 02</span>
            </div>
            <div className={styles.cardBody}>
              <h3>Apps, agents, and the consultant&rsquo;s skill.</h3>
              <p className={styles.cardNote}>
                20 mandatory plus 15 optional. Build towards app fluency.
              </p>
              <div className={styles.cardFoot}>
                <span className={styles.monoStrong}>UNLOCKS AFTER MONTH 01</span>
                <span className={styles.mono}>35 lessons</span>
              </div>
            </div>
          </div>
          <div className={styles.card}>
            <div className={cn(styles.cardTop, styles.flvTeal)}>
              <span>MONTH 03 · LOCKED</span>
              <span>No. 03</span>
            </div>
            <div className={styles.cardBody}>
              <h3>Enterprise transformation, in your job.</h3>
              <p className={styles.cardNote}>
                20 mandatory plus 15 optional. Build towards enterprise fluency.
              </p>
              <div className={styles.cardFoot}>
                <span className={styles.monoStrong}>UNLOCKS AFTER MONTH 02</span>
                <span className={styles.mono}>35 lessons</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRESS + CURRENTNESS */}
      <div className={styles.splitGrid}>
        <div className={styles.splitCell}>
          <p className={styles.mono}>
            {ENABLE_GWTH_SCORE ? "SECTION 02 · YOUR GWTH SCORE" : "SECTION 02 · YOUR PROGRESS"}
          </p>
          <h2 className={cn(styles.sectionTitle, "mt-3")}>
            {ENABLE_GWTH_SCORE ? (
              <>
                <em>Your score.</em> It grows with verified work.
              </>
            ) : completed > 0 ? (
              <>
                <em>{completed} complete.</em> {total - completed} lessons to go.
              </>
            ) : (
              <>
                <em>Not started yet.</em> {total} lessons ahead of you.
              </>
            )}
          </h2>

          {ENABLE_GWTH_SCORE ? (
            <div className="mt-5 max-w-[520px]">
              <HeroDevice />
            </div>
          ) : (
            <div className={styles.panel} style={{ maxWidth: "32rem" }}>
              <div className="flex items-baseline justify-between">
                <span className={styles.mono}>Course progress</span>
                <span className={styles.monoStrong}>
                  {completed} / {total}
                </span>
              </div>
              <div className="mt-4">
                <Dashes value={completed} total={total} />
              </div>
            </div>
          )}

          {ENABLE_GWTH_SCORE && (
            <div className={styles.actionRow}>
              <Link href="#" className={cn(styles.buttonOutline, styles.buttonSm)}>
                Copy public URL
              </Link>
              <Link href="#" className={cn(styles.buttonOutline, styles.buttonSm)}>
                Add to LinkedIn
              </Link>
              <Link href="#" className={cn(styles.buttonOutline, styles.buttonSm)}>
                Download QR
              </Link>
            </div>
          )}
        </div>

        <div className={styles.splitCell}>
          <p className={styles.mono}>
            {ENABLE_GWTH_SCORE ? "SECTION 03 · CREDENTIAL CURRENTNESS" : "SECTION 03 · COURSE CURRENTNESS"}
          </p>
          <h2 className={cn(styles.sectionTitle, "mt-3")}>
            Course is current.{" "}
            <em>It updates as the tools change.</em>
          </h2>
          <div className={styles.panel}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className={styles.listTitle}>
                  Lessons track the tools they teach.
                </div>
                <div className={styles.listMeta}>
                  When a tool changes, the affected lesson is re-recorded.
                </div>
              </div>
              <span className={styles.statusGood}>✓ Current</span>
            </div>
          </div>

          {/* Lessons updated — no update log store yet, honest empty feed */}
          <div className="mt-7">
            <div className="flex justify-between items-baseline gap-4">
              <p className={styles.mono}>UPDATED SINCE YOU LAST WATCHED · 0</p>
            </div>
            <p className={cn(styles.note, "mt-2")}>
              The course updates as the tools do. When a lesson you have
              watched is re-recorded, it will be listed here for a short
              re-watch.
            </p>
          </div>
        </div>
      </div>

      {/* ACTIVITY — all values derived from lesson_progress (W14) */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            Five-hour rhythm.{" "}
            <em>
              {streak.currentStreak > 0
                ? `Held for ${streak.currentStreak} day${streak.currentStreak === 1 ? "" : "s"}.`
                : "It starts with your first session."}
            </em>
          </h2>
          <p className={styles.mono}>SECTION 04 · ACTIVITY</p>
        </div>
        <div className={styles.activityGrid}>
          <div className={styles.activityCell}>
            <p className={styles.mono}>HOURS LOGGED · ALL TIME</p>
            <div className={styles.hugeNum}>{formatHours(timeSpentSeconds)}</div>
            <p className={styles.activityNote}>
              {timeSpentSeconds > 0
                ? "Logged against your lessons. The course is built around five hours a week."
                : "The course is built around five hours a week. Your study time will log here."}
            </p>
            <div className={styles.factPair}>
              <div>
                <p className={styles.mono}>LESSONS COMPLETE</p>
                <p className={styles.factValue}>{completed}</p>
              </div>
              <div>
                <p className={styles.mono}>QUIZZES PASSED</p>
                <p className={styles.factValue}>{quizzesPassed}</p>
              </div>
            </div>
          </div>

          <div className={styles.activityCell}>
            <div className="flex justify-between items-baseline gap-3 flex-wrap">
              <p className={styles.mono}>LAST 12 WEEKS</p>
              <p className={styles.mono}>EVERY GREEN CELL · A DAY YOU STUDIED</p>
            </div>
            <div className="mt-5">
              <ActivityHeatmap
                data={streak.yearlyActivity
                  .slice(-84)
                  .map((day) => Math.min(day.count, 4))}
              />
            </div>
          </div>

          <div className={styles.activityCellTeal}>
            <p className={styles.tealMono}>CURRENT STREAK</p>
            <div className={styles.hugeNumCream}>
              {streak.currentStreak}
              <span className={styles.hugeNumUnit}>
                {streak.currentStreak === 1 ? "DAY" : "DAYS"}
              </span>
            </div>
            <p className={styles.activityNoteCream}>
              {streak.longestStreak > 0
                ? `Longest yet: ${streak.longestStreak} day${streak.longestStreak === 1 ? "" : "s"}.`
                : "Complete a lesson to start your streak."}
            </p>
            <div className={styles.tealDivider}>
              <p className={styles.tealMono}>DAYS ACTIVE</p>
              <div className={styles.hugeNumCream} style={{ fontSize: "2.6rem" }}>
                {daysActive}
              </div>
              <p className={styles.activityNoteCream}>
                Calendar days with study activity this year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            Every lesson ships a project. <em>They all live here.</em>
          </h2>
          <p className={styles.mono}>SECTION 05 · PORTFOLIO</p>
        </div>

        {/* capstone strip — no capstone store yet, honest zero (W14) */}
        <div className={styles.capstoneStrip}>
          <span className={styles.tealMono}>CAPSTONE PROJECTS · 0 OF 3</span>
          <span className="flex gap-2 items-center">
            <CapstoneTick state="brief" label="C01" />
            <CapstoneTick state="locked" label="C02" />
            <CapstoneTick state="locked" label="C03" />
          </span>
          <span className={styles.capstoneNote}>
            Three pieces of verifiable work, one per month. These projects count
            for credential.
          </span>
        </div>

        {/* portfolio grid — no portfolio store yet, designed empty state */}
        <div className={styles.portfolioGrid}>
          <div className={styles.portfolioCell}>
            <p className={styles.mono}>SHIPPED · 0 PROJECTS</p>
            <div
              className={cn(styles.listTitle, "mt-2")}
              style={{ fontSize: "1.05rem" }}
            >
              Your first build lands here.
            </div>
            <p className={cn(styles.note, "mt-2")}>
              Every lesson ships a small project. As you complete builds and
              Capstone projects they are collected here, ready to show.
            </p>
            <div className="mt-4 flex justify-between items-center gap-3 flex-wrap">
              <span className={styles.mono}>
                LESSON PROJECTS ARE REVIEWED SEPARATELY · LABS ARE PRACTICE
              </span>
            </div>
          </div>

          <div className={styles.portfolioCell}>
            <p className={styles.mono}>SAVED</p>
            <div className={cn(styles.listTitle, "mt-2")} style={{ fontSize: "1.05rem" }}>
              Bookmarks, drafts, notes.
            </div>
            <p className={cn(styles.note, "mt-2")}>
              Bookmark lessons and labs to keep them within reach.
            </p>
            <Link
              href="/bookmarks"
              className={cn(styles.monoLink, "mt-4 inline-block")}
            >
              OPEN SAVED →
            </Link>
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className={styles.section}>
        <div className="flex justify-between items-baseline gap-4">
          <p className={styles.mono}>SECTION 06 · NOTIFICATIONS</p>
          <Link href="/notifications" className={styles.monoLinkMuted}>
            MARK ALL READ
          </Link>
        </div>
        <div className="mt-4 flex flex-col">
          {notifications.length === 0 ? (
            <div className={cn(styles.bodyText, "py-3")}>
              No notifications yet.
            </div>
          ) : (
            notifications
              .slice(0, 5)
              .map((n) => (
                <NotifRow
                  key={n.id}
                  time={formatNotificationTime(n.createdAt)}
                  tag={n.type.toUpperCase()}
                  body={n.title}
                />
              ))
          )}
        </div>
      </section>

      <DashFooter />
    </div>
  )
}

// ─── Free / registered learner dashboard ──────────────────────────────────────

export function FreeDashboard({ user }: { user: User | null }) {
  const name = user ? firstName(user.name) : "there"
  return (
    <div className={styles.shell} data-section="dashboard-free">
      <MastRow section="DASHBOARD · LABS" date={formatToday()} />

      <section className={styles.band}>
        <div>
          <p className={styles.mono}>FREE LABS · INVITE REQUIRED FOR COURSE</p>
          <h1 className={styles.bandTitle}>
            Welcome, {name}.
            <br />
            <em>Try a lab. Decide later.</em>
          </h1>
          <p className={styles.bandLead}>
            You have access to all 18 free labs. The course is £
            {COURSE_MONTHLY_PRICE.toFixed(0)}/month, one month at a time, and £
            {ONGOING_MONTHLY_PRICE.toFixed(2)}/month to stay current after it;
            access is currently invite-only and manually granted.
          </p>
        </div>
        <div className={styles.bandAside}>
          <p className={styles.mono}>BETA · INVITE ONLY</p>
          <div className={styles.asideTitle}>
            Month 1 unlocks Building with Claude, Codex and the consultant&rsquo;s
            prompt patterns.
          </div>
          <div className={styles.asideNote}>
            24 mandatory lessons, six optional. Five hours a week.
          </div>
          <div className={styles.actionRow}>
            <Link
              href={ENABLE_BILLING ? "/pricing" : "/signup"}
              className={styles.buttonSolid}
            >
              {ENABLE_BILLING
                ? `Buy month 1 · £${COURSE_MONTHLY_PRICE.toFixed(0)}`
                : "Request beta access"}
            </Link>
            <Link href="/about" className={cn(styles.buttonOutline, styles.buttonSm)}>
              Read the brief
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            24 lessons. <em>Plain English.</em>
          </h2>
          <p className={styles.mono}>SECTION 01 · WHAT MONTH 1 ACTUALLY CONTAINS</p>
        </div>
        <div className={styles.teaserGrid}>
          <TeaserCol
            num="01"
            title="Past ChatGPT-as-Google"
            body="Six lessons that move you from search-style prompting to real intent and iteration."
          />
          <TeaserCol
            num="02"
            title="Three small builds"
            body="A spreadsheet QA, an email triage, a brief generator. All shippable, all reviewed."
          />
          <TeaserCol
            num="03"
            title="Capstone project 01"
            body="One internal-use tool you build with Claude Code. Reviewed by a human."
          />
        </div>
      </section>

      <div className={styles.splitGridWide}>
        <div className={styles.splitCell}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              18 public labs. <em>Use them tonight.</em>
            </h2>
            <p className={styles.mono}>SECTION 02 · FREE LABS · PRACTICE</p>
          </div>
          <p className={styles.mono}>NO CARD REQUIRED</p>
          <div className={styles.labList}>
            <LabFullRow title="Resume rewriter for non-tech roles" tag="JOB SEARCH" duration="40 MIN" />
            <LabFullRow title="Email triage with three rules" tag="OPS" duration="25 MIN" />
            <LabFullRow title="Spreadsheet QA in plain English" tag="OPS" duration="35 MIN" />
            <LabFullRow title="Brief generator for marketing teams" tag="MARKETING" duration="50 MIN" />
            <LabFullRow title="Reading dense PDFs without reading them" tag="RESEARCH" duration="30 MIN" />
            <div className={styles.tableFoot}>
              <span className={styles.mono}>+ 13 MORE</span>
              <Link href="/labs" className={styles.monoLink}>
                BROWSE ALL 18 →
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.splitCell}>
          <p className={styles.mono}>SECTION 03 · BETA ACCESS</p>
          <h2 className={cn(styles.sectionTitle, "mt-3")}>
            <em>Invite-only.</em> Public signup and billing are closed for beta.
          </h2>
          <div className={styles.panel}>
            <p className={styles.mono}>Plain beta progress</p>
            <div className={cn(styles.bigStat, "mt-2")}>18 free labs</div>
            <p className={cn(styles.bodyText, "mt-2")}>
              Approved learners receive course access from the GWTH team.
              Everyone else can join the waitlist and keep using the labs.
            </p>
          </div>
        </div>
      </div>

      <section className={styles.section} style={{ borderBottom: 0 }}>
        <p className={styles.note} style={{ fontSize: "1.05rem", maxWidth: "44rem" }}>
          Stay Current opens after the course to keep your knowledge updated,
          with about two hours of new content a month.
        </p>
      </section>

      <DashFooter />
    </div>
  )
}

// ─── Lapsed dashboard ─────────────────────────────────────────────────────────

export function LapsedDashboard({
  user,
  course,
  progress,
  lessonProgress,
}: {
  user: User
  course: Course | undefined
  progress: CourseProgress | undefined
  /** The user's real lesson-progress rows; empty for a fresh account. */
  lessonProgress: LessonProgress[]
  notifications: Awaited<ReturnType<typeof getNotifications>>
}) {
  const completed = progress?.completedLessons ?? 0
  const total =
    progress?.totalLessons ??
    course?.sections.flatMap((s) => s.lessons).length ??
    24
  const plan = course ? deriveLessonPlan(course, lessonProgress) : null
  const { upcoming, next } = plan ?? { upcoming: [], next: undefined }
  const monthNumber = plan
    ? deriveDisplayMonth(plan, user.subscriptionMonth)
    : Math.max(1, user.subscriptionMonth)
  const nextLessonNumber = next?.number ?? completed + 1
  const nextLessonStarted = (next?.row?.progress ?? 0) > 0
  const graceEndsLabel = user.gracePeriodEnds
    ? user.gracePeriodEnds
        .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
        .toUpperCase()
    : null
  return (
    <div className={styles.shell} data-section="dashboard-lapsed">
      <MastRow section="DASHBOARD · TODAY" date={formatToday()} />

      {/* GRACE BANNER */}
      <div className={styles.graceBanner}>
        <div className="flex items-center gap-5 flex-wrap">
          <span className={styles.statusWarm}>
            ▲ {ENABLE_BILLING ? "PAYMENT FAILED · 4 MAY" : "ACCOUNT REVIEW · BETA"}
          </span>
          <div className={styles.graceText}>
            {ENABLE_BILLING
              ? "Your card was declined. You have 6 days left in your grace period before access changes."
              : "Your beta access needs manual review. Lessons stay visible while GWTH resolves the account state."}
          </div>
        </div>
        <div className={cn(styles.actionRow, "shrink-0")} style={{ marginTop: 0 }}>
          <Link href="/settings" className={styles.buttonSolid}>
            {ENABLE_BILLING ? "Update payment" : "Contact GWTH"}
          </Link>
          <Link href="/settings" className={cn(styles.buttonOutline, styles.buttonSm)}>
            {ENABLE_BILLING ? "Pause instead" : "View settings"}
          </Link>
        </div>
      </div>

      {/* TOP TASK BAND */}
      <section className={styles.band}>
        <div>
          <p className={styles.mono}>TODAY · {formatTimeBst()}</p>
          <h1 className={styles.bandTitle}>
            You&rsquo;re still on track,
            <br />
            {firstName(user.name)}.
            <br />
            <em>{ENABLE_BILLING ? "Just not paid up." : "Access under review."}</em>
          </h1>
          <p className={styles.bandLead}>
            {graceEndsLabel
              ? `Lessons stay open through ${graceEndsLabel}. `
              : "Lessons stay open through your grace window. "}
            Your course progress is paused until access is restored manually.
          </p>
        </div>
        <div className={styles.bandAside}>
          <p className={styles.mono}>
            {next
              ? `NEXT, IF YOU HAVE ${next.lesson.duration} MINUTES`
              : "YOUR COURSE"}
          </p>
          <p className={cn(styles.mono, "mt-3")}>
            LESSON {nextLessonNumber} · MONTH {monthNumber} · STILL OPEN
          </p>
          <div className={styles.asideTitle}>
            {next ? next.lesson.title : "Your lessons are still open."}
          </div>
          <div className={styles.asideNote}>
            Lessons keep working through your grace window.
          </div>
          <div className={styles.actionRow}>
            <Link
              href={
                next && course
                  ? `/course/${course.slug}/lesson/${next.lesson.slug}`
                  : course
                    ? `/course/${course.slug}`
                    : "/courses"
              }
              className={styles.buttonOutline}
            >
              Continue Lesson {nextLessonNumber} →
            </Link>
            <Link href="/settings" className={cn(styles.buttonSolid, styles.buttonSm)}>
              {ENABLE_BILLING ? "Resubscribe" : "Contact support"}
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <div className={styles.splitGridWide}>
        <div className={styles.splitCell}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Month {monthNumber} of 3.
            </h2>
            <p className={styles.mono}>SECTION 01 · YOUR COURSE · STILL OPEN</p>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={styles.mono}>
              {completed} / {total} mandatory
            </span>
          </div>
          <div className="mt-3">
            <Dashes value={completed} total={total} frozen />
          </div>
          <div className={styles.dashMeta}>
            <span className={styles.mono}>
              {graceEndsLabel
                ? `OPEN UNTIL ${graceEndsLabel}`
                : "OPEN THROUGH YOUR GRACE WINDOW"}
            </span>
            <span className={styles.statusWarm}>
              ▲ {ENABLE_BILLING ? "UPDATE PAYMENT TO CONTINUE" : "MANUAL REVIEW REQUIRED"}
            </span>
          </div>

          <div className={styles.table}>
            {upcoming.slice(0, 5).map((planned, index) => (
              <LessonRow
                key={planned.lesson.id}
                num={planned.number}
                title={planned.lesson.title}
                length={`${planned.lesson.duration} MIN`}
                state={
                  index === 0
                    ? nextLessonStarted
                      ? "current"
                      : "next"
                    : "pending"
                }
                tag={planned.lesson.isOptional ? "OPTIONAL" : undefined}
                href={
                  course
                    ? `/course/${course.slug}/lesson/${planned.lesson.slug}`
                    : undefined
                }
              />
            ))}
            <div className={styles.tableFoot}>
              <span className={styles.statusWarm}>
                ▲ LESSONS LOCK IF GRACE LAPSES
              </span>
              <Link href="/settings" className={styles.monoLink}>
                {ENABLE_BILLING ? "UPDATE CARD →" : "CONTACT SUPPORT →"}
              </Link>
            </div>
          </div>

          {/* impact callout */}
          <div className={styles.impactGrid}>
            <div className={styles.impactCell}>
              <p className={styles.mono}>
                {ENABLE_BILLING
                  ? graceEndsLabel
                    ? `IF YOU UPDATE BY ${graceEndsLabel}`
                    : "IF YOU UPDATE IN TIME"
                  : "IF ACCESS IS RESTORED"}
              </p>
              <p className={styles.impactNote}>
                Nothing changes. Lessons stay open and your Capstone project keeps
                its review slot.
              </p>
            </div>
            <div className={styles.impactCell}>
              <p className={styles.statusWarm}>▲ IF YOU DON&rsquo;T</p>
              <p className={styles.impactNote}>
                Lessons close when your grace window ends. Your progress is
                retained, and you can resume at any time with no re-enrolment.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.splitCell}>
          <p className={styles.mono}>
            {ENABLE_GWTH_SCORE
              ? "SECTION 02 · YOUR GWTH SCORE · FROZEN"
              : "SECTION 02 · PROGRESS PAUSED"}
          </p>
          <h2 className={cn(styles.sectionTitle, "mt-3")}>
            <em>Holding.</em>{" "}
            {ENABLE_GWTH_SCORE ? "No new verification." : "No new course progress."}
          </h2>

          {ENABLE_GWTH_SCORE ? (
            <div className="mt-5">
              <HeroDevice />
            </div>
          ) : (
            <div className={styles.panel}>
              <p className={styles.mono}>Course progress</p>
              <div className={cn(styles.bigStat, "mt-2")}>
                {completed} / {total}
              </div>
              <div className="mt-3">
                <Dashes value={completed} total={total} frozen />
              </div>
            </div>
          )}

          <div className={styles.panelRust}>
            <p className={styles.statusWarm}>
              ▲ {ENABLE_GWTH_SCORE ? "WHAT EMPLOYERS SEE NOW" : "WHAT HAPPENS NOW"}
            </p>
            <p className={cn(styles.bodyText, "mt-2")}>
              {ENABLE_GWTH_SCORE
                ? "The public URL is marked frozen until access resumes."
                : "Course progress is paused until access is restored manually."}
            </p>
          </div>

          <div className="mt-5 pt-5" style={{ borderTop: "1px solid var(--v-line)" }}>
            <p className={styles.mono}>SECTION 03 · ACCOUNT</p>
            {ENABLE_BILLING ? (
              <div className={styles.panel}>
                <div className="flex justify-between items-center mb-2 gap-3">
                  <span className={styles.monoStrong}>PAYMENT METHOD</span>
                  <span className={styles.statusWarm}>▲ Payment failed</span>
                </div>
                <div className={styles.note}>
                  Your last payment did not go through. Update your card in
                  settings to keep access.
                </div>
                <div className={cn(styles.actionRow, "mt-4")}>
                  <Link href="/settings" className={cn(styles.buttonSolid, styles.buttonSm)}>
                    Update card
                  </Link>
                  <Link href="/settings" className={cn(styles.buttonOutline, styles.buttonSm)}>
                    Pause for a month
                  </Link>
                </div>
              </div>
            ) : (
              <div className={styles.panel}>
                <div className={styles.listTitle}>
                  Billing is disabled for beta.
                </div>
                <p className={cn(styles.bodyText, "mt-1")}>
                  Course access changes are handled manually by the GWTH team.
                </p>
                <div className={cn(styles.actionRow, "mt-3")}>
                  <Link href="/contact" className={cn(styles.buttonOutline, styles.buttonSm)}>
                    Contact GWTH
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* postscript */}
      <section className={styles.postscript}>
        <p className={styles.tealMono}>SECTION 04 · POSTSCRIPT</p>
        <h3 className={styles.postscriptTitle}>
          Progress pauses
          <br />
          <em>until access is restored.</em>
        </h3>
        <p className={cn(styles.postscriptBody, "mt-4")} style={{ maxWidth: "40rem" }}>
          Billing is disabled during beta, so account changes go through the
          manual access process instead of billing self-service.
        </p>
      </section>

      <DashFooter />
    </div>
  )
}

// ─── Inline subcomponents ─────────────────────────────────────────────────────

function MastRow({ section, date }: { section: string; date: string }) {
  return (
    <div className={styles.mastRow}>
      <span className={styles.mono}>{section}</span>
      <span className={styles.mono}>{date}</span>
      <span className={styles.mono}>BETA</span>
    </div>
  )
}

/**
 * §4.5 dash-progress strip. aria-hidden; every usage sits next to text that
 * states the same fact ("12 / 24 mandatory", "CURRENTNESS 92%").
 */
function Dashes({
  value,
  total,
  segments,
  frozen = false,
}: {
  value: number
  total: number
  segments?: number
  frozen?: boolean
}) {
  const segs = segments ?? Math.max(1, Math.min(total, 24))
  const filled =
    total === 0 ? 0 : Math.round((Math.max(0, Math.min(value, total)) / total) * segs)
  return (
    <div
      className={styles.dashes}
      aria-hidden="true"
      data-frozen={frozen ? "true" : undefined}
    >
      {Array.from({ length: segs }, (_, dash) => (
        <span key={dash} data-active={dash < filled ? "true" : undefined} />
      ))}
    </div>
  )
}

/** The visual states a lesson row can be in. `next` = up next, untouched. */
type LessonRowState = "done" | "current" | "next" | "pending" | "locked"

/** Lesson-state glyph. Always paired with the row's text state label. */
function StateGlyph({ state }: { state: LessonRowState }) {
  if (state === "done") {
    return (
      <span className={styles.glyphDone} aria-hidden="true">
        ✓
      </span>
    )
  }
  if (state === "current" || state === "next") {
    return (
      <span className={styles.glyphCurrent} aria-hidden="true">
        ●
      </span>
    )
  }
  return (
    <span className={styles.glyphMuted} aria-hidden="true">
      ○
    </span>
  )
}

/**
 * One lesson in a dashboard list.
 *
 * The whole row is a link when `href` is given. It used to be an inert `<div>`,
 * so clicking a lesson did nothing and the only way in was the "Start lesson"
 * button at the top of the page: David reported on 2026-07-26 that this is not
 * what anyone expects, and that the button should stay as well as the rows
 * working. A locked row stays inert, because there is nothing to open yet.
 */
function LessonRow({
  num,
  title,
  length,
  state,
  tag,
  href,
}: {
  num: number
  title: string
  length: string
  state: LessonRowState
  tag?: string
  /** Lesson URL. Omit (or pass undefined) to render an inert row. */
  href?: string
}) {
  const highlighted = state === "current" || state === "next"
  const stateLabel = {
    done: "DONE",
    current: "IN PROGRESS",
    next: "NEXT UP",
    pending: "",
    locked: "NEXT MONTH",
  }[state]
  // A locked row has nothing to open, so it stays inert even if a href is
  // passed. Branching on the element rather than using a dynamic tag keeps
  // next/link's `href` required, so a missing URL is a type error not a
  // silently dead row.
  const interactive = state !== "locked" && Boolean(href)
  const className = cn(
    styles.tableRow,
    highlighted && styles.tableRowCurrent,
    state === "locked" && styles.tableRowLocked,
    interactive && styles.tableRowLink
  )
  const inner = (
    <>
      <StateGlyph state={state} />
      <span className={styles.mono}>L{String(num).padStart(2, "0")}</span>
      <span>
        <span
          className={cn(
            styles.rowTitle,
            highlighted && styles.rowTitleCurrent
          )}
        >
          {title}
          {tag && (
            <span className={cn(styles.statusMuted, "ml-2")}>{tag}</span>
          )}
        </span>
        {stateLabel && (
          <span
            className={cn(
              "block mt-0.5",
              highlighted ? styles.statusGood : styles.statusMuted
            )}
          >
            {stateLabel}
          </span>
        )}
      </span>
      <span className={styles.mono}>{length}</span>
    </>
  )
  if (interactive) {
    return (
      <Link href={href as string} className={className}>
        {inner}
      </Link>
    )
  }
  return <div className={className}>{inner}</div>
}

/**
 * 12-week activity heatmap (12 × 7 = 84 cells). `data` is the user's REAL
 * per-day activity counts, oldest first (W14) — there is no fixture default.
 */
function ActivityHeatmap({ data }: { data: number[] }) {
  const cells = data
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  return (
    <div className={styles.heatGrid}>
      <div />
      {days.map((d, i) => (
        <div key={i} className={styles.heatLabel}>
          {d}
        </div>
      ))}
      {Array.from({ length: 12 }).map((_, week) => (
        <React.Fragment key={week}>
          <div className={styles.heatLabel}>W{week + 1}</div>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const heat = cells[week * 7 + day] ?? 0
            return (
              <div
                key={day}
                className={styles.heatCell}
                data-heat={heat > 0 ? heat : undefined}
              />
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}

function CapstoneTick({
  state,
  label,
}: {
  state: "approved" | "brief" | "locked"
  label: string
}) {
  return (
    <span
      className={
        state === "approved"
          ? styles.tickApproved
          : state === "brief"
            ? styles.tickBrief
            : styles.tick
      }
    >
      {state === "approved" ? "✓ " : state === "brief" ? "● " : "○ "}
      {label}
    </span>
  )
}

function NotifRow({
  time,
  tag,
  body,
}: {
  time: string
  tag: string
  body: string
}) {
  return (
    <div className={styles.notifRow}>
      <span className={styles.mono}>{time}</span>
      <span className={styles.monoStrong}>{tag}</span>
      <span className={styles.notifBody}>{body}</span>
    </div>
  )
}

function TeaserCol({
  num,
  title,
  body,
}: {
  num: string
  title: string
  body: string
}) {
  return (
    <div className={styles.teaserCell}>
      <p className={styles.mono}>UNIT {num}</p>
      <div className={styles.teaserTitle}>{title}</div>
      <div className={styles.teaserBody}>{body}</div>
    </div>
  )
}

function LabFullRow({
  title,
  tag,
  duration,
}: {
  title: string
  tag: string
  duration: string
}) {
  return (
    <div className={styles.labRow}>
      <span className={styles.mono}>{tag}</span>
      <span className={styles.labTitle}>{title}</span>
      <span className={styles.mono}>{duration}</span>
      <Link href="/labs" className={styles.monoLink}>
        OPEN →
      </Link>
    </div>
  )
}

function DashFooter() {
  return (
    <footer className={styles.dashFooter}>
      <span className={styles.mono}>© 2026 GWTH.ai · UK</span>
      <span className={styles.mono}>Built for the GWTH beta</span>
      <span className={styles.mono}>Privacy · Terms · Accessibility</span>
    </footer>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function firstName(full: string): string {
  return full.split(" ")[0] ?? full
}

function formatToday(): string {
  const now = new Date()
  const day = now.toLocaleDateString("en-GB", {
    weekday: "short",
  })
  const date = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  })
  return `${day.toUpperCase()} ${date.toUpperCase()} · ${time} BST`
}

function formatTimeBst(): string {
  const time = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  })
  return `${time} BST`
}

function formatNotificationTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffH < 1) return "JUST NOW"
  if (diffH < 24) return `${diffH}H AGO`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return "YESTERDAY"
  if (diffD < 7) return `${diffD} DAYS AGO`
  return date
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase()
}
