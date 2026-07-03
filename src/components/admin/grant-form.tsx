"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { adminGrantSchema, type AdminGrantFormData } from "@/lib/validations"
import styles from "@/app/admin/admin-fde.module.css"

/**
 * Panel 4 — the manual beta grant form (W4), the header's "Grant access"
 * target on /admin/roster.
 *
 * Posts to the session-gated /api/admin/grant wrapper (which reuses the
 * existing beta-access endpoint in-process; the API key stays server-side).
 * On success it toasts and calls router.refresh(), so the server-rendered
 * roster below re-reads the DB and shows the new state without a manual
 * refresh.
 */
export function GrantForm() {
  const router = useRouter()

  const form = useForm<AdminGrantFormData>({
    resolver: zodResolver(adminGrantSchema),
    defaultValues: { email: "", months: 3, notes: "", sendInvite: true },
  })

  async function onSubmit(data: AdminGrantFormData) {
    try {
      const res = await fetch("/api/admin/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          notes: data.notes?.trim() ? data.notes.trim() : undefined,
        }),
      })
      const result = (await res.json().catch(() => ({}))) as {
        error?: string
        email?: string
        subscriptionMonth?: number
        inviteSent?: boolean
      }
      if (!res.ok) {
        toast.error(result.error || "Grant failed. Please try again.")
        return
      }
      toast.success(
        `Granted month ${result.subscriptionMonth ?? data.months} access to ${
          result.email ?? data.email
        }${result.inviteSent ? ", invite email sent" : ""}`
      )
      form.reset({ email: "", months: 3, notes: "", sendInvite: true })
      // Re-render the server-component roster so the new grant shows at once.
      router.refresh()
    } catch {
      toast.error("Grant failed. Please try again.")
    }
  }

  const { errors, isSubmitting } = form.formState

  return (
    <section id="grant" className={styles.panel} data-section="grant-form">
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>Grant beta access</h2>
        <p className={styles.mono}>Manual · invite-only</p>
      </div>
      <p className={styles.panelLead}>
        Grants course access to an email address, before or after the tester
        signs up. The grant applies on their next sign-in.
      </p>
      <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)}>
        <div className={`${styles.field} ${styles.fieldGrow}`}>
          <label className={styles.label} htmlFor="grant-email">
            Email
          </label>
          <input
            id="grant-email"
            type="email"
            autoComplete="off"
            placeholder="tester@example.com"
            className={styles.input}
            aria-invalid={errors.email ? "true" : undefined}
            {...form.register("email")}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="grant-months">
            Months
          </label>
          <select
            id="grant-months"
            className={styles.select}
            {...form.register("months")}
          >
            <option value={1}>Month 1</option>
            <option value={2}>Months 1–2</option>
            <option value={3}>Months 1–3</option>
          </select>
        </div>
        <div className={`${styles.field} ${styles.fieldGrow}`}>
          <label className={styles.label} htmlFor="grant-notes">
            Notes
          </label>
          <input
            id="grant-notes"
            type="text"
            placeholder="Optional, e.g. who they are"
            className={styles.input}
            aria-invalid={errors.notes ? "true" : undefined}
            {...form.register("notes")}
          />
        </div>
        <div className={styles.checkboxRow}>
          <input
            id="grant-invite"
            type="checkbox"
            {...form.register("sendInvite")}
          />
          <label className={styles.checkboxLabel} htmlFor="grant-invite">
            Send the invite email
          </label>
        </div>
        <button
          type="submit"
          className={styles.buttonSolid}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Granting..." : "Grant access"}
        </button>
        {errors.email && (
          <p className={styles.formError} role="alert">
            {errors.email.message}
          </p>
        )}
        {errors.notes && (
          <p className={styles.formError} role="alert">
            {errors.notes.message}
          </p>
        )}
      </form>
    </section>
  )
}
