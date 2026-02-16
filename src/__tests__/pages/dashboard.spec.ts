import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(1000)
  })

  test("renders sidebar navigation on desktop", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Sidebar is hidden on mobile")
    const sidebar = page.locator("aside, nav").filter({ hasText: /courses/i }).first()
    await expect(sidebar).toBeVisible()
  })

  test("renders course cards", async ({ page }) => {
    // Use heading specifically to avoid matching badge text
    const courseHeading = page.locator("h3").filter({ hasText: "AI Fundamentals" }).first()
    await expect(courseHeading).toBeVisible()
  })

  test("renders study streak section", async ({ page }) => {
    await expect(page.getByText(/study streak/i).first()).toBeVisible()
  })

  test("screenshot - light mode desktop", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("dashboard-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test("screenshot - dark mode desktop", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("dashboard-dark.png", {
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
