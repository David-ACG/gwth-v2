import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getArenaLab } from "@/lib/data/model-arena"
import { getLab } from "@/lib/data/labs"
import { ArenaLabDetail } from "@/components/lab/arena/arena-lab-detail"
import { ArchiveLabDetail } from "@/components/lab/arena/archive-lab-detail"

type PageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Metadata for a lab detail page. Model Arena labs describe the matchup and
 * test date; retired tiered labs fall back to their own description.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  const arena = getArenaLab(slug)
  if (arena) {
    return {
      title: arena.title,
      description: `${arena.matchup[0].name} vs ${arena.matchup[1].name} on one real task, tested ${arena.testedOn}. Outputs side by side, a rubric, and a dated verdict. Free to read.`,
    }
  }

  const legacy = await getLab(slug)
  if (legacy) {
    return { title: `${legacy.title} (archived)`, description: legacy.description }
  }

  return { title: "Lab not found" }
}

/**
 * Public lab detail page. Labs are the free marketing taster, so this route is
 * public (no login redirect, see gwth-launch-bbg) and lives in the (public)
 * group under the marketing nav.
 *
 * It renders two shapes from the same URL: a live or archived Model Arena lab
 * (head-to-head), or a retired tiered-format lab presented read-only as part of
 * the archive. A slug matching neither is a 404.
 */
export default async function LabDetailPage({ params }: PageProps) {
  const { slug } = await params

  const arena = getArenaLab(slug)
  if (arena) {
    return <ArenaLabDetail lab={arena} />
  }

  const legacy = await getLab(slug)
  if (legacy) {
    return <ArchiveLabDetail lab={legacy} />
  }

  notFound()
}
