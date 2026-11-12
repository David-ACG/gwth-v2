import Link from "next/link"
import styles from "./course-hold-notice.module.css"

type HoldReason = "release" | "progress" | "review" | null | undefined
type NextGate = { month: 2 | 3; done: number; need: number; total: number; percent: number } | null | undefined

/** The words, in one place for the copy pass. */
export const HOLD_COPY = {
  title: (month: 2 | 3) => `Month ${month} isn't ready yet`,
  prepaid: (month: 2 | 3) =>
    `Your time is paused until Month ${month} opens, so you won't lose any of your course. You can keep using Month ${month - 1} while you wait.`,
  payer: (month: 2 | 3) =>
    `We won't charge you for Month ${month} until it opens. You can keep using Month ${month - 1} while you wait.`,
  // The 75% completion gate (bead gwth-launch-735c, David 12 Nov 2026).
  progressTitle: (g: { month: 2 | 3; need: number }) =>
    `Month ${g.month} opens when you've finished ${g.need} core lessons from Month ${g.month - 1}`,
  progressBody: (g: { month: 2 | 3; done: number; total: number }) =>
    `You've finished ${g.done} of ${g.total} so far.`,
  progressPrepaid: () => `Your paid course time is paused until then, so you won't lose any while you wait.`,
  progressPayer: (month: 2 | 3) => `We won't charge you for Month ${month} until it opens.`,
  progressAhead: (g: { month: 2 | 3; done: number; need: number; total: number; percent: number }) =>
    `Month ${g.month} opens once you've finished ${g.percent}% of the core lessons in Month ${g.month - 1}: ${g.need} of ${g.total} lessons. You've finished ${g.done} so far.`,
  // David's review hold. Wording checked by the latest Sol, 12 Nov 2026.
  reviewTitle: (month: 2 | 3) => `Month ${month} opens after a quick check`,
  reviewBody: (month: 2 | 3) =>
    `Someone from our team will take a quick look at your account before Month ${month} opens. This is usually done within a day. You can keep using Month ${month - 1} while you wait.`,
  contact: "Questions? Contact us",
}

/**
 * Hold the clock (decision 5): shown on the dashboard and the course page
 * while the month a learner is waiting for is not open for them. Since bead
 * gwth-launch-735c it also says why: the month is not ready for anyone, the
 * learner has not finished enough of the month they are on, or a review.
 * With `showAhead`, the course page also tells a learner the gate before it
 * holds them, so the rule is never a surprise.
 */
export function CourseHoldNotice({
  onHoldFor,
  accessSource,
  reason,
  nextGate,
  showAhead = false,
}: {
  onHoldFor: 2 | 3 | null | undefined
  accessSource?: string
  reason?: HoldReason
  nextGate?: NextGate
  showAhead?: boolean
}) {
  const payer = accessSource === "stripe_course"
  if (!onHoldFor) {
    if (!showAhead || !nextGate) return null
    return (
      <div className={styles.notice} role="status" data-testid="course-gate-notice">
        <p className={styles.body}>{HOLD_COPY.progressAhead(nextGate)}</p>
      </div>
    )
  }
  if (reason === "review") {
    return (
      <div className={styles.notice} role="status" data-testid="course-hold-notice" data-reason="review">
        <p className={styles.title}>{HOLD_COPY.reviewTitle(onHoldFor)}</p>
        <p className={styles.body}>
          {HOLD_COPY.reviewBody(onHoldFor)}{" "}
          {payer ? HOLD_COPY.progressPayer(onHoldFor) : HOLD_COPY.progressPrepaid()}{" "}
          <Link href="/contact">{HOLD_COPY.contact}</Link>.
        </p>
      </div>
    )
  }
  if (reason === "progress" && nextGate && nextGate.month === onHoldFor) {
    return (
      <div className={styles.notice} role="status" data-testid="course-hold-notice" data-reason="progress">
        <p className={styles.title}>{HOLD_COPY.progressTitle(nextGate)}</p>
        <p className={styles.body}>
          {HOLD_COPY.progressBody(nextGate)}{" "}
          {payer ? HOLD_COPY.progressPayer(onHoldFor) : HOLD_COPY.progressPrepaid()}
        </p>
      </div>
    )
  }
  return (
    <div className={styles.notice} role="status" data-testid="course-hold-notice">
      <p className={styles.title}>{HOLD_COPY.title(onHoldFor)}</p>
      <p className={styles.body}>{payer ? HOLD_COPY.payer(onHoldFor) : HOLD_COPY.prepaid(onHoldFor)}</p>
    </div>
  )
}
