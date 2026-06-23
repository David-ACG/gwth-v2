// W11 — capture live :3001 auth-page screenshots (desktop + mobile) as
// completion evidence. Pages are unchanged (W1/W10 FDE); these prove the live
// round-trip surfaces render against the now-working Better Auth backend.
import { chromium, devices } from "playwright"
import { mkdirSync } from "node:fs"

const BASE = "http://192.168.178.50:3001"
const OUT = "completion/screenshots"
mkdirSync(OUT, { recursive: true })

const pages = [
  ["login", "/login"],
  ["signup", "/signup"],
  ["forgot-password", "/forgot-password"],
]

const browser = await chromium.launch()
for (const [vp, opts] of [
  ["desktop", { viewport: { width: 1440, height: 900 } }],
  ["mobile", devices["iPhone 13"]],
]) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  for (const [name, path] of pages) {
    const resp = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 })
    await page.waitForTimeout(600)
    const file = `${OUT}/w11-${name}-${vp}.png`
    await page.screenshot({ path: file, fullPage: true })
    console.log(`${file}  [http ${resp.status()}]`)
  }
  await ctx.close()
}
await browser.close()
