/**
 * ENABLE_SEARCH was declared in config and read by nothing, so turning it off
 * would have left the header's Search button in place, wired to a palette the
 * layout no longer mounts - the exact shape of the defect this bead is about
 * (gwth-launch-4fg). This pins the flag to the buttons.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"

const flag = vi.hoisted(() => ({ enabled: true }))

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock("@/lib/actions/auth", () => ({ signOut: vi.fn() }))
vi.mock("@/lib/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/config")>()
  return {
    ...actual,
    get ENABLE_SEARCH() {
      return flag.enabled
    },
  }
})

const { DashboardHeader } = await import("./header")

beforeEach(() => {
  cleanup()
  flag.enabled = true
})

describe("ENABLE_SEARCH", () => {
  it("shows both search triggers when on", () => {
    render(<DashboardHeader userName="David Uccelli" />)
    expect(screen.getByRole("button", { name: /^search⌘k$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^search$/i })).toBeInTheDocument()
  })

  it("leaves no dead button behind when off", () => {
    flag.enabled = false
    render(<DashboardHeader userName="David Uccelli" />)
    expect(screen.queryByRole("button", { name: /search/i })).toBeNull()
  })
})
