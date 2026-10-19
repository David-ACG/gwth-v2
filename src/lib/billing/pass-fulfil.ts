/**
 * Turns a paid pass checkout into a pass, and sends the pass emails
 * (beads gwth-launch-v1uj.4 and .5).
 *
 * Fulfilment runs from BOTH the Stripe webhook and the thank-you page,
 * whichever arrives first (Stripe's recommended pattern), so every step is
 * idempotent: the pass is keyed on the checkout session, the payment on its
 * payment intent, and each email is claimed before it is sent.
 */
import "server-only"
import type Stripe from "stripe"
import {
  claimPassEmail,
  createPassFromCheckout,
  getPassById,
  openPass,
  recordPayment,
  releasePassEmail,
  type PassRecord,
} from "@/lib/billing/pass-store"
import { getStripeClient } from "@/lib/billing/stripe"
import type { PassProduct } from "@/lib/billing/passes"
import { sendPlunkEmail } from "@/lib/email/plunk"
import {
  giftArrivedEmail,
  giftReceiptEmail,
  passOpenedEmail,
  selfReceiptEmail,
  type BuiltEmail,
} from "@/lib/email/pass-emails"

/** Metadata the pass checkout route puts on the session (all strings). */
export type PassCheckoutMetadata = {
  kind: "pass"
  product: PassProduct
  gift: "1" | "0"
  buyerUserId?: string
  buyerName?: string
  recipientName?: string
  recipientEmail?: string
  message?: string
  deliverAt?: string
}

function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === "string" ? value : value.id
}

export function isPassSession(session: Pick<Stripe.Checkout.Session, "metadata">): boolean {
  return session.metadata?.kind === "pass"
}

/**
 * Creates (or finds) the pass for a paid session, opens a self-purchase for
 * the signed-in buyer, records the takings and sends what is due. Returns
 * null for a session that is not a paid pass checkout.
 */
export async function fulfilPassCheckout(
  sessionOrId: string | Stripe.Checkout.Session,
  now = new Date()
): Promise<PassRecord | null> {
  const session =
    typeof sessionOrId === "string"
      ? await getStripeClient().checkout.sessions.retrieve(sessionOrId)
      : sessionOrId

  if (!isPassSession(session)) return null
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return null
  }

  const meta = (session.metadata ?? {}) as Partial<PassCheckoutMetadata>
  const product: PassProduct = meta.product === "month1" ? "month1" : "course"
  const isGift = meta.gift === "1"
  const buyerEmail = session.customer_details?.email ?? session.customer_email ?? ""
  if (!buyerEmail) throw new Error(`pass checkout ${session.id} has no buyer email`)

  const purchasedAt = new Date((session.created ?? Math.floor(now.getTime() / 1000)) * 1000)
  const deliverAt = meta.deliverAt ? new Date(meta.deliverAt) : null
  const paymentIntent = stripeId(session.payment_intent)

  const { pass } = await createPassFromCheckout({
    product,
    pricePaid: session.amount_total ?? 0,
    currency: session.currency ?? "gbp",
    buyerEmail,
    buyerName: meta.buyerName || session.customer_details?.name || null,
    buyerUserId: meta.buyerUserId || null,
    isGift,
    recipientName: meta.recipientName || null,
    recipientEmail: meta.recipientEmail || null,
    message: meta.message || null,
    deliverAt: deliverAt && !Number.isNaN(deliverAt.getTime()) ? deliverAt : purchasedAt,
    stripeCheckoutSession: session.id,
    stripePaymentIntent: paymentIntent,
    purchasedAt,
  })

  await recordPayment({
    id: paymentIntent ?? session.id,
    kind: "pass",
    amount: session.amount_total ?? 0,
    currency: session.currency ?? "gbp",
    email: pass.buyerEmail,
    userId: pass.buyerUserId,
    passId: pass.id,
    paidAt: purchasedAt,
  })

  // Buying for yourself while signed in: the course starts straight away.
  if (!pass.isGift && pass.buyerUserId && !pass.redeemedAt && !pass.refundedAt) {
    const opened = await openPass(pass.code, pass.buyerUserId, now)
    if (!opened.ok) {
      console.error(`[passes] could not open self-purchase ${pass.id} for its buyer: ${opened.reason}`)
    }
  }

  // A gift sent "straight away" goes before the receipt, so the receipt can
  // truthfully say it has been sent.
  const fresh = (await getPassById(pass.id)) ?? pass
  if (fresh.isGift && fresh.deliverAt && fresh.deliverAt <= now) {
    await deliverGift(fresh)
  }
  await sendReceipt((await getPassById(pass.id)) ?? fresh)
  return (await getPassById(pass.id)) ?? fresh
}

async function sendClaimed(
  pass: PassRecord,
  field: "receipt" | "delivered" | "opened",
  to: string,
  email: BuiltEmail
): Promise<boolean> {
  if (!(await claimPassEmail(pass.id, field))) return false
  const sent = await sendPlunkEmail({
    to,
    subject: email.subject,
    body: email.parts.html,
    text: email.parts.text,
  })
  if (!sent) {
    await releasePassEmail(pass.id, field)
    return false
  }
  return true
}

export function passForEmail(pass: PassRecord) {
  return {
    code: pass.code,
    product: pass.product,
    pricePaid: pass.pricePaid,
    buyerName: pass.buyerName,
    buyerEmail: pass.buyerEmail,
    isGift: pass.isGift,
    recipientName: pass.recipientName,
    recipientEmail: pass.recipientEmail,
    message: pass.message,
    deliverAt: pass.deliverAt,
    redeemBy: pass.redeemBy,
    redeemedAt: pass.redeemedAt,
  }
}

/** The buyer's receipt (gift or self). Sent once. */
export async function sendReceipt(pass: PassRecord): Promise<boolean> {
  if (pass.receiptSentAt || pass.refundedAt) return false
  const email = pass.isGift ? giftReceiptEmail(passForEmail(pass)) : selfReceiptEmail(passForEmail(pass))
  return sendClaimed(pass, "receipt", pass.buyerEmail, email)
}

/** The recipient's "a gift for you" email. Sent once, on or after deliver_at. */
export async function deliverGift(pass: PassRecord): Promise<boolean> {
  if (!pass.isGift || !pass.recipientEmail || pass.deliveredAt || pass.refundedAt) return false
  return sendClaimed(pass, "delivered", pass.recipientEmail, giftArrivedEmail(passForEmail(pass)))
}

/** The "your course has started" email to whoever opened a gift. Sent once. */
export async function sendOpenedEmail(
  pass: PassRecord,
  user: { email: string; name: string | null }
): Promise<boolean> {
  if (!pass.isGift || pass.openedEmailSentAt) return false
  return sendClaimed(pass, "opened", user.email, passOpenedEmail(passForEmail(pass), user.name))
}
