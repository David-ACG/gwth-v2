import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { ContactNext, QUICK_LINKS } from "./contact-next"

afterEach(cleanup)

const CSS = readFileSync(join(__dirname, "form-page.module.css"), "utf8")

describe("ContactNext", () => {
  it("keeps the headline and says how we reply, with no reply time promised", () => {
    const { container } = render(<ContactNext />)
    expect(screen.getByRole("heading", { level: 1, name: "Get in touch" })).toBeInTheDocument()
    const text = (container.textContent ?? "").replace(/\s+/g, " ")
    expect(text).toContain("we'll reply by email")
    expect(text).toContain("show your organisation how the course works, ask in your message")
    expect(text).toContain("GWTH is based in the United Kingdom")
    expect(text).not.toMatch(/within \d|working day|24 hours/i)
  })

  it("renders the unchanged contact form: three fields, the button and the privacy line", () => {
    render(<ContactNext />)
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Message")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send message" })).toBeInTheDocument()
    expect(screen.getByTestId("contact-privacy-note")).toHaveTextContent(
      "We'll only use your details to reply. See our Privacy policy."
    )
  })

  it("points to the pages that answer common questions, and to no lesson", () => {
    render(<ContactNext />)
    for (const link of QUICK_LINKS) {
      expect(screen.getByRole("link", { name: new RegExp(link.title) })).toHaveAttribute("href", link.href)
    }
    expect(QUICK_LINKS.map((l) => l.href)).toEqual(["/pricing#questions", "/gift", "/for-organisations"])
  })

  it("prints no email address, no dash and no section sign", () => {
    const { container } = render(<ContactNext />)
    const text = container.textContent ?? ""
    expect(text).not.toMatch(/[\w.-]+@[\w.-]+\.\w+/)
    expect(text).not.toMatch(/[–—§]/)
  })

  it("has one h1 and nothing above it", () => {
    const { container } = render(<ContactNext />)
    const h1 = container.querySelectorAll("h1")
    expect(h1).toHaveLength(1)
    expect(h1[0]!.previousElementSibling).toBeNull()
  })
})

describe("the form page stylesheet (shared with /waitlist)", () => {
  const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, "")

  it("uses only tokens for colour", () => {
    expect(stripped).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(stripped).not.toMatch(/rgba?\(/)
  })

  it("puts the form straight after the opening lines on a phone", () => {
    expect(stripped).toMatch(/grid-template-areas:\s*"head"\s*"form"\s*"more"/)
  })

  it("moves the arrow only when motion is welcome", () => {
    const outside = stripped.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/g, "")
    expect(outside).not.toMatch(/translateX/)
  })
})
