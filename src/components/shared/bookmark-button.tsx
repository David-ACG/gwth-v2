"use client"

import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBookmark } from "@/hooks/use-bookmark"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  /** Whether the item is initially bookmarked */
  initialBookmarked: boolean
  /** Lesson ID (mutually exclusive with labId) */
  lessonId?: string
  /** Lab ID (mutually exclusive with lessonId) */
  labId?: string
  /** Additional CSS classes */
  className?: string
}

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
  const { isBookmarked, toggle } = useBookmark(initialBookmarked)

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggle({ lessonId, labId })}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
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
