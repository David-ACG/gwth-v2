"use client"

import styles from "@/components/shared/state-fde.module.css"

/**
 * Root error boundary. Catches any rendering errors that slip through
 * route-group-level error boundaries. FDE journal register (bible item
 * empty-error-states): paper panel, ink border, rust mono kicker, serif line,
 * one retry button. See DESIGN_FDE.md §5 "Empty/error states".
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={styles.shell}>
      <div className={`${styles.page} ${styles.pageTall}`}>
        <div className={styles.panel} role="alert">
          <p className={`${styles.kicker} ${styles.kickerFault}`}>
            Something went wrong
          </p>
          <h1 className={styles.title}>This page could not be rendered</h1>
          <p className={styles.body}>
            An unexpected error occurred. Try again, and if the problem
            persists, contact support.
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
