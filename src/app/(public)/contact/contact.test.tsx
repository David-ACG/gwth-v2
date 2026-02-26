import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import ContactPage from "./page"

afterEach(cleanup)

describe("ContactPage", () => {
  it("renders the page heading", () => {
    render(<ContactPage />)
    expect(screen.getByText("Get in Touch")).toBeInTheDocument()
  })

  it("renders the contact form fields", () => {
    render(<ContactPage />)
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Message")).toBeInTheDocument()
  })

  it("renders the submit button", () => {
    render(<ContactPage />)
    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeInTheDocument()
  })

  it("does not contain any email addresses", () => {
    const { container } = render(<ContactPage />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/[\w.-]+@[\w.-]+\.\w+/)
  })
})
