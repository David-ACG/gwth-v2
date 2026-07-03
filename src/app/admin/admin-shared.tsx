/**
 * Server-side helpers shared by the /admin pages (W4): status labels
 * (colour + glyph + text, never colour alone — DESIGN_FDE.md §7.5), date
 * formatting, the dash-progress strip, empty states, and the safe() data
 * wrapper that turns a DB failure into a graceful fallback instead of a 500.
 */

import type { RosterAccessState } from "@/lib/data/admin"
import styles from "./admin-fde.module.css"

/** Glyph + class per roster state — colour is never the only carrier. */
const STATE_LABELS: Record<
  RosterAccessState,
  { glyph: string; className: string | undefined }
> = {
  granted: { glyph: "✓", className: styles.stGranted },
  waitlist: { glyph: "●", className: styles.stWaitlist },
  revoked: { glyph: "×", className: styles.stRevoked },
  registered: { glyph: "—", className: styles.stRegistered },
}

/** Mono status label for a roster access state (colour + glyph + text). */
export function StateLabel({ state }: { state: RosterAccessState }) {
  const { glyph, className } = STATE_LABELS[state]
  return (
    <span className={`${styles.status} ${className}`}>
      {glyph} {state}
    </span>
  )
}

/** Mono stalled/on-track label for funnel rows (colour + glyph + text). */
export function StallLabel({ stalled }: { stalled: boolean }) {
  return stalled ? (
    <span className={`${styles.status} ${styles.stStalled}`}>● stalled</span>
  ) : (
    <span className={`${styles.status} ${styles.stActive}`}>✓ on track</span>
  )
}

/**
 * The §4.5 dash-progress strip plus the mandatory text twin ("4 of 12").
 * The strip itself is aria-hidden; the text states the same fact.
 */
export function DashProgress({
  dashes,
  completed,
  total,
}: {
  dashes: boolean[]
  completed: number
  total: number
}) {
  return (
    <div>
      <div className={styles.dashes} aria-hidden="true">
        {dashes.map((done, index) => (
          <span key={index} data-active={done ? "true" : undefined} />
        ))}
      </div>
      <p className={styles.dashesLabel}>
        {completed} of {total} lessons
      </p>
    </div>
  )
}

/** "12 Jun 2026" — compact UK date for table cells. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

/** "today" / "3d ago" / "never" — relative activity for table cells. */
export function formatAgo(iso: string | null, now = new Date()): string {
  if (!iso) return "never"
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return "today"
  return `${days}d ago`
}

/** Paper empty-state block used by every panel (beta starts at zero data). */
export function AdminEmptyState({
  kicker,
  title,
  body,
}: {
  kicker: string
  title: string
  body: string
}) {
  return (
    <div className={styles.empty} data-section="empty-state">
      <p className={styles.mono}>{kicker}</p>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyBody}>{body}</p>
    </div>
  )
}

/**
 * Runs one panel's data read, turning any failure (no DATABASE_URL in local
 * mock mode, a transient DB error) into null so the page renders its
 * fallback state instead of crashing — components must never crash the page.
 */
export async function safe<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read()
  } catch (err) {
    console.error("[admin] panel read failed; rendering fallback", err)
    return null
  }
}
