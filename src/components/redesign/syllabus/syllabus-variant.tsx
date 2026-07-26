import Link from "next/link"
import { notFound } from "next/navigation"
import { Lock } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getCourse } from "@/lib/data/courses"
import { getCourseProgress } from "@/lib/data/progress"
import { getDashboardUser, canUserAccessMonth } from "@/lib/auth"
import { canViewPrivateContent } from "@/lib/content-access"
import { formatDuration, formatProgress } from "@/lib/utils"
import { MONTH_CONFIGS } from "@/lib/config"
import type { LessonStatus } from "@/lib/types"
import { SyllabusVariantSwitcher } from "./syllabus-variant-switcher"
import frame from "./syllabus-frame.module.css"

/**
 * Shared renderer for the /redesign/syllabus-* design comparison (W27).
 *
 * David's walkthrough note on /course/applied-ai-skills was that the page is
 * "a lot of text all with the same colours so my brain does not know where to
 * look". The comparison exists so he can pick a colour/hierarchy treatment
 * from three options with the current design as option 0.
 *
 * The MARKUP here is a copy of the signed-in branch of
 * src/app/(dashboard)/course/[slug]/page.tsx, word for word: every variation
 * differs ONLY in which CSS module is passed in, so the comparison isolates
 * the design change and no lesson title, count or label can drift. Do not add
 * or edit copy in this file.
 *
 * Access: /redesign is a DEV_REVIEW_PATH (auth-gated in production by
 * src/proxy.ts), and this component additionally applies the W25 content gate
 * before reading anything, so the full syllabus can never reach a caller who
 * is not on the allowlist.
 */

const COURSE_SLUG = "applied-ai-skills"
const COURSE_DASH_COUNT = 24

type VariantStyles = Record<string, string>

/** Status rendered as colour + glyph + text, never colour alone (section 5.5). */
function statusDisplay(styles: VariantStyles) {
  return {
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
  } satisfies Record<
    Exclude<LessonStatus, "locked">,
    { glyph: string; label: string; className: string | undefined }
  >
}

export async function SyllabusVariant({
  styles,
  variant,
}: {
  styles: VariantStyles
  variant: "0" | "a" | "b" | "c"
}) {
  const contentAllowed = await canViewPrivateContent()
  const [course, progress, dashboardUser] = await Promise.all([
    getCourse(COURSE_SLUG),
    getCourseProgress(COURSE_SLUG),
    getDashboardUser(),
  ])

  const user = contentAllowed ? dashboardUser : null
  // The review sandbox has no teaser branch: no access, no page.
  if (!course || !user) notFound()

  const STATUS_DISPLAY = statusDisplay(styles)

  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0
  )

  const sectionsByMonth = [1, 2, 3].map((month) => ({
    month: month as 1 | 2 | 3,
    config: MONTH_CONFIGS.find((m) => m.month === month)!,
    sections: course.sections.filter((s) => s.month === month),
    canAccess: canUserAccessMonth(user, month as 1 | 2 | 3),
  }))

  const progressDashesFilled = progress
    ? Math.round(progress.progress * COURSE_DASH_COUNT)
    : 0

  return (
    <div className={frame.frame}>
      <div className={frame.inner}>
        <div className={styles.shell} data-section="course-detail">
          <header>
            <div className={styles.head}>
              <h1 className={styles.title}>{course.title}</h1>
              <p className={styles.mono}>Course</p>
            </div>
            <p className={styles.lead}>{course.description}</p>
            <p className={styles.metaRow}>
              {totalLessons} lessons available now ·{" "}
              {formatDuration(course.estimatedDuration)} across 3 months
            </p>
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

          {sectionsByMonth.map(({ month, config, sections, canAccess }) => (
            <section
              key={month}
              className={styles.issue}
              data-locked={!canAccess ? "true" : undefined}
            >
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

              <Accordion
                type="multiple"
                defaultValue={canAccess ? sections.map((s) => s.id) : []}
                className={styles.accordion}
              >
                {sections.map((section, sectionIndex) => (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className={styles.accItem}
                    /* Week hue rotation. Read by the variation CSS; the
                       production module ignores it, so option 0 is unchanged. */
                    data-week={(sectionIndex % 4) + 1}
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
                        const isLocked = !canAccess || lesson.status === "locked"
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
                                <Lock className="size-3" aria-hidden="true" />
                                Locked
                              </span>
                            ) : (
                              <span
                                className={`${styles.status} ${
                                  STATUS_DISPLAY[
                                    lesson.status as Exclude<
                                      LessonStatus,
                                      "locked"
                                    >
                                  ]?.className ?? styles.statusPending
                                }`}
                              >
                                <span
                                  className={styles.glyph}
                                  aria-hidden="true"
                                >
                                  {STATUS_DISPLAY[
                                    lesson.status as Exclude<
                                      LessonStatus,
                                      "locked"
                                    >
                                  ]?.glyph ?? "○"}
                                </span>
                                {STATUS_DISPLAY[
                                  lesson.status as Exclude<
                                    LessonStatus,
                                    "locked"
                                  >
                                ]?.label ?? "Not started"}
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
      </div>
      <SyllabusVariantSwitcher current={variant} />
    </div>
  )
}
