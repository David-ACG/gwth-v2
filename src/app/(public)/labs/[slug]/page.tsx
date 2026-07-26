import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getArenaLab } from "@/lib/data/model-arena"
import { getLab } from "@/lib/data/labs"
import { ArenaLabDetail } from "@/components/lab/arena/arena-lab-detail"
import { ArchiveLabDetail } from "@/components/lab/arena/archive-lab-detail"
import { requireContentAccessOrRedirect } from "@/lib/content-access"

/** Per-request evaluation of the content gate — see the note in ../page.tsx. */
export const dynamic = "force-dynamic"
export const revalidate = 0

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
      description: `${arena.matchup[0].name} vs ${arena.matchup[1].name} on one real task, tested ${arena.testedOn}. Outputs side by side, a rubric, and a dated verdict.`,
    }
  }

  const legacy = await getLab(slug)
  if (legacy) {
    return { title: `${legacy.title} (archived)`, description: legacy.description }
  }

  return { title: "Lab not found" }
}

/**
 * Lab detail page. Labs are the free marketing taster once the site is public
 * (see gwth-launch-bbg), which is why this lives in the (public) group under
 * the marketing nav rather than the dashboard shell.
 *
 * It renders two shapes from the same URL: a live or archived Model Arena lab
 * (head-to-head), or a retired tiered-format lab presented read-only as part of
 * the archive. A slug matching neither is a 404.
 *
 * The gate is the FIRST await, before `params` is even unwrapped, so no lab
 * body reaches the RSC payload while private mode is on. `generateMetadata`
 * above is intentionally left ungated: it emits only a title and a
 * description, and gating it would swallow the 404 for unknown slugs.
 */
export default async function LabDetailPage({ params }: PageProps) {
  await requireContentAccessOrRedirect()

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
