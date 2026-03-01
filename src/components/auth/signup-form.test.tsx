/**
 * Tests for the signup form component.
 */
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SignupForm } from "./signup-form"

describe("SignupForm", () => {
  it("renders the signup heading", () => {
    render(<SignupForm />)
    expect(screen.getAllByText("Create your account").length).toBeGreaterThan(0)
  })

  it("renders name, email, password, and confirm password fields", () => {
    render(<SignupForm />)
    expect(screen.getAllByLabelText("Name").length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText("Email").length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText("Password").length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText("Confirm Password").length).toBeGreaterThan(0)
  })

  it("renders the submit button with correct text", () => {
    render(<SignupForm />)
    const buttons = screen.getAllByRole("button", { name: "Create Account" })
    expect(buttons.length).toBeGreaterThan(0)
  })

  it("renders the login link", () => {
    render(<SignupForm />)
    expect(screen.getAllByText("Log in").length).toBeGreaterThan(0)
  })

  it("renders OAuth social login buttons", () => {
    render(<SignupForm />)
    expect(screen.getAllByText("Continue with Google").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Continue with GitHub").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Continue with LinkedIn").length).toBeGreaterThan(0)
  })

  it("shows email confirmation message in description", () => {
    render(<SignupForm />)
    expect(
      screen.getAllByText(/send you a confirmation email/).length
    ).toBeGreaterThan(0)
  })
})
