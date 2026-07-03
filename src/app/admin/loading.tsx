import styles from "./admin-fde.module.css"

/**
 * Loading state for /admin pages — hairline paper placeholders in the FDE
 * register (no spinners; the register is nearly static).
 */
export default function AdminLoading() {
  return (
    <section aria-busy="true" aria-label="Loading admin panel">
      <div className={styles.sectionHead}>
        <div
          style={{
            width: "14rem",
            height: "2rem",
            background: "var(--v-line-soft)",
          }}
        />
        <div
          style={{ width: "6rem", height: "0.8rem", background: "var(--v-line-soft)" }}
        />
      </div>
      <div className={styles.metricsRow}>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={styles.metricCard}
            style={{ minHeight: "7rem" }}
          />
        ))}
      </div>
    </section>
  )
}
