import { chromium } from "playwright"
const BASE = "http://127.0.0.1:3025"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await page.goto(`${BASE}/labs/three-chatbots-one-difficult-email`, { waitUntil: "networkidle" })
await page.waitForTimeout(400)
await page.screenshot({ path: "completion/W22-shots/after-archive-legacy-1440.png", fullPage: true })
const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
console.log("legacy archive overflow=", o)
await browser.close()
