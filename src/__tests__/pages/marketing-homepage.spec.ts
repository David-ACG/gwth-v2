import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * Full-page smoke for the paper-first home page (N12, 2026-09-03). Sections
 * are the N9 artboard's: hero (with the six-blocks plate and its key),
 * argument, blocks, institution, individuals, plus the shared nav and footer.
 */
const SECTIONS = [
  "nav",
  "hero",
  "argument",
  "blocks",
  "institution",
  "individuals",
  "footer",
] as const

const EXPECTED_INTERNAL_HREFS = [
  "/contact",
  "/for-institutions",
  "/for-teams",
  "/pricing",
  "/lessons",
  "/about",
  "/why-gwth",
  "/waitlist",
  "/newsletter",
  "/privacy",
  "/terms",
] as const

async function gotoHome(page: Page) {
  await page.goto("/", { waitUntil: "domcontentloaded" })
  await page.waitForLoadState("networkidle").catch(() => {})
}

test.describe("Marketing homepage, full-page smoke", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page)
  })

  test("renders the approved N9 headline", async ({ page }) => {
    const h1 = page.locator("h1").first()
    await expect(h1).toBeVisible()
    await expect(h1).toContainText("The gap is not")
    await expect(h1).toContainText("It is depth.")
  })

  test("every data-section resolves exactly once", async ({ page }) => {
    for (const section of SECTIONS) {
      const target = page.locator(`[data-section="${section}"]`)
      await expect(target, `data-section="${section}"`).toHaveCount(1)
    }
  })

  test("renders the Course JSON-LD schema", async ({ page }) => {
    const script = page.locator('script[type="application/ld+json"]').first()
    await expect(script).toBeAttached()
    const content = await script.textContent()
    expect(content).toBeTruthy()
    expect(JSON.parse(content ?? "{}")["@type"]).toBe("Course")
  })

  test("the six-blocks key stays three across at phone width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoHome(page)
    const key = page.getByTestId("six-blocks-key")
    await expect(key).toBeVisible()
    const spans = key.locator("span")
    await expect(spans).toHaveCount(6)
    const tops = await spans.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().top))
    )
    // Two rows of three: exactly two distinct top offsets.
    expect(new Set(tops).size).toBe(2)
  })

  test("every internal link the page carries answers", async ({ page, request }) => {
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""))
    for (const expected of EXPECTED_INTERNAL_HREFS) {
      expect(hrefs, `link to ${expected}`).toContain(expected)
    }
    const unique = [...new Set(hrefs)].filter((h) => !h.startsWith("/#") && !h.includes("#"))
    for (const href of unique) {
      const res = await request.head(href)
      expect(res.status(), `HEAD ${href}`).toBeLessThan(400)
    }
  })

  test("has no serious or critical accessibility violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze()
    const bad = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? "")
    )
    expect(bad, JSON.stringify(bad, null, 2)).toEqual([])
  })
})
