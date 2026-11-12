"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import styles from "@/app/admin/admin-fde.module.css"

type Action = "clear" | "suspend" | "reinstate"

const LABEL: Record<Action, string> = {
  clear: "Looks fine",
  suspend: "Suspend",
  reinstate: "Reinstate",
}

const CONFIRM: Record<Action, (email: string) => string> = {
  clear: (email) => `Clear ${email}? Their held month opens now.`,
  suspend: (email) => `Suspend ${email}? They lose course access until you reinstate them.`,
  reinstate: (email) => `Reinstate ${email}?`,
}

/** Looks fine, Suspend and Reinstate for one flagged account on /admin/flagged. */
export function FlagActions({ id, email, status }: { id: number; email: string; status: string }) {
  const router = useRouter()
  const [pending, setPending] = useState<Action | null>(null)
  const actions: Action[] = status === "suspended" ? ["reinstate"] : status === "open" ? ["clear", "suspend"] : []

  async function run(action: Action) {
    if (!window.confirm(CONFIRM[action](email))) return
    setPending(action)
    try {
      const res = await fetch(`/api/admin/flagged/${id}`, {
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
    } finally {
      setPending(null)
    }
  }

  if (actions.length === 0) return null
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {actions.map((a) => (
        <button
          key={a}
          type="button"
          className={a === "clear" || a === "reinstate" ? styles.buttonSolid : styles.buttonOutline}
          disabled={pending !== null}
          onClick={() => run(a)}
          data-testid={`flag-${a}`}
        >
          {pending === a ? "Working..." : LABEL[a]}
        </button>
      ))}
    </div>
  )
}
