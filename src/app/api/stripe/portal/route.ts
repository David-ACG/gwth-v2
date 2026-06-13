import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { ENABLE_BILLING } from "@/lib/config"
import { billingDisabledForBetaBody, getStripeClient } from "@/lib/billing/stripe"

export async function POST() {
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

    const admin = createAdminClient()
    const { data: access } = await admin
      .from("user_access")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!access?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found for this user" },
        { status: 404 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    const session = await getStripeClient().billingPortal.sessions.create({
      customer: access.stripe_customer_id,
      return_url: `${siteUrl}/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to open billing portal" },
      { status: 500 }
    )
  }
}
