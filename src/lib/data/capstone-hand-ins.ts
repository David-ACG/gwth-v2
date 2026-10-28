/**
 * Capstone hand-ins in the database (beads gwth-launch-9289.2 and 9289.3).
 *
 * The flow, and what each step guarantees:
 *   1. {@link saveDraft}: the REDACTED files are stored under a new random
 *      hand-in id and a 'draft' row records their manifest and hash. Nothing
 *      is sent anywhere. Preparing again replaces the draft.
 *   2. {@link confirmDraft}: only with the learner's tick AND the hash they
 *      previewed. Locks the learner's submission row, checks the hand-in limit,
 *      and turns the draft into hand-in 1, 2 or 3 with status 'marking'.
 *   3. {@link getHandInForMarking}: the ONLY way a marker (bead 9289.5) reads
 *      a hand-in. It refuses a draft, re-checks every stored file against the
 *      confirmed manifest, and never includes the recording.
 *   4. {@link applyMark}: the judges or David record a mark; the submission's
 *      best mark is recomputed (best of up to 3, a Not yet counts 0).
 *
 * Every function takes the user id the caller already authenticated; nothing
 * here reads a session, and every query is scoped to that user (D2, no RLS).
 */
import "server-only"

import { randomBytes, createHash } from "node:crypto"
import { and, asc, eq, sql } from "drizzle-orm"
import { getDb } from "@/db"
import { capstoneAttempts, capstoneSubmissions } from "@/db/schema"
import type { AnswerId, CapstoneId, DataChoice } from "@/lib/capstones/guides"
import { HandInInputError } from "@/lib/capstones/bundle"
import { manifestHash, toManifest, type ManifestEntry, type PreparedHandIn } from "@/lib/capstones/preview"
import type { LabelUse } from "@/lib/capstones/redact"
import {
  bestAttempt,
  countedPoints,
  handInBlockReason,
  nextAttemptNo,
  type AttemptStatus,
  type Band,
  type ChecklistItem,
} from "@/lib/capstones/rules"
import { fileKey, handInStore, HAND_IN_PREFIX, recordingKey, type HandInStore } from "@/lib/capstones/storage"

type AttemptRow = typeof capstoneAttempts.$inferSelect

/** A hand-in as the learner's page shows it. */
export interface AttemptView {
  id: string
  handInId: string
  attemptNo: number | null
  status: AttemptStatus
  total: number | null
  band: Band | null
  confirmedAt: string | null
  createdAt: string
  sourceKind: "files" | "zip" | "repo"
  dataChoice: DataChoice
  files: ManifestEntry[]
  checklist: ChecklistItem[]
  hasRecording: boolean
}

/** The learner's hand-ins for one capstone. */
export interface HandInState {
  attempts: AttemptView[]
  draft: AttemptView | null
  best: AttemptView | null
  blockReason: string | null
}

/** Everything a marker may read. The recording is deliberately absent. */
export interface HandInForMarking {
  handInId: string
  capstoneId: CapstoneId
  attemptNo: number
  dataChoice: DataChoice
  answers: Record<AnswerId, string>
  files: (ManifestEntry & { bytes: Uint8Array })[]
}

/** Thrown when hand-ins have nowhere to store files. */
export class HandInsClosedError extends Error {}

/** A new random hand-in id: "h_" and 22 URL-safe characters (128 bits). */
export function newHandInId(): string {
  return `h_${randomBytes(16).toString("base64url")}`
}

function toView(row: AttemptRow): AttemptView {
  return {
    id: row.id,
    handInId: row.handInId,
    attemptNo: row.attemptNo,
    status: row.status as AttemptStatus,
    total: row.total,
    band: row.band as Band | null,
    confirmedAt: row.confirmedAt ? new Date(row.confirmedAt).toISOString() : null,
    createdAt: new Date(row.createdAt).toISOString(),
    sourceKind: row.sourceKind as AttemptView["sourceKind"],
    dataChoice: row.dataChoice as DataChoice,
    files: row.files as ManifestEntry[],
    checklist: row.checklist as ChecklistItem[],
    hasRecording: row.recordingKey !== null,
  }
}

function requireStore(store?: HandInStore | null): HandInStore {
  const s = store === undefined ? handInStore() : store
  if (!s) throw new HandInsClosedError("Hand-ins are not open yet.")
  return s
}

async function attemptsFor(userId: string, capstoneId: CapstoneId): Promise<AttemptRow[]> {
  return getDb()
    .select({ attempt: capstoneAttempts })
    .from(capstoneAttempts)
    .innerJoin(capstoneSubmissions, eq(capstoneAttempts.submissionId, capstoneSubmissions.id))
    .where(and(eq(capstoneSubmissions.userId, userId), eq(capstoneSubmissions.capstoneId, capstoneId)))
    .orderBy(asc(capstoneAttempts.createdAt))
    .then((rows) => rows.map((r) => r.attempt))
}

/** The learner's hand-ins for one capstone, newest last. */
export async function getHandInState(userId: string, capstoneId: CapstoneId): Promise<HandInState> {
  const rows = (await attemptsFor(userId, capstoneId)).map(toView)
  const attempts = rows.filter((r) => r.status !== "draft")
  return {
    attempts,
    draft: rows.find((r) => r.status === "draft") ?? null,
    best: bestAttempt(attempts),
    blockReason: handInBlockReason(attempts),
  }
}

/** What {@link saveDraft} stores besides the files. */
export interface DraftInput {
  userId: string
  capstoneId: CapstoneId
  sourceKind: "files" | "zip" | "repo"
  repoUrl: string | null
  dataChoice: DataChoice
  checklist: ChecklistItem[]
  prepared: PreparedHandIn
}

/**
 * Stores a prepared (redacted) hand-in as the learner's draft, replacing any
 * earlier draft. Returns the new draft.
 */
export async function saveDraft(input: DraftInput, store?: HandInStore | null): Promise<AttemptView> {
  const files = requireStore(store)
  const handInId = newHandInId()
  for (const file of input.prepared.files) {
    await files.put(fileKey(handInId, file.path), file.bytes, file.kind === "text" ? "text/plain; charset=utf-8" : "application/octet-stream")
  }
  const redaction = {
    dataChoice: input.dataChoice,
    labels: input.prepared.labels satisfies LabelUse[],
    unusedNameLabels: input.prepared.unusedNameLabels,
  }
  let replaced: string | null = null
  try {
    const row = await getDb().transaction(async (tx) => {
      await tx
        .insert(capstoneSubmissions)
        .values({ userId: input.userId, capstoneId: input.capstoneId })
        .onConflictDoNothing()
      const [submission] = await tx
        .select()
        .from(capstoneSubmissions)
        .where(and(eq(capstoneSubmissions.userId, input.userId), eq(capstoneSubmissions.capstoneId, input.capstoneId)))
        .for("update")
      if (!submission) throw new Error("capstone submission row missing after insert")
      const existing = await tx.select().from(capstoneAttempts).where(eq(capstoneAttempts.submissionId, submission.id))
      const block = handInBlockReason(existing.map(toView).filter((a) => a.status !== "draft"))
      if (block) throw new HandInInputError(block)
      const old = existing.find((a) => a.status === "draft")
      if (old) {
        replaced = old.handInId
        await tx.delete(capstoneAttempts).where(eq(capstoneAttempts.id, old.id))
      }
      const [inserted] = await tx
        .insert(capstoneAttempts)
        .values({
          submissionId: submission.id,
          handInId,
          status: "draft",
          sourceKind: input.sourceKind,
          repoUrl: input.sourceKind === "repo" ? input.repoUrl : null,
          dataChoice: input.dataChoice,
          answers: input.prepared.answers,
          files: toManifest(input.prepared.files),
          checklist: input.checklist,
          redaction,
          previewSha256: input.prepared.hash,
        })
        .returning()
      if (!inserted) throw new Error("draft insert returned no row")
      return inserted
    })
    if (replaced) await files.deletePrefix(`${HAND_IN_PREFIX}${replaced}/`).catch(() => undefined)
    return toView(row)
  } catch (error) {
    await files.deletePrefix(`${HAND_IN_PREFIX}${handInId}/`).catch(() => undefined)
    throw error
  }
}

/** What {@link confirmDraft} needs from the learner. */
export interface ConfirmInput {
  userId: string
  capstoneId: CapstoneId
  handInId: string
  /** The hash of the preview the learner saw. */
  previewHash: string
  /** The "I have checked what will be sent" tick. */
  confirmed: boolean
  recording?: { bytes: Uint8Array; extension: string; contentType: string } | null
}

/**
 * Turns the learner's draft into a hand-in. Refuses without the tick, when
 * the stored draft is not the one they previewed, and past the limit.
 */
export async function confirmDraft(input: ConfirmInput, store?: HandInStore | null): Promise<AttemptView> {
  if (!input.confirmed) {
    throw new HandInInputError("Tick the box to say you have checked what will be sent.")
  }
  const files = requireStore(store)
  const key = input.recording ? recordingKey(input.handInId, input.recording.extension) : null
  const row = await getDb().transaction(async (tx) => {
    const [submission] = await tx
      .select()
      .from(capstoneSubmissions)
      .where(and(eq(capstoneSubmissions.userId, input.userId), eq(capstoneSubmissions.capstoneId, input.capstoneId)))
      .for("update")
    if (!submission) throw new HandInInputError("We could not find your prepared hand-in. Please prepare it again.")
    const existing = await tx.select().from(capstoneAttempts).where(eq(capstoneAttempts.submissionId, submission.id))
    const draft = existing.find((a) => a.status === "draft" && a.handInId === input.handInId)
    if (!draft) throw new HandInInputError("We could not find your prepared hand-in. Please prepare it again.")
    if (draft.previewSha256 !== input.previewHash) {
      throw new HandInInputError("Your hand-in changed after you previewed it. Please check the preview again.")
    }
    const confirmedSoFar = existing.map(toView).filter((a) => a.status !== "draft")
    const block = handInBlockReason(confirmedSoFar)
    if (block) throw new HandInInputError(block)
    const attemptNo = nextAttemptNo(confirmedSoFar)
    if (attemptNo === null) throw new HandInInputError(handInBlockReason([]) ?? "No hand-ins left.")
    if (input.recording && key) await files.put(key, input.recording.bytes, input.recording.contentType)
    const [updated] = await tx
      .update(capstoneAttempts)
      .set({
        status: "marking",
        attemptNo,
        confirmedAt: sql`NOW()`,
        recordingKey: key,
        updatedAt: sql`NOW()`,
      })
      .where(and(eq(capstoneAttempts.id, draft.id), eq(capstoneAttempts.status, "draft")))
      .returning()
    if (!updated) throw new HandInInputError("We could not find your prepared hand-in. Please prepare it again.")
    return updated
  })
  return toView(row)
}

/**
 * One stored file of the learner's own draft or hand-in, for the preview.
 * Returns null unless the hand-in belongs to this learner and lists the path.
 */
export async function readOwnFile(
  userId: string,
  capstoneId: CapstoneId,
  handInId: string,
  path: string,
  store?: HandInStore | null,
): Promise<{ entry: ManifestEntry; bytes: Uint8Array } | null> {
  const rows = await attemptsFor(userId, capstoneId)
  const row = rows.find((r) => r.handInId === handInId)
  const entry = (row?.files as ManifestEntry[] | undefined)?.find((f) => f.path === path)
  if (!row || !entry) return null
  const bytes = await requireStore(store).get(fileKey(handInId, path))
  return bytes ? { entry, bytes } : null
}

/** The redacted answers of the learner's own draft, for the preview. */
export async function readOwnAnswers(userId: string, capstoneId: CapstoneId, handInId: string): Promise<Record<string, string> | null> {
  const row = (await attemptsFor(userId, capstoneId)).find((r) => r.handInId === handInId)
  return row ? (row.answers as Record<string, string>) : null
}

/**
 * Reads a confirmed hand-in for marking. Refuses a draft (nothing goes to a
 * model before the learner ticks), and refuses if any stored file no longer
 * matches what the learner previewed. The recording is never included.
 */
export async function getHandInForMarking(handInId: string, store?: HandInStore | null): Promise<HandInForMarking> {
  const [found] = await getDb()
    .select({ attempt: capstoneAttempts, capstoneId: capstoneSubmissions.capstoneId })
    .from(capstoneAttempts)
    .innerJoin(capstoneSubmissions, eq(capstoneAttempts.submissionId, capstoneSubmissions.id))
    .where(eq(capstoneAttempts.handInId, handInId))
    .limit(1)
  if (!found) throw new Error(`no hand-in ${handInId}`)
  const row = found.attempt
  if (row.status === "draft" || !row.confirmedAt || row.attemptNo === null) {
    throw new Error(`hand-in ${handInId} has not been confirmed by the learner`)
  }
  const manifest = row.files as ManifestEntry[]
  const answers = row.answers as Record<AnswerId, string>
  if (manifestHash(manifest, answers) !== row.previewSha256) {
    throw new Error(`hand-in ${handInId} does not match what the learner previewed`)
  }
  const files = requireStore(store)
  const out: HandInForMarking["files"] = []
  for (const entry of manifest) {
    const bytes = await files.get(fileKey(handInId, entry.path))
    if (!bytes || createHash("sha256").update(bytes).digest("hex") !== entry.sha256) {
      throw new Error(`hand-in ${handInId}: ${entry.path} does not match what the learner previewed`)
    }
    out.push({ ...entry, bytes })
  }
  return {
    handInId,
    capstoneId: found.capstoneId as CapstoneId,
    attemptNo: row.attemptNo,
    dataChoice: row.dataChoice as DataChoice,
    answers,
    files: out,
  }
}

/** A mark from the judges (bead 9289.5) or David (bead 9289.7). */
export interface MarkInput {
  status: Exclude<AttemptStatus, "draft" | "marking">
  total: number | null
  band: Band | null
  criteria?: unknown[]
  basics?: unknown[]
  feedback?: unknown
  flags?: string[]
}

/**
 * Records a mark on a confirmed hand-in and recomputes the learner's best
 * mark for that capstone (best of up to 3; a Not yet counts 0).
 */
export async function applyMark(handInId: string, mark: MarkInput): Promise<void> {
  await getDb().transaction(async (tx) => {
    const [row] = await tx.select().from(capstoneAttempts).where(eq(capstoneAttempts.handInId, handInId)).for("update")
    if (!row || row.status === "draft") throw new Error(`hand-in ${handInId} cannot be marked`)
    await tx
      .update(capstoneAttempts)
      .set({
        status: mark.status,
        total: mark.total,
        band: mark.band,
        criteria: mark.criteria ?? row.criteria,
        basics: mark.basics ?? row.basics,
        feedback: mark.feedback ?? row.feedback,
        flags: mark.flags ?? row.flags,
        markedAt: row.markedAt ?? sql`NOW()`,
        finalisedAt: mark.status === "final" ? sql`NOW()` : null,
        updatedAt: sql`NOW()`,
      })
      .where(eq(capstoneAttempts.id, row.id))
    const all = (await tx.select().from(capstoneAttempts).where(eq(capstoneAttempts.submissionId, row.submissionId))).map(toView)
    const best = bestAttempt(all.filter((a) => a.status !== "draft"))
    await tx
      .update(capstoneSubmissions)
      .set({
        bestAttemptId: best?.id ?? null,
        bestTotal: best ? countedPoints(best) : null,
        bestBand: best?.band ?? null,
        updatedAt: sql`NOW()`,
      })
      .where(eq(capstoneSubmissions.id, row.submissionId))
  })
}
