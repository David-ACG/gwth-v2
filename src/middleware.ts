import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Route protection middleware.
 * Redirects unauthenticated users from protected routes to /login.
 * Currently a passthrough — auth check will be implemented when backend is connected.
 */
export function middleware(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  // TODO: Check auth session when backend is connected
  // const session = await getSession(request)
  // if (!session) return NextResponse.redirect(new URL("/login", request.url))
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/course/:path*",
    "/labs/:path*",
    "/progress/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/bookmarks/:path*",
    "/notifications/:path*",
  ],
}
