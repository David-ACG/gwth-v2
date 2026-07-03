import Link from "next/link"
import { requireAdminOrRedirect } from "@/lib/admin"
import {
  getCohortMetrics,
  getFunnel,
  STALL_THRESHOLD_DAYS,
  type CohortMetrics,
  type FunnelEntry,
} from "@/lib/data/admin"
import { AdminEmptyState, safe, StallLabel } from "./admin-shared"
import styles from "./admin-fde.module.css"

/**
 * /admin — the summary-first overview David chose (2026-06-17): cohort
 * health as four metric cards, then the "needs attention" table of stalled
 * testers with a nudge action. Roster, funnel and feedback live one click
 * deeper; the grant form is the header action.
 */
export default async function AdminOverviewPage() {
  // Pages render in parallel with the layout: gate BEFORE any data read.
  await requireAdminOrRedirect()

  const [metrics, funnel] = await Promise.all([
    safe(() => getCohortMetrics()),
    safe(() => getFunnel()),
  ])

  const needsAttention = (funnel ?? [])
    .filter((entry) => entry.isStalled)
    .sort(
      (a, b) => (b.daysIdle ?? Number.MAX_SAFE_INTEGER) - (a.daysIdle ?? Number.MAX_SAFE_INTEGER)
    )

  return (
    <>
      <section className={styles.section} data-section="cohort-health">
        <div className={styles.sectionHead}>
          <h1 className={styles.sectionTitle}>Cohort health.</h1>
          <p className={styles.mono}>Overview</p>
        </div>
        {metrics ? (
          <MetricCards metrics={metrics} />
        ) : (
          <AdminEmptyState
            kicker="Database unavailable"
            title="Cohort metrics cannot be read right now"
            body="The Postgres connection is not available. Metrics return as soon as the database is reachable; nothing is lost."
          />
        )}
      </section>

      <section className={styles.section} data-section="needs-attention">
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Needs attention.</h2>
          <p className={styles.mono}>
            Stalled ≥ {STALL_THRESHOLD_DAYS}d · {needsAttention.length}
          </p>
        </div>
        {funnel === null ? (
          <AdminEmptyState
            kicker="Database unavailable"
            title="The funnel cannot be read right now"
            body="Stall detection reads lesson progress from Postgres. This panel returns as soon as the database is reachable."
          />
        ) : needsAttention.length === 0 ? (
          <AdminEmptyState
            kicker="All clear"
            title="No one needs a nudge"
            body="Every granted tester has either been active in the last few days or finished Month 1. New testers appear here when they go quiet."
          />
        ) : (
          <NeedsAttentionTable entries={needsAttention} />
        )}
      </section>
    </>
  )
}

/** The four overview cards; each links to the panel that explains it. */
function MetricCards({ metrics }: { metrics: CohortMetrics }) {
  const cards = [
    {
      href: "/admin/funnel",
      label: "Active testers",
      value: metrics.active,
      caption: `of ${metrics.granted} granted`,
      alert: false,
    },
    {
      href: "/admin/funnel",
      label: `Stalled ≥ ${STALL_THRESHOLD_DAYS}d`,
      value: metrics.stalled,
      caption: "need a nudge",
      alert: metrics.stalled > 0,
    },
    {
      href: "/admin/feedback",
      label: "Unread feedback",
      value: metrics.unreadFeedback,
      caption: "in the inbox",
      alert: metrics.unreadFeedback > 0,
    },
    {
      href: "/admin/roster",
      label: "Waitlist",
      value: metrics.waitlist,
      caption: "waiting for access",
      alert: false,
    },
  ]

  return (
    <div className={styles.metricsRow}>
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className={`${styles.metricCard} ${card.alert ? styles.metricAlert : ""}`}
        >
          <span className={styles.mono}>{card.label}</span>
          <span className={styles.metricValue}>{card.value}</span>
          <span className={styles.metricCaption}>{card.caption}</span>
        </Link>
      ))}
    </div>
  )
}

/** Stalled testers, most idle first, with a mailto nudge per row. */
function NeedsAttentionTable({ entries }: { entries: FunnelEntry[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Tester</th>
            <th scope="col">Status</th>
            <th scope="col">Stalled at</th>
            <th scope="col">Progress</th>
            <th scope="col">Idle</th>
            <th scope="col">Action</th>
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
              <td className={styles.cellTitle}>
                {entry.lastCompletedLesson ?? "Not started"}
              </td>
              <td className={styles.cellMuted}>
                {entry.completed} of {entry.total} lessons
              </td>
              <td className={styles.cellMuted}>
                {entry.daysIdle === null ? "never active" : `${entry.daysIdle}d`}
              </td>
              <td>
                <a
                  className={styles.buttonOutline}
                  href={`mailto:${entry.email}?subject=${encodeURIComponent(
                    "How is the GWTH beta going?"
                  )}`}
                >
                  Nudge
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
