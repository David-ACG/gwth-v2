"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  feedbackSchema,
  FEEDBACK_CATEGORIES,
  type FeedbackFormData,
} from "@/lib/validations"
import { cn } from "@/lib/utils"
import styles from "./report-problem.module.css"

/** Human labels for each category, sentence case (FDE copy rule). */
const CATEGORY_LABELS: Record<(typeof FEEDBACK_CATEGORIES)[number], string> = {
  bug: "Something is broken",
  content: "A lesson or lab needs fixing",
  idea: "An idea or suggestion",
  general: "General comment",
}

/**
 * Props for {@link ReportProblemPanel}.
 */
export interface ReportProblemPanelProps {
  /**
   * The in-app path this report is about. When omitted the current pathname is
   * captured, so a report opened from a lesson page records that lesson.
   */
  sourcePath?: string
  /**
   * `inline` (default) renders the proud paper artefact with the FDE hard-offset
   * shadow, for the always-in-view /guide column. `modal` renders it flat for
   * use inside the launcher overlay.
   */
  variant?: "inline" | "modal"
  /** Called after a successful submission (e.g. to close the launcher overlay). */
  onSubmitted?: () => void
  /** Optional extra class on the shell wrapper. */
  className?: string
}

/**
 * The beta "report a problem" panel — the single feedback surface shown
 * always-in-view on /guide and inside the launcher overlay on the dashboard and
 * lesson viewer. Persists via POST /api/feedback (Drizzle-backed), which also
 * notifies david@gwth.ai; the row is saved even if that email fails.
 *
 * Styled to the FDE journal register (DESIGN_FDE.md): paper panel, ink border,
 * square hairline inputs, mono functional labels, sentence-case CTA.
 */
export function ReportProblemPanel({
  sourcePath,
  variant = "inline",
  onSubmitted,
  className,
}: ReportProblemPanelProps) {
  const pathname = usePathname()
  const resolvedPath = sourcePath ?? pathname ?? "/"
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { category: "general", message: "", sourcePath: resolvedPath },
  })

  async function onSubmit(data: FeedbackFormData) {
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sourcePath: resolvedPath }),
      })
      if (!res.ok) {
        const result = (await res.json().catch(() => ({}))) as {
          error?: string
        }
        toast.error(result.error || "Could not send feedback. Please try again.")
        return
      }
      setSubmitted(true)
      toast.success("Thank you. Your feedback has been sent.")
      onSubmitted?.()
    } catch {
      toast.error("Could not send feedback. Please try again.")
    }
  }

  const { errors, isSubmitting } = form.formState

  return (
    <section
      className={cn(styles.shell, className)}
      aria-label="Report a problem"
      data-section="report-problem"
    >
      <div className={cn(styles.panel, variant === "modal" && styles.panelFlat)}>
        {submitted ? (
          <div className={styles.success} role="status">
            <p className={styles.mono}>Status · Sent</p>
            <h2 className={styles.title}>Thank you</h2>
            <p className={styles.successBody}>
              Your feedback has gone straight to the team. It really does help
              shape the beta.
            </p>
            <button
              type="button"
              className={styles.buttonOutline}
              onClick={() => {
                setSubmitted(false)
                form.reset({
                  category: "general",
                  message: "",
                  sourcePath: resolvedPath,
                })
              }}
            >
              Report something else
            </button>
          </div>
        ) : (
          <>
            <div className={styles.head}>
              <h2 className={styles.title}>Report a problem</h2>
              <p className={styles.mono}>Beta</p>
            </div>
            <p className={styles.lead}>
              Found a bug, a confusing lesson, or something missing? Tell us here.
              Reports go to the team with the page you are on.
            </p>
            <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="feedback-category">
                  What is this about
                </label>
                <select
                  id="feedback-category"
                  className={styles.select}
                  {...form.register("category")}
                >
                  {FEEDBACK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="feedback-message">
                  Details
                </label>
                <textarea
                  id="feedback-message"
                  className={styles.textarea}
                  placeholder="What happened, and what did you expect?"
                  aria-invalid={errors.message ? "true" : undefined}
                  rows={5}
                  {...form.register("message")}
                />
                {errors.message && (
                  <p className={styles.error} role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <p className={styles.sourceLine}>Page · {resolvedPath}</p>

              <button
                type="submit"
                className={styles.buttonSolid}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send feedback"}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  )
}
