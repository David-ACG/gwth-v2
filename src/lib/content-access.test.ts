import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Mutable seams. `headersCalls` counts `headers()` invocations because the
 * gate's most important property is not WHAT it decides but WHEN: it must
 * touch a dynamic API on every path, including the paths that return early,
 * or the route it guards can be statically prerendered and its verdict frozen
 * into the image.
 */
const headersCalls = vi.hoisted(() => ({ count: 0 }))
const sessionState = vi.hoisted(() => ({ email: null as string | null }))
const redirects = vi.hoisted(() => ({ to: [] as string[] }))

vi.mock("next/headers", () => ({
  headers: async () => {
    headersCalls.count += 1
    return new Headers()
  },
}))

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    redirects.to.push(path)
    // The real redirect() throws to unwind the render; mirroring that keeps
    // the "no code runs after a redirect" contract under test.
    throw new Error(`NEXT_REDIRECT:${path}`)
  },
}))

vi.mock("@/lib/auth", () => ({
  getSessionEmail: async () => sessionState.email,
}))

import {
  canViewPrivateContent,
  requireContentAccessOrRedirect,
} from "./content-access"

describe("private content gate (W25)", () => {
  const originalMode = process.env.PRIVATE_CONTENT_MODE
  const originalAllowed = process.env.CONTENT_ALLOWED_EMAILS
  const originalAdmin = process.env.ADMIN_EMAILS

  beforeEach(() => {
    headersCalls.count = 0
    sessionState.email = null
    redirects.to = []
    delete process.env.PRIVATE_CONTENT_MODE
    delete process.env.CONTENT_ALLOWED_EMAILS
    delete process.env.ADMIN_EMAILS
  })

  afterEach(() => {
    for (const [key, value] of [
      ["PRIVATE_CONTENT_MODE", originalMode],
      ["CONTENT_ALLOWED_EMAILS", originalAllowed],
      ["ADMIN_EMAILS", originalAdmin],
    ] as const) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })

  /** Runs the gate and reports the redirect it threw, or null. */
  async function gate(): Promise<string | null> {
    try {
      await requireContentAccessOrRedirect()
      return null
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      if (message.startsWith("NEXT_REDIRECT:")) {
        return message.slice("NEXT_REDIRECT:".length)
      }
      throw error
    }
  }

  describe("never prerenderable", () => {
    it("awaits headers() before returning, even when private mode is OFF", async () => {
      process.env.PRIVATE_CONTENT_MODE = "off"
      await requireContentAccessOrRedirect()
      expect(headersCalls.count).toBe(1)
    })

    it("awaits headers() before returning, even for the anonymous redirect", async () => {
      await gate()
      expect(headersCalls.count).toBe(1)
    })

    it("awaits headers() in canViewPrivateContent on every branch", async () => {
      process.env.PRIVATE_CONTENT_MODE = "off"
      await canViewPrivateContent()
      expect(headersCalls.count).toBe(1)

      delete process.env.PRIVATE_CONTENT_MODE
      await canViewPrivateContent()
      expect(headersCalls.count).toBe(2)
    })
  })

  describe("requireContentAccessOrRedirect", () => {
    it("locks anonymous traffic out when the mode variable is unset", async () => {
      expect(await gate()).toBe("/login")
    })

    it("locks anonymous traffic out for a typo'd mode value", async () => {
      process.env.PRIVATE_CONTENT_MODE = "of"
      process.env.CONTENT_ALLOWED_EMAILS = "david@agilecommercegroup.com"
      expect(await gate()).toBe("/login")
    })

    it("treats a forged session cookie exactly like anonymous traffic", async () => {
      // The proxy's getSessionCookie check is presence-only and passes a
      // forged token. Server-side validation is what makes that harmless:
      // getSessionEmail() resolves null for an unsigned cookie, so the gate
      // still bounces. This is the regression that keeps Layer 1 honest.
      process.env.CONTENT_ALLOWED_EMAILS = "david@agilecommercegroup.com"
      sessionState.email = null
      expect(await gate()).toBe("/login")
    })

    it("sends a signed-in but unlisted account HOME, not to /login", async () => {
      // /login is an AUTH_PATH in the proxy, which bounces anyone holding a
      // session cookie on to /dashboard — so redirecting them there would
      // ricochet them around a loop.
      process.env.CONTENT_ALLOWED_EMAILS = "david@agilecommercegroup.com"
      sessionState.email = "stranger@example.com"
      expect(await gate()).toBe("/")
    })

    it("admits BOTH allowlisted demo accounts", async () => {
      process.env.CONTENT_ALLOWED_EMAILS =
        "david@agilecommercegroup.com, familyuccelli@gmail.com"
      for (const email of [
        "david@agilecommercegroup.com",
        "familyuccelli@gmail.com",
        "FamilyUccelli@Gmail.com",
      ]) {
        sessionState.email = email
        expect(await gate(), `${email} must be admitted`).toBeNull()
      }
    })

    it("locks out an allowlisted email when the allowlist itself is empty", async () => {
      sessionState.email = "david@agilecommercegroup.com"
      expect(await gate()).toBe("/")
    })

    it("lets everyone through once the mode is explicitly off", async () => {
      process.env.PRIVATE_CONTENT_MODE = "off"
      sessionState.email = null
      expect(await gate()).toBeNull()

      sessionState.email = "stranger@example.com"
      expect(await gate()).toBeNull()
    })
  })

  describe("canViewPrivateContent", () => {
    it("is false for anonymous traffic while private mode is on", async () => {
      process.env.CONTENT_ALLOWED_EMAILS = "david@agilecommercegroup.com"
      expect(await canViewPrivateContent()).toBe(false)
    })

    it("is false for a signed-in account that is not allowlisted", async () => {
      process.env.CONTENT_ALLOWED_EMAILS = "david@agilecommercegroup.com"
      sessionState.email = "stranger@example.com"
      expect(await canViewPrivateContent()).toBe(false)
    })

    it("is true for an allowlisted account", async () => {
      process.env.CONTENT_ALLOWED_EMAILS = "familyuccelli@gmail.com"
      sessionState.email = "familyuccelli@gmail.com"
      expect(await canViewPrivateContent()).toBe(true)
    })

    it("is true for everyone once the mode is explicitly off", async () => {
      process.env.PRIVATE_CONTENT_MODE = "public"
      expect(await canViewPrivateContent()).toBe(true)
    })
  })
})
