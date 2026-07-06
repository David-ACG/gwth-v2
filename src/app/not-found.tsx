import Link from "next/link"
import styles from "@/components/shared/state-fde.module.css"

/**
 * Custom 404 page. FDE journal register (bible item empty-error-states):
 * paper panel, ink border, mono kicker, serif line, one way home. No giant
 * ghost "404" numeral. See DESIGN_FDE.md §5 "Empty/error states".
 */
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
        </div>
      </div>
    </div>
  )
}
