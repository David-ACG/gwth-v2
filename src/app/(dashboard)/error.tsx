"use client"

import styles from "@/app/boundary-fde.module.css"

/**
 * Error boundary for the (dashboard) route group. Renders inside the
 * dashboard shell in the FDE journal register (DESIGN_FDE.md): paper panel
 * on the sage ground, rust status glyph, mono digest, retry button.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={`${styles.shell} ${styles.shellInset}`} data-section="error">
      <div className={styles.panelColumn}>
        <div className={styles.panel} role="alert">
          <p className={`${styles.status} ${styles.statusError}`}>
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <span>Error{error.digest ? ` · ${error.digest}` : ""}</span>
          </p>
          <h1 className={styles.title}>Dashboard Error</h1>
          <p className={styles.body}>
            Something went wrong loading this page. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className={styles.detail}>{error.message}</pre>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.buttonSolid} onClick={reset}>
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
