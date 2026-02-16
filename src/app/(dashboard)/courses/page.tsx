import type { Metadata } from "next"
import { searchCourses, getCourseCategories } from "@/lib/data/courses"
import { getAllCourseProgress } from "@/lib/data/progress"
import { CourseCard } from "@/components/course/course-card"
import { EmptyState } from "@/components/shared/empty-state"
import { BookOpen } from "lucide-react"
import { CoursesFilter } from "@/components/course/courses-filter"

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse all AI courses available on GWTH.ai.",
}

/**
 * Courses listing page with search and filters (category, difficulty).
 * Filters sync to URL search params.
 */
export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; difficulty?: string }>
}) {
  const params = await searchParams
  const [courses, categories, courseProgress] = await Promise.all([
    searchCourses({
      query: params.q,
      category: params.category,
      difficulty: params.difficulty as "beginner" | "intermediate" | "advanced" | undefined,
    }),
    getCourseCategories(),
    getAllCourseProgress(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="mt-1 text-muted-foreground">
          Browse our catalog of AI courses
        </p>
      </div>

      <CoursesFilter categories={categories} />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your filters or search query."
          action={{ label: "Clear Filters", href: "/courses" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const progress = courseProgress.find(
              (p) => p.courseId === course.id
            )
            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={progress?.progress}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
