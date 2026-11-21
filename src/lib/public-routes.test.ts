import { afterEach, describe, expect, it, vi } from "vitest"
import { isHiddenPublicPath, isOffMenu } from "./public-routes"

// Launch readiness, David 2026-10-20: "Use your recommendations for all 30
// pages (1 Ready, 21 Fix, 8 Hide)". Hidden pages 404 and leave the menus;
// /for-institutions was unlisted for a day, then made visible again.
describe("public routes at launch", () => {
  it("hides the pages judged Hide, and everything below them", () => {
    for (const p of ["/news", "/news/a-story", "/tech-radar", "/newsletter", "/verify/ABC", "/score/123"]) {
      expect(isHiddenPublicPath(p)).toBe(true)
    }
  })

  it("leaves every page judged Ready or Fix alone, including look-alikes", () => {
    for (const p of ["/", "/pricing", "/gift", "/lessons", "/labs", "/for-organisations", "/for-institutions", "/for-teams", "/contact", "/newsletters", "/verifying", "/terms"]) {
      expect(isHiddenPublicPath(p)).toBe(false)
    }
  })

  it("keeps /for-institutions visible and on the menus (David, 2026-10-21)", () => {
    // "CIPD are going to help get other institutions to look at the site so
    // it has to be visible."
    expect(isHiddenPublicPath("/for-institutions")).toBe(false)
    expect(isOffMenu("/for-institutions")).toBe(false)
    expect(isOffMenu("/pricing")).toBe(false)
  })
})

describe("the public score page follows the score switch (bead gwth-launch-phjb)", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("hides /verify while the score is off", () => {
    vi.stubEnv("GWTH_SCORE_ENABLED", "")
    expect(isHiddenPublicPath("/verify/abcde23456")).toBe(true)
  })

  it("opens /verify once the score is on, and keeps the old /score demo hidden", () => {
    vi.stubEnv("GWTH_SCORE_ENABLED", "on")
    expect(isHiddenPublicPath("/verify/abcde23456")).toBe(false)
    expect(isHiddenPublicPath("/score/123")).toBe(true)
    expect(isOffMenu("/verify/abcde23456")).toBe(false)
  })
})
