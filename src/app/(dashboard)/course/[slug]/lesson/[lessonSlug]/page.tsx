import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getLesson } from "@/lib/data/lessons"
import { getCourse } from "@/lib/data/courses"
import { getDashboardUser, canUserAccessMonth } from "@/lib/auth"
import { getAllCourseProgress, getLessonProgress } from "@/lib/data/progress"
import { cn } from "@/lib/utils"
import {
  EditorialLessonViewer,
  type EditorialLessonMeta,
  type EditorialLessonSurface,
  type EditorialNextLesson,
} from "./editorial-lesson-viewer"
import { buildLessonOutline } from "@/lib/lessons/lesson-outline"
import type { Course } from "@/lib/types"
import type { LessonWidgetSurface } from "./lesson-widgets"
import { requireContentAccessOrRedirect } from "@/lib/content-access"

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
 * Lesson viewer page, ported from the 2026-05-08 Stone & Sage bundle. The
 * dashboard layout padding is broken out so the outline rail (left) and
 * audio bar (sticky bottom) span edge to edge inside the max-w-[1400px]
 * shell. `?surface=prose|prose-playing|advancing|video|qa|complete|mobile`
 * lets developers preview each surface against the bundle HTML; the
 * default surface is `prose`.
 */
/**
 * Finds the lesson that follows the given slug in course order (sections by
 * order, lessons by order within each section). Returns null on the last
 * lesson.
 */
function findNextLesson(
  course: Course,
  lessonSlug: string
): EditorialNextLesson | null {
  const ordered = [...course.sections]
    .sort((a, b) => a.order - b.order)
    .flatMap((s) => [...s.lessons].sort((a, b) => a.order - b.order))
  const idx = ordered.findIndex((l) => l.slug === lessonSlug)
  if (idx === -1 || idx + 1 >= ordered.length) return null
  const next = ordered[idx + 1]!
  return {
    title: next.title,
    href: `/course/${course.slug}/lesson/${next.slug}`,
    lessonNumber: next.order,
  }
}

/**
 * Render per request, never statically. The W25 content gate reads the live
 * session and the runtime PRIVATE_CONTENT_MODE value, so a prerendered
 * render would freeze the build machine's verdict into the image.
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function LessonPage({
  params,
  searchParams,
}: PageProps) {
  await requireContentAccessOrRedirect()

  const { slug, lessonSlug } = await params
  const sp = await searchParams
  const [lesson, course, allProgress, user] = await Promise.all([
    getLesson(lessonSlug),
    getCourse(slug),
    getAllCourseProgress(),
    getDashboardUser(),
  ])
  if (!lesson || !course) notFound()

  // Lesson content is members-only. The proxy's optimistic cookie check
  // lets any session through (including free registered accounts), so the
  // real gate is here: no beta/paid access to this lesson's month means no
  // lesson body, only the course overview teaser (snag fix 2026-07-05).
  const lessonMonth = lesson.month as 1 | 2 | 3
  if (!user || !canUserAccessMonth(user, lessonMonth)) {
    redirect(`/course/${slug}`)
  }

  // Per-user persisted progress for this lesson (null when never started, or
  // when unauthenticated — the viewer then starts from a clean slate and
  // writes are safe no-ops server-side).
  const lessonProgress = await getLessonProgress(lesson.id)

  const courseProgress = allProgress.find((p) => p.courseId === course.id)
  const monthLessonCount = course.sections
    .filter((s) => s.month === lesson.month)
    .flatMap((s) => s.lessons).length
  const meta: EditorialLessonMeta = {
    id: lesson.id,
    monthLabel: `MONTH ${lesson.month} · LESSON ${String(lesson.order).padStart(2, "0")}`,
    lessonNumber: lesson.order,
    title: lesson.title,
    monthCompleted: courseProgress?.completedLessons ?? 0,
    monthTotal: monthLessonCount > 0 ? monthLessonCount : 24,
    // Outline + pagination derived from the lesson's real markdown headings
    // (one page per `##` section), not a hardcoded placeholder (gwth-launch-qar).
    pages: buildLessonOutline({
      learnContent: lesson.learnContent,
      hasIntroVideo: Boolean(lesson.introVideoUrl),
      questionCount: lesson.questions.length,
    }),
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
    // Raw media references from the lesson row; the viewer resolves them
    // through mediaUrl() so the CDN cutover (I3) needs no viewer change.
    audioFileUrl: lesson.audioFileUrl,
    audioDuration: lesson.audioDuration,
    introVideoUrl: lesson.introVideoUrl,
  }

  // Default entry: page 1 (the intro video when the lesson has one). The
  // ?surface= / ?page= params remain as demo/review overrides.
  const defaultSurface: EditorialLessonSurface = lesson.introVideoUrl
    ? "video"
    : "prose"
  const surfaceParam = sp.surface ?? ""
  const initialSurface: EditorialLessonSurface = VALID_SURFACES.has(
    surfaceParam
  )
    ? (surfaceParam as EditorialLessonSurface)
    : defaultSurface
  const initialPage = sp.page ? parseInt(sp.page, 10) : 1

  const widgetParam = sp.widget ?? "none"
  const initialWidgetSurface: LessonWidgetSurface = VALID_WIDGET_SURFACES.has(
    widgetParam
  )
    ? (widgetParam as LessonWidgetSurface)
    : "none"

  return (
    <div className={cn(LESSON_BREAKOUT)} data-variant="e2-e">
      <EditorialLessonViewer
        key={meta.id}
        lesson={meta}
        initialSurface={initialSurface}
        initialPage={Number.isFinite(initialPage) ? initialPage : 1}
        initialWidgetSurface={initialWidgetSurface}
        initialProgress={lessonProgress}
        nextLesson={findNextLesson(course, lessonSlug)}
        courseHref={`/course/${course.slug}`}
      />
    </div>
  )
}
