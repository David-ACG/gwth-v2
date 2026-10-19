/**
 * POST /api/stripe/portal: the Stripe Customer Portal, where a payer updates
 * their card or cancels online (DMCC readiness, bead gwth-launch-v1uj.9).
 * Rewritten on Better Auth + Drizzle; the Supabase version stopped at W11.
 */
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { ENABLE_BILLING } from "@/lib/config"
import { getSessionIdentity } from "@/lib/auth"
import { billingDisabledForBetaBody, getStripeClient, siteOrigin } from "@/lib/billing/stripe"

export async function POST() {
  if (!ENABLE_BILLING) {
    return NextResponse.json(billingDisabledForBetaBody(), { status: 503 })
  }

  try {
    const identity = await getSessionIdentity()
    if (!identity) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { getDb } = await import("@/db")
    const { userAccess } = await import("@/db/schema")
    const row = (
      await getDb()
        .select({ customerId: userAccess.stripeCustomerId })
        .from(userAccess)
        .where(eq(userAccess.userId, identity.id))
        .limit(1)
    )[0]

    if (!row?.customerId) {
      return NextResponse.json({ error: "No payments found for this account" }, { status: 404 })
    }

    const session = await getStripeClient().billingPortal.sessions.create({
      customer: row.customerId,
      return_url: `${siteOrigin()}/settings`,
      // The configuration that allows cancelling online (scripts/stripe-setup-gift-sale.mjs).
      ...(process.env.STRIPE_PORTAL_CONFIGURATION_ID
        ? { configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID }
        : {}),
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[stripe] portal failed", err)
    return NextResponse.json({ error: "Unable to open billing" }, { status: 500 })
  }
}
