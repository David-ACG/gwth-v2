"use client"

import { useState } from "react"
import type { SubscriptionState } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { CreditCard, ExternalLink, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type BillingActionsProps = {
  state: SubscriptionState
  className?: string
}

async function redirectFromBillingRoute(url: string) {
  const response = await fetch(url, { method: "POST" })
  const data = (await response.json()) as { url?: string; error?: string }

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "Billing is not available yet")
  }

  window.location.href = data.url
}

export function BillingActions({ state, className }: BillingActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasPaidAccess = ["month1", "month2", "month3", "ongoing", "lapsed"].includes(
    state
  )

  async function handleBillingAction() {
    setIsLoading(true)
    setError(null)

    try {
      await redirectFromBillingRoute(
        hasPaidAccess ? "/api/stripe/portal" : "/api/stripe/checkout"
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Billing is not available yet")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        size="sm"
        className="gap-2"
        onClick={handleBillingAction}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : hasPaidAccess ? (
          <ExternalLink className="size-4" />
        ) : (
          <CreditCard className="size-4" />
        )}
        {hasPaidAccess ? "Manage Billing" : "Start Course"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
