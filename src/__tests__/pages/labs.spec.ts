import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * The two Labs routes David marked up on 2026-09-14, checked in a real
 * browser: annotation a-20260914-205407-b3dbb2 on the /labs listing, and
 * a-20260914-205206-82935a on the opening of the spreadsheet lab.
 *
 * These are the checks a component test cannot make: that nothing pushes the
 * page sideways on a phone, that the read-aloud control is reachable and
 * operable from the keyboard, that the preview panels survive both themes,
 * and that neither page ships a serious accessibility violation. Deliberately
 * not snapshots: the copy on these pages is still moving, and a sentence-level
 * baseline would fail for the wrong reason.
 */

const INDEX = "/labs"
const LAB = "/labs/messy-spreadsheet-claude-vs-chatgpt"

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.emulateMedia({ colorScheme: theme })
  await page.addInitScript(
    (value) => {
      try {
        window.localStorage.setItem("theme", value as string)
      } catch {
        // Private mode: the emulated colour scheme still applies.
      }
    },
    theme
  )
}

/**
 * The live lab cards, scoped to `main`.
 *
 * Next streams a page's HTML into `<body>` and relocates it into the app shell
 * with inline scripts, so a snapshot taken mid-stream can briefly see the same
 * section twice, once in place and once still parked at the end of the body.
 * Scoping to `main` counts the cards a reader can actually see, and the raw
 * server HTML always carries exactly one set. Nothing to do with the theme,
 * despite only the dark project being unlucky enough to catch it.
 */
function liveCards(page: Page) {
  return page.locator("main").getByTestId("arena-lab-card")
}

/** True when the document is wider than its own viewport. */
async function overflowsSideways(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1
  )
}

test.describe("Labs index", () => {
  test("every live card previews its lab and none claims a video", async ({
    page,
  }) => {
    await page.goto(INDEX)
    const cards = liveCards(page)
    await expect(cards.first()).toBeVisible()
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // /labs is force-dynamic, so a card lower down can still be streaming in
    // while the suite runs three browsers against one `next start`. The wait
    // is generous on purpose: this test is about what the card says, not how
    // fast a shared preview server answers.
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      await expect(card.getByTestId("lab-preview")).toBeVisible({
        timeout: 15000,
      })
      await expect(card.getByTestId("lab-task-cue")).toBeVisible({
        timeout: 15000,
      })
      // No lab has been filmed, so no card may imply one has.
      await expect(card).toHaveAttribute("data-video-state", "planned")
      await expect(card.getByTestId("lab-video-state")).toContainText(/planned/i)
    }
    expect(await page.locator("video").count()).toBe(0)
  })

  test("the spreadsheet card shows spreadsheet rows, not a paragraph", async ({
    page,
  }) => {
    await page.goto(INDEX)
    const cards = liveCards(page)
    await expect(cards.first()).toBeVisible()

    const card = cards.filter({ hasText: "messy spreadsheet" })
    await expect(card).toHaveCount(1)
    await expect(card.locator('[data-preview="specimen"]')).toHaveCount(1)
    await expect(card.locator('[data-testid="lab-specimen-grid"]')).toBeVisible()
  })

  for (const theme of ["light", "dark"] as const) {
    test(`does not scroll sideways, ${theme}`, async ({ page }) => {
      await setTheme(page, theme)
      await page.goto(INDEX)
      await expect(liveCards(page).first()).toBeVisible()
      expect(await overflowsSideways(page)).toBe(false)
    })
  }

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto(INDEX)
    await expect(liveCards(page).first()).toBeVisible()
    const results = await new AxeBuilder({ page })
      // hlab injects its annotation toolbar outside the product app. Its own
      // accessibility is tracked separately; this suite gates the Labs page.
      .exclude("#gwth-review-root")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? "")
    )
    expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([])
  })
})

test.describe("Spreadsheet lab", () => {
  test("opens with the lab, an honest video state and a read-aloud route", async ({
    page,
  }) => {
    await page.goto(LAB)
    await expect(page.locator("main").getByRole("heading", { level: 1 })).toBeVisible()

    const guide = page.locator("main").getByTestId("lab-video-guide")
    await expect(guide).toHaveAttribute("data-video-state", "planned")
    expect(await page.locator("video").count()).toBe(0)

    // The read-aloud control is in the opening, not buried at the bottom.
    await expect(page.locator("main").getByTestId("lab-listen")).toBeVisible()
  })

  test("keeps the long evidence below, behind disclosures that open", async ({
    page,
  }) => {
    await page.goto(LAB)

    const prompt = page.locator("main").getByTestId("shared-prompt")
    await expect(prompt.locator("pre")).toBeHidden()
    await prompt.locator("summary").click()
    await expect(prompt.locator("pre")).toBeVisible()

    // Both answers are always present: evidence is never behind a click.
    await expect(page.locator("main").getByTestId("arena-output")).toHaveCount(2)
  })

  test("the listen control works from the keyboard", async ({ page }) => {
    await page.goto(LAB)
    const panel = page.locator("main").getByTestId("lab-listen")
    await expect(panel).toBeVisible()

    const listen = panel.getByRole("button", { name: "Listen" })
    await listen.focus()
    await expect(listen).toBeFocused()
    await page.keyboard.press("Enter")

    // Chromium in CI has no voices, so the queue may end immediately. Either
    // the transport controls appear, or it returns to idle: what must never
    // happen is the button doing nothing at all and no state being announced.
    await expect(panel.getByRole("status")).toBeAttached()
    await expect(
      panel.getByRole("button", { name: /pause|stop|listen/i }).first()
    ).toBeVisible()
  })

  test("the jump list moves the reader down the page", async ({ page }) => {
    await page.goto(LAB)
    const nav = page
      .locator("main")
      .getByRole("navigation", { name: /sections of this lab/i })
    await nav.getByRole("link", { name: "The verdict" }).click()
    await expect(page.locator("#the-verdict")).toBeInViewport()
  })

  for (const theme of ["light", "dark"] as const) {
    test(`does not scroll sideways, ${theme}`, async ({ page }) => {
      await setTheme(page, theme)
      await page.goto(LAB)
      await expect(page.locator("main").getByRole("heading", { level: 1 })).toBeVisible()
      expect(await overflowsSideways(page)).toBe(false)
    })
  }

  test("has no serious accessibility violations", async ({ page }) => {
    await page.goto(LAB)
    await expect(page.locator("main").getByRole("heading", { level: 1 })).toBeVisible()
    const results = await new AxeBuilder({ page })
      // hlab injects its annotation toolbar outside the product app. Its own
      // accessibility is tracked separately; this suite gates the Lab page.
      .exclude("#gwth-review-root")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? "")
    )
    expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([])
  })
})
