"use client"

import { useState } from "react"
import type { SubscriptionState } from "@/lib/types"
import { cn } from "@/lib/utils"
import styles from "@/app/(dashboard)/settings/settings-fde.module.css"

type BillingActionsProps = {
  state: SubscriptionState
  className?: string
  checkoutUrl?: string | null
  portalUrl?: string | null
}

async function redirectFromBillingRoute(url: string) {
  const response = await fetch(url, { method: "POST" })
  const data = (await response.json()) as { url?: string; error?: string }

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "Billing is not available yet")
  }

  window.location.href = data.url
}

/**
 * Billing call-to-action. Logic unchanged; presentation follows the FDE
 * journal register via the settings page's scoped token module (§5.3 solid
 * button, rust error text). Rendered only inside the /settings page shell.
 */
export function BillingActions({
  state,
  className,
  checkoutUrl = null,
  portalUrl = null,
}: BillingActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasPaidAccess = [
    "month1",
    "month2",
    "month3",
    "ongoing",
    "lapsed",
  ].includes(state)

  async function handleBillingAction() {
    setIsLoading(true)
    setError(null)

    try {
      const billingUrl = hasPaidAccess ? portalUrl : checkoutUrl
      if (!billingUrl) throw new Error("Billing is disabled for beta")
      await redirectFromBillingRoute(billingUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Billing is not available yet")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        className={styles.buttonSolid}
        onClick={handleBillingAction}
        disabled={isLoading}
      >
        {isLoading
          ? "Loading"
          : hasPaidAccess
            ? "Manage Billing"
            : "Start Course"}
      </button>
      {error && (
        <p className={cn(styles.bodyText, styles.rustText)}>▲ {error}</p>
      )}
    </div>
  )
}
