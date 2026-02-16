import type { Metadata } from "next"
import { searchLabs, getLabFilters } from "@/lib/data/labs"
import { getAllLabProgress } from "@/lib/data/progress"
import { LabCard } from "@/components/lab/lab-card"
import { EmptyState } from "@/components/shared/empty-state"
import { FlaskConical } from "lucide-react"
import { LabsFilter } from "@/components/lab/labs-filter"

export const metadata: Metadata = {
  title: "Labs",
  description: "Hands-on AI labs — build real-world projects.",
}

export default async function LabsPage({
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
  const [labs, filters, labProgress] = await Promise.all([
    searchLabs({
      query: params.q,
      category: params.category,
      difficulty: params.difficulty as "beginner" | "intermediate" | "advanced" | undefined,
      technology: params.technology,
    }),
    getLabFilters(),
    getAllLabProgress(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Labs</h1>
        <p className="mt-1 text-muted-foreground">
          Build real-world AI projects with guided labs
        </p>
      </div>

      <LabsFilter
        categories={filters.categories}
        technologies={filters.technologies}
      />

      {labs.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No labs found"
          description="Try adjusting your filters or search query."
          action={{ label: "Clear Filters", href: "/labs" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => {
            const progress = labProgress.find((p) => p.labId === lab.id)
            return (
              <LabCard
                key={lab.id}
                lab={lab}
                progress={progress?.progress}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
