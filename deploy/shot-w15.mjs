// W15 — capture live :3001 evidence for the beta polish sweep packet:
// /login without OAuth buttons (provider env unset) and / (final home), at
// desktop (1440), tablet (768) and mobile (412) widths in light + dark,
// collecting console errors. A gated dev route (/demo) is visited last to
// show the anonymous bounce to /login.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

const BASE = process.env.SHOT_BASE ?? "http://192.168.178.50:3001"
const OUT = "completion/W15"
mkdirSync(OUT, { recursive: true })

const targets = [
  ["login", "/login"],
  ["home", "/"],
]
const widths = [
  ["1440", { width: 1440, height: 900 }],
  ["768", { width: 768, height: 1024 }],
  ["412", { width: 412, height: 915 }],
]

const consoleErrors = []
const browser = await chromium.launch()
for (const scheme of ["light", "dark"]) {
  for (const [w, viewport] of widths) {
    const ctx = await browser.newContext({ viewport, colorScheme: scheme })
    const page = await ctx.newPage()
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(`[${scheme}/${w}] ${msg.text()}`)
    })
    page.on("pageerror", (err) => consoleErrors.push(`[${scheme}/${w}] pageerror: ${err.message}`))
    for (const [name, path] of targets) {
      const resp = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 })
      await page.waitForTimeout(800)
      const file = `${OUT}/${name}-${scheme}-${w}.png`
      // Full page for login (short), viewport-only for home (it is long).
      await page.screenshot({ path: file, fullPage: name === "login" })
      const oauthButtons = await page.locator("text=/continue with/i").count()
      console.log(`${file}  [http ${resp.status()}] oauth-buttons=${oauthButtons}`)
    }
    await ctx.close()
  }
}

// Gated dev route: anonymous visit must land on /login (redirect, not 200).
// Was /demo/dashboard until W25 deleted the demo tree; /score-card-variants is
// a surviving DEV_REVIEW_PATHS entry and proves the same guard.
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const resp = await page.goto(`${BASE}/score-card-variants`, { waitUntil: "networkidle", timeout: 45000 })
await page.waitForTimeout(500)
console.log(`gated /score-card-variants -> final url ${page.url()} [http ${resp.status()}]`)
await page.screenshot({ path: `${OUT}/gated-demo-redirect-1440.png`, fullPage: true })
await ctx.close()
await browser.close()

console.log(`console errors: ${consoleErrors.length}`)
for (const e of consoleErrors) console.log("  " + e)
process.exit(consoleErrors.length > 0 ? 1 : 0)
