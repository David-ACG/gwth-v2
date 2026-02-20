"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Lock, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration } from "@/lib/utils"
import type { CourseSection, LessonStatus } from "@/lib/types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface LessonNavProps {
  /** Course slug for URL construction */
  courseSlug: string
  /** Ordered sections with their lessons */
  sections: CourseSection[]
  /** Slug of the currently active lesson */
  currentLessonSlug: string
  /** Additional CSS classes */
  className?: string
}

/** Maps lesson status to an icon and color */
function StatusIcon({ status }: { status: LessonStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="size-3.5 shrink-0 text-[var(--status-completed)]" />
    case "in-progress":
      return <PlayCircle className="size-3.5 shrink-0 text-[var(--status-in-progress)]" />
    case "locked":
      return <Lock className="size-3.5 shrink-0 text-[var(--status-locked)]" />
    default:
      return <Circle className="size-3.5 shrink-0 text-[var(--status-not-started)]" />
  }
}

/**
 * Course navigation sidebar tree showing sections and lessons with progress indicators.
 * Highlights the current lesson. Each lesson links to its viewer page.
 * Used in the lesson viewer to provide context and navigation within the course.
 */
export function LessonNav({
  courseSlug,
  sections,
  currentLessonSlug,
  className,
}: LessonNavProps) {
  // Find which section contains the current lesson (to auto-expand it)
  const currentSectionId = sections.find((s) =>
    s.lessons.some((l) => l.slug === currentLessonSlug)
  )?.id

  return (
    <nav
      className={cn("custom-scrollbar overflow-y-auto", className)}
      aria-label="Course lessons"
    >
      <Accordion
        type="multiple"
        defaultValue={currentSectionId ? [currentSectionId] : sections[0] ? [sections[0].id] : []}
      >
        {sections.map((section) => {
          const completedCount = section.lessons.filter(
            (l) => l.status === "completed"
          ).length
          const totalCount = section.lessons.length

          return (
            <AccordionItem key={section.id} value={section.id} className="border-b-0">
              <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-medium">{section.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{totalCount} completed
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-1">
                <ul className="space-y-0.5">
                  {section.lessons.map((lesson) => {
                    const isCurrent = lesson.slug === currentLessonSlug
                    const isLocked = lesson.status === "locked"

                    return (
                      <li key={lesson.id}>
                        {isLocked ? (
                          <div
                            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground/60"
                            title="This lesson is locked"
                          >
                            <StatusIcon status={lesson.status} />
                            <span className="min-w-0 flex-1 truncate">
                              {lesson.title}
                            </span>
                            <span className="shrink-0 text-xs">
                              {formatDuration(lesson.duration)}
                            </span>
                          </div>
                        ) : (
                          <Link
                            href={`/course/${courseSlug}/lesson/${lesson.slug}`}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                              isCurrent
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
                            )}
                            aria-current={isCurrent ? "page" : undefined}
                          >
                            <StatusIcon status={lesson.status} />
                            <span className="min-w-0 flex-1 truncate">
                              {lesson.title}
                            </span>
                            <span className="shrink-0 text-xs">
                              {formatDuration(lesson.duration)}
                            </span>
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </nav>
  )
}
