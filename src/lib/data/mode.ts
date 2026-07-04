/**
 * Data-source mode resolution for user-scoped reads (W14).
 *
 * Decides, per request, whether a user-scoped data read should serve real
 * database-derived values, honest empty values, or the development fixtures.
 * The hard rule this encodes: fixture numbers must NEVER reach a real
 * logged-in session. Fixtures are only served when
 *
 *  - no `DATABASE_URL` is configured (pure local mock mode, W7), or
 *  - `ENABLE_DEV_MOCK_USER=true` AND there is no real session, i.e. the
 *    request is being handled for the dev/staging mock learner
 *    (`getDashboardUser()` returns `MOCK_USER` in exactly this case). The
 *    flag is never set on the public production deploy (W6/W15).
 *
 * A real authenticated session always resolves to `user` mode, even when the
 * mock-user flag is on (staging review env): the real user wins there too.
 */
import { getCurrentUser } from "@/lib/auth"

/** Which source a user-scoped data read should use for this request. */
export type DataMode =
  /** Serve the in-memory development fixtures (mock-data.ts). */
  | { kind: "mock" }
  /** Serve real rows scoped to this authenticated user id. */
  | { kind: "user"; userId: string }
  /** No session and no mock path: serve honest empty values. */
  | { kind: "anonymous" }

/**
 * Resolves the data-source mode for the current request. Server-side only
 * (reads auth cookies via `getCurrentUser()`). Never throws: an auth failure
 * resolves to `anonymous` (empty data), not to fixtures.
 */
export async function resolveDataMode(): Promise<DataMode> {
  if (!process.env.DATABASE_URL) return { kind: "mock" }

  const user = await getCurrentUser()
  if (user) return { kind: "user", userId: user.id }

  if (process.env.ENABLE_DEV_MOCK_USER === "true") return { kind: "mock" }

  return { kind: "anonymous" }
}
