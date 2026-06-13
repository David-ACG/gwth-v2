import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { ENABLE_BILLING } from "@/lib/config"
import {
  billingDisabledForBetaBody,
  getStripeClient,
  getStripePriceId,
  type StripePlan,
} from "@/lib/billing/stripe"

const checkoutSchema = z.object({
  plan: z.enum(["course", "stay-current"]).default("course"),
})

export async function POST(request: Request) {
  if (!ENABLE_BILLING) {
    return NextResponse.json(billingDisabledForBetaBody(), { status: 503 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 })
    }

    const plan = parsed.data.plan as StripePlan
    const stripe = getStripeClient()
    const admin = createAdminClient()
    const priceId = getStripePriceId(plan)

    const { data: existingAccess } = await admin
      .from("user_access")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    let customerId = existingAccess?.stripe_customer_id as string | undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name:
          (user.user_metadata?.name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined),
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      if (existingAccess) {
        await admin
          .from("user_access")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", user.id)
      } else {
        await admin.from("user_access").insert({
          user_id: user.id,
          access_source: "registered",
          subscription_state: "registered",
          subscription_month: 0,
          stripe_customer_id: customerId,
        })
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/settings?billing=success`,
      cancel_url: `${siteUrl}/pricing?billing=cancelled`,
      metadata: {
        userId: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan,
        },
      },
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to create checkout" },
      { status: 500 }
    )
  }
}
