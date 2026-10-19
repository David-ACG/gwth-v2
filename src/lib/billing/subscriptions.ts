/**
 * Monthly subscriptions on Drizzle (bead gwth-launch-v1uj.9, row 1.12).
 *
 * Replaces the Supabase-era webhook helpers, which stopped working when
 * Supabase was switched off (W11). The rules:
 *
 * - A payer's course month is the number of course payments made (capped at
 *   3), not calendar months since they started, so a held month never costs
 *   them a month. Phase 2's carry-on after a first-month gift starts the
 *   count at Month 2 through subscription metadata start_month=2.
 * - After the third course payment the subscription moves to the £7.50
 *   "stay current" price from the next renewal (proration none), so Month 3
 *   is still the £29 month and nothing is charged twice.
 * - Hold the clock for payers (decision 5): while the month a payer would pay
 *   for next is not open, their next charge is pushed back by extending the
 *   subscription's trial_end, a week at a time, or to the open date once it
 *   is known. Stripe shows them as 'trialing' meanwhile and access.ts shows
 *   the "on hold" notice.
 * - DMCC readiness: a reminder email before each renewal charge, with online
 *   cancellation from settings (the Stripe Customer Portal).
 */
import "server-only"
import type Stripe from "stripe"
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm"
import { GRACE_PERIOD_DAYS } from "@/lib/config"
import {
  clampCourseMonth,
  getMonthRelease,
  stateForCourseMonth,
} from "@/lib/billing/access"
import type { MonthRelease } from "@/lib/billing/passes"
import { getPlanForPriceId, getStripeClient } from "@/lib/billing/stripe"
import { recordPayment } from "@/lib/billing/pass-store"
import { sendPlunkEmail } from "@/lib/email/plunk"
import { renewalReminderEmail } from "@/lib/email/pass-emails"

const DAY = 24 * 60 * 60 * 1000

async function db() {
  const { getDb } = await import("@/db")
  return getDb()
}

export function stripeId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === "string" ? value : value.id
}

export function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const like = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null
    parent?: { subscription_details?: { subscription?: string | Stripe.Subscription | null } | null } | null
  }
  return (
    stripeId(like.parent?.subscription_details?.subscription ?? null) ??
    stripeId(like.subscription ?? null)
  )
}

/** Period end of a subscription's first item (API 2025+ keeps it on items). */
export function itemPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const end = subscription.items.data[0]?.current_period_end
  return end ? new Date(end * 1000) : null
}

/** When the next charge will be taken: the trial end while held, else the period end. */
export function nextChargeAt(subscription: Stripe.Subscription): Date | null {
  if (subscription.status === "trialing" && subscription.trial_end) {
    return new Date(subscription.trial_end * 1000)
  }
  return itemPeriodEnd(subscription)
}

export async function findUserIdForStripe(params: {
  customerId: string | null
  subscriptionId: string | null
}): Promise<string | null> {
  const { userAccess } = await import("@/db/schema")
  const d = await db()
  if (params.subscriptionId) {
    const rows = await d
      .select({ userId: userAccess.userId })
      .from(userAccess)
      .where(eq(userAccess.stripeSubscriptionId, params.subscriptionId))
      .limit(1)
    if (rows[0]) return rows[0].userId
  }
  if (params.customerId) {
    const rows = await d
      .select({ userId: userAccess.userId })
      .from(userAccess)
      .where(eq(userAccess.stripeCustomerId, params.customerId))
      .limit(1)
    if (rows[0]) return rows[0].userId
  }
  return null
}

/**
 * Writes the user's access from a subscription. `courseMonthsPaid`, when
 * given, is the new count of course payments (from invoice.paid).
 */
export async function upsertSubscriptionAccess(
  subscription: Stripe.Subscription,
  opts: { fallbackUserId?: string | null; lastPaymentAt?: Date | null; courseMonthsPaid?: number } = {},
  now = new Date()
): Promise<string | null> {
  const { userAccess } = await import("@/db/schema")
  const d = await db()
  const customerId = stripeId(subscription.customer)
  const priceId = subscription.items.data[0]?.price.id ?? null
  const plan = getPlanForPriceId(priceId)
  const isActive = ["active", "trialing"].includes(subscription.status)
  const userId =
    subscription.metadata?.userId ??
    opts.fallbackUserId ??
    (await findUserIdForStripe({ customerId, subscriptionId: subscription.id }))
  if (!userId) return null

  const existing = (
    await d.select().from(userAccess).where(eq(userAccess.userId, userId)).limit(1)
  )[0]

  // Never let a lapsed or cancelled subscription take away an opened pass.
  if (existing?.accessSource === "prepaid" && !isActive) return userId

  const monthsPaid = clampCourseMonth(opts.courseMonthsPaid ?? existing?.courseMonthsPaid ?? 0)

  let accessSource: "stripe_course" | "stripe_ongoing"
  let month: number
  let activeState: ReturnType<typeof stateForCourseMonth> | "ongoing"
  if (plan === "stay-current") {
    const courseEnds = Number(subscription.metadata?.gwth_course_ends ?? 0) * 1000
    const stillInMonthThree = monthsPaid >= 3 && courseEnds > now.getTime()
    accessSource = stillInMonthThree ? "stripe_course" : "stripe_ongoing"
    month = 3
    activeState = stillInMonthThree ? "month3" : "ongoing"
  } else {
    accessSource = "stripe_course"
    month = Math.max(1, monthsPaid)
    activeState = stateForCourseMonth(month)
  }

  // A failed renewal (past_due, unpaid) keeps access for the grace period.
  // A cancelled subscription simply ends. One that never got its first
  // payment (incomplete) never had access, so it stays registered.
  const neverPaid = monthsPaid === 0 && !isActive && plan === "course"
  const inGrace = ["past_due", "unpaid"].includes(subscription.status)
  const gracePeriodEnds =
    isActive || neverPaid || !inGrace
      ? null
      : (existing?.gracePeriodEnds ?? new Date(now.getTime() + GRACE_PERIOD_DAYS * DAY).toISOString())

  const values = {
    accessSource: neverPaid ? ("registered" as const) : accessSource,
    subscriptionState: neverPaid ? "registered" : isActive ? activeState : "lapsed",
    subscriptionMonth: neverPaid ? 0 : month,
    validUntil: null,
    gracePeriodEnds,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    stripeSubscriptionStatus: subscription.status,
    prepaidPassId: null,
    ...(opts.courseMonthsPaid !== undefined ? { courseMonthsPaid: monthsPaid } : {}),
    ...(opts.lastPaymentAt ? { lastPaymentAt: opts.lastPaymentAt.toISOString() } : {}),
  }

  await d
    .insert(userAccess)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: userAccess.userId, set: values })
  return userId
}

/** Count of paid, non-zero course invoices on a subscription. */
async function countPaidCourseInvoices(subscriptionId: string): Promise<number> {
  const invoices = await getStripeClient().invoices.list({
    subscription: subscriptionId,
    status: "paid",
    limit: 24,
  })
  return invoices.data.filter((inv) => (inv.amount_paid ?? 0) > 0).length
}

export async function handleInvoicePaid(invoice: Stripe.Invoice, now = new Date()): Promise<void> {
  const subscriptionId = invoiceSubscriptionId(invoice)
  if (!subscriptionId) return
  const stripe = getStripeClient()
  let subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId =
    subscription.metadata?.userId ??
    (await findUserIdForStripe({ customerId: stripeId(subscription.customer), subscriptionId }))

  if ((invoice.amount_paid ?? 0) > 0 && invoice.id) {
    await recordPayment({
      id: invoice.id,
      kind: "subscription",
      amount: invoice.amount_paid,
      currency: invoice.currency ?? "gbp",
      email: invoice.customer_email ?? null,
      userId,
      passId: null,
      paidAt: new Date((invoice.status_transitions?.paid_at ?? invoice.created) * 1000),
    })
  }

  const plan = getPlanForPriceId(subscription.items.data[0]?.price.id)
  let courseMonthsPaid: number | undefined
  if (plan === "course") {
    const startMonth = Math.min(3, Math.max(1, Number(subscription.metadata?.start_month ?? 1) || 1))
    courseMonthsPaid = Math.min(3, startMonth - 1 + (await countPaidCourseInvoices(subscriptionId)))

    // After the third course payment, the next renewal is the £7.50 price.
    const stayCurrent = process.env.STRIPE_STAY_CURRENT_PRICE_ID
    const item = subscription.items.data[0]
    if (courseMonthsPaid >= 3 && stayCurrent && item && item.price.id !== stayCurrent) {
      const courseEnds = itemPeriodEnd(subscription)
      subscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{ id: item.id, price: stayCurrent }],
        proration_behavior: "none",
        metadata: {
          ...subscription.metadata,
          gwth_course_ends: courseEnds ? String(Math.floor(courseEnds.getTime() / 1000)) : "",
        },
      })
    }
  }

  await upsertSubscriptionAccess(
    subscription,
    {
      fallbackUserId: userId,
      lastPaymentAt: new Date(invoice.created * 1000),
      ...(courseMonthsPaid !== undefined ? { courseMonthsPaid } : {}),
    },
    now
  )
}

/**
 * Hold the clock for one payer, as a pure decision. Given when the month they
 * would pay for next opens (null while unfinished), when their next charge is
 * due, and whether it is already held (Stripe 'trialing'), returns the new
 * charge time to set: "now" to take a held charge because the month has
 * opened, a date to move the charge to, or null to leave it alone.
 */
export function payerHoldTarget(input: {
  opens: Date | null
  chargeAt: Date
  held: boolean
  now: Date
}): Date | "now" | null {
  const { opens, chargeAt, held, now } = input
  if (opens && opens <= now) {
    // The month is open. A held charge is taken now; otherwise nothing to do.
    return held && chargeAt > now ? "now" : null
  }
  if (opens) {
    // A known future open date: the charge moves to that date (later, or
    // earlier than a week-at-a-time hold already set).
    const apart = Math.abs(opens.getTime() - chargeAt.getTime()) > 60_000
    return apart && (opens > chargeAt || held) ? opens : null
  }
  // Unfinished with no date yet: push the charge back a week when it is
  // close, then look again. Never re-pushed while more than 3 days away.
  return chargeAt.getTime() - now.getTime() < 3 * DAY ? new Date(now.getTime() + 7 * DAY) : null
}

function opensAtFor(month: number, release: MonthRelease): Date | null {
  if (month === 2) return release.month2
  if (month === 3) return release.month3
  return new Date(0) // Month 1 is always open
}

/**
 * Hold the clock for payers. For each course payer part-way through, if the
 * month they would pay for next is not open by their next charge, push the
 * charge back: to the open date once known, else a week at a time. When a held
 * month opens, the charge happens then. Returns how many subscriptions changed.
 */
export async function holdPayersForUnopenedMonths(now = new Date()): Promise<number> {
  const { userAccess } = await import("@/db/schema")
  const d = await db()
  const release = await getMonthRelease()
  const rows = await d
    .select()
    .from(userAccess)
    .where(
      and(
        eq(userAccess.accessSource, "stripe_course"),
        isNotNull(userAccess.stripeSubscriptionId),
        inArray(userAccess.stripeSubscriptionStatus, ["active", "trialing"]),
        sql`${userAccess.courseMonthsPaid} between 1 and 2`
      )
    )

  const stripe = getStripeClient()
  let changed = 0
  for (const row of rows) {
    try {
      const sub = await stripe.subscriptions.retrieve(row.stripeSubscriptionId!)
      if (getPlanForPriceId(sub.items.data[0]?.price.id) !== "course") continue
      if (sub.cancel_at_period_end || sub.status === "canceled") continue
      const chargeAt = nextChargeAt(sub)
      if (!chargeAt) continue
      const held = sub.status === "trialing"
      const opens = opensAtFor(row.courseMonthsPaid + 1, release)

      const target = payerHoldTarget({ opens, chargeAt, held, now })

      if (target) {
        await stripe.subscriptions.update(sub.id, {
          trial_end: target === "now" ? "now" : Math.floor(target.getTime() / 1000),
          proration_behavior: "none",
        })
        changed++
      }
    } catch (err) {
      console.error(`[subscriptions] hold check failed for ${row.userId}`, err)
    }
  }
  return changed
}

/**
 * invoice.upcoming: remind the payer before a renewal charge. Skipped while
 * the charge is going to be held (the month is not open by then), so a held
 * payer is reminded once, before the charge that really happens.
 */
export async function handleInvoiceUpcoming(invoice: Stripe.Invoice): Promise<boolean> {
  const subscriptionId = invoiceSubscriptionId(invoice)
  if (!subscriptionId || (invoice.amount_due ?? 0) <= 0) return false
  const sub = await getStripeClient().subscriptions.retrieve(subscriptionId)
  if (sub.cancel_at_period_end) return false
  const userId =
    sub.metadata?.userId ??
    (await findUserIdForStripe({ customerId: stripeId(sub.customer), subscriptionId }))
  if (!userId) return false

  const chargeOn = invoice.next_payment_attempt
    ? new Date(invoice.next_payment_attempt * 1000)
    : nextChargeAt(sub)
  if (!chargeOn) return false

  const { userAccess, user } = await import("@/db/schema")
  const d = await db()
  const row = (await d.select().from(userAccess).where(eq(userAccess.userId, userId)).limit(1))[0]
  if (!row) return false
  if (row.renewalReminderFor && new Date(row.renewalReminderFor).getTime() === chargeOn.getTime()) {
    return false
  }

  const plan = getPlanForPriceId(sub.items.data[0]?.price.id)
  let forMonth: number | "ongoing" = "ongoing"
  if (plan === "course") {
    forMonth = Math.min(3, row.courseMonthsPaid + 1)
    const opens = opensAtFor(forMonth, await getMonthRelease())
    if (!opens || opens > chargeOn) return false
  }

  const person = (await d.select().from(user).where(eq(user.id, userId)).limit(1))[0]
  if (!person?.email) return false

  const email = renewalReminderEmail({
    name: person.name,
    amountPence: invoice.amount_due,
    chargeOn,
    forMonth,
  })
  const sent = await sendPlunkEmail({
    to: person.email,
    subject: email.subject,
    body: email.parts.html,
    text: email.parts.text,
  })
  if (sent) {
    await d
      .update(userAccess)
      .set({ renewalReminderFor: chargeOn.toISOString() })
      .where(eq(userAccess.userId, userId))
  }
  return sent
}
