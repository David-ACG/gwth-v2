import type { Metadata } from "next"
import { searchLabs, getLabFilters } from "@/lib/data/labs"
import { LabsFde } from "@/components/marketing/labs-fde/labs-fde"

export const metadata: Metadata = {
  title: "Free Labs",
  description:
    "Hands-on AI labs you can try for free. Build real projects, learn practical skills, no account required to browse.",
}

/**
 * Public labs listing page in the FDE journal register.
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
    <LabsFde
      labs={labs}
      categories={filters.categories}
      technologies={filters.technologies}
    />
  )
}
