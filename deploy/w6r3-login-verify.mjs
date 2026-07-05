// W6 r3 step 5: UI login with the fresh invitee, assert dashboard access state.
import { chromium } from "playwright"

const BASE = "http://192.168.178.50:3001"
const EMAIL = process.env.FRESH_EMAIL
const PW = process.env.FRESH_PW
const OUT = "/home/david/projects/GWTH_V2/completion/W6"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "light" })
const page = await ctx.newPage()
const errors = []
page.on("console", (m) => { if (m.type() === "error" && !m.text().includes("favicon")) errors.push(m.text().slice(0, 300)) })
page.on("pageerror", (e) => errors.push(`pageerror: ${String(e).slice(0, 300)}`))

await page.goto(`${BASE}/login`, { waitUntil: "networkidle" })
await page.locator('input[type="email"]').first().fill(EMAIL)
await page.locator('input[type="password"]').first().fill(PW)
await Promise.all([
  page.waitForURL(/\/dashboard/, { timeout: 25000 }),
  page.locator('button[type="submit"]').first().click(),
])
console.log("post-login url:", page.url())
await page.waitForLoadState("networkidle")
await page.waitForTimeout(1000)

const body = await page.locator("body").innerText()
console.log("greeting has 'W6 Invitee':", /W6 Invitee|W6/.test(body), "| exact name:", body.includes("W6 Invitee"))
console.log("locked 'beta invite required' state:", /beta invite required/i.test(body))
console.log("mentions Month 1:", /month 1/i.test(body))
const lessonLinks = await page.locator('a[href*="lesson"]').count()
const courseLinks = await page.locator('a[href*="course"]').count()
console.log("lesson links:", lessonLinks, "| course links:", courseLinks)
const firstLesson = lessonLinks ? await page.locator('a[href*="lesson"]').first().getAttribute("href") : null
console.log("first lesson href:", firstLesson)
// grab a heading snapshot for the report
console.log("headings:", JSON.stringify((await page.locator("h1, h2").allTextContents()).slice(0, 8)))

await page.screenshot({ path: `${OUT}/signup-fixed-dashboard-1280.png`, fullPage: true })
console.log("console errors:", errors.length ? JSON.stringify(errors, null, 2) : "none")
await browser.close()
