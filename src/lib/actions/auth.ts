"use server"

/**
 * Server Actions for authentication (W11 — Better Auth).
 *
 * Sign-in / sign-up / social / password-reset are driven from the CLIENT via
 * `authClient` inside the form components (D-W11-10 — Better Auth's intended
 * pattern). The only flow that still needs the server is sign-out, which is
 * invoked from server-rendered nav components' onClick handlers and must clear
 * the session cookie + redirect.
 */

import { redirect } from "next/navigation"
import { headers } from "next/headers"

/**
 * Signs out the current user and redirects to the home page.
 *
 * No-op in mock mode (no DATABASE_URL): there is no Better Auth session to
 * revoke, so we just redirect home.
 */
export async function signOut(): Promise<void> {
  if (process.env.DATABASE_URL) {
    const { getAuth } = await import("@/lib/better-auth")
    try {
      await getAuth().api.signOut({ headers: await headers() })
    } catch {
      // Even if revocation fails, fall through to the redirect so the user is
      // returned to a logged-out surface.
    }
  }
  redirect("/")
}
