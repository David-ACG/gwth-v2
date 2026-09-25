"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import styles from "@/app/admin/admin-fde.module.css"

/** Props for {@link BetaTesterToggle}. */
export interface BetaTesterToggleProps {
  /** Better Auth user id of the roster row. */
  userId: string
  /** Display name, for the accessible label. */
  name: string
  /** Whether this person is currently a beta tester. */
  betaTester: boolean
}

/**
 * The "Beta tester" tick box on one /admin/roster row (bead gwth-launch-8ksq).
 * A ticked person can select words or click a picture anywhere on the site
 * and leave a comment. PATCHes the admin-gated /api/admin/beta-testers route,
 * then refreshes the server-rendered roster so the box reflects the database.
 */
export function BetaTesterToggle({ userId, name, betaTester }: BetaTesterToggleProps) {
  const router = useRouter()
  const [checked, setChecked] = useState(betaTester)
  const [pending, setPending] = useState(false)

  async function toggle(next: boolean) {
    setChecked(next)
    setPending(true)
    try {
      const res = await fetch("/api/admin/beta-testers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, betaTester: next }),
      })
      if (!res.ok) {
        const result = (await res.json().catch(() => ({}))) as { error?: string }
        setChecked(!next)
        toast.error(result.error || "Could not update this person.")
        return
      }
      router.refresh()
    } catch {
      setChecked(!next)
      toast.error("Could not update this person.")
    } finally {
      setPending(false)
    }
  }

  return (
    <label className={styles.checkboxRow} style={{ paddingBottom: 0 }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(event) => toggle(event.target.checked)}
        aria-label={`Beta tester: ${name}`}
      />
      <span className={styles.checkboxLabel}>Beta tester</span>
    </label>
  )
}
