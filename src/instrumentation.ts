/**
 * Next.js server-start instrumentation. `register()` runs once per server
 * boot (in both the nodejs and edge runtimes) before any request is served,
 * which makes it the right place for fail-fast environment assertions.
 */
import { assertMockUserFlagAllowed } from "@/lib/mock-user-guard"

/**
 * Boot-time environment assertions. Throwing here aborts server startup, so
 * a misconfigured production deploy can never serve a single request.
 */
export async function register(): Promise<void> {
  assertMockUserFlagAllowed()
}
