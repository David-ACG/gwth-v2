/**
 * Tests for the invite-only beta signup surface.
 */
import { afterEach, describe, it, expect } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { SignupForm } from "./signup-form"

afterEach(cleanup)

describe("SignupForm", () => {
  it("renders invite-only beta messaging", () => {
    render(<SignupForm />)

    expect(screen.getByText(/invite-only beta/i)).toBeInTheDocument()
    expect(screen.getByText(/closed to public signup/i)).toBeInTheDocument()
  })

  it("points invited users to login and everyone else to the waitlist", () => {
    render(<SignupForm />)

    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute(
      "href",
      "/login"
    )
    expect(
      screen.getByRole("link", { name: /join the waitlist/i })
    ).toHaveAttribute("href", "/")
  })

  it("does not render public account creation fields", () => {
    render(<SignupForm />)

    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /create account/i })
    ).not.toBeInTheDocument()
  })
})
