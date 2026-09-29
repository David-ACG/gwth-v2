import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdminOrRedirect } from "@/lib/admin"
import { getLessonReport } from "@/lib/data/lesson-report"
import type { ReportFilter } from "@/lib/lessons/lesson-report"
import { AdminEmptyState, formatDate, safe } from "../../admin-shared"
import styles from "../../admin-fde.module.css"

const FILTERS: { value: ReportFilter; label: string }[] = [
  { value: "all", label: "Both formats" },
  { value: "read", label: "Read or listen" },
  { value: "watch", label: "Watch short videos" },
]

function show(v: number | null, suffix = "%"): string {
  return v === null ? "No data" : `${v}${suffix}`
}

/**
 * /admin/lessons/[lessonId]: the per-part report for one lesson in parts
 * (bead gwth-launch-hqyp). Reached, right first time, time against expected,
 * played the audio or video, confused taps, where people stopped, and the
 * stall flag, for both formats or one. Then the rating split and every note.
 */
export default async function AdminLessonReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>
  searchParams: Promise<{ format?: string }>
}) {
  await requireAdminOrRedirect()
  const { lessonId } = await params
  const { format } = await searchParams
  if (!/^m\d+_l\d{2}$/.test(lessonId)) notFound()
  const filter: ReportFilter = format === "read" || format === "watch" ? format : "all"
  const data = await safe(() => getLessonReport(lessonId, filter))
  if (data === null) {
    return (
      <section className={styles.section}>
        <AdminEmptyState kicker="Not available" title="This lesson has no parts report" body="Either the database is unreachable or this lesson has not been imported in parts." />
      </section>
    )
  }
  const r = data.report

  return (
    <section className={styles.section} data-section="lesson-report" data-lesson={lessonId}>
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>{data.title}</h1>
      </div>
      <p className={styles.sectionLead}>
        <Link href="/admin/lessons">All lessons in parts</Link>. {r.learners} {r.learners === 1 ? "learner" : "learners"} opened
        this lesson, {r.started} started part 1, {r.completed} finished it
        {r.completedPct !== null ? ` (${r.completedPct}% of starters)` : ""}.
        {r.smallSample ? " Small numbers: treat the flags as early signals." : ""}
      </p>

      <nav className={styles.filterRow} aria-label="Format">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? `/admin/lessons/${lessonId}` : `/admin/lessons/${lessonId}?format=${f.value}`}
            className={styles.sortLink}
            data-active={filter === f.value ? "true" : undefined}
            aria-current={filter === f.value ? "page" : undefined}
          >
            {filter === f.value ? `✓ ${f.label}` : f.label}
          </Link>
        ))}
      </nav>

      <div className={styles.tableWrap}>
        <table className={styles.table} data-testid="part-report">
          <thead>
            <tr>
              <th scope="col">Part</th>
              <th scope="col">Reached</th>
              <th scope="col">Right first time</th>
              <th scope="col">Time (median vs expected)</th>
              <th scope="col">Played audio or video</th>
              <th scope="col">Confused</th>
              {filter === "all" ? <th scope="col">Stopped here</th> : null}
            </tr>
          </thead>
          <tbody>
            {r.parts.map((p) => (
              <tr key={p.index} data-stall={p.stall ? "true" : undefined}>
                <td>
                  <span className={styles.cellName}>
                    {p.index + 1}. {p.title}
                  </span>
                  {p.stall ? (
                    <span className={`${styles.status} ${styles.stStalled}`} style={{ display: "block", marginTop: 4, whiteSpace: "normal" }}>
                      ⚑ Stall: {p.stallReasons.join("; ")}
                    </span>
                  ) : (
                    <span className={`${styles.status} ${styles.stActive}`} style={{ display: "block", marginTop: 4 }}>
                      ✓ No stall flag
                    </span>
                  )}
                </td>
                <td>
                  {p.reached} {p.reachedPct !== null ? `(${p.reachedPct}%)` : ""}
                </td>
                <td>
                  {show(p.rightFirstTimePct)} <span className={styles.cellEmail}>{p.answeredFirst} answered</span>
                </td>
                <td>
                  {p.medianMinutes === null ? "No data" : `${p.medianMinutes} min`} vs {p.expectedMinutes} min
                  <span className={styles.cellEmail}>{p.timeSamples} timed</span>
                </td>
                <td>{show(p.playedPct)}</td>
                <td>
                  {p.confused} {p.confusedPct !== null ? `(${p.confusedPct}%)` : ""}
                </td>
                {filter === "all" ? <td>{p.stoppedHere}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.metricsRow} style={{ marginTop: 28 }}>
        {(["bad", "fine", "good"] as const).map((k) => (
          <div key={k} className={styles.metricCard}>
            <p className={styles.metricValue}>{r.ratings[k]}</p>
            <p className={styles.metricCaption}>Rated it {k === "bad" ? "Bad" : k === "fine" ? "Fine" : "Good"}</p>
          </div>
        ))}
        <div className={styles.metricCard}>
          <p className={styles.metricValue}>{r.formatSwitches}</p>
          <p className={styles.metricCaption}>Format switches in this lesson</p>
        </div>
      </div>

      <div className={styles.panel} style={{ marginTop: 28 }}>
        <h2 className={styles.panelTitle}>What learners told us</h2>
        {r.ratingNotes.length === 0 && r.confusedNotes.length === 0 ? (
          <p className={styles.panelLead}>No notes yet.</p>
        ) : (
          <ul className={styles.inboxList}>
            {r.confusedNotes.map((n, i) => (
              <li key={`c${i}`} className={styles.inboxItem}>
                <p className={styles.inboxMeta}>
                  Confused by part {n.partIndex + 1}, {formatDate(new Date(n.at).toISOString())}
                </p>
                <p className={styles.inboxMessage}>{n.note}</p>
              </li>
            ))}
            {r.ratingNotes.map((n, i) => (
              <li key={`r${i}`} className={styles.inboxItem}>
                <p className={styles.inboxMeta}>
                  Rating note{n.value ? ` (${n.value})` : ""}, {formatDate(new Date(n.at).toISOString())}
                </p>
                <p className={styles.inboxMessage}>{n.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
