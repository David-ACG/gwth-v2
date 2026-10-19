"use client"

import { useState } from "react"
import form from "@/components/marketing/contact-fde/contact-fde.module.css"

/** Opens the gift on the signed-in account, then goes to the dashboard. */
export function OpenGiftButton({ code, label }: { code: string; label: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function open() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/passes/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "We couldn't open your gift. Please try again.")
      window.location.href = "/dashboard?gift=opened"
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't open your gift. Please try again.")
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className={form.buttonSolid}
        onClick={open}
        disabled={busy}
        aria-busy={busy}
        data-testid="open-gift"
      >
        {busy ? "Opening" : label}
      </button>
      {error && (
        <p className={form.error} role="alert">
          {error}
        </p>
      )}
    </>
  )
}
