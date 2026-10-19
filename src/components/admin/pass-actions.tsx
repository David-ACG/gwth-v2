"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import styles from "@/app/admin/admin-fde.module.css"

type Action = "resend" | "refund" | "extend"

const CONFIRM: Record<Action, (code: string) => string> = {
  resend: (code) => `Send the gift email for ${code} again now?`,
  refund: (code) => `Refund ${code} in full? This cannot be undone.`,
  extend: (code) => `Extend ${code}?`,
}

/** Resend, refund and extend for one pass on /admin/passes. */
export function PassActions({
  id,
  code,
  canResend,
  canRefund,
  canExtend,
  extendLabel,
}: {
  id: string
  code: string
  canResend: boolean
  canRefund: boolean
  canExtend: boolean
  extendLabel: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState<Action | null>(null)

  async function run(action: Action) {
    if (!window.confirm(CONFIRM[action](code))) return
    setPending(action)
    try {
      const res = await fetch(`/api/admin/passes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const result = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
      if (!res.ok) {
        toast.error(result.error || "That didn't work.")
        return
      }
      toast.success(result.message || "Done.")
      router.refresh()
    } catch {
      toast.error("That didn't work.")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className={styles.headerActions}>
      {canResend && (
        <button type="button" className={styles.buttonOutline} disabled={pending !== null} onClick={() => run("resend")}>
          {pending === "resend" ? "Sending" : "Resend"}
        </button>
      )}
      {canExtend && (
        <button type="button" className={styles.buttonOutline} disabled={pending !== null} onClick={() => run("extend")}>
          {pending === "extend" ? "Extending" : extendLabel}
        </button>
      )}
      {canRefund && (
        <button type="button" className={styles.buttonOutline} disabled={pending !== null} onClick={() => run("refund")}>
          {pending === "refund" ? "Refunding" : "Refund"}
        </button>
      )}
    </div>
  )
}
