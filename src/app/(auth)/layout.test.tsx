/**
 * Bead gwth-launch-awb. David, 2026-07-25, on the login page: "Logo treatment
 * still does not matche the marketing site - It is mustard and not brown. Copy
 * the home page."
 *
 * The auth masthead once rendered the wordmark with the `onDark` inks (cream
 * and mustard) because it sat on a dark-teal band. That band became the quiet
 * paper fill in the paper-first register (N12), so the wordmark must take
 * exactly the inks the home page nav uses. These tests compare the two
 * rendered logos directly, so any future variant on either side shows up as a
 * mismatch rather than as a third colour nobody chose.
 */
import { describe, it, expect, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { render } from "@testing-library/react"
import AuthLayout from "./layout"
import { PublicNav } from "@/components/layout/public-nav"

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}))
vi.mock("@/lib/actions/auth", () => ({
  signOut: vi.fn(),
}))

/** The fill of every shape in the first GWTH.ai wordmark SVG in `root`. */
function logoFills(root: HTMLElement): string[] {
  const svg = root.querySelector('svg[aria-label="GWTH.ai"]')
  expect(svg, "GWTH.ai wordmark").not.toBeNull()
  return Array.from(svg!.querySelectorAll("[fill]")).map(
    (el) => el.getAttribute("fill") ?? ""
  )
}

describe("auth masthead wordmark", () => {
  it("uses the same inks as the home page nav", () => {
    const auth = render(
      <AuthLayout>
        <p>form</p>
      </AuthLayout>
    )
    const authFills = logoFills(auth.container)
    auth.unmount()

    const nav = render(<PublicNav user={null} showLabs lessonsHref="/lessons" />)
    const homeFills = logoFills(nav.container)

    expect(authFills).toEqual(homeFills)
    expect(authFills).toContain("var(--logo-wordmark)")
    expect(authFills).toContain("var(--logo-accent)")
    expect(authFills.join(" ")).not.toMatch(/on-dark/)
  })

  it("does not redefine the logo inks inside the auth shell", () => {
    const css = readFileSync(
      resolve(process.cwd(), "src/components/auth/auth-fde.module.css"),
      "utf8"
    )
    expect(css).not.toMatch(/--logo-/)
  })
})
