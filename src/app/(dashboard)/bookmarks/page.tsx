import type { Metadata } from "next"
import { getBookmarks } from "@/lib/data/bookmarks"
import { getCourses } from "@/lib/data/courses"
import { getLabs } from "@/lib/data/labs"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"
import { Badge } from "@/components/ui/badge"
import { Bookmark, BookOpen, FlaskConical } from "lucide-react"
import Link from "next/link"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
        <p className="mt-1 text-muted-foreground">
          Your saved lessons and labs
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Save lessons and labs to access them quickly later."
          action={{ label: "Browse Courses", href: "/courses" }}
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item!.id} href={item!.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 p-4">
                  {item!.type === "lesson" ? (
                    <BookOpen className="size-5 text-primary" />
                  ) : (
                    <FlaskConical className="size-5 text-accent" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item!.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item!.subtitle}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {item!.type}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
