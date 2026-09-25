// Browser proof for bead gwth-launch-8ta: leaving a lesson keeps your page
// and your answers.
//
//   DEMO_EMAIL=... DEMO_PASSWORD=... node completion/8ta/prove.mjs [baseUrl]
//
// Signs in, opens Month 1 lesson 1, picks a Q&A answer without submitting,
// goes to page 3, leaves for the dashboard and comes back: the lesson must
// reopen on page 3 with the answer still picked. Then it submits, leaves and
// comes back again: the submitted answers must still be shown, graded.
// Screenshots land next to this file. Exits non-zero on any failed check.
import { chromium } from "playwright"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

const OUT = dirname(fileURLToPath(import.meta.url))
const BASE = process.argv[2] ?? "https://hlab.taila51191.ts.net:9458"
const EMAIL = process.env.DEMO_EMAIL
const PASSWORD = process.env.DEMO_PASSWORD
if (!EMAIL || !PASSWORD) throw new Error("set DEMO_EMAIL and DEMO_PASSWORD")
const LESSON =
  "/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  ignoreHTTPSErrors: true,
})
const res = await page.request.post(`${BASE}/api/auth/sign-in/email`, {
  headers: { "Content-Type": "application/json", Origin: BASE },
  data: { email: EMAIL, password: PASSWORD },
})
if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`)

let failures = 0
function check(ok, label) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`)
  if (!ok) failures++
}

// The lesson's own outline rail (other asides on the page carry buttons too).
const outline = page.locator("aside").filter({ hasText: /outline/ })
const rail = outline.locator("button")
async function currentRailPage() {
  const txt = await outline.locator('button[aria-current="page"]').innerText()
  return Number(/P(\d+)/.exec(txt)?.[1] ?? 0)
}
async function openLesson() {
  await page.goto(`${BASE}${LESSON}`, { waitUntil: "networkidle", timeout: 120000 })
  if (page.url().includes("/login")) throw new Error("lesson bounced to /login")
  // The saved page is restored after hydration.
  await page.waitForTimeout(2500)
}
/** The option buttons of question n (1-based), scoped to its own card. */
const optionsOf = (n) =>
  page
    .locator("div.rounded-lg.border", {
      has: page.getByText(new RegExp(`^Question ${n} of`)),
    })
    .last()
    .locator("button[aria-pressed]")
const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` })

// 1. First visit: page 1.
await openLesson()
const pageCount = await rail.count()
check((await currentRailPage()) === 1, `first visit opens on page 1 (of ${pageCount})`)
await shot("01-first-visit-page1")

// 2. The Q&A: pick one answer, do not submit.
await rail.nth(pageCount - 1).click()
await page.waitForTimeout(800)
const firstOption = optionsOf(1).first()
await firstOption.click()
check((await firstOption.getAttribute("aria-pressed")) === "true", "Q&A answer picked")
await shot("02-qa-answer-picked")

// 3. Go to page 3, then leave the lesson.
await rail.nth(2).click()
await page.waitForTimeout(800)
check((await currentRailPage()) === 3, "on page 3 before leaving")
await shot("03-page3-before-leaving")
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle", timeout: 120000 })
await shot("04-left-for-dashboard")

// 4. Come back: page 3, and the picked answer is still there.
await openLesson()
check((await currentRailPage()) === 3, "coming back reopens page 3")
await shot("05-back-on-page3")
await rail.nth(pageCount - 1).click()
await page.waitForTimeout(800)
check(
  (await optionsOf(1).first().getAttribute("aria-pressed")) === "true",
  "the unsubmitted answer is still picked"
)
await shot("06-qa-answer-still-picked")

// 5. Answer the rest, submit, leave, come back: shown as answered, graded.
const questions = page.locator("text=/Question \\d+ of \\d+/")
const qCount = await questions.count()
for (let i = 1; i < qCount; i++) {
  // Each question card holds its own option buttons; pick the first.
  await optionsOf(i + 1).first().click()
}
await page.getByRole("button", { name: /Submit Q&A/ }).click()
await page.waitForSelector("text=/Score \\d+%/", { timeout: 30000 })
const scoreLine = await page.locator("text=/Score \\d+%/").first().innerText()
await shot("07-submitted")
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle", timeout: 120000 })
await openLesson()
check((await currentRailPage()) === pageCount, "coming back reopens the Q&A page")
const scoreBack = await page.locator("text=/Score \\d+%/").count()
check(scoreBack > 0, `the submitted run is still shown (${scoreLine})`)
check(
  (await page.getByRole("button", { name: /Submit Q&A/ }).count()) === 0,
  "no blank quiz to redo"
)
await page.screenshot({ path: `${OUT}/08-back-answers-kept.png`, fullPage: true })

await browser.close()
if (failures) {
  console.error(`${failures} check(s) failed`)
  process.exit(1)
}
console.log("all checks passed")
