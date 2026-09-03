/**
 * David, 2026-07-26: "When I'm logged in and click on lessons, I don't actually
 * see lessons. I see the advertising page for lessons."
 *
 * The nav link is resolved per viewer on the server (`(public)/layout.tsx`) and
 * passed in, because this is a client component and cannot read the session.
 * These tests pin both halves: anonymous visitors keep the public marketing
 * page (W25 needs /lessons anonymously readable), and an entitled learner is
 * sent to their course instead.
 */
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, within } from "@testing-library/react"
import { PublicNav } from "./public-nav"
import { COURSE_PATH } from "@/lib/config"

let pathname = "/"
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}))
afterEach(() => {
  pathname = "/"
})

vi.mock("@/lib/actions/auth", () => ({
  signOut: vi.fn(),
}))

const USER = { name: "David Uccelli", email: "familyuccelli@gmail.com" }

function renderNav(props: Partial<React.ComponentProps<typeof PublicNav>> = {}) {
  const { container } = render(
    <PublicNav
      user={null}
      showLabs
      lessonsHref="/lessons"
      {...props}
    />
  )
  return within(container)
}

/** Every "The course" link in the nav (desktop row and mobile sheet). */
function lessonsHrefs(view: ReturnType<typeof renderNav>) {
  return view
    .getAllByRole("link", { name: "The course" })
    .map((el) => el.getAttribute("href"))
}

describe("PublicNav lessons link", () => {
  it("points an anonymous visitor at the public marketing page", () => {
    const view = renderNav({ user: null, lessonsHref: "/lessons" })
    const hrefs = lessonsHrefs(view)
    expect(hrefs.length).toBeGreaterThan(0)
    expect(new Set(hrefs)).toEqual(new Set(["/lessons"]))
  })

  it("points an entitled learner at their course, not the advert for it", () => {
    const view = renderNav({ user: USER, lessonsHref: COURSE_PATH })
    const hrefs = lessonsHrefs(view)
    expect(hrefs.length).toBeGreaterThan(0)
    expect(new Set(hrefs)).toEqual(new Set([COURSE_PATH]))
    expect(hrefs).not.toContain("/lessons")
  })

  it("leaves the other nav links alone when the lessons target changes", () => {
    const view = renderNav({ user: USER, lessonsHref: COURSE_PATH })
    expect(
      view.getAllByRole("link", { name: "Pricing" })[0]?.getAttribute("href")
    ).toBe("/pricing")
    expect(
      view.getAllByRole("link", { name: "For teams" })[0]?.getAttribute("href")
    ).toBe("/for-teams")
    expect(
      view
        .getAllByRole("link", { name: "For institutions" })[0]
        ?.getAttribute("href")
    ).toBe("/for-institutions")
  })

  it("still hides Labs when the viewer cannot open them (W25)", () => {
    const view = renderNav({ showLabs: false, lessonsHref: "/lessons" })
    expect(view.queryByRole("link", { name: "Labs" })).toBeNull()
  })
})

describe("PublicNav selected item (M2, N12)", () => {
  it("marks nothing current on the home page", () => {
    pathname = "/"
    const view = renderNav({ lessonsHref: "/lessons" })
    for (const link of view.getAllByRole("link")) {
      expect(link.getAttribute("aria-current")).toBeNull()
    }
  })

  it("marks the current section, including nested routes, and nothing else", () => {
    pathname = "/for-institutions/anything"
    const view = renderNav({ lessonsHref: "/lessons" })
    const current = view
      .getAllByRole("link")
      .filter((el) => el.getAttribute("aria-current") === "page")
    // the desktop row renders; the mobile sheet is a closed portal in jsdom
    expect(current.length).toBeGreaterThanOrEqual(1)
    for (const el of current) {
      expect(el).toHaveTextContent("For institutions")
      expect(el.className).toMatch(/Active/)
    }
  })
})

