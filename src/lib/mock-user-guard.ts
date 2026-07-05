/**
 * W15 fail-fast guard for the staging-only mock-user flag.
 *
 * ENABLE_DEV_MOCK_USER hands any anonymous visitor a logged-in mock learner
 * (src/lib/auth.ts getDashboardUser) and relaxes the proxy route guard
 * (src/proxy.ts). That is intentional on the W8-beta staging review env and
 * catastrophic on the public site, so the server REFUSES to boot when the
 * flag is on while BETTER_AUTH_URL points at the production host. Called from
 * src/instrumentation.ts (runs once per server start, before any request).
 */

/** The public production host. Subdomains (www.gwth.ai) are covered too. */
const PRODUCTION_HOST = "gwth.ai"

/** Values that count as "flag explicitly off" and never trip the guard. */
const DISABLED_VALUES = new Set(["", "false", "0"])

/**
 * Throws when ENABLE_DEV_MOCK_USER is enabled while BETTER_AUTH_URL resolves
 * to gwth.ai (or a subdomain). Staging (hlab.taila51191.ts.net), localhost,
 * and any other non-production host are never affected, and an unparseable or
 * missing BETTER_AUTH_URL never trips the guard (Better Auth itself fails
 * fast on a missing prod URL; see src/lib/better-auth.ts).
 *
 * The `env` parameter exists for tests; production callers use the default.
 */
export function assertMockUserFlagAllowed(
  env: Record<string, string | undefined> = process.env
): void {
  const flag = env.ENABLE_DEV_MOCK_USER
  if (flag === undefined || DISABLED_VALUES.has(flag.trim().toLowerCase())) {
    return
  }

  const baseUrl = env.BETTER_AUTH_URL
  if (!baseUrl) return

  let host: string
  try {
    host = new URL(baseUrl).hostname.toLowerCase()
  } catch {
    return
  }

  if (host === PRODUCTION_HOST || host.endsWith(`.${PRODUCTION_HOST}`)) {
    throw new Error(
      `FATAL: ENABLE_DEV_MOCK_USER is set while BETTER_AUTH_URL points at the ` +
        `production host (${host}). The flag hands every anonymous visitor a ` +
        `logged-in mock learner and disables the route guard; it is for the ` +
        `staging review env ONLY. Remove ENABLE_DEV_MOCK_USER from the ` +
        `production environment and redeploy (docs/runbook-go-live.md §2).`
    )
  }
}
