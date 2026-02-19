import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Radar, BarChart3, Clock, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getTechRadarTools,
  getTechRadarCategories,
  getTechRadarToolCount,
  getTechRadarLastUpdated,
} from "@/lib/data/tech-radar"
import { TechRadarGrid } from "@/components/tech-radar/tech-radar-grid"

export const metadata: Metadata = {
  title: "Tech Radar",
  description:
    "Track 47+ AI tools daily with the GWTH Tech Radar. Independent reviews, no vendor partnerships. See what is GA, Beta, Alpha, and trending right now.",
}

/**
 * Public Tech Radar page.
 * Server component that fetches tool data and passes it to the client-side
 * TechRadarGrid for interactive filtering.
 */
export default function TechRadarPage() {
  const tools = getTechRadarTools()
  const categories = getTechRadarCategories()
  const toolCount = getTechRadarToolCount()
  const lastUpdated = getTechRadarLastUpdated()

  const formattedDate = new Date(lastUpdated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "GWTH Tech Radar",
            description:
              "Track 47+ AI tools daily. Independent reviews with no vendor partnerships.",
            provider: {
              "@type": "Organization",
              name: "GWTH.ai",
              url: "https://gwth.ai",
            },
          }),
        }}
      />

      {/* Header */}
      <section className="border-b bg-muted/30 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Radar className="size-4" />
              Live Intelligence
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              GWTH Tech Radar
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {toolCount}+ AI tools tracked daily. Independent. No vendor
              partnerships.
            </p>
          </div>

          {/* Stats bar */}
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-1 rounded-lg bg-card p-4 shadow-sm">
              <Layers className="size-5 text-primary" />
              <span className="text-2xl font-bold">{toolCount}</span>
              <span className="text-xs text-muted-foreground">
                Tools Tracked
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-card p-4 shadow-sm">
              <BarChart3 className="size-5 text-accent" />
              <span className="text-2xl font-bold">{categories.length}</span>
              <span className="text-xs text-muted-foreground">Categories</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-card p-4 shadow-sm">
              <Clock className="size-5 text-muted-foreground" />
              <span className="text-sm font-semibold">{formattedDate}</span>
              <span className="text-xs text-muted-foreground">
                Last Updated
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TechRadarGrid tools={tools} categories={categories} />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            This is the intelligence your team gets as part of the course.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every tool on this radar is tested, scored, and compared against
            alternatives. When something changes, your course content updates
            the same day.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/signup">
                Start Learning
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
