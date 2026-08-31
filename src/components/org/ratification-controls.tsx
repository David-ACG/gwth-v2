"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { decideEditionLessonAction } from "@/lib/actions/org-admin"
import styles from "@/app/admin/admin-fde.module.css"
import orgStyles from "@/app/org/org-fde.module.css"

/**
 * Ratify / send back for one draft lesson (N7, /org/ratification) — the C4
 * workflow the CIPD deck promised: GWTH drafts an institution-exclusive
 * lesson, and it stays invisible to learners until the institution signs it
 * off.
 *
 * Ratifying is the destructive-ish direction here (it PUBLISHES the lesson to
 * every learner on the edition), so it is the solid button and it names the
 * consequence in its confirmation copy rather than in a dialog — the action
 * is one click to reverse (send it back), so an AlertDialog would be friction
 * without a matching risk.
 *
 * "Send back" requires a note (validated server-side too): "changes
 * requested" with no reason is not something a lesson author can act on.
 */
export function RatificationControls({
  editionId,
  lessonId,
  lessonTitle,
}: {
  /** The edition being decided. */
  editionId: string
  /** The draft lesson. */
  lessonId: string
  /** Used in the note field's accessible name, so multiple cards differ. */
  lessonTitle: string
}) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [pending, startTransition] = useTransition()

  function decide(decision: "ratify" | "send-back") {
    if (decision === "send-back" && note.trim().length === 0) {
      toast.error("Say what needs to change before sending the lesson back.")
      return
    }
    startTransition(async () => {
      const result = await decideEditionLessonAction(
        editionId,
        lessonId,
        decision,
        decision === "send-back" ? note.trim() : undefined
      )
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      setNote("")
      router.refresh()
    })
  }

  return (
    <div className={orgStyles.queueForm}>
      <div className={orgStyles.noteField}>
        <label className={styles.label} htmlFor={`note-${lessonId}`}>
          What needs to change?
        </label>
        <input
          id={`note-${lessonId}`}
          type="text"
          className={styles.input}
          placeholder="Required when sending back"
          value={note}
          disabled={pending}
          aria-label={`What needs to change in “${lessonTitle}”?`}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      <button
        type="button"
        className={styles.buttonSolid}
        disabled={pending}
        onClick={() => decide("ratify")}
      >
        {pending ? "Saving..." : "Ratify"}
      </button>
      <button
        type="button"
        className={styles.buttonOutline}
        disabled={pending}
        onClick={() => decide("send-back")}
      >
        Send back
      </button>
    </div>
  )
}
