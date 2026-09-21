/**
 * gwth-launch-4fg: "what does search do - nothing - so there's no way of using
 * this search button at the top, it's just there for show" (David, recording
 * the live site 2026-07-27).
 *
 * The cause was that `useSearch` held its open flag in a per-component
 * `useState`, so the header and the palette each owned a private copy and the
 * button's `open()` reached nothing. The regression is invisible to any test
 * that renders the palette on its own, so this file renders the REAL header
 * next to the REAL palette and clicks the button a learner clicks.
 */
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DashboardHeader } from "@/components/layout/header"
import { SearchPalette } from "./search-palette"
import type { SearchIndex } from "@/lib/data/search-index"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push }),
}))

vi.mock("@/lib/actions/auth", () => ({
  signOut: vi.fn(),
}))

const index: SearchIndex = {
  courses: [
    { id: "course_gwth", title: "Applied AI Skills", href: "/course/applied-ai-skills" },
  ],
  lessons: [
    {
      id: "m1_l01",
      title: "Welcome to GWTH",
      href: "/course/applied-ai-skills/lesson/welcome-to-gwth",
    },
    {
      id: "m1_l02",
      title: "Your AI Toolkit",
      href: "/course/applied-ai-skills/lesson/your-ai-toolkit",
    },
  ],
  labs: [{ id: "lab_1", title: "The Messy Spreadsheet", href: "/labs/messy-spreadsheet" }],
  news: [],
}

/**
 * The header renders two triggers: the desktop field (labelled "Search ⌘K")
 * and an icon button for narrow screens. Both must open the palette, so the
 * tests address them separately rather than taking whichever comes first.
 */
const DESKTOP_TRIGGER = /^search⌘k$/i
const MOBILE_TRIGGER = /^search$/i

/** The dashboard frame as the layout assembles it: header above, palette below. */
function renderFrame() {
  return render(
    <>
      <DashboardHeader userName="David Uccelli" userEmail="david@example.com" />
      <SearchPalette index={index} />
    </>
  )
}

afterEach(() => {
  // The store lives at module scope, so a case that leaves the palette open
  // leaks into the next one - and an open Radix dialog marks the rest of the
  // document aria-hidden, which hides the header button from every query.
  // This must run BEFORE cleanup: unmounting drops the last subscriber, and
  // with it the document key listener that Escape needs.
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    )
  })
  cleanup()
  push.mockReset()
})

describe("the header Search button", () => {
  it("opens the palette", async () => {
    const user = userEvent.setup()
    renderFrame()

    expect(screen.queryByPlaceholderText(/Search lessons, labs, pages/i)).toBeNull()

    await user.click(screen.getByRole("button", { name: DESKTOP_TRIGGER }))

    expect(
      await screen.findByPlaceholderText(/Search lessons, labs, pages/i)
    ).toBeInTheDocument()
  })

  it("opens from the narrow-screen icon button too", async () => {
    const user = userEvent.setup()
    renderFrame()

    await user.click(screen.getByRole("button", { name: MOBILE_TRIGGER }))

    expect(
      await screen.findByPlaceholderText(/Search lessons, labs, pages/i)
    ).toBeInTheDocument()
  })

  it("lets a learner type a lesson title and go to it", async () => {
    const user = userEvent.setup()
    renderFrame()

    await user.click(screen.getByRole("button", { name: DESKTOP_TRIGGER }))
    const input = await screen.findByPlaceholderText(/Search lessons, labs, pages/i)

    await user.type(input, "toolkit")

    const hit = await screen.findByRole("option", { name: /Your AI Toolkit/i })
    await user.click(hit)

    expect(push).toHaveBeenCalledWith("/course/applied-ai-skills/lesson/your-ai-toolkit")
  })

  it("filters down to what was typed", async () => {
    const user = userEvent.setup()
    renderFrame()

    await user.click(screen.getByRole("button", { name: DESKTOP_TRIGGER }))
    const input = await screen.findByPlaceholderText(/Search lessons, labs, pages/i)
    await user.type(input, "spreadsheet")

    expect(await screen.findByRole("option", { name: /The Messy Spreadsheet/i })).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: /Welcome to GWTH/i })).toBeNull()
    )
  })

  it("forgets the previous query when the palette is reopened", async () => {
    const user = userEvent.setup()
    renderFrame()

    await user.click(screen.getByRole("button", { name: DESKTOP_TRIGGER }))
    await user.type(
      await screen.findByPlaceholderText(/Search lessons, labs, pages/i),
      "spreadsheet"
    )
    await user.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/Search lessons, labs, pages/i)).toBeNull()
    )

    await user.click(screen.getByRole("button", { name: DESKTOP_TRIGGER }))
    expect(await screen.findByPlaceholderText(/Search lessons, labs, pages/i)).toHaveValue("")
  })
})

describe("the Cmd+K shortcut", () => {
  it("opens once, not once per mounted consumer", async () => {
    const user = userEvent.setup()
    renderFrame()

    // Two components read the store (header and palette). The key listener is
    // bound once for the store, so one press is one toggle; binding it per
    // hook instance would toggle twice and leave the palette shut.
    await user.keyboard("{Meta>}k{/Meta}")

    expect(
      await screen.findByPlaceholderText(/Search lessons, labs, pages/i)
    ).toBeInTheDocument()
  })

  it("closes again on a second press", async () => {
    const user = userEvent.setup()
    renderFrame()

    await user.keyboard("{Meta>}k{/Meta}")
    await screen.findByPlaceholderText(/Search lessons, labs, pages/i)

    await user.keyboard("{Meta>}k{/Meta}")
    await waitFor(() =>
      expect(screen.queryByPlaceholderText(/Search lessons, labs, pages/i)).toBeNull()
    )
  })
})
