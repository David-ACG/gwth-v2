"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BookmarkButton } from "@/components/shared/bookmark-button"
import { AudioBar } from "@/components/lesson"
import { useProgress } from "@/hooks/use-progress"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  StickyNote,
} from "lucide-react"
import { cn, formatDuration } from "@/lib/utils"
import dynamic from "next/dynamic"
import type {
  Lesson,
  Course,
  LessonProgress,
  LessonSummary,
  Note,
} from "@/lib/types"

const VideoPlayer = dynamic(
  () =>
    import("@/components/shared/video-player").then((m) => m.VideoPlayer),
  { loading: () => <Skeleton className="aspect-video w-full rounded-lg" /> }
)

const QuizEngine = dynamic(
  () => import("@/components/course/quiz-engine").then((m) => m.QuizEngine),
  { loading: () => <Skeleton className="h-64 w-full" /> }
)

const MarkdownRenderer = dynamic(
  () =>
    import("@/components/shared/markdown-renderer").then(
      (m) => m.MarkdownRenderer
    ),
  { loading: () => <Skeleton className="h-96 w-full" /> }
)

const NotesPanel = dynamic(
  () => import("@/components/shared/notes-panel").then((m) => m.NotesPanel),
  { loading: () => null }
)

/** Section definition for the progress breadcrumb */
interface SectionDef {
  id: string
  label: string
}

/** Build the section list dynamically based on available lesson content */
function buildSections(lesson: Lesson): SectionDef[] {
  const sections: SectionDef[] = []
  if (lesson.introVideoUrl) sections.push({ id: "intro", label: "Intro" })
  sections.push({ id: "content", label: "Content" })
  if (lesson.buildInstructions) sections.push({ id: "build", label: "Build" })
  if (lesson.questions.length > 0) sections.push({ id: "quiz", label: "Quiz" })
  if (lesson.resources.length > 0)
    sections.push({ id: "resources", label: "Resources" })
  return sections
}

interface LessonViewerProps {
  /** Full lesson data */
  lesson: Lesson
  /** Parent course for navigation context */
  course: Course
  /** User's progress on this lesson */
  progress: LessonProgress | null
  /** User's notes on this lesson */
  notes: Note[]
  /** Previous lesson for nav (null if first) */
  prevLesson: LessonSummary | null
  /** Next lesson for nav (null if last) */
  nextLesson: LessonSummary | null
  /** Whether the lesson is bookmarked */
  initialBookmarked: boolean
}

/**
 * The core lesson viewer — V11 composite design.
 *
 * Vertical sections with alternating bg-card / bg-muted/50 backgrounds,
 * solid primary number badges, shadow-md container, and section breadcrumb.
 * Keeps all existing functionality: progress tracking, notes, bookmarks, prev/next nav.
 */
export function LessonViewer({
  lesson,
  course,
  progress: initialProgress,
  notes,
  prevLesson,
  nextLesson,
  initialBookmarked,
}: LessonViewerProps) {
  const [showNotes, setShowNotes] = useState(false)
  const { progress, markComplete, submitQuizScore, isPending } =
    useProgress(initialProgress)

  const sections = buildSections(lesson)

  function handleMarkComplete() {
    markComplete(lesson.id)
    toast.success("Lesson marked as complete!")
  }

  function handleQuizSubmit(score: number) {
    submitQuizScore(lesson.id, score)
    toast.success(`Quiz submitted! Score: ${score}%`)
  }

  return (
    <div className="space-y-6">
      {/* Lesson header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href={`/course/${course.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {course.title}
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground">{lesson.title}</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            {lesson.title}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge variant="secondary">{lesson.difficulty}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              {formatDuration(lesson.duration)}
            </span>
            {progress?.isCompleted && (
              <Badge
                variant="outline"
                className="gap-1 text-[var(--status-completed)]"
              >
                <CheckCircle2 className="size-3" />
                Completed
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotes(!showNotes)}
            aria-label="Toggle notes"
            className="size-8"
          >
            <StickyNote className="size-4" />
          </Button>
          <BookmarkButton
            initialBookmarked={initialBookmarked}
            lessonId={lesson.id}
          />
        </div>
      </div>

      {/* Section progress breadcrumb */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {sections.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-xs text-muted-foreground/40">&rarr;</span>
            )}
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById(s.id)
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
              className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-primary/10 hover:text-foreground"
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {i + 1}
              </span>
              {s.label}
            </button>
          </div>
        ))}
      </div>

      {/* Main content container — alternating section backgrounds */}
      <div className="overflow-hidden rounded-xl border border-border shadow-md dark:shadow-none">
        {sections.map((section, i) => {
          const tinted = i % 2 !== 0
          const num = i + 1
          const bgClass = tinted ? "bg-muted/50" : "bg-card"

          switch (section.id) {
            case "intro":
              return (
                <section
                  key="intro"
                  id="intro"
                  className={cn("p-8", bgClass)}
                >
                  <SectionHeading number={num} title="Intro Video" />
                  <VideoPlayer
                    src={lesson.introVideoUrl!}
                    title={`${lesson.title} — Introduction`}
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {lesson.description}
                  </p>
                </section>
              )

            case "content":
              return (
                <section
                  key="content"
                  id="content"
                  className={cn("p-8", bgClass)}
                >
                  <SectionHeading number={num} title="Lesson Content" />
                  {lesson.audioFileUrl && (
                    <div className="mb-6">
                      <AudioBar
                        src={lesson.audioFileUrl}
                        duration={lesson.audioDuration ?? undefined}
                      />
                    </div>
                  )}
                  <div className="lesson-prose prose-p:leading-[1.75] prose-p:mb-5">
                    <MarkdownRenderer content={lesson.learnContent} />
                  </div>
                </section>
              )

            case "build":
              return (
                <section
                  key="build"
                  id="build"
                  className={cn("p-8", bgClass)}
                >
                  <SectionHeading number={num} title="Build Along" />
                  {lesson.buildVideoUrl && (
                    <div className="mb-6">
                      <VideoPlayer
                        src={lesson.buildVideoUrl}
                        title={`${lesson.title} — Build Along`}
                      />
                    </div>
                  )}
                  <div className="lesson-prose prose-p:leading-[1.75] prose-p:mb-5">
                    <MarkdownRenderer content={lesson.buildInstructions!} />
                  </div>
                </section>
              )

            case "quiz":
              return (
                <section
                  key="quiz"
                  id="quiz"
                  className={cn("p-8", bgClass)}
                >
                  <SectionHeading number={num} title="Quiz" />
                  <QuizEngine
                    questions={lesson.questions}
                    bestScore={progress?.bestQuizScore ?? null}
                    attempts={progress?.quizAttempts ?? 0}
                    onSubmit={handleQuizSubmit}
                  />
                </section>
              )

            case "resources":
              return (
                <section
                  key="resources"
                  id="resources"
                  className={cn("p-8", bgClass)}
                >
                  <SectionHeading number={num} title="Resources" />
                  <div className="space-y-1">
                    {lesson.resources.map((resource) => (
                      <a
                        key={resource.url}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-md px-3 py-2 text-sm text-primary transition-colors hover:bg-muted"
                      >
                        {resource.title} &rarr;
                      </a>
                    ))}
                  </div>
                </section>
              )

            default:
              return null
          }
        })}

        {/* Bottom bar: prev/next + mark complete — sits inside the container */}
        <div className="flex items-center justify-between border-t border-border bg-card px-8 py-4">
          <div>
            {prevLesson && (
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href={`/course/${course.slug}/lesson/${prevLesson.slug}`}
                >
                  <ArrowLeft className="mr-1 size-4" />
                  {prevLesson.title}
                </Link>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!progress?.isCompleted && (
              <Button
                onClick={handleMarkComplete}
                disabled={isPending}
                size="sm"
              >
                <CheckCircle2 className="mr-1 size-4" />
                Mark Complete
              </Button>
            )}
            {nextLesson && (
              <Button size="sm" asChild>
                <Link
                  href={`/course/${course.slug}/lesson/${nextLesson.slug}`}
                >
                  Next: {nextLesson.title}
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notes panel */}
      {showNotes && (
        <NotesPanel
          lessonId={lesson.id}
          initialNotes={notes}
          onClose={() => setShowNotes(false)}
        />
      )}
    </div>
  )
}

/** Solid primary badge section heading (V11 style) */
function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        {String(number).padStart(2, "0")}
      </span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
  )
}
