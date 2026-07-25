/**
 * Private content mode (W25) — the pure, dependency-free half of the gate.
 *
 * This module is imported by the proxy (edge runtime), by boot-time
 * instrumentation, by the auth builder and by server components, so it must
 * stay free of `next/headers`, `next/navigation` and the data layer. The
 * request-scoped half lives in `src/lib/content-access.ts`.
 *
 * ## The switch fails closed by inversion
 *
 * `PRIVATE_CONTENT_MODE` is LOCKED unless it is explicitly one of the two
 * words `off` or `public`. Unset, empty, misspelt, `"off"` with quotes, `on`,
 * `yes`, `maybe` — all LOCKED. The point is that no configuration MISTAKE can
 * open the site; only a deliberate, correctly-spelt value can.
 *
 * Note what is deliberately NOT an opening value: `0` and `false`. Every other
 * flag in this codebase reads truthy-means-more (`ALLOW_INDEXING === "1"`,
 * `ENABLE_DEV_MOCK_USER === "true"`, a truthy `SITE_PASSWORD`), so a shell or
 * template default of the shape `${PRIVATE_CONTENT_MODE:-0}` is a plausible
 * accident. Under this parse that accident stays LOCKED.
 *
 * ## The allowlist admits nobody by default
 *
 * `CONTENT_ALLOWED_EMAILS` is a comma-separated, case-insensitive list, parsed
 * exactly as `ADMIN_EMAILS` is in `src/lib/admin.ts`, and falls back to
 * `ADMIN_EMAILS` when unset or empty. Both empty means an empty set, which
 * admits nobody rather than everybody. `assertContentGateConfigured()` turns
 * that state into a loud boot failure instead of a silent lockout.
 *
 * ## Launch off-switch
 *
 * Set `PRIVATE_CONTENT_MODE=off` in the Coolify env store and redeploy. That
 * restores the pre-W25 behaviour: public Labs and open signup. REMOVING the
 * variable does the opposite (it re-locks), which is the intended fail-closed
 * direction.
 */

/**
 * The only two values that open product content. Compared after trimming and
 * lowercasing, with no quote stripping: `"off"` including its quotes is a
 * configuration mistake and stays LOCKED.
 */
const OPEN_VALUES = new Set(["off", "public"])

/**
 * Whether product content (labs, lesson bodies, the dashboard) is restricted
 * to the `CONTENT_ALLOWED_EMAILS` allowlist.
 *
 * Returns `true` (LOCKED) for every value except an explicit `off`/`public`.
 * Env is re-read on every call, so the value is a RUNTIME property of the
 * process rather than something a build can bake in — the gated routes pair
 * this with `force-dynamic` so the two agree.
 */
export function isPrivateContentMode(
  env: Record<string, string | undefined> = process.env
): boolean {
  const raw = (env.PRIVATE_CONTENT_MODE ?? "").trim().toLowerCase()
  return !OPEN_VALUES.has(raw)
}

/**
 * Parses `CONTENT_ALLOWED_EMAILS` into a normalised (trimmed, lowercased) set,
 * falling back to `ADMIN_EMAILS` when it is unset or parses to nothing.
 *
 * Byte-for-byte the same split/trim/lowercase/filter chain as
 * `getAdminAllowlist()` so there is no second parse to review. Both variables
 * empty yields an empty set, which admits nobody.
 */
export function getContentAllowlist(
  env: Record<string, string | undefined> = process.env
): Set<string> {
  const parse = (raw: string | undefined): Set<string> =>
    new Set(
      (raw ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0)
    )

  const configured = parse(env.CONTENT_ALLOWED_EMAILS)
  if (configured.size > 0) return configured
  return parse(env.ADMIN_EMAILS)
}

/**
 * Whether an email address may view product content while private mode is on.
 * Null/undefined/empty is never allowed; comparison is case- and
 * whitespace-insensitive but NOT alias-aware, so `david@gwth.ai` and
 * `david@agilecommercegroup.com` are separate entries.
 */
export function isContentAllowedEmail(
  email: string | null | undefined,
  env: Record<string, string | undefined> = process.env
): boolean {
  if (!email) return false
  return getContentAllowlist(env).has(email.trim().toLowerCase())
}

/**
 * Boot-time assertion: private mode with an empty allowlist locks EVERYONE out,
 * including the accounts the demo is walked from.
 *
 * The dangerous misconfiguration is a typo in the variable NAME. A typo in
 * `PRIVATE_CONTENT_MODE` is harmless (the variable goes missing and the gate
 * stays locked), but a typo in `CONTENT_ALLOWED_EMAILS` silently produces an
 * empty allowlist, and the operator has no way to tell that from a working
 * deploy until they try to sign in. This turns it into a crash-loop at boot.
 *
 * Deliberately inert when `BETTER_AUTH_URL` is absent — the same fail-open-on-
 * unconfigured shape as `assertMockUserFlagAllowed()`. That variable is set on
 * every real deployment and on no build machine (the Dockerfile takes exactly
 * one build arg), so `next build` cannot be broken by a gate it never serves.
 */
export function assertContentGateConfigured(
  env: Record<string, string | undefined> = process.env
): void {
  if (!env.BETTER_AUTH_URL) return
  if (!isPrivateContentMode(env)) return
  if (getContentAllowlist(env).size > 0) return

  throw new Error(
    "FATAL: PRIVATE_CONTENT_MODE is on (the fail-closed default) but the " +
      "content allowlist is empty, so no account can reach labs, lesson " +
      "bodies or the dashboard. Set CONTENT_ALLOWED_EMAILS to a " +
      "comma-separated list of the addresses that may view content, or set " +
      "PRIVATE_CONTENT_MODE=off to open the site. Check the spelling of the " +
      "variable NAME first: a misspelt CONTENT_ALLOWED_EMAILS falls back to " +
      "ADMIN_EMAILS, which is unset in production " +
      "(docs/runbook-go-live.md §2)."
  )
}
