import { chromium } from "playwright"

const BASE = "http://localhost:3100"
const OUT = new URL(".", import.meta.url).pathname
const PAGES = ["for-teams", "newsletter", "contact"]
const MODES = ["light", "dark"]
const WIDTHS = [
  { w: 1440, h: 900, tag: "1440" },
  { w: 412, h: 915, tag: "412" },
]

const errors = []

const browser = await chromium.launch()
for (const mode of MODES) {
  for (const { w, h, tag } of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      colorScheme: mode,
    })
    // Force next-themes into the chosen mode before any app code runs.
    await ctx.addInitScript((m) => {
      try { localStorage.setItem("theme", m) } catch {}
    }, mode)
    const p = await ctx.newPage()
    p.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(`[${mode} ${tag}] ${p.url()} :: ${msg.text()}`)
      }
    })
    p.on("pageerror", (e) => {
      errors.push(`[${mode} ${tag}] pageerror :: ${e.message}`)
    })
    for (const slug of PAGES) {
      await p.goto(`${BASE}/${slug}`, { waitUntil: "networkidle" })
      // Belt-and-braces: ensure the .dark class matches the requested mode.
      await p.evaluate((m) => {
        const el = document.documentElement
        if (m === "dark") el.classList.add("dark")
        else el.classList.remove("dark")
      }, mode)
      await p.waitForTimeout(400)
      await p.screenshot({
        path: `${OUT}/${slug}-${mode}-${tag}.png`,
        fullPage: true,
      })
    }
    await ctx.close()
  }
}
await browser.close()

if (errors.length) {
  console.log("CONSOLE/PAGE ERRORS:")
  for (const e of errors) console.log("  " + e)
} else {
  console.log("NO console or page errors across all pages/modes/widths.")
}
console.log("screenshots written to", OUT)
