/**
 * Tester feedback data layer (W5 — beta "report a problem" channel).
 *
 * All access to the `feedback` table goes through this module (the D1 data-layer
 * abstraction). Per D2 there is NO row-level security; per-user scoping is
 * enforced here in application code:
 *   - testers insert + read ONLY their own rows (keyed on the Better Auth user id)
 *   - the admin inbox (W4) reads ALL rows
 *
 * The row is always written first; the david@gwth.ai notification email is
 * best-effort and its failure must never lose the feedback (the API route
 * inserts, then attempts the email, then flips `emailSent`).
 */

import { desc, eq } from "drizzle-orm"
import { getDb } from "@/db"
import { feedback, user } from "@/db/schema"
import { isAdminEmail } from "@/lib/admin"
import type { FeedbackCategory } from "@/lib/validations"

/** A single persisted feedback row, as returned by the data layer. */
export interface FeedbackRow {
  /** UUID primary key. */
  id: string
  /** Better Auth user id of the tester who submitted. */
  userId: string
  /** In-app path the panel was opened from (e.g. `/course/x/lesson/y`). */
  sourcePath: string
  /** One of bug | content | idea | general. */
  category: string
  /** The tester's message. */
  message: string
  /** Captured browser user-agent, if sent. */
  userAgent: string | null
  /** Whether the david@gwth.ai notification was accepted by Plunk. */
  emailSent: boolean
  /** Creation timestamp (ISO string — the generated column uses mode: "string"). */
  createdAt: string
  /** When the admin marked this read (ISO string) — null means unread (W4). */
  readAt: string | null
}

/** A feedback row joined with the submitting tester, for the admin inbox (W4). */
export interface FeedbackInboxRow extends FeedbackRow {
  /** Tester's display name from the Better Auth user table. */
  userName: string
  /** Tester's email from the Better Auth user table. */
  userEmail: string
}

/** Input for creating a feedback row. */
export interface CreateFeedbackInput {
  userId: string
  sourcePath: string
  category: FeedbackCategory
  message: string
  userAgent?: string | null
}

/**
 * Inserts one feedback row and returns it. Called before the notification email
 * is attempted, so the feedback is durable even when Plunk later errors.
 */
export async function createFeedback(
  input: CreateFeedbackInput
): Promise<FeedbackRow> {
  const db = getDb()
  const [row] = await db
    .insert(feedback)
    .values({
      userId: input.userId,
      sourcePath: input.sourcePath,
      category: input.category,
      message: input.message,
      userAgent: input.userAgent ?? null,
    })
    .returning()
  return row as FeedbackRow
}

/**
 * Marks a feedback row's notification email as sent. Best-effort: callers wrap
 * this so a failure to flip the flag never affects the already-saved row.
 */
export async function markFeedbackEmailSent(id: string): Promise<void> {
  const db = getDb()
  await db.update(feedback).set({ emailSent: true }).where(eq(feedback.id, id))
}

/**
 * Returns a tester's own feedback rows, newest first. This is the only read
 * path a non-admin tester is allowed (scoping enforced by the caller passing
 * the session user id).
 */
export async function getFeedbackForUser(
  userId: string
): Promise<FeedbackRow[]> {
  const db = getDb()
  const rows = await db
    .select()
    .from(feedback)
    .where(eq(feedback.userId, userId))
    .orderBy(desc(feedback.createdAt))
  return rows as FeedbackRow[]
}

/**
 * Returns every feedback row, newest first. Admin-only — the W4 inbox reads
 * this. Callers must gate on {@link isFeedbackAdmin}.
 */
export async function getAllFeedback(): Promise<FeedbackRow[]> {
  const db = getDb()
  const rows = await db
    .select()
    .from(feedback)
    .orderBy(desc(feedback.createdAt))
  return rows as FeedbackRow[]
}

/**
 * Returns every feedback row joined with the tester's name/email, newest
 * first — the W4 admin inbox read. Admin-only; callers gate via the /admin
 * layout or {@link isFeedbackAdmin}.
 */
export async function getFeedbackInbox(): Promise<FeedbackInboxRow[]> {
  const db = getDb()
  const rows = await db
    .select({
      id: feedback.id,
      userId: feedback.userId,
      sourcePath: feedback.sourcePath,
      category: feedback.category,
      message: feedback.message,
      userAgent: feedback.userAgent,
      emailSent: feedback.emailSent,
      createdAt: feedback.createdAt,
      readAt: feedback.readAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(feedback)
    .innerJoin(user, eq(feedback.userId, user.id))
    .orderBy(desc(feedback.createdAt))
  return rows as FeedbackInboxRow[]
}

/**
 * Sets or clears the admin-inbox read marker on one feedback row (W4).
 * `read: true` stamps read_at now; `read: false` clears it back to unread.
 */
export async function setFeedbackRead(id: string, read: boolean): Promise<void> {
  const db = getDb()
  await db
    .update(feedback)
    .set({ readAt: read ? new Date().toISOString() : null })
    .where(eq(feedback.id, id))
}

/**
 * Whether an email address may read the full feedback inbox.
 * Delegates to the W4 env-var allowlist (ADMIN_EMAILS) — no hardcoded emails.
 */
export function isFeedbackAdmin(email: string | null | undefined): boolean {
  return isAdminEmail(email)
}
