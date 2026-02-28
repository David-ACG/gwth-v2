import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ExternalLink } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils"
import { NEWS_CATEGORIES } from "@/lib/config"
import { UpvoteButton } from "./upvote-button"
import { LabBadge } from "./lab-badge"
import type { NewsArticle } from "@/lib/types"

interface NewsCardProps {
  /** The news article to display */
  article: NewsArticle
  /** Whether the current user has voted on this article */
  hasVoted: boolean
  /** Whether the user is authenticated */
  isAuthenticated: boolean
}

/**
 * Card component for the news feed grid.
 * Shows upvote button, category badge, title, excerpt, tags, and metadata.
 */
export function NewsCard({ article, hasVoted, isAuthenticated }: NewsCardProps) {
  const categoryConfig = NEWS_CATEGORIES[article.category]

  return (
    <Card className="group transition-all duration-200 hover:shadow-md">
      <CardContent className="flex gap-4 p-4">
        {/* Upvote button */}
        <div className="flex-shrink-0 pt-1">
          <UpvoteButton
            articleId={article.id}
            initialVoted={hasVoted}
            initialCount={article.voteCount}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            {categoryConfig && (
              <Badge
                className={`border-0 text-xs ${categoryConfig.bgColor} ${categoryConfig.color}`}
              >
                {categoryConfig.label}
              </Badge>
            )}
            {article.isFeatured && (
              <Badge variant="secondary" className="text-xs">
                Featured
              </Badge>
            )}
            {article.labSlug && <LabBadge labSlug={article.labSlug} />}
          </div>

          {/* Title */}
          <Link
            href={`/news/${article.slug}`}
            className="mt-2 block"
          >
            <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
              {article.title}
              {article.url && (
                <ExternalLink className="ml-1.5 inline size-3.5 text-muted-foreground" />
              )}
            </h3>
          </Link>

          {/* Excerpt */}
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {article.excerpt}
          </p>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {article.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
            {article.tags.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{article.tags.length - 4} more
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{article.author}</span>
            <span>&middot;</span>
            <time dateTime={article.publishedAt.toISOString()}>
              {formatRelativeDate(article.publishedAt)}
            </time>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3" />
              {article.commentCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
