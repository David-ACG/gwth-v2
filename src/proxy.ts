import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { isPrivateContentMode } from "@/lib/content-mode"

/**
 * Security headers applied to all responses.
 * Uses recommended security headers for Next.js apps.
 * @see https://docs.arcjet.com/nosecone/quick-start
 *
 * X-Robots-Tag (noindex …) is intentionally only emitted while a pre-launch
 * lockdown is active — the SITE_PASSWORD gate or, since W25, private content
 * mode. Once both are lifted for public launch the header drops away and the
 * page becomes indexable; without that, Lighthouse SEO can't clear 0.69
 * because the is-crawlable audit fails.
 */
/**
 * Lesson media on the staging review env is served straight from the P520
 * pipeline over plain http (legacy `http://192.168.178.50:8088/api/lessons/...`
 * URLs — see `src/lib/media/url.ts`). `media-src https:` would block it, so
 * the pipeline origin is allowed ONLY under the staging review flag
 * (`ENABLE_DEV_MOCK_USER`, never set in production). Production media rides
 * the https CDN and stays covered by `https:`.
 */
const STAGING_MEDIA_ORIGIN =
  process.env.ENABLE_DEV_MOCK_USER === "true"
    ? " http://192.168.178.50:8088"
    : ""

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
    `media-src 'self' https:${STAGING_MEDIA_ORIGIN}`,
    "frame-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
} as const

const PRE_LAUNCH_NOINDEX = "noindex, nofollow, noarchive, nosnippet, noimageindex"

/**
 * Media that a browser plays through a `<video>`/`<audio>` element and
 * therefore fetches with HTTP Range requests.
 *
 * The origin already answers those correctly — Next's static handler emits
 * `206 Partial Content` with `accept-ranges: bytes` for /explainer/explainer.mp4,
 * confirmed by curl straight at the Hetzner IP. Cloudflare is what loses it:
 * `.mp4` is one of its default-cached extensions, and once the object is in the
 * edge cache a Range request comes back `200` with the whole 5.9 MB body and no
 * `accept-ranges`. Consequence on the home-page explainer: no scrubbing, no
 * mid-video start, and Safari/iOS refuse to play the element at all.
 *
 * Marking the response `private` keeps Cloudflare from caching it (the same
 * reason the .vtt captions track, which Cloudflare does not cache, already
 * range-serves correctly on production), so the Range is proxied through to the
 * origin untouched. `private` is deliberate rather than `no-store`: the browser
 * still caches the file for an hour, so a repeat view inside the demo does not
 * re-download it.
 */
const RANGE_SERVED_MEDIA = /\.(?:mp4|m4v|mov|webm|m4a|mp3|ogg)$/i

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
 * Dashboard routes that require authentication (W11 route guard).
 * `/admin` is here for the optimistic no-cookie bounce only — the REAL admin
 * gate (session + ADMIN_EMAILS allowlist) lives in src/app/admin/layout.tsx
 * and in requireAdminForApi for /api/admin/*; per W11 there is no middleware.
 */
const PROTECTED_PATHS = [
  "/admin",
  "/dashboard",
  "/courses",
  "/course",
  "/progress",
  "/settings",
  "/profile",
  "/bookmarks",
  "/notifications",
  "/guide",
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
const PUBLIC_ONLY_PATHS = ["/api/health"]

/**
 * Internal dev/review leftovers (W15): auth-gated in EVERY production build
 * (including the ENABLE_DEV_MOCK_USER staging env) so none of them answers 200
 * to anonymous traffic on a public deploy. A logged-in session still reaches
 * them for review.
 *
 * W12 has closed, so W25 took the other option this list's original comment
 * offered and DELETED the leftovers outright rather than gating them:
 * /w12-review (+ /script, /scripts, /motion, /takes), /explainer-preview,
 * /w12-embed-demo, the unauthenticated POST /api/w12-take-review, and the
 * /demo/lesson-v1..v11 viewers (client components that shipped real lesson
 * prose into a public /_next/static chunk). Deletion is the only closure that
 * survives a forged session cookie — see guardDevReviewRoute.
 *
 * `/demo` stays listed: the route tree is gone, but keeping the prefix means a
 * future scratch page under it is gated by default rather than by memory.
 */
const DEV_REVIEW_PATHS = [
  "/demo",
  "/logo_picker",
  "/redesign",
  "/redesign_v2",
  "/old-design",
  "/score-card-variants",
]

/**
 * Product-content prefixes that are NOT already covered by PROTECTED_PATHS.
 *
 * Only /labs qualifies: every other content route (/dashboard, /course,
 * /progress, ...) is already in PROTECTED_PATHS. Labs were made deliberately
 * public in W22 (gwth-launch-bbg, "free, no account required"); W25 closes
 * them for the private pre-launch period and PRIVATE_CONTENT_MODE=off restores
 * the W22 behaviour in one env change.
 */
const PRIVATE_CONTENT_PATHS = ["/labs"]

/**
 * Bounces anonymous production traffic off the internal dev/review routes to
 * /login. Runs regardless of ENABLE_DEV_MOCK_USER (unlike guardRoute) so the
 * staging review flag can never re-expose these pages.
 */
function guardDevReviewRoute(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  const isDevReview = DEV_REVIEW_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
  if (!isDevReview) return null
  if (getSessionCookie(request)) return null

  const url = request.nextUrl.clone()
  url.pathname = "/login"
  return NextResponse.redirect(url)
}

/**
 * Bounces anonymous traffic off the product-content paths while private mode
 * is on (W25).
 *
 * This is an OPTIMISATION, not the security boundary. `getSessionCookie` only
 * checks that a cookie is PRESENT — it parses the Cookie header and returns
 * the raw token with no signature check and no database lookup
 * (node_modules/better-auth/dist/cookies/index.mjs), so
 * `curl -H 'Cookie: better-auth.session_token=forged'` passes it. The real
 * gate is `requireContentAccessOrRedirect()` running as the first await inside
 * each page component, which validates the session server-side and checks the
 * allowlist. This guard exists only to spare the anonymous case a render.
 *
 * Deliberately NOT nested inside the `NODE_ENV === "production"` block that
 * wraps the other two guards: NODE_ENV is itself an unvalidated env var, and a
 * missing or misspelt value would silently disable the bounce.
 */
function guardPrivateContentRoute(request: NextRequest): NextResponse | null {
  if (!isPrivateContentMode()) return null

  const { pathname } = request.nextUrl
  const isPrivateContent = PRIVATE_CONTENT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
  if (!isPrivateContent) return null
  if (getSessionCookie(request)) return null

  const url = request.nextUrl.clone()
  url.pathname = "/login"
  return NextResponse.redirect(url)
}

/**
 * Optimistic Better Auth route guard (D-W11-7). ROUTING-ONLY, never the
 * security boundary (gwth-launch-dgc).
 *
 * Uses the OPTIMISTIC session-cookie presence check (`getSessionCookie`) — it
 * does NOT hit the DB, so it is safe in the edge/proxy hot path. It checks
 * only that a cookie NAME exists: `Cookie: better-auth.session_token=forged`
 * passes it, so nothing behind this guard is protected by it. Real
 * enforcement is server-side in every page it nominally covers:
 * `requireSessionOrRedirect()` / `requireContentAccessOrRedirect()`
 * (src/lib/content-access.ts) as the page's first await, plus
 * `getCurrentUser()` (the single accessor seam) which returns null for
 * ungranted users. This guard only spares anonymous traffic a render and
 * keeps logged-in traffic off the auth pages.
 *
 * `/labs` is absent from PROTECTED_PATHS on purpose and is handled instead by
 * guardPrivateContentRoute above. Labs are the free marketing taster and lab
 * detail must be readable with no login redirect once the site is public
 * (gwth-launch-bbg — the copy promises "free, no account required"), so their
 * gating has to lift with PRIVATE_CONTENT_MODE=off rather than being wired
 * permanently into this list.
 */
function guardRoute(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  const isPublicOnly = PUBLIC_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
  if (isPublicOnly) return null

  // The course overview (/course/<slug>, no deeper segments) is public: the
  // page itself renders a basic-info teaser for visitors without course
  // access and never ships the syllabus to them (snag fix 2026-07-05).
  // Lesson routes (/course/<slug>/lesson/...) stay behind the cookie guard.
  const isCourseOverview = /^\/course\/[^/]+$/.test(pathname)

  const isProtected =
    PROTECTED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    ) && !isCourseOverview

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

  // W25: with no password gate configured there is nothing for /access to do,
  // yet it answered 200 on production with a form that could never succeed
  // (SITE_PASSWORD was removed from the env store on 2026-07-05). The page
  // itself also calls notFound(), but a force-dynamic page that has already
  // flushed its shell can only signal that in-band — the status stays 200.
  // Deciding it here, before any render, gives an honest status code.
  if (!sitePassword && pathname === "/access") {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    url.search = ""
    return NextResponse.redirect(url)
  }

  if (sitePassword && !isPasswordExempt(pathname)) {
    const hasAccess = request.cookies.get("site_access")?.value === "granted"
    if (!hasAccess) {
      const url = request.nextUrl.clone()
      url.pathname = "/access"
      url.searchParams.set("from", pathname)
      return NextResponse.redirect(url)
    }
  }

  // Private content mode (W25): runs in EVERY environment, deliberately
  // outside both the NODE_ENV and the ENABLE_DEV_MOCK_USER conditions below,
  // so neither an unset NODE_ENV nor the staging review flag can re-open the
  // content paths. Optimisation only — the page-level gate is the boundary.
  const privateContentRedirect = guardPrivateContentRoute(request)
  if (privateContentRedirect) return privateContentRedirect

  // Dev/review leftovers (W15): auth-gated in every production build, even
  // when ENABLE_DEV_MOCK_USER relaxes the main guard below.
  if (process.env.NODE_ENV === "production") {
    const devReviewRedirect = guardDevReviewRoute(request)
    if (devReviewRedirect) return devReviewRedirect
  }

  // Route protection — production only (dev no-op, see above). The W8-beta
  // staging review env opts in via ENABLE_DEV_MOCK_USER, which makes the data
  // layer serve a mock learner (getDashboardUser); skip the optimistic cookie
  // guard there too so reviewers reach dashboard routes without a real session.
  // This flag is never set on the public/production deploy.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DEV_MOCK_USER !== "true"
  ) {
    const guardRedirect = guardRoute(request)
    if (guardRedirect) return guardRedirect
  }

  const response = NextResponse.next({ request })

  // Apply security headers to the response
  for (const [key, value] of Object.entries(baseSecurityHeaders)) {
    response.headers.set(key, value)
  }

  // Keep playable media out of the edge cache so byte ranges survive the CDN.
  if (RANGE_SERVED_MEDIA.test(pathname)) {
    response.headers.set("Cache-Control", "private, max-age=3600")
  }
  // Only stamp noindex while a pre-launch lockdown is active. Two independent
  // lockdowns qualify: the legacy SITE_PASSWORD gate, and (W25) private
  // content mode. Before W25 the header hung off SITE_PASSWORD alone, which
  // was removed from the production env on 2026-07-05 — so production emitted
  // no X-Robots-Tag at all and the noindex rested entirely on the page-level
  // meta tag and an advisory robots.txt.
  //
  // ALLOW_INDEXING=1 explicitly overrides both (used by the Lighthouse audit
  // harness so the SEO is-crawlable check passes against a production build
  // that still has SITE_PASSWORD wired up via .env.local for staging), and it
  // is the same variable David flips at public launch.
  const allowIndexing = process.env.ALLOW_INDEXING === "1"
  const preLaunchLockdown =
    Boolean(process.env.SITE_PASSWORD) || isPrivateContentMode()
  if (preLaunchLockdown && !allowIndexing) {
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
