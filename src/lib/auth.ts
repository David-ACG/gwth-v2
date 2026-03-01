/**
 * Auth abstraction layer.
 * Maps Supabase Auth to our User type. All components should import
 * from this file, never from the auth provider directly.
 */

import type { User, SubscriptionState } from "@/lib/types"
import { createClient } from "@/lib/supabase/server"

/** Mock user for development — subscription state is controlled by the dev toolbar */
const MOCK_USER: User = {
  id: "user_mock_001",
  name: "David",
  email: "david@agilecommercegroup.com",
  avatarUrl: null,
  bio: "Building with AI, one lesson at a time.",
  subscriptionState: "month3",
  subscriptionMonth: 3,
  gracePeriodEnds: null,
  lastPaymentDate: new Date("2026-02-01"),
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2026-02-15"),
}

/**
 * Returns the currently authenticated user, or null if not logged in.
 * Maps Supabase auth.getUser() to our User type.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // OAuth providers return different metadata shapes:
  // Google: full_name, avatar_url
  // GitHub: user_name or full_name, avatar_url
  // LinkedIn OIDC: full_name, picture
  // Email signup: name (set in signUp options.data)
  const meta = user.user_metadata ?? {}
  const name =
    (meta.full_name as string) ??
    (meta.name as string) ??
    (meta.user_name as string) ??
    user.email?.split("@")[0] ??
    "User"

  const avatarUrl =
    (meta.avatar_url as string) ??
    (meta.picture as string) ??
    null

  return {
    id: user.id,
    name,
    email: user.email ?? "",
    avatarUrl,
    bio: null,
    subscriptionState: "registered" as SubscriptionState,
    subscriptionMonth: 0,
    gracePeriodEnds: null,
    lastPaymentDate: null,
    createdAt: new Date(user.created_at),
    updatedAt: new Date(user.updated_at ?? user.created_at),
  }
}

/**
 * Returns the mock user for dashboard UI development.
 * Use this only in dashboard pages that need a fake logged-in state.
 */
export async function getMockUser(): Promise<User> {
  return MOCK_USER
}

/**
 * Returns the current user or throws a redirect to the login page.
 * Use in server components/actions that require authentication.
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

/**
 * Checks whether a user is currently authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Checks if a user can access a specific month's content.
 * Month 1 requires month1+ subscription, Month 2 requires month2+, etc.
 */
export function canAccessMonth(
  state: SubscriptionState,
  month: 1 | 2 | 3
): boolean {
  const monthStates: Record<number, SubscriptionState[]> = {
    1: ["month1", "month2", "month3", "ongoing"],
    2: ["month2", "month3", "ongoing"],
    3: ["month3", "ongoing"],
  }
  return monthStates[month]?.includes(state) ?? false
}

/**
 * Checks if a user can browse and access free labs.
 * Requires at least a registered (free) account.
 */
export function canAccessLabs(state: SubscriptionState): boolean {
  return state !== "visitor"
}

/**
 * Checks if a user can access premium (paid) labs.
 * Requires an active subscription (any month).
 */
export function canAccessPremiumLabs(state: SubscriptionState): boolean {
  return ["month1", "month2", "month3", "ongoing"].includes(state)
}

/**
 * Checks if a user can access the course detail and lesson content.
 * Requires at least a Month 1 subscription.
 */
export function canAccessCourse(state: SubscriptionState): boolean {
  return ["month1", "month2", "month3", "ongoing"].includes(state)
}

/**
 * Checks if a user is in the grace period after a payment failure.
 */
export function isInGracePeriod(user: User): boolean {
  if (user.subscriptionState !== "lapsed") return false
  if (!user.gracePeriodEnds) return false
  return new Date() < user.gracePeriodEnds
}

/**
 * Returns the highest accessible month number for a subscription state.
 * Returns 0 for users without course access.
 */
export function getAccessibleMonthCount(state: SubscriptionState): number {
  switch (state) {
    case "month1":
      return 1
    case "month2":
      return 2
    case "month3":
    case "ongoing":
      return 3
    default:
      return 0
  }
}
