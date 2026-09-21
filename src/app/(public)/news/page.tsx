import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { getNews, getNewsFilters, getUserVotes } from "@/lib/data/news"
import { getCurrentUser } from "@/lib/auth"
import { NewsCard } from "@/components/news/news-card"
import { NewsFilters } from "@/components/news/news-filters"
import { EmptyState } from "@/components/shared/empty-state"
import { NEWS_PAGE_SIZE } from "@/lib/config"
import type { NewsSortOption } from "@/lib/types"
import { NewsletterInline } from "@/components/news/newsletter-inline"
import Link from "next/link"

/** Revalidate news feed every 12 hours */
export const revalidate = 43200

export const metadata: Metadata = {
  title: "News",
  description:
    "AI news, tools and insights for people working in the UK, voted on by the GWTH community. Top stories become hands-on labs.",
}

/**
 * Public news feed page.
 * Displays curated AI/tech news articles with upvoting, filtering, and pagination.
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
    <>
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

      {/* Header section */}
      <section className="border-b bg-muted/30 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              AI News & Votes
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              The latest in AI, curated by GWTH and ranked by the community.
              Top-voted stories become hands-on labs.
            </p>
            {/*
              The UK thread on this page (bead gwth-launch-88z.32.25). The
              other marketing pages answer "why here" with the course, the
              price or the rules a profession works to; a news feed can only
              answer it with what gets PICKED, so that is what this says.
              Keep it about selection, and do not reuse a sentence from
              another surface: the suite fails a UK sentence that appears on
              two of them.
            */}
            <p
              className="mt-4 text-base text-muted-foreground"
              data-testid="news-uk-note"
            >
              A story earns its place here by changing something for someone
              working in the United Kingdom: a rule that now applies to your
              trade, a tool that has finally opened to British users, a price
              quoted in pounds. Announcements that land nowhere near this
              country are left out, however loudly they are made.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="py-6 md:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <NewsletterInline />
        </div>
      </section>

      {/* Feed section */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <NewsFilters categories={filters.categories} tags={filters.tags} />

          {articles.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                kicker="No results"
                title="No articles found"
                description="Try adjusting your filters or search query."
                action={{ label: "Clear filters", href: "/news" }}
              />
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-4">
                {articles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    hasVoted={userVotes.includes(article.id)}
                    isAuthenticated={!!user}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  {currentPage > 1 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/news?${new URLSearchParams({
                          ...params,
                          page: String(currentPage - 1),
                        }).toString()}`}
                      >
                        Previous
                      </Link>
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  {currentPage < totalPages && (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/news?${new URLSearchParams({
                          ...params,
                          page: String(currentPage + 1),
                        }).toString()}`}
                      >
                        Next
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
