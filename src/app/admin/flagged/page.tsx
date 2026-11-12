import { requireAdminOrRedirect } from "@/lib/admin"
import { listFlags, type FlagRecord } from "@/lib/protection/store"
import { describeSignals } from "@/lib/protection/monitor"
import { FlagActions } from "@/components/admin/flag-actions"
import { AdminEmptyState, safe } from "../admin-shared"
import styles from "../admin-fde.module.css"

export const dynamic = "force-dynamic"

function when(iso: string | null): string {
  if (!iso) return ""
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  })
}

function statusLabel(f: FlagRecord): string {
  if (f.status === "suspended") return "Suspended"
  if (f.status === "cleared") return "Cleared"
  return f.heldMonth ? `Open: Month ${f.heldMonth} held` : "Open"
}

function browser(ua: string | null): string {
  if (!ua) return "unknown browser"
  if (/HeadlessChrome|Playwright|puppeteer/i.test(ua)) return "automated browser"
  if (/curl|wget|python|node-fetch|axios|Go-http/i.test(ua)) return "script"
  if (/Edg\//.test(ua)) return "Edge"
  if (/Chrome\//.test(ua)) return "Chrome"
  if (/Firefox\//.test(ua)) return "Firefox"
  if (/Safari\//.test(ua)) return "Safari"
  return ua.slice(0, 40)
}

/**
 * /admin/flagged (bead gwth-launch-735c): accounts the too-fast monitor
 * flagged. Alert only: the learner sees nothing, except that their next month
 * waits (with their clock held) until David presses Looks fine. Suspending is
 * always his call, never the monitor's.
 */
export default async function AdminFlaggedPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>
}) {
  await requireAdminOrRedirect()
  const showAll = (await searchParams).all === "1"
  const flags = await safe(() => listFlags({ includeResolved: showAll }))

  return (
    <section className={styles.section} data-section="flagged">
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>Flagged accounts.</h1>
        <p className={styles.mono}>
          {flags ? `${flags.length} ${showAll ? "in the last year" : "waiting for you"}` : "Database unavailable"}
          {" · "}
          <a href={showAll ? "/admin/flagged" : "/admin/flagged?all=1"}>{showAll ? "Waiting only" : "Show cleared too"}</a>
        </p>
      </div>
      <p className={styles.sectionLead}>
        Accounts opening new lessons faster than any learner could. Nothing changes for them except that their next
        month waits, with their time and payments paused, until you press Looks fine.
      </p>

      {flags && flags.length === 0 ? (
        <AdminEmptyState
          kicker="Too-fast monitor"
          title="Nobody is flagged."
          body="When an account crosses a line (for example 20 new lessons in 10 minutes) it appears here with its timeline."
        />
      ) : null}

      {(flags ?? []).map((f) => (
        <div key={f.id} id={`flag-${f.id}`} className={styles.panel} data-testid="flag-card" data-status={f.status}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>
              {f.name ? `${f.name} · ` : ""}
              {f.email}
            </h2>
            <span className={styles.mono}>
              {statusLabel(f)} · flagged {when(f.openedAt)}
              {f.alertSentAt ? " · alert sent" : ""}
            </span>
          </div>
          <p className={styles.panelLead}>
            {f.reasons.join("; ")}.
            {f.signals ? (
              <>
                <br />
                {describeSignals(f.signals)}.
              </>
            ) : null}
            {f.reviewedBy ? (
              <>
                <br />
                {f.status === "suspended" ? "Suspended" : "Cleared"} by {f.reviewedBy}
                {f.clearedAt ? ` on ${when(f.clearedAt)}` : ""}.
              </>
            ) : null}
          </p>
          <FlagActions id={f.id} email={f.email} status={f.status} />
          <details style={{ marginTop: "1rem" }}>
            <summary>Timeline ({f.timeline.length} most recent)</summary>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Lesson</th>
                    <th>What</th>
                    <th>Media links</th>
                    <th>From</th>
                  </tr>
                </thead>
                <tbody>
                  {f.timeline.map((e, i) => (
                    <tr key={i}>
                      <td className={styles.cellMuted}>{when(e.at)}</td>
                      <td>{e.lessonId}</td>
                      <td>
                        {e.kind === "locked_lesson" ? "tried a locked lesson" : e.firstView ? "new lesson" : "went back"}
                      </td>
                      <td>{e.mediaLinks}</td>
                      <td className={styles.cellMuted}>
                        {[e.country, e.ip, browser(e.userAgent)].filter(Boolean).join(" · ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      ))}
    </section>
  )
}
