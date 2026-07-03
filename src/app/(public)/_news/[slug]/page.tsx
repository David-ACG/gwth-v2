import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { getNewsArticle, getNewsComments, getUserVotes } from "@/lib/data/news"
import { getCurrentUser } from "@/lib/auth"
import { UpvoteButton } from "@/components/news/upvote-button"
import { LabBadge } from "@/components/news/lab-badge"
import { NewsCommentSection } from "@/components/news/news-comment-section"
import { MarkdownRenderer } from "@/components/shared/markdown-renderer"
import { ENABLE_NEWS, NEWS_CATEGORIES } from "@/lib/config"
import { formatRelativeDate } from "@/lib/utils"
import styles from "@/components/news/news-fde.module.css"

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
      publishedTime: new Date(article.publishedAt).toISOString(),
      authors: [article.author],
      tags: article.tags,
    },
  }
}

/**
 * News article detail page in the FDE journal register.
 * Renders the full article content, upvote button, and threaded comments.
 */
export default async function NewsArticlePage({ params }: PageProps) {
  if (!ENABLE_NEWS) notFound()

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
    <div className={styles.shell}>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            description: article.excerpt,
            datePublished: new Date(article.publishedAt).toISOString(),
            dateModified: new Date(article.updatedAt).toISOString(),
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

      <article className={styles.articleShell}>
        <div className={styles.page}>
          <Link href="/news" className={styles.backLink}>
            &larr; Back to news
          </Link>

          <div className={styles.articleHeader}>
            <div className={styles.desktopVote}>
              <UpvoteButton
                articleId={article.id}
                initialVoted={hasVoted}
                initialCount={article.voteCount}
                isAuthenticated={!!user}
                size="lg"
              />
            </div>

            <div className={styles.articleHeaderBody}>
              <div className={styles.cardLabels}>
                {categoryConfig && (
                  <span className={styles.categoryLabel}>
                    {categoryConfig.label}
                  </span>
                )}
                {article.isFeatured && (
                  <span className={styles.featuredLabel}>Featured</span>
                )}
                {article.labSlug && <LabBadge labSlug={article.labSlug} />}
              </div>

              <h1 className={styles.articleTitle}>{article.title}</h1>

              <div className={styles.articleMeta}>
                <span>By {article.author}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={new Date(article.publishedAt).toISOString()}>
                  {formatRelativeDate(new Date(article.publishedAt))}
                </time>
                <span aria-hidden="true">·</span>
                <span>
                  {article.commentCount}{" "}
                  {article.commentCount === 1 ? "comment" : "comments"}
                </span>
              </div>

              {article.tags.length > 0 && (
                <div className={styles.tagRow}>
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/news?tag=${tag}`}
                      className={styles.tagLink}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              <div className={styles.mobileVote}>
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

          {article.url && (
            <div className={styles.externalLink}>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.buttonOutline}
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                Read original article
              </a>
            </div>
          )}

          <div className={styles.articleBody}>
            <MarkdownRenderer content={article.content} />
          </div>

          <div className={styles.commentsBlock}>
            <NewsCommentSection
              articleId={article.id}
              comments={comments}
              isAuthenticated={!!user}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </article>
    </div>
  )
}
