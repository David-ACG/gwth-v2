// Screenshot the syllabus page and its /redesign/syllabus-* design variations
// on the LOCAL dev server, in both themes, at desktop and mobile widths, and
// dump each one's rendered text so a variation can be proved text-identical to
// the live page (design-only change, W27 syllabus readability review).
//
//   DEMO_EMAIL=... DEMO_PASSWORD=... node deploy/shot-syllabus-variations.mjs <outDir> [baseUrl]
//
// Credentials come from env so nothing lands in the repo.
import { chromium } from "playwright"
import { mkdir, writeFile } from "node:fs/promises"

const OUT = process.argv[2] ?? "completion/W27-syllabus-variations/shots"
const BASE = process.argv[3] ?? "http://localhost:3000"
const EMAIL = process.env.DEMO_EMAIL
const PASSWORD = process.env.DEMO_PASSWORD

if (!EMAIL || !PASSWORD) {
  throw new Error("set DEMO_EMAIL and DEMO_PASSWORD")
}

/**
 * [name, path]. "live" is the real page with its dashboard chrome; option 0
 * is the same design in the sandbox frame, so all four options are shot under
 * identical conditions.
 */
const TARGETS = [
  ["live", "/course/applied-ai-skills"],
  ["v-0", "/redesign/syllabus-0"],
  ["v-a", "/redesign/syllabus-a"],
  ["v-b", "/redesign/syllabus-b"],
  ["v-c", "/redesign/syllabus-c"],
]

const WIDTHS = [
  ["1440", 1440, 1000],
  ["390", 390, 844],
]

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })

const res = await context.request.post(`${BASE}/api/auth/sign-in/email`, {
  headers: { "Content-Type": "application/json" },
  data: { email: EMAIL, password: PASSWORD },
})
if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`)

const texts = {}

for (const [name, path] of TARGETS) {
  for (const [wLabel, width, height] of WIDTHS) {
    for (const theme of ["light", "dark"]) {
      const page = await context.newPage()
      await page.setViewportSize({ width, height })
      await page.addInitScript(
        (t) => window.localStorage.setItem("theme", t),
        theme
      )
      await page.goto(`${BASE}${path}`, {
        waitUntil: "networkidle",
        timeout: 120000,
      })
      if (page.url().includes("/login")) {
        throw new Error(`${path} bounced to /login`)
      }
      await page.waitForTimeout(1800)
      // The sandbox switcher is review chrome, not part of the design.
      await page.addStyleTag({
        content: `[data-syllabus-switcher]{display:none !important}
          div:has(> button[title="Dev: Switch subscription state"]){display:none !important}
          nextjs-portal{display:none !important}`,
      })
      await page.screenshot({
        path: `${OUT}/${name}-${wLabel}-${theme}.png`,
        fullPage: true,
      })
      if (wLabel === "1440" && theme === "light") {
        // Normalised visible text of the syllabus body only, for the
        // no-text-changed diff. The dashboard chrome (sidebar, header) is
        // excluded because the redesign sandbox does not mount it.
        texts[name] = await page.evaluate(() => {
          const root =
            document.querySelector('[data-section="course-detail"]') ??
            document.body
          return (root.innerText || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .join("\n")
        })
      }
      console.log(`${name} ${wLabel} ${theme}: ${page.url()}`)
      await page.close()
    }
  }
}

for (const [name, text] of Object.entries(texts)) {
  await writeFile(`${OUT}/../text-${name}.txt`, `${text}\n`, "utf8")
}

await browser.close()
console.log(`wrote shots to ${OUT}`)
