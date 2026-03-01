"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Reply, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { addNewsCommentAction, deleteNewsCommentAction } from "@/lib/actions/news"
import { newsCommentSchema, type NewsCommentFormData } from "@/lib/validations"
import { formatRelativeDate } from "@/lib/utils"
import type { NewsComment } from "@/lib/types"

interface NewsCommentSectionProps {
  /** Article ID */
  articleId: string
  /** Initial comments to display */
  comments: NewsComment[]
  /** Whether the user is authenticated */
  isAuthenticated: boolean
  /** Current authenticated user's ID, used for own-comment detection */
  currentUserId?: string | null
}

/**
 * Threaded comment section for news articles.
 * Supports adding, replying to, and deleting comments.
 * Requires authentication for interaction.
 */
export function NewsCommentSection({
  articleId,
  comments: initialComments,
  isAuthenticated,
  currentUserId,
}: NewsCommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState(initialComments)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  // Group comments into threads (top-level + replies)
  const topLevelComments = comments.filter((c) => c.parentId === null)
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId)

  async function handleAddComment(body: string, parentId?: string) {
    try {
      const newComment = await addNewsCommentAction(articleId, body, parentId)
      setComments((prev) => [...prev, newComment])
      setReplyingTo(null)
      toast.success("Comment added")
    } catch {
      toast.error("Failed to add comment")
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      const deleted = await deleteNewsCommentAction(commentId)
      if (deleted) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
        toast.info("Comment deleted")
      }
    } catch {
      toast.error("Failed to delete comment")
    }
  }

  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <MessageSquare className="size-5" />
        Comments ({comments.length})
      </h2>

      {/* Add comment form */}
      {isAuthenticated ? (
        <div className="mt-4">
          <CommentForm onSubmit={(body) => handleAddComment(body)} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          <button
            onClick={() => router.push("/login")}
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </button>{" "}
          to join the conversation.
        </p>
      )}

      {/* Comment threads */}
      {topLevelComments.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {topLevelComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                isOwnComment={!!currentUserId && comment.userId === currentUserId}
                isAuthenticated={isAuthenticated}
                onReply={() => setReplyingTo(comment.id)}
                onDelete={() => handleDeleteComment(comment.id)}
              />

              {/* Replies */}
              {getReplies(comment.id).length > 0 && (
                <div className="ml-10 mt-3 space-y-3 border-l-2 border-border pl-4">
                  {getReplies(comment.id).map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      isOwnComment={!!currentUserId && reply.userId === currentUserId}
                      isAuthenticated={isAuthenticated}
                      onDelete={() => handleDeleteComment(reply.id)}
                    />
                  ))}
                </div>
              )}

              {/* Reply form */}
              {replyingTo === comment.id && isAuthenticated && (
                <div className="ml-10 mt-3 border-l-2 border-primary/30 pl-4">
                  <CommentForm
                    onSubmit={(body) => handleAddComment(body, comment.id)}
                    onCancel={() => setReplyingTo(null)}
                    placeholder="Write a reply..."
                    autoFocus
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Internal Components ─────────────────────────────────────────────────────

interface CommentItemProps {
  comment: NewsComment
  isOwnComment: boolean
  isAuthenticated: boolean
  onReply?: () => void
  onDelete: () => void
}

function CommentItem({
  comment,
  isOwnComment,
  isAuthenticated,
  onReply,
  onDelete,
}: CommentItemProps) {
  return (
    <div className="flex gap-3">
      <Avatar className="size-8 flex-shrink-0">
        <AvatarFallback className="text-xs">
          {comment.userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{comment.userName}</span>
          <span className="text-muted-foreground">
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm whitespace-pre-wrap">{comment.body}</p>
        <div className="mt-1 flex items-center gap-2">
          {onReply && isAuthenticated && (
            <button
              onClick={onReply}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Reply className="size-3" />
              Reply
            </button>
          )}
          {isOwnComment && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface CommentFormProps {
  onSubmit: (body: string) => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
}

function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "Share your thoughts...",
  autoFocus = false,
}: CommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsCommentFormData>({
    resolver: zodResolver(newsCommentSchema),
    defaultValues: { body: "" },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(data.body)
        reset()
      })}
      className="space-y-2"
    >
      <Textarea
        {...register("body")}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        className="resize-none"
      />
      {errors.body && (
        <p className="text-xs text-destructive">{errors.body.message}</p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  )
}
