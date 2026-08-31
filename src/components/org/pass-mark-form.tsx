"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { setEditionPassMarkAction } from "@/lib/actions/org-admin"
import {
  editionPassMarkSchema,
  type EditionPassMarkFormData,
} from "@/lib/validations"
import styles from "@/app/admin/admin-fde.module.css"
import orgStyles from "@/app/org/org-fde.module.css"

/**
 * The edition pass mark (N7) — Ben's ask, verbatim, 20 Aug: "could we set
 * like a pass mark for students?"
 *
 * One number per edition (decision 4, 2026-08-28). It threads into grading
 * with no further wiring: N6 resolves `syllabus_edition.pass_mark` per
 * request, so the next submission is graded against whatever is saved here.
 * The copy states the two consequences plainly — it applies from the next
 * attempt, and an existing pass is not revoked — because a silent retroactive
 * fail would be the worst possible surprise for an institution.
 */
export function PassMarkForm({
  editionId,
  passMark,
}: {
  /** The edition being edited. */
  editionId: string
  /** The pass mark currently stored. */
  passMark: number
}) {
  const router = useRouter()

  const form = useForm<EditionPassMarkFormData>({
    resolver: zodResolver(editionPassMarkSchema),
    defaultValues: { editionId, passMark },
  })

  async function onSubmit(data: EditionPassMarkFormData) {
    const result = await setEditionPassMarkAction(editionId, data.passMark)
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success(result.message)
    form.reset({ editionId, passMark: data.passMark })
    router.refresh()
  }

  const { errors, isSubmitting } = form.formState

  return (
    <section id="pass-mark" className={styles.panel} data-section="pass-mark">
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>Pass mark</h2>
        <p className={styles.mono}>One per edition</p>
      </div>
      <p className={styles.panelLead}>
        The score a learner must reach on a lesson quiz for it to count toward
        your baseline. It applies from their next attempt; anyone who has
        already passed a lesson keeps that pass.
      </p>
      <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <p className={styles.mono}>Currently</p>
          <p className={orgStyles.passMarkNow}>{passMark}%</p>
        </div>
        <div className={`${styles.field} ${orgStyles.passMarkField}`}>
          <label className={styles.label} htmlFor="pass-mark-input">
            New pass mark
          </label>
          <input
            id="pass-mark-input"
            type="number"
            min={0}
            max={100}
            step={1}
            inputMode="numeric"
            className={styles.input}
            aria-invalid={errors.passMark ? "true" : undefined}
            {...form.register("passMark", { valueAsNumber: true })}
          />
        </div>
        <button
          type="submit"
          className={styles.buttonSolid}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save pass mark"}
        </button>
        {errors.passMark && (
          <p className={styles.formError} role="alert">
            {errors.passMark.message}
          </p>
        )}
      </form>
    </section>
  )
}
