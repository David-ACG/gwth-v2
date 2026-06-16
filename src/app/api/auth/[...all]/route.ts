/**
 * Better Auth catch-all route handler (W11).
 *
 * Mounts every Better Auth endpoint (sign-in, sign-up, OAuth callbacks, session,
 * verify-email, reset-password, …) under `/api/auth/*`.
 *
 * `getAuth()` is resolved INSIDE each handler (per request), never at module
 * top-level — so importing this route during `next build` page-data collection
 * does not touch `getDb()` / require `DATABASE_URL`. `getAuth()` memoises, so the
 * per-request call is a cheap singleton lookup after the first hit. The route is
 * inherently dynamic (auth cookies + DB) and runs on the Node runtime.
 */
import { toNextJsHandler } from "better-auth/next-js"
import { getAuth } from "@/lib/better-auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  return toNextJsHandler(getAuth()).GET(request)
}

export async function POST(request: Request) {
  return toNextJsHandler(getAuth()).POST(request)
}
