import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getNews, getNewsFilters, getUserVotes } from "@/lib/data/news"
import { getCurrentUser } from "@/lib/auth"
import { NewsCard } from "@/components/news/news-card"
import { NewsFilters } from "@/components/news/news-filters"
import { NewsletterInline } from "@/components/news/newsletter-inline"
import { ENABLE_NEWS, NEWS_PAGE_SIZE } from "@/lib/config"
import type { NewsSortOption } from "@/lib/types"
import styles from "@/components/news/news-fde.module.css"

export const metadata: Metadata = {
  title: "News",
  description:
    "AI news, tools, and insights, voted on by the GWTH community. Top stories become hands-on labs.",
}

/**
 * Public news feed page in the FDE journal register.
 * Displays curated AI/tech news articles with upvoting, filtering, and
 * pagination under a drenched teal masthead.
 */
export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string
    category?: string
    tag?: string
    q?: string
    page?: string
  }>
}) {
  if (!ENABLE_NEWS) notFound()

  const params = await searchParams
  const user = await getCurrentUser()
  const currentPage = params.page ? parseInt(params.page) : 1

  const [{ articles, total }, filters, userVotes] = await Promise.all([
    getNews({
      sort: (params.sort as NewsSortOption) ?? undefined,
      category: params.category,
      tag: params.tag,
      query: params.q,
      page: currentPage,
    }),
    getNewsFilters(),
    user ? getUserVotes(user.id) : Promise.resolve([]),
  ])

  const totalPages = Math.ceil(total / NEWS_PAGE_SIZE)

  return (
    <div className={styles.shell}>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "GWTH News",
            description:
              "AI news voted on by the GWTH community. Top stories become labs.",
            provider: {
              "@type": "Organization",
              name: "GWTH.ai",
              url: "https://gwth.ai",
            },
          }),
        }}
      />

      <section className={styles.masthead} data-section="masthead">
        <div className={styles.page}>
          <p className={styles.mastheadKicker}>The GWTH feed</p>
          <h1 className={styles.mastheadTitle}>
            AI news, <em>ranked by builders.</em>
          </h1>
          <p className={styles.standfirst}>
            The latest in AI, curated by GWTH and ranked by the community.
            Top-voted stories become hands-on labs.
          </p>
        </div>
      </section>

      <section className={styles.section} data-section="feed">
        <div className={styles.page}>
          <NewsletterInline />

          <div className={`${styles.sectionHead} ${styles.feedHead}`}>
            <h2 className={styles.sectionTitle}>The feed.</h2>
            <p className={styles.mono}>
              {total} {total === 1 ? "story" : "stories"}
            </p>
          </div>

          <NewsFilters categories={filters.categories} tags={filters.tags} />

          {articles.length === 0 ? (
            <div className={styles.empty}>
              <h3>No articles found.</h3>
              <p>Try adjusting your filters or search query.</p>
              <Link href="/news" className={styles.buttonOutline}>
                Clear filters
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.cardList}>
                {articles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    hasVoted={userVotes.includes(article.id)}
                    isAuthenticated={!!user}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {currentPage > 1 && (
                    <Link
                      href={`/news?${new URLSearchParams({
                        ...params,
                        page: String(currentPage - 1),
                      }).toString()}`}
                      className={styles.buttonOutline}
                    >
                      Previous
                    </Link>
                  )}
                  <span className={styles.pageLabel}>
                    Page {currentPage} of {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Link
                      href={`/news?${new URLSearchParams({
                        ...params,
                        page: String(currentPage + 1),
                      }).toString()}`}
                      className={styles.buttonOutline}
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
