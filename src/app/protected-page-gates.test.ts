/**
 * Gate-coverage scan (gwth-launch-dgc, N2 security).
 *
 * The proxy's route guard is presence-only - a forged
 * `better-auth.session_token` cookie passes it - so the security boundary is
 * a server-validated check inside each page component. This test scans the
 * source of every page under the proxy's protected and dev/review prefixes
 * and fails if one is missing its page-level gate, so a future page added
 * under these prefixes cannot ship gated by nothing but the cookie's name.
 *
 * Recognised gates (any one suffices):
 *   - requireSessionOrRedirect()           (src/lib/content-access.ts)
 *   - requireContentAccessOrRedirect()     (src/lib/content-access.ts)
 *   - requireAdminOrRedirect()             (src/lib/admin.ts)
 *   - redirect(...) as the page body       (pure redirect pages like /courses)
 */
import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { join } from "node:path"

const APP_DIR = join(process.cwd(), "src", "app")

/**
 * Route-tree directories (relative to src/app) whose pages the proxy claims
 * to protect. `/courses` and `/course` live in the (dashboard) route group;
 * the dev/review trees sit at the top level.
 */
const PROTECTED_DIRS = [
  "(dashboard)/dashboard",
  "(dashboard)/courses",
  "(dashboard)/course",
  "(dashboard)/progress",
  "(dashboard)/settings",
  "(dashboard)/profile",
  "(dashboard)/bookmarks",
  "(dashboard)/notifications",
  "(dashboard)/guide",
  "admin",
  "logo_picker",
  "redesign",
  "redesign_v2",
  "old-design",
  "score-card-variants",
]

const GATE_MARKERS = [
  "requireSessionOrRedirect()",
  "requireContentAccessOrRedirect()",
  "requireAdminOrRedirect()",
  // The course overview is a deliberate public teaser (the proxy exempts
  // /course/<slug> too): it decides teaser vs full syllabus with this
  // server-validated check instead of redirecting.
  "canViewPrivateContent()",
]

/** Recursively collects every page.tsx under a directory. */
function collectPages(dir: string): string[] {
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...collectPages(full))
    } else if (entry === "page.tsx") {
      out.push(full)
    }
  }
  return out
}

/**
 * True when the page's own source carries a recognised gate. A page whose
 * entire body is a `redirect(...)` (the /courses catalog shim) exposes no
 * content, so it also passes.
 */
function isGated(source: string): boolean {
  if (GATE_MARKERS.some((marker) => source.includes(marker))) return true
  // Pure-redirect page: imports redirect and calls it, and renders nothing.
  return source.includes("redirect(") && !source.includes("return (")
}

describe("every proxy-protected page carries a server-validated gate", () => {
  const pages = PROTECTED_DIRS.flatMap((dir) =>
    collectPages(join(APP_DIR, dir))
  )

  it("finds the protected page trees (guards the scan itself)", () => {
    // If the route trees move, this scan must move with them rather than
    // silently passing over nothing.
    expect(pages.length).toBeGreaterThanOrEqual(30)
  })

  it.each(pages.map((p) => [p.slice(APP_DIR.length + 1)] as const))(
    "%s calls a server-side session gate",
    (relative) => {
      const source = readFileSync(join(APP_DIR, relative), "utf8")
      expect(
        isGated(source),
        `${relative} is only guarded by the proxy's presence-only cookie ` +
          "check; add requireSessionOrRedirect() (or a stronger gate) as " +
          "the first await in the page component"
      ).toBe(true)
    }
  )
})
