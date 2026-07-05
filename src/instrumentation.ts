/**
 * Next.js server-start instrumentation. `register()` runs once per server
 * boot (in both the nodejs and edge runtimes) before any request is served,
 * which makes it the right place for fail-fast environment assertions.
 */
import { assertMockUserFlagAllowed } from "@/lib/mock-user-guard"

/**
 * Boot-time environment assertions. Throwing here aborts server startup, so
 * a misconfigured production deploy can never serve a single request. In the
 * nodejs runtime we additionally hard-exit: a thrown instrumentation error
 * leaves the standalone server in a zombie "prepared: failed" state (up but
 * refusing every connection), whereas exiting lets the container crash-loop
 * loudly where operators look.
 */
export async function register(): Promise<void> {
  try {
    assertMockUserFlagAllowed()
  } catch (error) {
    console.error(error)
    if (process.env.NEXT_RUNTIME === "nodejs") {
      process.exit(1)
    }
    throw error
  }
}
