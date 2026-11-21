import { ScoreBadge } from "@/components/marketing/score-badge/score-badge"
import { getCurrentUser } from "@/lib/auth"
import { getMyScoreCard, type ScoreCard } from "@/lib/data/score-share"
import { NO_CHANGE_YET, formatBadgeDate, shareView } from "@/lib/score/share"
import { ScoreShareActions } from "./score-share-actions"
import styles from "./learner-score-card.module.css"

/**
 * The signed-in learner's own GWTH.ai score badge, with the share buttons
 * under it (bead gwth-launch-phjb): the same badge David picked on 21 Nov
 * 2026 for the home page, now with the learner's live score. Shown on the
 * dashboard and the progress page while ENABLE_GWTH_SCORE is on (the caller
 * checks the flag).
 */
export async function LearnerScoreCard({
  buttonClassName,
  id = "learner",
}: {
  buttonClassName?: string
  id?: string
}) {
  const user = await getCurrentUser()
  if (!user) return null
  const { card, share } = await getMyScoreCard(user.id, user.name)
  return (
    <div className={styles.wrap} data-testid="learner-score-card">
      <ScoreCardBadge card={card} id={id} />
      <ScoreShareActions initial={share ? shareView(share) : null} buttonClassName={buttonClassName} />
    </div>
  )
}

/** The badge for a live score card: "Up to date" or "Falling", and when it last changed. */
export function ScoreCardBadge({ card, id }: { card: ScoreCard; id: string }) {
  return (
    <ScoreBadge
      id={id}
      name={card.name}
      shown={card.shown}
      earned={card.earned}
      status={card.status}
      dateLabel={formatBadgeDate(new Date())}
      grades={card.grades}
      foot={{
        kind: "changed",
        date: card.lastChangedAt ? formatBadgeDate(card.lastChangedAt) : NO_CHANGE_YET,
      }}
    />
  )
}
