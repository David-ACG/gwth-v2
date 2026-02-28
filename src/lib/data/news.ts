/**
 * Data access functions for news articles and voting.
 * Currently backed by mock data. Will be replaced with Supabase calls later.
 */

import type { NewsArticle, NewsComment, NewsSortOption } from "@/lib/types"
import {
  mockNewsArticles,
  mockNewsVotes,
  mockNewsComments,
} from "./mock-data"
import { NEWS_PAGE_SIZE } from "@/lib/config"

/**
 * Fetches news articles with sorting, filtering, and pagination.
 * Returns articles matching the given criteria and the total count for pagination.
 */
export async function getNews(params: {
  sort?: NewsSortOption
  category?: string
  tag?: string
  query?: string
  page?: number
  limit?: number
}): Promise<{ articles: NewsArticle[]; total: number }> {
  let results = mockNewsArticles.filter((a) => a.status === "published")

  if (params.category) {
    results = results.filter((a) => a.category === params.category)
  }

  if (params.tag) {
    const tag = params.tag.toLowerCase()
    results = results.filter((a) =>
      a.tags.some((t) => t.toLowerCase() === tag)
    )
  }

  if (params.query) {
    const q = params.query.toLowerCase()
    results = results.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  const sort = params.sort ?? "hot"
  switch (sort) {
    case "hot":
      results.sort((a, b) => b.hotnessScore - a.hotnessScore)
      break
    case "new":
      results.sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
      )
      break
    case "top":
      results.sort((a, b) => b.voteCount - a.voteCount)
      break
  }

  const total = results.length
  const limit = params.limit ?? NEWS_PAGE_SIZE
  const page = params.page ?? 1
  const offset = (page - 1) * limit
  results = results.slice(offset, offset + limit)

  return { articles: results, total }
}

/**
 * Fetches a single news article by slug.
 * Returns null if the article doesn't exist or isn't published.
 */
export async function getNewsArticle(
  slug: string
): Promise<NewsArticle | null> {
  return (
    mockNewsArticles.find(
      (a) => a.slug === slug && a.status === "published"
    ) ?? null
  )
}

/**
 * Returns available categories and tags across all published articles.
 * Used to populate filter dropdowns.
 */
export async function getNewsFilters(): Promise<{
  categories: string[]
  tags: string[]
}> {
  const published = mockNewsArticles.filter((a) => a.status === "published")
  const categories = new Set(published.map((a) => a.category))
  const tags = new Set(published.flatMap((a) => a.tags))
  return {
    categories: [...categories].sort(),
    tags: [...tags].sort(),
  }
}

/**
 * Returns the article IDs the given user has voted on.
 * Used to show the filled/unfilled vote button state.
 */
export async function getUserVotes(userId: string): Promise<string[]> {
  return mockNewsVotes
    .filter((v) => v.userId === userId)
    .map((v) => v.articleId)
}

/**
 * Toggles a vote on a news article for the current mock user.
 * If the user has already voted, removes the vote. Otherwise, adds it.
 * Returns the new vote state and updated count.
 */
export async function toggleVote(
  articleId: string
): Promise<{ voted: boolean; newCount: number }> {
  const existingIndex = mockNewsVotes.findIndex(
    (v) => v.articleId === articleId && v.userId === "user_mock_001"
  )

  const article = mockNewsArticles.find((a) => a.id === articleId)
  if (!article) throw new Error("Article not found")

  if (existingIndex >= 0) {
    mockNewsVotes.splice(existingIndex, 1)
    article.voteCount -= 1
    return { voted: false, newCount: article.voteCount }
  }

  mockNewsVotes.push({
    id: `vote_${Date.now()}`,
    articleId,
    userId: "user_mock_001",
    createdAt: new Date(),
  })
  article.voteCount += 1
  return { voted: true, newCount: article.voteCount }
}

/**
 * Fetches comments for a news article, ordered by creation date (oldest first).
 */
export async function getNewsComments(
  articleId: string
): Promise<NewsComment[]> {
  return mockNewsComments
    .filter((c) => c.articleId === articleId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

/**
 * Adds a comment to a news article. Returns the newly created comment.
 */
export async function addNewsComment(
  articleId: string,
  body: string,
  parentId?: string
): Promise<NewsComment> {
  const comment: NewsComment = {
    id: `nc_${Date.now()}`,
    articleId,
    userId: "user_mock_001",
    parentId: parentId ?? null,
    body,
    createdAt: new Date(),
    updatedAt: new Date(),
    userName: "David",
    userAvatar: null,
  }
  mockNewsComments.push(comment)

  const article = mockNewsArticles.find((a) => a.id === articleId)
  if (article) article.commentCount += 1

  return comment
}

/**
 * Deletes a comment by ID. Only the comment author can delete their own comments.
 * Returns true if the comment was deleted.
 */
export async function deleteNewsComment(commentId: string): Promise<boolean> {
  const index = mockNewsComments.findIndex(
    (c) => c.id === commentId && c.userId === "user_mock_001"
  )
  if (index < 0) return false

  const articleId = mockNewsComments[index]!.articleId
  mockNewsComments.splice(index, 1)

  const article = mockNewsArticles.find((a) => a.id === articleId)
  if (article) article.commentCount -= 1

  return true
}
