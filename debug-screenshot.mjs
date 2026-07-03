/**
 * One-off survey script: full-page light + dark screenshots of public
 * marketing pages for the editorial-port triage
 * (kanban/1_planning/HANDOFF_2026-05-08_marketing-pages-editorial-port.md).
 *
 * Usage: node scripts/survey-marketing-pages.mjs [outDir] [pagesCsv]
 *   outDir   default kanban/design-artefacts/2026-05-08/marketing-pages-survey/before
 *   pagesCsv default all six, e.g. "labs,lessons" to re-shoot a subset
 */
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { resolve } from "node:path"

const BASE = "http://localhost:3000"
const OUT = resolve(process.argv[2] ?? "kanban/design-artefacts/2026-05-08/marketing-pages-survey/before")

const ALL_PAGES = [
  { n: "01", slug: "pricing", path: "/pricing" },
  { n: "02", slug: "for-teams", path: "/for-teams" },
  { n: "03", slug: "labs", path: "/labs" },
  { n: "04", slug: "lessons", path: "/lessons" },
  { n: "05", slug: "about", path: "/about" },
  { n: "06", slug: "news", path: "/news" },
]
const filter = process.argv[3]?.split(",").map((s) => s.trim())
const PAGES = filter ? ALL_PAGES.filter((p) => filter.includes(p.slug)) : ALL_PAGES

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
await context.addCookies([
  { name: "site_access", value: "granted", domain: "localhost", path: "/" },
])
const page = await context.newPage()

for (const { n, slug, path } of PAGES) {
  for (const theme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: theme })
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60000 })
    // next-themes: force the class + storage so theme is deterministic
    await page.evaluate((t) => {
      localStorage.setItem("theme", t)
      document.documentElement.classList.toggle("dark", t === "dark")
      document.documentElement.style.colorScheme = t
    }, theme)
    await page.waitForTimeout(800) // settle fonts/animations
    const file = `${OUT}/${n}-${slug}-${theme}.png`
    await page.screenshot({ path: file, fullPage: true })
    console.log(`captured ${file}`)
  }
}

await browser.close()
console.log("survey complete")
