import { chromium } from "playwright"

const BASE = process.env.BASE || "http://127.0.0.1:3025"
const OUT = process.env.OUT || "completion/W22-shots"
const TAG = process.env.TAG || "after"

const widths = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
]

const pages = [
  { slug: "labs", path: "/labs" },
  { slug: "pilot", path: "/labs/job-advert-claude-vs-chatgpt" },
]

const browser = await chromium.launch()
for (const vp of widths) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()
  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(400)
    const file = `${OUT}/${TAG}-${p.slug}-${vp.name}.png`
    await page.screenshot({ path: file, fullPage: true })
    // Horizontal overflow check (mobile especially).
    const overflow = await page.evaluate(() => {
      const de = document.documentElement
      return {
        scrollW: de.scrollWidth,
        clientW: de.clientWidth,
        overflow: de.scrollWidth - de.clientWidth,
      }
    })
    console.log(
      `${file}  scrollW=${overflow.scrollW} clientW=${overflow.clientW} overflow=${overflow.overflow}`
    )
  }
  await context.close()
}
await browser.close()
console.log("done")
