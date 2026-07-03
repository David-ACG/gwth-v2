import Link from "next/link"
import { requireAdminOrRedirect } from "@/lib/admin"
import { getFeedbackInbox, type FeedbackInboxRow } from "@/lib/data/feedback"
import { FeedbackReadToggle } from "@/components/admin/feedback-read-toggle"
import { AdminEmptyState, safe } from "../admin-shared"
import styles from "../admin-fde.module.css"

/**
 * /admin/feedback — Panel 3: the tester feedback inbox from W5's feedback
 * table. Newest first, each row with the student, the surface it came from
 * (source path), and a read/unread marker. ?filter=unread narrows the list
 * (synced to the URL so the view is shareable).
 */
export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Pages render in parallel with the layout: gate BEFORE any data read.
  await requireAdminOrRedirect()

  const params = await searchParams
  const unreadOnly = params.filter === "unread"

  const inbox = await safe(() => getFeedbackInbox())
  const rows = (inbox ?? []).filter((row) => !unreadOnly || row.readAt === null)
  const unreadCount = (inbox ?? []).filter((row) => row.readAt === null).length

  return (
    <section className={styles.section} data-section="feedback-inbox">
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>Feedback inbox.</h1>
        <p className={styles.mono}>
          {inbox ? `${unreadCount} unread · ${inbox.length} total` : "Database unavailable"}
        </p>
      </div>

      {inbox !== null && inbox.length > 0 ? (
        <div className={styles.filterRow}>
          <Link
            href="/admin/feedback"
            className={styles.navLink}
            data-active={!unreadOnly ? "true" : undefined}
          >
            All
          </Link>
          <Link
            href="/admin/feedback?filter=unread"
            className={styles.navLink}
            data-active={unreadOnly ? "true" : undefined}
          >
            Unread
          </Link>
        </div>
      ) : null}

      {inbox === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="The inbox cannot be read right now"
          body="The inbox reads the feedback table from Postgres. It returns as soon as the database is reachable."
        />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          kicker={unreadOnly ? "Inbox zero" : "No feedback yet"}
          title={
            unreadOnly ? "Everything has been read" : "No tester reports so far"
          }
          body={
            unreadOnly
              ? "New reports land here unread the moment a tester submits the report-a-problem panel."
              : "Testers report from the /guide panel, the dashboard, and every lesson. Reports appear here the moment they are saved."
          }
        />
      ) : (
        <ul className={styles.inboxList} data-section="inbox-list">
          {rows.map((row) => (
            <InboxItem key={row.id} row={row} />
          ))}
        </ul>
      )}
    </section>
  )
}

/** One inbox row: mono meta line, serif message, read/unread action. */
function InboxItem({ row }: { row: FeedbackInboxRow }) {
  const when = new Date(row.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
  const unread = row.readAt === null

  return (
    <li className={styles.inboxItem}>
      <div className={styles.inboxBody}>
        <div className={styles.inboxMeta}>
          <span
            className={`${styles.status} ${unread ? styles.stUnread : styles.stRead}`}
          >
            {unread ? "● unread" : "✓ read"}
          </span>
          <span className={styles.mono}>{row.category}</span>
          <span className={styles.mono}>{row.sourcePath}</span>
          <span className={styles.mono}>{when}</span>
        </div>
        <p className={styles.inboxMessage}>{row.message}</p>
      </div>
      <div className={styles.inboxAside}>
        <span className={styles.cellName}>
          {row.userName}
          <span className={styles.cellEmail}>{row.userEmail}</span>
        </span>
        <FeedbackReadToggle id={row.id} read={!unread} />
      </div>
    </li>
  )
}
