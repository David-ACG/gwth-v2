/**
 * Which deployment this server is: the public site, the hlab preview, or a
 * developer's machine. Read from the Better Auth base URL, which every
 * environment already sets to its own public origin.
 *
 * Used to stamp page comments (src/lib/comments/types.ts) so the triage
 * script can tell a comment made on the preview from one made on gwth.ai.
 */
import type { SiteKind } from "@/lib/comments/types"

const PRODUCTION_HOST = "gwth.ai"
const PREVIEW_HOST_MARKER = "taila51191.ts.net"

/**
 * Returns "production" when the base URL host is gwth.ai or a subdomain,
 * "preview" when it is on the hlab tailnet, and "local" otherwise (including
 * a missing or unparseable URL).
 *
 * The `env` parameter exists for tests; production callers use the default.
 */
export function getSiteKind(
  env: Record<string, string | undefined> = process.env
): SiteKind {
  const baseUrl = env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BETTER_AUTH_URL
  if (!baseUrl) return "local"

  let host: string
  try {
    host = new URL(baseUrl).hostname.toLowerCase()
  } catch {
    return "local"
  }

  if (host === PRODUCTION_HOST || host.endsWith(`.${PRODUCTION_HOST}`)) {
    return "production"
  }
  if (host.includes(PREVIEW_HOST_MARKER)) return "preview"
  return "local"
}
