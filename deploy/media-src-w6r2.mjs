// Throwaway: extract <video>/<audio> src URLs from the lesson page (I3 CDN assertion).
import { chromium } from "playwright"

const BASE = "http://192.168.178.50:3001"
const LESSON = "/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

await page.goto(`${BASE}/login`, { waitUntil: "load" })
await page.fill('input[type="email"]', process.env.FRESH_EMAIL)
await page.fill('input[type="password"]', process.env.FRESH_PW)
await Promise.all([page.waitForURL(/dashboard/, { timeout: 20000 }), page.click('button[type="submit"]')])

// video surface
await page.goto(`${BASE}${LESSON}?surface=video`, { waitUntil: "networkidle" })
await page.waitForSelector("video", { timeout: 20000 })
const videoSrc = await page.evaluate(() => {
  const v = document.querySelector("video")
  return v?.currentSrc || v?.src || v?.querySelector("source")?.src || ""
})
// main surface for audio
await page.goto(`${BASE}${LESSON}`, { waitUntil: "networkidle" })
await page.waitForSelector("audio", { state: "attached", timeout: 20000 })
const audioSrc = await page.evaluate(() => {
  const a = document.querySelector("audio")
  return a?.currentSrc || a?.src || a?.querySelector("source")?.src || ""
})
console.log("VIDEO_SRC=" + videoSrc)
console.log("AUDIO_SRC=" + audioSrc)
await browser.close()
