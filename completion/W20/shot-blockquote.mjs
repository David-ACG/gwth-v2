// Focused blockquote close-up: navigate the welcome lesson to the section that
// carries the flagship rule and screenshot the styled <blockquote>.
import pkg from "/home/david/projects/GWTH_V2/node_modules/@playwright/test/index.js"
const { chromium } = pkg
const [, , BASE, EMAIL, PASS, OUTDIR, TAG] = process.argv
const WELCOME = "welcome-to-gwth-six-ways-ai-can-give-you-superpowers"
const COURSE = "applied-ai-skills"

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true })
const lp = await context.newPage()
await lp.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" })
await lp.fill('input[name="email"]', EMAIL)
await lp.fill('input[name="password"]', PASS)
await lp.click('button[type="submit"]')
await lp.waitForTimeout(3000)
await lp.close()

const page = await context.newPage()
await page.goto(`${BASE}/course/${COURSE}/lesson/${WELCOME}?surface=prose&page=4`, { waitUntil: "networkidle" })
await page.waitForTimeout(1500)
// Walk to a page whose body contains a blockquote with the flagship rule.
for (let i = 0; i < 14; i++) {
  const txt = await page.evaluate(() => {
    const bq = document.querySelector("[data-section='lesson-viewer'] blockquote")
    return bq ? bq.textContent : null
  })
  if (txt && /AI suggests|stranger|disagreed/i.test(txt)) break
  const cont = page.locator("text=CONTINUE").first()
  if (await cont.count()) { await cont.click(); await page.waitForTimeout(600) } else break
}
const bq = page.locator("[data-section='lesson-viewer'] blockquote").first()
await bq.scrollIntoViewIfNeeded()
await page.waitForTimeout(400)
// Screenshot the content column around the blockquote.
await page.screenshot({ path: `${OUTDIR}/${TAG}_blockquote_closeup.png`, fullPage: false })
const html = await bq.evaluate((el) => el.outerHTML)
console.log("BLOCKQUOTE HTML:", html.slice(0, 200))
await browser.close()
console.log("done")
