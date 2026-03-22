import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

/**
 * Security headers applied to all responses.
 * Uses recommended security headers for Next.js apps.
 * @see https://docs.arcjet.com/nosecone/quick-start
 */
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-XSS-Protection": "0",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
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
}

/** Paths that bypass the site password gate */
const PASSWORD_EXEMPT_PATHS = [
  "/",           // Home page is always public
  "/access",     // The password page itself
  "/auth",       // OAuth callback
  "/api",        // API routes
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
 * Middleware: applies security headers, enforces site password gate,
 * refreshes Supabase auth sessions, and protects dashboard routes.
 */
export async function middleware(request: NextRequest) {
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
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
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
