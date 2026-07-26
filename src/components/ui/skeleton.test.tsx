/**
 * David, 2026-07-26: "when I'm in the dashboard or any of the other logged in
 * pages, and I click on something to go to another page, I see a flash of green
 * before it goes to that page. Usually, it's in the shape of the layout of the
 * page I'm going to."
 *
 * That was this component. Every `loading.tsx` in the app is built from
 * Skeletons, and the shadcn default paints them `bg-accent` — which in this
 * theme is a saturated green (`oklch(0.65 0.16 165)` light,
 * `oklch(0.75 0.14 165)` dark). So each route transition flashed green blocks
 * in the shape of the incoming layout. Placeholders use the neutral `--muted`
 * surface instead.
 */
import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { Skeleton } from "./skeleton"

describe("Skeleton", () => {
  it("uses the neutral muted surface, never the green accent", () => {
    const { container } = render(<Skeleton />)
    const el = container.querySelector("[data-slot=skeleton]")
    expect(el).not.toBeNull()
    expect(el!.className).toContain("bg-muted")
    expect(el!.className).not.toContain("bg-accent")
  })

  it("still accepts caller classes for size and shape", () => {
    const { container } = render(<Skeleton className="h-48 rounded-xl" />)
    const el = container.querySelector("[data-slot=skeleton]")!
    expect(el.className).toContain("h-48")
    expect(el.className).toContain("rounded-xl")
  })
})
