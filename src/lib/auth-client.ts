/**
 * Better Auth React client (W11 — Phase 1).
 *
 * Browser-side auth client (signIn/signUp/signOut/useSession, etc.). Points at
 * the PUBLIC base URL via `NEXT_PUBLIC_BETTER_AUTH_URL` so cookies/redirects
 * resolve against the real https origin behind the Cloudflare → Traefik proxy.
 *
 * Consumed by client components in later phases (auth forms are out of scope for
 * Phase 1 — this just establishes the client).
 */
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
})
