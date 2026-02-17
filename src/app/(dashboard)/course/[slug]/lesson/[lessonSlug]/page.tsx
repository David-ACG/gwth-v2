import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLesson, getAdjacentLessons } from "@/lib/data/lessons"
import { getCourse } from "@/lib/data/courses"
import { getLessonProgress } from "@/lib/data/progress"
import { getNotes } from "@/lib/data/notes"
import { isBookmarked } from "@/lib/data/bookmarks"
import { LessonViewer } from "@/components/course/lesson-viewer"
import { LessonNav } from "@/components/course/lesson-nav"

type PageProps = {
  params: Promise<{ slug: string; lessonSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonSlug } = await params
  const lesson = await getLesson(lessonSlug)
  if (!lesson) return { title: "Lesson Not Found" }

  return {
    title: lesson.title,
    description: lesson.description,
  }
}

/**
 * Lesson viewer page — the core learning experience.
 * Two-column layout: LessonNav sidebar (hidden on mobile) + LessonViewer main content.
 * Fetches lesson data, progress, notes, and nav context,
 * then delegates rendering to the client components.
 */
export default async function LessonPage({ params }: PageProps) {
  const { slug, lessonSlug } = await params
  const [lesson, course, progress, notes, adjacent, bookmarked] =
    await Promise.all([
      getLesson(lessonSlug),
      getCourse(slug),
      getLessonProgress(lessonSlug),
      getNotes(lessonSlug),
      getAdjacentLessons(slug, lessonSlug),
      isBookmarked({ lessonId: lessonSlug }),
    ])

  if (!lesson || !course) notFound()

  return (
    <div className="flex gap-6">
      {/* Course navigation sidebar — hidden on mobile */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden rounded-lg border bg-card">
          <div className="border-b px-3 py-2">
            <p className="text-sm font-semibold">{course.title}</p>
          </div>
          <LessonNav
            courseSlug={course.slug}
            sections={course.sections}
            currentLessonSlug={lessonSlug}
            className="max-h-[calc(100vh-10rem)]"
          />
        </div>
      </aside>

      {/* Main lesson content */}
      <div className="min-w-0 flex-1">
        <LessonViewer
          lesson={lesson}
          course={course}
          progress={progress}
          notes={notes}
          prevLesson={adjacent.prev}
          nextLesson={adjacent.next}
          initialBookmarked={bookmarked}
        />
      </div>
    </div>
  )
}
