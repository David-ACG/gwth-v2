import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup, within } from "@testing-library/react"
import { Footer } from "./footer"

afterEach(cleanup)

/**
 * The footer after /about and /why-gwth were merged (David, 2026-09-28:
 * "merge them into one Why GWTH page"). Before the merge the footer listed
 * both "Why GWTH" and "About GWTH", which became two links to the same page
 * once /about redirected. It must name the page once, at its real address.
 */
describe("Footer links", () => {
  function hrefs() {
    const { container } = render(<Footer showLabs lessonsHref="/lessons" />)
    return within(container)
      .getAllByRole("link")
      .map((el) => el.getAttribute("href") ?? "")
  }

  it("links /why-gwth exactly once", () => {
    expect(hrefs().filter((h) => h === "/why-gwth")).toHaveLength(1)
  })

  it("no longer links the retired /about address", () => {
    expect(hrefs()).not.toContain("/about")
  })

  it("never lists the same page twice", () => {
    const internal = hrefs().filter((h) => h.startsWith("/"))
    expect(new Set(internal).size).toBe(internal.length)
  })
})
