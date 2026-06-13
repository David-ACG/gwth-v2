import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  mockGetUser,
  mockMaybeSingle,
  mockSignInWithPassword,
  mockSignOut,
  mockSignUp,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockSignUp: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    }),
  }),
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      signUp: mockSignUp,
    },
  }),
}))

describe("signUp beta gate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user_ungranted", email: "nogrant@example.com" } },
    })
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockSignOut.mockResolvedValue({ error: null })
  })

  it("rejects ungranted emails before creating a Supabase user", async () => {
    const { signUp } = await import("./auth")
    const { BETA_ACCESS_REQUIRED_MESSAGE } = await import("@/lib/billing/access")

    const result = await signUp({
      name: "No Grant",
      email: "nogrant@example.com",
      password: "password-123",
    })

    expect(result.error).toBe(BETA_ACCESS_REQUIRED_MESSAGE)
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it("rejects ungranted email-password login and clears the session", async () => {
    const { signIn } = await import("./auth")
    const { BETA_ACCESS_REQUIRED_MESSAGE } = await import("@/lib/billing/access")

    const result = await signIn({
      email: "nogrant@example.com",
      password: "password-123",
    })

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "nogrant@example.com",
      password: "password-123",
    })
    expect(result.error).toBe(BETA_ACCESS_REQUIRED_MESSAGE)
    expect(mockSignOut).toHaveBeenCalled()
  })
})
