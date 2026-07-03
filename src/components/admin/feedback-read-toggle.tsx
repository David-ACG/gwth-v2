"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import styles from "@/app/admin/admin-fde.module.css"

/** Props for {@link FeedbackReadToggle}. */
export interface FeedbackReadToggleProps {
  /** Feedback row id (UUID). */
  id: string
  /** Whether the row is currently marked read. */
  read: boolean
}

/**
 * The read/unread action on one admin feedback-inbox row (W4, Panel 3).
 * PATCHes the session-gated /api/admin/feedback route, then refreshes the
 * server-rendered inbox so the marker and the overview's unread count agree.
 */
export function FeedbackReadToggle({ id, read }: FeedbackReadToggleProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function toggle() {
    setPending(true)
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: !read }),
      })
      if (!res.ok) {
        const result = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(result.error || "Could not update the item.")
        return
      }
      router.refresh()
    } catch {
      toast.error("Could not update the item.")
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      className={styles.buttonOutline}
      onClick={toggle}
      disabled={pending}
      aria-label={read ? "Mark as unread" : "Mark as read"}
    >
      {read ? "Mark unread" : "Mark read"}
    </button>
  )
}
