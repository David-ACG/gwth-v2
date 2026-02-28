"use client"

import { useRouter } from "next/navigation"
import { ChevronUp } from "lucide-react"
import { useVote } from "@/hooks/use-vote"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface UpvoteButtonProps {
  /** News article ID to vote on */
  articleId: string
  /** Whether the current user has voted on this article */
  initialVoted: boolean
  /** Current vote count */
  initialCount: number
  /** Whether the user is authenticated (shows login prompt if false) */
  isAuthenticated: boolean
  /** Size variant */
  size?: "sm" | "lg"
}

/**
 * Toggle upvote button with optimistic UI.
 * Shows a login prompt toast when unauthenticated users try to vote.
 */
export function UpvoteButton({
  articleId,
  initialVoted,
  initialCount,
  isAuthenticated,
  size = "sm",
}: UpvoteButtonProps) {
  const router = useRouter()
  const { hasVoted, voteCount, isPending, toggle } = useVote(
    initialVoted,
    initialCount
  )

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.info("Sign in to vote", {
        action: {
          label: "Sign In",
          onClick: () => router.push("/login"),
        },
      })
      return
    }

    toggle(articleId)
  }

  const isLarge = size === "lg"

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={hasVoted ? "Remove your upvote" : "Upvote this article"}
      aria-pressed={hasVoted}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg border transition-colors",
        isLarge ? "px-4 py-3" : "px-2.5 py-2",
        hasVoted
          ? "border-primary/30 bg-primary/5 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-primary",
        isPending && "opacity-70"
      )}
    >
      <ChevronUp
        className={cn(
          "transition-transform",
          isLarge ? "size-5" : "size-4",
          hasVoted && "scale-110"
        )}
        strokeWidth={hasVoted ? 2.5 : 2}
      />
      <span
        className={cn(
          "font-semibold tabular-nums",
          isLarge ? "text-base" : "text-xs"
        )}
        aria-live="polite"
      >
        {voteCount}
      </span>
    </button>
  )
}
