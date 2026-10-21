import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getModelLab } from "@/lib/data/model-lab"
import { countWord, formatTestedRange } from "@/lib/model-lab-format"
import { ModelLabPage } from "@/components/lab/model-lab/lab-page"
import { requireContentAccessOrRedirect } from "@/lib/content-access"

/** Per-request evaluation of the content gate — see the note in ../page.tsx. */
export const dynamic = "force-dynamic"
export const revalidate = 0

type PageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Metadata for a Model Lab page: its headline, and what was tested when.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const lab = getModelLab(slug)
  if (!lab) return { title: "Lab not found" }
  return {
    title: lab.headline,
    description: `${lab.count} AI set-ups did the same ${countWord(lab.tasks.length)} real ${lab.sp_name.toLowerCase()} tasks, marked by computer checks and AI judges. Read four answers with the names hidden and choose yours. Tested ${formatTestedRange(lab.tested_from, lab.tested_to)}.`,
  }
}

/**
 * One of the six Model Lab pages (research, content, thinking, building,
 * data, automation). Labs are the free marketing taster once the site is
 * public (gwth-launch-bbg), which is why this lives in the (public) group.
 *
 * Any other slug is a 404: the four Model Arena labs redirect to the lab that
 * replaced each (next.config.ts), and the 23 tiered practise labs retired in
 * July are no longer served here.
 *
 * The gate is the FIRST await, before `params` is even unwrapped, so no lab
 * body reaches the RSC payload while private mode is on. `generateMetadata`
 * above is intentionally left ungated: it emits only a title and a
 * description, and gating it would swallow the 404 for unknown slugs.
 */
export default async function LabDetailPage({ params }: PageProps) {
  await requireContentAccessOrRedirect()

  const { slug } = await params
  const lab = getModelLab(slug)
  if (!lab) notFound()

  return <ModelLabPage lab={lab} />
}
