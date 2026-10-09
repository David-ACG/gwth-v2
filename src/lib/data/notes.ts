/**
 * User-scoped learner notes (bead gwth-launch-fag3).
 *
 * Real learners read and write `learner_notes` rows scoped to the Better
 * Auth user id; no client-supplied user id crosses this seam. Local mock
 * mode keeps an in-memory list so the viewer works without a database.
 * Client components must use the server actions in `@/lib/actions/notes`.
 */
import "server-only"

import { and, asc, eq, sql } from "drizzle-orm"
import { getDb } from "@/db"
import { learnerNotes, lessons } from "@/db/schema"
import type { LessonNote, NoteAnchor, NoteKind } from "@/lib/types"
import type { NoteInput } from "@/lib/validations"
import { resolveDataMode } from "./mode"
import { mockNotes } from "./mock-data"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function mapRow(row: typeof learnerNotes.$inferSelect): LessonNote {
  return {
    id: row.id,
    lessonId: row.lessonId,
    lessonTitle: row.lessonTitle,
    partKey: row.partKey,
    partTitle: row.partTitle,
    kind: row.kind as NoteKind,
    body: row.body,
    anchor: (row.anchor as NoteAnchor | null) ?? null,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  }
}

/** The current learner's notes on one lesson, oldest first. */
export async function getLessonNotes(lessonId: string): Promise<LessonNote[]> {
  const mode = await resolveDataMode()
  if (mode.kind === "anonymous") return []
  if (mode.kind === "mock") return mockNotes.filter((n) => n.lessonId === lessonId).map((n) => ({ ...n }))
  try {
    const rows = await getDb()
      .select()
      .from(learnerNotes)
      .where(and(eq(learnerNotes.userId, mode.userId), eq(learnerNotes.lessonId, lessonId)))
      .orderBy(asc(learnerNotes.createdAt))
    return rows.map(mapRow)
  } catch (error) {
    // A database without migration 025 must not take the lesson down.
    console.error("[notes] could not read notes", error)
    return []
  }
}

/** Every note the current learner has written, oldest first. */
export async function getAllNotes(): Promise<LessonNote[]> {
  const mode = await resolveDataMode()
  if (mode.kind === "anonymous") return []
  if (mode.kind === "mock") return mockNotes.map((n) => ({ ...n }))
  const rows = await getDb()
    .select()
    .from(learnerNotes)
    .where(eq(learnerNotes.userId, mode.userId))
    .orderBy(asc(learnerNotes.createdAt))
  return rows.map(mapRow)
}

/**
 * Saves a note for the authenticated learner and returns it, or null when
 * an empty part box was cleared (the row is removed). A part note is one
 * per part: saving it again updates the same row.
 */
export async function saveNote(input: NoteInput): Promise<LessonNote | null> {
  const mode = await resolveDataMode()
  if (mode.kind === "anonymous") throw new Error("Authentication required")
  const body = input.body.replace(/\s+$/, "")
  if (input.kind !== "part" && !body.trim()) throw new Error("A note needs some text")
  if (mode.kind === "mock") return saveMockNote(input, body)

  const db = getDb()
  const [lesson] = await db
    .select({ id: lessons.id, title: lessons.title })
    .from(lessons)
    .where(eq(lessons.id, input.lessonId))
    .limit(1)
  if (!lesson) throw new Error("Lesson not found")

  if (input.kind === "part") {
    const partKey = input.partKey!
    const owned = and(
      eq(learnerNotes.userId, mode.userId),
      eq(learnerNotes.lessonId, lesson.id),
      eq(learnerNotes.partKey, partKey),
      eq(learnerNotes.kind, "part")
    )
    if (!body.trim()) {
      await db.delete(learnerNotes).where(owned)
      return null
    }
    const [row] = await db
      .insert(learnerNotes)
      .values({
        userId: mode.userId,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        partKey,
        partTitle: input.partTitle,
        kind: "part",
        body,
        anchor: null,
      })
      .onConflictDoUpdate({
        target: [learnerNotes.userId, learnerNotes.lessonId, learnerNotes.partKey],
        targetWhere: sql`kind = 'part'`,
        set: { body, partTitle: input.partTitle, lessonTitle: lesson.title, updatedAt: sql`now()` },
      })
      .returning()
    return mapRow(row!)
  }

  if (input.id) {
    if (!UUID_RE.test(input.id)) throw new Error("Note not found")
    const [row] = await db
      .update(learnerNotes)
      .set({ body, updatedAt: sql`now()`, lessonTitle: lesson.title })
      .where(and(eq(learnerNotes.id, input.id), eq(learnerNotes.userId, mode.userId)))
      .returning()
    if (!row) throw new Error("Note not found")
    return mapRow(row)
  }

  const [row] = await db
    .insert(learnerNotes)
    .values({
      userId: mode.userId,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      partKey: input.partKey,
      partTitle: input.partTitle,
      kind: input.kind,
      body,
      anchor: input.anchor,
    })
    .returning()
  return mapRow(row!)
}

function saveMockNote(input: NoteInput, body: string): LessonNote | null {
  const now = new Date().toISOString()
  const existing =
    input.kind === "part"
      ? mockNotes.find((n) => n.kind === "part" && n.lessonId === input.lessonId && n.partKey === input.partKey)
      : input.id
        ? mockNotes.find((n) => n.id === input.id)
        : undefined
  if (input.kind === "part" && !body.trim()) {
    if (existing) mockNotes.splice(mockNotes.indexOf(existing), 1)
    return null
  }
  if (existing) {
    existing.body = body
    existing.updatedAt = now
    if (input.kind === "part") existing.partTitle = input.partTitle
    return { ...existing }
  }
  if (input.id) throw new Error("Note not found")
  const note: LessonNote = {
    id: crypto.randomUUID(),
    lessonId: input.lessonId,
    lessonTitle: null,
    partKey: input.partKey,
    partTitle: input.partTitle,
    kind: input.kind,
    body,
    anchor: input.anchor,
    createdAt: now,
    updatedAt: now,
  }
  mockNotes.push(note)
  return { ...note }
}

/** Deletes one of the current learner's notes. True when a row went. */
export async function deleteNote(id: string): Promise<boolean> {
  const mode = await resolveDataMode()
  if (mode.kind === "anonymous") throw new Error("Authentication required")
  if (mode.kind === "mock") {
    const i = mockNotes.findIndex((n) => n.id === id)
    if (i >= 0) mockNotes.splice(i, 1)
    return i >= 0
  }
  if (!UUID_RE.test(id)) return false
  const deleted = await getDb()
    .delete(learnerNotes)
    .where(and(eq(learnerNotes.id, id), eq(learnerNotes.userId, mode.userId)))
    .returning({ id: learnerNotes.id })
  return deleted.length > 0
}
