// Throwaway: re-run ONLY the failed media-phase check with the fixed matcher
// (login -> /progress -> completion visible), without re-doing the quiz.
import { chromium } from "playwright"

const BASE = "http://192.168.178.50:3001"
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
page.on("console", (m) => { if (m.type() === "error") console.log("console-error:", m.text().slice(0, 200)) })

await page.goto(`${BASE}/login`, { waitUntil: "load" })
await page.fill('input[type="email"]', process.env.FRESH_EMAIL)
await page.fill('input[type="password"]', process.env.FRESH_PW)
await Promise.all([page.waitForURL(/dashboard/, { timeout: 20000 }), page.click('button[type="submit"]')])
await page.goto(`${BASE}/progress`, { waitUntil: "networkidle" })
await page.waitForTimeout(700)
const pb = (await page.content()).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")
const ok = /1 (of|\/) 26|1 lesson/i.test(pb)
console.log(`${ok ? "PASS" : "FAIL"}: after re-login /progress shows the completion`)
console.log("matched context:", (pb.match(/.{40}1 of 26.{40}/i) || [pb.match(/Lessons Completed/i) ? "has 'Lessons Completed'" : "no match"])[0])
await page.screenshot({ path: "completion/W6/progress-after-relogin-1280.png", fullPage: true })
await browser.close()
process.exit(ok ? 0 : 1)
