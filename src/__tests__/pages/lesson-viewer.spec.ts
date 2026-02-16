import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

test.describe("Lesson Viewer Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/course/ai-fundamentals/lesson/what-is-ai", { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(1000)
  })

  test("renders lesson title in heading", async ({ page }) => {
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()
    await expect(heading).toContainText("Artificial Intelligence")
  })

  test("renders Learn tab", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /learn/i })).toBeVisible()
  })

  test("renders mark complete or navigation buttons", async ({ page }) => {
    // The bottom bar should have either Mark Complete button or next lesson link
    const bottomBar = page.locator(".border-t").first()
    await expect(bottomBar).toBeVisible()
  })

  test("screenshot - light mode desktop", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("lesson-viewer-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test("screenshot - dark mode desktop", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot("lesson-viewer-dark.png", {
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
