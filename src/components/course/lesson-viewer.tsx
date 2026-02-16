"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BookmarkButton } from "@/components/shared/bookmark-button"
import { useProgress } from "@/hooks/use-progress"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  StickyNote,
} from "lucide-react"
import { formatDuration } from "@/lib/utils"
import dynamic from "next/dynamic"
import type {
  Lesson,
  Course,
  LessonProgress,
  LessonSummary,
  Note,
} from "@/lib/types"

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
 * The core lesson viewer with Learn/Build/Quiz tabs,
 * progress tracking, notes panel, and prev/next navigation.
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
              className="hover:text-foreground transition-colors"
            >
              {course.title}
            </Link>
            <span>/</span>
            <span>{lesson.title}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            {lesson.title}
          </h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge variant="secondary">{lesson.difficulty}</Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              {formatDuration(lesson.duration)}
            </span>
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

      {/* Content tabs */}
      <Tabs defaultValue="learn">
        <TabsList>
          <TabsTrigger value="learn">Learn</TabsTrigger>
          {lesson.buildInstructions && (
            <TabsTrigger value="build">Build</TabsTrigger>
          )}
          {lesson.questions.length > 0 && (
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="learn" className="mt-6 space-y-6">
          {/* Video player placeholder */}
          {lesson.introVideoUrl && (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                Video player placeholder
              </p>
            </div>
          )}

          {/* Lesson content */}
          <MarkdownRenderer content={lesson.learnContent} />

          {/* Audio player placeholder */}
          {lesson.audioFileUrl && (
            <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm">▶</span>
              </div>
              <div>
                <p className="text-sm font-medium">Listen to this lesson</p>
                <p className="text-xs text-muted-foreground">
                  {lesson.audioDuration
                    ? formatDuration(Math.round(lesson.audioDuration / 60))
                    : "Audio available"}
                </p>
              </div>
            </div>
          )}

          {/* Resources */}
          {lesson.resources.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Resources</h3>
              <div className="space-y-1">
                {lesson.resources.map((resource) => (
                  <a
                    key={resource.url}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-md px-3 py-2 text-sm text-primary hover:bg-muted transition-colors"
                  >
                    {resource.title} →
                  </a>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {lesson.buildInstructions && (
          <TabsContent value="build" className="mt-6 space-y-6">
            {lesson.buildVideoUrl && (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  Build video placeholder
                </p>
              </div>
            )}
            <MarkdownRenderer content={lesson.buildInstructions} />
          </TabsContent>
        )}

        {lesson.questions.length > 0 && (
          <TabsContent value="quiz" className="mt-6">
            <QuizEngine
              questions={lesson.questions}
              bestScore={progress?.bestQuizScore ?? null}
              attempts={progress?.quizAttempts ?? 0}
              onSubmit={handleQuizSubmit}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Bottom bar: prev/next + mark complete */}
      <div className="flex items-center justify-between border-t pt-4">
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
          {progress?.isCompleted && (
            <Badge
              variant="outline"
              className="gap-1 text-[var(--status-completed)]"
            >
              <CheckCircle2 className="size-3" />
              Completed
            </Badge>
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
