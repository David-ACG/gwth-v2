import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPublicScoreCard } from "@/lib/data/score-share"
import { ENABLE_GWTH_SCORE } from "@/lib/config"
import { scorePageUrl } from "@/lib/score/share"
import { VerifyFdeDisabled } from "@/components/marketing/verify-fde/verify-fde"
import { ScorePage, SCORE_PAGE_COPY } from "@/components/score/score-page"

type PageProps = {
  params: Promise<{ code: string }>
}

/**
 * A learner's public score page, gwth.ai/verify/<code> (bead
 * gwth-launch-phjb): the link LinkedIn's Show credential opens. The score is
 * read live on every request. A code that is unknown, or that its learner has
 * not made public, is a 404, so a private code reveals nothing. The share
 * picture beside this file (opengraph-image.tsx) is the page's og:image.
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const robots = { index: false, follow: false }
  if (!ENABLE_GWTH_SCORE) return { title: "GWTH.ai score", robots }

  const { code } = await params
  const card = await getPublicScoreCard(code)
  if (!card) return { title: "Score not found", robots }

  const title = SCORE_PAGE_COPY.heading(card.name)
  const description = SCORE_PAGE_COPY.description(card.name)
  return {
    title,
    description,
    robots,
    alternates: { canonical: scorePageUrl(card.code) },
    openGraph: { title, description, url: scorePageUrl(card.code), type: "profile", siteName: "GWTH.ai" },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function VerifyScorePage({ params }: PageProps) {
  if (!ENABLE_GWTH_SCORE) return <VerifyFdeDisabled />

  const { code } = await params
  const card = await getPublicScoreCard(code)
  if (!card) notFound()

  return <ScorePage card={card} />
}
