/**
 * The Three monthly issues section, before and after the spacing fix.
 * BEFORE comes from production (which has not been redeployed, so it still
 * shows the old placement); AFTER from the local build of HEAD.
 *   node deploy/shot-curriculum-before-after.mjs
 */
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"
const OUT = "completion/audit-applied"
await mkdir(OUT, { recursive: true })
const b = await chromium.launch()
for (const [tag, base] of [["before", "https://gwth.ai"], ["after", "http://localhost:3000"]]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(`${base}/`, { waitUntil: "load", timeout: 90000 })
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 110))
    }
  })
  await p.waitForTimeout(2500)
  await p.evaluate(() =>
    document.querySelector('[data-section="curriculum"]').scrollIntoView({ block: "start" }))
  await p.waitForTimeout(2000)
  const sec = await p.$('[data-section="curriculum"]')
  await sec.screenshot({ path: `${OUT}/curriculum-${tag}.png` })
  console.log(tag, base)
  await p.close()
}
await b.close()
