import Link from "next/link"
import styles from "@/components/shared/state-fde.module.css"

/**
 * 404 for a lab that doesn't exist. FDE recipe (bible item
 * empty-error-states) — see DESIGN_FDE.md §5 "Empty/error states".
 */
export default function LabNotFound() {
  return (
    <div className={styles.shell}>
      <div className={styles.page}>
        <div className={styles.panel} role="status">
          <p className={styles.kicker}>Page not found</p>
          <h1 className={styles.title}>We couldn&apos;t find that lab</h1>
          <p className={styles.body}>
            This lab doesn&apos;t exist or has been removed.
          </p>
          <div className={styles.action}>
            <Link href="/labs" className={styles.button}>
              Browse labs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
