import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * The Model Lab pages (David, 2026-10-21, option A) in a real browser: the
 * /labs index with its cost chart, and a lab page with its blind answers, its
 * table and its sandboxed apps.
 *
 * These are the checks a component test cannot make: that nothing pushes the
 * page sideways on a phone, that the pick and the row toggle work with real
 * hydration and a real fetch, that a model-written file comes back with the
 * sandbox policy, and that no page ships a serious accessibility violation.
 * Deliberately not snapshots: the copy is still going through its writing
 * check.
 *
 * Run against a server with private content mode off, e.g.
 * `PRIVATE_CONTENT_MODE=off npx next start -p 3107` and
 * `PLAYWRIGHT_BASE_URL=http://localhost:3107 npx playwright test labs.spec.ts`.
 */

const INDEX = "/labs"
const THINKING = "/labs/thinking"
const BUILDING = "/labs/building"

/** True when the document is wider than its own viewport. */
async function overflowsSideways(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  )
}

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).include("main").analyze()
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.length}`)
}

test.describe("Labs index", () => {
  test("shows the six labs and the cost chart, highest score first", async ({ page }) => {
    await page.goto(INDEX)
    const cards = page.locator("main").getByTestId("model-lab-card")
    await expect(cards).toHaveCount(6)
    await expect(cards.first()).toHaveAttribute("href", "/labs/research")
    const chart = page.locator("main").getByTestId("labs-cost-chart")
    await expect(chart).toBeVisible()
    const rows = chart.getByRole("listitem")
    expect(await rows.count()).toBeGreaterThan(30)
    await expect(chart.getByText("premium").first()).toBeVisible()
  })

  test("fits the screen and has no serious accessibility violations", async ({ page }) => {
    await page.goto(INDEX)
    expect(await overflowsSideways(page)).toBe(false)
    expect(await seriousViolations(page)).toEqual([])
  })
})

test.describe("A lab page", () => {
  test("hides the names until a pick, then reveals them all", async ({ page }) => {
    await page.goto(THINKING)
    await expect(page.locator("main").getByTestId("lab-answer")).toHaveCount(4)
    await expect(page.locator("main").getByTestId("lab-reveal")).toHaveCount(0)
    await page.getByRole("button", { name: "I would use answer C" }).click()
    await expect(page.locator("main").getByTestId("lab-reveal")).toHaveCount(4)
    await expect(page.getByTestId("lab-result")).toContainText("You chose answer C")
  })

  test("opens a row's written answer from the server", async ({ page }) => {
    await page.goto(THINKING)
    // Held by aria-controls: the button's name changes to "Hide" once open.
    const first = page.locator("main table").getByRole("button", { name: /^Answer from / }).first()
    const id = await first.getAttribute("aria-controls")
    const button = page.locator(`main table button[aria-controls="${id}"]`)
    await button.click()
    await expect(button).toHaveAttribute("aria-expanded", "true")
    await expect(page.locator(`#${id} .lesson-prose`).first()).toBeVisible()
    await button.click()
    await expect(page.locator(`#${id}`)).toBeHidden()
  })

  test("frames Building apps sandboxed, and serves them with the sandbox policy", async ({
    page,
    request,
  }) => {
    await page.goto(BUILDING)
    const frames = page.locator("main iframe")
    const count = await frames.count()
    for (let i = 0; i < count; i++) {
      await expect(frames.nth(i)).toHaveAttribute("sandbox", "allow-scripts allow-forms allow-modals")
    }
    const tryIt = page.getByRole("link", { name: "Try it" }).first()
    const href = await tryIt.getAttribute("href")
    expect(href).toMatch(/^\/labs-files\/.+\/index\.html$/)
    const res = await request.get(href!)
    expect(res.status()).toBe(200)
    expect(res.headers()["content-security-policy"]).toMatch(/^sandbox allow-scripts allow-forms allow-modals;/)
    expect(res.headers()["content-security-policy"]).toContain("connect-src 'none'")
  })

  test("redirects an old Arena lab to the lab that replaced it", async ({ request }) => {
    const res = await request.get("/labs/messy-spreadsheet-claude-vs-chatgpt", { maxRedirects: 0 })
    expect(res.status()).toBe(308)
    expect(res.headers()["location"]).toMatch(/\/labs\/data$/)
  })

  test("is a 404 for an unknown lab", async ({ request }) => {
    const res = await request.get("/labs/build-mcp-server")
    expect(res.status()).toBe(404)
  })

  for (const path of [THINKING, BUILDING]) {
    test(`${path} fits the screen and has no serious accessibility violations`, async ({ page }) => {
      await page.goto(path)
      expect(await overflowsSideways(page)).toBe(false)
      expect(await seriousViolations(page)).toEqual([])
    })
  }
})
