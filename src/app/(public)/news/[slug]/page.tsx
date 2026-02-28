import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getNewsArticle, getNewsComments, getUserVotes } from "@/lib/data/news"
import { getCurrentUser } from "@/lib/auth"
import { UpvoteButton } from "@/components/news/upvote-button"
import { LabBadge } from "@/components/news/lab-badge"
import { NewsCommentSection } from "@/components/news/news-comment-section"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import { NEWS_CATEGORIES } from "@/lib/config"
import { formatRelativeDate } from "@/lib/utils"

type PageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Generates dynamic metadata for a news article page.
 * Includes Open Graph tags for social sharing.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getNewsArticle(slug)
  if (!article) return { title: "Article Not Found" }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
      authors: [article.author],
      tags: article.tags,
    },
  }
}

/**
 * News article detail page.
 * Renders the full article content, upvote button, and threaded comments.
 */
export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params
  const [article, user] = await Promise.all([
    getNewsArticle(slug),
    getCurrentUser(),
  ])

  if (!article) notFound()

  const [comments, userVotes] = await Promise.all([
    getNewsComments(article.id),
    user ? getUserVotes(user.id) : Promise.resolve([]),
  ])

  const hasVoted = userVotes.includes(article.id)
  const categoryConfig = NEWS_CATEGORIES[article.category]

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt.toISOString(),
            dateModified: article.updatedAt.toISOString(),
            author: {
              "@type": "Person",
              name: article.author,
            },
            publisher: {
              "@type": "Organization",
              name: "GWTH.ai",
              url: "https://gwth.ai",
            },
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/LikeAction",
              userInteractionCount: article.voteCount,
            },
          }),
        }}
      />

      <article className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/news"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to News
          </Link>

          {/* Article header */}
          <div className="flex gap-6">
            {/* Upvote button */}
            <div className="hidden flex-shrink-0 sm:block">
              <UpvoteButton
                articleId={article.id}
                initialVoted={hasVoted}
                initialCount={article.voteCount}
                isAuthenticated={!!user}
                size="lg"
              />
            </div>

            <div className="min-w-0 flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {categoryConfig && (
                  <Badge
                    className={`border-0 ${categoryConfig.bgColor} ${categoryConfig.color}`}
                  >
                    {categoryConfig.label}
                  </Badge>
                )}
                {article.isFeatured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
                {article.labSlug && <LabBadge labSlug={article.labSlug} />}
              </div>

              {/* Title */}
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {article.title}
              </h1>

              {/* Meta line */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>By {article.author}</span>
                <span>&middot;</span>
                <time dateTime={article.publishedAt.toISOString()}>
                  {formatRelativeDate(article.publishedAt)}
                </time>
                <span>&middot;</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="size-3.5" />
                  {article.commentCount} comments
                </span>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <Link key={tag} href={`/news?tag=${tag}`}>
                    <Badge
                      variant="outline"
                      className="font-normal hover:bg-muted"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Mobile upvote button */}
              <div className="mt-4 sm:hidden">
                <UpvoteButton
                  articleId={article.id}
                  initialVoted={hasVoted}
                  initialCount={article.voteCount}
                  isAuthenticated={!!user}
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* External link */}
          {article.url && (
            <div className="mt-6">
              <Button variant="outline" asChild>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="size-4" />
                  Read original article
                </a>
              </Button>
            </div>
          )}

          {/* Article content */}
          <div className="mt-10">
            <MarkdownRenderer content={article.content} />
          </div>

          {/* Comments section */}
          <div className="mt-12 border-t pt-8">
            <NewsCommentSection
              articleId={article.id}
              comments={comments}
              isAuthenticated={!!user}
            />
          </div>
        </div>
      </article>
    </>
  )
}
