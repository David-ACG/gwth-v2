// W18 packet screenshots — FDE empty / error / 404 states.
// Captures each state's <section data-shot> from /w18-preview, plus the real
// 404 at a bogus URL, in light + dark at 1440/768/412.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "completion", "W18")
mkdirSync(OUT, { recursive: true })

const BASE = process.env.BASE_URL || "http://localhost:3013"
const widths = [1440, 768, 412]
const schemes = ["light", "dark"]
const shots = ["empty", "error", "notfound"]

const browser = await chromium.launch()
try {
  for (const scheme of schemes) {
    const ctx = await browser.newContext({ colorScheme: scheme })
    const page = await ctx.newPage()

    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 900 })

      // Section shots from the preview route.
      await page.goto(`${BASE}/w18-preview`, { waitUntil: "networkidle" })
      // The app themes via a .dark class (next-themes), not the media query,
      // so force it to match the requested scheme.
      await page.evaluate((s) => {
        document.documentElement.classList.toggle("dark", s === "dark")
      }, scheme)
      await page.waitForTimeout(400)
      for (const shot of shots) {
        const el = page.locator(`[data-shot="${shot}"]`)
        await el.screenshot({ path: join(OUT, `${shot}-${scheme}-${w}.png`) })
        console.log(`shot ${shot}-${scheme}-${w}.png`)
      }

      // Real live 404 (not-found.tsx) at a bogus URL.
      await page.goto(`${BASE}/this-route-does-not-exist-w18`, {
        waitUntil: "networkidle",
      })
      await page.evaluate((s) => {
        document.documentElement.classList.toggle("dark", s === "dark")
      }, scheme)
      await page.waitForTimeout(400)
      await page.screenshot({
        path: join(OUT, `live404-${scheme}-${w}.png`),
      })
      console.log(`shot live404-${scheme}-${w}.png`)
    }
    await ctx.close()
  }
} finally {
  await browser.close()
}
console.log("done")
