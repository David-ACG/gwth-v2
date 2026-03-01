"use server"

/**
 * Server Actions for news article mutations (voting, comments).
 * These are called from Client Components and run on the server.
 * All mutations require authentication — unauthenticated calls throw.
 */

import {
  toggleVote as toggleVoteData,
  addNewsComment as addCommentData,
  deleteNewsComment as deleteCommentData,
} from "@/lib/data/news"
import { getCurrentUser } from "@/lib/auth"
import type { NewsComment } from "@/lib/types"

/**
 * Toggles a vote on a news article.
 * Requires authentication. Returns the new vote state and updated count.
 */
export async function toggleVoteAction(
  articleId: string
): Promise<{ voted: boolean; newCount: number }> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")

  return toggleVoteData(articleId, user.id)
}

/**
 * Adds a comment to a news article. Returns the newly created comment.
 * Requires authentication.
 */
export async function addNewsCommentAction(
  articleId: string,
  body: string,
  parentId?: string
): Promise<NewsComment> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")

  return addCommentData(articleId, body, user.id, user.name, parentId)
}

/**
 * Deletes a comment by ID. Returns true if the comment was deleted.
 * Requires authentication. Only the comment author can delete their own comments.
 */
export async function deleteNewsCommentAction(
  commentId: string
): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")

  return deleteCommentData(commentId, user.id)
}
