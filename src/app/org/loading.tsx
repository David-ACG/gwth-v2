import styles from "../admin/admin-fde.module.css"

/**
 * Loading state for /org pages — hairline paper placeholders in the shared
 * FDE staff register (no spinners; the register is nearly static).
 */
export default function OrgLoading() {
  return (
    <section aria-busy="true" aria-label="Loading organisation panel">
      <div className={styles.sectionHead}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonKicker} />
      </div>
      <div className={styles.metricsRow}>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={`${styles.metricCard} ${styles.skeletonCard}`}
          />
        ))}
      </div>
    </section>
  )
}
