// gwth-launch-4fg: prove the header Search button opens the palette on the
// hlab preview, and shoot the before/after a learner actually sees.
import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const OUT = process.argv[2]
const BASE = process.argv[3] ?? "https://hlab.taila51191.ts.net:9458"
const EMAIL = process.env.DEMO_EMAIL
const PASSWORD = process.env.DEMO_PASSWORD

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme,
    ignoreHTTPSErrors: true,
  })
  // next-themes is class-based and reads localStorage, so colorScheme alone
  // renders the light skin whatever Playwright claims the OS preference is.
  await ctx.addInitScript((mode) => {
    try {
      window.localStorage.setItem("theme", mode)
    } catch {}
  }, theme)
  const page = await ctx.newPage()

  const res = await page.request.post(`${BASE}/api/auth/sign-in/email`, {
    headers: { "Content-Type": "application/json" },
    data: { email: EMAIL, password: PASSWORD },
  })
  if (!res.ok()) throw new Error(`sign-in failed: ${res.status()} ${await res.text()}`)

  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle", timeout: 120000 })
  await page.waitForTimeout(1500)
  if (page.url().includes("/login")) throw new Error("bounced to /login")
  await page.screenshot({ path: `${OUT}/01-header-${theme}.png` })

  // the click David made
  await page.getByRole("button", { name: /search\s*⌘k/i }).click()
  const input = page.getByPlaceholder(/Search lessons, labs, pages/i)
  await input.waitFor({ state: "visible", timeout: 5000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/02-palette-open-${theme}.png` })

  // typing filters
  await input.fill("spread")
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/03-typing-${theme}.png` })

  await input.fill("lesson")
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/04-lessons-${theme}.png` })

  // the empty state a learner meets when nothing matches
  await input.fill("kangaroo")
  await page.waitForTimeout(800)
  await page.screenshot({ path: `${OUT}/07-nothing-matches-${theme}.png` })
  await input.fill("")
  await page.waitForTimeout(400)

  if (theme === "light") {
    // a real hit navigates
    await input.fill("")
    await page.waitForTimeout(500)
    const options = page.getByRole("option")
    const count = await options.count()
    console.log(`options listed: ${count}`)
    const first = options.filter({ hasNotText: /Dashboard|Progress|Bookmarks|Settings|Profile/ }).first()
    const label = (await first.textContent())?.trim()
    await first.click()
    await page.waitForTimeout(3000)
    console.log(`clicked "${label}" -> ${page.url()}`)
    await page.screenshot({ path: `${OUT}/05-navigated-light.png` })
  }

  // mobile trigger
  const mob = await ctx.newPage()
  await mob.setViewportSize({ width: 390, height: 844 })
  await mob.goto(`${BASE}/dashboard`, { waitUntil: "networkidle", timeout: 120000 })
  await mob.waitForTimeout(1500)
  await mob.getByRole("button", { name: "Search", exact: true }).click()
  await mob.getByPlaceholder(/Search lessons, labs, pages/i).waitFor({ state: "visible", timeout: 5000 })
  await mob.waitForTimeout(600)
  await mob.screenshot({ path: `${OUT}/06-mobile-${theme}.png` })

  await ctx.close()
  console.log(`${theme}: ok`)
}

await browser.close()
