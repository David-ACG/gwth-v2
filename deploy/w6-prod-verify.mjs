// W6 post-deploy verification on PROD https://gwth.ai — steps 5-10.
// Usage: FRESH_EMAIL=... FRESH_PW=... node deploy/w6-prod-verify.mjs
import { chromium } from "playwright"
import { writeFileSync } from "node:fs"

const BASE = "https://gwth.ai"
const OUT = "/home/david/projects/GWTH_V2/completion/W6"
const EMAIL = process.env.FRESH_EMAIL
const PW = process.env.FRESH_PW
const LESSON_PATH = "/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"
const LAB_PATH = "/labs/build-your-prompt-cheat-sheet"

const results = { checks: [], consoleErrors: {}, media: {} }
let failures = 0
function check(name, ok, detail = "") {
  results.checks.push({ name, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}${detail ? " — " + detail : ""}`)
  if (!ok) failures++
}
const IGNORE = [/favicon/i, /Download the React DevTools/i]
function trackConsole(page, key) {
  results.consoleErrors[key] = results.consoleErrors[key] || []
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORE.some((r) => r.test(m.text())))
      results.consoleErrors[key].push(m.text().slice(0, 300))
  })
  page.on("pageerror", (e) => results.consoleErrors[key].push("pageerror: " + String(e).slice(0, 300)))
}

const browser = await chromium.launch()

async function uiLogin(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "load", timeout: 60000 })
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PW)
  await Promise.all([
    page.waitForURL(/dashboard/, { timeout: 30000 }),
    page.click('button[type="submit"]'),
  ])
}

// ---------- anon context: /, /login (console + home shots) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "light" })
  const page = await ctx.newPage()
  trackConsole(page, "home")
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 60000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/prod-home-1280.png`, fullPage: true })
  check("home renders", (await page.locator("h1").count()) > 0)

  const page2 = await ctx.newPage()
  trackConsole(page2, "login")
  await page2.goto(`${BASE}/login`, { waitUntil: "load", timeout: 60000 })
  await page2.waitForTimeout(1000)
  check("login renders form", (await page2.locator('input[type="email"]').count()) === 1)
  await ctx.close()
}
{
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, colorScheme: "light" })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 60000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/prod-home-412.png`, fullPage: true })
  await ctx.close()
}

// ---------- fresh account context (1280 light) ----------
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "light" })
const page = await ctx.newPage()
trackConsole(page, "dashboard")
await uiLogin(page)
check("UI login reached /dashboard", page.url().includes("dashboard"), page.url())
await page.waitForLoadState("networkidle").catch(() => {})
await page.waitForTimeout(1200)
const dashBody = await page.locator("body").innerText()
check("dashboard greets W6", /W6/.test(dashBody))
check("Month 1 unlocked (no invite-required lock)", !/beta invite required|invite required/i.test(dashBody))
check("mentions Month 1", /month 1/i.test(dashBody))
check("honest zeros: 'Not started yet'", /Not started yet/i.test(dashBody))
check("no fake streak / fake counts", !/5 day streak|Held for 5 days|12 \/ 24|12 of 24/i.test(dashBody))
await page.screenshot({ path: `${OUT}/prod-dashboard-1280.png`, fullPage: true })

// ---------- lesson: real slug (KNOWN: prod DB has no content rows) ----------
const lpage = await ctx.newPage()
trackConsole(lpage, "lesson")
const lessonResp = await lpage.goto(`${BASE}${LESSON_PATH}?surface=video`, { waitUntil: "load", timeout: 60000 })
await lpage.waitForTimeout(1500)
const lessonBody = await lpage.locator("body").innerText()
const lesson404 = /lesson not found/i.test(lessonBody)
console.log(`real lesson slug: HTTP ${lessonResp?.status()} | 'Lesson not found' shown: ${lesson404}`)
const videoCount = await lpage.locator("video").count()
if (videoCount > 0) {
  const videoSrc = await lpage.evaluate(() => {
    const v = document.querySelector("video")
    return v?.currentSrc || v?.src || v?.querySelector("source")?.src || ""
  })
  results.media.video = videoSrc
  console.log("video src:", videoSrc)
  check("video src on media.gwth.ai", videoSrc.startsWith("https://media.gwth.ai"))
  await lpage.evaluate(() => document.querySelector("video")?.play())
  await lpage.waitForTimeout(2800)
  const vt = await lpage.evaluate(() => document.querySelector("video")?.currentTime || 0)
  check("video plays (currentTime advances 2-3s)", vt > 1, `currentTime=${vt.toFixed(2)}s`)
  await lpage.evaluate(() => document.querySelector("video")?.pause())
} else {
  check("real lesson renders with <video>", false, `HTTP ${lessonResp?.status()}, 'Lesson not found'=${lesson404} — prod lessons table is empty (content never imported)`)
}

// document what the mock-fallback slug does on prod
const mockResp = await lpage.goto(`${BASE}/course/applied-ai-skills/lesson/welcome-to-gwth`, { waitUntil: "load", timeout: 60000 })
await lpage.waitForTimeout(1200)
const mockBody = await lpage.locator("body").innerText()
console.log(`mock-fallback slug 'welcome-to-gwth': HTTP ${mockResp?.status()} | not-found=${/lesson not found/i.test(mockBody)} | has video=${await lpage.locator("video").count()} | has audio=${await lpage.locator("audio").count()}`)

// document the course page lesson list (mock fallback?)
await lpage.goto(`${BASE}/course/applied-ai-skills`, { waitUntil: "load", timeout: 60000 })
await lpage.waitForTimeout(1200)
const lessonHrefs = await lpage.locator('a[href*="/lesson/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")).slice(0, 6))
console.log("course page lesson links (first 6):", JSON.stringify(lessonHrefs))

// ---------- lesson screenshots (whatever prod actually renders) ----------
await lpage.goto(`${BASE}${LESSON_PATH}`, { waitUntil: "load", timeout: 60000 })
await lpage.waitForTimeout(1200)
const audioCount = await lpage.locator("audio").count()
if (audioCount > 0) {
  const audioSrc = await lpage.evaluate(() => {
    const a = document.querySelector("audio")
    return a?.currentSrc || a?.src || a?.querySelector("source")?.src || ""
  })
  results.media.audio = audioSrc
  console.log("audio src:", audioSrc)
  check("audio src on media.gwth.ai", audioSrc.startsWith("https://media.gwth.ai"))
}
await lpage.screenshot({ path: `${OUT}/prod-lesson-1280.png`, fullPage: true })

{
  const mctx = await browser.newContext({ viewport: { width: 412, height: 915 }, colorScheme: "light", storageState: await ctx.storageState() })
  const mpage = await mctx.newPage()
  await mpage.goto(`${BASE}${LESSON_PATH}`, { waitUntil: "load", timeout: 60000 })
  await mpage.waitForTimeout(1500)
  await mpage.screenshot({ path: `${OUT}/prod-lesson-412.png`, fullPage: true })
  await mctx.close()
}

// ---------- lab ----------
const labPage = await ctx.newPage()
trackConsole(labPage, "lab")
await labPage.goto(`${BASE}${LAB_PATH}`, { waitUntil: "load", timeout: 60000 })
await labPage.waitForTimeout(1200)
check("lab renders", (await labPage.locator("h1, h2").count()) > 0, JSON.stringify((await labPage.locator("h1").allTextContents()).slice(0, 3)))
await labPage.screenshot({ path: `${OUT}/prod-lab-1280.png`, fullPage: true })

// ---------- guide + feedback ----------
const gpage = await ctx.newPage()
trackConsole(gpage, "guide")
await gpage.goto(`${BASE}/guide`, { waitUntil: "load", timeout: 60000 })
await gpage.waitForTimeout(1200)
check("guide renders", (await gpage.locator("h1, h2").count()) > 0)
await gpage.screenshot({ path: `${OUT}/prod-guide-1280.png`, fullPage: true })

const fbSection = gpage.locator('[data-section="report-problem"]')
check("feedback panel present on /guide", (await fbSection.count()) > 0)
await gpage.selectOption("#feedback-category", "general")
await gpage.fill("#feedback-message", "W6 post-deploy feedback round-trip test")
await gpage.locator('button[type="submit"]', { hasText: /send feedback/i }).first().click()
try {
  await gpage.getByText(/thank you/i).first().waitFor({ timeout: 15000 })
  check("feedback submitted (Thank you surface)", true)
} catch {
  check("feedback submitted (Thank you surface)", false, (await gpage.locator("body").innerText()).slice(0, 300))
}

await ctx.close()
await browser.close()

// ---------- console error verdict ----------
for (const [k, v] of Object.entries(results.consoleErrors)) {
  console.log(`console[${k}]: ${v.length ? JSON.stringify(v) : "clean"}`)
}
writeFileSync(`${OUT}/prod-verify.json`, JSON.stringify(results, null, 2))
console.log(`\nDONE: ${results.checks.filter((c) => c.ok).length} pass / ${failures} fail`)
process.exit(failures ? 1 : 0)
