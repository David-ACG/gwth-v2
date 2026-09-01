/**
 * Auth abstraction layer (W11 — Better Auth).
 *
 * The SINGLE accessor seam (D-W11-2): all components import from this file,
 * never from the auth provider directly. `getCurrentUser()` reads the Better
 * Auth session and maps it onto the app's `User` type, keeping the invite-only
 * beta access gate (returns null for users without a live manual_beta grant).
 */

import { cache } from "react"
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
 * without a live `manual_beta` grant resolves to null. Such users keep a valid
 * session but land on the invite-required FreeDashboard view; only anonymous
 * (no-cookie) traffic is bounced by the proxy guard to the bare /login.
 *
 * In mock mode (no `DATABASE_URL`) `getAuth()`/`getAccessForUser()` cannot reach
 * a backend, so this resolves to null and the dev mock path takes over via
 * `getDashboardUser()`. `getAuth()` is imported lazily so this module never
 * constructs the auth context (or touches the DB) at import time.
 *
 * Wrapped in React `cache()` so the several per-request consumers
 * (`getDashboardUser`, `resolveDataMode` via notifications/progress/score)
 * collapse to a single session validation + `getAccessForUser()` DB lookup
 * per server request instead of re-resolving 2-3x.
 */
export const getCurrentUser = cache(async function getCurrentUser(): Promise<
  User | null
> {
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
})

/**
 * Returns the email address on the current validated Better Auth session, or
 * null. Added for the W25 private content gate.
 *
 * Deliberately NOT built on `getCurrentUser()`. That accessor applies the
 * invite-only beta gate and returns null for any account without a live
 * `manual_beta` grant (see above), which is correct for deciding what a
 * STUDENT may study but wrong for deciding who may see the site at all: a
 * lapsed or mis-scoped grant row would lock the allowlisted owner out of his
 * own content mid-demo, with no env rollback. This resolves identity only.
 *
 * It is not a weaker check. `getAuth().api.getSession` validates the session
 * cookie's signature against the database, so a forged
 * `better-auth.session_token` header — which walks straight past the proxy's
 * presence-only `getSessionCookie` bounce — resolves to null here.
 *
 * Wrapped in React `cache()` so the several gated surfaces on one request
 * (page gate, layout, nav) collapse to a single session validation rather than
 * one DB round-trip each.
 */
export const getSessionEmail = cache(async function getSessionEmail(): Promise<
  string | null
> {
  // No DB configured → no real session is possible. Callers in
  // src/lib/content-access.ts touch headers() BEFORE calling this, so this
  // short-circuit can never let a gated route slip back into being static.
  if (!process.env.DATABASE_URL) return null

  const { getAuth } = await import("@/lib/better-auth")

  try {
    const session = await getAuth().api.getSession({ headers: await headers() })
    return session?.user?.email ?? null
  } catch {
    return null
  }
})

/**
 * Identity on the current validated Better Auth session (id, name, email), or
 * null. The N7 twin of `getSessionEmail()`, and deliberately NOT built on
 * `getCurrentUser()` for the same reason: that accessor applies the
 * invite-only BETA gate and returns null for any account without a live
 * `manual_beta` grant.
 *
 * That gate answers "may this person STUDY the course". It is the wrong
 * question for `/org`, where the caller is an institution's admin or tutor
 * whose authority comes from `org_membership`, not from a GWTH beta grant
 * (N7 QA round-2 defect 1: a provisioned CIPD administrator with no grant row
 * was bounced to /login instead of reaching their own admin surface).
 *
 * It is not a weaker check: `getAuth().api.getSession` validates the session
 * cookie's signature against the database, so a forged token resolves to null.
 *
 * `cache()`-wrapped so the /org layout, the page gate and the nav collapse to
 * one session validation per request.
 */
export const getSessionIdentity = cache(async function getSessionIdentity(): Promise<{
  id: string
  name: string
  email: string
} | null> {
  if (!process.env.DATABASE_URL) return null

  const { getAuth } = await import("@/lib/better-auth")

  try {
    const session = await getAuth().api.getSession({ headers: await headers() })
    const sessionUser = session?.user
    if (!sessionUser) return null
    return {
      id: sessionUser.id,
      name:
        sessionUser.name?.trim() || sessionUser.email?.split("@")[0] || "User",
      email: sessionUser.email ?? "",
    }
  } catch {
    return null
  }
})

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
  // ENABLE_DEV_MOCK_USER opts into the mock learner for visual/review work.
  // Honoured in local dev AND on the W8-beta staging review env (which runs
  // NODE_ENV=production but sets the flag so reviewers see imported content
  // unlocked); it is never set on the public/production deploy. The proxy
  // route guard is relaxed under the same flag (src/proxy.ts).
  if (process.env.ENABLE_DEV_MOCK_USER === "true") {
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
