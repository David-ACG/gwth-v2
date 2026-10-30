/**
 * Deleting capstone hand-in files (bead gwth-launch-9289.11, decision 7b).
 *
 * What a learner hands in is kept only as long as it is needed:
 *   - {@link deleteExpiredHandInFiles}: the daily job. A hand-in's stored files
 *     and its optional recording are deleted 12 months after its mark became
 *     final. A prepared draft the learner never handed in is deleted 30 days
 *     after it was prepared.
 *   - {@link deleteLearnerHandInFiles}: the learner asked for earlier deletion
 *     (called from admin). Deletes every stored file of theirs at once.
 *
 * The attempt row stays, so the mark and the feedback stay. Everything that
 * came from the learner's work is cleared from it: the files manifest, the
 * checklist of matched file names, the four answers and the recording key;
 * files_deleted_at and files_deleted_reason (migration 030) say when and why.
 * A hand-in whose files are deleted is never sent to a marker again
 * (getHandInForMarking refuses it).
 *
 * Order matters: the store is emptied first and the row updated after, so a
 * failure part-way leaves the row still pointing at its prefix and the next
 * run deletes again (deletePrefix is idempotent).
 */
import "server-only"

import { and, eq, inArray, isNull, sql } from "drizzle-orm"
import { getDb } from "@/db"
import { capstoneAttempts, capstoneSubmissions } from "@/db/schema"
import type { CapstoneId } from "@/lib/capstones/guides"
import { handInStore, HAND_IN_PREFIX, type HandInStore } from "@/lib/capstones/storage"
import { HandInsClosedError } from "@/lib/data/capstone-hand-ins"

/** Files are kept this many calendar months after the mark is final. */
export const HAND_IN_FILE_RETENTION_MONTHS = 12

/** A prepared draft that was never handed in is kept this many days. */
export const DRAFT_RETENTION_DAYS = 30

/** Why a hand-in's files were deleted (files_deleted_reason). */
export type FilesDeletedReason = "retention" | "learner_request"

/** What one retention run did, by hand-in id. */
export interface RetentionResult {
  /** Hand-ins whose files were deleted; the row and mark stay. */
  deleted: string[]
  /** Drafts never handed in, removed with their files. */
  draftsRemoved: string[]
  /** Hand-ins that could not be deleted this time (retried next run). */
  failed: string[]
}

/** What a learner's deletion request did. */
export interface LearnerDeletionResult extends RetentionResult {
  /**
   * Hand-ins whose mark is not final yet, left alone because
   * `evenIfNotFinal` was not set. Deleting them stops their marking.
   */
  keptNotFinal: string[]
}

function storeOrThrow(store?: HandInStore | null): HandInStore {
  const s = store === undefined ? handInStore() : store
  if (!s) throw new HandInsClosedError("No hand-ins store is configured.")
  return s
}

function prefixOf(handInId: string): string {
  return `${HAND_IN_PREFIX}${handInId}/`
}

/** Empties a confirmed hand-in's store prefix, then clears its row. */
async function deleteConfirmedFiles(
  handInId: string,
  reason: FilesDeletedReason,
  now: Date,
  store: HandInStore,
): Promise<void> {
  await store.deletePrefix(prefixOf(handInId))
  await getDb()
    .update(capstoneAttempts)
    .set({
      files: [],
      checklist: [],
      answers: {},
      recordingKey: null,
      filesDeletedAt: now.toISOString(),
      filesDeletedReason: reason,
      updatedAt: sql`NOW()`,
    })
    .where(and(eq(capstoneAttempts.handInId, handInId), isNull(capstoneAttempts.filesDeletedAt)))
}

/** Empties a draft's store prefix, then removes the draft row. */
async function removeDraft(handInId: string, store: HandInStore): Promise<void> {
  await store.deletePrefix(prefixOf(handInId))
  await getDb()
    .delete(capstoneAttempts)
    .where(and(eq(capstoneAttempts.handInId, handInId), eq(capstoneAttempts.status, "draft")))
}

/**
 * The daily retention job. Deletes the files of every hand-in whose mark has
 * been final for 12 calendar months, and every draft older than 30 days.
 * At most `limit` of each per run; the next run picks up the rest.
 */
export async function deleteExpiredHandInFiles(
  now: Date = new Date(),
  store?: HandInStore | null,
  limit = 500,
): Promise<RetentionResult> {
  const files = storeOrThrow(store)
  const at = now.toISOString()
  const result: RetentionResult = { deleted: [], draftsRemoved: [], failed: [] }

  const expired = await getDb()
    .select({ handInId: capstoneAttempts.handInId })
    .from(capstoneAttempts)
    .where(
      and(
        eq(capstoneAttempts.status, "final"),
        isNull(capstoneAttempts.filesDeletedAt),
        sql`${capstoneAttempts.finalisedAt} <= ${at}::timestamptz - make_interval(months => ${HAND_IN_FILE_RETENTION_MONTHS}::int)`,
      ),
    )
    .limit(limit)
  for (const { handInId } of expired) {
    try {
      await deleteConfirmedFiles(handInId, "retention", now, files)
      result.deleted.push(handInId)
    } catch (error) {
      console.error(`[hand-in retention] could not delete ${handInId}`, error)
      result.failed.push(handInId)
    }
  }

  const staleDrafts = await getDb()
    .select({ handInId: capstoneAttempts.handInId })
    .from(capstoneAttempts)
    .where(
      and(
        eq(capstoneAttempts.status, "draft"),
        sql`${capstoneAttempts.createdAt} <= ${at}::timestamptz - make_interval(days => ${DRAFT_RETENTION_DAYS}::int)`,
      ),
    )
    .limit(limit)
  for (const { handInId } of staleDrafts) {
    try {
      await removeDraft(handInId, files)
      result.draftsRemoved.push(handInId)
    } catch (error) {
      console.error(`[hand-in retention] could not remove draft ${handInId}`, error)
      result.failed.push(handInId)
    }
  }

  return result
}

/** Options for {@link deleteLearnerHandInFiles}. */
export interface LearnerDeletionOptions {
  /** Only this capstone; every capstone when left out. */
  capstoneId?: CapstoneId
  /**
   * Also delete hand-ins whose mark is not final yet. Their marking then
   * stops where it is: the judges and David can no longer read the files.
   * Off by default, so admin sees what would stop and confirms first.
   */
  evenIfNotFinal?: boolean
}

/**
 * A learner asked for their hand-in files to be deleted early. Deletes the
 * files of every hand-in of theirs whose mark is final (and, with
 * `evenIfNotFinal`, the rest), and removes any draft. Marks and feedback stay.
 * `userId` is the Better Auth user id the admin caller has already resolved.
 */
export async function deleteLearnerHandInFiles(
  userId: string,
  options: LearnerDeletionOptions = {},
  store?: HandInStore | null,
  now: Date = new Date(),
): Promise<LearnerDeletionResult> {
  const files = storeOrThrow(store)
  const scope = [eq(capstoneSubmissions.userId, userId)]
  if (options.capstoneId) scope.push(eq(capstoneSubmissions.capstoneId, options.capstoneId))
  const submissionIds = (
    await getDb().select({ id: capstoneSubmissions.id }).from(capstoneSubmissions).where(and(...scope))
  ).map((s) => s.id)
  const result: LearnerDeletionResult = { deleted: [], draftsRemoved: [], failed: [], keptNotFinal: [] }
  if (submissionIds.length === 0) return result

  const rows = await getDb()
    .select({ handInId: capstoneAttempts.handInId, status: capstoneAttempts.status })
    .from(capstoneAttempts)
    .where(and(inArray(capstoneAttempts.submissionId, submissionIds), isNull(capstoneAttempts.filesDeletedAt)))
  for (const row of rows) {
    try {
      if (row.status === "draft") {
        await removeDraft(row.handInId, files)
        result.draftsRemoved.push(row.handInId)
      } else if (row.status === "final" || options.evenIfNotFinal) {
        await deleteConfirmedFiles(row.handInId, "learner_request", now, files)
        result.deleted.push(row.handInId)
      } else {
        result.keptNotFinal.push(row.handInId)
      }
    } catch (error) {
      console.error(`[hand-in deletion] could not delete ${row.handInId}`, error)
      result.failed.push(row.handInId)
    }
  }
  return result
}
