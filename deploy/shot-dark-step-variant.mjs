// The bolder dark step, rendered on the real page rather than described
// (bead gwth-launch-88z.32.15). The shipped step is the largest one the
// current measured token set allows; this variant also lifts the metadata
// ink and the boundary, which is what buys the extra light. Nothing is
// written to the site: the tokens are injected into the live preview.
//   node deploy/shot-dark-step-variant.mjs [base-url]
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import path from "node:path"

const base = process.argv[2] ?? "https://hlab.taila51191.ts.net:9458"
const out = "/home/david/projects/GWTH-launch-plan/walkthrough/shots/dark-form-boxes"
mkdirSync(out, { recursive: true })

// Measured: card 1.51:1 above the ground, field well 1.19:1 above the card,
// metadata 4.69:1 on the card, boundary 3.09:1 on the worst of the three.
const BOLDER = `
.dark {
  --v-surface: #303d37 !important;
  --v-quiet: #3b4842 !important;
  --v-muted: #a2a8a3 !important;
  --v-line: #8a958f !important;
  --v-line-soft: #48544e !important;
}
`

const pages = [
  { name: "contact", url: "/contact", widths: [1440, 390] },
  { name: "login", url: "/login", widths: [1440] },
  { name: "dashboard-anon", url: "/pricing", widths: [1440] },
]

const browser = await chromium.launch({ args: ["--ignore-certificate-errors"] })
for (const p of pages) {
  for (const width of p.widths) {
    const ctx = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      deviceScaleFactor: 1,
      colorScheme: "dark",
      ignoreHTTPSErrors: true,
    })
    const page = await ctx.newPage()
    await page.goto(base + p.url, { waitUntil: "networkidle", timeout: 90000 })
    await page.evaluate(() => document.documentElement.classList.add("dark"))
    await page.addStyleTag({ content: BOLDER })
    await page.waitForTimeout(500)
    const file = path.join(out, `${p.name}-${width}-dark-bolder.png`)
    await page.screenshot({ path: file })
    console.log("wrote", file)
    await ctx.close()
  }
}
await browser.close()
