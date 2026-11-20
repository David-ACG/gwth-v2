import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { COURSE_OPENS_ON } from "@/lib/launch-date"
import { WaitlistNext } from "./waitlist-next"

afterEach(cleanup)

describe("WaitlistNext", () => {
  it("keeps the headline and the facts of the page it replaces", () => {
    const { container } = render(<WaitlistNext />)
    expect(screen.getByRole("heading", { level: 1, name: "Join the waitlist" })).toBeInTheDocument()
    const text = (container.textContent ?? "").replace(/\s+/g, " ")
    expect(text).toContain("Access is invite-only while we work closely with a small group of testers")
    expect(text).toContain("we'll email you when the course launches")
    expect(text).toContain("We'll email you again when the course launches on 14 December 2026.")
    expect(text).not.toContain("places open")
    expect(text).toContain("This is the UK beta")
    expect(text).toContain("written for the United Kingdom")
  })

  it("prints the opening date from the one constant", () => {
    render(<WaitlistNext />)
    expect(screen.getByTestId("waitlist-opens")).toHaveTextContent(`The course opens on ${COURSE_OPENS_ON}.`)
  })

  it("renders the unchanged waitlist form: name, email and the button", () => {
    render(<WaitlistNext />)
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Join the waitlist" })).toBeInTheDocument()
  })

  it("sends invited testers to sign-up and everyone else to the free lesson, and nowhere else", () => {
    const { container } = render(<WaitlistNext />)
    expect(screen.getByRole("link", { name: "Create your account" })).toHaveAttribute("href", "/signup")
    expect(screen.getByRole("link", { name: "Try the free lesson" })).toHaveAttribute("href", "/start-here")
    expect(container.querySelectorAll("a")).toHaveLength(2)
  })

  it("says what happens next in three steps", () => {
    const { container } = render(<WaitlistNext />)
    expect(screen.getByRole("heading", { level: 2, name: "What happens next" })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-section="next"] ol li')).toHaveLength(3)
  })

  it("uses no dash or section sign, and describes nobody by age", () => {
    const { container } = render(<WaitlistNext />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/[–—§]/)
    expect(text).not.toMatch(/\badults?\b/i)
  })

  it("is the component the /waitlist route renders, with its metadata kept", async () => {
    const { default: WaitlistPage, metadata } = await import("@/app/(public)/waitlist/page")
    cleanup()
    render(<WaitlistPage />)
    expect(screen.getByTestId("waitlist-opens")).toBeInTheDocument()
    expect(metadata.title).toBe("Join the Waitlist")
  })
})
