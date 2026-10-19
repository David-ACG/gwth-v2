/**
 * Stripe webhook (rewritten for the gift sale, beads gwth-launch-v1uj.4/.9).
 *
 * The Supabase-era version stopped working when Supabase was switched off
 * (W11); this one uses Drizzle. Every handler is idempotent and the event id
 * is recorded in stripe_events first, so a replay is a no-op.
 *
 * Events to enable on the Stripe endpoint:
 *   checkout.session.completed, checkout.session.async_payment_succeeded,
 *   customer.subscription.created / updated / deleted,
 *   invoice.paid, invoice.upcoming, charge.refunded
 */
import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { ENABLE_BILLING } from "@/lib/config"
import {
  billingDisabledForBetaBody,
  getStripeClient,
} from "@/lib/billing/stripe"
import { fulfilPassCheckout, isPassSession } from "@/lib/billing/pass-fulfil"
import {
  handleInvoicePaid,
  handleInvoiceUpcoming,
  stripeId,
  upsertSubscriptionAccess,
} from "@/lib/billing/subscriptions"

async function markEventProcessed(event: Stripe.Event): Promise<boolean> {
  const { getDb } = await import("@/db")
  const { stripeEvents } = await import("@/db/schema")
  const rows = await getDb()
    .insert(stripeEvents)
    .values({ id: event.id, type: event.type })
    .onConflictDoNothing()
    .returning({ id: stripeEvents.id })
  return rows.length > 0
}

async function forgetEvent(eventId: string): Promise<void> {
  // A handler failed: let Stripe's retry run it again.
  const { getDb } = await import("@/db")
  const { stripeEvents } = await import("@/db/schema")
  const { eq } = await import("drizzle-orm")
  await getDb().delete(stripeEvents).where(eq(stripeEvents.id, eventId))
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (isPassSession(session)) {
    await fulfilPassCheckout(session)
    return
  }
  const subscriptionId = stripeId(session.subscription)
  if (!subscriptionId) return
  const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId)
  await upsertSubscriptionAccess(subscription, {
    fallbackUserId: session.metadata?.userId ?? session.client_reference_id,
  })
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntent = stripeId(charge.payment_intent)
  if (!paymentIntent) return
  const { recordRefund, markPassRefunded } = await import("@/lib/billing/pass-store")
  await recordRefund(paymentIntent, charge.amount_refunded)

  // A fully refunded pass is marked refunded (and loses any access it gave).
  if (charge.refunded) {
    const { getDb } = await import("@/db")
    const { prepaidPasses } = await import("@/db/schema")
    const { eq } = await import("drizzle-orm")
    const rows = await getDb()
      .select({ id: prepaidPasses.id })
      .from(prepaidPasses)
      .where(eq(prepaidPasses.stripePaymentIntent, paymentIntent))
      .limit(1)
    if (rows[0]) await markPassRefunded(rows[0].id)
  }
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
    event = getStripeClient().webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid Stripe webhook" },
      { status: 400 }
    )
  }

  if (!(await markEventProcessed(event))) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await upsertSubscriptionAccess(event.data.object as Stripe.Subscription)
        break
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      case "invoice.upcoming":
        await handleInvoiceUpcoming(event.data.object as Stripe.Invoice)
        break
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break
      default:
        break
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error(`[stripe] webhook ${event.type} ${event.id} failed`, err)
    await forgetEvent(event.id).catch(() => {})
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to process webhook" },
      { status: 500 }
    )
  }
}
