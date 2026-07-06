import type { Metadata } from "next"
import { getBookmarks } from "@/lib/data/bookmarks"
import { getCourses } from "@/lib/data/courses"
import { getLabs } from "@/lib/data/labs"
import { EmptyState } from "@/components/shared/empty-state"
import { formatRelativeDate } from "@/lib/utils"
import Link from "next/link"
import styles from "./bookmarks-fde.module.css"

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved lessons and labs.",
}

export default async function BookmarksPage() {
  const [bookmarks, courses, labs] = await Promise.all([
    getBookmarks(),
    getCourses(),
    getLabs(),
  ])

  // Resolve bookmark items to their content
  const items = bookmarks.map((bm) => {
    if (bm.lessonId) {
      // Find lesson across all courses
      for (const course of courses) {
        for (const section of course.sections) {
          const lesson = section.lessons.find((l) => l.id === bm.lessonId)
          if (lesson) {
            return {
              id: bm.id,
              type: "lesson" as const,
              title: lesson.title,
              subtitle: course.title,
              href: `/course/${course.slug}/lesson/${lesson.slug}`,
              createdAt: bm.createdAt,
            }
          }
        }
      }
    }
    if (bm.labId) {
      const lab = labs.find((l) => l.id === bm.labId)
      if (lab) {
        return {
          id: bm.id,
          type: "lab" as const,
          title: lab.title,
          subtitle: lab.category,
          href: `/labs/${lab.slug}`,
          createdAt: bm.createdAt,
        }
      }
    }
    return null
  }).filter(Boolean)

  return (
    <div className={styles.shell} data-section="bookmarks">
      <header className={styles.head}>
        <h1 className={styles.title}>Bookmarks</h1>
        <p className={styles.mono}>Your saved lessons and labs</p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          kicker="No bookmarks yet"
          title="Nothing saved yet"
          description="Save lessons and labs to access them quickly later."
          action={{ label: "Start learning", href: "/course/applied-ai-skills" }}
        />
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <Link key={item!.id} href={item!.href} className={styles.row}>
              <span
                className={`${styles.typeLabel} ${
                  item!.type === "lesson" ? styles.typeLesson : styles.typeLab
                }`}
              >
                {item!.type}
              </span>
              <p className={styles.rowTitle}>{item!.title}</p>
              <p className={styles.rowMeta}>
                {item!.subtitle} · saved {formatRelativeDate(item!.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
