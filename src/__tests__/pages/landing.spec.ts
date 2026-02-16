import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" })
    // Wait for any animations to settle
    await page.waitForTimeout(1000)
  })

  test("renders hero section with heading", async ({ page }) => {
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()
  })

  test("renders navigation", async ({ page }) => {
    await expect(page.locator("nav").first()).toBeVisible()
  })

  test("renders footer", async ({ page }) => {
    const footer = page.locator("footer")
    await expect(footer).toBeVisible()
  })

  test("screenshot - light mode desktop", async ({ page }) => {
    // Disable animations for stable screenshots
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("landing-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test("screenshot - dark mode desktop", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("landing-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test("should not have critical accessibility violations", async ({
    page,
  }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"])
      .analyze()

    expect(results.violations.filter((v) => v.impact === "critical")).toEqual(
      []
    )
  })
})
