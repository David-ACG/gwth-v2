"use client"

import { useState, useTransition } from "react"
import { toggleBookmarkAction } from "@/lib/actions/bookmarks"
import type { BookmarkTarget } from "@/lib/types"
import { toast } from "sonner"

/**
 * Provides optimistic bookmark toggle with toast feedback.
 * Uses React 19's useOptimistic for instant UI updates.
 */
export function useBookmark(initialBookmarked: boolean) {
  const [isPending, startTransition] = useTransition()
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)

  /** Toggles bookmark state with optimistic update and toast notification */
  function toggle(params: BookmarkTarget) {
    const previousState = isBookmarked
    setIsBookmarked(!previousState)

    startTransition(async () => {
      try {
        const result = await toggleBookmarkAction(params)
        setIsBookmarked(result)
        if (result) {
          toast.success("Bookmarked", {
            description: "Added to your saved items",
          })
        } else {
          toast.info("Removed bookmark")
        }
      } catch {
        setIsBookmarked(previousState)
        toast.error("Bookmark not saved", { description: "Please try again." })
      }
    })
  }

  return {
    isBookmarked,
    isPending,
    toggle,
  }
}
