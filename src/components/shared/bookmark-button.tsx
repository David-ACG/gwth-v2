"use client"

import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBookmark } from "@/hooks/use-bookmark"
import { cn } from "@/lib/utils"

type BookmarkButtonProps = {
  /** Whether the item is initially bookmarked */
  initialBookmarked: boolean
  /** Additional CSS classes */
  className?: string
} & (
  | {
      /** Lesson ID (mutually exclusive with labId) */
      lessonId: string
      labId?: never
    }
  | {
      /** Lab ID (mutually exclusive with lessonId) */
      lessonId?: never
      labId: string
    }
)

/**
 * Toggle button for bookmarking lessons and labs.
 * Uses optimistic UI for instant feedback.
 */
export function BookmarkButton({
  initialBookmarked,
  lessonId,
  labId,
  className,
}: BookmarkButtonProps) {
  const { isBookmarked, isPending, toggle } = useBookmark(initialBookmarked)
  const target = lessonId ? { lessonId } : { labId: labId! }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggle(target)}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
      aria-pressed={isBookmarked}
      disabled={isPending}
      className={cn("size-8", className)}
    >
      <Bookmark
        className={cn(
          "size-4 transition-colors",
          isBookmarked && "fill-primary text-primary"
        )}
      />
    </Button>
  )
}
