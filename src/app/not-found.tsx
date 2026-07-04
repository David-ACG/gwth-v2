import Link from "next/link"

import styles from "@/app/boundary-fde.module.css"

/**
 * Custom 404 page. Shown when a route doesn't match any page. Renders the
 * FDE journal register's paper panel (DESIGN_FDE.md) with an ochre
 * wayfinding glyph and a mono status label.
 */
export default function NotFound() {
  return (
    <main className={`${styles.shell} ${styles.shellFull}`} data-section="not-found">
      <div className={styles.panelColumn}>
        <div className={styles.panel}>
          <p className={`${styles.status} ${styles.statusNotFound}`}>
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <polygon
                strokeLinecap="round"
                strokeLinejoin="round"
                points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
              />
            </svg>
            <span>404 · Not found</span>
          </p>
          <h1 className={styles.title}>Page not found</h1>
          <p className={styles.body}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.buttonSolid}>
              Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
