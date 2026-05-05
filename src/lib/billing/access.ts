import type { SubscriptionState } from "@/lib/types"

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

type QueryableSupabase = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => PromiseLike<{
          data: UserAccessRow | null
          error: { message?: string } | null
        }>
      }
    }
  }
}

const ACCESS_COLUMNS = [
  "user_id",
  "access_source",
  "subscription_state",
  "subscription_month",
  "valid_until",
  "grace_period_ends",
  "last_payment_at",
  "stripe_customer_id",
  "stripe_subscription_id",
  "stripe_price_id",
  "stripe_subscription_status",
  "notes",
].join(",")

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

function parseDate(value: string | null): Date | null {
  return value ? new Date(value) : null
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

export async function getAccessForUser(
  supabase: unknown,
  userId: string
): Promise<UserAccess> {
  const client = supabase as QueryableSupabase

  try {
    const { data, error } = (await client
      .from("user_access")
      .select(ACCESS_COLUMNS)
      .eq("user_id", userId)
      .maybeSingle()) as {
      data: UserAccessRow | null
      error: { message?: string } | null
    }

    if (error) return REGISTERED_ACCESS
    return normaliseAccessRow(data)
  } catch {
    return REGISTERED_ACCESS
  }
}
