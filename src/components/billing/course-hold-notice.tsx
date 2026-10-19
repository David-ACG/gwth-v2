import styles from "./course-hold-notice.module.css"

/** The words, in one place for the copy pass. */
export const HOLD_COPY = {
  title: (month: 2 | 3) => `Month ${month} isn't ready yet`,
  prepaid: (month: 2 | 3) =>
    `Your time is paused until Month ${month} opens, so you won't lose any of your course. You can keep using Month ${month - 1} while you wait.`,
  payer: (month: 2 | 3) =>
    `We won't charge you for Month ${month} until it opens. You can keep using Month ${month - 1} while you wait.`,
}

/**
 * Hold the clock (decision 5): shown on the dashboard and the course page
 * while the month a learner is waiting for is not open yet.
 */
export function CourseHoldNotice({
  onHoldFor,
  accessSource,
}: {
  onHoldFor: 2 | 3 | null | undefined
  accessSource?: string
}) {
  if (!onHoldFor) return null
  const payer = accessSource === "stripe_course"
  return (
    <div className={styles.notice} role="status" data-testid="course-hold-notice">
      <p className={styles.title}>{HOLD_COPY.title(onHoldFor)}</p>
      <p className={styles.body}>{payer ? HOLD_COPY.payer(onHoldFor) : HOLD_COPY.prepaid(onHoldFor)}</p>
    </div>
  )
}
