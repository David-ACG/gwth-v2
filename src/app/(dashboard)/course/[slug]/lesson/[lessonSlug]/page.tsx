import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLesson, getAdjacentLessons } from "@/lib/data/lessons"
import { getCourse } from "@/lib/data/courses"
import { getLessonProgress } from "@/lib/data/progress"
import { getNotes } from "@/lib/data/notes"
import { isBookmarked } from "@/lib/data/bookmarks"
import { LessonViewer } from "@/components/course/lesson-viewer"

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
 * Fetches lesson data, progress, notes, and nav context,
 * then delegates rendering to the LessonViewer client component.
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
    <LessonViewer
      lesson={lesson}
      course={course}
      progress={progress}
      notes={notes}
      prevLesson={adjacent.prev}
      nextLesson={adjacent.next}
      initialBookmarked={bookmarked}
    />
  )
}
