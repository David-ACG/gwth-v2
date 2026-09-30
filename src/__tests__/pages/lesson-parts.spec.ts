import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import postgres from "postgres"

/**
 * Lessons in parts, two formats (bead gwth-launch-hqyp, Style Bible
 * lesson-viewer-two-formats), driven end to end on a running site with the
 * pilot lesson (M1 L10) imported.
 *
 *   PLAYWRIGHT_BASE_URL=https://hlab.taila51191.ts.net:9458 \
 *   DATABASE_URL=postgresql://gwth:devpass@127.0.0.1:5443/gwth_v2 \
 *   npx playwright test lesson-parts --project desktop-chromium
 *
 * Needs a signed-up learner with Month 1 access and no organisation (default
 * lesson-parts-check@example.com; see docs/local-development.md) and the
 * site's DATABASE_URL, which the spec uses to reset that learner before each
 * run. Every size and theme is set here, so it runs in one project only.
 */

const EMAIL = process.env.LESSON_PARTS_EMAIL ?? "lesson-parts-check@example.com"
const PASSWORD = process.env.LESSON_PARTS_PASSWORD ?? "Rafiki123"
const LESSON = process.env.LESSON_PARTS_PATH ?? "/course/applied-ai-skills/lesson/data-superpower-turn-messy-information-into-answers"
const DB = process.env.DATABASE_URL

const SIZES = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
] as const
const THEMES = ["light", "dark"] as const

async function resetLearner() {
  const sql = postgres(DB!, { max: 1 })
  try {
    const [u] = await sql<{ id: string }[]>`select id from "user" where email = ${EMAIL}`
    if (!u) throw new Error(`no user ${EMAIL}`)
    await sql`delete from lesson_part_checks where user_id = ${u.id}`
    await sql`delete from lesson_events where user_id = ${u.id}`
    await sql`delete from learner_preferences where user_id = ${u.id}`
    await sql`delete from lesson_progress where user_id = ${u.id} and lesson_id = 'm1_l10'`
  } finally {
    await sql.end()
  }
}

async function signIn(page: Page, baseURL: string, theme: string) {
  await page.addInitScript((value) => window.localStorage.setItem("theme", value), theme)
  const res = await page.request.post(`${baseURL}/api/auth/sign-in/email`, {
    data: { email: EMAIL, password: PASSWORD },
    headers: { origin: baseURL },
  })
  expect(res.ok()).toBeTruthy()
}

/** Answer the current part's check: try options in order until it resolves. */
async function resolveCheck(page: Page) {
  const card = page.getByTestId("check-card")
  const options = card.locator("button[data-option]")
  const n = await options.count()
  for (let k = 0; k < n; k++) {
    if (await page.getByTestId("continue").isEnabled()) return
    const opt = options.nth(k)
    if (await opt.isDisabled()) continue
    await opt.click()
    await expect(card.getByText(/Checking your answer/)).toHaveCount(0)
  }
  await expect(page.getByTestId("continue")).toBeEnabled()
}

async function axe(page: Page) {
  const results = await new AxeBuilder({ page })
    .include("[data-lesson-parts]")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.help} @ ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([])
}

test.describe.configure({ mode: "serial" })

for (const size of SIZES) {
  for (const theme of THEMES) {
    test(`lesson in parts, ${size.name} ${theme}`, async ({ page, baseURL }, info) => {
      test.skip(info.project.name !== "desktop-chromium", "sizes and themes are set inside the test")
      test.skip(!DB, "needs DATABASE_URL to reset the test learner")
      test.setTimeout(180_000)
      await resetLearner()
      await page.setViewportSize({ width: size.width, height: size.height })
      await page.emulateMedia({ colorScheme: theme })
      await signIn(page, baseURL!, theme)
      const shot = (name: string) =>
        page.screenshot({ path: info.outputPath(`${name}-${size.width}-${theme}.png`), fullPage: false })

      // First lesson: the choice screen, with a preview of each format.
      await page.goto(LESSON, { waitUntil: "networkidle" })
      await expect(page.getByTestId("format-choice")).toBeVisible()
      await expect(page.getByRole("heading", { name: "Watch short videos" })).toBeVisible()
      await expect(page.getByRole("heading", { name: "Read or listen" })).toBeVisible()
      await axe(page)
      await shot("01-choice")
      // Each preview is the play button: one tap plays 10 seconds with sound, a second tap stops.
      for (const id of ["sample-watch", "sample-read"]) {
        const sample = page.getByTestId(id)
        await expect(sample).toHaveAttribute("data-state", "idle")
        await expect(sample).toContainText("Try 10 seconds, with sound")
        await sample.click()
        await expect(sample).toHaveAttribute("data-state", "playing", { timeout: 15_000 })
        await page.waitForTimeout(1500)
        if (id === "sample-read") await expect(sample.locator(".rw-on")).toHaveCount(1)
        await shot(`01b-${id}-playing`)
        await sample.click()
        await expect(sample).toHaveAttribute("data-state", "done")
      }
      await page.getByTestId("choose-read").click()

      // Introduction, then part 1 in Read or listen.
      await expect(page.getByTestId("intro-screen")).toBeVisible()
      await page.getByTestId("start-part-1").click()
      await expect(page.locator("[data-part=p1]")).toBeVisible()
      const readAlong = page.getByRole("checkbox", { name: "Read along" })
      await expect(readAlong).toBeChecked()
      await expect(page.getByTestId("continue")).toBeDisabled()
      await expect(page.getByText("Answer the question to continue.")).toBeVisible()
      await axe(page)
      await shot("02-read-part1")

      // Two wrong tries unlock Continue with the explanation (or one right try).
      await resolveCheck(page)
      const card = page.getByTestId("check-card")
      const explained = await card.getByRole("button", { name: "Read that bit again" }).count()
      if (explained) await expect(card.getByText(/The answer is:/)).toBeVisible()
      await card.scrollIntoViewIfNeeded()
      await shot("03-check-resolved")

      // Confused link: one tap counts, then an optional note.
      await page.getByTestId("confused-link").click()
      await expect(page.getByTestId("confused-panel")).toBeVisible()
      await page.getByLabel(/What was confusing/).fill("Playwright: the date example")
      await page.getByTestId("confused-panel").getByRole("button", { name: "Send" }).click()
      await expect(page.getByText("Thanks, we have your note.")).toBeVisible()

      // Continue to part 2, then switch to Watch: same part, video with captions.
      await page.getByTestId("continue").click()
      await expect(page.locator("[data-part=p2]")).toBeVisible()
      await page.getByTestId("format-switch").getByRole("button", { name: /Watch/ }).click()
      await expect(page.locator("[data-format=watch]")).toBeVisible()
      await expect(page.locator("[data-part=p2] video track[kind=captions]")).toHaveCount(1)
      await page.getByText("Read this part instead").click()
      await axe(page)
      await shot("04-watch-part2")

      // Finish every part, then the end-of-lesson rating before the project.
      for (let i = 2; i <= 6; i++) {
        await resolveCheck(page)
        await page.getByTestId("continue").click()
        if (i < 6) await expect(page.locator(`[data-part=p${i + 1}]`)).toBeVisible()
      }
      await expect(page.getByTestId("end-screen")).toBeVisible()
      await expect(page.getByRole("heading", { name: "You have finished this lesson" })).toBeVisible()
      const rating = page.getByTestId("rating-card")
      await expect(rating.getByRole("heading", { name: "How was this lesson?" })).toBeVisible()
      await expect(rating.getByRole("button")).toContainText(["×", "Bad", "Fine", "Good"])
      await rating.getByRole("button", { name: "Good" }).click()
      await expect(rating.getByText("Thanks. Want to tell us more?")).toBeVisible()
      await rating.getByRole("button", { name: "No thanks" }).click()
      await axe(page)
      await shot("05-end")

      // Events reach our own database; the lesson counts as complete.
      await page.waitForTimeout(5000)
      const sql = postgres(DB!, { max: 1 })
      try {
        const rows = await sql<{ event: string }[]>`
          select distinct e.event from lesson_events e join "user" u on u.id = e.user_id
          where u.email = ${EMAIL} and e.lesson_id = 'm1_l10'`
        const names = rows.map((r) => r.event)
        for (const want of ["lesson_opened", "part_opened", "continue", "check_answer", "format_chosen", "format_switched", "confused", "confused_note", "lesson_completed"]) {
          expect(names).toContain(want)
        }
        const [p] = await sql<{ is_completed: boolean; quiz_passed: boolean }[]>`
          select lp.is_completed, lp.quiz_passed from lesson_progress lp join "user" u on u.id = lp.user_id
          where u.email = ${EMAIL} and lp.lesson_id = 'm1_l10'`
        expect(p).toMatchObject({ is_completed: true, quiz_passed: true })
      } finally {
        await sql.end()
      }
    })
  }
}

/**
 * The preview's sessionless stand-in learner (ENABLE_DEV_MOCK_USER, no session
 * cookie) must be able to answer a check: David hit "Sign in to continue this
 * lesson." here on 2026-09-30 while the page itself showed him as signed in.
 */
test("stand-in learner can answer a check without signing in", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-chromium", "one project is enough")
  await page.goto(`${LESSON}?choose=1`, { waitUntil: "networkidle" })
  test.skip(page.url().includes("/login"), "this site has no stand-in learner")
  await page.getByTestId("choose-read").click()
  await page.getByTestId("start-part-1").click()
  const card = page.getByTestId("check-card")
  await card.locator("button[data-option]").first().click()
  await expect(card.getByTestId("check-feedback")).toBeVisible()
  await expect(page.getByText("Sign in to continue this lesson.")).toHaveCount(0)
  await expect(card.getByTestId("check-error")).toHaveCount(0)
})
