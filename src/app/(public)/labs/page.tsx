import type { Metadata } from "next"
import Image from "next/image"
import { FlaskConical, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { searchLabs, getLabFilters } from "@/lib/data/labs"
import { LabCard } from "@/components/lab/lab-card"
import { LabsFilter } from "@/components/lab/labs-filter"
import { EmptyState } from "@/components/shared/empty-state"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Free Labs",
  description:
    "Hands-on AI labs you can try for free. Build real projects, learn practical skills — no account required to browse.",
}

/**
 * Public labs listing page.
 * Shows all labs with filtering. No auth required, no progress data.
 */
export default async function PublicLabsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    difficulty?: string
    technology?: string
  }>
}) {
  const params = await searchParams
  const [labs, filters] = await Promise.all([
    searchLabs({
      query: params.q,
      category: params.category,
      difficulty: params.difficulty as
        | "beginner"
        | "intermediate"
        | "advanced"
        | undefined,
      technology: params.technology,
    }),
    getLabFilters(),
  ])

  return (
    <>
      {/* Header section */}
      <section className="border-b bg-muted/30 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <Image
                src="/free-labs.png"
                alt="AI labs — scientist with test tubes surrounded by lab projects like Family AI Bot, AI Customer Chatbot, AI Readiness Assessment Tool, and Local Whisper Bot"
                width={900}
                height={500}
                className="w-full max-w-lg rounded-2xl sm:max-w-xl md:max-w-2xl"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Build Real AI Projects
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Hands-on labs with step-by-step guidance. Pick a project, follow
              the instructions, and build something real.
            </p>
            <div className="mt-6">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/signup">
                  Sign Up to Track Progress
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Labs grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LabsFilter
            categories={filters.categories}
            technologies={filters.technologies}
          />

          {labs.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={FlaskConical}
                title="No labs found"
                description="Try adjusting your filters or search query."
                action={{ label: "Clear Filters", href: "/labs" }}
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {labs.map((lab) => (
                <LabCard key={lab.id} lab={lab} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
