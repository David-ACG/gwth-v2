/**
 * Layout-audit capture: the seven PUBLIC demo-path pages, at both widths the
 * audit judges against (1440 desktop, 390 mobile), full-page so composition and
 * vertical rhythm can be read, not just the fold.
 *
 *   node deploy/shot-audit-marketing.mjs <outDir> [baseUrl]
 */
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const OUT = process.argv[2] ?? "completion/audit-layout/marketing"
const BASE = process.argv[3] ?? "https://gwth.ai"

const PAGES = [
  ["home", "/"],
  ["lessons", "/lessons"],
  ["labs", "/labs"],
  ["lab-job-advert", "/labs/job-advert-claude-vs-chatgpt"],
  ["pricing", "/pricing"],
  ["for-teams", "/for-teams"],
  ["login", "/login"],
]

const WIDTHS = [
  ["1440", 1440, 900],
  ["390", 390, 844],
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

for (const [wname, width, height] of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height } })
  for (const [name, path] of PAGES) {
    // Not networkidle: some pages hold a connection open (video, analytics) and
    // never go idle, which stalls the whole run for one page's sake.
    await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60000 })
    // Next/Image is lazy: a fullPage screenshot alone does NOT bring below-fold
    // images into view, so they shoot as empty panels and read as broken. Walk
    // the page down first, then return to the top for the fold shot.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(4000)
    // Fold shot tells us what lands in the first screen; full shot tells us how
    // the page is composed. The audit needs both.
    await page.screenshot({ path: `${OUT}/${name}-${wname}-fold.png` })
    await page.screenshot({ path: `${OUT}/${name}-${wname}-full.png`, fullPage: true })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    )
    console.log(`${name} @${wname}${overflow ? "  OVERFLOW" : ""}`)
  }
  await page.close()
}

await browser.close()
