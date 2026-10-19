"use client"

import { useState } from "react"

type BuyButtonProps = {
  /** The checkout route to POST to. */
  endpoint: "/api/passes/checkout" | "/api/stripe/checkout"
  body: Record<string, unknown>
  label: string
  /** Where a signed-out buyer returns after creating an account. */
  returnTo: string
  className?: string
  errorClassName?: string
}

/**
 * Starts a Stripe Checkout and follows it. A signed-out buyer is sent to
 * create an account first and brought back to `returnTo` (bead
 * gwth-launch-v1uj.9: paying needs an account; sign-up is open once sales
 * open). Errors are shown in words, never by colour alone.
 */
export function BuyButton({
  endpoint,
  body,
  label,
  returnTo,
  className,
  errorClassName,
}: BuyButtonProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function go() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => ({}))) as {
        url?: string
        error?: string
        code?: string
      }
      if (res.status === 401) {
        window.location.href = `/signup?next=${encodeURIComponent(returnTo)}`
        return
      }
      if (!res.ok || !data.url) throw new Error(data.error ?? "Payments aren't available just now.")
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payments aren't available just now.")
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={go} disabled={busy} aria-busy={busy}>
        {busy ? "Opening the payment page" : label}
      </button>
      {error && (
        <p className={errorClassName} role="alert">
          {error}
        </p>
      )}
    </>
  )
}
