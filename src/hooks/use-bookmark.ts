"use client"

import { useOptimistic, useTransition } from "react"
import { toggleBookmark } from "@/lib/data/bookmarks"
import { toast } from "sonner"

/**
 * Provides optimistic bookmark toggle with toast feedback.
 * Uses React 19's useOptimistic for instant UI updates.
 */
export function useBookmark(initialBookmarked: boolean) {
  const [isPending, startTransition] = useTransition()

  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
    initialBookmarked,
    (_current, newValue: boolean) => newValue
  )

  /** Toggles bookmark state with optimistic update and toast notification */
  function toggle(params: { lessonId?: string; labId?: string }) {
    const newState = !optimisticBookmarked
    setOptimisticBookmarked(newState)

    startTransition(async () => {
      const result = await toggleBookmark(params)
      if (result) {
        toast.success("Bookmarked", { description: "Added to your saved items" })
      } else {
        toast.info("Removed bookmark")
      }
    })
  }

  return {
    isBookmarked: optimisticBookmarked,
    isPending,
    toggle,
  }
}
