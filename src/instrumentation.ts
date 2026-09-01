/**
 * Next.js server-start instrumentation. `register()` runs once per server
 * boot (in both the nodejs and edge runtimes) before any request is served,
 * which makes it the right place for fail-fast environment assertions.
 */
import { assertMockUserFlagAllowed } from "@/lib/mock-user-guard"
import { assertContentGateConfigured } from "@/lib/content-mode"
import { assertSchemaMigrated } from "@/lib/schema-guard"

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
    // W25: private mode with an empty allowlist locks everyone out, including
    // the accounts the demo is walked from. Crash loudly at boot rather than
    // let an operator discover a misspelt CONTENT_ALLOWED_EMAILS by failing to
    // sign in.
    assertContentGateConfigured()
    // N7: a build that selects columns its database does not have would fail
    // on EVERY learner request (N6's edition resolution reads
    // edition_lessons). Migrations are additive and idempotent, so the safe
    // order is migrate-then-deploy; this makes the wrong order crash loudly
    // at boot instead of quietly serving a broken product.
    await assertSchemaMigrated()
  } catch (error) {
    console.error(error)
    if (process.env.NEXT_RUNTIME === "nodejs") {
      process.exit(1)
    }
    throw error
  }
}
