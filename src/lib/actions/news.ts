"use server"

/**
 * Server Actions for news article mutations (voting, comments).
 * These are called from Client Components and run on the server.
 */

import {
  toggleVote as toggleVoteData,
  addNewsComment as addCommentData,
  deleteNewsComment as deleteCommentData,
} from "@/lib/data/news"
import type { NewsComment } from "@/lib/types"

/**
 * Toggles a vote on a news article.
 * Returns the new vote state and updated count.
 */
export async function toggleVoteAction(
  articleId: string
): Promise<{ voted: boolean; newCount: number }> {
  return toggleVoteData(articleId)
}

/**
 * Adds a comment to a news article. Returns the newly created comment.
 */
export async function addNewsCommentAction(
  articleId: string,
  body: string,
  parentId?: string
): Promise<NewsComment> {
  return addCommentData(articleId, body, parentId)
}

/**
 * Deletes a comment by ID. Returns true if the comment was deleted.
 */
export async function deleteNewsCommentAction(
  commentId: string
): Promise<boolean> {
  return deleteCommentData(commentId)
}
