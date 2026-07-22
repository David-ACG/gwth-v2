// Screenshot the wordless-gate lesson template on staging before/after 80%.
import { chromium } from "playwright"

const B = "http://192.168.178.50:3001"
const EMAIL = process.env.VERIFY_EMAIL
const PW = process.env.VERIFY_PW
const OUT = process.env.OUT_DIR

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" })
const page = await ctx.newPage()
const errors = []
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)))

await page.goto(`${B}/login`, { waitUntil: "networkidle" })
await page.locator('input[type="email"]').first().fill(EMAIL)
await page.locator('input[type="password"]').first().fill(PW)
await Promise.all([
  page.waitForURL(/\/dashboard/, { timeout: 25000 }),
  page.locator('button[type="submit"]').first().click(),
])

// Course overview: the completion rule said once
await page.goto(`${B}/course/applied-ai-skills`, { waitUntil: "networkidle" })
await page.waitForTimeout(800)
const overviewText = await page.locator("body").innerText()
console.log("overview states rule:", /A lesson counts once/.test(overviewText))
await page.screenshot({ path: `${OUT}/course-overview.png`, fullPage: false })

// Lesson 1 video page, pre-80%
await page.goto(`${B}/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers`, { waitUntil: "networkidle" })
await page.waitForTimeout(1500)
const body1 = await page.locator("body").innerText()
console.log("gate copy gone:", !/GATE 1 \/ 2|Counts toward completion|THRESHOLD/.test(body1))
console.log("pre ticks:", await page.getByTestId("video-watched-tick").count(), await page.getByTestId("continue-tick").count(), await page.getByTestId("gate-tick").count())
await page.screenshot({ path: `${OUT}/lesson1-video-before.png`, fullPage: true })

// Drive the real <video> past 80%
const seeked = await page.evaluate(async () => {
  const v = document.querySelector("video")
  if (!v) return "no-video"
  if (!v.duration || Number.isNaN(v.duration)) {
    await new Promise((r) => v.addEventListener("loadedmetadata", r, { once: true }))
  }
  v.muted = true
  await v.play().catch(() => {})
  v.currentTime = v.duration * 0.85
  await new Promise((r) => setTimeout(r, 1200))
  v.pause()
  return `dur=${Math.round(v.duration)}s now=${Math.round(v.currentTime)}s`
})
console.log("seek:", seeked)
await page.waitForTimeout(1500)
console.log("post ticks:", await page.getByTestId("video-watched-tick").count(), await page.getByTestId("continue-tick").count(), await page.getByTestId("gate-tick").count())
await page.screenshot({ path: `${OUT}/lesson1-video-after80.png`, fullPage: true })

console.log("page errors:", errors.length ? JSON.stringify(errors) : "none")
await browser.close()
