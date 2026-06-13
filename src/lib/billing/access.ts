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

type BetaGrantQueryableSupabase = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => PromiseLike<{
          data: BetaAccessGrantRow | null
          error: { message?: string } | null
        }>
      }
    }
  }
}

type BetaAccessWritableSupabase = {
  from: (table: string) => {
    upsert: (
      values: Record<string, unknown>,
      options?: Record<string, string>
    ) => PromiseLike<{ error: { message?: string } | null }>
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => PromiseLike<{
        error: { message?: string } | null
      }>
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

const BETA_ACCESS_GRANT_COLUMNS = [
  "email",
  "user_id",
  "subscription_month",
  "valid_until",
  "notes",
].join(",")

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

export async function getBetaAccessGrantForEmail(
  supabase: unknown,
  email: string,
  now = new Date()
): Promise<BetaAccessGrantRow | null> {
  const normalizedEmail = normalizeBetaAccessEmail(email)
  if (!normalizedEmail) return null

  const client = supabase as BetaGrantQueryableSupabase

  try {
    const { data, error } = (await client
      .from("beta_access_grants")
      .select(BETA_ACCESS_GRANT_COLUMNS)
      .eq("email", normalizedEmail)
      .maybeSingle()) as {
      data: BetaAccessGrantRow | null
      error: { message?: string } | null
    }

    if (error || !data || !isGrantActive(data, now)) return null
    return data
  } catch {
    return null
  }
}

export async function isEmailGrantedBetaAccess(
  supabase: unknown,
  email: string,
  now = new Date()
): Promise<boolean> {
  return (await getBetaAccessGrantForEmail(supabase, email, now)) !== null
}

export async function isUserGrantedBetaAccess(
  supabase: unknown,
  userId: string,
  now = new Date()
): Promise<boolean> {
  const access = await getAccessForUser(supabase, userId)
  return (
    access.source === "manual_beta" &&
    access.subscriptionMonth > 0 &&
    (access.validUntil === null || access.validUntil > now)
  )
}

export async function applyBetaAccessGrantToUser(
  supabase: unknown,
  userId: string,
  email: string,
  now = new Date()
): Promise<boolean> {
  const grant = await getBetaAccessGrantForEmail(supabase, email, now)
  if (!grant) return false

  const month = (clampCourseMonth(grant.subscription_month || 3) || 3) as
    | 1
    | 2
    | 3
  const client = supabase as BetaAccessWritableSupabase
  const { error } = await client.from("user_access").upsert(
    {
      user_id: userId,
      access_source: "manual_beta",
      subscription_state: stateForCourseMonth(month),
      subscription_month: month,
      valid_until: grant.valid_until,
      grace_period_ends: null,
      notes: grant.notes,
    },
    { onConflict: "user_id" }
  )

  if (error) return false

  await client
    .from("beta_access_grants")
    .update({ user_id: userId })
    .eq("email", normalizeBetaAccessEmail(email))

  return true
}
