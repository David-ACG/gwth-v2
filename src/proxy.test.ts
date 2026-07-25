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
  const originalPrivateMode = process.env.PRIVATE_CONTENT_MODE

  beforeEach(() => {
    setSessionCookie(null)
    // The site-password gate is orthogonal to the auth guard; keep it off so
    // these tests isolate the Better Auth route protection.
    delete process.env.SITE_PASSWORD
    // W25: unset means LOCKED. That is both the fail-closed default and the
    // production configuration, so it is the right baseline here. Tests that
    // need the open behaviour set the variable explicitly.
    delete process.env.PRIVATE_CONTENT_MODE
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
    if (originalPrivateMode === undefined) {
      delete process.env.PRIVATE_CONTENT_MODE
    } else {
      process.env.PRIVATE_CONTENT_MODE = originalPrivateMode
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

    it("(W4) bounces anonymous traffic off /admin and /admin/* to /login", async () => {
      setSessionCookie(null)
      for (const path of ["/admin", "/admin/roster", "/admin/feedback"]) {
        const response = await proxy(request(path))
        expect(response.status).toBe(307)
        expect(redirectPath(response)).toBe("/login")
      }
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
      // /labs moved out of this list in W25: it is product content and is
      // gated while PRIVATE_CONTENT_MODE is on. Its private-mode-off
      // behaviour is asserted in the "private content mode (W25)" block below.
      for (const path of ["/", "/lessons", "/pricing", "/api/health"]) {
        const response = await proxy(request(path))
        expect(redirectPath(response)).toBeNull()
      }
    })

    it("lets an anonymous visitor through to the course overview (teaser page)", async () => {
      setSessionCookie(null)
      const response = await proxy(request("/course/applied-ai-skills"))
      expect(redirectPath(response)).toBeNull()
    })

    it("still bounces anonymous traffic off lesson routes under /course", async () => {
      setSessionCookie(null)
      const response = await proxy(
        request("/course/applied-ai-skills/lesson/welcome-to-gwth")
      )
      expect(response.status).toBe(307)
      expect(redirectPath(response)).toBe("/login")
    })

    it("(bbg/W25) restores public lab reading the moment private mode is off", async () => {
      // gwth-launch-bbg: the public copy promises "free, no account required",
      // so the W25 gate must be a reversible env flag rather than a permanent
      // entry in PROTECTED_PATHS. This is the assertion that the launch
      // off-switch actually works.
      process.env.PRIVATE_CONTENT_MODE = "off"
      setSessionCookie(null)
      for (const path of [
        "/labs",
        "/labs/job-advert-claude-vs-chatgpt",
        "/labs/some-archived-lab",
      ]) {
        const response = await proxy(request(path))
        expect(
          redirectPath(response),
          `${path} must be publicly readable once the site is public`
        ).toBeNull()
      }
    })

    it("(c) lets a public path through regardless of session (cookie present)", async () => {
      setSessionCookie("session-token")
      for (const path of [
        "/",
        "/lessons",
        "/labs",
        "/labs/job-advert-claude-vs-chatgpt",
        "/api/health",
      ]) {
        const response = await proxy(request(path))
        expect(redirectPath(response)).toBeNull()
      }
    })

    it("(W15) bounces anonymous traffic off every dev/review leftover route", async () => {
      setSessionCookie(null)
      for (const path of [
        "/demo",
        "/demo/dashboard",
        "/logo_picker",
        "/redesign",
        "/redesign_v2",
        "/redesign/v-a",
        "/old-design",
        "/score-card-variants",
      ]) {
        const response = await proxy(request(path))
        expect(response.status, `${path} must not answer anonymously`).toBe(307)
        expect(redirectPath(response)).toBe("/login")
      }
    })

    it("(W15) still gates dev/review routes when ENABLE_DEV_MOCK_USER relaxes the main guard", async () => {
      const original = process.env.ENABLE_DEV_MOCK_USER
      process.env.ENABLE_DEV_MOCK_USER = "true"
      try {
        setSessionCookie(null)
        const response = await proxy(request("/demo/dashboard"))
        expect(response.status).toBe(307)
        expect(redirectPath(response)).toBe("/login")
      } finally {
        if (original === undefined) {
          delete process.env.ENABLE_DEV_MOCK_USER
        } else {
          process.env.ENABLE_DEV_MOCK_USER = original
        }
      }
    })

    it("(W15) lets a logged-in session reach a dev/review route", async () => {
      setSessionCookie("session-token")
      const response = await proxy(request("/demo"))
      expect(redirectPath(response)).toBeNull()
    })

    it("(W25) no longer serves the deleted W12 review leftovers", async () => {
      // Deliberately updated: this assertion used to require /w12-review and
      // /explainer-preview to answer 200 "until W12 closes". W12 has closed,
      // and W25 took the stronger of the two options that comment offered by
      // DELETING the routes (along with /w12-embed-demo, POST
      // /api/w12-take-review and the /demo/lesson-v1..v11 viewers) rather than
      // gating them. Deletion is the only closure a forged session cookie
      // cannot undo, which matters because the proxy check is presence-only.
      //
      // The proxy no longer has an opinion about these paths, so it passes
      // them through to a 404 from the router. That is the correct outcome:
      // asserting a redirect here would mean the routes still existed.
      setSessionCookie(null)
      for (const path of [
        "/w12-review",
        "/w12-review/takes",
        "/explainer-preview",
        "/w12-embed-demo",
        "/api/w12-take-review",
      ]) {
        const response = await proxy(request(path))
        expect(
          redirectPath(response),
          `${path} is deleted, so the proxy should not redirect it`
        ).toBeNull()
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

    it("(W15) leaves dev/review routes open in development", async () => {
      setSessionCookie(null)
      const response = await proxy(request("/demo/dashboard"))
      expect(redirectPath(response)).toBeNull()
    })
  })

  /**
   * W25 Layer 1. Read these as tests of an OPTIMISATION, not of a security
   * boundary: `getSessionCookie` is presence-only, so the "cookie present"
   * cases below deliberately assert passthrough for a token this file never
   * signs. The boundary is `requireContentAccessOrRedirect()` inside each page
   * component, covered in src/lib/content-access.test.ts.
   */
  describe("private content mode (W25)", () => {
    it("bounces anonymous traffic off /labs when the mode variable is unset", async () => {
      setSessionCookie(null)
      for (const path of ["/labs", "/labs/job-advert-claude-vs-chatgpt"]) {
        const response = await proxy(request(path))
        expect(response.status, `${path} must not answer anonymously`).toBe(307)
        expect(redirectPath(response)).toBe("/login")
      }
    })

    it("stays locked for a misspelt or truthy-looking mode value", async () => {
      setSessionCookie(null)
      for (const value of ["", "on", "of", "0", "false", '"off"']) {
        process.env.PRIVATE_CONTENT_MODE = value
        const response = await proxy(request("/labs"))
        expect(
          response.status,
          `PRIVATE_CONTENT_MODE=${JSON.stringify(value)} must stay locked`
        ).toBe(307)
      }
    })

    it("never bounces the marketing pages, locked or not", async () => {
      setSessionCookie(null)
      for (const path of [
        "/",
        "/lessons",
        "/pricing",
        "/about",
        "/for-teams",
        "/waitlist",
        "/score/c67sg",
      ]) {
        const response = await proxy(request(path))
        expect(
          redirectPath(response),
          `${path} must stay anonymously readable`
        ).toBeNull()
      }
    })

    it("leaves /score alone: the homepage QR code points at it", async () => {
      // src/components/marketing/hero/qr-code.tsx ships a scannable
      // https://gwth.ai/score/c67sg#dde5 on the home page, and /score is a
      // deliberately public recruiter-facing credential record. Gating it
      // would break every card already shared.
      setSessionCookie(null)
      const response = await proxy(request("/score/c67sg"))
      expect(response.status).not.toBe(307)
      expect(redirectPath(response)).toBeNull()
    })

    it("passes a session cookie through to the page-level gate", async () => {
      setSessionCookie("session-token")
      const response = await proxy(request("/labs"))
      expect(redirectPath(response)).toBeNull()
    })

    it("opens /labs to anonymous traffic when the mode is explicitly off", async () => {
      setSessionCookie(null)
      for (const value of ["off", "OFF", " public "]) {
        process.env.PRIVATE_CONTENT_MODE = value
        const response = await proxy(request("/labs"))
        expect(
          redirectPath(response),
          `PRIVATE_CONTENT_MODE=${JSON.stringify(value)} must open /labs`
        ).toBeNull()
      }
    })

    it("guards /labs even with NODE_ENV unset", async () => {
      // The other two guards are nested inside `NODE_ENV === "production"`.
      // NODE_ENV is an unvalidated env var, so a missing or misspelt value
      // would silently disable them; this one is deliberately outside.
      ;(process.env as Record<string, string | undefined>).NODE_ENV = undefined
      setSessionCookie(null)
      const response = await proxy(request("/labs"))
      expect(response.status).toBe(307)
      expect(redirectPath(response)).toBe("/login")
    })

    it("guards /labs even when ENABLE_DEV_MOCK_USER relaxes the main guard", async () => {
      const original = process.env.ENABLE_DEV_MOCK_USER
      process.env.ENABLE_DEV_MOCK_USER = "true"
      try {
        ;(process.env as Record<string, string | undefined>).NODE_ENV =
          "production"
        setSessionCookie(null)
        const response = await proxy(request("/labs"))
        expect(response.status).toBe(307)
        expect(redirectPath(response)).toBe("/login")
      } finally {
        if (original === undefined) delete process.env.ENABLE_DEV_MOCK_USER
        else process.env.ENABLE_DEV_MOCK_USER = original
      }
    })

    it("stamps X-Robots-Tag while private mode is on, without SITE_PASSWORD", async () => {
      // Before W25 this header hung off SITE_PASSWORD alone, which was removed
      // from production on 2026-07-05 — so production emitted no
      // X-Robots-Tag at all during the invite-only period.
      setSessionCookie(null)
      const response = await proxy(request("/"))
      expect(response.headers.get("X-Robots-Tag")).toContain("noindex")
    })

    it("drops X-Robots-Tag once private mode is off", async () => {
      process.env.PRIVATE_CONTENT_MODE = "off"
      setSessionCookie(null)
      const response = await proxy(request("/"))
      expect(response.headers.get("X-Robots-Tag")).toBeNull()
    })

    it("still lets ALLOW_INDEXING=1 override the noindex stamp", async () => {
      const original = process.env.ALLOW_INDEXING
      process.env.ALLOW_INDEXING = "1"
      try {
        setSessionCookie(null)
        const response = await proxy(request("/"))
        expect(response.headers.get("X-Robots-Tag")).toBeNull()
      } finally {
        if (original === undefined) delete process.env.ALLOW_INDEXING
        else process.env.ALLOW_INDEXING = original
      }
    })
  })
})
