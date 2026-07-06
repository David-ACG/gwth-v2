/**
 * W17 screenshot harness: renders each email HTML file at desktop (640px, to
 * show the 600px table with margin) and mobile (390px) widths for the packet.
 */
import { chromium } from "playwright"
import { readdirSync } from "node:fs"

const DIR = new URL("../completion/W17/", import.meta.url)
const files = readdirSync(DIR).filter((f) => f.endsWith(".html"))

const browser = await chromium.launch()
for (const file of files) {
  const name = file.replace(/\.html$/, "")
  const url = new URL(file, DIR).href
  for (const [suffix, width] of [
    ["desktop", 640],
    ["mobile", 390],
  ] as const) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      colorScheme: "light",
    })
    await page.goto(url, { waitUntil: "networkidle" })
    await page.screenshot({
      path: new URL(`${name}-${suffix}.png`, DIR).pathname,
      fullPage: true,
    })
    await page.close()
    console.log(`shot ${name}-${suffix}.png`)
  }
}
await browser.close()
