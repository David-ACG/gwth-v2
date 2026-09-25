import Link from "next/link"
import { requireAdminOrRedirect } from "@/lib/admin"
import { listPageComments } from "@/lib/data/page-comments"
import type { CommentStatus, PageComment } from "@/lib/comments/types"
import { AdminEmptyState, safe } from "../admin-shared"
import styles from "../admin-fde.module.css"

/** The ?status= filters, in the order they read left to right. */
const FILTERS = ["all", "open", "accepted", "fixed", "declined", "asked"] as const
type Filter = (typeof FILTERS)[number]

/** "All" means everything except comments their authors took back. */
const VISIBLE_STATUSES: CommentStatus[] = [
  "open",
  "accepted",
  "fixed",
  "declined",
  "asked",
]

/** Most rows the record shows at once. */
const ROW_LIMIT = 500

/**
 * /admin/comments: the read-only record of comments left on the real student
 * view by David and beta testers (bead gwth-launch-8ksq). Newest first, with
 * who, where, what was selected, what they said, and what triage decided.
 * Triage runs automatically (GWTH-launch-plan/scripts/comment_triage.py), so
 * nothing here needs acting on; ?status= narrows the list.
 */
export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Pages render in parallel with the layout: gate BEFORE any data read.
  await requireAdminOrRedirect()

  const params = await searchParams
  const statusParam = typeof params.status === "string" ? params.status : "all"
  const filter: Filter = (FILTERS as readonly string[]).includes(statusParam)
    ? (statusParam as Filter)
    : "all"

  const comments = await safe(() =>
    listPageComments({
      statuses: filter === "all" ? VISIBLE_STATUSES : [filter],
    })
  )
  const rows = (comments ?? []).slice(0, ROW_LIMIT)

  return (
    <section className={styles.section} data-section="comments-record">
      <div className={styles.sectionHead}>
        <h1 className={styles.sectionTitle}>Comments</h1>
        <p className={styles.mono}>
          {comments
            ? `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`
            : "Database unavailable"}
        </p>
      </div>
      <p className={styles.cellMuted} style={{ marginBottom: "1.25rem" }}>
        Triaged automatically. Nothing here needs you unless the cockpit asks.
      </p>

      <nav className={styles.filterRow} aria-label="Filter by status">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/admin/comments" : `/admin/comments?status=${f}`}
            className={styles.navLink}
            data-active={filter === f ? "true" : undefined}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Link>
        ))}
      </nav>

      {comments === null ? (
        <AdminEmptyState
          kicker="Database unavailable"
          title="The comments cannot be read right now"
          body="This page reads the page_comments table from Postgres. It returns as soon as the database is reachable."
        />
      ) : rows.length === 0 ? (
        <AdminEmptyState
          kicker="No comments"
          title={
            filter === "all"
              ? "Nobody has commented yet"
              : `No comments are ${filter}`
          }
          body="Comments appear here the moment David or a beta tester saves one from the pane on the right of any page."
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Who</th>
                <th scope="col">Page</th>
                <th scope="col">Selected</th>
                <th scope="col">Comment</th>
                <th scope="col">Status</th>
                <th scope="col">Triage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((comment) => (
                <CommentRow key={comment.id} comment={comment} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

/** "25 Sep, 08:40": compact UK date and time for a table cell. */
function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Where the comment was left: the path, plus the lesson page when there is one. */
function pageLabel(comment: PageComment): string | null {
  if (!comment.lessonId) return comment.pageTitle ?? null
  const parts = [comment.lessonId]
  if (comment.lessonPage) parts.push(`page ${comment.lessonPage}`)
  if (comment.lessonVariant === "draft") parts.push("draft")
  const label = parts.join(", ")
  return comment.lessonPageTitle ? `${label}: ${comment.lessonPageTitle}` : label
}

/** What was selected: the quoted words, the picture, or the whole page. */
function selectedLabel(comment: PageComment): string {
  if (comment.targetType === "page") return "Whole page"
  if (comment.targetType === "image") {
    return `Picture: ${comment.imageAlt || comment.quote || comment.imageSrc || "no description"}`
  }
  return comment.quote ? `"${comment.quote}"` : ""
}

function CommentRow({ comment }: { comment: PageComment }) {
  const label = pageLabel(comment)
  return (
    <tr data-status={comment.status}>
      <td className={styles.cellMuted}>{formatWhen(comment.createdAt)}</td>
      <td>
        <span className={styles.cellEmail} style={{ marginTop: 0 }}>
          {comment.authorEmail}
        </span>
        <span className={styles.cellEmail}>
          {comment.authorRole}, {comment.site}
        </span>
      </td>
      <td>
        <span className={styles.cellEmail} style={{ marginTop: 0, overflowWrap: "anywhere" }}>
          {comment.pagePath}
        </span>
        {label ? <span className={styles.cellTitle}>{label}</span> : null}
      </td>
      <td className={styles.cellTitle} style={{ maxWidth: "22rem", overflowWrap: "anywhere" }}>
        {selectedLabel(comment)}
      </td>
      <td style={{ maxWidth: "28rem", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
        {comment.comment}
      </td>
      <td>
        <span
          className="inline-block whitespace-nowrap rounded-[6px] border border-[var(--v-line)] bg-[var(--v-surface)] px-1.5 py-0.5 text-[12px] leading-4 text-[var(--v-ink)]"
          data-section="comment-status"
        >
          {comment.status}
        </span>
      </td>
      <td className={styles.cellTitle} style={{ maxWidth: "20rem", overflowWrap: "anywhere" }}>
        {comment.triage?.reason ?? ""}
      </td>
    </tr>
  )
}
