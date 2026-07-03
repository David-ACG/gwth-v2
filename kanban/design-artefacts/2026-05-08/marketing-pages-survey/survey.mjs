/**
 * Marketing-pages survey: full-page light + dark screenshots of the six
 * public marketing pages, into before/ (or a folder given as argv[2]).
 * Usage: node survey.mjs [baseUrl] [outDir] [onlySlug]
 */
import { chromium } from "playwright"
import path from "node:path"
import { fileURLToPath } from "node:url"

const BASE = process.argv[2] || "http://localhost:3000"
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = process.argv[3] ? path.resolve(process.argv[3]) : path.join(__dirname, "before")
const ONLY = process.argv[4] || null

const PAGES = [
  { n: "01", slug: "pricing", route: "/pricing" },
  { n: "02", slug: "for-teams", route: "/for-teams" },
  { n: "03", slug: "labs", route: "/labs" },
  { n: "04", slug: "lessons", route: "/lessons" },
  { n: "05", slug: "about", route: "/about" },
  { n: "06", slug: "news", route: "/news" },
]

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
await context.addCookies([
  { name: "site_access", value: "granted", domain: "localhost", path: "/" },
])
const page = await context.newPage()

for (const { n, slug, route } of PAGES) {
  if (ONLY && !ONLY.split(",").includes(slug)) continue
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 })
  // light (persist via next-themes storage so hydration can't revert it)
  await page.evaluate(() => {
    localStorage.setItem("theme", "light")
    document.documentElement.classList.remove("dark")
  })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT, `${n}-${slug}-light.png`), fullPage: true })
  // dark
  await page.evaluate(() => {
    localStorage.setItem("theme", "dark")
    document.documentElement.classList.add("dark")
  })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT, `${n}-${slug}-dark.png`), fullPage: true })
  console.log(`done ${route}`)
}

await browser.close()
