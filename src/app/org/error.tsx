"use client"

import styles from "../admin/admin-fde.module.css"

/**
 * Error boundary for the /org route group. Keeps the FDE register (paper
 * card, mono kicker) and offers a retry — an institution admin must never be
 * stranded on a bare stack trace in the middle of curating their syllabus.
 */
export default function OrgError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={styles.center}>
      <div className={styles.empty} role="alert">
        <p className={styles.mono}>
          Error{error.digest ? ` · ${error.digest}` : ""}
        </p>
        <p className={styles.emptyTitle}>This screen failed to render</p>
        <p className={styles.emptyBody}>
          Nothing has been changed. Try again; if it keeps failing, send the
          digest above to GWTH support.
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
