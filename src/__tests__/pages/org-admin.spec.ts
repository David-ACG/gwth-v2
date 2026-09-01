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

/**
 * next-themes runs with attribute="class" and defaultTheme="light", so
 * `emulateMedia({ colorScheme: 'dark' })` does NOT flip the app's theme —
 * every "dark" baseline written that way is a light render mislabelled (QA
 * round-1 defect 1). The theme is stored in localStorage under "theme", so
 * seeding it BEFORE navigation is what actually produces a dark render.
 */
async function open(
  page: import("@playwright/test").Page,
  path: string,
  theme: "light" | "dark" = "light",
  /** Wait for hydration too — required before clicking a client control. */
  interactive = false
) {
  await page.addInitScript(
    (value) => window.localStorage.setItem("theme", value),
    theme
  )
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: theme,
  })
  await page.goto(path, { waitUntil: "domcontentloaded" })
  // Hide the dev-only overlays (Next's build indicator and the month-state
  // switcher). They are absent from any real deployment, so leaving them in
  // would make both the baselines and the axe scan depend on which mode the
  // server happens to be running in.
  await page.addStyleTag({
    content:
      "nextjs-portal, [data-section='dev-state-switcher'] { display: none !important; }",
  })
  // Condition-based, not a fixed sleep (QA round-1 style note 5).
  await expect(page.locator("h1").first()).toBeVisible()
  await expect(page.locator("html")).toHaveClass(
    theme === "dark" ? /dark/ : /light/
  )
  // A server-rendered control looks identical to a hydrated one, so a click
  // before hydration is silently dropped. Waiting for the network to settle
  // is the available proxy for "the client bundle has attached its handlers".
  if (interactive) await page.waitForLoadState("networkidle")
}

const SCREENS = [
  { path: "/org", name: "overview", heading: /CIPD/i },
  { path: "/org/syllabus", name: "syllabus", heading: /Syllabus/i },
  { path: "/org/ratification", name: "ratification", heading: /Ratification/i },
  { path: "/org/learners", name: "learners", heading: /Learners/i },
] as const

test.describe("Institution admin (/org)", () => {
  for (const screen of SCREENS) {
    test.describe(screen.name, () => {
      test("renders its heading", async ({ page }) => {
        await open(page, screen.path)
        await expect(page.locator("h1").first()).toHaveText(screen.heading)
      })

      test("shows the co-branded masthead, GWTH first", async ({ page }) => {
        await open(page, screen.path)
        const header = page.locator("header").first()
        await expect(header).toContainText("GWTH")
        await expect(header).toContainText("Curated by CIPD")
      })

      test("says on its face that it is a preview", async ({ page }) => {
        await open(page, screen.path)
        await expect(
          page.locator('[data-section="org-preview-banner"]')
        ).toBeVisible()
      })

      for (const theme of ["light", "dark"] as const) {
        test(`screenshot - ${theme} mode`, async ({ page }, testInfo) => {
          // The theme is seeded explicitly, so the desktop-dark PROJECT (which
          // only sets colorScheme) would render byte-identically to
          // desktop-chromium and double the committed baselines for nothing
          // (QA round-2 style notes 4 + 5). One desktop project, one mobile.
          test.skip(
            testInfo.project.name === "desktop-dark",
            "theme is seeded per test, so the dark PROJECT adds no coverage"
          )
          await open(page, screen.path, theme)
          await expect(page).toHaveScreenshot(
            `org-${screen.name}-${theme}.png`,
            // Tight (QA round-2 style note 6): 0.05 on a full page is loose
            // enough for a whole component to change unnoticed.
            { fullPage: true, maxDiffPixelRatio: 0.002 }
          )
        })
      }

      test("has no critical accessibility violations", async ({ page }) => {
        await open(page, screen.path)
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
    await open(page, "/org/syllabus")
    for (const tier of ["core", "optional", "exclusive"]) {
      await expect(page.locator(`[data-section="tier-${tier}"]`)).toBeVisible()
    }
  })

  // End-to-end through the real server action (QA round-1 style note 1). In
  // preview mode the server's honest refusal IS the observable outcome, and
  // it proves the whole chain — client control, action, authority check,
  // toast — is wired, which a unit test on the action cannot show.
  test("switching a lesson round-trips to the server and reports the refusal", async ({
    page,
  }) => {
    await open(page, "/org/syllabus", "light", true)
    const toggle = page
      .locator('[data-section="tier-optional"] input[type="checkbox"]')
      .first()
    await toggle.click()
    await expect(page.getByText(/changes are not saved/i)).toBeVisible({
      timeout: 15000,
    })
  })

  test("ratifying round-trips to the server and reports the refusal", async ({
    page,
  }) => {
    await open(page, "/org/ratification", "light", true)
    await page
      .locator('[data-section="ratification-item"]')
      .first()
      .getByRole("button", { name: "Ratify" })
      .click()
    await expect(page.getByText(/changes are not saved/i)).toBeVisible({
      timeout: 15000,
    })
  })

  test("sending back with no note is refused before it reaches the server", async ({
    page,
  }) => {
    await open(page, "/org/ratification", "light", true)
    await page
      .locator('[data-section="ratification-item"]')
      .first()
      .getByRole("button", { name: "Send back" })
      .click()
    await expect(page.getByText(/say what needs to change/i)).toBeVisible({
      timeout: 15000,
    })
  })

  test("saving the pass mark round-trips to the server and reports the refusal", async ({
    page,
  }) => {
    await open(page, "/org/syllabus", "light", true)
    const panel = page.locator('[data-section="pass-mark"]')
    await panel.locator("#pass-mark-input").fill("82")
    await panel.getByRole("button", { name: /save pass mark/i }).click()
    await expect(page.getByText(/changes are not saved/i)).toBeVisible({
      timeout: 15000,
    })
  })

  test("the ratification queue separates what waits on you from what is with GWTH", async ({
    page,
  }) => {
    await open(page, "/org/ratification")
    await expect(page.locator('[data-section="awaiting-you"]')).toBeVisible()
    await expect(page.locator('[data-section="with-gwth"]')).toBeVisible()
    // The count in the header is the "waiting on you" number only, so an
    // admin is not nagged about lessons they have already sent back.
    await expect(page.getByText(/1 awaiting you/i)).toBeVisible()
  })

  test("a ratification card shows what is being signed off, not just a title", async ({
    page,
  }) => {
    await open(page, "/org/ratification")
    const first = page.locator('[data-section="ratification-item"]').first()
    await expect(first.locator("p").first()).not.toBeEmpty()
  })

  test("a ratified exclusive lesson can still be set mandatory", async ({
    page,
  }) => {
    await open(page, "/org/syllabus")
    // Decision 2 of 2026-08-28: the institution decides is_mandatory per
    // exclusive lesson, so the control must exist even though the INCLUDE
    // switch does not.
    const exclusive = page.locator('[data-section="tier-exclusive"]')
    await expect(
      exclusive.locator('input[id^="mandatory-"]')
    ).not.toHaveCount(0)
  })

  test("exclusive lessons are not switchable in the picker", async ({
    page,
  }) => {
    await open(page, "/org/syllabus")
    const exclusive = page.locator('[data-section="tier-exclusive"]')
    await expect(exclusive.locator('input[id^="include-"]')).toHaveCount(0)
    await expect(exclusive).toContainText("ratification screen")
  })

  test("core lessons are locked, with the reason on screen", async ({
    page,
  }) => {
    await open(page, "/org/syllabus")
    const core = page.locator('[data-section="tier-core"]')
    // No switch at all on a core lesson — the reason is stated instead.
    await expect(core.locator('input[type="checkbox"]')).toHaveCount(0)
    await expect(core).toContainText("in every edition of this course")
  })

  test("optional lessons carry a real, keyboard-operable switch", async ({
    page,
  }) => {
    await open(page, "/org/syllabus")
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
    await open(page, "/org/syllabus")
    const panel = page.locator('[data-section="pass-mark"]')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText("75%")
    await expect(panel).toContainText("keeps that pass")
    await expect(panel.locator("#pass-mark-input")).toHaveValue("75")
  })

  test("the ratification queue offers ratify and send-back per lesson", async ({
    page,
  }) => {
    await open(page, "/org/ratification")
    const items = page.locator('[data-section="ratification-item"]')
    expect(await items.count()).toBeGreaterThan(0)
    const first = items.first()
    await expect(first.getByRole("button", { name: "Ratify" })).toBeVisible()
    await expect(first.getByRole("button", { name: "Send back" })).toBeVisible()
  })

  test("a lesson sent back shows why", async ({ page }) => {
    await open(page, "/org/ratification")
    await expect(page.getByText(/You sent this back:/)).toBeVisible()
    await expect(page.getByText(/changes requested/i).first()).toBeVisible()
  })

  test("the roster reports the baseline, never a quiz transcript", async ({
    page,
  }) => {
    await open(page, "/org/learners")
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
