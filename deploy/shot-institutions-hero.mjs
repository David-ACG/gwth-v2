// The /for-institutions masthead picture, before and after
// (bead gwth-launch-88z.32.13). David, 2026-09-13: "the image does not convey
// any message. I'm not sure what an arrow pointing at a tear in the page
// means." Only the picture changed, so the evidence has to show the picture
// on its own AND the whole masthead it sits in, in both modes and on a phone.
//   node deploy/shot-institutions-hero.mjs [base-url]
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import path from "node:path"

const base = process.argv[2] ?? "https://hlab.taila51191.ts.net:9458"
const out =
  "/home/david/projects/GWTH-launch-plan/walkthrough/shots/institutions-hero"
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ args: ["--ignore-certificate-errors"] })

async function setMode(page, mode) {
  await page.evaluate((m) => {
    document.documentElement.classList.toggle("dark", m === "dark")
  }, mode)
  await page.waitForTimeout(600)
}

for (const mode of ["light", "dark"]) {
  for (const width of [1440, 390]) {
    const ctx = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      deviceScaleFactor: 1,
      colorScheme: mode,
      ignoreHTTPSErrors: true,
    })
    const page = await ctx.newPage()
    await page.goto(base + "/for-institutions", {
      waitUntil: "networkidle",
      timeout: 90000,
    })
    await setMode(page, mode)

    // The picture alone: whichever of the two renders this mode shows.
    const plate = page.locator("figure img:visible").first()
    await plate.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    const plateFile = path.join(out, `plate-${width}-${mode}.png`)
    await plate.screenshot({ path: plateFile })
    console.log("wrote", plateFile)

    // The masthead it sits in, so the picture is judged in its place.
    const masthead = page.locator('[data-section="masthead"]').first()
    const mastheadFile = path.join(out, `masthead-${width}-${mode}.png`)
    await masthead.screenshot({ path: mastheadFile })
    console.log("wrote", mastheadFile)

    // The top of the page as a visitor lands on it.
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)
    const pageFile = path.join(out, `for-institutions-${width}-${mode}.png`)
    await page.screenshot({ path: pageFile })
    console.log("wrote", pageFile)

    await ctx.close()
  }
}

await browser.close()
