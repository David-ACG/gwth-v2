"use client"

/**
 * One lesson's notes in the browser (bead gwth-launch-fag3): the list, the
 * placement of each pinned note on the text now on screen, and save/delete
 * through the server actions. Held once per lesson viewer so moving between
 * parts keeps everything.
 */
import * as React from "react"
import { toast } from "sonner"
import { deleteNoteAction, saveNoteAction } from "@/lib/actions/notes"
import type { NotePlacement } from "@/lib/notes/anchor"
import type { LessonNote } from "@/lib/types"
import type { NoteInput } from "@/lib/validations"

/** Placement status of each pinned note, by note id. */
export type PlacementMap = Record<string, NotePlacement["status"]>

/** What the notes components get from the viewer. */
export interface LessonNotesApi {
  lessonId: string
  notes: LessonNote[]
  /** False for a visitor who cannot save (nothing is offered). */
  enabled: boolean
  placements: PlacementMap
  /** Merge placements reported by the text layer of one part. */
  reportPlacements: (next: PlacementMap) => void
  /** Saves; resolves to the stored note, null for a cleared part box, or undefined on failure. */
  save: (input: Omit<NoteInput, "lessonId">) => Promise<LessonNote | null | undefined>
  remove: (id: string) => Promise<boolean>
}

export function useLessonNotes({
  lessonId,
  initialNotes,
  enabled,
}: {
  lessonId: string
  initialNotes: LessonNote[]
  enabled: boolean
}): LessonNotesApi {
  const [notes, setNotes] = React.useState<LessonNote[]>(initialNotes)
  const [placements, setPlacements] = React.useState<PlacementMap>({})

  // No manual memoisation: the React Compiler keeps these stable.
  const reportPlacements = (next: PlacementMap) => {
    setPlacements((prev) => {
      const changed = Object.entries(next).some(([id, s]) => prev[id] !== s)
      return changed ? { ...prev, ...next } : prev
    })
  }

  const save = async (input: Omit<NoteInput, "lessonId">) => {
      const res = await saveNoteAction({ ...input, lessonId }).catch(() => null)
      if (!res || !res.ok) {
        toast.error(res && !res.ok ? res.message : "Your note could not be saved. Check your connection and try again.")
        return undefined
      }
      const saved = res.note
      setNotes((prev) => {
        if (!saved) {
          return prev.filter((n) => !(n.kind === "part" && n.partKey === input.partKey))
        }
        const i = prev.findIndex((n) => n.id === saved.id)
        if (i === -1) return [...prev, saved]
        const copy = [...prev]
        copy[i] = saved
        return copy
      })
      return saved
  }

  const remove = async (id: string) => {
    const res = await deleteNoteAction(id).catch(() => null)
    if (!res || !res.ok) {
      toast.error(res && !res.ok ? res.message : "That note could not be deleted. Try again.")
      return false
    }
    setNotes((prev) => prev.filter((n) => n.id !== id))
    toast.success("Note deleted")
    return true
  }

  return { lessonId, notes, enabled, placements, reportPlacements, save, remove }
}

/**
 * True on a desktop: a wide window with a mouse. There the margin pencil and
 * pinned notes are offered; phones and tablets get the per-part box only.
 */
export function useDesktopNotes(): boolean {
  const [desktop, setDesktop] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia?.("(min-width: 1024px) and (hover: hover) and (pointer: fine)")
    if (!mq) return
    const update = () => setDesktop(mq.matches)
    update()
    mq.addEventListener?.("change", update)
    return () => mq.removeEventListener?.("change", update)
  }, [])
  return desktop
}

/** The note id named by the address bar (`#note-<id>`), if any. */
export function noteIdFromHash(): string | null {
  if (typeof window === "undefined") return null
  const m = /^#note-([\w-]{1,100})$/.exec(window.location.hash)
  return m ? m[1]! : null
}
