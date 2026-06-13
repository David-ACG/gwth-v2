import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isUserGrantedBetaAccess } from "@/lib/billing/access"

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

/** Auth routes that should redirect to dashboard if already logged in */
const AUTH_PATHS = ["/login", "/signup", "/forgot-password"]

/** Paths that never need Supabase auth checks */
const PUBLIC_ONLY_PATHS = ["/demo", "/api/health"]

/**
 * Refreshes the Supabase auth session and enforces route protection.
 * - Protected routes: no user -> redirect to /login
 * - Auth routes: user exists -> redirect to /dashboard
 * - Public-only paths and missing env vars: pass through without Supabase
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { pathname } = request.nextUrl

  // Skip Supabase entirely for paths that never need auth
  const isPublicOnly = PUBLIC_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
  if (isPublicOnly) {
    return supabaseResponse
  }

  // If Supabase env vars are missing, pass through without auth checks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not run code between createServerClient and auth.getUser().
  // A simple mistake could make it very hard to debug session issues.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected =
    PROTECTED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    ) && pathname !== "/labs"

  const isAuthRoute = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  const hasBetaAccess =
    user && (isProtected || isAuthRoute)
      ? await isUserGrantedBetaAccess(supabase, user.id)
      : false

  if (isProtected && (!user || !hasBetaAccess)) {
    // Dev-only escape hatch matching getDashboardUser(): with
    // ENABLE_DEV_MOCK_USER=true the dashboard renders the mock learner
    // for visual work, so the gate must let the request through.
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.ENABLE_DEV_MOCK_USER === "true"
    ) {
      return supabaseResponse
    }
    if (user) await supabase.auth.signOut()
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    if (user) url.searchParams.set("error", "beta_access_required")
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user && hasBetaAccess) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
