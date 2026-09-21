import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * Full-page smoke for the paper-first home page (N12, 2026-09-03). Sections
 * are the N9 artboard's, re-ordered on 2026-09-15 for David's individual-first
 * pass (annotation a-20260915-085703-483d98): hero (with the what-you-make
 * plate), course, months, blocks, organisations (a signpost, not the
 * old institution pitch), individuals, plus the shared nav and footer.
 *
 * `argument`, the three institution evidence figures, was removed the same day
 * (a-20260915-101631-6649fd) and `months`, the three-month progression, took
 * its slot (a-20260915-101324-6aa90f).
 */
const SECTIONS = [
  "nav",
  "hero",
  "course",
  "months",
  "blocks",
  "score",
  "organisations",
  "individuals",
  "footer",
] as const

/** The home page's own body, in the order a visitor scrolls through it. */
const BODY_SECTIONS = [
  "hero",
  "course",
  "months",
  "blocks",
  "score",
  "organisations",
  "individuals",
] as const

const EXPECTED_INTERNAL_HREFS = [
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

  // The N9 artboard LAYOUT is unchanged; the words moved on 2026-09-15 for
  // a-20260915-101927-9ec6a5, which asked the whole page to stop making a
  // beginner decode anything.
  test("renders the headline in the N9 artboard's two-line shape", async ({ page }) => {
    const h1 = page.locator("h1").first()
    await expect(h1).toBeVisible()
    await expect(h1).toContainText("Learn to use AI at work")
    await expect(h1).toContainText("by making things.")
  })

  test("the longer introduction starts beside the headline instead of pushing it down", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    // The measurement is of the layout AFTER the resize, and under parallel
    // workers this read can land before the reflow: the two columns then
    // measure as the one-column phone stack and the test fails on a page that
    // is correct. Wait for a frame rather than reading the old layout.
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    )
    const positions = await page.locator('[data-section="hero"] > div > div').first().evaluate(
      (grid) => Array.from(grid.children).slice(0, 2).map((child) => {
        const box = child.getBoundingClientRect()
        return { top: box.top, bottom: box.bottom, width: box.width }
      }),
    )
    expect(positions).toHaveLength(2)
    expect(Math.abs(positions[0]!.top - positions[1]!.top)).toBeLessThan(16)
    expect(positions[1]!.width / positions[0]!.width).toBeGreaterThan(1.3)
    expect(Math.abs(positions[0]!.bottom - positions[1]!.bottom)).toBeLessThan(100)
  })

  test("every data-section resolves exactly once", async ({ page }) => {
    for (const section of SECTIONS) {
      const target = page.locator(`[data-section="${section}"]`)
      await expect(target, `data-section="${section}"`).toHaveCount(1)
    }
  })

  test("shows one plate per mode: the dark render stays hidden in light", async ({ page }) => {
    await expect(page.locator('img[src*="what-you-make.png"]').first()).toBeVisible()
    await expect(page.locator('img[src*="what-you-make-dark"]').first()).toBeHidden()
    await page.evaluate(() => document.documentElement.classList.add("dark"))
    await expect(page.locator('img[src*="what-you-make-dark"]').first()).toBeVisible()
    await expect(page.locator('img[src*="what-you-make.png"]').first()).toBeHidden()
  })

  test("nothing scrolls sideways at phone width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoHome(page)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    expect(overflow).toBe(false)
  })

  test("renders the Course JSON-LD schema", async ({ page }) => {
    const script = page.locator('script[type="application/ld+json"]').first()
    await expect(script).toBeAttached()
    const content = await script.textContent()
    expect(content).toBeTruthy()
    expect(JSON.parse(content ?? "{}")["@type"]).toBe("Course")
  })

  test("the hero picture is wide enough at phone width to read its own labels", async ({
    page,
  }) => {
    // The Bible allows ONE landscape composition for laptop and phone only on
    // condition that the reduced lettering is still readable
    // (landscape-labelled-images). The page cannot measure legibility, but it
    // can hold the picture to the full column: a plate that renders into a
    // narrow slot is the way that condition gets broken quietly.
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoHome(page)
    const plate = page.locator('[data-section="hero"] figure img:visible').first()
    await expect(plate).toBeVisible()
    const box = await plate.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThan(330)
  })

  test("every internal link the page carries answers", async ({ page, request }) => {
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""))
    for (const expected of EXPECTED_INTERNAL_HREFS) {
      expect(hrefs, `link to ${expected}`).toContain(expected)
    }
    // In-page anchors are skipped; a cross-page link keeps its path and is
    // checked without its fragment.
    const unique = [
      ...new Set(
        hrefs.filter((h) => !h.startsWith("/#") && !h.startsWith("//")).map((h) => h.split("#")[0] ?? h)
      ),
    ].filter(Boolean)
    for (const href of unique) {
      const res = await request.head(href)
      expect(res.status(), `HEAD ${href}`).toBeLessThan(400)
    }
  })

  test("the plate carries the flagship line, and no key of category words", async ({
    page,
  }) => {
    // David, 2026-09-14: six bare category words under the picture were
    // "totally uninspiring for the most important page on GWTH", and
    // 2026-09-13: the picture itself read as a lesson figure. Both are fixed
    // by one flagship picture that letters its own labels (bead
    // gwth-launch-88z.32.12).
    await expect(page.getByTestId("six-blocks-key")).toHaveCount(0)
    await expect(
      page.getByText(/Three projects from the course, in the order you make them/)
    ).toBeVisible()
    // The sentence it replaced kept its meaning, in the section that owns the
    // six blocks.
    await expect(page.getByTestId("blocks-lead")).toContainText(
      "Six ways of working, not six subjects"
    )
  })

  test("the page is individual-first: the learner comes before the buyer", async ({
    page,
  }) => {
    // David, 2026-09-15 (a-20260915-085703-483d98): the home page is aimed at
    // individuals, and institutions and teams get a link to their own page.
    const tops: number[] = []
    for (const section of BODY_SECTIONS) {
      tops.push(
        await page
          .locator(`[data-section="${section}"]`)
          .evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
      )
    }
    const sorted = [...tops].sort((a, b) => a - b)
    expect(tops, `rendered order ${BODY_SECTIONS.join(" -> ")}`).toEqual(sorted)

    // The first viewport is about the course, not about who is buying it.
    const hero = page.locator('[data-section="hero"]')
    await expect(hero).toContainText("by making things")
    await expect(hero).not.toContainText(/institution|professional body/i)
  })

  test("the organisation route is a signpost with two links off the page", async ({
    page,
  }) => {
    const signpost = page.getByTestId("organisations-signpost")
    await expect(signpost).toBeVisible()
    await expect(signpost).toContainText("large company")
    await expect(signpost.locator("p")).toHaveCount(1)
    const hrefs = await signpost
      .locator("a")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")))
    expect(hrefs).toEqual(["/for-institutions", "/for-teams"])
    // And the institution feature list is not rebuilt here.
    const body = page.locator("main")
    await expect(body).not.toContainText("What an institution gets")
    await expect(body).not.toContainText("A curated edition")
  })

  test("no walkthrough is offered on the home page, and the header serves the waitlist", async ({
    page,
  }) => {
    // The walkthrough costs David an hour and now lives only where a large
    // buyer arrives (/for-institutions). Nothing on this page offers it.
    await expect(page.locator("main")).not.toContainText(/walkthrough/i)
    await expect(
      page.locator('[data-section="nav"] a', { hasText: "Join the waitlist" }).first()
    ).toHaveAttribute("href", "/waitlist")
  })

  test("the jargon and the pricing claim David struck are gone", async ({ page }) => {
    const body = page.locator("body")
    for (const phrase of [
      /before the room starts/i,          // a-20260915-084911-63447a
      /active learners/i,                 // a-20260915-085041-eaa513
      /worth an hour/i,                   // a-20260915-085127-ee0db0
      /missing floor/i,                   // a-20260915-085153-468599
      /Nothing here needs a meeting/i,    // a-20260915-085746-3e7631
      /Two ways in/i,                     // a-20260915-084728-90d41b
      /worked through on your own tasks/i, // a-20260915-084515-b9ff47
    ]) {
      await expect(body, `still on the page: ${phrase}`).not.toContainText(phrase)
    }
  })

  test("building is named as the foundation, without an unverified percentage", async ({
    page,
  }) => {
    // David, 2026-09-15 (a-20260915-085439-6c8134). The emphasis is his; the
    // "maybe 50%" is not supported by the syllabus and is not published. See
    // completion/home-annotations-round2/curriculum-check.md in the launch-plan.
    const lead = page.getByTestId("blocks-lead")
    await expect(lead).toBeVisible()
    await expect(lead).toContainText("Every month here is built around making something")
    await expect(lead).toContainText(
      "each project brings several of the six building blocks together"
    )
    await expect(page.locator('[data-section="course"]')).toContainText(
      "Every lesson is built around a project"
    )
    await expect(page.locator("body")).not.toContainText(/50%|half the course/i)
  })

  /**
   * David, 2026-09-15 (a-20260915-211845-237ea3). The three states must be
   * separable with no colour at all, because the card is meant to be
   * screenshotted, and bible `paper-first-banned-patterns` forbids a state
   * carried by colour alone. Rendered here rather than in jsdom so the check
   * is on the real computed strokes.
   */
  test("the three score trajectories are told apart without colour", async ({ page }) => {
    const cards = page.locator('[data-testid="score-card"]')
    await expect(cards).toHaveCount(3)
    for (const state of ["rising", "level", "stale"]) {
      await expect(page.locator(`[data-testid="score-card"][data-state="${state}"]`)).toHaveCount(1)
    }
    // Every trajectory line is drawn in the same ink, so colour carries nothing.
    const strokes = await page
      .locator('[data-testid="score-card"] path[class*="scoreLine"]')
      .evaluateAll((nodes) =>
        nodes.map((n) => getComputedStyle(n as SVGElement).stroke)
      )
    expect(strokes.length).toBeGreaterThanOrEqual(3)
    expect(new Set(strokes).size).toBe(1)
    // Only the out-of-date card carries the dashed run.
    const dashed = await page
      .locator('[data-testid="score-card"] path[class*="scoreLine"]')
      .evaluateAll((nodes) =>
        nodes
          .map((n) => getComputedStyle(n as SVGElement).strokeDasharray)
          .filter((d) => d && d !== "none")
      )
    expect(dashed).toHaveLength(1)
    const staleDashed = page.locator(
      '[data-testid="score-card"][data-state="stale"] [data-testid="score-line-dashed"]'
    )
    await expect(staleDashed).toHaveCount(1)
    // And each state says which it is, in words. The words are the ones the
    // page settled on: "Level" reads as an attainment level and "Out of date"
    // as a judgement on the learner, so they went, and this browser check was
    // left behind asserting them (the unit test in home-fde.test.tsx has said
    // "No change" and "Needs updating" since).
    await expect(page.locator('[data-section="score"]')).toContainText("Going up")
    await expect(page.locator('[data-section="score"]')).toContainText("No change")
    await expect(page.locator('[data-section="score"]')).toContainText("Needs updating")
  })

  test("every building block shows all three months", async ({ page }) => {
    const cards = page.locator('[data-testid="block-card"]')
    await expect(cards).toHaveCount(6)
    for (let i = 0; i < 6; i++) {
      await expect(cards.nth(i).locator('[data-testid="block-step"]')).toHaveCount(3)
    }
  })

  test("phone width keeps the offer readable and the names under the tiles", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await gotoHome(page)
    await expect(page.locator('[data-section="course"]')).toBeVisible()
    await expect(page.getByTestId("organisations-signpost")).toBeVisible()
    // The score cards and the six month-by-month tracks stack rather than
    // spill: this is the widest new content on the page.
    await expect(page.locator('[data-testid="score-card"]').first()).toBeVisible()
    await expect(page.locator('[data-testid="block-step"]').first()).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    expect(overflow).toBe(false)
  })

  test("has no serious or critical accessibility violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze()
    const bad = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? "")
    )
    expect(bad, JSON.stringify(bad, null, 2)).toEqual([])
  })
})
