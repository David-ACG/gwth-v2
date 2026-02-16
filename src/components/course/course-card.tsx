import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock } from "lucide-react"
import { formatDuration, formatProgress } from "@/lib/utils"
import type { Course } from "@/lib/types"

interface CourseCardProps {
  /** The course to display */
  course: Course
  /** User's progress (0-1). Omit to hide the progress bar. */
  progress?: number
}

/**
 * Card component displaying a course with thumbnail placeholder,
 * title, description, progress bar, and metadata badges.
 */
export function CourseCard({ course, progress }: CourseCardProps) {
  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0
  )

  return (
    <Link href={`/course/${course.slug}`}>
      <Card className="group h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        {/* Thumbnail placeholder */}
        <div className="aspect-video rounded-t-lg bg-gradient-to-br from-primary/20 to-accent/20" />
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {course.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {course.category}
            </Badge>
          </div>
          <h3 className="mt-2 text-lg font-semibold group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5" />
              {totalLessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatDuration(course.estimatedDuration)}
            </span>
          </div>
          {progress !== undefined && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{formatProgress(progress)}</span>
              </div>
              <Progress value={progress * 100} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
