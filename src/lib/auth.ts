/**
 * Auth abstraction layer (W11 — Better Auth).
 *
 * The SINGLE accessor seam (D-W11-2): all components import from this file,
 * never from the auth provider directly. `getCurrentUser()` reads the Better
 * Auth session and maps it onto the app's `User` type, keeping the invite-only
 * beta access gate (returns null for users without a live manual_beta grant).
 */

import { headers } from "next/headers"
import type { User, SubscriptionState } from "@/lib/types"
import { getAccessForUser } from "@/lib/billing/access"

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
 *
 * Reads the Better Auth session (`getAuth().api.getSession`) and maps it onto
 * the app's `User` type, then applies the invite-only beta gate: a session
 * without a live `manual_beta` grant resolves to null (the route guard then
 * redirects such users to /login?error=beta_access_required).
 *
 * In mock mode (no `DATABASE_URL`) `getAuth()`/`getAccessForUser()` cannot reach
 * a backend, so this resolves to null and the dev mock path takes over via
 * `getDashboardUser()`. `getAuth()` is imported lazily so this module never
 * constructs the auth context (or touches the DB) at import time.
 */
export async function getCurrentUser(): Promise<User | null> {
  // No DB configured → no real session is possible (mock mode handles users
  // via getDashboardUser()). Avoid constructing getAuth() (which resolves the
  // DB) in that case.
  if (!process.env.DATABASE_URL) return null

  const { getAuth } = await import("@/lib/better-auth")

  let session: Awaited<
    ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>
  >
  try {
    session = await getAuth().api.getSession({ headers: await headers() })
  } catch {
    return null
  }

  const sessionUser = session?.user
  if (!sessionUser) return null

  const name =
    sessionUser.name?.trim() ||
    sessionUser.email?.split("@")[0] ||
    "User"

  const access = await getAccessForUser(sessionUser.id)
  if (access.source !== "manual_beta" || access.subscriptionMonth <= 0) {
    return null
  }

  return {
    id: sessionUser.id,
    name,
    email: sessionUser.email ?? "",
    avatarUrl: sessionUser.image ?? null,
    bio: null,
    subscriptionState: access.subscriptionState,
    subscriptionMonth: access.subscriptionMonth,
    gracePeriodEnds: access.gracePeriodEnds,
    lastPaymentDate: access.lastPaymentDate,
    createdAt: new Date(sessionUser.createdAt),
    updatedAt: new Date(sessionUser.updatedAt ?? sessionUser.createdAt),
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
 * Returns the real authenticated user. In local development,
 * ENABLE_DEV_MOCK_USER=true can opt into the mock learner for visual
 * dashboard work. The mock is off by default for beta scope enforcement.
 */
export async function getDashboardUser(): Promise<User | null> {
  const user = await getCurrentUser()
  if (user) return user
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEV_MOCK_USER === "true"
  ) {
    return MOCK_USER
  }
  return null
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
 * Checks course access with the user's grace period included.
 */
export function canUserAccessCourse(user: User): boolean {
  return canAccessCourse(user.subscriptionState) || isInGracePeriod(user)
}

/**
 * Checks month access with the user's grace period included.
 */
export function canUserAccessMonth(user: User, month: 1 | 2 | 3): boolean {
  return canAccessMonth(user.subscriptionState, month) || isInGracePeriod(user)
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
