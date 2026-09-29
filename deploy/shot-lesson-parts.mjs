// Drive the lessons-in-parts viewer (bead gwth-launch-hqyp) on a running site
// and capture review screenshots. Usage:
//   node deploy/shot-lesson-parts.mjs <outDir> [baseUrl]
// Env: DEMO_EMAIL / DEMO_PASSWORD (defaults: the local tester account),
// LESSON_PATH (default: M1 L10), THEME=light|dark, WIDTH (default 1440).
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

const OUT = process.argv[2] ?? "shots"
const BASE = process.argv[3] ?? "https://hlab.taila51191.ts.net:9458"
const EMAIL = process.env.DEMO_EMAIL ?? "lesson-parts-check@example.com"
const PASSWORD = process.env.DEMO_PASSWORD ?? "Rafiki123"
const LESSON = process.env.LESSON_PATH ?? "/course/applied-ai-skills/lesson/data-superpower-turn-messy-information-into-answers"
const THEME = process.env.THEME ?? "light"
const WIDTH = Number(process.env.WIDTH ?? 1440)
const HEIGHT = WIDTH < 600 ? 844 : 900
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  colorScheme: THEME,
  ignoreHTTPSErrors: true,
  deviceScaleFactor: WIDTH < 600 ? 2 : 1,
})
const page = await context.newPage()
const errors = []
page.on("pageerror", (e) => errors.push(String(e)))
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()) })
await page.addInitScript((t) => { try { localStorage.setItem("theme", t) } catch {} }, THEME)

const res = await page.request.post(`${BASE}/api/auth/sign-in/email`, {
  data: { email: EMAIL, password: PASSWORD },
  headers: { origin: BASE },
})
if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`)

const tag = `${WIDTH}-${THEME}`
const shot = async (name, opts = {}) => page.screenshot({ path: `${OUT}/${name}-${tag}.png`, ...opts })

await page.goto(`${BASE}${LESSON}?choose=1`, { waitUntil: "networkidle" })
await page.waitForSelector("[data-testid=format-choice]")
await page.waitForTimeout(2500)
await shot("01-choice")

await page.getByRole("button", { name: "Choose Read or listen" }).click()
await page.waitForSelector("[data-testid=intro-screen]")
await shot("02-intro", { fullPage: true })

await page.getByRole("button", { name: /Start part 1|Carry on/ }).click()
await page.waitForSelector("[data-testid=part-screen]")
await page.getByRole("button", { name: "Play" }).click()
await page.waitForTimeout(4000)
await shot("03-read-part1-playing")
await page.getByRole("button", { name: "Pause" }).click()

// Check question: two wrong tries, then the explanation.
const card = page.locator("[data-testid=check-card]")
await card.scrollIntoViewIfNeeded()
const opts = card.locator("button[data-option]")
const count = await opts.count()
let wrongs = 0
for (let k = 0; k < count && wrongs < 2; k++) {
  await opts.nth(k).click()
  await page.waitForTimeout(900)
  const fb = await card.innerText()
  if (/Right answer/.test(fb) && !(await opts.nth(k).innerText()).includes("Not this one")) break
  wrongs += 1
}
await card.scrollIntoViewIfNeeded()
await shot("04-check-after-answers")

await page.getByTestId("confused-link").click()
await page.waitForTimeout(300)
await page.locator("[data-testid=confused-panel]").scrollIntoViewIfNeeded()
await shot("05-confused")

await page.getByTestId("continue").click()
await page.waitForSelector("[data-part=p2]")
await page.getByRole("button", { name: /Watch/ }).first().click()
await page.waitForSelector("video")
await page.waitForTimeout(1500)
await shot("06-watch-part2")
await page.locator("details summary").click()
await page.waitForTimeout(300)
await shot("07-watch-read-instead", { fullPage: true })

await page.goto(`${BASE}${LESSON}?part=end`, { waitUntil: "networkidle" })
await page.waitForTimeout(800)
await shot("08-end", { fullPage: true })

console.log(JSON.stringify({ errors: errors.slice(0, 10), url: page.url() }))
await browser.close()
