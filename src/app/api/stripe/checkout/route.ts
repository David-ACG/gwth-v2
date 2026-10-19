/**
 * POST /api/stripe/checkout: the monthly course subscription (£29 a month,
 * then £7.50) and the "stay current" plan. Rewritten for the gift sale
 * (bead gwth-launch-v1uj.9) on Better Auth + Drizzle; the Supabase version
 * stopped working at W11.
 *
 * - Needs a signed-in account (sign-up is open once private mode is off).
 * - Sells nothing before SALES_OPEN_AT (decision 6: opens 1 December).
 * - No automatic_tax: GWTH is not VAT registered (decision 8).
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { ENABLE_BILLING } from "@/lib/config"
import { getSessionIdentity } from "@/lib/auth"
import { getAccessForUser } from "@/lib/billing/access"
import { isSalesOpen } from "@/lib/billing/passes"
import {
  billingDisabledForBetaBody,
  getStripeClient,
  getStripePriceId,
  siteOrigin,
  type StripePlan,
} from "@/lib/billing/stripe"

const checkoutSchema = z.object({
  plan: z.enum(["course", "stay-current"]).default("course"),
})

export async function POST(request: Request) {
  if (!ENABLE_BILLING) {
    return NextResponse.json(billingDisabledForBetaBody(), { status: 503 })
  }
  if (!isSalesOpen(new Date())) {
    return NextResponse.json(
      { code: "not_on_sale_yet", error: "The course opens for sign-up on 1 December." },
      { status: 409 }
    )
  }

  try {
    const identity = await getSessionIdentity()
    if (!identity) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const parsed = checkoutSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 })
    }
    const plan = parsed.data.plan as StripePlan

    const access = await getAccessForUser(identity.id)
    if (access.subscriptionMonth > 0 && access.source !== "registered") {
      return NextResponse.json(
        { code: "already_has_access", error: "You already have the course on this account." },
        { status: 409 }
      )
    }

    const stripe = getStripeClient()
    const priceId = getStripePriceId(plan)
    const { getDb } = await import("@/db")
    const { userAccess } = await import("@/db/schema")
    const db = getDb()

    const existing = (
      await db.select().from(userAccess).where(eq(userAccess.userId, identity.id)).limit(1)
    )[0]
    let customerId = existing?.stripeCustomerId ?? null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: identity.email || undefined,
        name: identity.name,
        metadata: { userId: identity.id },
      })
      customerId = customer.id
      await db
        .insert(userAccess)
        .values({
          userId: identity.id,
          accessSource: "registered",
          subscriptionState: "registered",
          subscriptionMonth: 0,
          stripeCustomerId: customerId,
        })
        .onConflictDoUpdate({
          target: userAccess.userId,
          set: { stripeCustomerId: customerId },
        })
    }

    const site = siteOrigin()
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: identity.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${site}/dashboard?billing=success`,
      cancel_url: `${site}/pricing?billing=cancelled`,
      metadata: { userId: identity.id, plan },
      subscription_data: { metadata: { userId: identity.id, plan } },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[stripe] subscription checkout failed", err)
    return NextResponse.json(
      { error: "We couldn't start the payment. Please try again in a moment." },
      { status: 500 }
    )
  }
}
