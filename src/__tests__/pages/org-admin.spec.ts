import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * /org — the institution admin screens (N7).
 *
 * These run against the preview path: a sessionless request in a mock
 * environment resolves the fixture CIPD edition (see
 * src/lib/data/org-admin-fixtures.ts), which is exactly how the screens are
 * reviewable without provisioning an institution. The authority rules
 * themselves are pinned in vitest (src/lib/actions/org-admin.test.ts) and
 * against a live Postgres (src/db/org-admin.db.test.ts,
 * src/db/org-roster-privacy.db.test.ts) — a browser cannot prove a refusal
 * that happens on the server.
 *
 * Against a dev server on a non-default port:
 *   PLAYWRIGHT_BASE_URL=http://localhost:3005 npx playwright test org-admin
 */

const SCREENS = [
  { path: "/org", name: "overview", heading: /CIPD/i },
  { path: "/org/syllabus", name: "syllabus", heading: /Syllabus/i },
  { path: "/org/ratification", name: "ratification", heading: /Ratification/i },
  { path: "/org/learners", name: "learners", heading: /Learners/i },
] as const

test.describe("Institution admin (/org)", () => {
  for (const screen of SCREENS) {
    test.describe(screen.name, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(screen.path, { waitUntil: "domcontentloaded" })
        // Hide the dev-only overlays (Next's build indicator and the
        // month-state switcher). They are absent from any real deployment, so
        // leaving them in would make both the baselines and the axe scan
        // depend on which mode the server happens to be running in.
        await page.addStyleTag({
          content:
            "nextjs-portal, [data-section='dev-state-switcher'] { display: none !important; }",
        })
        await page.waitForTimeout(500)
      })

      test("renders its heading", async ({ page }) => {
        await expect(page.locator("h1").first()).toHaveText(screen.heading)
      })

      test("shows the co-branded masthead, GWTH first", async ({ page }) => {
        const header = page.locator("header").first()
        await expect(header).toContainText("GWTH")
        await expect(header).toContainText("Curated by CIPD")
      })

      test("says on its face that it is a preview", async ({ page }) => {
        await expect(
          page.locator('[data-section="org-preview-banner"]')
        ).toBeVisible()
      })

      test("screenshot - light mode", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" })
        await page.waitForTimeout(300)
        await expect(page).toHaveScreenshot(`org-${screen.name}-light.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.05,
        })
      })

      test("screenshot - dark mode", async ({ page }) => {
        await page.emulateMedia({
          colorScheme: "dark",
          reducedMotion: "reduce",
        })
        await page.waitForTimeout(300)
        await expect(page).toHaveScreenshot(`org-${screen.name}-dark.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.05,
        })
      })

      test("has no critical accessibility violations", async ({ page }) => {
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .disableRules(["color-contrast"])
          .analyze()
        expect(
          results.violations.filter((v) => v.impact === "critical")
        ).toEqual([])
      })
    })
  }

  test("the syllabus picker groups lessons by tier", async ({ page }) => {
    await page.goto("/org/syllabus", { waitUntil: "domcontentloaded" })
    for (const tier of ["core", "optional", "exclusive"]) {
      await expect(page.locator(`[data-section="tier-${tier}"]`)).toBeVisible()
    }
  })

  test("core lessons are locked, with the reason on screen", async ({
    page,
  }) => {
    await page.goto("/org/syllabus", { waitUntil: "domcontentloaded" })
    const core = page.locator('[data-section="tier-core"]')
    // No switch at all on a core lesson — the reason is stated instead.
    await expect(core.locator('input[type="checkbox"]')).toHaveCount(0)
    await expect(core).toContainText("in every edition of this course")
  })

  test("optional lessons carry a real, keyboard-operable switch", async ({
    page,
  }) => {
    await page.goto("/org/syllabus", { waitUntil: "domcontentloaded" })
    const toggles = page
      .locator('[data-section="tier-optional"]')
      .locator('input[type="checkbox"]')
    expect(await toggles.count()).toBeGreaterThan(0)
    // Enabled even in preview: the screens demonstrate the real interaction
    // and the SERVER refuses the write with an honest message, rather than
    // showing a wall of greyed-out controls that teaches nothing.
    await expect(toggles.first()).toBeEnabled()
    // Both states are represented in the fixture edition.
    const checkedCount = await page
      .locator('[data-section="tier-optional"] input[type="checkbox"]:checked')
      .count()
    expect(checkedCount).toBeGreaterThan(0)
    expect(checkedCount).toBeLessThan(await toggles.count())
  })

  test("the pass mark is settable and states its consequences", async ({
    page,
  }) => {
    await page.goto("/org/syllabus", { waitUntil: "domcontentloaded" })
    const panel = page.locator('[data-section="pass-mark"]')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText("75%")
    await expect(panel).toContainText("keeps that pass")
    await expect(panel.locator("#pass-mark-input")).toHaveValue("75")
  })

  test("the ratification queue offers ratify and send-back per lesson", async ({
    page,
  }) => {
    await page.goto("/org/ratification", { waitUntil: "domcontentloaded" })
    const items = page.locator('[data-section="ratification-item"]')
    expect(await items.count()).toBeGreaterThan(0)
    const first = items.first()
    await expect(first.getByRole("button", { name: "Ratify" })).toBeVisible()
    await expect(first.getByRole("button", { name: "Send back" })).toBeVisible()
  })

  test("a lesson sent back shows why", async ({ page }) => {
    await page.goto("/org/ratification", { waitUntil: "domcontentloaded" })
    await expect(page.getByText(/You sent this back:/)).toBeVisible()
    await expect(page.getByText(/changes requested/i).first()).toBeVisible()
  })

  test("the roster reports the baseline, never a quiz transcript", async ({
    page,
  }) => {
    await page.goto("/org/learners", { waitUntil: "domcontentloaded" })
    await expect(page.getByText(/baseline met/i).first()).toBeVisible()
    // v1 deliberately has no per-learner drill-down (design 05 section 4).
    await expect(page.getByRole("link", { name: /view answers/i })).toHaveCount(
      0
    )
  })

  // The N7 brief pins the marketing copy: /for-teams and /pricing stay
  // UNTOUCHED. That is ultimately a diff fact, but these keep the pages from
  // being broken as collateral by the new route group and the shared CSS.
  for (const path of ["/for-teams", "/pricing"]) {
    test(`${path} still renders and carries no /org chrome`, async ({
      page,
    }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" })
      expect(response?.status()).toBeLessThan(400)
      await expect(page.locator("h1").first()).toBeVisible()
      await expect(page.locator('[data-section="org-shell"]')).toHaveCount(0)
    })
  }
})
