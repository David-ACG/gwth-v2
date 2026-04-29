import { chromium } from "@playwright/test"
const STAGING_URL = "http://192.168.178.50:3001"
const browser = await chromium.launch()
try {
  for (const theme of ["light", "dark"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: theme,
      reducedMotion: "reduce",
    })
    await context.addCookies([{ name: "site_access", value: "granted", domain: "192.168.178.50", path: "/" }])
    const page = await context.newPage()
    await page.addInitScript((t) => {
      try { localStorage.setItem("theme", t) } catch {}
    }, theme)
    await page.goto(STAGING_URL, { waitUntil: "domcontentloaded" })
    await page.waitForLoadState("networkidle").catch(() => {})
    await page.waitForTimeout(1500)
    const journey = page.locator('[data-section="journey"]')
    await journey.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    const out = `C:/Projects/GWTH_V2/.snagging/2026-04-28-1140/after/journey-section-${theme}.png`
    await journey.screenshot({ path: out })
    console.log(`captured ${out}`)
    await context.close()
  }
} finally {
  await browser.close()
}
