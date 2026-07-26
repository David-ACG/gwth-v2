import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"
const OUT = "/tmp/claude-1000/-home-david-projects-GWTH-launch-plan/7f6e0ac1-d9ae-4001-a19f-3bf5a0f1d05d/scratchpad/after"
const LOCAL = "http://localhost:3000"
const LESSON = "/course/applied-ai-skills/lesson/welcome-to-gwth-six-ways-ai-can-give-you-superpowers"
await mkdir(OUT, { recursive: true })
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } })
const p = await ctx.newPage()
const r = await p.request.post(`${LOCAL}/api/auth/sign-in/email`, {
  headers: { "Content-Type": "application/json" },
  data: { email: "local-check@example.com", password: "Rafiki123" } })
if (!r.ok()) throw new Error("sign-in failed " + r.status())
await p.goto(`${LOCAL}/dashboard`, { waitUntil: "load", timeout: 90000 })
await p.waitForTimeout(2500)
await p.screenshot({ path: `${OUT}/dashboard-1440.png` })
await p.goto(`${LOCAL}${LESSON}`, { waitUntil: "load", timeout: 90000 })
await p.waitForTimeout(2500)
await p.getByRole("button", { name: /continue|next/i }).first().click()
await p.waitForTimeout(2200)
await p.screenshot({ path: `${OUT}/lesson-prose-1440.png` })
const m = await p.evaluate(() => {
  const el = [...document.querySelectorAll("p")].find(e => e.textContent.trim().length > 140)
  if (!el) return null
  const rect = el.getBoundingClientRect(); const fs = parseFloat(getComputedStyle(el).fontSize)
  const rail = document.querySelector("aside, nav")?.getBoundingClientRect()?.width
  return { proseX: Math.round(rect.left), proseW: Math.round(rect.width), fontPx: fs,
           approxCh: Math.round(rect.width / (fs * 0.5)) }
})
console.log("measure:", JSON.stringify(m))
await b.close()
