// N12 packet screenshots: home and /for-institutions in both modes at 1280
// and 390, plus one bridged page (/for-teams) and the nav selected state.
// Lives in GWTH_V2 so node resolves playwright from its node_modules:
//   node deploy/shot-n12.mjs <base-url>
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import path from "node:path"

const base = process.argv[2] ?? "https://hlab.taila51191.ts.net:9458"
const out = "/home/david/projects/GWTH-launch-plan/completion/N12"
mkdirSync(out, { recursive: true })

const shots = [
  { name: "home", url: "/", full: true },
  { name: "institutions", url: "/for-institutions", full: true },
  { name: "for-teams-bridged", url: "/for-teams", full: false },
  { name: "lessons-bridged", url: "/lessons", full: false },
]

const browser = await chromium.launch({ args: ["--ignore-certificate-errors"] })
for (const mode of ["light", "dark"]) {
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      deviceScaleFactor: 1,
      colorScheme: mode,
      ignoreHTTPSErrors: true,
    })
    const page = await ctx.newPage()
    for (const shot of shots) {
      await page.goto(base + shot.url, { waitUntil: "networkidle" })
      // The site theme toggle stores a preference; force the class to match.
      await page.evaluate((m) => {
        document.documentElement.classList.toggle("dark", m === "dark")
      }, mode)
      await page.waitForTimeout(400)
      const file = path.join(out, `${shot.name}-${mode}-${width}.png`)
      await page.screenshot({ path: file, fullPage: shot.full })
      console.log("wrote", file)
    }
    // Nav selected state, desktop only: hover-free capture of the header.
    if (width === 1280) {
      await page.goto(base + "/for-institutions", { waitUntil: "networkidle" })
      await page.evaluate((m) => {
        document.documentElement.classList.toggle("dark", m === "dark")
      }, mode)
      await page.waitForTimeout(300)
      const header = page.locator('[data-section="nav"]')
      await header.screenshot({ path: path.join(out, `nav-selected-${mode}.png`) })
      // Horizontal overflow check for the packet.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      )
      console.log(`${mode}/${width} horizontal overflow: ${overflow}`)
    }
    if (width === 390) {
      for (const url of ["/", "/for-institutions"]) {
        await page.goto(base + url, { waitUntil: "networkidle" })
        await page.evaluate((m) => {
          document.documentElement.classList.toggle("dark", m === "dark")
        }, mode)
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth
        )
        console.log(`${mode}/390 ${url} horizontal overflow: ${overflow}`)
      }
      // The X6 key at phone width: two rows of three, never collapsed.
      await page.goto(base + "/", { waitUntil: "networkidle" })
      await page.evaluate((m) => {
        document.documentElement.classList.toggle("dark", m === "dark")
      }, mode)
      await page.waitForTimeout(300)
      const tops = await page
        .getByTestId("six-blocks-key")
        .locator("span")
        .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)))
      console.log(`${mode}/390 key rows: ${new Set(tops).size} (want 2)`)
      await page.locator("#six-building-blocks").screenshot({
        path: path.join(out, `key-${mode}-390.png`),
      })
    }
    await ctx.close()
  }
}
await browser.close()
