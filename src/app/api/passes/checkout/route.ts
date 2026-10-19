/**
 * POST /api/passes/checkout: a one-off Stripe Checkout for a prepaid pass
 * (bead gwth-launch-v1uj.4, row 1.2).
 *
 * - Whole course (£69 in the Christmas sale, £87 from 7 January) or the first
 *   month (£29 all year), as a gift or for yourself.
 * - A gift needs no account: Stripe collects the buyer's email. Buying for
 *   yourself needs a signed-in account, so the course opens the moment the
 *   payment lands.
 * - The price is decided HERE at request time from the sale window, never by
 *   the page, so an old page cannot buy the £69 price after the sale ends.
 * - No automatic_tax: GWTH is not VAT registered (decision 8).
 * - A gift never takes the recipient's card and never renews: mode=payment.
 */
import { NextResponse } from "next/server"
import { z } from "zod"
import { ENABLE_BILLING } from "@/lib/config"
import { getSessionIdentity } from "@/lib/auth"
import { getAccessForUser } from "@/lib/billing/access"
import {
  billingDisabledForBetaBody,
  getPassPriceId,
  getStripeClient,
  siteOrigin,
} from "@/lib/billing/stripe"
import {
  getSaleWindow,
  isSalesOpen,
  passPrice,
  redeemByFrom,
  resolveDeliverAt,
} from "@/lib/billing/passes"
import type { PassCheckoutMetadata } from "@/lib/billing/pass-fulfil"

const deliverySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("christmas") }),
  z.object({ kind: z.literal("now") }),
  z.object({ kind: z.literal("date"), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
])

const checkoutSchema = z.discriminatedUnion("gift", [
  z.object({
    gift: z.literal(true),
    product: z.enum(["course", "month1"]),
    buyerName: z.string().trim().min(1).max(80),
    recipientName: z.string().trim().min(1).max(80),
    recipientEmail: z.string().trim().toLowerCase().email().max(254),
    // Stripe metadata values are capped at 500 characters.
    message: z.string().trim().max(500).optional().default(""),
    delivery: deliverySchema,
  }),
  z.object({
    gift: z.literal(false),
    product: z.enum(["course", "month1"]),
  }),
])

function refuse(code: string, error: string, status: number) {
  return NextResponse.json({ code, error }, { status })
}

export async function POST(request: Request) {
  if (!ENABLE_BILLING) {
    return NextResponse.json(billingDisabledForBetaBody(), { status: 503 })
  }

  const now = new Date()
  const window = getSaleWindow()
  if (!isSalesOpen(now, window)) {
    return refuse("not_on_sale_yet", "Gifts go on sale on 1 December.", 409)
  }

  const body = await request.json().catch(() => null)
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return refuse("invalid_request", "Please check the details and try again.", 400)
  }
  const input = parsed.data

  const identity = await getSessionIdentity()
  if (!input.gift) {
    if (!identity) {
      return refuse("login_required", "Please sign in or create an account first.", 401)
    }
    const access = await getAccessForUser(identity.id)
    if (access.subscriptionMonth > 0 && access.source !== "registered") {
      return refuse("already_has_access", "You already have the course on this account.", 409)
    }
  }

  let deliverAt: Date | null = null
  if (input.gift) {
    deliverAt = resolveDeliverAt(input.delivery, now, redeemByFrom(now))
    if (!deliverAt) {
      return refuse("invalid_delivery", "Please choose a delivery date between today and a year from now.", 400)
    }
  }

  const price = passPrice(input.product, now, window)

  try {
    const priceId = getPassPriceId(price.priceEnv)
    const site = siteOrigin()

    const metadata: PassCheckoutMetadata = input.gift
      ? {
          kind: "pass",
          product: input.product,
          gift: "1",
          buyerName: input.buyerName,
          recipientName: input.recipientName,
          recipientEmail: input.recipientEmail,
          message: input.message,
          deliverAt: deliverAt!.toISOString(),
          ...(identity ? { buyerUserId: identity.id } : {}),
        }
      : {
          kind: "pass",
          product: input.product,
          gift: "0",
          buyerUserId: identity!.id,
          buyerName: identity!.name,
        }

    // A sale-price session must not outlive the sale by much. Stripe needs at
    // least 30 minutes; otherwise sessions last 24 hours.
    const thirtyMinutes = now.getTime() + 31 * 60 * 1000
    const dayAhead = now.getTime() + 23.5 * 60 * 60 * 1000
    const expiresAtMs = price.onSale
      ? Math.max(thirtyMinutes, Math.min(dayAhead, window.saleEndsAt.getTime()))
      : dayAhead

    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      ...(identity?.email ? { customer_email: identity.email } : {}),
      customer_creation: "always",
      client_reference_id: identity?.id,
      metadata,
      payment_intent_data: {
        metadata: { kind: "pass", product: input.product, gift: metadata.gift },
        statement_descriptor_suffix: input.gift ? "GIFT" : "COURSE",
      },
      expires_at: Math.floor(expiresAtMs / 1000),
      success_url: `${site}/gift/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}${input.gift ? "/gift" : "/pricing"}?checkout=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("[passes] checkout failed", err)
    return refuse("checkout_failed", "We couldn't start the payment. Please try again.", 500)
  }
}
