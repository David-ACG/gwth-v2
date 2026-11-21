import { ENABLE_GWTH_SCORE } from "@/lib/config"
import { getPublicScoreCard } from "@/lib/data/score-share"
import { OG_SIZE, scoreBadgeImage } from "@/lib/score/og-badge"
import { NO_CHANGE_YET, formatBadgeDate } from "@/lib/score/share"

/**
 * The share picture for a learner's public score page (bead
 * gwth-launch-phjb): the badge with today's score, drawn when LinkedIn (or
 * anyone) asks for it. A private or unknown code gets the plain GWTH.ai
 * score title, never a name.
 */
export const alt = "GWTH.ai score"
export const size = OG_SIZE
export const contentType = "image/png"
export const dynamic = "force-dynamic"

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const card = ENABLE_GWTH_SCORE ? await getPublicScoreCard(code) : null
  return scoreBadgeImage(
    card
      ? {
          name: card.name,
          shown: card.shown,
          earned: card.earned,
          status: card.status,
          grades: card.grades,
          footKey: "Last changed",
          footValue: card.lastChangedAt ? formatBadgeDate(card.lastChangedAt) : NO_CHANGE_YET,
        }
      : null
  )
}
