// The home hero picture, before and after (bead gwth-launch-88z.32.12).
// David, 2026-09-13: "the image could be better for a home page as it just
// looks like a kind of standard image that you get in a lesson rather than a
// special image that goes on the home page." Only the picture and its caption
// changed, so the evidence has to show the picture on its own AND the hero it
// sits in, in both modes and at phone width (the Bible allows one landscape
// composition for both sizes only if the reduced lettering is still readable,
// and that is checked per image).
//   node deploy/shot-home-hero.mjs <before|after> [base-url]
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import path from "node:path"

const stage = process.argv[2] ?? "after"
const base = process.argv[3] ?? "https://hlab.taila51191.ts.net:9458"
const out = "/home/david/projects/GWTH-launch-plan/walkthrough/shots/home-hero"
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ args: ["--ignore-certificate-errors"] })

for (const mode of ["light", "dark"]) {
  for (const width of [1440, 390]) {
    const ctx = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      deviceScaleFactor: 1,
      colorScheme: mode,
      ignoreHTTPSErrors: true,
    })
    const page = await ctx.newPage()
    await page.goto(base + "/", { waitUntil: "networkidle", timeout: 90000 })
    // The mode is a class the theme provider sets, not a media query, so the
    // colorScheme context option alone does not switch the page.
    await page.evaluate((m) => {
      document.documentElement.classList.toggle("dark", m === "dark")
    }, mode)
    await page.waitForTimeout(600)

    // The header is sticky, so capture from the top or the nav floats into
    // the middle of the shot.
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(400)

    const hero = page.locator('[data-section="hero"]').first()
    const heroFile = path.join(out, `${stage}-hero-${width}-${mode}.png`)
    await hero.screenshot({ path: heroFile })
    console.log("wrote", heroFile)

    const plate = page.locator('[data-section="hero"] figure img:visible').first()
    await plate.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    const plateFile = path.join(out, `${stage}-plate-${width}-${mode}.png`)
    await plate.screenshot({ path: plateFile })
    console.log("wrote", plateFile)

    const figure = page.locator('[data-section="hero"] figure').first()
    const figFile = path.join(out, `${stage}-figure-${width}-${mode}.png`)
    await figure.screenshot({ path: figFile })
    console.log("wrote", figFile)

    await ctx.close()
  }
}

await browser.close()
