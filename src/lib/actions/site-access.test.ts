import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock next/headers cookies
const mockSet = vi.fn()
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    set: (...args: unknown[]) => mockSet(...args),
  }),
}))

describe("verifySitePassword", () => {
  beforeEach(() => {
    vi.resetModules()
    mockSet.mockClear()
  })

  it("returns success when no SITE_PASSWORD is configured", async () => {
    vi.stubEnv("SITE_PASSWORD", "")
    const { verifySitePassword } = await import("./site-access")
    const result = await verifySitePassword("anything")
    expect(result.success).toBe(true)
  })

  it("returns success and sets cookie when password matches", async () => {
    vi.stubEnv("SITE_PASSWORD", "test-pass-123")
    const { verifySitePassword } = await import("./site-access")
    const result = await verifySitePassword("test-pass-123")
    expect(result.success).toBe(true)
    expect(mockSet).toHaveBeenCalledWith(
      "site_access",
      "granted",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      })
    )
  })

  it("returns error when password does not match", async () => {
    vi.stubEnv("SITE_PASSWORD", "correct-password")
    const { verifySitePassword } = await import("./site-access")
    const result = await verifySitePassword("wrong-password")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Incorrect password")
  })
})
