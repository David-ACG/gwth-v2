import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * The merged Why GWTH page, in a real browser (2026-09-28). David: "merge them
 * into one Why GWTH page". /about and /why-gwth became one page at /why-gwth,
 * and /about permanently redirects there.
 *
 * The copy's meaning is asserted next to the component, in
 * `why-gwth-fde.test.tsx`. What only a browser can check is here: the
 * redirect, that nothing scrolls sideways on a phone (the comparison table
 * stacks), that the government source links work from the keyboard, and that
 * neither theme ships a serious accessibility violation. Replaces the old
 * `about.spec.ts`, whose page no longer exists.
 */

const WHY = "/why-gwth"

const SECTIONS = [
  "masthead",
  "reasons",
  "government",
  "uk",
  "founder",
  "closing",
] as const

async function gotoWhy(page: Page) {
  await page.goto(WHY, { waitUntil: "domcontentloaded" })
  await page.waitForLoadState("networkidle").catch(() => {})
}

/** True when the document is wider than its own viewport. */
async function overflowsSideways(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1
  )
}

test.describe("/about redirect", () => {
  test("answers 308 and points at /why-gwth", async ({ request }) => {
    const res = await request.get("/about", { maxRedirects: 0 })
    expect(res.status()).toBe(308)
    expect(new URL(res.headers()["location"] ?? "", "http://x").pathname).toBe(
      WHY
    )
  })

  test("lands a visitor on the Why GWTH page", async ({ page }) => {
    await page.goto("/about", { waitUntil: "domcontentloaded" })
    await expect(page).toHaveURL(/\/why-gwth$/)
    await expect(page.locator("h1").first()).toContainText("Why learn AI")
  })
})

test.describe("Why GWTH page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoWhy(page)
  })

  test("has the page title", async ({ page }) => {
    await expect(page).toHaveTitle(/^Why GWTH/)
  })

  test("every section resolves exactly once", async ({ page }) => {
    for (const section of SECTIONS) {
      await expect(
        page.locator("main").locator(`[data-section="${section}"]`),
        `data-section="${section}"`
      ).toHaveCount(1)
    }
  })

  test("shows no video placeholder", async ({ page }) => {
    await expect(page.locator("main video, main iframe")).toHaveCount(0)
  })

  test("the nav links the page as Why GWTH, not About", async ({ page }) => {
    const nav = page.locator("header, nav").first()
    await expect(nav.getByRole("link", { name: "Why GWTH" }).first()).toHaveAttribute(
      "href",
      WHY
    )
    await expect(page.locator('a[href="/about"]')).toHaveCount(0)
  })

  test("the government sources are real links and work from the keyboard", async ({
    page,
  }) => {
    const links = page.locator("main").getByTestId("why-gwth-sources").getByRole("link")
    const count = await links.count()
    expect(count).toBeGreaterThanOrEqual(2)
    for (let i = 0; i < count; i++) {
      const link = links.nth(i)
      expect(await link.getAttribute("href")).toMatch(
        /^https:\/\/(www\.gov\.uk|www\.ons\.gov\.uk)\//
      )
      await expect(link).toHaveAttribute("rel", /noopener/)
      await link.focus()
      await expect(link).toBeFocused()
    }
  })

  test("nothing scrolls sideways at phone width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoWhy(page)
    expect(await overflowsSideways(page)).toBe(false)
  })

  test("no serious accessibility violation, in either theme", async ({ page }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme })
      await page.evaluate((value) => {
        document.documentElement.classList.toggle("dark", value === "dark")
      }, theme)
      const results = await new AxeBuilder({ page })
        .exclude("#gwth-review-root")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      )
      expect(
        serious.map((v) => `${theme}: ${v.id}`),
        `serious violations in ${theme}`
      ).toEqual([])
    }
  })
})
