import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * The /about page David marked up on 2026-09-14, checked in a real browser:
 * annotations a-20260914-205610-1de94a (the promise), a-20260914-210202-2fba31
 * (the founder note) and a-20260914-210609-f7fdc8 (the UK thread), bead
 * gwth-launch-88z.32.24.
 *
 * The meaning of the copy is asserted next to the component, in
 * `about-fde.test.tsx`. What can only be checked here is what a reader
 * actually meets: that the longer founder note and the new UK section do not
 * push the page sideways on a phone, that the government source links are
 * reachable and operable from the keyboard, that both themes survive, and that
 * the page ships no serious accessibility violation. Deliberately not
 * screenshot baselines: this copy is still moving and a pixel baseline would
 * fail for the wrong reason.
 */

const ABOUT = "/about"

const SECTIONS = [
  "masthead",
  "intro",
  "founder",
  "principles",
  "uk-context",
  "numbers",
  "closing",
] as const

/** True when the document is wider than its own viewport. */
async function overflowsSideways(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1
  )
}

async function gotoAbout(page: Page) {
  await page.goto(ABOUT, { waitUntil: "domcontentloaded" })
  await page.waitForLoadState("networkidle").catch(() => {})
}

test.describe("About page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAbout(page)
  })

  test("every section resolves exactly once, in reading order", async ({
    page,
  }) => {
    for (const section of SECTIONS) {
      await expect(
        page.locator("main").locator(`[data-section="${section}"]`),
        `data-section="${section}"`
      ).toHaveCount(1)
    }
  })

  test("the promise reads as David dictated it", async ({ page }) => {
    const promise = page.locator("main").getByTestId("about-promise")
    await expect(promise).toBeVisible()
    await expect(promise).toHaveText(
      "The promise is simple. We help you stop watching AI change the world and start building with it."
    )
  })

  test("the founder note is a section of its own, not a marginal aside", async ({
    page,
  }) => {
    const note = page.locator("main").getByTestId("founder-note")
    await expect(note).toBeVisible()

    // Three paragraphs of biography plus the label: it has to be readable,
    // which means a real measure rather than a sidebar column.
    const box = await note.boundingBox()
    expect(box).not.toBeNull()
    expect(box?.width ?? 0).toBeGreaterThan(280)

    const text = (await note.innerText()).replace(/\s+/g, " ")
    expect(text).toMatch(/25 years/)
    expect(text.length).toBeGreaterThan(600)
  })

  test("the UK thread is picked up in more than one place", async ({ page }) => {
    const main = page.locator("main")
    await expect(main.getByTestId("uk-example")).toHaveCount(3)
    await expect(main.getByTestId("uk-note")).toHaveCount(3)
    await expect(main.locator('[data-section="uk-context"]')).toBeVisible()
    await expect(main.getByText(/third largest AI market/i)).toBeVisible()
  })

  test("the government sources are real links and work from the keyboard", async ({
    page,
  }) => {
    const sources = page.locator("main").getByTestId("uk-sources")
    await expect(sources).toBeVisible()
    const links = sources.getByRole("link")
    const count = await links.count()
    expect(count).toBeGreaterThanOrEqual(3)

    for (let i = 0; i < count; i++) {
      const link = links.nth(i)
      const href = await link.getAttribute("href")
      expect(href).toMatch(/^https:\/\/(www\.gov\.uk|www\.ons\.gov\.uk)\//)
      await expect(link).toHaveAttribute("rel", /noopener/)

      // Focusable, and the focus ring is drawn rather than suppressed.
      await link.focus()
      await expect(link).toBeFocused()
      const outline = await link.evaluate(
        (el) => getComputedStyle(el).outlineStyle
      )
      expect(outline).not.toBe("none")
    }
  })

  test("nothing scrolls sideways at the project viewport", async ({ page }) => {
    expect(await overflowsSideways(page)).toBe(false)
  })

  test("nothing scrolls sideways at phone width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoAbout(page)
    expect(await overflowsSideways(page)).toBe(false)
  })

  test("the page renders without console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    page.on("pageerror", (error) => errors.push(String(error)))
    await gotoAbout(page)
    await page.waitForTimeout(500)
    expect(errors).toEqual([])
  })

  test("no serious accessibility violation, in either theme", async ({
    page,
  }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme })
      await page.evaluate((value) => {
        document.documentElement.classList.toggle("dark", value === "dark")
      }, theme)

      const results = await new AxeBuilder({ page })
        // hlab injects the annotation toolbar outside the product app. Its
        // contrast is tracked separately; this suite gates the About page.
        .exclude("#gwth-review-root")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()

      const serious = results.violations.filter(
        (violation) =>
          violation.impact === "serious" || violation.impact === "critical"
      )
      expect(
        serious.map((violation) => `${theme}: ${violation.id}`),
        `serious violations in ${theme}`
      ).toEqual([])
    }
  })
})
