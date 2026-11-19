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
import { PublicNav, primaryCta } from "./public-nav"
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
      view.getAllByRole("link", { name: "Why GWTH" })[0]?.getAttribute("href")
    ).toBe("/why-gwth")
  })

  it("keeps hidden and unlisted pages off the header (launch readiness, 2026-10-20)", () => {
    // David: "Use your recommendations for all 30 pages (1 Ready, 21 Fix,
    // 8 Hide)". /news and /tech-radar are hidden. The organisations page is
    // on the menu; it replaced For institutions and For teams on 2026-11-19.
    const view = renderNav({ lessonsHref: "/lessons" })
    const hrefs = view.getAllByRole("link").map((el) => el.getAttribute("href"))
    expect(hrefs).toContain("/for-organisations")
    expect(hrefs).not.toContain("/for-institutions")
    expect(hrefs).not.toContain("/for-teams")
    for (const gone of ["/news", "/tech-radar"]) {
      expect(hrefs).not.toContain(gone)
    }
  })

  it("follows the home page: free lesson first, organisations last (David, 19 Nov 2026)", () => {
    // He picked "Free lesson first": Free lesson, The course, Labs, Pricing,
    // Why GWTH, For organisations.
    const view = renderNav({ lessonsHref: "/lessons", showLabs: true })
    const nav = view.getAllByRole("navigation")[0]
    const labels = Array.from(nav?.querySelectorAll("a") ?? [])
      .map((el) => el.textContent?.trim())
      .filter((label) =>
        [
          "Free lesson",
          "The course",
          "Labs",
          "Pricing",
          "Why GWTH",
          "For organisations",
        ].includes(label ?? "")
      )
    expect(labels.slice(0, 6)).toEqual([
      "Free lesson",
      "The course",
      "Labs",
      "Pricing",
      "Why GWTH",
      "For organisations",
    ])
    expect(
      view.getAllByRole("link", { name: "Free lesson" })[0]
    ).toHaveAttribute("href", "/start-here")
  })

  it("links the merged Why GWTH page and no longer links /about (2026-09-28)", () => {
    // David merged /about into /why-gwth: "merge them into one Why GWTH page".
    // /about now 308s there (next.config.ts), so the nav points straight at
    // the page rather than through the redirect.
    const view = renderNav({ lessonsHref: "/lessons" })
    const why = view.getAllByRole("link", { name: "Why GWTH" })
    expect(why.length).toBeGreaterThan(0)
    for (const link of why) expect(link.getAttribute("href")).toBe("/why-gwth")
    const hrefs = view.getAllByRole("link").map((el) => el.getAttribute("href"))
    expect(hrefs).not.toContain("/about")
    expect(view.queryByRole("link", { name: /^about$/i })).toBeNull()
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
    pathname = "/why-gwth/anything"
    const view = renderNav({ lessonsHref: "/lessons" })
    const current = view
      .getAllByRole("link")
      .filter((el) => el.getAttribute("aria-current") === "page")
    // the desktop row renders; the mobile sheet is a closed portal in jsdom
    expect(current.length).toBeGreaterThanOrEqual(1)
    for (const el of current) {
      expect(el).toHaveTextContent("Why GWTH")
      expect(el.className).toMatch(/Active/)
    }
  })
})


/**
 * David, 2026-09-14, annotation a-20260914-193923-87ad97, anchored on the
 * header's "Book a walkthrough" button: *"I would only do a walkthrough if it
 * was a large organisation like CIPD, I wouldn't do it for a small company or
 * a single person, as it wouldn't be worth it, it would take an hour of my
 * time."* The header button is the one CTA every public page carries, so a
 * single global walkthrough offered his hour to everybody.
 */
describe("PublicNav primary CTA follows the audience", () => {
  const SELF_SERVE_ROUTES = [
    "/",
    "/pricing",
    "/lessons",
    "/labs",
    "/news",
    "/waitlist",
    "/why-gwth",
    "/newsletter",
    "/privacy",
    "/terms",
    "/verify",
    "/tech-radar",
    // /contact left the institution list on 2026-10-20: its walkthrough button
    // pointed at the page the visitor was already on.
    "/contact",
  ]
  const INSTITUTION_ROUTES = [
    "/for-organisations",
    "/for-organisations/anything",
    "/for-institutions",
    "/for-teams",
    "/for-institutions/anything",
  ]

  it("offers the walkthrough on the institution-facing routes only", () => {
    for (const route of INSTITUTION_ROUTES) {
      expect(primaryCta(route)).toEqual({
        href: "/contact",
        label: "Book a walkthrough",
      })
    }
  })

  it("offers the self-service route everywhere else", () => {
    for (const route of SELF_SERVE_ROUTES) {
      expect(primaryCta(route)).toEqual({
        href: "/waitlist",
        label: "Join the waitlist",
      })
    }
  })

  it("leads to the prices once sales open (1 December 2026)", () => {
    for (const route of SELF_SERVE_ROUTES) {
      expect(primaryCta(route, true)).toEqual({
        href: "/pricing",
        label: "Join the course",
      })
    }
    for (const route of INSTITUTION_ROUTES) {
      expect(primaryCta(route, true)).toEqual({
        href: "/contact",
        label: "Book a walkthrough",
      })
    }
  })

  it("renders the self-service CTA in the header on the home page", () => {
    pathname = "/"
    const view = renderNav({ lessonsHref: "/lessons" })
    expect(
      view.getAllByRole("link", { name: "Join the waitlist" })[0]
    ).toHaveAttribute("href", "/waitlist")
    expect(view.queryByRole("link", { name: "Book a walkthrough" })).toBeNull()
  })

  it("renders the walkthrough CTA in the header on /for-organisations", () => {
    pathname = "/for-organisations"
    const view = renderNav({ lessonsHref: "/lessons" })
    expect(
      view.getAllByRole("link", { name: "Book a walkthrough" })[0]
    ).toHaveAttribute("href", "/contact")
    expect(view.queryByRole("link", { name: "Join the waitlist" })).toBeNull()
  })

  it("shows no CTA at all to a signed-in viewer, on either kind of route", () => {
    pathname = "/for-institutions"
    const view = renderNav({ user: USER, lessonsHref: COURSE_PATH })
    expect(view.queryByRole("link", { name: "Book a walkthrough" })).toBeNull()
    expect(view.queryByRole("link", { name: "Join the waitlist" })).toBeNull()
  })
})
