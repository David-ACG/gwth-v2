"use client"

/**
 * One saved note, as shown in the card at its mark and in a part's notes box:
 * what it was pinned to, the learner's text, and Edit / Delete. Deleting asks
 * first (AlertDialog), because a deleted note cannot be brought back.
 */
import * as React from "react"
import { TriangleAlert } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { LessonNote } from "@/lib/types"
import { MAX_NOTE_LENGTH } from "@/lib/validations"
import { NOTES_COPY } from "./copy"
import styles from "./notes.module.css"

/** Props for {@link NoteItem}. */
export interface NoteItemProps {
  /** The note to show. */
  note: LessonNote
  /** Show the sentence the note was pinned to (phones, part boxes). */
  showQuote: boolean
  /** The pinned words are no longer in the lesson text. */
  changed: boolean
  /** Saves new text; resolves true when stored. */
  onSave: (body: string) => Promise<boolean>
  /** Deletes the note; resolves true when gone. */
  onDelete: () => Promise<boolean>
  /** Start in edit mode (a note just opened from its mark). */
  startEditing?: boolean
}

/** The quoted sentence with the pinned words in bold. */
export function NoteQuote({ note }: { note: LessonNote }) {
  const a = note.anchor
  if (!a) return null
  if (note.kind === "paragraph") {
    const opening = a.quote.length > 220 ? `${a.quote.slice(0, 220).trim()}…` : a.quote
    return <p className={styles.quote}>{opening}</p>
  }
  const i = a.sentence.indexOf(a.quote.replace(/\s+/g, " ").trim())
  if (i === -1) {
    return (
      <p className={styles.quote}>
        <strong>{a.quote}</strong>
      </p>
    )
  }
  const q = a.quote.replace(/\s+/g, " ").trim()
  return (
    <p className={styles.quote}>
      {a.sentence.slice(0, i)}
      <strong>{q}</strong>
      {a.sentence.slice(i + q.length)}
    </p>
  )
}

/** The "this text has changed" line: glyph plus words, never colour alone. */
export function ChangedLine({ children }: { children?: React.ReactNode }) {
  return (
    <p className={styles.changed}>
      <TriangleAlert size={16} aria-hidden="true" />
      <span>{children ?? NOTES_COPY.textChanged}</span>
    </p>
  )
}

export function NoteItem({ note, showQuote, changed, onSave, onDelete, startEditing = false }: NoteItemProps) {
  const [editing, setEditing] = React.useState(startEditing)
  const [draft, setDraft] = React.useState(note.body)
  const [busy, setBusy] = React.useState(false)
  const areaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (editing) areaRef.current?.focus()
  }, [editing])

  const submit = async () => {
    if (!draft.trim()) return
    setBusy(true)
    const ok = await onSave(draft)
    setBusy(false)
    if (ok) setEditing(false)
  }

  return (
    <div>
      {changed ? <ChangedLine /> : null}
      {showQuote || changed ? <NoteQuote note={note} /> : null}
      {editing ? (
        <>
          <label className="sr-only" htmlFor={`note-edit-${note.id}`}>
            {NOTES_COPY.editLabel}
          </label>
          <textarea
            id={`note-edit-${note.id}`}
            ref={areaRef}
            className={styles.textarea}
            value={draft}
            maxLength={MAX_NOTE_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                void submit()
              }
            }}
          />
          <div className={styles.actions}>
            <button type="button" className={styles.btn} disabled={busy || !draft.trim()} onClick={() => void submit()}>
              {busy ? NOTES_COPY.saving : NOTES_COPY.save}
            </button>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => {
                setDraft(note.body)
                setEditing(false)
              }}
            >
              {NOTES_COPY.cancel}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={styles.noteBody}>{note.body}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.linkish} onClick={() => setEditing(true)}>
              {NOTES_COPY.edit}
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button type="button" className={styles.linkish}>
                  {NOTES_COPY.delete}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{NOTES_COPY.deleteTitle}</AlertDialogTitle>
                  <AlertDialogDescription>{NOTES_COPY.deleteBody}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{NOTES_COPY.keep}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void onDelete()}>{NOTES_COPY.deleteConfirm}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  )
}
