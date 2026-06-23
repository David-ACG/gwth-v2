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
import { feedback } from "@/db/schema"
import type { FeedbackCategory } from "@/lib/validations"

/** Emails allowed to read the full feedback inbox (admin scope, app-level). */
const ADMIN_EMAILS = new Set(["david@gwth.ai", "david@agilecommercegroup.com"])

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

/** Whether an email address may read the full feedback inbox. */
export function isFeedbackAdmin(email: string | null | undefined): boolean {
  return Boolean(email && ADMIN_EMAILS.has(email.toLowerCase()))
}
