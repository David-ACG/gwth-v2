import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient } from "@/lib/supabase/server"
import {
  calculateCourseMonthFromStart,
  stateForCourseMonth,
} from "@/lib/billing/access"
import {
  billingDisabledForBetaBody,
  getPlanForPriceId,
  getStripeClient,
} from "@/lib/billing/stripe"
import { ENABLE_BILLING, GRACE_PERIOD_DAYS } from "@/lib/config"

type AdminClient = ReturnType<typeof createAdminClient>

function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === "string" ? value : value.id
}

async function markEventProcessed(
  supabase: AdminClient,
  event: Stripe.Event
): Promise<boolean> {
  const { error } = await supabase.from("stripe_events").insert({
    id: event.id,
    type: event.type,
  })

  return !error
}

async function findUserIdForStripeObject(
  supabase: AdminClient,
  params: { customerId: string | null; subscriptionId: string | null }
): Promise<string | null> {
  if (params.subscriptionId) {
    const { data } = await supabase
      .from("user_access")
      .select("user_id")
      .eq("stripe_subscription_id", params.subscriptionId)
      .maybeSingle()

    if (data?.user_id) return data.user_id
  }

  if (params.customerId) {
    const { data } = await supabase
      .from("user_access")
      .select("user_id")
      .eq("stripe_customer_id", params.customerId)
      .maybeSingle()

    if (data?.user_id) return data.user_id
  }

  return null
}

async function upsertSubscriptionAccess(
  supabase: AdminClient,
  subscription: Stripe.Subscription,
  fallbackUserId?: string | null,
  lastPaymentAt?: Date | null
) {
  const customerId = stripeId(subscription.customer)
  const subscriptionId = subscription.id
  const priceId = subscription.items.data[0]?.price.id ?? null
  const plan = getPlanForPriceId(priceId)
  const isActive = ["active", "trialing"].includes(subscription.status)
  const isCourse = plan === "course"
  const courseMonth = isCourse
    ? calculateCourseMonthFromStart(subscription.start_date)
    : 3
  const userId =
    subscription.metadata.userId ??
    fallbackUserId ??
    (await findUserIdForStripeObject(supabase, { customerId, subscriptionId }))

  if (!userId) return

  const subscriptionState = isActive
    ? plan === "stay-current"
      ? "ongoing"
      : stateForCourseMonth(courseMonth)
    : "lapsed"

  const gracePeriodEnds = isActive
    ? null
    : new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString()

  await supabase.from("user_access").upsert(
    {
      user_id: userId,
      access_source: plan === "stay-current" ? "stripe_ongoing" : "stripe_course",
      subscription_state: subscriptionState,
      subscription_month: plan === "stay-current" ? 3 : courseMonth,
      grace_period_ends: gracePeriodEnds,
      last_payment_at: lastPaymentAt?.toISOString() ?? null,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      stripe_subscription_status: subscription.status,
    },
    { onConflict: "user_id" }
  )
}

async function handleCheckoutCompleted(
  supabase: AdminClient,
  session: Stripe.Checkout.Session
) {
  const subscriptionId = stripeId(session.subscription)
  if (!subscriptionId) return

  const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId)
  await upsertSubscriptionAccess(
    supabase,
    subscription,
    session.metadata?.userId ?? session.client_reference_id
  )
}

async function handleInvoicePaid(supabase: AdminClient, invoice: Stripe.Invoice) {
  const invoiceLike = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null
    parent?: { subscription_details?: { subscription?: string | null } }
  }
  const subscriptionId =
    stripeId(invoiceLike.subscription ?? null) ??
    invoiceLike.parent?.subscription_details?.subscription ??
    null

  if (!subscriptionId) return

  const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId)
  await upsertSubscriptionAccess(
    supabase,
    subscription,
    null,
    new Date(invoice.created * 1000)
  )
}

export async function POST(request: Request) {
  if (!ENABLE_BILLING) {
    return NextResponse.json(billingDisabledForBetaBody(), { status: 503 })
  }

  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const payload = await request.text()
    event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid Stripe webhook" },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const shouldProcess = await markEventProcessed(supabase, event)
  if (!shouldProcess) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          supabase,
          event.data.object as Stripe.Checkout.Session
        )
        break
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await upsertSubscriptionAccess(
          supabase,
          event.data.object as Stripe.Subscription
        )
        break
      case "invoice.paid":
        await handleInvoicePaid(supabase, event.data.object as Stripe.Invoice)
        break
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to process webhook" },
      { status: 500 }
    )
  }
}
