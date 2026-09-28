import { describe, it, expect } from "vitest"
import nextConfig from "../next.config"

/**
 * /about was merged into /why-gwth on 2026-09-28 (David: "merge them into one
 * Why GWTH page"). Old links, bookmarks and search results must keep working,
 * so /about answers with a PERMANENT redirect. Next serves `permanent: true`
 * as 308, which keeps the method and tells search engines the move is final.
 */
describe("next.config redirects", () => {
  it("sends /about permanently to /why-gwth", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? []
    const about = redirects.filter((r) => r.source === "/about")
    expect(about).toHaveLength(1)
    expect(about[0]).toMatchObject({
      source: "/about",
      destination: "/why-gwth",
      permanent: true,
    })
  })

  it("does not also keep an /about page that the redirect would shadow", async () => {
    const { existsSync } = await import("node:fs")
    const { join } = await import("node:path")
    expect(
      existsSync(join(__dirname, "app", "(public)", "about", "page.tsx"))
    ).toBe(false)
  })
})
