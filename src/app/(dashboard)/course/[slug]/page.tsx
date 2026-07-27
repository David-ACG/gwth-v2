import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getCourse } from "@/lib/data/courses"
import { getAllLessonProgress, getCourseProgress } from "@/lib/data/progress"
import { getDashboardUser, canUserAccessMonth } from "@/lib/auth"
import { canViewPrivateContent } from "@/lib/content-access"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatDuration, formatProgress } from "@/lib/utils"
import { Lock } from "lucide-react"
import { MONTH_CONFIGS } from "@/lib/config"
import type { LessonStatus } from "@/lib/types"
import styles from "./course-fde.module.css"

type PageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Generates dynamic metadata for the course page.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourse(slug)
  if (!course) return { title: "Course Not Found" }

  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
    },
  }
}

const COURSE_DASH_COUNT = 24

/** Status rendered as colour + glyph + text, never colour alone (§5.5). */
const STATUS_DISPLAY: Record<
  Exclude<LessonStatus, "locked">,
  { glyph: string; label: string; className: string | undefined }
> = {
  completed: { glyph: "✓", label: "Done", className: styles.statusDone },
  "in-progress": {
    glyph: "▸",
    label: "In progress",
    className: styles.statusActive,
  },
  available: {
    glyph: "○",
    label: "Not started",
    className: styles.statusPending,
  },
}

/**
 * Force runtime evaluation. This route reads the live session AND the runtime
 * `PRIVATE_CONTENT_MODE` value to decide between the public teaser and the
 * full syllabus, so a prerendered render would freeze the build machine's
 * verdict into the image (W25; same lesson as src/app/robots.ts).
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Course detail page showing sections accordion with lesson list,
 * month indicators, optional lesson badges, and access gating.
 * FDE journal register: issue framing per month, hairline lesson rows,
 * dash-progress for course completion (DESIGN_FDE.md §4.4, §4.5, §5.8).
 *
 * Unlike the other content routes this page does NOT redirect when the caller
 * fails the W25 content gate: /course/<slug> is the deliberately public course
 * landing page (src/proxy.ts carves it out of PROTECTED_PATHS) and already
 * branches to a teaser that keeps every lesson title out of the anonymous DOM.
 * The gate therefore feeds that existing branch instead of replacing it, so
 * the marketing surface survives while the syllabus stays private.
 */
export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [course, progress, lessonRows, dashboardUser, contentAllowed] =
    await Promise.all([
      getCourse(slug),
      getCourseProgress(slug),
      getAllLessonProgress(),
      getDashboardUser(),
      canViewPrivateContent(),
    ])

  // `lessons.status` is the AUTHORING state of the row (is this lesson
  // published), not this learner's state. Rendering it directly is why a
  // finished lesson still read "Not started" here while the header counted
  // it as 1/26 — the header comes from lesson_progress, the rows did not.
  // Index the learner's own rows so the two can agree.
  const progressByLesson = new Map(lessonRows.map((row) => [row.lessonId, row]))

  // A signed-in account that is not on the content allowlist is treated
  // exactly like a visitor here: full syllabus withheld, teaser shown.
  const user = contentAllowed ? dashboardUser : null

  if (!course) notFound()

  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0
  )

  const jsonLd = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: course.title,
          description: course.description,
          provider: {
            "@type": "Organization",
            name: "GWTH.ai",
          },
        }),
      }}
    />
  )

  // Visitors without course access (anonymous, or registered without the
  // beta grant — getDashboardUser() is null for both) get basic info only.
  // The full syllabus must never reach their DOM: the locked accordion
  // below still ships every section and lesson title in the HTML, which
  // is exactly the scrape-the-syllabus leak this branch closes. Month
  // themes and capstones stay: they are already public marketing copy
  // (MONTH_CONFIGS on /lessons).
  if (!user) {
    return (
      <>
        {jsonLd}
        <div className={styles.shell} data-section="course-detail">
          <header>
            <div className={styles.head}>
              <h1 className={styles.title}>{course.title}</h1>
              <p className={styles.mono}>Course</p>
            </div>
            <p className={styles.lead}>{course.description}</p>
            {/*
              Two different scopes sat side by side unlabelled and read as one
              claim: totalLessons counts the lessons that exist today (Month 1,
              26 of them at 45 minutes each, so 19.5 hours) while
              estimatedDuration covers the whole three-month course. "26
              lessons · 98h · 3 months" therefore looked like arithmetic that
              does not work. Naming each scope is the smallest true fix (W26).
            */}
            <p className={styles.metaRow}>
              {totalLessons} lessons available now ·{" "}
              {formatDuration(course.estimatedDuration)} across 3 months
            </p>
          </header>

          {MONTH_CONFIGS.map((config) => (
            <section key={config.month} className={styles.issue}>
              <div className={styles.issueHead}>
                <p className={styles.issueKicker}>
                  Issue 0{config.month} · Month {config.month}
                </p>
                <p className={styles.lockedTag}>
                  <Lock className="size-3" aria-hidden="true" />
                  Members only
                </p>
              </div>
              <h2 className={styles.issueTitle}>{config.title}</h2>
              <p className={styles.issueSub}>
                {config.subtitle} · {config.mandatoryLessons} mandatory
                {config.optionalLessons > 0 &&
                  ` + ${config.optionalLessons} optional`}{" "}
                lessons
              </p>
              <div className={styles.capstone}>
                <p className={styles.capstoneKicker}>Capstone Project</p>
                <p className={styles.capstoneName}>{config.capstoneName}</p>
                <p className={styles.capstoneBody}>
                  {config.capstoneDescription}
                </p>
              </div>
            </section>
          ))}

          <div className={styles.teaser}>
            <p className={styles.teaserBody}>
              The full lesson list opens with course access. The beta is
              currently invite-only.
            </p>
            <div className={styles.teaserActions}>
              <Link href="/waitlist" className={styles.buttonSolid}>
                Join the waitlist
              </Link>
              <Link href="/login" className={styles.buttonOutline}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Group sections by month
  const sectionsByMonth = [1, 2, 3].map((month) => ({
    month: month as 1 | 2 | 3,
    config: MONTH_CONFIGS.find((m) => m.month === month)!,
    sections: course.sections.filter((s) => s.month === month),
    canAccess: user ? canUserAccessMonth(user, month as 1 | 2 | 3) : false,
  }))

  const progressDashesFilled = progress
    ? Math.round(progress.progress * COURSE_DASH_COUNT)
    : 0

  return (
    <>
      {jsonLd}

      <div className={styles.shell} data-section="course-detail">
        {/* Course header */}
        <header>
          <div className={styles.head}>
            <h1 className={styles.title}>{course.title}</h1>
            <p className={styles.mono}>Course</p>
          </div>
          <p className={styles.lead}>{course.description}</p>
          {/* Same two-scope trap as the teaser header above (W26): the lesson
              count is what exists today, the hours are the whole course. */}
          <p className={styles.metaRow}>
            {totalLessons} lessons available now ·{" "}
            {formatDuration(course.estimatedDuration)} across 3 months
          </p>
          {/* Completion rules live here, said once — never inside lessons. */}
          <p className={styles.metaRow}>
            A lesson counts once its intro video is watched and its short
            Q&amp;A is passed.
          </p>
          {progress && (
            <div className={styles.progressWrap}>
              <div className={styles.dashes} aria-hidden="true">
                {Array.from({ length: COURSE_DASH_COUNT }, (_, dash) => (
                  <span
                    key={dash}
                    data-active={
                      dash < progressDashesFilled ? "true" : undefined
                    }
                  />
                ))}
              </div>
              <p className={styles.progressText}>
                {formatProgress(progress.progress)} ·{" "}
                {progress.completedLessons}/{progress.totalLessons} lessons
              </p>
            </div>
          )}
        </header>

        {/* Month-grouped sections, framed as journal issues (§4.4) */}
        {sectionsByMonth.map(({ month, config, sections, canAccess }) => (
          <section key={month} className={styles.issue}>
            <div className={styles.issueHead}>
              <p className={styles.issueKicker}>
                Issue 0{month} · Month {month}
              </p>
              {!canAccess && (
                <p className={styles.lockedTag}>
                  <Lock className="size-3" aria-hidden="true" />
                  Locked
                </p>
              )}
            </div>
            <h2 className={styles.issueTitle}>{config.title}</h2>
            <p className={styles.issueSub}>
              {config.subtitle} · {config.mandatoryLessons} mandatory
              {config.optionalLessons > 0 &&
                ` + ${config.optionalLessons} optional`}{" "}
              lessons
            </p>

            {/* Sections accordion */}
            <Accordion
              type="multiple"
              defaultValue={canAccess ? sections.map((s) => s.id) : []}
              className={styles.accordion}
            >
              {sections.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className={styles.accItem}
                >
                  <AccordionTrigger className={styles.accTrigger}>
                    <span>{section.title}</span>
                    <span className={styles.accTriggerMeta}>
                      {section.lessons.length} lessons
                      {section.isOptional && " · Optional"}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className={styles.accContent}>
                    {section.lessons.map((lesson) => {
                      const isLocked =
                        !canAccess || lesson.status === "locked"
                      // The learner's own row wins over the authoring status:
                      // finished is finished, and part-way through is not
                      // "Not started".
                      const row = progressByLesson.get(lesson.id)
                      const displayStatus: Exclude<LessonStatus, "locked"> =
                        row?.isCompleted
                          ? "completed"
                          : row && row.progress > 0
                            ? "in-progress"
                            : ((lesson.status === "completed" ||
                                lesson.status === "in-progress"
                                ? lesson.status
                                : "available") as Exclude<
                                LessonStatus,
                                "locked"
                              >)
                      const display = STATUS_DISPLAY[displayStatus]
                      const lessonId = `M${month} L${String(
                        lesson.order
                      ).padStart(2, "0")}`
                      const inner = (
                        <>
                          <span className={styles.lessonId}>{lessonId}</span>
                          <span className={styles.lessonTitle}>
                            {lesson.title}
                            {lesson.isOptional && (
                              <span className={styles.lessonTrackTag}>
                                {lesson.optionalTrack}
                              </span>
                            )}
                          </span>
                          <span className={styles.lessonDuration}>
                            {formatDuration(lesson.duration)}
                          </span>
                          {isLocked ? (
                            <span
                              className={`${styles.status} ${styles.statusLocked}`}
                            >
                              <Lock
                                className="size-3"
                                aria-hidden="true"
                              />
                              Locked
                            </span>
                          ) : (
                            <span
                              className={`${styles.status} ${
                                display?.className ?? styles.statusPending
                              }`}
                              data-status={displayStatus}
                            >
                              <span className={styles.glyph} aria-hidden="true">
                                {display?.glyph ?? "○"}
                              </span>
                              {display?.label ?? "Not started"}
                            </span>
                          )}
                        </>
                      )
                      return isLocked ? (
                        <div
                          key={lesson.id}
                          className={styles.lessonRow}
                          data-locked="true"
                        >
                          {inner}
                        </div>
                      ) : (
                        <Link
                          key={lesson.id}
                          href={`/course/${course.slug}/lesson/${lesson.slug}`}
                          className={styles.lessonRow}
                        >
                          {inner}
                        </Link>
                      )
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Capstone callout (§4.4: hairline + bold ink lead-in) */}
            <div className={styles.capstone}>
              <p className={styles.capstoneKicker}>Capstone Project</p>
              <p className={styles.capstoneName}>{config.capstoneName}</p>
              <p className={styles.capstoneBody}>
                {config.capstoneDescription}
              </p>
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
