import { cleanup, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { LegalFde } from "@/components/marketing/legal-fde/legal-fde"
import PrivacyPage from "@/app/(public)/privacy/page"
import TermsPage from "@/app/(public)/terms/page"
import { LegalNext } from "./legal-next"

afterEach(cleanup)

const CSS = readFileSync(join(__dirname, "legal-next.module.css"), "utf8")
const STRIPPED = CSS.replace(/\/\*[\s\S]*?\*\//g, "")

const SAMPLE = (
  <>
    <p>Opening paragraph.</p>
    <h2 id="one">1. First section</h2>
    <p>Some text with a number, 75%.</p>
    <h2 id="two">2. Second section</h2>
    <ul>
      <li>An item.</li>
    </ul>
  </>
)

describe("LegalNext, the shell for /terms and /privacy", () => {
  it("renders exactly the text the old shell rendered when given no contents list", () => {
    const next = render(<LegalNext title="A title" updated="1 January 2027">{SAMPLE}</LegalNext>)
    const nextText = next.container.textContent
    cleanup()
    const old = render(<LegalFde title="A title" updated="1 January 2027">{SAMPLE}</LegalFde>)
    expect(nextText).toBe(old.container.textContent)
  })

  it("adds only the contents list when given one, before the unchanged text", () => {
    const { container } = render(
      <LegalNext
        title="A title"
        updated="1 January 2027"
        contents={[
          { id: "one", label: "First section" },
          { id: "two", label: "Second section" },
        ]}
      >
        {SAMPLE}
      </LegalNext>
    )
    const nav = screen.getByRole("navigation", { name: "Table of contents" })
    expect(within(nav).getByRole("link", { name: "First section" })).toHaveAttribute("href", "#one")
    expect(within(nav).getByRole("link", { name: "Second section" })).toHaveAttribute("href", "#two")
    nav.remove()
    const withoutList = container.textContent
    cleanup()
    const old = render(<LegalFde title="A title" updated="1 January 2027">{SAMPLE}</LegalFde>)
    expect(withoutList).toBe(old.container.textContent)
  })

  it("keeps one h1, with the updated date under it", () => {
    render(<LegalNext title="A title" updated="1 January 2027">{SAMPLE}</LegalNext>)
    expect(screen.getByRole("heading", { level: 1, name: "A title" })).toBeInTheDocument()
    expect(screen.getByText("Updated 1 January 2027")).toBeInTheDocument()
  })
})

describe("/terms in the new shell", () => {
  it("leaves its own contents list where it is in the text: after the opening paragraph", () => {
    const { container } = render(<TermsPage />)
    const text = container.querySelector("[data-legal-text]")!
    expect(text.children[0]!.tagName).toBe("P")
    expect(text.children[1]!.tagName).toBe("NAV")
    expect(text.children[2]!.tagName).toBe("H2")
    expect(screen.getAllByRole("navigation", { name: /table of contents/i })).toHaveLength(1)
  })

  it("has a section to land on for every entry in its contents list", () => {
    const { container } = render(<TermsPage />)
    const links = [...container.querySelectorAll<HTMLAnchorElement>('nav a[href^="#"]')]
    expect(links).toHaveLength(18)
    for (const link of links) {
      const target = container.querySelector(link.getAttribute("href")!)
      expect(target?.tagName, link.textContent ?? "").toBe("H2")
    }
  })
})

describe("/privacy in the new shell", () => {
  it("lists every section heading, in order, without its number", () => {
    const { container } = render(<PrivacyPage />)
    const headings = [...container.querySelectorAll("[data-legal-text] h2")]
    const links = [...container.querySelectorAll<HTMLAnchorElement>("[data-legal-contents] a")]
    expect(headings.length).toBeGreaterThanOrEqual(11)
    expect(links).toHaveLength(headings.length)
    headings.forEach((heading, index) => {
      const link = links[index]!
      expect(link.getAttribute("href")).toBe(`#${heading.id}`)
      expect(heading.textContent).toBe(`${index + 1}. ${link.textContent}`)
    })
  })

  it("adds nothing to the page but that list", () => {
    const { container } = render(<PrivacyPage />)
    const added = container.querySelector("[data-legal-contents]")!
    const headings = [...container.querySelectorAll("[data-legal-text] h2")].map((h) =>
      (h.textContent ?? "").replace(/^\d+\. /, "")
    )
    expect(added.textContent).toBe(`Table of contents${headings.join("")}`)
  })
})

describe("the legal stylesheet", () => {
  it("uses only tokens for colour on screen (black only on paper)", () => {
    const screenCss = STRIPPED.slice(0, STRIPPED.indexOf("@media print"))
    expect(screenCss).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(screenCss).not.toMatch(/rgba?\(|\bblack\b|\bwhite\b/)
  })

  it("keeps a comfortable measure", () => {
    expect(STRIPPED).toMatch(/\.prose\s*\{[^}]*max-width:\s*66ch/)
  })

  it("lands a jump from the contents list clear of the page header", () => {
    expect(STRIPPED).toMatch(/\.prose h2\s*\{[^}]*scroll-margin-top/)
  })

  it("has print styles: no menu or footer, no stranded heading", () => {
    const print = STRIPPED.slice(STRIPPED.indexOf("@media print"))
    expect(print).toMatch(/:global\(header\)/)
    expect(print).toMatch(/:global\(footer\)/)
    expect(print).toMatch(/break-after:\s*avoid/)
    expect(print).toMatch(/orphans:\s*3/)
  })
})
