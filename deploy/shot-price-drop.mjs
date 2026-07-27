/**
 * Shoot the places the £7.50 price drop now appears, ON THE LIVE SITE.
 *
 * David asked to approve each spot from a screenshot rather than by hunting
 * the page himself, so each shot is a tight crop around the element plus one
 * full page for context. Runs against https://gwth.ai by default; pass a base
 * URL to point it at the hlab preview instead.
 *
 *   node deploy/shot-price-drop.mjs [baseUrl] [outDir]
 */
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const BASE = process.argv[2] ?? "https://gwth.ai"
const OUT =
  process.argv[3] ??
  "/home/david/projects/GWTH-launch-plan/completion/demo-walkthrough/price-drop"

/** One crop: where to look, what to call it. */
const SHOTS = [
  {
    path: "/pricing",
    name: "01-pricing-masthead",
    selector: '[data-section="masthead"]',
    why: "The headline price line and the metadata row, above the fold.",
  },
  {
    path: "/pricing",
    name: "02-pricing-cards",
    selector: '[data-section="tiers"]',
    why: "The red-circled spot: under £29 on the Member card, and on Teams.",
  },
  {
    path: "/pricing",
    name: "03-pricing-compare",
    selector: '[data-section="compare"]',
    why: "The Stay Current row now states the number instead of hiding it.",
  },
  {
    path: "/pricing",
    name: "04-pricing-closing",
    selector: '[data-section="closing"]',
    why: "Closing band.",
  },
  {
    path: "/",
    name: "05-home-hero",
    selector: '[data-section="hero"]',
    why: "The hero byline, the first metadata line on the site.",
  },
  {
    path: "/",
    name: "06-home-pricing-band",
    selector: '[data-section="pricing"]',
    why: "The £7.50 tile, with what it is FOR spelled out.",
  },
  {
    path: "/for-teams",
    name: "07-for-teams-masthead",
    selector: '[data-section="masthead"]',
    why: "Replaces a bare 'No lock-in' claim with the number that proves it.",
  },
]

const FULL = [
  { path: "/pricing", name: "00-pricing-full" },
  { path: "/", name: "00-home-full" },
]

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
})

await mkdir(OUT, { recursive: true })
const done = []

for (const shot of FULL) {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: "load", timeout: 60000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: true })
  done.push(shot.name)
}

for (const shot of SHOTS) {
  await page.goto(`${BASE}${shot.path}`, { waitUntil: "load", timeout: 60000 })
  const el = page.locator(shot.selector).first()
  if ((await el.count()) === 0) {
    console.error(`MISSING ${shot.name}: ${shot.selector} on ${shot.path}`)
    continue
  }
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await el.screenshot({ path: `${OUT}/${shot.name}.png` })
  done.push(shot.name)
  console.log(`${shot.name}  ${shot.path}  ${shot.why}`)
}

await browser.close()
console.log(`\n${done.length} shots -> ${OUT}`)
