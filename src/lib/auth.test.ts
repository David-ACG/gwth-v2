/**
 * W11 beta-gate tests for `getCurrentUser()` — the single accessor seam.
 *
 * `getCurrentUser` reads the Better Auth session and applies the invite-only
 * beta gate: a session without a live `manual_beta` grant resolves to null
 * (the route guard then bounces such users to /login?error=beta_access_required).
 *
 * Both backend reads are mocked so the gate logic is the only thing under test:
 *   - @/lib/better-auth → getAuth().api.getSession returns a controllable session
 *   - @/lib/billing/access → getAccessForUser returns controllable access
 * `next/headers` is stubbed because getCurrentUser awaits headers().
 *
 * The `signOut` server action keeps its own coverage in
 * src/lib/actions/auth.test.ts — this file owns the accessor-seam gate.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { UserAccess } from "@/lib/billing/access"

const { mockGetSession, mockGetAccessForUser } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockGetAccessForUser: vi.fn(),
}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock("@/lib/better-auth", () => ({
  getAuth: () => ({ api: { getSession: mockGetSession } }),
}))

vi.mock("@/lib/billing/access", () => ({
  getAccessForUser: mockGetAccessForUser,
}))

const SESSION_USER = {
  id: "user_beta_001",
  name: "Beta Tester",
  email: "beta@example.com",
  image: null,
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-02-01").toISOString(),
}

const GRANTED_ACCESS: UserAccess = {
  source: "manual_beta",
  subscriptionState: "month3",
  subscriptionMonth: 3,
  validUntil: null,
  gracePeriodEnds: null,
  lastPaymentDate: new Date("2026-02-01"),
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripePriceId: null,
  stripeSubscriptionStatus: null,
}

const REGISTERED_ACCESS: UserAccess = {
  source: "registered",
  subscriptionState: "registered",
  subscriptionMonth: 0,
  validUntil: null,
  gracePeriodEnds: null,
  lastPaymentDate: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripePriceId: null,
  stripeSubscriptionStatus: null,
}

describe("getCurrentUser beta gate (W11)", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL

  beforeEach(() => {
    vi.clearAllMocks()
    // A DB must be "configured" or getCurrentUser short-circuits to null before
    // ever touching the session — that mock-mode path is asserted separately.
    process.env.DATABASE_URL = "postgresql://gwth:devpass@localhost:5443/gwth_v2"
  })

  afterEach(() => {
    process.env.DATABASE_URL = originalDatabaseUrl
  })

  it("returns null in mock mode (no DATABASE_URL) without touching the session", async () => {
    delete process.env.DATABASE_URL
    const { getCurrentUser } = await import("./auth")

    expect(await getCurrentUser()).toBeNull()
    expect(mockGetSession).not.toHaveBeenCalled()
  })

  it("(a) returns null when there is no session", async () => {
    mockGetSession.mockResolvedValue(null)
    const { getCurrentUser } = await import("./auth")

    expect(await getCurrentUser()).toBeNull()
    expect(mockGetAccessForUser).not.toHaveBeenCalled()
  })

  it("returns null when getSession throws", async () => {
    mockGetSession.mockRejectedValue(new Error("boom"))
    const { getCurrentUser } = await import("./auth")

    expect(await getCurrentUser()).toBeNull()
  })

  it("(b) returns null for a session whose access is not a manual beta grant", async () => {
    mockGetSession.mockResolvedValue({ user: SESSION_USER })
    mockGetAccessForUser.mockResolvedValue(REGISTERED_ACCESS)
    const { getCurrentUser } = await import("./auth")

    expect(await getCurrentUser()).toBeNull()
    expect(mockGetAccessForUser).toHaveBeenCalledWith(SESSION_USER.id)
  })

  it("(b) returns null for a manual_beta grant with no months left", async () => {
    mockGetSession.mockResolvedValue({ user: SESSION_USER })
    mockGetAccessForUser.mockResolvedValue({
      ...GRANTED_ACCESS,
      subscriptionMonth: 0,
    })
    const { getCurrentUser } = await import("./auth")

    expect(await getCurrentUser()).toBeNull()
  })

  it("(c) returns the mapped User when the session has a live manual beta grant", async () => {
    mockGetSession.mockResolvedValue({ user: SESSION_USER })
    mockGetAccessForUser.mockResolvedValue(GRANTED_ACCESS)
    const { getCurrentUser } = await import("./auth")

    const user = await getCurrentUser()
    expect(user).not.toBeNull()
    expect(user?.id).toBe(SESSION_USER.id)
    expect(user?.email).toBe(SESSION_USER.email)
    expect(user?.subscriptionState).toBe("month3")
    expect(user?.subscriptionMonth).toBe(3)
  })

  it("falls back to a name derived from the email when the session name is blank", async () => {
    mockGetSession.mockResolvedValue({
      user: { ...SESSION_USER, name: "   " },
    })
    mockGetAccessForUser.mockResolvedValue(GRANTED_ACCESS)
    const { getCurrentUser } = await import("./auth")

    const user = await getCurrentUser()
    expect(user?.name).toBe("beta") // local part of beta@example.com
  })
})
