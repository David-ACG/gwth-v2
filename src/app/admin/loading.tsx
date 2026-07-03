import styles from "./admin-fde.module.css"

/**
 * Loading state for /admin pages — hairline paper placeholders in the FDE
 * register (no spinners; the register is nearly static).
 */
export default function AdminLoading() {
  return (
    <section aria-busy="true" aria-label="Loading admin panel">
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
