/**
 * Where to send someone after they sign in.
 *
 * A review link (David, beta testers) points at the page to comment on, e.g.
 * `/login?next=/course/applied-ai-skills/lesson/...`, so signing in lands on
 * that page instead of the dashboard. Only a same-site path is honoured:
 * anything that could leave the site (`//evil.example`, `/\evil.example`,
 * `https://...`) or loop back into the auth pages falls back to the default.
 */

/** Paths that must never be a post-login destination. */
const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"]

/**
 * Returns `value` when it is a safe same-site path, otherwise `null`.
 *
 * @param value - the raw `next` search param (any type, it is untrusted).
 */
export function safeNextPath(value: unknown): string | null {
  if (typeof value !== "string") return null
  if (value.length === 0 || value.length > 2048) return null
  // One leading slash, then not a second slash or backslash (protocol-relative).
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\"))
    return null
  // Control characters and backslashes can be normalised into a host by browsers.
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return null
  const path = value.split(/[?#]/, 1)[0] ?? ""
  if (AUTH_PAGES.some((p) => path === p || path.startsWith(`${p}/`))) return null
  return value
}
