/**
 * W11 client-flow tests for the auth forms.
 *
 * Phase 2 moved sign-in / password-reset onto the CLIENT via `authClient`
 * (better-auth/react) inside the form components; these are the wiring tests
 * that replace the old server-action unit tests. They assert that each form,
 * on submit, calls the right `authClient` method with the entered values — not
 * the full UX.
 *
 * `@/lib/auth-client` is mocked so no network/Better Auth client is constructed.
 * `next/navigation` + `sonner` are stubbed (jsdom has no router / toast host).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const { mockSignInEmail, mockSignInSocial, mockRequestPasswordReset } =
  vi.hoisted(() => ({
    mockSignInEmail: vi.fn(),
    mockSignInSocial: vi.fn(),
    mockRequestPasswordReset: vi.fn(),
  }))

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: mockSignInEmail,
      social: mockSignInSocial,
    },
    requestPasswordReset: mockRequestPasswordReset,
  },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { LoginForm } from "./login-form"
import { OAuthButtons } from "./oauth-buttons"
import { ForgotPasswordForm } from "./forgot-password-form"

afterEach(cleanup)

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // No error → the success path (router redirect) runs.
    mockSignInEmail.mockResolvedValue({ error: null })
  })

  it("calls authClient.signIn.email with the entered email + password", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), "learner@example.com")
    await user.type(screen.getByLabelText(/password/i), "hunter2pass")
    await user.click(screen.getByRole("button", { name: /log in/i }))

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: "learner@example.com",
        password: "hunter2pass",
      })
    })
    expect(mockPush).toHaveBeenCalledWith("/dashboard")
  })

  it("does not call signIn.email when validation fails (short password)", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), "learner@example.com")
    await user.type(screen.getByLabelText(/password/i), "short") // < 8 chars
    await user.click(screen.getByRole("button", { name: /log in/i }))

    // zodResolver blocks submit; the client is never invoked.
    await waitFor(() => {
      expect(
        screen.getByText(/at least 8 characters/i)
      ).toBeInTheDocument()
    })
    expect(mockSignInEmail).not.toHaveBeenCalled()
  })
})

describe("OAuthButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignInSocial.mockResolvedValue({ error: null })
  })

  it.each([
    ["Google", "google"],
    ["GitHub", "github"],
    ["LinkedIn", "linkedin"],
  ])(
    "calls signIn.social with provider %s",
    async (label, provider) => {
      const user = userEvent.setup()
      render(<OAuthButtons />)

      await user.click(
        screen.getByRole("button", { name: new RegExp(`continue with ${label}`, "i") })
      )

      await waitFor(() => {
        expect(mockSignInSocial).toHaveBeenCalledWith(
          expect.objectContaining({ provider })
        )
      })
    }
  )
})

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequestPasswordReset.mockResolvedValue({ error: null })
  })

  it("calls authClient.requestPasswordReset with the entered email", async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />)

    await user.type(screen.getByLabelText(/email/i), "reset@example.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({ email: "reset@example.com" })
      )
    })
  })
})
