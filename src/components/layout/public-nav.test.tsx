/**
 * Tests for the public navigation bar, focused on the accessible name of the
 * icon-only avatar / user-menu trigger shown to authenticated users.
 */
import { afterEach, describe, it, expect, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}))

import { PublicNav } from "./public-nav"

afterEach(cleanup)

const user = { name: "Ada Lovelace", email: "ada@example.com" }

describe("PublicNav avatar / user menu trigger", () => {
  it("exposes the icon-only avatar button by its accessible name", () => {
    render(<PublicNav user={user} />)

    // Assistive tech resolves the button through the accessibility-name
    // computation. getByRole with a name filter mirrors that exactly: it only
    // matches because of the aria-label added to the icon-only trigger.
    const trigger = screen.getByRole("button", { name: /open user menu/i })

    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute("aria-label", "Open user menu")
  })

  it("keeps the trigger reachable even though its only visible content is initials", () => {
    render(<PublicNav user={user} />)

    // The visible content is just the avatar initials; without an accessible
    // name a screen reader would announce an unlabelled button.
    expect(screen.getByText("AL")).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /open user menu/i })
    ).not.toBeNull()
  })

  it("does not render the avatar trigger for anonymous visitors", () => {
    render(<PublicNav user={null} />)

    expect(
      screen.queryByRole("button", { name: /open user menu/i })
    ).toBeNull()
  })
})
