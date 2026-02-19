import type { Metadata } from "next"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SettingsForm } from "@/components/settings/settings-form"
import {
  COURSE_MONTHLY_PRICE,
  ONGOING_MONTHLY_PRICE,
  GRACE_PERIOD_DAYS,
} from "@/lib/config"
import { CreditCard, AlertTriangle, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings, subscription, and preferences.",
}

/** Maps subscription state to a human-readable label */
function getSubscriptionLabel(state: string): string {
  const labels: Record<string, string> = {
    visitor: "No Account",
    registered: "Free Account",
    month1: "Month 1 — Active",
    month2: "Month 2 — Active",
    month3: "Month 3 — Active",
    ongoing: "Ongoing — Active",
    lapsed: "Lapsed — Payment Required",
  }
  return labels[state] ?? state
}

/** Returns the badge variant for a subscription state */
function getSubscriptionVariant(
  state: string
): "default" | "secondary" | "destructive" | "outline" {
  if (state === "lapsed") return "destructive"
  if (["month1", "month2", "month3", "ongoing"].includes(state))
    return "default"
  return "secondary"
}

export default async function SettingsPage() {
  const user = await getCurrentUser()
  const state = user?.subscriptionState ?? "visitor"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account, subscription, and notification preferences
        </p>
      </div>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Plan</p>
              <p className="text-xs text-muted-foreground">
                {state === "registered"
                  ? "Free labs access only"
                  : state === "ongoing"
                    ? `Full course access · $${ONGOING_MONTHLY_PRICE.toFixed(2)}/month`
                    : ["month1", "month2", "month3"].includes(state)
                      ? `Course access · $${COURSE_MONTHLY_PRICE.toFixed(2)}/month`
                      : "No active subscription"}
              </p>
            </div>
            <Badge variant={getSubscriptionVariant(state)}>
              {getSubscriptionLabel(state)}
            </Badge>
          </div>

          {state === "lapsed" && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Payment failed
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your payment could not be processed. You have{" "}
                  {GRACE_PERIOD_DAYS} days to update your payment method before
                  losing access.
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-3 gap-2"
                >
                  Update Payment Method
                  <ExternalLink className="size-3" />
                </Button>
              </div>
            </div>
          )}

          {user?.lastPaymentDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last payment</span>
              <span>
                {user.lastPaymentDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {state === "registered" && (
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium">Ready to start the course?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Subscribe for ${COURSE_MONTHLY_PRICE.toFixed(2)}/month to
                unlock the full course, monthly content, and dynamic scoring.
              </p>
              <Button size="sm" className="mt-3" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SettingsForm />
    </div>
  )
}
