import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCourse } from "@/lib/data/courses"
import { getCourseProgress } from "@/lib/data/progress"
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
import { BookOpen, Clock } from "lucide-react"
import Link from "next/link"

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
 * Course detail page showing sections accordion with lesson list
 * and status badges.
 */
export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const [course, progress] = await Promise.all([
    getCourse(slug),
    getCourseProgress(slug),
  ])

  if (!course) notFound()

  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0
  )

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
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{course.difficulty}</Badge>
            <Badge variant="outline">{course.category}</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
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

        {/* Sections accordion */}
        <Accordion
          type="multiple"
          defaultValue={course.sections.map((s) => s.id)}
          className="space-y-2"
        >
          {course.sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="rounded-lg border px-4"
            >
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <span>{section.title}</span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {section.lessons.length} lessons
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pb-2">
                  {section.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/course/${course.slug}/lesson/${lesson.slug}`}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          {lesson.order}.
                        </span>
                        <span>{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(lesson.duration)}
                        </span>
                        <StatusBadge status={lesson.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  )
}
