import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLesson } from "@/lib/data/lessons"
import { getCourse } from "@/lib/data/courses"
import { getAllCourseProgress } from "@/lib/data/progress"
import { cn } from "@/lib/utils"
import {
  EditorialLessonViewer,
  type EditorialLessonMeta,
  type EditorialLessonPage,
  type EditorialLessonSurface,
} from "./editorial-lesson-viewer"
import type { LessonWidgetSurface } from "./lesson-widgets"

type PageProps = {
  params: Promise<{ slug: string; lessonSlug: string }>
  searchParams: Promise<{
    surface?: string
    page?: string
    widget?: string
  }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lessonSlug } = await params
  const lesson = await getLesson(lessonSlug)
  if (!lesson) return { title: "Lesson Not Found" }
  return { title: lesson.title, description: lesson.description }
}

/**
 * Tailwind classes used to negate the dashboard layout padding so the
 * lesson viewer's outline rail and audio bar run edge-to-edge inside the
 * max-w-[1400px] wrapper. Mirrors `DASHBOARD_BREAKOUT` from the dashboard
 * page; exported for the demo route.
 */
export const LESSON_BREAKOUT =
  "-mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8"

const VALID_SURFACES: ReadonlySet<string> = new Set([
  "prose",
  "prose-playing",
  "advancing",
  "video",
  "qa",
  "complete",
  "mobile",
])

const VALID_WIDGET_SURFACES: ReadonlySet<string> = new Set([
  "none",
  "feedback",
  "notes",
  "selection",
  "note-compose",
  "mobile-sheet",
  "mobile-collapsed",
])

/**
 * Maps a real `Lesson` shape into the bundle's multi-page outline. The
 * production Lesson model stores one block of `learnContent` and one
 * audio file; the editorial viewer expects 8-12 short pages plus a video
 * and a Q&A. For Stage 2 we surface a minimal three-page outline (intro
 * video if present, content, Q&A if present). Real per-page splitting
 * lives behind the audio-manifest follow-up issue.
 */
function buildLessonPages(lesson: {
  introVideoUrl: string | null
  questions: { question: string }[]
}): EditorialLessonPage[] {
  const pages: EditorialLessonPage[] = []
  if (lesson.introVideoUrl) {
    pages.push({
      title: "Why this lesson exists",
      kindLabel: "VIDEO · 4 MIN",
      kind: "video",
    })
  }
  pages.push(
    {
      title: "Picking the right problem",
      kindLabel: "PROSE · 3 MIN",
      kind: "prose",
    },
    {
      title: "The brief, in plain English",
      kindLabel: "PROSE · 4 MIN",
      kind: "prose",
    },
    {
      title: "Calling Claude from a script",
      kindLabel: "CODE · 4 MIN",
      kind: "code",
    },
    {
      title: "When the model misreads you",
      kindLabel: "PROSE · 3 MIN",
      kind: "prose",
    },
    {
      title: "Shipping past your own desk",
      kindLabel: "PROSE · 3 MIN",
      kind: "prose",
    },
    { title: "Recap", kindLabel: "PROSE · 1 MIN", kind: "prose" }
  )
  if (lesson.questions.length > 0) {
    pages.push({
      title: "End-of-lesson Q&A",
      kindLabel: "Q&A · 4 MIN",
      kind: "qa",
    })
  }
  return pages
}

/**
 * Lesson viewer page, ported from the 2026-05-08 Stone & Sage bundle. The
 * dashboard layout padding is broken out so the outline rail (left) and
 * audio bar (sticky bottom) span edge to edge inside the max-w-[1400px]
 * shell. `?surface=prose|prose-playing|advancing|video|qa|complete|mobile`
 * lets developers preview each surface against the bundle HTML; the
 * default surface is `prose`.
 */
export default async function LessonPage({
  params,
  searchParams,
}: PageProps) {
  const { slug, lessonSlug } = await params
  const sp = await searchParams
  const [lesson, course, allProgress] = await Promise.all([
    getLesson(lessonSlug),
    getCourse(slug),
    getAllCourseProgress(),
  ])
  if (!lesson || !course) notFound()

  const courseProgress = allProgress.find((p) => p.courseId === course.id)
  const monthLessonCount = course.sections
    .filter((s) => s.month === lesson.month)
    .flatMap((s) => s.lessons).length
  const meta: EditorialLessonMeta = {
    monthLabel: `MONTH ${lesson.month} · LESSON ${String(lesson.order).padStart(2, "0")}`,
    lessonNumber: lesson.order,
    title: lesson.title,
    monthCompleted: courseProgress?.completedLessons ?? 0,
    monthTotal: monthLessonCount > 0 ? monthLessonCount : 24,
    pages: buildLessonPages(lesson),
    // Real imported content (Postgres/Drizzle). The viewer renders these in
    // the prose + Q&A surfaces, falling back to the design placeholders only
    // when a lesson has no body / no questions.
    learnContent: lesson.learnContent || undefined,
    questions:
      lesson.questions.length > 0
        ? lesson.questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            explanation: q.explanation,
          }))
        : undefined,
  }

  const surfaceParam = sp.surface ?? "prose"
  const initialSurface: EditorialLessonSurface = VALID_SURFACES.has(
    surfaceParam
  )
    ? (surfaceParam as EditorialLessonSurface)
    : "prose"
  const initialPage = sp.page ? parseInt(sp.page, 10) : 3

  const widgetParam = sp.widget ?? "none"
  const initialWidgetSurface: LessonWidgetSurface = VALID_WIDGET_SURFACES.has(
    widgetParam
  )
    ? (widgetParam as LessonWidgetSurface)
    : "none"

  return (
    <div className={cn(LESSON_BREAKOUT)} data-variant="e2-e">
      <EditorialLessonViewer
        lesson={meta}
        initialSurface={initialSurface}
        initialPage={Number.isFinite(initialPage) ? initialPage : 3}
        initialWidgetSurface={initialWidgetSurface}
      />
    </div>
  )
}
