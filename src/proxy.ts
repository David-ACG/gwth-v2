import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

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

/** Dashboard routes that require authentication (W11 route guard) */
const PROTECTED_PATHS = [
  "/dashboard",
  "/courses",
  "/course",
  "/labs",
  "/progress",
  "/settings",
  "/profile",
  "/bookmarks",
  "/notifications",
]

/**
 * Auth routes that should redirect to dashboard if already logged in.
 * `/reset-password` is here (NOT in PROTECTED_PATHS) so the emailed reset link
 * is reachable WITHOUT a session — otherwise the logged-out user is bounced to
 * /login and the reset token is dropped (#7). `/error` is likewise public (it
 * is in neither list, so guardRoute passes it straight through).
 */
const AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
]

/** Paths that never need an auth check */
const PUBLIC_ONLY_PATHS = ["/demo", "/api/health"]

/**
 * Optimistic Better Auth route guard (D-W11-7).
 *
 * Uses the OPTIMISTIC session-cookie presence check (`getSessionCookie`) — it
 * does NOT hit the DB, so it is safe in the edge/proxy hot path. The full beta
 * access verification still happens server-side in `getCurrentUser()` (the
 * single accessor seam), which returns null for ungranted users; this guard
 * only keeps anonymous traffic out of protected routes and logged-in traffic
 * off the auth pages. `/labs` stays public (matches the old middleware).
 */
function guardRoute(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  const isPublicOnly = PUBLIC_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
  if (isPublicOnly) return null

  const isProtected =
    PROTECTED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    ) && pathname !== "/labs"

  const isAuthRoute = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (!isProtected && !isAuthRoute) return null

  const hasSession = Boolean(getSessionCookie(request))

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return null
}

/**
 * Proxy: applies security headers, enforces the site password gate, and
 * protects dashboard routes via the optimistic Better Auth cookie check.
 *
 * Dev no-op for route protection (D-W11-7): in non-production the guard is
 * skipped so the :3000 dev server (which uses ENABLE_DEV_MOCK_USER and has no
 * real session cookie) is not locked out — this is why the old middleware was
 * sidelined. Security headers + the password gate still apply in dev.
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

  // Route protection — production only (dev no-op, see above).
  if (process.env.NODE_ENV === "production") {
    const guardRedirect = guardRoute(request)
    if (guardRedirect) return guardRedirect
  }

  const response = NextResponse.next({ request })

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
