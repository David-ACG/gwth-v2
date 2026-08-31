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
 * Ratifying PUBLISHES the lesson to every learner on the edition, so it is
 * the solid button; there is no confirmation dialog because the act is one
 * click to reverse (send it back), and the page's own lead copy states the
 * consequence. The success toast names it again.
 *
 * "Send back" requires a note (validated server-side too): "changes
 * requested" with no reason is not something a lesson author can act on.
 */
export function RatificationControls({
  editionId,
  lessonId,
}: {
  /** The edition being decided. */
  editionId: string
  /** The draft lesson. Also keys the note field's aria-describedby onto the
   *  card's own heading, so a screen reader hears which lesson it belongs to. */
  lessonId: string
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
          // No aria-label: the visible <label htmlFor> IS the accessible name
          // (QA round-1 style note 9). aria-describedby adds the lesson title
          // so a screen reader hears WHICH lesson without the visible label
          // text being replaced.
          aria-describedby={`queue-title-${lessonId}`}
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
