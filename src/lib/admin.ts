/**
 * Admin identity (W4 — David's beta admin dashboard).
 *
 * There is NO admin-role column in the schema; admin identity is an env-var
 * email allowlist checked against the authenticated Better Auth user resolved
 * through the W11 auth seam (`getCurrentUser()` in src/lib/auth.ts). This
 * module is the single place that reads the allowlist — the /admin layout
 * gate, every /api/admin/* route, and the W5 feedback inbox scope all resolve
 * admin status through here.
 *
 * Env var: `ADMIN_EMAILS` — comma-separated, case-insensitive
 * (e.g. "david@gwth.ai,david@agilecommercegroup.com"). Unset or empty means
 * NOBODY is admin (fail closed); emails are never hardcoded.
 */

import { NextResponse } from "next/server"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@/lib/types"

/**
 * Parses the ADMIN_EMAILS env var into a normalised (lowercased, trimmed)
 * set of admin email addresses. Re-read on every call so tests and the
 * long-lived dev server pick up env changes; the parse is trivially cheap.
 */
export function getAdminAllowlist(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? ""
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0)
  )
}

/**
 * Whether an email address is on the admin allowlist.
 * Null/undefined/empty email is never admin; comparison is case-insensitive.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return getAdminAllowlist().has(email.trim().toLowerCase())
}

/**
 * Resolves the current admin user, or null.
 *
 * Reuses the W11 auth seam: the user must (a) have a live Better Auth session
 * with a beta grant (getCurrentUser's contract) AND (b) be on the ADMIN_EMAILS
 * allowlist. Returns null for anonymous traffic, non-granted sessions, and
 * granted-but-not-allowlisted users alike — callers decide how to deny
 * (layout redirects, API routes return 403).
 */
export async function getAdminUser(): Promise<User | null> {
  const user = await getCurrentUser()
  if (!user || !isAdminEmail(user.email)) return null
  return user
}

/**
 * Page-level admin gate for /admin/* server components.
 *
 * The layout carries the same gate for the chrome, but App Router renders a
 * page IN PARALLEL with its layout — a layout redirect alone does not stop
 * the page's RSC payload (cohort data) from streaming to an anonymous curl.
 * Every /admin page therefore calls this FIRST, before any data read.
 * Anonymous → /login; authenticated non-admin → /dashboard.
 */
export async function requireAdminOrRedirect(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!isAdminEmail(user.email)) redirect("/dashboard")
  return user
}

/**
 * API-route admin gate — the /api/admin/* twin of the layout gate (a UI gate
 * alone is not security). Returns the admin user, or a ready-to-return 401
 * JSON response for everyone else. Denial is deliberately uniform (401, no
 * detail) so responses don't reveal whether an account exists or is granted.
 *
 * Usage:
 *   const gate = await requireAdminForApi()
 *   if (gate instanceof NextResponse) return gate
 *   const admin = gate
 */
export async function requireAdminForApi(): Promise<User | NextResponse> {
  const user = await getAdminUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return user
}
