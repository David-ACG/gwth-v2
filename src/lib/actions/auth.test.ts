import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * W11 (Better Auth) — Phase 2 trims this suite to the only remaining server
 * action, `signOut`. The sign-in / sign-up / password-reset flows now run on
 * the CLIENT via `authClient` inside the form components, so their unit tests
 * move to the client-flow suites in Phase 3 (full test rewrite). This file just
 * keeps tsc/build green and covers the mock-mode sign-out redirect.
 */

const { mockSignOut, mockRedirect } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
  mockRedirect: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock("@/lib/better-auth", () => ({
  getAuth: () => ({ api: { signOut: mockSignOut } }),
}))

describe("signOut server action", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue({ success: true })
  })

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl
  })

  it("redirects home without touching Better Auth in mock mode", async () => {
    delete process.env.DATABASE_URL
    const { signOut } = await import("./auth")

    await signOut()

    expect(mockSignOut).not.toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith("/")
  })

  it("revokes the session then redirects home when a DB is configured", async () => {
    process.env.DATABASE_URL = "postgresql://gwth:devpass@localhost:5443/gwth_v2"
    const { signOut } = await import("./auth")

    await signOut()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockRedirect).toHaveBeenCalledWith("/")
  })
})
