import type { Metadata } from "next"
import Link from "next/link"
import styles from "@/components/shared/state-fde.module.css"

/**
 * Custom 404 page. FDE journal register (bible item empty-error-states):
 * paper panel, ink border, mono kicker, serif line, one way home. No giant
 * ghost "404" numeral. See DESIGN_FDE.md §5 "Empty/error states".
 */
// The tab said the general site title, so a visitor with several tabs open
// could not tell this one was an error (launch readiness review, 2026-10-20).
export const metadata: Metadata = { title: "Page not found" }

export default function NotFound() {
  return (
    <div className={styles.shell}>
      <div className={`${styles.page} ${styles.pageTall}`}>
        <div className={styles.panel} role="status">
          <p className={styles.kicker}>Page not found</p>
          <h1 className={styles.title}>We couldn&apos;t find that page</h1>
          <p className={styles.body}>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className={styles.action}>
            <Link href="/" className={styles.button}>
              Back home
            </Link>
          </div>
          <nav aria-label="More of the site" className={styles.moreLinks}>
            <Link href="/lessons">The course</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
