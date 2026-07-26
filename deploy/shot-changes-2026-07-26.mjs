// Screenshots for the "changes-2026-07-26" review walkthrough: one shot per
// change delivered, so David can see which page each item is about.
//
//   node deploy/shot-changes-2026-07-26.mjs <outDir> <baseUrl>
//
// Credentials from env (DEMO_EMAIL / DEMO_PASSWORD).
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const OUT = process.argv[2]
const BASE = process.argv[3]
if (!OUT || !BASE) throw new Error("usage: <outDir> <baseUrl>")

const EMAIL = process.env.DEMO_EMAIL ?? "familyuccelli@gmail.com"
const PASSWORD = process.env.DEMO_PASSWORD ?? "Rafiki123"
const SLUG = "welcome-to-gwth-six-ways-ai-can-give-you-superpowers"

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const res = await page.request.post(`${BASE}/api/auth/sign-in/email`, {
  headers: { "Content-Type": "application/json", Origin: BASE },
  data: { email: EMAIL, password: PASSWORD },
})
if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`)

async function shot(name, path, prep) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 120000 })
  await page.waitForTimeout(2500)
  if (page.url().includes("/login")) throw new Error(`${path} bounced to /login`)
  if (prep) await prep()
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(`${name}  <-  ${page.url()}`)
}

// 1. Signed-in nav: the Lessons link now points at the course.
await shot("nav-lessons-link", "/", async () => {
  const href = await page
    .getByRole("link", { name: "Lessons" })
    .first()
    .getAttribute("href")
  console.log(`   Lessons link href = ${href}`)
})

// 2. Dashboard: lesson rows are links now.
await shot("dashboard-clickable-rows", "/dashboard", async () => {
  const row = page.locator('a[href*="/lesson/"]').first()
  await row.scrollIntoViewIfNeeded()
  await row.hover()
  await page.waitForTimeout(600)
})

// 3. The syllabus page (added to the demo walkthrough).
await shot("syllabus", "/course/applied-ai-skills")

// 4. Lesson page 1: the new intro video.
await shot("lesson-intro-video", `/course/applied-ai-skills/lesson/${SLUG}`, async () => {
  const v = page.locator("video").first()
  if (await v.count()) {
    await v.evaluate((el) => {
      el.muted = true
      el.currentTime = 30
      return el.play().catch(() => {})
    })
    await page.waitForTimeout(4000)
  }
})

// 5. Lesson prose page: the narration play button, now above the text.
await page.goto(`${BASE}/course/applied-ai-skills/lesson/${SLUG}`, {
  waitUntil: "networkidle",
  timeout: 120000,
})
await page.waitForTimeout(2000)
const cont = page.getByRole("button", { name: /continue/i }).first()
if (await cont.count()) await cont.click()
await page.waitForTimeout(2500)
await page.screenshot({ path: `${OUT}/lesson-play-button-top.png` })
console.log("lesson-play-button-top  <-  prose page")

await browser.close()
console.log(`wrote shots to ${OUT}`)
