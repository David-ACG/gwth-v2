"use client"

import styles from "./admin-fde.module.css"

/**
 * Error boundary for the /admin route group. Keeps the FDE register (paper
 * card, mono kicker) and offers a retry — an admin panel failure must never
 * strand David on a bare stack trace.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={styles.center}>
      <div className={styles.empty} role="alert">
        <p className={styles.mono}>Error{error.digest ? ` · ${error.digest}` : ""}</p>
        <p className={styles.emptyTitle}>This admin panel failed to render</p>
        <p className={styles.emptyBody}>
          The rest of the dashboard is unaffected. Try again; if it keeps
          failing, check the container logs for the digest above.
        </p>
        <div>
          <button type="button" className={styles.buttonOutline} onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
