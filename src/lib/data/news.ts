/**
 * Data access functions for news articles and voting.
 * Read operations use the admin client (bypasses RLS for published content queries).
 * Mutations use the cookie-based auth client so RLS policies enforce ownership.
 */

import type { NewsArticle, NewsComment, NewsSortOption } from "@/lib/types"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { NEWS_PAGE_SIZE } from "@/lib/config"

// ─── Row → Type Mappers ─────────────────────────────────────────────────────

/** Maps a Supabase news_articles row (snake_case) to a NewsArticle (camelCase). */
function mapArticle(row: Record<string, unknown>): NewsArticle {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    content: row.content as string,
    url: (row.url as string) ?? null,
    category: row.category as NewsArticle["category"],
    tags: (row.tags as string[]) ?? [],
    thumbnailUrl: (row.thumbnail_url as string) ?? null,
    author: row.author as string,
    voteCount: row.vote_count as number,
    commentCount: row.comment_count as number,
    labSlug: (row.lab_slug as string) ?? null,
    isFeatured: row.is_featured as boolean,
    status: row.status as NewsArticle["status"],
    publishedAt: new Date(row.published_at as string),
    hotnessScore: (row.hotness_score as number) ?? 0,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  }
}

/** Maps a Supabase news_comments row (snake_case) to a NewsComment (camelCase). */
function mapComment(row: Record<string, unknown>): NewsComment {
  return {
    id: row.id as string,
    articleId: row.article_id as string,
    userId: row.user_id as string,
    parentId: (row.parent_id as string) ?? null,
    body: row.body as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    userName: (row.user_name as string) ?? "Anonymous",
    userAvatar: (row.user_avatar as string) ?? null,
  }
}

// ─── Data Access Functions ───────────────────────────────────────────────────

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
  const supabase = createAdminClient()
  const sort = params.sort ?? "hot"
  const limit = params.limit ?? NEWS_PAGE_SIZE
  const page = params.page ?? 1
  const offset = (page - 1) * limit

  // Use the ranked view for hot sorting (includes hotness_score),
  // or the base table for new/top sorting.
  const table = sort === "hot" ? "news_articles_ranked" : "news_articles_ranked"
  let query = supabase
    .from(table)
    .select("*", { count: "exact" })

  if (params.category) {
    query = query.eq("category", params.category)
  }

  if (params.tag) {
    query = query.contains("tags", [params.tag])
  }

  if (params.query) {
    const q = params.query
    query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
  }

  switch (sort) {
    case "hot":
      query = query.order("hotness_score", { ascending: false })
      break
    case "new":
      query = query.order("published_at", { ascending: false })
      break
    case "top":
      query = query.order("vote_count", { ascending: false })
      break
  }

  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) throw new Error(error.message)

  return {
    articles: (data ?? []).map(mapArticle),
    total: count ?? 0,
  }
}

/**
 * Fetches a single news article by slug.
 * Returns null if the article doesn't exist or isn't published.
 */
export async function getNewsArticle(
  slug: string
): Promise<NewsArticle | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("news_articles_ranked")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error || !data) return null
  return mapArticle(data)
}

/**
 * Returns available categories and tags across all published articles.
 * Used to populate filter dropdowns.
 */
export async function getNewsFilters(): Promise<{
  categories: string[]
  tags: string[]
}> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("news_articles_ranked")
    .select("category, tags")

  if (error || !data) return { categories: [], tags: [] }

  const categories = new Set(data.map((a) => a.category as string))
  const tags = new Set(data.flatMap((a) => (a.tags as string[]) ?? []))

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
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("news_votes")
    .select("article_id")
    .eq("user_id", userId)

  if (error || !data) return []
  return data.map((v) => v.article_id as string)
}

/**
 * Toggles a vote on a news article.
 * Uses the cookie-based auth client so RLS policies enforce ownership.
 * Returns the new vote state and updated count.
 */
export async function toggleVote(
  articleId: string,
  userId: string
): Promise<{ voted: boolean; newCount: number }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("toggle_news_vote", {
    p_article_id: articleId,
    p_user_id: userId,
  })

  if (error) throw new Error(error.message)

  const result = data as { voted: boolean; vote_count: number }
  return { voted: result.voted, newCount: result.vote_count }
}

/**
 * Fetches comments for a news article, ordered by creation date (oldest first).
 */
export async function getNewsComments(
  articleId: string
): Promise<NewsComment[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("news_comments")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: true })

  if (error || !data) return []
  return data.map(mapComment)
}

/**
 * Adds a comment to a news article. Returns the newly created comment.
 * Uses the cookie-based auth client so RLS policies enforce ownership.
 */
export async function addNewsComment(
  articleId: string,
  body: string,
  userId: string,
  userName: string,
  parentId?: string
): Promise<NewsComment> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("news_comments")
    .insert({
      article_id: articleId,
      user_id: userId,
      parent_id: parentId ?? null,
      body,
      user_name: userName,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapComment(data)
}

/**
 * Deletes a comment by ID. Only the comment author can delete their own comments.
 * Uses the cookie-based auth client so RLS policies enforce ownership.
 * Returns true if the comment was deleted.
 */
export async function deleteNewsComment(
  commentId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("news_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId)

  return !error
}
