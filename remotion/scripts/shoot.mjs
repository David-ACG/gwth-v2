// Playwright CLI screenshot script for W12 verification.
// Captures the explainer preview route and the live home in light + dark at
// 1440 / 768 / 412, recording any console errors.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"

const BASE = process.env.BASE || "http://localhost:3009"
const OUT = process.env.OUT || "completion/W12-shots"
mkdirSync(OUT, { recursive: true })

const widths = [1440, 768, 412]
// The /explainer-preview review route was deleted in W25 once W12 closed; the
// homepage carries the final embed, which is what this now shoots.
const targets = [
  { name: "home", path: "/" },
]
const errors = []

const browser = await chromium.launch()
for (const t of targets) {
  for (const theme of ["light", "dark"]) {
    for (const w of widths) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 } })
      const page = await ctx.newPage()
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(`[${t.name}/${theme}/${w}] ${m.text()}`)
      })
      page.on("pageerror", (e) => errors.push(`[${t.name}/${theme}/${w}] PAGEERROR ${e.message}`))
      await page.goto(BASE + t.path, { waitUntil: "networkidle" })
      await page.evaluate((th) => {
        const html = document.documentElement
        html.classList.remove("light", "dark")
        html.classList.add(th)
        try { localStorage.setItem("theme", th) } catch {}
      }, theme)
      await page.waitForTimeout(500)
      await page.screenshot({ path: `${OUT}/${t.name}-${theme}-${w}.png`, fullPage: true })
      await ctx.close()
    }
  }
}
await browser.close()

console.log("Console/page errors:", errors.length)
for (const e of errors) console.log("  " + e)
