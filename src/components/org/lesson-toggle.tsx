"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  setEditionLessonIncludedAction,
  setEditionLessonMandatoryAction,
} from "@/lib/actions/org-admin"
import styles from "@/app/admin/admin-fde.module.css"

/**
 * The institution's switch for one lesson (N7, /org/syllabus).
 *
 * A plain checkbox, not a fashionable switch widget: it is a real form
 * control, so it is keyboard-operable, announces its checked state to a
 * screen reader for free, and needs no ARIA of its own. The label text is the
 * accessible name, and `aria-describedby` points at the lesson title so the
 * announcement is "Include, In this edition, <lesson title>".
 *
 * State is optimistic-with-rollback rather than React 19's `useOptimistic`:
 * the checkbox owns a single boolean and a failed action must put it BACK, so
 * a plain useState + revert is clearer than a reducer here. `router.refresh()`
 * on success re-reads the server-rendered counts around it.
 */
export function LessonToggle({
  editionId,
  lessonId,
  lessonTitleId,
  included,
}: {
  /** The edition being edited. */
  editionId: string
  /** The lesson this switch controls. */
  lessonId: string
  /** DOM id of the lesson title, for the accessible description. */
  lessonTitleId: string
  /** Whether the lesson is currently in the edition. */
  included: boolean
}) {
  const router = useRouter()
  const [checked, setChecked] = useState(included)
  const [pending, startTransition] = useTransition()

  function onChange(next: boolean) {
    const previous = checked
    setChecked(next)
    startTransition(async () => {
      const result = await setEditionLessonIncludedAction(
        editionId,
        lessonId,
        next
      )
      if (!result.ok) {
        setChecked(previous)
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.refresh()
    })
  }

  return (
    <span className={styles.checkboxRow}>
      <input
        id={`include-${lessonId}`}
        type="checkbox"
        checked={checked}
        disabled={pending}
        aria-describedby={lessonTitleId}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label className={styles.checkboxLabel} htmlFor={`include-${lessonId}`}>
        In this edition
      </label>
    </span>
  )
}

/**
 * The institution's switch for whether an included lesson counts toward the
 * baseline and the GWTH Score denominator (decision 2, 2026-08-28).
 */
export function MandatoryToggle({
  editionId,
  lessonId,
  lessonTitleId,
  isMandatory,
}: {
  editionId: string
  lessonId: string
  lessonTitleId: string
  /** Whether the lesson currently counts toward the baseline. */
  isMandatory: boolean
}) {
  const router = useRouter()
  const [checked, setChecked] = useState(isMandatory)
  const [pending, startTransition] = useTransition()

  function onChange(next: boolean) {
    const previous = checked
    setChecked(next)
    startTransition(async () => {
      const result = await setEditionLessonMandatoryAction(
        editionId,
        lessonId,
        next
      )
      if (!result.ok) {
        setChecked(previous)
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.refresh()
    })
  }

  return (
    <span className={styles.checkboxRow}>
      <input
        id={`mandatory-${lessonId}`}
        type="checkbox"
        checked={checked}
        disabled={pending}
        aria-describedby={lessonTitleId}
        onChange={(event) => onChange(event.target.checked)}
      />
      <label className={styles.checkboxLabel} htmlFor={`mandatory-${lessonId}`}>
        Counts toward the baseline
      </label>
    </span>
  )
}
