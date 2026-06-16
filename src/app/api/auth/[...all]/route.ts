/**
 * Better Auth catch-all route handler (W11 — Phase 1).
 *
 * Mounts every Better Auth endpoint (sign-in, sign-up, OAuth callbacks, session,
 * verify-email, reset-password, …) under `/api/auth/*`. The auth instance is
 * resolved lazily via `getAuth()` so this module imports cleanly in mock mode;
 * the DB is only touched when a request actually hits one of these handlers.
 */
import { toNextJsHandler } from "better-auth/next-js"
import { getAuth } from "@/lib/better-auth"

export const { GET, POST } = toNextJsHandler(getAuth())
