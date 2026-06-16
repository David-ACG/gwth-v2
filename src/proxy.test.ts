/**
 * W11 route-guard tests for the Next-16 proxy (`src/proxy.ts`).
 *
 * The optimistic Better Auth guard (D-W11-7) only runs in production — it is a
 * deliberate NO-OP in development so the :3000 dev server (ENABLE_DEV_MOCK_USER,
 * no real session cookie) is not locked out. These unit tests pin the four
 * branches of the acceptance matrix:
 *   (a) no cookie + protected → redirect to /login
 *   (b) cookie + auth route   → redirect to /dashboard
 *   (c) public-only path      → passthrough regardless of cookie
 *   (d) development            → passthrough even unauth on a protected path
 *
 * `getSessionCookie` (from better-auth/cookies) is mocked so the session-cookie
 * presence is fully under test control — no real cookie parsing involved.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

// Controllable session-cookie presence. better-auth/cookies' getSessionCookie
// normally reads the request cookies; we stub it so each test dictates whether a
// session is "present".
const sessionCookie = vi.hoisted(() => ({ value: null as string | null }))
vi.mock("better-auth/cookies", () => ({
  getSessionCookie: () => sessionCookie.value,
}))

import { proxy } from "./proxy"

function setSessionCookie(value: string | null) {
  sessionCookie.value = value
}

function request(path: string): NextRequest {
  return new NextRequest(new URL(`https://gwth.ai${path}`))
}

/** Extracts the Location pathname from a redirect response, or null. */
function redirectPath(response: Response): string | null {
  const location = response.headers.get("location")
  if (!location) return null
  return new URL(location).pathname
}

describe("proxy route guard (W11)", () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalSitePassword = process.env.SITE_PASSWORD

  beforeEach(() => {
    setSessionCookie(null)
    // The site-password gate is orthogonal to the auth guard; keep it off so
    // these tests isolate the Better Auth route protection.
    delete process.env.SITE_PASSWORD
  })

  afterEach(() => {
    // NODE_ENV is read-only in the Vitest types; assign via the loose cast.
    ;(process.env as Record<string, string | undefined>).NODE_ENV =
      originalNodeEnv
    if (originalSitePassword === undefined) {
      delete process.env.SITE_PASSWORD
    } else {
      process.env.SITE_PASSWORD = originalSitePassword
    }
  })

  describe("in production", () => {
    beforeEach(() => {
      ;(process.env as Record<string, string | undefined>).NODE_ENV =
        "production"
    })

    it("(a) redirects an unauthenticated visitor off a protected route to /login", async () => {
      setSessionCookie(null)
      const response = await proxy(request("/dashboard"))
      expect(response.status).toBe(307)
      expect(redirectPath(response)).toBe("/login")
    })

    it("redirects unauthenticated nested protected routes too", async () => {
      setSessionCookie(null)
      const response = await proxy(request("/courses/ai-foundations"))
      expect(redirectPath(response)).toBe("/login")
    })

    it("(b) redirects a logged-in user off an auth route to /dashboard", async () => {
      setSessionCookie("session-token")
      const response = await proxy(request("/login"))
      expect(response.status).toBe(307)
      expect(redirectPath(response)).toBe("/dashboard")
    })

    it("lets an authenticated visitor through to a protected route", async () => {
      setSessionCookie("session-token")
      const response = await proxy(request("/dashboard"))
      // No redirect — NextResponse.next() passthrough, security headers applied.
      expect(redirectPath(response)).toBeNull()
      expect(response.headers.get("X-Frame-Options")).toBe("SAMEORIGIN")
    })

    it("(c) lets a public path through regardless of session (no cookie)", async () => {
      setSessionCookie(null)
      for (const path of ["/labs", "/demo", "/api/health"]) {
        const response = await proxy(request(path))
        expect(redirectPath(response)).toBeNull()
      }
    })

    it("(c) lets a public path through regardless of session (cookie present)", async () => {
      setSessionCookie("session-token")
      for (const path of ["/labs", "/demo", "/api/health"]) {
        const response = await proxy(request(path))
        expect(redirectPath(response)).toBeNull()
      }
    })

    it("(#7) lets a logged-out user reach /reset-password with its token intact", async () => {
      // /reset-password is an AUTH_PATH (not PROTECTED): the emailed reset link
      // must reach the form without a session, else the token is dropped.
      setSessionCookie(null)
      const response = await proxy(request("/reset-password?token=abc123"))
      expect(redirectPath(response)).toBeNull()
    })

    it("(#6) lets a logged-out user reach the /error OAuth-failure page", async () => {
      // /error is in neither list → guardRoute passes it straight through.
      setSessionCookie(null)
      const response = await proxy(request("/error?error=access_denied"))
      expect(redirectPath(response)).toBeNull()
    })
  })

  describe("in development", () => {
    beforeEach(() => {
      ;(process.env as Record<string, string | undefined>).NODE_ENV =
        "development"
    })

    it("(d) never guards — passes an unauth protected route straight through", async () => {
      setSessionCookie(null)
      const response = await proxy(request("/dashboard"))
      expect(redirectPath(response)).toBeNull()
      // Security headers still apply in dev.
      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff")
    })

    it("(d) never redirects a logged-out auth route either", async () => {
      setSessionCookie(null)
      const response = await proxy(request("/login"))
      expect(redirectPath(response)).toBeNull()
    })
  })
})
