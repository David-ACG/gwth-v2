import Link from "next/link"
import type { ScoreCard } from "@/lib/data/score-share"
import { ScoreCardBadge } from "./learner-score-card"
import styles from "./score-page.module.css"

/**
 * The learner's public score page (bead gwth-launch-phjb): what LinkedIn's
 * Show credential opens. The badge shows the score today, whether it is up
 * to date or falling, and when it last changed; the words under it say what
 * the score is, for an employer who has never heard of GWTH.ai.
 */
export function ScorePage({ card }: { card: ScoreCard }) {
  return (
    <main className={styles.shell} data-section="score-page">
      <div className={styles.inner}>
        <h1 className={styles.title}>{SCORE_PAGE_COPY.heading(card.name)}</h1>
        <ScoreCardBadge card={card} id="public" />
        <div className={styles.body}>
          <p>{SCORE_PAGE_COPY.live(card.name)}</p>
          <p>{SCORE_PAGE_COPY.how}</p>
          <p>{SCORE_PAGE_COPY.fall}</p>
          <p>
            <Link className={styles.link} href="/#score">
              {SCORE_PAGE_COPY.more}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

/**
 * The page's words: written by the latest Astra, checked and fixed by the
 * latest Sol on 21 Nov 2026 (GWTH-launch-plan
 * completion/score-card-real-2026-11-21/copy).
 */
export const SCORE_PAGE_COPY = {
  heading: (name: string) =>
    `${name}'s GWTH.ai score`,
  live: (name: string) =>
    `This page shows ${name}'s current score each time you open it.`,
  how: "GWTH.ai is a three-month course in using AI at work. Lessons and quiz answers make up half the score, and monthly projects make up the other half. The score goes up as the learner passes lessons.",
  fall: "After 4 weeks without passing a lesson, the score starts to fall. It goes straight back up when the learner passes another lesson.",
  more: "How the GWTH.ai score works",
  description: (name: string) =>
    `${name}'s current GWTH.ai score and monthly project grades.`,
} as const
