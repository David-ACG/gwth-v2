import { requireAdminOrRedirect } from "@/lib/admin"
import { getFunnel, STALL_THRESHOLD_DAYS } from "@/lib/data/admin"
import {
  AdminEmptyState,
  DashProgress,
  safe,
  StallLabel,
} from "../admin-shared"
import styles from "../admin-fde.module.css"

/**
 * /admin/funnel — Panel 2: the per-student Month-1 funnel from W7's
 * lesson_progress table. One row per granted tester: the dash-progress strip
 * across the required M1 lessons, the stall point (last completed lesson +
 * days idle), and the stalled/on-track status. Most idle first, so the
 * testers who most need a nudge sit at the top.
 */
export default async function AdminFunnelPage() {
  // Pages render in parallel with the layout: gate BEFORE any data read.
  await requireAdminOrRedirect()

  const funnel = await safe(() => getFunnel())

  const entries = (funnel ?? []).sort((a, b) => {
    if (a.isStalled !== b.isStalled) return a.isStalled ? -1 : 1
    return (
      (b.daysIdle ?? Number.MAX_SAFE_INTEGER) -
      (a.daysIdle ?? Number.MAX_SAFE_INTEGER)
    )
  })

  return (
    <section className={styles.section} data-section="funnel">
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>Month 1 funnel.</h1>
        <p className={styles.mono}>
          {funnel
            ? `${entries.length} granted · stalled ≥ ${STALL_THRESHOLD_DAYS}d`
            : "Database unavailable"}
        </p>
      </div>
      <p className={styles.sectionLead}>
        Where each granted tester is in the required Month 1 lessons, and where
        they stopped. Lab completion has no persistence backend yet, so the
        funnel counts lessons.
      </p>

      {funnel === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="The funnel cannot be read right now"
          body="The funnel reads lesson progress from Postgres. It returns as soon as the database is reachable."
        />
      ) : entries.length === 0 ? (
        <AdminEmptyState
          kicker="No granted testers yet"
          title="The funnel starts with the first grant"
          body="Once a tester is granted access and signs in, their Month 1 progress and stall point appear here."
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Tester</th>
                <th scope="col">Status</th>
                <th scope="col">Progress</th>
                <th scope="col">Last completed</th>
                <th scope="col">Idle</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.userId}>
                  <td>
                    <span className={styles.cellName}>{entry.name}</span>
                    <span className={styles.cellEmail}>{entry.email}</span>
                  </td>
                  <td>
                    <StallLabel stalled={entry.isStalled} />
                  </td>
                  <td>
                    <DashProgress
                      dashes={entry.lessonDashes}
                      completed={entry.completed}
                      total={entry.total}
                    />
                  </td>
                  <td className={styles.cellTitle}>
                    {entry.lastCompletedLesson ? (
                      <>
                        {entry.lastCompletedLesson}
                        <span className={styles.cellEmail}>
                          {entry.lastCompletedLessonId}
                        </span>
                      </>
                    ) : (
                      "Not started"
                    )}
                  </td>
                  <td className={styles.cellMuted}>
                    {entry.daysIdle === null ? "never active" : `${entry.daysIdle}d`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
