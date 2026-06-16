import type { SubscriptionState } from "@/lib/types"
import { eq } from "drizzle-orm"

export type AccessSource =
  | "registered"
  | "manual_beta"
  | "stripe_course"
  | "stripe_ongoing"

export type UserAccessRow = {
  user_id: string
  access_source: AccessSource
  subscription_state: Exclude<SubscriptionState, "visitor">
  subscription_month: number
  valid_until: string | null
  grace_period_ends: string | null
  last_payment_at: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  stripe_subscription_status: string | null
  notes: string | null
}

export type BetaAccessGrantRow = {
  email: string
  user_id: string | null
  subscription_month: number
  valid_until: string | null
  notes: string | null
}

export type UserAccess = {
  source: AccessSource
  subscriptionState: SubscriptionState
  subscriptionMonth: number
  validUntil: Date | null
  gracePeriodEnds: Date | null
  lastPaymentDate: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  stripeSubscriptionStatus: string | null
}

export const BETA_ACCESS_REQUIRED_MESSAGE =
  "The 23 June beta is invite-only. Join the waitlist or ask GWTH for access."

export const REGISTERED_ACCESS: UserAccess = {
  source: "registered",
  subscriptionState: "registered",
  subscriptionMonth: 0,
  validUntil: null,
  gracePeriodEnds: null,
  lastPaymentDate: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripePriceId: null,
  stripeSubscriptionStatus: null,
}

export function clampCourseMonth(month: unknown): 0 | 1 | 2 | 3 {
  const numeric = typeof month === "number" ? month : Number(month)
  if (!Number.isFinite(numeric)) return 0
  if (numeric <= 0) return 0
  if (numeric >= 3) return 3
  return Math.floor(numeric) as 1 | 2
}

export function stateForCourseMonth(month: number): SubscriptionState {
  switch (clampCourseMonth(month)) {
    case 1:
      return "month1"
    case 2:
      return "month2"
    case 3:
      return "month3"
    default:
      return "registered"
  }
}

export function calculateCourseMonthFromStart(
  startedAtUnixSeconds: number | null | undefined,
  now = new Date()
): 1 | 2 | 3 {
  if (!startedAtUnixSeconds) return 1

  const started = new Date(startedAtUnixSeconds * 1000)
  const elapsedMonths =
    (now.getUTCFullYear() - started.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - started.getUTCMonth())

  return Math.min(3, Math.max(1, elapsedMonths + 1)) as 1 | 2 | 3
}

export function normalizeBetaAccessEmail(email: string): string {
  return email.trim().toLowerCase()
}

function parseDate(value: string | null): Date | null {
  return value ? new Date(value) : null
}

function isGrantActive(
  grant: Pick<BetaAccessGrantRow, "valid_until">,
  now = new Date()
): boolean {
  const validUntil = parseDate(grant.valid_until)
  return validUntil === null || validUntil > now
}

export function normaliseAccessRow(
  row: UserAccessRow | null,
  now = new Date()
): UserAccess {
  if (!row) return REGISTERED_ACCESS

  const validUntil = parseDate(row.valid_until)
  const isExpiredManualGrant =
    row.access_source === "manual_beta" && validUntil !== null && validUntil <= now

  if (isExpiredManualGrant) {
    return REGISTERED_ACCESS
  }

  return {
    source: row.access_source,
    subscriptionState: row.subscription_state,
    subscriptionMonth: clampCourseMonth(row.subscription_month),
    validUntil,
    gracePeriodEnds: parseDate(row.grace_period_ends),
    lastPaymentDate: parseDate(row.last_payment_at),
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripePriceId: row.stripe_price_id,
    stripeSubscriptionStatus: row.stripe_subscription_status,
  }
}

/**
 * Resolves a userId's access from the `user_access` table via Drizzle.
 *
 * The supabase parameter is gone (D-W11-4b): the DB is resolved internally via
 * `getDb()`. When no DATABASE_URL is configured (mock mode) `getDb()` throws and
 * we fall back to REGISTERED_ACCESS — preserving the pre-migration behaviour
 * where a missing/erroring backend never admitted a user beyond "registered".
 */
export async function getAccessForUser(userId: string): Promise<UserAccess> {
  try {
    const { getDb } = await import("@/db")
    const { userAccess } = await import("@/db/schema")
    const db = getDb()

    const rows = await db
      .select()
      .from(userAccess)
      .where(eq(userAccess.userId, userId))
      .limit(1)

    const row = rows[0]
    if (!row) return REGISTERED_ACCESS

    return normaliseAccessRow({
      user_id: row.userId,
      access_source: row.accessSource as AccessSource,
      subscription_state: row.subscriptionState as Exclude<
        SubscriptionState,
        "visitor"
      >,
      subscription_month: row.subscriptionMonth,
      valid_until: row.validUntil,
      grace_period_ends: row.gracePeriodEnds,
      last_payment_at: row.lastPaymentAt,
      stripe_customer_id: row.stripeCustomerId,
      stripe_subscription_id: row.stripeSubscriptionId,
      stripe_price_id: row.stripePriceId,
      stripe_subscription_status: row.stripeSubscriptionStatus,
      notes: row.notes,
    })
  } catch (err) {
    // Fail CLOSED: a transient DB error must never admit a user beyond
    // "registered". But log it — silently demoting a GRANTED tester on a blip
    // is invisible otherwise (#11).
    console.error(
      "[access] getAccessForUser failed; failing closed to REGISTERED_ACCESS",
      err
    )
    return REGISTERED_ACCESS
  }
}

export async function getBetaAccessGrantForEmail(
  email: string,
  now = new Date()
): Promise<BetaAccessGrantRow | null> {
  const normalizedEmail = normalizeBetaAccessEmail(email)
  if (!normalizedEmail) return null

  try {
    const { getDb } = await import("@/db")
    const { betaAccessGrants } = await import("@/db/schema")
    const db = getDb()

    const rows = await db
      .select()
      .from(betaAccessGrants)
      .where(eq(betaAccessGrants.email, normalizedEmail))
      .limit(1)

    const row = rows[0]
    if (!row) return null

    const grant: BetaAccessGrantRow = {
      email: row.email,
      user_id: row.userId,
      subscription_month: row.subscriptionMonth,
      valid_until: row.validUntil,
      notes: row.notes,
    }

    if (!isGrantActive(grant, now)) return null
    return grant
  } catch (err) {
    // Fail closed (no grant found) but make the lookup failure observable (#11).
    console.error(
      "[access] getBetaAccessGrantForEmail failed; treating as no grant",
      err
    )
    return null
  }
}

export async function isEmailGrantedBetaAccess(
  email: string,
  now = new Date()
): Promise<boolean> {
  return (await getBetaAccessGrantForEmail(email, now)) !== null
}

export async function isUserGrantedBetaAccess(
  userId: string,
  now = new Date()
): Promise<boolean> {
  const access = await getAccessForUser(userId)
  return (
    access.source === "manual_beta" &&
    access.subscriptionMonth > 0 &&
    (access.validUntil === null || access.validUntil > now)
  )
}

export async function applyBetaAccessGrantToUser(
  userId: string,
  email: string,
  now = new Date()
): Promise<boolean> {
  const grant = await getBetaAccessGrantForEmail(email, now)
  if (!grant) return false

  const month = (clampCourseMonth(grant.subscription_month || 3) || 3) as
    | 1
    | 2
    | 3

  try {
    const { getDb } = await import("@/db")
    const { userAccess, betaAccessGrants } = await import("@/db/schema")
    const db = getDb()

    await db
      .insert(userAccess)
      .values({
        userId,
        accessSource: "manual_beta",
        subscriptionState: stateForCourseMonth(month),
        subscriptionMonth: month,
        validUntil: grant.valid_until,
        gracePeriodEnds: null,
        notes: grant.notes,
      })
      .onConflictDoUpdate({
        target: userAccess.userId,
        set: {
          accessSource: "manual_beta",
          subscriptionState: stateForCourseMonth(month),
          subscriptionMonth: month,
          validUntil: grant.valid_until,
          gracePeriodEnds: null,
          notes: grant.notes,
        },
      })

    // Link the grant to the now-known user id (best effort).
    await db
      .update(betaAccessGrants)
      .set({ userId })
      .where(eq(betaAccessGrants.email, normalizeBetaAccessEmail(email)))

    return true
  } catch (err) {
    // The grant application failed — the access gate still denies entry until a
    // grant is applied, but surface the failure so it is not silent (#11).
    console.error(
      "[access] applyBetaAccessGrantToUser failed; grant not applied",
      err
    )
    return false
  }
}
