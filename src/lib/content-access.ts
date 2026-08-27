/**
 * Private content gate (W25) — the request-scoped half, and the real security
 * boundary.
 *
 * The proxy's cookie bounce (`guardPrivateContentRoute` in src/proxy.ts) is an
 * OPTIMISATION, not a boundary: better-auth's `getSessionCookie` is
 * presence-only (node_modules/better-auth/dist/cookies/index.mjs), so
 * `curl -H 'Cookie: better-auth.session_token=anything'` walks straight past
 * it. Everything that must actually be private calls
 * `requireContentAccessOrRedirect()` here, which validates the session
 * server-side.
 *
 * ## Two properties this file exists to guarantee
 *
 * 1. **It runs per request, never at build time.** Both exported functions
 *    `await headers()` FIRST, unconditionally, before any other read and
 *    before any early return. That is a dynamic API, so a route calling either
 *    one cannot be statically prerendered. Without it the gate's verdict
 *    freezes at whatever env the BUILD machine had: `PRIVATE_CONTENT_MODE=off`
 *    at runtime could not reopen a page built locked, and — the dangerous
 *    direction — a build that saw an open value would serve the full page
 *    forever no matter what the runtime env said. The gated routes also carry
 *    `export const dynamic = "force-dynamic"` and `revalidate = 0`; the
 *    unconditional `headers()` call is the belt to that pair of braces, and
 *    the reason /labs is absent from `.next/prerender-manifest.json`.
 *    `src/app/robots.ts` records the same lesson from ALLOW_INDEXING.
 *
 * 2. **Identity does not depend on a live beta grant.** The email comes from
 *    `getSessionEmail()`, not `getCurrentUser()`. `getCurrentUser()` returns
 *    null for any account without a live `manual_beta` grant
 *    (src/lib/auth.ts), so keying the gate on it would lock an allowlisted
 *    account out the moment its grant lapsed. The session cookie is still
 *    validated against the database, so this is a narrower check, not a weaker
 *    one.
 *
 * Placement matters as much as the check: App Router renders a page IN
 * PARALLEL with its layout, so a layout-only gate still streams the page's RSC
 * payload to an anonymous curl (the same reasoning already written into
 * `src/lib/admin.ts`). Call this as the FIRST await in the page component,
 * before any data read.
 */

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getSessionEmail } from "@/lib/auth"
import { isContentAllowedEmail, isPrivateContentMode } from "@/lib/content-mode"

export {
  getContentAllowlist,
  isContentAllowedEmail,
  isPrivateContentMode,
} from "@/lib/content-mode"

/**
 * Whether the caller may view product content.
 *
 * Use for pages that must stay reachable but show less to a caller without
 * access — the course overview renders its public teaser this way. Pages that
 * should not render at all use `requireContentAccessOrRedirect()`.
 *
 * @returns true when private mode is off, or when the validated session's
 *   email is on the content allowlist.
 */
export async function canViewPrivateContent(): Promise<boolean> {
  // FIRST, and unconditionally: opts the caller out of static prerendering
  // before any branch can short-circuit. See the note at the top of the file.
  await headers()

  if (!isPrivateContentMode()) return true

  const email = await getSessionEmail()
  return isContentAllowedEmail(email)
}

/**
 * Page-level content gate. Call as the FIRST await in the page component.
 *
 * Anonymous callers go to /login. A signed-in caller who is not on the
 * allowlist goes to the home page, NOT to /login: `guardRoute` in src/proxy.ts
 * treats /login as an auth path and bounces anyone holding a session cookie
 * onward to /dashboard, so sending them to /login would ricochet them into a
 * loop between the two.
 */
export async function requireContentAccessOrRedirect(): Promise<void> {
  // FIRST, and unconditionally — see canViewPrivateContent().
  await headers()

  if (!isPrivateContentMode()) return

  const email = await getSessionEmail()
  if (!email) redirect("/login")
  if (!isContentAllowedEmail(email)) redirect("/")
}

/**
 * Page-level SESSION gate (gwth-launch-dgc, N2 security). Call as the first
 * await in any page the proxy nominally protects.
 *
 * Exists because the two gates above stop validating sessions the moment
 * `PRIVATE_CONTENT_MODE=off` (the launch state), while the proxy's
 * `getSessionCookie` bounce is presence-only forever: a forged
 * `better-auth.session_token=anything` cookie walks past it in every mode.
 * This gate is mode-independent — it validates the session against Better
 * Auth server-side (a real DB lookup via `getSessionEmail`) and bounces
 * anyone without one to /login, so account pages and dev/review mocks are
 * never reachable with a forged cookie regardless of the content-mode
 * switch.
 *
 * Unlike `requireContentAccessOrRedirect` it checks NO allowlist: any
 * validated session passes. Use both on allowlist-gated content pages; use
 * this alone on pages that just require being logged in.
 *
 * Two deliberate skips, mirroring `resolveDataMode()` in
 * src/lib/data/mode.ts:
 *  - no `DATABASE_URL`: pure local mock mode, no real session is possible;
 *  - `ENABLE_DEV_MOCK_USER=true`: the staging review env browses account
 *    pages as the mock learner without a session. The flag is never set on
 *    the public production deploy (W6/W15), so production always validates.
 */
export async function requireSessionOrRedirect(): Promise<void> {
  // FIRST, and unconditionally — see canViewPrivateContent().
  await headers()

  if (!process.env.DATABASE_URL) return
  if (process.env.ENABLE_DEV_MOCK_USER === "true") return

  const email = await getSessionEmail()
  if (!email) redirect("/login")
}
