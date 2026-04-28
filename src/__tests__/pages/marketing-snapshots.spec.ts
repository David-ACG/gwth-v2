import { test, expect } from "@playwright/test"

const SECTIONS = [
  "nav",
  "hero",
  "research-strip",
  "journey",
  "pillars",
  "curriculum-vis",
  "score-vis",
  "prompt-vis",
  "research-stats",
  "pricing",
  "final-cta",
  "footer",
] as const
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
        // Mobile snapshot tests are skipped by default — Pixel 5 emulation
        // exhibits non-deterministic Motion + hover-state subpixel drift
        // that flakes even with retries and the mouse parked off-canvas.
        // Run them on demand with `MOBILE_SNAPSHOTS=1 npx playwright test
        // marketing-snapshots --project=mobile-chromium --update-snapshots`
        // when intentionally regenerating mobile baselines.
        const isMobileProject = ["mobile-chromium", "mobile-dark"].includes(
          testInfo.project.name
        )
        test.skip(
          isMobileProject && !process.env.MOBILE_SNAPSHOTS,
          "Mobile snapshots are skipped by default — set MOBILE_SNAPSHOTS=1 to run."
        )

        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        })
        // Pre-set next-themes' localStorage entry so the html element
        // gets `class="dark"` synchronously on first paint (avoids the
        // theme-application race that flakes parallel runs).
        await page.addInitScript((t) => {
          try {
            localStorage.setItem("theme", t)
          } catch {
            /* localStorage unavailable in some contexts — fine */
          }
        }, theme)
        await page.goto("/", { waitUntil: "domcontentloaded" })
        await page.waitForLoadState("networkidle").catch(() => {})
        await page.evaluate(() => document.fonts.ready)

        // Confirm the html element is in the expected theme before
        // continuing — guards against next-themes hydration races.
        await page.waitForFunction(
          (expected) => {
            const html = document.documentElement
            return expected === "dark"
              ? html.classList.contains("dark")
              : !html.classList.contains("dark")
          },
          theme,
          { timeout: 5000 }
        )

        const target = page.locator(`[data-section="${section}"]`)
        await target.scrollIntoViewIfNeeded()
        // Park the mouse off-canvas so no card is in hover state during
        // the screenshot — without this, hover/transform/shadow drift
        // breaks parity on the journey + pillars grids in mobile viewports.
        await page.mouse.move(0, 0)
        // Allow Motion's whileInView re-render and any hover-state
        // transitions to settle.
        await page.waitForTimeout(800)

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
