import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getCourse } from "@/lib/data/courses"
import { getCourseProgress } from "@/lib/data/progress"
import { getCurrentUser, canAccessMonth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { StatusBadge } from "@/components/progress/status-badge"
import { formatDuration, formatProgress } from "@/lib/utils"
import { BookOpen, Clock, Lock, Star } from "lucide-react"
import { MONTH_CONFIGS } from "@/lib/config"

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

/**
 * Course detail page showing sections accordion with lesson list,
 * month indicators, optional lesson badges, and access gating.
 */
export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [course, progress, user] = await Promise.all([
    getCourse(slug),
    getCourseProgress(slug),
    getCurrentUser(),
  ])

  if (!course) notFound()

  const state = user?.subscriptionState ?? "visitor"

  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0
  )

  // Group sections by month
  const sectionsByMonth = [1, 2, 3].map((month) => ({
    month: month as 1 | 2 | 3,
    config: MONTH_CONFIGS.find((m) => m.month === month)!,
    sections: course.sections.filter((s) => s.month === month),
    canAccess: canAccessMonth(state, month as 1 | 2 | 3),
  }))

  return (
    <>
      {/* JSON-LD structured data */}
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

      <div className="space-y-6">
        {/* Course header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {course.title}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {course.description}
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-4" />
              {totalLessons} lessons
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {formatDuration(course.estimatedDuration)}
            </span>
            <span className="flex items-center gap-1.5">
              3 months
            </span>
          </div>
          {progress && (
            <div className="mt-4 max-w-sm space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {formatProgress(progress.progress)} ·{" "}
                  {progress.completedLessons}/{progress.totalLessons} lessons
                </span>
              </div>
              <Progress value={progress.progress * 100} className="h-2" />
            </div>
          )}
        </div>

        {/* Month-grouped sections */}
        {sectionsByMonth.map(({ month, config, sections, canAccess }) => (
          <div key={month} className="space-y-3">
            {/* Month header */}
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">
                Month {month}: {config.title}
              </h2>
              {!canAccess && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="size-3" />
                  Locked
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {config.subtitle} — {config.mandatoryLessons} mandatory
              {config.optionalLessons > 0 &&
                ` + ${config.optionalLessons} optional`}{" "}
              lessons
            </p>

            {/* Sections accordion */}
            <Accordion
              type="multiple"
              defaultValue={
                canAccess ? sections.map((s) => s.id) : []
              }
              className="space-y-2"
            >
              {sections.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="rounded-lg border px-4"
                >
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span>{section.title}</span>
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {section.lessons.length} lessons
                      </Badge>
                      {section.isOptional && (
                        <Badge
                          variant="outline"
                          className="gap-1 text-xs font-normal"
                        >
                          <Star className="size-3" />
                          Optional
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pb-2">
                      {section.lessons.map((lesson) => {
                        const isLocked = !canAccess || lesson.status === "locked"
                        return (
                          <div key={lesson.id}>
                            {isLocked ? (
                              <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-3">
                                  <span>{lesson.order}.</span>
                                  <span>{lesson.title}</span>
                                  {lesson.isOptional && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {lesson.optionalTrack}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs">
                                    {formatDuration(lesson.duration)}
                                  </span>
                                  <Lock className="size-3.5" />
                                </div>
                              </div>
                            ) : (
                              <Link
                                href={`/course/${course.slug}/lesson/${lesson.slug}`}
                                className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground">
                                    {lesson.order}.
                                  </span>
                                  <span>{lesson.title}</span>
                                  {lesson.isOptional && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {lesson.optionalTrack}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDuration(lesson.duration)}
                                  </span>
                                  <StatusBadge status={lesson.status} />
                                </div>
                              </Link>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Capstone callout */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Capstone Project
              </p>
              <p className="mt-1 text-sm font-semibold">
                {config.capstoneName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {config.capstoneDescription}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
