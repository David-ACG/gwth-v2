"use client"

import { useOptimistic, useTransition } from "react"
import { toggleVote } from "@/lib/data/news"
import { toast } from "sonner"

/**
 * Provides optimistic vote toggle with toast feedback.
 * Uses React 19's useOptimistic for instant UI updates on the vote button and count.
 *
 * @param initialVoted - Whether the current user has already voted
 * @param initialCount - The current vote count on the article
 */
export function useVote(initialVoted: boolean, initialCount: number) {
  const [isPending, startTransition] = useTransition()

  const [optimisticState, setOptimisticState] = useOptimistic(
    { hasVoted: initialVoted, voteCount: initialCount },
    (_current, newState: { hasVoted: boolean; voteCount: number }) => newState
  )

  /** Toggles vote state with optimistic update and toast notification */
  function toggle(articleId: string) {
    const newVoted = !optimisticState.hasVoted
    const newCount = optimisticState.voteCount + (newVoted ? 1 : -1)
    setOptimisticState({ hasVoted: newVoted, voteCount: newCount })

    startTransition(async () => {
      try {
        await toggleVote(articleId)
        if (newVoted) {
          toast.success("Upvoted!", {
            description: "Your vote has been recorded",
          })
        } else {
          toast.info("Vote removed")
        }
      } catch {
        toast.error("Failed to vote", {
          description: "Please try again",
        })
      }
    })
  }

  return {
    hasVoted: optimisticState.hasVoted,
    voteCount: optimisticState.voteCount,
    isPending,
    toggle,
  }
}
