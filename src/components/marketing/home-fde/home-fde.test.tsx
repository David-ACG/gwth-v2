import { render, screen, cleanup, within } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import { HomeFde, ARGUMENT, SIX_BLOCKS } from "./home-fde"

afterEach(cleanup)

describe("HomeFde (paper-first, N12)", () => {
  it("renders the approved N9 headline", () => {
    render(<HomeFde />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "The gap is not access. It is depth."
    )
  })

  it("labels the six-blocks plate on the page, three across, in tile order", () => {
    render(<HomeFde />)
    const key = screen.getByTestId("six-blocks-key")
    const names = within(key)
      .getAllByText(/./)
      .map((el) => el.textContent)
    expect(names).toEqual(SIX_BLOCKS.map((b) => b.name))
  })

  it("carries a light and a dark render for each of the two plates", () => {
    render(<HomeFde />)
    const imgs = screen.getAllByRole("img") as HTMLImageElement[]
    const srcs = imgs.map((img) => img.getAttribute("src") ?? "")
    for (const name of ["six-blocks", "the-gap"]) {
      expect(srcs.some((s) => s.includes(`${name}.png`))).toBe(true)
      expect(srcs.some((s) => s.includes(`${name}-dark.png`))).toBe(true)
    }
  })

  it("cites a source on every figure", () => {
    render(<HomeFde />)
    expect(screen.getAllByTestId("argument-card")).toHaveLength(ARGUMENT.length)
    for (const item of ARGUMENT) {
      expect(screen.getByRole("link", { name: item.source })).toHaveAttribute(
        "href",
        item.href
      )
    }
  })

  it("attributes the six blocks to OpenAI's six use case primitives", () => {
    render(<HomeFde />)
    expect(
      screen.getByRole("link", { name: /six common ways of using AI at work/ })
    ).toHaveAttribute("href", expect.stringContaining("openai.com/business/"))
  })

  it("carries no em dashes, en dashes or section signs (bible emdash-policy)", () => {
    const { container } = render(<HomeFde />)
    expect(container.textContent).not.toMatch(/[–—§]/)
  })
})
