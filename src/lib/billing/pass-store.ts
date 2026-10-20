/**
 * Prepaid passes: the database half (bead gwth-launch-v1uj.4).
 *
 * Creates a pass when a Stripe one-off checkout completes, opens it for a
 * signed-in account, and lists or changes passes for the admin. The pure date
 * and price rules live in passes.ts; access is computed on read in access.ts.
 *
 * Opening a pass is the beta-invite path with a new source: it writes
 * user_access.access_source = 'prepaid' with prepaid_pass_id set, so
 * getCurrentUser admits the learner exactly as it admits a beta grant.
 */
import "server-only"
import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm"
import {
  generatePassCode,
  PASS_MONTHS,
  passTimeline,
  redeemByFrom,
  type MonthRelease,
  type PassProduct,
} from "@/lib/billing/passes"
import {
  getAccessForUser,
  getMonthRelease,
  normalizeBetaAccessEmail,
} from "@/lib/billing/access"
import type { prepaidPasses as prepaidPassesTable } from "@/db/schema"

async function db() {
  const { getDb } = await import("@/db")
  return getDb()
}

async function schema() {
  return import("@/db/schema")
}

export type PassRecord = {
  id: string
  code: string
  product: PassProduct
  months: number
  pricePaid: number
  currency: string
  buyerEmail: string
  buyerName: string | null
  buyerUserId: string | null
  isGift: boolean
  recipientName: string | null
  recipientEmail: string | null
  message: string | null
  deliverAt: Date | null
  deliveredAt: Date | null
  receiptSentAt: Date | null
  openedEmailSentAt: Date | null
  /** 027: the buyer's "your gift has been sent" email went at this time. */
  buyerNotifiedAt: Date | null
  redeemBy: Date
  redeemedBy: string | null
  redeemedAt: Date | null
  extraMonths: number
  stripeCheckoutSession: string | null
  stripePaymentIntent: string | null
  refundedAt: Date | null
  createdAt: Date
}

type PassRow = typeof prepaidPassesTable.$inferSelect

const date = (v: string | null) => (v ? new Date(v) : null)

function toRecord(row: PassRow): PassRecord {
  return {
    id: row.id,
    code: row.code,
    product: row.product as PassProduct,
    months: row.months,
    pricePaid: row.pricePaid,
    currency: row.currency,
    buyerEmail: row.buyerEmail,
    buyerName: row.buyerName,
    buyerUserId: row.buyerUserId,
    isGift: row.isGift,
    recipientName: row.recipientName,
    recipientEmail: row.recipientEmail,
    message: row.message,
    deliverAt: date(row.deliverAt),
    deliveredAt: date(row.deliveredAt),
    receiptSentAt: date(row.receiptSentAt),
    openedEmailSentAt: date(row.openedEmailSentAt),
    buyerNotifiedAt: date(row.buyerNotifiedAt),
    redeemBy: new Date(row.redeemBy),
    redeemedBy: row.redeemedBy,
    redeemedAt: date(row.redeemedAt),
    extraMonths: row.extraMonths,
    stripeCheckoutSession: row.stripeCheckoutSession,
    stripePaymentIntent: row.stripePaymentIntent,
    refundedAt: date(row.refundedAt),
    createdAt: new Date(row.createdAt),
  }
}

// ---------------------------------------------------------------------------
// Create (webhook)
// ---------------------------------------------------------------------------

export type NewPassInput = {
  product: PassProduct
  pricePaid: number
  currency: string
  buyerEmail: string
  buyerName: string | null
  buyerUserId: string | null
  isGift: boolean
  recipientName: string | null
  recipientEmail: string | null
  message: string | null
  deliverAt: Date | null
  stripeCheckoutSession: string
  stripePaymentIntent: string | null
  purchasedAt: Date
}

/**
 * Creates the pass for a completed checkout. Idempotent on the checkout
 * session: a replayed webhook returns the pass that already exists.
 */
export async function createPassFromCheckout(
  input: NewPassInput
): Promise<{ pass: PassRecord; created: boolean }> {
  const { prepaidPasses } = await schema()
  const d = await db()

  const existing = await d
    .select()
    .from(prepaidPasses)
    .where(eq(prepaidPasses.stripeCheckoutSession, input.stripeCheckoutSession))
    .limit(1)
  if (existing[0]) return { pass: toRecord(existing[0]), created: false }

  // A code collision is astronomically unlikely, but retry rather than fail.
  for (let attempt = 0; attempt < 5; attempt++) {
    const rows = await d
      .insert(prepaidPasses)
      .values({
        code: generatePassCode(),
        product: input.product,
        months: PASS_MONTHS[input.product],
        pricePaid: input.pricePaid,
        currency: input.currency,
        buyerEmail: normalizeBetaAccessEmail(input.buyerEmail),
        buyerName: input.buyerName,
        buyerUserId: input.buyerUserId,
        isGift: input.isGift,
        recipientName: input.isGift ? input.recipientName : null,
        recipientEmail:
          input.isGift && input.recipientEmail
            ? normalizeBetaAccessEmail(input.recipientEmail)
            : null,
        message: input.isGift ? input.message : null,
        deliverAt: input.isGift ? (input.deliverAt ?? input.purchasedAt).toISOString() : null,
        redeemBy: redeemByFrom(input.purchasedAt).toISOString(),
        stripeCheckoutSession: input.stripeCheckoutSession,
        stripePaymentIntent: input.stripePaymentIntent,
      })
      .onConflictDoNothing()
      .returning()
    if (rows[0]) return { pass: toRecord(rows[0]), created: true }

    // Either the code collided or a concurrent replay inserted the session.
    const again = await d
      .select()
      .from(prepaidPasses)
      .where(eq(prepaidPasses.stripeCheckoutSession, input.stripeCheckoutSession))
      .limit(1)
    if (again[0]) return { pass: toRecord(again[0]), created: false }
  }
  throw new Error("could not allocate a unique pass code")
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getPassByCode(code: string): Promise<PassRecord | null> {
  const { prepaidPasses } = await schema()
  const rows = await (await db())
    .select()
    .from(prepaidPasses)
    .where(eq(prepaidPasses.code, code))
    .limit(1)
  return rows[0] ? toRecord(rows[0]) : null
}

export async function getPassById(id: string): Promise<PassRecord | null> {
  const { prepaidPasses } = await schema()
  const rows = await (await db())
    .select()
    .from(prepaidPasses)
    .where(eq(prepaidPasses.id, id))
    .limit(1)
  return rows[0] ? toRecord(rows[0]) : null
}

export async function getPassByCheckoutSession(sessionId: string): Promise<PassRecord | null> {
  const { prepaidPasses } = await schema()
  const rows = await (await db())
    .select()
    .from(prepaidPasses)
    .where(eq(prepaidPasses.stripeCheckoutSession, sessionId))
    .limit(1)
  return rows[0] ? toRecord(rows[0]) : null
}

export async function listPasses(limit = 500): Promise<PassRecord[]> {
  const { prepaidPasses } = await schema()
  const rows = await (await db())
    .select()
    .from(prepaidPasses)
    .orderBy(desc(prepaidPasses.createdAt))
    .limit(limit)
  return rows.map(toRecord)
}

/** Gifts whose email is due: delivery time reached, not sent, not refunded. */
export async function listDueGifts(now: Date): Promise<PassRecord[]> {
  const { prepaidPasses } = await schema()
  const rows = await (await db())
    .select()
    .from(prepaidPasses)
    .where(
      and(
        eq(prepaidPasses.isGift, true),
        isNull(prepaidPasses.deliveredAt),
        isNull(prepaidPasses.refundedAt),
        lte(prepaidPasses.deliverAt, now.toISOString())
      )
    )
    .limit(200)
  return rows.map(toRecord)
}

/**
 * Passes whose buyer receipt never went (the webhook send failed), created
 * before `createdBefore` so the cron does not race a webhook still running.
 */
export async function listUnsentReceipts(createdBefore: Date): Promise<PassRecord[]> {
  const { prepaidPasses } = await schema()
  const rows = await (await db())
    .select()
    .from(prepaidPasses)
    .where(
      and(
        isNull(prepaidPasses.receiptSentAt),
        isNull(prepaidPasses.refundedAt),
        lte(prepaidPasses.createdAt, createdBefore.toISOString())
      )
    )
    .limit(200)
  return rows.map(toRecord)
}

const EMAIL_FIELD = {
  receipt: "receipt_sent_at",
  delivered: "delivered_at",
  opened: "opened_email_sent_at",
  buyerNotified: "buyer_notified_at",
} as const

/**
 * Claims an email before sending it: sets its sent mark only if it is still
 * unset, so the webhook, the thank-you page and the cron can never send the
 * same email twice. Returns false when someone else already claimed it.
 */
export async function claimPassEmail(
  id: string,
  field: keyof typeof EMAIL_FIELD,
  at = new Date()
): Promise<boolean> {
  const column = sql.identifier(EMAIL_FIELD[field])
  const rows = await (await db()).execute(
    sql`update prepaid_passes set ${column} = ${at.toISOString()} where id = ${id} and ${column} is null returning id`
  )
  return rows.length > 0
}

/** Gives a claim back after a failed send, so the cron tries again. */
export async function releasePassEmail(id: string, field: keyof typeof EMAIL_FIELD): Promise<void> {
  const column = sql.identifier(EMAIL_FIELD[field])
  await (await db()).execute(sql`update prepaid_passes set ${column} = null where id = ${id}`)
}

// ---------------------------------------------------------------------------
// Open
// ---------------------------------------------------------------------------

export type OpenPassResult =
  | { ok: true; pass: PassRecord; alreadyYours: boolean }
  | {
      ok: false
      reason:
        | "not_found"
        | "refunded"
        | "expired"
        | "opened_by_someone_else"
        | "already_has_access"
    }

/** Whether a pass can still be opened at `now` (ignores who is opening it). */
export function passOpenability(
  pass: PassRecord,
  now: Date
): "ok" | "refunded" | "expired" | "opened" {
  if (pass.refundedAt) return "refunded"
  if (pass.redeemedAt) return "opened"
  if (now >= pass.redeemBy) return "expired"
  return "ok"
}

function accessValidUntil(pass: PassRecord, release: MonthRelease, openedAt: Date): string | null {
  const t = passTimeline({
    product: pass.product,
    openedAt,
    release,
    extraMonths: pass.extraMonths,
  })
  return t.endsAt ? t.endsAt.toISOString() : null
}

/**
 * Opens a pass for a signed-in account: the clock starts now. Refuses a pass
 * that is refunded, past its open-by date or already opened by someone else,
 * and refuses an account that already has course access (a second pass is
 * kept for later or for someone else; stacking passes is Phase 2).
 */
export async function openPass(
  code: string,
  userId: string,
  now = new Date()
): Promise<OpenPassResult> {
  const pass = await getPassByCode(code)
  if (!pass) return { ok: false, reason: "not_found" }

  const state = passOpenability(pass, now)
  if (state === "refunded") return { ok: false, reason: "refunded" }
  if (state === "opened") {
    return pass.redeemedBy === userId
      ? { ok: true, pass, alreadyYours: true }
      : { ok: false, reason: "opened_by_someone_else" }
  }
  if (state === "expired") return { ok: false, reason: "expired" }

  const current = await getAccessForUser(userId)
  if (current.subscriptionMonth > 0 && current.source !== "registered") {
    return { ok: false, reason: "already_has_access" }
  }

  const { prepaidPasses, userAccess } = await schema()
  const release = await getMonthRelease()
  const d = await db()

  const opened = await d.transaction(async (tx) => {
    // The guard is in the WHERE: two people racing for one code cannot both win.
    const claimed = await tx
      .update(prepaidPasses)
      .set({ redeemedBy: userId, redeemedAt: now.toISOString() })
      .where(
        and(
          eq(prepaidPasses.id, pass.id),
          isNull(prepaidPasses.redeemedAt),
          isNull(prepaidPasses.refundedAt)
        )
      )
      .returning()
    if (!claimed[0]) return null

    const access = {
      accessSource: "prepaid",
      subscriptionState: "month1",
      subscriptionMonth: 1,
      validUntil: accessValidUntil(pass, release, now),
      gracePeriodEnds: null,
      prepaidPassId: pass.id,
      notes: pass.isGift ? "Opened a gift pass" : "Bought a pass",
    }
    await tx
      .insert(userAccess)
      .values({ userId, ...access })
      .onConflictDoUpdate({ target: userAccess.userId, set: access })
    return toRecord(claimed[0])
  })

  if (!opened) {
    const fresh = await getPassByCode(code)
    return fresh?.redeemedBy === userId
      ? { ok: true, pass: fresh, alreadyYours: true }
      : { ok: false, reason: "opened_by_someone_else" }
  }
  return { ok: true, pass: opened, alreadyYours: false }
}

// ---------------------------------------------------------------------------
// Admin changes
// ---------------------------------------------------------------------------

/** Marks a pass refunded and, if it was opened, takes the access away. */
export async function markPassRefunded(id: string, at = new Date()): Promise<PassRecord | null> {
  const { prepaidPasses, userAccess } = await schema()
  const d = await db()
  const rows = await d
    .update(prepaidPasses)
    .set({ refundedAt: at.toISOString() })
    .where(and(eq(prepaidPasses.id, id), isNull(prepaidPasses.refundedAt)))
    .returning()
  const row = rows[0]
  if (!row) return getPassById(id)
  if (row.redeemedBy) {
    await d
      .update(userAccess)
      .set({
        accessSource: "registered",
        subscriptionState: "registered",
        subscriptionMonth: 0,
        validUntil: null,
        prepaidPassId: null,
        notes: "Pass refunded",
      })
      .where(and(eq(userAccess.userId, row.redeemedBy), eq(userAccess.prepaidPassId, id)))
  }
  return toRecord(row)
}

/**
 * Admin "extend". An unopened pass gets three more months to be opened; an
 * opened pass gets one more month of access at the end.
 */
export async function extendPass(id: string): Promise<PassRecord | null> {
  const { prepaidPasses } = await schema()
  const pass = await getPassById(id)
  if (!pass) return null
  const d = await db()
  if (!pass.redeemedAt) {
    await d
      .update(prepaidPasses)
      .set({ redeemBy: sql`${prepaidPasses.redeemBy} + interval '3 months'` })
      .where(eq(prepaidPasses.id, id))
  } else {
    await d
      .update(prepaidPasses)
      .set({ extraMonths: sql`least(${prepaidPasses.extraMonths} + 1, 12)` })
      .where(eq(prepaidPasses.id, id))
  }
  await refreshPassValidUntil()
  return getPassById(id)
}

/** Resend: clears the sent mark so the next cron run sends the gift email again. */
export async function queueGiftResend(id: string, now = new Date()): Promise<PassRecord | null> {
  const { prepaidPasses } = await schema()
  await (await db())
    .update(prepaidPasses)
    .set({ deliveredAt: null, deliverAt: now.toISOString() })
    .where(and(eq(prepaidPasses.id, id), eq(prepaidPasses.isGift, true), isNull(prepaidPasses.refundedAt)))
  return getPassById(id)
}

/** Sets (or clears) a month's open date, then refreshes every pass's end date. */
export async function setMonthOpensAt(
  month: 2 | 3,
  opensAt: Date | null,
  updatedBy: string
): Promise<void> {
  const { courseMonthRelease } = await schema()
  await (await db())
    .insert(courseMonthRelease)
    .values({ month, opensAt: opensAt?.toISOString() ?? null, updatedBy })
    .onConflictDoUpdate({
      target: courseMonthRelease.month,
      set: {
        opensAt: opensAt?.toISOString() ?? null,
        updatedBy,
        updatedAt: new Date().toISOString(),
      },
    })
  await refreshPassValidUntil()
}

/**
 * valid_until is stored for the admin and emails but access is computed on
 * read; this keeps the stored copy honest after a release date changes.
 */
export async function refreshPassValidUntil(): Promise<number> {
  const { prepaidPasses, userAccess } = await schema()
  const d = await db()
  const release = await getMonthRelease()
  const rows = await d
    .select({ access: userAccess, pass: prepaidPasses })
    .from(userAccess)
    .innerJoin(prepaidPasses, eq(userAccess.prepaidPassId, prepaidPasses.id))
    .where(eq(userAccess.accessSource, "prepaid"))
  let changed = 0
  for (const { access, pass } of rows) {
    const record = toRecord(pass)
    if (!record.redeemedAt) continue
    const next = accessValidUntil(record, release, record.redeemedAt)
    const prev = access.validUntil ? new Date(access.validUntil).toISOString() : null
    if (next !== prev) {
      await d.update(userAccess).set({ validUntil: next }).where(eq(userAccess.userId, access.userId))
      changed++
    }
  }
  return changed
}

// ---------------------------------------------------------------------------
// Takings ledger (VAT threshold watch, decision 8)
// ---------------------------------------------------------------------------

export async function recordPayment(input: {
  id: string
  kind: "pass" | "subscription"
  amount: number
  currency: string
  email: string | null
  userId: string | null
  passId: string | null
  paidAt: Date
}): Promise<void> {
  const { stripePayments } = await schema()
  await (await db())
    .insert(stripePayments)
    .values({
      id: input.id,
      kind: input.kind,
      amount: input.amount,
      currency: input.currency,
      email: input.email,
      userId: input.userId,
      passId: input.passId,
      paidAt: input.paidAt.toISOString(),
    })
    .onConflictDoNothing()
}

export async function recordRefund(paymentId: string, refundedAmount: number): Promise<void> {
  const { stripePayments } = await schema()
  await (await db())
    .update(stripePayments)
    .set({ refundedAmount })
    .where(eq(stripePayments.id, paymentId))
}

/** Net takings in pence over the last 12 months (refunds taken off). */
export async function rollingTwelveMonthTakings(now = new Date()): Promise<number> {
  const { stripePayments } = await schema()
  const since = new Date(now)
  since.setUTCFullYear(since.getUTCFullYear() - 1)
  const rows = await (await db())
    .select({
      total: sql<string>`coalesce(sum(${stripePayments.amount} - ${stripePayments.refundedAmount}), 0)`,
    })
    .from(stripePayments)
    .where(gte(stripePayments.paidAt, since.toISOString()))
  return Number(rows[0]?.total ?? 0)
}
