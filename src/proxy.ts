import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

/**
 * Security headers applied to all responses.
 * Uses recommended security headers for Next.js apps.
 * @see https://docs.arcjet.com/nosecone/quick-start
 *
 * X-Robots-Tag (noindex …) is intentionally only emitted while the site
 * password gate is active (SITE_PASSWORD env set). Once the gate is
 * removed for public launch, the header drops away and the page becomes
 * indexable — without that, Lighthouse SEO can't clear 0.69 because the
 * is-crawlable audit fails.
 */
const baseSecurityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-XSS-Protection": "0",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://analytics.gwth.ai",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "media-src 'self' https:",
    "frame-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
} as const

const PRE_LAUNCH_NOINDEX = "noindex, nofollow, noarchive, nosnippet, noimageindex"

/** Paths that bypass the site password gate */
const PASSWORD_EXEMPT_PATHS = [
  "/",           // Home page is always public
  "/access",     // The password page itself
  "/auth",       // OAuth callback
  "/api",        // API routes
  "/redesign",   // Internal homepage redesign review (noindex, removed at promotion)
  "/redesign_v2", // E2-E palette explorer (noindex, removed at promotion)
  "/logo_picker", // Vector logo colour explorer (noindex, removed at promotion)
]

/**
 * Checks if the given pathname is exempt from the site password gate.
 * The home page "/" must be an exact match. Other exempt paths use prefix matching.
 */
function isPasswordExempt(pathname: string): boolean {
  if (pathname === "/") return true
  return PASSWORD_EXEMPT_PATHS.some(
    (path) => path !== "/" && (pathname === path || pathname.startsWith(`${path}/`))
  )
}

/**
 * Proxy: applies security headers, enforces site password gate,
 * refreshes Supabase auth sessions, and protects dashboard routes.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Site password gate: redirect to /access if no site_access cookie
  // Only applies when SITE_PASSWORD env var is set
  const sitePassword = process.env.SITE_PASSWORD
  if (sitePassword && !isPasswordExempt(pathname)) {
    const hasAccess = request.cookies.get("site_access")?.value === "granted"
    if (!hasAccess) {
      const url = request.nextUrl.clone()
      url.pathname = "/access"
      url.searchParams.set("from", pathname)
      return NextResponse.redirect(url)
    }
  }

  // Refresh auth session and handle route protection
  const response = await updateSession(request)

  // Apply security headers to the response
  for (const [key, value] of Object.entries(baseSecurityHeaders)) {
    response.headers.set(key, value)
  }
  // Only stamp noindex while the pre-launch lockdown is active.
  // ALLOW_INDEXING=1 explicitly overrides the gate (used by the
  // Lighthouse audit harness so the SEO is-crawlable check passes
  // against a production build that still has SITE_PASSWORD wired up
  // via .env.local for staging).
  const allowIndexing = process.env.ALLOW_INDEXING === "1"
  if (process.env.SITE_PASSWORD && !allowIndexing) {
    response.headers.set("X-Robots-Tag", PRE_LAUNCH_NOINDEX)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
