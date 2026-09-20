// The three field wells the first dark-step pass missed
// (bead gwth-launch-88z.32.15): the Report a problem panel, the tech radar
// filters, and the Cmd+K palette's selected row. Each one is a box that was
// darker than the panel around it, which is the thing David commented on.
//   node deploy/shot-dark-missed-fields.mjs [base-url]
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import path from "node:path"

const base = process.argv[2] ?? "https://hlab.taila51191.ts.net:9458"
const out = "/home/david/projects/GWTH-launch-plan/walkthrough/shots/dark-form-boxes"
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({ args: ["--ignore-certificate-errors"] })

async function darkContext() {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "dark",
    ignoreHTTPSErrors: true,
  })
  return ctx
}

async function forceDark(page) {
  await page.evaluate(() => document.documentElement.classList.add("dark"))
  await page.waitForTimeout(400)
}

// 1. Tech radar: the search box and the category filter, public.
{
  const ctx = await darkContext()
  const page = await ctx.newPage()
  await page.goto(base + "/tech-radar", { waitUntil: "networkidle", timeout: 90000 })
  await forceDark(page)
  const file = path.join(out, "tech-radar-1440-dark.png")
  await page.screenshot({ path: file })
  console.log("wrote", file)
  await ctx.close()
}

// 2 and 3 are behind the login: the same tester account the other shooters use.
const ctx = await darkContext()
const page = await ctx.newPage()
const r = await page.request.post(`${base}/api/auth/sign-in/email`, {
  headers: { "Content-Type": "application/json" },
  data: { email: "local-check@example.com", password: "Rafiki123" },
})
if (!r.ok()) {
  console.log("SKIP authed shots: sign-in returned " + r.status())
} else {
  await page.goto(base + "/dashboard", { waitUntil: "load", timeout: 90000 })
  await page.waitForTimeout(2000)
  await forceDark(page)

  // Report a problem: the launcher opens a dialog whose select and textarea
  // were filled with the page ground.
  await page.getByRole("button", { name: "Report a problem" }).first().click()
  await page.waitForTimeout(900)
  let file = path.join(out, "report-problem-1440-dark.png")
  await page.screenshot({ path: file })
  console.log("wrote", file)
  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)

  // Cmd+K palette: the selected row was the page ground inside the card.
  await page.keyboard.press("Control+k")
  await page.waitForTimeout(700)
  await page.keyboard.type("less")
  await page.waitForTimeout(700)
  file = path.join(out, "search-palette-1440-dark.png")
  await page.screenshot({ path: file })
  console.log("wrote", file)
}
await ctx.close()

await browser.close()
console.log("done")
