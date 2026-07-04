import Link from "next/link"

import styles from "@/app/boundary-fde.module.css"

/**
 * Custom 404 page for news articles that don't exist or have been removed.
 * FDE journal register (DESIGN_FDE.md): paper panel, ochre wayfinding
 * glyph, mono status label.
 */
export default function NewsArticleNotFound() {
  return (
    <div className={`${styles.shell} ${styles.shellInset}`} data-section="not-found">
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
          <h1 className={styles.title}>Article not found</h1>
          <p className={styles.body}>
            This article doesn&apos;t exist or has been removed.
          </p>
          <div className={styles.actions}>
            <Link href="/news" className={styles.buttonSolid}>
              Browse News
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
