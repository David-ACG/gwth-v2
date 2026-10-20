/**
 * Tests for the invite-only beta signup surface. Since the W6 go-live fix the
 * page renders the REAL registration form under invite-only framing: the
 * invite email sends testers to /signup, so account-creation fields must be
 * present (the beta grant, not the form, gates course access).
 */
import { afterEach, describe, it, expect } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { SignupForm } from "./signup-form"

afterEach(cleanup)

describe("SignupForm", () => {
  it("says when sign-up opens, with no beta wording (launch readiness, 2026-10-20)", () => {
    render(<SignupForm />)

    expect(screen.getByText(/opens to everyone on 1 December 2026/i)).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/beta|invite-only/i)
  })

  it("points un-invited visitors to the waitlist and existing users to login", () => {
    render(<SignupForm />)

    expect(
      screen.getByRole("link", { name: /join the waitlist/i })
    ).toHaveAttribute("href", "/waitlist")
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
      "href",
      "/login"
    )
  })

  it("renders the account creation form for invited testers", () => {
    render(<SignupForm />)

    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument()
  })

  it("hides OAuth buttons while no provider apps are registered", () => {
    render(<SignupForm />)

    expect(
      screen.queryByRole("button", { name: /google|github|linkedin/i })
    ).not.toBeInTheDocument()
  })
})
