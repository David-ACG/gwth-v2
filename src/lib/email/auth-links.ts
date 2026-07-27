/**
 * Canonical public origin for links that leave the building in an email.
 *
 * Why this exists (David, 2026-07-27): he registered a test account, got the
 * real "Verify your GWTH.ai email" message from david@gwth.ai, clicked Verify
 * your email, and landed on `localhost:3000/api/auth/verify-email?token=…` —
 * ERR_CONNECTION_REFUSED. Production was innocent: gwth.ai has
 * BETTER_AUTH_URL=https://gwth.ai and always has. The signup had happened
 * against a dev server on hlab, which holds a LOCAL database but the REAL Plunk
 * key, so a real email went to a real inbox carrying a link that only resolves
 * on the machine that sent it.
 *
 * Better Auth builds the verification and reset links from its own `baseURL`,
 * which is correct for cookies, OAuth callbacks and redirects — a dev server
 * must talk to itself on localhost. It is only wrong for the one case where the
 * URL travels to another device. So the rewrite happens here, at the email
 * boundary, and nothing about the auth origin changes.
 *
 * Only the loopback family is rewritten. A LAN address (192.168.178.50:3001) or
 * a Tailscale host (hlab.taila51191.ts.net:9458) is genuinely reachable from
 * David's phone, and those instances own the token they issued, so their links
 * are left exactly as they are.
 */

/** Hosts that only ever resolve on the machine that generated the link. */
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"])

/** Last resort when nothing in the environment names a reachable origin. */
const FALLBACK_PUBLIC_BASE = "https://gwth.ai"

function parse(url: string | undefined): URL | null {
  if (!url?.trim()) return null
  try {
    return new URL(url.trim())
  } catch {
    return null
  }
}

/** True when the URL's host resolves only on the host that produced it. */
export function isLoopbackUrl(url: string): boolean {
  const parsed = parse(url)
  if (!parsed) return false
  return LOOPBACK_HOSTS.has(parsed.hostname.toLowerCase())
}

/**
 * The origin an emailed link should carry. First reachable origin wins:
 *
 * 1. `AUTH_EMAIL_BASE_URL` — the explicit override, for an instance that knows
 *    better than its own auth origin (a preview behind a tunnel, say).
 * 2. `BETTER_AUTH_URL` — right for every deployed copy, and the reason
 *    production needs no override at all.
 * 3. `NEXT_PUBLIC_SITE_URL` — the public site, when auth is only bound locally.
 * 4. `https://gwth.ai`.
 */
export function resolvePublicEmailBase(
  env: Record<string, string | undefined> = process.env,
): string {
  const candidates = [
    env.AUTH_EMAIL_BASE_URL,
    env.BETTER_AUTH_URL,
    env.NEXT_PUBLIC_SITE_URL,
  ]
  for (const candidate of candidates) {
    const parsed = parse(candidate)
    if (parsed && !LOOPBACK_HOSTS.has(parsed.hostname.toLowerCase())) {
      return parsed.origin
    }
  }
  return FALLBACK_PUBLIC_BASE
}

/**
 * Returns `url` with its origin swapped for a publicly reachable one, when — and
 * only when — the original points at loopback. Path, query and fragment are
 * preserved, so the verification token travels untouched.
 *
 * A rewritten link reaches a real page but carries a token minted against
 * whatever database the local instance was using, so it can legitimately come
 * back "invalid token". That is why the original is logged: a local signup can
 * still be completed by opening the logged URL on the box that issued it.
 */
export function toPublicEmailLink(
  url: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const parsed = parse(url)
  if (!parsed || !LOOPBACK_HOSTS.has(parsed.hostname.toLowerCase())) return url

  const base = resolvePublicEmailBase(env)
  const rewritten = new URL(
    `${parsed.pathname}${parsed.search}${parsed.hash}`,
    base,
  ).toString()

  console.warn(
    `[auth-email] rewrote a loopback link to ${base} before sending. ` +
      `This instance's auth origin is not reachable from an inbox; if the token ` +
      `was issued against a local database, finish verification here instead: ${url}`,
  )
  return rewritten
}
