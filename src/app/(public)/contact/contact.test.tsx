import { render, screen, cleanup } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"
import ContactPage from "./page"

const FORM_CSS = readFileSync(
  join(
    __dirname,
    "../../../components/marketing/contact-fde/contact-fde.module.css"
  ),
  "utf8"
)

afterEach(cleanup)

describe("ContactPage", () => {
  it("renders the page heading", () => {
    render(<ContactPage />)
    // Queried by accessible name, not by a single text node: the emphasis in
    // the headline is an <em>, so the words span two nodes (batch 1).
    expect(
      screen.getByRole("heading", { level: 1, name: "Get in Touch" })
    ).toBeInTheDocument()
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

describe("gwth-launch-88z.32.15: the dark form boxes are lighter than the page", () => {
  // David, on /contact in dark mode: "The dark version of this doesn't look
  // quite right, it needs some light colour as well, like maybe a lighter
  // background to the boxes." The fields were filled with --v-bg, the page
  // ground, so in dark mode the boxes were the DARKEST thing on the page and
  // read as holes punched in the panel. The ratios themselves are measured in
  // src/app/paper-first-tokens.test.ts, which reads globals.css.
  const stripped = FORM_CSS.replace(/\/\*[\s\S]*?\*\//g, "")
  const rule = (selector: string) => {
    const m = stripped.match(
      new RegExp(`(^|\\})\\s*${selector}\\s*\\{([^{}]*)\\}`, "m")
    )
    expect(m, `no rule for ${selector}`).toBeTruthy()
    return m![2] ?? ""
  }

  it("fills the fields with the quiet fill, never with the page ground", () => {
    const fields = rule("\\.input,\\n\\.textarea")
    expect(fields).toMatch(/background:\s*var\(--v-quiet\)/)
    expect(fields).not.toMatch(/background:\s*var\(--v-bg\)/)
  })

  it("keeps the load-bearing boundary on the box", () => {
    // tint-is-never-the-only-signal: the lighter fill reinforces the box, it
    // never becomes the only thing saying where the box ends.
    expect(rule("\\.input,\\n\\.textarea")).toMatch(
      /border:\s*1px solid var\(--v-line\)/
    )
  })

  it("writes the placeholder in the body ink, not the metadata ink", () => {
    // --v-muted on the quiet fill is 4.31:1 light and 4.05:1 dark, under the
    // 4.5:1 text bar, so the lighter box would have cost placeholder legibility.
    const ph = rule("\\.input::placeholder,\\n\\.textarea::placeholder")
    expect(ph).toMatch(/color:\s*var\(--v-soft\)/)
  })
})
