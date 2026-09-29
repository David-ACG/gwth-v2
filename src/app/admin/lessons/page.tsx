import Link from "next/link"
import { requireAdminOrRedirect } from "@/lib/admin"
import { getLessonReportSummaries } from "@/lib/data/lesson-report"
import { AdminEmptyState, safe } from "../admin-shared"
import styles from "../admin-fde.module.css"

/**
 * /admin/lessons: every lesson shown in parts, with how far learners get and
 * how they rated it. Each row opens the per-part report (bead gwth-launch-hqyp).
 */
export default async function AdminLessonsPage() {
  await requireAdminOrRedirect()
  const rows = await safe(() => getLessonReportSummaries())

  return (
    <section className={styles.section} data-section="lessons">
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>Lessons in parts.</h1>
      </div>
      <p className={styles.sectionLead}>
        How far learners get through each lesson, how often they answer the check questions right first time, and how
        they rated it. Recorded in our own database; open a lesson for the part by part report.
      </p>
      {rows === null ? (
        <AdminEmptyState kicker="Database unavailable" title="The report cannot be read right now" body="It returns as soon as the database is reachable." />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          kicker="No lessons in parts yet"
          title="Lessons appear here once their parts are imported"
          body="Import a lesson with scripts/import-lesson-parts.ts and it shows up here with its numbers."
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Lesson</th>
                <th scope="col">Started</th>
                <th scope="col">Finished</th>
                <th scope="col">Stall flags</th>
                <th scope="col">Rating (bad, fine, good)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const flags = r.report.parts.filter((p) => p.stall).map((p) => `Part ${p.index + 1}`)
                return (
                  <tr key={r.lessonId}>
                    <td>
                      <Link className={styles.cellName} href={`/admin/lessons/${r.lessonId}`}>
                        {r.title}
                      </Link>
                      <span className={styles.cellEmail}>
                        {r.lessonId}, {r.parts} parts
                      </span>
                    </td>
                    <td>{r.report.started}</td>
                    <td>
                      {r.report.completed}
                      {r.report.completedPct !== null ? ` (${r.report.completedPct}%)` : ""}
                    </td>
                    <td className={styles.cellMuted}>{flags.length ? `⚑ ${flags.join(", ")}` : "None"}</td>
                    <td className={styles.cellMuted}>
                      {r.report.ratings.total ? `${r.report.ratings.bad}, ${r.report.ratings.fine}, ${r.report.ratings.good}` : "No ratings yet"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
