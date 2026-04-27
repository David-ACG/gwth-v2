import { test, expect } from "@playwright/test"

const SECTIONS = ["hero", "research-strip", "journey"] as const
const THEMES = ["light", "dark"] as const

const MASK_SELECTORS = [
  '[data-role="score-ring-progress"]',
  '[data-role="score-halo"]',
  '[data-role="sparkline"]',
  '[data-role="score-pulse"]',
  '[data-role="hero-spirals"]',
  '[data-mask="date"]',
]

test.describe("Marketing per-section snapshots", () => {
  for (const section of SECTIONS) {
    for (const theme of THEMES) {
      test(`${section} — ${theme}`, async ({ page }, testInfo) => {
        // Mobile baselines are local-only — Linux/Win32 subpixel drift
        // causes flake on CI for the mobile projects.
        test.skip(
          !!process.env.CI &&
            ["mobile-chromium", "mobile-dark"].includes(testInfo.project.name),
          "Mobile snapshots are local-only — Linux/Win32 subpixel drift causes flake on CI."
        )

        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        })
        await page.goto("/", { waitUntil: "domcontentloaded" })
        await page.waitForLoadState("networkidle").catch(() => {})
        await page.evaluate(() => document.fonts.ready)

        const target = page.locator(`[data-section="${section}"]`)
        await target.scrollIntoViewIfNeeded()
        await page.waitForTimeout(300)

        const masks = MASK_SELECTORS.flatMap((sel) => {
          const loc = page.locator(sel)
          return loc
        })

        await expect(target).toHaveScreenshot(`${section}-${theme}.png`, {
          mask: masks,
          animations: "disabled",
          maxDiffPixels: 200,
          threshold: 0.2,
        })
      })
    }
  }
})
