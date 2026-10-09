"use server"

/**
 * Client-callable boundary for learner notes (bead gwth-launch-fag3).
 *
 * Everything arriving here is attacker-controlled: the input is parsed with
 * zod, a save needs the same lesson access as answering a check question,
 * and the data layer scopes every row to the session's user id.
 */
import { revalidatePath } from "next/cache"
import { deleteNote, saveNote } from "@/lib/data/notes"
import { checkLessonAccess } from "@/lib/lessons/lesson-access"
import type { LessonNote } from "@/lib/types"
import { noteInputSchema } from "@/lib/validations"

/** What a note mutation tells the browser. */
export type NoteActionResult =
  | { ok: true; note: LessonNote | null }
  | { ok: false; message: string }

const SAVE_FAILED = "Your note could not be saved. Check your connection and try again."

/**
 * Saves (creates or updates) one note. Returns the stored note, or
 * `note: null` when an emptied part box was removed.
 */
export async function saveNoteAction(input: unknown): Promise<NoteActionResult> {
  const parsed = noteInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? SAVE_FAILED }
  }
  const access = await checkLessonAccess(parsed.data.lessonId)
  if (!access.ok) return { ok: false, message: access.message }
  try {
    const note = await saveNote(parsed.data)
    revalidatePath("/notes")
    return { ok: true, note }
  } catch (error) {
    console.error("[notes] save failed", error)
    return { ok: false, message: SAVE_FAILED }
  }
}

/** Deletes one of the current learner's notes. */
export async function deleteNoteAction(id: unknown): Promise<NoteActionResult> {
  if (typeof id !== "string" || !id || id.length > 100) {
    return { ok: false, message: "That note could not be found." }
  }
  try {
    await deleteNote(id)
    revalidatePath("/notes")
    return { ok: true, note: null }
  } catch (error) {
    console.error("[notes] delete failed", error)
    return { ok: false, message: "That note could not be deleted. Try again." }
  }
}
