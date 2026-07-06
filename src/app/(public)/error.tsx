"use client"

import styles from "@/components/shared/state-fde.module.css"

/**
 * Error boundary for the public route group. FDE journal register
 * (bible item empty-error-states): paper panel, rust mono kicker, serif line,
 * one retry. See DESIGN_FDE.md §5 "Empty/error states".
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={styles.shell}>
      <div className={styles.page}>
        <div className={styles.panel} role="alert">
          <p className={`${styles.kicker} ${styles.kickerFault}`}>
            Something went wrong
          </p>
          <h1 className={styles.title}>We couldn&apos;t load this page</h1>
          <p className={styles.body}>
            An unexpected error occurred. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className={styles.digest}>{error.message}</pre>
          )}
          <div className={styles.action}>
            <button type="button" className={styles.button} onClick={reset}>
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
