import { chromium } from "playwright"
const BASE = "https://hlab.taila51191.ts.net:9458"
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true })
const p = await ctx.newPage()
await p.request.post(`${BASE}/api/auth/sign-in/email`, { headers: { "Content-Type": "application/json" }, data: { email: process.env.DEMO_EMAIL, password: process.env.DEMO_PASSWORD } })
await p.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" })
await p.getByRole("button", { name: /search\s*⌘k/i }).click()
await p.getByPlaceholder(/Search lessons/i).waitFor()
await p.waitForTimeout(500)
const groups = await p.evaluate(() => {
  const out = {}
  document.querySelectorAll("[cmdk-group]").forEach(g => {
    const h = g.querySelector("[cmdk-group-heading]")?.textContent?.trim()
    out[h] = [...g.querySelectorAll("[cmdk-item]")].map(i => i.textContent.trim())
  })
  return out
})
for (const [k, v] of Object.entries(groups)) console.log(`${k}: ${v.length}`)
console.log("labs:", JSON.stringify(groups["Labs"]?.slice(0,5) ?? null))
// now type "spread"
await p.getByPlaceholder(/Search lessons/i).fill("spread")
await p.waitForTimeout(600)
const shown = await p.evaluate(() => [...document.querySelectorAll("[cmdk-item]")].filter(i=>i.getAttribute("aria-disabled")!=="true").map(i => i.textContent.trim()))
console.log("spread ->", JSON.stringify(shown))
await b.close()
