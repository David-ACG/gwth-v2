/**
 * Tests for the waitlist signup form component.
 */
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SignupForm } from "./signup-form"

describe("SignupForm", () => {
  it("renders the waitlist heading", () => {
    render(<SignupForm />)
    expect(screen.getAllByText("Join the Earlybird Waitlist").length).toBeGreaterThan(0)
  })

  it("renders name and email fields only (no password)", () => {
    render(<SignupForm />)
    expect(screen.getAllByLabelText("Name").length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText("Email").length).toBeGreaterThan(0)
    expect(screen.queryByLabelText("Password")).toBeNull()
    expect(screen.queryByLabelText("Confirm Password")).toBeNull()
  })

  it("renders the submit button with correct text", () => {
    render(<SignupForm />)
    const buttons = screen.getAllByRole("button", { name: "Join the Waitlist" })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it("renders the login link", () => {
    render(<SignupForm />)
    expect(screen.getAllByText("Log in").length).toBeGreaterThan(0)
  })

  it("shows message about confirmation email", () => {
    render(<SignupForm />)
    expect(
      screen.getAllByText(/We will send you a confirmation email/).length
    ).toBeGreaterThan(0)
  })

  it("does not render password fields", () => {
    render(<SignupForm />)
    expect(screen.queryByLabelText(/password/i)).toBeNull()
  })
})
