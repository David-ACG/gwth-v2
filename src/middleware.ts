import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
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

/** Dashboard routes that require authentication */
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
 * Middleware: applies security headers to all responses and
 * protects dashboard routes from unauthenticated access.
 * Auth check is currently a passthrough — will be wired to Supabase later.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Apply security headers to all responses
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }

  // Check if the path is a protected dashboard route
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isProtected) {
    // TODO: Check auth session when backend is connected
    // const session = await getSession(request)
    // if (!session) return NextResponse.redirect(new URL("/login", request.url))
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
